// The six reports of the offline proof run (11 Nov), word for word. The text is never edited:
// known errors are marked in place and explained underneath.
// ReportsBody is the content; the Reports page shows it in full, and the map's pop-up shows it compact.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { fact, sourceUrl, type Fact } from '../core/facts.ts';

interface DisasTellerReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RUN_PATH = 'Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/';
const ERRORS_SOURCE = 'Essential_task_delegation/Offline_RAG_KR2/README.md';
export const REPORTS = [
  ['Expert_team_report.txt', 'Expert team'],
  ['Alerts_team_report_for_social_media.txt', 'Alerts team'],
  ['Emergency_team_report.txt', 'Emergency team'],
  ['Emergency_service_human_resource_allocation.txt', 'Resource allocation'],
  ['Public_community_report.txt', 'Public community'],
  ['Reconstruction_plan.txt', 'Reconstruction plan'],
] as const;

// Known errors, each checked against the report text. The list follows the report system's own
// README ("Practice run 5", "Quality problems"); the proof run's reports are the same word for word.
const MAP_READING = 'A wrong reading of the map, repeated across reports: the same run grades four streets G4 or G5, with heavy damage or collapse.';
const OWN_NUMBERS = 'These staff and team numbers are the model\'s own plan. No input gives them.';
const KNOWN_ERRORS = [
  { phrase: '123456789', note: 'The model made this hotline number up. No contact detail was in its inputs.' },
  { phrase: 'temporary command center', note: 'The model made up the hall\'s role as a command centre. No input says so.' },
  { phrase: 'No high-risk zones were detected', note: MAP_READING },
  { phrase: 'no high-risk zones were identified', note: MAP_READING },
  { phrase: 'no dangerous zones', note: MAP_READING },
  { phrase: 'no additional medical points are required', note: MAP_READING },
  { phrase: 'The hurricane in Picture5.png', note: 'The disaster was an earthquake. The model calls this photo a hurricane.' },
  { phrase: 'water inundation', note: 'Given as a reason for the grade; it comes from the photo the model called a hurricane.' },
  { phrase: 'the collapsed bridge on South Central Asaichi Street', note: 'No input places the bridge on this street.' },
  { phrase: '10 medical professionals', note: OWN_NUMBERS },
  { phrase: '3 Light, 2 Medium, and 1 Heavy', note: OWN_NUMBERS },
  { phrase: '[EMS98-rc-grade-5]', note: 'A real guideline passage, but one the model was never shown: no search of the run returned it.' },
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

/** What every view of the reports says first. */
export function ReportCaveats() {
  const proof = fact('proof_run') as (Fact & { value: Record<string, number> }) | undefined;
  return (
    <ul className="ws-caveats">
      <li>These reports are about DisasTeller's own sample inputs: six ground photos from Wajima, Japan, and a map. They are not about our satellite pairs. The link from our damage map to the report isn't connected yet.</li>
      <li>Our fine-tuned Qwen2.5-VL-7B wrote them on 11 Nov with the internet off, inside DisasTeller, a published report system that we rewired to run on our model.</li>
      <li>Their quality hasn't been judged yet, and they contain errors. Known errors are marked in the text; the text itself is never edited.</li>
      {proof && <li>Only the Expert team report cites guideline passages by name: {proof.value.citations} citations, all pointing to real passages. The other five cite nothing by name. <a href={sourceUrl(proof.source)}>Run summary</a></li>}
    </ul>
  );
}

/** The report picker and the chosen report, word for word, with its known errors marked. */
export function ReportsBody({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const file = REPORTS[tab][0];

  useEffect(() => {
    if (file in texts) return;
    let current = true;
    fetch(`/reports/offline/${file}`).then((r) => (r.ok ? r.text() : null)).catch(() => null)
      .then((t) => { if (current) setTexts((all) => ({ ...all, [file]: t })); });
    return () => { current = false; };
  }, [file, texts]);

  const text = texts[file];
  const flagged = typeof text === 'string' ? flag(text) : null;
  return (
    <>
      <div className="ws-tabs" role="tablist" aria-label="Report">
        {REPORTS.map(([f, name], i) => <button key={f} type="button" role="tab" aria-selected={tab === i} onClick={() => onTab(i)}>{name}</button>)}
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
          {flagged.notes.length > 0 ? (
            <>
              <ol className="ws-flags">{flagged.notes.map((n) => <li key={n}>{n}</li>)}</ol>
              <p className="ws-note">Known errors follow the report system's own notes: <a href={sourceUrl(ERRORS_SOURCE)}>its README</a>, "Practice run 5", "Quality problems". Other errors may be unmarked: nobody has judged these reports yet.</p>
            </>
          ) : <p className="ws-note">No known error is marked in this report. That doesn't mean it has none: nobody has judged these reports yet.</p>}
        </>
      )}
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
