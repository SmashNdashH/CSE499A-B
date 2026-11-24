"""
number_check.py
---------------
New file (20 Nov 2026): roadmap T2 step 7 (every number in a report checked against the table), and fix (b) of
T2 step 5 (the same check while the model writes, in fixed_flow_c4.py). One set of rules for both.

A number in a report is checked against its sources, the parts of the facts the model was given that the language
model did not write:
  - the damage facts (C4's counts, hot spots and safe areas, from the system's damage model);
  - the map reading, which the code writes from them;
  - the guideline passages shown to that report, as the search tool printed them (the header with the document
    and the pages included).
The photo descriptions and the earlier reports are left out: the language model wrote those.

Each number is read with what it measures, so it's compared with the right facts:
  - a position "(x, y)" must be a hot spot's or a safe area's position;
  - "N pixels" must be a zone size, a distance or the photo's size;
  - "N%" or "N percent" must be a share of the counts (within 1 point) or a percentage in the passages;
  - "N buildings / areas / patches / structures / houses / homes / dwellings" must be one of the counts;
  - "hot spot N", "safe area N", "HN" and "SN" must be a rank the facts give;
  - "Grade N", "Grades N to M" and "GN" are EMS-98 grades (1 to 5): accepted;
  - any other number must be a count, a rank, a pixel figure, the photo's size, or a number in the passages.
A number with misplaced thousands commas ("283,81") is wrong as written.

Verdicts: "ok"; "wrong", a damage fact stated with a value the facts don't have (a contradiction); "unsourced",
a number in neither the facts nor the passages, such as an invented staff number.
Rule version 2 (20 Nov, evening, after step 5's run 2; fixed before run 3): "misused", a damage count used for
something it doesn't count. That is a number equal to a count, not in the text of a shown passage, with a word for
people or resources (staff, teams, shelters, beds and the like) within 4 words after it or 6 before it, in the same
sentence. Only a passage's text counts here, not its page header. First coded with the headers, rule 2 let "54
medical personnel" pass because a shown passage was on page 54; that was fixed before run 3.
Run 2 wrote "54 medical personnel" for the 54 intact buildings. A misused number counts as wrong. version=1 gives the
first rule, for comparison.
Limits: numbers written as words ("three") aren't read; a passage number counts as a source even where the passage
uses it for something else; 1 to 3 pass as ranks; a count used with a word not on the list isn't caught.
"""
import re

SOURCE_TITLES = ("damage facts", "map reading", "EMS-98 damage grades", "guideline sections")
BLOCK = re.compile(r"^=== Facts: (.+?) ===$", re.MULTILINE)
ID_WORD = re.compile(r"\b(?:EMS98|XBD|IWGSEM|INSARAG3|INSARAG2B|SPHERE)-[A-Za-z0-9._-]*[A-Za-z0-9]")  # as fixed_flow
NUMBER = re.compile(r"(?<![\w.])(\d+(?:,\d+)*(?:\.\d+)?)(?![\w])")
GOOD_COMMAS = re.compile(r"\d{1,3}(?:,\d{3})+(?:\.\d+)?")
COORD = re.compile(r"\(\s*(\d{1,5})\s*,\s*(\d{1,5})\s*\)")
GRADE = re.compile(r"\b(?:Grades?\s*|G)([1-5])\b(?:\s*(?:to|-|–|and|or)\s*(?:Grade\s*|G)?([1-5])\b)?", re.IGNORECASE)
RANK = re.compile(r"\b(?:hot ?spots?|safe areas?)\s+(\d{1,2})\b|\b[HS](\d)\b", re.IGNORECASE)
PCT_AFTER = re.compile(r"\s*(?:%|percent\b)", re.IGNORECASE)
PX_AFTER = re.compile(r"\s*(?:pixels?|px)\b", re.IGNORECASE)
COUNT_AFTER = re.compile(r"\s+(?:[A-Za-z-]+\s+){0,2}?(?:buildings?|areas?|patch(?:es)?|structures?|houses?|homes?|dwellings?)\b",
                         re.IGNORECASE)
