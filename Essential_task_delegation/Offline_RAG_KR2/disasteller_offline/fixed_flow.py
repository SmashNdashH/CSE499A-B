"""
fixed_flow.py
-------------
New file (10 Nov 2026, after Kaggle practice run 4). DisasTeller's "fixed flow": the fallback
the README wrote down on 3 Nov, before any run ("the code calls the tools, and the model only
writes each section"). The README's expectation for run 4 said to decide on it if a report
stayed short after the model was asked again; in run 4 one did (final_answers_kept_short = 1).

Why: in practice runs 2-4 the 7B could not lead CrewAI's tool loop, and it failed in a new way
each time. Run 2: it called the same tools again and again until a message was too long.
Run 3: it wrote a sentence about the report instead of the report. Run 4: it sent the same
search again and again until the step limit, and CrewAI saved that search request as the
report; asked again for a full report, it repeated its short answer.

Run with run_with_netlog.py and DISASTELLER_FLOW=fixed (the Kaggle notebook does this).
DisasterManagement_teamwork_simulation.py, the agent version, is unchanged and can still run.

What stays the same as the agent version:
  - the six reports, their order and their files (reports/offline/);
  - the four teams: each team's role, goal and backstory are read from the main script when
    this runs (so the words can't drift apart), and the model gets them as CrewAI gives them:
    "You are <role>. <backstory>\nYour personal goal is: <goal>";
  - what each task asks for, and the headings of tasks 4-6. Tasks 1-3 have no headings in the
    main script, so their sections are the parts their task text asks for;
  - the tools and their questions to the model: the photo tool, the map reading, the map
    labels and the guideline search. This code calls the same functions;
  - the local model and its settings (local_model.py), the network log and the pass rules.

What changes:
  - The code calls the tools, always in the same order (below). The model never chooses a
    tool, and never writes CrewAI's "Thought / Action / Final Answer" format.
  - The guideline searches are fixed: one per topic that the task text names, in the
    guidelines' words (the SEARCHES lists below).
  - The model writes each report one section at a time, from the facts it is given: the tool
    results, the reports of the earlier teams that its task names, and the sections of this
    report it has already written. Each section asks for a size in words; the task texts'
    "around 2000 words" (or 4000) is left out.
  - The grades: for the Expert team the model writes one line per photo,
    "<place name>: G<1-5> - <why>", from the photo descriptions and the EMS-98 grade sections.
    The code reads the grades from these lines and sends them to the map tool, as task 1 asks.
  - No example names or grades in what the model is told. The main script's examples
    "street A: G1, street B: G4" (task 1), "Area A, B, C" (task 4), "such as 3" (task 3) and
    "[SPHERE-3-p1]" (the offline rules) are left out: in runs 3 and 4 the model copied
    examples as if they were facts (run 4's grades were the example in the map tool's
    description, word for word).
  - Every report gets the offline rules (only tasks 3-6 had them) and starts with
    "Mode: offline, fixed flow".
  - CrewAI itself does not run: with no tool to choose, it would only add its answer format,
    which caused two of run 4's problems. The tools are still CrewAI tools; this code calls
    their functions directly.

The order: the photos -> the EMS-98 searches -> the grades -> the map labels -> the rest of the
Expert report -> the map reading -> the Alerts report -> the Emergency service report ->
human resource allocation -> the public report -> the reconstruction plan. For each report:
its searches, then its sections, in the order of the report.

16 Nov 2026, the quality-fix run (README section "Quality-fix run"). Four changes, each for a
problem found in the proof run's reports and traced in its llm_calls.jsonl:
  1. The map reading is made by the code from the Expert team's grades: the places from the
     highest grade down, with EMS-98's name for each grade. The model is no longer asked to read
     the map. In the proof run it was sent the plain map (since 3 Nov the labelled map is saved
     next to the reports, so the map reading never saw the labels) and the text "South Central
     Asaichi Street: G5", and it answered that there are no areas with G5. Three reports
     repeated that as "no high-risk zones".
  2. One more short question per photo: the words on its sticker or sign. The grade lines take
     each place name from these words. In the proof run the bridge photo's description had no
     name, though its sticker says "Concrete Bridge", so the bridge got no grade.
  3. The public report no longer asks the model for contact information, and every section is
     checked for a contact detail that its facts don't give. In the proof run the public report
     gave the hotline "123456789".
  4. Ten sections and the grade lines must cite the guideline sections they use, and every
     section is checked for IDs that weren't shown to it and IDs without brackets. In the proof
     run only the Expert report cited, one of its IDs had not been shown to it, and the
     reconstruction plan wrote 6 IDs without brackets.
  For 3 and 4: a section with one of these problems is asked once more, with the model's first
  answer and a note on what to change (local_model.ask_text_again). The second answer is kept
  unless it adds a made-up item (a contact detail, or an ID that wasn't shown) or is less than
  half as long (for the grade lines: unless fewer grades can be read from it). Every check goes
  into llm_calls.jsonl (kind "check"); the run log says "Section asked again", and "Section kept
  with problems" if a problem is left.
  Unchanged: the 18 searches, the size asked for each section, the photo descriptions, the map
  labels and the local model's settings.
"""

