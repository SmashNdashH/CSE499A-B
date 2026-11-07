"""
pdf_search_tool.py
------------------
Copy of support/Ridita_Integration_of_VLM__/DisasTeller/pdf_search_tool.py, made
offline. The original is unchanged.

The original embedded EMS-98 with Gemini (API key + internet) into gemini_chroma_db/.
This copy keeps the tool's name, so DisasterManagement_teamwork_simulation.py still
imports offline_pdf_search_tool, but the tool now searches the offline guideline index
in the folder above (Offline_RAG_KR2/): guideline_index.py and the files it builds.

It imports guideline_index from that folder instead of copying the index here:
  - guideline_index.py finds its built files (chunks, vectors, Chroma folder, model)
    next to itself, so DisasTeller searches exactly the index the retrieval test checks;
  - after `python guideline_index.py`, the one rebuild serves both, and no second copy
    can go out of date;
  - the backend choice stays the same (Chroma on the laptop, numpy + torch on Kaggle).
Set GUIDELINE_INDEX_DIR to use a copy of that folder elsewhere, e.g. a Kaggle input.

5 Nov 2026, after Kaggle practice run 2: the tool's description asks the agent to search
for one thing at a time, with an example. In run 2 the agent searched for "earthquake,
disaster, building, road, vegetation, Wajima, central area" and got sections about the
xBD dataset's statistics instead of the damage grades. The search itself is unchanged.

7 Nov 2026, latency: each search is timed. The run log says how long it took ("Guideline
search took ... ms"), and llm_calls.jsonl gets a line for it (kind "search"). The first
search also loads the index and the embedding model, once per run; that load is timed on
its own (kind "search_load"), so it does not count as search time. The search and the
tool's description are unchanged.
"""

import os
import sys
import time

from crewai.tools import tool

GUIDELINE_INDEX_DIR = os.environ.get("GUIDELINE_INDEX_DIR") or \
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(GUIDELINE_INDEX_DIR, "guideline_index.py")):
    raise FileNotFoundError(f"No guideline_index.py in {GUIDELINE_INDEX_DIR}. "
                            "Set GUIDELINE_INDEX_DIR to the Offline_RAG_KR2 folder.")
sys.path.append(GUIDELINE_INDEX_DIR)

from guideline_index import format_results, search_backend, search_guidelines  # noqa: E402
from local_model import _log_call  # noqa: E402  (the same llm_calls.jsonl as the model calls)

_index_loaded = False


@tool
def offline_pdf_search_tool(query: str) -> str:
    """Offline search over disaster guidelines: EMS-98 and IWG-SEM (building damage
    grades), the xBD damage scale, INSARAG (search and rescue teams, ASR levels,
    worksite triage) and Sphere (shelter, living space, household items, reconstruction).
    Search for one thing at a time, in the guidelines' words, e.g. "EMS-98 damage grade 4
    very heavy damage masonry building" or "Sphere covered living space per person";
    a list of loose keywords finds the wrong sections. It returns the 3 best sections.
    Each result starts with a citation ID in square brackets; cite these IDs."""
    global _index_loaded
    print(f"Guideline search: {query}")  # check_run.py counts these lines in the run log
    if not _index_loaded:  # once per run: load the index and the embedding model
        start = time.perf_counter()
        backend = search_backend()
        seconds = time.perf_counter() - start
        _index_loaded = True
        print(f"Guideline index loaded in {seconds:.1f} s ({backend}), once per run")
        _log_call({"kind": "search_load", "time": round(time.time(), 3),
                   "seconds": round(seconds, 3), "backend": backend})
    start = time.perf_counter()
    results = search_guidelines(query, k=3)
    seconds = time.perf_counter() - start
    print(f"Guideline search took {seconds * 1000:.0f} ms")
    _log_call({"kind": "search", "time": round(time.time(), 3), "query": query[:300],
               "seconds": round(seconds, 4), "ids": [r["id"] for r in results]})
    return format_results(results)
