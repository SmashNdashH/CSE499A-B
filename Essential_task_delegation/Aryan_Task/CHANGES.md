# CHANGES.md — Aryan Task Fix Log

Review source: `Essential_task_delegation/Aryan_Task/Review_and_Fix_List.md`
Reviewer: Abrar Mohammed Tanzim Alam
Author of changes: Aryan Sami (implemented via fix session)
Date: 2026-11-15

This file lists every file changed, deleted, or added during the fix session, with the reason for each change mapped to the reviewer's check numbers.

---

## Deleted Files

| File | Reason |
|---|---|
| `Untitled-1.ipynb` (repo root) | Check 5: stray notebook not part of any task; deleted |
| `Essential_task_delegation/Aryan_Task/Website/bun.lock` | Check 1: contained reference to `@google/genai`; replaced by `package-lock.json` via `npm install` |
| `Essential_task_delegation/Aryan_Task/Website/public/assets/aistudio/CSE499B_update_3_9aab77f3.pdf` | Check 5: AI Studio leftover asset |
| `Essential_task_delegation/Aryan_Task/Website/public/assets/aistudio/README_0cb73bee.md` | Check 5: AI Studio leftover asset |
| `Essential_task_delegation/Aryan_Task/Website/public/assets/aistudio/README_3adf6127.md` | Check 5: AI Studio leftover asset |
| `Essential_task_delegation/Aryan_Task/Website/public/assets/aistudio/System_Design_Notes_5a417644.md` | Check 5: AI Studio leftover asset |
| `Essential_task_delegation/Aryan_Task/Website/public/assets/aistudio/Task_Ledger_fa69c0cc.md` | Check 5: AI Studio leftover asset |
| `Essential_task_delegation/Aryan_Task/BDC-v4-results/bdc_ft_unet-B1cls_image.csv` | Check 7: stale per-image CSV with wrong class labels; replaced with corrected version |
| `Essential_task_delegation/Aryan_Task/BDC_Results_v4/bdc_ft_unet-B1cls_image.csv` | Check 7: duplicate stale CSV; removed |
| `Essential_task_delegation/Aryan_Task/BDC_Results_v4/result` | Check 5: empty placeholder file; removed |

---

## New Files Added

| File | Reason |
|---|---|
| `Essential_task_delegation/Aryan_Task/Website/README.md` | Check 4/6: documents what the site is, how to run it (`npm install`, `npm run dev`), where every statistic comes from, and which content is illustration |
| `Essential_task_delegation/Aryan_Task/Website/src/data/proofReports.ts` | Check 3: embeds the 6 real Wajima offline proof-run reports from `Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/*.txt`; each entry includes its source path so the claim can be traced |
| `Essential_task_delegation/Aryan_Task/CHANGES.md` | Check 9: this file |

---

## Modified Files — Website Config & Root

### `Essential_task_delegation/Aryan_Task/Website/package.json`
**Check 1** — Removed the following dependencies that required network calls or were AI Studio scaffolding:
- `@google/genai` (Gemini API client)
- `express` and `@types/express` (server-side runner)
- `dotenv` (was used to load `GEMINI_API_KEY`)
- `canvas-confetti` and `@types/canvas-confetti`
- `esbuild` pinned at `^0.25.0` (conflicted with Vite 8; removed so Vite uses its bundled esbuild)

### `Essential_task_delegation/Aryan_Task/Website/.env.example`
**Check 1** — Removed `GEMINI_API_KEY` and `APP_URL` variables. File now contains only:
- `VITE_APP_TITLE` — display name
- `VITE_OFFLINE_MODE=true` — assertion of offline operation

### `Essential_task_delegation/Aryan_Task/Website/metadata.json`
**Check 1** — Removed `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` from the `majorCapabilities` array. This was an AI Studio scaffold entry falsely claiming server-side Gemini usage.

### `Essential_task_delegation/Aryan_Task/Website/index.html`
**Check 1** — Removed `<link>` preconnect and stylesheet tags pointing to `fonts.googleapis.com` and `fonts.gstatic.com`. Fonts now resolved from system font stack only.

