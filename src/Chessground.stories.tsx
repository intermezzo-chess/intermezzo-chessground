import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chessground } from './Chessground';

const meta = {
  title: 'Chessground',
  component: Chessground,
  args: {
    style: { width: 400, height: 400 },
  },
} satisfies Meta<typeof Chessground>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No rules enforced — every piece can move anywhere. */
export const FreePlay: Story = {
  args: {
    movable: { free: true, color: 'both' },
  },
};

/** Non-interactive board — `viewOnly` is set once at construction. */
export const ViewOnly: Story = {
  args: {
    viewOnly: true,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  },
};

/** Black-at-the-bottom orientation. */
export const BlackOrientation: Story = {
  args: {
    orientation: 'black',
    movable: { free: true, color: 'both' },
  },
};

/** `check` highlights the given color's king square. */
export const CheckHighlight: Story = {
  args: {
    fen: '4r3/8/8/8/8/8/8/4K3 w - - 0 1',
    check: 'white',
    movable: { free: true, color: 'both' },
  },
};

/** Position changes apply instantly with `animation.enabled: false`. */
export const AnimationDisabled: Story = {
  args: {
    movable: { free: true, color: 'both' },
    animation: { enabled: false },
  },
};

/** Right-click shape drawing turned off. */
export const DrawableDisabled: Story = {
  args: {
    movable: { free: true, color: 'both' },
    drawable: { enabled: false },
  },
};

/** Pre-set arrows via `drawable.shapes`. */
export const PresetShapes: Story = {
  args: {
    movable: { free: true, color: 'both' },
    drawable: {
      enabled: true,
      shapes: [
        { orig: 'e2', dest: 'e4', brush: 'green' },
        { orig: 'g1', dest: 'f3', brush: 'blue' },
        { orig: 'd7', brush: 'red' },
      ],
    },
  },
};
