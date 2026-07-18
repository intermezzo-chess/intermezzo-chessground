import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Explicit rather than relying on Testing Library's `afterEach`-global auto-detection, so
// cleanup behaves the same regardless of whether `test.globals` is enabled.
afterEach(cleanup);

// jsdom stubs `getBoundingClientRect()` to an all-zero rect by default. Left as-is, that would
// make every test that mounts a board look like a zero-size-container integration mistake (see
// the dev warning in useChessground.ts). Default to a reasonable non-zero board size instead;
// a test that specifically wants to exercise zero-size behavior can override this locally.
const DEFAULT_RECT: DOMRect = {
  width: 480,
  height: 480,
  top: 0,
  left: 0,
  right: 480,
  bottom: 480,
  x: 0,
  y: 0,
  toJSON() {
    return this;
  },
};

let originalGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;

beforeEach(() => {
  originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = () => DEFAULT_RECT;
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
});
