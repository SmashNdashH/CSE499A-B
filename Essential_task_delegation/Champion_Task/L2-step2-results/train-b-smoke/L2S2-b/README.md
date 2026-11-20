# L2 step 2 (with step 2b's fix): the 3B, option (b) (SMOKE TEST)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 8, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (b): the label loss plus the match to the 7B's top-20 spread, 0.5 each, on the checkable entries.

- Steps: 2 of 2 (complete)
- Examples: 16 (full run: 53,032, {'train': 53032}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 13849, 'Road Damage Counting': 6974, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1782}
- Soft labels: 38,271; soft-loss tokens this session 73, misaligned 0
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.78 GB
- Losses: [2.041, 1.9]
- Last step: 3.31 s per example on both GPUs; projected for all 53,032 examples: 48.8 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

How to read the smoke test:
- Loss: about 0.4-1.2 is the 7B's first training level on answer tokens. Above 3, the labels are misaligned.
- Peak memory under about 14 GB leaves room on a T4 (15 GB).
- Over 10.5 projected hours, the full run takes two or more sessions (it continues from Hugging Face).

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/final`.