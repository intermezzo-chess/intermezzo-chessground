import { createRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { commands, userEvent } from 'vitest/browser';
import { Chessground } from '../../src/Chessground';
import type { ChessgroundHandle } from '../../src/types';
import type { DrawShape } from '@lichess-org/chessground/draw';
import { squareFraction, squareOffset } from './boardGeometry';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const BOARD_SIZE = 480;

// This suite runs against the real, unmocked `@lichess-org/chessground` in an actual Chromium
// instance (Vitest Browser Mode + Playwright provider) rather than jsdom: jsdom stubs
// `getBoundingClientRect()` to a zeroed rect and can't faithfully simulate real pointer/drag
// sequences, both of which chessground's drag-and-drop interaction depends on directly.
describe('<Chessground> real browser interaction', () => {
  it('drags a piece from e2 to e4 and updates both the board state and fires movable.events.after', async () => {
    const ref = createRef<ChessgroundHandle>();
    const onAfter = vi.fn();
    const { container } = render(
      <Chessground
        ref={ref}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        fen={START_FEN}
        movable={{ free: true, color: 'both', events: { after: onAfter } }}
      />,
    );
    const boardEl = container.firstElementChild as HTMLElement;

    await userEvent.dragAndDrop(boardEl, boardEl, {
      sourcePosition: squareOffset(BOARD_SIZE, 'e2'),
      targetPosition: squareOffset(BOARD_SIZE, 'e4'),
    });

    await waitFor(() => {
      expect(ref.current?.api?.getFen()).toContain('4P3');
    });
    // movable.events.after fires via chessground's own `setTimeout(fn, 1)` — genuinely
    // asynchronous, never synchronous with the triggering pointer event.
    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith('e2', 'e4', expect.objectContaining({ premove: false }));
    });
  });

  it('supports click-to-select then click-to-move, reaching the same position as a drag', async () => {
    const ref = createRef<ChessgroundHandle>();
    const { container } = render(
      <Chessground
        ref={ref}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        fen={START_FEN}
        movable={{ free: true, color: 'both' }}
      />,
    );
    const boardEl = container.firstElementChild as HTMLElement;

    await userEvent.click(boardEl, { position: squareOffset(BOARD_SIZE, 'g1') });
    await userEvent.click(boardEl, { position: squareOffset(BOARD_SIZE, 'f3') });

    await waitFor(() => {
      expect(ref.current?.api?.getFen()).toContain('5N2');
    });
  });

  it('queues a premove and plays it once it becomes that color’s turn', async () => {
    const ref = createRef<ChessgroundHandle>();
    const onPremoveSet = vi.fn();
    const onAfter = vi.fn();
    const { container, rerender } = render(
      <Chessground
        ref={ref}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        fen={START_FEN}
        turnColor="black"
        movable={{ free: true, color: 'white', events: { after: onAfter } }}
        premovable={{ enabled: true, events: { set: onPremoveSet } }}
      />,
    );
    const boardEl = container.firstElementChild as HTMLElement;

    // White drags while it's black's turn — chessground registers this as a premove rather
    // than playing it immediately, since `movable.color: 'white'` allows picking the piece up
    // but `turnColor: 'black'` means it isn't actually white's turn yet.
    await userEvent.dragAndDrop(boardEl, boardEl, {
      sourcePosition: squareOffset(BOARD_SIZE, 'e2'),
      targetPosition: squareOffset(BOARD_SIZE, 'e4'),
    });

    await waitFor(() => {
      expect(onPremoveSet).toHaveBeenCalledWith('e2', 'e4', expect.anything());
    });
    // Not played yet — still black's turn.
    expect(ref.current?.api?.getFen()).toBe(START_FEN.split(' ')[0]);

    rerender(
      <Chessground
        ref={ref}
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        fen={START_FEN}
        turnColor="white"
        movable={{ free: true, color: 'white', events: { after: onAfter } }}
        premovable={{ enabled: true, events: { set: onPremoveSet } }}
      />,
    );
    ref.current?.api?.playPremove();

    await waitFor(() => {
      expect(ref.current?.api?.getFen()).toContain('4P3');
    });
    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith('e2', 'e4', expect.objectContaining({ premove: true }));
    });
  });

  it('draws a shape via a real right-click drag and fires drawable.onChange', async () => {
    const onChange = vi.fn<(shapes: DrawShape[]) => void>();
    render(
      <Chessground
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        fen={START_FEN}
        drawable={{ enabled: true, onChange }}
      />,
    );

    await commands.rightClickDrag(squareFraction('e2'), squareFraction('e4'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ orig: 'e2', dest: 'e4' })]);
    });
  });
});

// Chessground >=10.2 owns one ResizeObserver per instance and disconnects it in `destroy()`.
// Recording real observers (rather than mocking `destroy()`) verifies that the wrapper destroys
// every instance it retires, including the live one at unmount.
function trackResizeObservers(): { disconnects: number }[] {
  const records: { disconnects: number }[] = [];
  class TrackingResizeObserver extends ResizeObserver {
    private readonly record = { disconnects: 0 };

    constructor(callback: ResizeObserverCallback) {
      super(callback);
      records.push(this.record);
    }

    override disconnect(): void {
      this.record.disconnects += 1;
      super.disconnect();
    }
  }
  vi.stubGlobal('ResizeObserver', TrackingResizeObserver);
  return records;
}

describe('<Chessground> ResizeObserver cleanup', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('disconnects the observer on unmount', () => {
    const observers = trackResizeObservers();
    const { unmount } = render(
      <Chessground style={{ width: BOARD_SIZE, height: BOARD_SIZE }} fen={START_FEN} />,
    );
    expect(observers).toEqual([{ disconnects: 0 }]);

    unmount();

    expect(observers).toEqual([{ disconnects: 1 }]);
  });

  it('keeps one observer across orientation changes', () => {
    const observers = trackResizeObservers();
    const { rerender } = render(
      <Chessground style={{ width: BOARD_SIZE, height: BOARD_SIZE }} orientation="white" />,
    );

    rerender(<Chessground style={{ width: BOARD_SIZE, height: BOARD_SIZE }} orientation="black" />);

    expect(observers).toEqual([{ disconnects: 0 }]);
  });

  it('disconnects each retired observer on recreation and the live one on unmount', () => {
    const observers = trackResizeObservers();
    const style = { width: BOARD_SIZE, height: BOARD_SIZE };
    const { rerender, unmount } = render(
      <Chessground style={style} viewOnly={false} drawable={{ visible: true }} />,
    );

    rerender(<Chessground style={style} viewOnly={true} drawable={{ visible: true }} />);
    rerender(<Chessground style={style} viewOnly={true} drawable={{ visible: false }} />);

    expect(observers).toEqual([{ disconnects: 1 }, { disconnects: 1 }, { disconnects: 0 }]);

    unmount();

    expect(observers).toEqual([{ disconnects: 1 }, { disconnects: 1 }, { disconnects: 1 }]);
  });
});
