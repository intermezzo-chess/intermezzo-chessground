import { useState } from 'react';
import { Chessground } from '@intermezzo/chessground-react';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const AFTER_E4_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';

export function AnimationToggle() {
  const [fen, setFen] = useState(START_FEN);
  const [enabled, setEnabled] = useState(true);
  const [duration, setDuration] = useState(200);

  return (
    <div>
      <p>
        Toggling the FEN with <code>animation.enabled</code>/<code>animation.duration</code>{' '}
        compares an animated position change against an instant one.
      </p>
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />{' '}
        Animation enabled
      </label>{' '}
      <label>
        Duration:{' '}
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={0}
          max={1000}
          step={50}
          style={{ width: 70 }}
        />{' '}
        ms
      </label>
      <br />
      <button onClick={() => setFen((f) => (f === START_FEN ? AFTER_E4_FEN : START_FEN))}>
        Toggle e2-e4
      </button>
      <Chessground
        style={{ width: 400, height: 400 }}
        fen={fen}
        animation={{ enabled, duration }}
        viewOnly
      />
    </div>
  );
}
