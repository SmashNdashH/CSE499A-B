# L3: the winning 3B, option (c), in 4 bits (SMOKE TEST)

`Qwen/Qwen2.5-VL-3B-Instruct` with the adapter `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` merged in, then loaded in 4 bits (bitsandbytes NF4), on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels, in batches of 8.

## Memory and speed on one T4, one question at a time

| model                     |   questions |   weights_gpu_gb |   footprint_gb |   peak_gpu_gb |   s_per_question_mean |   s_per_question_median |   tokens_per_s |   disk_gb |
|:--------------------------|------------:|-----------------:|---------------:|--------------:|----------------------:|------------------------:|---------------:|----------:|
| new 7B, 4 bits, full size |          12 |             5.91 |           5.78 |          8.63 |                 5.254 |                   6.158 |           0.54 |    nan    |
| 3B (c), fp16              |          12 |             7.53 |           7.52 |          8.13 |                 1.912 |                   2.158 |           1.74 |      7.51 |
| 3B (c), 4 bits            |          12 |             2.42 |           2.35 |          3.03 |                 2.093 |                   2.371 |           1.67 |      2.4  |

Timed on 12 questions (2 per task). `weights_gpu_gb` is the GPU memory after loading, `peak_gpu_gb` the most while answering, `tokens_per_s` the generated tokens (the end token counted) over the time per question, which is mostly reading the images. The 7B reads the images at full size, as L0 step 2 asked it.

Same answers on the timed questions: {'3B fp16 vs 4 bits, one at a time': 0.833, '3B 4 bits, one at a time vs in batches of 8': 1.0}.

## Accuracy in 4 bits (%)

| task   |   questions |   answered |   3B_c_4bit_% |   new_7B_full_% |   base_7B_paper_% |   mean_confidence |
|:-------|------------:|-----------:|--------------:|----------------:|------------------:|------------------:|
| DTR    |           7 |          7 |         28.57 |           76.77 |              66.6 |             0.859 |
| BBR    |           7 |          7 |         28.57 |           19.99 |               4.7 |             0.793 |
| BDC    |           7 |          7 |         14.29 |           30.31 |              34.2 |             0.716 |
| DRE    |           7 |          7 |         42.86 |           33.03 |              29.3 |             0.754 |
| DSR    |           7 |          7 |         28.57 |           40.46 |              28.3 |             0.824 |
| ORR    |           7 |          7 |         28.57 |           34.62 |              23.9 |             0.521 |

The new 7B's numbers are at full size (L0 step 2); the base 7B's are the DisasterM3 paper's (Table 2). The 3B in fp16 is L2 run 5 (`l2-step4-winner-benchmark`).

## Building counting, beside accuracy

- Accuracy 14.29%; median count error 18.5%, on the 100.0% answered with one option.
- The rule that never sees the image: 85.71%.

## Confidence

Each answer's token scores are in `answers.jsonl`; `per_question.csv` has its confidence at temperature 1 (the geometric mean of its token probabilities). 100.00% of answers had every chosen token at the top score. Calibration and the hand-off to the 7B: `l3-handoff-calibration.ipynb` on the PC.

## The overflow fix (23 Nov)

`visual.blocks.31.mlp.down_proj` runs in fp32 and the 3B's vision part under fp16 autocast, as in training (L2 step 2b). Overflowed answers: 0; answers with a score that isn't a number: 0 (the first full run, without the fix: 220).

## Files

- `results.csv`, `per_question.csv`, `speed.csv`, `speed.json`, `answers.jsonl`, `config.json`
