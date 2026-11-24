# T2 step 5, run 3: the same two pairs, with rule version 2 in the number check (run 20 Nov 2026)

**In short:**
- **Both pairs pass the five pass rules again,** and the Santa Rosa reports are clean under both rules.
- **Turkey's staffing sections still reuse the building counts:** "54 medical personnel", "32 international USAR teams", "11 rescue teams" and "54 emergency shelters", plus "43 rescue teams" (32 + 11). The check asked again for each, and the 7B kept the same numbers in its second answer.
- **So run 3 misses its expectation:** step 7 under rule 2 finds 10 flagged numbers, against at most 2.
- **The cause is in the requests:** those sections ask for staff and shelter numbers that the facts don't give.

## What ran

- **Notebook:** [t2_step5_c4_fix2_run.ipynb](../../t2_step5_c4_fix2_run.ipynb), saved with every cell's output. It's a named copy of run 2's notebook, which keeps its outputs.
- **Where:** Kaggle account 3, `redwannewaz/t2-step5-c4-fix2-run`, 20 Nov 2026, from 19:35 (19.0 min in the notebook), internet off, with the inputs and environment of runs 1 and 2.
- **The code:** version 3 of the private dataset `disasteller-offline-c4`, packed at 19:34. It's run 2's code plus rule version 2 in [number_check.py](../../disasteller_offline/number_check.py): a damage count used for staff, teams, shelters or other resources is "misused", and is asked again like a wrong number.

## The pass rules

Both scenes: **PASSED: the offline proof (internet off)**, all five rules.

| | Turkey | Santa Rosa |
|---|---|---|
| Minutes (run 2) | 5.6 (5.4) | 5.7 (5.8) |
| Sections asked again; kept with a problem | 7; 6 | 5; 3 |

## What the number check did while writing

- **Santa Rosa:** the Expert report's first Overview said "96%" and "45%" again. It was asked again, and the second answer is clean, as in run 2.
- **Turkey:** five sections were asked again for misused or unsourced numbers. In every one the second answer kept the same numbers, so all five were kept with the problem:
  - the Emergency team's shelters;
  - the human-resource report's requirements and allocation plan;
  - the public report's resource allocation and organisational operation.

## The expectation, fixed before the run, against the result

| Expectation | Result |
|---|---|
| Both scenes pass the five pass rules | **Met** |
| Step 7 under rule 2: at most 2 wrong, unsourced or misused numbers in all (target 0) | **Missed: 10** (0 wrong, 1 unsourced, 9 misused, all in Turkey's reports); Santa Rosa 0 ([step 7](../t2_step7/README.md)) |
| Each scene at most 2 minutes slower than run 2 | **Met:** +0.2 and −0.1 min |

Under the first rule (wrong numbers only), run 3 passes, as run 2 did.

## Why asking again doesn't help

The sections' own requests ask for numbers the facts can't give:
- the human-resource report asks for "the number of medical personnel, the number of rescue teams and logistics support";
- the Emergency team's report asks for "the number of emergency shelters".

These requests are Ridita's, from DisasTeller's original tasks, written for runs where the 7B would estimate. The offline rules say to write "not available offline" for staff numbers, but the request is more specific, and the 7B follows it with the only numbers it has. Told that a building count is not a number of staff, it writes the same sentence again.

## What could fix it (for the decision)

1. **Requests that don't ask for numbers the facts lack.** In the C4 flow's own copies of those three reports' specs (Ridita's file stays as it is), the staffing and shelter sections would ask for the kinds of staff and shelters, by place, citing the guidelines. Their numbers would be "not available offline" unless a guideline section gives one.
2. **A last guard in the code.** A number still flagged after the second answer is replaced by "(number not available offline)", and the run log says so. This makes zero misused numbers certain, at the cost of the code editing the model's text.

## Files

- The executed notebook is saved over [t2_step5_c4_fix2_run.ipynb](../../t2_step5_c4_fix2_run.ipynb); `t2-step5-c4-fix2-run.log` has everything it printed.
- `t2_step5_c4_fix2_internet_off/` (the run's zip, unpacked): per scene, the six reports and the labelled map, the run log, every model call and answer check, the network log and the run summary.
