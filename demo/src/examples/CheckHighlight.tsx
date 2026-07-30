import { Chessground } from '@intermezzo-chess/chessground-react';

// White's king on e1 is in check from the black rook on e8.
const CHECK_FEN = '4r3/8/8/8/8/8/8/4K3 w - - 0 1';

export function CheckHighlight() {
  return (
    <div>
      <p>
        The <code>check</code> prop highlights the given color's king square (
        <code>highlight.check</code>, on by default).
      </p>
      <Chessground
        style={{ width: 400, height: 400 }}
        fen={CHECK_FEN}
        check="white"
        movable={{ free: true, color: 'both' }}
      />
    </div>
  );
}
