import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { rightClickDrag } from './tests/browser/commands';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'browser',
    include: ['tests/browser/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/browser/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      commands: { rightClickDrag },
    },
  },
});
