"""
fixed_flow_c4.py
----------------
New file (20 Nov 2026, roadmap T2 step 5). The fixed flow (fixed_flow.py, unchanged) on one before-and-after
satellite pair, with the system's own damage facts: C4's building table and hot spots for that photo (E7 step 3),
read through the bridge, disasteller_inputs.py (its two lookups, unchanged).

Run it like the fixed flow, with DISASTELLER_FLOW=c4 and C4_SCENE=<the after-photo's file name>: the notebook
t2_step5_c4_run.ipynb does this, once per scene. The scene's before- and after-photo must be the only pictures in
Disaster_image/Local_image/, named 1_before_<name> and 2_after_<name> (the notebook puts them there).

What changes from fixed_flow.py, and why:
  1. The photos are the pair's before- and after-photo, described by the photo tool as before. There is no
     sticker question: satellite photos have none.
  2. Every report's facts start with C4's facts for the photo (c4_scenes/, made by make_c4_scenes.py):
     - the counts per damage state. On xBD photos a row is a connected patch of pixels that can hold several
       touching buildings, so there the counts are of "areas" (from 20 Nov: "damage patches"), never "buildings";
     - the hot spots (where the estimated damage is densest) and the safe areas (open ground farthest from it);
     - and the line that all of these are a model's estimates, to be checked on the ground.
     If the photo has no counts or no hot-spot entry, the run stops: missing must never read as zero.
  3. The damage grades are written by the code from the counts, never by the language model: destroyed ->
     EMS-98 Grade 5, damaged -> Grades 2 to 4, intact -> no visible damage (at most Grade 1), each with the ID
     of the EMS-98 section the search found for that grade. Grading stays with the grader (Tamanna's Part B):
     the language model describes what the table decided.
  4. The map reading is written by the code from the hot spots and safe areas, and the labelled map is the
     after-photo with them drawn on it (no model call). The fixed flow's map tool asks the model to find named
     places on a city map, which a satellite photo doesn't have.
  5. The Expert team's task says "before-and-after satellite photos" and "post-disaster", and names the event,
     since a scene can be a wildfire. The other five tasks are unchanged.
  6. One sentence more in the offline rules: every count, position and distance in the damage facts is an
     estimate, written exactly as the facts give it.
  7. (20 Nov, after the first run: fix (a), Abrar's choice) Each count comes with its share ("96 of 144 damage
     patches (67%)"), xBD rows are called damage patches, and the facts say each percentage is a share of the rows,
     not of the photo's area. In the first run the 7B wrote "96% of the area" for 96 of 144 patches. One more
     sentence in the rules asks for the facts' and the guidelines' numbers only.
  8. (20 Nov: fix (b)) Every answer's numbers are checked while the model writes, by number_check.py with T2 step
     7's rules. A wrong or unsourced number gets the section asked again, once, as a missing citation does, and a
     second answer that adds one isn't kept.
  9. (20 Nov, evening: rule version 2, before run 3) A damage count used for staff, teams, shelters or other
     resources ("54 medical personnel" for 54 intact buildings, as in run 2) is "misused", and is handled like a
     wrong number.
 10. (20 Nov, night, before run 4, Abrar's choice) The requests that asked for numbers the facts don't give no longer
     do. In run 3 the 7B, asked again, kept "54 medical personnel", because its sections asked for "the number of
     medical personnel" and "the number of emergency shelters". The C4 flow uses its own copies of tasks 2-6
     (OVERRIDES and TASK_OVERRIDES below; fixed_flow.REPORTS is unchanged and checked against them).
 11. (same) A last guard: a number still flagged after the second answer is replaced by "(number not available
     offline)" at its own place, and the run log says which ("Number guard: ...").
 12. (23 Nov, after T2b, Abrar's go) An ID guard: a bracketed guideline ID that isn't among the IDs in the section's
     facts (fixed_flow's own test for "shown") is dropped after the second answer, and the run log says which ("ID
     guard: ..."). In T2b the 7B kept three made-up IDs (INSARAG2B-5.7.1, -2, -3.10) in two staffing reports.
Unchanged: the guideline searches (the Expert team's five EMS-98 searches run one at a time, so each grade's
section is known), every section's question, size and checks, the local model, the network log and the pass rules.
"""