LIST_MARK = re.compile(r"^(\s*)\d{1,2}[.)](?=\s)", re.MULTILINE)
ENUM_MARK = re.compile(r"(?<![\w(,.])\d{1,2}\)(?=\s)")
DAMAGE_WORD = re.compile(r"destroy|damag|intact|area|building|patch", re.IGNORECASE)
RESOURCE = re.compile(r"\b(?:personnel|staff|workers?|teams?|volunteers?|doctors?|nurses?|medics?|paramedics?|"
                      r"responders?|rescuers?|shelters?|tents?|beds?|hospitals?|clinics?|ambulances?|vehicles?|trucks?|"
                      r"helicopters?|people|persons?|individuals?|famil(?:y|ies)|households?|kits?|blankets?|meals?|"
                      r"litres?|liters?|tons?|tonnes?)\b", re.IGNORECASE)


def resource_near(text: str, start: int, end: int) -> bool:
    """A word for people or resources within 4 words after the number, or 6 before it, in its sentence (rule 2)."""
    stop = min([i for i in (text.find(c, end) for c in ".!?\n") if i != -1] + [len(text)])
    after = " ".join(re.findall(r"[A-Za-z]+", text[end:stop])[:4])
    begin = max(text.rfind(c, 0, start) for c in ".!?\n") + 1
    before = " ".join(re.findall(r"[A-Za-z]+", text[begin:start])[-6:])
    return bool(RESOURCE.search(after) or RESOURCE.search(before))


def value(token: str) -> float:
    return float(token.replace(",", ""))


def blocks(facts: str) -> list:
    """The facts text as (title, body) pairs, in the format of fixed_flow.facts_text."""
    heads = list(BLOCK.finditer(facts))
    return [(h.group(1), facts[h.end():(heads[i + 1].start() if i + 1 < len(heads) else len(facts))].strip())
            for i, h in enumerate(heads)]


def sources_of(facts: str) -> tuple:
    """The damage facts with the code's map reading, and the guideline passages, from a report's facts text."""
    kept = [(t, b) for t, b in blocks(facts) if t.startswith(SOURCE_TITLES)]
    return ("\n\n".join(b for t, b in kept if not t.startswith(("EMS-98", "guideline"))),
            "\n\n".join(b for t, b in kept if t.startswith(("EMS-98", "guideline"))))


def known(fact_text: str, passage_text: str) -> dict:
    """What each kind of number may be: from the damage facts (counts, shares, ranks, positions, pixel figures,
    the photo's size) and from the passages (any number, and the percentages)."""
    counts = {m.group(1).lower(): int(m.group(2)) for m in
              re.finditer(r"^- (intact|damaged|destroyed):\s*(\d+)", fact_text, re.MULTILINE | re.IGNORECASE)}
    total = [int(m.group(1)) for m in re.finditer(r"^- all [^:\n]*:\s*(\d+)", fact_text, re.MULTILINE | re.IGNORECASE)]
    size = {int(n) for m in re.finditer(r"(\d+) x (\d+) pixels", fact_text) for n in m.groups()}
    total_n = total[0] if total else sum(counts.values())
    shares = [100 * n / total_n for n in counts.values()] if total_n else []
    return {
        "count": set(counts.values()) | set(total),
        "share": shares,
        "rank": {int(m.group(1) or m.group(2)) for m in RANK.finditer(fact_text)},
        "coord": {tuple(map(int, m.groups())) for m in COORD.finditer(fact_text)},
        "px": {value(m.group(1)) for m in re.finditer(r"([\d,]+) pixels", fact_text)} | size,
        "size": size,
        "passage": {value(m.group(1)) for m in NUMBER.finditer(ID_WORD.sub(lambda w: " " + w.group(0).split("-", 1)[1], passage_text))},
        "passage_pct": {value(m.group(1)) for m in NUMBER.finditer(passage_text) if PCT_AFTER.match(passage_text, m.end())},
        # the passages' own text, without the "[ID] (document, p. N)" header lines (rule 2's exemption)
        "passage_body": {value(m.group(1)) for m in NUMBER.finditer(
            ID_WORD.sub(" ", re.sub(r"^\[[^\]\n]+\] \([^\n]*\)$", " ", passage_text, flags=re.MULTILINE)))},
    }


