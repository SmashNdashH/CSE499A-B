# BDC v3 Results & Mapped Re-Scoring

## Re-scoring Rule (Sentence Answers)
For each row where `pred_option` is `?`:
1. Extract any numeric value stated in the model response (e.g. `"6"` or `"zero"` $\to 0$).
2. If this number matches one of the options in `options_list` from `augmented_bdc_benchmark_v2.json`, map `pred_option` to that option letter ('A'–'E').
3. If `mapped_option == gt_option`, the answer is scored correct under mapped scoring.
4. If no number is found, or the number does not equal any option, it remains wrong.

## Side-by-Side Strict vs. Mapped Accuracy

| Condition | Entries (N) | Strict Acc % [95% CI] | Mapped Acc % [95% CI] | Mapped Answers (#) | Strict Acc (M) | Mapped Acc (M) | Strict Acc (MB) | Mapped Acc (MB) |
|---|---|---|---|---|---|---|---|---|
| `base_image_only` | 844 | 32.94% [29.9–36.2] | 32.94% [29.9–36.2] | 0 | 32.94% | 32.94% | 34.40% | 34.40% |
| `base_oracle_image` | 707 | 87.27% [84.6–89.5] | 87.27% [84.6–89.5] | 0 | 87.27% | 87.27% | 89.40% | 89.40% |
| `ft_image_only` | 1,703 | 15.68% [14.0–17.5] | **16.97% [15.3–18.8]** | 189 | 15.70% | 16.93% | 18.20% | 18.80% |
| `ft_oracle_image` | 1,701 | 96.47% [95.5–97.2] | 96.47% [95.5–97.2] | 0 | 96.47% | 96.47% | 97.20% | 97.20% |
| `ft_oracle_text` | 1,701 | 92.71% [91.4–93.9] | 92.71% [91.4–93.9] | 0 | 92.71% | 92.71% | 93.20% | 93.20% |
| `ft_text_only` | 1,701 | 21.11% [19.2–23.1] | 21.11% [19.2–23.1] | 0 | 21.11% | 21.11% | 21.00% | 21.00% |
| `ft_unet-B1_image` | 1,703 | 23.14% [21.2–25.2] | 23.14% [21.2–25.2] | 0 | 23.16% | 23.16% | 21.40% | 21.40% |
| `ft_unet-B1cls_image` | 1,703 | 23.96% [22.0–26.0] | 23.96% [22.0–26.0] | 1 | 23.93% | 23.93% | 23.00% | 23.00% |

All 189 unparsed responses in `ft_image_only` mapped to valid multiple-choice option numbers. 22 of them were correct, shifting full `image_only` accuracy from 15.68% to 16.97% (+1.29 percentage points), and on subset M from 15.70% to 16.93%.
