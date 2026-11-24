# R16c step 7: super-resolved crops for the grader

645 validation pairs, 605 of them clean; the three graders of R16c steps 5 and 5b; the SAM 3 outlines of E3. V0 = crops as before; S1 and S2 = a building whose longest side is under 48 px is cropped from its photos enlarged 2x by Swin2SR (S1) or Real-ESRGAN (S2). The question, the rule and the expectation are in the notebook's first cell.

## Checks

| check                                                                                  | result             | pass   |
|:---------------------------------------------------------------------------------------|:-------------------|:-------|
| V0 log-probabilities within 0.05 of the saved ones                                     | 1.0000 of outlines | True   |
| V0 destroyed IoU, seed 42, against 0.3161 (within 0.0005)                              | 0.3161             | True   |
| V0 destroyed IoU, seed 43, against 0.3051 (within 0.0015)                              | 0.3062             | True   |
| V0 destroyed IoU, seed 44, against 0.2982 (within 0.0015)                              | 0.2974             | True   |
| V0 macro F1 on the true buildings of all pairs, seed 42, against 0.7367 (within 0.003) | 0.7367             | True   |
| V0 macro F1 on the true buildings of all pairs, seed 43, against 0.7303 (within 0.003) | 0.7303             | True   |
| V0 macro F1 on the true buildings of all pairs, seed 44, against 0.7541 (within 0.003) | 0.7541             | True   |

## The SR models on five real photos

PSNR in dB against the photo's own centre: `*_psnr` after shrinking it by 2 and enlarging it again (bicubic, S1, S2); `*_consistency_psnr` = the model's output shrunk back, against its input (at least 22 dB).

| image                                          |   bicubic_psnr |   S1_psnr |   S1_consistency_psnr |   S2_psnr |   S2_consistency_psnr |
|:-----------------------------------------------|---------------:|----------:|----------------------:|----------:|----------------------:|
| turkey_earthquake3_post_692.png                |          40.91 |     42.24 |                 55.28 |     26.46 |                 29.23 |
| hurricane_florence_00000315_post_disaster.png  |          42.37 |     42.18 |                 54.74 |     36.39 |                 35    |
| nepal_flooding_00000278_post_disaster.png      |          37.16 |     36.86 |                 52.44 |     33.13 |                 34.03 |
| santa_rosa_wildfire_00000201_post_disaster.png |          27.55 |     27.09 |                 37.7  |     25.09 |                 27.52 |
| hurricane_michael_00000224_post_disaster.png   |          37.08 |     37.12 |                 51.51 |     32.7  |                 36.93 |

One whole photo: {'S1': 17.82, 'S2': 1.46} s; per pair in the run (both photos at once, on 2 GPU(s)): {'S1': 23.93, 'S2': 1.55} s.

## Buildings under 48 px (clean pairs)

| source        |   pairs |   true_buildings |   true_small_share |   outlines |   outlines_small_share |
|:--------------|--------:|-----------------:|-------------------:|-----------:|-----------------------:|
| other sources |      85 |             5272 |              0.264 |       6435 |                  0.238 |
| xBD           |     520 |            19614 |              0.621 |      19740 |                  0.701 |

## Find-then-grade (mean of three seeds)

| variant   | pairs         |   n_pairs |   miou |   destroyed_iou |   building_iou |   destroyed_iou_s42 |   destroyed_iou_s43 |   destroyed_iou_s44 |   grade_agrees_with_main_truth |   agrees_on_small_outlines |
|:----------|:--------------|----------:|-------:|----------------:|---------------:|--------------------:|--------------------:|--------------------:|-------------------------------:|---------------------------:|
| V0        | all           |       605 | 0.5473 |          0.3066 |         0.6307 |              0.3161 |              0.3062 |              0.2974 |                         0.8182 |                     0.7931 |
| V0        | xBD           |       520 | 0.5758 |          0.3542 |         0.6421 |              0.3643 |              0.3561 |              0.3422 |                         0.8133 |                     0.8007 |
| V0        | other sources |        85 | 0.4439 |          0.2623 |         0.6178 |              0.2687 |              0.2616 |              0.2567 |                         0.8332 |                     0.7239 |
| S1        | all           |       605 | 0.5454 |          0.3025 |         0.6299 |              0.3145 |              0.3019 |              0.2913 |                         0.8085 |                     0.7766 |
| S1        | xBD           |       520 | 0.5725 |          0.3479 |         0.6409 |              0.3619 |              0.3476 |              0.3342 |                         0.8016 |                     0.784  |
| S1        | other sources |        85 | 0.4436 |          0.2603 |         0.6176 |              0.268  |              0.2607 |              0.2522 |                         0.8297 |                     0.7093 |
| S2        | all           |       605 | 0.5426 |          0.3006 |         0.6297 |              0.3142 |              0.2961 |              0.2916 |                         0.8044 |                     0.7696 |
| S2        | xBD           |       520 | 0.5683 |          0.3429 |         0.6405 |              0.3577 |              0.3386 |              0.3325 |                         0.7972 |                     0.7778 |
| S2        | other sources |        85 | 0.4442 |          0.2618 |         0.6176 |              0.272  |              0.2589 |              0.2546 |                         0.8265 |                     0.6956 |

## The graders on the true buildings (macro F1, mean of three seeds)

| variant   | pairs   |   buildings |   macro_f1 |   macro_f1_s42 |   macro_f1_s43 |   macro_f1_s44 |   small_buildings |   macro_f1_small |
|:----------|:--------|------------:|-----------:|---------------:|---------------:|---------------:|------------------:|-----------------:|
| V0        | clean   |       24886 |     0.7324 |         0.7275 |         0.7245 |         0.7453 |             13571 |           0.7173 |
| V0        | all     |       25594 |     0.7404 |         0.7367 |         0.7303 |         0.7541 |             14034 |           0.7247 |
| S1        | clean   |       24886 |     0.7152 |         0.7157 |         0.7054 |         0.7245 |             13571 |           0.6881 |
| S1        | all     |       25594 |     0.7219 |         0.7224 |         0.7095 |         0.7339 |             14034 |           0.6937 |
| S2        | clean   |       24886 |     0.701  |         0.6982 |         0.6854 |         0.7192 |             13571 |           0.664  |
| S2        | all     |       25594 |     0.7092 |         0.7045 |         0.6947 |         0.7283 |             14034 |           0.6721 |

## The rule

| comparison   | metric                   |   observed |   low_2.5% |   high_97.5% |   share_above_0 | decides   |
|:-------------|:-------------------------|-----------:|-----------:|-------------:|----------------:|:----------|
| S1 minus V0  | destroyed IoU            |    -0.0041 |    -0.007  |      -0.002  |          0      | True      |
| S1 minus V0  | macro F1, true buildings |    -0.0172 |    -0.0226 |      -0.0125 |          0      | False     |
| S2 minus V0  | destroyed IoU            |    -0.006  |    -0.0107 |      -0.0026 |          0.0001 | False     |
| S2 minus V0  | macro F1, true buildings |    -0.0314 |    -0.0392 |      -0.0251 |          0      | False     |

**Verdict:** S1 (Swin2SR) doesn't pass: its destroyed IoU gain over V0 isn't clearly above noise. Super-resolution at grading time doesn't help these graders.

Files: `scores.csv`, `true_buildings.csv`, `resampling.csv`, `sizes.csv`, `sr_checks.csv`, `grades_sr.csv` (every outline's grade per version and seed), `true_grades.csv` (every true building's), `examples.png`, `config.json`.
