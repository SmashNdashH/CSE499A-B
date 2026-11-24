# T2b: the two writers, scored

Made by [t2b_score.ipynb](../../t2b_score.ipynb) from `t2b_full_internet_on`. How each count is made is in its first cell.

**Rule:** the 7B stays the writer.

- ✗ the text model no more contradictions: 7B 3, 3B 15
- ✓ the text model no more fake citations: 7B 3, 3B 0
- ✓ the text model finishes at least as many reports: 7B 60, 3B 60

## Per writer

```
     writer  reports  finished  contradictions  unsourced  fake_citations  real_not_shown  real_citations  guard_replaced  first_answer_number_problems  sections_asked_again  not_available_offline  words_per_report  words_per_section_median  minutes_per_scene                                                                                       memory_lines
3b-instruct       60        60              15         12               0              37             604              35                            46                    73                     58            1180.0                     232.5              18.01 Model loading took 2.94 GiB and 4.571611 seconds; Model loading took 2.94 GiB and 4.633666 seconds
         7b       60        60               3          1               3               0             246               5                            22                    56                     15             429.5                      95.0               6.23 Model loading took 7.9 GiB and 66.550624 seconds; Model loading took 7.9 GiB and 66.561575 seconds
```

## Expectation, fixed before the run, against the result

```
                            expected                           how much                result   met
    both writers finish every report                            60 each          7B 60, 3B 60  True
 contradictions at most 3 per writer                           ≤ 3 each           7B 3, 3B 15 False
 fake citations at most 2 per writer                           ≤ 2 each            7B 3, 3B 0 False
the text model's sections are longer            median ≥ 1.2 × the 7B's   7B 95, 3B 232 words  True
            the text model is faster ≤ 0.7 × the 7B's minutes per scene 7B 6.23, 3B 18.01 min False
```

## Every number flagged

```
     writer                                          scene                                          report                             section             token   verdict                   where
         7b                   beriut_explosion_post_16.png                         Reconstruction_plan.txt                      Plan of Action               3.5 unsourced left after asking again
         7b        palu_tsunami_00000180_post_disaster.png                         Reconstruction_plan.txt                Assessment of Damage               49%     wrong left after asking again
         7b        palu_tsunami_00000180_post_disaster.png                         Reconstruction_plan.txt                Assessment of Damage               33%     wrong left after asking again
         7b  tuscaloosa_tornado_00000037_post_disaster.png                          Expert_team_report.txt                            Overview               54%     wrong left after asking again
3b-instruct                        libya_flood_post_90.png Emergency_service_human_resource_allocation.txt         Human Resource Requirements                15   misused left after asking again
3b-instruct                        libya_flood_post_90.png                         Reconstruction_plan.txt                Assessment of Damage                 2     wrong left after asking again
3b-instruct                        libya_flood_post_90.png                         Reconstruction_plan.txt                Assessment of Damage               13%     wrong left after asking again
3b-instruct                turkey_earthquake4_post_327.png                          Expert_team_report.txt Description of the estimated damage    221,070 pixels     wrong left after asking again
3b-instruct                turkey_earthquake4_post_327.png                          Expert_team_report.txt Description of the estimated damage    283,810 pixels     wrong left after asking again
3b-instruct                turkey_earthquake4_post_327.png                          Expert_team_report.txt                          Conclusion    283,810 pixels     wrong left after asking again
3b-instruct                turkey_earthquake4_post_327.png                     Public_community_report.txt                 Resource Allocation                15 unsourced left after asking again
3b-instruct                turkey_earthquake4_post_327.png                     Public_community_report.txt                 Resource Allocation                10 unsourced left after asking again
3b-instruct santa_rosa_wildfire_00000155_post_disaster.png                         Reconstruction_plan.txt                Assessment of Damage                96   misused left after asking again
3b-instruct      joplin_tornado_00000147_post_disaster.png Emergency_service_human_resource_allocation.txt                     Allocation Plan                63 unsourced left after asking again
3b-instruct      joplin_tornado_00000147_post_disaster.png                     Public_community_report.txt                   Current Situation               3.5 unsourced left after asking again
3b-instruct      joplin_tornado_00000147_post_disaster.png                         Reconstruction_plan.txt                   Executive Summary              2011 unsourced left after asking again
3b-instruct      joplin_tornado_00000147_post_disaster.png                         Reconstruction_plan.txt                   Executive Summary               3.5 unsourced left after asking again
3b-instruct      joplin_tornado_00000147_post_disaster.png                         Reconstruction_plan.txt                Assessment of Damage               216   misused left after asking again
3b-instruct                   beriut_explosion_post_16.png                          Expert_team_report.txt Description of the estimated damage    280,750 pixels     wrong left after asking again
3b-instruct                   beriut_explosion_post_16.png                          Expert_team_report.txt                          Conclusion    280,750 pixels     wrong left after asking again
3b-instruct                   beriut_explosion_post_16.png                         Reconstruction_plan.txt                Assessment of Damage               3.5 unsourced left after asking again
3b-instruct                   beriut_explosion_post_16.png                         Reconstruction_plan.txt                      Plan of Action                30 unsourced left after asking again
3b-instruct                   beriut_explosion_post_16.png                         Reconstruction_plan.txt                      Plan of Action                60 unsourced left after asking again
3b-instruct        palu_tsunami_00000180_post_disaster.png                     Public_community_report.txt                        Introduction                10 unsourced left after asking again
3b-instruct        palu_tsunami_00000180_post_disaster.png                     Public_community_report.txt                 Resource Allocation                15 unsourced left after asking again
3b-instruct        palu_tsunami_00000180_post_disaster.png                     Public_community_report.txt                 Resource Allocation                10 unsourced left after asking again
3b-instruct       moore_tornado_00000045_post_disaster.png                          Expert_team_report.txt Description of the estimated damage 55,000,400 pixels     wrong left after asking again
3b-instruct       moore_tornado_00000045_post_disaster.png                          Expert_team_report.txt Description of the estimated damage     58,910 pixels     wrong left after asking again
3b-instruct       moore_tornado_00000045_post_disaster.png                          Expert_team_report.txt                          Conclusion     55,000 pixels     wrong left after asking again
3b-instruct  tuscaloosa_tornado_00000037_post_disaster.png                          Expert_team_report.txt                            Overview               54%     wrong left after asking again
3b-instruct  tuscaloosa_tornado_00000037_post_disaster.png                          Expert_team_report.txt Description of the estimated damage    200,002 pixels     wrong left after asking again
```

Files: `reports.csv` (one row per writer, scene and report), `flagged_numbers.csv`, `writers.csv`, `blind/`.
