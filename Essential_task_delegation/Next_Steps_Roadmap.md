# Next Steps Roadmap: delegation-ready tasks

Updated 2026-10-18, after the fine-tuning ablation closed. This roadmap turns [Phase2_Plan.md](Phase2_Plan.md), [Research_Directions_Beyond_Finetuning.md](Research_Directions_Beyond_Finetuning.md) and [Paper_Audit_and_Integration_Plan.md](Paper_Audit_and_Integration_Plan.md) into **tasks**. Each task:
- has an ID in the project's existing naming style (§2);
- says where the idea comes from and which goal it serves;
- says exactly what to build.

You can hand a task to a teammate, or paste it with the brief in §8 into an AI coding agent to get a Kaggle notebook.

What each finished task found, and the decisions it led to, are in [Task_Ledger.md](Task_Ledger.md); live status is in [Progress_Tracker.md](Progress_Tracker.md).

## 1. Where we are (18 October 2026)

> **This section is the 18 Oct snapshot.** The current status is in [Progress_Tracker.md](Progress_Tracker.md) (Goals and Tasks). Since then:
> - R11 became the champion U-Net, and R16c passed the O1 gate on all 645 validation images (20–21 Oct).
> - E5 (26 Oct) found 40 leaked validation pairs.
>   - Without them, R16c steps 2 and 3 score 0.2838–0.2980.
>   - **Only R16c step 5's SAM 3-only map passes O1's gate on clean data (0.3161 and 0.3051), narrowly.** With the third grader seed (28 Oct, 0.2982), it's met on the three-seed mean only (0.3065).
>   - **L0 (28 Oct): the new 7B is kept** (ORR +3.5, DTR +1.1 points at full size, BBR −0.95, inside the limit). It is L2's teacher.
>   - Benchmark copies cost at most 0.7 points; O2's counting is 32.47% on clean questions.
>   - L0's training is complete; its merge needs a fix (proposed).
> - **4 Nov: the one-chain plan (§1b) sets the order from here.**

- **Fine-tuning is closed.** All 11 D4 training runs are done; the full table is in [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md) §7.
- **Champion:**
  - **R9 recipe (sampler + copy-paste).** It has the best Destroyed IoU (two-seed mean 0.2884, or 0.2971 with TTA) and the best Destroyed recall (about 0.50, or 0.52 with TTA), with the same mIoU as R1.
  - R1 stays the reference baseline; under the mIoU-first R7 rule, R7 = R1.
  - Use **R9's seed-42 model** (`Champion_Task/R9-results/d4_R9/final_model.pth`) for everything downstream.
- **Phase Gate:**
  - mIoU > 0.52 is met in every run.
  - Destroyed IoU > 0.30 is **not** met; the best two-seed mean is 0.2971 with TTA, 0.003 short.
- **The system goals** (O2–O4: hybrid counting, offline DisasTeller with heatmap, 3B edge model) have **not started producing numbers yet.** That's where most of the remaining work is.
- **Submitted files stay frozen.** The review files in `others/` stay as submitted; all of this goes into the next update.

**The goals every task serves** (from the CSE499B review report; details in Paper_Audit §1):

| Goal | Key result |
|---|---|
| O1 Spatial stage | Champion U-Net: mIoU > 0.52 and Destroyed IoU > 0.30 on full-resolution validation images |
| O2 Ground the VLM | Hybrid counting (U-Net + higher-resolution VLM) beats the base model's 34.2% building damage counting (BDC) accuracy, all six tasks re-scored |
| O3 Offline system | DisasTeller on our VLM, no Gemini, returning a report, damage map, counts and survivability heatmap |
| O4 Edge model | Distilled Qwen2.5-VL-3B in about 6 GB, per-task accuracy against the 7B |

## 1b. The one chain (agreed 4 Nov 2026)

**Why.** Every part has been tested on its own, but never together, and our best numbers come from three different models:

