# L2 step 4: the winning 3B, option (c), on the benchmark (SMOKE TEST)

`Qwen/Qwen2.5-VL-3B-Instruct` with the adapter `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` merged in, on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels. Step 3's reason for the winner: primary accuracy 35.95% (b) against 45.12% (c), exact McNemar p = 0.0000.

## Accuracy (%)

| task   |   questions |   answered |   3B_c_% |   new_7B_full_% |   base_7B_paper_% |
|:-------|------------:|-----------:|---------:|----------------:|------------------:|
| DTR    |           5 |          5 |       20 |           76.77 |              66.6 |
| BBR    |           5 |          5 |       20 |           19.99 |               4.7 |
| BDC    |           5 |          5 |       20 |           30.31 |              34.2 |
| DRE    |           5 |          5 |       40 |           33.03 |              29.3 |
| DSR    |           5 |          5 |       20 |           40.46 |              28.3 |
| ORR    |           5 |          5 |       60 |           34.62 |              23.9 |

The new 7B's numbers are at full size (1036 px); the 3B reads its training size. The base 7B's are the DisasterM3 paper's (Table 2).

## Building counting, beside accuracy

- Accuracy 20.0%.
- Median count error 17.2% (the chosen option's value against the true count), on the 100.0% answered with one option.
- The rule that never sees the image: 80.0%. Accuracy on these options can't show that a model counts well.

## Files

- `results.csv`, `per_question.csv`, `answers.jsonl` (every answer), `config.json`
