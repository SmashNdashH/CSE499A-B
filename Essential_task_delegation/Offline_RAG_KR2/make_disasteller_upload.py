"""
make_disasteller_upload.py
--------------------------
New file (3 Nov 2026, roadmap T2). Packs the DisasTeller copy that runs on the local
model into kaggle_upload/disasteller-offline/ and kaggle_upload/disasteller-offline.zip.
Upload the zip as a private Kaggle dataset named disasteller-offline. The search index
comes from the offline-rag-kr2 dataset, as before (make_kaggle_upload.py).

Included: the Python files of disasteller_offline/ and its pictures (Disaster_image/),
plus disasteller_manifest.json (each file's sha256 and the git commit), so a Kaggle run
shows which code it ran.
Left out: the six old Gemini reports and the old labelled map (kept for comparison on
the laptop only), Guidelines/ (the original's PDF, not used offline), reports/,
__pycache__/ and .env (it may hold keys).

Usage:
    python make_disasteller_upload.py
"""

import hashlib
import json
import os
import shutil
import subprocess
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(script_dir, "disasteller_offline")
OUT_DIR = os.path.join(script_dir, "kaggle_upload", "disasteller-offline")


def wanted(rel_path: str) -> bool:
    parts = rel_path.replace("\\", "/").split("/")
    if parts[0] == "Disaster_image":
        return rel_path.lower().endswith((".png", ".jpg", ".jpeg"))
    return len(parts) == 1 and rel_path.endswith(".py")


def git(*args) -> str:
    try:
        return subprocess.run(["git", *args], cwd=script_dir, capture_output=True,
                              text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return "unknown"


def main():
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
