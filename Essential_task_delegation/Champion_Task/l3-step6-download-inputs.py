"""L3 step 6 (the 3B on a laptop with no GPU): choose the questions, then download only their photos.

Rule, fixed 24 Nov before any laptop run:
  - speed set: the first 10 questions of each task with no missing image, in L3's order (the same 60 L3 timed on a T4);
  - accuracy set: 50 more per task, drawn with seed 0 from the other questions with no missing image (300 in all).
Both come from L3's per_question.csv (the 4-bit 3B on a T4), so every laptop answer has a T4 answer to compare with.

Run as an account whose token is in KAGGLE_API_TOKEN (the private mirror is on acc3):
    kgpy.ps1 acc3 l3-step6-download-inputs.py
Writes questions.json, benchmark_release.json and test_images/ to D:/CSE499_laptop_test/inputs (or the folder given
as the first argument). Prints names and counts only.
"""
import ast
import json
import sys
import zipfile
from pathlib import Path

import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

MIRROR = "redwannewaz/disasterm3-bench-mirror-v2"
SPEED_PER_TASK, ACC_PER_TASK, SEED = 10, 50, 0

here = Path(__file__).resolve().parent
out = Path(sys.argv[1] if len(sys.argv) > 1 else "D:/CSE499_laptop_test/inputs")
assert out.is_absolute(), f"{out}: give an absolute folder"
out.mkdir(parents=True, exist_ok=True)

Q = pd.read_csv(here / "L3-results" / "full" / "L3" / "per_question.csv")
ok = Q[~Q["image_missing"]]
speed = ok.groupby("task").head(SPEED_PER_TASK)
acc = ok.drop(speed.index).groupby("task").sample(n=ACC_PER_TASK, random_state=SEED)
chosen = pd.concat([speed, acc])
SLUG = MIRROR.split("/")[1] + "/"            # paths inside the mirror, as L3 found them (some sit in subfolders)
names = sorted({p.replace("\\", "/").split(SLUG, 1)[1] for ps in chosen["images"] for p in ast.literal_eval(ps)})
assert len(speed) == 60 and len(acc) == 300 and not set(speed["id"]) & set(acc["id"])
(out / "questions.json").write_text(json.dumps({
    "rule": __doc__.split("Run as")[0].strip(), "pandas": pd.__version__,
    "speed": speed["id"].tolist(), "accuracy": acc["id"].tolist(), "photos": names}, indent=1), encoding="utf-8")
print(f"{len(speed)} speed and {len(acc)} accuracy questions; {len(names)} photos", flush=True)

api = KaggleApi()
api.authenticate()


def get(file_name):
    """One file of the mirror into out/, keeping its folder (the API saves test_images/x.png as out/test_images/x.png)."""
    target = out / file_name
    if target.exists():
        return
    api.dataset_download_file(MIRROR, file_name, path=str(out), quiet=True)
    for packed in (target.with_name(target.name + ".zip"), out / (target.name + ".zip")):
        if packed.exists():                  # large files can arrive zipped
            with zipfile.ZipFile(packed) as z:
                z.extractall(target.parent)
            packed.unlink()
    if not target.exists() and (out / target.name).exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        (out / target.name).replace(target)
    assert target.exists(), f"{file_name} did not arrive"


get("benchmark_release.json")
for i, name in enumerate(names, 1):
    get(name)
    if i % 100 == 0:
        print(f"  {i}/{len(names)} photos", flush=True)
print(f"done: benchmark_release.json and {len(names)} photos in {out / 'test_images'}")