import copy
import json
import os
import re
import time

from PIL import Image, ImageDraw, ImageFont

import fixed_flow as ff
import number_check
from disasteller_inputs import get_building_counts, get_hotspots_and_safe_areas
from local_img_tool import folder_path, image_names, local_img_interpreter

HERE = os.path.dirname(os.path.abspath(__file__))
SCENE_DIR = os.path.join(HERE, "c4_scenes")
DB = os.path.join(SCENE_DIR, "buildings_c4_scenes.sqlite")
HOTSPOTS = os.path.join(SCENE_DIR, "hotspots_c4_scenes.json")
SCENES = json.load(open(os.path.join(SCENE_DIR, "scenes.json"), encoding="utf-8"))
SCENE = os.environ.get("C4_SCENE", "")
MAP_PATH = os.path.join(ff.REPORT_DIR, "4_anotated.png")  # the fixed flow's labelled-map file, from the run folder
FACTS_TITLE = "damage facts for the photo pair (from the system's damage model; estimates)"

ff.MODE_LINE = "Mode: offline, fixed flow, with C4's damage facts"
ff.RULES = ff.RULES + (" Every count, position and distance in the damage facts is a model's estimate: write it "
                       "exactly as the facts give it, and call it an estimate. Use only numbers that the damage facts "
                       "or the guideline sections give.")
_find_problems = ff.find_problems


def find_problems(text, facts, must_cite):
    """The fixed flow's answer checks, plus fix (b): every number from the damage facts or the passages shown."""
    return _find_problems(text, facts, must_cite) + number_check.problems(text, facts)


ff.find_problems = find_problems                                   # check_answer looks it up when it runs
_check_answer = ff.check_answer


def id_guard(text: str, facts: str) -> tuple:
    """(23 Nov, after T2b) Drops each bracketed guideline ID that isn't among the IDs in the facts the section was given
    (fixed_flow's own test for "shown"), so a made-up or unshown section is never cited. Returns the text and the IDs."""
    shown = set(ff.ID_WORD.findall(facts))
    dropped = []

    def drop(m):
        if m.group(1).startswith(ff.ID_PREFIXES) and m.group(1) not in shown:
            dropped.append(m.group(1))
            return ""
        return m.group(0)

    out = ff.BRACKETED.sub(drop, text)
    if dropped:                                                 # tidy the gap a dropped "[ID]" leaves
        out = re.sub(r"\(\s*,\s*", "(", re.sub(r",\s*\)", ")", out))      # "([A], [gone])" -> "([A])"
        out = re.sub(r"\(\s*\)", "", out)                                  # "([gone])" -> ""
        out = re.sub(r"[ \t]+([.,;:)])", r"\1", re.sub(r"[ \t]{2,}", " ", out))
    return out, dropped


def check_answer(system, prompt, text, facts, must_cite, again_start, again_end, kept_if, max_tokens, fields):
    """The fixed flow's answer check (it asks once more), then the last guards: a number still flagged is replaced by
    "(number not available offline)", and a guideline ID not shown to the section is dropped; the run log says which."""
    kept = _check_answer(system, prompt, text, facts, must_cite, again_start, again_end, kept_if, max_tokens, fields)
    guarded, replaced = number_check.guard(kept, facts)
    if replaced:
        print(f"Number guard: {fields['report']} / {fields['section']}: replaced {', '.join(replaced)}")
        ff.local_model._log_call({"kind": "number_guard", "time": round(time.time(), 3), **fields, "replaced": replaced})
    guarded, dropped = id_guard(guarded, facts)
    if dropped:
        print(f"ID guard: {fields['report']} / {fields['section']}: dropped {', '.join(dropped)}")
        ff.local_model._log_call({"kind": "id_guard", "time": round(time.time(), 3), **fields, "dropped": dropped})
    return guarded


