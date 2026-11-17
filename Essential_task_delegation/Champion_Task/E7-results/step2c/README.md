# E7 step 2c: option (c), a mix chosen on validation, confirmed once on the test pairs

Run on Abrar's PC, no GPU, from saved files only. The question, the candidates, the rule and the expectation are in the notebook's first cell (`e7-step2c-mix-choice.ipynb`), written before the run.

## Check first: the rebuilt scores reproduce the published ones

| check                                              |   rebuilt |   published | pass   |
|:---------------------------------------------------|----------:|------------:|:-------|
| validation, find-then-grade seed 42: destroyed IoU |    0.3161 |      0.3161 | True   |
| validation, find-then-grade seed 43: destroyed IoU |    0.3063 |      0.3051 | True   |
| validation, find-then-grade seed 44: destroyed IoU |    0.2982 |      0.2982 | True   |
| validation, R11 with TTA: destroyed IoU            |    0.2692 |      0.2692 | True   |
| validation, R11 with TTA: mIoU                     |    0.5805 |      0.5805 | True   |
| test, find-then-grade seed 42: destroyed IoU       |    0.4055 |      0.4055 | True   |
| test, find-then-grade seed 42: mIoU                |    0.518  |      0.5179 | True   |
| test, find-then-grade seed 43: destroyed IoU       |    0.3982 |      0.3983 | True   |
| test, find-then-grade seed 43: mIoU                |    0.5121 |      0.5121 | True   |
| test, find-then-grade seed 44: destroyed IoU       |    0.3657 |      0.3657 | True   |
| test, find-then-grade seed 44: mIoU                |    0.5086 |      0.5087 | True   |
| test, R11 with TTA: destroyed IoU                  |    0.3984 |      0.3984 | True   |
| test, R11 with TTA: mIoU                           |    0.5721 |      0.5721 | True   |

## The candidates on the 605 clean validation pairs

Destroyed IoU is the mean of the three grader seeds (R11 alone and C1 use no grader).

| candidate                                            |   miou |   destroyed_iou |   building_iou |   destroyed_iou_s42 |   destroyed_iou_s43 |   destroyed_iou_s44 |
|:-----------------------------------------------------|-------:|----------------:|---------------:|--------------------:|--------------------:|--------------------:|
| R11 alone (reference)                                | 0.5805 |          0.2692 |         0.7429 |              0.2692 |              0.2692 |              0.2692 |
| Find-then-grade alone (reference)                    | 0.5474 |          0.3068 |         0.6307 |              0.3161 |              0.3063 |              0.2982 |
| C1, R11 grades the outlines                          | 0.5304 |          0.2139 |         0.6272 |              0.2139 |              0.2139 |              0.2139 |
| C2, grader: building or not; R11: which class        | 0.5307 |          0.2125 |         0.6307 |              0.2127 |              0.2125 |              0.2124 |
| C3, blend, w = 0.25                                  | 0.5314 |          0.2135 |         0.6293 |              0.2122 |              0.2138 |              0.2145 |
| C3, blend, w = 0.5                                   | 0.541  |          0.2391 |         0.6314 |              0.238  |              0.2313 |              0.248  |
| C3, blend, w = 0.75                                  | 0.5559 |          0.3097 |         0.6321 |              0.3058 |              0.3223 |              0.3009 |
| C4, R11 on xBD images, find-then-grade on the others | 0.5881 |          0.3501 |         0.6822 |              0.3574 |              0.3503 |              0.3426 |

**The rule's choice:** C4, R11 on xBD images, find-then-grade on the others.

## Once on the 2,007 clean test pairs

| method                                               |   destroyed_iou (all) |   miou |   building_iou |   destroyed_iou (Turkey) |   destroyed_iou (without Turkey) |
|:-----------------------------------------------------|----------------------:|-------:|---------------:|-------------------------:|---------------------------------:|
| R11 alone                                            |                0.3984 | 0.5721 |         0.6944 |                   0.0867 |                           0.4672 |
| Find-then-grade alone                                |                0.3898 | 0.5129 |         0.5416 |                   0.3231 |                           0.4105 |
| C4, R11 on xBD images, find-then-grade on the others |                0.4296 | 0.5555 |         0.6221 |                   0.3231 |                           0.461  |

## Is the lead more than noise? (10,000 redraws of the pairs, as E7 step 2b)

| comparison                                                                       |   observed |   low_2.5% |   high_97.5% |   share_above_0 |
|:---------------------------------------------------------------------------------|-----------:|-----------:|-------------:|----------------:|
| C4, R11 on xBD images, find-then-grade on the others minus R11 alone             |     0.0312 |     0.0075 |       0.0569 |          0.9944 |
| C4, R11 on xBD images, find-then-grade on the others minus Find-then-grade alone |     0.0397 |     0.0265 |       0.0545 |          1      |

## What it means

- On the test pairs, C4, R11 on xBD images, find-then-grade on the others scores destroyed IoU 0.4296, against 0.3984 for R11 and 0.3898 for find-then-grade.
- Its lead over R11: +0.0312 (middle 95%: +0.0075 to +0.0569); over find-then-grade: +0.0397 (+0.0265 to +0.0545).
- This doesn't choose the system's method by itself: Abrar decides, with these numbers.

Files: `candidates_validation.csv`, `test_confirmation.csv`, `resampling.csv`.
