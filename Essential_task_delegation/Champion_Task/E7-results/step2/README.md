# E7 step 2: the whole chain on the unseen test pairs

Run on 2,065 optical test pairs; maps scored on E6's 2,007 clean pairs.

- **The chain:** SAM 3 (prompt "building", on the before-photo in four quarters) finds each building. A Siamese ResNet-18 trained on SAM 3's outlines of the training images labels each one intact, damaged, destroyed or not a building, from 128 px before and after crops.
- **The baseline, R11:** a U-Net with a ResNet-50 encoder, with the after-photo and before-photo as 6 input channels, using 8-view test-time augmentation (TTA).

## The result, by the rule fixed before the run

**The chain's destroyed-building IoU isn't above R11's: the lead doesn't hold on unseen data, and the choice of chain reopens before T2 step 5.**

- Destroyed-building IoU on the clean test pairs: chain (mean of three graders) **0.3898**, R11 with TTA **0.3984**.
- Mean IoU: chain 0.5129, R11 with TTA 0.5721.
- Counting on E5's clean questions: seed 42's table 32.7%, R11's 32.53%, exact McNemar p = 0.8743.
- O1 stays judged on validation, as the review set it. Nothing is tuned on these pairs.

## Map scores

### clean pairs

| method               |   miou |   intact_iou |   damaged_iou |   destroyed_iou |   building_iou |   destroyed_precision |   destroyed_recall |
|:---------------------|-------:|-------------:|--------------:|----------------:|---------------:|----------------------:|-------------------:|
| chain_s42            | 0.5179 |       0.4888 |        0.2513 |          0.4055 |         0.5395 |                0.6387 |             0.5262 |
| chain_s43            | 0.5121 |       0.4778 |        0.246  |          0.3983 |         0.5405 |                0.6416 |             0.5123 |
| chain_s44            | 0.5087 |       0.4908 |        0.2516 |          0.3657 |         0.5447 |                0.5091 |             0.565  |
| R11_tta              | 0.5721 |       0.6407 |        0.3057 |          0.3984 |         0.6944 |                0.5631 |             0.5766 |
| R11_std              | 0.5613 |       0.632  |        0.2869 |          0.3848 |         0.6869 |                0.5395 |             0.573  |
| ceiling_sam3         | 0.6648 |       0.5341 |        0.6092 |          0.5898 |         0.5457 |                0.8556 |             0.655  |
| chain, mean of three | 0.5129 |       0.4858 |        0.2496 |          0.3898 |         0.5416 |                0.5965 |             0.5345 |

### clean pairs, without Turkey

| method               |   miou |   intact_iou |   damaged_iou |   destroyed_iou |   building_iou |   destroyed_precision |   destroyed_recall |
|:---------------------|-------:|-------------:|--------------:|----------------:|---------------:|----------------------:|-------------------:|
| chain_s42            | 0.5263 |       0.4482 |        0.2974 |          0.423  |         0.508  |                0.6639 |             0.5383 |
| chain_s43            | 0.5173 |       0.4348 |        0.2785 |          0.4189 |         0.5102 |                0.679  |             0.5224 |
| chain_s44            | 0.5216 |       0.4563 |        0.303  |          0.3896 |         0.5153 |                0.5546 |             0.567  |
| R11_tta              | 0.5948 |       0.5994 |        0.3622 |          0.4672 |         0.6582 |                0.585  |             0.6988 |
| R11_std              | 0.5831 |       0.5906 |        0.3381 |          0.4548 |         0.652  |                0.5688 |             0.6941 |
| ceiling_sam3         | 0.6506 |       0.5012 |        0.6017 |          0.5626 |         0.5159 |                0.8428 |             0.6286 |
| chain, mean of three | 0.5217 |       0.4464 |        0.293  |          0.4105 |         0.5112 |                0.6325 |             0.5426 |

### Turkey only

