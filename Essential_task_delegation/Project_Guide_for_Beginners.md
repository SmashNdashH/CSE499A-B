# Project guide for a beginner: every part, every step, every result (24 Nov 2026)

This file explains the whole project from zero: what it is, the data, every part of the system, where each file is, every step that was taken and why, every result in tables, and what is still left. It assumes you remember nothing. Each term is explained the first time it appears, and again in the glossary (Part 2).

**How to use it:** read Part 1 and Part 2 first. After that, jump to whatever you need. Every result links to the file it comes from; quote numbers from those files, not from this guide.

**Where the newest state is kept:** [Progress_Tracker.md](Progress_Tracker.md) (what happened, newest first) and [Task_Ledger.md](Task_Ledger.md) (why each task ran and what it decided). This guide is a snapshot of 24 Nov 2026, 00:30 Dhaka time.

## Contents

1. [The project in one page](#part-1-the-project-in-one-page)
2. [The words used everywhere](#part-2-the-words-used-everywhere)
3. [The data](#part-3-the-data)
4. [Where everything is](#part-4-where-everything-is)
5. [The system, part by part](#part-5-the-system-part-by-part)
6. [What was done, in order, and why](#part-6-what-was-done-in-order-and-why)
7. [All the results, in tables](#part-7-all-the-results-in-tables)
8. [What is running now, and what remains](#part-8-what-is-running-now-and-what-remains)
9. [How the work is done: the rules](#part-9-how-the-work-is-done-the-rules)

---

## Part 1. The project in one page

**Course:** CSE499B (Senior Design II), North South University, Section 13, Group 5. The first half of the project was CSE499A (Senior Design I).

**Team:** Abdullah Al Noman (2022095042), Tamanna Akter Mou (2211951042), Aryan Sami (2231407042), Ridita Afrin Riya (2211622042), Abrar Mohammed Tanzim Alam (2222864042).

**Title:** Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment and Rescue Guidance.

**The problem.** After an earthquake, flood, storm, fire or explosion, rescue coordinators need to know, within hours, which buildings collapsed, how many, and where to search first. Often they have no internet and only a laptop.

**What the system takes in:** two satellite photos of the same place, one from before the disaster and one from after, each 1024 × 1024 pixels.

**What the system gives out:**

| Output | What it is | Made by |
|---|---|---|
| Damage map | A picture the same size as the photo, where every pixel is labelled background, intact building, damaged building or destroyed building | A segmentation model (Part 5.1) |
| Building table | One row per building: its class, area, centre, box, and distance to the nearest destroyed building | Code that reads the damage map (Part 5.2) |
| Counts | How many intact, damaged and destroyed buildings | Fixed database queries on the table, never a language model (Part 5.2) |
| Danger heatmap | Where damage is densest, with up to 3 "hot spots" (search here first) and up to 3 "safe areas" (open ground far from damage) | Code on the damage map (Part 5.3) |
| Six written reports | Expert, alerts, emergency, staff allocation, public, and reconstruction reports that cite official guidelines | Our fine-tuned vision-language model, with the internet off (Part 5.6) |
| A small "field" version | The same work on smaller hardware: an 8-bit damage model of 33 MB that runs in a web browser, and a small 3-billion-parameter language model | Part 5.7 |

**The four goals** (written in the CSE499B review report, 7 Oct). They are called O1 to O4 in every file:

| Goal | Target | Status on 24 Nov 2026 | Main evidence |
|---|---|---|---|
| **O1:** damage map | Mean IoU above 0.52 and destroyed-building IoU above 0.30 | **Met** by the chosen method, C4: destroyed IoU 0.350 and mean IoU 0.588 on the 605 clean validation pairs; 0.430 and 0.556 on the 2,007 unseen test pairs | [E7 step 2c](Champion_Task/E7-results/step2c/README.md) |
| **O2:** counting and the language model's benchmark | Building counting above the base model's 34.2%, and all six benchmark tasks re-scored | **Met on the measure promised** (35.34% from C4's map), but that measure is flawed (a rule that never looks at the photo gets 66.98%), so count error is reported beside it. All six tasks re-scored (our 7B: 39.20% mean) | [E7 step 3](Champion_Task/E7-results/step3/README.md), [the flaw](Champion_Task/benchmark-option-rule-check.ipynb), [L0 step 2](Champion_Task/L0-step2-results/new-partA/L0S2/README.md) |
| **O3:** one offline system | The report system on our own model, with the damage map, counts and heatmap, internet off | **Met:** the whole chain ran offline on two test pairs; 0 wrong numbers out of 178; made-up guideline IDs blocked | [T2 step 7](Offline_RAG_KR2/results/t2_step7/README.md), [ID guard](Offline_RAG_KR2/results/t2b_id_guard/README.md) |
| **O4:** field model | A small segmenter and a distilled 3B language model in about 6 GB | **Met.** Segmenter: 33 MB, 8-bit. The 3B: in 4 bits it peaks at 3.03 GB and averages 44.49% on the six benchmark tasks, against our 7B's 39.20% | [L1b](Champion_Task/L1B-results/L1b/README.md), [comparison](Champion_Task/L2-step4-results/full/comparison/README.md), [L3](Champion_Task/L3-results/full/L3/README.md) |

---

## Part 2. The words used everywhere

### Images and data

| Word | What it means here |
|---|---|
| Pair | Two satellite photos of the same place, before and after a disaster, 1024 × 1024 px. |
| Before-photo, after-photo | The two photos of a pair. In code: `pre_image` and `post_image`. |
| Mask, true mask, ground truth | The correct damage map for a pair, made by people. Four classes: 0 background, 1 intact, 2 damaged, 3 destroyed. |
| Pixel shares | In the training masks: background 92.77%, intact 5.86%, damaged 1.05%, destroyed 0.33%. Destroyed is very rare, which is why it is the hardest class. |
| DisasterM3 | The dataset everything trains on (a NeurIPS 2025 paper). It has photos, masks, and question-and-answer sets. |
| DisasterM3 Instruct | Its training part: training photos and their questions with answers. |
| DisasterM3 Bench (the benchmark) | Its test part: questions with multiple-choice answers on test photos, used to score language models. |
| xBD (xView2) | An older dataset of before-and-after pairs. Most DisasterM3 pairs come from it. Its photos are coarser. |
| "Other" photos | DisasterM3 pairs not from xBD, such as the Turkey earthquake. Sharper, and sometimes photographed at an angle. |
| Training pairs (5,798) | The pairs models learn from. |
| Validation pairs (645) | The pairs models are compared on, never trained on. 10% of DisasterM3's 6,443 training pairs, chosen by `train_test_split(..., test_size=0.1, random_state=42)` in the D4 notebooks. 560 are xBD, 85 other. |
| Clean validation pairs (605) | The 645 minus 40 that share a photo with a training pair (found in E5). Scores are judged on these. |
| Test pairs (2,007 clean) | Pairs from DisasterM3's own test split that no model was trained or tuned on; their masks were rebuilt in E6. Used only to confirm a choice made on validation. 414 are from the Turkey earthquake. |
| Leak | A test or validation photo that also appears in training. It makes scores look better than they are. |
| Event | One disaster, for example "santa_rosa_wildfire" or "turkey_earthquake". File names start with the event. |

### Measuring

| Word | What it means here |
|---|---|
| IoU (intersection over union) | For one class: the pixels both the model and the truth call that class, divided by the pixels either calls it. From 0 (no overlap) to 1 (exact). |
| Destroyed IoU | IoU of the destroyed class. The project's hardest number (target above 0.30). |
| mIoU (mean IoU) | The average IoU over the four classes (target above 0.52). |
| Building IoU | IoU with the three building classes merged into one: how well a map finds buildings at all. |
| Accuracy (benchmark) | The share of benchmark questions answered with exactly the right option letters. |
| Count error | How far a count is from the true count, as a percentage. Reported because counting accuracy on the benchmark is flawed. |
| The blind rule | A rule that never looks at the photo: "if the largest option is above 20, pick the middle option; otherwise pick the second smallest". It scores 66.98% on building counting, because of how the benchmark builds its options. |
| Seed | The number that fixes a run's randomness. Running the same recipe with another seed shows how much a score moves by chance (about 0.013 destroyed IoU). A run repeated with seed 7 gets "s7" in its name (R11s7). |
| TTA (test-time augmentation) | The model sees 8 flipped and rotated copies of a photo, and the answers are averaged. |
| Exact McNemar test | A paired test for two models answering the same questions: it looks only at the questions one got right and the other wrong. A p-value below 0.05 means the difference is beyond chance. |
| Bootstrap | Resampling the pairs (for example 10,000 times) to see the range a difference could take by chance. "95% interval" means the middle 95% of those redraws. |
| Smoke test | A short run on a few items to check the code works before the long run. |

### Models

| Word | What it means here |
|---|---|
| U-Net | A network that turns a photo into a damage map, pixel by pixel. Ours use a ResNet-50 encoder (the part that reads the photo), pretrained on ImageNet. |
| After-only U-Net (R9) | Reads only the after-photo (3 colour channels). |
| Before-and-after U-Net (R11) | Reads both photos stacked as 6 channels. |
| SAM 3 | Meta's segmentation model. Given the word "building", it outlines buildings with no training of ours. Used on the before-photo cut into four quarters. |
| Grader | Our classifier: a ResNet-18 that looks at a 128 px crop of one building in both photos (a "Siamese" network: one network reads both crops) and answers intact, damaged, destroyed or not a building. |
| Find-then-grade (R16c) | SAM 3 finds each building on the before-photo; the grader grades it. |
| C4 (the chosen mix) | The before-and-after U-Net on xBD photos, and find-then-grade on the other photos. The system's damage map since 19 Nov. |
| VLM (vision-language model) | A model that reads images and text and writes text. |
| 7B | Qwen2.5-VL-7B, a VLM with 7 billion parameters, that we fine-tuned on DisasterM3's questions. Our current one: `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` (Hugging Face). |
| 3B | Qwen2.5-VL-3B, a smaller VLM we trained to imitate our 7B ("distillation"), for a laptop. Its adapters are in `AbrarAlam/disasterm3-qwen25vl3b-l2`, folders `b/final` and `c/final`. |
| Distillation | Training a small model on a big model's answers. (b) learned from the 7B's word-by-word probabilities ("soft labels"); (c) learned from the 7B's checked answers. (c) was kept. |
| DisasTeller | A published report system whose language-model "agents" write six reports. We rebuilt it to run on our 7B offline. |
| Fixed flow | Our replacement for DisasTeller's agents: code calls the tools in a fixed order, and the 7B only writes each section. |
| Guideline search (RAG) | Ridita's offline search over 405 sections of response guidelines (EMS-98, INSARAG, Sphere and others). It returns passages with IDs such as `[EMS98-masonry-grade-5]`. RAG means retrieval-augmented generation: the writer is shown retrieved passages. |

### Training and running

| Word | What it means here |
|---|---|
| Fine-tuning | Training an existing model further on our data. |
| LoRA, QLoRA, adapter | LoRA trains a small add-on (an "adapter") instead of the whole model. QLoRA does this while the base model is held in 4 bits. "Merging" adds the adapter into the model's weights. |
| fp32, fp16 | Numbers stored in 32 or 16 bits. fp16 ("half precision") is faster and smaller but can overflow (exceed its largest number, 65,504). |
| 8-bit (INT8), 4-bit (NF4) | Weights stored in 8 or 4 bits to shrink a model. INT8 is used for the U-Net (ONNX); NF4 (bitsandbytes) for the 3B. |
| ONNX, ONNX Runtime Web | A portable model file format, and the library that runs it, including in a web browser. |
| Kaggle, Kaggle account | A website with free GPUs (two NVIDIA T4s per session, about 30 GPU hours a week per account). We use four accounts (Part 4.6). |
| Hugging Face (HF) | A website that stores models. Our models and adapters are in private repositories under `AbrarAlam`. |
| The runner | `Champion_Task/kaggle-runner/runner.ps1`: a script on Abrar's PC that started the 3B's training sessions on Kaggle one after another and checked each one. |
| Overflow fix | The 3B's vision part overflows in fp16 at one layer (`visual.blocks.31.mlp.down_proj`); running that layer in fp32 fixes it (found 19 Nov, applied to evaluation 23 Nov). |

### Task labels (used in file names)

The letters say what kind of task it is. Use them to find files; when you explain to someone, say what the thing is.

| Prefix | Kind of task | Examples |
|---|---|---|
| D4, R | The segmentation U-Net and its training runs ("D4 champion model"; R = run) | R1 to R12, R11s7 |
| E | Evaluation and diagnosis, no training | E1 (where errors go), E5 (leaks), E6 (test set), E7 (the chain scored as one) |
| D5 | Converting extra xBD data | D5, D5b |
| R16 | Find-then-grade | R16, R16b, R16c steps 1–8 |
| H | Counting and questions (the "hybrid" part) | H1 (counting), H2 (building table), H2b (SQL agent test), H4 (outside benchmark) |
| T | Products: heatmap, reports, website | T1 (heatmap), T2 (reports), T2b (who writes), T3 (website) |
| L | Language model and field models | L0 (better 7B), L0b (7B vision test), L1 (8-bit U-Net), L2 (3B), L3 (4-bit 3B), L4 (small finder) |
| O | The four goals | O1 to O4 |

---

## Part 3. The data

### 3.1 The sets, with their sizes

| Set | Size | What it is used for | Where it is defined |
|---|---|---|---|
| Training pairs | 5,798 | Training every segmentation model | `d4-champion-model-*.ipynb`, the split cell |
| Validation pairs | 645 (560 xBD, 85 other) | Comparing models, choosing settings | Same split |
| Clean validation pairs | 605 | Judging results (the 40 leaked pairs removed) | [E5](Champion_Task/E5-results/E5/README.md) |
| Test pairs, readable | 2,065 | The chain's outputs (table, hot spots) | [E6](Champion_Task/E6-results/E6/README.md) |
| Test pairs, clean | 2,007 (414 Turkey) | Confirming a choice once | [E6](Champion_Task/E6-results/E6/README.md) |
| Benchmark questions, optical, six tasks | 10,675 | Scoring the language models | [L0 step 2](Champion_Task/L0-step2-results/new-partA/L0S2/README.md) |
| Held-out training questions | 1,962 (on 501 after-photos) | Choosing between the two 3Bs | [L2 step 3](Champion_Task/L2-step3-results/full/L2S3/README.md) |

The 10,675 benchmark questions by task:

| Task | Code | Questions | What is asked |
|---|---|---|---|
| Disaster type recognition | DTR | 353 | Which kind of disaster is this? |
| Bearing bodies recognition | BBR | 2,006 | Which kinds of objects were damaged? (several letters) |
| Building damage counting | BDC | 3,583 | How many buildings are intact / damaged / destroyed? (5 options) |
| Road damage estimation | DRE | 1,868 | What share of the road is damaged? (5 options) |
| Disaster scene recognition | DSR | 2,007 | Which land-use types are in the photo? (several letters) |
| Relational reasoning | ORR | 858 | How do two marked objects relate? |

### 3.2 The leaks found, and how each is handled

| What was found | When | How big | What was done | File |
|---|---|---|---|---|
| 40 validation pairs share a before-photo with training pairs | 26 Oct (E5; Ridita's audit found 40, our check 21) | 40 of 645 | Every score is also given on the other 605 ("clean") | [E5](Champion_Task/E5-results/E5/README.md) |
| 186 benchmark questions use an after-photo that is a training photo | 26 Oct (E5 step 1) | 186 of 10,675 (1.74%) | Scores given both with and without them | [E5 step 1](Champion_Task/E5-results/step1/README.md) |
| 447 of the "new" xBD tiles are benchmark photos | 19 Oct (D5) | 3,466 of 3,472 destroyed buildings | The two-model rule: a model trained on them never answers benchmark questions | [D5](Champion_Task/D5-results/) |
| 2 of R12's extra tiles are twins of validation pairs | 27 Oct | 6,860 destroyed pixels | R12 still didn't beat R11, so its verdict stands | [E5](Champion_Task/E5-results/E5/README.md) |
| GEOBench-VLM's xBD photos are in our training data | 21 Nov (H4) | 119 of 210 pairs (57%) | Only the 91 clean pairs scored | [H4](Champion_Task/H4-results/H4/README.md) |

### 3.3 The benchmark's counting flaw

Whenever a counting question's largest option is above 20 (1,581 of the 3,583 building-counting questions), the five options are 0.6, 0.8, 1.0, 1.2 and 1.4 times the true count, so the middle option is always right. A rule that never looks at the photo scores 66.98%. So accuracy on these questions cannot show that a model counts well. Since this was found (7 Nov), count error is reported beside accuracy. Since 23 Nov, the "fair" questions (largest option 20 or less) are also scored separately. [The check](Champion_Task/benchmark-option-rule-check.ipynb).

---

## Part 4. Where everything is

All paths below are inside `D:\CSE499AB_project\`. Links in this file are relative to `Essential_task_delegation/`.

### 4.1 The top folder

| Path | What it holds |
|---|---|
| `README.md` | The front page on GitHub: the project, how the system works, results up to update 5, links to every update |
| `UPDATE.md` | Update 1's text (13 Oct) |
| `others/` | Every submitted document: weekly update PDFs (`CSE499B_update_1.pdf` to `_5.pdf`), the review report and presentation (7 Oct), literature review, proposed solution, research papers (`others/lit review_research papers/`), and the CSE499A archive (`others/CSE499A/`, including its 1-minute video). Update 6's draft is `others/CSE499B_update_6_draft.tex` (kept local) |
| `support/` | Older code from CSE499A and teammates' supporting work |
| `Essential_task_delegation/` | Everything of CSE499B: the core documents, every notebook, every result |
| `data/` | Local datasets (DisasterM3 mirror files, xBD) used by PC notebooks (large, not on GitHub) |
| `cse499/` | The PC's Python environment (Jupyter, pandas, torch on CPU) used to run PC notebooks |

### 4.2 The core documents in `Essential_task_delegation/`

| File | What it is | Open it when |
|---|---|---|
| [Progress_Tracker.md](Progress_Tracker.md) | What happened, newest first; the run board (running, done, ready); a table of every task's status | You want the latest state |
| [Task_Ledger.md](Task_Ledger.md) | Every finished task: what, why, how, the rule fixed before the run, the result, what it led to; plus the table of every decision | You want to know why something was done |
| [Next_Steps_Roadmap.md](Next_Steps_Roadmap.md) | The plan: every task's design, its rule, and the gates (decision rules) | You want to know what a task was supposed to do |
| [Team_Status.md](Team_Status.md) | The overview for teammates: glossary, every part's best result, each member's tasks | You want a short overview, or what a teammate owns |
| [System_Design_Notes.md](System_Design_Notes.md) | How the parts fit together: the chain, the website, the booth setup, the SQL agent's limits | You want the architecture |
| [Paper_Audit_and_Integration_Plan.md](Paper_Audit_and_Integration_Plan.md) | The research papers read, what each does, and how we use it | You want the literature behind a choice |
| [Research_Directions_Beyond_Finetuning.md](Research_Directions_Beyond_Finetuning.md) | October's research directions (SAM 3, edge models, agents) | You want the early reasoning for Phase 2 |
| [Phase2_Plan.md](Phase2_Plan.md) | The 5 Oct plan after fine-tuning stalled: diagnosis, before+after input, extra data, two-step model | You want the plan behind R11, R12, R16 |
| [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md) | The October training runs explained, with likely questions and answers | You prepare for a viva on the U-Net runs |
| [Segmentation_Model_Explained.md](Segmentation_Model_Explained.md) | The U-Net explained step by step | You want to learn the segmentation model |
| [Manual_Notebook_Renames.md](Manual_Notebook_Renames.md) | Renames you make by hand inside notebooks that already ran | You rename tasks |
| This file | The beginner's guide | Start here |

### 4.3 `Champion_Task/`: every experiment notebook and its results

**Naming.** A notebook is named after its task: `d4-champion-model-R11.ipynb`, `e7-step2c-mix-choice.ipynb`, `l2-step4-winner-benchmark.ipynb`. Its outputs go in a folder named `<TASK>-results/<variant>/`, for example `L2-step3-results/full/L2S3/` (the full run) and `L2-step3-results/smoke/` (its smoke test). Each results folder has a `README.md` with the numbers. Kaggle runs also save the executed notebook (every cell with its output) and the run's log there.

| Notebook family | What the notebooks do | Results folders |
|---|---|---|
| `d4-champion-model-R1.ipynb` … `-R12.ipynb`, `-R1s7`, `-R9s7`, `-R11s7` | Train the U-Net with one change each (Kaggle, about 6–7 h each) | `R1-results/` … `R12-results/`, `R11s7-results/` |
| `d4-champion-model-E0.ipynb`, `-E1.ipynb` | Evaluate saved U-Nets; E1 diagnoses where errors go | `E0-results/`, `E1-results/` |
| `d5-xbd-converter.ipynb`, `d5b-xbd-tier3-converter.ipynb` | Convert extra xBD tiles into DisasterM3-style masks (PC) | `D5-results/`, `D5b-results/` |
| `e3-sam3-building-finding.ipynb` | SAM 3 finding buildings, no training | `E3-results/` |
| `e4-r12-vs-r11-by-source.ipynb` | Why the extra tiles didn't help | `E4-results/` |
| `e5-step1-hash-check.ipynb`, `e5-step2-per-image-counts.ipynb` | Find leaks by image content; per-image scores | `E5-results/` |
| `e6-test-split-ground-truth.ipynb` | Build the test pairs' true masks (PC) | `E6-results/` |
| `e7-step1-…` to `e7-step3b-…` | Score the whole chain on the same photos; choose C4; build C4's table and hot spots | `E7-results/step1` … `step3b` |
| `r16-find-then-grade.ipynb`, `r16b-…`, `r16c-step1-…` to `r16c-step8-…` | Find-then-grade: the first try, the correction, and eight steps to strengthen and test the grader | `R16-results/`, `R16b-results/`, `R16c-results/step1` … `step8` |
| `h1-v1-…`, `h1-v2-…`, `h1-v2b-…` | Counting from the U-Net's map; the 7B on all six tasks; counting asked to the 7B | `H1-V1-results/`, `H1-V2-results/`, `H1-V2b-results/` |
| `h2-sql-counting-agent.ipynb`, `h2b-sql-agent-graded-test.ipynb` | The building table and counting queries; the graded test of a model writing database queries | `H2-results/`, `H2b-results/` |
| `h4-geobench-xbd-counting.ipynb` | An outside benchmark (GEOBench-VLM) | `H4-results/` |
| `benchmark-option-rule-check.ipynb` | Found the counting options' flaw | (in the notebook) |
| `t1-survivability-heatmap*.ipynb` | The danger heatmap, three versions | `T1-results/` |
| `t3-gallery-export.ipynb` | Exports maps and tables for the website | `T3-gallery-export-results/` |
| `l0-step1-…`, `l0-step2-…` | The 7B at full image size; its top-up training and re-scoring | `L0-step1-results/`, `L0-step2-results/` |
| `l0b-vision-encoder-crop-test.ipynb`, `l0b-step2-grader-combination.ipynb` | Can the 7B learn to see damage; combining it with the grader | `L0b-results/` |
| `l1-edge-benchmark.ipynb`, `l1b-…`, `l1c-r11-int8.ipynb` | The 8-bit field U-Nets | `L1-results/`, `L1B-results/`, `L1C-results/` |
| `l2-step1-…` to `l2-step4c-…` | The 3B: teacher answers, soft labels, options rerun, training, the overflow diagnosis, the held-out choice, the benchmark, the checks, the comparison | `L2-step1-results/` … `L2-step4-results/` |
| `l3-4bit-3b-handoff.ipynb`, `l3-handoff-calibration.ipynb` | The 3B in 4 bits (memory, speed, confidence), and its hand-off to the 7B (PC) | `L3-results/` |
| `l4-efficientsam3-…`, `l4b-…` | A smaller building finder (EfficientSAM3) | `L4-results/`, `L4b-results/` |
| `kaggle-runner/` | `runner.ps1` (starts and checks training sessions), `state.json` (its record), `fetch_notebook.py` | — |
| `E7-inputs/`, `H4-inputs/` | Input files uploaded to Kaggle for those tasks | — |

### 4.4 `Offline_RAG_KR2/`: the guideline search and the report system

| Path | What it is |
|---|---|
| `README.md` | Ridita's full record: the search, every report run, the comparisons (2,000+ lines) |
| `guidelines/`, `guideline_chunks.jsonl`, `guideline_embeddings.npy`, `guideline_index.py` | The six guideline documents, cut into 405 sections, with their search index |
| `pdf_search_tool.py`, `retrieval_test/` | The search tool, and its 30-question test |
| `disasteller_offline/` | The report system: `fixed_flow.py` (Ridita's fixed flow), `fixed_flow_c4.py` (Abrar's copy that reads C4's facts, with the number check and the guards), `number_check.py` (the number checker), `t2b_flow.py`, `local_model.py`, `run_with_netlog.py` (records every network connection) |
| `t2_*.ipynb` | Kaggle notebooks that ran the reports (practice runs, proof run, step 5 runs 1–4) |
| `t2_step7_number_check.ipynb` | The PC notebook that checks every number in the reports |
| `t2b_writer_test.ipynb`, `t2b_score.ipynb` | Who writes the reports (7B against a small text model), and its scoring |
| `make_*.py` | Scripts that build Kaggle upload folders and the test scenes |
| `results/` | Every run's reports and scores: `t2_step5_c4*`, `t2_step7`, `t2b`, `t2b_id_guard`, and the earlier practice runs |
| `report_comparison/` | Our reports against July's Gemini reports |

### 4.5 The other folders in `Essential_task_delegation/`

| Folder | What it is |
|---|---|
| `T3_Website/` | The showcase website's source code (React 19, TypeScript, Tailwind 4, Vite; the 8-bit model runs in the browser through ONNX Runtime Web). `README.md` explains it; `src/data/facts.json` holds every number the site shows, each with its source file |
| `Wireframes/` | 43 screenshots of the website, with notes |
| `Layer3_Task/` | Generated before-photos (Ridita's task): `Layer3_Task_Brief.md`, the step 0 notebook, `results/step0/` |
| `Aryan_Task/` | Aryan's work: the website prototype, the counting-prompt report, the website handover |
| `Noman_task/` | Noman's work: an earlier website prototype and its review |
| `Ridita_Task/` | Ridita's tasks and prompts (the leak audit) |
| `Tamanna_task/`, `Tamanna_task_2/` | Tamanna's plans (edge benchmark, crop inspection, offline demo) |
| `BRIGHT_DisasterM3_Integration/` | The audit of the BRIGHT dataset against DisasterM3 |
| `Archive/` | Old material kept for reference |
| `Champion_Task/`, `Offline_RAG_KR2/` | Above |

### 4.6 Outside the repository

| Place | What is there |
|---|---|
| Hugging Face, `AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP` | Our first 7B (CSE499A) |
| Hugging Face, `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` | Our current 7B (kept 28 Oct) |
| Hugging Face, `AbrarAlam/disasterm3-qwen25vl3b-l2` | The two 3B adapters (`b/final`, `c/final`) and their checkpoints. Private storage is capped at 100 GB on the free plan |
| Kaggle accounts | acc1 `abrarmohammedtanzim` (45 GPU h/week; now the statutes project's), acc2 `abrar2222864642`, acc3 `redwannewaz`, acc4 `tamannamou123` (30 h each). Hours reset Saturday 06:00 Dhaka |
| `C:\Users\abrar\kaggle-accounts\` | Shared helpers for using the accounts: `kg.ps1` (a Kaggle command as one account), `watch_repush.ps1` (watches a run and pushes it again while it is queued), README |
| `%LOCALAPPDATA%\cse499-kaggle-runner\` | The accounts' Kaggle tokens, encrypted for Abrar's Windows user |

---

## Part 5. The system, part by part

The chain, as it runs today:

```text
before-photo + after-photo
   │
   ├─ xBD photo?  yes → before-and-after U-Net (R11, with TTA) ─────────┐
   │              no  → SAM 3 finds buildings → the grader grades each ─┤  = C4's damage map
   │                                                                     ▼
   │                                      building table (one row per building or patch)
   │                                                 │
   │               ┌─────────────────────────────────┼──────────────────────────┐
   │               ▼                                 ▼                          ▼
   │        fixed counting queries           danger heatmap (code)      guideline search
   │               └──────────────────┬──────────────┴──────────────────────────┘
   │                                  ▼
   └──────────────► our 7B writes six reports (fixed flow, internet off)
                                      │  checks: every number against the facts; guards
                                      ▼
                         six reports with real citations → the website
```

### 5.1 The damage map

Three methods were built. The system uses a mix of two.

| Method | Input | How it was made | Output | Best result | Files |
|---|---|---|---|---|---|
| After-only U-Net (R9) | After-photo | U-Net with ResNet-50 encoder; 768 px crops; Focal Tversky loss, then Lovász loss in the last epochs; a sampler that shows images with damage more often; copy-paste of destroyed buildings; 40 epochs | Damage map | Clean validation, TTA: mIoU 0.5402, destroyed 0.2874 | [d4-champion-model-R9.ipynb](Champion_Task/d4-champion-model-R9.ipynb), [R9-results/](Champion_Task/R9-results/) |
| Before-and-after U-Net (R11) | Both photos, stacked as 6 channels | R5's recipe (the sampler, no copy-paste), both photos cropped and flipped together | Damage map | Clean validation, TTA: mIoU 0.5805, destroyed 0.2692. Test: destroyed 0.3984 (0.4672 without Turkey, 0.0867 on Turkey) | [d4-champion-model-R11.ipynb](Champion_Task/d4-champion-model-R11.ipynb), [R11-results/](Champion_Task/R11-results/) |
| Find-then-grade (R16c step 5) | Both photos | SAM 3 outlines buildings on the before-photo (no training). The grader, a Siamese ResNet-18 on 128 px crops, was trained on SAM 3's outlines of the training photos (R16c step 4) and labels each outline; its "destroyed" score has a bias of −4.0 chosen on held-out training photos. Three grader seeds (42, 43, 44) | One grade per building, drawn as a map | Clean validation: destroyed 0.3065 (the mean of the three seeds), mIoU 0.5473. Test: destroyed 0.3898, and 0.3233 on Turkey | [r16c-step5-…](Champion_Task/r16c-step5-grader-on-sam3-outlines.ipynb), [R16c-results/step5b/](Champion_Task/R16c-results/step5b/README.md) |
| **C4, the mix (chosen 19 Nov)** | Both photos | R11 on xBD photos, find-then-grade on the other photos; chosen on validation, confirmed once on test | Damage map and one table | Clean validation: destroyed **0.3501**, mIoU 0.5881. Test: destroyed **0.4296**, mIoU 0.5555 | [E7 step 2c](Champion_Task/E7-results/step2c/README.md) |

**Why the mix works:** the U-Net is better on xBD's overhead photos; find-then-grade is the only method that sees Turkey's collapsed buildings, which are photographed at an angle. On the test pairs, C4 beats the U-Net alone by +0.031 destroyed IoU (95% interval +0.008 to +0.057) and find-then-grade alone by +0.040 (+0.027 to +0.055).

### 5.2 The building table and counting

| Item | What it is |
|---|---|
| Input | C4's damage map |
| How | On the sharper photos, one row per building that SAM 3 outlined; on xBD photos, one row per connected patch of the U-Net's pixels (at least 20 px). A column `kind` says which |
| Output | `buildings_c4.sqlite` (SQLite database): 125,439 rows on 2,065 test photos (57,849 outlines, 67,590 patches). Columns: class, area, centre, box, distance to the nearest destroyed building (in pixels: DisasterM3 gives no ground scale) |
| Counting | Fixed queries written and checked by hand. No language model counts: H2b showed none can be trusted to write the queries (Part 7.8) |
| Result | 35.34% of the benchmark's 3,580 askable counting questions (34.89% without copied photos), above the 34.2% target. Accuracy is flawed here (Part 3.3) |
| Files | [E7 step 3](Champion_Task/E7-results/step3/README.md), [E7 step 3b](Champion_Task/E7-results/step3b/README.md), [H2](Champion_Task/H2-results/H2/README.md) |

### 5.3 The danger heatmap

| Item | What it is |
|---|---|
| Input | A damage map |
| How | Danger is a blurred mix of destroyed and damaged pixels (a kernel density estimate). Safety is the distance from any damage. Up to 3 hot spots (the densest damage) and up to 3 safe areas (open ground farthest from damage). Version 3 keeps markers off the photo's edge |
| Output | `hotspots.json` per photo; heatmap pictures |
| Result | On C4's test maps: 82.7% of hot spots within 20 px of real damage on the 687 photos with destroyed buildings; 56.9% over all 2,007 (most false alarms are on photos with no destroyed buildings) |
| Files | [t1-survivability-heatmap-v3.ipynb](Champion_Task/t1-survivability-heatmap-v3.ipynb), [T1-results/](Champion_Task/T1-results/), [E7 step 3](Champion_Task/E7-results/step3/README.md) |

### 5.4 The guideline search

| Item | What it is |
|---|---|
| What | Ridita's offline search over 405 sections of six guidelines: EMS-98 (building damage grades), INSARAG Guidelines 2020 volumes II and III (search and rescue), the Sphere Handbook 2018 (humanitarian standards), xBD's damage scale, and IWG-SEM |
| How | By meaning (embeddings) and by keywords together ("hybrid"). Each section has an ID such as `[INSARAG2B-5.5.2]` |
| Result | 27 of 30 test questions retrieve the right section (24 were needed) |
| Files | [Offline_RAG_KR2/README.md](Offline_RAG_KR2/README.md), `guideline_chunks.jsonl`, `pdf_search_tool.py` |

### 5.5 The 7B vision-language model

| Item | What it is |
|---|---|
| Base model | Qwen2.5-VL-7B-Instruct |
| First fine-tune (CSE499A) | QLoRA on DisasterM3's training questions: `AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP` |
| Second fine-tune (L0 step 2, kept 28 Oct) | The first, trained further on disaster type and relational reasoning with an equal replay of the other tasks (7,018 examples, about 19.5 h): `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` |
| How it is scored | Greedy answers (no randomness), the DisasterM3 authors' prompts, photos at full size (1036 px) |
| Result | Mean of six tasks 39.20% (base model 31.2%, the paper's own fine-tune 40.4%). Table in Part 7.9 |
| Its jobs | Writes the reports; answers questions in the website's language parts; is the 3B's teacher |
| Files | [L0 step 2 part A](Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [part B](Champion_Task/L0-step2-results/new-partB/L0S2/README.md) |

### 5.6 The report writer

| Item | What it is |
|---|---|
| What | DisasTeller's six reports: Expert team report, Alerts for social media, Emergency team report, Emergency service human-resource allocation, Public community report, Reconstruction plan |
| How it runs | The fixed flow: code calls the tools in a fixed order (facts from C4's table and hot spots, the code's own map reading, guideline searches), and the 7B, served locally with vLLM, writes each section. The internet is off; every network connection is recorded |
| Checks while writing | (1) The number checker reads every number with what it measures, and compares it with the facts and the passages shown; a wrong, unsourced or misused number makes the 7B answer again. (2) The number guard replaces a number still wrong after the second answer with "(number not available offline)". (3) The ID guard (23 Nov) drops any guideline ID the section wasn't shown |
| Result | Two test pairs: 0 wrong, unsourced or misused numbers out of 178 (run 4, 20 Nov). Ten scenes (T2b): our 7B is the better writer. Made-up IDs: 3 → 0 with the ID guard |
| Files | `Offline_RAG_KR2/disasteller_offline/fixed_flow_c4.py`, `number_check.py`; [T2 step 7](Offline_RAG_KR2/results/t2_step7/README.md), [T2b](Offline_RAG_KR2/results/t2b/README.md), [ID guard](Offline_RAG_KR2/results/t2b_id_guard/README.md) |

### 5.7 The field models

| Model | What it is | Result | Files |
|---|---|---|---|
| 8-bit after-only U-Net | R9 exported to ONNX and stored in 8 bits, with the first and last convolutions and two decoder convolutions kept in fp32 | 33 MB; 1.6 s per photo on a 4-thread CPU (1.43× the fp32 ONNX); destroyed IoU down only 0.0003; in a browser, the same map as a native run on 100% of pixels in 3–5 s | [L1b](Champion_Task/L1B-results/L1b/README.md) |
| 8-bit before-and-after U-Net (the website's model since 18 Nov) | R11, the same recipe | 33.2 MB; 1.75 s per pair; destroyed IoU down 0.0014 | [L1c](Champion_Task/L1C-results/L1c/README.md) |
| The 3B, option (c) | Qwen2.5-VL-3B with a LoRA adapter trained one epoch on the 7B's checked answers (53,032 training entries) | Chosen over (b) on held-out questions: 45.12% against 35.95% | [L2 step 3](Champion_Task/L2-step3-results/full/L2S3/README.md) |
| The 3B in 4 bits | The same, loaded in 4 bits (bitsandbytes NF4), with the overflow fix | 2.42 GB of weights, 3.03 GB peak, 1.72 s per question on one T4; 44.49% on the six tasks, no loss against normal precision | [L3](Champion_Task/L3-results/full/L3/README.md) |
| The hand-off | The 3B answers; if its confidence is low, the question goes to the 7B. The threshold is set by a rule fixed before the run | The confidence needed calibrating (temperature 2.0). Because the 3B alone beats the 7B on average, the rule lets the 3B answer everything. A per-task split (the 7B for disaster type, bearing bodies and scene) would reach 48.15% against 45.04%, with both models loaded | [hand-off](Champion_Task/L3-results/full/L3/handoff/README.md) |

### 5.8 The website

| Item | What it is |
|---|---|
| Pages | Home `/`, How it works `/how`, Explore `/explore` (the building map, fixed questions, 3D damage city), Try it `/try` (the field model in the visitor's browser), Results `/results`, Reports `/reports` (the six reports with their known problems marked), About `/about` |
| Rules | Every number comes from `src/data/facts.json`, each fact with its source file; the build fails if a fact's text isn't in its source. Nothing is invented; the 3D heights are labelled an illustration |
| Status | Built (17 Nov). Not deployed yet. Aryan owns the rest: deploy to Vercel, phone test |
| Files | [T3_Website/README.md](T3_Website/README.md), [Wireframes/](Wireframes/README.md) |

### 5.9 Layer 3: generated before-photos (Ridita)

| Item | What it is |
|---|---|
| The question | When a disaster has no before-photo, can a picture generated from the after-photo stand in for it? Both damage-map methods need a before-photo |
| The plan | Six steps: the pairs and checks; baselines; a pix2pix generator; an optional diffusion model; an optional SAM 3 test; once on the test pairs. The rule is fixed before training, and judged on mIoU against R11 with the real before-photo (0.5805) and R9 with none (0.5402) |
| Status | Step 0 passed all seven checks (18 Nov). Step 1 is Ridita's next |
| Files | [Layer3_Task_Brief.md](Layer3_Task/Layer3_Task_Brief.md), `Layer3_Task/results/step0/` |

---

## Part 6. What was done, in order, and why

Each line: the date, what was done, and the decision it led to. "Decision" lines are Abrar's choices; the full list with reasons is the table in [Task_Ledger.md §2](Task_Ledger.md).

### 6.1 CSE499A (Senior Design I, before October 2026)

- Fine-tuned Qwen2.5-VL-7B on DisasterM3 with QLoRA on Kaggle's two T4s: our first 7B (`AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP`). The original plan (generated rescue guidance from xBD, FloodNet, AIDER and RescueNet) is in the archived part of the [README](../README.md).
- A first segmentation baseline: U-Net with a ResNet-34 encoder and cross-entropy + Dice loss, mIoU 0.4619, destroyed IoU 0.152.
- Deliverables, including the 1-minute video: `others/CSE499A/`.

### 6.2 October: the training sprint (7–18 Oct)

- **7 Oct:** CSE499B review report and presentation (`others/CSE499B_Review_report.pdf`): the four goals O1–O4.
- **7–13 Oct:** four teammates each changed one thing in the baseline: sampling (Aryan), architecture (Abrar), loss (Noman), resolution and inference (Ridita). Update 1 (13 Oct). Best mIoU 0.5233 with the phased loss (table in Part 7.1).
- **D4 champion recipe:** the best of each track together: U-Net with ResNet-50, 768 px crops, Focal Tversky then Lovász loss, 40 epochs. This is R1 (mIoU 0.5374, destroyed 0.2686).
- **R2–R10:** one change each against R1. None beat R1 by more than the noise. **Decision (8 Oct):** R7 = R1's recipe; run two combinations (R9, R10).
- **R9** (sampler + copy-paste) was best on destroyed buildings (0.3001 with TTA), but its two seeds averaged 0.2971, just under the 0.30 gate. **Decision (18 Oct):** close fine-tuning; start Phase 2 ([Phase2_Plan.md](Phase2_Plan.md)).

### 6.3 Phase 2: diagnose, then change the structure (18–27 Oct)

- **E1 (diagnosis):** 59.5% of the destroyed pixels R9 misses are called background: it doesn't see rubble as a building. **Gate G2:** run R11 (the before-photo shows where the building stood) before R12 (more destroyed examples).
- **E2:** a majority vote per building lowered destroyed IoU (0.292 → 0.228). Dropped.
- **E3:** SAM 3 finds buildings better than R9 (building IoU 0.630 against 0.591). **Gate G3:** SAM 3 does the finding in find-then-grade.
- **R11 (before + after):** mIoU 0.588 with TTA, the biggest gain; destroyed unchanged. Became the champion U-Net.
- **D5, D5b:** converted 1,619 extra xBD tiles (D5's 1,007 and D5b's 612). 447 of D5's tiles, and all 612 of D5b's, are benchmark photos; xBD has no other clean source of destroyed buildings. **The two-model rule:** a model trained on them never answers benchmark questions. **Decision (19 Oct):** R12 uses them for the damage map (O1) only.
- **R12 (R11 + the extra tiles):** within noise of R11. **E4** showed why: almost all of the destroyed gap is the Turkey earthquake, where R11 scores 0.000 (it calls 91.5% of destroyed pixels intact). Without Turkey, R11 scores 0.410.
- **R16 (find-then-grade, first try):** the grader over-graded intact buildings. **R16b:** corrected by the real grade shares, still below R11. **R16c step 1:** with a perfect grader, the outlines would reach 0.614: the grader is the bottleneck. **Step 2:** a stronger grader passed the O1 gate on all 645 pairs. **Steps 4–5:** a grader trained on SAM 3's own outlines; its SAM 3-only map is the one map that passes the gate on clean data. **Step 5b:** a third seed; O1 met on the three-seed mean only, narrowly (0.3065).
- **R11s7:** R11 with seed 7: the U-Net alone misses 0.30 on two seeds (0.2947).
- **H1, H2, H2b (counting):** counting blobs in R9's map 22.3%; the 7B asked directly 30.5%; R11's table 32.96%; no language model writes reliable database queries (H2b). **Decision (H2b's rule):** fixed queries only.
- **T1:** the danger heatmap, version 3 final.
- **L1, L1b:** the 8-bit field U-Net (33 MB, destroyed IoU down 0.0003). O4's segmenter part met.
- **H1 V2, L0 step 1:** the 7B scored greedily on all six tasks; at full image size it improves. **Decision (19 Oct):** improve the 7B before distilling it (L0 step 2). **28 Oct:** the new 7B is kept (mean 39.20% against 38.37%).
- **26 Oct, E5 (the leak):** 40 validation pairs leaked; every score re-scored on 605 clean pairs.

### 6.4 November, first half: one chain, the test set, the reports (28 Oct–18 Nov)

- **Update 2 (28 Oct), update 3 (4 Nov).**
- **4 Nov, decision: one chain before any new module.** The parts had been tested alone, each with its own model and photos. E7 scores the chain as one.
- **E6 (7 Nov):** the 2,007 clean test pairs and their true masks.
- **E7 step 2 (7–8 Nov):** U-Net and find-then-grade level overall on test (0.3984 against 0.3898), but split by event: the U-Net wins without Turkey, find-then-grade wins Turkey. **Step 2b:** the overall gap is noise. **Step 2c (17 Nov):** C4, a mix chosen on validation, wins on test beyond noise. **Decision (19 Nov):** C4 is the system's damage map.
- **7 Nov:** the benchmark's counting flaw found; count error reported from then on.
- **8 Nov, decision:** train two 3Bs, (b) and (c), and keep the better one by a rule fixed before any training.
- **T2 (Ridita, 3–17 Nov):** DisasTeller rebuilt on our 7B; the CrewAI agents failed, so the fixed flow replaced them (10 Nov); the internet-off proof run passed (11 Nov); our reports against July's Gemini reports (16 Nov); a quality-fix run (17 Nov).
- **T3 (Abrar, 15–17 Nov):** the website built, seven pages. Aryan takes over from 18 Nov.
- **Update 4 (11 Nov), update 5 (18 Nov).**

### 6.5 November, second half: the chain's facts, the 3B, and the checks (18–23 Nov)

- **18 Nov:** L1c (8-bit R11, now the website's model); L4 (EfficientSAM3 finds buildings far worse than SAM 3: SAM 3 stays); R16c step 6 (aligned crops don't help); Layer 3 step 0 passed.
- **19 Nov:** E7 step 3: C4's table (125,439 rows) and hot spots on the test photos; counting 35.34%. L0b: training the 7B's vision part helps it but stays below the grader.
- **20 Nov:** T2 step 5: the reports read C4's facts, offline. T2 step 7 found 13 wrong numbers in run 1; after three fixes, run 4 had 0 of 178. R16c step 7: super-resolved crops make the grader worse.
- **19–23 Nov:** both 3Bs trained one full epoch each, started session by session by the runner. They survived a full Hugging Face storage quota (21 Nov, Abrar freed 43 GB) and a stalled GPU (21 Nov).
- **21–22 Nov:** T2b: our 7B stays the writer (3 contradictions against the small text model's 15). H4: an outside benchmark can't settle counting (57% of its photos are our training photos). L0b step 2 and R16c step 8: no gain for the grader.
- **23 Nov:**
  - The ID guard: made-up guideline IDs 3 → 0.
  - Update 6 drafted (`others/CSE499B_update_6_draft.tex`, kept local).
  - L2 run 4: (c) kept over (b), 45.12% against 35.95%.
  - The first benchmark runs of (c) at normal precision and in 4 bits.
  - Then the overflow found: 327 and 220 answers came out as exclamation marks, scored wrong. Fixed. Both runs restarted from scratch with the fix (Abrar's choice: full reruns), and (b) is scored too. They sat 8 hours in Kaggle's queue (no GPUs anywhere), then started at 23:17 and 23:25.
  - A watcher that pushes queued runs again was built.
  - The two blind report-reading sheets prepared; Gemini's verdict recorded, with the writers sealed until Abrar's own reading.

---

## Part 7. All the results, in tables

### 7.1 The first sprint (ResNet-34 baseline, Update 1, 13 Oct)

Single runs on the 645 validation pairs. Source: [UPDATE.md](../UPDATE.md).

| Track | Change from the baseline | mIoU | Destroyed IoU |
|---|---|---|---|
| — | Baseline: U-Net, ResNet-34, cross-entropy + Dice, resize 512, batch 16, 40 epochs | 0.4619 | 0.152 |
| Data | Weighted sampler (10-epoch run, against 0.3978 uniform) | 0.4051 | 0.102 |
| Architecture | U-Net++ | 0.4405 | 0.131 |
| Architecture | U-Net++ with scSE attention | 0.4367 | 0.125 |
| Loss | Focal Tversky (0.3 / 0.7 / 2.0) | 0.5181 | 0.257 |
| Loss | Focal Tversky (0.25 / 0.75 / 1.33) | 0.5203 | **0.273** |
| Loss | Focal Tversky, then + Lovász in the last 20% of epochs | **0.5233** | 0.272 |
| Resolution | Random 768 px crops (batch 8) | 0.4757 | 0.177 |
| Inference | The 768 model with 8-view TTA | 0.4902 | 0.195 |

### 7.2 The D4 U-Net runs (validation, all 645 pairs)

mIoU / destroyed IoU; with TTA in brackets. Source: [Task_Ledger.md §3](Task_Ledger.md), [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md).

| Run | Change from R1 | Result |
|---|---|---|
| R1 | The reference (D4 recipe) | 0.5374 / 0.2686 (0.5440 / 0.2822) |
| R2 | Copy-paste of destroyed buildings | 0.5369 / 0.2681 |
| R3 | Loss weights 0.25 / 0.75 / 1.33 | 0.5402 / 0.2790 |
| R4 | U-Net++ | 0.5267 / 0.2551 |
| R5 | Sampler favouring damaged images | 0.5354 / 0.2898 |
| R1s7 | R1 with seed 7 | 0.5402 / 0.2815 |
| R8 | Extra augmentation | 0.5342 / 0.2703 |
| R9 | Sampler + copy-paste | 0.5373 / 0.2921 (0.5440 / **0.3001**) |
| R10 | Sampler + R3's loss | 0.5345 / 0.2891 (0.5406 / 0.2969) |
| R9s7 | R9 with seed 7 | 0.5382 / 0.2847 (0.5453 / 0.2941) |
| R11 | Before + after (6 channels) | 0.581 / 0.291 (**0.588** / 0.297) |
| R12 | R11 + 1,619 extra xBD tiles | 0.582 / 0.290 (0.588 / 0.295) |
| R11s7 | R11 with seed 7 | 0.587 / 0.287 (0.591 / 0.293) |

### 7.3 Find-then-grade, step by step (validation)

| Step | What changed | Destroyed IoU (mIoU) | Verdict | Source |
|---|---|---|---|---|
| R16 | First grader (96 px crops, equal grade shares) | 0.261 best (the vote map) | Not kept: over-grades intact buildings | [R16](Champion_Task/R16-results/) |
| R16b | Grades corrected by real shares (no retraining) | 0.274 (0.585) | Not kept | [R16b](Champion_Task/R16b-results/) |
| R16c step 1 | A perfect grader on the same outlines (a ceiling) | 0.614 (0.766) | The grader is the bottleneck | [step 1](Champion_Task/R16c-results/step1/) |
| R16c step 2 | Stronger grader (128 px crops, 20 epochs, biases) + R11's pieces | 0.316 / 0.311 on two seeds (all 645) | Kept; gate passed on all 645 | [step 2](Champion_Task/R16c-results/step2/README.md) |
| R16c step 3 | Step 2 with R11s7's pieces | 0.309 / 0.301 | Gate on two U-Net seeds (all 645) | [step 3](Champion_Task/R16c-results/step3/README.md) |
| R16c step 5 | Grader trained on SAM 3's outlines; SAM 3-only map | Clean: 0.3161 / 0.3051 | Passes on clean data | [step 5](Champion_Task/R16c-results/step5/README.md) |
| R16c step 5b | Third grader seed (44) | Clean: 0.2982; three-seed mean **0.3065** | O1 met on the mean, narrowly | [step 5b](Champion_Task/R16c-results/step5b/README.md) |
| R16c step 6 | Crops aligned between the photos | 0.3048 against 0.3066 | No help | [step 6](Champion_Task/R16c-results/step6/README.md) |
| R16c step 7 | Super-resolved crops (Swin2SR, Real-ESRGAN) | 0.303 and 0.301 against 0.307 | Worse | [step 7](Champion_Task/R16c-results/step7/README.md) |
| R16c step 8 | A smaller "destroyed" penalty | C4: 0.3501 → 0.2287 with no penalty | Keep −4.0 | [step 8](Champion_Task/R16c-results/step8/README.md) |

### 7.4 The damage-map methods on clean validation (605 pairs) and on test (2,007 pairs)

| Method | Clean validation: destroyed / mIoU | Test: destroyed / mIoU | Test: Turkey destroyed | Test: building IoU |
|---|---|---|---|---|
| After-only U-Net (R9, TTA) | 0.2874 / 0.5402 | — | — | — |
| Before-and-after U-Net (R11, TTA) | 0.2692 / 0.5805 | 0.3984 / 0.5721 | 0.0867 | 0.6944 |
| Find-then-grade (3-seed mean) | 0.3065 / 0.5473 | 0.3898 / 0.5129 | 0.3233 | 0.5416 |
| **C4 (the mix)** | **0.3501 / 0.5881** | **0.4296 / 0.5555** | 0.3231 | 0.6221 |

Sources: [E5](Champion_Task/E5-results/E5/README.md), [E7 step 2](Champion_Task/E7-results/step2/README.md), [E7 step 2c](Champion_Task/E7-results/step2c/README.md).

### 7.5 Counting (building damage counting on the benchmark)

| What counts | How | Accuracy | Source |
|---|---|---|---|
| R9's map, blobs | H1 V1 | 22.3% (optical 26.5%) | [H1 V1](Champion_Task/H1-V1-results/) |
| Our first 7B, asked directly | H1 V2b | 30.5% (optical 32.0%) | [H1 V2b](Champion_Task/H1-V2b-results/) |
| Our 7B (L0 step 2), full size | L0 step 2 | 30.31% | [L0 step 2](Champion_Task/L0-step2-results/new-partA/L0S2/README.md) |
| R11's table, fixed query | H2 | 32.96% (optical) | [H2](Champion_Task/H2-results/H2/README.md) |
| **C4's map, joined blobs** | E7 step 3 | **35.34%** of 3,580; 34.89% clean | [E7 step 3](Champion_Task/E7-results/step3/README.md) |
| C4's table, one row per building | E7 step 3b | 33.18% (touching buildings count as one in the benchmark's truth) | [E7 step 3b](Champion_Task/E7-results/step3b/README.md) |
| The blind rule (never sees the photo) | — | 66.98% | [check](Champion_Task/benchmark-option-rule-check.ipynb) |
| Base Qwen2.5-VL-7B (the target) | The paper | 34.2% | DisasterM3 paper, Table 2 |

### 7.6 The danger heatmap

| Version and maps | Measure | Result | Source |
|---|---|---|---|
| T1 v1 / v2 / v3, R9's validation maps, 20 photos checked by eye | Circles on damage | 36 of 48 / 39 of 46 / 41 of 46 | [T1](Champion_Task/T1-results/) |
| T1 v3, 645 validation photos | Hot spots within 20 px of real damage | 73.6% | [T1 v3](Champion_Task/T1-results/T1-v3/README.md) |
| C4's maps, 2,007 test pairs | Same | 56.9% (82.7% on the 687 photos with destroyed buildings) | [E7 step 3](Champion_Task/E7-results/step3/README.md) |

### 7.7 Report quality

**Our reports against July's, written by Gemini with the internet on** (Ridita, 16 and 17 Nov):

| Measure | July (Gemini) | Ours, 16 Nov | Ours after the quality fix, 17 Nov |
|---|---|---|---|
| Guideline citations a reader can check | 0 | 11 (1 report) | 24 (4 reports), all real |
| Made-up response-plan numbers | 33 | 5 | — |
| Sentences saying there is no danger | 0 | 4 | 0 |
| Contradictions | 2 | 6 | 3 |
| Useful to a rescue team: yes / partly / no | 3 / 3 / 0 | 0 / 5 / 1 | 2 / 4 / 0 |

**The chain's reports (T2 step 5, two test pairs, internet off):** run 1 had 13 wrong numbers; run 4 (with clearer facts, a check while writing, and requests that don't ask for numbers the facts lack) had 0 wrong, unsourced or misused numbers of 178. [T2 step 7](Offline_RAG_KR2/results/t2_step7/README.md).

**Who writes the reports (T2b, ten test scenes, 60 reports each):**

| Measure | Our 7B | Qwen2.5-3B-Instruct (text only) |
|---|---|---|
| Wrong or misused numbers left after the second answer | 3 | 15 |
| Made-up guideline IDs | 3 (→ 0 with the ID guard, 23 Nov) | 0 |
| Reports finished | 60 | 60 |
| Minutes per scene | 6.2 | 18.0 |
| Verdict by the rule fixed before the run | **Stays the writer** | — |

Sources: [T2b](Offline_RAG_KR2/results/t2b/README.md), [ID guard](Offline_RAG_KR2/results/t2b_id_guard/README.md). A blind reading of 5 report pairs by Abrar, and by Gemini as a second judge, is in progress (Gemini's verdict is recorded with the writers sealed: [RESULT.md](Offline_RAG_KR2/results/t2b/blind/gemini/RESULT.md)).

### 7.8 A model writing database queries (H2b, 297 test items)

| Model | Accuracy (test-suite) | Reliability score RS(10) | Passes (needs ≥ 90% and RS > 0)? |
|---|---|---|---|
| Our 7B, 4-bit | 69.0% | −89.6 | No |
| Qwen2.5-Coder-3B, fp16 | 73.9% (the best) | negative | No |
| Base Qwen2.5-VL-3B, 4-bit | 46.4% | −365.7 | No |

So the system uses fixed queries only. [H2b](Champion_Task/H2b-results/H2b/README.md).

### 7.9 Every 7B and 3B on the benchmark's six tasks

Accuracy (%) on the 10,675 optical questions, with the overflow fix (24 Nov). Source: [the comparison](Champion_Task/L2-step4-results/full/comparison/README.md).

| Model | DTR | BBR | BDC | DRE | DSR | ORR | Mean |
|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-3B, untrained (paper) | 56.1 | 5.7 | 29.9 | 21.2 | 30.8 | 13.8 | 26.2 |
| Our 3B (b), soft labels | 63.74 | 21.98 | 19.93 | 27.57 | 36.92 | 24.71 | 32.47 |
| Our 3B (c), the 7B's answers | 62.04 | 16.65 | 49.79 | 46.63 | 35.38 | 51.98 | 43.74 |
| Our 3B (c) in 4 bits | 63.17 | 16.55 | 48.17 | 48.72 | 34.63 | 55.71 | 44.49 |
| Qwen2.5-VL-7B, untrained (paper) | 66.6 | 4.7 | 34.2 | 29.3 | 28.3 | 23.9 | 31.2 |
| Our first 7B (CSE499A), full size | 75.64 | 20.94 | 30.09 | 32.39 | 40.06 | 31.12 | 38.37 |
| Our 7B (L0 step 2), full size | 76.77 | 19.99 | 30.31 | 33.03 | 40.46 | 34.62 | 39.20 |
| DisasterM3's fine-tuned 7B (paper) | 83.6 | 21.5 | 34.3 | 29.4 | 37.7 | 36.2 | 40.4 |

- **What the 3B's numbers mean:** it beats its 7B teacher on counting and relational reasoning, and trails it on disaster type, bearing bodies and scene. It learned from the 7B's *checked* answers, with counting and relational questions re-answered with the options shown.
- **Is the counting lead real?** On the 3,562 counting questions whose options don't give the answer away, the 3B got 53.3%, our 7B 33.2% and the blind rule 36.2%, both gaps far beyond chance. [Checks](Champion_Task/L2-step4-results/full/checks/README.md).
- **Paired over all questions:** the 3B (c) beats (b) by 14.2 points and our 7B by 8.2 points, both beyond chance. 4 bits and normal precision are level (439 questions each way).
- **Clean scores:** dropping the 186 copied questions moves every score by at most 1.11 points, and no task changes which model is ahead.
- **Sources:** the paper's Table 2 (`others/lit review_research papers/DisasterM3.md`), [L0 step 1](Champion_Task/L0-step1-results/L0S1/README.md), [L0 step 2](Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [run 5](Champion_Task/L2-step4-results/full/L2S4/README.md), [L3](Champion_Task/L3-results/full/L3/README.md). The first runs, before the fix, are kept in `full-before-fix/`.

### 7.10 Choosing between the two 3Bs (L2 run 4, 1,962 held-out training questions)

| Model | Rule's score* | DTR | BBR | BDC | DRE | DSR | ORR |
|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-3B, untrained | 27.80 | 66.67 | 6.75 | 30.94 | 24.24 | 38.79 | 8.0 |
| (b), soft labels | 35.95 | 77.38 | 24.94 | 21.99 | 31.96 | 50.57 | 10.0 |
| **(c), the 7B's checked answers** | **45.12** | 73.81 | 19.22 | 53.23 | 48.48 | 41.95 | 47.0 |

*The rule's score leaves out counting questions whose largest option is above 20. Only (c) right on 338 questions, only (b) right on 185: p < 0.0001. Each model lost the same 50 questions to the overflow, so the choice stands. [L2 step 3](Champion_Task/L2-step3-results/full/L2S3/README.md).

### 7.11 Field models: size, speed, memory

| Model | Size | Speed | Accuracy cost | Source |
|---|---|---|---|---|
| R9 in 8 bits (ONNX) | 33 MB | 1.6 s per photo (4-thread CPU); 3–5 s in a browser | destroyed IoU −0.0003 | [L1b](Champion_Task/L1B-results/L1b/README.md) |
| R11 in 8 bits (ONNX) | 33.2 MB | 1.75 s per pair (4-thread CPU) | destroyed IoU −0.0014 | [L1c](Champion_Task/L1C-results/L1c/README.md) |
| EfficientSAM3 (3 small finders) | about 100M parameters each | 0.6–0.7 s per photo on a T4 | building IoU 0.010–0.054 against SAM 3's 0.630: not usable | [L4](Champion_Task/L4-results/L4/README.md) |

One question at a time on one T4 GPU (L3 with the overflow fix, 60 questions):

| Model | GPU memory, weights | GPU memory, peak | Seconds per question |
|---|---|---|---|
| 3B (c), 4 bits | 2.42 GB | **3.03 GB** | 1.72 |
| 3B (c), fp16 | 7.52 GB | 8.10 GB | 1.62 |
| Our 7B, 4 bits, full-size photos | 5.91 GB | 8.64 GB | 4.83 |

### 7.12 Tests that didn't help (kept so nobody repeats them)

| Test | Idea | Result | Source |
|---|---|---|---|
| E2 | Majority vote per building | Destroyed IoU 0.292 → 0.228 | [E1](Champion_Task/E1-results/) |
| R2–R8, R10 | One change each to the U-Net recipe | None beat R1 beyond noise | [Ledger §3](Task_Ledger.md) |
| R12 | 1,619 extra xBD tiles | Within noise of R11 | [E4](Champion_Task/E4-results/E4/README.md) |
| H1 V2 | A U-Net fact line before each 7B question | Lowered every task | [H1 V2](Champion_Task/H1-V2-results/) |
| R16c step 6 | Aligned crops | 0.3048 against 0.3066 | [step 6](Champion_Task/R16c-results/step6/README.md) |
| R16c step 7 | Super-resolved crops | Worse | [step 7](Champion_Task/R16c-results/step7/README.md) |
| L0b, L0b step 2 | Train the 7B's vision part; combine it with the grader | 176 of 300 buildings right against the grader's 212; combinations lose | [L0b step 2](Champion_Task/L0b-results/step2/README.md) |
| R16c step 8 | A readier "destroyed" | Lower destroyed IoU | [step 8](Champion_Task/R16c-results/step8/README.md) |
| H4 | An outside counting benchmark | Can't decide anything: biased options, 57% overlap | [H4](Champion_Task/H4-results/H4/README.md) |

---

## Part 8. What is running now, and what remains

### 8.1 Running now: nothing (24 Nov, 04:30)

The two reruns with the overflow fix finished at 03:39 and 03:40. They're saved in `L2-step4-results/full/` and `L3-results/full/`, and the three PC notebooks ran: the checks, the hand-off and the comparison (Parts 7.9–7.11).

### 8.2 Open tasks

| Task | What is left | Who | Status |
|---|---|---|---|
| L3 step 6 | Memory and speed of the 3B (and the chain) on a laptop with no GPU | Abrar | Not started |
| Blind reading (T2b) | Abrar fills `reading_sheet.md`; then the writers are revealed beside Gemini's verdict | Abrar | In progress |
| Report quality beyond numbers | From the blind reading | Abrar, Ridita | Next |
| Layer 3 steps 1–6 | Baselines, pix2pix, optional diffusion, test pairs | Ridita | Step 1 next |
| T3 website | The real gallery export wired in, deploy to Vercel, phone and booth-laptop tests | Aryan | Open |
| Booth live mode | A small local API (FastAPI) for the models that can't run in a browser | — | Not started |
| L2b | "Why?" explanations as a second skill for the 3B | — | Not started |
| H2c | Free-form questions, second try | — | Not started |
| H3, R13, R14, R15 | VLM input upgrades; BRIGHT footprints; rubble crops; a combined U-Net with a second seed | — | Not scheduled |
| Cleanup | Delete the Hugging Face write token and the three `l2-hf-write-token` datasets; switch off the runner's scheduled task | Abrar's go | Waits |

### 8.3 Deliverables and dates

| Item | What | When |
|---|---|---|
| Update 6 | Draft in `others/CSE499B_update_6_draft.tex` (two pages); teammates' sections marked in red. Kept local, not on GitHub (Abrar, 24 Nov) | Due Wed 25 Nov |
| The supervisor's instruction | Go through every part of the code and the GitHub repository. Make a one-minute video demo of the project's functionality from the user's point of view, recorded by screen capture | Next |
| The one-minute video | **Done (24 Nov):** [`others/CSE499B_1-min_video_demonstration.mp4`](../others/CSE499B_1-min_video_demonstration.mp4), linked at the top of the README instead of update 6; made by the scripts in `T3_Website/scripts/demo-video/` | Done |
| README | **Done (24 Nov):** a categorised list of the files and folders in `Essential_task_delegation/` | Done |
| Final report, poster, rehearsal | Wait until the system works and Abrar says go | Before the showcase |
| The showcase | — | About 15 Dec |

---

## Part 9. How the work is done: the rules

These rules explain many choices in the files.

1. **A rule fixed before every run.** How a result will be judged is written down before the run, in the notebook's first cell and the ledger, so it can't be bent afterwards. Where no number was predicted, the file says so.
2. **The keep rule for training runs.** A change is kept only if it beats the reference by more than the seed noise (about 0.013 destroyed IoU) and doesn't lower mIoU by more than about 0.005. O1's gate needs two seeds, or their mean.
3. **Choose on validation, confirm on test.** Nothing is tuned on the 2,007 test pairs; they are used once.
4. **Clean scores.** Every score is checked for copies by image content, not by file name, and reported both ways (all and clean).
5. **The two-model rule.** A model trained on benchmark photos never answers benchmark questions.
6. **Counting from the table, never from a language model.** Fixed queries, written and checked by hand.
7. **Smoke test first.** Every Kaggle notebook runs on a few items before the long run. Since 23 Nov, smoke tests include items known to have failed before.
8. **Copy before changing.** A notebook for a new task is a named copy; the original and its outputs stay untouched. Fixes to the same task are made in place, with a dated note in the first cell.
9. **Outputs are kept.** Every Kaggle run's outputs, executed notebook and log are saved in the repository under `<TASK>-results/<variant>/`. PC notebooks run in Jupyter so their outputs stay in the notebook.
10. **The documents follow every result.** After each result: the tracker, the ledger, the roadmap, Team_Status, and any other document it touches.
11. **Queued runs are pushed again.** A Kaggle run stuck in the queue is pushed again every 10 minutes until it starts (since 23 Nov).
12. **Honest labels.** Anything estimated, illustrated or generated says so where it is shown. The website shows only numbers from its facts file, each with its source.
13. **Git is run by Abrar.** Commands are given, never run, and commits carry no AI attribution.