import ast
import os
import re
import time

# As in the main script: CrewAI's usage telemetry, trace upload and version check stay off.
os.environ.setdefault("CREWAI_DISABLE_TELEMETRY", "true")
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
os.environ.setdefault("CREWAI_DISABLE_VERSION_CHECK", "true")

import local_img_tool  # noqa: E402  (its photos, for the sticker question: 16 Nov)
import local_model  # noqa: E402
from global_annotation_tool import global_map_annotation  # noqa: E402
from local_img_tool import local_img_interpreter  # noqa: E402
from pdf_search_tool import offline_pdf_search_tool  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
MAIN_SCRIPT = os.path.join(HERE, "DisasterManagement_teamwork_simulation.py")
MODE_LINE = "Mode: offline, fixed flow"
REPORT_DIR = os.path.join("reports", "offline")  # from the folder you run in, as in the main script

RULES = ("Work offline: use only the facts given to you below, and do not make up places or facts "
         "that are not in them. Where a guideline section supports what you write, cite its ID in "
         "square brackets, exactly as it is written below. If something needs data you do not have, "
         "such as costs, budgets, staff numbers from past disasters, population counts or contact "
         "details, write \"not available offline\" instead of estimating it.")

SECTION_PROMPT = """{task}

{rules}

You write the report "{title}" for your team, one section at a time.

{facts}

=== The report so far ===
{so_far}

=== Your job now ===
Write only the section "{heading}" of the report: {what}.
{cite}Write about {words} words of plain text. Do not write the heading, and do not write other sections."""
# For the sections that must cite (each report's "cite" list, 16 Nov); empty for the others, so
# their question is word for word the proof run's.
CITE_LINE = ("Cite the guideline sections you use, by their IDs in square brackets, exactly as the IDs are "
             "written above.\n")

GRADES_HEADING = "Disaster grade of each location"
GRADES_PROMPT = """Give each place in the photos its disaster grade, using the EMS-98 damage grades in the guideline sections above (Grade 1 is G1, and so on up to Grade 5, G5).
Write one line per photo, in the order of the photos, in this form:
<place name>: G<grade from 1 to 5> - <why, in one or two sentences, citing the ID of the grade's guideline section in square brackets>
Take each place name from the words on the photo's sticker or sign (in the facts above). If a photo has no sticker or sign, take the place name from its description, or else use the photo's file name. Use only what the facts say. Write nothing else."""

EMS98_SEARCHES = [f"EMS-98 classification of damage to masonry buildings Grade {n} {name}" for n, name in (
    (1, "negligible to slight damage"), (2, "moderate damage"), (3, "substantial to heavy damage"),
    (4, "very heavy damage"), (5, "destruction"))]

EXPERT, ALERTS, EMERGENCY = "Expert_team_report.txt", "Alerts_team_report_for_social_media.txt", "Emergency_team_report.txt"
TEAM_OF = {EXPERT: "Expert team", ALERTS: "Alerts team", EMERGENCY: "Emergency service team"}

