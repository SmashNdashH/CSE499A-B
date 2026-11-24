# L2 step 2 (with step 2b's fix): the 3B, option (b)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 256, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (b): the label loss plus the match to the 7B's top-20 spread, 0.5 each, on the checkable entries.

- Steps: 89 of 208 (not complete: run the notebook again to continue)
- Examples: 53,032 (full run: 53,032, {'train': 53032}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 13849, 'Road Damage Counting': 6974, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1782}
- Soft labels: 38,271; soft-loss tokens this session 16,010, misaligned 0
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.9 GB
- Losses: [1.887, 1.788, 1.843, 1.742, 1.618, 1.534, 1.435, 1.405, 1.341, 1.333, 1.323, 1.308, 1.139, 1.057, 1.066, 1.047, 1.008, 1.015, 1.018, 0.897, 0.942, 0.919, 0.904, 0.908, 0.778, 0.823, 0.781, 0.822, 0.811, 0.798, 0.785, 0.772, 0.789, 0.789, 0.746, 0.705, 0.751, 0.742, 0.737, 0.716, 0.718, 0.749, 0.728, 0.674, 0.716, 0.775, 0.718, 0.715, 0.676, 0.741, 0.687, 0.664, 0.672, 0.695, 0.692, 0.686, 0.64, 0.703, 0.68, 0.639, 0.666, 0.66, 0.619, 0.688, 0.586, 0.642, 0.619, 0.65, 0.661, 0.632, 0.633, 0.611, 0.662, 0.611, 0.651, 0.646, 0.702, 0.625, 0.605, 0.623, 0.642, 0.642, 0.614, 0.645, 0.674, 0.638, 0.612, 0.568, 0.603]
- Last step: 3.55 s per example on both GPUs; projected for all 53,032 examples: 52.2 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/b/final`.