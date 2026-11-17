// The six reports of the offline proof run (11 Nov), word for word. The text is never edited:
// known errors are marked in place and explained underneath (the list is in core/reportNotes.ts).
// ReportsBody is the content; the Reports page shows it in full, and the map's pop-up shows it compact.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { fact, sourceUrl, type Fact } from '../core/facts.ts';
import { KNOWN_ERRORS, REPORT_NOTES, REPORTS } from '../core/reportNotes.ts';
import { COURSE, DECISION_LINE } from '../site/shared.tsx';

interface DisasTellerReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RUN_PATH = 'Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/';
const ERRORS_SOURCE = 'Essential_task_delegation/Offline_RAG_KR2/README.md';
const CALL_LOG = 'Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/llm_calls.jsonl';

/** Splits the text at each known error and wraps it in a mark. Returns the nodes and the notes that apply. */
function flag(text: string): { nodes: ReactNode[]; notes: string[] } {
  const nodes: ReactNode[] = [];
  const notes: string[] = [];
  let rest = text;
  let key = 0;
  for (;;) {
    let first: { at: number; e: (typeof KNOWN_ERRORS)[number] } | null = null;
    for (const e of KNOWN_ERRORS) {
      const at = rest.indexOf(e.phrase);
      if (at >= 0 && (!first || at < first.at)) first = { at, e };
    }
    if (!first) break;
    if (!notes.includes(first.e.note)) notes.push(first.e.note);
    nodes.push(rest.slice(0, first.at), <mark key={key++} title={first.e.note}>{first.e.phrase}<sup>{notes.indexOf(first.e.note) + 1}</sup></mark>);
    rest = rest.slice(first.at + first.e.phrase.length);
  }
  nodes.push(rest);
  return { nodes, notes };
}

/** The chosen report alone goes to the printer, with its caveats, its notes and the decision line. */
function printReport() {
  const root = document.documentElement;
  root.dataset.printing = 'report';
  window.addEventListener('afterprint', () => { delete root.dataset.printing; }, { once: true });
  window.print();
}

/** What every view of the reports says first. */
export function ReportCaveats() {
  const proof = fact('proof_run') as (Fact & { value: Record<string, number> }) | undefined;
  return (
    <ul className="ws-caveats">
      <li>These reports are about DisasTeller's own sample inputs: six ground photos from Wajima, Japan, and a map. They are not about our satellite pairs. The link from our damage map to the report isn't connected yet.</li>
      <li>Our fine-tuned Qwen2.5-VL-7B wrote them on 11 Nov with the internet off, inside DisasTeller, a published report system that we rewired to run on our model.</li>
      <li>Their quality hasn't been judged yet, and they contain errors. Known errors are marked in the text; the text itself is never edited.</li>
      {proof && (
        <li>
          Only the Expert team report cites guideline passages in square brackets: {proof.value.citations} citations, all pointing to real passages.
          The Reconstruction plan names its passages in an appendix, without brackets. The other four cite none, although the Emergency team,
          Resource allocation and Public community reports were each given passages. <a href={sourceUrl(proof.source)}>Run summary</a>
        </li>
      )}
    </ul>
  );
}

/** The report picker and the chosen report, word for word, with its known errors marked. `print` adds a Print button. */
export function ReportsBody({ tab, onTab, print }: { tab: number; onTab: (i: number) => void; print?: boolean }) {
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [file, name] = REPORTS[tab];

  useEffect(() => {
    if (file in texts) return;
    let current = true;
    fetch(`/reports/offline/${file}`).then((r) => (r.ok ? r.text() : null)).catch(() => null)
      .then((t) => { if (current) setTexts((all) => ({ ...all, [file]: t })); });
    return () => { current = false; };
  }, [file, texts]);

  const text = texts[file];
  const flagged = typeof text === 'string' ? flag(text) : null;
  const unmarked = REPORT_NOTES[file] ?? [];
  return (
    <>
      <div className="ws-tabs" role="tablist" aria-label="Report">
        {REPORTS.map(([f, label], i) => <button key={f} type="button" role="tab" aria-selected={tab === i} onClick={() => onTab(i)}>{label}</button>)}
      </div>
      <div className="print-area">
        {/* A printed sheet leaves the page behind, so it carries what the page says around the report. */}
        <div className="print-only">
          <h2>The {name} report, written offline by our model</h2>
          <ReportCaveats />
        </div>
        <p className="ws-note">Model output, word for word: <a href={sourceUrl(RUN_PATH + file)}>{file}</a></p>
        {typeof text === 'string' && (
          <>
            <div className="ws-actions">
              <a className="ws-chip" href={`/reports/offline/${file}`} download={file}>Download this report (.txt)</a>
              <button type="button" className="ws-chip" onClick={() => { navigator.clipboard?.writeText(text).then(() => setCopied(file), () => setCopied(null)); }}>
                {copied === file ? 'Copied' : 'Copy the text'}
              </button>
              {print && <button type="button" className="ws-chip" onClick={printReport}>Print this report</button>}
            </div>
            <p className="ws-note no-print">
              The download and the copy are the report exactly as the model wrote it, so its known errors are not marked there. They are listed under the report.
              {print && ' A printout carries the marks, the notes and the lines above.'}
            </p>
          </>
        )}
        {text === undefined && <p className="ws-note">Loading the report.</p>}
        {text === null && <p className="ws-missing">This report's file is missing from the build.</p>}
        {flagged && (
          <>
            <pre className="ws-report">{flagged.nodes}</pre>
            {flagged.notes.length > 0
              ? <ol className="ws-flags">{flagged.notes.map((n) => <li key={n}>{n}</li>)}</ol>
              : <p className="ws-note">No phrase is marked in this report. That doesn't mean it has no error: nobody has judged these reports yet.</p>}
            {unmarked.length > 0 && (
              <>
                <p className="ws-flags-more">Also known about this report, with no single phrase to mark:</p>
                <ul className="ws-flags ws-flags-plain">{unmarked.map((n) => <li key={n}>{n}</li>)}</ul>
              </>
            )}
            <p className="ws-note">
              The marks and notes follow the report system's own notes: <a href={sourceUrl(ERRORS_SOURCE)}>its README</a>, "Practice run 5", "Quality problems".
              One mark isn't in those notes, the hall as a "temporary command center": <a href={sourceUrl(CALL_LOG)}>the run's log</a> shows the phrase first in the model's own answer, and in none of its inputs.
              Other errors may be unmarked: nobody has judged these reports yet.
            </p>
          </>
        )}
        <p className="print-only print-foot">{DECISION_LINE} {COURSE}.</p>
      </div>
    </>
  );
}

export function DisasTellerReportsModal({ isOpen, onClose }: DisasTellerReportsModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  return (
    <dialog ref={ref} className="ws-dialog" onClose={onClose} aria-labelledby="reports-title" {...{ closedby: 'any' }}>
      <header>
        <h2 id="reports-title">The six offline reports</h2>
        <button type="button" className="ws-chip" onClick={onClose}>Close</button>
      </header>
      {isOpen && (
        <div className="ws-dialog-body">
          <ReportCaveats />
          <ReportsBody tab={tab} onTab={setTab} />
        </div>
      )}
    </dialog>
  );
}
