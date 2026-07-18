import type { Key } from '@lichess-org/chessground/types';

/**
 * Computes the pixel offset of a square's center relative to the board container's own
 * top-left corner, assuming a square container (`width === height`) and white orientation.
 * Used to drive real mouse interactions at exact coordinates via Playwright's
 * `sourcePosition` / `targetPosition` drag options, rather than guessing at DOM selectors —
 * chessground only renders `<square>` elements for currently-highlighted squares, so most
 * squares have no reliably queryable element of their own.
 */
export function squareOffset(containerSize: number, key: Key): { x: number; y: number } {
  const files = 'abcdefgh';
  const file = files.indexOf(key[0] ?? '');
  const rank = Number(key[1]) - 1;
  const squareSize = containerSize / 8;
  const col = file;
  const row = 7 - rank;
  return { x: (col + 0.5) * squareSize, y: (row + 0.5) * squareSize };
}

/**
 * Same as `squareOffset`, but normalized to a 0..1 fraction of the board's width/height
 * instead of an absolute pixel offset. Vitest Browser Mode renders test content inside a
 * scaled iframe, so a client-side pixel size (e.g. the `width` passed via inline `style`) does
 * not match the board's actual rendered size in page-absolute coordinates — a fraction is
 * scale-independent, safe to multiply against a Playwright `boundingBox()` result.
 */
export function squareFraction(key: Key): { x: number; y: number } {
  const files = 'abcdefgh';
  const file = files.indexOf(key[0] ?? '');
  const rank = Number(key[1]) - 1;
  const col = file;
  const row = 7 - rank;
  return { x: (col + 0.5) / 8, y: (row + 0.5) / 8 };
}
