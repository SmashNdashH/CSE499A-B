# L3 step 6: the 4-bit 3B on a laptop with no GPU

From `l3-step6-laptop-cpu.ipynb`, run in Jupyter on the PC (25 Nov 2026). The rule and the expectation are fixed in the notebook's first cell. Questions: `l3-step6-download-inputs.py`.

## Machine and program

13th Gen Intel(R) Core(TM) i9-13900H, 14 cores, 16.8 GB of memory, no NVIDIA GPU; llama.cpp b12237 on the CPU, 14 threads. Model files: 3.27 GB on disk (the language part in 4 bits, Q4_K_M; the image part in 16 bits). Server ready in 14.8 s.

## Memory and speed

| | Laptop CPU | T4 (L3) |
|---|---|---|
| Peak memory | 4.67 GB (working set) | 3.03 GB (GPU) |
| Seconds per question, mean (median), the 60 L3 timed | 84.04 (96.68) | 1.72 (1.91) |
| Prompt reading | 16.5 tokens/s, 1371.4 tokens per question | — |
| Answer writing | 7.5 tokens/s | — |

## Accuracy on the same 360 questions

| task | questions | laptop_pct | t4_pct | same_answer_pct | seconds_mean |
|---|---|---|---|---|---|
| DTR | 60 | 53.33 | 55.0 | 90.0 | 96.05 |
| BBR | 60 | 10.0 | 11.67 | 68.33 | 97.92 |
| BDC | 60 | 51.67 | 46.67 | 86.67 | 98.01 |
| DRE | 60 | 40.0 | 43.33 | 88.33 | 99.04 |
| DSR | 60 | 35.0 | 35.0 | 65.0 | 51.97 |
| ORR | 60 | 48.33 | 53.33 | 83.33 | 52.42 |

Overall: laptop 39.72%, T4 40.83%. Only the laptop right on 14, only the T4 on 18 (exact McNemar p = 0.597). Same answer as the T4 on 80.3% of questions.

## Expectation against result

| expectation (24 Nov) | result | met |
|---|---|---|
| peak memory at most 6 GB (likely 3 to 5) | 4.67 GB | True |
| 10 to 60 s per question | 84.04 s (speed set), 82.57 s (all 360) | False |
| no difference beyond chance from the T4's 4-bit answers | laptop 39.72% against T4 40.83%; only laptop right 14, only T4 18, p = 0.597 | True |
| no garbled or empty answers | 0 | True |

## Files

`per_question.csv`, `by_task.csv`, `summary.json`, `answers.jsonl`, `server.log`, `prepare_*.log`
