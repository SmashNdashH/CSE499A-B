# Plan 2: Agentic Vision RAG (patch-level inspection)

**Author:** Tamanna (Member B) · **Group:** CSE499B Group 5 · **Folder:** `Essential_task_delegation/Tamanna_task_2/Plan_2/`
**Based on:** ImageRAG (IEEE GRSM 2025) and Change-Agent (IEEE TGRS 2024)

## Status (2 Nov 2026)

- **Part A, the clean-up: done; Abrar checked it on 29 Oct 2026.** Abrar's review found that the notebooks' saved outputs didn't match a recorded run of the committed code, and that several numbers in this folder were never measured. Those numbers are gone, the code is fixed, and both demo notebooks were re-run and committed on Kaggle on 27 Oct 2026. Their outputs are a **demo, not an evaluation**.
- **Part B, a test against ground truth: committed on Kaggle on 2 Nov 2026.** On the same 300 true validation buildings, neither 7B grades better than our trained grader; both grade worse ([result](#result)).

What was wrong and what has been fixed is in the correction at the top of [Audit_Response_and_Scientific_Fixes.md](Audit_Response_and_Scientific_Fixes.md). These were removed because no recorded run produced them:

- the results table that was in this README (building-count MAE, class agreement, EMS-98 consistency and VRAM for four settings), and the viva answers that quoted it;
- the typed-in and fallback numbers in both notebooks' summary and chart cells;
- both charts and `google_paligemma_benchmark.csv` in `outputs/`.

## The idea

In CSE499A, fine-tuning made our 7B worse at counting buildings than the base model (the reference points are in [Task_Ledger.md §1](../../Task_Ledger.md)). Plan 2 tries one idea for grading buildings: the U-Net finds each building, and the VLM looks at a full-resolution crop of one building at a time instead of the whole tile.

Part B tested the VLM step on its own, on true buildings: with a zoomed-in crop, neither 7B graded better than the trained grader. The whole agent (segmenter plus VLM) has not been evaluated.

## How the agent works (Part A)

1. **Segmenter:** in the notebooks, R9, the D4 champion recipe (U-Net + ResNet-50), finds the buildings and gives each one a class: Intact, Damaged or Destroyed. Images are normalised with ImageNet's mean and std, as in training, and run at full size.
2. **Crops:** up to 3 buildings per tile, Destroyed and Damaged first, each a 256 × 256 window of the original image.
3. **VLM:** two questions per building, each built for that building. First its damage class on its own, in one word; then a description, an EMS-98 grade and a rescue priority. The VLM is never told the segmenter's class.
4. **Report:** per building, the segmenter's class, the VLM's class and grade, and whether the two classes agree. Agreement between two models is not accuracy. A ground-truth mask, when one is given, is used only to score the classes, and never replaces the segmenter's prediction ([agent.py](agent.py)).

The EMS-98 table in `config.py` is not put into the prompt: the VLM grades from its own knowledge.

## Part A: the demo runs

Each notebook was run once with Restart & Run All on Kaggle, on the `abrarmohammedtanzim/disasterm3-mirror` dataset, and then committed with Save & Run All, which runs it again in a fresh kernel. The notebooks here are the committed versions, downloaded with their outputs, and `outputs/Part_A_outputs/` holds the files those runs wrote. Both runs used the same 10 tiles, drawn from the team's validation split (colour photos only), the same R9 checkpoint, the same prompts and the same library versions; only the VLM differs.

| Notebook | VLM | Committed on Kaggle | Output files |
|---|---|---|---|
| [Part_A_Agentic-vision-rag.ipynb](Part_A_Agentic-vision-rag.ipynb) | our fine-tuned 7B, `AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP` | 27 Oct 2026 | `outputs/Part_A_outputs/finetuned_demo_*` |
| [Part_A_Base_model_demo.ipynb](Part_A_Base_model_demo.ipynb) | the base model, `Qwen/Qwen2.5-VL-7B-Instruct` | 27 Oct 2026 | `outputs/Part_A_outputs/base_demo_*` |

**Demo, not an evaluation.** The outputs compare the VLM's class with the segmenter's class: agreement between two models, not accuracy. None of their numbers is a result of Plan 2.

Each run wrote:
- `*_demo_tiles.csv`: per tile, the buildings found, the buildings inspected, agreements, conflicts, unparsed answers and seconds;
- `*_demo_crops.csv`: per inspected building, both classes, the VLM's two answers, the grade and the priority;
- `*_demo_summary.csv`, `*_demo_config.json`: the run's totals, settings, prompts and library versions;
- `*_demo_dashboard.png`, `*_demo_chart.png`: the dashboard for the first tile, and a chart of this run's measured values only;
- `*_demo_huggingface_repos.json`: Kaggle's record of the model revisions the run downloaded.

**File names.** The two notebooks got their `Part_A_` prefix after the Kaggle runs; their contents are unchanged, so their introductions name each other by the earlier names. The base notebook was `BaseModel_and_PaliGemma2_Benchmark.ipynb` until 27 Oct 2026, when PaliGemma was dropped (the edge model is L2's job); the fine-tuned notebook was committed before that rename and still names its companion by that name.

The older files in `outputs/` (`base_model_benchmark.csv`, `batch_validation_benchmark.csv`, `master_tri_vlm_comparison.csv`, `inspection_dashboard_sample.png`, both charts and `google_paligemma_benchmark.csv`) were removed: no recorded run of the committed code produced them.

### Running a Part A notebook on Kaggle
1. **Settings:** GPU T4 ×2 (as in both runs), internet on.
2. **Input:** `abrarmohammedtanzim/disasterm3-mirror`.
3. **R9's checkpoint**, which is private. Either a Kaggle secret `HF_TOKEN` that can read `AbrarAlam/disasterm3-d4-R9` (Add-ons > Secrets, switched on for the notebook), or the output of Abrar's `d4-champion-model-R9` notebook added as an input (it holds `d4_R9/final_model.pth`). Without either, the notebook stops at the segmenter cell and says which is missing; it doesn't fall back to another model.
4. Restart & Run All, then Save Version, then Save & Run All (Commit).

## Part B: a test against ground truth

**The question (Abrar's):** does the 7B grade a building better than our find-then-grade grader (R16c step 5b) when it sees a zoomed-in crop of that building?

[Part_B_ground_truth_test.ipynb](Part_B_ground_truth_test.ipynb) is the committed Kaggle run: Save & Run All on 2 Nov 2026, 28 minutes on two T4s, all 10 code cells without errors. Its output files are in `outputs/Part_B_outputs/`. The notebook holds the full design, the rule and the code.

### Design (from Abrar's instructions)
- **True buildings** from the validation ground truth: 8-connected pieces of one class, at least 20 px, as in R16c step 5b; not R9's blobs. The team split gives 645 validation images; leaving out E5's 40 leaked pairs (`E5-results/E5/leaked_pairs_40.csv`) leaves 605. Colour photos only, by DisasterM3's own image-type field.
- **A balanced sample:** 100 buildings per class.
- **The target is marked:** each crop has a red box around its building, and the prompt says "the building in the red box".
- **No class in the prompt:** both prompts are the same for every building, so neither can carry the true class or a segmenter's class.
- **Two models on the same crops:** the new fine-tuned 7B, `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, and the base `Qwen/Qwen2.5-VL-7B-Instruct`.
- **The grader on the same buildings:** the notebook loads R16c step 5b's saved grader (`grader_seed44.pth`), first checks that it reproduces `R16c-results/step5b/grader_true_buildings.csv` on all true validation buildings, then grades the sampled buildings.
- **Scoring:** a 3×3 confusion matrix against the true class, and per-class recall. The grader's recorded recall on the buildings it grades (Intact 0.94, Damaged 0.67, Destroyed 0.70) is the secondary comparison.

### Settings beyond Abrar's instructions (fixed before the run)
- 100 buildings per class rather than the example's 20, so the 95% intervals are narrow enough to compare.
- At most 3 buildings of a class from one image (the cap could rise to 5, 10 or none; 3 was enough for every class).
- A 256 px window around the building, enlarged 2× to 512 px; a crop reaches the model at 504 px.
- The class prompt describes each class on the xBD damage scale, with minor and major damage merged into Damaged. A second question asks for the EMS-98 grade only, to check whether each 7B's class agrees with its own grade.
- Both 7Bs in fp16 on two T4s, greedy decoding, batches of 8.
- A building counts as right only if the answer names its true class, so in the paired test an unparsed answer, like the grader's "None" (an outline it judges to be mostly background), counts as wrong.

### Decision rule (fixed before the run)
The main question, per 7B, is an exact McNemar test against the grader on the same sampled buildings: "7B higher" if p < 0.05 and the 7B is right on more of the buildings where the two differ, "7B lower" if p < 0.05 the other way, otherwise "not distinguishable at this sample size". Secondary: per class and for the mean of the three recalls, the grader's recorded recall against the 7B's 95% interval. The grader must reproduce its recorded grades to within 0.2% of the buildings, or the run stops.

### Result

All numbers below are from the committed run of 2 Nov 2026 (Cells 4 to 9). The recall values are rounded to two places; the exact values are in `part_b_recall.csv`.

**The answer is no.** On the same 300 true buildings, both 7Bs grade worse than the grader, overall and by the rule fixed before the run.

**The sample.** The 605 images hold 19,164 Intact, 4,348 Damaged and 1,374 Destroyed true buildings; the median building's longest side is 45 px. The sample has 100 per class, 300 buildings from 180 images and 22 events.

**The grader check passed.** The saved grader regraded all 25,594 true buildings in the 645 validation images; 2 grades differ from `grader_true_buildings.csv` (0.008%, within the 0.2% allowed).

**Answers** (rows: the true class, 100 buildings each; bold: right). Neither 7B gave an unparsed answer.

| True class | Grader: Intact / Damaged / Destroyed / None | Fine-tuned 7B: Intact / Damaged / Destroyed | Base 7B: Intact / Damaged / Destroyed |
|---|---|---|---|
| Intact | **92** / 4 / 3 / 1 | **100** / 0 / 0 | **49** / 51 / 0 |
| Damaged | 35 / **54** / 5 / 6 | 100 / **0** / 0 | 50 / **50** / 0 |
| Destroyed | 8 / 17 / **66** / 9 | 98 / 2 / **0** | 38 / 62 / **0** |

**Recall** (parsed answers, 95% intervals):

| | Intact | Damaged | Destroyed | Mean of the three |
|---|---|---|---|---|
| Grader, recorded (R16c step 5b, all validation buildings it grades) | 0.94 | 0.67 | 0.70 | 0.77 |
| Grader, these 300 buildings | 0.93 [0.86, 0.97] | 0.57 [0.47, 0.67] | 0.73 [0.63, 0.81] | 0.74 [0.70, 0.79] |
| Fine-tuned 7B | 1.00 [0.96, 1.00] | 0.00 [0.00, 0.04] | 0.00 [0.00, 0.04] | 0.33 [0.33, 0.33] |
| Base 7B | 0.49 [0.39, 0.59] | 0.50 [0.40, 0.60] | 0.00 [0.00, 0.04] | 0.33 [0.28, 0.38] |

The fine-tuned 7B's interval for the mean has no width because, within each class, every one of its answers was right or every one was wrong. In every class, the grader's recorded recall lies inside its interval on these buildings, so the sample isn't unusual for the grader.

**The main question** (paired, exact McNemar tests on all 300 buildings):

| Comparison | Both right | Only the 7B right | Only the grader right | Both wrong | p | Verdict |
|---|---|---|---|---|---|---|
| Fine-tuned 7B vs grader | 92 | 8 | 120 | 80 | < 0.0001 | 7B lower |
| Base 7B vs grader | 71 | 28 | 141 | 60 | < 0.0001 | 7B lower |

- **Per class:** the fine-tuned 7B is higher than the grader on Intact (8 buildings against 0, p = 0.0078) and lower on Damaged and Destroyed. The base 7B is lower on Intact and Destroyed, and not distinguishable on Damaged (23 against 27, p = 0.67).
- **Fine-tuned against base:** not distinguishable overall (51 against 50, p = 1.0).
- **Secondary rule:** the grader's recorded mean recall, 0.77, is above both 7Bs' intervals, so both 7Bs are "lower".

**What else the run shows:**
- The fine-tuned 7B answered "Intact" for every building but two. Its Intact recall of 1.00 comes from that, not from telling the classes apart. Part A's demo showed the same: it called all 30 buildings Intact.
- The base 7B never answered "Destroyed", and split the other buildings between Intact and Damaged.
- Neither 7B's class agrees well with its own EMS-98 grade. The fine-tuned 7B's matched on 61, 49 and 36 of 100 (Intact, Damaged, Destroyed); the base 7B's on 5, 2 and 2 of 100, since most of its grade answers were Grade 5 (`part_b_answers.csv`).
- Speed: 1.26 s (fine-tuned) and 1.29 s (base) per building for the two questions, with peak GPU memory of 17.12 GB for each.

**Limits, known before the run:**
- The grader sees the before-image as well as the after-image; the 7Bs see only the after-image crop. A before-and-after version for the 7B is H3's V3.
- The fine-tuned 7B was trained on DisasterM3 Instruct's text tasks, and these images are Instruct images (the ledger notes this in §4, E5), though no per-building labels were in that training. The base 7B and the grader weren't trained on them.
- The result is for one prompt wording, one crop setting and greedy decoding. It doesn't show that no prompt or crop would work.

### Part B outputs
`outputs/Part_B_outputs/part_b/`:
- `part_b_sample.csv`: the 300 sampled buildings (image, event, true class, position, size, window), saved before any model ran;
- `part_b_examples.png`: example crops with the red box;
- `part_b_grader_check.csv`: the grader's regrade of all true validation buildings against the recorded counts;
- `part_b_answers.csv`: all 900 answers (the grader's and both 7Bs'), with the raw answers, the parsed class and the EMS-98 grade;
- `part_b_confusion.csv`, `part_b_recall.csv`, `part_b_paired.csv`: the tables above, unrounded;
- `part_b_recall_chart.png`: recall per class with 95% intervals, against the grader's recorded recall;
- `part_b_config.json`: the settings, prompts, grader check, timings and library versions.

Also in `outputs/Part_B_outputs/`: `__huggingface_repos__.json`, Kaggle's record of the model revisions the run downloaded, and `__results___files/`, Kaggle's copies of the notebook's two figures.

### Running Part B on Kaggle
GPU T4 ×2, internet on. Inputs: the `disasterm3-mirror` dataset and the output of R16c step 5b's notebook (`r16c-step5b-third-grader-seed`, which holds `grader_seed44.pth`; shared by Abrar). No secret is needed. Check with `SMOKE_TEST = True` (Restart & Run All), then set it to `False` and Save & Run All (Commit).

## Files

| File | What it is |
|---|---|
| `Part_A_Agentic-vision-rag.ipynb`, `Part_A_Base_model_demo.ipynb` | Part A's two demo notebooks, committed Kaggle runs |
| `Part_B_ground_truth_test.ipynb` | Part B: both 7Bs and the grader on true validation buildings, scored against the ground truth; a committed Kaggle run |
| `agent.py` | The agent, with the same logic as the Part A notebooks' agent cell |
| `tools.py` | The segmentation, crop and EMS-98 tools used by the scripts |
| `vlm_engine.py` | Loads the fine-tuned or the base Qwen2.5-VL-7B in 4-bit |
| `config.py` | Paths, the model registry, the classes and the EMS-98 table |
| `visualizer.py` | The annotated map and the dashboard for the scripts |
| `run_pipeline.py` | A command-line run on one image, or `--self_test` on a synthetic tile |
| `evaluate_benchmark.py` | A command-line run over a folder of tiles; never run |
| `requirements.txt` | The scripts' dependencies |
| `Visual_RAG_Patch_Zooming.md` | The plan (added 17 Oct 2026 as `Plan_2_Visual_RAG_Patch_Zooming.md`, last changed 20 Oct). Its numbers are planning estimates and figures from papers, not measurements |
| `imageRAG_RP.md` | The ImageRAG paper |
| `Audit_Response_and_Scientific_Fixes.md` | The response to the first review, with a correction at the top |
| `outputs/Part_A_outputs/` | The output files of Part A's two Kaggle runs |
| `outputs/Part_B_outputs/` | The output files of Part B's Kaggle run |

## The command-line scripts

The scripts haven't been run on real data. `run_pipeline.py --self_test` runs the agent on a synthetic tile whose mask stands in for the segmenter's output. It still downloads the VLM; offline, the VLM runs in mock mode and no VLM number is reported.

Before relying on the scripts:
- `tools.py` loads checkpoints with `strict=False`, and builds an untrained U-Net when it finds no checkpoint. The notebooks use their own strict loader instead.
- `evaluate_benchmark.py` picks tiles by file name, not from the team's validation split, and can't tell colour photos from radar tiles.
