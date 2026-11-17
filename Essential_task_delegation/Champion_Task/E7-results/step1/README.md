# E7 step 1: the chain's first counting number, on the validation images

The chain: SAM 3 (prompt "building", on the before-photo in four quarters) finds each building; a Siamese ResNet-18 trained on SAM 3's outlines labels it intact, damaged, destroyed or not a building. R11 is the U-Net with a ResNet-50 encoder and before and after photos as input, the baseline. Each method counts 8-connected blobs of at least 20 px and picks the nearest option, on the 1,055 training-split counting questions on the 645 validation images. The true masks answer all of them.

**Finding:** The chain with grader seed 42 answers 37.73% of the 1,055 validation questions, against 39.24% for R11 (exact McNemar p = 0.3881). Median count error: 40.0% against 33.3%. Expected about 36-40%: met.

## Accuracy and count error

```
       method  all_%  clean_%  intact_%  damaged_%  destroyed_%  largest_above_20_%  largest_up_to_20_%  mean_abs_error  median_abs_error  median_error_%  within_20%_%
    chain_s42  37.73    37.47     37.48      34.51        42.59               22.78               44.77            7.65               3.0            40.0          32.8
    chain_s43  37.63    36.55     35.32      40.49        39.81               22.78               44.63            7.62               3.0            37.5          32.5
    chain_s44  38.67    37.99     37.84      34.51        46.30               24.26               45.47            7.36               3.0            36.4          34.8
          R11  39.24    39.01     38.02      43.66        36.57               27.51               44.77            7.38               2.0            33.3          38.8
no_image_rule  59.72    60.06     65.41      54.23        52.31              100.00               40.73             NaN               NaN             NaN           NaN
always_middle  45.12    47.02     59.46      34.51        22.22              100.00               19.25             NaN               NaN             NaN           NaN
```

- `clean_%`: without E5's 40 leaked validation pairs.
- `largest_above_20_%` and `largest_up_to_20_%`: questions by their largest option. When it's above 20, the options are built around the correct count, so the middle value is correct.
- `no_image_rule` and `always_middle` never see the image. They were found on these training questions, so here they are only a reference. The fair test of the rule is `benchmark-option-rule-check.ipynb`, on the benchmark's questions.
- Count error is against the question's true count: `median_error_%` as in R16c step 1, `within_20%_%` the share of counts within 20% of the truth.

## Chain with grader seed 42 against R11, same questions (exact McNemar)

- All: {'questions': 1055, 'only_chain_right': 143, 'only_R11_right': 159, 'p': 0.3881}
- Clean: {'questions': 974, 'only_chain_right': 130, 'only_R11_right': 145, 'p': 0.3986}

## The rebuilt maps against their published scores

```
 seed   miou  published_miou  destroyed_iou  published_destroyed_iou  clean_miou  clean_destroyed_iou
   42 0.5520          0.5520         0.3347                   0.3347      0.5469               0.3161
   43 0.5525          0.5522         0.3254                   0.3242      0.5473               0.3063
   44 0.5528          0.5527         0.3156                   0.3156      0.5480               0.2982
```

## Files

- `e7_step1_counting.csv`, `e7_step1_per_question.csv`, `e7_step1_map_rebuild_check.csv`, `config.json`