ff.check_answer = check_answer                                     # write_section looks it up when it runs

# Requests that asked for numbers the facts don't give (run 3), in the C4 flow's own copies of tasks 2-6
NO_COUNTS = ("Staff, team, shelter and supply numbers are not in your facts: write \"not available offline\" for "
             "them, and never use a count of buildings or damage patches as a number of people, teams or shelters.")
OVERRIDES = {
    ("Emergency_team_report.txt", "Emergency shelters"):
        "where emergency shelters can go (the safe areas, and places with little or no damage), following the Sphere "
        "sections on living space and site area per person, location and access. " + NO_COUNTS,
    ("Emergency_team_report.txt", "Hospitals"):
        "where hospitals or medical points can go, and how rescued people are handed over to them (INSARAG). " + NO_COUNTS,
    ("Emergency_service_human_resource_allocation.txt", "Human Resource Requirements"):
        "the kinds of human resources needed in the different places, by category (medical personnel, rescue teams of "
        "the INSARAG types, logistics support), and why, from the damage facts and the guidelines. " + NO_COUNTS,
    ("Emergency_service_human_resource_allocation.txt", "Allocation Plan"):
        "the allocation of human resources to each affected place (the hot spots and the other places in the damage "
        "facts): the type of personnel each needs, and in which order. " + NO_COUNTS,
    ("Public_community_report.txt", "Resource Allocation"):
        "information on the human resources and logistics for the emergency services, and how they go to the "
        "different places based on current needs. " + NO_COUNTS,
    ("Reconstruction_plan.txt", "Reconstruction Needs"):
        "the human resources and materials needed for reconstruction in the different places, from the damage facts "
        "and the guidelines (repair, retrofit or rebuild); the money needed is not available offline. " + NO_COUNTS,
}
TASK_OVERRIDES = {"Emergency_team_report.txt": (
    "ensure the locations and detailed number of emergent shelter and hospital",
    "ensure the locations of emergent shelters and hospitals (their numbers are not in your facts)")}


def c4_specs() -> list:
    """Tasks 2-6 for the C4 flow: copies of fixed_flow.REPORTS[1:] (unchanged) with OVERRIDES' and TASK_OVERRIDES'
    wording. The run stops if a section or task text to change isn't found, so a change in fixed_flow shows."""
    specs, found = copy.deepcopy(ff.REPORTS[1:]), set()
    for spec in specs:
        if spec["file"] in TASK_OVERRIDES:
            old, new = TASK_OVERRIDES[spec["file"]]
            if old not in spec["task"]:
                raise SystemExit(f"fixed_flow.REPORTS changed: {spec['file']}'s task no longer says {old!r}")
            spec["task"] = spec["task"].replace(old, new)
        sections = []
        for heading, what, words in spec["sections"]:
            if (spec["file"], heading) in OVERRIDES:
                what = OVERRIDES[(spec["file"], heading)]
                found.add((spec["file"], heading))
            sections.append((heading, what, words))
        spec["sections"] = sections
    if set(OVERRIDES) - found:
        raise SystemExit(f"fixed_flow.REPORTS changed: no section {sorted(set(OVERRIDES) - found)}")
    return specs
ff.MADE_UP = ff.MADE_UP + ("number_wrong", "number_unsourced", "number_misused")   # a second answer adding one isn't kept


def units(kind: str) -> str:
    """What one row of the table is on this photo."""
    return "buildings" if kind == "outline" else "damage patches"


