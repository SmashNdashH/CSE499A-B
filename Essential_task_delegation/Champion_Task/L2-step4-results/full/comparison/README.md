# Every 7B and 3B on the benchmark's six tasks

From `l2-step4c-model-comparison.ipynb` on the PC (23 Nov), from saved answers and the DisasterM3 paper's Table 2. What each model is, and what is and isn't comparable: the notebook's first cell.

## Accuracy (%) on the 10,675 optical questions

```
                                    disaster type  bearing bodies  building counting  road damage  scene (land use)  relational reasoning   mean
Qwen2.5-VL-3B, untrained (paper)            56.10            5.70              29.90        21.20             30.80                 13.80  26.25
our 3B (b), soft labels                     63.74           21.98              19.93        27.57             36.92                 24.71  32.47
our 3B (c), the 7B's answers                62.04           16.65              49.79        46.63             35.38                 51.98  43.74
our 3B (c) in 4 bits                        63.17           16.55              48.17        48.72             34.63                 55.71  44.49
Qwen2.5-VL-7B, untrained (paper)            66.60            4.70              34.20        29.30             28.30                 23.90  31.17
our first 7B (CSE499A)                      75.64           20.94              30.09        32.39             40.06                 31.12  38.37
our 7B (L0 step 2)                          76.77           19.99              30.31        33.03             40.46                 34.62  39.20
DisasterM3's fine-tuned 7B (paper)          83.60           21.50              34.30        29.40             37.70                 36.20  40.45
```

Our 3Bs read photos at their training size (756 px); every other model at full size. Paper rows are the paper's own numbers; ours are greedy. The mean is the plain mean of the six tasks, as the paper's.

## The differences (points)

```
                                   disaster type  bearing bodies  building counting  road damage  scene (land use)  relational reasoning   mean
our 3B (c) − untrained 3B                   5.94           10.95              19.89        25.43              4.58                 38.18  17.49
our 3B (c) − our 3B (b)                    -1.70           -5.33              29.86        19.06             -1.54                 27.27  11.27
our 3B (c) − our 7B (its teacher)         -14.73           -3.34              19.48        13.60             -5.08                 17.36   4.54
4 bits − normal precision, (c)              1.13           -0.10              -1.62         2.09             -0.75                  3.73   0.75
our 7B − untrained 7B                      10.17           15.29              -3.89         3.73             12.16                 10.72   8.03
our 7B − DisasterM3's 7B                   -6.83           -1.51              -3.99         3.63              2.76                 -1.58  -1.25
```

## Our models question by question (exact McNemar)

A − B in points over all six tasks' questions, with the questions only one of them got right:

```
                           A                            B  only_A_right  only_B_right  A_minus_B_points             p
our 3B (c), the 7B's answers      our 3B (b), soft labels          2428           912             14.20 4.669540e-157
our 3B (c), the 7B's answers           our 7B (L0 step 2)          1732           852              8.24  2.627364e-68
        our 3B (c) in 4 bits our 3B (c), the 7B's answers           439           439              0.00  1.000000e+00
          our 7B (L0 step 2)       our first 7B (CSE499A)           158           115              0.40  1.088940e-02
```

By task (points; a difference beyond chance, p < 0.05, is marked in `paired_tests.csv`):

```
task                                                         DTR   BBR    BDC    DRE   DSR    ORR  all six
A                            B                                                                            
our 3B (c) in 4 bits         our 3B (c), the 7B's answers   1.13 -0.10  -1.62   2.09 -0.75   3.73     0.00
our 3B (c), the 7B's answers our 3B (b), soft labels       -1.70 -5.33  29.86  19.06 -1.54  27.27    14.20
                             our 7B (L0 step 2)           -14.73 -3.34  19.48  13.60 -5.08  17.37     8.24
our 7B (L0 step 2)           our first 7B (CSE499A)         1.13 -0.95   0.22   0.64  0.40   3.50     0.40
```

## Clean scores (without the 186 questions whose photos are training photos)

```
                              disaster type  bearing bodies  building counting  road damage  scene (land use)  relational reasoning   mean
our 3B (b), soft labels               62.68           21.71              19.62        27.70             36.66                 24.88  32.21
our 3B (c), the 7B's answers          60.93           16.39              49.62        46.29             35.09                 52.23  43.43
our 3B (c) in 4 bits                  62.10           16.44              48.00        48.36             34.28                 55.87  44.17
our first 7B (CSE499A)                74.93           20.70              29.85        32.33             39.71                 31.34  38.14
our 7B (L0 step 2)                    76.09           19.79              30.05        33.04             40.11                 34.86  38.99
```

## Counting on the fair questions (largest option 20 or less)

Where the middle option isn't always right. The blind rule never sees the photo.

```
                                BDC    DRE  questions
our 3B (b), soft labels       32.22  31.41       2002
our 3B (c), the 7B's answers  57.39  48.14       2002
our 3B (c) in 4 bits          53.85  51.15       2002
our first 7B (CSE499A)        32.07  34.55       2002
our 7B (L0 step 2)            31.97  34.81       2002
blind rule                    40.91  30.06       2002
```

## For scale (the paper's Table 2)

```
                                   disaster type  bearing bodies  building counting  road damage  scene (land use)  relational reasoning   mean
Qwen2.5-VL-72B, untrained (paper)           74.8             6.8               34.8         28.9              47.0                  50.8  40.52
GPT-4.1 (paper)                             79.6             7.2               25.5         25.0              52.4                  64.0  42.28
InternVL3-8B fine-tuned (paper)             79.3            23.9               29.1         24.9              42.6                  50.6  41.73
```

## The choice between the 3Bs (run 4, 1,962 held-out training questions)

```
                                  disaster type  bearing bodies  building counting  road damage  scene (land use)  relational reasoning  rule's score  overflowed
Qwen2.5-VL-3B, untrained (run 4)          66.67            6.75              30.94        24.24             38.79                   8.0         27.80        50.0
our 3B (b), soft labels                   77.38           24.94              21.99        31.96             50.57                  10.0         35.95        50.0
our 3B (c), the 7B's answers              73.81           19.22              53.23        48.48             41.95                  47.0         45.12        50.0
```

The rule's score leaves out counting questions whose largest option is above 20. Each 3B lost the same 50 questions to the overflow (the vision part they share); they count as wrong for all three, so the choice stands.

## Files

`six_tasks_all.csv`, `six_tasks_clean.csv`, `paired_tests.csv`, `fair_counting.csv`, `held_out_run4.csv`