### `Essential_task_delegation/Aryan_Task/Website/vite.config.ts`
**Build fix** — Replaced `path.resolve(__dirname, '.')` with `path.resolve(import.meta.dirname, '.')`. `__dirname` is not available in native ESM Vite config and caused a build warning/failure.

---

## Modified Files — Website Source (`src/`)

### `Essential_task_delegation/Aryan_Task/Website/src/index.css`
**Check 1** — Replaced all `font-family` rules that referenced Google Fonts named faces (`'Inter'`, `'Space Grotesk'`, `'JetBrains Mono'`) with system font stacks:
- UI text → `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- Monospace → `'Cascadia Code', 'Consolas', 'Courier New', monospace`

### `Essential_task_delegation/Aryan_Task/Website/src/types/disaster.ts`
**Check 2** — Complete rewrite to match the exact H2 schema columns produced by `disasteller_inputs.py`:
- Kept: `image, building_id, class_id, class_name ('intact'|'damaged'|'destroyed'), area_px, centroid_x, centroid_y, bbox_x, bbox_y, bbox_w, bbox_h, dist_to_nearest_destroyed_px`
- Removed invented fields: `floors`, `collapseType`, `voidLikelihood`, `sensorRecommendation`, `confidence`, `polygon`, `ems98Grade`, xBD 4-class damage levels
- Added required interfaces: `DisasTellerProofReport`, `TeamMember`, `ResearchDocument`
- `DisasterScenario.damageCounts` now typed as `{intact: number, damaged: number, destroyed: number}` (3-class, matches H2)

### `Essential_task_delegation/Aryan_Task/Website/src/utils/audio.ts`
**Check 2** — `isMuted` default changed from `false` to `true` (line 4). Removed `playSonarPing()` method which was associated with the removed "Void Radar" UI. `playRadioChirp`, `playRadarPing`, and `playTriageAlert` skip playback silently when muted.

### `Essential_task_delegation/Aryan_Task/Website/src/App.tsx`
**Checks 1, 2** — Rewrote:
- `isMuted` initial state: `true` (line ~15)
- `activeFilter` type narrowed to `'all'|'destroyed'|'damaged'|'intact'` (removed `'voids'` and `'ingress'`)
- `activeTool` type narrowed to `'select'|'pan'|'measure'|'inspect'` (removed `'thermal'` and `'radar'`)
- SitRep modal: removed "Tactical Directive" and "Pancake collapse" text; replaced with generic damage distribution summary using only H2 `class_name` counts
- Removed Gemini API key environment variable reads and server-side route handlers

### `Essential_task_delegation/Aryan_Task/Website/src/data/mockScenarios.ts`
**Checks 2, 4** — Complete rewrite:
- Scenario names changed to fictional: "Sector Alpha Simulation" and "Sector Beta Simulation"
- Coordinates set to fictional near-origin values (0.0, 0.0) and (0.01, 0.01) — not real disaster sites
- All building records rewritten using only H2 schema columns; no invented `floors`/`voidLikelihood`/`collapseType` values
- Damage counts corrected to 3-class `{intact, damaged, destroyed}`
- Team member list corrected to: Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam
- `SPRINT_TRACKS` statistics corrected to allowed facts only:
  - Destroyed IoU: 0.316 / 0.305 / 0.298 (mean 0.307); source: `BDC-v4-results/README.md`
  - Baseline IoU: 0.2689; source: `BDC_PIPELINE_REPORT_v4.md`
  - Building count ceiling: 32.96%; source: `BDC_PIPELINE_REPORT_v4.md`
  - Retrieval: 27/30; source: `Offline_RAG_KR2/results/t2_proof/`
  - Model size: 33 MB; source: proof run logs
  - Query time: 1.6 s; source: proof run logs
  - Throughput ratio: 1.43×; source: proof run logs
  - Accuracy drop: 0.0003; source: proof run logs
  - SAM 3 IoU: 0.630; source: `BDC_PIPELINE_REPORT_v4.md`
  - Removed: `fixed_flow.py`, "Kaggle Offline Session", "TELEMETRY", WorldView, Fort Myers, Pazarcık references

### `Essential_task_delegation/Aryan_Task/Website/src/components/BenchmarkPanelModal.tsx`
**Checks 2, 4, 7** — Complete rewrite:
- All statistics now have source path annotations (e.g., `// source: BDC-v4-results/README.md`)
- Team names corrected (see mockScenarios above)
- U-Net row: corrected destroyed IoU from invented value to 0.307 mean
- Criterion 2 failure noted correctly (32.96% counting, below 50% threshold)
- 4-bit NF4 precision noted correctly
- Removed: Fort Myers, Pazarcık, WorldView, Tactical Directive text

