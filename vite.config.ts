import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'chess-js/index': resolve(__dirname, 'src/chess-js/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'chess.js',
        '@lichess-org/chessground',
        '@lichess-org/chessground/api',
        '@lichess-org/chessground/config',
        '@lichess-org/chessground/types',
        '@lichess-org/chessground/draw',
        '@lichess-org/chessground/fen',
      ],
    },
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