def c4_facts(scene: str, info: dict):
    """C4's facts for the photo as text, from the bridge's two lookups, with the counts and the hot spots."""
    counts = get_building_counts(scene, DB)
    spots = get_hotspots_and_safe_areas(scene, HOTSPOTS)
    if counts["status"] != "ok" or spots["status"] != "ok":
        raise SystemExit(f"No C4 facts for {scene}: counts {counts['status']}, hot spots {spots['status']}. "
                         "Missing facts must not read as zero.")
    many = units(info["kind"])
    lines = [f"Photo pair: {info['before_image']} (before) and {scene} (after), {info['event'].replace('_', ' ')} "
             f"({info['disaster']}); each photo is {info['width']} x {info['height']} pixels.",
             f"Damage map: {info['method']}, the system's damage model. Everything below is the model's estimate, "
             "to be checked on the ground. Positions are in pixels from the photo's top-left corner."]
    if info["kind"] == "patch":
        lines.append("On this photo the model counts connected damage patches, not single buildings: one patch can "
                     "hold several touching buildings, so the counts below are of damage patches.")
    total = counts["total"]

    def share(n):
        return f"{n} of {total} {many} ({round(100 * n / total) if total else 0}%)"

    lines += [f"Estimated {many} by damage state (each percentage is a share of the {many} in the table, not of the "
              "photo's area):",
              f"- intact: {share(counts['intact'])}",
              f"- damaged: {share(counts['damaged'])}",
              f"- destroyed: {share(counts['destroyed'])}",
              f"- all {many} in the table: {total}"]
    hot, safe = spots["hot_spots"], spots["safe_areas"]
    lines.append("Hot spots (where the estimated damage is densest; hot spot 1 is the strongest):" if hot
                 else "Hot spots: none (no zone of dense estimated damage).")
    lines += [f"- hot spot {h['rank']}: around ({h['point_xy'][0]}, {h['point_xy'][1]}), the {h['where']} of the "
              f"photo; zone of {h['area_px']} pixels" for h in hot]
    lines.append("Safe areas (open ground farthest from the estimated damage):" if safe else "Safe areas: none found.")
    lines += [f"- safe area {a['rank']}: around ({a['xy'][0]}, {a['xy'][1]}), the {a['where']} of the photo; "
              f"{a['distance_px']} pixels from the nearest estimated damage" for a in safe]
    return "\n".join(lines), counts, spots


def ems98_by_grade():
    """The five EMS-98 searches, one at a time: for each grade, the ID of that grade's own section among the results
    (EMS-98 names them ...-grade-1 to ...-grade-5), or else the first result; and every section found, in ID order."""
    first, blocks = {}, {}
    for grade, query in enumerate(ff.EMS98_SEARCHES, 1):
        found = ff.search([query])
        ids = [section_id for section_id, _ in found]
        own = [section_id for section_id in ids if section_id.endswith(f"grade-{grade}")]
        if own or ids:
            first[grade] = (own or ids)[0]
        for section_id, block in found:
            blocks.setdefault(section_id, block)
    return first, sorted(blocks.items())


def grades_text(counts: dict, first: dict, kind: str) -> str:
    """The Expert team's grade section, written by the code from the counts."""
    many = units(kind)

    def cite(*grades):
        return " ".join(f"[{first[g]}]" for g in grades if g in first)

    return "\n".join([
        f"The disaster grades of the estimated {many}, written from the damage model's table by the code, "
        "not by the language model:",
        f"- {many.capitalize()} estimated destroyed: {counts['destroyed']}: EMS-98 Grade 5, destruction {cite(5)}".rstrip(),
        f"- {many.capitalize()} estimated damaged: {counts['damaged']}: EMS-98 Grades 2 to 4, moderate to very heavy "
        f"damage {cite(2, 3, 4)}".rstrip(),
        f"- {many.capitalize()} estimated intact: {counts['intact']}: no visible damage, at most EMS-98 Grade 1, "
        f"negligible to slight damage {cite(1)}".rstrip()])


