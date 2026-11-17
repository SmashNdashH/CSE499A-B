# T3 gallery export

Run on 2026-11-17. Notebook: `Essential_task_delegation/Champion_Task/t3-gallery-export.ipynb`. The rule that chose the pairs, and
why, is in the notebook's first cell.

## The pairs

| Pair | Type | Destroyed IoU, before-after U-Net | Destroyed IoU, find-then-grade | U-Net background / intact / damaged IoU | Buildings (U-Net / find-then-grade) |
|---|---|---|---|---|---|
| hurricane_harvey_00000472 | hurricane | 0.0000 | 0.0000 | 0.9562 / – / 0.6615 | 52 / 78 |
| santa_rosa_wildfire_00000058 (Home) | wildfire | 0.7517 | 0.7619 | 0.9006 / 0.7950 / 0.0000 | 144 / 245 |
| moore_tornado_00000120 | tornado | 0.6592 | 0.5311 | 0.9928 / 0.0000 / 0.4001 | 21 / 20 |
| palu_tsunami_00000122 | tsunami | 0.2769 | 0.3142 | 0.8927 / 0.6914 / 0.0000 | 107 / 106 |
| midwest_flooding_00000287 | flood | 0.0000 | 0.0000 | 0.9716 / – / 0.0000 | 8 / 2 |
| turkey_earthquake0_post_380 | earthquake | 0.0000 | 0.4596 | 0.8511 / 0.6495 / – | 42 / 34 |

IoU: the overlap between a map's pixels of a class and the true pixels of it, 0 to 1; "–" where the class is in
neither. Buildings: the table's rows, 8-connected regions of one class of at least 20 px.

## Checks

| Pair | Check | Result | |
|---|---|---|---|
| hurricane_harvey_00000472_post_disaster.png | 1. truth = E1's saved truth (pixels per class) | [924432, 0, 109775, 14369] against [924432, 0, 109775, 14369] | pass |
| hurricane_harvey_00000472_post_disaster.png | 2. truth under the outlines = R16c step 5's | 0 of 103,939 px differ | pass |
| santa_rosa_wildfire_00000058_post_disaster.png | 1. truth = E1's saved truth (pixels per class) | [744246, 233505, 0, 70825] against [744246, 233505, 0, 70825] | pass |
| santa_rosa_wildfire_00000058_post_disaster.png | 2. truth under the outlines = R16c step 5's | 0 of 293,545 px differ | pass |
| moore_tornado_00000120_post_disaster.png | 1. truth = E1's saved truth (pixels per class) | [1014876, 0, 8295, 25405] against [1014876, 0, 8295, 25405] | pass |
| moore_tornado_00000120_post_disaster.png | 2. truth under the outlines = R16c step 5's | 0 of 37,114 px differ | pass |
| palu_tsunami_00000122_post_disaster.png | 1. truth = E1's saved truth (pixels per class) | [781314, 253942, 1123, 12197] against [781314, 253942, 1123, 12197] | pass |
| palu_tsunami_00000122_post_disaster.png | 2. truth under the outlines = R16c step 5's | 0 of 224,471 px differ | pass |
| midwest_flooding_00000287_post_disaster.png | 1. truth = E1's saved truth (pixels per class) | [995127, 0, 0, 53449] against [995127, 0, 0, 53449] | pass |
| midwest_flooding_00000287_post_disaster.png | 2. truth under the outlines = R16c step 5's | 0 of 3,747 px differ | pass |
| turkey_earthquake0_post_380.png | 1. truth = E1's saved truth (pixels per class) | [696943, 320493, 0, 31140] against [696943, 320493, 0, 31140] | pass |
| turkey_earthquake0_post_380.png | 2. truth under the outlines = R16c step 5's | 0 of 291,620 px differ | pass |
| hurricane_harvey_00000472_post_disaster.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.9562, None, 0.6615, 0.0] against [0.9562, None, 0.6616, 0.0] | pass |
| hurricane_harvey_00000472_post_disaster.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0000 differ | pass |
| hurricane_harvey_00000472_post_disaster.png | 4. find-then-grade's IoU per class = the PC's | [0.9546, 0.0, 0.5871, 0.0] against [0.9546, 0.0, 0.5871, 0.0] | pass |
| santa_rosa_wildfire_00000058_post_disaster.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.9006, 0.795, 0.0, 0.7517] against [0.9006, 0.795, 0.0, 0.7517] | pass |
| santa_rosa_wildfire_00000058_post_disaster.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0000 differ | pass |
| santa_rosa_wildfire_00000058_post_disaster.png | 4. find-then-grade's IoU per class = the PC's | [0.9234, 0.8246, 0.0, 0.7619] against [0.9234, 0.8246, 0.0, 0.7619] | pass |
| moore_tornado_00000120_post_disaster.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.9928, 0.0, 0.4001, 0.6592] against [0.9928, 0.0, 0.4001, 0.6592] | pass |
| moore_tornado_00000120_post_disaster.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0002 differ | pass |
| moore_tornado_00000120_post_disaster.png | 4. find-then-grade's IoU per class = the PC's | [0.9889, 0.0, 0.366, 0.5311] against [0.9889, 0.0, 0.366, 0.5311] | pass |
| palu_tsunami_00000122_post_disaster.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.8927, 0.6914, 0.0, 0.2769] against [0.8927, 0.6914, 0.0, 0.2769] | pass |
| palu_tsunami_00000122_post_disaster.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0002 differ | pass |
| palu_tsunami_00000122_post_disaster.png | 4. find-then-grade's IoU per class = the PC's | [0.9077, 0.6992, 0.0888, 0.3142] against [0.9077, 0.6992, 0.0888, 0.3142] | pass |
| midwest_flooding_00000287_post_disaster.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.9716, None, 0.0, 0.0] against [0.9716, None, 0.0, 0.0] | pass |
| midwest_flooding_00000287_post_disaster.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0000 differ | pass |
| midwest_flooding_00000287_post_disaster.png | 4. find-then-grade's IoU per class = the PC's | [0.9496, None, 0.0, 0.0] against [0.9496, None, 0.0, 0.0] | pass |
| turkey_earthquake0_post_380.png | 3a. R11's IoU per class = E5 step 2's (within 0.002) | [0.8511, 0.6495, None, 0.0] against [0.8511, 0.6495, None, 0.0] | pass |
| turkey_earthquake0_post_380.png | 3b. R11's pixels under the outlines = R16c step 5's (within 2%) | 0.0001 differ | pass |
| turkey_earthquake0_post_380.png | 4. find-then-grade's IoU per class = the PC's | [0.8536, 0.699, None, 0.4596] against [0.8536, 0.699, None, 0.4596] | pass |

## Files

- `gallery/<pair>/`: one folder per pair, as in `Essential_task_delegation/T3_Website/DATA_CONTRACT.md`.
- `t3_gallery.zip`: the same folders, to unzip into `T3_Website/public/data/`.
- `README.md` (this file) and `config.json`: the settings, the pairs, the checks and the versions.

## Using it

1. Unzip `t3_gallery.zip` into `Essential_task_delegation/T3_Website/public/data/`, so that
   `public/data/santa_rosa_wildfire_00000058/pair.json` exists.
2. In `T3_Website/`: `npm run validate` (the website's full check), then `npm run build`.