| Claim | Model behind it |
|---|---|
| Destroyed-building target on clean data (0.3065, mean of three graders) | SAM 3 + the step-5 grader |
| Best counting (32.96%; 32.47% on clean questions; **7 Nov: a rule that never sees the image scores 66.98%, so this doesn't show counting ability; see the ledger, §7**). *19 Nov: C4's map 35.34%. 25 Nov: on the fair questions (largest option 20 or less) C4 is no better than that rule, 42.2% against 40.9%, and the 3B (c) picks right on 57.45% (53.90% in 4 bits) but, asked for a number with no options, does no better than that rule ([E7 step 3c](Champion_Task/E7-results/step3c/README.md), [L2 step 4d](Champion_Task/L2-step4-results/full/no-options/README.md))* | R11's per-building table; since 19 Nov, C4's |
| Field model (33 MB, CPU) | R9 in 8-bit integers |

Checked on 4 Nov: R11's table and T1's hot spots share only 7 images (2,437 images with buildings in the table, 645 with hot spots), so today no report can draw on both for almost any image. More parts would add hand-offs and edge cases. The next job is one chain, measured as one.

**The chain:**

`before + after photos → SAM 3 finds each building on the before-photo → the grader grades each one → one per-building table → fixed queries + hot spots + guideline search → the report`

| Step | What does it | Evidence so far | Still open |
|---|---|---|---|
| Find | SAM 3 with the prompt "building", on the before-photo cut into four quarters | Building IoU 0.630 with no training (E3) | It misses some buildings outright; the field needs a smaller finder (L4) |
| Grade | R16c step 5's grader: a Siamese ResNet-18 on 128 px before and after crops, labelling each outline intact, damaged, destroyed or none | Right on 212 of 300 true buildings, against 100 and 99 for the 7Bs (Tamanna's Part B) | Most of the gap to the 0.556 ceiling is still the grader |
| Table | One row per building, in H2's columns | H2's table works, built from R11 | *19 Nov: built from C4 (E7 step 3): one row per SAM 3 outline on the sharper photos, one per patch of R11's pixels on xBD photos, with a `kind` column* |
| Counts | Fixed queries (H2b's decision) | 37.0% from the table against 27.0% through the VLM (Aryan's questions) | *19 Nov: C4's counts 34.89% on E5's clean benchmark questions, ahead of R11 and find-then-grade (E7 step 3). 20 Nov: from the outline rows 33.18%, because the benchmark counts joined blobs (E7 step 3b)* |
| Hot spots | T1 v3's code on this chain's map | 73.6% of circled points near true damage, on R9's map | *19 Nov, on C4's test maps: 0.569 overall, 0.827 on photos with destroyed buildings (E7 step 3). 20 Nov: the shortfall is false alarms on unseen photos, and a stricter rule doesn't fix it (E7 step 3b)* |
| Guideline search (RAG) | Ridita's hybrid search, returning cited sections | 27 of 30 on its retrieval test | Not yet used in a full report by the real 7B (T2) |
| Writer | The new 7B, as O3 promises | Answers questions in one sentence (L2's smoke test) | T2b tests a small text model against it |
| Flow | CrewAI's four agents as built, or a fixed flow where code calls the tools and the model only writes | CrewAI's agents failed with our 7B in runs 2–4 (a loop past the token limit; one-sentence reports; a repeated tool call saved as the report). The fixed flow passed run 5 and the internet-off proof run (11 Nov) | **Decided 10 Nov (Ridita, by her rule written before run 4): the fixed flow.** Next: the comparison with July's Gemini reports ([System_Design_Notes §1](System_Design_Notes.md)). *(17 Nov: done by Ridita on 16 Nov; next, her quality-fix run.)* |

**Rules:**
1. **No new module until the chain runs end to end.** H2c, H3, H4, R13–R15 and the day-1 Layers 2–5 wait.
2. **One set of numbers.** Headline numbers come from this chain, on the same images (E7).
3. **Side experiments don't block the chain, and it doesn't depend on them.** L0b, L2's 3B, L3 and L4 report against it. Until L4 shows a small finder works, the 8-bit R9 is labelled as a different, lighter path, not this chain made smaller.
4. **What the review promised stays until the supervisor agrees otherwise.** O3's DisasTeller on our VLM and O4's distilled 3B remain deliverables.

**Order:**
1. **E6:** the test split's four-class masks (done 7 Nov: 2,007 clean pairs).
2. **T2's practice run 2:** agents or fixed flow. *Settled: runs 2–4 with CrewAI's agents failed; the fixed flow passed run 5 and the proof run with the internet off (11 Nov). The reports' quality is still to be judged against July's Gemini reports.* *(Judged 16 Nov by Ridita: ours cite checkable sections and make up fewer numbers; July's read the photos better and are more useful. Her quality-fix run is built, not yet run.)*
3. **E7:** the chain's map, counts and hot spots, on the same images.
4. **T2 steps 5 and 7:** facts from this chain's table, then the check of every number in a report.
5. **T2b:** who writes the report.
6. **T2's internet-off proof run** on the final chain; T3's live demo then runs that chain.

**Focus (4 Nov): the finder and grader, grader first.** The rest of the chain only reads what they produce, and they have the most room left: destroyed-building IoU is 0.33 on all 645 pairs, against 0.556 with perfect grades on SAM 3's outlines.
- **Focus track:** E6, E7, grader changes one at a time on the 605 clean pairs (aligned crops first), L4 and the finder's misses, counting from the chain's table, and the chain's size and speed on a laptop CPU. The test pairs only confirm results; nothing is tuned on them.
- **Running in parallel, not blocking it:** T2 and T2b, L2 and L3, and T3.
- **Owners stay suggestions:** Abrar on the focus track and T3; Ridita on T2 and T2b; Noman on L2 and L3; Tamanna on L4; Aryan on the heatmap on the chain's map.

**Done when:** one internet-off run takes a before-and-after test pair all the way to a report, every number in the report matches the table (zero contradictions, T2 step 7), and the chain's map and counts are scored on the same images. E7's rule can change which model is the chain; see §4. *(20 Nov: the first and third parts are met. T2 step 5 took two test pairs to reports with the internet off, and E7 scored the map and counts on the same photos. Zero contradictions isn't met yet: on one pair the 7B turned a count into a wrong percentage. Later on 20 Nov, step 5's run 2 with two fixes meets it by T2 step 7's rule: 0 wrong of 191 numbers. Read by eye, though, some damage counts are reused as staff numbers, and a stricter rule is proposed. **22:08: met on both test pairs.** Step 5's run 4 has 0 wrong, unsourced or misused numbers under both versions of step 7's rule, offline, from C4's facts.)*

## 2. Tasks at a glance

**Task IDs** follow the names the project already uses: the sprint's Tasks A1–D5, then the D4 runs R1–R10 and E0.

| Prefix | Meaning | Continues |
|---|---|---|
| **E** | Evaluation-only notebook, no training | E0 (re-scoring old checkpoints) |
| **R** | Segmentation training run | R1–R5, R1s7, R8–R12, R9s7 and R11s7; a second seed adds `s7` to the run's name (R11s7), and a new number is only for a new recipe. R1s7 (R1 with seed 7) was called R6 until 20 Oct. A run's parts are "steps" (R16c step 1–5), never "stages". |
| **D5** | The xBD data task | Task D5 in `team_task_assignments.md` (external data, Phase 2) |
| **H** | Hybrid U-Net + VLM work | New; serves O2 |
| **T** | Triage system: heatmap, reports, demo | New; serves O3 |
| **L** | Lightweight (edge) models | New; serves O4 |

**Old names** (renamed on 18 October 2026 in every document in `Essential_task_delegation/`; listed here so older notes and commits still make sense). The old P2-0 step 4, the converter check, is now part of D5.
- E1 = P2-0;
- R11 = P2-B;
- R12 = P2-A;
- R15 = P2-AB;
- R16 = P2-C, and SAM 3 step S3;
- E3 = SAM 3 steps S0–S1;
- L4 = SAM 3 step S5.

**Source tags:**
- **[Paper]** an idea from a paper in the audit;
- **[Plan]** our own earlier plan (Phase2_Plan, the CSE499A future-work list, the review report);
- **[Innovation]** an idea a teammate proposed.

| Task | Title | Source | Goal | Type | GPU-h | Needs | Suggested owner |
|---|---|---|---|---|---|---|---|
| **Phase A: this week, no new training** | | | | | | | |
| E1 | Error diagnosis + export champion predictions | Plan | O1 | Eval notebook | ~1 | — | Abrar |
| E2 | Object-based majority voting | Paper: BRIGHT | O1 | Eval (add-on to E1) | ~0.3 | E1 | Abrar |
| D5 | xBD converter check + 1,007 leak-safe tiles | Plan + Paper: xBD | O1 | CPU notebook | 0 | — | Aryan |
| E3 | SAM 3 smoke test and building finding | Paper: SAM 3, SegEarth-OV3 | O1, O4 | Eval notebook | ~2 | HF access | Abrar |
| E5 | Train/validation leak and the benchmark's copies (opened 26 Oct) | Innovation: Ridita's audit | O1, O2 | CPU hash check + eval notebook | ~1 | — | Abrar |
| E6 | The test split's ground truth: four-class masks for the benchmark's optical test pairs (added 4 Nov) | Plan | O1, O2 | CPU notebook | 0 | E5 step 1 | Abrar |
| E7 | Score the chain as one: map, counts and hot spots on the same images; replaces H1 V3 (added 4 Nov) | Plan: the one chain (§1b) | O1, O2, O3 | PC check, then eval notebook | ~2 | E6 | Abrar |
| H1 | KR2 harness: U-Net counting + counts-as-text | Plan + Paper: TEOChat, DamageScope | O2 | Eval notebook (2×T4) | ~1 + ~6 | E1 | Noman |
| T1 | Survivability heatmap | Plan + Paper: BDAChat | O3 | CPU notebook | 0 | E1 | Aryan |
| L1 | Edge benchmark of the U-Net (ONNX, INT8) | Plan + Paper: AWQ; Tamanna Plan 1 | O4 | Laptop CPU | 0 | — | Tamanna |
| **Phase B: next week, training (one change each)** | | | | | | | |
| R11 | Before + after input (6 channels) | Plan + Paper: xView2 winners, BRIGHT, TEOChat | O1 | Train notebook | ~8 | E1 (order) | Abrar |
| R12 | +1,619 extra xBD tiles (D5 and D5b; 2 turned out to be twins of validation pairs, 27 Oct) | Plan + Paper: xBD | O1 | Train notebook | ~7 | D5 | Ridita |
| R13 | BRIGHT pre-disaster footprints (optical only) | Innovation: Ridita + Paper: BRIGHT | O1 | Train notebook | ~7 | R12 result | Ridita |
| R14 | Rubble-centric crop mining (optional) | Innovation: Ridita | O1 | Train notebook | ~6 | spare quota | Ridita |
| **Phase C: champion and fallback** | | | | | | | |
| R15 | Combined champion + second seed (R15s7) | Plan | O1 | 2 train runs | ~16 | R11, R12 | Abrar |
| R16 | Find-then-grade: find buildings, then grade each (runs regardless of R12) | Paper: xView2 1st, BRIGHT, BDAChat + Plan (Phase2_Plan's fallback) + Innovation: Ridita | O1, O2, O3 | Train + eval | ~1 | E3 | Abrar |
| **System track: in parallel** | | | | | | | |
| H2 | Per-building table + SQL counting agent | Paper: DamageScope, Change-Agent | O2, O3 | CPU / light GPU | ~1 | E1 | Noman |
| H2b | Graded test of the SQL agent: which model, if any, writes the SQL | Paper: test suites (Zhong et al.), TrustSQL / EHRSQL 2024, Dr.Spider, DAIL-SQL | O2, O3, O4 | Eval notebook (2×T4) | ~1–1.5 | H2 | Abrar |
| H2c | Free-form questions, second try: question–SQL pairs, fine-tuning, an agreement gate, a new test (fallback: the system as it was) | Paper: EHRSQL 2024, TrustSQL | O3, O4 | Data (CPU) + adapter training + eval notebook | ~5–10 | L2 (or the 7B), H2b | Abrar |
| H3 | VLM input upgrades (before + after, numbered marks, crops) | Paper: TEOChat, GeoPixel, ImageRAG; Tamanna Plan 2 | O2 | Variants in H1 | ~6 each | H1 | Tamanna |
| H4 | GEOBench-VLM external counting test | Paper: GEOBench-VLM | O2 | Eval notebook | ~1 | H1 | Aryan |
| H5 | Honest count ranges: a likely range for every count | Tamanna Plan 3; Paper: split conformal prediction (Angelopoulos and Bates, 2021) | O2, O3 | CPU | 0 | E7 (C4) | Tamanna |
| T2 | DisasTeller on local models | Plan | O3 | GPU notebook | ~2 | — | Ridita |
| T2b | Who writes the report: the 7B or a small text model (added 4 Nov) | Plan; evidence from H2b and L2's smoke test | O3, O4 | Eval notebook | ~3–4 | T2 steps 5 and 7, E7 | Ridita |
| T3 | Unified offline demo and public showcase (Vercel website) | Plan + Tamanna Plan 3 | O3 | Website (Vercel) + local API | ~1 | H2, T1, T2 | Abrar (decided 24 Oct) |
| L0 | A better 7B teacher before distilling (decided 19 Oct) | Paper: DisasterM3 (Table 2, Appendix B.3) | O4, O2 | Eval notebook, then a top-up run only if needed | ~2–3, then ~10–20 | H1 V2 | Abrar |
| L0b | Can the 7B learn to see damage? A small test of training its vision encoder (added 4 Nov) | Plan; evidence from Aryan's study and Tamanna's Part B | O2, O3 | Train + eval notebook | a few (a guess; memory check first) | E6, E7 | Abrar |
| L2 | 7B → 3B distillation (after L0) | Plan + Paper: QLoRA | O4 | 2 notebooks | heavy (~15–25) | L0; 3rd account | Noman |
| L2b | Explanations as a second skill ("why?" on request) | Paper: Distilling Step-by-Step, BDAChat, ImageRAG | O4, O3 | Generation notebook + L2 step 2 change | ~3–5 | L2 step 1 | Noman |
| L3 | AWQ 4-bit 3B + confidence handoff to 7B | Paper: AWQ, Grace | O4 | Eval notebook | ~2 | L2 | Noman |
| L4 | EfficientSAM3 vs SAM 3 | Paper: EfficientSAM3 + Plan (SAM 3 edge step) | O4 | Eval notebook | ~1 | E3 | Tamanna |

Owners are suggestions; reassign freely. The order inside each phase is the recommended priority.

## 3. Shared rules for every notebook

These apply to every task, so an agent doesn't have to rediscover them.

- **Kaggle setup:**
  - GPU T4 ×2 (Kaggle's only T4 option; most notebooks use one of the two), internet ON.
  - Attach the DisasterM3 mirror (`/kaggle/input/datasets/abrarmohammedtanzim/disasterm3-mirror/DisasterM3_Instruct`).
  - Add the `HF_TOKEN` secret (write-scoped) only if the notebook pushes to Hugging Face.
  - Teammates' accounts got 403 errors pushing to `AbrarAlam/*` repos. Push to your own namespace, or rely on Kaggle outputs.
- **Base code:** copy the notebook named in the task and change only what the task lists. For segmentation work, keep Cell 1's pins (`segmentation-models-pytorch==0.3.4`, `albumentations==1.4.21`) and reuse these from [d4-champion-model-R5.ipynb](Champion_Task/d4-champion-model-R5.ipynb) (cells 4, 5, 8 and 10):
  - `DisasterM3SegDataset`;
  - `build_model`;
  - `predict` (8-view TTA);
  - `evaluate`, `metrics_from_confusion` and `result_row`, plus `CSV_FIELDS`.
- **Training-run names:** set `EXPERIMENT` to the task ID (for example `EXPERIMENT = "R11"`) and add a preset with the same name. The notebook then writes `D4_R11.csv` and pushes to `disasterm3-d4-R11`, like R1–R10.
- **Data and leakage:**
  - The validation set is always the same 645 images: `train_test_split(pairs, test_size=0.1, random_state=42)` over the 6,443 pairs built in Cell 4.
  - Never train on them, and never add outside data to validation.
  - No SAR (radar) images anywhere in segmentation work.
- **Scoring:**
  - E-protocol: full native 1024 images, last epoch, dataset-level confusion matrix.
  - Report a standard row and an 8-view TTA row.
  - Training runs: 40 epochs, 5,798 samples per epoch.
- **Run-All safe:**
  - A `SMOKE_TEST` flag (about 5 minutes on a few images).
  - The 11.3-hour time guard with resume (as in the D4 notebooks) for anything over about 9 hours.
  - Big temporary files go in `/kaggle/temp`, which isn't saved, so the output doesn't get zipped.
- **Outputs:** everything in `/kaggle/working/<task-id>/` (for example `/kaggle/working/E1/`):
  - a CSV with the same columns as the D4 CSVs (for segmentation);
  - `config.json`;
  - a one-page `README.md` with what ran, the numbers, and anything that broke.
- **Checkpoints to upload once as Kaggle datasets:**
  - R9 champion: `Champion_Task/R9-results/d4_R9/final_model.pth`;
  - R1 reference: `Champion_Task/R1-results/d4_R1/final_model.pth`.

  Both load with `build_model("Unet", "resnet50", pretrained=False)` and `load_state_dict`.
- **Keep rule for training runs (R11 onwards):**
  - mIoU must not drop by more than the noise (about 0.005 against the R9 or R1 base).
  - Destroyed IoU must rise by more than the seed noise (0.013).
  - A gate claim needs two seeds (Phase2_Plan §6).

## 4. Phase A: this week, no new training

### E1 · Error diagnosis and champion predictions
- **Source:** [Plan] Phase2_Plan §3. BRIGHT's finding that finding buildings and grading them are separate problems is why we split the errors this way.
- **Goal:** O1. Learn *why* destroyed pixels are missed, and set Gate G2 (which of R11 and R12 runs first). It also produces the prediction files that E2, H1, T1 and H2 reuse.
- **Base:** copy [d4-champion-model-E0.ipynb](Champion_Task/d4-champion-model-E0.ipynb). It's already evaluation-only, and its `EVAL_CHECKPOINTS` list (Cell 2) takes a `local_path`.
- **Inputs:** the R9 and R1 `final_model.pth` files (Kaggle dataset); the DisasterM3 mirror.
- **Build:**
  1. For each model, standard and TTA: the 4×4 confusion matrix (pixel counts, rows = truth).
  2. **Building IoU:** classes 1–3 merged against background.
  3. **Background-miss share:** of the destroyed pixels the model gets wrong, the fraction predicted as Background, Intact and Damaged.
  4. **Per-event and per-source Destroyed IoU:** accumulate a confusion matrix per event. The event comes from the file name: xBD names look like `hurricane_florence_00000261_post_disaster.png` (event = the text before `_<8 digits>`); other names look like `bata_explosion_post_0.png` (event = the text before `_post`). Source = xBD versus other.
  5. Save R9's predicted masks for all 645 images (standard and TTA) as uint8 PNGs (`preds/R9_std/<name>.png`, `preds/R9_tta/<name>.png`), plus the ground-truth masks (`gt/<name>.png`).
- **Outputs:** `p2_0_summary.csv`, `per_event.csv`, `README.md`, and the `preds/` and `gt/` folders. Publish the output as a Kaggle dataset, `d4-r9-val-predictions`.
- **Done when:**
  - R9's and R1's overall IoUs match their D4 CSVs to 4 decimals (proving the setup is identical);
  - the G2 number (Background-miss share) is reported.
- **Gate G2:**
  - 40% or more of the missed destroyed pixels predicted as Background: run R11 first.
  - Otherwise: run R12 first.

### E2 · Object-based majority voting (no training)
- **Source:** [Paper] BRIGHT (ESSD 2025): +0.69 mIoU per event, −0.41 overall on their data.
- **Goal:** O1. A free post-processing step that might lift Destroyed IoU.
- **Base:** extra cells at the end of the E1 notebook (the predictions are already in memory), or a CPU notebook reading `d4-r9-val-predictions`.
- **Build:**
  1. For each image, take the building mask = prediction > 0.
  2. Find connected components (8-connectivity, `cv2.connectedComponentsWithStats`).
  3. Give each component its majority class among 1, 2 and 3.
  4. Re-score with the same confusion-matrix code.
  5. Variant: ignore components smaller than 20 px.
- **Outputs:** a standard row and a TTA row for "R9 + voting" in the D4 CSV format, plus `README.md`.
- **Done when:** both rows are compared with R9's (0.5373 / 0.2921; TTA 0.5440 / 0.3001). Adopt voting only if Destroyed IoU rises by more than 0.005 without lowering mIoU, **and** it repeats on R9s7's model.

### D5 · xBD converter check and the 1,007 leak-safe tiles
- **Source:** [Plan] Phase2_Plan §2–3 (this is Task D5 from the sprint plan) and [Paper] xBD.
- **Goal:** O1. Prepare R12's extra training data and find out exactly how DisasterM3 mapped xBD's damage levels.
- **Base:** a new **Kaggle CPU notebook**. It needs DisasterM3's masks from the mirror, plus the xBD labels uploaded as a Kaggle dataset. Upload `data/xView2 Challenge Dataset - train and test/train/labels/` (5,598 JSON files) and `train/images/`.
- **Build:**
  1. **Tile IDs:** collect every image name in DisasterM3, train and benchmark (`train_release.json` and `benchmark_release.json`). Turn each into an xBD tile ID such as `palu-tsunami_00000123` (the xBD event name uses dashes, and DisasterM3 uses underscores).
  2. **Split the tiles:** separate xBD's 2,799 post-disaster labels into "already in DisasterM3" (expected: 1,792) and "new" (expected: 1,007).
  3. **Converter:**
     - Parse `features.xy[*].wkt` (pixel-coordinate polygons) and fill them with `cv2.fillPoly` by `properties.subtype`: `no-damage`, `minor-damage`, `major-damage`, `destroyed`, `un-classified`.
     - Rasterise the 1,792 overlapping tiles and compare them pixel by pixel with DisasterM3's combined 4-class masks (built the same way as Cell 4 of the D4 notebook).
     - Report a 5×4 table: xBD subtype against DisasterM3 class.
  4. **Convert the 1,007 new tiles** with the measured mapping. `un-classified` becomes 255 (ignore), unless step 3 shows something else.
- **Outputs:**
  - the `xbd-extra-1007` Kaggle dataset (`images/`, `masks/`, `manifest.json` with the event and the per-class pixel counts);
  - `mapping_report.md`.
- **Done when:**
  - the mapping table is clear (expected: minor and major become Damaged);
  - no new tile ID appears anywhere in DisasterM3;
  - the counts match Phase2_Plan §2 (1,007 tiles, about 3,472 destroyed polygons).

### E3 · SAM 3 smoke test and building finding
- **Source:** [Paper] SAM 3 (arXiv 2511.16719) and SegEarth-OV3 (64.3% zero-shot building IoU on xBD).
- **Goal:**
  - O1: decide whether SAM 3 can do the finding for the find-then-grade model, R16 (Gate G3).
  - O4: the field version of SAM 3 is L4.
- **Base:** a new notebook on a T4, in fp16. Request access to the gated `facebook/sam3` weights on Hugging Face first, then use the official `facebookresearch/sam3` code.
- **Build:**
  1. **Part 1, smoke test:** load the model, run one 1024×1024 image, and log peak GPU memory and seconds per image. If it doesn't fit, record that and try 2×T4 or EfficientSAM3 (L4).
  2. **Part 2, building finding:** prompt "building" on the 645 validation **pre-disaster** images and on the **post-disaster** images.
     - Building IoU: the union of SAM 3's masks against the ground-truth building mask (classes 1–3).
     - Building count against the number of ground-truth building blobs.
  3. Compare with R9's building IoU from E1.
- **Outputs:** `sam3_s1.csv` (per image: IoU and counts, pre and post) and `README.md` (memory, speed, and the overall IoU for pre and post).
- **Gate G3:** if SAM 3 on the pre image is at least as good as R9 at finding buildings, R16 uses SAM 3 for the finding; otherwise it uses R9's building mask.

### E5 · Train/validation leak and the benchmark's copies (opened 26 Oct)
- **Source:** [Innovation] Ridita's corrected audit (`BRIGHT_DisasterM3_Integration/`, §8).
- **Goal:** O1 and O2. Scores must come from images the models never saw.
- **Steps:**
  1. **Step 1, CPU only** (`e5-step1-hash-check.ipynb`):
     - fingerprint every DisasterM3 Instruct image and every benchmark image (file MD5, pixel MD5, dHash and a thumbnail);
     - list exactly which validation pairs leak;
     - find benchmark images that copy Instruct images, and the questions that use them;
     - draw pictures of near-copies for review.
  2. **Step 2, GPU, about 1 h** (`e5-step2-per-image-counts.ipynb`): per-image pixel counts for R11, R11s7, R9 and R1, standard and TTA, checked against their D4 CSVs.
  3. **On your PC, every score a leak touched, whatever the share** (decided 26 Oct; it's a filter over saved files, minutes of CPU). Each gets two numbers: all questions or pairs, and clean.
     - **Validation leak (segmentation):** R16c (steps 2, 3 and 5), R16, R11, R11s7, R9 and R1, plus R9s7 and E2's vote from E1's counts.
     - **Benchmark copies (7B and U-Net counting):** L0 step 1, L0 step 2 (old 7B and the new one), H1 V1, V2 and V2b, H2, R16c step 1's counting, and Aryan's numbers if we quote them.
     - **Not re-scored:** R2–R8 and R10. No checkpoints or per-image counts were kept. They were only compared with each other on the same 645 pairs, and without the 40 leaked pairs every U-Net drops by about the same amount (0.012–0.013 Destroyed IoU). The gaps between U-Net runs move by about 0.001, under the 0.005 noise margin, so their keep/drop decisions stand.
     - Then O1's and O2's status everywhere.
  4. **From now on:** any new split is grouped by before-image fingerprint, so twins stay on one side.
- **Expectation, fixed 26 Oct:**
  - 21–40 leaked pairs, with the PC check's 21 among them, and about 264 shared before-images in the pool.
  - Benchmark: no prediction. (The first plan re-scored O2 only above 1% of optical questions copied; dropped 26 Oct, every affected score is re-scored.)
- **Built 26 Oct and dry-run checked on your PC.** The real manifest and masks reproduce the split, and planted copies are found exactly. The outputs will go to `Champion_Task/E5-results/step1/` and `step2/`.
- **Results so far:** [E5-results/E5/](Champion_Task/E5-results/E5/README.md) and [Task_Ledger.md, E5](Task_Ledger.md).
  - **26 Oct:** Ridita's audit README settles the count at 40 (our 21 plus 19 whose socal_fire side isn't in xBD tier 1): [leaked_pairs_40.csv](Champion_Task/E5-results/E5/leaked_pairs_40.csv).
  - Without them, R16c scores 0.2838–0.2980 on its four combinations. **O1 isn't met on clean data.**
  - Still to come: R11 and R11s7 alone (step 2), R16c step 5, and the benchmark (step 1).
  - **Steps 1 and 2 done (26 Oct, account 2), and every affected score re-scored on your PC.** Every check passed: the split, all 8 D4 reproductions, and the same 40 pairs a third time.
    - **O1, clean:** R16c step 5's SAM 3-only map is the only map that passes: 0.3161 and 0.3051 (mIoU 0.547).
    - R11 and R11s7 lose 0.027 to the leak, twice what the after-only U-Nets lose, because the leaked pairs share their before-image. With TTA, R11 is 0.2692 against R9's 0.2874.
    - **Benchmark:** 186 of 10,675 optical questions (1.74%) use a copied after-image. Without them, scores drop by at most 0.7 points; O2's counting goes from 32.96% to 32.47%.
    - Tables and caveats: [E5-results/E5/](Champion_Task/E5-results/E5/README.md).
    - **Next:** group future splits by before-image fingerprint. A third step-5 grader seed (proposed) before claiming O1. *(Ran 27 Oct: O1 met on the three-seed mean only, 0.3065.)*
  - **27 Oct:** R12's 1,619 extra xBD tiles, checked by content for the first time: two share a before-image with validation pairs outside the 40, so R12 trained on 42 leaked pairs. Its verdict (not kept) stands. E2's and E3's decisions also hold on clean data.

### E6 · The test split's ground truth (added 4 Nov)
- **Source:** [Plan] every segmentation score so far is on 645 validation pairs taken from DisasterM3's training data. The benchmark's own segmentation task has building masks for its test images.
- **Goal:** O1 and O2: a second, larger, unseen test set.
- **Base:** [e6-test-split-ground-truth.ipynb](Champion_Task/e6-test-split-ground-truth.ipynb), built and dry-run checked 4 Nov. CPU only, about 10–15 min.
- **Build:** merge each optical test pair's black-and-white masks into one four-class mask with the training rule (R11's Cell 4), check them against the training masks, and leave out pairs that copy a segmentation-pool image (E5 step 1's fingerprints).
- **Rules, fixed before the run:** in the notebook's first cell. Expected from your PC: 2,067 pairs, 57 left out (56 copy a training pair, 1 a validation pair), 2,010 clean. **Result (7 Nov): 2,007 clean; 2 unreadable images and 1 unreadable mask were also left out ([E6-results/E6/](Champion_Task/E6-results/E6/README.md)).**
- **Alternatives:**
  - Keep scoring only on the 605 clean validation pairs: they've been used to choose between models many times, so they're no longer unseen.
  - A new split grouped by before-image: the right fix for future training, but it changes the validation set and breaks comparison with R1–R16c.
- **Done when:** `test_clean_pairs.csv` and the merged masks exist, and rules 1–5 are reported against their expectations.

### E7 · Score the chain as one (added 4 Nov; replaces H1 V3)
- **Source:** [Plan] the one chain (§1b).
- **Goal:** O1, O2 and O3: one set of numbers from one chain.
- **Why it replaces H1 V3's rule:** H1 V3 was to wait until R16c's counting beat R11's on validation (37–39% against 39.2%, for maps that used R11's pieces). No counting figure is recorded for the SAM 3-only map, and the plan now needs this chain's number either way.
- **Build:**
  1. **On your PC, CPU, minutes:** count from step 5's saved per-building file on R16c step 1's 1,055 validation questions. That's this chain's first counting number, and the expectation for step 2. **Done 7 Nov: 37.73% against R11's 39.24%, p = 0.39; median count error 40% against 33% ([results](Champion_Task/E7-results/step1/README.md)).**
  2. **Kaggle T4, about 3.5 h (estimated 7 Nov; first planned as about 2 h), on the 2,065 readable optical test pairs ([notebook](Champion_Task/e7-step2-chain-on-test-pairs.ipynb), built and dry-run checked 7 Nov):**
     - SAM 3 on each before-photo in quarters (about 73 min at E3's 2.11 s per photo), then the three step-5 and 5b graders;
     - R11 with TTA on the same pairs, as the baseline;
     - the table in H2's columns from grader seed 42. Seed 42 is fixed now, from its best clean validation score (0.3161), before any test score exists.
  3. **On your PC, CPU:** T1 v3's code on the chain's maps, for the same 20 px check.
- **Scores:**
  - **Map:** mean IoU and destroyed-building IoU on E6's 2,007 clean pairs, per grader and as the mean of three, per event, and with and without Turkey. Macro F1 on true buildings too, for BDAChat's comparison.
  - **Counts:** the fixed query and nearest option, as in H2, on all optical counting questions and on E5's clean ones, against R11's table on the same questions (exact McNemar) and the 34.2% bar. Added 7 Nov, before any test score: count error against each question's true count, and the rule that never sees the image, reported beside accuracy. Neither decides anything.
- **Rule, fixed before the run:**
  - **How "clearly below" is read (fixed 7 Nov, before the run):** seed 42's table against R11's on E5's clean questions, the chain's accuracy lower, exact McNemar p < 0.05. All the optical questions are reported too.
  - The chain stays SAM 3 + grader if its destroyed-building IoU (mean of three graders) is above R11's on the clean test pairs, and its counting isn't clearly below R11's (p < 0.05).
  - If its counting is clearly below but its destroyed score is above, both results go to Abrar; there's no automatic choice.
  - If its destroyed score isn't above R11's, the lead doesn't hold on unseen data, and the choice of chain reopens before T2 step 5.
  - O1 stays judged on validation, as the review set it. The test score is reported beside it, and nothing is ever tuned on the test pairs.
- **Expectation, fixed before the run:** every model scores lower on test than on validation: Turkey is 20% of the test pairs against 10%, five events are new to validation (Mexico, Joplin, Ian, Noto, Guatemala), and no twins remain. So the chain may fall below 0.30 here. Its counting should be about level with R11's (on validation: 37.73% against 39.24%, p = 0.39). No test number is predicted.
- **Alternatives:** whole-image counting with the VLM (already below the table); the mean of three tables instead of seed 42 (not one chain); R16c's SAM 3 + R11 pieces (fails on clean validation).
- **Step 2 done (account 1; downloaded 11 Nov): the rule's third case, so the choice of chain reopens.** [Results](Champion_Task/E7-results/step2/README.md).
  - Destroyed-building IoU on the clean test pairs: 0.3898 (mean of three graders) against R11's 0.3984.
  - Mean IoU 0.5129 against 0.5721. Counting level: 32.7% against 32.53% (p = 0.87).
  - Against the expectation: both scored higher on test than on validation, not lower (0.39 and 0.40 against 0.307 and 0.269).
- **Step 2b (11 Nov, on the PC, on Abrar's go): the gap is noise, and the models split by event.** [Results](Champion_Task/E7-results/step2b/README.md).
  - Redrawing the pairs 10,000 times: −0.038 to +0.022; redrawing the events: −0.098 to +0.089.
  - Without Turkey, R11 leads by 0.057, and that holds by event. On Turkey, the chain leads by 0.236.
- **Step 2c (17 Nov, on the PC, on Abrar's go): option (c), six mixes scored on validation and confirmed once on test.** [Results](Champion_Task/E7-results/step2c/README.md), [notebook](Champion_Task/e7-step2c-mix-choice.ipynb).
  - C4 (R11 on xBD images, find-then-grade on the other sources) leads on the 605 clean validation pairs (**0.3501** Destroyed IoU, 0.5881 mIoU) and confirms once on the 2,007 clean test pairs (**0.4296** Destroyed IoU, +0.031 over R11 and +0.040 over find-then-grade, both beyond noise in 10,000 redraws).
- **19 Nov: Abrar chose C4.** R11 maps the coarser xBD photos, and find-then-grade maps the sharper ones (Turkey and the rest). Every option is explained in plain words in [the ledger](Task_Ledger.md#every-option-in-plain-words-written-19-nov-for-the-decision).
- **Step 3 done (19 Nov, on the PC, 54.7 min): C4's maps, building table and hot spots on all 2,065 test photos.** [Results](Champion_Task/E7-results/step3/README.md), [notebook](Champion_Task/e7-step3-c4-table-and-hot-spots.ipynb); expectation against result in [the ledger](Task_Ledger.md).
  - All six checks passed; C4's test scores reproduce (0.4295 destroyed-building IoU against 0.4296).
  - **Table:** 125,439 rows. On the sharper photos, 57,849 outlines, 24.5% more rows than E7 step 2's joined blobs (touching buildings separated; expected 5–20%). On xBD photos, 67,590 patches of R11's pixels.
  - **Hot spots:** marked points within 20 px of real damage 0.569 on the 2,007 clean pairs (expected 0.70–0.85: missed), but 0.827 on the 687 photos with destroyed buildings (T1 v3 on validation: 0.851). The shortfall is on photos without destroyed buildings.
  - **Counting, beside:** C4 34.89% on E5's clean questions, against R11's 32.53% and find-then-grade's 32.70%, beyond chance (p < 0.0001 and 0.0034); 35.34% on all 3,580, above O2's 34.2% bar, with the option flaw stated beside it. *(25 Nov, step 3c: on the 2,000 fair questions C4 is no better than the blind rule, 42.2% against 40.9% (p = 0.46); the 3B (c) picks right on 57.45% (53.90% in 4 bits), but with no options it does no better than the rule (L2 step 4d). [Results](Champion_Task/E7-results/step3c/README.md).)*
- **Next: Ridita's T2 step 5** reads `E7-results/step3/buildings_c4.sqlite` and `hotspots.json`. Optional checks on the PC (Abrar's call): counting from the outline rows; the hot-spot shortfall's cause; a stricter hot-spot rule tuned on validation. *(20 Nov: step 5 done by Abrar; see T2, step 5.)*
- **Step 3b done (20 Nov, PC, 6.0 min, at Abrar's request): the three optional checks; every guess missed.** [Results](Champion_Task/E7-results/step3b/README.md).
  - **Counting from the rows:** 33.18% against the joined blobs' 34.89% (p < 0.0001). The benchmark's true count joins touching buildings, so separate rows overshoot it. O2's figure stays the blobs'.
  - **The hot-spot shortfall:** from the unseen test photos, not the maps (C4 0.565 against R9's 0.584 on the same validation photos).
  - **A stricter hot-spot rule (T1 v4):** test hit share 0.569 → 0.573, short of +0.05, so T1 v3 stays.

### H1 · KR2 evaluation harness: U-Net counting and counts-as-text
- **Source:**
  - [Plan] the CSE499A future-work "textual bridge" and the review report's "VLM reads per-building counts as text";
  - [Paper] TEOChat (VLMs find buildings badly but grade given ones well) and DamageScope (answer counts from data, not from pixels).
- **Goal:** O2, KR2 — the first real hybrid counting number, plus all six tasks re-scored.
- **Base:**
  - `support/Abrar/Implementation_DisasterM3/3b_hybrid_vllm_evaluation.ipynb` (vLLM on 2×T4, our fine-tuned `AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP`);
  - `hybrid_bdc_counter.py`;
  - `4_score_results.py` for scoring.

  Replace the old ResNet-34 U-Net (`AbrarAlam/disasterm3-unet-checkpoints-2`) with **R9**: ResNet-50, four classes, full 1024 input.
- **Data:** the DisasterM3 benchmark (`benchmark_release.json`, 30,042 entries). The six scored tasks have 12,968 questions; building damage counting (BDC) has 4,982:
  - about 2,671 ask for intact buildings;
  - about 1,059 for destroyed;
  - about 786 for damaged;
  - about 466 for a total.

  Each is multiple choice with the exact count as ground truth (e.g. 232). 623 BDC questions use a **radar** after-image (`*_sar_post_*`). Score those with the U-Net on the matching optical image (same name without `_sar`), and report them separately.
- **Variants** (a flag at the top):
  - **V1, counting bypass (no VLM):**
    1. Segment the after-image with R9 + TTA.
    2. Read the class from the question: intact/undamaged/remained → 1; destroyed/collapsed → 3; damaged → 2; total/all → 1–3.
    3. Count connected components of that class (minimum area as in `hybrid_bdc_counter.py`; tune it on 200 *training* images, never on the benchmark).
    4. Pick the option nearest to the count.
  - **V2, counts-as-text for all six tasks:**
    - Put a short fact block before every question, e.g. "U-Net analysis: 51 intact, 3 damaged, 0 destroyed buildings; most damage in the north-east quadrant."
    - BDC still uses V1. Keep the full image as the visual input. This is the "textual bridge".
- **Outputs:**
  - `kr2_results.csv`: accuracy per task per variant, next to the 499A references below.
  - BDC accuracy broken down by question type (intact, damaged, destroyed, total) and by optical versus radar.
  - `README.md`.
- **499A references** (our fine-tuned 7B / the base model):

  | Task | Fine-tuned 7B | Base model |
  |---|---|---|
  | DTR | 68.33% | 66.6% |
  | BBR | 16.39% | 4.7% |
  | **BDC** | **23.58%** | **34.2%** (the KR2 target) |
  | DRE | 26.24% | 29.3% |
  | DSR | 31.31% | 28.3% |
  | ORR | 22.50% | 23.9% |

  The old crop collage scored 13.11% on BDC because intact buildings weren't counted.
- **Like-for-like comparison (checked 19 Oct against the DisasterM3 paper):**
  - **Where the base numbers come from:** the paper's Table 2 (page 7, "Bench set with optical-optical setting"), not our own CSE499A runs. That table covers only questions whose after-image is a photo.
  - **How they were decoded:** the paper runs every model in vLLM with its default settings (Appendix B.1). Its script, `support/Abrar/Implementation_DisasterM3/temp_junjue/pyscripts/run_vllm.py` (lines 240–252), takes the model's default generation config, with temperature at least 0.01. Qwen2.5-VL-7B's defaults (temperature 0.000001, repetition penalty 1.05) make that effectively greedy, like H1 V2 and V2b.
  - **Optical questions only:**

    | Task | Our 7B (greedy, H1 V2/V2b) | Base model (paper) | Paper's fine-tuned 7B |
    |---|---|---|---|
    | DSR | 37.9 | 28.3 | 37.7 |
    | DTR | 71.1 | 66.6 | 83.6 |
    | BBR | 19.5 | 4.7 | 21.5 |
    | BDC | 32.0 | 34.2 | 34.3 |
    | DRE | 32.9 | 29.3 | 29.4 |
    | ORR | 23.3 | 23.9 | 36.2 |
    | Mean | 36.1 | 31.2 | 40.4 |

  - Our 7B beats the base model by 4.9 points but trails the paper's own fine-tune (same model, same training set) by 4.3, mainly on DTR and ORR. Counting is 2.2 points short of the base, not 3.7: the 30.5% included radar questions. L0 follows this up.
  - One difference remains: H1 V2 and V2b feed 512 px images, where the paper's default is the full size.
- **Why U-Net counting stays low (H1 V1, 22.3%):**
  - It used R9. Optical after-images scored 26.5%, radar 11.3% (below the 20% of guessing).
  - Counting from the true masks scores 100%, so the masks are the problem. An answer counts separate buildings (8-connected blobs), and the wrong options are only ±20% or ±40% away (paper, page 6), so a count must land within about 10%.
  - A U-Net merges touching houses and splits damaged ones: on optical after-images the median count error is 45% for intact, 75–83% for damaged and destroyed.
  - A better pixel model helps little; counting separate buildings (R16) is the route.
- **Done when:** V1's BDC accuracy is reported with its breakdown, and V2's six-task table is complete.
- **Gate G4:**
  - V1 above 34.2% means the counting half of KR2 is met.
  - Keep V2 only if it doesn't lower any of the other five tasks by more than 1 point.

### T1 · Survivability heatmap
- **Source:**
  - [Plan] CSE499A future work (`cv2.distanceTransform` or kernel density estimation);
  - [Paper] BDAChat's damage-aware heatmap (MIT code in its repo).
- **Goal:** O3, one of KR3's four required outputs.
- **Base:** a new CPU notebook reading `d4-r9-val-predictions` (E1).
- **Build:**
  1. **Danger map:**
     - damage mask = destroyed (weight 1.0) plus damaged (weight 0.5);
     - KDE = `cv2.GaussianBlur` of the weighted mask (sigma about 25 px, tuned visually), normalised to 0–1.
  2. **Safety map:** `cv2.distanceTransform` on the inverse of the damaged-or-destroyed mask, normalised, so distance from the nearest collapse means safer.
  3. **Survivability-search priority:** KDE × (1 − normalised distance). Areas with dense collapses rank first for search.
  4. Overlay each map on the after-image (colour map plus legend).
  5. For each image, record the top-3 hot spots (centroid, area) and the 3 safest open areas.
- **Outputs:** `heatmaps/<name>_{kde,safe,priority}.png`, `hotspots.json` (feeds DisasTeller in T2 and the demo in T3), and `README.md` showing 6 example images (3 xBD, 3 other).
- **Done when:** 20 images have been checked by eye. Hot spots must sit on the ground-truth destroyed areas: report the share of hot spots that overlap ground-truth destroyed pixels.

### L1 · Edge benchmark of the U-Net
- **Source:**
  - [Plan] O4 and Research_Directions lever 5;
  - [Paper] AWQ (low-bit deployment);
  - Tamanna's [Plan 1](Tamanna_task_2/Plan_1/Plan_1_Edge_Model_Compression.md), which already lays out the steps.
- **Goal:** O4 — a measured speed, memory and accuracy table for the segmenter.
- **Base:** Tamanna's Plan 1, run on a laptop CPU (and optionally a Kaggle CPU notebook as a second machine).
- **Build:**
  1. Export R9 to ONNX: a fixed 1024×1024 input, opset 17.
  2. Quantise with ONNX Runtime: dynamic INT8, plus static INT8 calibrated on 100 *training* images.
  3. On the 645 validation images, compare PyTorch FP32, ONNX FP32 and the two INT8 versions on:
     - file size;
     - peak RAM;
     - milliseconds per image (median of 3 runs, with a warm-up);
     - mIoU and Destroyed IoU.
- **Outputs:** `edge_benchmark.csv`, a speed-against-accuracy plot, and `README.md` with the CPU model.
- **Done when:** all four rows are measured on the same machine. INT8 is usable if Destroyed IoU drops by less than 0.01.
- **Results:**
  - **L1 and L1b (18–19 Oct, R9 after-only U-Net):** static INT8 `keep 1+3 FP32` passes (`33 MB`, `1.43×` ONNX FP32, `1.6 s/image`, Destroyed IoU drop `0.0003`; [L1B-results/L1b/](Champion_Task/L1B-results/L1b/README.md)).
  - **L1c (18 Nov, R11 6-channel before+after U-Net):** static INT8 `keep 1+3 FP32` (`r11_int8_static_keep1_3.onnx`, `33,163,619` bytes, `33.2 MB`) passes at `1.35×` ONNX FP32 (`1,751 ms/image` vs `2,364 ms`), Destroyed IoU drop `0.0014` on all 645 and `0.0011` on the 605 clean pairs ([L1C-results/L1c/](Champion_Task/L1C-results/L1c/README.md)).

## 5. Phase B: next week, structural training runs

Each run changes **one thing** from its base and follows the keep rule in §3.

### R11 · Before + after input (6 channels), the main bet
- **Source:**
  - [Plan] Phase2_Plan §4 and research lever 1;
  - [Paper] the xView2 winners (all of the top 5 used both images), BRIGHT Table 7 (the before image raises Destroyed IoU from 59.5 to 64.9), and TEOChat.
- **Goal:** O1. Let the model see where a building stood before it became rubble.
- **Base:** copy [d4-champion-model-R5.ipynb](Champion_Task/d4-champion-model-R5.ipynb) (sampler, no copy-paste). Copy-paste would put rubble into the after-image where the before-image shows nothing, so it's left out.
- **Changes:**
  1. Cell 4: keep `pre_image_path` in each pair. It's resolved like `post_image_path`.
  2. Cell 5: load both images, apply the **same** crop, flip, rotation and brightness change to both (Albumentations `additional_targets={"pre": "image"}`), normalise each, and stack them into 6 channels.
  3. Cell 8: change `in_channels=3` to `in_channels=6` in `build_model`. smp adapts the pretrained first layer.
  4. TTA needs no change, because the flips and rotations act on every channel.
  5. Add a preset `"R11": dict(use_sampler=True, in_channels=6)` and set `EXPERIMENT = "R11"`.
- **Check first:** overlay 10 before/after pairs per source (xBD and other) and confirm they line up. If shifts are larger than about 5 px, note them in the README.
  - Measured in Ridita's audit (pushed 25 Oct): 52% of 2,966 measurable pairs are shifted by more than 2 px, 10% by more than 5 px, the worst by 56 px. Aligning the pairs first is a candidate R11 variant ([Task_Ledger §9](Task_Ledger.md)).
- **Outputs:** the usual D4 outputs, as `D4_R11.csv` and so on.
- **Done when:** compared with R5 (0.5354 / 0.2898; TTA 0.5391 / 0.2917) and R9, using the keep rule.

### R12 · Add the 1,007 leak-safe xBD tiles
- **Source:** [Plan] Phase2_Plan §4 (the training half of Task D5) and [Paper] xBD.
- **Goal:** O1. More destroyed examples: 8,021 destroyed polygons, 3,472 from D5's 1,007 tiles and 4,549 from D5b's 612 tier3 tiles (added 19 Oct, option A).
- **Base:** R11's 6-channel recipe (chosen 19 Oct). Built as `d4-champion-model-R12.ipynb`, a copy of `d4-champion-model-R11.ipynb`.
  - **Masks:** from D5's and D5b's outputs (`D5-results/`, `D5b-results/`, uploaded as one Kaggle dataset). Their lookup tables are the same, `[0, 1, 2, 2, 3, 255]`.
  - **Images:** from Bojan Tunguz's two xView2 copies on Kaggle (`xview2-challenge-dataset-train-and-test` and `xview2-challenge-dataset-tier-3-data`, attached on import), so only the masks need uploading.
- **Changes:**
  1. Append the 1,619 tiles (D5's 1,007 and D5b's 612) to `train_pairs` only. Cell 4b stops if either pool is missing.
  2. Make the loss ignore pixels marked 255: `ignore_index=255` in both smp losses (Focal Tversky and Lovász). Cell 7 checks that ignored pixels don't change the loss.
  3. Keep 5,798 samples per epoch, so the change is "more data", not "more training". With the sampler on, compute the image weights over the combined list.
  4. Set `EXPERIMENT = "R12"`.
- **Outputs:** `D4_R12.csv` and so on.
- **Benchmark rule:** 1,059 of the tiles are DisasterM3 benchmark images (447 from D5, all 612 from D5b), so R12 never answers benchmark questions; R16 (with R11) does.
- **Done when:** compared with R11 (0.5811 / 0.2911; TTA 0.5875 / 0.2965) and R9 under the keep rule. Per-event Destroyed IoU from E1's code shows whether the gain comes from the events the new tiles cover.
- **Result (19 Oct, second run, after the one-line fix to Cell 4b), not kept:**
  - Trained on 7,417 images, including the 1,619 extra tiles.
  - mIoU 0.5820 (TTA 0.5883) and Destroyed IoU 0.2898 (TTA 0.2945). That is within noise of R11.
  - 8,021 more destroyed buildings didn't move the destroyed class, so more examples of it isn't the lever. That fits E1: most missed destroyed pixels are predicted as background.
  - R11 stays the champion recipe. R12 must never answer benchmark questions.
- **E4 (19 Oct), R12 against R11 by source and event:**
  - On xBD images R12 gains only +0.007 Destroyed IoU (within noise), but per event the gain follows the extra data (rank correlation +0.73; Palu +0.047).
  - **The real cause of O1's gap:** Turkey's earthquake holds 37% of the validation's destroyed pixels and R11 scores 0.000 there, calling 91.5% of them intact. Training holds 3.75 million Turkey destroyed pixels, so more data isn't the fix.
  - Without Turkey, R11's Destroyed IoU is 0.410.
  - R16's grader finds 72–83% of Turkey's destroyed pixels; see R16c.

### R13 · BRIGHT pre-disaster footprints (optical only)
- **Source:** [Innovation] Ridita's BRIGHT plan and roadmap (`BRIGHT_DisasterM3_Integration/`), and [Paper] BRIGHT.
- **Goal:** O1. Better building finding, which helps if E1 shows that many destroyed pixels are missed as Background.
- **Base:** copy `d4-champion-model-R5.ipynb`.
- **First fix the script issues** (Paper_Audit §2.2):
  1. Never load BRIGHT's post-disaster files; they're radar.
  2. Pair each pre-disaster image with a **footprint** mask, where any building is class 1 (Intact, which is true before a disaster). Never pair it with damage classes.
  3. **No BRIGHT event is missing from DisasterM3** (checked 19 Oct against its train and benchmark lists, which record each picture's sensor). Skip the 7 events that have optical after-images there: Turkey, Morocco, Libya, Beirut, Bata and Hawaii (in our training data) and Noto (in the benchmark). The other 7 appear in DisasterM3 only as radar questions, which our optical U-Net can't answer, so their before-images are safe to use. List the events used in the README. Ridita's converted set (5 events) includes Noto, so drop its tiles.
  4. Don't use AIDER; it has no masks.
- **Open question for the 6-channel recipe:** a BRIGHT tile has no optical after-image. Either put the before-image in both slots (a no-change pair, where every building is intact) or train R13 on the 3-channel recipe. Decide when R13 is built.
- **Change:** append the BRIGHT tiles to training only, and keep 5,798 samples per epoch.
- **Run when:** after R12. It's lower priority, because it adds only intact buildings.
- **Ridita's audit (pushed 25 Oct):** the five usable events don't leak, but 1,056 of their 1,285 tiles are volcano scenes, against 8 volcano pairs in validation. Expect little change in Destroyed IoU.

### R14 · Rubble-centric crop mining (optional)
- **Source:** [Innovation] Ridita's roadmap, Innovation 1.
- **Goal:** O1.
- **Base:** copy `d4-champion-model-R9.ipynb`.
- **Change:** when an image contains destroyed pixels, centre the 768 crop on a random destroyed pixel 60% of the time (with a random offset of up to ±200 px). Otherwise crop at random.
- **Caveat:** this is another data-sampling tweak, and the sampler and copy-paste already moved Destroyed IoU only to the noise level. Run it only with spare quota.

## 6. Phase C: champion and fallback

### R15 · Combined champion and second seed (R15s7)
- **Source:** [Plan] Phase2_Plan §4 and §6.
- **Goal:** O1, the gate claim.
- **Build:**
  1. Combine everything from R11 to R14 that passed the keep rule (plus E2 voting if it was adopted).
  2. Train with seed 42 (R15), then repeat with seed 7 (R15s7).
  3. Claim the gate only if both runs, or their mean, are above 0.30. Say whether that's with TTA.
- **Cost:** about 16 GPU-hours on two accounts in parallel.
- **Status (20 Oct):** nothing beyond R11 has passed the keep rule (R12 added nothing; R13 and R14 haven't run), so R15 would be R11 itself and isn't built.
  - R11's second seed runs as **R11s7**, by the naming rule: a seed repeat keeps the run's name plus `s7`, and a new number is only for a new recipe.
  - The O1 candidate is R16c's find-then-grade map on R11 (step 2) and on R11s7 (step 3).
  - R15 comes back only if a later change passes.

### R16 · Find-then-grade: find buildings, then grade each one
R16's two parts are **the finding** (which buildings are there) and **the grading** (each one's damage grade). Named so on 20 Oct, replacing "stage 1/2", so that "step" is used only for a task's steps.
- **Source:**
  - [Paper] xView2 1st place, BRIGHT (find-then-grade models beat one-step ones: 67.6 against 64.9 mIoU), and BDAChat (pairs before and after crops per building);
  - [Plan] the find-then-grade fallback in Phase2_Plan and the SAM 3 test plan (Research_Directions §7.4);
  - [Innovation] Ridita's "Footprint-guided damage cascade".
- **Goal:** O1, O2 and O3. **Decided 19 Oct: R16 runs regardless of R12.** If R12 passes the gate, R16 becomes an add-on rather than the fallback, for four reasons:
  - **one grade per building:** counting questions (O2) become simple counts, where counting blobs on the U-Net's pixel map scored only 22% (H1 V1), and DisasTeller's reports (O3) need a per-building list;
  - **clean for the benchmark:** it trains only on DisasterM3's training data, so unlike an R12 trained on exam pictures it can answer benchmark questions;
  - **a different fix for "missed as background":** it finds buildings in the before-image, so rubble or lava in the after-image can't hide them;
  - **cheap:** about 3 GPU hours.

  It is still the fallback if R15 misses the gate.
- **Build:**
  1. **The finding:** G3 passed, so buildings come from SAM 3 on the pre-image (`pre_grid2`), plus the U-Net's building pieces that SAM 3 missed. The U-Net is R11, run inside the notebook. E3 measured that SAM 3 together with R9 covers 86% of destroyed buildings' footprints.
  2. **Crops:** for each building, a square crop of the before and after images with a 16 px margin, resized to 96 px (128 px would need about 14 GB of crops), plus the building's mask as a 4th channel. Training buildings are the 8-connected pieces of each class in our masks, so each has one grade: every damaged and destroyed piece, and at most 12 intact pieces per image. BDAChat's `sgts.py` is a reference for the pairing.
  3. **Grader:** a Siamese ResNet-18 (shared weights) that combines [before, after, after − before] and outputs 3 classes. Train with balanced grades for 10 epochs and keep the last epoch; the whole notebook takes about 1 GPU hour.
  4. **Scoring:** paint each building's mask with its predicted class and score with the E-protocol. Also compute object-level macro F1 to compare with BDAChat's 0.763.
  5. **Combined test:** label each building by a vote between the grader and the best U-Net's pixels inside it. Measure it rather than assume it helps: E2's per-building vote on R9 alone lowered Destroyed IoU from 0.292 to 0.228, though R16's building outlines come from a better source. For the O1 score, combine with the best U-Net (R12 if it passes). For benchmark questions (O2, O3), combine only with a U-Net that never trained on benchmark pictures (R11), so the combination stays clean.
- **Done when:** R16 alone and R16 combined with the best U-Net are both scored against R9 and R11.
- **Built 19 Oct:** `Champion_Task/r16-find-then-grade.ipynb` (named `r16-two-stage-grader` until 20 Oct, here and on Kaggle). Build item 4's object-level F1 is measured on the true validation buildings, so it isolates the grader.
- **Result (19 Oct), not kept:**
  - The best Destroyed IoU is 0.261 (the vote), against R11's 0.297 with TTA; SAM 3 + grader alone reaches 0.167.
  - The grader's macro F1 on the true buildings is 0.656 (BDAChat 0.763). Its balanced training over-grades intact buildings: destroyed precision 0.35, recall 0.89.
  - On the 85 non-xBD images, SAM 3 + grader doubles R11's Destroyed IoU (0.128 against 0.071).
  - **Next:** correct the grader by the real grade shares (CPU, from `instances_val.csv`).
- **R16b, the correction (19 Oct, on your PC, 7.3 min), not kept:** `Champion_Task/r16b-grader-prior-correction.ipynb`.
  - **Rule:** each grade's probability is multiplied by its share among the training buildings (intact 73.7%, damaged 18.4%, destroyed 8.0%) and divided by a third. Nothing is fitted on validation, and R16's scores were first rebuilt exactly from its per-building table.
  - **Pixel scores:** every R16 map improves. SAM 3 + grader goes from Destroyed IoU 0.167 to 0.228, and the vote from 0.261 to 0.274 with mIoU 0.585. R11 with TTA stays ahead (0.297 and 0.588).
  - **Over-grading mostly gone:** among the found buildings that are mostly one true building, intact buildings graded destroyed fall from 3,539 to 1,500, and macro F1 rises from 0.597 to 0.692.
  - **Next:** counting with the corrected grades (H1 V3) needs SAM 3 and the grader run on the benchmark images.
- **R16c, a rigorous test of the find-then-grade idea** (go given 19 Oct, after you asked to test R16 more rigorously). Its steps were renumbered 1–5 on 20 Oct: step 3 was 2b, step 4 was 3a, step 5 was 3b.
  - **Step 1, the ceiling and a counting check** (your PC, 2.6 min): `Champion_Task/r16c-step1-ceiling-and-counting.ipynb`.
    - Give each found building its main true grade, as a perfect grader would. SAM 3 + R11's pieces then reach mIoU 0.766 and Destroyed IoU 0.614 (0.798 and 0.661 if it may also reject non-buildings). R16b's grader gets 0.541 and 0.208.
    - So the outlines are good enough; the grader loses most of the score.
    - Counting, on the 1,055 validation counting questions:
      - R11's blobs: 39.2%;
      - R16's best map: 36.9%;
      - a perfect grader: 55.3%.
  - **Step 2, a stronger grader** (Kaggle, about 2 h): `Champion_Task/r16c-step2-stronger-grader.ipynb`, a copy of R16's notebook.
    - 128 px crops with a 32 px margin, 20 epochs, two seeds.
    - The epoch and a bias per grade are picked on 580 held-out training images, never on validation.
    - It is scored against R11 TTA (keep rule) and against the ceiling (the share of the gap closed).
  - **Steps 4 and 5, the grader on SAM 3's own outlines** (planned only if step 2 fell short; run as a stretch by your decision of 20 Oct):
    - Step 4, `Champion_Task/r16c-step4-sam3-training-images.ipynb`, runs SAM 3 on the 5,798 training images (about 3.5–4 h).
    - Step 5, `Champion_Task/r16c-step5-grader-on-sam3-outlines.ipynb`, is step 2's notebook with `TRAIN_OUTLINES = "sam3"`: the grader trains on SAM 3's own outlines. A 4th label, "None", lets it reject outlines that are mostly background.
    - Step 5 replaces step 2 only if it beats step 2's kept map on both seeds by the keep margin.
  - **Step 3, step 2's graders with R11s7's pieces:** `Champion_Task/r16c-step3-r11s7-pieces.ipynb`, evaluation only, after R11s7. It gives the O1 claim its second U-Net seed.
  - **Done when:** a map is kept on both seeds (then it becomes the O1 candidate, checked on R11s7 in step 3, and H1 V3 counts with it), or step 5 also falls short and the find-then-grade route is closed with these numbers.
  - **Watch Turkey (found with E4, 19 Oct):**
    - On Turkey's 64 validation images, R16's grader finds 72–83% of the destroyed pixels where R11 finds none. Its Destroyed IoU there is 0.13, or 0.19 with R16b's correction, held down by over-grading intact buildings.
    - Step 2's per-building table gets the same Turkey breakdown after the run.
  - **Step 2 result (20 Oct, 1.4 h on account 1): kept on both grader seeds, and the O1 gate passes on both.**
    - SAM 3 + R11's pieces: mIoU 0.587 and 0.585, Destroyed IoU 0.316 and 0.311 (R11 with TTA: 0.588 and 0.297).
    - The grader's macro F1 on the true buildings is 0.778 and 0.784.
    - It wins on Turkey (0.000 → 0.24–0.27) and loses on xBD images (0.456 → 0.35–0.38).
    - Counting on the validation questions stays at R11's level (37–39%).
    - **26 Oct: at risk (E5).** These scores include leaked validation pairs. Without the 21 found so far, the four combinations of steps 2 and 3 score 0.2915–0.3070.
    - The gate is so far on one U-Net seed (R11). Step 3 re-scores the same graders with R11s7's pieces.
    - Results in `Champion_Task/R16c-results/step2/` (Kaggle's output folder: `R16c-truth`).
    - **26 Oct, clean (E5's 40 pairs removed):** steps 2 and 3 score 0.2838–0.2980, so they fail the gate.
  - **Step 5 result (26 Oct, 3.8 h on account 1): it doesn't replace step 2.**
    - Its SAM 3 + R11 map scores 0.2434 and 0.2158. The grader, trained on SAM 3's outlines, over-calls R11's pieces as destroyed.
    - **Its SAM 3-only map passes O1's gate on all 645 pairs (0.3347 and 0.3242) and on clean data (0.3161 and 0.3051), at mIoU 0.547.** It isn't kept against R11, because its mIoU is 0.035 lower.
    - The Destroyed bias hit the search grid's edge (−4.0) in 38 of 40 epoch searches, so a wider grid is a possible next try.
    - Results in `Champion_Task/R16c-results/step5/`.
    - **Step 5b, a third grader seed (44): done 27 Oct (account 1, 2.3 h).** Seed 44 scores 0.2982 on the clean pairs (0.3156 on all 645), so O1 on clean data is met on the three-seed mean only (0.3065), narrowly. Results in [R16c-results/step5b/](Champion_Task/R16c-results/step5b/README.md).
      - Its verdict rule, fixed before the run: all three seeds above 0.30 on clean data means met; otherwise met on the mean only; otherwise not met.
      - [r16c-step5b-third-grader-seed.ipynb](Champion_Task/r16c-step5b-third-grader-seed.ipynb).
    - **Step 6, aligned crops for the grader: done 18 Nov (account 1, 18 min).** Shifting the after-photo back by phase correlation at grading time does not help the three step-5/5b graders on the 605 clean pairs: V1 (pair-aligned) scores 0.3048 Destroyed IoU and V2 (pair + local shift) 0.3014, against V0's 0.3066 (10,000 redraws of V1 minus V0: −0.0018, 95% interval −0.0072 to +0.0029, `passes: false`). Results in [R16c-results/step6/](Champion_Task/R16c-results/step6/README.md); [r16c-step6-aligned-crops.ipynb](Champion_Task/r16c-step6-aligned-crops.ipynb).
    - **Step 7, super-resolved crops for the grader (our supervisor's SR suggestion, Research_Directions §8.8): built 20 Nov; run 20 Nov on account 4 (4.7 h). It doesn't pass, and SR is closed for the grader.** Destroyed IoU 0.3066 → 0.3025 (Swin2SR) and 0.3006 (Real-ESRGAN), and macro F1 0.732 → 0.715 and 0.701, both worse beyond noise ([results](Champion_Task/R16c-results/step7/README.md)). [r16c-step7-super-resolved-crops.ipynb](Champion_Task/r16c-step7-super-resolved-crops.ipynb). Step 6's design with one change: a building whose longest side is under 48 px takes its crops from photos enlarged 2× by Swin2SR (S1) or Real-ESRGAN (S2). Everything else stays as in V0, with the same three graders and no training.
      - **Scores:** destroyed IoU on the 605 clean pairs, and the graders' macro F1 on the true validation buildings.
      - **Rule, fixed before the run:** the better of S1 and S2 passes only if its destroyed IoU gain over V0 is above noise (10,000 redraws, as step 6). If it passes, step 7b confirms it once on the test pairs, and a grader retrained on SR crops becomes the next candidate.
      - About 1–2 GPU hours, estimated. Its smoke test prints a better estimate.

## 7. System track: in parallel, mostly no segmentation training

### H2 · Per-building table and SQL counting agent
- **Source:** [Paper] DamageScope (SQLite + vector store, with an LLM choosing the query) and Change-Agent.
- **Goal:** O2 and O3. Exact answers to questions like "how many destroyed buildings within 100 m of X", without the VLM counting pixels.
- **Build:**
  1. From R9's predictions (E1), build one SQLite row per building blob: image, ID, class, area, centroid, bounding box, and the distance to the nearest destroyed building.
  2. Give our Qwen (or a small local LLM) the table schema and let it write SQL for a question.
  3. Run the SQL and have the model phrase the answer.
  4. Test on 100 BDC questions and compare with H1 V1.
- **Outputs:** `buildings.sqlite`, `agent_eval.csv`, `README.md`.

### H2b · Graded test of the SQL agent (added 22 Oct)
- **Why:** H2's 100 counting questions all need the same query, so they can't separate the models. Counting needs no model at all (a fixed query does it), and a second model costs memory on low-resource hardware.
- **Source:** [Paper]
  - Zhong, Yu & Klein, EMNLP 2020 (test-suite accuracy);
  - TrustSQL and the EHRSQL 2024 shared task (refusals and the RS(10) reliability score);
  - Dr.Spider, ICLR 2023 (robustness to rephrasing);
  - DAIL-SQL and Rajkumar et al. (the prompt format);
  - Self-Debugging, ICLR 2024 (retries with the error message).
- **Goal:** O2, O3 and O4. Decide which model, if any, writes SQL in the deployed system.
- **Build:** [h2b-sql-agent-graded-test.ipynb](Champion_Task/h2b-sql-agent-graded-test.ipynb).
  - **Questions:** 29 answerable questions in 12 groups, each in 3 phrasings on 3 images, plus 12 the tables can't answer; 297 items in all.
  - **Grading:** on 5 versions of H2's table.
  - **Models:** our 7B, the base VL-3B (L2's student), Qwen2.5-Coder 1.5B and 3B, each in 4-bit and fp16.
- **Decision rule (fixed 22 Oct):**
  - A configuration passes at 90% or more test-suite accuracy and RS(10) above 0.
  - Our VLM writes the SQL if it passes in 4-bit.
  - Otherwise the smallest passing separate model is the fallback, with its memory cost.
  - If nothing passes, fixed queries only.
  - Re-run on the distilled 3B after L2.
- **Outputs:** `summary.csv`, `by_group.csv`, `pairwise.csv`, `decision.md`, `README.md`.
- **Result (23 Oct, Noman's account, 47 min): done; no configuration passes, so the system answers through fixed queries only.**
  - Our 7B in 4-bit: 69.0% [57.1, 80.5], RS(10) −89.6, with the most refusals of unanswerable questions (94%). The best accuracy was Coder-3B in fp16's 73.9%, and every RS(10) was negative. The base VL-3B in 4-bit: 46.4%.
  - Weak for every model: pairs of buildings, the "no destroyed building nearby" NULL case, positions and distances.
  - The re-run on the distilled 3B is needed only if free-form questions come back. Details in [Task_Ledger.md](Task_Ledger.md) and [H2b-results/H2b/](Champion_Task/H2b-results/H2b/README.md).
  - Why a framework's SQL agent (LangChain's) wouldn't change this, and what could bring free-form questions back: [System_Design_Notes.md §3](System_Design_Notes.md).

### H2c · Free-form questions, second try (added 24 Oct)
- **Why:** H2b's models failed the bar zero-shot. In the literature, models passed a similar bar only with in-domain training and an abstention gate. In EHRSQL 2024, fine-tuned 3B and 7B models scored 44 at RS(10), while a prompted-only 7B scored −713 ([System_Design_Notes.md §3.5](System_Design_Notes.md)).
- **Source:** [Paper] the EHRSQL 2024 shared task (fine-tuning plus a gate); TrustSQL (retrieved examples, and the five-sample agreement gate).
- **Goal:** O3 and O4: free-form numeric questions in the system, if they can be made reliable.
- **Build:**
  1. **Question–SQL pairs for our table** (CPU): question templates times paraphrases, each checked by running its reference query on H2's table. Paraphrase writing can go to teammates, since a script checks every pair.
  2. **Fine-tuning:** a separate LoRA adapter on the final 3B (after L2), or on the 7B if L2 isn't ready. The main model stays untouched.
  3. **Retrieval:** similar solved pairs go into the prompt (TrustSQL's SQLPROMPT).
  4. **Agreement gate:** sample five queries, and answer only if they agree (TrustSQL's VOTING); otherwise refuse.
  5. **A new question set,** written before any run, with unseen question types and unanswerable questions, graded like H2b (test suites, five table versions).
- **Decision rule (fixed 24 Oct, before any run):** it passes with at least 90% test-suite accuracy and RS(10) above 0 on the new set. Also reported: RS at 0, 5 and 10, a risk–coverage curve with its RC-AUC (as defined in TimeSpot, ICML 2026; [Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md)), and first-try accuracy.
- **If it passes:** free-form numeric questions ship with the gate, labelled as model answers.
- **If it fails: fall back to the system as it was.** Fixed queries and the question templates stay; the adapter is dropped; nothing else changes.
- **Order:** after L2 (the agreed order is T2, T3, L0, L2 first). The question–SQL pairs can be built earlier, on CPU.

### H3 · VLM input upgrades (variants in the H1 harness)
- **Source:**
  - [Paper] TEOChat (before and after images with image labels), GeoPixel (numbered marks, tiling) and ImageRAG (send full-resolution crops of the relevant areas with their coordinates);
  - Tamanna's [Plan 2](Tamanna_task_2/Plan_2/Plan_2_Visual_RAG_Patch_Zooming.md), which already describes the crop step.
- **Goal:** O2, KR2's "higher-resolution VLM".
- **Variants** (each scored on the six tasks like V2):
  - **V3:** before and after images labelled "Image 1 (before)" and "Image 2 (after)".
  - **V4:** numbered marks drawn on each detected building, so the VLM can say "building 12".
  - **V5:** the full image plus up to 4 full-resolution crops of the most damaged areas, each with its pixel box.
- **Done when:** a variant is kept only if it beats V2 on some task without lowering the others.

### H4 · GEOBench-VLM external counting test
- **Source:** [Paper] GEOBench-VLM (ICCV 2025). Its damaged-building counting is scored at 56.7% for GPT-4o and 50.0% for Qwen2-VL.
- **Goal:** O2 — a third-party check of hybrid counting.
- **Build:**
  1. Download the benchmark from its GitHub (`The-AI-Alliance/GEOBench-VLM`).
  2. Take the xBD damaged-building-counting and disaster-type questions.
  3. **First** check that their xBD tiles don't overlap our training tiles. Report the overlap and score only the clean ones.
  4. Run H1 V1 and V2.
- **Built 21 Nov (Abrar's go: "T2b, then H4"),** as [h4-geobench-xbd-counting.ipynb](Champion_Task/h4-geobench-xbd-counting.ipynb) on account 4. Its inputs are in [H4-inputs/](Champion_Task/H4-inputs/): the questions, the PC's hashes and the package list.
  - **The questions:** GEOBench-VLM's xBD questions at a pinned revision: 1,050 damaged-building counting questions on 210 before-and-after pairs (five per pair: no damage, minor, major, destroyed, damaged of any level), and 2 × 210 disaster-type questions. The published scores to compare with (its Table 3): GPT-4o 56.67%, Qwen2-VL 50.00%.
  - **The photos:** GEOBench doesn't ship xBD's photos, and the PC has only xBD's training set. So they come from a public Kaggle copy of full xBD (`qianlanzz/xbd-dataset`, Abrar's choice). That copy's 5,598 training photos must be the same photos as the PC's copy, or the run stops.
    - *(21 Nov, 07:26: the first smoke test stopped at this check. The copy's `tier1/` folder holds the same files, but only 28 of 5,598 are byte-identical; a PNG saved again with other compression differs in bytes, not in the photo. The check now passes on the same bytes or the same decoded pixels, E5's pixel hash, in whichever of the copy's folders holds them. The second smoke test runs from 07:33.)*
  - **Overlap:** E5's fingerprints and near-copy rule, against all of DisasterM3 Instruct's photos. Only clean pairs are scored.
  - **Our counting** is C4 on xBD photos: R11 with 8-view TTA, blobs of at least 20 px, then the nearest option, as in E7. Minor and major have no class of their own, so they get the damaged count; this mismatch is reported apart.
  - **Our 7B** answers with the DisasterM3 authors' prompts and scorer, as in L2 step 4. Each counting question is also asked without its options, for a number.
  - **Found while building: accuracy on these options can't show counting well.** GEOBench builds the options around the true count, and the true count is 0 in 49% of the questions. So rules that never see the photo score: the middle option 37.4%; the smallest option 49.2%, about Qwen2-VL's published score; a rule that knows only the question type 68.9%, above GPT-4o.
  - **Found in the third smoke test, fixed before the full run:**
    - GEOBench's "damaged, any level" answer counts every building, undamaged ones included: on all 210 pairs it equals no damage + minor + major + destroyed, against its own wording. So those questions are reported apart (our count of all buildings), and the rule uses the no-damage and destroyed questions.
    - Asked for a number, our 7B begins a sentence, which the 8-token limit cut off. It now gets 64 tokens, and the first number counts.
    - The smoke test also found 5 of its 10 pairs in DisasterM3 Instruct with the same pixels.
  - **The rule, fixed before the run:** on the clean pairs' no-damage and destroyed questions (the types our classes can answer and whose answers mean what they say), our counting holds only if both of these pass:
    1. its accuracy beats our 7B's (McNemar, p < 0.05);
    2. its count is closer to the true count than the 7B's own number more often than not (sign test, p < 0.05).
  - **Expectation, fixed before the run:**
    - the copy check passes;
    - the overlap isn't predicted;
    - our counting 35–55% and our 7B 25–45%, so both tests pass;
    - both below the question-type rule (65.7% on the no-damage and destroyed questions);
    - our 7B at least 55% on disaster type.
  - **Done 21 Nov (73 min): the rule fails.** [Results](Champion_Task/H4-results/H4/README.md).
    - **Overlap:** 119 of 210 pairs are in DisasterM3 Instruct; 91 clean pairs are scored.
    - **On the 182 clean questions:** accuracy, ours 36.3% against the 7B's 50.0% (the 7B ahead); closer count, ours 110 times against 54 (ours ahead). The question-type rule gets 77.5% on them.
    - **So GEOBench's xBD counting can't support the claim either way.** O2 stays on DisasterM3's clean benchmark. Our 7B's disaster type falls from 61–72% on leaked pairs to 35–46% on clean ones.

### H5 · Honest count ranges (Tamanna's Plan 3, approved 24 Nov)
- **Source:** [Plan] Tamanna's [Plan 3](Tamanna_task_2/Plan_3/Plan_3_Honest_Count_Ranges.md); [Paper] split conformal prediction (Angelopoulos and Bates, 2021), per group (Mondrian).
- **Goal:** O2 (a counting score that answer options can't inflate) and O3 (every count in the reports and on the website says how sure it is).
- **What:** every count C4 prints gets a likely range, for example "about 52 (likely 9 to 95)", set on validation per hazard and widened when R11 and the grader disagree. CPU only.
- **Approved 24 Nov (Abrar's go), with three changes before the test run:**
  1. honest wording: 78% on photos with destroyed buildings beside the 92% overall; no "99.7%" from 5 photos; 1.56× on destroyed beside 3.15×;
  2. a zero is worded "none found" (about 1 in 8 "0 to 0" ranges hides a destroyed building);
  3. `ranges.json` and `question_ranges.json` committed before any test file is opened.
- **Steps:** her plan's section 6: reproduce (done on the PC, 24 Nov), extend on validation and freeze the variant by her rule, build `count_ranges.py`, then one test run. Her section 7 fixes the expectations and the keep rule: the ranges go into reports and the website only if photo-level test coverage is at least 0.85.
- **Test files:** private Kaggle dataset `tamannamou123/h5-inputs` (R11's test maps and E6's four-class masks).
- **Checked 24 Nov:** her pilot reproduces to 3 decimals; split by photo, 3.12× instead of 3.15× ([ledger, H5](Task_Ledger.md#h5--honest-count-ranges-tamannas-plan-3-approved-24-nov)).

### T2 · DisasTeller on local models
- **Source:** [Plan] the CSE499A future work "DisasTeller backend swap" and KR3.
- **Goal:** O3 — no Gemini calls.
- **Base:** `support/Ridita_Integration_of_VLM__/DisasTeller/`.
- **Build:**
  1. Serve our fine-tuned Qwen with vLLM on 2×T4 (OpenAI-compatible server).
  2. Point CrewAI's LLM at it instead of `gemini/gemini-3.1-flash-lite`.
  3. Replace the three image tools' `genai.GenerativeModel` calls with local Qwen calls.
  4. Replace `gemini-embedding-001` with a local sentence-transformers model, and rebuild the Chroma database of guidelines. **Built by Ridita (25 Oct) as hybrid search:** [Offline_RAG_KR2/](Offline_RAG_KR2/README.md) holds 405 cited sections from six sources.
     - Each question is ranked by meaning (MiniLM embeddings) and by keywords (BM25), and the two rankings are merged by reciprocal rank fusion.
     - Keywords catch exact terms ("ASR level", "possible damage") that a long section's embedding can blur.
     - It isn't wired in or tested on report questions yet ([Task_Ledger §9](Task_Ledger.md)). *(27 Oct: wired into Ridita's offline DisasTeller copy, `Offline_RAG_KR2/disasteller_offline/`, and tested in 4b.)*
  4b. **Retrieval test before wiring it in** (added 26 Oct):
     - 30 real report questions, each with the sections that should come back, written before any search runs.
     - Pass: an expected section in the top 3 for at least 24 of 30.
     - Report the hits for meaning alone, keywords alone and the hybrid, so the hybrid's gain is measured rather than assumed.
     - If meaning alone does as well, the simpler search is kept.
     - **Done 27 Oct (Ridita), checked 28 Oct: passed, 27 of 30** (meaning alone 20, keywords alone 25, so the hybrid stays). The Kaggle path gives the same top 3 on all 30, and a Kaggle run with the internet off found everything it needed.
  5. Feed the agents per-building facts (H2) and hot spots (T1) as text.
     - *(4 Nov: Ridita's `disasteller_inputs.py` loads both, but the main script doesn't call it yet. Two things to change when it's connected:*
       - *Read the chain's table and hot spots (§1b, E7). Today's two files share only 7 images. (19 Nov: ready, E7 step 3's `buildings_c4.sqlite` and `hotspots.json`, both from C4 on the 2,065 test photos. On xBD photos a row is a patch that can hold several buildings.)*
       - *An image missing from the table returns all zeros with status "ok", so a report could state "0 buildings". Missing data must stop the run or be stated as missing.)*
     - **Done 20 Nov (Abrar), in new files; run on Kaggle account 3, internet off, 19 min** ([results](Offline_RAG_KR2/results/t2_step5_c4/README.md); [the ledger](Task_Ledger.md)).
       - [fixed_flow_c4.py](Offline_RAG_KR2/disasteller_offline/fixed_flow_c4.py) gives every report C4's facts for one test pair. The code writes the grades and the map reading, and a pair without facts stops the run.
       - Two scenes, picked by a rule: Turkey (one row per building) and an xBD wildfire pair (one row per patch). Both pass the five pass rules.
       - The counts are copied exactly on Turkey. On the xBD pair, all six reports turn "96 destroyed areas" (of 144) into "96% of the area", and the human-resource reports invent staffing numbers. A fix is Abrar's choice before step 7 (tracker, "Needs you now").
  6. Offline by default: no web tools and no "search the internet" wording unless an online switch is turned on, and new offline wording for tasks 3–6. Details and the test rule: [System_Design_Notes.md §2](System_Design_Notes.md) (recommended 24 Oct). **Done 27 Oct (Ridita) in the copy, checked 28 Oct:** offline, the web tools aren't imported or given to any agent, and CrewAI's telemetry is off. *(4 Nov: steps 1–3 are built too, on the new 7B through local vLLM. A laptop run against a stand-in server passed; Kaggle practice run 2 is next. Steps 5 and 7 are left.)*
  7. Consistency check (added 26 Oct, after TimeSpot's consistency-violation rates; [Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md)): every number in each report is compared with the fixed queries on H2's table, and the run passes only with zero contradictions. *(20 Nov: next, on C4's table, after a fix. Step 5's first look found a count turned into a wrong percentage, a garbled number and invented staffing numbers.)* **Done 20 Nov** ([notebook](Offline_RAG_KR2/t2_step7_number_check.ipynb), [results](Offline_RAG_KR2/results/t2_step7/README.md)): run 1 fails with 13 wrong and 5 unsourced numbers. Run 2, with fix (a) (the shares in the facts) and fix (b) (the same check while the model writes), passes with 0 and 0 of 191. **Proposed, a version 2 of the rule:** a damage count used as anything else, such as staff, teams or shelters, counts as wrong. Run 2 reuses counts that way 7 times. *(Later on 20 Nov: rule 2 was adopted. It finds 9 in run 2, and run 3, with rule 2 in the check while writing, still has 10, all in Turkey's staffing sections, because those sections ask for staff and shelter numbers the facts don't give. Next is Abrar's choice of fix (tracker, "Needs you now", item 4).)* **Run 4 (both fixes: requests that don't ask for numbers the facts lack, and a last guard) passes both rules with 0** ([results](Offline_RAG_KR2/results/t2_step5_c4_fix3/README.md)); the guard never acted.
- **Outputs:** the same 6 report files as the Gemini run, a log proving no external API calls (run once with internet off after setup), and `README.md` comparing them with the Gemini reports from 20 July.

### T2b · Who writes the report: the 7B or a small text model (added 4 Nov)
- **Source:** [Plan] if the model's report job is only writing from facts, a plain text model may do it as well.
- **Goal:** O3 and O4.
- **Why, from our own results:**
  - The fine-tuned 7B answers in one sentence and doesn't explain (L2's smoke test), and its weak spots are counting and grading, which the chain no longer asks of it.
  - At writing SQL, a plain text model matched it (Coder-3B 72.0%, our 7B in 4-bit 69.0%; the difference isn't clear, H2b).
  - Peak memory on a T4 in 4-bit: 7B 6.2 GB, VL-3B 2.6 GB, Coder-3B 2.2 GB (H2b). So against the 3B, the gain is simplicity (no distillation run), not memory.
  - Nobody has tested either model on report writing.
- **Needs:** T2 steps 5 and 7, the flow left by T2's practice run, and E7's table.
- **Build:**
  - The same 10 scenes from E6's clean test pairs, picked before the run and spread across events, Turkey included.
  - The same facts, the same guideline search, the same flow, seed and temperature. Image tools are off for both, so the writer is the only difference.
  - Writers: the new 7B (`AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`) and `Qwen/Qwen2.5-3B-Instruct`, a general text model. Coder-3B is the fallback; it's built for code, not prose.
  - About 3–4 GPU hours, estimated from H2b's 12–17 tokens per second and about 1,000 tokens per report.
- **Scores, per report:**
  - **Contradictions:** every number checked against the fixed queries (T2 step 7).
  - **Fake citations:** citation IDs that aren't in the index.
  - Real citations; figures correctly written as "not available offline"; whether the run finished without errors or loops; time and peak memory.
  - Reported but not part of the rule: five reports per writer, read blind by a person for usefulness.
- **Rule, fixed before the run:**
  - The text model replaces the 7B as the writer only if, across all reports, it has no more contradictions and no more fake citations, and finishes at least as many. A tie goes to the smaller model.
  - O3 names our VLM, so adopting it needs the supervisor's agreement first.
  - The six benchmark tasks stay with the VLM either way.
- **Expectation, fixed before the run:** about level on numbers, since both read the same facts. The text model writes fuller sections; the 7B's are shorter. No number is predicted.
- **Alternatives:**
  - The base 7B, which L2b already uses for explanations: worth adding as a third writer only if the 7B falls short.
  - Fine-tuning a writer on DisasterM3's report task: a new module, so it waits (§1b).
  - An AI judge or human rubric as the main score ([System_Design_Notes §2.4](System_Design_Notes.md)): both grade wording but don't check numbers exactly, so they stay secondary.
- **Built 21 Nov (Abrar's go: "T2b, then H4", on account 4):**
  - **Files:** [t2b_writer_test.ipynb](Offline_RAG_KR2/t2b_writer_test.ipynb) runs both writers; [t2b_score.ipynb](Offline_RAG_KR2/t2b_score.ipynb) scores them on the PC; [t2b_flow.py](Offline_RAG_KR2/disasteller_offline/t2b_flow.py) is step 5's flow with the photo tool off; [make_t2b_scenes.py](Offline_RAG_KR2/make_t2b_scenes.py) and [make_t2b_upload.py](Offline_RAG_KR2/make_t2b_upload.py) make the inputs. Step 5's files are unchanged.
  - **The ten scenes, by a rule fixed before any report:** for each event, its clean test pair with the most truly destroyed pixels, then the ten events with the most.
    - From the sharper photos: Libya's flood, Turkey's and Noto's earthquakes, Hawaii's wildfire and Beirut's explosion.
    - From xBD: Santa Rosa's wildfire, Palu's tsunami, and the Joplin, Moore and Tuscaloosa tornadoes.
    - Step 5's two scenes are among them.
  - **The photo tool is off for both writers.** A text model can't see photos, so the Expert report asks for the estimated damage from the facts instead of photo descriptions.
  - **The same decoding for both:** temperature 0.2 and seed 0, and repetition penalty 1.05. Qwen2.5-3B-Instruct's own top-p 0.8 and top-k 20 are switched off on its server.
  - **How the rule's counts are made (fixed before the run):**
    - **Contradictions** are the numbers step 7's check flags as wrong or misused in what the writer left after being asked again. Those are the numbers the last guard had to replace, plus any flagged in the finished reports. The guard came after this rule was written, so counting only the finished reports would give both writers 0.
    - **Fake citations** are IDs in the finished reports that aren't in the index.
    - **Finished** means all sections were written, none is an error, and the scene passes the five pass rules.
  - **Expectation, fixed before the run:**
    - both writers finish all 60 reports;
    - at most 3 contradictions and at most 2 fake citations per writer;
    - the text model's sections are at least 1.2 times longer (median), and it takes at most 0.7 times the 7B's minutes per scene;
    - which writer the rule picks isn't predicted.
  - **Account 4 doesn't have step 5's inputs, which are private on account 3.** So the run downloads both models at pinned commits, plus step 5's exact package versions, with internet on. This happens before the flow starts.
    - The flow itself runs with Hugging Face offline, and its network log must show no outside connection (pass rule 3).
    - The code, the 20 photos and an unchanged copy of the guideline index are private datasets on account 4.
  - **Dry run on the PC** (stand-ins for the model and the search): passed on all ten scenes. No question to the model carried a picture, and the facts had no photo descriptions. Each scene got its own facts in the right units, and the number check still asked again.
  - **Done 22 Nov: our 7B stays the writer** ([results](Offline_RAG_KR2/results/t2b/README.md)).
    - **The run:** both writers finished all 60 reports, and all ten scenes passed the five pass rules.
    - **The rule:** contradictions, 7B 3 and Qwen2.5-3B-Instruct 15 (the text model fails); fake citations, 3 and 0; reports finished, 60 and 60.
    - **The guard** replaced every contradiction in the finished reports.
    - **New gap in the chain:** the 7B left 3 made-up guideline IDs in two human-resource reports (none on step 5's two scenes). An ID guard like the number guard would close it. *(23 Nov: built in `fixed_flow_c4.py`. Its Kaggle check on Palu and Beirut passed: made-up IDs 3 → 0, all reports finished, the pass rules passed. [Results](Offline_RAG_KR2/results/t2b_id_guard/README.md); ledger, T2b.)*
    - **Expectation:** the 7B's contradictions (≤ 3), finishing and the 3B's longer sections met; the 3B's contradictions, the 7B's fake citations (≤ 2) and the 3B being faster missed (it was 2.9 times slower).

### T3 · Unified offline demo and public showcase
- **Source:** [Plan] the CSE499A future work "unified deployment" and O3; Tamanna's [Plan 3](Tamanna_task_2/Plan_3/Plan_3_Offline_Interactive_Demo.md); the showcase plan agreed 24 Oct, with its reasoning and what last season's winner showed in [System_Design_Notes.md §4](System_Design_Notes.md).
- **Goal:** O3 — one offline system, and a showcase the public can use.
- **Owner:** Abrar (decided 24 Oct), who also chooses the name and look later. *(16 Nov: Abrar chose the look, direction A; the name is open. Abrar builds as much of the remaining pages as he can until 17 Nov; Aryan takes over what's left from 18 Nov, by [his handover](Aryan_Task/T3_Website_Handover.md), after his review's fixes. Abrar keeps the gallery export, the deployment and the decisions.)*
- **Status (16 Nov, evening): all seven pages built, on stand-in gallery data, not deployed.** The site is [T3_Website/](T3_Website/README.md), one Vite and React project holding both pieces, started from Aryan's prototype. Built: Home, "How it works" told by scrolling, Explore (the building map with fixed questions and the 3D damage city), Try it (the field model in the visitor's browser: the same class as the native run on 100% of pixels, 4.1–5.2 s per image on Abrar's PC), Results as charts, the six real reports with their passages and citations, and About (the limitations and "Future ideas, not built"). Next, in order: the gallery export (Abrar), the first deployment, the Try it test on the booth laptop and a phone, the smaller items in Aryan's handover (section 8), then the booth API as a separate brief. What's built and what was found is in [System_Design_Notes.md §4.6](System_Design_Notes.md).
  - *(17 Nov: the handover's map and report items are done: zoom, pan, hide, search and folding panels on the building map, a card beside the pointer, print for a report, and every problem Ridita's README lists stated on the Reports page; plus a design and accessibility pass, with Lighthouse at 94–99 for performance and 100 for accessibility on all seven pages. Left for Aryan: a look on a real phone, the supervisor line, and the checks that wait for the export and for 18 Nov.)*
- **Two pieces (agreed 24 Oct):**
  1. **Public showcase site:** the project's story, from results computed in advance: before/after sliders with the damage map, videos of the live run, a building map where clicking a building shows its facts, the benchmark panel, the limitations and the team.
  2. **Interactive demo website, deployed on Vercel:** animated, with current UI/UX, running the chain below. Both pieces can be one Next.js project (a story page and a demo page).
- **3D damage city (agreed 24 Oct):** a view in the website where each building outline from the damage map is raised into a 3D block, coloured by damage class. Heights are schematic (for example, destroyed buildings drawn as low slabs), and the view is labelled as a 3D view of our 2D results, not a reconstruction. About a week, no GPU; it uses the building outlines from the gallery export.
- **Order (agreed 24 Oct):** T2, T3, L0 and L2 come before any work on Layers 2–4 of the day-1 vision ([System_Design_Notes.md §5](System_Design_Notes.md)).
- **The chain** (live at the booth with internet off; the public site shows the same steps from results computed in advance):
  1. pick a gallery image, or upload a before and after pair;
  2. the damage map (R11 with TTA on a GPU, or the INT8 edge model on a CPU); *(4 Nov: on a GPU, this becomes whichever chain E7 keeps. The INT8 model stays the CPU fallback, labelled as a lighter path. See §1b.)*
  3. per-building counts by fixed queries (H2), linked to their buildings on the map; *(4 Nov: from the same chain's table.)*
  4. the heatmap (T1);
  5. fixed question templates instead of a free-form question box (H2b);
  6. the DisasTeller report on local models (T2), shown as it's written; *(16 Nov: at the booth this needs a GPU for the 7B, or the 3B once L2 is distilled; it can't run in a visitor's browser. The link from the map to the report is Aryan's bridge, not connected and with known bugs.)*
  7. the benchmark panel.
- **How the website runs the models:** Vercel has no GPU, so the public site works from results computed in advance. At the booth, the same front end runs on the laptop and calls a local Python API that runs the chain offline. Stretch, to be tried (decided 24 Oct): the INT8 segmenter in the visitor's browser (ONNX Runtime Web), so uploads work with no server. A feasibility test comes first ([System_Design_Notes.md §4.3](System_Design_Notes.md)).
- **Base:** `support/Abrar/Implementation_DisasterM3/gradio_app.py` (already loads a U-Net and Qwen) becomes the local API's test page and the fallback if the website isn't ready. Its `share=True` opens a public tunnel, so it must be off offline.
- **Wireframes (first version 4 Nov): `Wireframes/index.html`,** eight clickable screens that work with no internet. *(18 Nov: removed, since the real site replaced them; still in git history, `git show ffc9c9968:Wireframes/index.html`. The folder moved to [Wireframes/](Wireframes/README.md) and now holds 43 screenshots of the real build of 17 Nov, with notes.)* The screens follow the chain's steps, which stay the same whichever model E7 keeps. They use sample numbers until E7, except the results screen, and they draw the honest states too: no before-photo, missing facts, "not available offline", and results computed in advance. The Stageshow skill (installed 4 Nov) makes polished product illustrations and animated demos, not wireframes, so it's for the story page later; anything made with it is labelled as an illustration, not a live run.
- **Before building:** T2's reports; a gallery export (4–6 validation pairs with masks, building facts, heatmaps and each image's accuracy); L1 repeated on R11 (R11's own INT8 export); the browser test ([Champion_Task/T3-browser-test/](Champion_Task/T3-browser-test/README.md)) repeated on the booth laptop, and on a mid-range phone once the site is on Vercel with the COOP and COEP headers; a Vercel account linked to the repository; Abrar's choice of name and look. *(16 Nov: T2's reports exist; the look is chosen; the gallery export is to be written against [DATA_CONTRACT.md](T3_Website/DATA_CONTRACT.md); deployment is now by hand with the Vercel CLI, not linked to the repository.)*

  Live mode must run with internet off after setup. A container is optional, not a key result.
- **Found 25 Nov, from Abrar's questions** (full notes in [design notes §4.7–4.8](System_Design_Notes.md)):
  - **What "Try it" gives:** a visitor's own before and after photos get a damage map, a before/after slider, the buildings found, hot spots, safe areas, a 3D view and answers to fixed questions, all in the browser.
  - **What it doesn't:** no written guidance and no report, because writing one needs our 7B, which needs a GPU the public site doesn't have.
  - **The Reports page:** it shows DisasTeller's own sample reports, about ground photos from Wajima, Japan, not ours.
  - **Options waiting for Abrar's call, cheapest first:**
    1. written guidance produced by code in the browser, from the visitor's own map (recommended; about half a day);
    2. the 12 reports our own system wrote on 20 Nov for two test pairs, shown on the site (a few hours);
    3. real reports for uploads, from our system on the booth laptop through a helper program not built yet (needs a GPU laptop to be quick);
    4. a small language model inside the browser (not recommended).
  - **Also noted:**
    - an optional "more accurate" setting that averages 8 turned copies of the photos (about 8 times slower, for about +0.007 mIoU);
    - "Try it" with an after-photo alone, using the after-only model (R9);
    - a plain statement of who the system serves: rescue coordinators with satellite or straight-down aerial photos, not rescuers with phone photos;
    - a test on drone photos with RescueNet's labels.

### L0 · A better 7B teacher before distilling
- **Decided 19 Oct:** improve the 7B first, then distil (L2). A student learns from its teacher, and ours trails the paper's own fine-tune of the same model.
- **Source:** [Paper] DisasterM3, Table 2 and Appendix B.3 (arXiv 2505.21089v2). The local PDF stops at page 15, so the appendix was read online.
- **Goal:** O4 (a better teacher for the 3B) and O2 (six-task accuracy).
- **Where we stand (optical questions, greedy):** our 7B averages 36.1%, against 31.2% for the base model and 40.4% for the paper's fine-tune. The gaps to the paper are on disaster type (71.1 against 83.6) and relational reasoning (23.3 against 36.2); see H1's like-for-like table.
- **Recipe, ours against the paper's:**

  | Setting | Paper (Appendix B.3) | Ours (`train_qwen_disasterm3.ipynb`) |
  |---|---|---|
  | Method | LoRA on the language model, vision encoder frozen | Same, but the base model is held in 4-bit (QLoRA) |
  | LoRA | rank 64, alpha 16, dropout 0.05 | Same |
  | Optimiser | AdamW, lr 2e-4, β 0.9 / 0.95, cosine | Same, plus 3% warmup |
  | Batch and length | Global batch 256, 1 epoch | 1 × 256 gradient accumulation, 1 epoch; all 217 steps finished |
  | Precision and hardware | Not stated; 4× H100 | fp16 on 1× T4 |
  | Image size in training | Not stated | Capped at about 512 image tokens per image |
  | Image size in testing | Each model's default (full size, about 1,300 tokens for a 1024 px image) | 512 px in H1 V2/V2b (about 324 tokens) |
  | Data | Instruct question-answer samples | The 55,764 Instruct entries with a text answer; the 37,204 segmentation entries have none |

- **Ruled out:**
  - The answer format: our 7B answers with letters only on 99.9–100% of questions in every task.
  - Using the authors' model as the teacher: they haven't released their fine-tuned weights (their Hugging Face page lists only EarthVQA-pretrained and GeoFM).
- **Build:**
  1. **Step 1, re-test (about 2–3 GPU hours on T4 ×2):** re-score our 7B on DTR and ORR, optical questions (1,211), at three sizes for a 1024 px image:
     - 1036 px, the full size (Qwen's default, the paper's setting);
     - 616 px, our training cap;
     - 504 px, H1 V2's size, re-run as the control.

     Built 19 Oct: `Champion_Task/l0-step1-image-size-check.ipynb`, a copy of H1 V2's notebook with only the image size changed. The decision was fixed before the run, against the paper's 83.6 and 36.2:
     - **Gap closed:** the best size comes within 3 points on both tasks. Re-score all six tasks at that size, then L2 with the same 7B.
     - **Partly closed:** at least half of each gap is recovered. Re-score all six at that size, then decide on step 2.
     - **Not closed:** go to step 2.

     **Result (19 Oct, 1.7 h): not closed.**
     - Disaster type: 71.1 → 75.4 → 75.6 (504 → 616 → 1036 px).
     - Relational: 23.3 → 26.9 → 31.1.
     - The control reproduced H1 V2 exactly.
     - At full size the gaps to the paper are 8.0 and 5.1 points. Full size recovers 36% and 61% of them, and "partly closed" needs half of both.
     - Full size becomes the 7B's test setting. Step 2 (or stopping here) is your decision. Re-scoring the other four tasks at full size would take about 11 GPU hours: 9,464 optical questions at 4.7 s per two-image question and 2.4 s per one-image question.
  2. **Step 2, only if step 1 leaves the gap:** a top-up training of our LoRA adapter on DTR and ORR (3,509 training entries) plus an equal replay sample of the other tasks, at up to about 1,024 image tokens.
     - It takes about 10–20 T4 hours; the DDP notebook can halve that. Retraining from scratch would take about 45–90.
     - Keep it only if DTR and ORR rise and no other task drops by more than 1 point.

     **Built 20 Oct:**
     - [l0-step2-full-size-rescore.ipynb](Champion_Task/l0-step2-full-size-rescore.ipynb) re-scores at full size: the old 7B on the four tasks step 1 didn't ask (9,464 questions, about 11 h, in two parts), then the new 7B on all six (10,675, about 12 h).
     - [l0-step2-topup-training.ipynb](Champion_Task/l0-step2-topup-training.ipynb) trains on DTR + ORR plus an equal replay at full size (up to 1036 × 1036): 7,018 examples, global batch 256, about 28 steps, about 7–14 h on T4 ×2 (the smoke test measures it).
       - A new rank-64 adapter on the merged 7B replaces "continue the old adapter": its saved layer pattern is for transformers 4.49 and matches nothing in transformers 5.
       - It resumes from Hugging Face, and merges and pushes `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` at the end.
       - **Memory at full size, 20 Oct:** the 7B is at the edge of a T4.
         - Two attempts ran out of GPU memory. Both were fixed without changing the data or the batch: the waiting micro-batches stay on the CPU, and the optimizer is 8-bit paged AdamW.
         - The smoke test measured 10.0 s per example, so about 19.5 h in 2–3 sessions.
         - If memory still runs short, the next options are: leave out the few longest examples, use a smaller image size for two-image examples only, or use LoRA rank 32. Each is your decision (details in the [ledger](Task_Ledger.md)).
     - **Status, 27 Oct:**
       - The training is complete: 28 of 28 steps over sessions 1, 2, 3a and 3b, with losses flat at 0.49–0.60. Checkpoint-28 is on Hugging Face.
       - Session 3b's merge failed because Kaggle's torchao 0.10 trips the upgraded peft's version check (fp16 merge only).
       - **Built and dry-run checked 26 Oct: [l0-step2-merge.ipynb](Champion_Task/l0-step2-merge.ipynb),** a named copy that removes torchao, restores checkpoint-28 and merges on the CPU. No GPU and no retraining.
       - **27 Oct:** run 1 stopped in Cell 2 on my own over-strict check (peft saves the 196 modules as 88 name patterns). The adapter is fine. Fixed and dry-run again.
       - **Merged 27 Oct (run 2, account 3, 10 min):** exactly the 196 adapted projections changed, and none holds an inf or NaN. `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` (16.6 GB, public) is on Hugging Face, every file's size checked. Results in [L0-step2-results/merge/](Champion_Task/L0-step2-results/merge/L0S2-merge/README.md).
       - **Done 28 Oct: kept.** The new 7B's six tasks ran in the re-score notebook's two parts (7.8 h and 5.9 h). Against the old 7B at full size: ORR +3.50, DTR +1.13, BBR −0.95 (inside the 1-point limit), the others +0.22 to +0.64. The same verdict on E5's clean and strict sets. Details in the [ledger](Task_Ledger.md).
- **Done when:** the 7B's six-task scores are re-measured at the paper's setting, and L2 uses the better of the two models as its teacher.

### L0b · Can the 7B learn to see damage? (added 4 Nov; a side experiment)
- *(22 Nov: L0b step 2 combined it with the grader by two rules fixed in advance. Neither helps: at real class shares L0b's "destroyed" is right 23% of the time. R16c step 8 then re-tuned the grader's own "destroyed" setting, with no gain either. Fixing L0b itself is written up as a path not taken in [the ledger](Task_Ledger.md), under L0b: 2a correct it for real class shares, about 1 GPU h; 2b retrain it with the before-photo, the outline and the real mix, about 3 GPU h. Each has its hypothesis, method, rule and the reasons it wasn't run.)*
- **Source:** [Plan] Abrar's question: why not train the vision encoder for our own benefit?
- **Goal:** O2 and O3. It decides whether a full run with the vision encoder trained is worth its GPU hours.
- **Why:**
  - The encoder is frozen because the DisasterM3 paper's recipe freezes it (Appendix B.3). Training it has never been tested. Adapters that reached it by accident in July were removed to match that recipe.
  - The weakness looks like seeing: the 7B scores 96.5% given the true count and 15.6% from the image alone, on the same questions (Aryan's study). It called 298 of 300 buildings intact (Tamanna's Part B). Language-only training left its counting below the base model (30.3% against 34.2%).
- **Why it might not help:**
  - **Resolution:** at full size the model gets 1,369 tokens of 28 px each, and a median building is about 45 px across, so about two tokens wide. Training changes what the tokens mean, not how many there are.
  - **Memory:** the full-size top-up took about 20 GPU hours and once ran out of memory by 40 MiB. Gradients through the vision blocks should need more.
  - **Payoff:** to matter for grading or counting, a 16.6 GB model must beat a 45 MB grader and a table.
- **Build:**
  1. Start from the new 7B, with LoRA on the language layers and on the vision blocks' layers (in July that matched 28.9 million extra trainable parameters). Check GPU memory first.
  2. Train on labelled building crops from training images only, balanced by class, in the form Part B uses: a 256 px window enlarged 2×, shown at 504 px, with a red box around the building and the same prompt.
  3. Score it on Part B's same 300 true validation buildings, with an exact McNemar test against the grader (212 right) and the new 7B (100 right).
- **Rule, fixed before the run:**
  - A full run on the six benchmark tasks (about 20 hours of training and 14 of evaluation) is worth it only if the result isn't clearly below the grader's (p < 0.05).
  - If it beats the 7B but stays clearly below the grader, record that and stop: the grader keeps the grading, and a full run needs its own reason.
  - If it doesn't clearly beat the 7B, the question is settled and the encoder stays frozen.
- **Expectation, fixed before the run:** above 100, because the 7B now gets to learn the classes, but clearly below 212, because the grader also sees the before-image.
- **Alternatives:**
  - A full-size run straight away: about 34 GPU hours before knowing if it can work.
  - Training only the last vision blocks: fewer settings, and worth trying if memory runs out.
  - A different vision encoder: a much bigger change, so it waits for this result.
- **Done when:** the 300-building result is reported against the rule, whichever way it goes.
- **Done 19 Nov (account 2): 176 of 300, against 100 for the frozen 7B and 212 for the grader** ([results](Champion_Task/L0b-results/L0b/README.md)).
  - By the rule, the vision part learns but the grader keeps the grading. So it stops, and the full run isn't needed.
  - Expectation met. On destroyed buildings alone it beats the grader (86 against 66).

### L2 · 7B → 3B distillation
- **Source:** [Plan] CSE499A future work and KR4; [Paper] QLoRA (we already use it via Unsloth).
- **Goal:** O4.
- **Status in the one-chain plan (§1b, 4 Nov):** a side experiment. It's a promised deliverable (O4), but the main report doesn't depend on it. Step 1 ran again with the new 7B: 1,146 answers kept.
- **Waits for L0** (decided 19 Oct): the teacher is improved first. *(L0 done 28 Oct: the new 7B is kept and is the teacher, so L2 step 1 runs again with it. Its copy is built and dry-run checked: [l2-step1-new-teacher.ipynb](Champion_Task/l2-step1-new-teacher.ipynb), about 5.5 h on account 1.)*
- **Base:** the two ready notebooks in `support/Abrar/Implementation_DisasterM3/`, kept unchanged as the originals:
  - `generate_teacher_cot_train_3b_distill.ipynb` has never been run. Step 1 runs as its fixed copy, [Champion_Task/l2-step1-teacher-rationales.ipynb](Champion_Task/l2-step1-teacher-rationales.ipynb) (19 Oct; named `l2-stage1-teacher-rationales` until 20 Oct): Kaggle's own torch, fp16 on 2×T4 in batches, 4,000 checkable examples, and only answers that match the label kept;
  - `train_qwen_disasterm3_3b_distill.ipynb` needs the same environment fix, as a copy, and **its outputs cleared**, because they're left over from the 7B run.
- **Build:**
  1. Generate the teacher's answers on the training set. QLoRA's lesson: a smaller, cleaner set beats a large noisy one. The smoke test (19 Oct) showed that our fine-tuned 7B answers in one sentence instead of reasoning, so this is answer-level distillation; explanations come from L2b.
  2. Fine-tune Qwen2.5-VL-3B, with L2b's explanations as a second skill.
  3. Score all six tasks with the H1 harness, against the 7B.
- **Decided 8 Nov (Abrar): train two 3Bs, (b) and (c), and keep the better one by a rule fixed now, before any run.**
  - **(b) soft labels:** the 7B reads each checkable training question with its correct answer filled in, and its 20 most likely tokens at each answer position are saved, with their log-probabilities. The 3B trains on the labels with loss = 0.5 × cross-entropy on the label + 0.5 × the match to the 7B's top-20 spread (renormalised, temperature 1). Captions and restoration advice keep the label loss only.
  - **(c) the options rerun:** the 7B answers L2 step 1's counting and relational entries again (building counting 1,445, road counting 735, relational 180) with the options shown, as in the benchmark, greedy; checked-correct letters are kept. The 3B trains on L2 step 1's data (its 1,146 kept answers, labels elsewhere) plus these kept examples, with their options.
  - **The same for both:** base `Qwen/Qwen2.5-VL-3B-Instruct`, the same LoRA settings, images at most 768×28×28 pixels and never enlarged (corrected 8 Nov: an earlier line here said "between 256×28×28 and 768×28×28"), the same seed and number of steps, and the same held-out photos left out.
  - **Held out to choose the winner:** 501 after-photos (5%, chosen by a hash of the file name; a relational question's boxed picture counts as its after-photo), with all their questions left out of both trainings and both teacher passes: 1,962 checkable questions.
  - **The rule.** Both 3Bs answer the held-out questions with the options shown, greedy. Primary score: accuracy, with the two counting tasks limited to questions whose largest option is 20 or less, where the middle-value pattern can't help; the other four tasks use every question. If exact McNemar on that set gives p < 0.05, the more accurate 3B wins. Otherwise the lower median count error on all held-out building-counting questions wins (from the value of the chosen option); if that is equal too, (b) wins, because it's the cleaner distillation O4 promises and never saw the options.
  - **Reported, not deciding:** accuracy on every question; on questions whose largest option is above 20; how often each 3B picks the middle option there; count error; and the rule that never sees the image, on the same questions. (c) has also seen the benchmark's letter format on three tasks; the rule can't remove that advantage, so it's reported.
  - **Then:** only the winner is scored once on the benchmark's 10,675 optical questions, with count error and the no-image rule beside it.
  - **Estimated GPU, to be measured in each smoke test:** the 7B's soft labels about 5 h; the options rerun about 1.5 h; each training about 20 h; the held-out scoring of both 3Bs and the base 3B about 1–1.5 h; the winner's benchmark scoring about 2–3 h (revised 8 Nov, on one T4 at the 3B's image size).
    - **Measured (19 Nov):**
      - the soft labels took 24.9 h for the 38,271, in three sessions (done 19 Nov);
      - the options rerun took 3.0 h;
      - (c)'s training ran at 912 s per step of 256, so about 53 h per epoch, and its updates were all skipped (NaN in half precision). Step 2b (`l2-step2b-fp16-overflow-diagnostic.ipynb`) picks the fix and re-measures the time per example.
      - **Step 2b (19 Nov):**
        - the overflow is in one vision layer (`model.visual.blocks.31.mlp.down_proj`), on 1.23% of examples;
        - keeping it in full precision fixes it at no cost;
        - the forward pass is 1.74 s per example, so the epoch stays about 53 h per mode with the backward pass.
      - **19 Nov: option A (Abrar's decision).** Both 3Bs get one full epoch from `l2-step2-train-3b.ipynb`, which carries step 2b's fix since 19 Nov: (c) on account 1, which has about 55 GPU h a week with its Colab boost, and (b) on accounts 2 and 3, taking turns. Both should be done by about 29 Nov; then the held-out choice and the benchmark take about 4.5 h. *(20 Nov: the sessions are started by a script on Abrar's PC since 05:35; at 17:50 both were at step 45 of about 210, so both should be done about 22 Nov.)*
      - **19 Nov (later): the sessions are started by a script on Abrar's PC** ([kaggle-runner/runner.ps1](Champion_Task/kaggle-runner/runner.ps1), Windows Task Scheduler every 15 minutes, Abrar's option (b)). It checks each ended session before it starts the next: finite losses, real updates, steps up from the right checkpoint, that checkpoint on Hugging Face. It stops a mode on anything unexpected. The 3B's Hugging Face repository is already gone, so both modes start fresh. It starts with one real test session: (c)'s smoke test on account 1. *(19 Nov, 22:53: the test stopped in Cell 2, because a run started from the command line can't read Kaggle's `HF_TOKEN` secret. How such runs get a write token is Abrar's choice; the options are in the tracker, "Needs you now", item 0.)* *(20 Nov: a fine-grained token limited to that one repository, kept as a private dataset on each account. The test passed. Since 05:35 the timer runs both, every 3 minutes from 07:05. Both 1-hour trial sessions passed with every step a real update; at full-size steps it's 3.4–3.5 s per example, so about 51 h per 3B. Both should finish around 22 Nov.)* *(21 Nov, 02:28: (b)'s session 3 crashed at step 80 when Hugging Face's private storage (100 GB on the free plan) filled. Abrar freed 43 GB, and (b) continues from its recovered and checked checkpoint-80 since 03:23. (c) wasn't affected. Expected: (c) about 22 Nov, 15:00; (b) about 16:00.)* *(23 Nov: both done. (c) finished 22 Nov at 13:56 (211 steps, last loss 0.563). (b) finished 23 Nov at 04:50, after a GPU stall on 21 Nov cost it a day (208 steps, last loss 0.633). Run 4, the held-out choice, runs on account 2 since 07:02; run 5 follows.)* *(23 Nov, 09:31: run 4 keeps (c) by the rule.*
- *Its score: 45.12% against (b)'s 35.95%, p < 0.0001.*
- *Its lead is in counting and relational reasoning; (b) is ahead on the other three tasks.*
- *On the held-out counting questions whose options don't give the answer away, (c) gets 56.4%, against 39.0% for a rule that never sees the photo.*

*Run 5 (the benchmark) runs on account 2 and L3's full run on account 3, from 09:33. [Results](Champion_Task/L2-step3-results/full/L2S3/README.md); ledger, L2 step 2.)*

*(23 Nov, 15:30: both benchmark runs lost answers to a half-precision overflow: run 5 lost 327 and L3 220, scored wrong. It's L2 step 2b's overflow, whose fix the evaluation notebooks lacked. Both are rerun with the fix, and (b) is scored too, for Abrar's comparison of every model. Run 4's choice stands. Ledger, L2 step 2 and L3.)*

*(24 Nov, 03:40: the reruns are done, with 0 overflowed answers.*
- *Mean of the six tasks: (c) 43.74%, (b) 32.47%, our 7B 39.20%, DisasterM3's own fine-tuned 7B 40.45%.*
- *(c) leads on both counting tasks and relational reasoning, and trails the 7B on the other three.*
- *On the fair counting questions it gets 53.3% against the 7B's 33.2% and the blind rule's 36.2%.*

*[Comparison](Champion_Task/L2-step4-results/full/comparison/README.md); ledger, L2 step 2.)*
  - **Built 8 Nov, dry-run checked on the PC:** [l2-step1b-soft-labels](Champion_Task/l2-step1b-soft-labels.ipynb) (account 3; **running 18 Nov**), [l2-step1c-options-rerun](Champion_Task/l2-step1c-options-rerun.ipynb) (account 2; **done 18 Nov: 806 kept of 2,249 answered, [results](Champion_Task/L2-step1-results/options-rerun/L2S1c/README.md)**), [l2-step2-train-3b](Champion_Task/l2-step2-train-3b.ipynb) (`MODE` b on account 3, c ready now), [l2-step3-heldout-select](Champion_Task/l2-step3-heldout-select.ipynb) and [l2-step4-winner-benchmark](Champion_Task/l2-step4-winner-benchmark.ipynb) (account 2). Run steps in the tracker; details in the [ledger](Task_Ledger.md), L2 step 2.

### L2b · Explanations as a second skill ("why?" on request)
- **Source:** [Paper] Distilling Step-by-Step (Hsieh et al., Findings of ACL 2023; see Paper_Audit §4.12), BDAChat (explanations are its main strength) and ImageRAG (fine-tuning with reasoning added 18 points). Decided on 19 Oct, after L2's smoke test.
- **Goal:** O4 and O3. The field 3B answers briefly by default, which keeps it fast and in the benchmark's format, and explains its answer when the user asks "why?".
- **Why this design:** the papers' lessons and the comparison of short answers (A) against reasoning before every answer (B) are recorded in [Paper_Audit §5.3](Paper_Audit_and_Integration_Plan.md#53-decided-how-the-distilled-3b-learns-19-october-2026).
- **Build:**
  1. **Explanation data.** For a few thousand of step 1's checkable training examples, give a model the images, the question, the correct answer and true facts computed from DisasterM3's masks (counts per class as 8-connected blobs, and where the damage is). Ask for 2–3 sentences on what in the before and after images shows the answer. Use the base Qwen2.5-VL-7B-Instruct: our fine-tuned 7B answers in one sentence and doesn't explain.
  2. **Check each explanation.** Keep it only if it agrees with the answer and every number it states matches the mask facts; drop the rest.
  3. **Train two skills in step 2.** The normal prompt has the short answer as its target; the same prompt followed by "Explain your answer." has the explanation as its target. The 3B writes an explanation only when asked, so normal answers stay fast.
  4. **Score both.** Six-task accuracy with the normal prompt, which must not fall, and a hand-checked sample of about 50 explanations, judged against the image and the facts.
- **Don't** train the 3B to reason before every answer: it is slower in the field (Grace, AWQ), clashes with the benchmark's letters-only answers, and risks teaching made-up evidence, since VLMs find and count buildings poorly (TEOChat, GEOBench-VLM).
- **Done when:** the 3B's six-task accuracy is no lower than without explanations, and most of the sampled explanations are judged faithful.

### L3 · AWQ 4-bit 3B and confidence handoff to the 7B
- **Source:** [Paper] AWQ (4-bit, about 3× faster) and Grace (route an answer by the model's own confidence).
- **Goal:** O4 — "fits in about 6 GB".
- **Build:**
  1. Quantise the distilled 3B with AutoAWQ. Also check whether Qwen publishes an official AWQ build to compare against.
  2. Measure memory, tokens per second and six-task accuracy.
  3. Handoff: compute the geometric mean of the probabilities of the generated tokens (`output_scores=True`). Below a threshold, send the question to the 7B.
  4. **Before choosing the threshold, check the confidence** (added 26 Oct, from TimeSpot, ICML 2026; [Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md)): the 3B's expected calibration error and its risk–coverage curve with RC-AUC on the six tasks. TimeSpot found open VLMs overconfident, so calibrate on validation data first (for example, temperature scaling), then pick the threshold from the curve.
  5. Report the share answered by the 3B, the accuracy against the 7B alone, and the latency.
  6. **Measure it where it's meant to run** (added 4 Nov). Every VLM number so far is from a T4: 7B 6.2 GB and 3B 2.6 GB at peak in 4-bit, 3B 7.7 GB in full precision (H2b). So the 7B in 4-bit nearly meets "about 6 GB" already, and the 3B only pays off in 4-bit. Report memory and speed on a laptop with no GPU, through a CPU runtime. Make no phone claim unless it's tested on a phone.
- *(23 Nov: steps 1–5 built as two notebooks.*
  - *[l3-4bit-3b-handoff.ipynb](Champion_Task/l3-4bit-3b-handoff.ipynb), Kaggle account 3: memory and speed of the 4-bit 7B, the fp16 3B and the 4-bit 3B, then the 4-bit 3B on the benchmark, with each answer's token scores.*
  - *[l3-handoff-calibration.ipynb](Champion_Task/l3-handoff-calibration.ipynb), on the PC: the calibration and threshold, from that run and the 7B's saved answers.*

  *4 bits come through bitsandbytes NF4, not AutoAWQ, which is no longer maintained. The rule and expectation are fixed in both notebooks' first cells. The smoke test passed (07:33–07:42): the 4-bit 3B peaks at 3.01 GB on one T4. The full run starts once L2 run 4 names the winner. Step 6, the laptop CPU, is still open. Ledger, L3.)*
- *(24 Nov: steps 1–5 done, rerun with the overflow fix.*
  - *The 4-bit 3B scores 44.49% on the six tasks, no loss against fp16 overall. One question at a time on a T4 it peaks at 3.03 GB and takes 1.72 s; the 4-bit 7B takes 8.64 GB and 4.83 s.*
  - *The confidence is overconfident (calibration error 0.40), and temperature 2.0 brings it to 0.12.*
  - *By the rule fixed 23 Nov, the 3B answers everything, since it beats the 7B alone.*
  - *A per-task split, its rule stated before computing, reaches 48.15%: the 7B answers disaster type, bearing bodies and scene. But it needs both models loaded, about 11 GB: Abrar's call.*
  - *Step 6, the laptop CPU, done 25 Nov ([l3-step6-laptop-cpu.ipynb](Champion_Task/l3-step6-laptop-cpu.ipynb), llama.cpp b12237): 4.67 GB at peak and 39.72% against the T4's 40.83% on the same 360 questions (no difference beyond chance), but 84 s per question, mostly reading the photos (about 47 s each). [Laptop results](Champion_Task/L3-results/laptop/README.md); ledger, L3.)*

### L4 · EfficientSAM3 against SAM 3
- **Source:** [Paper] EfficientSAM3 (its paper reports no results yet, so we measure) and [Plan] the edge step of the SAM 3 test plan (Research_Directions §7.4).
- **Goal:** O4 — a field-sized building finder.
- **Build:** repeat E3's part 2 (building finding) with the smallest and medium EfficientSAM3 students. Report building IoU, milliseconds per image on a T4 and on a CPU, and memory.
- *(18 Nov: done with the three released models instead, EV-M, RV-M and TV-M, since the repo releases no small full model. None passes. Building IoU is 0.010–0.054 on the 605 clean pairs against SAM 3's 0.6302, and a CPU takes 5–25 s per photo. Full SAM 3 stays the finder and the 8-bit U-Net the field model. Open: a 10-minute check that the setup finds objects in an ordinary photo, built as L4b ([l4b-efficientsam3-sanity-check.ipynb](Champion_Task/l4b-efficientsam3-sanity-check.ipynb)). [Results](Champion_Task/L4-results/L4/README.md); details in the ledger.)*

## 8. Brief for an AI coding agent (copy, then paste one task under it)

> You are writing a Kaggle notebook for a university capstone: post-disaster building-damage segmentation and a vision-language model on the DisasterM3 dataset.
>
> **Read first:**
> - `Essential_task_delegation/Next_Steps_Roadmap.md` §3 (shared rules) and the task below;
> - the base notebook or script the task names.
>
> **Rules:**
> - Copy the base notebook and change only what the task lists.
> - Keep the pinned versions in Cell 1.
> - Never train on the 645 validation images (the split is `train_test_split(pairs, test_size=0.1, random_state=42)`).
> - Never use radar (SAR) images for segmentation.
> - Score with the E-protocol (full 1024 images, last epoch, dataset-level confusion matrix, standard and 8-view TTA rows).
> - Make the notebook Run-All safe, with a `SMOKE_TEST` flag.
> - Write all outputs to `/kaggle/working/<task-id>/`, and big temporary files to `/kaggle/temp/`.
> - Read secrets only from Kaggle Secrets.
>
> **Deliver:**
> 1. the `.ipynb`;
> 2. a short README: inputs to attach, expected runtime, outputs, and how to check them against the "Done when" line;
> 3. a list of any assumption you had to make.
>
> Ask before changing anything the task doesn't mention.
>
> **Task:** <paste the task here, e.g. E1>

## 9. Decision gates

| Gate | Decided by | Rule |
|---|---|---|
| G1 | R9 + R9s7 | **Done (18 Oct):** two-seed mean 0.2971, so the gate is not claimed and fine-tuning is closed |
| G2 | E1 | 40% or more of missed destroyed pixels predicted as Background: R11 before R12; otherwise the reverse |
| G3 | E3 | SAM 3 at least as good as R9 at finding buildings on pre-images: it does R16's finding |
| G4 | H1 | V1 above 34.2% on BDC means the counting half of KR2 is met; V2 is kept only if no other task drops by more than 1 point |
| G5 | R15 + R15s7 | Gate claim only with two seeds above 0.30, or a two-seed mean above 0.30, with TTA stated if used |
| G6 | E7 | SAM 3 + grader stays the chain if its destroyed-building IoU beats R11's on the clean test pairs and its counting isn't clearly below R11's. If only counting is clearly below, Abrar decides. If the destroyed score isn't above, the choice of chain reopens. **11 Nov: not above (0.3898 against 0.3984; noise by step 2b), so the choice reopens.** **19 Nov: Abrar chose C4** (step 2c's mix: R11 on xBD photos, find-then-grade on the others; 0.4296 on test, ahead of both beyond noise) |
| G7 | T2b | A small text model replaces the 7B as the writer only with no more contradictions, no more fake citations and at least as many finished reports, and with the supervisor's agreement |

## 10. GPU budget (approximate)

| Week | Tasks | GPU-h |
|---|---|---|
| This week | E1, E2, E3, H1 (V1, V2) | about 10 |
| Next week | R11, R12 on two accounts; T2 | about 17 |
| Week after | R15 + R15s7 and R16 (R16 runs regardless, decided 19 Oct); H3 variants | about 17–26 |
| Third account, any time | L2, L3 | about 15–25 |
| One chain (added 4 Nov) | E7, then T2b | about 2, then about 3–4 |
| Side test (added 4 Nov) | L0b | a few (a guess), and about 34 more only if its rule passes |

CPU-only, any time: D5, T1, L1, H2 and E6, plus E7's PC steps.

## 11. Documents to update as results come in
- [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md) §7: new segmentation runs (R11 onwards).
- [Phase2_Plan.md](Phase2_Plan.md): E1, R11, R12 and R15 outcomes.
- [Paper_Audit_and_Integration_Plan.md](Paper_Audit_and_Integration_Plan.md) §2: the status of each goal.
- [Research_Directions_Beyond_Finetuning.md](Research_Directions_Beyond_Finetuning.md) §9.
- The README status table, and `CSE499B_Review_report_update.tex` for the next report.
