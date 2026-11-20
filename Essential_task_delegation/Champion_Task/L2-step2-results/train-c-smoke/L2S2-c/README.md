# L2 step 2 (with step 2b's fix): the 3B, option (c) (SMOKE TEST)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 8, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (c): L2 step 1's data plus L2 step 1c's options examples, label loss only.

- Steps: 2 of 2 (complete)
- Examples: 16 (full run: 53,838, {'train': 53032, 'options': 806}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 14332, 'Road Damage Counting': 7227, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1852}
- The new 7B's answers used: 1,079
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.71 GB
- Losses: [1.28, 1.471]
- Last step: 2.76 s per example on both GPUs; projected for all 53,838 examples: 41.3 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

How to read the smoke test:
- Loss: about 0.4-1.2 is the 7B's first training level on answer tokens. Above 3, the labels are misaligned.
- Peak memory under about 14 GB leaves room on a T4 (15 GB).
- Over 10.5 projected hours, the full run takes two or more sessions (it continues from Hugging Face).

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final`.