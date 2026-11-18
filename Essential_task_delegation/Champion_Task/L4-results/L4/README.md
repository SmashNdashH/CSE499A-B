# L4 results: EfficientSAM3 vs SAM 3 building finding

Repo `SimonZeng7108/efficientsam3@bd0936c`, weights `Simon7108528/EfficientSAM3@85b05896`, prompt `'building'`, confidence 0.5, 645 validation pairs (605 clean).

## Part 1: model size, T4 precision check, and T4 vs CPU latency

| student        |   params_m |   file_mb |   ckpt_coverage | precision   |   t4_ms_grid1 |   t4_ms_grid2 |   peak_gpu_gb |   probe_instances_grid1 |   iou_vs_fp32 |   cpu_ms_grid1 |   cpu_ms_grid2 |
|:---------------|-----------:|----------:|----------------:|:------------|--------------:|--------------:|--------------:|------------------------:|--------------:|---------------:|---------------:|
| EV-M           |      97.44 |     468.4 |               1 | fp32        |         319.9 |        1269   |          1.45 |                       0 |        1      |         5112.3 |        20481.3 |
| EV-M           |      97.44 |     468.4 |               1 | fp16        |         144.7 |         588.8 |          1.15 |                       0 |        1      |         5112.3 |        20481.3 |
| RV-M           |     100.83 |     482.3 |               1 | fp32        |         359.5 |        1438.8 |          1.46 |                       0 |        1      |         5396.8 |        21704.7 |
| RV-M           |     100.83 |     482.3 |               1 | fp16        |         155.9 |         634.4 |          1.17 |                       0 |        1      |         5396.8 |        21704.7 |
| TV-M           |     103.53 |     492.8 |               1 | fp32        |         402.3 |        1604.1 |          1.49 |                       0 |        1      |         6273.6 |        24841.5 |
| TV-M           |     103.53 |     492.8 |               1 | fp16        |         176.9 |         712.6 |          1.19 |                       0 |        1      |         6273.6 |        24841.5 |
| SAM 3 (E3 ref) |     841    |    3450   |             nan | fp16        |         540   |        2110   |          4.07 |                      11 |        0.9998 |          nan   |          nan   |

## Part 2: building finding on the 605 clean validation pairs (source = all)

| model          | run       | split     | source   |   images |   building_iou |   count_ratio |   count_mae |   recall_intact |   recall_damaged |   recall_destroyed |   sec_per_image |
|:---------------|:----------|:----------|:---------|---------:|---------------:|--------------:|------------:|----------------:|-----------------:|-------------------:|----------------:|
| EV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0136 |         0.002 |        40.4 |          0.015  |           0.0052 |             0.0146 |            0.16 |
| EV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0103 |         0.004 |        40.3 |          0.009  |           0.0209 |             0.0067 |            0.65 |
| RV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0297 |         0.004 |        40.3 |          0.031  |           0.03   |             0.0127 |            0.17 |
| RV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0173 |         0.007 |        40.2 |          0.0163 |           0.0286 |             0.0103 |            0.67 |
| TV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0215 |         0.004 |        40.3 |          0.0195 |           0.0382 |             0.0154 |            0.18 |
| TV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0541 |         0.027 |        39.4 |          0.0516 |           0.0855 |             0.0415 |            0.73 |
| SAM 3 (E3)     | pre_grid1 | clean_605 | all      |      605 |         0.4821 |         0.573 |        19   |          0.5132 |           0.5484 |             0.4785 |            0.54 |
| SAM 3 (E3)     | pre_grid2 | clean_605 | all      |      605 |         0.6302 |         1.069 |        11.4 |          0.6788 |           0.7291 |             0.6272 |            2.11 |
| R9_tta (E1/E5) | post_tta  | clean_605 | all      |      605 |         0.5905 |       nan     |       nan   |        nan      |         nan      |           nan      |          nan    |

## Full breakdown (all 645 and clean 605, by source)

