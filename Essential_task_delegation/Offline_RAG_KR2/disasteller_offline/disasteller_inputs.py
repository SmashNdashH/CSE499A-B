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


def format_disaster_facts(image_name: str, db_path: str, hotspots_path: str) -> str:
    """
    Produce a concise factual block ready to inject into task descriptions.
    Both db_path and hotspots_path are required parameters.
    """
    b_counts = get_building_counts(image_name, db_path)
    h_data = get_hotspots_and_safe_areas(image_name, hotspots_path)

    lines = [f"=== GROUND TRUTH DAMAGE FACTS FOR IMAGE: {image_name} ==="]

    if b_counts["status"] == "ok":
        lines.extend([
            "- Building Counts:",
            f"  * Intact Buildings: {b_counts['intact']}",
            f"  * Damaged Buildings: {b_counts['damaged']}",
            f"  * Destroyed Buildings: {b_counts['destroyed']}",
            f"  * Total Evaluated Buildings: {b_counts['total']}"
        ])
    elif b_counts["status"] == "image_not_in_table":
        lines.append("- Building Counts: Image not found in building database.")
    elif b_counts["status"] == "db_not_found":
        lines.append("- Building Counts: Building database file not found.")

    lines.append("")
    lines.append("- Survivability Heatmap (Priority Analysis):")

    if h_data["status"] == "ok":
        hot_spots = h_data.get("hot_spots", [])
        if hot_spots:
            lines.append("  * Search & Rescue Hot Spots (High collapse density - deploy USAR teams here):")
            for hs in hot_spots[:3]:
                rank = hs.get("rank", 1)
                pt = hs.get("point_xy", [0, 0])
                where = hs.get("where", "unspecified")
                area = hs.get("area_px", 0)
                lines.append(f"    - Hotspot #{rank}: centroid at (x={pt[0]}, y={pt[1]}), sector: {where}, footprint: {area} px")
        else:
            lines.append("  * Search & Rescue Hot Spots: No dense collapse clusters detected.")

        safe_areas = h_data.get("safe_areas", [])
        if safe_areas:
            lines.append("  * Safe Open Areas (Isolated from rubble - deploy triage/shelter here):")
            for sa in safe_areas[:3]:
                rank = sa.get("rank", 1)
                pt = sa.get("point_xy", [0, 0])
                where = sa.get("where", "unspecified")
                dist = sa.get("dist_to_damage_px", 0)
                lines.append(f"    - Safe Zone #{rank}: centroid at (x={pt[0]}, y={pt[1]}), sector: {where}, distance from rubble: {dist} px")
        else:
            lines.append("  * Safe Open Areas: No sufficiently isolated open field identified.")
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

    print("Self-checks passed.")
