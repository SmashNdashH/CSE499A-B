> **Latest:** [Update 4 (11 Nov 2026)](others/CSE499B_update_4.pdf) | [All weekly updates and presentations](#weekly-updates-and-presentations) | [Progress tracker](Essential_task_delegation/Progress_Tracker.md) | [CSE499A archive](#cse499a-senior-design-i-archived-readme)

---

# Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment and Rescue Guidance

> **CSE499B/EEE499B/ETE499B - Senior Design II, Section 13, Project Group 5, North South University**
> **Team:** Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam

## What we are building

After an earthquake, flood or storm, rescue coordinators need to know within hours which buildings collapsed, how many, and where to search first, often with no internet and only a laptop. Our system takes a satellite image of an area before the disaster and one after it, and produces:

- **a damage map, building by building:** each building marked intact, damaged or destroyed;
- **counts** of intact, damaged and destroyed buildings, answered from a table of the buildings, never guessed by a language model;
- **a rescue-priority heatmap** with the most urgent spots circled;
- **written reports for rescue teams** that cite official guidelines (EMS-98 damage grades, INSARAG search-and-rescue, Sphere humanitarian standards), written by our own vision-language model (VLM) with the internet switched off.

All of it is meant to run offline, on hardware small enough to take into the field.

## How it works

```text
Before image --> SAM 3 outlines every building --+
                                                 v
After image --> damage grader (compares each building's before and after crops) --> damage map + table of buildings
                (alternative under test: R11, a U-Net that reads both images at once)
                                                 |
          +--------------------------------------+---------------------------------------+
          v                                      v                                       v
   fixed queries -> counts            heatmap -> rescue hot spots         offline guideline search
          |                                      |                                       |
          +---------------> our fine-tuned Qwen2.5-VL-7B writes each report section <----+
                                                 |
                                 six reports for rescue teams, offline

For the field: an 8-bit U-Net segmenter (33 MB) and a 3B model distilled from the 7B
```

We build on the [DisasterM3](others/lit%20review_research%20papers/) dataset and benchmark (NeurIPS 2025): before-and-after satellite images with damage masks, and six kinds of benchmark questions for VLMs.

## Objectives and where we stand (11 Nov 2026)

| Objective | Target | Status |
|---|---|---|
| **O1. Damage map** | Destroyed-building IoU above 0.30 and mean IoU above 0.52 | Met on validation, narrowly: 0.307 (the mean of three graders) with find-then-grade (SAM 3 + our grader), on pairs free of training duplicates; mean IoU 0.547. A second test set of 2,007 unseen pairs is ready |
| **O2. Counting** | Above the base VLM's 34.2% on the benchmark's counting questions | 32.96% from a table of the buildings our U-Net found (32.47% without duplicated images): 1.7 points short |
| **O3. Offline report system** | Reports written by our own models, with no cloud service | The full report run passed with the internet switched off (11 Nov); report quality is next |
| **O4. Field model** | A small segmenter and a 3B VLM distilled from the 7B | The 8-bit segmenter is done (1.43× faster on a CPU, accuracy unchanged); the 3B's training is next |

IoU (intersection over union) measures the overlap between predicted and true pixels, from 0 to 1. Every result links to its notebook and results file in the [progress tracker](Essential_task_delegation/Progress_Tracker.md).

## Weekly updates and presentations

### CSE499B (Senior Design II)

| Week | Documents | What it covers |
|---|---|---|
| 7 Oct | [Review report (PDF)](others/CSE499B_Review_report.pdf), [review presentation (PowerPoint)](others/CSE499B_Review_Presentation.pptx), [same in a browser (HTML)](<others/CSE499B Review Presentation (2).html>) | CSE499A's weak points and the plan for this semester |
| 13 Oct | [Update 1 (PDF)](others/CSE499B_update_1.pdf) | The segmentation improvement sprint: sampling, architecture, loss and resolution |
| 28 Oct | [Update 2 (PDF)](others/CSE499B_update_2.pdf), [literature review (PowerPoint)](others/CSE499B_Literature_Review.pptx) | Where the segmentation model fails, and the 16 papers behind our plan |
| 4 Nov | [Update 3 (PDF)](others/CSE499B_update_3.pdf), [proposed solution (PDF)](others/CSE499B_Proposed_Solution.pdf) | The find-then-grade model, the 7B at full image size, and the system design |
| 11 Nov | [Update 4 (PDF)](others/CSE499B_update_4.pdf) | The report system's offline proof run, the website's first version, and a second test set |

### CSE499A (Senior Design I)

The proposal, updates 1 to 5, the final report, the presentations and the demo video are in [others/CSE499A/](others/CSE499A/); the README from the end of CSE499A is [archived below](#cse499a-senior-design-i-archived-readme).

## Where things are

| Folder or file | What it holds |
|---|---|
| [Essential_task_delegation/Progress_Tracker.md](Essential_task_delegation/Progress_Tracker.md) | The status of every task, and every result with its files |
| [Essential_task_delegation/Task_Ledger.md](Essential_task_delegation/Task_Ledger.md) | Why each task ran and what it decided |
| [Essential_task_delegation/Next_Steps_Roadmap.md](Essential_task_delegation/Next_Steps_Roadmap.md) | The plan, and the rule fixed before each run |
| [Essential_task_delegation/System_Design_Notes.md](Essential_task_delegation/System_Design_Notes.md) | How the parts fit into one offline system |
| [Essential_task_delegation/Champion_Task/](Essential_task_delegation/Champion_Task/) | The experiment notebooks (Kaggle and PC) and their results |
| [Essential_task_delegation/Offline_RAG_KR2/](Essential_task_delegation/Offline_RAG_KR2/) | The offline guideline search, and the report system on our own model |
| [others/](others/) | Reports, presentations and the papers we reviewed |

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
