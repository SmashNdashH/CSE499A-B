"""
make_t2_step5_upload.py
-----------------------
New file (20 Nov 2026, roadmap T2 step 5). make_disasteller_upload.py (unchanged), with two differences:
  - it also packs disasteller_offline/c4_scenes/ (the two scenes' table, hot spots and scene list, made by
    make_c4_scenes.py), which fixed_flow_c4.py reads;
  - it packs into kaggle_upload/disasteller-offline-c4/ and disasteller-offline-c4.zip, for a dataset of its own,
    so the disasteller-offline dataset stays as it is.
The manifest (each file's sha256 and the git commit) works as before: t2_step5_c4_run.ipynb copies each file by
its name and checks its sha256.

Usage, from this folder:  python make_c4_scenes.py, then python make_t2_step5_upload.py
"""

import hashlib
import json
import os
import shutil
import subprocess
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(script_dir, "disasteller_offline")
OUT_DIR = os.path.join(script_dir, "kaggle_upload", "disasteller-offline-c4")


def wanted(rel_path: str) -> bool:
    parts = rel_path.replace("\\", "/").split("/")
    if parts[0] == "Disaster_image":
        return rel_path.lower().endswith((".png", ".jpg", ".jpeg"))
    if parts[0] == "c4_scenes":
        return len(parts) == 2 and rel_path.endswith((".sqlite", ".json"))
    return len(parts) == 1 and rel_path.endswith(".py")


def git(*args) -> str:
    try:
        return subprocess.run(["git", *args], cwd=script_dir, capture_output=True,
                              text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return "unknown"


def main():
    for needed in ("fixed_flow_c4.py", os.path.join("c4_scenes", "scenes.json")):
        if not os.path.isfile(os.path.join(SRC, needed)):
            raise SystemExit(f"{needed} is missing in disasteller_offline/: run make_c4_scenes.py first")
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    files = {}
    for root, _, names in os.walk(SRC):
        for name in names:
            rel = os.path.relpath(os.path.join(root, name), SRC)
            if not wanted(rel):
                continue
            dest = os.path.join(OUT_DIR, rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(os.path.join(SRC, rel), dest)
            with open(dest, "rb") as f:
                files[rel.replace("\\", "/")] = hashlib.sha256(f.read()).hexdigest()

    changed = git("status", "--porcelain", "--", "disasteller_offline")
    manifest = {
        "made": time.strftime("%Y-%m-%d %H:%M:%S"),
        "git_commit": git("rev-parse", "--short", "HEAD"),
        "uncommitted_changes_in_disasteller_offline": bool(changed and changed != "unknown"),
        "sha256": dict(sorted(files.items())),
    }
    with open(os.path.join(OUT_DIR, "disasteller_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    zip_path = shutil.make_archive(OUT_DIR, "zip", root_dir=OUT_DIR)
    print(f"{len(files)} files packed (git commit {manifest['git_commit']}, "
          f"uncommitted changes: {manifest['uncommitted_changes_in_disasteller_offline']})")
    for rel in sorted(files):
        print("  ", rel)
    print(f"Zip: {zip_path} ({os.path.getsize(zip_path) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
