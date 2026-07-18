import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'node_modules/@lichess-org/chessground/assets');
const outDir = path.join(root, 'dist');

mkdirSync(outDir, { recursive: true });

const read = (name) => readFileSync(path.join(assetsDir, name), 'utf8');

const base = read('chessground.base.css');
const brown = read('chessground.brown.css');
const cburnett = read('chessground.cburnett.css');

const banner = (label) =>
  `/*!\n * ${label}\n * Sourced from @lichess-org/chessground's own shipped assets.\n */\n`;

writeFileSync(path.join(outDir, 'base.css'), banner('chessground base (structural) CSS') + base);

writeFileSync(
  path.join(outDir, 'style.css'),
  [
    banner('chessground default theme: base + brown board + cburnett pieces'),
    base,
    brown,
    cburnett,
  ].join('\n'),
);

console.log('[build-css] wrote dist/base.css and dist/style.css');
