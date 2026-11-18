# Layer 3 step 0: the pairs and the checks

**Result: all seven checks passed.**
- The 6,443 pairs and the D4 split are rebuilt exactly: 5,798 training and 645 validation pairs, 605 of them clean.
- Photos were compared by content, in all four combinations of before- and after-photos. The only validation photos that are also training photos are the before-photos of E5's 40 leaked pairs.
- Nothing new leaks.

Every later Layer 3 step reads [`pairs.csv`](pairs.csv).

## What and why

Every later Layer 3 step reads one file, [`pairs.csv`](pairs.csv), so the training and validation pairs can't drift between steps.

**The notebook** rebuilds the 6,443 pairs and the D4 split exactly as every D4 run did. It copies two things from R11:
- its Cell 4, word for word except the mask folder;
- its split line.

**Then it checks by image content** that no validation photo is also a training photo:
- it hashes the decoded pixels with E5 step 1's code;
- it compares all four combinations of before- and after-photos. E5 step 1 checked two of them.

A leak matters even more here than for a damage model. A generator trained to output before-photos could simply remember a validation pair's before-photo.

## How

- **Notebook:** [`layer3-step0-pairs-and-checks.ipynb`](../../layer3-step0-pairs-and-checks.ipynb), saved with the full run's outputs. Its code is the tested file's, except `SMOKE_TEST = False`.
- **Where:** Kaggle, Ridita's own account. CPU only (accelerator None, so no GPU hours), internet off. Input: `abrarmohammedtanzim/disasterm3-mirror`.
- **Smoke test** (`SMOKE_TEST = True`), from [`smoke-test/summary.json`](smoke-test/summary.json):
  - it fingerprinted the 3,426 photos of 1,713 pairs: the 645 validation pairs, the socal_fire and woolsey_fire training pairs, and 200 random training pairs;
  - all seven checks passed, in 19.1 min;
  - Abrar then said go.
- **Full run** (`SMOKE_TEST = False`): all 12,886 photos of the 6,443 pairs. It took 31.3 min in all, 7.8 of them fingerprinting ([`summary.json`](summary.json)).
- **Versions:** Python 3.13.18, NumPy 2.1.3, OpenCV 4.14.0, pandas 2.3.3, scikit-learn 1.6.1 ([`summary.json`](summary.json)).
- **Seed 42:** the split's `random_state=42`, and the smoke test's sample.
- **Before Kaggle,** the same notebook ran on Ridita's PC, on a local copy of the same dataset. Only the paths changed, in a test copy.
  - It gave the same numbers.
  - The Kaggle `pairs.csv` and `leak_check.csv` have the same content as the PC's. Only their line endings differ.

## Expected before the run

Copied from the notebook's first cell, fixed on 18 Nov:

> **Expected, fixed before the run (18 Nov)**
> - A check on the PC on 18 Nov used the pixel hashes that E5 step 1 saved (`Champion_Task/E5-results/step1/fingerprints_instruct.csv`). It found:
>   - 5,798 training and 645 validation pairs (560 xBD);
>   - exactly E5's 40 leaked pairs, all of them "validation before-photo = training before-photo", holding 155,812 destroyed pixels;
>   - no match in the two combinations E5 didn't check;
>   - no pair whose before- and after-photo are the same picture;
>   - 605 clean pairs: 520 from xBD and 85 others, 64 of them from Turkey.
> - So this run should pass all seven checks with these numbers.
> - **Near copies** are listed, never counted. E5's rule: dHash within 6 of 64 bits, and 32 × 32 grey thumbnails correlating at 0.95 or more.
>   - Among before-photos, E5 found 0 near copies and 3 matches for review.
>   - For the other combinations, no number is predicted. The after-photos of the 40 leaked pairs should be among them: E5 found that they look alike (median correlation 0.97).

## Result, against that expectation

| Expected | Found | From |
|---|---|---|
| 5,798 training and 645 validation pairs (560 xBD) | 5,798 and 645 (560 xBD) | [`summary.json`](summary.json): `train`, `val`, `val_xbd` |
| Exactly E5's 40 leaked pairs, all "validation before-photo = training before-photo" | 40 of 40, all of them before = before; no other pair | [`summary.json`](summary.json): `leaks`; [`leak_check.csv`](leak_check.csv): the 40 rows `same pixels` |
| 155,812 destroyed pixels in them | 155,812 | [`summary.json`](summary.json): `leaks.destroyed_px` |
| No match in the two combinations E5 didn't check | 0 and 0 | [`summary.json`](summary.json): `leaks.by_combination` |
| No pair whose before- and after-photo are the same picture | 0 | [`summary.json`](summary.json): `same_picture_within_a_pair` |
| 605 clean pairs: 520 xBD, 85 others, 64 from Turkey | 605: 520, 85 and 64 | [`summary.json`](summary.json): `clean`, `clean_by_source`, `clean_turkey` |
| All seven checks pass | All seven passed | [`summary.json`](summary.json): `checks` |
| Before-photos: 0 near copies and 3 matches for review (E5) | 0 near copies. E5's 3 review matches appear again (see below) | [`leak_check.csv`](leak_check.csv), against E5's [`val_train_leaks_hash.csv`](../../../Champion_Task/E5-results/step1/val_train_leaks_hash.csv) |
| The after-photos of the 40 leaked pairs are among the near copies | 22 are near copies of a training after-photo; 16 more are listed for review; 2 aren't listed. All 23 near copies (on 22 pairs) belong to E5's 40 | [`leak_check.csv`](leak_check.csv); [`summary.json`](summary.json): `near_copies` |

