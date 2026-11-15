# The gallery's data contract

This is the shape of the files the gallery export must write, so the website can show them. The export is a Kaggle notebook that runs the damage-map methods on the gallery pairs. The website reads only these files: it never guesses a missing one.

- **Checked by:** `npm run validate` (which `npm run build` runs first). It fails the build on any error, and writes `public/data/index.json`.
- **Check your export before copying it in:** `node scripts/validate-data.ts <your folder>`.
- **A working example:** `npm run fixtures` writes four pairs in this shape into `fixtures/data/`, from files already in the repository.

## 1. Folder layout

```text
public/data/
  <pair-id>/
    pair.json
    before.webp
    after.webp
    gt.png
    methods/
      <method-id>/
        source.json
        mask.png
        buildings.json
        hotspots.json
        heat_kde.png
        heat_safe.png
        heat_priority.png
        accuracy.json
        report_inputs.txt      (optional)
  index.json                   (written by the validator; don't write it)
```

- **`<pair-id>`:** lower-case letters, digits, `_` and `-` only. The fixtures use the after-image's name without its ending, for example `palu_tsunami_00000125`.
- **`<method-id>`:** one of
  - `before-after-unet`: the U-Net that reads both images, with TTA. **Required in every pair.**
  - `find-then-grade`: SAM 3's outlines graded by our grader. Add it when its run is ready. The site shows a method switch only on pairs that have two methods.
- **Every file of a method is computed from that method's `mask.png` for that pair.** That is what lets the site say the map, the table, the counts and the heatmap of a gallery pair are one chain.

## 2. Per pair

### `pair.json`

```json
{
  "event": "palu_tsunami",
  "source": "xBD",
  "split": "validation, clean",
  "image": "palu_tsunami_00000125_post_disaster.png",
  "width": 1024,
  "height": 1024,
  "hero": true
}
```

| Field | Rule |
|---|---|
| `event` | The event's name as in DisasterM3, for example `turkey_earthquake`. The site shows it with spaces. |
| `source` | `"xBD"` or `"other"`. |
| `split` | Exactly `"validation, clean"`. Pairs come from the 605 clean validation pairs: not in `Champion_Task/E5-results/step1/val_train_leaks_hash.csv` with `counted` True. |
| `image` | The after-image's file name in DisasterM3. Every row of `buildings.json` repeats it. |
| `width`, `height` | The image size in pixels. Every mask and both photos must have this size. |
| `hero` | Optional. `true` on at most one pair: the pair the Home page opens on. Without it, the first pair with both photos is used. |

A `fixture` field is not allowed here: it marks development fixtures, and the validator refuses it in `public/data/`.

### `before.webp`, `after.webp`

- The two photos as WebP, at `width` × `height`, not cropped or rotated.
- Quality 80–85 is enough (the fixtures use 82; about 100–250 KB each).

### `gt.png`

- The ground truth: one channel, 8-bit, `width` × `height`.
- Pixel values are class ids: 0 background, 1 intact, 2 damaged, 3 destroyed. No other value.
- The site colours it in the browser, so save the ids, not colours.

## 3. Per method

### `source.json`

```json
{
  "model": "A U-Net that reads the before and after images together",
  "tta": true,
  "checkpoint": "AbrarAlam/disasterm3-d4-R11@<commit>",
  "notebook": "Essential_task_delegation/Champion_Task/<the export notebook>.ipynb",
  "date": "2026-11-20"
}
```

| Field | Rule |
|---|---|
| `model` | What the model is, in plain words. The site shows this text, so no internal run names here. |
| `tta` | `true` if the mask is the average of 8 flipped and rotated views. |
| `checkpoint` | The checkpoint, as a Hugging Face repository and commit or a file name. `null` if it isn't recorded; the site then says "not recorded". For find-then-grade, name the grader's checkpoint and seed. |
| `notebook` | The export notebook's path in the repository. The site links it on GitHub. |
| `date` | The day the export ran, `YYYY-MM-DD`. |

### `mask.png`

- The method's damage map: one channel, 8-bit, `width` × `height`, class ids 0–3, as in `gt.png`.
- For find-then-grade: SAM 3's outlines filled with each outline's grade, 0 elsewhere.

### `buildings.json`

An array with one object per building. A building is an 8-connected region of one class in `mask.png` with an area of at least 20 px, as in the counting notebook (`h2-sql-counting-agent.ipynb`, Cell 5).

```json
[
  {
    "image": "palu_tsunami_00000125_post_disaster.png",
    "building_id": 1,
    "class_id": 1,
    "class_name": "intact",
    "area_px": 73,
    "centroid_x": 169.1,
    "centroid_y": 2.4,
    "bbox_x": 163,
    "bbox_y": 0,
    "bbox_w": 14,
    "bbox_h": 7,
    "dist_to_nearest_destroyed_px": 546.3,
    "outline": [[[163, 0], [177, 0], [177, 5], [170, 7], [163, 4]]]
  }
]
```

