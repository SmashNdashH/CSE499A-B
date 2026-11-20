# L2 step 2 (with step 2b's fix): the 3B, option (c)

`Qwen/Qwen2.5-VL-3B-Instruct` held in 4-bit, a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 256, one epoch), images at most 768 x 28 x 28 pixels, the 501 held-out after-photos left out. (c): L2 step 1's data plus L2 step 1c's options examples, label loss only.

- Steps: 5 of 211 (not complete: run the notebook again to continue)
- Examples: 53,838 (full run: 53,838, {'train': 53032, 'options': 806}); by task {'Disaster Bearing Bodies Recognition': 7381, 'Building Damage Counting': 14332, 'Road Damage Counting': 7227, 'disaster caption': 7381, 'Disaster Type Recognition': 1543, 'disaster restoration advice': 7380, 'Disaster Scene Recognition': 6742, 'relational reasoning': 1852}
- The new 7B's answers used: 1,079
- Longest example: 1,852 tokens; peak GPU memory, process 0: 5.9 GB
- Losses: [1.784, 1.812, 1.782, 1.676, 1.661]
- Last step: 3.38 s per example on both GPUs; projected for all 53,838 examples: 50.6 h
- Versions: {'torch': '2.11.0+cu130', 'transformers': '5.20.2', 'peft': '0.22.0', 'accelerate': '1.15.0'}

Checkpoints: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/checkpoints`. Finished adapter: `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final`.