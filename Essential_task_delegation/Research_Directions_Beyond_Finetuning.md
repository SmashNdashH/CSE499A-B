# Beyond Fine-Tuning: Research Directions, Related Work and the SAM 3 Plan

**Context:** A record of the October 2026 discussion on what to do once segmentation fine-tuning stopped producing gains. It covers five structural options, current top-venue work in our domain, an assessment of six candidate techniques (RAG, agents, diffusion, PNNs, LLMs, edge devices), the xView2 winners, an explainer on foundation models and SAM, a SAM 3-based design with a test plan, and how that design compares with GeoPixel and BDAChat. Use it for the 499B report's related-work and future-work sections, and for viva questions.

**Last updated:** 18 October 2026 (final fine-tuning results in §1 and §9; BDAChat repo details in §8). Venues and figures were checked against the papers, project pages or official repositories (links in [Sources](#11-sources)). Items marked *preprint* are not yet peer-reviewed; check them before citing. Our own numbers come from the D4 champion notebooks in `Champion_Task/`.

> **Status, 26 Oct:**
> - Since this was written, lever 1 (before + after input, R11) and find-then-grade with SAM 3 (§7, R16c) passed the gate on all 645 validation images.
> - E5 then found leaked validation pairs, Without the 40 leaked pairs, R16c steps 2 and 3 score 0.2838–0.2980, so their claim doesn't hold on clean data. Only R16c step 5's SAM 3-only map passes there (0.3161 and 0.3051), narrowly (26 Oct); with a third grader seed (0.2982), on the three-seed mean only (0.3065, 28 Oct).
> - **19 Nov:** the damage map is C4, a mix of both levers: R11 (lever 1) on xBD photos, SAM 3 + grader (§7) on the sharper photos. It scores 0.3501 on the clean validation pairs and 0.4296 once on the unseen test pairs. On the test photos, its table and hot spots exist (E7 step 3), and counting from its map reaches 35.34%, above S4's 34.2% bar on accuracy, with the option flaw stated beside it.
> - **19 Nov, L0b:** training the 7B's vision encoder (LoRA on its vision blocks) on 1,800 building crops lifts it from 100 to 176 of Part B's 300 buildings. That's still clearly below the 45 MB grader's 212, so the grader keeps the grading.
> - The current status is in [Progress_Tracker.md](Progress_Tracker.md).

**Related docs:** [Segmentation_Model_Explained.md](Segmentation_Model_Explained.md) (how our U-Net and dataset work) · [segmentation_improvement_guide.md](Archive/segmentation_improvement_guide.md) (Tiers 1–6; archived) · [team_task_assignments.md](Archive/team_task_assignments.md) (Phase Gate, Task D5; archived) · [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md) (verified sprint numbers and errata).

## Contents
1. [Why look beyond fine-tuning](#1-why-look-beyond-fine-tuning)
2. [Five structural levers](#2-five-structural-levers)
3. [Related work at top venues](#3-related-work-at-top-venues)
4. [The xView2 winners](#4-the-xview2-winners)
5. [Six candidate techniques, assessed](#5-six-candidate-techniques-assessed)
6. [Background: foundation models, SAM and pixel masks](#6-background-foundation-models-sam-and-pixel-masks)
7. [The SAM 3 plan](#7-the-sam-3-plan)
8. [Positioning: GeoPixel, BDAChat and our design](#8-positioning-geopixel-bdachat-and-our-design)
9. [Recommended order for the rest of 499B](#9-recommended-order-for-the-rest-of-499b)
10. [Corrections made during this review](#10-corrections-made-during-this-review)
11. [Sources](#11-sources)

---

## 1. Why look beyond fine-tuning

The D4 champion runs changed one setting at a time from the R1 recipe (U-Net + ResNet-50, Focal Tversky → Lovász, 768 crops, 40 epochs) and scored every run the same way: full validation images, last epoch.

| Run | Change from R1 | mIoU | Destroyed IoU |
|---|---|---|---|
| R1 | reference | 0.5374 | 0.2686 |
| R1b | same config and seed, run again (an accidental repeat, see §10) | 0.5427 | 0.2796 |
| R1s7 (called R6 until 20 Oct) | seed 7 | 0.5402 | 0.2815 |
| R2 | copy-paste | 0.5369 | 0.2681 |
| R3 | Focal Tversky 0.25 / 0.75 / 1.33 | 0.5402 | 0.2790 |
| R4 | U-Net++ decoder (batch 4 × 2) | 0.5267 | 0.2551 |
| R5 | weighted sampler | 0.5354 | **0.2898** |
| R8 | enhanced augmentation | 0.5342 | 0.2703 |
| R9 | sampler + copy-paste | 0.5373 | **0.2921** (0.3001 with TTA) |
| R10 | sampler + Focal Tversky 0.25 / 0.75 / 1.33 | 0.5345 | 0.2891 |
| R9s7 | R9 repeated with seed 7 | 0.5382 | 0.2847 (0.2941 with TTA) |

What this shows (final, 18 October 2026):
- **Every U-Net run lands between 0.534 and 0.543 mIoU, and U-Net++ (R4) is lower still at 0.527.** Two runs with the identical config and seed differ by 0.005, and Destroyed IoU varies by about 0.013 between identical recipes. All the mIoU differences are within noise.
- **The sampler is the only change that clearly helped Destroyed IoU,** alone (R5) or with copy-paste (R9, the best). It also raised Destroyed recall (about 0.48 to 0.50), but lowered Intact and Damaged IoU in exchange, so mIoU didn't move. Adding the R3 loss on top (R10) gave nothing extra.
- **No recipe passes the Phase Gate's Destroyed IoU > 0.30.** R9 reached 0.3001 with TTA on seed 42, but its seed-7 repeat scored 0.2941, so the two-seed mean (0.2971) misses by 0.003. No change passes the R7 rule either, so R7 is the R1 recipe. Fine-tuning closed on 18 October 2026.

**Conclusion:** more tuning of losses, sampling or augmentation is unlikely to help. Bigger gains need *structural* changes: what the model sees, how the problem is framed, what data it learns from, or what the project contributes.

---

## 2. Five structural levers

Ranked by expected gain for the effort.

| # | Lever | What changes | Why it should help | Cost |
|---|---|---|---|---|
| 1 | **Give the model the pre-disaster image too** | Our model sees only the post-disaster image. DisasterM3 includes a matching pre-disaster image (`*_pre_*.png`) for every training photo. | The model can compare each building before and after, instead of guessing whether rubble used to be a building. All five xView2 winners (§4), ChangeMamba's damage model and TEOChat use pre + post pairs. | **Low.** `smp.Unet(in_channels=6)` on the stacked pair is one model change, plus loading the pre image with the same crop and flips. A Siamese encoder is the stronger version. |
| 2 | **Find buildings, then grade each one** (the literature's "two-stage" model) | The finding segments building vs background. The grading classifies each building's damage from its pre/post crops. | Rare *pixels* become rare *objects*: the training set has 40,704 damaged and 16,682 destroyed building instances, compared with 0.33% of pixels. Counting comes out per building. This is how xView2's 1st and 2nd place solutions worked, and it's Tier 5 of our improvement guide. | **Medium.** A new pipeline, but each stage is simple. |
| 3 | **More data instead of more tuning** | Add xBD (already on this PC under `data/xView2 Challenge Dataset - train and test`) or BRIGHT, for pre-training or joint training. | More rare-class examples is the most reliable fix for imbalance. This is Phase 2, Task D5 in `team_task_assignments.md`. | **Medium.** **Check for overlap first:** DisasterM3 already contains xBD-style events (e.g. `woolsey_fire_…` in its Bench split), so adding xBD could leak validation or test images. |
| 4 | **Start from foundation models, train less** | Use SAM / SAM 2 / SAM 3 for building outlines, or AnyChange (zero-shot change detection), and train only a small damage head. | Fewer settings to tune, and we inherit models trained on far more data. | **Low to medium.** See §6–§7. |
| 5 | **Change the contribution, not the model** | Freeze R1 as the segmentation champion. Spend 499B on the system: hybrid counting, offline DisasTeller, 7B→3B distillation and an edge benchmark. | The title is *Resource-Efficient Neural Architectures…*; a measured, working offline system is the contribution. | **Low to medium**, and already in objectives O2–O4. |

The instance counts in lever 2 come from the copy-paste bank built from training images only, keeping instances of at least 100 pixels (`Champion_Task/combined-attempt (1).ipynb` output).

**Also:** report results with the **xView2 metric** (0.3 × building-localisation F1 + 0.7 × damage F1) alongside our mIoU, so our numbers can be compared with published work.

---

## 3. Related work at top venues

NeurIPS, ICLR, ICML, ICCV, CVPR and AAAI are top-tier (CORE A*) conferences. IEEE TPAMI and TGRS are leading journals, not conferences.

| Work | Venue | What it does | Relevance to us |
|---|---|---|---|
| **DisasterM3** | NeurIPS 2025 (Datasets & Benchmarks) | Our dataset: 26,988 bi-temporal images, 123k instruction pairs, 36 events, 9 tasks, optical + SAR | Our benchmark |
| **TEOChat** | ICLR 2025 | A VLM that reads *time series* of satellite images, trained on tasks including xBD damage assessment | Shows that giving a VLM pre + post images improves damage reasoning (lever 1) |
| **GeoPixel** | ICML 2025 | A remote-sensing multimodal model that answers with **pixel masks** attached to its text, at up to 4K resolution | The "answer with masks" experience we want, built as one large model (§8) |
| **GEOBench-VLM** | ICCV 2025 | Benchmark of VLMs on 31 geospatial sub-tasks. The best model (GPT-4o) gets only about 40% on multiple-choice questions. | Evidence that VLMs alone can't localise or count reliably, which justifies our hybrid design |
| **Segment Any Change (AnyChange)** | NeurIPS 2024 | Zero-shot change detection built on SAM, no training | Lever 4 |
| **DiffusionSat** | ICLR 2024 | Generative foundation model for satellite images: generation, super-resolution, inpainting | Diffusion for remote sensing (§5) |
| **ChangeDiff** | AAAI 2025 | Diffusion model that generates change-detection training pairs *and labels* from text prompts | Synthetic rare-class data |
| **Changen2** | IEEE TPAMI 2025 (journal) | Generative change foundation model; pre-trained versions transfer to disaster assessment; synthetic data released | Synthetic data and pre-training |
| **ChangeMamba** | IEEE TGRS 2024 (journal) | State-space (Mamba) change detection, including a building-damage model on xBD | A strong pre/post baseline |
| **Change-Agent** | IEEE TGRS 2024 (journal) | An LLM "brain" that calls a change-detection model as a tool for detection, captioning, counting and cause analysis | The agent pattern for our hybrid |
| **BDAChat framework** | Advanced Engineering Informatics, Vol. 71 Part B, 2026 (journal) | Modified SAM + per-building pre/post pairing + a fine-tuned temporal VLM (BDAChat) for interpretable object-level damage assessment; builds a new dataset (OLBDA) | **Our closest related work** (§8) |
| **BRIGHT** | ESSD 2025 (journal); IEEE GRSS Data Fusion Contest 2025 | Optical + SAR building-damage dataset, 14 regions, over 380,000 buildings | External data (lever 3) and all-weather use |

**Preprints to watch (not peer-reviewed):**
- **GeoDisaster** and **DisasterBench**: benchmarks for agent workflows in disaster response.
- **HASTE**: a rapid damage-assessment platform.
- **SegEarth-OV3** and **OmniOVCD**: SAM 3 applied to remote sensing (§7).

---

## 4. The xView2 winners

The xView2 challenge was run in 2019 by the US Defense Innovation Unit on the xBD dataset. Its scoring is 0.3 × localisation F1 + 0.7 × damage F1. The top five solutions are public in the [DIUx-xView GitHub organisation](https://github.com/DIUx-xView).

| Place | Winner | Pre/post handling | Stages | Models |
|---|---|---|---|---|
| **1st** | **Victor Durnov** | Building-finding models trained on **pre-disaster images only** (buildings are clearest before damage), then converted into **Siamese** damage classifiers that read pre and post with shared weights | **Two** | Ensemble of ResNet-34, SE-ResNeXt-50, SENet-154 and DPN-92 encoders. Dice + Focal loss (+ cross-entropy for damage), sampling that favours damaged images. |
| **2nd** | **Selim Seferbekov** | U-Net finds buildings; a **Siamese U-Net** with a shared encoder compares pre and post | **Two** | DPN-92 and DenseNet-161 encoders |
| **3rd** | **Eugene Khvedchenya** ("BloodAxe") | **Shared encoder** for pre and post; features joined and passed to one decoder | One | ResNet / DenseNet / EfficientNet encoders with U-Net and FPN decoders; weighted cross-entropy, heavy augmentation, pseudo-labelling. Private test score 0.805. |
| **4th** | **Zhuo Zheng** ("Z-Zheng") | Building localisation and damage end to end, with a "guided ResNeXt Siamese" network | One | ResNeXt Siamese. The same GitHub account later published AnyChange and Changen2. |
| **5th** | **SI Analytics** (team) | **Dual-HRNet**: one HRNet branch for pre, one for post, features merged at every stage | One | HRNet |

**Lessons for us:**
- **All five used both pre and post images**, so lever 1 matters more than anything else.
- **Two stages was the choice of the top two, not all five.**
- **1st place found buildings on the pre-disaster image.** Our model finds buildings on the post image, where destroyed buildings no longer look like buildings. That's part of why Destroyed is so hard for us.

---

## 5. Six candidate techniques, assessed

"PNN" has two common meanings, so both are covered.

| Technique | What it would do in our project | Related work | Verdict |
|---|---|---|---|
| **RAG** | DisasTeller already retrieves from EMS-98. Two upgrades: **(a) knowledge RAG**, retrieving damage scales, building codes and rescue protocols so reports cite sources instead of inventing them; **(b) visual RAG**, selecting only the relevant high-resolution patches for the VLM, which works around its 512-token image cap. | ImageRAG (IEEE GRSM 2025) | **Do it.** No training, cheap, and it targets the VLM's spatial blindness. It won't raise segmentation IoU. |
| **Agentic workflow** | Make the hybrid explicit: a local LLM plans and calls tools (segmenter, counter, collage builder, EMS-98 retriever, heatmap). This is objective O3, an offline DisasTeller. | Change-Agent (TGRS 2024); SAM 3 Agent; 2026 agent benchmarks | **Do it, as the integration layer.** Keep the tools deterministic, because agents add latency and new ways to fail. Evaluate on DisasterM3's tasks. |
| **Stable diffusion** | (1) synthetic damaged buildings for rare classes; (2) super-resolution, following on from our VRT study; (3) inpainting. | ChangeDiff (AAAI 2025), Changen2 (TPAMI 2025), DiffusionSat (ICLR 2024), Neural Disaster Simulation (Remote Sensing of Environment 2025) | **Future work.** Ordinary Stable Diffusion is trained on web photos, not satellite images. Synthetic labels can be wrong, it's compute-heavy, and R2 showed that simply adding instances (copy-paste) didn't help. Cheapest test: pre-train on the released Changen2 synthetic data. |
| **PNN: Progressive Neural Networks** | Add a new network "column" per new disaster type without forgetting old ones (continual learning) | Rusu et al., 2016 | **Skip.** The model grows with every disaster type, which works against the edge goal. Joint training or per-event fine-tuning is simpler. |
| **PNN: Physics-Informed Neural Networks** | Build physics equations (e.g. how flood water spreads) into the network to simulate floods or tsunamis. Could someday feed a survivability heatmap. | Raissi et al., 2019; physics-informed graph networks for flood forecasting (CACAIE 2025) | **Out of scope.** They predict how a hazard spreads; they don't segment damage from images. |
| **LLMs** | We already use Qwen2.5-VL. Best roles: report writing, reasoning and tool orchestration. Pixel-grounded models (GeoPixel; LISA, CVPR 2024) output masks directly but are 7B+ and heavy for a T4. | TEOChat, GeoPixel, GEOBench-VLM | **Keep the LLM for language and planning**; specialist models handle pixels and counts. Feeding it pre + post images (as TEOChat does) is worth a test. |
| **Edge devices** | The core of our title. Convert the U-Net (~33M parameters, 130 MB) to INT8 with ONNX/TensorRT (~33 MB); try lighter backbones (ResNet-34, SegFormer-B0/B2); quantise the 3B student to 4-bit (~2–3 GB). Measure **latency, memory and accuracy drop** on a laptop CPU or a Jetson. | Grace (preprint, 2025): a 2B VLM on a satellite with a 7B model on the ground; QLoRA (NeurIPS 2023); AWQ (MLSys 2024); EfficientSAM3 | **Highest priority.** Achievable, clearly measurable, and the most defensible contribution for a "resource-efficient" project. |

---

## 6. Background: foundation models, SAM and pixel masks

### 6.1 What a foundation model is
A **foundation model** is a very large model trained once, by a big lab, on huge and varied data. Everyone else then reuses it instead of training from scratch. We already use the idea twice:
- **U-Net encoder:** ResNet-50 pretrained on ImageNet (1.2M photos), fine-tuned on DisasterM3.
- **VLM:** Qwen2.5-VL-7B, fine-tuned with QLoRA (small adapter layers only).

"Start from foundation models, **train less**" means keeping the big model **frozen** and training nothing, or only a **small head**. That leaves far fewer settings to tune.

### 6.2 SAM, SAM 2 and SAM 3 (Meta AI)

| | SAM | SAM 2 | SAM 3 |
|---|---|---|---|
| Published | ICCV 2023 | ICLR 2025 | November 2025 (arXiv 2511.16719) |
| How you prompt it | Click, box or rough mask | Same, plus video | Same, **plus text** ("building") or example boxes |
| Output | Outline of the thing you pointed at, or every object (automatic mode) | Same, carried across video frames by a memory | **Every** instance matching the concept, in one pass |
| Size | Largest about 636M parameters | 38.9M (Tiny) / 46M (Small) / 80.8M (Base+) / 224.4M (Large) | About 848M (vision ~450M, text ~300M, detector and tracker ~100M) |
| Notes | Trained on SA-1B: about 11M images, 1.1B masks | More accurate than SAM on images and about 6× faster | Includes "SAM 3 Agent" (an LLM that breaks complex questions into simple prompts) |

How SAM-family models work:

```
Image ──► Image encoder (big, run once per image) ──┐
                                                     ├──► Mask decoder (small, fast) ──► outline(s)
Prompt (click / box / mask / text) ──► Prompt encoder┘
```

**What SAM does not do:** SAM 1 and 2 have no idea what classes are. They cut out "a thing" but can't say whether it's a building, or whether it's intact or destroyed. SAM 3 can find "buildings" by text, but whether it can grade *damage* is unproven (§7.1).

For our 33M-parameter U-Net, SAM 2 Tiny is a comparable size. The original SAM and SAM 3 are about 20–25× larger.

### 6.3 What a "pixel mask" is, and how ours differ from GeoPixel's
A **pixel mask** is an image-sized map marking which pixels belong to something. White means "belongs", black means "doesn't". What differs is who produces it, when, and why.

| | Our U-Net's mask | GeoPixel-style masks |
|---|---|---|
| What it is | **One** map with 4 values (0/1/2/3), every pixel labelled | **Several** black-and-white masks, one per thing mentioned |
| Classes | Fixed: background, intact, damaged, destroyed | Whatever the conversation is about ("the flooded road near the river") |
| Trigger | Every image, automatically | A user's question |
| Output | Mask only | **A text answer with masks attached to its phrases** |
| Separate objects | No: all destroyed pixels share one value | Usually yes: each building mentioned gets its own mask |
| Model | Small U-Net (~33M parameters) | Large multimodal model (7B+) |

**Our dataset already uses GeoPixel's format.** DisasterM3's segmentation task is "Referring Expression Segmentation": text prompt in, black-and-white mask out. For example, *"Classify and segment the undamaged buildings."* → `masks/train_building_intact_mask/bata_explosion_0.png`. Our notebook stacks the three per-class answers into one 4-class map so a plain U-Net can learn all classes at once.

---

## 7. The SAM 3 plan

SAM 3 connects four earlier ideas: the pre-disaster image, the find-then-grade pipeline (the literature's "two-stage" model), foundation models and the agent layer. It also shrinks the "too many variables" problem, because SAM 3 stays frozen.

### 7.1 Practical facts

| Question | Answer | Implication |
|---|---|---|
| Size | ~848M parameters, ~3.4 GB of weights | About 25× our U-Net. A **server** model, not an edge model. |
| Speed and memory | ~30 ms per image on an H200. One source says it fits on 16 GB GPUs; another measured a 19.5 GB peak on an A10. | **A Kaggle T4 (16 GB) is unconfirmed.** Smoke-test first. The T4 lacks fast bf16, so run it in fp16. |
| Zero-shot buildings on satellite images | SegEarth-OV3 (*preprint*, 2026) ran SAM 3 with **no training** and reports building IoU of **64.3% on xBD**, 86.9% on WHU-Aerial and 72.4% on Inria. | Building-finding without training is realistic; trained xView2 solutions are still better at it. |
| Weak spots | Lower-resolution or blurry imagery (42% mIoU on GF-2 satellite data); trained mostly on sharp natural photos | Rubble on post-disaster images is exactly this kind of texture. |
| Complex questions | **SAM 3 Agent**: a multimodal LLM breaks complex questions into simple noun phrases, calls SAM 3, checks the masks and repeats. Zero-shot, it beats earlier methods on reasoning-segmentation benchmarks. | This is our agent layer. |
| Change detection | OmniOVCD (*preprint*, 2026): training-free change detection with SAM 3 on LEVIR-CD, WHU-CD, S2Looking and SECOND. **No damage-grading results.** | Zero-shot damage *grading* with SAM 3 is unproven. |
| Edge versions | **EfficientSAM3**: distilled students of ~89–95M parameters (~90% smaller), ONNX and CoreML export | A path to field devices |
| Access | Weights **gated on Hugging Face** under the SAM Licence; some academic requests have been rejected | **Request access early.** Fall back to EfficientSAM3 or SAM 2. |

### 7.2 Three-layer design

> **4 Nov 2026:** this is the design as first drawn. Tests have since changed the reasoning layer: counts come from fixed queries on a table, not from the model (H2b); the trained grader does the grading (Tamanna's Part B); and whether the writer needs vision at all is open (T2b). The current chain is in [roadmap §1b](Next_Steps_Roadmap.md). *11 Nov: which model finds and grades the buildings is open again after E7's test pairs, and the report writer is a fixed flow on our 7B, which passed its offline proof run.*

```
                    ┌──────────────── REASONING LAYER ("brain") ────────────────┐
 User question ───► │ Qwen2.5-VL (7B at base / 3B in field), SAM-3-Agent style  │
 "How many destroyed│ splits the question into simple prompts, calls tools,      │
  buildings within  │ computes counts and distances itself, writes the report   │
  100 m of the      │ + RAG: EMS-98 damage scale, rescue protocols (DisasTeller) │
  flood?"           └───────────┬──────────────────────────────┬────────────────┘
                                │ "building"                   │ "flood water"
                    ┌───────────▼──────── PERCEPTION LAYER ("eyes") ───────────────┐
 PRE image  ──────► │ Finding: SAM 3 "building" on the PRE image                     │
                    │          → list of every building (no training)                │
 PRE + POST crops ► │ Grading: small Siamese classifier per building                 │
                    │          → intact / damaged / destroyed (the only part trained)│
                    └───────────┬──────────────────────────────────────────────────┘
                                ▼
            per-building masks + labels → counts, maps, heatmaps, report
                    ┌────────────────── EFFICIENCY LAYER ──────────────────────────┐
                    │ Base station: full SAM 3 + 7B        Field: EfficientSAM3 or   │
                    │ (or SAM 3 as a teacher that           our U-Net + 3B 4-bit     │
                    │  pseudo-labels data for small models)                          │
                    └────────────────────────────────────────────────────────────────┘
```

### 7.3 How the earlier ideas fit in

| Earlier idea | Where it shows up |
|---|---|
| Lever 1: pre-disaster image | SAM 3 finds buildings on the **pre** image, where they're intact and sharp (xView2 1st place's idea). Destroyed buildings are found by footprint even though they're rubble in the post image. |
| Lever 2: find, then grade | SAM 3 does the finding, a small classifier the grading. Rare pixels become rare objects (40,704 damaged, 16,682 destroyed instances). |
| Lever 4: foundation models | SAM 3 is frozen and adds **zero** settings to tune; only one small classifier is trained. |
| Agentic workflow + RAG | The VLM is the SAM 3 Agent "brain". DisasterM3 contains these questions, e.g. "Segment intact buildings near the flooding (within 100m)", and building counting, where our VLM alone fell 10.62 points in 499A. |
| Edge devices | Two deployment tiers, matching Grace's satellite-and-ground split. SAM 3 can act as a teacher whose pseudo-labels train small field models. |
| 7B → 3B distillation | The field 3B learns short checked answers and, as a second skill, explanations on request. It doesn't reason before every answer, which would slow every field answer. Decided 19 October 2026: [Paper_Audit §5.3](Paper_Audit_and_Integration_Plan.md#53-decided-how-the-distilled-3b-learns-19-october-2026), roadmap tasks L2 and L2b. |

### 7.4 Test plan, cheapest steps first

| Step | What | Training? | Effort | Pass check |
|---|---|---|---|---|
| **E3**, part 1 | Request Hugging Face access. Smoke-test SAM 3 on a Kaggle T4: does a 1024×1024 image fit in memory, and how long does it take? | No | ½ day | Runs on a T4 (otherwise 2×T4 or EfficientSAM3) |
| **E3**, part 2 | Prompt "building" on the 645 validation images, **both pre and post**. Measure building IoU against the combined ground-truth masks and per-image building counts, and compare with R1's building-vs-background IoU. | No | 1 day | SAM 3 on the pre image ≥ R1 → it does R16's finding |
| **S2** | Zero-shot damage prompts on post images ("destroyed building", "collapsed building", "rubble"). Compare Destroyed IoU with R1's 0.27. | No | ½ day | Likely to fail; a clear negative result is still worth reporting |
| **R16** | The grading: train a Siamese ResNet-18 on pre+post crops of training buildings. On validation, classify the buildings SAM 3 found and score with our full-image protocol **and** the xView2 metric. | Small model only | 2–3 days | Destroyed IoU beats R1 by more than the noise bar (0.013) |
| **S4** | Connect the VLM as the agent. Evaluate on DisasterM3's counting and referring-segmentation questions against our 499A scores (34.2% base, 23.58% fine-tuned). | No | 2–3 days | Counting beats the 34.2% base model (objective O2). 7 Nov: a rule that reads only the answer options scores 66.98%, so add count error against the true masks (Task_Ledger §7). |
| **L4** | Edge tier: EfficientSAM3 vs SAM 3 accuracy and latency, or distil SAM 3's pseudo-labels into our U-Net. | Optional | 2 days | A measured trade-off table for the report |

E3 takes about two days and needs no training. It decides whether the whole direction is viable.

Step IDs match the task names in [Next_Steps_Roadmap.md](Next_Steps_Roadmap.md). S2 and S4 have no task ID yet: S2 is optional, and S4 is partly covered by tasks H1 and H2.

### 7.5 Risks
1. **Gated access** is denied.
2. **SAM 3 doesn't fit** or runs too slowly on a T4.
3. **Pre and post images aren't perfectly aligned.** xView2 1st place dilated masks to absorb shifts; we can crop with a margin.
4. **The remote-sensing SAM 3 results are 2026 preprints**, not peer-reviewed.

---

## 8. Positioning: GeoPixel, BDAChat and our design

### 8.1 Is a GeoPixel-style answer our goal?
Yes, as the *user experience*. The 499B goal in our review deck is *"a hybrid system that counts from pixels, reasons in language, and runs offline on free or small GPUs"*. Objective O3 asks for *"a report, damage map, counts and survivability heatmap."* What differs is the architecture: GeoPixel uses one large model, while we use cooperating specialist parts.

What our system's answer would look like:

```
User:    "Which buildings were destroyed?"

Pixels:  U-Net (or SAM 3 + damage classifier) → each building as its own mask + label
Counts:  computed from the masks, not guessed           → 3 destroyed, 1 damaged
Words:   VLM writes the answer using those facts + EMS-98 retrieval

Answer:  "3 buildings near the coast were destroyed (#4, #7, #12, red on the map)
          and the warehouse in the centre (#9, orange) is damaged.
          EMS-98 grade 5 for the destroyed ones: prioritise search and rescue there."
          └─ map overlay with each numbered building highlighted
```

What's still missing:
1. **Per-building masks.** The U-Net produces one 4-class map. We need each building separated, either by splitting the map into connected regions or with SAM 3.
2. **Linking words to masks.** Give each building an ID that the VLM refers to.
3. **Offline report generation.** DisasTeller still calls Gemini; objective O3 replaces it with our own model.

### 8.2 Three-way comparison

BDAChat details come from its abstract and its [official GitHub repo](https://github.com/WangYong921/BDAChat) (README and training scripts, checked 17 October 2026; a copy is in `others/lit review_research papers/BDAChat_repo/`). The full text is paywalled on ScienceDirect and NSU doesn't subscribe to the journal (checked 18 October 2026), so anything still marked *not stated* needs the PDF from the corresponding authors (Jiawei Cui and Changhai Zhai; DOI 10.1016/j.aei.2026.104320), ResearchGate, or an NSU interlibrary loan.

| | **GeoPixel-style** (ICML 2025) | **BDAChat framework** (Adv. Eng. Informatics 2026) | **Our SAM 3 design** |
|---|---|---|---|
| Overall shape | One big model does everything | Modular: modified SAM → pair each building's pre/post views → temporal VLM | Modular: SAM 3 → per-building classifier → VLM agent |
| Who finds buildings | The model itself | A **modified SAM**: SAM ViT-B + adapter + LinkNet decoder + Multi-LoRA, **fine-tuned** on building and road masks at 1024 px. No prompts; it works like a normal segmenter. | **SAM 3, text prompt "building", frozen**, on the pre image |
| Uses pre + post | No, single image | **Yes**, paired per building | **Yes**: pre to find, pre + post to grade |
| Who grades damage | Not damage-specific | **The VLM itself**, per building: Video-LLaVA-7B fine-tuned with LoRA (rank 128) in 8-bit. Each building's pre and post crops go in as a two-frame "video" (an idea taken from TEOChat). | **A small Siamese CNN**; the VLM doesn't grade |
| Explanations | Text with masks attached | **Its main strength**: causal reasoning on *why* a building is damaged, plus disaster recognition | VLM report + EMS-98 retrieval → grades and rescue advice |
| Counting | Estimated by the model | Possible from per-building output, but not a focus in the repo. Its map outputs are a fine-grained damage map and a damage-aware heatmap. | **Explicit goal**: counts from masks |
| Training needed | Fine-tune a large pixel-grounding model | Fine-tune the modified SAM (buildings and roads) **and** the 7B VLM on a new dataset | SAM 3 frozen; one small classifier; reuse our Qwen fine-tune |
| Data | Their own grounding dataset (GeoPixelD) | A new dataset they built from xBD (OLBDA): bi-temporal, multi-hazard, object-level, with xBD's four levels (no, minor, major, destroyed). The dataset and both models' weights are on Baidu Netdisk; the code is MIT-licensed. | DisasterM3 (NeurIPS 2025): 9 tasks, including counting and referring segmentation |
| Reported result | Not damage-specific | **Macro F1 0.763 on xBD** at object level, plus a test on an unseen event; case studies of the Lahaina wildfire and Hurricane Ian | To be measured (E3 and R16). The R16 grader can be scored with the same object-level xView2 metric for a direct comparison. |
| Hardware / offline | Heavy | Training uses DeepSpeed ZeRO-3 with CPU offload and batch 8 per GPU, so it's multi-GPU (GPU type *not stated*). Inference runs a 7B VLM on every building. Offline use isn't discussed. | **Designed for it**: T4, plus a field tier, offline |
| Complex questions | Partly | Per-building question answering: damage class, disaster type and a causal explanation. Scene-level questions (counts, "buildings near the flood") aren't shown. | **Yes**, via the SAM-3-Agent-style brain |

How it fits our principles (GeoPixel vs our SAM 3 design):

| Our principle | GeoPixel-style | Our SAM 3 design |
|---|---|---|
| Counts from pixels | ❌ estimated by the model | ✅ from per-building masks |
| Reasons in language | ✅ | ✅ our fine-tuned Qwen |
| Offline on free or small GPUs | ❌ 7B+ with 4K inputs | ⚠️ full SAM 3 is server-sized, but a field tier exists |
| Reuses our work | ❌ new large model | ✅ Qwen fine-tune, R1 U-Net, DisasTeller |
| Fewer variables to tune | ❌ more | ✅ SAM 3 frozen, one small classifier |
| Fits objectives O1–O4 | Partly (O2) | All four |

### 8.3 The key design difference from BDAChat: who grades the damage

| | BDAChat: the VLM grades | Ours: a small classifier grades |
|---|---|---|
| Strength | Grade and explanation come from one model, which makes it interpretable | Cheap, fast, easy to measure, works on small hardware |
| Weakness | Needs a large fine-tuned VLM for every building | Explanations come from the VLM afterwards, not from the grader |

We can borrow BDAChat's strength cheaply: after the classifier grades a building, ask the VLM to explain that crop ("roof collapsed, debris field"). This is optional and needs no training.

### 8.4 What we can and cannot claim
**We cannot claim** to be the first to combine SAM with a VLM for building damage. BDAChat already does object-level segmentation plus a temporal VLM. Cite it directly.

**Defensible contributions:**
1. **No training and no manual prompts to find buildings**: SAM 3 works from the text "building". BDAChat's modified SAM doesn't do this: per its official repo, it's fine-tuned (adapter + Multi-LoRA) on labelled building masks.
2. **Resource efficiency**: free T4, two-tier deployment, distilled 3B, quantisation. This is the title's core claim. BDAChat, by contrast, runs a 7B VLM on every building and trains it on multiple GPUs with DeepSpeed ZeRO-3.
3. **Reliable counting** from masks, measured on DisasterM3's counting task.
4. **Agent-style questions** combining several concepts (e.g. buildings near flooding).
5. **Offline, rescue-oriented output**: EMS-98-grounded reports instead of a cloud API.

**A number to compare against:** BDAChat reports macro F1 0.763 on xBD at object level. Score our R16 grader with the same object-level xView2 metric so the two can be compared directly; mIoU alone can't be compared with it.

**Draft related-work sentence:**
> *BDAChat (2026) showed that segmenting buildings and grading them with a fine-tuned temporal VLM yields interpretable object-level damage assessment. We pursue the same object-level formulation under a resource constraint: buildings are found zero-shot by a text-prompted foundation model (SAM 3), damage is graded by a lightweight bi-temporal classifier, and a distilled VLM is reserved for reasoning and reporting, enabling offline deployment on free or edge hardware.*

**Summary:**
- **GeoPixel** is the *experience* we want, built as one heavy model. Cite it for contrast.
- **BDAChat** is our *closest competitor* in design. Position against it carefully.
- **Our SAM 3 design** is BDAChat's object-level idea, rebuilt to be cheap, countable and offline.

### 8.5 Why we don't fine-tune SAM 3 directly on the damage classes (added 17 Nov)

The question: one model from the after-photo straight to damage classes would be simpler than SAM 3 plus a grader. Why not fine-tune SAM 3 to do it all?

1. **A destroyed building stops looking like a building in the after-photo.**
   - E1: 59.5% of the destroyed pixels R9 missed were called background ([E1 README](Champion_Task/E1-results/E1/README.md)).
   - SAM 3 on the after-photo covers only 9% of the destroyed-building area (System_Design_Notes §6).
   - On the before-photo it finds buildings well: building IoU 0.630 against R9's 0.591. With R9's pieces added, it covers 86% of destroyed footprints (E3, [Task_Ledger](Task_Ledger.md)).

   So the outline has to come from the before-photo.
2. **Damage is a change between two photos.** SAM 3's image encoder reads one picture. Two ways to give it both:
   - **Six input channels:** this replaces the first layer's pretrained weights, so the encoder would need retraining. SAM 3 has about 848M parameters (vision about 450M) and about 3.4 GB of weights (§6.2 and §7.1), far beyond a T4.
   - **Running the encoder twice (Siamese):** this doubles its memory.

   Our arithmetic, not a measurement: at 1008 px with 14 px patches, SAM 3's encoder reads 72 × 72 = 5,184 tokens per picture. Our 7B reads about 1,300 per full-size picture (L0 step 1), and its training already peaked at 14.2–14.5 GB of a T4's 16 (L0 step 2, with the vision encoder frozen and the model in 4-bit; Progress_Tracker).
3. **The weak part is grading, not outlining.** With perfect grades on SAM 3's outlines, destroyed IoU would reach:
   - 0.556 on validation (Task_Ledger);
   - 0.590 on the test pairs (E7 step 2);
   - 0.614 with R11's pieces added (R16c step 1).

   Our grader reaches 0.3065 on clean validation (mean of three seeds) and 0.3898 on the test pairs. Most of the loss is in grading the before and after crops.

**If it were ever tried, as an ablation** (not planned):
- keep SAM 3's encoder frozen, and save its embeddings of each before-photo and after-photo once;
- train only a small neck that compares the two, plus a decoder with four classes.

Two known costs:
- a pixel map of classes merges touching buildings back into blobs, which is what made counting from masks hard (H1);
- prompting SAM 3 three times ("intact building", "damaged building", "destroyed building") gives overlapping masks that need a rule to settle them.

### 8.6 How published systems split the work (added 17 Nov)

| System | Who finds the buildings | Who grades the damage | Who writes the text | How ours compares |
|---|---|---|---|---|
| xView2 winners (§4) | 1st (Durnov): models trained on before-photos only; 2nd (Seferbekov): a U-Net | Siamese networks that compare before and after with shared weights | Nobody (vision only) | The same split. SAM 3 finds the buildings with no training, and a ResNet-18 grades them. |
| BRIGHT (2025) | Two-stage models | Before-and-after models (ChangeMamba 67.63 mIoU against a one-step U-Net's 64.94) | Nobody | Supports finding first, then grading (Paper_Audit). |
| BDAChat (2026) | SAM ViT-B with an adapter, a LinkNet decoder and Multi-LoRA, fine-tuned on building and road masks | Video-LLaVA-7B (LoRA, 8-bit) on every building's crops: macro F1 0.763 | The same 7B | Trained with DeepSpeed ZeRO-3 and CPU offload on several GPUs. Our grader reached macro F1 0.778–0.784 on the true validation buildings (R16c step 2). It is a small network, not a 7B per building. |
| TEOChat (2025) | A specialist model: a VLM alone finds xBD buildings at F1 38.9, against 85.9 for a specialist | The VLM, given the boxes | The VLM | Matches our evidence: on 300 true buildings the fine-tuned 7B was right on 100 and our grader on 212 (Tamanna's Part B). |
| GeoPixel (2025) | One 7B VLM that draws masks from text | Not damage-specific, and one picture only | The same 7B | Trained for about 3 days on 2× A6000 48 GB GPUs (Paper_Audit). |
| DamageScope (2026) | Known footprints | A damage database | Cloud GPT-4o answers questions over it | The model for our building table and fixed queries, but offline and with a local model. |

### 8.7 Counts go through the table, not the language model (added 17 Nov)

In Aryan's counting study, rechecked (Task_Ledger §9, "Aryan · Counts in the prompt"):
- on 1,701 counting questions, taking the option nearest R11's own count scored 37.0%;
- giving the same count to the fine-tuned 7B in its prompt scored 27.0%. Only the table was right on 290 questions, only the 7B on 121 (p < 10⁻¹⁶).
- **The 7B picks the option nearest the count it was given only 56% of the time.** It changes or misreads the number 44% of the time.

So the chain turns the map into a building table, answers counts with fixed queries, and gives the report writer the numbers as text.

A caveat: on these questions, a rule that never looks at the image scores 66.98% (benchmark-option-rule-check.ipynb). Accuracy there can't show counting ability, so counts are also judged by their error against the true masks.

*(25 Nov, E7 step 3c: on the fair questions, whose largest option is 20 or less, the distilled 3B picks the right count more often than C4's map, 57.45% at normal precision (53.90% in 4 bits) against 42.2%, and C4 is no better than the blind rule. The reports still take their counts from the table, because they need counts per building, area and grade. Asked for a number with no options (L2 step 4d), the 3B does no better than the blind rule and is no closer to the truth than the map, so counts stay with the table.)*

### 8.8 Our supervisor's two suggestions: super-resolution and reinforcement learning (recorded 17 Nov)

**Super-resolution (SR): a sharper picture before a model reads it.**
- **Where it could help:** the grader's small crops.
  - In Tamanna's Part B, a building's longest side was 46 px at the median, and 7 of 30 were under 32 px, within a 256 px window (Task_Ledger).
  - Our grader enlarges each crop to 128 px by ordinary resizing (R16c steps 2 and 5).
  - Resolution differs by source: DisasterM3's copies of BRIGHT tiles (Turkey among them) are 0.30 m per pixel (Ridita's audit, Task_Ledger §9). xBD tiles are 1.25–2.82 m per pixel (a sample of 12 label files, T3_Website/NOTES.md). So small crops are mostly an xBD problem.
- **A clean test:** replace the resize with an SR model only for crops under 48 px, change nothing else, and score:
  - the grader's macro F1 on the true validation buildings;
  - find-then-grade's destroyed IoU on the 605 clean pairs.

  Noman's VRT super-resolution notebook is a starting point (`support/Noman_Super Resolution/Noman_VRT_SuperResolution_Pipeline.ipynb`; CSE499A's final presentation, slide 16).

  **Answered 20 Nov (R16c step 7, run on account 4; [results](Champion_Task/R16c-results/step7/README.md)): super-resolution makes the grader slightly but surely worse, so it isn't adopted.** On the 605 clean validation pairs:
  - destroyed IoU falls from 0.3066 to 0.3025 with Swin2SR and 0.3006 with Real-ESRGAN;
  - macro F1 on the true buildings falls from 0.732 to 0.715 and 0.701, most on the small buildings SR touches;
  - both drops are beyond noise.

  The graders learned from ordinary crops, and Real-ESRGAN's invented texture hurts most. A grader retrained on SR crops would need about 52 GPU hours of Swin2SR on the training photos first, which the drop doesn't justify. The test still gave us a clear answer, a dead end recorded so nobody repeats it, and a finding: 62% of the real buildings in xBD photos are under 48 px on their longest side, which is why grading them is hard. The full answer for the viva is in [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md).

  **Built 20 Nov as R16c step 7** ([notebook](Champion_Task/r16c-step7-super-resolved-crops.ipynb); [the ledger](Task_Ledger.md)), ready to run on account 4. It tests two single-photo models at 2×: Swin2SR, trained for pixel accuracy, and Real-ESRGAN, GAN-trained, so the invented-texture risk below is measured. VRT, a video model at 4×, didn't fit single crops that need at most 2×. The rule is step 6's: the better version must beat today's crops on destroyed IoU by more than noise.
- **Risk:** an SR model trained on ordinary photos invents texture. On rubble that can look like damage, or hide it.
- **A cheaper, related fix:** align the two crops before grading. In 52% of the pairs, the before-photo and after-photo are shifted by more than 2 px; in 10%, by more than 5 px; the worst by 56 px (Ridita's audit). Aligning is already a candidate in the roadmap.

**Reinforcement learning (RL): training a model on a reward for its whole answer.**
- **Where it is used in our reading:** GeoDisaster's tool-calling agents were trained with supervised fine-tuning, then reinforcement learning with GRPO (System_Design_Notes §3.5).
- **Where it fits us:** the text side, not segmentation.
  - Our 7B's tool-calling failures in T2 were solved without training, by the fixed flow.
  - What's left is report quality: contradictions, made-up numbers, citations.
  - T2's checks can serve as a reward that a program computes:
    - numbers that disagree with the building table, invented contact details or citations: penalised;
    - citations of passages the model was really shown: rewarded.
  - Such a reward could drive DPO or GRPO on the 7B or the 3B.
- **Cost:**
  - many generations per prompt, so heavy on a T4;
  - the reward must be checked against the reports' measured quality (Ridita's comparison) before it is trusted.
- **Status:** not planned. A candidate after T2b decides who writes the reports. H2b showed no model met the reliability bar for writing SQL, so a reward for SQL is a second candidate.

---

## 9. Recommended order for the rest of 499B
0. **Done (18 October): R9, R10 and R9's second seed.** R9 (sampler + copy-paste) is the best Destroyed recipe, but its two-seed mean is 0.2971 with TTA, so the gate is not claimed and fine-tuning is closed. Next is the E1 diagnosis (Phase2_Plan §3), which needs no training.
1. **SAM 3 test E3** (about 2 days, no training). It decides whether the SAM 3 direction is viable.
2. **A pre + post input run** for the U-Net (lever 1). It's one change, tested with the same noise-bar method as R1–R8.
3. **An edge benchmark**: INT8 U-Net and 4-bit 3B VLM, with latency, memory and accuracy. *Status (24 Nov): both measured. The 8-bit before-and-after U-Net (L1c, the R11 model) is 33.2 MB, takes 1.75 s per image on a CPU and loses 0.0014 Destroyed IoU. The 4-bit 3B (L3) peaks at 3.03 GB on one T4, takes 1.72 s per question and averages 44.49% on the six tasks, against 39.20% for our 7B. Still open: the 3B on a laptop with no GPU (L3 step 6). Details: Task_Ledger, L1c and L3.*
4. **RAG plus the agent layer**, to build the offline DisasTeller (O3).
5. **Find-then-grade object-level damage** (R16), if E3 passes.
6. **Diffusion-generated data and PNNs** as future work in the report.

---

## 10. Corrections made during this review
- **`segmentation_improvement_guide.md` (and `.html`), corrected 6 Oct 2026:**
  - The two-stage section credited the xView2 winners to "DeepDamageNet, 2024". The challenge ran in 2019 and DeepDamageNet is an unrelated 2024 preprint. It now names the real winners (§4).
  - The class mix inside buildings read "~58% intact", which didn't add up to 100%. It's ~81% intact, 14.5% damaged and 4.6% destroyed (5.86 / 1.05 / 0.33 out of the 7.24% of pixels that are buildings).
  - `Ablation_Study_Reference_and_QA_Prep.md` notes both fixes. Copies inside `.kilo/worktrees/` were not changed.
- **R4's first run never trained U-Net++.** Its notebook still had `EXPERIMENT = "R1"`, so it trained R1 again (R1b in §1). U-Net++ was then run properly on 6–7 October, resumed from an epoch-21 checkpoint over two sessions (about 20 GPU-hours): 0.5267 mIoU / 0.2551 Destroyed IoU, lower than every U-Net run.
- **FULLSTACK's Destroyed IoU of 0.3013 isn't comparable with D4.** It was scored on a 768 centre crop using the best epoch, while D4 scores full images using the last epoch. It does not pass the Phase Gate.
- **BDAChat's segmentation:** an earlier note called it "SAM with prompts"; the abstract only says a *modified SAM*.

---

## 11. Sources

**Our dataset and benchmarks**
- [DisasterM3 (arXiv 2505.21089, NeurIPS 2025)](https://arxiv.org/abs/2505.21089)
- [DisasterM3 on Hugging Face](https://huggingface.co/datasets/Kingdrone-Junjue/DisasterM3)
- [GEOBench-VLM (ICCV 2025)](https://openaccess.thecvf.com/content/ICCV2025/html/Danish_GEOBench-VLM_Benchmarking_Vision-Language_Models_for_Geospatial_Tasks_ICCV_2025_paper.html)
- [BRIGHT (ESSD 2025)](https://essd.copernicus.org/articles/17/6217/2025/)

**Vision-language and pixel-grounded models**
- [TEOChat (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/hash/ac3af725ae398b6184faae0828bdbd6c-Abstract-Conference.html)
- [GeoPixel (ICML 2025)](https://icml.cc/virtual/2025/poster/44111)
- [BDAChat / Integrating segmentation and VLM for building damage assessment (Adv. Eng. Informatics 2026)](https://www.sciencedirect.com/science/article/abs/pii/S1474034626000121)

**Change detection and damage models**
- [Segment Any Change / AnyChange (NeurIPS 2024)](https://neurips.cc/virtual/2024/poster/96101)
- [ChangeMamba (TGRS 2024)](https://github.com/ChenHongruixuan/ChangeMamba)
- [Change-Agent (TGRS 2024)](https://github.com/Chen-Yang-Liu/Change-Agent)
- [DeepDamageNet (2024 preprint, not an xView2 winner)](https://arxiv.org/pdf/2405.04800)
- [YOLO-E + SAM2 for earthquake-damaged buildings](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12299807/)

**xView2 winners**
- [DIUx-xView repositories](https://github.com/orgs/DIUx-xView/repositories)
- [1st place](https://github.com/DIUx-xView/xView2_first_place)
- [Victor Durnov on GitHub](https://github.com/vdurnov)
- [2nd place](https://github.com/DIUx-xView/xView2_second_place)
- [3rd place (BloodAxe)](https://github.com/BloodAxe/xView2-Solution)
- [3rd place write-up](https://computer-vision-talks.com/2020-01-xview2-solution-writeup/)
- [4th place (Z-Zheng)](https://github.com/Z-Zheng/xview2_4th_solution)
- [5th place (Dual-HRNet)](https://github.com/DIUx-xView/xView2_fifth_place)
- [xFBD paper, which summarises the winners' methods](https://arxiv.org/pdf/2212.13876)

**Generative models and synthetic data**
- [DiffusionSat (ICLR 2024)](https://arxiv.org/abs/2312.03606)
- [ChangeDiff (AAAI 2025)](https://mlanthology.org/aaai/2025/zang2025aaai-changediff/)
- [Changen2 (TPAMI)](https://arxiv.org/abs/2406.17998)
- [Changen2 synthetic data](https://huggingface.co/datasets/EVER-Z/Changen2-S1-15k)
- [Neural Disaster Simulation (RSE 2025)](https://www.sciencedirect.com/science/article/abs/pii/S0034425725003839)

**SAM family**
- [SAM 2 (ICLR 2025)](https://proceedings.iclr.cc/paper_files/paper/2025/file/45c1f6a8cbf2da59ebf2c802b4f742cd-Paper-Conference.pdf)
- [SAM 2 model sizes](https://docs.ultralytics.com/models/sam-2)
- [SAM 3 paper](https://arxiv.org/pdf/2511.16719)
- [SAM 3 code](https://github.com/facebookresearch/sam3)
- [SAM 3 technical overview](https://datature.io/blog/sam-3-a-technical-deep-dive-into-metas-next-generation-segmentation-model)
- [SAM 3 / 3.1 blog](https://ai.meta.com/blog/segment-anything-model-3/)
- [SAM 3 gated-access issues](https://github.com/facebookresearch/sam3/issues/624)
- [SegEarth-OV3 (preprint)](https://arxiv.org/html/2512.08730v2)
- [OmniOVCD (preprint)](https://arxiv.org/abs/2601.13895)
- [EfficientSAM3](https://github.com/SimonZeng7108/efficientsam3)
- [SAM 3 point prompts on geospatial data](https://samgeo.gishub.org/examples/sam3_point_prompts_batch/)

**RAG, agents and edge**
- [ImageRAG (IEEE GRSM)](https://arxiv.org/abs/2411.07688v3)
- [Grace: satellite–ground VLM collaboration (preprint)](https://arxiv.org/abs/2510.24242)
- [GeoDisaster (preprint)](https://arxiv.org/pdf/2606.17246)
- [DisasterBench (preprint)](https://arxiv.org/pdf/2606.06217)
- [HASTE (preprint)](https://arxiv.org/pdf/2607.11838)

**Physics-informed models**
- [Physics-informed GNN for flood forecasting (CACAIE 2025)](https://onlinelibrary.wiley.com/doi/full/10.1111/mice.13484)
