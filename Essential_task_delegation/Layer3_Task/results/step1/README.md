# Layer 3 step 1: the baselines, no generator yet

**Result: all five checks passed. The bar for step 2 stays 0.5604.**
- R11 with the real before-photo and R9 reproduce E5 step 2 on the 605 clean pairs, to the 4th decimal: mIoU / destroyed IoU 0.5805 / 0.2692 and 0.5402 / 0.2874, with 8-view TTA ([`summary.json`](summary.json)).
- A before-photo that carries no information is worse than having none. R11 scores mIoU 0.4046 with the after-photo copied into its before-photo slot (`copy`), and 0.2464 with a flat gray picture (`gray`). Both are far below R9's 0.5402 ([`rule_tests.csv`](rule_tests.csv)).
- As expected, neither `copy` nor `gray` passes the rule.

Step 2's generators will be measured with this notebook, against this bar.

## What and why

Step 1 sets up the measurement before any generator exists. It runs R11 and R9 on the 645 validation pairs exactly as E5 step 2 did: full size, padded to a multiple of 32, 8-view TTA, and the same metric code. It changes one thing, `BEFORE_SOURCE`: the picture R11 reads in its before-photo slot. With the real before-photo (`real`), R11 and R9 must reproduce E5 step 2; otherwise nothing measured later can be compared with it. Two pictures without information show what R11 does when the before-photo tells it nothing:
- `copy`: the after-photo, copied into the slot;
- `gray`: a flat 1024 × 1024 picture in the mean colour of the 5,798 training before-photos, (R, G, B) = (86, 91, 69).

The rule's third test compares every generator with `copy`.

## How

- **Notebook:** [`layer3-step1-baselines.ipynb`](../../layer3-step1-baselines.ipynb), saved with the full run's outputs. Its code is the tested file's, except `SMOKE_TEST = False`. Before the full run was started, the Kaggle copy was downloaded and compared cell by cell with the tested file: that line was the only difference.
- **Where:** Kaggle, Ridita's own account. Accelerator "GPU T4 x2", of which the notebook uses one T4. Internet on, to install segmentation-models-pytorch 0.3.4 as E5 step 2 did.
- **Inputs,** from the run notebook's metadata:
  - the dataset `abrarmohammedtanzim/disasterm3-mirror` (Kaggle version 17834943);
  - the dataset `abrarmohammedtanzim/disasterm3-r11-r9-checkpoints` (Kaggle version 22331169), shared with our group;
  - the output of step 0's full run (Kaggle notebook `layer3-step0-pairs-and-checks`, version 371043607).
- **Checkpoints,** SHA-256 from [`summary.json`](summary.json) (`checkpoints`):
  - R11: `2ae816576ad25e6bd61ca9322d205524ec24cb3d63f5f15b464665d2172673c0`;
  - R9: `e1f16b716cc3c50e2d99d7d656962e1a606642ff17339ffb36a7e44d11735836`.

  E5 step 2 loaded R11 and R9 from Hugging Face. Its [`config.json`](../../../Champion_Task/E5-results/step2/config.json) records the snapshot IDs, but no SHA-256 to compare with. The reproduction below is what shows that these are the same weights.
- **Smoke test** (`SMOKE_TEST = True`): E5 step 2's first 8 validation pairs. Kaggle notebook `layer3-step1-baselines`, version 2, run on 22 Nov. From [`smoke-test/summary.json`](smoke-test/summary.json):
  - all five checks passed, in 23.6 min;
  - R11 real 0.6190 / 0.0906 and R9 0.5546 / 0.1227, the same as E5 step 2's counts for those 8 pairs (tolerance 0.005 there).
