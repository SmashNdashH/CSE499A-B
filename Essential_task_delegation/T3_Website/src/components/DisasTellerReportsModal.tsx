// The six reports of the offline proof run (11 Nov), word for word. The text is never edited:
// known errors are marked in place and explained underneath.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { fact, sourceUrl, type Fact } from '../core/facts.ts';

interface DisasTellerReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RUN_PATH = 'Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/';
const REPORTS = [
  ['Expert_team_report.txt', 'Expert team'],
  ['Alerts_team_report_for_social_media.txt', 'Alerts team'],
  ['Emergency_team_report.txt', 'Emergency team'],
  ['Emergency_service_human_resource_allocation.txt', 'Resource allocation'],
  ['Public_community_report.txt', 'Public community'],
  ['Reconstruction_plan.txt', 'Reconstruction plan'],
] as const;

// Known so far. More are listed in the report system's README and are added with the full reports page.
const KNOWN_ERRORS = [
  { phrase: '123456789', note: 'The model made this hotline number up. No contact detail was in its inputs.' },
  { phrase: 'temporary command center', note: 'The model made up the hall\'s role as a command centre. No input says so.' },
];

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

export function DisasTellerReportsModal({ isOpen, onClose }: DisasTellerReportsModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState(0);
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const file = REPORTS[tab][0];
  const proof = fact('proof_run') as (Fact & { value: Record<string, number> }) | undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || file in texts) return;
    let current = true;
    fetch(`/reports/offline/${file}`).then((r) => (r.ok ? r.text() : null)).catch(() => null)
      .then((t) => { if (current) setTexts((all) => ({ ...all, [file]: t })); });
    return () => { current = false; };
  }, [isOpen, file, texts]);

  const text = texts[file];
  const flagged = typeof text === 'string' ? flag(text) : null;

  return (
    <dialog ref={ref} className="ws-dialog" onClose={onClose} aria-labelledby="reports-title" {...{ closedby: 'any' }}>
      <header>
        <h2 id="reports-title">The six offline reports</h2>
        <button type="button" className="ws-chip" onClick={onClose}>Close</button>
      </header>
      {isOpen && (
        <div className="ws-dialog-body">
          <ul className="ws-caveats">
            <li>These reports are about DisasTeller's own sample inputs: six ground photos from Wajima, Japan, and a map. They are not about our satellite pairs. The link from our damage map to the report isn't connected yet.</li>
            <li>Our fine-tuned Qwen2.5-VL-7B wrote them on 11 Nov with the internet off, inside DisasTeller, a published report system that we rewired to run on our model.</li>
            <li>Their quality hasn't been judged yet, and they contain errors. Known errors are marked in the text; the text itself is never edited.</li>
            {proof && <li>Only the Expert team report cites guideline passages by name: {proof.value.citations} citations, all pointing to real passages. The other five cite nothing by name. <a href={sourceUrl(proof.source)}>Run summary</a></li>}
          </ul>
          <div className="ws-tabs" role="tablist" aria-label="Report">
            {REPORTS.map(([f, name], i) => <button key={f} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{name}</button>)}
          </div>
          <p className="ws-note">Model output, word for word: <a href={sourceUrl(RUN_PATH + file)}>{file}</a></p>
          {typeof text === 'string' && (
            <>
              <div className="ws-actions">
                <a className="ws-chip" href={`/reports/offline/${file}`} download={file}>Download this report (.txt)</a>
                <button type="button" className="ws-chip" onClick={() => { navigator.clipboard?.writeText(text).then(() => setCopied(file), () => setCopied(null)); }}>
                  {copied === file ? 'Copied' : 'Copy the text'}
                </button>
              </div>
              <p className="ws-note">The download and the copy are the report exactly as the model wrote it, so its known errors are not marked there. They are listed under the report.</p>
            </>
          )}
          {text === undefined && <p className="ws-note">Loading the report.</p>}
          {text === null && <p className="ws-missing">This report's file is missing from the build.</p>}
          {flagged && (
            <>
              <pre className="ws-report">{flagged.nodes}</pre>
              {flagged.notes.length > 0 && (
                <ol className="ws-flags">{flagged.notes.map((n) => <li key={n}>{n}</li>)}</ol>
              )}
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
