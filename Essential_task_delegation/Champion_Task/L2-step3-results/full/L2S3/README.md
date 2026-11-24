# L2 step 3: the two 3Bs on the held-out questions

1,962 checkable training questions on the 501 after-photos neither 3B trained on, in the benchmark's format, greedy. The base 3B is a reference.

**Winner by the rule fixed on 8 Nov: (c).** primary accuracy 35.95% (b) against 45.12% (c), exact McNemar p = 0.0000.

## Scores

| model   |   primary_% |   all_% |   DTR_% |   BBR_% |   BDC_% |   DRE_% |   DSR_% |   ORR_% |   counting_largest_above_20_% |   middle_picked_above_20_% |   bdc_median_count_error_% |
|:--------|------------:|--------:|--------:|--------:|--------:|--------:|--------:|--------:|------------------------------:|---------------------------:|---------------------------:|
| base    |       27.8  |   26.71 |   66.67 |    6.75 |   30.94 |   24.24 |   38.79 |       8 |                         20.48 |                       20.5 |                       20   |
| b       |       35.95 |   31.24 |   77.38 |   24.94 |   21.99 |   31.96 |   50.57 |      10 |                          4.44 |                        4.4 |                       38.8 |
| c       |       45.12 |   44.24 |   73.81 |   19.22 |   53.23 |   48.48 |   41.95 |      47 |                         39.25 |                       39.2 |                        0   |

- `primary_%`: the rule's score: counting only where the largest option is 20 or less, every question of the other tasks.
- `counting_largest_above_20_%` and `middle_picked_above_20_%`: where the options are built around the correct count, so the middle value is always right. A high middle share with no gain elsewhere means the pattern, not the picture.
- On the same counting questions, the rule that never sees the image scores 56.08% and always the middle value 42.78%.
- `bdc_median_count_error_%`: the chosen option's value against the true count, on the building-counting questions both 3Bs answered with one option.

## Files

- `selection.json`, `scores.csv`, `per_question.csv`