| method               |   miou |   intact_iou |   damaged_iou |   destroyed_iou |   building_iou |   destroyed_precision |   destroyed_recall |
|:---------------------|-------:|-------------:|--------------:|----------------:|---------------:|----------------------:|-------------------:|
| chain_s42            | 0.4592 |       0.5557 |        0.0562 |          0.3446 |         0.5974 |                0.5495 |             0.4802 |
| chain_s43            | 0.4671 |       0.5487 |        0.1096 |          0.3299 |         0.5965 |                0.5207 |             0.4738 |
| chain_s44            | 0.4447 |       0.5481 |        0.0546 |          0.2954 |         0.5991 |                0.386  |             0.5573 |
| R11_tta              | 0.4305 |       0.7042 |        0.0184 |          0.0867 |         0.7591 |                0.2944 |             0.1094 |
| R11_std              | 0.4267 |       0.6959 |        0.0203 |          0.0822 |         0.7496 |                0.2419 |             0.1107 |
| ceiling_sam3         | 0.7007 |       0.5894 |        0.6364 |          0.6965 |         0.6008 |                0.899  |             0.7557 |
| chain, mean of three | 0.457  |       0.5508 |        0.0735 |          0.3233 |         0.5977 |                0.4854 |             0.5038 |

`ceiling_sam3`: a perfect grader on SAM 3's outlines, the most a better grader could reach on these outlines.

## Per event

| event               |   clean_pairs |   chain_destroyed_iou_mean_of_three |   r11_tta_destroyed_iou |   chain_miou_mean_of_three |   r11_tta_miou |   ceiling_destroyed_iou |   true_destroyed_px |
|:--------------------|--------------:|------------------------------------:|------------------------:|---------------------------:|---------------:|------------------------:|--------------------:|
| turkey_earthquake   |           414 |                              0.3233 |                  0.0867 |                     0.457  |         0.4305 |                  0.6965 |             2743296 |
| mexico_earthquake   |           191 |                              0      |                  0      |                     0.2875 |         0.3647 |                  0      |                5598 |
| joplin_tornado      |           148 |                              0.6032 |                  0.6009 |                     0.6747 |         0.7049 |                  0.7676 |             3038756 |
| palu_tsunami        |           124 |                              0.4385 |                  0.5573 |                     0.4951 |         0.6148 |                  0.5754 |             2045622 |
| ian_hurricane       |           104 |                              0.0621 |                  0.0377 |                     0.4821 |         0.4458 |                  0.8509 |               15120 |
| nepal_flooding      |            60 |                              0.0024 |                  0.0129 |                     0.4014 |         0.5042 |                  0.0937 |                8298 |
| santa_rosa_wildfire |            60 |                              0.7307 |                  0.7418 |                     0.6242 |         0.6502 |                  0.7695 |             1650468 |
| beriut_explosion    |            59 |                              0.4875 |                  0.5695 |                     0.3924 |         0.4535 |                  0.7339 |              268955 |
| hurricane_florence  |            59 |                              0      |                  0      |                     0.5605 |         0.5321 |                  0.5    |                 198 |
| hurricane_michael   |            59 |                              0.1998 |                  0.215  |                     0.5109 |         0.5357 |                  0.5986 |              139694 |
| moore_tornado       |            59 |                              0.5757 |                  0.7187 |                     0.6353 |         0.752  |                  0.6744 |              203848 |
| portugal_wildfire   |            59 |                              0.3796 |                  0.4035 |                     0.548  |         0.5516 |                  0.5092 |               28346 |
| hurricane_harvey    |            58 |                              0.0095 |                  0.0195 |                     0.5108 |         0.571  |                  0.3697 |              100583 |
| hurricane_matthew   |            58 |                              0.1892 |                  0.2707 |                     0.4238 |         0.4183 |                  0.4394 |               99137 |
| libya_flood         |            58 |                              0.1175 |                  0.2876 |                     0.398  |         0.542  |                  0.2495 |              685193 |
| midwest_flooding    |            58 |                              0.0254 |                  0.067  |                     0.4218 |         0.4564 |                  0.5516 |               11426 |
| tuscaloosa_tornado  |            56 |                              0.2926 |                  0.5132 |                     0.5514 |         0.67   |                  0.4436 |              206146 |
| lower_puna_volcano  |            55 |                              0.6244 |                  0.4373 |                     0.5911 |         0.5147 |                  0.8009 |               92442 |
| pinery_bushfire     |            51 |                              0.2949 |                  0.2789 |                     0.522  |         0.53   |                  0.5071 |               20933 |
| noto_earthquake     |            44 |                              0.0395 |                  0      |                     0.3482 |         0.2875 |                  0.2392 |              489113 |
| sunda_tsunami       |            40 |                              0.0485 |                  0.1602 |                     0.3159 |         0.4396 |                  0.2487 |               49494 |
| hawaii_wildfire     |            30 |                              0.1441 |                  0.2212 |                     0.2932 |         0.2981 |                  0.1804 |             1161052 |
| socal_fire          |            30 |                              0.5092 |                  0.48   |                     0.5543 |         0.5496 |                  0.6105 |               24837 |
| guatemala_volcano   |            26 |                              0.0398 |                  0.0002 |                     0.4772 |         0.5029 |                  0.3272 |               15141 |
| woolsey_fire        |            17 |                              0.5911 |                  0.6484 |                     0.5402 |         0.5542 |                  0.657  |               22753 |
| kalehe_flooding     |            15 |                              0.0507 |                  0.0096 |                     0.268  |         0.2606 |                  0.1063 |               26303 |
| shovi_landslide     |            11 |                              0.2088 |                  0.2497 |                     0.4154 |         0.416  |                  0.6262 |                 506 |
| bata_explosion      |             4 |                              0.2275 |                  0.1832 |                     0.4016 |         0.3803 |                  0.3379 |               71799 |

