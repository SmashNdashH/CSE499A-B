# L0b step 2: the grader and L0b together

Made by [l0b-step2-grader-combination.ipynb](../../l0b-step2-grader-combination.ipynb), on your PC, from L0b's saved answers. The rules, the scoring, the criteria and the expectation were fixed in its first cell before scoring.

- **Rule A: doesn't earn a confirmation run.** 207 right of 300 (grader 212; McNemar p = 0.5901); at real shares, accuracy 70.8% (grader 83.9%) and destroyed F1 0.35 (grader 0.61).
- **Rule B: doesn't earn a confirmation run.** 211 right of 300 (grader 212; McNemar p = 1.0); at real shares, accuracy 82.3% (grader 83.9%) and destroyed F1 0.59 (grader 0.61).

## Scores

```
method  right  intact_right  damaged_right  destroyed_right  accuracy_real_shares  destroyed_recall  destroyed_precision_real_shares  destroyed_f1_real_shares  only_rule_right  only_grader_right  mcnemar_p
grader    212            92             54               66                0.8389              0.66                            0.567                     0.610              NaN                NaN        NaN
   l0b    176            40             50               86                0.4458              0.86                            0.231                     0.364              NaN                NaN        NaN
rule_A    207            76             40               91                0.7079              0.91                            0.217                     0.350             25.0               30.0     0.5901
rule_B    211            92             40               79                0.8231              0.79                            0.471                     0.590             13.0               14.0     1.0000
```

Real class shares used: Intact 76.7%, Damaged 17.1%, Destroyed 6.3% (25,594 validation buildings).

Files: `per_building.csv` (each building's true class and the four answers), `scores.csv`.