def sentence_at(text: str, i: int) -> str:
    start = max(text.rfind(c, 0, i) for c in ".!?\n") + 1
    ends = [e for e in (text.find(c, i) for c in ".!?\n") if e != -1]
    return text[start:min(ends) + 1 if ends else len(text)].strip()


def check(text: str, known_numbers: dict, version: int = 2) -> list:
    """Every number in one model-written text, as dicts: token, kind, verdict and the sentence it's in.
    version=1 is the first rule, without "misused"."""
    k = known_numbers
    found = []
    work = re.sub(r"\[[^\]\n]*\]", lambda m: " " * len(m.group(0)), text)        # citation brackets
    work = ID_WORD.sub(lambda m: " " * len(m.group(0)), work)                    # bare guideline IDs
    work = re.sub(r"EMS-98", "EMS-__", work)
    work = LIST_MARK.sub(lambda m: m.group(1) + " " * (len(m.group(0)) - len(m.group(1))), work)

    def blank(m):
        nonlocal work
        work = work[:m.start()] + " " * (m.end() - m.start()) + work[m.end():]

    for m in list(COORD.finditer(work)):
        pair = tuple(map(int, m.groups()))
        found.append({"token": m.group(0), "kind": "position", "verdict": "ok" if pair in k["coord"] else "wrong",
                      "sentence": sentence_at(text, m.start()), "start": m.start(), "end": m.end()})
        blank(m)
    work = ENUM_MARK.sub(lambda m: " " * len(m.group(0)), work)
    for m in list(GRADE.finditer(work)):
        found.append({"token": m.group(0), "kind": "grade", "verdict": "ok", "sentence": sentence_at(text, m.start()),
                      "start": m.start(), "end": m.end()})
        blank(m)
    for m in list(RANK.finditer(work)):
        n = int(m.group(1) or m.group(2))
        found.append({"token": m.group(0), "kind": "rank", "verdict": "ok" if n in k["rank"] else "wrong",
                      "sentence": sentence_at(text, m.start()), "start": m.start(), "end": m.end()})
        blank(m)
    for m in NUMBER.finditer(work):
        token, end = m.group(1), m.end()
        span_end = end                                   # where the number and its unit end in the text
        sentence = sentence_at(text, m.start())
        malformed = "," in token and not GOOD_COMMAS.fullmatch(token)
        v = value(token)
        if PCT_AFTER.match(work, end):
            kind = "share"
            ok = any(abs(v - s) <= 1 for s in k["share"]) or v in k["passage_pct"]
            verdict = "ok" if ok else ("wrong" if DAMAGE_WORD.search(sentence) else "unsourced")
            token += "%"
            span_end = PCT_AFTER.match(work, end).end()
        elif PX_AFTER.match(work, end):
            kind, verdict = "pixels", ("ok" if v in k["px"] else "wrong")
            token += " pixels"
            span_end = PX_AFTER.match(work, end).end()
        elif COUNT_AFTER.match(work, end):
            kind, verdict = "count", ("ok" if v in k["count"] else "wrong")
        else:
            kind = "other"
            verdict = "ok" if v in (k["count"] | k["rank"] | k["px"] | k["size"] | k["passage"]) else "unsourced"
            if (version >= 2 and verdict == "ok" and v in k["count"] and v not in k["passage_body"]
                    and resource_near(text, m.start(), end)):
                verdict = "misused"
        if malformed:
            verdict = "wrong"
        found.append({"token": token, "kind": kind, "verdict": verdict, "sentence": sentence,
                      "start": m.start(1), "end": span_end})
    return found


GUARD = "(number not available offline)"


