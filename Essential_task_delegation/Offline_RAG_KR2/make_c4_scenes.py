"""
make_c4_scenes.py
-----------------
New file (20 Nov 2026, roadmap T2 step 5). Cuts C4's building table and hot spots (E7 step 3) down to the
scenes the reports describe, and writes them into disasteller_offline/c4_scenes/, so the upload stays small:
  - buildings_c4_scenes.sqlite: the scenes' rows, in E7 step 3's columns (H2's plus `kind`), and their
    `images` rows;
  - hotspots_c4_scenes.json: the scenes' entries of hotspots.json, unchanged;
  - scenes.json: for each scene, its before-photo, event, disaster type, source and row kind.

The scenes, by a rule fixed on 20 Nov before any report was written: of E6's clean test pairs, the
earthquake pair from the sharper photos with the most truly destroyed pixels (Turkey; DisasTeller's guidelines
are for earthquakes), and the xBD pair with the most truly destroyed pixels (Santa Rosa's wildfire; xBD's
earthquake photos have almost no destruction). Both kinds of row are covered: one building per row (outline)
and connected patches of pixels (patch).

Usage, from this folder:  python make_c4_scenes.py
"""
import json
import os
import sqlite3

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
CT = os.path.join(HERE, "..", "Champion_Task")
S3, E6 = os.path.join(CT, "E7-results", "step3"), os.path.join(CT, "E6-results", "E6")
OUT = os.path.join(HERE, "disasteller_offline", "c4_scenes")
DISASTER = {"earthquake": "earthquake", "wildfire": "wildfire", "flood": "flood", "flooding": "flood",
            "hurricane": "hurricane", "tsunami": "tsunami", "tornado": "tornado", "volcano": "volcanic eruption",
            "explosion": "explosion", "landslide": "landslide"}


def pick_scenes():
    """The rule above, from E7 step 3's per-photo file (the clean test pairs, with their true destroyed pixels)."""
    per = pd.read_csv(os.path.join(S3, "hotspots_per_image.csv"))
    quake = per[(per["source"] == "other") & per["event"].str.contains("earthquake")]
    xbd = per[per["source"] == "xBD"]
    return [quake.loc[quake["gt_destroyed_px"].idxmax(), "image"], xbd.loc[xbd["gt_destroyed_px"].idxmax(), "image"]]


def disaster_of(event):
    return next((v for k, v in DISASTER.items() if k in event), "disaster")


def main():
    scenes = pick_scenes()
    os.makedirs(OUT, exist_ok=True)
    pairs = pd.read_csv(os.path.join(E6, "test_pairs.csv")).set_index("after_image")

    db = os.path.join(OUT, "buildings_c4_scenes.sqlite")
    if os.path.exists(db):
        os.remove(db)
    src = sqlite3.connect(f"file:{os.path.join(S3, 'buildings_c4.sqlite')}?mode=ro", uri=True)
    dst = sqlite3.connect(db)
    for table in ("buildings", "images"):
        dst.execute(src.execute(f"SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '{table}'").fetchone()[0])
    for sql in src.execute("SELECT sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL"):
        dst.execute(sql[0])
    marks = ",".join("?" * len(scenes))
    for table in ("buildings", "images"):
        rows = src.execute(f"SELECT * FROM {table} WHERE image IN ({marks})", scenes).fetchall()
        dst.executemany(f"INSERT INTO {table} VALUES ({','.join('?' * len(rows[0]))})", rows)
    dst.commit()

    records = [r for r in json.load(open(os.path.join(S3, "hotspots.json"), encoding="utf-8")) if r["image"] in scenes]
    with open(os.path.join(OUT, "hotspots_c4_scenes.json"), "w", encoding="utf-8") as f:
        json.dump(records, f, indent=1)

    info = {}
    for s in scenes:
        source, method, width, height = dst.execute("SELECT source, method, width, height FROM images WHERE image = ?",
                                                    (s,)).fetchone()
        kinds = {k for (k,) in dst.execute("SELECT DISTINCT kind FROM buildings WHERE image = ?", (s,))}
        assert len(kinds) == 1, f"{s}: rows of more than one kind {kinds}"
        event = pairs.loc[s, "event"]
        info[s] = {"before_image": pairs.loc[s, "before_image"], "event": event, "disaster": disaster_of(event),
                   "source": source, "kind": kinds.pop(), "method": method, "width": width, "height": height}
    with open(os.path.join(OUT, "scenes.json"), "w", encoding="utf-8") as f:
        json.dump(info, f, indent=1)

    for s in scenes:
        counts = dict(dst.execute("SELECT class_name, COUNT(*) FROM buildings WHERE image = ? GROUP BY class_name", (s,)))
        print(f"{s}: {info[s]['disaster']}, {info[s]['source']}, rows of kind '{info[s]['kind']}' {counts}; "
              f"before-photo {info[s]['before_image']}")
    print(f"Wrote {OUT}: buildings_c4_scenes.sqlite, hotspots_c4_scenes.json, scenes.json")


if __name__ == "__main__":
    main()
