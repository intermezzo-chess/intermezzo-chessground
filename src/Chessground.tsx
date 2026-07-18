import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useChessground } from './useChessground';
import type { ChessgroundHandle, ChessgroundProps } from './types';

/**
 * A thin, faithful React wrapper around lichess.org's chessground board.
 *
 * Every field of chessground's own `Config` is a top-level prop, grouped exactly as
 * chessground groups it (`movable`, `draggable`, `drawable`, `premovable`, `predroppable`,
 * `highlight`, `animation`, `selectable`, `events`). See `ChessgroundProps` for the full list
 * and important caveats around `viewOnly` / `drawable.visible`.
 *
 * The underlying chessground `Api` is exposed via `ref` — use it for anything imperative
 * (`setShapes`, `move`, `toggleOrientation`, `playPremove`, ...) that isn't naturally a prop.
 *
 * @example
 * ```tsx
 * import { useRef } from 'react';
 * import { Chessground, type ChessgroundHandle } from '@intermezzo/chessground-react';
 * import '@intermezzo/chessground-react/style.css';
 *
 * function Board() {
 *   const ref = useRef<ChessgroundHandle>(null);
 *   return (
 *     <Chessground
 *       ref={ref}
 *       style={{ width: 400, height: 400 }}
 *       orientation="white"
 *       movable={{ free: true, color: 'both' }}
 *     />
 *   );
 * }
 * ```
 */
export const Chessground = forwardRef<ChessgroundHandle, ChessgroundProps>(
  function Chessground(props, ref) {
    const { className, style, onReady, ...cgProps } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const api = useChessground(containerRef, { ...cgProps, onReady });

    useImperativeHandle(ref, () => ({ api }), [api]);

    return <div ref={containerRef} className={className} style={style} />;
  },
);
