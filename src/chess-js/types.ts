import type { Chess } from 'chess.js';
import type { Color, Dests, FEN, Key } from '@lichess-org/chessground/types';

/** A promotion piece choice, in chess.js's lowercase single-letter form. */
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export interface UseChessGameOptions {
  /** Starting position. Defaults to the standard chess starting position. */
  fen?: FEN;
  /** Called after every successful call to `move()` or `moveSan()`, with the resulting FEN. */
  onMove?: (fen: FEN) => void;
}

/**
 * A small, standalone chess-rules layer built on `chess.js`, with **no dependency on
 * chessground at all** beyond reusing its `Color` / `Dests` / `Key` / `FEN` types for
 * convenient interop. Wiring this to `<Chessground>` is a userland concern (see the
 * "Legal moves" example in the README/demo) — this hook is intentionally usable on its own.
 */
export interface ChessGame {
  /** Current position. */
  fen: FEN;
  /** Side to move. */
  turnColor: Color;
  /** Legal destinations for the side to move — directly usable as chessground's `movable.dests`. */
  dests: Dests;
  inCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  /**
   * Attempts a move given as coordinates. Returns the resulting FEN on success, or `null` if
   * the move is illegal (state is left unchanged). Promotion defaults to queen.
   */
  move: (orig: Key, dest: Key, promotion?: PromotionPiece) => FEN | null;
  /**
   * Attempts a move given in Standard Algebraic Notation (e.g. `"e4"`, `"Nf3"`, `"O-O"`,
   * `"exd8=Q+"`) — a keyboard-friendly alternative to drag-and-drop input, since chessground
   * itself has no notation parsing at all. Returns the resulting FEN on success, or `null` if
   * the string isn't a legal move in the current position (state is left unchanged either way).
   * Promotion is encoded in the SAN string itself, so there's no separate parameter.
   */
  moveSan: (san: string) => FEN | null;
  /**
   * The `[from, to]` squares of the most recently applied move (via `move()` or `moveSan()`),
   * or `null` before any move has been made — feeds directly into chessground's `lastMove` prop.
   */
  lastMove: [Key, Key] | null;
  /** Resets the game back to the configured starting `fen` (or the standard start position). */
  reset: () => void;
  /** Escape hatch: the underlying chess.js instance, for anything this hook doesn't expose. */
  chess: Chess;
}
