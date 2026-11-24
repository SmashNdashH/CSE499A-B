"""
make_t2b_scenes.py
------------------
New file (21 Nov 2026, roadmap T2b: who writes the report). make_c4_scenes.py (unchanged) with T2b's scene rule
and its own folder, disasteller_offline/t2b_scenes/: the same three files (C4's rows, hot spots and scene list),
for ten scenes, plus pip_constraints.txt (below).

The scenes, by a rule fixed on 21 Nov before any T2b report was written (the roadmap asks for "the same 10 scenes
from E6's clean test pairs, picked before the run and spread across events, Turkey included"): for each event, its
clean test pair with the most truly destroyed pixels; then the ten events whose pair has the most. They are ranked
by E7 step 3's per-photo file, as step 5's scenes were. The rule gives five events from the sharper photos (one
building per row) and five from xBD (damage patches), and it holds both of step 5's scenes (Turkey and Santa Rosa).

pip_constraints.txt pins every package step 5's run 4 installed (from its pip log) to the same version, so the T2b
run, which installs from the internet on account 4, gets step 5's packages.

The photos (before and after, 20 files) are not on this PC. They come from the benchmark mirror on Kaggle
(redwannewaz/disasterm3-bench-mirror-v2, test_images/) into t2b_scenes/photos/, which git ignores; this script
lists any still missing.

Usage, from this folder:  python make_t2b_scenes.py
"""
import json
import os

import pandas as pd

import make_c4_scenes as c4

c4.OUT = os.path.join(c4.HERE, "disasteller_offline", "t2b_scenes")
STEP5 = {"turkey_earthquake4_post_327.png", "santa_rosa_wildfire_00000155_post_disaster.png"}
PIP_LOG = os.path.join(c4.HERE, "results", "t2_step5_c4_fix3", "t2_step5_c4_fix3_internet_off", "pip_install_log.txt")


def pick_scenes():
    """The rule above."""
    per = pd.read_csv(os.path.join(c4.S3, "hotspots_per_image.csv"))
    best = per.loc[per.groupby("event")["gt_destroyed_px"].idxmax()]
    return best.nlargest(10, "gt_destroyed_px")["image"].tolist()


def write_constraints():
    """name==version for each package in step 5's "Successfully installed" line."""
    line = next(l for l in open(PIP_LOG, encoding="utf-8", errors="replace") if l.startswith("Successfully installed"))
    pins = [f"{name}=={version}" for name, version in (p.rsplit("-", 1) for p in line.split()[2:])]
    with open(os.path.join(c4.OUT, "pip_constraints.txt"), "w", encoding="utf-8") as f:
        f.write("# Every package T2 step 5's run 4 installed (its pip_install_log.txt), at the same version\n")
        f.write("\n".join(pins) + "\n")
    return len(pins)


c4.pick_scenes = pick_scenes

if __name__ == "__main__":
    c4.main()
    scenes = json.load(open(os.path.join(c4.OUT, "scenes.json"), encoding="utf-8"))
    assert len(scenes) == 10 and STEP5 <= set(scenes), "the rule should give ten scenes, step 5's two among them"
    print(f"pip_constraints.txt: {write_constraints()} packages pinned")
    photos = os.path.join(c4.OUT, "photos")
    need = [n for s, i in scenes.items() for n in (i["before_image"], s)]
    missing = [n for n in need if not os.path.isfile(os.path.join(photos, n))]
    print(f"Photos: {len(need) - len(missing)} of {len(need)} in {photos}"
          + (f"; missing: {', '.join(missing)}" if missing else ""))
