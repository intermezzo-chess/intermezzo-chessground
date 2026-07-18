import type { CSSProperties } from 'react';
import type { Api } from '@lichess-org/chessground/api';
import type { Config } from '@lichess-org/chessground/config';

/**
 * Props for the `<Chessground>` component.
 *
 * Every field from chessground's own `Config` is supported as a top-level prop,
 * grouped exactly as chessground groups it (`movable`, `draggable`, `drawable`, etc.) —
 * see https://github.com/lichess-org/chessground for the authoritative field-by-field docs.
 *
 * Two fields need special attention because chessground only applies them once, at
 * construction time, and silently ignores later changes via its own `api.set()`:
 *
 * - `viewOnly`
 * - `drawable.visible`
 *
 * This wrapper detects changes to either of these between renders and performs an
 * internal destroy + reconstruct of the underlying chessground instance so the prop
 * change still takes effect — but doing so discards any in-flight interaction state
 * (an active drag, a pending premove, an in-progress animation). Prefer setting these
 * once at mount when possible.
 */
export interface ChessgroundProps extends Config {
  /** Applied to the outer container `<div>` that chessground mounts into. */
  className?: string;
  /** Inline style for the outer container `<div>`. Typically used to size the board. */
  style?: CSSProperties;
  /**
   * Called once the underlying chessground `Api` instance exists, and again after any
   * internal remount triggered by a `viewOnly` / `drawable.visible` change.
   */
  onReady?: (api: Api) => void;
}

/** Shape exposed via `ref` on `<Chessground>`. */
export interface ChessgroundHandle {
  /** The raw underlying chessground `Api` instance, or `null` before mount / after unmount. */
  api: Api | null;
}