# One entry per report, in the order of the main script's tasks 1-6.
#   uses:     the earlier reports its task text names ("the output from task1 ...")
#   searches: the fixed guideline searches, one per topic its task text names
#   sections: (heading, what to write, about how many words)
#   cite:     (16 Nov) the sections that must cite: those whose task text names the guidelines for
#             that part of the report. Every section is checked for IDs that weren't shown to it.
REPORTS = [
    {
        "file": EXPERT, "team": "Expert team",
        "title": "Expert Team Report: Post-Earthquake Images, Locations and Disaster Grades",
        "task": ("Generate descriptions for post-earthquake images, using the photo descriptions and the "
                 "location stickers in the images (in the facts below). Then, get post-earthquake grading with "
                 "their location name using the EMS-98 guideline sections (in the facts below), to make a "
                 "concise summary. Finally, generate a report with description for the images, region location "
                 "information, and disaster grade."),
        "uses": [], "map_reading": False, "searches": EMS98_SEARCHES, "ems98": False,
        "cite": [],  # the grade lines must cite; main() checks them
        "sections": [
            ("Overview", "a short summary of the earthquake damage in the places in the photos, and their "
                         "disaster grades", 120),
            ("Description of the images and locations", "describe each photo and the place on its sticker in "
             "detail, one paragraph per photo, in the order of the photos", 300),
            (GRADES_HEADING, None, None),  # written first, by write_grades()
            ("Conclusion", "what the grades mean for the response: which places need help first, and why", 150),
        ],
    },
    {
        "file": ALERTS, "team": "Alerts team",
        "title": "Alerts Team Report: Danger Area Alert and Social Media News",
        "task": "Analyse the report of the Expert team, and generate danger area alerting and social media news "
                "for the disaster.",
        "uses": [EXPERT], "map_reading": True, "searches": [], "ems98": False,
        "cite": [],  # no guideline search
        "sections": [
            ("Danger area alert", "the dangerous areas people must avoid: each damaged place with its location and "
             "disaster grade, and the potentially dangerous areas from the map reading", 200),
            ("Social media news", "a news post for social media about the damaged places: what happened in each "
             "place, its location and its disaster grade", 200),
        ],
    },
    {
        "file": EMERGENCY, "team": "Emergency service team",
        "title": "Emergency Service Team Report: Shelters, Hospitals and Transportation Recovery",
        "task": ("Analyse the reports of the Expert team and the Alerts team. Then, ensure the locations and "
                 "detailed number of emergent shelter and hospital, using the map reading and the guideline "
                 "sections (Sphere for shelter: living space and site area per person, location and access; "
                 "INSARAG for handing rescued people over to hospitals). Also, confirm which place needs "
                 "immediate transportation recovery."),
        "uses": [EXPERT, ALERTS], "map_reading": True, "ems98": False,
        "cite": ["Emergency shelters", "Hospitals"],
        "searches": ["Sphere covered living space per person",
                     "Sphere settlement site area per person location and access",
                     "INSARAG handover of rescued patients to medical teams and hospitals"],
        "sections": [
            ("Emergency shelters", "the locations and the number of emergency shelters, in places with little or "
             "no damage, following the Sphere sections on living space and site area per person, location and "
             "access", 200),
            ("Hospitals", "the locations and the number of hospitals or medical points, and how rescued people are "
             "handed over to them (INSARAG)", 200),
            ("Immediate transportation recovery", "which places need their roads or bridges reopened first, and "
             "why", 150),
        ],
    },
    {
        "file": "Emergency_service_human_resource_allocation.txt", "team": "Assignment team",
        "title": "Emergency Service Team Human Resource Allocation Report",
        "task": ("Analyse the reports of the Expert team, the Alerts team and the Emergency service team. "
                 "Generate a report for the emergency service team human resource allocation. Use the guideline "
                 "sections for INSARAG (rescue team types, ASR levels, worksite triage and priorities, shifts)."),
        "uses": [EXPERT, ALERTS, EMERGENCY], "map_reading": False, "ems98": False,
        "cite": ["Human Resource Requirements", "Allocation Plan"],
        "searches": ["INSARAG light medium and heavy USAR team types",
                     "INSARAG ASR levels assessment search and rescue",
                     "INSARAG worksite triage and priorities",
                     "INSARAG rescue team shifts and rotation"],
        "sections": [
            ("Introduction", "a brief overview of the disaster and its impact", 120),
            ("Current Situation", "a summary of the damage and the immediate needs", 150),
            ("Human Resource Requirements", "a detailed breakdown of the human resources required in the "
             "different places, by category, such as the number of medical personnel, the number of rescue "
             "teams and logistics support", 200),
            ("Allocation Plan", "the allocation of human resources to each affected place, by its real name from "
             "the Expert team's report: the number and type of personnel required, and the current deployment "
             "status", 250),
            ("Challenges and Considerations", "potential challenges in resource allocation, such as "
             "transportation issues and local restrictions, and how the allocation can change as needs evolve "
             "and the field gives feedback", 150),
            ("Recommendations", "suggested adjustments to the current allocation, based on the observed needs "
             "and gaps, and additional resources or support if necessary", 150),
            ("Conclusion", "a summary of the key findings and next steps, with emphasis on the ongoing efforts "
             "and future plans", 120),
        ],
    },
    {
        "file": "Public_community_report.txt", "team": "Assignment team",
        "title": "Public Community Report",
        "task": ("Analyse the reports of the Expert team, the Alerts team and the Emergency service team, and "
                 "generate a report to inform the public communities. Use the guideline sections for shelter "
                 "and household items (Sphere) and rescue operations (INSARAG)."),
        "uses": [EXPERT, ALERTS, EMERGENCY], "map_reading": False, "ems98": False,
        "cite": ["Resource Allocation", "Public Advisory"],
        "searches": ["Sphere emergency shelter for displaced households",
                     "Sphere household items",
                     "INSARAG rescue operations"],
        "sections": [
            ("Introduction", "a summary of the disaster, the affected areas, and the initial observations of the "
             "Expert team and the Alerts team", 150),
            ("Current Situation", "a detailed description of the damage and of the emergency services being "
             "provided, from the Emergency service team's report", 200),
            ("Resource Allocation", "information on the human resources and logistics for the emergency services, "
             "including how resources are being allocated to different places based on current needs", 150),
            ("Public Advisory", "instructions and advice for the public on how to stay safe, access emergency "
             "services, and cooperate with ongoing operations", 200),
            # 16 Nov: was "... and contact information for further assistance". The proof run's
            # answer gave a made-up hotline, although the offline rules ask for "not available offline".
            ("Organizational Operation", "an overview of your organization's role and operations, and how people "
             "can get further help; no contact detail is in your facts, so write that contact details are not "
             "available offline", 120),
            ("Conclusion", "encouraging words and reassurances to the community", 100),
        ],
    },
    {
        "file": "Reconstruction_plan.txt", "team": "Assignment team",
        "title": "Reconstruction Plan Report",
        "task": ("Analyse the reports of the Expert team, the Alerts team and the Emergency service team, and "
                 "generate a reconstruction plan report, aiming to submit it to the government and policy maker. "
                 "Use the guideline sections for Sphere (repair, retrofit or rebuild, debris, building codes) and "
                 "EMS-98 (damage grades). Every cost and budget figure is \"not available offline\"."),
        "uses": [EXPERT, ALERTS, EMERGENCY], "map_reading": False,
        "searches": ["Sphere repair retrofit or rebuild damaged houses",
                     "Sphere debris removal",
                     "Sphere technical assistance building codes and construction practices"],
        "ems98": True,  # also the EMS-98 grade sections found for the Expert team (no new search)
        "cite": ["Assessment of Damage", "Reconstruction Needs", "Plan of Action", "Appendices"],
        "sections": [
            ("Executive Summary", "an overview of the disaster impact and the immediate response efforts", 150),
            ("Assessment of Damage", "a detailed analysis of the damage, with the data from the Expert team's "
             "report and an assessment of each affected place", 250),
            ("Reconstruction Needs", "the human resources and materials needed for reconstruction in the different "
             "places, from the damage facts and the guidelines (repair, retrofit or rebuild); the money needed "
             "is not available offline", 250),
            ("Plan of Action", "a detailed plan of the reconstruction steps, including their order, resource "
             "allocation, and coordination with local authorities, following the guidelines", 250),
            ("Recommendations", "suggestions for policy and funding to support effective and efficient "
             "reconstruction", 150),
            ("Appendices", "supporting data: the disaster grade of each place, the labelled map, and the guideline "
             "sections used", 120),
        ],
    },
]


