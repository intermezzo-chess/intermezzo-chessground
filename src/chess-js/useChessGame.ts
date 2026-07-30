import { useCallback, useMemo, useState } from 'react';
import { Chess, DEFAULT_POSITION } from 'chess.js';
import type { Color, Dests, Key } from '@lichess-org/chessground/types';
import type { ChessGame, PromotionPiece, UseChessGameOptions } from './types';

function toDests(chess: Chess): Dests {
  const dests: Dests = new Map();
  for (const { from, to } of chess.moves({ verbose: true })) {
    const origin = dests.get(from as Key);
    if (origin) origin.push(to as Key);
    else dests.set(from as Key, [to as Key]);
  }
  return dests;
}

function toColor(turn: 'w' | 'b'): Color {
  return turn === 'w' ? 'white' : 'black';
}

/**
 * Attempts `input` (either coordinates or a SAN string) against `chess`. Returns the applied
 * move's `[from, to]` on success, or `null` on an illegal/malformed move (chess.js throws for
 * both — state is left unchanged either way, since a thrown `move()` never mutates the position).
 */
function applyMove(
  chess: Chess,
  input: string | { from: Key; to: Key; promotion: PromotionPiece },
): [Key, Key] | null {
  try {
    const result = chess.move(input);
    return [result.from as Key, result.to as Key];
  } catch {
    return null;
  }
}

/**
 * A standalone chess-rules hook built on `chess.js` — legal moves, check/checkmate/stalemate
 * detection, and a `dests` map directly consumable as chessground's `movable.dests`. Has no
 * dependency on chessground itself; wiring it to `<Chessground>` is demonstrated in the
 * "Legal moves" example rather than baked into this hook, so `<Chessground>` itself stays a
 * thin, chess-rules-free mirror of chessground.
 *
 * @example
 * ```tsx
 * const game = useChessGame();
 * <Chessground
 *   fen={game.fen}
 *   turnColor={game.turnColor}
 *   check={game.inCheck ? game.turnColor : false}
 *   lastMove={game.lastMove ?? undefined}
 *   movable={{
 *     color: game.turnColor,
 *     dests: game.dests,
 *     events: { after: (orig, dest) => game.move(orig, dest) },
 *   }}
 * />
 * ```
 */
export function useChessGame(options?: UseChessGameOptions): ChessGame {
  // Lazy, one-time initializers — chess.js touches no browser APIs, so this is SSR-safe, and
  // using `useState`'s lazy form (rather than a ref written to during render) keeps the
  // initialization unambiguously within React's rules for one-time expensive setup.
  const [chess] = useState(() => new Chess(options?.fen));
  const [initialFen] = useState(() => options?.fen ?? DEFAULT_POSITION);
  const [fen, setFen] = useState(() => chess.fen());
  const [lastMove, setLastMove] = useState<[Key, Key] | null>(null);

  const derived = useMemo(
    () => ({
      turnColor: toColor(chess.turn()),
      dests: toDests(chess),
      inCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
    }),
    // `fen` is the only thing that ever changes; it's a reliable proxy for "the chess instance's
    // internal state changed", since every mutating call below (`move`, `moveSan`, `reset`)
    // updates it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chess, fen],
  );

  const finishMove = useCallback(
    (applied: [Key, Key] | null) => {
      if (!applied) return null;
      const nextFen = chess.fen();
      setFen(nextFen);
      setLastMove(applied);
      options?.onMove?.(nextFen);
      return nextFen;
    },
    [chess, options],
  );

  const move = useCallback(
    (orig: Key, dest: Key, promotion: PromotionPiece = 'q') =>
      finishMove(applyMove(chess, { from: orig, to: dest, promotion })),
    [chess, finishMove],
  );

  const moveSan = useCallback(
    (san: string) => finishMove(applyMove(chess, san.trim())),
    [chess, finishMove],
  );

  const reset = useCallback(() => {
    chess.load(initialFen);
    setFen(chess.fen());
    setLastMove(null);
  }, [chess, initialFen]);

  return { fen, move, moveSan, lastMove, reset, chess, ...derived };
}
