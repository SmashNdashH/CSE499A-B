# E6: the test split's ground truth

The benchmark's optical building-damage segmentation entries give **2,067 test pairs** (829 SAR after-images skipped: our models read colour photos).

## Clean test pairs

- **2,007 clean** of 2,067. Left out: 2 with a missing file, 1 failing the mask checks, 57 copying a segmentation-pool image (56 training, 1 validation).
- Pixels in the clean pairs: intact 252,819,282, damaged 24,791,802, destroyed 13,225,057.
- By event: turkey_earthquake 414, mexico_earthquake 191, joplin_tornado 148, palu_tsunami 124, ian_hurricane 104, nepal_flooding 60, santa_rosa_wildfire 60, beriut_explosion 59, hurricane_florence 59, hurricane_michael 59, moore_tornado 59, portugal_wildfire 59, hurricane_harvey 58, hurricane_matthew 58, libya_flood 58, midwest_flooding 58, tuscaloosa_tornado 56, lower_puna_volcano 55, pinery_bushfire 51, noto_earthquake 44, sunda_tsunami 40, hawaii_wildfire 30, socal_fire 30, guatemala_volcano 26, woolsey_fire 17, kalehe_flooding 15, shovi_landslide 11, bata_explosion 4.

## The masks

| set        |   pairs |   fail_rule_2 |   values_not_0_or_255 |   mask_not_1024_or_not_image_size |   before_image_other_size |   unreadable_mask |   unasked_mask_not_empty |   pairs_with_overlap |   overlap_px |   building_px |   overlap_share |   median_piece_area_px |
|:-----------|--------:|--------------:|----------------------:|----------------------------------:|--------------------------:|------------------:|-------------------------:|---------------------:|-------------:|--------------:|----------------:|-----------------------:|
| test       |    2065 |             1 |                     0 |                                 0 |                         0 |                 1 |                        0 |                    0 |            0 |     291904133 |               0 |                  983   |
| validation |     645 |             0 |                     0 |                                 0 |                         0 |                 0 |                        0 |                    0 |            0 |      50379382 |               0 |                 1008.5 |

Merged with the training rule (R11's Cell 4): intact, then damaged, then destroyed, a later class overwriting an earlier one. `test_masks_4class.zip` holds one PNG per checked test pair (0 background, 1 intact, 2 damaged, 3 destroyed), named after its after-image; use only the pairs in `test_clean_pairs.csv`.

## Copies of segmentation-pool images

From E5 step 1's Kaggle output (/kaggle/input/notebooks/abrar2222864642/e5-step1-hash-check/E5-step1/bench_copies.csv): E5 step 1 compared every benchmark image with every Instruct image (same pixels; near copy: dHash within 6 of 64 bits and 32 x 32 thumbnails correlating at 0.95 or more) and kept each benchmark image's best match.

- 31: after near copy (training); before same pixels (training)
- 22: before same pixels (training)
- 3: after same pixels (training)
- 2: before same pixels (Instruct, outside the pool)
- 1: after near copy (validation); before same pixels (validation)

Events of the left-out pairs: woolsey_fire 43, socal_fire 11, pinery_bushfire 3.

## Outlines drawn alike? Median building-piece area by event

| event               |   val_pairs |   test_pairs |   val_median_piece_px |   test_median_piece_px |   piece_ratio | within_range   |   val_median_building_share |   test_median_building_share |
|:--------------------|------------:|-------------:|----------------------:|-----------------------:|--------------:|:---------------|----------------------------:|-----------------------------:|
| turkey_earthquake   |          64 |          414 |                2547   |                 1771   |         0.695 | True           |                      0.3365 |                       0.2346 |
| nepal_flooding      |          48 |           60 |                 506   |                  527.5 |         1.042 | True           |                      0.0262 |                       0.0198 |
| santa_rosa_wildfire |          20 |           60 |                1133   |                 1125   |         0.993 | True           |                      0.0245 |                       0.0522 |
| hurricane_florence  |          57 |           59 |                 815.5 |                  811   |         0.994 | True           |                      0.0092 |                       0.0113 |
| hurricane_michael   |          42 |           59 |                 977   |                  979   |         1.002 | True           |                      0.0662 |                       0.0797 |
| portugal_wildfire   |         105 |           59 |                 583   |                  559   |         0.959 | True           |                      0.006  |                       0.0071 |
| hurricane_harvey    |          44 |           58 |                1424   |                 1493   |         1.048 | True           |                      0.0876 |                       0.1095 |
| hurricane_matthew   |          25 |           58 |                 276   |                  297   |         1.076 | True           |                      0.0044 |                       0.0053 |
| midwest_flooding    |          35 |           58 |                 936   |                  836   |         0.893 | True           |                      0.0096 |                       0.0069 |
| tuscaloosa_tornado  |          23 |           56 |                 848.5 |                  860   |         1.014 | True           |                      0.0364 |                       0.045  |
| pinery_bushfire     |          40 |           51 |                 382   |                  438   |         1.147 | True           |                      0.0044 |                       0.0042 |
| socal_fire          |          54 |           30 |                 909   |                 1332   |         1.465 | True           |                      0.0219 |                       0.009  |

## Against the rules and expectations (fixed before the run, 4 Nov)

- 1. inventory: 2,067 pairs (1,030 / 558 / 479), no file missing: **NO (2067 pairs, {1: 1030, 2: 558, 3: 479}, 2 with a missing file)**
- 2. every checked test pair's masks like the training masks: **NO (1 pairs fail)**
- 3. overlapping pixels at most 0.5% of building pixels: **yes; 0 pixels**
- 4. copies: 57 left out (56 training, 1 validation): **yes**
- 4. clean test pairs: 2,010: **NO (2,007)**
- 5. outlines drawn alike (piece-area ratio 0.67-1.5 in at least 80% of shared events): **yes (12 of 12 events)**

## Files

- `test_pairs.csv`: every optical test pair, its checks, copies, pixels and pieces, and whether it's clean
- `test_clean_pairs.csv`: the clean pairs (after-image, before-image, mask file, event, source)
- `val_pairs_stats.csv`, `style_by_event.csv`, `summary.json`
- `test_masks_4class.zip`: the merged four-class masks
