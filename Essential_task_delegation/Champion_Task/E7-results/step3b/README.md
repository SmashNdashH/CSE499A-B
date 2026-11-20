# E7 step 3b: three follow-up checks on C4's outputs

The questions, the methods, the checks and the expectation, fixed before the run, are in the notebook's first cell ([`e7-step3b-three-checks.ipynb`](../../e7-step3b-three-checks.ipynb)). Run on a PC, no GPU, in 6.0 min.

## Check A: counting from the table's rows

Each method's count is the number of rows (or blobs) of the asked class on the photo; the answer is the nearest option. `C4 table` counts the rows of `buildings_c4.sqlite` (one per SAM 3 outline on the sharper photos, one per patch of R11's pixels on xBD photos); `C4 blobs` is E7 step 3's figure from E7 step 2's joined blobs.

```
                     scope    method  questions  accuracy_%  largest_option_up_to_20_%  mean_abs_error  median_abs_error  within_20%_%  median_count_over_truth
               all askable  C4 table       3580       33.66                      42.10           13.78               4.0          31.6                     0.85
               all askable  C4 blobs       3580       35.34                      42.20           12.61               4.0          34.3                     0.81
               all askable       R11       3580       33.02                      41.55           13.34               4.0          32.3                     0.77
               all askable chain_s42       3580       32.88                      40.25           13.58               4.0          30.7                     0.71
                E5's clean  C4 table       3514       33.18                      41.49           14.00               4.0          31.5                     0.85
                E5's clean  C4 blobs       3514       34.89                      41.59           12.80               4.0          34.2                     0.81
                E5's clean       R11       3514       32.53                      40.93           13.55               4.0          32.2                     0.76
                E5's clean chain_s42       3514       32.70                      40.05           13.77               4.0          30.8                     0.71
            sharper photos  C4 table       1292       26.63                      36.55           18.14               8.0          22.0                     0.84
            sharper photos  C4 blobs       1292       31.27                      36.88           14.90               6.0          29.3                     0.70
            sharper photos       R11       1292       24.85                      34.78           16.93               9.0          23.8                     0.61
            sharper photos chain_s42       1292       31.27                      36.88           14.90               6.0          29.3                     0.70
sharper photos, E5's clean  C4 table       1292       26.63                      36.55           18.14               8.0          22.0                     0.84
sharper photos, E5's clean  C4 blobs       1292       31.27                      36.88           14.90               6.0          29.3                     0.70
sharper photos, E5's clean       R11       1292       24.85                      34.78           16.93               9.0          23.8                     0.61
sharper photos, E5's clean chain_s42       1292       31.27                      36.88           14.90               6.0          29.3                     0.70
                xBD photos  C4 table       2288       37.63                      44.60           11.32               3.0          37.1                     0.85
                xBD photos  C4 blobs       2288       37.63                      44.60           11.32               3.0          37.1                     0.85
                xBD photos       R11       2288       37.63                      44.60           11.32               3.0          37.1                     0.85
                xBD photos chain_s42       2288       33.78                      41.77           12.84               3.0          31.4                     0.71
```

Exact McNemar on E5's clean questions: C4 table vs C4 blobs: 84 vs 144, p = 8.556e-05; C4 table vs R11: 156 vs 133, p = 0.1955; C4 table vs chain_s42: 460 vs 443, p = 0.5944; C4 table vs C4 blobs, sharper photos only: 84 vs 144, p = 8.556e-05

The sharper photos, by the asked class (added after the smoke test showed the drop, to explain it):

```
    class   method  questions  accuracy_%  largest_option_up_to_20_%  mean_abs_error  median_abs_error  within_20%_%  median_count_over_truth  count_above_truth_%
   intact C4 table        722       24.10                      42.21           25.57              15.0          30.6                     1.06                 53.7
   intact C4 blobs        722       32.55                      40.91           19.61              10.0          44.6                     0.90                 34.8
  damaged C4 table        334       23.95                      29.85           10.26               4.0           4.2                     0.03                  9.6
  damaged C4 blobs        334       23.95                      29.85           10.46               4.0           3.6                     0.03                  9.6
destroyed C4 table        236       38.14                      41.21            6.58               2.0          20.8                     0.67                 29.2
destroyed C4 blobs        236       37.71                      43.22            6.76               2.0          19.1                     0.57                 23.3
```

## Check B: why the hot spots fall short on photos without destroyed buildings

A hit is a hot spot whose marked point is within 20 px of a truly damaged or destroyed building. Groups: photos with truly destroyed buildings; with only damaged ones; with no true damage.

