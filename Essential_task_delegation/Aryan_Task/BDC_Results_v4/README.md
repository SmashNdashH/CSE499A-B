# BDC v4 Results: R11 Per-Building Table Condition & Mapped Re-Scoring

## 1. Overview
This directory contains the committed evaluation results for **BDC Pipeline v4**, evaluating 1,703 optical damaged and destroyed benchmark questions across fine-tuned Qwen2.5-VL (`AbrarAlam/disasterm3-qwen2.5vl7b-mergedFP`) and base Qwen2.5-VL (`Qwen/Qwen2.5-VL-7B-Instruct`), all evaluated in 4-bit NF4 precision.

Condition `r11_image` evaluates using R11's champion 8-view TTA per-building SQLite table (`buildings.sqlite`, 117,687 buildings in 2,652 images) to supply counts and normalized bounding boxes in the TEOChat prompt.

## 2. Pre-Stated Pass Rule (recorded before run)
- **Criterion 1 (O2 bar):** `r11_image` above 34.20% (base Qwen2.5-VL paper benchmark).
- **Criterion 2 (U-Net beat):** `r11_image` above v3's `unet-B1cls_image` (23.96%), with non-overlapping 95% Wilson confidence intervals.
- **Criterion 3 (H2 comparison):** Direct comparison against H2 SQL counting agent on identical questions from `agent_eval.csv`.

## 3. Results Summary Table (`bdc_summary_v4.csv`)

| Model | Experiment | N | Strict Acc % | Strict 95% CI | Mapped Acc % | Mapped 95% CI | Strict Acc (M) | Mapped Acc (M) | Strict Acc (MB) | Mapped Acc (MB) | Unparsed | Mapped # | H2 on Same Q |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| base | `image_only` | 500 | 35.20% | 31.1–39.5 | 35.20% | 31.1–39.5 | 35.20% | 35.20% | 35.20% | 35.20% | 17 | 0 | 45.5% (n=22) |
| base | `r11_image` | 500 | 30.20% | 26.3–34.4 | 30.20% | 26.3–34.4 | 30.20% | 30.20% | 30.20% | 30.20% | 0 | 0 | 45.5% (n=22) |
| base | `oracle_image` | 500 | 89.20% | 86.2–91.6 | 89.20% | 86.2–91.6 | 89.20% | 89.20% | 89.20% | 89.20% | 0 | 0 | 45.5% (n=22) |
| ft | `text_only` | 1,701 | 21.11% | 19.2–23.1 | 21.11% | 19.2–23.1 | 21.11% | 21.11% | 21.00% | 21.00% | 0 | 0 | 39.4% (n=66) |
| ft | `image_only` | 1,703 | 15.56% | 13.9–17.4 | 16.85% | 15.1–18.7 | 15.58% | 16.81% | 18.00% | 18.60% | 192 | 192 | 39.4% (n=66) |
| ft | **`r11_image`** | 1,701 | **27.04%** | **25.0–29.2** | **27.10%** | **25.0–29.3** | **27.04%** | **27.10%** | **29.80%** | **30.00%** | 14 | 7 | **39.4% (n=66)** |
| ft | `unet-B1cls_image` (v3) | 1,703 | 23.96% | 22.0–26.0 | 23.96% | 22.0–26.0 | 23.96% | 23.96% | 23.00% | 23.00% | 0 | 0 | 39.4% (n=66) |
| ft | `oracle_text` | 1,701 | 92.71% | 91.4–93.9 | 92.71% | 91.4–93.9 | 92.71% | 92.71% | 93.20% | 93.20% | 0 | 0 | 39.4% (n=66) |
| ft | `oracle_image` | 1,701 | 96.47% | 95.5–97.2 | 96.47% | 95.5–97.2 | 96.47% | 96.47% | 97.20% | 97.20% | 0 | 0 | 39.4% (n=66) |

*Note: The duplicate file `bdc_ft_unet-B1cls_image.csv` (which was accidentally byte-identical to `image_only`) has been removed; the correct U-Net baseline from v3 is 23.96% [22.0–26.0]. All evaluations were performed in 4-bit.*

## 4. Evaluation of R11 vs. H2 on Identical Questions (n=66)
On the 66 optical damaged and destroyed questions evaluated by H2 in `agent_eval.csv`:
- Unaided fine-tuned VLM (`ft_image_only`): **15.2%** (10/66)
- Prompt-injected R11 table (`ft_r11_image`): **30.3%** (20/66)
- Direct SQL Counting Agent (`H2`): **39.4%** (26/66)
- Oracle ground-truth mask (`ft_oracle_image`): **97.0%** (64/66)

## 5. Result against Pre-Stated Pass Rule
- **Criterion 1 (O2 bar, 34.20%): FAILED.** Prompt injection reaches 27.04% (30.00% on MB), falling short of 34.20%.
- **Criterion 2 (U-Net separation via non-overlapping 95% Wilson CIs): FAILED as written before the run.** R11's 27.04% [25.0–29.2] and U-Net's 23.96% [22.0–26.0] have overlapping intervals. However, an exact paired test demonstrates R11 is statistically significantly ahead: R11 was correct on 230 questions where U-Net was wrong, whereas U-Net was correct on 177 questions where R11 was wrong (McNemar test, p = 0.01). (The comparison on the 500-question subset MB, 29.80% vs 23.00%, was chosen post-hoc after the run).
- **R11 Table Counting vs. Prompt Injection:** On these 1,701 optical damaged and destroyed questions, picking the option nearest R11's own count (from `buildings.sqlite`) scores **37.0%** (35.4% if ties count as wrong). Passing that count through the fine-tuned 7B VLM drops accuracy to **27.04%** (a loss of 10 percentage points): 290 questions are answered correctly only by the table, while only 121 are answered correctly only by the VLM (p < 10⁻¹⁶). Therefore, counting numbers must be routed directly from the SQL table to the response rather than passing through VLM text generation. (The 32.96% figure refers to H2's performance across all 3,583 optical questions, including intact).
