"""
run_with_netlog.py
------------------
New file (3 Nov 2026, roadmap T2: "a log proving no external API calls").
Runs DisasterManagement_teamwork_simulation.py in this same Python process, and records
every network connection and every name lookup (DNS) the process makes.

Usage, from the folder where the reports should go (as for the main script):
    python <path to>/run_with_netlog.py

It writes two files into that folder:
  - run_log.txt: everything the run printed;
  - netlog.json: every lookup and connection (time, address, port), the ones that left
    this computer ("external"), the Gemini libraries loaded ("gemini_modules_loaded"),
    the local-model settings, and whether the main script finished.
Exit code 1 if anything went outside this computer, a Gemini library was loaded, or the
main script stopped with an error. check_run.py then checks the reports.

It sees only this process. The model server (vLLM) is a separate program; the Kaggle
notebook turns the internet off for both, and starts vLLM with its usage report off.
"""

import ipaddress
import json
import os
import runpy
import socket
import sys
import time
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
MAIN = os.path.join(HERE, "DisasterManagement_teamwork_simulation.py")
RUN_DIR = os.getcwd()
events = []


def _is_local(host) -> bool:
    host = str(host).split("%")[0]  # drop an IPv6 zone such as %eth0
    if host in ("localhost", "") or host.endswith(".localhost"):
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False  # any other name, such as huggingface.co


def _record(kind, host, port):
    if isinstance(host, bytes):
        host = host.decode(errors="replace")
    events.append({"time": round(time.time(), 3), "kind": kind, "host": str(host),
                   "port": port, "local": _is_local(host)})


_real_connect = socket.socket.connect
_real_connect_ex = socket.socket.connect_ex
_real_getaddrinfo = socket.getaddrinfo


def _note(sock, address):
    if sock.family in (socket.AF_INET, socket.AF_INET6):
        _record("connect", address[0], address[1])
    # other kinds (Unix sockets) stay inside this computer


def _connect(self, address):
    _note(self, address)
    return _real_connect(self, address)


def _connect_ex(self, address):
    _note(self, address)
    return _real_connect_ex(self, address)


def _getaddrinfo(host, port, *args, **kwargs):
    _record("lookup", host, port)
    return _real_getaddrinfo(host, port, *args, **kwargs)


class _Tee:
    """Writes to the screen and to run_log.txt."""

    def __init__(self, stream, log):
        self._stream, self._log = stream, log

    def write(self, text):
        self._log.write(text)
        self._log.flush()
        return self._stream.write(text)

    def flush(self):
        self._log.flush()
        self._stream.flush()

    def __getattr__(self, name):
        return getattr(self._stream, name)


def main() -> int:
    socket.socket.connect = _connect
    socket.socket.connect_ex = _connect_ex
    socket.getaddrinfo = _getaddrinfo

    log = open(os.path.join(RUN_DIR, "run_log.txt"), "w", encoding="utf-8", errors="replace")
    sys.stdout, sys.stderr = _Tee(sys.stdout, log), _Tee(sys.stderr, log)

    started = time.time()
    finished, error = False, None
    sys.argv = [MAIN]
    try:
        runpy.run_path(MAIN, run_name="__main__")
        finished = True
    except BaseException:  # noqa: BLE001 - the log must be written whatever happened
        error = traceback.format_exc()
        print(error)

    external = sorted({(e["kind"], e["host"], e["port"]) for e in events if not e["local"]},
                      key=str)
    gemini = sorted(m for m in sys.modules
                    if m.startswith(("google.generativeai", "google.genai", "google.ai.generativelanguage")))
    report = {
        "main_script": MAIN,
        "run_folder": RUN_DIR,
        "started": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(started)),
        "seconds": round(time.time() - started, 1),
        "main_script_finished": finished,
        "error": error,
        "settings": {k: v for k, v in sorted(os.environ.items())
                     if k.startswith(("LOCAL_LLM_", "GUIDELINE_", "DISASTELLER_", "CREWAI_",
                                      "HF_HUB_OFFLINE", "TRANSFORMERS_OFFLINE"))},
        "lookups_and_connections": len(events),
        "external": [{"kind": k, "host": h, "port": p} for k, h, p in external],
        "gemini_modules_loaded": gemini,
        "events": events,
    }
    with open(os.path.join(RUN_DIR, "netlog.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    local_hosts = sorted({e["host"] for e in events if e["local"]})
    print(f"\nNetwork log: {len(events)} lookups and connections; on this computer: {local_hosts}")
    print(f"Outside this computer: {report['external'] or 'none'}")
    print(f"Gemini libraries loaded: {gemini or 'none'}")
    print(f"Main script finished: {finished}. Wrote netlog.json and run_log.txt in {RUN_DIR}")
    sys.stdout.flush()
    return 0 if finished and not external and not gemini else 1


if __name__ == "__main__":
    sys.exit(main())