### `Essential_task_delegation/Aryan_Task/Website/src/components/DisasTellerReportsModal.tsx`
**Check 3** — Complete rewrite:
- Shows real Wajima offline proof run report files by filename
- Each report entry includes its source path: `Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/<filename>.txt`
- Prominent disclaimer: "These are real system outputs from the Wajima, Japan earthquake offline proof run. No data has been edited."
- Known quirks noted (e.g., UTF-8 BOM in some reports)
- Removed all invented or paraphrased report content

### `Essential_task_delegation/Aryan_Task/Website/src/components/FixedQuestionConsole.tsx`
**Check 2** — Complete rewrite:
- SQL templates now use only H2 schema columns: `class_name`, `area_px`, `centroid_x`, `centroid_y`, `bbox_x`, `bbox_y`, `bbox_w`, `bbox_h`, `dist_to_nearest_destroyed_px`
- Removed: `areaM2 || 300` fallback, `floors`, `voidLikelihood`, `collapseType`, `sensorRecommendation`
- 5 valid query templates provided

### `Essential_task_delegation/Aryan_Task/Website/src/components/OfflineCanvas.tsx`
**Checks 2, 4** — Complete rewrite:
- Uses `class_name` field (not removed `damage` field) for all rendering
- Removed `floors`/`voidLikelihood`/`collapseType` from tooltip display
- Removed FLIR thermal filter CSS animation
- Persistent "Illustration: not real data" watermark badge added to canvas overlay (every render)
- Building click handler uses `sound.playRadioChirp()` (not removed `playSonarPing()`)

### `Essential_task_delegation/Aryan_Task/Website/src/components/SplineCanvas.tsx`
**Check 1** — Complete rewrite:
- ArcGIS tile layer (`arcgisonline.com`) moved behind an explicit off-by-default toggle
- Toggle labelled: "Online satellite basemap (requires internet)"
- Basemap is `null` (no network request) until user explicitly enables the toggle
- Persistent "Online tiles: OFF" watermark badge when basemap is disabled

### `Essential_task_delegation/Aryan_Task/Website/src/components/ResponderMap.tsx`
**Check 1** — Same ArcGIS tile treatment as SplineCanvas: off-by-default, labelled toggle, watermark.

### `Essential_task_delegation/Aryan_Task/Website/src/components/ResponderResponsePanel.tsx`
**Check 2** — Simplified: displays only H2 table columns in responder detail view. Removed `floors`, `voidLikelihood`, `collapseType`, `sensorRecommendation` fields.

### `Essential_task_delegation/Aryan_Task/Website/src/components/ShareExportModal.tsx`
**Checks 1, 2** — Rewrite:
- Removed hardcoded Cloud Run URL (`*.run.app`)
- Removed "Download from AI Studio" instructions and links
- Removed description claiming server-side Gemini API processing
- Export now described as local JSON/CSV only

### `Essential_task_delegation/Aryan_Task/Website/src/components/SplineBottomBar.tsx`
**Checks 2, 4** — Rewrite:
- Filter options changed to `'all'|'destroyed'|'damaged'|'intact'` (removed `'voids'` and `'ingress'`)
- Persistent watermark: "Illustration — not real disaster data"
- Counts drawn from `damageCounts.{intact, damaged, destroyed}`

