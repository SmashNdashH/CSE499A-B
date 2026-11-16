// Reports: the six offline reports, the evidence that the run stayed offline, and the grounding:
// which guideline searches fed each report, and each citation beside the passage it names.
import { useState } from 'react';
import { sourceUrl } from '../core/facts.ts';
import { REPORTS, ReportCaveats, ReportsBody } from '../components/DisasTellerReportsModal.tsx';
import { GuidelineSearch, PassageQuote, useRunFile } from '../components/GuidelineSearch.tsx';

export default function Reports() {
  const [tab, setTab] = useState(0);
  const run = useRunFile();
  const [file, name] = REPORTS[tab];
  return (
    <>
      <section className="a-section a-page" aria-labelledby="reports-h1">
        <h1 id="reports-h1">The six offline reports</h1>
        <div className="a-panel"><ReportCaveats /></div>
      </section>

      <section className="a-section" aria-labelledby="reports-read">
        <h2 id="reports-read">Read a report</h2>
        <div className="a-reports">
          <div className="a-panel"><ReportsBody tab={tab} onTab={setTab} /></div>
          <aside className="a-panel" aria-label={`Guideline passages given to the ${name} report`}>
            <h3>What the guidelines gave this report</h3>
            <p className="ws-note">Before writing the {name} report, the system ran these guideline searches and gave the model the passages they returned.</p>
            <GuidelineSearch key={file} report={file} />
          </aside>
        </div>
      </section>

      <section className="a-section" aria-labelledby="reports-cites">
        <h2 id="reports-cites">The citations, beside what they cite</h2>
        <p className="a-lede">Only the Expert team report cites guideline passages by name. Each citation is shown here with the passage it names, word for word.</p>
        {run === undefined && <p className="ws-note">Loading the citations.</p>}
        {run === null && <p className="ws-missing">The citations file is missing from this build.</p>}
        {run && (
          <ul className="a-cites">
            {run.citations.map((c) => (
              <li key={c.id} className="a-panel">
                <h3><span className="num">[{c.id}]</span> cited {c.times === 1 ? 'once' : `${c.times} times`}</h3>
                {c.passage ? <PassageQuote p={c.passage} /> : <p className="ws-missing">This passage could not be found in the guideline index.</p>}
                {!c.shown && <p className="ws-missing">The model was never shown this passage: no search of the run returned it. The passage is real, but the model cited it from its own memory.</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="a-section" aria-labelledby="reports-proof">
        <h2 id="reports-proof">Proof that the run stayed offline</h2>
        {run === null && <p className="ws-missing">The run's evidence is missing from this build.</p>}
        {run && (
          <div className="a-panel">
            <table className="ws-table">
              <thead><tr><th scope="col">Rule fixed before the run</th><th scope="col">Result</th></tr></thead>
              <tbody>
                {Object.entries(run.evidence.rules).map(([rule, ok]) => (
                  <tr key={rule}><th scope="row">{rule.replace(/^\d+\.\s*/, '')}</th><td>{ok ? 'passed' : 'failed'}</td></tr>
                ))}
              </tbody>
            </table>
            <p>
              The run's network log recorded <span className="num">{run.evidence.network_events}</span> lookups and connections, all to{' '}
              <span className="num">{run.evidence.hosts.join(', ')}</span> (the model's own server on the same machine), and{' '}
              {run.evidence.outside.length === 0 ? 'none' : run.evidence.outside.length} to anywhere else.{' '}
              {run.evidence.gemini_modules_loaded.length === 0 ? 'No Gemini library was loaded.' : `Gemini libraries loaded: ${run.evidence.gemini_modules_loaded.join(', ')}.`}
            </p>
            <p className="ws-note">
              This shows the run needed no internet. It doesn't show the reports are good.
              Sources: {run.evidence.sources.map((s, i) => <span key={s}>{i > 0 && ' and '}<a href={sourceUrl(s)}>{s.split('/').pop()}</a></span>)}.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
