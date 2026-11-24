"""
t2b_flow.py
-----------
New file (21 Nov 2026, roadmap T2b: who writes the report, our 7B or a small text model). fixed_flow_c4.py
(unchanged, with fixed_flow.py under it) on T2b's ten scenes, with the photo tool off, so that the writer is the
only difference between the two writers' runs.

What changes from fixed_flow_c4.py, and why:
  1. The scenes are T2b's ten (t2b_scenes/, made by make_t2b_scenes.py), not step 5's two.
  2. The photo tool is off. It asks the served model about the photos, which a text model can't see, and the
     roadmap's rule turns it off for both writers. Its stand-in makes no model call and gives an empty answer, so
     the Expert team's facts have no photo-description block (fixed_flow.facts_text leaves empty blocks out).
  3. The Expert team's request no longer asks for descriptions of the photos: it asks for the estimated damage from
     the facts, and its second section is "Description of the estimated damage". The run stops if
     fixed_flow_c4.expert_spec no longer has the sections being changed.
  4. Each report's first line also says the photo tool was off; it still starts "Mode: offline", as the pass rules
     ask.
Unchanged: C4's facts; the grades and the map reading, written by the code; the guideline searches; the number
check while writing and the last guard; the requests of tasks 2-6; the section sizes and checks; and the local
model's settings (temperature 0.2, seed 0), the same for both writers.

Run it like fixed_flow_c4.py, with DISASTELLER_FLOW=t2b (in the run's own copy of run_with_netlog.py) and
C4_SCENE=<one of the ten after-photos>.
"""
import json
import os

import fixed_flow_c4 as c4

ff = c4.ff
c4.SCENE_DIR = os.path.join(c4.HERE, "t2b_scenes")
c4.DB = os.path.join(c4.SCENE_DIR, "buildings_c4_scenes.sqlite")
c4.HOTSPOTS = os.path.join(c4.SCENE_DIR, "hotspots_c4_scenes.json")
c4.SCENES = json.load(open(os.path.join(c4.SCENE_DIR, "scenes.json"), encoding="utf-8"))
ff.MODE_LINE = "Mode: offline, fixed flow, with C4's damage facts; photo tool off (T2b)"
OLD_SECTIONS = ["Overview", "Description of the photos and the estimated damage", ff.GRADES_HEADING, "Conclusion"]


class PhotoToolOff:
    """Stands in for the photo tool: no model call, and an empty answer."""

    @staticmethod
    def func(*_args, **_kwargs):
        print("Photo tool: off (T2b); the facts have no photo descriptions")
        return ""


c4.local_img_interpreter = PhotoToolOff()
_expert_spec = c4.expert_spec


def expert_spec(info: dict) -> dict:
    """Task 1 without photo descriptions: the request and the first two sections ask about the estimated facts."""
    spec = _expert_spec(info)
    old = [heading for heading, _, _ in spec["sections"]]
    if old != OLD_SECTIONS:
        raise SystemExit(f"fixed_flow_c4.expert_spec changed: its sections are {old}, not {OLD_SECTIONS}")
    event = f"{info['event'].replace('_', ' ')} ({info['disaster']})"
    spec["task"] = (f"Generate a description of the estimated damage in the before-and-after satellite photos of the "
                    f"{event}, from the damage model's estimated facts (in the facts below; the photos themselves are "
                    "not described in this report). Then, give the post-disaster grading of the estimated damage using "
                    "the EMS-98 guideline sections (in the facts below), to make a concise summary. Finally, generate "
                    "a report with the estimated damage, the location information, and the disaster grades.")
    spec["sections"] = [
        ("Overview", "a short summary of the damage that the estimated facts show, and the disaster grades", 120),
        ("Description of the estimated damage", "what the estimated damage facts say: the counts by damage state, the "
         "hot spots and the safe areas, with their numbers exactly as the facts give them", 300),
        spec["sections"][2],   # the grades, written by the code
        spec["sections"][3],   # the conclusion, unchanged
    ]
    return spec


c4.expert_spec = expert_spec

if __name__ == "__main__":
    c4.main()
