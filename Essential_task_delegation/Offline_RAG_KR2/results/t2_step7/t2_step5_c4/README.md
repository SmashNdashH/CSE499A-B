# T2 step 7: every number in `t2_step5_c4`'s reports

Made by [t2_step7_number_check.ipynb](../../../t2_step7_number_check.ipynb) with [number_check.py](../../../disasteller_offline/number_check.py); how the sources are rebuilt and how each number is checked are in the notebook's first cell. Rule 1 passes a run with no wrong number; rule 2 (20 Nov, evening) with no wrong and no misused number (a damage count used for staff, teams or shelters).

- **Rule 1: 129 numbers, 13 wrong, 5 unsourced, 0 misused: FAILS**
- **Rule 2: 129 numbers, 13 wrong, 5 unsourced, 0 misused: FAILS**

## By report, rule 2

```
                                     scene                                          report  ok  wrong  unsourced  misused  numbers
santa_rosa_wildfire_00000155_post_disaster         Alerts_team_report_for_social_media.txt   4      2          0        0        6
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt  17      2          5        0       24
santa_rosa_wildfire_00000155_post_disaster                       Emergency_team_report.txt   5      0          0        0        5
santa_rosa_wildfire_00000155_post_disaster                          Expert_team_report.txt   3      3          0        0        6
santa_rosa_wildfire_00000155_post_disaster                     Public_community_report.txt   5      3          0        0        8
santa_rosa_wildfire_00000155_post_disaster                         Reconstruction_plan.txt   9      2          0        0       11
               turkey_earthquake4_post_327         Alerts_team_report_for_social_media.txt   8      1          0        0        9
               turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt  23      0          0        0       23
               turkey_earthquake4_post_327                       Emergency_team_report.txt   9      0          0        0        9
               turkey_earthquake4_post_327                          Expert_team_report.txt   6      0          0        0        6
               turkey_earthquake4_post_327                     Public_community_report.txt  11      0          0        0       11
               turkey_earthquake4_post_327                         Reconstruction_plan.txt  11      0          0        0       11
```

## Every number flagged under rule 2

```
                                     scene                                          report                                            section         token   kind   verdict                                                                                                                                                                                    sentence
santa_rosa_wildfire_00000155_post_disaster                          Expert_team_report.txt                                           Overview           96%  share     wrong                                             The wildfire caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                          Expert_team_report.txt Description of the photos and the estimated damage           96%  share     wrong                                             The wildfire caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                          Expert_team_report.txt                                         Conclusion           96%  share     wrong                                          The wildfire caused catastrophic destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster         Alerts_team_report_for_social_media.txt                                  Danger area alert           96%  share     wrong                                         The wildfire has caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster         Alerts_team_report_for_social_media.txt                                  Social media news           96%  share     wrong                The Santa Rosa wildfire has caused catastrophic destruction, with 96% of the area classified as completely destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                                       Introduction           96%  share     wrong                               The Santa Rosa wildfire caused catastrophic destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                                  Current Situation           96%  share     wrong                              The Santa Rosa wildfire has caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                        Human Resource Requirements            50  other unsourced                  3) 2 Shifts of 50 logistics support personnel are necessary to manage the transportation of emergency supplies and personnel, ensuring continuous supply chain operations.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                        Human Resource Requirements           100  other unsourced                                                                        4) 100 workers are needed for debris clearance and stabilization tasks in the hot spot 1 to prevent further hazards.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                                    Allocation Plan            50  other unsourced                                 2 Shifts of 50 logistics support personnel will manage the transportation of emergency supplies and personnel, ensuring continuous supply chain operations.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                                    Allocation Plan           100  other unsourced                                                                    100 workers will be allocated for debris clearance and stabilization tasks in the hot spot 1 to prevent further hazards.
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt                                    Recommendations            20  other unsourced            Specifically, the allocation of 20 more Medical Personnel is proposed to enhance the capacity of temporary medical points and ensure comprehensive care for injured individuals.
santa_rosa_wildfire_00000155_post_disaster                     Public_community_report.txt                                       Introduction           96%  share     wrong                                             The wildfire caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                     Public_community_report.txt                                  Current Situation           96%  share     wrong                                             The wildfire caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                     Public_community_report.txt                                    Public Advisory           96%  share     wrong                                         The wildfire has caused extensive destruction, with 96% of the area classified as destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                         Reconstruction_plan.txt                                  Executive Summary           96%  share     wrong                               The wildfire caused catastrophic destruction, with 96% of the area classified as completely destroyed, indicating total or near-total collapse of structures.
santa_rosa_wildfire_00000155_post_disaster                         Reconstruction_plan.txt                               Assessment of Damage           96%  share     wrong                               The wildfire caused catastrophic destruction, with 96% of the area classified as completely destroyed, indicating total or near-total collapse of structures.
               turkey_earthquake4_post_327         Alerts_team_report_for_social_media.txt                                  Social media news 283,81 pixels pixels     wrong Nearby, in the north-east region, around pixel coordinates (991, 32), another hot spot of 283,81 pixels, 11 buildings sustained moderate to heavy damage, with debris scattered throughout.
```

Files: `numbers.csv` (every number under both rules, with its verdict and sentence), `summary.csv`.
