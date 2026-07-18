import type { BrowserCommand } from 'vitest/node';

/**
 * A real right-button drag, dispatched via Playwright's raw mouse API. Needed because
 * chessground's shape-drawing interaction (arrows/circles) is a right-click drag, and the
 * higher-level `userEvent.dragAndDrop` helper only supports the left mouse button.
 *
 * `from`/`to` are 0..1 fractions of the board's width/height (see `squareFraction`), not pixel
 * offsets — Vitest Browser Mode renders test content inside a scaled iframe, so a client-side
 * pixel size doesn't match the board's actual rendered size in page-absolute coordinates.
 * `iframe.locator('.cg-wrap').boundingBox()` gives the board's real, already-scaled
 * page-absolute box, which a fraction can be safely multiplied against.
 */
export const rightClickDrag: BrowserCommand<
  [from: { x: number; y: number }, to: { x: number; y: number }]
> = async ({ page, iframe }, from, to) => {
  const box = await iframe.locator('.cg-wrap').first().boundingBox();
  if (!box) throw new Error('rightClickDrag: no ".cg-wrap" element found in the test iframe');

  const start = { x: box.x + from.x * box.width, y: box.y + from.y * box.height };
  const end = { x: box.x + to.x * box.width, y: box.y + to.y * box.height };

  await page.mouse.move(start.x, start.y);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(end.x, end.y, { steps: 5 });
  // chessground tracks the shape's destination square via a `requestAnimationFrame` polling
  // loop (see draw.ts's `processDraw`), not synchronously on `mousemove` — without yielding to
  // at least one real frame here, `mouseup` fires before that loop ever samples a destination
  // square, and no shape gets committed.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await page.mouse.up({ button: 'right' });
};

declare module 'vitest/browser' {
  interface BrowserCommands {
    rightClickDrag: (from: { x: number; y: number }, to: { x: number; y: number }) => Promise<void>;
  }
}
