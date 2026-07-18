import type { Chess } from 'chess.js';
import type { Color, Dests, FEN, Key } from '@lichess-org/chessground/types';

/** A promotion piece choice, in chess.js's lowercase single-letter form. */
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export interface UseChessGameOptions {
  /** Starting position. Defaults to the standard chess starting position. */
  fen?: FEN;
  /** Called after every successful call to `move()`, with the resulting FEN. */
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
   * Attempts a move. Returns the resulting FEN on success, or `null` if the move is illegal
   * (state is left unchanged). Promotion defaults to queen.
   */
  move: (orig: Key, dest: Key, promotion?: PromotionPiece) => FEN | null;
  /** Resets the game back to the configured starting `fen` (or the standard start position). */
  reset: () => void;
  /** Escape hatch: the underlying chess.js instance, for anything this hook doesn't expose. */
  chess: Chess;
}