| model          | run       | split     | source   |   images |   building_iou |   count_ratio |   count_mae |   recall_intact |   recall_damaged |   recall_destroyed |   sec_per_image |
|:---------------|:----------|:----------|:---------|---------:|---------------:|--------------:|------------:|----------------:|-----------------:|-------------------:|----------------:|
| EV-M           | pre_grid1 | all_645   | all      |      645 |         0.0135 |         0.002 |        39   |          0.0149 |           0.0052 |             0.0138 |            0.16 |
| EV-M           | pre_grid1 | all_645   | other    |       85 |         0.0006 |         0     |        60.1 |          0.0007 |           0      |             0      |            0.16 |
| EV-M           | pre_grid1 | all_645   | xBD      |      560 |         0.0246 |         0.002 |        35.8 |          0.0301 |           0.0063 |             0.0242 |            0.16 |
| EV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0136 |         0.002 |        40.4 |          0.015  |           0.0052 |             0.0146 |            0.16 |
| EV-M           | pre_grid1 | clean_605 | other    |       85 |         0.0006 |         0     |        60.1 |          0.0007 |           0      |             0      |            0.16 |
| EV-M           | pre_grid1 | clean_605 | xBD      |      520 |         0.0251 |         0.002 |        37.2 |          0.0307 |           0.0063 |             0.0276 |            0.16 |
| EV-M           | pre_grid2 | all_645   | all      |      645 |         0.0104 |         0.004 |        38.9 |          0.0092 |           0.0208 |             0.0068 |            0.65 |
| EV-M           | pre_grid2 | all_645   | other    |       85 |         0.0001 |         0     |        60.1 |          0.0001 |           0      |             0      |            0.65 |
| EV-M           | pre_grid2 | all_645   | xBD      |      560 |         0.0194 |         0.005 |        35.7 |          0.0189 |           0.0252 |             0.012  |            0.65 |
| EV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0103 |         0.004 |        40.3 |          0.009  |           0.0209 |             0.0067 |            0.65 |
| EV-M           | pre_grid2 | clean_605 | other    |       85 |         0.0001 |         0     |        60.1 |          0.0001 |           0      |             0      |            0.65 |
| EV-M           | pre_grid2 | clean_605 | xBD      |      520 |         0.0194 |         0.005 |        37.1 |          0.0188 |           0.0252 |             0.0127 |            0.65 |
| RV-M           | pre_grid1 | all_645   | all      |      645 |         0.0295 |         0.004 |        38.9 |          0.0307 |           0.0299 |             0.0144 |            0.17 |
| RV-M           | pre_grid1 | all_645   | other    |       85 |         0.023  |         0.003 |        59.9 |          0.0239 |           0.0302 |             0      |            0.16 |
| RV-M           | pre_grid1 | all_645   | xBD      |      560 |         0.0352 |         0.004 |        35.7 |          0.038  |           0.0299 |             0.0253 |            0.17 |
| RV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0297 |         0.004 |        40.3 |          0.031  |           0.03   |             0.0127 |            0.17 |
| RV-M           | pre_grid1 | clean_605 | other    |       85 |         0.023  |         0.003 |        59.9 |          0.0239 |           0.0302 |             0      |            0.16 |
| RV-M           | pre_grid1 | clean_605 | xBD      |      520 |         0.0358 |         0.004 |        37.1 |          0.0388 |           0.03   |             0.0241 |            0.17 |
| RV-M           | pre_grid2 | all_645   | all      |      645 |         0.0172 |         0.007 |        38.8 |          0.0161 |           0.0285 |             0.0127 |            0.67 |
| RV-M           | pre_grid2 | all_645   | other    |       85 |         0.0066 |         0.001 |        60.1 |          0.0073 |           0      |             0      |            0.67 |
| RV-M           | pre_grid2 | all_645   | xBD      |      560 |         0.0266 |         0.008 |        35.6 |          0.0256 |           0.0345 |             0.0223 |            0.67 |
| RV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0173 |         0.007 |        40.2 |          0.0163 |           0.0286 |             0.0103 |            0.67 |
| RV-M           | pre_grid2 | clean_605 | other    |       85 |         0.0066 |         0.001 |        60.1 |          0.0073 |           0      |             0      |            0.67 |
| RV-M           | pre_grid2 | clean_605 | xBD      |      520 |         0.027  |         0.008 |        37   |          0.0261 |           0.0346 |             0.0195 |            0.67 |
| TV-M           | pre_grid1 | all_645   | all      |      645 |         0.0217 |         0.004 |        38.9 |          0.0196 |           0.0381 |             0.0181 |            0.18 |
| TV-M           | pre_grid1 | all_645   | other    |       85 |         0.0087 |         0.003 |        59.9 |          0.0079 |           0.0318 |             0      |            0.18 |
| TV-M           | pre_grid1 | all_645   | xBD      |      560 |         0.0331 |         0.005 |        35.7 |          0.032  |           0.0394 |             0.0318 |            0.18 |
| TV-M           | pre_grid1 | clean_605 | all      |      605 |         0.0215 |         0.004 |        40.3 |          0.0195 |           0.0382 |             0.0154 |            0.18 |
| TV-M           | pre_grid1 | clean_605 | other    |       85 |         0.0087 |         0.003 |        59.9 |          0.0079 |           0.0318 |             0      |            0.18 |
| TV-M           | pre_grid1 | clean_605 | xBD      |      520 |         0.0332 |         0.004 |        37.1 |          0.0321 |           0.0395 |             0.0291 |            0.18 |
| TV-M           | pre_grid2 | all_645   | all      |      645 |         0.0546 |         0.028 |        38   |          0.0522 |           0.0852 |             0.0459 |            0.73 |
| TV-M           | pre_grid2 | all_645   | other    |       85 |         0.0237 |         0.007 |        59.7 |          0.0245 |           0.035  |             0      |            0.73 |
| TV-M           | pre_grid2 | all_645   | xBD      |      560 |         0.0817 |         0.033 |        34.7 |          0.0819 |           0.0958 |             0.0806 |            0.73 |
| TV-M           | pre_grid2 | clean_605 | all      |      605 |         0.0541 |         0.027 |        39.4 |          0.0516 |           0.0855 |             0.0415 |            0.73 |
| TV-M           | pre_grid2 | clean_605 | other    |       85 |         0.0237 |         0.007 |        59.7 |          0.0245 |           0.035  |             0      |            0.73 |
| TV-M           | pre_grid2 | clean_605 | xBD      |      520 |         0.0814 |         0.033 |        36   |          0.0814 |           0.0961 |             0.0786 |            0.73 |
| SAM 3 (E3)     | pre_grid1 | all_645   | all      |      645 |         0.4841 |         0.576 |        18.2 |          0.5163 |           0.5483 |             0.4931 |            0.54 |
| SAM 3 (E3)     | pre_grid1 | all_645   | other    |       85 |         0.4633 |         0.587 |        29.5 |          0.4769 |           0.5987 |             0.5507 |            0.56 |
| SAM 3 (E3)     | pre_grid1 | all_645   | xBD      |      560 |         0.5018 |         0.574 |        16.5 |          0.5584 |           0.5377 |             0.4495 |            0.54 |
| SAM 3 (E3)     | pre_grid1 | clean_605 | all      |      605 |         0.4821 |         0.573 |        19   |          0.5132 |           0.5484 |             0.4785 |            0.54 |
| SAM 3 (E3)     | pre_grid1 | clean_605 | other    |       85 |         0.4633 |         0.587 |        29.5 |          0.4769 |           0.5987 |             0.5507 |            0.56 |
| SAM 3 (E3)     | pre_grid1 | clean_605 | xBD      |      520 |         0.4984 |         0.569 |        17.3 |          0.5529 |           0.5378 |             0.414  |            0.54 |
| SAM 3 (E3)     | pre_grid2 | all_645   | all      |      645 |         0.6304 |         1.065 |        11   |          0.6796 |           0.7288 |             0.6339 |            2.11 |
| SAM 3 (E3)     | pre_grid2 | all_645   | other    |       85 |         0.6185 |         1.259 |        27.6 |          0.655  |           0.7644 |             0.6783 |            2.12 |
| SAM 3 (E3)     | pre_grid2 | all_645   | xBD      |      560 |         0.6407 |         1.016 |         8.5 |          0.7059 |           0.7214 |             0.6003 |            2.11 |
| SAM 3 (E3)     | pre_grid2 | clean_605 | all      |      605 |         0.6302 |         1.069 |        11.4 |          0.6788 |           0.7291 |             0.6272 |            2.11 |
| SAM 3 (E3)     | pre_grid2 | clean_605 | other    |       85 |         0.6185 |         1.259 |        27.6 |          0.655  |           0.7644 |             0.6783 |            2.12 |
| SAM 3 (E3)     | pre_grid2 | clean_605 | xBD      |      520 |         0.6404 |         1.019 |         8.7 |          0.7049 |           0.7217 |             0.5816 |            2.11 |
| R9_tta (E1/E5) | post_tta  | all_645   | all      |      645 |         0.5905 |         0.615 |        16.3 |          0.8469 |           0.7851 |             0.709  |          nan    |
| R9_tta (E1/E5) | post_tta  | clean_605 | all      |      605 |         0.5905 |       nan     |       nan   |        nan      |         nan      |           nan      |          nan    |

## Verdict

No EfficientSAM3 student passes L4's rule (bar >= 0.5905 on the 605 clean pairs, faster than 2.11 s/image, under 4.07 GB): the best is TV-M at pre_grid2 Building IoU 0.0541 (0.73 s/image), vs full SAM 3's 0.6302 and R9's 0.5905. Full SAM 3 stays the base-station finder and the 8-bit U-Net (L1b/L1c, 33 MB) stays the field model.

## Files

- `smoke_and_latency.csv`, `l4_per_image.csv`, `L4_summary.csv`, `config.json`, `README.md`
