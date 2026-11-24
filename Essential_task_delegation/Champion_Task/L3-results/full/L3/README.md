# L3: the winning 3B, option (c), in 4 bits

`Qwen/Qwen2.5-VL-3B-Instruct` with the adapter `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` merged in, then loaded in 4 bits (bitsandbytes NF4), on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels, in batches of 8.

## Memory and speed on one T4, one question at a time

| model                     |   questions |   weights_gpu_gb |   footprint_gb |   peak_gpu_gb |   s_per_question_mean |   s_per_question_median |   tokens_per_s |   disk_gb |
|:--------------------------|------------:|-----------------:|---------------:|--------------:|----------------------:|------------------------:|---------------:|----------:|
| new 7B, 4 bits, full size |          60 |             5.91 |           5.78 |          8.64 |                 4.825 |                   5.715 |           0.59 |    nan    |
| 3B (c), fp16              |          60 |             7.53 |           7.52 |          8.13 |                 1.62  |                   1.859 |           2.12 |      7.51 |
| 3B (c), 4 bits            |          60 |             2.42 |           2.35 |          3.03 |                 1.719 |                   1.913 |           2.04 |      2.4  |

Timed on 60 questions (10 per task). `weights_gpu_gb` is the GPU memory after loading, `peak_gpu_gb` the most while answering, `tokens_per_s` the generated tokens (the end token counted) over the time per question, which is mostly reading the images. The 7B reads the images at full size, as L0 step 2 asked it.

Same answers on the timed questions: {'3B fp16 vs 4 bits, one at a time': 0.683, '3B 4 bits, one at a time vs in batches of 8': 0.983}.

## Accuracy in 4 bits (%)

| task   |   questions |   answered |   3B_c_4bit_% |   new_7B_full_% |   base_7B_paper_% |   mean_confidence |
|:-------|------------:|-----------:|--------------:|----------------:|------------------:|------------------:|
| DTR    |         353 |        353 |         63.17 |           76.77 |              66.6 |             0.908 |
| BBR    |        2006 |       2006 |         16.55 |           19.99 |               4.7 |             0.81  |
| BDC    |        3583 |       3583 |         48.17 |           30.31 |              34.2 |             0.824 |
| DRE    |        1868 |       1868 |         48.72 |           33.03 |              29.3 |             0.779 |
| DSR    |        2007 |       2007 |         34.63 |           40.46 |              28.3 |             0.848 |
| ORR    |         858 |        858 |         55.71 |           34.62 |              23.9 |             0.705 |

The new 7B's numbers are at full size (L0 step 2); the base 7B's are the DisasterM3 paper's (Table 2). The 3B in fp16 is L2 run 5 (`l2-step4-winner-benchmark`).

## Building counting, beside accuracy

- Accuracy 48.17%; median count error 7.7%, on the 99.9% answered with one option.
- The rule that never sees the image: 66.98%.

## Confidence

Each answer's token scores are in `answers.jsonl`; `per_question.csv` has its confidence at temperature 1 (the geometric mean of its token probabilities). 100.00% of answers had every chosen token at the top score. Calibration and the hand-off to the 7B: `l3-handoff-calibration.ipynb` on the PC.

## The overflow fix (23 Nov)

`visual.blocks.31.mlp.down_proj` runs in fp32 and the 3B's vision part under fp16 autocast, as in training (L2 step 2b). Overflowed answers: 0; answers with a score that isn't a number: 0 (the first full run, without the fix: 220).

## Files

- `results.csv`, `per_question.csv`, `speed.csv`, `speed.json`, `answers.jsonl`, `config.json`
