# R16c step 6: aligned crops for the grader

605 clean validation pairs; the three graders of R16c steps 5 and 5b; the SAM 3 outlines of E3. V0 = crops as before; V1 = the after-photo moved back by one phase-correlation shift per pair; V2 = V1 plus a local shift per outline. The question, the rule and the expectation are in the notebook's first cell.

## Checks

| check                                                     | result             | pass   |
|:----------------------------------------------------------|:-------------------|:-------|
| V0 log-probabilities within 0.05 of the saved ones        | 1.0000 of outlines | True   |
| V0 destroyed IoU, seed 42, against 0.3161 (within 0.0005) | 0.3161             | True   |
| V0 destroyed IoU, seed 43, against 0.3051 (within 0.0015) | 0.3062             | True   |
| V0 destroyed IoU, seed 44, against 0.2982 (within 0.0015) | 0.2974             | True   |

## The measured shifts

Pair shifts used: 483 of 605 (response at least 0.05, at most 64 px). Shift above 2 px: 47% of pairs; above 5 px: 17%; largest 48.8 px (Ridita's audit: 52%, 10%, 56 px).

## Scores (mean of three seeds)

| variant   | pairs         |   n_pairs |   miou |   destroyed_iou |   building_iou |   destroyed_iou_s42 |   destroyed_iou_s43 |   destroyed_iou_s44 |   grade_agrees_with_main_truth |
|:----------|:--------------|----------:|-------:|----------------:|---------------:|--------------------:|--------------------:|--------------------:|-------------------------------:|
| V0        | all           |       605 | 0.5473 |          0.3066 |         0.6307 |              0.3161 |              0.3062 |              0.2974 |                         0.8182 |
| V0        | xBD           |       520 | 0.5758 |          0.3542 |         0.6421 |              0.3643 |              0.3561 |              0.3422 |                         0.8133 |
| V0        | other sources |        85 | 0.4439 |          0.2623 |         0.6178 |              0.2687 |              0.2616 |              0.2567 |                         0.8332 |
| V1        | all           |       605 | 0.545  |          0.3048 |         0.6306 |              0.3171 |              0.3047 |              0.2926 |                         0.8172 |
| V1        | xBD           |       520 | 0.573  |          0.3517 |         0.6421 |              0.3669 |              0.3462 |              0.3419 |                         0.8116 |
| V1        | other sources |        85 | 0.4436 |          0.261  |         0.6177 |              0.2686 |              0.2664 |              0.2479 |                         0.8341 |
| V2        | all           |       605 | 0.5437 |          0.3014 |         0.6306 |              0.3121 |              0.3051 |              0.2869 |                         0.8168 |
| V2        | xBD           |       520 | 0.573  |          0.352  |         0.6422 |              0.3662 |              0.3477 |              0.3421 |                         0.8115 |
| V2        | other sources |        85 | 0.4406 |          0.2546 |         0.6176 |              0.2608 |              0.2654 |              0.2375 |                         0.833  |

## The rule

| comparison   |   observed |   low_2.5% |   high_97.5% |   share_above_0 |
|:-------------|-----------:|-----------:|-------------:|----------------:|
| V1 minus V0  |    -0.0018 |    -0.0072 |       0.0029 |          0.2412 |

**Verdict:** V1 doesn't pass: its gain over V0 isn't clearly above noise. Aligning at grading time doesn't help these graders.

Files: `scores.csv`, `resampling.csv`, `shifts.csv`, `grades_aligned.csv` (every outline's grade per version and seed), `config.json`.
