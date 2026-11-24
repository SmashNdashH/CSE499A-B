# L2 step 4: the winning 3B, option (c), on the benchmark

`Qwen/Qwen2.5-VL-3B-Instruct` with the adapter `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` merged in, on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels. Step 3's reason for the winner: primary accuracy 35.95% (b) against 45.12% (c), exact McNemar p = 0.0000.

## Accuracy (%)

| task   |   questions |   answered |   3B_c_% |   new_7B_full_% |   base_7B_paper_% |
|:-------|------------:|-----------:|---------:|----------------:|------------------:|
| DTR    |         353 |        353 |    58.92 |           76.77 |              66.6 |
| BBR    |        2006 |       2006 |    16.1  |           19.99 |               4.7 |
| BDC    |        3583 |       3583 |    48.2  |           30.31 |              34.2 |
| DRE    |        1868 |       1868 |    44.7  |           33.03 |              29.3 |
| DSR    |        2007 |       2007 |    35.23 |           40.46 |              28.3 |
| ORR    |         858 |        858 |    51.63 |           34.62 |              23.9 |

The new 7B's numbers are at full size (1036 px); the 3B reads its training size. The base 7B's are the DisasterM3 paper's (Table 2).

## Building counting, beside accuracy

- Accuracy 48.2%.
- Median count error 0.0% (the chosen option's value against the true count), on the 96.3% answered with one option.
- The rule that never sees the image: 66.98%. Accuracy on these options can't show that a model counts well.

## Files

- `results.csv`, `per_question.csv`, `answers.jsonl` (every answer), `config.json`