def guard(text: str, facts: str) -> tuple:
    """The last guard (20 Nov, before step 5's run 4): every number still flagged in a kept answer is replaced by
    GUARD, at its own place, so a count used rightly elsewhere stays. Returns the text and the tokens replaced."""
    fact_text, passage_text = sources_of(facts)
    if not fact_text:
        return text, []
    flagged = [n for n in check(text, known(fact_text, passage_text)) if n["verdict"] != "ok"]
    for n in sorted(flagged, key=lambda n: -n["start"]):
        text = text[:n["start"]] + GUARD + text[n["end"]:]
    return text, [n["token"] for n in flagged]


def problems(text: str, facts: str) -> list:
    """For the flow's answer check (fixed_flow.check_answer): (kind, items, note to the model)."""
    fact_text, passage_text = sources_of(facts)
    if not fact_text:
        return []
    numbers = check(text, known(fact_text, passage_text))
    wrong = list(dict.fromkeys(n["token"] for n in numbers if n["verdict"] == "wrong"))
    unsourced = list(dict.fromkeys(n["token"] for n in numbers if n["verdict"] == "unsourced"))
    misused = list(dict.fromkeys(n["token"] for n in numbers if n["verdict"] == "misused"))
    out = []
    if misused:
        out.append(("number_misused", misused, "These numbers are counts of buildings or damage patches from the damage "
                    "facts, used here for something else: " + ", ".join(misused) + ". A count of buildings is not a "
                    "number of staff, teams, shelters or supplies. Write such a number only where the guideline "
                    "sections above give it; otherwise write \"not available offline\"."))
    if wrong:
        out.append(("number_wrong", wrong, "These numbers don't match the damage facts: " + ", ".join(wrong) + ". Write "
                    "every count, share, position and pixel figure exactly as the damage facts give it."))
    if unsourced:
        out.append(("number_unsourced", unsourced, "These numbers are in neither the damage facts nor the guideline "
                    "sections above: " + ", ".join(unsourced) + ". Leave them out; where a number is needed and "
                    "not given, write \"not available offline\"."))
    return out


