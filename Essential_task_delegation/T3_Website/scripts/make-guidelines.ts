// Builds public/guidelines/searches.json from the offline proof run of 11 Nov:
//   - its 18 guideline searches, each with the three passages the offline search returned, word
//     for word from the guideline index, and the report whose sections were written after it;
//   - the Expert team report's citations, each with the passage it names and whether any search
//     of the run had returned that passage (so whether the model was shown it);
//   - the run's evidence: the rules it passed and its network log.
// Nothing is computed from the passages: they are quoted.
//
//   node scripts/make-guidelines.ts           write the file
//   node scripts/make-guidelines.ts --check   fail if the file differs from its sources (run by the build)
//
// Sources (tracked in git, read-only), all under Essential_task_delegation/Offline_RAG_KR2/:
//   results/t2_proof/t2_run_internet_off/run/{llm_calls.jsonl, t2_run_summary.json, netlog.json}
//   results/t2_proof/t2_run_internet_off/run/reports/offline/Expert_team_report.txt
//   guideline_chunks.jsonl
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..', '..');
const KR2 = 'Essential_task_delegation/Offline_RAG_KR2/';
const RUN_DIR = KR2 + 'results/t2_proof/t2_run_internet_off/run/';
const RUN = RUN_DIR + 'llm_calls.jsonl';
const INDEX = KR2 + 'guideline_chunks.jsonl';
const OUT = path.join(SITE, 'public', 'guidelines', 'searches.json');

const read = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8');
const lines = (p: string) => read(p).split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const chunks = new Map(lines(INDEX).map((c: any) => [c.id, c]));
const passage = (id: string) => {
  const c: any = chunks.get(id);
  return c ? { id, doc: c.doc, section: c.section, page_start: c.page_start, page_end: c.page_end, text: c.text } : null;
};

// Each search belongs to the report whose first section comes next in the log.
const calls = lines(RUN);
const searches = calls.map((r: any, i: number) => ({ r, i })).filter(({ r }) => r.kind === 'search').map(({ r, i }, n) => ({
  order: n + 1,
  query: r.query as string,
  report: (calls.slice(i).find((x: any) => x.kind === 'section')?.report ?? null) as string | null,
  passages: (r.ids as string[]).map((id, rank) => {
    const p = passage(id);
    if (!p) throw new Error(`search ${n + 1}: passage ${id} is not in the guideline index`);
    return { rank: rank + 1, ...p };
  }),
}));
if (searches.length !== 18) throw new Error(`expected the run's 18 searches, found ${searches.length}`);

// The Expert team report's citations: [ID] in its text.
const expert = read(RUN_DIR + 'reports/offline/Expert_team_report.txt');
const returned = new Set(searches.flatMap((s) => s.passages.map((p) => p.id)));
const cited = [...expert.matchAll(/\[([A-Za-z0-9.-]+)\]/g)].map((m) => m[1]);
const citations = [...new Set(cited)].map((id) => ({
  id,
  times: cited.filter((c) => c === id).length,
  /** Whether any search of the run returned this passage, so whether the model was given it. */
  shown: returned.has(id),
  /** null would mean the cited passage doesn't exist in the index. */
  passage: passage(id),
}));

const summary = JSON.parse(read(RUN_DIR + 't2_run_summary.json'));
const netlog = JSON.parse(read(RUN_DIR + 'netlog.json'));
if (cited.length !== summary.signals.total_citations) throw new Error(`the Expert report has ${cited.length} citations; the run summary says ${summary.signals.total_citations}`);
const evidence = {
  verdict: summary.verdict,
  rules: summary.rules,
  network_events: netlog.lookups_and_connections,
  hosts: [...new Set(netlog.events.map((e: any) => `${e.host}:${e.port}`))],
  outside: netlog.external,
  gemini_modules_loaded: netlog.gemini_modules_loaded,
  sources: [RUN_DIR + 't2_run_summary.json', RUN_DIR + 'netlog.json'],
};

const out = JSON.stringify({ run: RUN, index: INDEX, searches, citations, evidence }, null, 1) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== out) {
    console.error(`${path.relative(SITE, OUT)} doesn't match its sources. Run: node scripts/make-guidelines.ts`);
    process.exit(1);
  }
  console.log(`guideline passages: 18 searches, ${searches.length * 3} passages and ${cited.length} citations, word for word from the run and the guideline index`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out);
  console.log(`wrote ${path.relative(SITE, OUT)} (${(out.length / 1024).toFixed(0)} KB)`);
}
