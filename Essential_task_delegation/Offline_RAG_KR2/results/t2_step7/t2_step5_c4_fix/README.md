# T2 step 7: every number in `t2_step5_c4_fix`'s reports

Made by [t2_step7_number_check.ipynb](../../../t2_step7_number_check.ipynb) with [number_check.py](../../../disasteller_offline/number_check.py); how the sources are rebuilt and how each number is checked are in the notebook's first cell. Rule 1 passes a run with no wrong number; rule 2 (20 Nov, evening) with no wrong and no misused number (a damage count used for staff, teams or shelters).

- **Rule 1: 191 numbers, 0 wrong, 0 unsourced, 0 misused: PASSES**
- **Rule 2: 191 numbers, 0 wrong, 0 unsourced, 9 misused: FAILS**

## By report, rule 2

```
                                     scene                                          report  ok  wrong  unsourced  misused  numbers
santa_rosa_wildfire_00000155_post_disaster         Alerts_team_report_for_social_media.txt  12      0          0        0       12
santa_rosa_wildfire_00000155_post_disaster Emergency_service_human_resource_allocation.txt  24      0          0        0       24
santa_rosa_wildfire_00000155_post_disaster                       Emergency_team_report.txt   8      0          0        0        8
santa_rosa_wildfire_00000155_post_disaster                          Expert_team_report.txt  12      0          0        0       12
santa_rosa_wildfire_00000155_post_disaster                     Public_community_report.txt  28      0          0        0       28
santa_rosa_wildfire_00000155_post_disaster                         Reconstruction_plan.txt  23      0          0        0       23
               turkey_earthquake4_post_327         Alerts_team_report_for_social_media.txt  11      0          0        0       11
               turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt   8      0          0        6       14
               turkey_earthquake4_post_327                       Emergency_team_report.txt  12      0          0        1       13
               turkey_earthquake4_post_327                          Expert_team_report.txt  12      0          0        0       12
               turkey_earthquake4_post_327                     Public_community_report.txt  11      0          0        2       13
               turkey_earthquake4_post_327                         Reconstruction_plan.txt  21      0          0        0       21
```

## Every number flagged under rule 2

```
                      scene                                          report                     section token  kind verdict                                                                                                                                                                                                                                            sentence
turkey_earthquake4_post_327                       Emergency_team_report.txt          Emergency shelters    54 other misused                                                                                                               The number of emergency shelters needed is 54, each accommodating one person, ensuring adequate living space for displaced residents.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt Human Resource Requirements    54 other misused                                          The human resource requirements for the emergency response include 54 medical personnel to provide immediate care and establish temporary medical points in the safe areas in the south-east of the photo.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt Human Resource Requirements    32 other misused                                                     Additionally, 32 international USAR teams, each comprising a Light, Medium, and Heavy team, are needed to clear debris and stabilize partially collapsed structures in the most affected zones.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt Human Resource Requirements    11 other misused                                                                                                              11 additional rescue teams are required to conduct rapid search and rescue operations in the areas with moderate to very heavy damage.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt             Allocation Plan    54 other misused                                                                      The allocation plan involves deploying 54 medical personnel to provide immediate care and establish temporary medical points in the safe areas in the south-east of the photo.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt             Allocation Plan    32 other misused                                                     Additionally, 32 international USAR teams, each comprising a Light, Medium, and Heavy team, are needed to clear debris and stabilize partially collapsed structures in the most affected zones.
turkey_earthquake4_post_327 Emergency_service_human_resource_allocation.txt             Allocation Plan    11 other misused                                                                                                              11 additional rescue teams are required to conduct rapid search and rescue operations in the areas with moderate to very heavy damage.
turkey_earthquake4_post_327                     Public_community_report.txt         Resource Allocation    54 other misused Based on the disaster assessment, we have allocated 54 emergency shelters in the safe areas identified in the south-east of the photo to accommodate displaced residents, ensuring adequate living space as per Sphere Handbook 2018 [SPHERE-1-p3].
turkey_earthquake4_post_327                     Public_community_report.txt    Organizational Operation    54 other misused                                              As the leading organization responsible for post-disaster management, our team has allocated 54 emergency shelters in safe areas to accommodate displaced residents and ensured adequate living space.
```

Files: `numbers.csv` (every number under both rules, with its verdict and sentence), `summary.csv`.