def team_texts() -> dict:
    """Each team's role, goal and backstory, read from the main script (which is not run), so
    they are exactly the words the agent version uses."""
    tree = ast.parse(open(MAIN_SCRIPT, encoding="utf-8").read())
    teams = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and getattr(node.func, "id", None) == "Agent":
            texts = {k.arg: k.value.value for k in node.keywords
                     if k.arg in ("role", "goal", "backstory") and isinstance(k.value, ast.Constant)}
            teams[texts["role"]] = texts
    return teams


def system_message(team: dict) -> str:
    """The team's role, as CrewAI 1.15.2 writes it ("role_playing" in its translations/en.json)."""
    return f"You are {team['role']}. {team['backstory']}\nYour personal goal is: {team['goal']}"


RESULT_START = re.compile(r"^\[([A-Za-z0-9][A-Za-z0-9._-]*)\] \(", re.MULTILINE)


def split_results(text: str) -> list:
    """The search tool's text as (ID, block) pairs: each result starts with "[ID] ("."""
    starts = [m.start() for m in RESULT_START.finditer(text)]
    return [(RESULT_START.match(text, s).group(1), text[s:e].strip())
            for s, e in zip(starts, starts[1:] + [len(text)])]


def search(queries: list) -> list:
    """Run the fixed searches with the search tool; each section found once, in the order found."""
    found = {}
    for query in queries:
        for section_id, block in split_results(offline_pdf_search_tool.func(query)):
            found.setdefault(section_id, block)
    return list(found.items())


