# L2 step 1 again: teacher answers from the new 7B

Teacher `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, at full size, greedy, asked the plain training prompt. 3,265 of 3,265 entries answered (the first run’s 4,000 minus its road-counting entries); 1,146 answers match their label and are kept (first run: 1,085).

## Kept answers by task, against the first run

The first run (19 Oct): the old 7B, the 512-token image cap, sampling at 0.2 and a 'think step by step' instruction. Its numbers are a reference, not a controlled comparison: the teacher, image size, decoding and prompt all changed.

| task | generated | kept | kept_% | first_run_generated | first_run_kept | first_run_kept_% |
|---|---|---|---|---|---|---|
| Building Damage Counting | 1445 | 236 | 16.3 | 1445 | 225 | 15.6 |
| Disaster Bearing Bodies Recognition | 776 | 351 | 45.2 | 776 | 331 | 42.7 |
| Disaster Scene Recognition | 694 | 376 | 54.2 | 694 | 353 | 50.9 |
| Disaster Type Recognition | 170 | 155 | 91.2 | 170 | 152 | 89.4 |
| relational reasoning | 180 | 28 | 15.6 | 180 | 24 | 13.3 |

## Files

- `disasterm3_distillation_cot_train.json`: every eligible training entry, with `teacher_rationale` filled only where the answer was checked correct. Step 2 reads it through `DISTILL_MANIFEST_PATH`.
- `teacher_cot_progress.jsonl`: every raw answer, with the teacher's ID.
- `cot_match_by_task.csv`, `config.json`.