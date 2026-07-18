import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Aliased directly to `src/` (not the built `dist/`) so the demo hot-reloads against the
// library's source during development, with no separate build step in between.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@intermezzo/chessground-react/chess-js': resolve(__dirname, '../src/chess-js/index.ts'),
      '@intermezzo/chessground-react': resolve(__dirname, '../src/index.ts'),
    },
  },
});
