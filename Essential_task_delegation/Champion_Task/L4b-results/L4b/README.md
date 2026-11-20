# L4b: is L4's near-zero result EfficientSAM3 or our setup?

EfficientSAM3 `bd0936c`, weights `Simon7108528/EfficientSAM3@85b05896`, MobileCLIP-S0 at 16 tokens, half precision on a T4. The question, the reading and the expectation are in the notebook's first cell.

## Check A: the repo's own example (`dog_person.jpeg`, threshold 0.5)

| model   | prompt   |   found_at_0.5 |   top_score |
|:--------|:---------|---------------:|------------:|
| EV-M    | dog      |              1 |       0.607 |
| EV-M    | person   |              2 |       0.872 |
| RV-M    | dog      |              0 |       0.325 |
| RV-M    | person   |              2 |       0.822 |
| TV-M    | dog      |              1 |       0.73  |
| TV-M    | person   |              2 |       0.851 |

Every model finds the dog and the person: **False**. Overlays: `overlays/example_*.png`.

## Check B: 21 satellite before-photos, whole

Building IoU over the 21 photos at each threshold, the detections kept and the top scores. SAM 3 on the same photos (E3, whole, 0.5): **0.2812**.

| model   | prompt   |   median_top_score |   max_top_score |   building_iou_0.5 |   detections_0.5 |   building_iou_0.3 |   detections_0.3 |   building_iou_0.1 |   detections_0.1 |   building_iou_0.05 |   detections_0.05 |
|:--------|:---------|-------------------:|----------------:|-------------------:|-----------------:|-------------------:|-----------------:|-------------------:|-----------------:|--------------------:|------------------:|
| EV-M    | building |              0.051 |           0.76  |             0.0023 |                2 |             0.0456 |               15 |             0.0605 |              227 |              0.2197 |               652 |
| EV-M    | house    |              0.055 |           0.411 |             0      |                0 |             0.0035 |                4 |             0.0463 |              203 |              0.1059 |               615 |
| EV-M    | roof     |              0.145 |           0.501 |             0      |                1 |             0.0017 |               10 |             0.0638 |              268 |              0.1283 |              1020 |
| RV-M    | building |              0.254 |           0.578 |             0.0139 |                5 |             0.1217 |               38 |             0.3195 |              761 |              0.3    |              1599 |
| RV-M    | house    |              0.134 |           0.54  |             0.0024 |                1 |             0.0379 |               29 |             0.3382 |              693 |              0.2853 |              1369 |
| RV-M    | roof     |              0.314 |           0.591 |             0.0015 |                2 |             0.0273 |               31 |             0.2075 |              980 |              0.1917 |              1814 |
| TV-M    | building |              0.194 |           0.598 |             0.0167 |                8 |             0.0623 |               34 |             0.2849 |              714 |              0.3649 |              1488 |
| TV-M    | house    |              0.218 |           0.479 |             0      |                0 |             0.0164 |               22 |             0.2679 |              691 |              0.3084 |              1384 |
| TV-M    | roof     |              0.292 |           0.571 |             0.0037 |                4 |             0.0222 |               19 |             0.2755 |             1132 |              0.2773 |              2028 |

## Reading

**setup.** Check A fails: a model finds no dog or no person in the repo's own example at 0.5, so our setup is broken and L4's result says nothing about EfficientSAM3 until it is fixed.

Beside it, deciding nothing: the best other prompt is "house" with RV-M, Building IoU 0.3382.

Files: `check_a_example.csv`, `check_b_per_photo.csv`, `check_b_summary.csv`, `config.json`, `overlays/`.
