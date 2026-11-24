# T2 step 5, run 2: the same two pairs, with the number fixes (a) and (b) (run 20 Nov 2026)

**In short:** both pairs pass the five pass rules again, and T2 step 7 finds **0 wrong and 0 unsourced numbers** in the 12 reports (run 1: 13 wrong, 5 unsourced), so run 2 passes step 7's rule as it was fixed before the run. Read by eye, though, Turkey's two staffing reports now reuse the damage counts as staff numbers ("54 medical personnel" is the intact-building count). The rule can't see that.

## What ran

- **Notebook:** [t2_step5_c4_fix_run.ipynb](../../t2_step5_c4_fix_run.ipynb), saved with every cell's output. It's a named copy of run 1's notebook, which keeps its outputs.
- **Where:** Kaggle account 3, `redwannewaz/t2-step5-c4-fix-run`, 20 Nov 2026, 19:01–19:21 (19.7 min), internet off, with run 1's inputs and environment.
- **The code:** version 2 of the private dataset `disasteller-offline-c4`, packed at 19:00 from commit `1a5f38094` plus the uncommitted step 5 files.
- **What changed from run 1:**
  - **(a) clearer facts:** each count comes with its share ("96 of 144 damage patches (67%)"), xBD rows are called damage patches, and the facts say the shares aren't of the photo's area. The rules ask for the facts' and the guidelines' numbers only, and the code's grade lines read "Damage patches estimated destroyed: 96";
  - **(b) the number check while writing:** [number_check.py](../../disasteller_offline/number_check.py), T2 step 7's rules. A wrong or unsourced number gets the section asked again, once.

## The pass rules

Both scenes: **PASSED: the offline proof (internet off)**, all five rules.

| | Turkey | Santa Rosa |
|---|---|---|
| Minutes (run 1) | 5.4 (5.5) | 5.8 (5.5) |
| Words | 2,770 | 2,878 |
| Citations, all of real passages | 21 | 37 |
| Sections asked again; kept with a problem (all "no citation") | 5; 4 | 5; 3 |

**What the number check did while writing:**
- **Santa Rosa:** the Expert report's first Overview still said "96%" (and "45%"), with the shares in the facts. It was asked again, and the second answer gives "96 of 144 damage patches".
- **Turkey:** the first answer of the human-resource requirements had an unsourced "43" (32 + 11). It was asked again, and the second answer was kept.

## The expectation, fixed before the run, against the result

| Expectation | Result |
|---|---|
| Both scenes pass the five pass rules | **Met** |
| Step 7: at most 2 wrong and 2 unsourced numbers (target 0), and no "96%" | **Met: 0 and 0** of 191 numbers, and no report says "96%" ([step 7, side by side](../t2_step7/README.md)) |
| Each scene at most 2 minutes slower than run 1 | **Met:** +0.3 and −0.1 min |

## What the rule doesn't catch: counts reused as other numbers

The check accepts a number that is in the facts. Told to use only those, the 7B reused the damage counts for things they don't count, all in Turkey's reports:
- in the Emergency team's report, 54 shelters (54 is the intact-building count);
- in the human-resource report's requirements and allocation plan, 54 medical personnel, 32 international USAR teams and 11 more rescue teams (32 destroyed, 11 damaged).

That's 7 numbers. A search of both runs for damage counts not followed by damage words found these 7 in run 2. Run 1 had only the two "3"s of INSARAG's three team types (light, medium and heavy).

The fix (a) alone didn't stop the misreading either: the first Overview still wrote "96%". Fix (b) is what removed it.

Also seen by eye: the Santa Rosa Expert report describes the *before* photo as already damaged. That comes from the photo tool's description, not a number, and is a matter for the reports' quality (T2b).

## Files

- The executed notebook is saved over [t2_step5_c4_fix_run.ipynb](../../t2_step5_c4_fix_run.ipynb); `t2-step5-c4-fix-run.log` has everything it printed.
- `t2_step5_c4_fix_internet_off/` (the run's zip, unpacked): per scene, the six reports and the labelled map, `run_log.txt`, `llm_calls.jsonl` (each answer check, with its number problems), `netlog.json` and `t2_run_summary.json`; and the notebook's info, server and install logs.
