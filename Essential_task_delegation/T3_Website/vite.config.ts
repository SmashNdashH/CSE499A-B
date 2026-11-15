import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Cross-origin isolation: without these two headers the in-browser model runs on one thread.
// vercel.json sends the same headers in production.
const ISOLATION = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

/** `virtual:facts`: the facts file without anything dated after the build date. */
function facts(): Plugin {
  const file = path.resolve(import.meta.dirname, 'src/data/facts.json');
  return {
    name: 'facts',
    resolveId: (id) => (id === 'virtual:facts' ? '\0virtual:facts' : null),
    load(id) {
      if (id !== '\0virtual:facts') return null;
      this.addWatchFile(file);
      const buildDate = process.env.FACTS_DATE ?? new Intl.DateTimeFormat('en-CA').format(new Date());
      const all: { public_from: string; find?: unknown }[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      const shown = all.filter((f) => f.public_from <= buildDate).map(({ find: _find, ...f }) => f);
      return `export const buildDate = ${JSON.stringify(buildDate)};\nexport const facts = ${JSON.stringify(shown)};`;
    },
  };
}

/**
 * Development fixtures. They are served at /data/ by the dev server and copied into a build only
 * in `--mode fixtures` (which writes to dist-fixtures/). The normal build never sees them.
 */
function fixtures(mode: string): Plugin {
  const dir = path.resolve(import.meta.dirname, 'fixtures/data');
  let outDir = '';
  return {
    name: 'fixtures',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    configureServer(server) {
      if (fs.existsSync(path.resolve(import.meta.dirname, 'public/data/index.json')) && JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, 'public/data/index.json'), 'utf8')).pairs.length) return;
      server.middlewares.use('/data', (req, res, next) => {
        const file = path.join(dir, decodeURIComponent((req.url ?? '').split('?')[0]));
        if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next();
        const type = { '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain' }[path.extname(file)];
        res.writeHead(200, { ...ISOLATION, 'Content-Type': type ?? 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (mode !== 'fixtures') return;
      if (path.basename(outDir) === 'dist') throw new Error('Fixtures must not be built into dist/. Use `npm run build:fixtures`.');
      fs.cpSync(dir, path.join(outDir, 'data'), { recursive: true });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), facts(), fixtures(mode)],
  server: { host: '127.0.0.1', port: 3000, headers: ISOLATION },
  preview: { host: '127.0.0.1', port: 4173, headers: ISOLATION },
}));
