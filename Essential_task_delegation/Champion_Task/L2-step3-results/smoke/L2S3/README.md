# L2 step 3: the two 3Bs on the held-out questions (SMOKE TEST)

12 checkable training questions on the 501 after-photos neither 3B trained on, in the benchmark's format, greedy. The base 3B is a reference.

**Smoke test: no verdict.**

## Scores

| model   |   primary_% |   all_% |   DTR_% |   BBR_% |   BDC_% |   DRE_% |   DSR_% |   ORR_% |   counting_largest_above_20_% |   middle_picked_above_20_% |   bdc_median_count_error_% |
|:--------|------------:|--------:|--------:|--------:|--------:|--------:|--------:|--------:|------------------------------:|---------------------------:|---------------------------:|
| base    |          10 |   25    |       0 |       0 |     100 |       0 |      50 |       0 |                           100 |                        100 |                        0   |
| b       |          10 |   16.67 |       0 |       0 |      50 |       0 |      50 |       0 |                            50 |                         50 |                       19.6 |
| c       |          50 |   41.67 |       0 |       0 |       0 |     100 |      50 |     100 |                             0 |                          0 |                       18.2 |

- `primary_%`: the rule's score: counting only where the largest option is 20 or less, every question of the other tasks.
- `counting_largest_above_20_%` and `middle_picked_above_20_%`: where the options are built around the correct count, so the middle value is always right. A high middle share with no gain elsewhere means the pattern, not the picture.
- On the same counting questions, the rule that never sees the image scores 50.0% and always the middle value 75.0%.
- `bdc_median_count_error_%`: the chosen option's value against the true count, on the building-counting questions both 3Bs answered with one option.

## Files

- `selection.json`, `scores.csv`, `per_question.csv`
