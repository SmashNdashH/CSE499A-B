> **Latest:** [1-minute video demonstration (24 Nov 2026)](others/CSE499B_1-min_video_demonstration.mp4) | [Update 5 (18 Nov 2026)](others/CSE499B_update_5.pdf) | [Visual walkthrough & screenshots](Essential_task_delegation/Wireframes/README.md) | [All weekly updates and presentations](#weekly-updates-and-presentations) | [Progress tracker](Essential_task_delegation/Progress_Tracker.md) | [CSE499A archive](#cse499a-senior-design-i-archived-readme)

---

# Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment and Rescue Guidance

> **CSE499B/EEE499B/ETE499B — Senior Design II, Section 13, Project Group 5, North South University**  
> **Team:** Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam

![Home page of our offline disaster damage mapping website](Essential_task_delegation/Wireframes/01_home.jpg)
*Our showcase web application running offline on a real satellite image pair from the Santa Rosa wildfire. Dragging the handle compares the area before and after the disaster, with every building outlined by damage level: green = intact, yellow = damaged, red (hatched for colour-blind accessibility) = destroyed.*

---

## 1. The Problem We Are Solving (In Plain Words)

### What we are building

After an earthquake, flood or storm, rescue coordinators need to know within hours which buildings collapsed, how many, and where to search first, often with no internet and only a laptop. Our system takes a satellite image of an area before the disaster and one after it, and produces:

- **a damage map, building by building:** each building marked intact, damaged or destroyed;
- **counts** of intact, damaged and destroyed buildings, answered from a table of the buildings, never guessed by a language model;
- **a rescue-priority heatmap** with the most urgent spots circled;
- **written reports for rescue teams** that cite official guidelines (EMS-98 damage grades, INSARAG search-and-rescue, Sphere humanitarian standards), written by our own vision-language model (VLM) with the internet switched off.

All of it is meant to run offline, on hardware small enough to take into the field—including an **8-bit (33 MB) field model** that runs directly inside a web browser in **3–5 seconds** with zero data leaving the device.

### Why existing approaches fall short

In the first 72 hours of a disaster, responders face three practical barriers that shaped this design:

1. **Manual satellite review is too slow:** Inspecting thousands of roofs across high-resolution satellite photos by hand takes days.
2. **AI language models guess and hallucinate numbers:** Asking a standard VLM *"How many buildings are destroyed in this satellite photo?"* leads to guessed counts and invented safety claims—which is why our counts come strictly from fixed queries on the building table.
3. **Cloud AI does not work when the internet is down:** Field teams cannot rely on internet connectivity or paid cloud APIs during an active disaster.

> **Decision Support Only:** Every screen and printed report carries the reminder: *"A model's estimate, to be checked by people on the ground."* Heatmaps show damage density, not survivor locations.

---

## 2. How the System Works (Visual Walkthrough)

```text
Before photo ──► SAM 3 outlines every building ──┐
                                                 ▼
After photo  ──► Siamese ResNet-18 grader  ──► Building-level damage map + SQLite building table
                 (or 6-channel Before+After U-Net; best results combine both by imagery source)
                                                 │
         ┌───────────────────────────────────────┼────────────────────────────────────────┐
         ▼                                       ▼                                        ▼
 Fixed table queries                  Damage-density heatmap                    Offline hybrid search
 (exact counts & filters)         (3 search hot spots + 3 safe zones)      (405 EMS-98 / INSARAG / Sphere chunks)
         │                                       │                                        │
         └──────────────► Fine-tuned Qwen2.5-VL-7B (fixed offline workflow) ◄─────────────┘
                                                 │
                                                 ▼
                         Six structured responder reports with real citations
```

Below is the step-by-step flow as shown on the **How it works** page of our showcase website ([all 43 screenshots and notes are in `Essential_task_delegation/Wireframes/`](Essential_task_delegation/Wireframes/README.md)):

| Step 1: Two Satellite Photos | Step 2: Every Building Gets a Grade |
|---|---|
| ![Step 1: Before and after photos](Essential_task_delegation/Wireframes/02_how-it-works_step1_two-photos.jpg) | ![Step 2: Building damage map](Essential_task_delegation/Wireframes/03_how-it-works_step2_every-building-gets-a-class.jpg) |
| **Input:** A $1024 \times 1024$ before-disaster photo and after-disaster photo of the same location from the [DisasterM3](others/lit%20review_research%20papers/) dataset. | **Segmentation & Grading:** Each building is classified as **Intact** (green), **Damaged** (yellow), or **Destroyed** (red, hatched). |

| Step 3: Each Building Becomes a Table Row | Step 4: Counts Come From the Table |
|---|---|
| ![Step 3: Building table row](Essential_task_delegation/Wireframes/04_how-it-works_step3_each-building-becomes-a-row.jpg) | ![Step 4: Counts from the table](Essential_task_delegation/Wireframes/05_how-it-works_step4_counts-come-from-the-table.jpg) |
| **Structured Table:** Each building outline is stored as a row with its ID, class, pixel area, center coordinates, and distance to the nearest destroyed building. | **Deterministic Counting:** Counts are read directly from the table (`37.0%` accuracy on 1,701 benchmark questions from the table alone vs. `27.0%` when passed through the 7B VLM). |

| Step 5: Where to Search First (Heatmap) | Step 6 & 7: Offline Guidelines & Six Reports |
|---|---|
| ![Step 5: Danger heatmap and safe areas](Essential_task_delegation/Wireframes/06_how-it-works_step5_where-to-look-first.jpg) | ![Step 7: Six offline reports](Essential_task_delegation/Wireframes/08_how-it-works_step7_six-reports-written-offline.jpg) |
| **Hot Spots & Safe Staging:** Purple shows dense damage. Circles `1`–`3` mark priority search hot spots; squares `S1`–`S3` mark open ground farthest from damage. | **Offline Reports:** Hybrid search retrieves relevant EMS-98, INSARAG, and Sphere passages (`27/30` recall), and our fine-tuned 7B writes six responder reports offline. |

---

## 3. Inside the Interactive Showcase Website (`T3_Website`)

We built a 7-page offline-capable web application ([`Essential_task_delegation/T3_Website/`](Essential_task_delegation/T3_Website/README.md)) where every number is automatically verified against its source file in this repository on every build, and **no network request ever leaves the local machine**.

### Interactive Map Workspace (`Explore`)

| Inspecting Individual Buildings | Answering Fixed Spatial Questions |
|---|---|
| ![Clicking a building on Explore](Essential_task_delegation/Wireframes/11_explore_click-a-building.jpg) | ![Fixed question and its query](Essential_task_delegation/Wireframes/13_explore_fixed-question-and-its-query.jpg) |
| Click any building on the map (or zoom up to $6\times$) to see its exact row from the building table: damage class, area, coordinates, and distance to the nearest collapsed structure. | Select a pre-verified responder question—here, *"How many intact buildings are within 100 px of a destroyed one?"*—to highlight the exact 14 buildings and view the underlying query. |

| 3D Damage View | Ground-Truth Comparison Layer |
|---|---|
| ![3D damage city view](Essential_task_delegation/Wireframes/18_explore_3d-damage-city.jpg) | ![Ground truth overlay](Essential_task_delegation/Wireframes/21_explore_layer_ground-truth.jpg) |
| Extrudes the 2D building footprints by damage state (intact tallest, damaged medium, destroyed flat) for quick visual triage—explicitly labelled as a 3D view of 2D results, not a height measurement. | Toggle the dataset's true labels underneath our model's outlines to inspect exactly where the model succeeds and where it misses. |

### Real Performance Across Six Disaster Types (Typical Cases, Not Cherry-Picked)

The gallery includes six validation pairs—one per disaster type—selected by a rule fixed *before* inspecting the maps: the pair with the **median Destroyed IoU** for each event among clean validation pairs with at least 5,000 destroyed pixels. This shows both where the models work well and where they struggle ([source](Essential_task_delegation/Champion_Task/T3-gallery-export-results/README.md)):

| | | |
|---|---|---|
| <img src="Essential_task_delegation/Wireframes/23_explore_event_hurricane-harvey.jpg" alt="Hurricane Harvey" width="260"><br>**Hurricane Harvey** (Flood/Wind)<br>Destroyed IoU: `0.000` (U-Net) / `0.000` (Find-then-grade) | <img src="Essential_task_delegation/Wireframes/24_explore_event_midwest-flooding.jpg" alt="Midwest flooding" width="260"><br>**Midwest Flooding** (Flood)<br>Destroyed IoU: `0.000` (U-Net) / `0.000` (Find-then-grade) | <img src="Essential_task_delegation/Wireframes/25_explore_event_moore-tornado.jpg" alt="Moore tornado" width="260"><br>**Moore Tornado** (Tornado)<br>Destroyed IoU: `0.659` (U-Net) / `0.531` (Find-then-grade) |
| <img src="Essential_task_delegation/Wireframes/26_explore_event_palu-tsunami.jpg" alt="Palu tsunami" width="260"><br>**Palu Tsunami** (Tsunami)<br>Destroyed IoU: `0.277` (U-Net) / `0.314` (Find-then-grade) | <img src="Essential_task_delegation/Wireframes/27_explore_event_santa-rosa-wildfire.jpg" alt="Santa Rosa wildfire" width="260"><br>**Santa Rosa Wildfire** (Wildfire)<br>Destroyed IoU: `0.752` (U-Net) / `0.762` (Find-then-grade) | <img src="Essential_task_delegation/Wireframes/28_explore_event_turkey-earthquake.jpg" alt="Turkey earthquake" width="260"><br>**Turkey Earthquake** (Off-nadir angle)<br>Destroyed IoU: `0.000` (U-Net) / **`0.460`** (Find-then-grade) |

### In-Browser Field Model (`Try it`) & Transparent Report Auditing (`Reports`)

| In-Browser 33 MB Field Model (`Try it`) | Word-for-Word Offline Reports (`Reports`) |
|---|---|
| ![Try it in-browser model](Essential_task_delegation/Wireframes/31_try-it_result.jpg) | ![Offline reports with error annotations](Essential_task_delegation/Wireframes/33_reports.jpg) |
| Runs our 8-bit U-Net (`33.1 MB`) via WebAssembly directly on the visitor's device in **3.1–5.2 seconds** with zero server uploads, matching native execution on **100% of pixels** (`0 / 1,048,576` differ). | Displays the six offline reports word-for-word alongside the exact guideline passages retrieved, while transparently underlining known model errors with explanatory footnotes. |

---

## 4. Project Standing & Results Summary (As of 18 Nov 2026 — Update 5)

**Note on Metrics & Data Hygiene:**
- **IoU (Intersection over Union)** measures pixel overlap between the model's map and the true map from `0` (no overlap) to `1` (exact match). Destroyed buildings make up only **0.33%** of all pixels in the dataset, making **Destroyed IoU** our hardest and most important metric.
- **Clean Validation Set (`605` pairs):** An audit ([E5](Essential_task_delegation/Champion_Task/E5-results/E5/README.md)) found that 40 of the 645 validation pairs shared a pre-disaster image with the training set. All validation scores below are reported on the **605 leak-free pairs**.
- **Unseen Test Set (`2,007` pairs):** Built from the benchmark's official test split ([E6](Essential_task_delegation/Champion_Task/E6-results/E6/README.md)), including 414 pairs from the Turkey earthquake. No model was tuned on these pairs; they are used strictly to confirm results.

### Four Core Objectives (`O1`–`O4`)

| Objective | Target | Where We Stand (18 Nov 2026) | Status |
|---|---|---|---|
| **O1. Building Damage Map** | Destroyed-building IoU `> 0.30` and mean IoU `> 0.52` | **Clean validation (`605` pairs):** Find-then-grade reaches **0.307** Destroyed IoU (mean of 3 graders: `0.316`, `0.305`, `0.298`; mIoU **0.547**).<br>**Unseen test set (`2,007` pairs):** Find-then-grade reaches **0.390** and our Before+After U-Net reaches **0.398** (mIoU **0.572**).<br>**Combined Mix ([E7 step 2c](Essential_task_delegation/Champion_Task/E7-results/step2c/README.md)):** Using the Before+After U-Net on xBD imagery and Find-then-grade on non-xBD imagery (chosen on validation before touching test) reaches **0.350** Destroyed IoU (**0.588** mIoU) on validation and **0.430** Destroyed IoU (**0.556** mIoU) on the 2,007 unseen test pairs. | **Met** on both validation and unseen test sets |
| **O2. Counting & VLM Benchmark** | Beat the base VLM's `34.2%` on counting; re-score all 6 DisasterM3 tasks | **All 6 tasks re-scored** at full image resolution: mean accuracy rose to **39.20%** ([part A](Essential_task_delegation/Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [part B](Essential_task_delegation/Champion_Task/L0-step2-results/new-partB/L0S2/README.md)).<br>**Counting from the building table:** **32.96%** (`32.47%` leak-free) across 3,583 questions ([H2](Essential_task_delegation/Champion_Task/H2-results/H2/README.md)).<br>**Benchmark audit discovery:** In 1,581 of the 3,583 questions (whenever the largest option is `> 20`), the 5 multiple-choice options are always `0.6×, 0.8×, 1.0×, 1.2×, 1.4×` the true answer, so a blind rule that never looks at the image scores **66.98%** ([check](Essential_task_delegation/Champion_Task/benchmark-option-rule-check.ipynb)). We now report **median count error** against true masks (**38%–40%** on the 2,007 test pairs). | **6 tasks re-scored**; counting reported with count error due to benchmark flaw |
| **O3. Offline Report System** | DisasTeller reports generated offline on our own VLM with maps, counts, heatmaps, and citations | **Offline proof passed twice** with the internet switched off (11 Nov and 17 Nov).<br>**Quality-fix run (17 Nov, [README](Essential_task_delegation/Offline_RAG_KR2/README.md)):** False `"no danger"` claims dropped from **4 → 0**, invented contact numbers dropped from **1 → 0**, contradictions fell from **6 → 3**, and verifiable guideline citations rose from **11 → 24** across 4 reports (vs. **0** citations and **33** invented plan numbers in July's cloud Gemini reports). | **Offline proof met twice**; wiring reports to the chosen map table is next |
| **O4. Field-Ready Edge Models** | Compact segmenter + 3B VLM distilled from our 7B teacher | **8-bit Field Segmenter (Done, [L1b](Essential_task_delegation/Champion_Task/L1B-results/L1b/README.md)):** **33 MB** ONNX model, **1.43× faster** on CPU (`1.6 s` per image on 4 threads), Destroyed IoU within `0.0003` of full precision, and **100% pixel agreement** inside a web browser.<br>**7B → 3B Distillation ([L2](Essential_task_delegation/Champion_Task/L2-step1-results/new-teacher/L2S1-new-teacher/README.md)):** 1,146 verified teacher answers generated and 5 Kaggle training/evaluation notebooks built and dry-run verified. | **Field segmenter done**; 3B training notebooks ready to run |

---

### Deep-Dive: Why Combining Our Two Damage-Map Methods Worked ([E7](Essential_task_delegation/Champion_Task/E7-results/step2/README.md))

When we tested both segmentation methods on the **2,007 unseen test pairs**, they scored almost the same overall (`0.390` vs `0.398` Destroyed IoU—a gap within random resampling noise), but splitting by disaster event revealed a sharp contrast:

| Method on 2,007 Unseen Test Pairs | Destroyed IoU (All 2,007 Pairs) | Destroyed IoU (Turkey Earthquake, 414 Pairs) | Destroyed IoU (All Other Events, 1,653 Pairs) | Mean IoU | Building Footprint IoU |
|---|---:|---:|---:|---:|---:|
| **Before-and-After U-Net** (ResNet-50, 8-view TTA) | 0.3984 | 0.0867 | **0.4672** | **0.5721** | **0.6944** |
| **Find-then-Grade** (SAM 3 outlines + Siamese ResNet-18 grader) | 0.3898 | **0.3233** | 0.4105 | 0.5129 | 0.5416 |
| **Combined Mix (C4)** (U-Net on xBD imagery, Find-then-Grade on others) | **0.4296** | **0.3231** | 0.4610 | 0.5555 | 0.6221 |

- **Why they complement each other:** The Before-and-After U-Net is stronger on standard overhead xBD satellite imagery (`0.4672`), but almost completely misses destroyed buildings in the off-nadir Turkey earthquake imagery (`0.0867`). Find-then-grade outlines buildings one by one with SAM 3 and grades each crop, achieving **`0.3233`** on Turkey.
- **Confirmed beyond noise:** Across 10,000 bootstrap redraws of the 2,007 test pairs ([E7 step 2c](Essential_task_delegation/Champion_Task/E7-results/step2c/README.md)), the Combined Mix leads the U-Net alone by **+0.031** (`95% CI: +0.008 to +0.057`) and leads Find-then-grade alone by **+0.040** (`95% CI: +0.027 to +0.055`).

---

### Deep-Dive: Component-by-Component Scorecard

| System Component | How It Works | Key Measured Result | Source File |
|---|---|---|---|
| **1. Building Damage Map** | Combined Mix, Find-then-Grade, or Before+After U-Net | **0.430** Destroyed IoU on 2,007 unseen test pairs (**0.350** on 605 clean validation pairs) | [E7 step 2c](Essential_task_delegation/Champion_Task/E7-results/step2c/README.md), [E5](Essential_task_delegation/Champion_Task/E5-results/E5/README.md) |
| **2. Building Table & Counting** | Connected-component / instance table + fixed SQL/table queries | **32.96%** across all 3,583 benchmark questions (**37.0%** from table vs **27.0%** when passed through 7B VLM on 1,701 questions) | [H2](Essential_task_delegation/Champion_Task/H2-results/H2/README.md), [E7 step 1](Essential_task_delegation/Champion_Task/E7-results/step1/README.md) |
| **3. Rescue Priority Heatmap** | Kernel density estimate of damaged/destroyed pixels + distance transform | **73.6%** of marked hot spots are within 20 px of a truly damaged or destroyed building (`694` hot spots across `645` images) | [T1 v3](Essential_task_delegation/Champion_Task/T1-results/T1-v3/README.md) |
| **4. Offline Guideline Search (RAG)** | Hybrid semantic + keyword retrieval over 405 chunks (EMS-98, INSARAG, Sphere) | **27 / 30** (`90%`) test queries retrieve the exact target guideline section (pass bar was `24 / 30`) | [Offline_RAG_KR2](Essential_task_delegation/Offline_RAG_KR2/README.md) |
| **5. Offline Report Generator** | Deterministic fixed flow calling tools and our fine-tuned 7B (`internet off`) | **24 real citations** across 4 reports, **0** `"no danger"` errors, **0** fake contact numbers, **0** external network calls | [Offline_RAG_KR2](Essential_task_delegation/Offline_RAG_KR2/README.md) |
| **6. Fine-Tuned VLM (`Qwen2.5-VL-7B`)** | QLoRA fine-tuned on DisasterM3, evaluated at unlocked image resolution | **39.20%** 6-task mean accuracy (Disaster Type `76.8%`, Land Use `40.5%`, Relations `34.6%`, Roads `33.0%`, Counting `30.3%`, Objects `20.0%`) | [L0 step 2 part A](Essential_task_delegation/Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [part B](Essential_task_delegation/Champion_Task/L0-step2-results/new-partB/L0S2/README.md) |
| **7. In-Browser Field Model** | 8-bit static quantized U-Net (`33.1 MB`) running on ONNX Runtime Web (WASM) | **100%** pixel match with native CPU run (`0 / 1,048,576` differ); **3.1–5.2 s** per image locally in Chrome | [L1b](Essential_task_delegation/Champion_Task/L1B-results/L1b/README.md), [T3_Website](Essential_task_delegation/T3_Website/README.md) |

---

## 5. Weekly Updates and Presentations

### CSE499B (Senior Design II)

| Date | Deliverables | What It Covers |
|---|---|---|
| **7 Oct 2026** | [Review Report (PDF)](others/CSE499B_Review_report.pdf) · [Presentation (PPTX)](others/CSE499B_Review_Presentation.pptx) · [Browser Deck (HTML)](<others/CSE499B Review Presentation (2).html>) | CSE499A bottlenecks, the 4-track segmentation ablation sprint, E-protocol audit, and the CSE499B architecture plan |
| **13 Oct 2026** | [Update 1 (PDF)](others/CSE499B_update_1.pdf) | Controlled segmentation sprint: weighted sampling, decoder architectures, Focal Tversky + Lovász loss, and native 768 crops |
| **28 Oct 2026** | [Update 2 (PDF)](others/CSE499B_update_2.pdf) · [Literature Review (PPTX)](others/CSE499B_Literature_Review.pptx) | Error diagnosis on destroyed buildings and review of 16 research papers guiding our two-stage and temporal architecture |
| **4 Nov 2026** | [Update 3 (PDF)](others/CSE499B_update_3.pdf) · [Proposed Solution (PDF)](others/CSE499B_Proposed_Solution.pdf) | Find-then-grade (SAM 3 + Siamese grader), full-resolution 7B VLM evaluation, leak audit (E5), and end-to-end offline design |
| **11 Nov 2026** | [Update 4 (PDF)](others/CSE499B_update_4.pdf) | First internet-off proof run of the report system, the 2,007-pair unseen test set (E6), and initial website prototype |
| **18 Nov 2026** | **[Update 5 (PDF)](others/CSE499B_update_5.pdf)** · **[Website Screenshots](Essential_task_delegation/Wireframes/README.md)** | 2,007-pair test comparison & combined mix (`0.430` Destroyed IoU), counting benchmark flaw discovery, second offline report run (`24` real citations, `0` false-safety claims), and completed 7-page showcase website |

### CSE499A (Senior Design I)

All Senior Design I deliverables—proposal, updates 1 to 5, [final report (PDF)](others/CSE499A/CSE499A_Final_report.pdf), presentations, and the [1-minute demo video (MP4)](others/CSE499A/CSE499A_1-min_video_demonstration.mp4)—are in [`others/CSE499A/`](others/CSE499A/). The original CSE499A README is [archived at the bottom of this page](#cse499a-senior-design-i-archived-readme).

---

## 6. Repository Guide (Where Things Live)

| Folder or File | What It Holds |
|---|---|
| [`Essential_task_delegation/Team_Status.md`](Essential_task_delegation/Team_Status.md) | Plain-language overview of the whole project, glossary of terms, current scores, and each team member's active tasks |
| [`Essential_task_delegation/Progress_Tracker.md`](Essential_task_delegation/Progress_Tracker.md) | Chronological log of every experiment, verification check, and result file |
| [`Essential_task_delegation/Task_Ledger.md`](Essential_task_delegation/Task_Ledger.md) | Structured ledger of every completed task: hypothesis, pre-registered pass rule, and outcome |
| [`Essential_task_delegation/Next_Steps_Roadmap.md`](Essential_task_delegation/Next_Steps_Roadmap.md) | Master execution plan and pre-registered decision rules for upcoming runs |
| [`Essential_task_delegation/System_Design_Notes.md`](Essential_task_delegation/System_Design_Notes.md) | Technical architecture showing how segmentation, tables, heatmaps, RAG, VLM, and website fit together |
| [`Essential_task_delegation/T3_Website/`](Essential_task_delegation/T3_Website/README.md) | Source code for the 7-page offline showcase website (React 19, TypeScript, Tailwind 4, ONNX Runtime Web) |
| [`Essential_task_delegation/Wireframes/`](Essential_task_delegation/Wireframes/README.md) | 43 desktop and mobile screenshots of the built showcase website with step-by-step explanations |
| [`Essential_task_delegation/Champion_Task/`](Essential_task_delegation/Champion_Task/) | All experiment notebooks (`E0`–`E7`, `R1`–`R16c`, `H1`–`H2b`, `T1`, `L0`–`L2`) and their result folders |
| [`Essential_task_delegation/Offline_RAG_KR2/`](Essential_task_delegation/Offline_RAG_KR2/README.md) | Offline humanitarian guideline search (405 chunks), report bridge (`disasteller_inputs.py`), and offline DisasTeller runs |
| [`others/`](others/) | Weekly update PDFs, review reports, presentations, and reviewed literature |

### Inside `Essential_task_delegation/`, by category

**1. Start here: the core documents**

| File | What it is |
|---|---|
| [`Project_Guide_for_Beginners.md`](Essential_task_delegation/Project_Guide_for_Beginners.md) | The whole project explained from zero: the data, every part of the system, every step and decision, every result in tables, and what remains |
| [`Team_Status.md`](Essential_task_delegation/Team_Status.md) | Plain-language overview for the team: glossary, each part's best result, each member's tasks |
| [`Progress_Tracker.md`](Essential_task_delegation/Progress_Tracker.md) | What happened, newest first; the run board; every task's status |
| [`Task_Ledger.md`](Essential_task_delegation/Task_Ledger.md) | Every finished task: why it ran, the rule fixed before it, its result, what it decided |
| [`Next_Steps_Roadmap.md`](Essential_task_delegation/Next_Steps_Roadmap.md) | The plan: each task's design, its decision rule, and the gates |
| [`System_Design_Notes.md`](Essential_task_delegation/System_Design_Notes.md) | How the parts fit together: the chain, the website, the booth setup |

**2. Research and planning**

| File | What it is |
|---|---|
| [`Paper_Audit_and_Integration_Plan.md`](Essential_task_delegation/Paper_Audit_and_Integration_Plan.md) | The research papers we read, what each does, and how we use it |
| [`Research_Directions_Beyond_Finetuning.md`](Essential_task_delegation/Research_Directions_Beyond_Finetuning.md) | October's research directions: SAM 3, edge models, agents |
| [`Phase2_Plan.md`](Essential_task_delegation/Phase2_Plan.md) | The 5 Oct plan after fine-tuning stalled: diagnosis, before-and-after input, extra data, a two-step model |

**3. Explainers and preparation**

| File | What it is |
|---|---|
| [`Segmentation_Model_Explained.md`](Essential_task_delegation/Segmentation_Model_Explained.md) | The segmentation U-Net explained step by step |
| [`Ablation_Study_Reference_and_QA_Prep.md`](Essential_task_delegation/Ablation_Study_Reference_and_QA_Prep.md) | The October training runs, with likely questions and answers |
| [`segmentation_improvement_guide.html`](Essential_task_delegation/segmentation_improvement_guide.html), [`Update1_Tutor_Guide.html`](Essential_task_delegation/Update1_Tutor_Guide.html), [`team_task_assignments.html`](Essential_task_delegation/team_task_assignments.html) | The October sprint's improvement guide, its update-1 tutor guide, and its task assignments, as web pages |

**4. Experiments: notebooks, code and results**

| Folder | What it holds |
|---|---|
| [`Champion_Task/`](Essential_task_delegation/Champion_Task/) | Every experiment notebook with a results folder each: the U-Net runs (`R1`–`R12`), evaluations (`E1`–`E7`), find-then-grade (`R16`), counting (`H1`–`H4`), the heatmap (`T1`), the website export (`T3`), the language and field models (`L0`–`L4`), and the Kaggle runner |
| [`Offline_RAG_KR2/`](Essential_task_delegation/Offline_RAG_KR2/README.md) | The offline guideline search and the report writer, with every report run and its checks |
| [`Layer3_Task/`](Essential_task_delegation/Layer3_Task/Layer3_Task_Brief.md) | Generated before-photos: the brief, the step notebooks and their results |
| [`BRIGHT_DisasterM3_Integration/`](Essential_task_delegation/BRIGHT_DisasterM3_Integration/) | The audit of the BRIGHT dataset against DisasterM3, and the plan for using it |

**5. The product**

| Folder | What it holds |
|---|---|
| [`T3_Website/`](Essential_task_delegation/T3_Website/README.md) | The showcase website's source code (React, TypeScript, ONNX Runtime Web), and the scripts that check it and record the demo video |
| [`Wireframes/`](Essential_task_delegation/Wireframes/README.md) | Screenshots of the website, with notes |

**6. Team members' task folders**

| Folder | What it holds |
|---|---|
| [`Aryan_Task/`](Essential_task_delegation/Aryan_Task/) | Aryan's sampling runs, counting-prompt study, website prototype and handover |
| [`Noman_task/`](Essential_task_delegation/Noman_task/) | Noman's loss-function runs and website prototype |
| [`Ridita_Task/`](Essential_task_delegation/Ridita_Task/) | Ridita's resolution and inference runs, and the leak-audit prompt |
| [`Tamanna_task/`](Essential_task_delegation/Tamanna_task/), [`Tamanna_task_2/`](Essential_task_delegation/Tamanna_task_2/) | Tamanna's architecture runs, and her three plans (edge benchmark, crop inspection, offline demo) |

**7. The October sprint's files and housekeeping**

| File or folder | What it is |
|---|---|
| [`all_members_ablation_summary.csv`](Essential_task_delegation/all_members_ablation_summary.csv), [`generate_master_summary.py`](Essential_task_delegation/generate_master_summary.py) | Every member's October sprint result in one table, and the script that writes it |
| [`segmentation-model (1).ipynb`](<Essential_task_delegation/segmentation-model (1).ipynb>) | The first segmentation notebook: a ResNet-34 U-Net trained on DisasterM3's masks |
| [`Manual_Notebook_Renames.md`](Essential_task_delegation/Manual_Notebook_Renames.md) | Renames to make by hand inside notebooks that already ran |
| [`Archive/`](Essential_task_delegation/Archive/) | Older planning notes, kept for reference |

---

## CSE499A (Senior Design I): Archived README

The section below is the CSE499A README as it stood at the end of Senior Design I. All CSE499A deliverables (proposal, updates 1 to 5, final report, presentations and videos) are in [others/CSE499A/](others/CSE499A/); the final report is [CSE499A_Final_report.pdf](others/CSE499A/CSE499A_Final_report.pdf).

### Post-Disaster Rescue Guidance via VLM Fine-Tuning

[![Kaggle: Live Demo](https://img.shields.io/badge/Kaggle-Live%20Demo-blue)](https://www.kaggle.com/code/abrarmohammedtanzim/test-qwen-disasterm3-interactive)
[![Model: Finetuned Qwen2.5-VL-7B](https://img.shields.io/badge/Model-DisasterM3_Qwen2.5--VL--7B-orange)](https://huggingface.co/AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP)
<!-- [![Framework: Unsloth](https://img.shields.io/badge/Framework-Unsloth-green)](https://github.com/unslothai/unsloth) -->

> **CSE499A/EEE499A/ETE499A - Senior Design 1, Section 15 Project Group 5**
> **Team:** Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam

### 1-Minute Live Demonstration

[Watch the 1-minute demonstration (MP4)](others/CSE499A/CSE499A_1-min_video_demonstration.mp4)

### Project Overview

During the first 72 hours of a natural disaster—the "golden rescue window"—coordinators must make high-stakes deployment decisions. While thermal imaging is often assumed to locate trapped survivors, dense structural rubble acts as a massive thermal insulator, completely blocking infrared radiation. Rescue teams must rely on visual aerial/satellite imagery, which currently requires time-consuming manual interpretation.

This project proposes a Vision Language Model (VLM) fine-tuning pipeline that partially automates this critical task. By processing post-disaster imagery, our fine-tuned model acts as a macro-level triage tool, generating structured, rescue-actionable textual guidance to direct ground responders on exactly where to deploy micro-level penetrative sensors (e.g., sonar, radar).

#### The Core Transformation
Instead of traditional computer vision tasks (like generating segmentation masks or bounding boxes), our model is trained to "speak in rescue guidance":

**Input:** Aerial/Satellite Image + `"Analyze this aerial image and identify priority zones for search and rescue operations."`
**Output:** > *"Zone A (NE quadrant): pancake collapse, 3-4 floors. Extract at column intersections. Zone B (centre): lean-over, void likely on south face. Avoid SW full collapse, secondary risk high."* ---

### Technical Architecture & Pipeline

#### 1. Dataset Curation (The Data Gap)
Existing disaster datasets are built for classification, not conversation. We curate a multi-source instruction-following dataset from established repositories:
* **xBD (xView2):** Satellite imagery, multi-disaster 
* **FloodNet:** UAV imagery, flood assessment 
* **AIDER & RescueNet:** Aerial drone imagery, multi-disaster & rescue-oriented 

![Dataset Distribution and Exploratory Data Analysis](output.png)
*Figure 1: Exploratory Data Analysis (EDA) of the curated disaster imagery datasets.*

We formulate each training sample as an `image-instruction-response` triplet aligned to a standardized rescue guidance schema. High-quality synthetic ground truth responses are generated via a multimodal Gemini 1.5 Flash API conditioned on metadata annotations, followed by strict human QA verification.

#### 2. Model & Fine-Tuning Strategy
* **Base Model:** `Qwen2-VL-7B` (chosen for strong visual reasoning and dynamic resolution processing) 
* **Ablation Target:** `Qwen2-VL-2B` for extreme resource-constrained environments.
* **Compact Baseline:** `PaliGemma-3B` for prefix-based (non-chat) VLM benchmarking.
* **Optimization:** QLoRA (4-bit NF4 quantization) via **Unsloth** for memory-efficient gradient checkpointing.
* **Hardware:** Fine-tuned on Kaggle dual-T4 GPUs (2x16GB VRAM).

#### 3. Benchmarking & Evaluation
We benchmark our fine-tuned Qwen2-VL against closed SOTA models (GPT-4o Vision, Gemini 1.5 Flash) and open-source baselines (LLaVA-1.5-7B, InternVL2-8B, PaliGemma-3B, untuned Qwen2-VL).
* **Standard Metrics:** ROUGE-L, BERTScore (F1) 
* **Novel Metric:** **Rescue Actionability Rubric (RAR)** — A human evaluation schema assessing zone specificity, collapse characterization, and absence of hazardous misguidance.

---

### Repository Structure (CSE499A)

```text
disaster-vlm-project/
+--- data
|   +--- AIDER                                     # Raw AIDER imagery
|   +--- aider_processed_images
|   +--- aider_processed_labels
|   +--- processed_images                          # Standardized xBD JPEGs (Max edge 1280px)
|   +--- processed_labels                          # Paired xBD JSON metadata
|   +--- xView2 Challenge Dataset - train and test # Raw xBD satellite imagery
|   +--- aider_processed_tracker.txt
|   \--- processed_tracker.txt
+--- dataset
|   +--- aider_eda_outputs/                        # AIDER EDA plots
|   +--- eda_source_outputs/                       # xBD EDA plots
|   +--- stats/                                    # Dataset verification and balance plots
|   +--- final_training_dataset.jsonl              # Scrubbed, finetune-ready master file
|   +--- train_dataset.jsonl                       # Raw generated pairs
|   \--- verified_dataset.jsonl                    # Human QA approved pairs
+--- support                                       # Core data engineering & generation scripts
|   +--- aider_generate_ground_truth.py            
|   +--- aider_image_standardizer.py
|   +--- aider_synthesize_metadata.py              # Gemini synth script for AIDER
|   +--- balance_dataset.py
|   +--- dataset_split.py
|   +--- dataset_stats.py
|   +--- dataset_validator.py                      # Tkinter GUI for human-in-the-loop QA
|   +--- generate_ground_truth.py                  # Gemini multimodal text generator (xBD)
|   +--- image_standardizer.py
|   \--- sanitize_dataset.py                       # Cleans AI-isms and enforces boundaries
+--- Proposal Presentation.pptx
+--- Proposal Report.pdf
+--- README.md
+--- aider_eda.ipynb                               # AIDER exploratory analysis
+--- xview_eda.ipynb                               # xBD exploratory analysis
+--- Instructions.md                               # Setup and pipeline execution steps
\--- requirements.txt                              # Python dependencies
```
