import type { Preview } from '@storybook/react-vite';
import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.brown.css';
import '@lichess-org/chessground/assets/chessground.cburnett.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
};

export default preview;
