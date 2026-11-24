# L2 step 4: the winning 3B, option (c), and the runner-up (b), on the benchmark

`Qwen/Qwen2.5-VL-3B-Instruct` with each adapter (`AbrarAlam/disasterm3-qwen25vl3b-l2/<3B>/final`) merged in, on the benchmark's optical questions of the six tasks, with L0 step 2's prompts and scorer, greedy, images at most 602,112 pixels. Step 3's reason for the winner: primary accuracy 35.95% (b) against 45.12% (c), exact McNemar p = 0.0000. The runner-up was scored after the choice, so it couldn't change it.

**The overflow fix (23 Nov):** `visual.blocks.31.mlp.down_proj` runs in fp32 and the vision part under fp16 autocast, as in training. Overflowed answers: the winner 0, the runner-up 0 (the first full run, without the fix: 327 for (c)).

## Accuracy (%)

| task   |   questions |   3B_c_% |   3B_b_% |   new_7B_full_% |   base_7B_paper_% |
|:-------|------------:|---------:|---------:|----------------:|------------------:|
| DTR    |         353 |    62.04 |    63.74 |           76.77 |              66.6 |
| BBR    |        2006 |    16.65 |    21.98 |           19.99 |               4.7 |
| BDC    |        3583 |    49.79 |    19.93 |           30.31 |              34.2 |
| DRE    |        1868 |    46.63 |    27.57 |           33.03 |              29.3 |
| DSR    |        2007 |    35.38 |    36.92 |           40.46 |              28.3 |
| ORR    |         858 |    51.98 |    24.71 |           34.62 |              23.9 |

The new 7B's numbers are at full size (1036 px); the 3Bs read their training size. The base 7B's are the DisasterM3 paper's (Table 2).

## Building counting, beside accuracy

- the winner (c): accuracy 49.79%; median count error 5.4% (the chosen option's value against the true count), on the 99.9% answered with one option.
- the runner-up (b): accuracy 19.93%; median count error 39.0% (the chosen option's value against the true count), on the 99.9% answered with one option.
- The rule that never sees the image: 66.98%. Accuracy on these options can't show that a model counts well; `l2-step4b-clean-and-options-check.ipynb` tests it on the questions whose options don't give the answer away.

## Files

- `results.csv`, `per_question.csv`, `answers.jsonl` (every answer), `config.json`
