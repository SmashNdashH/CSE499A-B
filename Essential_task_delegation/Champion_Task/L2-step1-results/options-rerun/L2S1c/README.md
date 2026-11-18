# L2 step 1c: the options rerun

The 7B `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` answered L2 step 1's counting and relational questions again with the benchmark's prompts and options, at full size, greedy. An answer is kept when its letters equal the label's. 806 kept of 2,249; held-out after-photos left out.

| task | answered | kept | kept_% | benchmark_accuracy_% |
|---|---|---|---|---|
| Building Damage Counting | 1379 | 483 | 35.0 | 30.31 |
| Road Damage Counting | 699 | 253 | 36.2 | 33.03 |
| relational reasoning | 171 | 70 | 40.9 | 34.62 |

Expected about 700-900 kept (fixed before the run): met.

## Files

- `options_kept.jsonl`: per kept example its entry index, task, the benchmark prompt (with `<image>` where each picture goes), the image paths in order, and the answer letter. Option (c)'s training adds these to L2 step 1's data.
- `options_progress.jsonl` (every answer), `by_task.csv`, `config.json`.
