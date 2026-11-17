"""
compare_reports.py
------------------
New file (16 Nov 2026, roadmap T2: "README.md comparing them with the Gemini reports from
20 July"). Counts measures 1-5 of the README section "Comparison with the July Gemini
reports", for two or more folders of DisasTeller reports. The same code reads every folder.
It only reads: it changes no report.

Usage (run from the Offline_RAG_KR2 folder):
    python report_comparison/compare_reports.py
        --set july=../../support/Ridita_Integration_of_VLM__/DisasTeller
        --set ours=results/t2_proof/t2_run_internet_off/run/reports/offline
        --calls ours=results/t2_proof/t2_run_internet_off/run/llm_calls.jsonl
        --chunks guideline_chunks.jsonl
        --out report_comparison
    python report_comparison/compare_reports.py --selftest

Writes into --out:
    results.csv     measures 1-5, one row per report. Measures 4 and 5 are candidate counts.
    candidates.csv  every line that measures 4 and 5 found, with a "confirmed" and a "note"
                    column to fill in by reading. The README counts only confirmed lines.
                    Running again keeps the "confirmed" and "note" already filled in, for the
                    same lines.

The measures, as the README fixes them (section "Exact rules", 16 Nov, before any count):
    1  words on lines that don't start with "#", without our first line ("Mode: offline ...")
    2  guidelines named in the text, after every citation ID is taken out
    3  citations as check_run.py counts them (a known ID prefix inside its own brackets):
       how many are real, and how many were not shown to the report. "Shown" needs the run's
       llm_calls.jsonl (--calls) and the fixed flow's searches, copied below from
       fixed_flow.py (commit 258a4f381); the script stops if the logged searches differ.
    4  candidate contact details (phone numbers, e-mail and web addresses)
    5  candidate "no danger" sentences
"""

import argparse
import csv
import json
import os
import re
import sys

# The six reports, in the order of DisasTeller's tasks (the same list as in check_run.py).
REPORTS = [
    "Expert_team_report.txt",
    "Alerts_team_report_for_social_media.txt",
    "Emergency_team_report.txt",
    "Emergency_service_human_resource_allocation.txt",
    "Public_community_report.txt",
    "Reconstruction_plan.txt",
]
EXPERT, ALERTS, EMERGENCY = REPORTS[0], REPORTS[1], REPORTS[2]

# Copied from fixed_flow.py (commit 258a4f381): each report's guideline searches, and the
# earlier reports it is given ("uses"). The Reconstruction plan also gets the Expert team's
# EMS-98 sections ("ems98"), with no new search.
EMS98_SEARCHES = [f"EMS-98 classification of damage to masonry buildings Grade {n} {name}" for n, name in (
    (1, "negligible to slight damage"), (2, "moderate damage"), (3, "substantial to heavy damage"),
    (4, "very heavy damage"), (5, "destruction"))]
FLOW = {
    EXPERT: {"searches": EMS98_SEARCHES, "uses": [], "ems98": False},
    ALERTS: {"searches": [], "uses": [EXPERT], "ems98": False},
    EMERGENCY: {"searches": ["Sphere covered living space per person",
                             "Sphere settlement site area per person location and access",
                             "INSARAG handover of rescued patients to medical teams and hospitals"],
                "uses": [EXPERT, ALERTS], "ems98": False},
    "Emergency_service_human_resource_allocation.txt": {
        "searches": ["INSARAG light medium and heavy USAR team types",
                     "INSARAG ASR levels assessment search and rescue",
                     "INSARAG worksite triage and priorities",
                     "INSARAG rescue team shifts and rotation"],
        "uses": [EXPERT, ALERTS, EMERGENCY], "ems98": False},
    "Public_community_report.txt": {
        "searches": ["Sphere emergency shelter for displaced households",
                     "Sphere household items",
                     "INSARAG rescue operations"],
        "uses": [EXPERT, ALERTS, EMERGENCY], "ems98": False},
    "Reconstruction_plan.txt": {
        "searches": ["Sphere repair retrofit or rebuild damaged houses",
                     "Sphere debris removal",
                     "Sphere technical assistance building codes and construction practices"],
        "uses": [EXPERT, ALERTS, EMERGENCY], "ems98": True},
}

MODE_LINE_START = "Mode: offline"  # our reports' first line, written by the code, not the model

