import { useRef } from 'react';
import { useChessground } from '@intermezzo/chessground-react';

export function HeadlessHook() {
  const containerRef = useRef<HTMLDivElement>(null);
  useChessground(containerRef, { movable: { free: true, color: 'both' } });

  return (
    <div>
      <p>
        Using <code>useChessground</code> directly instead of the <code>&lt;Chessground&gt;</code>{' '}
        component — full control over the container element and its layout, no extra JSX wrapper
        involved.
      </p>
      <div ref={containerRef} style={{ width: 400, height: 400 }} />
    </div>
  );
}
