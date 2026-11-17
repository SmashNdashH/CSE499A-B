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

5 Nov 2026: more signals (the rules are unchanged), from the run log and from
llm_calls.jsonl, which local_model.py now writes: how often a conversation was shortened,
the biggest real prompt the server counted, how many labels the map got, how many of the
photo descriptions differ, and how often a team hit its step limit.

7 Nov 2026: latency signals, also from llm_calls.jsonl (measured, not graded; the rules
are unchanged): the time of each guideline search, of each model call, and of each report,
as the median, the 90th percentile ("p90": 9 in 10 were at most this fast) and the
slowest. Calls that ended in an error are left out of these times.
"""

import json
import math
import os
import re
import statistics
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
SHORTENED_MARK = "Model message shortened"                # the same text as in local_model.py
FORCED_ANSWER = "MUST give your absolute best final answer"  # CrewAI's text at the step limit
ID_PREFIXES = ("EMS98-", "XBD-", "IWGSEM-", "INSARAG3-", "INSARAG2B-", "SPHERE-")


def call_signals(run_dir) -> dict:
    """Signals from llm_calls.jsonl (one line per model call), if the run wrote it."""
    path = os.path.join(run_dir, "llm_calls.jsonl")
    if not os.path.isfile(path):
        return {"llm_calls_log": False}
    calls = [json.loads(line) for line in open(path, encoding="utf-8") if line.strip()]
    agent = [c for c in calls if c.get("kind") == "agent"]
    image = [c for c in calls if c.get("kind") == "image"]
    real = [(c["usage"] or {}).get("prompt_tokens") for c in agent if c.get("usage")]
    real = [r for r in real if r]
    ratios = [c["estimated_tokens_sent"] / c["usage"]["prompt_tokens"] for c in agent
              if c.get("usage") and c["usage"].get("prompt_tokens") and c.get("estimated_tokens_sent")]
    photos = [c.get("answer", "") for c in image if c.get("prompt", "").startswith("describe the disaster")]
    return {
        "llm_calls_log": True,
        "agent_calls": len(agent),
        "image_calls": len(image),
        "calls_with_errors": sum(1 for c in calls if c.get("error")),
        "biggest_prompt_tokens_real": max(real) if real else None,
        "biggest_prompt_tokens_estimated": max((c.get("estimated_tokens_sent", 0) for c in agent), default=None),
        "lowest_estimate_to_real_ratio": round(min(ratios), 2) if ratios else None,
        "answer_tokens_real": sum((c.get("usage") or {}).get("completion_tokens", 0) or 0 for c in calls),
        "minutes_in_model_calls": round(sum(c.get("seconds", 0) for c in agent + image) / 60, 1),
        "step_limit_reached": sum(1 for c in agent if FORCED_ANSWER in c.get("last_message", "")),
        "photo_descriptions": len(photos),
        "photo_descriptions_different": len(set(photos)),
        **latency_signals(calls),
    }


def _median(values, digits=1):
    return round(statistics.median(values), digits) if values else None


def _p90(values, digits=1):
    """The 90th percentile by nearest rank: 9 in 10 of the values are at most this."""
    if not values:
        return None
    values = sorted(values)
    return round(values[math.ceil(0.9 * len(values)) - 1], digits)


def latency_signals(calls) -> dict:
    """How long the searches, the model calls and the reports took (7 Nov 2026)."""
    ok = [c for c in calls if not c.get("error") and c.get("seconds") is not None]
    load = [c for c in ok if c.get("kind") == "search_load"]
    search_ms = [c["seconds"] * 1000 for c in ok if c.get("kind") == "search"]
    agent_s = [c["seconds"] for c in ok if c.get("kind") == "agent"]
    image_s = [c["seconds"] for c in ok if c.get("kind") == "image"]
    speeds = [c["usage"]["completion_tokens"] / c["seconds"] for c in ok
              if c.get("kind") in ("agent", "image") and c["seconds"] > 0
              and (c.get("usage") or {}).get("completion_tokens")]
    return {
        "search_index_load_seconds": round(load[0]["seconds"], 1) if load else None,
        "search_backend": load[0].get("backend") if load else None,
        "searches_timed": len(search_ms),
        "search_ms_median": _median(search_ms),
        "search_ms_p90": _p90(search_ms),
        "search_ms_max": round(max(search_ms), 1) if search_ms else None,
        "agent_call_seconds_median": _median(agent_s),
        "agent_call_seconds_p90": _p90(agent_s),
        "agent_call_seconds_max": round(max(agent_s), 1) if agent_s else None,
        "image_call_seconds_median": _median(image_s),
        "image_call_seconds_p90": _p90(image_s),
        "image_call_seconds_max": round(max(image_s), 1) if image_s else None,
        "answer_tokens_per_second_median": _median(speeds),
        "report_minutes": {c["report"]: round(c["seconds"] / 60, 1) for c in ok if c.get("kind") == "task"},
    }


def print_latency(signals) -> None:
    """A short table of the latency signals, for the notebook output."""
    def three(prefix, unit):
        values = [signals.get(f"{prefix}_{part}") for part in ("median", "p90", "max")]
        return "not measured" if values[0] is None else " / ".join(f"{v:g}" for v in values) + f" {unit}"

    print("\nLatency (median / p90 / slowest):")
    load = signals.get("search_index_load_seconds")
    searches = signals.get("searches_timed", 0)
    print(f"  guideline search:  {three('search_ms', 'ms')}, {searches} search{'' if searches == 1 else 'es'}"
          + (f" (loading the index once: {load:g} s, {signals.get('search_backend')})" if load is not None else ""))
    print(f"  agent model call:  {three('agent_call_seconds', 's')}, {signals.get('agent_calls', 0)} calls")
    print(f"  image model call:  {three('image_call_seconds', 's')}, {signals.get('image_calls', 0)} calls")
    speed = signals.get("answer_tokens_per_second_median")
    print(f"  answer speed:      {'not measured' if speed is None else f'{speed:g} tokens/s (median)'}")
    reports = signals.get("report_minutes") or {}
    print("  time per report:   " + ("" if reports else "not measured"))
    for name, minutes in reports.items():
        print(f"    {name:50} {minutes:g} min")


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
            "map_labels_drawn": [int(n) for n in re.findall(r"Labelled map saved: .*? \((\d+) labels\)", log)],
            "model_messages_shortened": log.count(SHORTENED_MARK),
            "model_call_retries": log.count("Local model call failed"),
            "total_words": sum(r.get("words", 0) for r in reports.values()),
            "total_citations": sum(r.get("citations", 0) for r in reports.values()),
            "total_citations_real": sum(r.get("citations_real", 0) for r in reports.values()),
            **call_signals(run_dir),
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
    if summary["signals"].get("llm_calls_log"):
        print_latency(summary["signals"])
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