def facts_text(blocks: list) -> str:
    return "\n\n".join(f"=== Facts: {title} ===\n{text.strip()}" for title, text in blocks if text)


def so_far_text(sections: dict, order: list) -> str:
    written = [f"## {h}\n{sections[h]}" for h in order if h in sections]
    return "\n\n".join(written) if written else "(No section is written yet.)"


def clean(answer: str, heading: str) -> str:
    """The model's answer without a first line that only repeats the heading."""
    text = answer.strip()
    lines = text.splitlines()
    if lines and re.sub(r"[#*_:\s]+", " ", lines[0]).strip().lower() == heading.lower():
        text = "\n".join(lines[1:]).strip()
    return text


GRADE_LINE = re.compile(r"^[\s>*#\-]*(?:\d+[.)]\s*)?[*_]*(?P<name>[^:\n]{2,80}?)[*_]*\s*:\s*[*_]*\s*"
                        r"(?:Grade\s*|G\s*)(?P<grade>[1-5])\b", re.MULTILINE)


def read_grades(answer: str) -> list:
    """(place, grade) from lines such as "Hama Street: G4 - ...", each place once."""
    grades = []
    for m in GRADE_LINE.finditer(answer):
        name = m.group("name").strip(" *_-")
        if name and name.lower() not in {n.lower() for n, _ in grades}:
            grades.append((name, int(m.group("grade"))))
    return grades


# ─── 16 Nov 2026, the quality-fix run (see the top of this file) ────────────

# Change 2: the words on each photo's sticker or sign, one short question per photo
STICKER_PROMPT = ("Read the sticker or sign in this photo. Write only the words on it, exactly as they are "
                  "written. If the photo has no sticker or sign, write: none")
STICKER_FACTS = "the words on each photo's sticker or sign (from a separate question about each photo)"
NO_STICKER = re.compile(r"^(?:none|no\b|n/?a\b|there (?:is|are) no|(?:the|this) photo has no)", re.IGNORECASE)
STICKER_SAYS = re.compile(r"^(?:the\s+)?(?:words?|text|sticker|sign)\b[^:\"“]*?(?:\bsays\b|\breads\b|\bis\b|\bare\b|:)"
                          r"\s*", re.IGNORECASE)


def sticker_words(answer: str):
    """The sticker's words in the model's answer, or None: no sticker, an error, or a sentence
    (more than 8 words) instead of the words."""
    text = " ".join(answer.split())  # one line: a sticker may have two
    if not text or text.startswith("An error occurred") or NO_STICKER.match(text):
        return None
    quoted = re.search(r"[\"“]([^\"”]{2,80})[\"”]", text)
    text = (quoted.group(1) if quoted else STICKER_SAYS.sub("", text)).strip(" .,:;!*_\"'“”")
    if not text or NO_STICKER.match(text) or len(text.split()) > 8:
        return None
    return text


def read_stickers() -> dict:
    """{photo's file name: the words on its sticker or sign, or None}, in the photo tool's order."""
    stickers = {}
    for name, image in zip(local_img_tool.image_names, local_img_tool.encoded_images):
        answer = local_model.ask_with_images(STICKER_PROMPT, [image], max_tokens=40)
        stickers[name] = sticker_words(answer)
        local_model._log_call({"kind": "sticker", "time": round(time.time(), 3), "photo": name,
                               "words": stickers[name]})
        print(f"Sticker words ({name}): {stickers[name] or 'none'} (the model's answer: {answer.strip()[:100]!r})")
    return stickers


def stickers_text(stickers: dict) -> str:
    return "\n".join(f"{name}: {words or 'none'}" for name, words in stickers.items())


