import { useEffect, useRef } from 'react';
import { Chessground, type ChessgroundHandle } from '@intermezzo/chessground-react';
import { useChessGame } from '@intermezzo/chessground-react/chess-js';

export function Premove() {
  const game = useChessGame();
  const ref = useRef<ChessgroundHandle>(null);

  // Whenever it becomes white's turn, release any queued premove. `api.playPremove()` is a
  // safe no-op if nothing is queued. Runs after the board's own effects have already applied
  // black's move (child effects commit before this parent effect, in the same React commit),
  // so the premove always plays against an up-to-date board.
  useEffect(() => {
    if (game.turnColor === 'white') ref.current?.api?.playPremove();
  }, [game.turnColor]);

  function playRandomBlackMove() {
    const entries = [...game.dests.entries()].filter(([, dests]) => dests.length > 0);
    if (entries.length === 0) return;
    const [orig, dests] = entries[Math.floor(Math.random() * entries.length)]!;
    const dest = dests[Math.floor(Math.random() * dests.length)]!;
    game.move(orig, dest);
  }

  return (
    <div>
      <p>
        Drag a white piece now — it's black's turn, so chessground queues it as a{' '}
        <code>premove</code> instead of playing it immediately (<code>movable.color: 'white'</code>{' '}
        while <code>turnColor: 'black'</code>). Click the button to play a random black reply and
        watch the queued premove fire automatically via <code>api.playPremove()</code>.
      </p>
      <Chessground
        ref={ref}
        style={{ width: 400, height: 400 }}
        fen={game.fen}
        turnColor={game.turnColor}
        movable={{
          color: 'white',
          dests: game.turnColor === 'white' ? game.dests : undefined,
          events: { after: (orig, dest) => game.move(orig, dest) },
        }}
        premovable={{ enabled: true }}
      />
      <button onClick={playRandomBlackMove} disabled={game.turnColor !== 'black'}>
        Play random black move
      </button>
      <button onClick={game.reset}>Reset</button>
    </div>
  );
}
