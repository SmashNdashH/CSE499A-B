# T2 step 7: the numbers in T2 step 5's runs, side by side

Made by [t2_step7_number_check.ipynb](../../t2_step7_number_check.ipynb).
- Run 1 (`t2_step5_c4`) is the first run.
- Run 2 (`t2_step5_c4_fix`) adds fix (a), clearer facts, and fix (b), the number check while writing.
- Run 3 (`t2_step5_c4_fix2`), if listed, adds rule 2 to the check while writing.
- Run 4 (`t2_step5_c4_fix3`), if listed, adds requests that don't ask for numbers the facts lack, and a last guard.

**Rule 1** (fixed before run 1) passes a run with no wrong number. **Rule 2** (20 Nov, evening, fixed before run 3) also fails it for a misused number: a damage count used for staff, teams, shelters or other resources.

```
             run  rule                                      scene  numbers  ok  wrong  unsourced  misused verdict
     t2_step5_c4     1 santa_rosa_wildfire_00000155_post_disaster       60  43     12          5        0   fails
     t2_step5_c4     1                turkey_earthquake4_post_327       69  68      1          0        0   fails
     t2_step5_c4     2 santa_rosa_wildfire_00000155_post_disaster       60  43     12          5        0   fails
     t2_step5_c4     2                turkey_earthquake4_post_327       69  68      1          0        0   fails
 t2_step5_c4_fix     1 santa_rosa_wildfire_00000155_post_disaster      107 107      0          0        0  passes
 t2_step5_c4_fix     1                turkey_earthquake4_post_327       84  84      0          0        0  passes
 t2_step5_c4_fix     2 santa_rosa_wildfire_00000155_post_disaster      107 107      0          0        0   fails
 t2_step5_c4_fix     2                turkey_earthquake4_post_327       84  75      0          0        9   fails
t2_step5_c4_fix2     1 santa_rosa_wildfire_00000155_post_disaster      107 107      0          0        0  passes
t2_step5_c4_fix2     1                turkey_earthquake4_post_327       85  84      0          1        0  passes
t2_step5_c4_fix2     2 santa_rosa_wildfire_00000155_post_disaster      107 107      0          0        0   fails
t2_step5_c4_fix2     2                turkey_earthquake4_post_327       85  75      0          1        9   fails
t2_step5_c4_fix3     1 santa_rosa_wildfire_00000155_post_disaster       91  91      0          0        0  passes
t2_step5_c4_fix3     1                turkey_earthquake4_post_327       87  87      0          0        0  passes
t2_step5_c4_fix3     2 santa_rosa_wildfire_00000155_post_disaster       91  91      0          0        0  passes
t2_step5_c4_fix3     2                turkey_earthquake4_post_327       87  87      0          0        0  passes
```

Every number, with its verdict under both rules and its sentence, is in each run's folder (`numbers.csv`, `README.md`).
