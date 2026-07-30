import { Chessground } from '@intermezzo-chess/chessground-react';
import './CustomTheme.css';

export function CustomTheme() {
  return (
    <div>
      <p>
        A small hand-written theme (<code>demo/src/examples/CustomTheme.css</code>) overrides the
        bundled brown/cburnett assets on this board via a higher-specificity{' '}
        <code>.custom-theme</code> class. In your own app you'd typically import{' '}
        <code>@intermezzo-chess/chessground-react/base.css</code> instead of{' '}
        <code>.../style.css</code> and skip the bundled theme entirely — this demo loads it globally
        for the other examples, so it overrides it here instead.
      </p>
      <Chessground
        className="custom-theme"
        style={{ width: 400, height: 400 }}
        movable={{ free: true, color: 'both' }}
      />
    </div>
  );
}
