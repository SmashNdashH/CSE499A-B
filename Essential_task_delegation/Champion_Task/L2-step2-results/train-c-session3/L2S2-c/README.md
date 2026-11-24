# L2 step 2 (with step 2b's fix): the 3B, option (c)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 256, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (c): L2 step 1's data plus L2 step 1c's options examples, label loss only.

- Steps: 85 of 211 (not complete: run the notebook again to continue)
- Examples: 53,838 (full run: 53,838, {'train': 53032, 'options': 806}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 14332, 'Road Damage Counting': 7227, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1852}
- The new 7B's answers used: 1,079
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.9 GB
- Losses: [1.784, 1.812, 1.782, 1.676, 1.661, 1.529, 1.501, 1.482, 1.372, 1.338, 1.256, 1.264, 1.15, 1.129, 1.062, 0.99, 1.06, 1.015, 0.894, 0.991, 0.916, 0.834, 0.875, 0.882, 0.818, 0.797, 0.7, 0.819, 0.755, 0.755, 0.83, 0.79, 0.772, 0.818, 0.698, 0.684, 0.722, 0.657, 0.697, 0.7, 0.701, 0.677, 0.679, 0.745, 0.729, 0.742, 0.653, 0.687, 0.682, 0.685, 0.7, 0.759, 0.639, 0.709, 0.612, 0.749, 0.618, 0.667, 0.629, 0.641, 0.676, 0.669, 0.662, 0.677, 0.61, 0.68, 0.67, 0.688, 0.623, 0.703, 0.63, 0.634, 0.607, 0.666, 0.6, 0.625, 0.577, 0.571, 0.638, 0.625, 0.622, 0.676, 0.604, 0.623, 0.684]
- Last step: 3.76 s per example on both GPUs; projected for all 53,838 examples: 56.2 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final`.