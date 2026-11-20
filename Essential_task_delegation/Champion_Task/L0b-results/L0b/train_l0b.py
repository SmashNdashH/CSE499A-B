# ── Cell 4 (written to train_l0b.py): DDP training with LoRA on BOTH vision blocks and language layers ──
import os
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")
import json
import math
import time
from importlib.metadata import version
from pathlib import Path

import pandas as pd
import torch
from PIL import Image
from peft import LoraConfig, get_peft_model
from transformers import (AutoProcessor, BitsAndBytesConfig, Qwen2_5_VLForConditionalGeneration, Trainer,
                          TrainingArguments)

WORK = Path("/kaggle/working/L0b")
CFG = json.loads((WORK / "config.json").read_text(encoding="utf-8"))
RANK, WORLD = int(os.environ.get("LOCAL_RANK", "0")), int(os.environ.get("WORLD_SIZE", "1"))
MAIN = RANK == 0
torch.cuda.set_device(RANK)

def log(msg):
    if MAIN:
        print(msg, flush=True)

df = pd.read_csv(CFG["train_csv"])
examples = [{"crop_path": r.crop_path, "prompt": CFG["class_prompt"], "answer": r.true_class}
            for r in df.itertuples()]
log(f"✓ Training data: {len(examples)} balanced building crops ({df['true_class'].value_counts().to_dict()})")

model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
    CFG["start_model"], dtype=torch.float16, device_map={"": RANK}, attn_implementation="sdpa",
    quantization_config=BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                                           bnb_4bit_compute_dtype=torch.float16, bnb_4bit_use_double_quant=True))

# Select LoRA target modules on BOTH language layers AND vision blocks
LLM_PROJ = ("q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj")
VIS_PROJ = ("gate_proj", "up_proj", "down_proj", "qkv", "proj") if CFG["include_vision_attn"] else ("gate_proj", "up_proj", "down_proj")
modules = dict(model.named_modules())
llm_targets = [n for n, m in modules.items() if "visual" not in n and n.rsplit(".", 1)[-1] in LLM_PROJ and hasattr(m, "in_features")]
vis_targets = [n for n, m in modules.items() if "visual.blocks." in n and n.rsplit(".", 1)[-1] in VIS_PROJ and hasattr(m, "in_features")]
assert len(llm_targets) == 28 * 7, f"Expected 196 LLM projections, found {len(llm_targets)}"
assert len(vis_targets) >= 32 * 3, f"Expected >= 96 vision projections, found {len(vis_targets)}"
targets = llm_targets + vis_targets

llm_params = sum(CFG["lora"]["r"] * (modules[n].in_features + modules[n].out_features) for n in llm_targets)
vis_params = sum(CFG["lora"]["r"] * (modules[n].in_features + modules[n].out_features) for n in vis_targets)
model.enable_input_require_grads()
model = get_peft_model(model, LoraConfig(r=CFG["lora"]["r"], lora_alpha=CFG["lora"]["alpha"],
                                         lora_dropout=CFG["lora"]["dropout"], target_modules=targets,
                                         bias="none", task_type="CAUSAL_LM"))

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
vis_lora = [n for n, p in model.named_parameters() if p.requires_grad and "visual" in n]
assert vis_lora and trainable == llm_params + vis_params, f"Mismatch: {trainable} vs {llm_params + vis_params}"
log(f"✓ Model loaded on {WORLD} GPUs: LoRA on {len(llm_targets)} language modules ({llm_params:,} params) "
    f"+ {len(vis_targets)} vision modules ({vis_params:,} params) = {trainable:,} trainable parameters")

processor = AutoProcessor.from_pretrained(CFG["start_model"])
tok = processor.tokenizer
MARKER = tok("<|im_start|>assistant\n", add_special_tokens=False)["input_ids"]
VISION_IDS = torch.tensor([tok.convert_tokens_to_ids(t) for t in ("<|image_pad|>", "<|vision_start|>", "<|vision_end|>")])

