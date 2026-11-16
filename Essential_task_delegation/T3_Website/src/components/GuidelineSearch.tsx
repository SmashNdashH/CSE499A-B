// What the offline guideline search returned for the report system's own fixed queries, during the
// proof run of 11 Nov (internet off). The passages are quoted word for word from the guideline index;
// nothing is computed from them, and they are not advice about the pair on the map.
// Data: public/guidelines/searches.json, built and checked by scripts/make-guidelines.ts.
import { useEffect, useState } from 'react';
import { sourceUrl } from '../core/facts.ts';

export interface Passage { id: string; doc: string; section: string; page_start: number; page_end: number; text: string }
export interface Search { order: number; query: string; report: string | null; passages: (Passage & { rank: number })[] }
export interface Citation { id: string; times: number; shown: boolean; passage: Passage | null }
export interface RunFile {
  run: string;
  index: string;
  searches: Search[];
  citations: Citation[];
  evidence: { verdict: string; rules: Record<string, boolean>; network_events: number; hosts: string[]; outside: string[]; gemini_modules_loaded: string[]; sources: string[] };
}

let cache: Promise<RunFile | null> | null = null;
const load = () => (cache ??= fetch('/guidelines/searches.json').then((r) => (r.ok ? r.json() : null)).catch(() => null));

/** The proof run's searches, citations and evidence: undefined while loading, null if the file is missing. */
export function useRunFile(): RunFile | null | undefined {
  const [file, setFile] = useState<RunFile | null | undefined>(undefined);
  useEffect(() => { let on = true; load().then((f) => { if (on) setFile(f); }); return () => { on = false; }; }, []);
  return file;
}

export const pages = (p: Passage) => (p.page_start === p.page_end ? `page ${p.page_start}` : `pages ${p.page_start} to ${p.page_end}`);

export function PassageQuote({ p }: { p: Passage }) {
  return (
    <>
      <blockquote>{p.text}</blockquote>
      <p className="ws-note">Passage <span className="num">{p.id}</span>: {p.doc}, {pages(p)}.</p>
    </>
  );
}

/** With `report`, only the searches that fed that report's sections are offered. */
export function GuidelineSearch({ report }: { report?: string }) {
  const file = useRunFile();
  const [pick, setPick] = useState(0);
  if (file === undefined) return <p className="ws-note">Loading the guideline passages.</p>;
  if (file === null) return <p className="ws-missing">The guideline passages are missing from this build.</p>;
  const list = report ? file.searches.filter((s) => s.report === report) : file.searches;
  if (!list.length) return <p className="ws-note">No guideline search ran for this report, so it was written without any guideline passage.</p>;
  const s = list[Math.min(pick, list.length - 1)];
  return (
    <div className="gs">
      {!report && (
        <p className="ws-note">
          These are the searches the report system ran on its own while writing the six offline reports (11 Nov, internet off),
          and the three passages the offline search returned for each, word for word. They are quotes from the guidelines,
          not advice about the pair on the map, and the first passage is not always the best answer.
        </p>
      )}
      <label className="gs-pick">
        <span>Search {report ? `(${list.length} fed this report)` : ''}</span>
        <select value={Math.min(pick, list.length - 1)} onChange={(e) => setPick(Number(e.target.value))}>
          {list.map((x, i) => <option key={x.order} value={i}>{x.query}</option>)}
        </select>
      </label>
      <ol className="gs-results" aria-live="polite">
        {s.passages.map((p) => (
          <li key={p.id}>
            <details open={p.rank === 1}>
              <summary><span className="num">{p.rank}.</span> {p.doc}, {pages(p)}<small>{p.section}</small></summary>
              <PassageQuote p={p} />
            </details>
          </li>
        ))}
      </ol>
      <p className="ws-note">Sources: <a href={sourceUrl(file.run)}>the run's log</a> and <a href={sourceUrl(file.index)}>the guideline index</a>.</p>
    </div>
  );
}
