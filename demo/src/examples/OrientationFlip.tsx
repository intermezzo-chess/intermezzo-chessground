import { useRef } from 'react';
import { Chessground, type ChessgroundHandle } from '@intermezzo/chessground-react';

export function OrientationFlip() {
  const ref = useRef<ChessgroundHandle>(null);

  return (
    <div>
      <p>
        Flips the board via the imperative <code>api.toggleOrientation()</code>, reached through the
        component's <code>ref</code>.
      </p>
      <button onClick={() => ref.current?.api?.toggleOrientation()}>Flip board</button>
      <Chessground
        ref={ref}
        style={{ width: 400, height: 400 }}
        movable={{ free: true, color: 'both' }}
      />
    </div>
  );
}
