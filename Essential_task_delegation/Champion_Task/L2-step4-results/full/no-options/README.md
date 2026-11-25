# L2 step 4d: the 3B's counts with no options shown

The 3B (c) answered the benchmark's fair building-counting questions (largest option 20 or less) **with no answer options**, asked for a number ([Kaggle notebook](../../../l2-step4d-counts-without-options.ipynb), 2,002 questions, 59.9 min on a T4). Compared on the PC ([notebook](../../../l2-step4d-compare.ipynb)) with C4's counts and the blind rule on the 2,000 questions all three files hold. The rule and the expectation were fixed on 25 Nov before the run.

## The rule

| index | questions | nearest_option_right_% | blind_rule_% | only_3B_right | only_rule_right | test1_p | test1_passes | 3B_closer | C4_closer | ties | test2_p | test2_passes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| fair | 2000 | 35.6 | 40.9 | 542 | 648 | 0.00232 | False | 824 | 801 | 375 | 0.585 | False |
| fair, clean | 1945 | 35.22 | 40.87 | 523 | 633 | 0.00134 | False | 807 | 776 | 362 | 0.451 | False |

**By the rule, the 3B does not count:** test 1 fails (its number, snapped to the nearest option, is right on 35.6% against the blind rule's 40.9%, p = 0.00232); test 2 fails (its number is closer to the truth than C4's raw count 824 times against 801, p = 0.585).

## How close the counts are

| count from | answered_% | exact_% | within_1_% | median_error | mean_error |
|---|---|---|---|---|---|
| 3B, no options (its number) | 100.0 | 21.9 | 40.2 | 2.0 | 4.12 |
| 3B, with options (its pick) | 100.0 | 57.4 | 68.4 | 0.0 | 1.95 |
| C4 raw count | 100.0 | 13.2 | 42.8 | 2.0 | 3.78 |
| C4 nearest option | 100.0 | 42.2 | 54.9 | 1.0 | 2.46 |
| blind rule | 100.0 | 40.9 | 56.8 | 1.0 | 2.2 |

With options the 3B was right on 57.45% of these questions. Its number with no options snaps to the option it picked with options on 35.0% of them.

## Expectation against result

| expectation (25 Nov) | result | met |
|---|---|---|
| at least 95% of the answers contain a number | 99.9% | True |
| the exact count on 30–50% of questions | 21.9% | False |
| snapped to the nearest option, right on 45–57% (test 1 passes) | 35.6%, test 1 fails | False |
| a mean error of 2–3 buildings, below C4's raw 3.78 (test 2 passes) | 4.12, test 2 fails | False |

## Files

`tests.csv`, `count_error.csv`, `expectation.csv`, `per_question.csv`; the run's own files are in `../L2S4D/`.
