import { useState } from 'react';
import { Chessground } from '@intermezzo-chess/chessground-react';
import { useChessGame } from '@intermezzo-chess/chessground-react/chess-js';

export function AlgebraicInput() {
  const game = useChessGame();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = game.moveSan(value);
    if (result === null) {
      setError(true);
      return;
    }
    setValue('');
    setError(false);
  }

  return (
    <div>
      <p>
        Type a move in Standard Algebraic Notation — <code>e4</code>, <code>Nf3</code>,{' '}
        <code>O-O</code> — and press Enter. This is a fully keyboard-operable way to make moves via{' '}
        <code>game.moveSan()</code>, entirely separate from chessground's own drag/click interaction
        (which still works below too — both funnel into the same <code>useChessGame</code> state).
        Chessground itself has no keyboard support at all, so this is a real, working alternative
        input path rather than a claim that the board itself is now fully accessible.
      </p>
      <p>
        Turn: <strong>{game.turnColor}</strong>
        {game.isCheckmate && ' — checkmate!'}
        {game.isStalemate && ' — stalemate'}
        {game.inCheck && !game.isCheckmate && ' — check!'}
      </p>
      <form onSubmit={submit} style={{ marginBottom: 8 }}>
        <label htmlFor="san-input">Move (SAN): </label>
        <input
          id="san-input"
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="e4"
          aria-invalid={error}
          aria-describedby={error ? 'san-error' : undefined}
        />{' '}
        <button type="submit">Move</button>
      </form>
      {error && (
        <p id="san-error" role="alert" style={{ color: '#b3261e' }}>
          "{value}" isn't a legal move in the current position.
        </p>
      )}
      <Chessground
        style={{ width: 400, height: 400 }}
        fen={game.fen}
        turnColor={game.turnColor}
        check={game.inCheck ? game.turnColor : false}
        lastMove={game.lastMove ?? undefined}
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
