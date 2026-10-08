import { Chessground } from '@intermezzo-chess/chessground-react';

export function FreePlay() {
  return (
    <div>
      <p>
        No rules enforced — every piece can move to any square (<code>movable.free: true</code>,{' '}
        <code>movable.color: 'both'</code>). This is the bare minimum wiring: chessground itself has
        no chess logic.
      </p>
      <Chessground style={{ width: 400, height: 400 }} movable={{ free: true, color: 'both' }} />
    </div>
  );
}