**E5's 3 review matches:**
- 2 appear again as a before-photo against a training before-photo.
- `portugal_wildfire_00000557`'s appears against the same training pair's after-photo instead, because that match is closer. Each validation photo lists only its closest training match.

**Also listed, never counted: 28 matches for review.**
- 22 are on E5's 40 pairs.
- 6 are on 5 clean pairs: `hurricane_matthew_00000315`, `portugal_wildfire_00000110`, `portugal_wildfire_00000557`, `portugal_wildfire_00001500` and `socal_fire_00000970` (two rows). Three of them are E5's 3.
- Their correlations, 0.87 to 0.93, are below the near-copy threshold of 0.95: they are look-alike scenes, not copies.

## Checks

| Check | Result |
|---|---|
| 1. 6,443 pairs, each with a before-photo | passed |
| 2. 5,798 training and 645 validation pairs (560 xBD) | passed |
| 3. 1,808,111 destroyed pixels in the validation masks | passed |
| 4. E5's 40 leaked pairs found again | passed |
| 5. Nothing new leaks | passed |
| 6. 605 clean validation pairs | passed |
| 7. Every photo and every mask can be read | passed: 0 of 12,886 photos unreadable, 0 of 6,443 masks bad |

From [`summary.json`](summary.json) (`checks`) and the printout of the notebook's last cell.

## Problems and anything surprising

**The first Kaggle smoke test stopped in Cell 1** with `SyntaxError: invalid syntax` at line 61.
- In the Kaggle copy, the `assert` line after E5's 40 names had moved three lines up, into the list.
- The file itself was fine: moving that one line up three places on the PC gives exactly that error.
- The notebook was imported again, unchanged, and then passed.

**The runs took longer than planned:**
- the smoke test took 19.1 min (planned: about 10), and the full run 31.3 min (planned: about 20);
- fingerprinting took only 1.6 and 7.8 min of that;
- the full run's Cell 2, R11's Cell 4, took 22.3 min (the notebook's recorded cell times). It reads up to three masks per pair from the dataset and writes 6,443 masks.

On the PC that cell runs in a small fraction of this time, so Kaggle's dataset mount is slow for many small files. E5 step 2 has the same cell, so each step 1 run will take about 20 minutes longer than its GPU work.

**Some photos repeat inside one split.** These are not leaks, because they don't cross the split. All come from the pixel hashes in [`pairs.csv`](pairs.csv):
- **Training before-photos:** 208 are each shared by two training pairs, one socal_fire and one woolsey_fire. So the 5,798 training pairs hold 5,590 different before-photos.
  - These are the same xBD twins behind E5's 40 leaks.
  - A generator in step 2 will see these 208 before-photos twice per epoch.
- **Training after-photos:** `pinery_bushfire_00000311` and `pinery_bushfire_00001004` have the same after-photo pixels, but different before-photos and masks.
- **Validation before-photos:** two are each shared by two clean validation pairs:
  - `woolsey_fire_00000265` with `socal_fire_00000824`;
  - `socal_fire_00000620` with `woolsey_fire_00000754`.

## Next

Step 1, the baselines. Abrar has approved its smoke test once this README and `pairs.csv` are saved.

The notebook, `layer3-step1-baselines.ipynb`, is written. It was tested on the PC in two ways:
- with a stand-in model: every cell ran;
- with E5 step 2's saved counts in place of the GPU runs: it reproduced E5's numbers exactly and gave the bar 0.5604.

Its gray picture is (R, G, B) = (86, 91, 69): the mean colour of the 5,798 training before-photos, as Abrar defined it.

## Files

- [`pairs.csv`](pairs.csv): one row per pair (6,443), in the D4 order. The notebook's first cell describes the columns. Every later step reads this file.
- [`leak_check.csv`](leak_check.csv): 91 rows:
  - 40 counted (`same pixels`), 23 near copies and 28 for review;
  - each with its combination, and whether the pair is one of E5's 40.
- [`summary.json`](summary.json): the counts, the checks, the library versions and the run time.
- [`smoke-test/summary.json`](smoke-test/summary.json): the smoke test's summary.
