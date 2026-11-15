// Builds public/guidelines/searches.json: the 18 guideline searches the report system ran in its
// offline proof run (11 Nov), each with the three passages the offline search returned, word for
// word from the guideline index. Nothing is computed from them: they are quoted.
//
//   node scripts/make-guidelines.ts           write the file
//   node scripts/make-guidelines.ts --check   fail if the file differs from its sources (run by the build)
//
// Sources (tracked in git, read-only):
//   Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/llm_calls.jsonl
//   Essential_task_delegation/Offline_RAG_KR2/guideline_chunks.jsonl
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..', '..');
const RUN = 'Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/llm_calls.jsonl';
const INDEX = 'Essential_task_delegation/Offline_RAG_KR2/guideline_chunks.jsonl';
const OUT = path.join(SITE, 'public', 'guidelines', 'searches.json');

const lines = (p: string) => fs.readFileSync(path.join(REPO, p), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const chunks = new Map(lines(INDEX).map((c: any) => [c.id, c]));
const searches = lines(RUN).filter((r: any) => r.kind === 'search').map((r: any, i: number) => ({
  order: i + 1,
  query: r.query as string,
  passages: (r.ids as string[]).map((id, rank) => {
    const c: any = chunks.get(id);
    if (!c) throw new Error(`search ${i + 1}: passage ${id} is not in the guideline index`);
    return { rank: rank + 1, id, doc: c.doc, section: c.section, page_start: c.page_start, page_end: c.page_end, text: c.text };
  }),
}));
if (searches.length !== 18) throw new Error(`expected the run's 18 searches, found ${searches.length}`);

const out = JSON.stringify({ run: RUN, index: INDEX, searches }, null, 1) + '\n';
if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT) || fs.readFileSync(OUT, 'utf8') !== out) {
    console.error(`${path.relative(SITE, OUT)} doesn't match its sources. Run: node scripts/make-guidelines.ts`);
    process.exit(1);
  }
  console.log(`guideline passages: 18 searches, ${searches.length * 3} passages, word for word from the guideline index`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out);
  console.log(`wrote ${path.relative(SITE, OUT)} (${(out.length / 1024).toFixed(0)} KB)`);
}
