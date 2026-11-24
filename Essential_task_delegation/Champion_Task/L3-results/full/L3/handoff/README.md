# L3: the 4-bit 3B (c) and its hand-off to the 7B

Worked out on the PC by `l3-handoff-calibration.ipynb` from the Kaggle run `l3-4bit-3b-handoff` (`../README.md`) and the new 7B's saved answers (L0 step 2), by the rule fixed on 23 Nov (in both notebooks' first cells). Chosen on the choosing half (md5 of the question ID even), reported on the other half.

## The hand-off

Threshold 0.0000 on the confidence at temperature 2.0. On the reporting half, the 3B answers 100.0% of the questions; the mean of the six tasks' accuracies is 45.04% against 39.31% for the 7B alone (one standard error: 0.8 points), at an expected 1.72 s per question against 4.83 s. With both models loaded on one GPU: about 11.06 GB.

```
                  set                          method  share_by_3b_%  accuracy_%  s_per_question
       reporting half                        7B alone            0.0      39.313           4.825
       reporting half               3B alone (4 bits)          100.0      45.040           1.719
       reporting half              hand-off at 0.0000          100.0      45.040           1.719
       reporting half perfect hand-off (either right)            NaN      54.984             NaN
reporting half, clean                        7B alone            0.0      39.200           4.825
reporting half, clean               3B alone (4 bits)          100.0      44.908           1.719
reporting half, clean              hand-off at 0.0000          100.0      44.908           1.719
reporting half, clean perfect hand-off (either right)            NaN      54.917             NaN
        choosing half                        7B alone            0.0      39.068           4.825
        choosing half               3B alone (4 bits)          100.0      43.935           1.719
        choosing half              hand-off at 0.0000          100.0      43.935           1.719
        choosing half perfect hand-off (either right)            NaN      54.414             NaN
```

By task, reporting half:

```
task  questions  share_by_3b_%  7B_%  3B_4bit_%  hand_off_%
 DTR        173          100.0 77.46      67.63       67.63
 BBR        974          100.0 19.10      15.40       15.40
 BDC       1828          100.0 28.94      47.65       47.65
 DRE        920          100.0 33.04      46.85       46.85
 DSR       1033          100.0 41.63      36.50       36.50
 ORR        434          100.0 35.71      56.22       56.22
```

## The confidence

- Expected calibration error (15 bins, reporting half): 0.4034 at temperature 1, 0.1229 at 2.0.
- Area under the risk-coverage curve: 0.3906 (random order 0.5916, the best possible 0.2259). Lower is better.

```
 temperature  log_loss_choosing  ece_reporting  rc_auc_reporting
        0.50             2.1066         0.5008            0.4092
        0.75             1.4755         0.4528            0.4056
        1.00             1.1569         0.4034            0.4035
        1.25             0.9468         0.3479            0.4004
        1.50             0.7591         0.2643            0.3944
        2.00             0.6299         0.1229            0.3906
        3.00             1.7036         0.3943            0.3961
        4.00             2.4683         0.4063            0.3970
        6.00             3.2599         0.4081            0.3977
        8.00             3.6612         0.4083            0.3980
```

Error rate among the most confident answers (reporting half, chosen temperature):

```
 coverage_%  error_rate_%
         10         14.93
         20         21.74
         30         30.76
         40         37.58
         50         43.53
         60         47.53
         70         51.40
         80         54.20
         90         56.69
        100         59.16
```

## Memory and speed (one T4, one question at a time)

```
  model  questions  weights_gpu_gb  footprint_gb  peak_gpu_gb  s_per_question_mean  s_per_question_median  tokens_per_s  disk_gb
 7b_nf4         60            5.91          5.78         8.64                4.825                  5.715          0.59      NaN
3b_fp16         60            7.53          7.52         8.13                1.620                  1.859          2.12     7.51
 3b_nf4         60            2.42          2.35         3.03                1.719                  1.913          2.04     2.40
```

## Four bits against fp16 (L2 run 5)

```
task  fp16_%  4bit_%  same_answer_%  change_points
 DTR   62.04   63.17           90.7           1.13
 BBR   16.65   16.55           64.4          -0.10
 BDC   49.79   48.17           88.1          -1.62
 DRE   46.63   48.72           89.2           2.09
 DSR   35.38   34.63           56.5          -0.75
 ORR   51.98   55.71           84.0           3.73
```

## Expectation (fixed 23 Nov) against result

```
                            expectation (23 Nov)                                         result   met
                   4-bit 3B weights about 2-3 GB                                        2.42 GB  True
4-bit 3B peak under 4 GB, one question at a time                                        3.03 GB  True
         4-bit 7B peak about 6-7 GB at full size                                        8.64 GB False
                    4-bit 3B slower than fp16 3B                         1.719 s against 1.62 s  True
                   4-bit 3B faster than 4-bit 7B                        1.719 s against 4.825 s  True
  overconfident at temperature 1: ECE above 0.05                                     ECE 0.4034  True
                    a temperature above 1 chosen                                            2.0  True
4 bits cost at most about 2 points on most tasks changes [1.13, -0.1, -1.62, 2.09, -0.75, 3.73]  True
```

## Files

- `calibration.csv`, `reliability.csv`, `risk_coverage.csv`, `handoff.csv`, `handoff_by_task.csv`, `summary.json`
