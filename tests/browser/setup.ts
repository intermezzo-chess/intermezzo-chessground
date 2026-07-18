import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Chessground's structural CSS isn't just cosmetic — custom elements like `cg-board` default
// to `display: inline` without it, which collapses the board's measured bounds and breaks the
// pixel-based positioning these interaction tests rely on.
import '@lichess-org/chessground/assets/chessground.base.css';

// Without this, a previous test's still-mounted <Chessground> (and its document-level drag
// listeners) stays alive into the next test — real, unmocked chessground instances stacking up
// on the same page causes genuine cross-test interference, not just DOM clutter.
afterEach(cleanup);