def map_reading_text(spots: dict, info: dict) -> str:
    """The map reading for the Alerts and Emergency service teams, written by the code from the hot spots."""
    lines = [f"Where the danger is on the after-photo, from the damage model's hot spots and safe areas (estimates; "
             f"positions in pixels from the top-left corner of the {info['width']} x {info['height']} photo):"]
    hot = spots["hot_spots"]
    if not hot:
        lines.append("- No hot spot: the model found no zone of dense damage.")
    for h in hot:
        what = "the most dangerous zone" if h["rank"] == 1 else "a dangerous zone"
        lines.append(f"- Hot spot {h['rank']}, {what}: around ({h['point_xy'][0]}, {h['point_xy'][1]}), "
                     f"the {h['where']} of the photo.")
    for a in spots["safe_areas"]:
        lines.append(f"- Safe area {a['rank']}: around ({a['xy'][0]}, {a['xy'][1]}), the {a['where']} of the photo, "
                     f"{a['distance_px']} pixels from the nearest estimated damage; to be checked on the ground "
                     "before use.")
    return "\n".join(lines)


def draw_map(after_path: str, spots: dict, out_path: str) -> int:
    """The labelled map: the after-photo with each hot spot (red circle, H1...) and safe area (green triangle,
    S1...) drawn at its point. Returns the number of labels drawn."""
    img = Image.open(after_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    r = max(12, img.width // 40)
    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except OSError:
        try:
            font = ImageFont.load_default(size=28)
        except TypeError:
            font = ImageFont.load_default()
    def label_at(x, y):
        """Right of the marker, or left of it near the right edge, so the label stays on the photo."""
        return (x + r + 4 if x + r + 60 < img.width else x - r - 56, max(0, y - r))

    labels = 0
    for h in spots["hot_spots"]:
        x, y = h["point_xy"]
        draw.ellipse([x - r, y - r, x + r, y + r], outline=(255, 0, 0), width=4)
        draw.text(label_at(x, y), f"H{h['rank']}", fill=(255, 0, 0), font=font)
        labels += 1
    for a in spots["safe_areas"]:
        x, y = a["xy"]
        draw.polygon([(x, y - r), (x - r, y + r), (x + r, y + r)], outline=(0, 200, 0), width=4)
        draw.text(label_at(x, y), f"S{a['rank']}", fill=(0, 200, 0), font=font)
        labels += 1
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path)
    return labels


def expert_spec(info: dict) -> dict:
    """Task 1 for a satellite pair: the fixed flow's spec, with the photo words and the grade section changed."""
    spec = copy.deepcopy(ff.REPORTS[0])
    event = f"{info['event'].replace('_', ' ')} ({info['disaster']})"
    spec["title"] = "Expert Team Report: Post-Disaster Satellite Photos, Estimated Damage and Disaster Grades"
    spec["task"] = (f"Generate descriptions of the before-and-after satellite photos of the {event}, using the photo "
                    "descriptions and the damage model's estimated facts (in the facts below). Then, give the "
                    "post-disaster grading of the estimated damage using the EMS-98 guideline sections (in the facts "
                    "below), to make a concise summary. Finally, generate a report with descriptions of the photos, "
                    "the location information, and the disaster grades.")
    spec["cite"] = []
    spec["sections"] = [
        ("Overview", "a short summary of the damage that the photos and the estimated facts show, and the disaster "
                     "grades", 120),
        ("Description of the photos and the estimated damage", "describe the before-photo and the after-photo, then "
         "what the estimated damage facts say: the counts by damage state, the hot spots and the safe areas, with "
         "their numbers exactly as the facts give them", 300),
        (ff.GRADES_HEADING, None, None),  # written by the code, from the counts
        ("Conclusion", "what the estimated damage means for the response: which parts of the photo need help first "
                       "(the hot spots), and why", 150),
    ]
    return spec


def main():
    if os.getenv("DISASTELLER_ONLINE") == "1":
        raise SystemExit("The fixed flow is offline only. Unset DISASTELLER_ONLINE.")
    if SCENE not in SCENES:
        raise SystemExit(f"Set C4_SCENE to one of {sorted(SCENES)} (it is {SCENE!r}).")
    info = SCENES[SCENE]
    after = [n for n in image_names if n.startswith("2_after")]
    if len(image_names) != 2 or len(after) != 1 or not after[0].endswith(SCENE):
        raise SystemExit(f"Disaster_image/Local_image/ must hold only 1_before_... and 2_after_{SCENE}; it holds "
                         f"{image_names}.")
    print(f"Local model: {ff.local_model.MODEL} at {ff.local_model.BASE_URL} ({ff.local_model.PROVIDER})")
    print("DisasTeller mode: offline")
    print(f"DisasTeller flow: fixed, with C4's damage facts (scene {SCENE}, {info['disaster']}, rows: {info['kind']})")
    teams = ff.team_texts()
    reports = {}
    c4_text, counts, spots = c4_facts(SCENE, info)
    print("C4's damage facts, given to every report:\n" + c4_text)

    # Task 1, Expert team: the photos, the EMS-98 searches, the grades and the map (both by the code), the sections
    spec, start = expert_spec(info), time.time()
    team = teams[spec["team"]]
    print(f"\nReport: {spec['file']}")
    photos = local_img_interpreter.func("describe the photos")
    first, ems98 = ems98_by_grade()
    facts = ff.facts_text([(FACTS_TITLE, c4_text),
                           ("photo descriptions (from the photo tool)", photos),
                           ("EMS-98 damage grades (from the guideline search; cite these IDs)",
                            "\n\n".join(block for _, block in ems98))])
    sections = {ff.GRADES_HEADING: grades_text(counts, first, info["kind"])}
    print(f"Section written: {spec['file']} / {ff.GRADES_HEADING}: by the code from the counts")
    print(f"Grades found: 3, by the code (destroyed G5, damaged G2-G4, intact at most G1; EMS-98 IDs {first})")
    drawn = draw_map(os.path.join(folder_path, after[0]), spots, MAP_PATH)
    print(f"Labelled map saved: {MAP_PATH} ({drawn} labels)")
    for heading, what, words in spec["sections"]:
        if heading not in sections:
            sections[heading] = ff.write_section(spec, team, heading, what, words, facts, sections)
    reports[spec["file"]] = ff.save_report(spec, sections)
    ff.report_finished(spec, start)

    reading = map_reading_text(spots, info)
    print("Map reading made by the code from the hot spots:\n" + reading)

    # Tasks 2-6, as in fixed_flow.main(), with C4's facts first in every report's facts, and c4_specs()' requests
    for spec in c4_specs():
        start, team = time.time(), teams[spec["team"]]
        print(f"\nReport: {spec['file']}")
        blocks = [(FACTS_TITLE, c4_text)]
        blocks += [(f"report of the {ff.TEAM_OF[name]}", reports.get(name, "")) for name in spec["uses"]]
        if spec["map_reading"]:
            blocks.append(("map reading (made by the code from the damage model's hot spots and safe areas)", reading))
        found = ff.search(spec["searches"]) if spec["searches"] else []
        if spec["ems98"]:
            found += [(i, b) for i, b in ems98 if i not in dict(found)]
        if found:
            blocks.append(("guideline sections (from the guideline search; cite these IDs)",
                           "\n\n".join(block for _, block in found)))
        facts = ff.facts_text(blocks)
        sections = {}
        for heading, what, words in spec["sections"]:
            sections[heading] = ff.write_section(spec, team, heading, what, words, facts, sections)
        reports[spec["file"]] = ff.save_report(spec, sections)
        ff.report_finished(spec, start)

    print(f"\nFixed flow finished: {len(reports)} reports in {ff.REPORT_DIR}, scene {SCENE}, grades by the code")


if __name__ == "__main__":
    main()
