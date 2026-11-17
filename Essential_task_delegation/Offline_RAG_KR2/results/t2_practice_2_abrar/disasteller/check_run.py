"""
check_run.py
------------
New file (3 Nov 2026, roadmap T2). Checks one DisasTeller run against the pass rules that
the README fixed before any run (section "DisasTeller on the local model"), and lists
other signals about the reports without grading them.

Usage:
    python check_run.py <run folder> <Offline_RAG_KR2 folder> [--internet on|off]
The run folder is where run_with_netlog.py ran: it holds reports/offline/, netlog.json
and run_log.txt. The Offline_RAG_KR2 folder gives guideline_chunks.jsonl, to tell real
citation IDs from made-up ones. --internet is what the notebook measured.

Writes t2_run_summary.json into the run folder. Exit code 0 = every rule passed.
"""

import json
import os
import re
import sys

REPORTS = [
    "Expert_team_report.txt",
    "Alerts_team_report_for_social_media.txt",
    "Emergency_team_report.txt",
    "Emergency_service_human_resource_allocation.txt",
    "Public_community_report.txt",
    "Reconstruction_plan.txt",
]
FAILED_MARK = "Local model gave no answer after 3 tries"  # the same text as in local_model.py
ID_PREFIXES = ("EMS98-", "XBD-", "IWGSEM-", "INSARAG3-", "INSARAG2B-", "SPHERE-")


def main(argv) -> int:
    run_dir, rag_dir = argv[1], argv[2]
    internet = argv[argv.index("--internet") + 1] if "--internet" in argv else "unknown"

    with open(os.path.join(rag_dir, "guideline_chunks.jsonl"), encoding="utf-8") as f:
        real_ids = {json.loads(line)["id"] for line in f if line.strip()}
    netlog_path = os.path.join(run_dir, "netlog.json")
    netlog = json.load(open(netlog_path, encoding="utf-8")) if os.path.isfile(netlog_path) else None
    log_path = os.path.join(run_dir, "run_log.txt")
    log = open(log_path, encoding="utf-8", errors="replace").read() if os.path.isfile(log_path) else ""

    rules, reports = {}, {}
    rules["1. The run finished"] = bool(netlog and netlog["main_script_finished"])

    complete = True
    for name in REPORTS:
        path = os.path.join(run_dir, "reports", "offline", name)
        if not os.path.isfile(path):
            reports[name] = {"exists": False}
            complete = False
            continue
        text = open(path, encoding="utf-8", errors="replace").read()
        body = text.split("\n", 1)[1] if "\n" in text else ""
        cited = re.findall(r"\[([A-Za-z0-9][A-Za-z0-9._-]*)\]", body)
        cited_ids = [c for c in cited if c.startswith(ID_PREFIXES)]
        reports[name] = {
            "exists": True,
            "starts_with_mode_offline": text.startswith("Mode: offline"),
            "words": len(body.split()),
            "citations": len(cited_ids),
            "citations_real": sum(c in real_ids for c in cited_ids),
            "citations_unknown": sorted({c for c in cited_ids if c not in real_ids}),
            "not_available_offline": body.lower().count("not available offline"),
            "error_text": "An error occurred" in body,
        }
        complete &= reports[name]["starts_with_mode_offline"] and reports[name]["words"] >= 50
    rules["2. All six reports, each starting 'Mode: offline', each 50+ words"] = complete

    rules["3. Nothing went outside this computer"] = bool(netlog) and not netlog["external"]
    rules["4. No Gemini library was loaded"] = bool(netlog) and not netlog["gemini_modules_loaded"]
    rules["5. Every model question got an answer"] = bool(log) and FAILED_MARK not in log

    passed = all(rules.values())
    if not passed:
        verdict = "FAILED"
    elif internet == "off":
        verdict = "PASSED: the offline proof (internet off)"
    else:
        verdict = f"PASSED as a practice run (internet {internet}); the proof needs internet off"

    summary = {
        "verdict": verdict,
        "internet": internet,
        "rules": rules,
        "signals": {
            "minutes": round(netlog["seconds"] / 60, 1) if netlog else None,
            "network_events": netlog["lookups_and_connections"] if netlog else None,
            "external": netlog["external"] if netlog else None,
            "guideline_searches": log.count("Guideline search:"),
            "photo_questions": log.count("Local information ("),
            "map_questions": log.count("Global information:"),
            "map_label_questions": log.count("This image is a map of a place"),
            "labelled_map_saved": os.path.isfile(os.path.join(run_dir, "reports", "offline", "4_anotated.png")),
            "model_call_retries": log.count("Local model call failed"),
            "total_words": sum(r.get("words", 0) for r in reports.values()),
            "total_citations": sum(r.get("citations", 0) for r in reports.values()),
            "total_citations_real": sum(r.get("citations_real", 0) for r in reports.values()),
        },
        "reports": reports,
    }
    with open(os.path.join(run_dir, "t2_run_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    for rule, ok in rules.items():
        print(f"{'PASS' if ok else 'FAIL'}  {rule}")
    print(f"\n{verdict}\n")
    print(f"{'report':50} words  cites(real)  'not available offline'")
    for name, r in reports.items():
        if r["exists"]:
            print(f"{name:50} {r['words']:5}  {r['citations']:3} ({r['citations_real']:3})  {r['not_available_offline']:3}")
        else:
            print(f"{name:50} MISSING")
    print("\nOther signals:", json.dumps(summary["signals"]))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