# Measure 3: a citation as check_run.py counts it.
ID_PREFIXES = ("EMS98-", "XBD-", "IWGSEM-", "INSARAG3-", "INSARAG2B-", "SPHERE-")
BRACKETED = re.compile(r"\[([A-Za-z0-9][A-Za-z0-9._-]*)\]")
# Any word shaped like a citation ID, with or without brackets.
ID_WORD = re.compile(r"\b(?:EMS98|XBD|IWGSEM|INSARAG3|INSARAG2B|SPHERE)-[A-Za-z0-9._-]*[A-Za-z0-9]")

# Measure 2: the guidelines' names, in any capitals. Each match counts once.
NAMES = [
    ("EMS-98", re.compile(r"\bEMS[- ]?98\b|\bEuropean Macroseismic Scale\b", re.IGNORECASE)),
    ("Sphere", re.compile(r"\bSphere\b", re.IGNORECASE)),
    ("INSARAG", re.compile(r"\bINSARAG\b", re.IGNORECASE)),
    ("IWG-SEM", re.compile(r"\bIWG[- ]?SEM\b", re.IGNORECASE)),
    ("xBD", re.compile(r"\bxBD\b", re.IGNORECASE)),
]

# Measure 4: candidate contact details. Wide on purpose: each candidate is read before it counts.
PHONE_KIND = "phone-like number (6+ digits)"
CONTACT = [
    (PHONE_KIND, re.compile(r"(?<!\w)\+?\(?\d[\d ().-]{4,}\d(?!\w)")),
    ("number after call/dial/phone/hotline/contact", re.compile(
        r"\b(?:call|calling|dial|phone|telephone|tel|hotline|contact|sms)\b\W+(?:[A-Za-z]+\W+){0,3}?"
        r"(\+?\d[\d -]*\d|\d)\b", re.IGNORECASE)),
    ("e-mail address", re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b")),
    ("web address", re.compile(
        r"\bhttps?://\S+|\bwww\.\S+|(?<![@.\w])[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*"
        r"\.(?:com|org|gov|net|int|edu|jp|info|io)\b", re.IGNORECASE)),
]

# Measure 5: candidate "no danger" sentences: a no-word, then within 6 words a danger word.
NO_DANGER = re.compile(
    r"\b(?:no|not|none|without|nothing|zero)\b(?:\W+\w+){0,6}?\W+"
    r"(?:dangerous|danger|high[- ]risk|critical|hazardous|hazards?|unsafe)\b", re.IGNORECASE)
SENTENCE_END = re.compile(r"(?<=[.!?])\s+")

RESULT_COLUMNS = [
    "set", "report", "exists",
    "words_outside_headings", "words_all",
    "names_EMS-98", "names_Sphere", "names_INSARAG", "names_IWG-SEM", "names_xBD", "names_total",
    "citations", "citations_real", "citations_unknown", "citations_not_shown",
    "ids_without_brackets", "ids_without_brackets_list",
    "contact_candidates", "no_danger_candidates",
    "not_available_offline",  # extra, not a measure: our offline rules ask for this phrase
]
CANDIDATE_COLUMNS = ["set", "report", "line", "measure", "kind", "match", "text", "confirmed", "note"]


def read_text(folder, name):
    path = os.path.join(folder, name)
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8", errors="replace") as f:
        return f.read()


def body_lines(text):
    """(line number in the file, line) for every line, without our first line ("Mode: offline ...")."""
    numbered = list(enumerate(text.splitlines(), start=1))
    if numbered and numbered[0][1].startswith(MODE_LINE_START):
        numbered = numbered[1:]
    return numbered


def count_words(numbered):
    """Measure 1: (all words, words on lines that don't start with "#")."""
    all_words = sum(len(line.split()) for _, line in numbered)
    outside = sum(len(line.split()) for _, line in numbered if not line.lstrip().startswith("#"))
    return all_words, outside


def count_names(body):
    """Measure 2: each guideline's name, counted after every citation ID is taken out."""
    plain = ID_WORD.sub(" ", body)
    return {name: len(pattern.findall(plain)) for name, pattern in NAMES}


def find_citations(body):
    """Measure 3: the citations check_run.py counts (a known prefix inside its own brackets)."""
    return [c for c in BRACKETED.findall(body) if c.startswith(ID_PREFIXES)]


def find_ids_without_brackets(body):
    """IDs written without their own pair of brackets (check_run.py doesn't count them)."""
    rest = BRACKETED.sub(lambda m: " " if m.group(1).startswith(ID_PREFIXES) else m.group(0), body)
    return ID_WORD.findall(rest)


def contact_candidates(numbered):
    """Measure 4: (line number, kind, match, line) for each candidate."""
    found = []
    for line_no, line in numbered:
        for kind, pattern in CONTACT:
            for m in pattern.finditer(line):
                match = (m.group(1) if pattern.groups else m.group(0)).strip().rstrip(").,;:!?\"'*")
                if kind == PHONE_KIND and sum(ch.isdigit() for ch in match) < 6:
                    continue
                found.append((line_no, kind, match, line.strip()))
    return found


def no_danger_candidates(numbered):
    """Measure 5: (line number, kind, match, sentence) for each candidate sentence."""
    found = []
    for line_no, line in numbered:
        for sentence in SENTENCE_END.split(line):
            m = NO_DANGER.search(sentence)
            if m:
                found.append((line_no, "no-word then danger-word", m.group(0), sentence.strip()))
    return found


def shown_ids(calls_path, folder):
    """Measure 3's "shown": for each report, every ID that was in its prompt."""
    with open(calls_path, encoding="utf-8") as f:
        rows = [json.loads(line) for line in f if line.strip()]
    searches = [r for r in rows if r.get("kind") == "search"]
    expected = [q for name in REPORTS for q in FLOW[name]["searches"]]
    logged = [r["query"] for r in searches]
    if logged != expected:
        sys.exit(f"Stop: the searches in {calls_path} are not the fixed flow's searches, in its order "
                 f"(copied from fixed_flow.py, commit 258a4f381). Logged: {logged}")
    ids_of = {r["query"]: r["ids"] for r in searches}
    texts = {name: read_text(folder, name) or "" for name in REPORTS}
    shown = {}
    for name in REPORTS:
        ids = set()
        for query in FLOW[name]["searches"]:
            ids.update(ids_of[query])
        if FLOW[name]["ems98"]:
            for query in EMS98_SEARCHES:
                ids.update(ids_of[query])
        for used in FLOW[name]["uses"]:  # the earlier reports, as given to the model
            ids.update(ID_WORD.findall(texts[used]))
        shown[name] = ids
    return shown


def load_previous(path):
    """The "confirmed" and "note" columns already filled in, by line."""
    keep = {}
    if os.path.isfile(path):
        with open(path, encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                key = (row["set"], row["report"], row["line"], row["measure"], row["kind"], row["match"])
                keep[key] = (row.get("confirmed", ""), row.get("note", ""))
    return keep


def parse_pairs(values, option):
    pairs = {}
    for value in values or []:
        if "=" not in value:
            sys.exit(f"{option} needs name=path, got {value!r}")
        name, path = value.split("=", 1)
        pairs[name] = path
    return pairs


def measure_folder(set_name, folder, real_ids, shown):
    rows, candidates = [], []
    for name in REPORTS:
        text = read_text(folder, name)
        if text is None:
            rows.append({"set": set_name, "report": name, "exists": False})
            continue
        numbered = body_lines(text)
        body = "\n".join(line for _, line in numbered)
        words_all, words_outside = count_words(numbered)
        names = count_names(body)
        cited = find_citations(body)
        no_brackets = find_ids_without_brackets(body)
        contacts = contact_candidates(numbered)
        no_danger = no_danger_candidates(numbered)
        row = {
            "set": set_name, "report": name, "exists": True,
            "words_outside_headings": words_outside, "words_all": words_all,
            **{f"names_{k}": v for k, v in names.items()},
            "names_total": sum(names.values()),
            "citations": len(cited),
            "citations_real": sum(c in real_ids for c in cited),
            "citations_unknown": "; ".join(sorted({c for c in cited if c not in real_ids})),
            "citations_not_shown": ("; ".join(sorted({c for c in cited if c in real_ids and c not in shown[name]}))
                                    if shown else "n/a (no --calls)"),
            "ids_without_brackets": len(no_brackets),
            "ids_without_brackets_list": "; ".join(no_brackets),
            "contact_candidates": len(contacts),
            "no_danger_candidates": len(no_danger),
            "not_available_offline": body.lower().count("not available offline"),
        }
        rows.append(row)
        for measure, found in (("4 contact details", contacts), ("5 no danger", no_danger)):
            for line_no, kind, match, line in found:
                candidates.append({"set": set_name, "report": name, "line": str(line_no), "measure": measure,
                                   "kind": kind, "match": match, "text": line, "confirmed": "", "note": ""})
    return rows, candidates


def selftest():
    """Checks the counting on made-up lines (not on any real report)."""
    text = ("Mode: offline, fixed flow\n\n# Title\n## Section\n"
            "Grade 5 per [EMS98-masonry-grade-5] and EMS-98; see SPHERE-shelter-p2 too.\n"
            "The Sphere standard and the INSARAG guidelines; the atmosphere is calm.\n"
            "Call our hotline at 123 456 789 or dial 119, or write to help@example.org (www.example.org).\n"
            "No high-risk zones were detected. Do not enter dangerous areas. It was 2026-11-10.\n")
    numbered = body_lines(text)
    body = "\n".join(line for _, line in numbered)
    assert numbered[0][0] == 2, "the Mode line must be left out"
    assert count_words(numbered) == (52, 48), count_words(numbered)
    assert count_names(body) == {"EMS-98": 1, "Sphere": 1, "INSARAG": 1, "IWG-SEM": 0, "xBD": 0}, count_names(body)
    assert find_citations(body) == ["EMS98-masonry-grade-5"], find_citations(body)
    assert find_ids_without_brackets(body) == ["SPHERE-shelter-p2"], find_ids_without_brackets(body)
    contacts = [(n, k, m) for n, k, m, _ in contact_candidates(numbered)]
    assert contacts == [
        (7, PHONE_KIND, "123 456 789"),
        (7, "number after call/dial/phone/hotline/contact", "123 456 789"),
        (7, "number after call/dial/phone/hotline/contact", "119"),
        (7, "e-mail address", "help@example.org"),
        (7, "web address", "www.example.org"),
        (8, PHONE_KIND, "2026-11-10"),
    ], contacts
    no_danger = [(n, m) for n, _, m, _ in no_danger_candidates(numbered)]
    assert no_danger == [(8, "No high-risk"), (8, "not enter dangerous")], no_danger
    # A July-style report: no Mode line, so nothing is left out; "#" lines are headings.
    # (16 Nov, later: the expected total was 7; these lines hold 2 + 3 + 3 = 8 words. The counting
    # itself was right: a rerun reproduced results.csv byte for byte.)
    july = "# Report\n## 1. Part\n*   **Status:** Severe.\n"
    assert body_lines(july)[0][0] == 1 and count_words(body_lines(july)) == (8, 3)
    print("Self-test passed: words, names, citations, IDs without brackets, contact and no-danger candidates.")


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--set", action="append", help="name=folder of the six reports (give it 2+ times)")
    parser.add_argument("--calls", action="append", help="name=llm_calls.jsonl of that set's run (fixed flow)")
    parser.add_argument("--chunks", default="guideline_chunks.jsonl")
    parser.add_argument("--out", default="report_comparison")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args(argv[1:])
    if args.selftest:
        selftest()
        return 0
    sets, calls = parse_pairs(args.set, "--set"), parse_pairs(args.calls, "--calls")
    if len(sets) < 2:
        sys.exit("Give at least two --set name=folder")
    with open(args.chunks, encoding="utf-8") as f:
        real_ids = {json.loads(line)["id"] for line in f if line.strip()}

    rows, candidates = [], []
    for set_name, folder in sets.items():
        shown = shown_ids(calls[set_name], folder) if set_name in calls else None
        r, c = measure_folder(set_name, folder, real_ids, shown)
        rows += r
        candidates += c

    os.makedirs(args.out, exist_ok=True)
    with open(os.path.join(args.out, "results.csv"), "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=RESULT_COLUMNS, restval="")
        writer.writeheader()
        writer.writerows(rows)
    cand_path = os.path.join(args.out, "candidates.csv")
    previous = load_previous(cand_path)
    for c in candidates:
        key = (c["set"], c["report"], c["line"], c["measure"], c["kind"], c["match"])
        c["confirmed"], c["note"] = previous.get(key, ("", ""))
    with open(cand_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CANDIDATE_COLUMNS)
        writer.writeheader()
        writer.writerows(candidates)

    print(f"{'set':6} {'report':48} {'words':>5} {'names':>5} {'cites':>5} {'real':>4} "
          f"{'no-br':>5} {'contact?':>8} {'no-danger?':>10}")
    for r in rows:
        if not r.get("exists"):
            print(f"{r['set']:6} {r['report']:48} MISSING")
            continue
        print(f"{r['set']:6} {r['report']:48} {r['words_outside_headings']:5} {r['names_total']:5} "
              f"{r['citations']:5} {r['citations_real']:4} {r['ids_without_brackets']:5} "
              f"{r['contact_candidates']:8} {r['no_danger_candidates']:10}")
    print(f"\nWrote {os.path.join(args.out, 'results.csv')} and {cand_path} "
          f"({len(candidates)} candidate lines to read).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
