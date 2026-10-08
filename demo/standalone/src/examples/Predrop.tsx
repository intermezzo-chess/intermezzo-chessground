import { useRef } from 'react';
import {
  Chessground,
  type ChessgroundHandle,
  type Piece,
} from '@intermezzo-chess/chessground-react';

const POCKET: Piece[] = [
  { role: 'pawn', color: 'white' },
  { role: 'knight', color: 'white' },
  { role: 'queen', color: 'white' },
];

const FEN = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';

export function Predrop() {
  const ref = useRef<ChessgroundHandle>(null);

  function startDrag(piece: Piece, event: React.MouseEvent) {
    ref.current?.api?.dragNewPiece(piece, event.nativeEvent, true);
  }

  return (
    <div>
      <p>
        Drag a piece from the pocket onto the board — a crazyhouse-style drop, via{' '}
        <code>api.dragNewPiece()</code> and <code>predroppable.enabled</code>.
      </p>
      <div className="pocket">
        {POCKET.map((piece, i) => (
          <div
            key={i}
            className="pocket-piece"
            onMouseDown={(e) => startDrag(piece, e)}
            title={`${piece.color} ${piece.role}`}
          >
            {piece.role[0]!.toUpperCase()}
          </div>
        ))}
      </div>
      <Chessground
        ref={ref}
        style={{ width: 400, height: 400 }}
        fen={FEN}
        movable={{ free: true, color: 'both' }}
        predroppable={{ enabled: true }}
      />
    </div>
  );
}