def mask_prompt(row):
    ids = row.tolist()
    for start in range(len(ids) - len(MARKER), -1, -1):
        if ids[start:start + len(MARKER)] == MARKER:
            row[:start + len(MARKER)] = -100
            return row
    raise ValueError("No assistant turn in sequence")

def collate(batch):
    texts, images = [], []
    for x in batch:
        img = Image.open(x["crop_path"]).convert("RGB")
        messages = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": x["prompt"]}]},
                    {"role": "assistant", "content": [{"type": "text", "text": x["answer"]}]}]
        texts.append(processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=False))
        images.append(img)
    out = processor(text=texts, images=images, padding=True, return_tensors="pt")
    labels = out["input_ids"].clone()
    labels[out["attention_mask"] == 0] = -100
    for row in labels:
        mask_prompt(row)
    assert not torch.isin(labels, VISION_IDS).any(), "Vision tokens in loss"
    keep = labels.shape[1] - int((labels != -100).int().argmax(1).min()) + 1
    out["labels"], out["logits_to_keep"] = labels[:, -keep:], keep
    return out

class StepOnCpu(Trainer):
    def get_batch_samples(self, epoch_iterator, *args, **kwargs):
        to_cpu = ({k: (v.to("cpu", torch.float16) if k == "pixel_values" else v.cpu()) if torch.is_tensor(v) else v
                   for k, v in b.items()} for b in epoch_iterator)
        return super().get_batch_samples(to_cpu, *args, **kwargs)

GLOBAL = WORLD * CFG["per_device_batch"] * CFG["grad_accum"]
steps = math.ceil(len(examples) / GLOBAL)
args = TrainingArguments(
    output_dir=str(WORK / "checkpoints"), num_train_epochs=1, per_device_train_batch_size=CFG["per_device_batch"],
    gradient_accumulation_steps=CFG["grad_accum"], learning_rate=CFG["lr"], adam_beta1=CFG["betas"][0],
    adam_beta2=CFG["betas"][1], weight_decay=CFG["weight_decay"], lr_scheduler_type="cosine",
    warmup_steps=max(1, math.ceil(CFG["warmup_ratio"] * steps)), max_grad_norm=1.0, fp16=True,
    gradient_checkpointing=True, gradient_checkpointing_kwargs={"use_reentrant": False},
    logging_steps=1, save_strategy="no", report_to="none", optim=CFG["optim"],
    dataloader_num_workers=2, remove_unused_columns=False, ddp_find_unused_parameters=False, seed=CFG["seed"])

t0 = time.time()
trainer = StepOnCpu(model=model, args=args, train_dataset=examples, data_collator=collate)
log(f"⏳ Training {len(examples)} crops in {steps} optimizer steps (global batch {GLOBAL})")
trainer.train()
train_min = (time.time() - t0) / 60
peak_gb = torch.cuda.max_memory_allocated() / 1e9
print(f"[GPU {RANK}] peak memory {peak_gb:.2f} GB", flush=True)

if MAIN:
    trainer.model.save_pretrained(CFG["adapter_dir"])
    summary = {
        "smoke_test": CFG["smoke_test"], "train_examples": len(examples),
        "llm_lora_modules": len(llm_targets), "llm_lora_params": llm_params,
        "vision_lora_modules": len(vis_targets), "vision_lora_params": vis_params,
        "total_trainable_params": trainable, "global_steps": trainer.state.global_step,
        "train_minutes": round(train_min, 2), "peak_gpu_gb_rank0": round(peak_gb, 2),
        "log_history": trainer.state.log_history,
        "versions": {p: version(p) for p in ("torch", "transformers", "peft", "bitsandbytes", "accelerate")},
    }
    (WORK / "train_summary.json").write_text(json.dumps(summary, indent=1), encoding="utf-8")
    log(f"✓ Saved trained vision+language adapter to {CFG['adapter_dir']} ({train_min:.1f} min, peak {peak_gb:.2f} GB)")