- **Full run** (`SMOKE_TEST = False`): Kaggle notebook `layer3-step1-baselines-full`, version 1, on 23 Nov 2026, 09:57 to 10:50 UTC.
  - It took 52.4 min in all (the run notebook's record), 51.9 of them from Cell 2 on ([`summary.json`](summary.json): `minutes`).
  - Cell 3, which builds the 6,443 masks, took 21.1 min, as in step 0. Cell 5 (the gray colour) took 4.3 min.
  - R11 with its three before-photo sources took 20.5 min, and R9 5.8 min ([`summary.json`](summary.json): `model_minutes`).
- **Versions,** from [`summary.json`](summary.json): Python 3.13.16, PyTorch 2.11.0+cu130, segmentation-models-pytorch 0.3.4, NumPy 2.1.3, OpenCV 4.14.0, pandas 2.3.3, scikit-learn 1.6.1.
- **Seed 42:** the split's `random_state=42`, and the 10,000 resamples of the rule's tests. E7 step 2b's resampling used seed 0.
- **Before Kaggle,** the notebook was tested on the PC in two ways:
  - with a stand-in model: every cell ran;
  - with E5 step 2's saved counts in place of the GPU runs: it reproduced E5's numbers exactly and gave the bar 0.5604.

## Expected before the run

Copied from the notebook's first cell, fixed on 18 Nov:

> **The expectation, fixed on 18 Nov before any run**
> - All five checks pass. The bar for step 2 then stays **0.5604** = 0.5402 + (0.5805 − 0.5402) / 2.
> - From E5 step 2's counts, on the 605 clean pairs with TTA:
>   - building IoU: R11 real 0.7429, R9 0.5905;
>   - building precision: R11 real 0.8347, R9 0.6687;
>   - R11 real minus R9 in mIoU: 0.0403. Over 10,000 resamples of the pairs (seed 42), the middle 95% runs from 0.0154 to 0.0632.
> - `copy` and `gray` have no earlier numbers.
>   - We expect both below R11 real, because they carry no before-photo information.
>   - They are probably below R9 too, because R11 never saw such a before-photo in training.
>   - Neither should pass the rule. If one does, that's a surprise to report.

## Result, against that expectation

| Expected | Found | From |
|---|---|---|
| All five checks pass | All five passed | [`summary.json`](summary.json): `checks` |
| The bar for step 2 stays 0.5604 | 0.5604. Our own numbers give 0.560378, which rounds to the same | [`summary.json`](summary.json): `bar`, `own_bar` |
| Building IoU: R11 real 0.7429, R9 0.5905 | 0.7429 and 0.5905 | [`scores.csv`](scores.csv): mode `tta`, pairs `clean`, group `all` |
| Building precision: R11 real 0.8347, R9 0.6687 | 0.8347 and 0.6686 (see "Problems" below) | [`scores.csv`](scores.csv): the same rows |
| R11 real minus R9 in mIoU: 0.0403, middle 95% from 0.0154 to 0.0632 | 0.0403, from 0.0154 to 0.0632 | [`rule_tests.csv`](rule_tests.csv): row `R11 real` |
| `copy` and `gray` below R11 real (0.5805) | `copy` 0.4046, `gray` 0.2464 | [`rule_tests.csv`](rule_tests.csv): `miou` |
| Probably below R9 too | Both below R9's 0.5402: `copy` by 0.1356 (95%: 0.1146 to 0.1552), `gray` by 0.2938 (0.2743 to 0.3130) | [`rule_tests.csv`](rule_tests.csv): `minus_r9` |
| Neither passes the rule | Neither passes. Both fail tests 1 and 2, and `gray` also fails test 3 | [`rule_tests.csv`](rule_tests.csv): `passes_rule` |

**The reproduction of E5 step 2,** mIoU / destroyed IoU with 8-view TTA, from [`summary.json`](summary.json) (`reproduction`). The tolerance is 0.001.

| Run | Pairs | This run | E5 step 2 |
|---|---|---|---|
| R11 real | the 605 clean | 0.5805 / 0.2692 | 0.5805 / 0.2692 |
| R11 real | all 645 | 0.5875 / 0.2965 | 0.5875 / 0.2965 |
| R9 | the 605 clean | 0.5402 / 0.2874 | 0.5402 / 0.2874 |
| R9 | all 645 | 0.5440 / 0.3001 | 0.5440 / 0.3001 |

Without TTA, the scores on all 645 pairs also match the D4 numbers in E5 step 2's [`config.json`](../../../Champion_Task/E5-results/step2/config.json) (`expected`, `std`): R11 0.5811 / 0.2911 and R9 0.5373 / 0.2921 ([`scores.csv`](scores.csv): mode `std`, pairs `all`, group `all`).

**Each run on the 605 clean pairs,** 8-view TTA, from [`scores.csv`](scores.csv) (mode `tta`, pairs `clean`, group `all`):

| Run | mIoU | Destroyed IoU | Building IoU | Building precision |
|---|---|---|---|---|
| R11 real | 0.5805 | 0.2692 | 0.7429 | 0.8347 |
| R11 copy | 0.4046 | 0.0431 | 0.5040 | 0.6781 |
| R11 gray | 0.2464 | 0.0020 | 0.0390 | 0.8844 |
| R9 | 0.5402 | 0.2874 | 0.5905 | 0.6686 |

**The rule's three tests** on the 605 clean pairs, from [`rule_tests.csv`](rule_tests.csv). For `real`, `copy` and `gray` they decide nothing: `real` is the reference that defines the bar, and `copy` and `gray` are baselines.

| Run | mIoU | 1. Reaches 0.5604 | 2. Minus R9 (middle 95%) | 3. Minus `copy` (middle 95%) | Passes |
|---|---|---|---|---|---|
| R11 real | 0.5805 | yes | +0.0403 (0.0154 to 0.0632) | +0.1760 (0.1457 to 0.2087) | yes, as the reference |
| R11 copy | 0.4046 | no | −0.1356 (−0.1552 to −0.1146) | (itself) | no |
| R11 gray | 0.2464 | no | −0.2938 (−0.3130 to −0.2743) | −0.1582 (−0.1729 to −0.1441) | no |

## Checks

| Check | Result |
|---|---|
| 1. Step 0's `pairs.csv`: its full run, the same split, 605 clean | passed: 6,443 pairs, 5,798 / 645, 605 clean, the same events |
| 2. The gray colour is the training before-photos' mean, (86, 91, 69) | passed: the mean (85.5376, 90.7482, 69.2667) of 5,798 photos |
| 3. R11 real reproduces E5 step 2 (within 0.001) | passed |
| 4. R9 reproduces E5 step 2 (within 0.001) | passed |
| 5. Every run scored every validation pair | passed: 5,160 rows, 4 runs × 2 modes × 645 pairs |

From [`summary.json`](summary.json) (`checks`) and the printout of the notebook's last cell.

## Problems and anything surprising

**Kaggle trouble before the runs.** It didn't affect any result.
- The first smoke-test try stopped in Cell 2, at its first check. Step 0's notebook file had been uploaded as a new dataset, instead of attaching step 0's output. With the output attached, the smoke test passed.
- The first full-run try, in the smoke test's Kaggle notebook, met a Kaggle error on saving: "ConcurrencyViolation: Sequence number must match Draft record". It means the editor page was out of date, most likely because the notebook was open in two browser tabs. That version then stayed "Queued" for 3 hours.
- So the full run was made in a new Kaggle notebook, `layer3-step1-baselines-full`, from the same file with only `SMOKE_TEST = False`. Its code was compared cell by cell with the tested file before it was saved.

**Tiny pixel differences from E5 step 2.** They were found by comparing [`per_pair.csv`](per_pair.csv) pair by pair with E5 step 2's saved counts, [`per_image_counts.csv`](../../../Champion_Task/E5-results/step2/per_image_counts.csv):
- With TTA, at most 22 pixels per pair differ for R11 and 32 for R9, out of 1,048,576. On average it is 2.8 and 3.3 pixels, and 425 and 419 of the 645 pairs have any difference at all.
- Without TTA, at most 50 and 66 pixels per pair differ.
- These come from the GPU's floating-point arithmetic, not from the code. No reported score moves by more than 0.000005.
- **R9's building precision prints as 0.6686, not the expected 0.6687.** Unrounded, it is 0.668650 here and 0.668651 from E5's counts, right on the rounding edge.

**A before-photo without information is worse than none.**
- R11 with `copy` scores 0.1356 below R9, and with `gray` 0.2938 below ([`rule_tests.csv`](rule_tests.csv)). So R11 can't replace R9 when the before-photo is missing, unless it gets a real-looking one.
- With `copy`, R11 rarely calls anything destroyed. Over all 645 pairs, it predicts 252,879 destroyed pixels against 1,808,111 true ones ([`per_pair.csv`](per_pair.csv), TTA), so its destroyed IoU falls to 0.0431. That is probably because a before-photo identical to the after-photo shows no change.
- With `gray`, R11 almost stops finding buildings: building IoU 0.0390 ([`scores.csv`](scores.csv)). The few pixels it does call buildings are mostly right, with building precision 0.8844.
- For step 2, test 3 (above `copy`) is a low bar: `copy` is 0.1356 below R9. Tests 1 and 2 will decide.

**Turkey, known already.** On the 64 clean Turkey pairs, R11 with the real before-photo scores destroyed IoU 0.000, and R9 0.2577 ([`scores.csv`](scores.csv): mode `tta`, pairs `clean`, group `Turkey`).
- Over those pairs, R11 predicts 5 destroyed pixels against 660,440 true ones, and calls 91.5% of them intact ([`per_pair.csv`](per_pair.csv)).
- E5 step 2's counts give the same, and the [roadmap](../../../Next_Steps_Roadmap.md) already reports it.
- `copy` and `gray` also score 0.000 there. So on Turkey, a generated before-photo can't raise R11's destroyed IoU above what the real one gives, which is zero.

## Next

Step 2, the pix2pix generator, once Abrar says go:
- **2a:** train on step 0's 5,798 training pairs only, then generate the before-photos of the 645 validation pairs. The smoke test comes first, and its time per epoch sets the number of epochs.
- **2b:** this notebook again, with `BEFORE_SOURCE = ["real", "copy", "folder:<the generated pictures>"]`. `real` and `copy` stay, so every 2b run checks the reproduction again and gives test 3's baseline.

The bar stays 0.5604.

## Files

- [`per_pair.csv`](per_pair.csv): 5,160 rows, one for each run (R11 real, R11 copy, R11 gray, R9), mode (standard, 8-view TTA) and pair (645). Each row holds:
  - the pair's 16 pixel counts `t<truth>_p<prediction>`;
  - its event, its source and its clean flag.
- [`scores.csv`](scores.csv): 432 rows of mIoU, destroyed IoU, building IoU and building precision.
  - They cover each run and mode, on all pairs and on the clean ones.
  - Each is given overall, for Turkey, for the rest, and for each event.
- [`rule_tests.csv`](rule_tests.csv): the rule's three tests for each R11 run, on the 605 clean pairs (10,000 resamples, seed 42).
- [`summary.json`](summary.json): the settings, the library versions, the checkpoints' SHA-256, the gray colour, the reproduction, the bar and the checks.
- [`smoke-test/`](smoke-test/): the same four files from the smoke test, on E5 step 2's first 8 validation pairs.
