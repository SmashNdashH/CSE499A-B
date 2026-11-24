# T2 step 5: the reports read C4's damage facts (run 20 Nov 2026)

**In short:** the whole chain ran offline for the first time. C4's damage map fed the building table and the hot spots, and our 7B wrote six reports per photo pair from them, with the grades and the labelled map written by code. Both pairs pass all five pass rules with the internet off. The weak link is the language model's handling of numbers: on the xBD pair, all six reports turn "96 destroyed areas" (of 144) into "96% of the area destroyed".

## What ran

- **Notebook:** [t2_step5_c4_run.ipynb](../../t2_step5_c4_run.ipynb), a copy of Ridita's run notebook with only the flow, the inputs and a loop over the two scenes changed.
- **Where:** Kaggle account 3, `redwannewaz/t2-step5-c4-run` version 1, 20 Nov 2026, 08:16–08:35 (19.1 min). GPU T4 x2, internet off, the same Kaggle environment as Ridita's last T2 run.
- **The flow:** [fixed_flow_c4.py](../../disasteller_offline/fixed_flow_c4.py), once per scene, on our fine-tuned 7B (`AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, served by vLLM 0.25.1), with the guideline search index offline.
  - Every report's facts start with C4's facts for the pair: the counts by damage state, the hot spots and the safe areas, each called an estimate.
  - The code, not the model, writes the damage-grade section (destroyed = EMS-98 Grade 5, damaged = Grades 2–4, intact = at most Grade 1, each citing its EMS-98 section) and the map reading. It also draws the labelled map.
- **The code:** packed by [make_t2_step5_upload.py](../../make_t2_step5_upload.py) from commit `1a5f38094` plus the step 5 files, which weren't committed yet (the manifest says "uncommitted changes: True").

**The two scenes** were picked by a rule before any report: of the clean test pairs, the earthquake pair from the sharper photos, and the xBD pair with the most truly destroyed pixels. Their facts come from [make_c4_scenes.py](../../make_c4_scenes.py), cut out of E7 step 3's table and hot-spot file.

| Scene | Source; what one row is | C4's counts | Hot spots; safe areas |
|---|---|---|---|
| `turkey_earthquake4_post_327.png` | sharper photos (BRIGHT); one building | intact 54, damaged 11, destroyed 32 (97 buildings) | 3; 3 |
| `santa_rosa_wildfire_00000155_post_disaster.png` | xBD; one connected patch, which can hold several touching buildings | intact 45, damaged 3, destroyed 96 (144 areas) | 1; 3 |

## The pass rules (`check_run.py`, fixed in Ridita's README before any run)

Both scenes: **PASSED: the offline proof (internet off).**

| Rule | Turkey | Santa Rosa |
|---|---|---|
| 1. The run finished | pass | pass |
| 2. All six reports, each starting "Mode: offline", each 50+ words | pass | pass |
| 3. Nothing went outside this computer (the network log saw only 127.0.0.1) | pass | pass |
| 4. No Gemini library was loaded | pass | pass |
| 5. Every model question got an answer | pass | pass |

Also from each run's `t2_run_summary.json`:

| | Turkey | Santa Rosa |
|---|---|---|
| Sections written | 28 | 28 |
| Words | 2,746 | 2,885 |
| Citations (all of them real guideline passages) | 37 | 24 |
| Sections asked again for a missing citation; kept without one | 5; 3 | 7; 5 |
| Labels on the map | 6 | 4 |
| Minutes | 5.5 | 5.5 |

## The expectation, fixed before the run, against the result

| Expectation | Result |
|---|---|
| Both scenes pass the five pass rules | **Met** |
| Every report gives the counts exactly as the facts do | **Turkey: met** for the counts: 32 destroyed and 11 damaged in all six reports, 54 intact in the code-written grade section. **Santa Rosa: not met.** All six reports say "96% of the area classified as destroyed". The facts say 96 of 144 areas, which is 67%, and the hot-spot zone covers 65% of the photo |
| The Santa Rosa reports call its counts areas, not buildings | **Met:** "building" never names a count there, only "rebuilding", "capacity-building" and "building codes" |

## A first look at the numbers (step 7 checks every number formally)

- **Santa Rosa, "96% of the area":** the same sentence in all six reports. It was written once, in the Expert report's first section, and repeated, since the later reports read the earlier ones. The facts block for patch photos says "the counts below are of areas", then "destroyed: 96". The model appears to have read that as a share of the area.
- **Turkey, the Alerts report:**
  - it gives hot spot 3's zone as "283,81 pixels" (the facts: 28,381);
  - it ties the counts to the hot spots ("around (320, 32), a hot spot of 403,997 pixels, 32 buildings were completely destroyed"; "(991, 32) … 11 buildings sustained moderate to heavy damage"). The facts don't say where the 32 and the 11 are.
- **Quantities with no source:**
  - Santa Rosa's human-resource report asks for "10 Medical Personnel", "2 Shifts of 50 logistics support personnel", "100 workers" and "20 more Medical Personnel";
  - Turkey's asks for "1 international USAR team" and "1 medical team", and the Emergency team report says "the number of hospitals or medical points needed … is 1".
- **Numbers taken correctly from the guidelines:** "3.5 square metres per person" (Sphere 2018, shelter), Sphere "pp. 289-292", INSARAG "Section 6.2".

## The labelled maps

Both maps show every hot spot (red circle, H1…) and safe area (green triangle, S1…) at the coordinates in the facts, and the labels near the right edge sit left of their marker. On Santa Rosa the safe areas fall in the unburnt neighbourhood west of the railway, and the burnt area east of it is one hot-spot zone.

## Possible fixes (not done; for the decision before step 7)

1. **Facts that leave less to read wrongly:** give each count with its share ("destroyed: 96 of 144 areas, 67%"), and name the xBD rows "damage patches" instead of "areas". Small change, one re-run (about 20 min on a T4 pair).
2. **A number check inside the flow:** a section that states a number found neither in the facts nor in its guideline passages is asked again, as a missing citation is now. This is step 7's checker, used during writing.
3. **The code writes the counts sentence,** as it already writes the grades, and the model only describes it.

## Files

- The executed notebook, every cell with its output, is saved over [t2_step5_c4_run.ipynb](../../t2_step5_c4_run.ipynb) (its 22 cells are unchanged).
- `t2-step5-c4-run.log`: everything the notebook printed.
- `t2_step5_c4_internet_off/` (the run's zip, unpacked):
  - per scene, `run_<scene>/`: the six reports and `4_anotated.png` in `reports/offline/`, `run_log.txt`, `llm_calls.jsonl`, `netlog.json` and `t2_run_summary.json`;
  - `t2_notebook_info.json` (versions, the model, the code's commit, the smoke tests), `vllm_server.log`, `pip_install_log.txt`, `smoke_llm_calls.jsonl`.
