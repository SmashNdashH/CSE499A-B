# T2 step 5, run 4: requests that don't ask for numbers the facts lack, and a last guard (run 20 Nov 2026)

**In short:** both pairs pass the five pass rules, and T2 step 7 finds **0 wrong, 0 unsourced and 0 misused numbers** in the 12 reports, under both versions of its rule. It's the first run of the four to pass rule 2. The last guard never had to act: the rewritten requests did the work. Every expectation fixed before the run is met.

## What ran

- **Notebook:** [t2_step5_c4_fix3_run.ipynb](../../t2_step5_c4_fix3_run.ipynb), saved with every cell's output. It's a named copy of run 3's notebook, which keeps its outputs.
- **Where:** Kaggle account 3, `redwannewaz/t2-step5-c4-fix3-run`, 20 Nov 2026, 21:48–22:08 (19.2 min), internet off, with the inputs and environment of runs 1–3.
- **The code:** version 4 of the private dataset `disasteller-offline-c4`, packed at 21:47. It's run 3's code plus two changes in `fixed_flow_c4.py`, Abrar's choice of both; `fixed_flow.py` is unchanged:
  1. **The requests.** In the C4 flow's own copies of tasks 2–6:
     - the shelters, hospitals, staffing, allocation, resource and reconstruction sections ask for the kinds of staff, teams and shelters, by place;
     - their numbers are "not available offline", and no count of buildings may stand for people, teams or shelters;
     - the Emergency task asks for the locations of shelters and hospitals, not their number.
  2. **The last guard.** A number still flagged after the second answer would be replaced by "(number not available offline)" at its own place, and logged.

## The pass rules

Both scenes: **PASSED: the offline proof (internet off)**, all five rules.

| | Turkey | Santa Rosa |
|---|---|---|
| Minutes (run 3) | 5.5 (5.6) | 5.7 (5.7) |
| Words | 2,868 | 3,159 |
| Citations, all of real passages | 30 | 31 |
| Sections asked again; kept with a problem (all "no citation") | 3; 1 | 4; 3 |

**What the number checks did while writing:**
- **Santa Rosa:** the Expert report's first Overview said "96%" and "45%" once more. It was asked again, and the second answer is clean, as in runs 2 and 3.
- **Turkey:** no section was asked again for a number.
- **The guard:** replaced nothing in either scene.

## The expectation, fixed before the run, against the result

| Expectation | Result |
|---|---|
| Both scenes pass the five pass rules | **Met** |
| Step 7 under rule 2: 0 wrong, unsourced or misused numbers | **Met: 0** of 178 ([step 7, all four runs](../t2_step7/README.md)) |
| The guard replaces at most 3 numbers | **Met: 0** |
| Each scene at most 2 minutes slower than run 3 | **Met:** −0.1 and 0.0 min |

## Read by eye

- **Turkey's shelter and staffing sections now say where and what, not how many:**
  - shelters go in the three safe areas, "254 to 412 pixels" from damage (the facts' distances), with Sphere's 3.5 m² per person from the passage shown;
  - the light, medium and heavy USAR teams go to the hot spots in the north-west, west and north-east, and medical staff to the safe areas, with citations.

  The 7B left the numbers out rather than writing "not available offline".
- **Still open, not a number:** the Santa Rosa Expert report says "the pre-disaster photo shows significant damage". That sentence comes from the photo tool's description of the before photo, as in runs 2 and 3. It belongs to the reports' quality (T2b), not to step 7.

## The four runs of step 5

| Run | What changed | Step 7, rule 1 (wrong numbers) | Step 7, rule 2 (+ misused) |
|---|---|---|---|
| 1 | C4's facts in the reports | fails: 13 wrong, 5 unsourced | fails |
| 2 | (a) shares in the facts; (b) the number check while writing | passes: 0 wrong, 0 unsourced | fails: 9 misused |
| 3 | rule 2 in the check while writing | passes: 0 wrong, 1 unsourced | fails: 9 misused |
| 4 | requests without missing numbers; the last guard | **passes: 0** | **passes: 0** |

## Files

- The executed notebook is saved over [t2_step5_c4_fix3_run.ipynb](../../t2_step5_c4_fix3_run.ipynb); `t2-step5-c4-fix3-run.log` has everything it printed.
- `t2_step5_c4_fix3_internet_off/` (the run's zip, unpacked): per scene, the six reports and the labelled map, the run log (with any "Number guard" lines), every model call and answer check, the network log and the run summary.