## The graders on the true buildings (clean pairs)

Macro F1: {42: 0.6979, 43: 0.683, 44: 0.686}. On validation: 0.7367, 0.7303, 0.754.

|   seed | grade     |   buildings |   precision |   recall |     f1 |   graded_intact |   graded_damaged |   graded_destroyed |   graded_none |
|-------:|:----------|------------:|------------:|---------:|-------:|----------------:|-----------------:|-------------------:|--------------:|
|     42 | Intact    |      111126 |      0.9405 |   0.831  | 0.8824 |           92346 |             6927 |               1361 |         10492 |
|     42 | Damaged   |       13081 |      0.4636 |   0.5118 | 0.4865 |            4694 |             6695 |                706 |           986 |
|     42 | Destroyed |       10306 |      0.7729 |   0.6825 | 0.7249 |            1149 |              818 |               7034 |          1305 |
|     43 | Intact    |      111126 |      0.9504 |   0.8228 | 0.882  |           91436 |            12405 |                919 |          6366 |
|     43 | Damaged   |       13081 |      0.3731 |   0.635  | 0.4701 |            3710 |             8307 |                573 |           491 |
|     43 | Destroyed |       10306 |      0.8088 |   0.6123 | 0.6969 |            1061 |             1550 |               6310 |          1385 |
|     44 | Intact    |      111126 |      0.9413 |   0.8778 | 0.9085 |           97547 |             7325 |               3401 |          2853 |
|     44 | Damaged   |       13081 |      0.4556 |   0.5152 | 0.4836 |            4690 |             6739 |               1339 |           313 |
|     44 | Destroyed |       10306 |      0.6131 |   0.7287 | 0.6659 |            1391 |              726 |               7510 |           679 |

## Counting

3,580 of 3,583 optical counting questions could be asked: the others are on the two pairs with an unreadable image. Each method counts 8-connected blobs of at least 20 px and picks the nearest option.

