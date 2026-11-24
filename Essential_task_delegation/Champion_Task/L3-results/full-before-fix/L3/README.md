# L3: the winning 3B, option (c), in 4 bits

`Qwen/Qwen2.5-VL-3B-Instruct` with the adapter `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` merged in, then loaded in 4 bits (bitsandbytes NF4), on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels, in batches of 8.

## Memory and speed on one T4, one question at a time

| model                     |   questions |   weights_gpu_gb |   footprint_gb |   peak_gpu_gb |   s_per_question_mean |   s_per_question_median |   tokens_per_s |   disk_gb |
|:--------------------------|------------:|-----------------:|---------------:|--------------:|----------------------:|------------------------:|---------------:|----------:|
| new 7B, 4 bits, full size |          60 |             5.91 |           5.78 |          8.64 |                 5.19  |                   6.17  |           0.55 |    nan    |
| 3B (c), fp16              |          60 |             7.52 |           7.51 |          8.1  |                 1.73  |                   1.958 |           1.98 |      7.51 |
| 3B (c), 4 bits            |          60 |             2.42 |           2.35 |          3.01 |                 1.828 |                   2.007 |           1.92 |      2.4  |

Timed on 60 questions (10 per task). `weights_gpu_gb` is the GPU memory after loading, `peak_gpu_gb` the most while answering, `tokens_per_s` the generated tokens (the end token counted) over the time per question, which is mostly reading the images. The 7B reads the images at full size, as L0 step 2 asked it.

Same answers on the timed questions: {'3B fp16 vs 4 bits, one at a time': 0.683, '3B 4 bits, one at a time vs in batches of 8': 0.983}.

## Accuracy in 4 bits (%)

| task   |   questions |   answered |   3B_c_4bit_% |   new_7B_full_% |   base_7B_paper_% |   mean_confidence |
|:-------|------------:|-----------:|--------------:|----------------:|------------------:|------------------:|
| DTR    |         353 |        353 |         60.06 |           76.77 |              66.6 |             0.908 |
| BBR    |        2006 |       2006 |         16.15 |           19.99 |               4.7 |             0.811 |
| BDC    |        3583 |       3583 |         47.2  |           30.31 |              34.2 |             0.826 |
| DRE    |        1868 |       1868 |         47.86 |           33.03 |              29.3 |             0.782 |
| DSR    |        2007 |       2007 |         34.43 |           40.46 |              28.3 |             0.848 |
| ORR    |         858 |        858 |         55.83 |           34.62 |              23.9 |             0.706 |

The new 7B's numbers are at full size (L0 step 2); the base 7B's are the DisasterM3 paper's (Table 2). The 3B in fp16 is L2 run 5 (`l2-step4-winner-benchmark`).

## Building counting, beside accuracy

- Accuracy 47.2%; median count error 7.7%, on the 97.2% answered with one option.
- The rule that never sees the image: 66.98%.

## Confidence

Each answer's token scores are in `answers.jsonl`; `per_question.csv` has its confidence at temperature 1 (the geometric mean of its token probabilities). 100.00% of answers had every chosen token at the top score. Calibration and the hand-off to the 7B: `l3-handoff-calibration.ipynb` on the PC.

## Files

- `results.csv`, `per_question.csv`, `speed.csv`, `speed.json`, `answers.jsonl`, `config.json`
