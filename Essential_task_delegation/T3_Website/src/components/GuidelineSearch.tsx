// What the offline guideline search returned for the report system's own fixed queries, during the
// proof run of 11 Nov (internet off). The passages are quoted word for word from the guideline index;
// nothing is computed from them, and they are not advice about the pair on the map.
// Data: public/guidelines/searches.json, built and checked by scripts/make-guidelines.ts.
import { useEffect, useState } from 'react';
import { sourceUrl } from '../core/facts.ts';

interface Passage { rank: number; id: string; doc: string; section: string; page_start: number; page_end: number; text: string }
interface Search { order: number; query: string; passages: Passage[] }
interface SearchFile { run: string; index: string; searches: Search[] }

let cache: Promise<SearchFile | null> | null = null;
const load = () => (cache ??= fetch('/guidelines/searches.json').then((r) => (r.ok ? r.json() : null)).catch(() => null));

const pages = (p: Passage) => (p.page_start === p.page_end ? `page ${p.page_start}` : `pages ${p.page_start} to ${p.page_end}`);

export function GuidelineSearch() {
  const [file, setFile] = useState<SearchFile | null | undefined>(undefined);
  const [pick, setPick] = useState(0);
  useEffect(() => { let on = true; load().then((f) => { if (on) setFile(f); }); return () => { on = false; }; }, []);

  if (file === undefined) return <p className="ws-note">Loading the guideline passages.</p>;
  if (file === null) return <p className="ws-missing">The guideline passages are missing from this build.</p>;
  const s = file.searches[pick];
  return (
    <div className="gs">
      <p className="ws-note">
        These are the searches the report system ran on its own while writing the six offline reports (11 Nov, internet off),
        and the three passages the offline search returned for each, word for word. They are quotes from the guidelines,
        not advice about the pair on the map, and the first passage is not always the best answer.
      </p>
      <label className="gs-pick">
        <span>Search</span>
        <select value={pick} onChange={(e) => setPick(Number(e.target.value))}>
          {file.searches.map((x, i) => <option key={x.order} value={i}>{x.query}</option>)}
        </select>
      </label>
      <ol className="gs-results" aria-live="polite">
        {s.passages.map((p) => (
          <li key={p.id}>
            <details open={p.rank === 1}>
              <summary><span className="num">{p.rank}.</span> {p.doc}, {pages(p)}<small>{p.section}</small></summary>
              <blockquote>{p.text}</blockquote>
              <p className="ws-note">Passage <span className="num">{p.id}</span> in the offline guideline index.</p>
            </details>
          </li>
        ))}
      </ol>
      <p className="ws-note">Sources: <a href={sourceUrl(file.run)}>the run's log</a> and <a href={sourceUrl(file.index)}>the guideline index</a>.</p>
    </div>
  );
}