# Change 1: the map reading, made by the code from the grades
GRADE_WORDS = {1: "negligible to slight damage", 2: "moderate damage", 3: "substantial to heavy damage",
               4: "very heavy damage", 5: "destruction"}  # EMS-98's own names of its five grades


def map_reading_text(grades: list) -> str:
    if not grades:
        return "Not available: no grade could be read from the Expert team's grade lines."
    ranked = sorted(grades, key=lambda place: -place[1])  # the same grade: the Expert team's order
    lines = ["The places in the photos, from the most to the least dangerous (a higher EMS-98 grade means "
             "heavier damage):"]
    lines += [f"- {name}: G{grade}, {GRADE_WORDS[grade]}" for name, grade in ranked]
    top = ranked[0][1]
    if top >= 3:
        lines.append(f"The most dangerous: {', '.join(n for n, g in ranked if g == top)} (G{top}).")
    else:
        lines.append(f"No place has grade G3 or higher; the highest grade is G{top}.")
    return "\n".join(lines)


# Changes 3 and 4: the checks of each answer, and one more question if a check fails
ID_PREFIXES = ("EMS98-", "XBD-", "IWGSEM-", "INSARAG3-", "INSARAG2B-", "SPHERE-")  # as in check_run.py
BRACKETED = re.compile(r"\[([A-Za-z0-9][A-Za-z0-9._-]*)\]")
ID_WORD = re.compile(r"\b(?:EMS98|XBD|IWGSEM|INSARAG3|INSARAG2B|SPHERE)-[A-Za-z0-9._-]*[A-Za-z0-9]")
PHONE = re.compile(r"(?<!\w)\+?\(?\d[\d ().-]{4,}\d(?!\w)")  # as in compare_reports.py
CALL_NUMBER = re.compile(r"\b(?:call|calling|dial|phone|telephone|tel|hotline|sms)\b\W+(?:[A-Za-z]+\W+){0,2}?"
                         r"(\+?\d[\d -]*\d)\b", re.IGNORECASE)
EMAIL = re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b")
WEB = re.compile(r"\bhttps?://\S+|\bwww\.\S+|(?<![@.\w])[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*"
                 r"\.(?:com|org|gov|net|int|edu|jp|info|io)\b", re.IGNORECASE)
DATE = re.compile(r"\d{4}-\d{2}-\d{2}")
MADE_UP = ("contact", "id_not_shown")  # the problems that add something false; the others leave something out


def contact_details(text: str, facts: str) -> list:
    """Phone numbers (6+ digits, or 3+ digits after "call", "hotline" and the like), e-mail and
    web addresses, that the facts don't give."""
    found = [m.group(0).strip(" ().-") for m in PHONE.finditer(text)]
    found = [s for s in found if sum(c.isdigit() for c in s) >= 6 and not DATE.fullmatch(s)]
    found += [m.group(1) for m in CALL_NUMBER.finditer(text) if sum(c.isdigit() for c in m.group(1)) >= 3]
    found += [m.group(0) for m in EMAIL.finditer(text)]
    found += [m.group(0).rstrip(".,;:)") for m in WEB.finditer(text)]
    return list(dict.fromkeys(s for s in found if s and s not in facts))


def find_problems(text: str, facts: str, must_cite: bool) -> list:
    """What must change in an answer, as (kind, items, note to the model). An ID is "shown" if it
    is anywhere in the facts the model was given, as compare_reports.py counts it."""
    problems = []
    contacts = contact_details(text, facts)
    if contacts:
        problems.append(("contact", contacts, f"Leave out {', '.join(contacts)}: the facts above give no contact "
                         "detail. Where one is needed, write \"not available offline\"."))
    shown = set(ID_WORD.findall(facts))
    cited = [c for c in BRACKETED.findall(text) if c.startswith(ID_PREFIXES)]
    rest = BRACKETED.sub(lambda m: " " if m.group(1).startswith(ID_PREFIXES) else m.group(0), text)
    bare = list(dict.fromkeys(ID_WORD.findall(rest)))
    not_shown = list(dict.fromkeys(i for i in cited + bare if i not in shown))
    if not_shown:
        problems.append(("id_not_shown", not_shown, "Cite only the guideline sections given above. These IDs are "
                         f"not among them: {', '.join(not_shown)}."))
    bare_shown = [i for i in bare if i in shown]
    if bare_shown:
        problems.append(("id_without_brackets", bare_shown, "Write each of these IDs in its own square brackets, "
                         f"exactly as it is written above: {', '.join(bare_shown)}."))
    if must_cite and not bare_shown and not any(c in shown for c in cited):
        problems.append(("no_citation", [], "Cite the guideline sections you use, by their IDs in square brackets, "
                         "exactly as the IDs are written above."))
    return problems


