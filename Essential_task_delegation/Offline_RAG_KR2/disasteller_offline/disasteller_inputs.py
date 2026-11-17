"""
disasteller_inputs.py
---------------------
Loads verified spatial and numerical facts from Group 5 models:
  1. Building counts from SQLite table (e.g. Champion_Task/H2-results/H2/buildings.sqlite)
  2. Survivability hot spots and safe areas from JSON (e.g. Champion_Task/T1-results/T1-v3/hotspots.json)

Both paths are required parameters so the caller must explicitly provide matching models/data.
"""

import os
import json
import sqlite3


def get_building_counts(image_name: str, db_path: str) -> dict:
    """
    Fetch exact building counts for an image from the SQLite table.
    Returns a dict with 'intact', 'damaged', 'destroyed', 'total', and 'status'.
    """
    if not os.path.isfile(db_path):
        return {"intact": 0, "damaged": 0, "destroyed": 0, "total": 0, "status": "db_not_found"}

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "SELECT class_name, COUNT(*) FROM buildings WHERE image = ? GROUP BY class_name",
        (image_name,)
    )
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return {"intact": 0, "damaged": 0, "destroyed": 0, "total": 0, "status": "image_not_in_table"}

    counts = {"intact": 0, "damaged": 0, "destroyed": 0, "total": 0, "status": "ok"}
    for class_name, cnt in rows:
        c = class_name.lower()
        if c in counts:
            counts[c] = cnt
    counts["total"] = counts["intact"] + counts["damaged"] + counts["destroyed"]
    return counts