| method        |   all_% |   e5_clean_% |   intact_% |   damaged_% |   destroyed_% |   largest_above_20_% |   largest_up_to_20_% |   mean_abs_error |   median_abs_error |   median_error_% |   within_20%_% |
|:--------------|--------:|-------------:|-----------:|------------:|--------------:|---------------------:|---------------------:|-----------------:|-------------------:|-----------------:|---------------:|
| chain_s42     |   32.88 |        32.7  |      31.2  |       32.07 |         38.27 |                23.54 |                40.25 |            13.58 |                  4 |             40   |           30.7 |
| chain_s43     |   30.95 |        30.85 |      28.65 |       31.55 |         36.08 |                21.71 |                38.25 |            14.07 |                  5 |             41.9 |           30.3 |
| chain_s44     |   34.16 |        33.95 |      32.96 |       32.79 |         39.09 |                25.76 |                40.8  |            13.08 |                  4 |             36.7 |           33.3 |
| R11           |   33.02 |        32.53 |      29.29 |       35.46 |         39.37 |                22.22 |                41.55 |            13.34 |                  4 |             38   |           32.3 |
| no_image_rule |   66.98 |        67.27 |      77.74 |       54.88 |         55.42 |               100    |                40.9  |           nan    |                nan |            nan   |          nan   |
| always_middle |   53.97 |        54.41 |      73.96 |       31.24 |         32.78 |               100    |                17.6  |           nan    |                nan |            nan   |          nan   |

- **Read accuracy with care.** `no_image_rule` and `always_middle` never see the image. When a question's largest option is above 20, the options are built around the correct count, so the middle value is always right. Accuracy on these options, and the 34.2% bar, can't show that a method counts well.
- **Count error** is against each question's true count: `median_error_%` is the median of the error as a share of the truth, and `within_20%_%` the share of counts within 20% of it.
- Which count is closer to the truth, question by question: {'chain_closer': 1406, 'same': 730, 'r11_closer': 1444}.

Seed 42's table against R11's on the same questions (exact McNemar):

- E5's clean questions: {'only_chain_right': 502, 'only_R11_right': 496, 'p': 0.8743}
- all optical questions: {'only_chain_right': 508, 'only_R11_right': 513, 'p': 0.9004}

R11's table reproduces H2's 32.96% and E5's 32.47%: **yes** (33.02%, 32.53%).

## Against the expectation, fixed before the run

- chain lower on test than on clean validation (0.3065): **NO**
- R11 lower on test than on clean validation (0.2692): **NO**
- counting about level with R11's (p of at least 0.05): **yes**

## Safety checks on validation images

| image                                         |   sam_iou |   logp_max_difference |   r11_px_share_different |
|:----------------------------------------------|----------:|----------------------:|-------------------------:|
| bata_explosion_post_14.png                    |    1      |                0.0078 |                   0      |
| hurricane_florence_00000443_post_disaster.png |    0.9999 |                0.0043 |                   0.0001 |
| hurricane_harvey_00000451_post_disaster.png   |    0.9986 |                0.0101 |                   0.0001 |
| hurricane_michael_00000407_post_disaster.png  |    0.9999 |                0.0117 |                   0      |
| midwest_flooding_00000287_post_disaster.png   |    0.9997 |                0.0041 |                   0      |
| nepal_flooding_00000339_post_disaster.png     |    1      |                0.0048 |                   0      |
| pinery_bushfire_00001507_post_disaster.png    |    0.9995 |                0.0047 |                   0.0005 |
| portugal_wildfire_00000758_post_disaster.png  |    0.9999 |                0.0077 |                   0      |
| portugal_wildfire_00001764_post_disaster.png  |    0.9997 |                0.0046 |                   0      |
| socal_fire_00000614_post_disaster.png         |    0.9998 |                0.0098 |                   0      |
| turkey_earthquake1_post_481.png               |    0.9998 |                0.0077 |                   0      |
| tuscaloosa_tornado_00000026_post_disaster.png |    1      |                0.0108 |                   0      |

## Files

- `map_scores.csv`, `map_scores_by_event.csv`, `grader_true_buildings.csv`, `counting_scores.csv`, `per_question.csv`, `safety_checks.csv`, `config.json`
- `instances_test.csv`: each found building, its three graders' log-probabilities, R11's pixels and, on clean pairs, the true pixels
- `buildings_chain_s42.sqlite`: the table, in H2's columns
- `chain_s42_maps.zip`, `r11_tta_maps.zip`, `sam3_pre_grid2.zip`: for step 3 (hot spots, on the PC)
