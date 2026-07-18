import { useState } from 'react';
import { Chessground } from '@intermezzo/chessground-react';

export function ViewOnly() {
  const [viewOnly, setViewOnly] = useState(false);
  const [readyCount, setReadyCount] = useState(0);

  return (
    <div>
      <p>
        <code>viewOnly</code> only takes effect at construction time inside chessground, so toggling
        it here makes the wrapper destroy and reconstruct the instance internally — watch the
        "reconstructed N times" counter below tick up each time you flip it (<code>onReady</code>{' '}
        fires again after every reconstruct).
      </p>
      <label>
        <input type="checkbox" checked={viewOnly} onChange={(e) => setViewOnly(e.target.checked)} />{' '}
        View only
      </label>
      <p>Reconstructed {readyCount} time(s).</p>
      <Chessground
        style={{ width: 400, height: 400 }}
        movable={{ free: true, color: 'both' }}
        viewOnly={viewOnly}
        onReady={() => setReadyCount((n) => n + 1)}
      />
    </div>
  );
}