| Column | Rule |
|---|---|
| `image` | Equals `pair.json`'s `image`. |
| `building_id` | A whole number, unique within the image. |
| `class_id`, `class_name` | 1 `intact`, 2 `damaged`, 3 `destroyed`. The two must agree. |
| `area_px` | The region's pixel count, 20 or more. |
| `centroid_x`, `centroid_y` | The mean of the region's pixel coordinates, rounded to 1 decimal. x from the left edge, y from the top. |
| `bbox_x`, `bbox_y`, `bbox_w`, `bbox_h` | The bounding box in whole pixels, inside the image. |
| `dist_to_nearest_destroyed_px` | Centre to centre, to the nearest **other** destroyed building in the same image, rounded to 1 decimal. `null` when there is none. Never 0 for "none". |
| `outline` | A list of rings. Each ring is a list of `[x, y]` points in image pixels (3 or more). The first ring is the outer boundary; any others are holes. The site fills them with the even-odd rule. |

- **Making the outline in Python:** `cv2.findContours(region_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)` gives the outer boundary and the holes. Simplifying is welcome (`cv2.approxPolyDP` with an epsilon of about 1 px): a gallery image has hundreds of buildings, and the file is downloaded by every visitor.
- **The validator rebuilds the table from `mask.png`** and compares every row's class, area and bounding box. A table that wasn't made from this mask fails. Outlines are checked only for shape and for staying inside the image.
- Distances and areas are in pixels. DisasterM3 gives no ground resolution, so there is no column in metres.

### `hotspots.json`

The survivability heatmap's output for this method's mask, in the heatmap notebook's own format (`T1-results/T1-v3/hotspots.json`, one image's entry):

```json
{
  "hot_spots": [
    { "rank": 1, "point_xy": [847, 398], "area_px": 357561, "peak": 1.0, "edge_px": 176, "where": "east",
      "on_gt_destroyed": true, "on_gt_damage": true, "point_on_gt_destroyed": true, "point_on_gt_damage": true }
  ],
  "safe_areas": [
    { "rank": 1, "xy": [268, 593], "distance_px": 219, "edge_px": 268, "where": "west", "on_gt_building": false }
  ]
}
```

- Both lists must be present. Either may be empty: an image can have no hot spot.
- Required in a hot spot: `rank`, `point_xy` (inside the image), `area_px`, `where`.
- Required in a safe area: `rank`, `xy` (inside the image), `distance_px`, `where`.
- Note the two different key names for the position: `point_xy` for hot spots, `xy` for safe areas. That is the heatmap's format as it stands.
- The other fields are kept as they are. The ground-truth checks are welcome: the gallery comes from validation.

### `heat_kde.png`, `heat_safe.png`, `heat_priority.png`

- The three maps of the heatmap code: danger density, safety, and search priority.
- One channel, 8-bit, square, value × 255. The heatmap code writes them at 256 × 256; any square size works.
- The site paints `heat_priority.png` as its danger layer, saturating at 0.5 as the heatmap's own pictures do.

### `accuracy.json`

```json
{ "iou": { "background": 0.362, "intact": 0.655, "damaged": 0.197, "destroyed": 0.424 } }
```

- This image's IoU per class, `mask.png` against `gt.png`, rounded to 4 decimals or fewer.
- `null` for a class that is in neither mask (its union is empty). The site then says "not in this image". Never write 0 for that case.
- The validator recomputes all four and allows a difference of 0.0005.

### `report_inputs.txt` (optional)

- The facts text that the bridge (`Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py`, `format_disaster_facts`) makes from this method's table and hot spots.
- Add it only once the bridge's bugs are fixed (see `NOTES.md`, section 2). Until the file exists, the site shows this step as missing.
- The site shows the text word for word, under "What the report writer is given for this pair".

## 4. What the validator refuses

- A missing file, a wrong size, more than one channel in a mask, or a class id above 3.
- A pair without `methods/before-after-unet/`.
- A `split` other than `"validation, clean"`.
- A table that doesn't match its mask, or an accuracy that doesn't match the two masks.
- A distance of 0 standing for "no destroyed building", or a distance where no other destroyed building exists.
- Any `"fixture"` field in `public/data/`.
- More than one pair with `"hero": true`.

## 5. Development fixtures

- `npm run fixtures` writes `fixtures/data/` (git-ignored) from real files:
  - the ground truth and the after-image-only U-Net's masks (8-view TTA) of four clean validation pairs: `Champion_Task/E1-results/E1/gt/` and `preds/R9_tta/`;
  - the heatmaps and hot spots made from those same masks: `Champion_Task/T1-results/T1-v3/`;
  - the photos of three of them, from xBD's original files under `data/` on Abrar's PC. The Turkey pair has no photo on this PC and is shown without one.
- Every fixture carries `"fixture": true` in `pair.json` and `source.json`, and its method id is `after-only-unet`.
- **A fixture can't ship:**
  - fixtures live outside `public/`, and `npm run build` never copies them;
  - the validator refuses the fixture mark in `public/data/`;
  - `npm run build:fixtures` writes to `dist-fixtures/`, never to `dist/`, and stops if pointed at `dist/`;
  - the site shows a "Development fixtures" notice above the map whenever its index is marked as fixtures.
