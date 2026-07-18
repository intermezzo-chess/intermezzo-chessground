import { useState } from 'react';
import { Chessground, type DrawShape } from '@intermezzo/chessground-react';

export function DrawShapes() {
  const [shapes, setShapes] = useState<DrawShape[]>([]);

  return (
    <div>
      <p>
        Right-click-drag on the board to draw arrows, or right-click a square for a circle (
        <code>drawable.onChange</code> fires with the current shape list — {shapes.length} drawn
        right now).
      </p>
      <Chessground
        style={{ width: 400, height: 400 }}
        movable={{ free: true, color: 'both' }}
        drawable={{ enabled: true, shapes, onChange: setShapes }}
      />
      <button onClick={() => setShapes([])}>Clear shapes</button>
    </div>
  );
}
