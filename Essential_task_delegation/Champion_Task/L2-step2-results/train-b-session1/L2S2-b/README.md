# L2 step 2 (with step 2b's fix): the 3B, option (b)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 256, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (b): the label loss plus the match to the 7B's top-20 spread, 0.5 each, on the checkable entries.

- Steps: 4 of 208 (not complete: run the notebook again to continue)
- Examples: 53,032 (full run: 53,032, {'train': 53032}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 13849, 'Road Damage Counting': 6974, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1782}
- Soft labels: 38,271; soft-loss tokens this session 6,764, misaligned 0
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.87 GB
- Losses: [1.887, 1.788, 1.843, 1.742]
- Last step: 3.5 s per example on both GPUs; projected for all 53,032 examples: 51.5 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/final`.