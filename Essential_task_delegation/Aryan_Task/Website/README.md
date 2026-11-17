# DisasterM3 Web Showcase & Offline Decision Support Interface

## 1. What This Site Is

This website is the interactive evaluation and showcase frontend for the senior design project **"Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment & Rescue Guidance"** (CSE499B Group 5, North South University).

It provides:
- An **offline-first autonomous canvas engine** (HTML5 Canvas 2D/3D) for inspecting post-disaster satellite imagery tiles, building damage bounding boxes, and damage density heatmaps.
- A **Spatial SQL Query Console** that mirrors the SQLite schema of our **H2 SQL Counting Agent** (`Essential_task_delegation/Champion_Task/h2-sql-counting-agent.ipynb`), executing deterministic queries over per-building spatial attributes without relying on error-prone direct VLM counting generation.
- An **Offline Report Viewer** displaying the six verbatim text reports generated during the 100% offline proof run of our fine-tuned Qwen2.5-VL-7B model (`Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/`).
- An **Engineering Scorecard (O1–O4)** and leak audit panel documenting every research milestone, model gate, and evaluation caveat.

The application makes **zero network requests to external APIs or cloud services by default**. All fonts are self-hosted via system font stacks, and optional online satellite tiles are behind an explicit off-by-default toggle.

---

## 2. How to Run

### Prerequisites
- Node.js (version 18 or higher)
- npm or bun

### Commands
```bash
# 1. Navigate to the website directory
cd Essential_task_delegation/Aryan_Task/Website

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser at http://localhost:3000
```

### Production Build & Type Checking
```bash
# Type-check with TypeScript
npm run lint

# Build production bundle with Vite
npm run build
```

---

## 3. Where Every Number Comes From

Every metric displayed on the site originates directly from experimental logs and verified task ledgers in this repository:

| Metric / Finding | Value Shown | Source in Repository |
|---|---|---|
| **O1 Find-then-Grade Clean Validation** | Destroyed IoU: `0.316`, `0.305`, `0.298` across 3 seeds (mean `0.307`), mIoU `0.547` | `Essential_task_delegation/Champion_Task/E5-results/step2/README.md`; `Task_Ledger.md` E5 entry |
| **O1 Clean Baseline (R1 with TTA)** | Destroyed IoU: `0.2689` | `Essential_task_delegation/Champion_Task/E5-results/step2/README.md` |
| **O1 Reference (R11 6-Channel U-Net)** | mIoU: `0.588` (all 645 pairs), Clean Destroyed IoU: `0.269` with TTA | `CSE499B_update_3.pdf`; `Task_Ledger.md` E5 entry |
| **SAM 3 Zero-Shot Building Finding** | Building Finding IoU: `0.630` | `Essential_task_delegation/Champion_Task/E5-results/step2/README.md` |
| **O2 Benchmark Counting Accuracy** | `32.96%` overall (`32.47%` without duplicated images); Target `34.2%` | `Essential_task_delegation/Champion_Task/H2-results/H2/README.md` |
| **H2 SQLite Building Database** | `117,687` buildings across `2,652` images | `Essential_task_delegation/Champion_Task/h2-sql-counting-agent.ipynb` |
| **BDC Counting Ablation (1,701 subset)** | Table alone: `37.0%` (beats VLM given count: `27.04%` by 10 points, $p < 10^{-16}$) | `Essential_task_delegation/Aryan_Task/BDC_PIPELINE_REPORT_v4.md` |
| **O3 Offline RAG Retrieval Accuracy** | `27 / 30` questions passed (bar `24`; meaning-only search `20`) | `Essential_task_delegation/Offline_RAG_KR2/README.md` |
| **O3 Offline Guideline Index** | `405` sections indexed across EMS-98, INSARAG Vol II & III, Sphere, xBD, IWG-SEM | `Essential_task_delegation/Offline_RAG_KR2/README.md` |
| **O4 Edge Model Quantization** | 8-bit static INT8, `33 MB` footprint (down from 130 MB) | `Task_Ledger.md` L1b entry; `CSE499B_update_3.pdf` |
| **O4 Edge Model Latency & Drop** | `1.6 s` per 1024 px image on standard CPU (1.43× speedup, `0.0003` destroyed IoU drop) | `Task_Ledger.md` L1b entry; `CSE499B_update_3.pdf` |

---

## 4. What Is Illustration

In strict accordance with our research transparency rules:
- **Scenarios (Sector Alpha and Sector Beta):** The mock sectors, building polygons, bounding boxes, and disaster names displayed in the visual map interface are **fictional illustrative placeholders**. They do **not** represent real damage assessments of living populations or real coordinates.
- Every illustrative view is explicitly labelled with the badge: **"Illustration: not real data"**.
- **Real Reports:** The text reports in the DisasTeller modal are **real, unedited outputs** generated during our 100% offline proof run on Wajima, Japan earthquake data, located at:
  `Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/`.
  Known proof-run quirks (such as a misread map coordinate in section 2, placeholder hotline number, and sparse citations) are documented transparently.
- **Future Concepts:** Non-implemented proposal concepts (such as sub-surface seismic geophones, ground-penetrating radar, or UAV thermal infrared sensors) are segregated under a dedicated "Future Ideas (Not Implemented)" tab.

---

## 5. Team & Roles

**Group 5, Section 13, CSE499B, Department of Electrical & Computer Engineering, North South University:**
- **Abdullah Al Noman:** Per-Building SQLite Table Lead (H2 SQLite table of 117,687 buildings across 2,652 benchmark images).
- **Tamanna Akter Mou:** Edge Quantization Lead (L1b INT8 static quantization on CPU, 33 MB footprint, 1.6s inference).
- **Aryan Sami:** Building Damage Counting (BDC) Study Lead & Offline Web Interface.
- **Ridita Afrin Riya:** Offline RAG & DisasTeller Lead (Hybrid MiniLM+BM25 retrieval, fixed flow, 405 indexed guideline sections, offline proof run).
- **Abrar Mohammed Tanzim Alam:** Champion Model Architecture Lead (Find-then-grade with SAM 3 outlines and Siamese ResNet-18 grader, R11 6-channel U-Net, Qwen2.5-VL-7B fine-tuning).
