"""
make_t2b_upload.py
------------------
New file (21 Nov 2026, roadmap T2b). make_t2_step5_upload.py (unchanged), packing into its own folder and zip,
kaggle_upload/disasteller-offline-t2b/, for a dataset of its own on account 4. It also packs t2b_scenes/: the ten
scenes' table, hot spots and list, their 20 photos and pip_constraints.txt, which t2b_flow.py and the T2b notebook
read. The manifest (each file's sha256 and the git commit) works as before: the notebook copies each file by its
name and checks its sha256.

Usage, from this folder:  python make_t2b_scenes.py, the photos into t2b_scenes/photos/, then python make_t2b_upload.py
"""
import json
import os

import make_t2_step5_upload as up

up.OUT_DIR = os.path.join(up.script_dir, "kaggle_upload", "disasteller-offline-t2b")
_wanted = up.wanted


def wanted(rel_path: str) -> bool:
    parts = rel_path.replace("\\", "/").split("/")
    if parts[0] == "t2b_scenes":
        return ((len(parts) == 2 and rel_path.endswith((".sqlite", ".json", ".txt")))
                or (len(parts) == 3 and parts[1] == "photos" and rel_path.endswith(".png")))
    return _wanted(rel_path)


up.wanted = wanted

if __name__ == "__main__":
    scenes_dir = os.path.join(up.SRC, "t2b_scenes")
    for needed in ("t2b_flow.py", os.path.join("t2b_scenes", "scenes.json"), os.path.join("t2b_scenes", "pip_constraints.txt")):
        if not os.path.isfile(os.path.join(up.SRC, needed)):
            raise SystemExit(f"{needed} is missing in disasteller_offline/: run make_t2b_scenes.py first")
    scenes = json.load(open(os.path.join(scenes_dir, "scenes.json"), encoding="utf-8"))
    missing = [n for s, i in scenes.items() for n in (i["before_image"], s)
               if not os.path.isfile(os.path.join(scenes_dir, "photos", n))]
    if missing:
        raise SystemExit(f"Photos missing in t2b_scenes/photos/: {', '.join(missing)}")
    up.main()