def describe(problems: list) -> list:
    return [kind + (f": {', '.join(items)}" if items else "") for kind, items, _ in problems]


def made_up(problems: list) -> set:
    return {(kind, item) for kind, items, _ in problems if kind in MADE_UP for item in items}


def check_answer(system, prompt, text, facts, must_cite, again_start, again_end, kept_if, max_tokens, fields):
    """Check one answer (already cleaned). If a check fails, ask once more, and keep the second
    answer unless it adds a made-up item or kept_if(first, second) is false. Returns the answer kept."""
    label = f"{fields['report']} / {fields['section']}"
    problems = [] if text.startswith("An error occurred") else find_problems(text, facts, must_cite)
    record = {"kind": "check", "time": round(time.time(), 3), **fields, "must_cite": must_cite,
              "problems": describe(problems), "asked_again": bool(problems), "kept": "first"}
    if problems:
        print(f"Section asked again: {label}: {'; '.join(describe(problems))}")
        note = "\n".join([again_start] + [f"- {n}" for _, _, n in problems] + [again_end])
        again = clean(local_model.ask_text_again(system, prompt, text, note, max_tokens=max_tokens,
                                                 problems=describe(problems), **fields), fields["section"])
        if not again or again.startswith("An error occurred"):
            record["why_first"] = "no answer to the second question"
        else:
            again_problems = find_problems(again, facts, must_cite)
            if made_up(again_problems) - made_up(problems):
                record["why_first"] = "the second answer adds: " + "; ".join(describe(again_problems))
            elif not kept_if(text, again):
                record["why_first"] = "the second answer is too short"
            else:
                text, problems, record["kept"] = again, again_problems, "second"
        if "why_first" in record:
            print(f"Section kept as first written: {label}: {record['why_first']}")
        if problems:
            print(f"Section kept with problems: {label}: {'; '.join(describe(problems))}")
    record["problems_left"] = describe(problems)
    local_model._log_call(record)
    return text


def write_section(spec, team, heading, what, words, facts, sections):
    order = [h for h, _, _ in spec["sections"]]
    must_cite = heading in spec["cite"]
    prompt = SECTION_PROMPT.format(task=spec["task"], rules=RULES, title=spec["title"], facts=facts,
                                   so_far=so_far_text(sections, order), heading=heading, what=what,
                                   cite=CITE_LINE if must_cite else "", words=words)
    start = time.time()
    max_tokens = max(400, words * 3)
    fields = {"report": spec["file"], "section": heading}
    answer = local_model.ask_text(system_message(team), prompt, max_tokens=max_tokens, **fields)
    text = check_answer(system_message(team), prompt, clean(answer, heading), facts, must_cite,
                        f'Write the section "{heading}" again, with these changes:',
                        f"Keep the rest as it is. Write only the section, about {words} words of plain text, "
                        "with no heading.",
                        lambda first, second: len(second.split()) >= len(first.split()) / 2, max_tokens, fields)
    print(f"Section written: {spec['file']} / {heading}: {len(text.split())} words in {time.time() - start:.1f} s")
    return text


def save_report(spec, sections):
    order = [h for h, _, _ in spec["sections"]]
    body = f"# {spec['title']}\n\n" + "\n\n".join(f"## {h}\n{sections[h]}" for h in order if h in sections)
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(os.path.join(REPORT_DIR, spec["file"]), "w", encoding="utf-8") as f:
        f.write(f"{MODE_LINE}\n\n{body}\n")
    return body


def report_finished(spec, start):
    seconds = time.time() - start
    print(f"Report finished: {spec['file']} after {seconds / 60:.1f} min")
    local_model._log_call({"kind": "task", "time": round(time.time(), 3), "report": spec["file"],
                           "agent": spec["team"], "seconds": round(seconds, 1)})