```
      maps_and_photos source             group  photos  share_of_photos_without_destroyed  hot_spots  hot_spots_per_photo  hit_share
R9's maps, validation    all      damaged only     145                              0.344        221                 1.52      0.783
R9's maps, validation    all    no true damage     277                              0.656         75                 0.27      0.000
R9's maps, validation    all    with destroyed     183                                NaN        332                 1.81      0.852
R9's maps, validation    all without destroyed     422                              1.000        296                 0.70      0.584
R9's maps, validation  other      damaged only      16                              0.254          7                 0.44      0.286
R9's maps, validation  other    no true damage      47                              0.746         10                 0.21      0.000
R9's maps, validation  other    with destroyed      22                                NaN         31                 1.41      0.742
R9's maps, validation  other without destroyed      63                              1.000         17                 0.27      0.118
R9's maps, validation    xBD      damaged only     129                              0.359        214                 1.66      0.799
R9's maps, validation    xBD    no true damage     230                              0.641         65                 0.28      0.000
R9's maps, validation    xBD    with destroyed     161                                NaN        301                 1.87      0.864
R9's maps, validation    xBD without destroyed     359                              1.000        279                 0.78      0.613
C4's maps, validation    all      damaged only     145                              0.344        249                 1.72      0.783
C4's maps, validation    all    no true damage     277                              0.656         96                 0.35      0.000
C4's maps, validation    all    with destroyed     183                                NaN        381                 2.08      0.829
C4's maps, validation    all without destroyed     422                              1.000        345                 0.82      0.565
C4's maps, validation  other      damaged only      16                              0.254         17                 1.06      0.588
C4's maps, validation  other    no true damage      47                              0.746         14                 0.30      0.000
C4's maps, validation  other    with destroyed      22                                NaN         36                 1.64      0.611
C4's maps, validation  other without destroyed      63                              1.000         31                 0.49      0.323
C4's maps, validation    xBD      damaged only     129                              0.359        232                 1.80      0.797
C4's maps, validation    xBD    no true damage     230                              0.641         82                 0.36      0.000
C4's maps, validation    xBD    with destroyed     161                                NaN        345                 2.14      0.852
C4's maps, validation    xBD without destroyed     359                              1.000        314                 0.87      0.589
      C4's maps, test    all      damaged only     412                              0.312        644                 1.56      0.592
      C4's maps, test    all    no true damage     908                              0.688        683                 0.75      0.000
      C4's maps, test    all    with destroyed     687                                NaN       1448                 2.11      0.827
      C4's maps, test    all without destroyed    1320                              1.000       1327                 1.01      0.287
      C4's maps, test  other      damaged only     143                              0.284        152                 1.06      0.474
      C4's maps, test  other    no true damage     360                              0.716        167                 0.46      0.000
      C4's maps, test  other    with destroyed     236                                NaN        451                 1.91      0.690
      C4's maps, test  other without destroyed     503                              1.000        319                 0.63      0.226
      C4's maps, test    xBD      damaged only     269                              0.329        492                 1.83      0.628
      C4's maps, test    xBD    no true damage     548                              0.671        516                 0.94      0.000
      C4's maps, test    xBD    with destroyed     451                                NaN        997                 2.21      0.889
      C4's maps, test    xBD without destroyed     817                              1.000       1008                 1.23      0.307
```

On photos without destroyed buildings, from R9's maps to C4's on the same validation photos (the maps change), then to C4's on the test photos (the photos change):

```
source  R9_val  C4_val  C4_test  maps_change  photos_change main_cause_by_the_rule
   all   0.584   0.565    0.287       -0.019         -0.278             the photos
   xBD   0.613   0.589    0.307       -0.024         -0.282             the photos
 other   0.118   0.323    0.226        0.205         -0.097                   both
```

## Check C: a stricter rule for when a photo gets hot spots (T1 v4)

A photo gets hot spots only if its map marks at least G px of damage (destroyed 1, damaged 0.5). Chosen on validation: **G = 400 px**.

```
 gate_px  hot_spots  hits  hit_share  photos_with_hot_spots  hits_kept
       0        726   511      0.704                    326      1.000
     100        726   511      0.704                    326      1.000
     200        724   511      0.706                    324      1.000
     400        703   501      0.713                    303      0.980
     800        663   481      0.725                    265      0.941
    1600        591   443      0.750                    223      0.867
    3200        500   381      0.762                    182      0.746
    6400        375   289      0.771                    133      0.566
   12800        257   196      0.763                     88      0.384
```

Confirmed once on the clean test pairs:

```
            scope version  gate_px  hot_spots  hits  hit_share  photos_with_hot_spots  hits_kept
              all      v3        0       2775  1578      0.569                   1226      1.000
              all      v4      400       2731  1565      0.573                   1183      0.992
   with destroyed      v3        0       1448  1197      0.827                    587      1.000
   with destroyed      v4      400       1441  1194      0.829                    580      0.997
without destroyed      v3        0       1327   381      0.287                    639      1.000
without destroyed      v4      400       1290   371      0.288                    603      0.974
            other      v3        0        770   383      0.497                    354      1.000
            other      v4      400        765   382      0.499                    349      0.997
              xBD      v3        0       2005  1195      0.596                    872      1.000
              xBD      v4      400       1966  1183      0.602                    834      0.990
```

**v4 does not pass:** it keeps 99.2% of the test hits (needs at least 90%) and moves the hit share by +0.004 (needs at least +0.05). T1 v3 stays.

## Checks

1. Seed 42's table gives its saved counts; C4's xBD rows give R11's; the answers reproduce: passed.
2. C4's rebuilt validation maps give E7 step 2c's scores within 0.0005: passed.

```
                       what  rebuilt  published  difference
R11 with TTA: destroyed IoU   0.2692     0.2692         0.0
         R11 with TTA: mIoU   0.5805     0.5805         0.0
 C4, seed 42: destroyed IoU   0.3574     0.3574         0.0
```

3. T1 v3's code on R9's validation maps gives T1 v3's saved results on 60 photos: passed.
4. The gate's self-checks: passed.

## Against the expectation, fixed before the run

- all four checks pass: **yes**
- A: median count / truth on the sharper photos 0.8-0.9: **yes**
- A: accuracy on the sharper photos up 1-4 points: **no**
- A: C4's accuracy on E5's clean questions up 0.5-1.5 points: **no**
- B: mostly the maps (C4 below 0.45 on the same validation photos): **no**
- C: G between 400 and 3,200 px: **yes**
- C: test hit share 0.60-0.68 with at least 90% of hits kept: **no**

## Files

`counting_from_table.csv`, `counting_sharper_by_class.csv`, `counting_per_question.csv`, `hotspot_groups.csv`, `hotspot_causes.csv`, `val_c4_hotspots_per_image.csv`, `gate_validation.csv`, `gate_test.csv`, `config.json`