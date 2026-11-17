# Layer 3: generated before-photos, a full-time task for one member

From Abrar, 17 Nov 2026. **Owner:** the member Abrar assigns to it, working on this alone and full-time.

**How you work with Abrar:** every notebook or code run goes through him.
1. Send him its outputs (section 6).
2. Wait for his "go" before the next step.

Nothing here is urgent for the rest of the system, which doesn't wait for it. But it has to be done carefully, because a generated picture can look convincing and still be wrong.

## In short

- **The question:** when a disaster has no before-photo, can a picture generated from the after-photo stand in for it? Our best damage map needs both photos.
- **How we answer it:**
  1. train a model that turns an after-photo into a likely before-photo, on our 5,798 training pairs;
  2. feed its pictures to our before-and-after model (R11);
  3. compare that with our after-only model (R9), and with R11 given the real before-photo.
- **The rule that decides it** is fixed now, before any training (section 4). Either answer is a result we can report.
- **Six steps,** one notebook each (section 5): pairs and checks, baselines, a pix2pix model, an optional diffusion model, an optional SAM 3 test, and one confirmation on the test pairs.
- **About 30–50 GPU hours** on your own Kaggle account, over 3–4 weeks. The showcase is about 15 Dec.

## 1. Words used in this file

| Word | What it means here |
|---|---|
| Before-photo, after-photo | Two satellite pictures of the same place, before and after a disaster. A **pair** is one of each. |
| DisasterM3 | The dataset our models train on. Most of its pairs come from **xBD**, an older dataset of such pairs; the rest (Turkey's earthquake and others) are marked "other". |
| Damage map | A picture the size of the photo where every pixel gets a class: background, intact building, damaged building or destroyed building. |
| R11 | Our best damage-map model. A U-Net (an image-to-image network) with a ResNet-50 encoder that reads the after-photo and the before-photo together (6 colour channels). |
| R9 | Our model that reads only the after-photo (3 channels). It is our "no before-photo" option today, and the model the website runs in visitors' browsers. |
| TTA | Test-time augmentation: the model sees the photo in 8 flipped and rotated versions, and their answers are averaged. All our scores use it. |
| IoU | Intersection over union: for one class, the pixels both the map and the truth call that class, divided by the pixels either calls it. 0 to 1. |
| mIoU | The mean of the four classes' IoU. |
| Destroyed IoU | IoU for the destroyed class, the project's hardest number. |
| Building IoU | IoU with the three building classes merged into one: how well a map finds buildings at all. |
| The 645 validation pairs | The pairs every model is checked on, never trained on: 10% of DisasterM3's 6,443 training pairs, picked by `train_test_split(pairs, test_size=0.1, random_state=42)` in the D4 notebooks. The other 5,798 are the training pairs. |
| The 605 clean pairs | The 645 minus 40 that share images with training pairs. E5 found them by comparing image contents (E5 step 1, `Champion_Task/E5-results/step1/val_train_leaks_hash.csv`, rows with `counted` True). **Scores are judged on these 605.** |
| The 2,007 test pairs | Pairs from DisasterM3's own test split that no model has trained or been tuned on, with true masks rebuilt by E6. Used once, at the end. |
| SAM 3 | A segmentation model from Meta that outlines objects from a text prompt ("building"). On a before-photo it finds buildings well. On an after-photo it covers only 9% of the destroyed-building area (System_Design_Notes §6), because rubble no longer looks like a building. |
| Find-then-grade | Our other damage-map method: SAM 3 outlines each building on the before-photo, then our grader labels each one intact, damaged or destroyed. It also needs the before-photo. |
| D4 notebooks, E5 step 2, E7 step 2b | Our earlier notebooks, which you will copy from (section 8). |

## 2. Why this matters to our system

Our system takes a before-photo and an after-photo, and returns:
- a damage map;
- a table of buildings, with counts;
- a heatmap of where to search;
- written reports for responders.

The whole design is in `Essential_task_delegation/System_Design_Notes.md` §6.

**Both damage-map methods need the before-photo.** R11 reads it directly, and find-then-grade outlines buildings on it. In a real disaster the before-photo may be missing, years old, cloudy or badly aligned. Today the system then has two options:
- fall back to R9, which reads only the after-photo;
- or say plainly that no before-photo exists.

**Layer 3 is the third of the five layers in the project's original proposal:** "generative pre-disaster reconstruction". The smallest useful version was planned on 24 Oct (System_Design_Notes §5.1): a model that turns an after-photo into the likely before-photo, trained on our training pairs, then tested by running R11 three ways: with the real before-photo, with a generated one, and without one (R9).

**The numbers to beat,** on the 605 clean pairs, with TTA (from E5 step 2):

| Model and before-photo | mIoU | Destroyed IoU |
|---|---|---|
| R11 with the real before-photo | 0.5805 | 0.2692 |
| R9, no before-photo | 0.5402 | 0.2874 |

Notice that R9 scores higher on destroyed IoU than R11 with the real before-photo. So what a before-photo adds isn't destroyed IoU. It adds **finding the buildings at all**:
- mIoU 0.5805 against 0.5402;
- on the test pairs, building IoU 0.69 for R11 (E7 step 2).

That is why the rule in section 4 judges on mIoU.

**If the answer is yes,** the system gains a "no before-photo" path: generate one, run R11 on it, and say in every output that the before-photo was generated. Step 4 tests whether SAM 3 can also outline buildings on generated before-photos, which would open find-then-grade too.

**If the answer is no,** that is evidence for the current design: the system says "no before-photo" instead of guessing. Both outcomes go into our reports.

## 3. What you deliver

- A notebook per step, in `Essential_task_delegation/Layer3_Task/`, saved with its outputs after its Kaggle run.
- A results folder per step, `Layer3_Task/results/stepN/`, with a README in the format of section 6.
- At the end, `Layer3_Task/README.md`:
  - the question and the rule;
  - every step's result, with links to its files;
  - what the system should do with the answer.

  Abrar uses it in our weekly updates and the final report.
- **Not delivered:** any change to the website, the report writer or the other members' folders. If the answer is yes, wiring it into the system is a separate task that Abrar plans.

## 4. The rule, fixed before any training

**Measured on:** the 605 clean pairs, at full size (1024 × 1024), with R11 and 8-view TTA, using the same metric code as E5 step 2.

**A generator passes if all three hold:**
1. **It recovers at least half of the gap.** R11 with the generated before-photo reaches at least R9's mIoU plus half the gap between R9 and R11 with the real before-photo.
   - With E5's numbers: 0.5402 + (0.5805 − 0.5402) / 2 = **0.5604**.
   - Step 1 recomputes both numbers with your own notebook. If they match E5's within 0.001, the bar stays at 0.5604.
2. **The gain over R9 is more than noise.**
   - Redraw the 605 pairs with replacement 10,000 times and compute mIoU(R11 with the generated before-photo) − mIoU(R9) each time, as E7 step 2b did.
   - The middle 95% of those differences must lie above 0.
3. **It beats having no generator at all:** R11 given the after-photo copied into the before-photo slot, with the same bootstrap rule (its 95% interval above 0).

**Reported beside it, deciding nothing:**
- destroyed IoU;
- building IoU;
- building precision: of the pixels the map calls a building, the share that truly are one. This catches a generator that "invents" buildings.
- the same per event, and for Turkey and the rest separately (Turkey is where our methods differ most);
- how close the generated picture is to the real before-photo: PSNR, SSIM and LPIPS. These don't decide anything, because a blurry picture can score well on them and still be useless to R11.

**If a generator passes:** run it once on the 2,007 test pairs (step 5), with nothing changed. Report the result whatever it is.

**If none passes:** stop after Gate A or step 3, and write it up as a negative result.

**Why this rule, and what else was considered:**
- **Destroyed IoU as the main measure:** rejected. R11 with the real before-photo is below R9 on it (section 2), so it can't show what a before-photo adds.
- **Picture similarity as the main measure:** rejected. It doesn't show whether R11 can use the picture.
- **Judging the pictures by eye:** subjective and slow. Look at them, and put samples in every README, but don't decide by them.
- **"Half the gap":** asks for a clear, useful gain without demanding the impossible. A generated picture can't contain information the after-photo lacks.

## 5. The steps

Each step is one Kaggle notebook. Before each run, write in the notebook's first cell:
- what the step does and why;
- the checks;
- what you expect, with numbers where you can.

Don't change any of that after the run. Each notebook has `SMOKE_TEST = True` / `False` in its configuration cell: the smoke test runs a few pairs in minutes, the full run everything.

### Step 0: the pairs and the checks (CPU, about 1 hour)

`layer3-step0-pairs-and-checks.ipynb`
- **Copy from:** `Champion_Task/d4-champion-model-R11.ipynb`, Cells 4–6. They build the 6,443 pairs from DisasterM3's manifest, each with its after-photo, before-photo and true mask, and split them with `random_state=42`.
- **Do:**
  - write `pairs.csv`, one row per pair: after-photo, before-photo, mask path, split (train / validation), clean (True / False, from E5 step 1's list), event, source;
  - check by image content, not names, that no training before-photo or after-photo is also a validation photo. Hash the decoded pixels, as E5 step 1 did.
- **Check:**
  - 5,798 training pairs, 645 validation pairs, 605 of them clean;
  - E5's 40 leaked pairs found again;
  - nothing new leaks.

  If any count differs, stop and send Abrar the printout.
- **Why:** every later step reads this one file, so the splits can never drift. On 26 Oct, validation scores turned out to be inflated by 40 pairs that shared images with training (the socal/woolsey leak). This check stops that from happening again here.

### Step 1: the baselines, no generator yet (GPU, about 1–2 hours)

`layer3-step1-baselines.ipynb`
- **Copy from:** `Champion_Task/e5-step2-per-image-counts.ipynb`. It runs R11 and R9 on the 645 pairs at full size with TTA, and saves each pair's pixel counts.
- **Change one thing:** a setting `BEFORE_SOURCE` that chooses the picture fed into R11's before-photo slot:
  - `real`: the real before-photo;
  - `copy`: the after-photo copied into the slot;
  - `gray`: a flat gray picture (the training mean);
  - `folder:<path>`: generated pictures from a folder, named like the after-photos. Steps 2, 3 and 5 use this option.
- **Run:** `real`, `copy` and `gray` for R11, and R9 once.
- **Check:** `real` and R9 reproduce E5 step 2's scores on the 605 clean pairs within 0.001: R11 0.5805 / 0.2692, R9 0.5402 / 0.2874. If not, stop: the evaluation differs from ours, and nothing after it can be compared.
- **Outputs:**
  - `per_pair.csv`: each pair's 16 counts per source (true class against predicted class);
  - `scores.csv`: mIoU, destroyed IoU, building IoU and building precision per source, on 645 and on 605, per event;
  - the bar for step 2, computed from your own numbers.

### Step 2: a pix2pix generator (GPU, about 8–12 hours)

**2a: `layer3-step2a-pix2pix-train.ipynb`, training and generating**
- **The model:** pix2pix (Isola et al., CVPR 2017), the standard image-to-image GAN: a U-Net generator and a PatchGAN discriminator, L1 loss weight 100, Adam (lr 2e-4, beta1 0.5).
  - Train on random 512 × 512 crops of the 5,798 **training pairs only**, after-photo in, before-photo out.
  - Apply the same flip, rotation and crop to both photos of a pair.
  - The generator is fully convolutional, so it runs on the full 1024 × 1024 after-photo afterwards.
- **Settings to record:**
  - epochs (pick them from the smoke test's time per epoch, so training fits in two 12-hour Kaggle sessions at most);
  - seed 42;
  - the image size.
- **Save:**
  - checkpoints to your own Hugging Face account, or to the Kaggle output, so a second session can continue;
  - the generated before-photos for all 645 validation pairs, as PNG, named like the after-photos;
  - a sheet of 12 samples: after-photo, generated, real before-photo, from clean pairs of several events, including Turkey.
- **Known difficulty:** 52% of our pairs are shifted by more than 2 px between the two photos (Ridita's audit, Task_Ledger). An L1 loss on shifted pairs blurs. Train on the pairs as they are, as R11 did, and note it in the README. Aligning the pairs first is a possible follow-up, not part of this step.

**2b: `layer3-step1-baselines.ipynb` again,** with `BEFORE_SOURCE = "folder:<your generated pictures>"`. Nothing else changes.

**Report:** the rule's three tests (section 4), and everything reported beside it.

### Gate A: Abrar decides

With step 2's result, Abrar chooses one:
- **Step 3**, a diffusion model, if time allows and step 2 suggests a better generator could pass;
- **Step 5**, if pix2pix already passes;
- **The write-up**, if the answer is clearly no.

### Step 3 (only if Abrar chooses it): a diffusion model (GPU, about 20–30 hours)

**First, a one-page plan for Abrar's approval:**
- which model, and its licence;
- whether it fits a T4's 16 GB (fp16, gradient checkpointing, 512 px);
- the steps and hours.

**Candidates to look at:**
- Palette (image-to-image diffusion, Saharia et al. 2022);
- InstructPix2Pix-style fine-tuning of an openly licensed latent diffusion model (Brooks et al., CVPR 2023);
- ChangeDiff (AAAI 2025), which generates change-detection pairs (listed in `Research_Directions_Beyond_Finetuning.md`).

**Then the same pattern as step 2:** train on the training pairs only, generate the 645, and evaluate with step 1's notebook.

**Risk, from the 24 Oct plan:** slow training on a T4, and invented buildings. Building precision (section 4) measures the second.

### Step 4 (stretch, only if Abrar says so): SAM 3 on generated before-photos (GPU, about 2–3 hours)

**Question:** does SAM 3 find buildings on generated before-photos, as it does on real ones? On after-photos it covers only 9% of the destroyed-building area.

**Copy from:** `Champion_Task/e3-sam3-building-finding.ipynb`, with the same prompt and settings.

**Measure, on the 605 clean pairs:**
- building IoU of SAM 3's outlines against the truth;
- the share of the true destroyed-building area its outlines cover.

Compare three inputs: the real before-photo (E3's saved maps), the generated one, and the after-photo.

**Access:** SAM 3 is gated on Hugging Face. Request access with your own account first, because approval can take days.

### Step 5: once on the test pairs (GPU, about 2–4 hours)

**Only for a generator that passed on validation, and only once.**
- Generate before-photos for the 2,007 clean test pairs, with nothing changed.
- Run step 1's notebook on them, with R11 (real, generated, copy) and R9.

**Inputs:** the test pairs and their masks are in Abrar's private Kaggle dataset `e7-inputs` (from `Champion_Task/E7-inputs/e7-inputs.zip`). He shares it with your account at this step.

**Report** the same table as on validation, whatever it shows. Nothing may be tuned here.

### Step 6: the write-up

`Layer3_Task/README.md`:
- the question;
- the rule, as fixed;
- each step's result, with links;
- sample pictures, each labelled "generated, not a photo";
- what the system should do: a "no before-photo" path, or stay as it is.

Abrar reads it and decides what goes into the reports and the system.

## 6. How every run goes through Abrar

1. **Before a long run:** run the smoke test, and send Abrar its printout (text or screenshots of every cell). Start the full run only when he says go.
2. **After the run:**
   - download the outputs, unchanged, into `Layer3_Task/results/stepN/`;
   - save the run notebook with its outputs over your notebook in `Layer3_Task/`.
3. **Write `results/stepN/README.md`:**
   - **What and why:** one paragraph.
   - **How:** the notebook, the account, the settings, the run time.
   - **Expected before the run:** copied from the notebook's first cell.
   - **Result, against that expectation:** the numbers, each with the file it came from.
   - **Checks:** each check, and pass or fail.
   - **Problems and anything surprising.**
   - **Next:** what you propose.
4. **Send Abrar** the README's path and three lines: the result, the checks, your proposal. Don't start the next step until he says go.
5. **Push only `Essential_task_delegation/Layer3_Task/`.**
   - Keep the results small: CSVs, READMEs, and at most 12 sample pictures per step.
   - Generated pictures in bulk and checkpoints stay on Kaggle or Hugging Face, never in git.

## 7. Rules that must not break

1. **The generator never sees a validation or test photo in training.** Train only on step 0's training rows.
2. **Nothing is tuned on the test pairs.** Step 5 runs once, after the rule is met on validation.
3. **Splits are checked by content,** in step 0, before any score is trusted.
4. **The rule and the expectation are written before each run,** and not changed afterwards.
5. **A generated before-photo is an invention, never evidence.**
   - Label every generated picture "generated, not a photo", in figures, READMEs and slides.
   - Never use one as ground truth, or show one as a real photo.
6. **One evaluation:** full size, padded to a multiple of 32, 8-view TTA, the same metric code as E5 step 2. Step 1 proves it reproduces E5.
7. **Seed 42 everywhere,** and the library versions recorded in each README.
8. **Every number you report links to the file it came from.**
9. **Commits carry your own name only:**
   - no AI tool names;
   - no "Co-Authored-By" lines naming an AI;
   - no AI assistant's temporary file paths in any file.

## 8. What you reuse

| What | Where | For |
|---|---|---|
| Building the pairs and the split | `Champion_Task/d4-champion-model-R11.ipynb`, Cells 4–6 | Step 0 |
| The 40 leaked pairs | `Champion_Task/E5-results/step1/val_train_leaks_hash.csv` (`counted` True) | Steps 0, 1 |
| R11 and R9 on the 645 pairs, with TTA, per-pair counts | `Champion_Task/e5-step2-per-image-counts.ipynb`, results in `Champion_Task/E5-results/step2/` | Steps 1, 2b, 3, 5 |
| The bootstrap (redrawing pairs 10,000 times) | `Champion_Task/e7-step2b-resampling-test.ipynb` | Steps 2b, 3, 5 |
| SAM 3 on the photos | `Champion_Task/e3-sam3-building-finding.ipynb`, results in `Champion_Task/E3-results/E3/` | Step 4 |
| The test pairs | `Champion_Task/e6-test-split-ground-truth.ipynb`, `Champion_Task/E6-results/E6/README.md` | Step 5 |
| The 24 Oct plan for this layer | `System_Design_Notes.md` §5 | Background |
| The project's current state | `Team_Status.md` | Background |

## 9. Accounts and access

- **Kaggle:** your own account.
  - GPU **T4 x2** (one is used), internet **on** for downloads.
  - About 30 GPU hours a week. Plan your sessions so long runs save checkpoints and can continue.
- **Data:** attach `abrarmohammedtanzim/disasterm3-mirror`.
- **R11's and R9's checkpoints** are in Abrar's private Hugging Face repositories.
  - Abrar shares his private Kaggle dataset `abrarmohammedtanzim/disasterm3-r11-r9-checkpoints` with your Kaggle account before step 1.
  - It holds `R11/final_model.pth` and `R9/final_model.pth`, each with its training `config.json`, and its description gives each file's SHA-256.
  - Attached to a notebook, the files are at `/kaggle/input/datasets/abrarmohammedtanzim/disasterm3-r11-r9-checkpoints/R11/final_model.pth` (and `R9/…`).
  - Never ask for or use his token.
- **Your own checkpoints:** your own Hugging Face account or the Kaggle output. Teammates' accounts can't write to Abrar's repositories.
- **SAM 3** (step 4 only): request access on Hugging Face with your own account.

## 10. Target dates

| Step | Target |
|---|---|
| 0 and 1 | Fri 20 Nov |
| 2 (2a and 2b) | Sat 28 Nov |
| Gate A | Abrar decides about Sun 29 Nov |
| 3, if chosen | Tue 8 Dec |
| 4, if chosen | alongside 3 |
| 5 | Thu 10 Dec |
| 6, the write-up | Sat 12 Dec |

If a step runs late, tell Abrar when you know, not at the deadline. A clean negative result by 12 Dec is worth more than a half-finished positive one.

## 11. Instruction for your AI assistant (paste everything in the box)

```text
I am working on "Layer 3" of our CSE499B project (NSU, Section 13, Group 5), in the repository folder
Essential_task_delegation/Layer3_Task/. My task brief is Essential_task_delegation/Layer3_Task/Layer3_Task_Brief.md.
Read it fully before doing anything; it is the authority for this task.

Goal: test whether a before-photo generated from an after-photo can stand in for a missing real one, so that our
before-and-after damage model (R11) beats our after-only model (R9). The pass rule is in section 4 of the brief and is fixed:
do not change it.

Rules:
1. Work only inside Essential_task_delegation/Layer3_Task/. Read anything else in the repository, but don't edit it.
2. Build one Kaggle notebook per step (section 5), copying the existing notebooks named in section 8 and changing only what
   the step says. Each notebook has SMOKE_TEST in its configuration cell, and writes its expectation and checks in its
   first cell before any run.
3. The generator trains only on the training pairs from step 0's pairs.csv. Never on validation or test photos.
   Nothing is tuned on the test pairs.
4. Evaluate exactly as e5-step2-per-image-counts.ipynb does (full size, padded to 32, 8-view TTA, same metric code), and
   show in step 1 that it reproduces E5 step 2's numbers within 0.001 before anything else is trusted.
5. Label every generated picture "generated, not a photo". Never present one as a real photo or use it as ground truth.
6. After each run, write results/stepN/README.md in the format of section 6, with every number linked to its file, and
   stop. I send it to Abrar and wait for his go before the next step.
7. No AI tool names, no "Co-Authored-By" lines naming an AI, and no temporary file paths of yours in any file, notebook
   or commit message. Never ask for or use anyone else's Hugging Face token.

Start with step 0. First list the cells you will copy from d4-champion-model-R11.ipynb and what you will change, and wait
for my OK before writing the notebook.
```