if __name__ == "__main__":
    # Self-check on sentences from T2 step 5's first run (20 Nov), with Santa Rosa's and Turkey's facts
    rosa = ("=== Facts: damage facts for the photo pair (from the system's damage model; estimates) ===\n"
            "Photo pair: a (before) and b (after); each photo is 1024 x 1024 pixels.\nEstimated areas by damage state:\n"
            "- intact: 45\n- damaged: 3\n- destroyed: 96\n- all areas in the table: 144\n"
            "- hot spot 1: around (991, 779), the south-east of the photo; zone of 684835 pixels\n"
            "- safe area 1: around (100, 923), the south-west of the photo; 386 pixels from the nearest estimated damage\n\n"
            "=== Facts: photo descriptions (from the photo tool) ===\nThe photo shows 12 houses and 100 trees.\n\n"
            "=== Facts: guideline sections (from the guideline search; cite these IDs) ===\n"
            "[SPHERE-3-p1] (Sphere Handbook 2018, Shelter and Settlement, pp. 289-292)\n"
            "The minimum covered living space is 3.5 square metres per person.")
    k = known(*sources_of(rosa))
    assert k["count"] == {45, 3, 96, 144} and (991, 779) in k["coord"] and 684835 in k["px"] and 2018 in k["passage"]
    verdicts = lambda text: [(n["token"], n["verdict"]) for n in check(text, k)]
    assert verdicts("The wildfire caused extensive destruction, with 96% of the area classified as destroyed.") == [("96%", "wrong")]
    assert verdicts("Of the 144 areas, 96 areas (67%) are estimated destroyed.") == [("144", "ok"), ("96", "ok"), ("67%", "ok")]
    assert verdicts("Hot spot 1 is around (991, 779), a zone of 684,835 pixels; safe area 1 is at (100, 923).") == [
        ("(991, 779)", "ok"), ("(100, 923)", "ok"), ("Hot spot 1", "ok"), ("safe area 1", "ok"), ("684,835 pixels", "ok")]
    assert verdicts("1) 10 Medical Personnel and 2 Shifts of 50 logistics staff; 100 workers.") == [
        ("10", "unsourced"), ("2", "unsourced"), ("50", "unsourced"), ("100", "unsourced")]   # only rank 1 here
    assert verdicts("According to the Sphere Handbook 2018 [SPHERE-3-p1], pp. 289-292, it is 3.5 square meters "
                    "per person; EMS-98 Grade 5 and Grades 2 to 4 [EMS98-masonry-grade-5].") == [
        ("Grade 5", "ok"), ("Grades 2 to 4", "ok"), ("2018", "ok"), ("289", "ok"), ("292", "ok"), ("3.5", "ok")]
    assert verdicts("The photo shows 12 houses.") == [("12", "wrong")]          # a count not in the damage facts
    turkey = rosa.replace("- intact: 45\n- damaged: 3\n- destroyed: 96\n- all areas in the table: 144",
                          "- intact: 54\n- damaged: 11\n- destroyed: 32\n- all buildings in the table: 97")
    turkey = turkey.replace("- safe area 1:", "- hot spot 3: around (991, 32), the north-east of the photo; zone of "
                            "28381 pixels\n- safe area 1:")                # in the damage facts, as in a real run
    kt = known(*sources_of(turkey))
    assert [(n["token"], n["verdict"]) for n in check("another hot spot of 283,81 pixels, 32 buildings destroyed", kt)] == [
        ("283,81 pixels", "wrong"), ("32", "ok")]
    assert [p[0] for p in problems("with 96% of the area destroyed and 100 workers", rosa)] == ["number_wrong", "number_unsourced"]
    # Rule 2, on run 2's sentences (Turkey: 54 intact, 11 damaged, 32 destroyed)
    v2 = lambda text, version=2: [(n["token"], n["verdict"]) for n in check(text, kt, version)]
    assert v2("The requirements include 54 medical personnel to provide immediate care.") == [("54", "misused")]
    assert v2("The requirements include 54 medical personnel to provide immediate care.", version=1) == [("54", "ok")]
    assert v2("Additionally, 32 international USAR teams are needed.") == [("32", "misused")]
    assert v2("The number of emergency shelters needed is 54, each accommodating one person.") == [("54", "misused")]
    assert v2("with 32 buildings completely destroyed and 11 others suffering moderate to heavy damage") == [
        ("32", "ok"), ("11", "ok")]
    assert v2("Of the 97 buildings, 54 remain intact.") == [("97", "ok"), ("54", "ok")]
    assert v2("Deploy 3 Light, Medium, and Heavy international USAR teams.") == [("3", "ok")]   # 3: a passage number
    assert [p[0] for p in problems("Send 32 teams.", turkey)] == ["number_misused"]
    # A page number in a passage's header doesn't let a count pass (run 2: INSARAG2B-7.2 is on page 54)
    page54 = turkey + ("\n\n[INSARAG2B-7.2] (INSARAG Guidelines 2020, Vol. II Manual B Operations, p. 54)\n"
                       "Teams work in shifts.")
    kp = known(*sources_of(page54))
    assert 54 in kp["passage"] and 54 not in kp["passage_body"]
    assert [(n["token"], n["verdict"]) for n in check("The response needs 54 medical personnel.", kp)] == [("54", "misused")]
    # Every number's place in the text, and the last guard: only the flagged occurrence is replaced
    t = "Of the 97 buildings, 54 remain intact; the response needs 54 medical personnel and 283,81 pixels."
    for n in check(t, kp):
        assert t[n["start"]:n["end"]] in (n["token"], n["token"].replace(" pixels", "") + " pixels"), n
    guarded, replaced = guard(t, page54)
    assert replaced == ["54", "283,81 pixels"] and guarded == ("Of the 97 buildings, 54 remain intact; the response needs "
                                                               f"{GUARD} medical personnel and {GUARD}.")
    assert guard("Of the 97 buildings, 54 remain intact.", page54) == ("Of the 97 buildings, 54 remain intact.", [])
    assert problems("No number here.", "=== Facts: photo descriptions (from the photo tool) ===\nsome text") == []
    print("number_check self-check passed")