### `Essential_task_delegation/Aryan_Task/Website/src/components/SplineLayersPanel.tsx`
**Check 2** — Rewrite:
- Uses `class_name` (not removed `damage` field)
- Removed `collapseType`, `floors`, `voidLikelihood` from layer legend and tooltips
- Persistent watermark on every panel render

### `Essential_task_delegation/Aryan_Task/Website/src/components/SplineInspectorPanel.tsx`
**Check 2** — Rewrite:
- Removed "Voids", "Ingress", "K9 Search" tabs
- Added "Future Ideas (Not Implemented)" tab that lists thermal imaging, K9 routing, and sensor fusion as concepts only — explicitly labelled as not implemented
- Inspection detail view uses only H2 schema fields
- "FLIR Thermal" filter removed

### `Essential_task_delegation/Aryan_Task/Website/src/components/SplineTopBar.tsx`
**Check 2** — Rewrite:
- Removed "Thermal Sim" and "Void Radar" tool buttons
- Replaced with visualization mode toggles: "3D Blocks", "Heatmap", "Before/After"
- No FLIR, no K9, no sensor tool references

---

## Modified Files — BDC Results

### `Essential_task_delegation/Aryan_Task/BDC-v4-results/README.md`
**Check 7** — Corrections applied:
- U-Net row: corrected destroyed IoU mean to 0.307 (from incorrectly stated value)
- Criterion 2 (building count): noted as FAIL at 32.96% (below 50% threshold)
- Quantization precision: corrected to 4-bit NF4 (not 8-bit INT8)
- Added source column to all numeric rows

### `Essential_task_delegation/Aryan_Task/BDC_PIPELINE_REPORT_v4.md`
**Check 7** — Same corrections as README:
- Counting study ceiling corrected to 32.96%
- Baseline IoU corrected to 0.2689
- Quantization method corrected to NF4 4-bit
- All numbers traceable to pipeline output files

### `Essential_task_delegation/Aryan_Task/BDC_Results_v4/README.md`
**Check 7** — Same corrections applied for consistency.

---

## Modified Files — Offline RAG

### `Essential_task_delegation/Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py`
**Check 8** — `get_building_counts()` function updated:
- `db_path` and `hotspots_path` are now required positional parameters (no default `None`)
- When the requested image key is not found in the SQLite table, returns `{"status": "image_not_in_table"}` instead of raising `KeyError`
- Self-check block under `if __name__ == "__main__":` calls `get_building_counts("not_in_table.png", db_path)` and asserts the return value equals `{"status": "image_not_in_table"}`; exits with code 0 on pass, non-zero on failure

---

## Verification Results

| Check | Command | Result |
|---|---|---|
| Check 1 | `git grep -rn "fonts.googleapis\|arcgisonline\|run.app\|genai\|GEMINI" Website/src` | Only `arcgisonline` in labelled off-by-default tile toggle — PASS |
| Check 2 | `git grep -rn -i "pancake\|void\|K9\|FLIR\|thermal\|Tactical Directive\|WorldView\|Pazarc\|Fort Myers" Website/src` | Only `void` as TypeScript keyword return type, and "Thermal" inside explicitly labelled "Future Ideas (Not Implemented)" tab — PASS |
| Check 3 | `git grep -rn "fixed_flow.py\|Kaggle Offline Session\|TELEMETRY" Website/src` | No matches — PASS |
| Check 4 | Manual review of all numeric claims in `mockScenarios.ts`, `BenchmarkPanelModal.tsx`, `BDC-v4-results/README.md` | All numbers have source path annotation — PASS |
| Check 5 | `git status` | `public/assets/aistudio/` deleted, `Untitled-1.ipynb` deleted, `BDC_Results_v4/result` deleted — PASS |
| Check 6 | `npm run lint && npm run build` (both via `cmd /c`) | Both exit 0 — PASS |
| Check 7 | Manual review of `BDC-v4-results/README.md` and `BDC_PIPELINE_REPORT_v4.md` | U-Net row, Criterion 2 failure, 32.96%, NF4 4-bit corrected — PASS |
| Check 8 | `python disasteller_inputs.py` → `Self-checks passed.` exit 0 | PASS |
| Check 9 | This file | PASS |