def main():
    if os.getenv("DISASTELLER_ONLINE") == "1":
        raise SystemExit("The fixed flow is offline only. Unset DISASTELLER_ONLINE, or run the agent version.")
    print(f"Local model: {local_model.MODEL} at {local_model.BASE_URL} ({local_model.PROVIDER})")
    print("DisasTeller mode: offline")
    print("DisasTeller flow: fixed (the code calls the tools in a fixed order; the model writes each section)")
    teams = team_texts()
    reports = {}  # file -> report text without its mode line, for the later teams

    for spec in REPORTS:  # a section named in "cite" must exist, or its citations would never be checked
        missing = set(spec["cite"]) - {h for h, _, _ in spec["sections"]}
        if missing:
            raise SystemExit(f"{spec['file']}: no section named {sorted(missing)} (its 'cite' list)")

    # Task 1, Expert team: photos, stickers, EMS-98 searches, grades, map labels, then the other sections
    spec, start = REPORTS[0], time.time()
    team = teams[spec["team"]]
    print(f"\nReport: {spec['file']}")
    photos = local_img_interpreter.func("describe the photos")
    stickers = read_stickers()  # 16 Nov, after the photo descriptions, so those are asked as before
    ems98 = sorted(search(spec["searches"]))  # in grade order: masonry grades 1-5, then the others
    ems98_text = "\n\n".join(block for _, block in ems98)
    facts = facts_text([("photo descriptions (from the photo tool)", photos),
                        (STICKER_FACTS, stickers_text(stickers)),
                        ("EMS-98 damage grades (from the guideline search; cite these IDs)", ems98_text)])
    grades_prompt = (f"{spec['task']}\n\n{RULES}\n\n{facts}\n\n=== Your job now ===\n{GRADES_PROMPT}")
    t = time.time()
    fields = {"report": spec["file"], "section": GRADES_HEADING}
    answer = local_model.ask_text(system_message(team), grades_prompt, max_tokens=600, **fields)
    answer = check_answer(system_message(team), grades_prompt, clean(answer, GRADES_HEADING), facts, True,
                          "Write the grade lines again, with these changes:",
                          "Keep the rest as it is: one line per photo, in the same form. Write nothing else.",
                          lambda first, second: len(read_grades(second)) >= len(read_grades(first)), 600, fields)
    grades = read_grades(answer)
    summary = ", ".join(f"{name}: G{grade}" for name, grade in grades)
    print(f"Section written: {spec['file']} / {GRADES_HEADING}: {len(answer.split())} words in {time.time() - t:.1f} s")
    print(f"Grades found: {len(grades)}: {summary or 'none'}")
    sections = {GRADES_HEADING: answer + "\n\nConcise summary (sent to the map annotation "
                f"tool): {summary or 'no grade could be read from the lines above'}."}
    if summary or not answer.startswith("An error occurred"):
        # no grade read: the map tool gets the grade lines as they are, as an agent would send them
        status = global_map_annotation.func(summary or answer[:1500])
    else:
        status = "not called: the model gave no grade lines"
    print(f"Map tool: {status[:300]}")
    for heading, what, words in spec["sections"]:
        if heading not in sections:
            sections[heading] = write_section(spec, team, heading, what, words, facts, sections)
    reports[spec["file"]] = save_report(spec, sections)
    report_finished(spec, start)

    # The map reading, for the Alerts and Emergency service teams (both tasks name the map). Since
    # 16 Nov it is made by the code from the grades; the model is no longer asked to read the map.
    map_reading = map_reading_text(grades)
    print("Map reading made by the code from the grades:\n" + map_reading)

    # Tasks 2-6
    for spec in REPORTS[1:]:
        start, team = time.time(), teams[spec["team"]]
        print(f"\nReport: {spec['file']}")
        blocks = [(f"report of the {TEAM_OF[name]}", reports.get(name, "")) for name in spec["uses"]]
        if spec["map_reading"]:
            blocks.append(("map reading (made by the code from the Expert team's grades)", map_reading))
        found = search(spec["searches"]) if spec["searches"] else []
        if spec["ems98"]:
            found += [(i, b) for i, b in ems98 if i not in dict(found)]
        if found:
            blocks.append(("guideline sections (from the guideline search; cite these IDs)",
                           "\n\n".join(block for _, block in found)))
        facts = facts_text(blocks)
        sections = {}
        for heading, what, words in spec["sections"]:
            sections[heading] = write_section(spec, team, heading, what, words, facts, sections)
        reports[spec["file"]] = save_report(spec, sections)
        report_finished(spec, start)

    print(f"\nFixed flow finished: {len(reports)} reports in {REPORT_DIR}, grades found: {len(grades)}")


if __name__ == "__main__":
    main()
