# T2b: the two writers, scored

Made by [t2b_score.ipynb](../../t2b_score.ipynb) from `t2b_smoke_internet_on`. How each count is made is in its first cell.

**Rule:** the 7B stays the writer.

- ✗ the text model no more contradictions: 7B 0, 3B 4
- ✓ the text model no more fake citations: 7B 0, 3B 0
- ✓ the text model finishes at least as many reports: 7B 6, 3B 6

## Per writer

```
     writer  reports  finished  contradictions  unsourced  fake_citations  real_not_shown  real_citations  guard_replaced  first_answer_number_problems  sections_asked_again  not_available_offline  words_per_report  words_per_section_median  minutes_per_scene                                                                                       memory_lines
3b-instruct        6         6               4         19               0               2              60              41                            32                    12                      7            1173.5                     220.0               20.6 Model loading took 2.94 GiB and 4.676707 seconds; Model loading took 2.94 GiB and 4.701317 seconds
         7b        6         6               0          0               0               0              35               0                             1                     5                      2             453.0                     109.0                6.9 Model loading took 7.9 GiB and 66.824539 seconds; Model loading took 7.9 GiB and 66.724943 seconds
```

## Expectation, fixed before the run, against the result

```
                            expected                           how much               result   met
    both writers finish every report                             6 each           7B 6, 3B 6  True
 contradictions at most 3 per writer                           ≤ 3 each           7B 0, 3B 4 False
 fake citations at most 2 per writer                           ≤ 2 each           7B 0, 3B 0  True
the text model's sections are longer            median ≥ 1.2 × the 7B's 7B 109, 3B 220 words  True
            the text model is faster ≤ 0.7 × the 7B's minutes per scene  7B 6.9, 3B 20.6 min False
```

## Every number flagged

```
     writer                           scene                                          report                             section          token   verdict                   where
3b-instruct turkey_earthquake4_post_327.png                          Expert_team_report.txt Description of the estimated damage 221,070 pixels     wrong left after asking again
3b-instruct turkey_earthquake4_post_327.png                          Expert_team_report.txt Description of the estimated damage 283,810 pixels     wrong left after asking again
3b-instruct turkey_earthquake4_post_327.png                          Expert_team_report.txt                          Conclusion 221,070 pixels     wrong left after asking again
3b-instruct turkey_earthquake4_post_327.png Emergency_service_human_resource_allocation.txt         Human Resource Requirements            4.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png Emergency_service_human_resource_allocation.txt         Human Resource Requirements            5.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Assessment of Damage             32   misused left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Assessment of Damage            4.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Assessment of Damage            5.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Reconstruction Needs             10 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Reconstruction Needs            500 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Reconstruction Needs            200 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Reconstruction Needs             25 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                Reconstruction Needs            150 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             10 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action              8 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action            4.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action            5.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             14 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             15 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             30 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action            3.5 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             31 unsourced left after asking again
3b-instruct turkey_earthquake4_post_327.png                         Reconstruction_plan.txt                      Plan of Action             60 unsourced left after asking again
```

Files: `reports.csv` (one row per writer, scene and report), `flagged_numbers.csv`, `writers.csv`, `blind/`.
