"""
disasteller_inputs.py
---------------------
Loads verified spatial and numerical facts from Group 5 models:
  1. Task H2: Building counts from R11 segmentation (Champion_Task/H2-results/H2/buildings.sqlite)
  2. Task T1: Survivability hot spots and safe areas from T1 v3 (Champion_Task/T1-results/T1-v3/hotspots.json)

These facts are injected directly into DisasTeller tasks so that agents never invent or hallucinate
building numbers or deployment coordinates.
"""

import os
import json
import sqlite3

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))

DEFAULT_DB_PATH = os.path.join(
    REPO_ROOT, "Essential_task_delegation", "Champion_Task", "H2-results", "H2", "buildings.sqlite"
)
DEFAULT_HOTSPOTS_PATH = os.path.join(
    REPO_ROOT, "Essential_task_delegation", "Champion_Task", "T1-results", "T1-v3", "hotspots.json"
)


def get_building_counts(image_name: str, db_path: str = DEFAULT_DB_PATH) -> dict:
    """
    Fetch exact building counts for an image from the R11 SQLite table.
    Returns a dict with 'intact', 'damaged', 'destroyed', and 'total'.
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

    counts = {"intact": 0, "damaged": 0, "destroyed": 0, "total": 0, "status": "ok"}
    for class_name, cnt in rows:
        c = class_name.lower()
        if c in counts:
            counts[c] = cnt
    counts["total"] = counts["intact"] + counts["damaged"] + counts["destroyed"]
    return counts


def get_hotspots_and_safe_areas(image_name: str, hotspots_path: str = DEFAULT_HOTSPOTS_PATH) -> dict:
    """
    Fetch priority hot spots and safe areas for an image from T1 v3 output.
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


def format_disaster_facts(image_name: str, db_path: str = DEFAULT_DB_PATH, hotspots_path: str = DEFAULT_HOTSPOTS_PATH) -> str:
    """
    Produce a concise factual block ready to inject into CrewAI task descriptions.
    """
    b_counts = get_building_counts(image_name, db_path)
    h_data = get_hotspots_and_safe_areas(image_name, hotspots_path)

    lines = [
        f"=== GROUND TRUTH DAMAGE FACTS FOR IMAGE: {image_name} ===",
        f"- Building Counts (R11 Dual-Input U-Net):",
        f"  * Intact Buildings: {b_counts['intact']}",
        f"  * Damaged Buildings: {b_counts['damaged']}",
        f"  * Destroyed Buildings: {b_counts['destroyed']}",
        f"  * Total Evaluated Buildings: {b_counts['total']}",
        "",
        "- Survivability Heatmap (T1 v3 Priority Analysis):"
    ]

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

    lines.append("==============================================================")
    return "\n".join(lines)


if __name__ == "__main__":
    # Test on a known benchmark image
    test_img = "hurricane_florence_00000000_post_disaster.png"
    print(format_disaster_facts(test_img))
