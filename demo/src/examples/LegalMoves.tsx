import { Chessground } from '@intermezzo/chessground-react';
import { useChessGame } from '@intermezzo/chessground-react/chess-js';

export function LegalMoves() {
  const game = useChessGame();

  return (
    <div>
      <p>
        Legal-move-restricted play, powered by the optional <code>useChessGame</code> chess.js
        integration — <code>dests</code> plugs directly into <code>movable.dests</code>.
      </p>
      <p>
        Turn: <strong>{game.turnColor}</strong>
        {game.isCheckmate && ' — checkmate!'}
        {game.isStalemate && ' — stalemate'}
        {game.inCheck && !game.isCheckmate && ' — check!'}
      </p>
      <Chessground
        style={{ width: 400, height: 400 }}
        fen={game.fen}
        turnColor={game.turnColor}
        check={game.inCheck ? game.turnColor : false}
        movable={{
          color: game.turnColor,
          dests: game.dests,
          events: { after: (orig, dest) => game.move(orig, dest) },
        }}
      />
      <button onClick={game.reset}>Reset</button>
    </div>
  );
}