def get_hotspots_and_safe_areas(image_name: str, hotspots_path: str) -> dict:
    """
    Fetch priority hot spots and safe areas for an image from heatmap output JSON.
    """
    if not os.path.isfile(hotspots_path):
        return {"hot_spots": [], "safe_areas": [], "status": "file_not_found"}

    with open(hotspots_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        if item.get("image") == image_name:
            return {
                "hot_spots": item.get("hot_spots", []),
                "safe_areas": item.get("safe_areas", []),
                "status": "ok"
            }

    return {"hot_spots": [], "safe_areas": [], "status": "image_not_found"}


MISSING = "missing"


def _field(item: dict, key: str) -> str:
    """A field's value as text, or "missing". Never a made-up default (review 7.4)."""
    value = item.get(key)
    return MISSING if value is None else str(value)


def _point(item: dict, key: str) -> str:
    """'(x=..., y=...)' from a two-number list, or "position missing"."""
    p = item.get(key)
    if isinstance(p, (list, tuple)) and len(p) == 2 and all(isinstance(v, (int, float)) for v in p):
        return f"(x={p[0]}, y={p[1]})"
    return "position missing"


def format_disaster_facts(image_name: str, db_path: str, hotspots_path: str) -> str:
    """
    Produce a concise factual block ready to inject into task descriptions.
    Both db_path and hotspots_path are required parameters.

    The counts and hot spots are a model's estimates, so the text says so (review 7.5). It reports them and gives no
    advice of its own; what to do is the report writer's job, with the guidelines. A missing field is written as
    "missing", never as 0 (review 7.4). Positions and distances are in image pixels.
    The heatmap file's keys (T1 v3): hot spots use "point_xy" and "area_px"; safe areas use "xy" and "distance_px"
    (review 7.2).
    """
    b_counts = get_building_counts(image_name, db_path)
    h_data = get_hotspots_and_safe_areas(image_name, hotspots_path)

    lines = [f"=== MODEL-ESTIMATED DAMAGE FACTS FOR IMAGE: {image_name} ===",
             "(Counts and hot spots come from a damage model's map: estimates, not ground truth. Positions in image pixels.)"]

    if b_counts["status"] == "ok":
        lines.extend([
            "- Building Counts:",
            f"  * Intact Buildings: {b_counts['intact']}",
            f"  * Damaged Buildings: {b_counts['damaged']}",
            f"  * Destroyed Buildings: {b_counts['destroyed']}",
            f"  * Total Buildings in the table: {b_counts['total']}"
        ])
    elif b_counts["status"] == "image_not_in_table":
        lines.append("- Building Counts: Image not found in building database.")
    elif b_counts["status"] == "db_not_found":
        lines.append("- Building Counts: Building database file not found.")

    lines.append("")
    lines.append("- Survivability Heatmap:")

    if h_data["status"] == "ok":
        hot_spots = h_data.get("hot_spots", [])
        if hot_spots:
            lines.append("  * Hot Spots (where the estimated damage is densest):")
            for hs in hot_spots[:3]:
                lines.append(f"    - Hot spot #{_field(hs, 'rank')}: marked point at {_point(hs, 'point_xy')}, "
                             f"sector: {_field(hs, 'where')}, zone area: {_field(hs, 'area_px')} px")
        else:
            lines.append("  * Hot Spots: none (no zone of dense estimated damage).")

        safe_areas = h_data.get("safe_areas", [])
        if safe_areas:
            lines.append("  * Safe Open Areas (open ground farthest from the estimated damage):")
            for sa in safe_areas[:3]:
                lines.append(f"    - Safe area #{_field(sa, 'rank')}: point at {_point(sa, 'xy')}, "
                             f"sector: {_field(sa, 'where')}, distance to the nearest damage: {_field(sa, 'distance_px')} px")
        else:
            lines.append("  * Safe Open Areas: none found.")
    elif h_data["status"] == "image_not_found":
        lines.append("  * Heatmap Analysis: Image not found in hotspots data.")
    elif h_data["status"] == "file_not_found":
        lines.append("  * Heatmap Analysis: Hotspots file not found.")

    lines.append("==============================================================")
    return "\n".join(lines)


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))

    test_db = os.path.join(
        repo_root, "Essential_task_delegation", "Champion_Task", "H2-results", "H2", "buildings.sqlite"
    )
    test_hotspots = os.path.join(
        repo_root, "Essential_task_delegation", "Champion_Task", "T1-results", "T1-v3", "hotspots.json"
    )

    # Self-check 1: image in the table
    in_res = get_building_counts("hurricane_florence_00000000_post_disaster.png", test_db)
    assert in_res["status"] == "ok", f"Expected 'ok', got {in_res['status']}"
    assert in_res["total"] == 91, f"Expected total 91, got {in_res['total']}"
    assert in_res["intact"] == 90, f"Expected intact 90, got {in_res['intact']}"
    assert in_res["damaged"] == 1, f"Expected damaged 1, got {in_res['damaged']}"
    assert in_res["destroyed"] == 0, f"Expected destroyed 0, got {in_res['destroyed']}"

    # Self-check 2: image not in the table
    out_res = get_building_counts("not_in_table.png", test_db)
    assert out_res["status"] == "image_not_in_table", f"Expected 'image_not_in_table', got {out_res['status']}"
    assert out_res["total"] == 0, f"Expected total 0, got {out_res['total']}"

    # Self-check 3: missing database
    missing_res = get_building_counts("any.png", "non_existent_database.sqlite")
    assert missing_res["status"] == "db_not_found", f"Expected 'db_not_found', got {missing_res['status']}"

    # Self-check 4: hotspots in JSON
    hs_res = get_hotspots_and_safe_areas("beriut_explosion_post_32.png", test_hotspots)
    assert hs_res["status"] == "ok", f"Expected 'ok', got {hs_res['status']}"
    assert len(hs_res["hot_spots"]) > 0, "Expected at least 1 hotspot"

    # Self-check 5: hotspots image not found
    hs_out = get_hotspots_and_safe_areas("not_in_hotspots.png", test_hotspots)
    assert hs_out["status"] == "image_not_found", f"Expected 'image_not_found', got {hs_out['status']}"

    # Self-check 6 (review 7.2): safe areas print their real positions and distances from T1 v3's keys ("xy",
    # "distance_px"). beriut_explosion_post_51.png is in both test files (the table and the heatmap file share 7 images).
    facts = format_disaster_facts("beriut_explosion_post_51.png", test_db, test_hotspots)
    hs_51 = get_hotspots_and_safe_areas("beriut_explosion_post_51.png", test_hotspots)
    first_safe = hs_51["safe_areas"][0]
    assert f"point at (x={first_safe['xy'][0]}, y={first_safe['xy'][1]})" in facts, facts
    assert f"distance to the nearest damage: {first_safe['distance_px']} px" in facts, facts
    assert "(x=0, y=0)" not in facts and "Destroyed Buildings: 1" in facts, facts

    # Self-check 7 (review 7.4): a missing field reads "missing", never a made-up 0, [0, 0] or rank 1
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        partial = os.path.join(tmp, "hotspots.json")
        with open(partial, "w", encoding="utf-8") as f:
            json.dump([{"image": "x.png", "hot_spots": [{"where": "north"}], "safe_areas": [{"rank": 1}]}], f)
        text = format_disaster_facts("x.png", test_db, partial)
    assert "Hot spot #missing: marked point at position missing, sector: north, zone area: missing px" in text, text
    assert "Safe area #1: point at position missing, sector: missing, distance to the nearest damage: missing px" in text, text

    # Self-check 8 (review 7.5): the text calls the facts estimates and gives no advice of its own
    assert "GROUND TRUTH DAMAGE FACTS" not in facts and "MODEL-ESTIMATED" in facts, facts
    assert "deploy" not in facts.lower(), facts

    print(facts)
    print("Self-checks passed.")
