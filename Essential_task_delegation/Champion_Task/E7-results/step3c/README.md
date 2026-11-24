# E7 step 3c: C4's counting on the fair questions

From `e7-step3c-fair-counting.ipynb`, run on the PC from saved answers (no GPU). Fair: the building-counting questions whose largest option is 20 or less (2,000 of 3,580), where the middle option isn't always right. The rule and an honest note on timing are in the notebook's first cell.

## Accuracy (%)

| index | C4 (blobs) | C4 (building table) | R11 alone | find-then-grade alone | blind rule | our 7B | 3B (c) | 3B (c), 4 bits | questions |
|---|---|---|---|---|---|---|---|---|---|
| all | 35.34 | 33.66 | 33.02 | 32.88 | 66.98 | 30.34 | 49.83 | 48.21 | 3580.0 |
| fair | 42.2 | 42.1 | 41.55 | 40.25 | 40.9 | 32.0 | 57.45 | 53.9 | 2000.0 |
| fair, clean | 41.59 | 41.49 | 40.93 | 40.05 | 40.87 | 31.52 | 57.22 | 53.62 | 1945.0 |
| pattern (largest above 20) | 26.65 | 22.97 | 22.22 | 23.54 | 100.0 | 28.23 | 40.19 | 41.01 | 1580.0 |

## The rule: does C4 beat the blind rule on the fair questions?

| A | B | A_% | B_% | only_A_right | only_B_right | p |
|---|---|---|---|---|---|---|
| C4 (blobs) | blind rule | 42.2 | 40.9 | 585 | 559 | 0.46 |
| C4 (blobs) | our 7B | 42.2 | 32.0 | 519 | 315 | 1.62e-12 |
| 3B (c) | C4 (blobs) | 57.45 | 42.2 | 616 | 311 | 6.99e-24 |
| 3B (c) | blind rule | 57.45 | 40.9 | 616 | 285 | 9.79e-29 |
| R11 alone | blind rule | 41.55 | 40.9 | 573 | 560 | 0.721 |
| find-then-grade alone | blind rule | 40.25 | 40.9 | 574 | 587 | 0.725 |
| C4 (building table) | blind rule | 42.1 | 40.9 | 585 | 561 | 0.497 |

**Fails:** on the fair questions C4 scores 42.2% against the blind rule's 40.9% (p = 0.46). So its 35.34% on all questions, above the promised 34.2%, can't show that it counts: on the fair questions it is no better than a rule that never sees the photo. It is ahead of our 7B.

The 3B (c) scores 57.45% on the fair questions, ahead of C4 and of the blind rule beyond chance.

## A smarter blind rule?

| option by size (1 = smallest) | right_% |
|---|---|
| 1 | 26.6 |
| 2 | 40.9 |
| 3 | 17.6 |
| 4 | 10.4 |
| 5 | 4.4 |

No rule that picks by option position alone gets above 40.9% on the fair questions, so the 3B's lead is more than a position pattern.

## How close the counts are (fair questions; true counts median 4, mean 5.8)

| count from | median_error | mean_error | exact_% | answered_% |
|---|---|---|---|---|
| C4 raw count | 2.0 | 3.78 | 13.2 | 100.0 |
| C4 nearest option | 1.0 | 2.46 | 42.2 | 100.0 |
| blind rule | 1.0 | 2.2 | 40.9 | 100.0 |
| our 7B | 3.0 | 4.55 | 32.0 | 100.0 |
| 3B (c) | 0.0 | 1.95 | 57.4 | 100.0 |

## Files

`accuracy_by_subset.csv`, `fair_tests.csv`, `position_rules.csv`, `count_error.csv`
