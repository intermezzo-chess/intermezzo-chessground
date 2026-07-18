import { createRef } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dests, Key } from '@lichess-org/chessground/types';
import { Chessground } from '../../src/Chessground';
import type { ChessgroundHandle } from '../../src/types';

function dests(entries: [Key, Key[]][]): Dests {
  return new Map(entries);
}

interface MockApi {
  set: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

const { mockCreateChessground, mockApis } = vi.hoisted(() => {
  const apis: MockApi[] = [];
  const create = vi.fn((_el: HTMLElement, _config: unknown): MockApi => {
    const api: MockApi = { set: vi.fn(), destroy: vi.fn() };
    apis.push(api);
    return api;
  });
  return { mockCreateChessground: create, mockApis: apis };
});

vi.mock('@lichess-org/chessground', () => ({
  Chessground: mockCreateChessground,
}));

beforeEach(() => {
  mockCreateChessground.mockClear();
  mockApis.length = 0;
});

describe('<Chessground>', () => {
  it('constructs the chessground instance exactly once on mount, against the container div', () => {
    render(<Chessground fen="8/8/8/8/8/8/8/8 w - - 0 1" />);

    expect(mockCreateChessground).toHaveBeenCalledTimes(1);
    const [element, config] = mockCreateChessground.mock.calls[0] as [
      HTMLElement,
      { fen?: string },
    ];
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(config.fen).toBe('8/8/8/8/8/8/8/8 w - - 0 1');
  });

  it('calls api.set() with only the scalar keys that changed', () => {
    const { rerender } = render(<Chessground fen="start" orientation="white" />);
    const api = mockApis[0]!;

    rerender(<Chessground fen="start" orientation="black" />);

    expect(api.set).toHaveBeenCalledTimes(1);
    expect(api.set).toHaveBeenCalledWith({ orientation: 'black' });
  });

  it('always resends the full movable.dests map whenever the movable group changes', () => {
    const destsA = dests([['e2', ['e3', 'e4']]]);
    const destsB = dests([['d2', ['d3', 'd4']]]);
    const { rerender } = render(<Chessground movable={{ color: 'white', dests: destsA }} />);
    const api = mockApis[0]!;

    rerender(<Chessground movable={{ color: 'black', dests: destsB }} />);

    expect(api.set).toHaveBeenCalledWith({ movable: { color: 'black', dests: destsB } });
  });

  it('destroys and reconstructs the instance when viewOnly changes, updating the ref', () => {
    const ref = createRef<ChessgroundHandle>();
    const { rerender } = render(<Chessground ref={ref} viewOnly={false} />);
    const firstApi = mockApis[0]!;
    expect(ref.current?.api).toBe(firstApi);

    rerender(<Chessground ref={ref} viewOnly={true} />);

    expect(firstApi.destroy).toHaveBeenCalledTimes(1);
    expect(mockCreateChessground).toHaveBeenCalledTimes(2);
    const secondApi = mockApis[1]!;
    expect(ref.current?.api).toBe(secondApi);
  });

  it('destroys the instance exactly once on unmount', () => {
    const { unmount } = render(<Chessground fen="start" />);
    const api = mockApis[0]!;

    unmount();

    expect(api.destroy).toHaveBeenCalledTimes(1);
  });

  it('exposes the Api instance via ref, null before mount semantics aside', () => {
    const ref = createRef<ChessgroundHandle>();
    render(<Chessground ref={ref} fen="start" />);

    expect(ref.current?.api).toBe(mockApis[0]);
  });

  it('calls onReady exactly once with the Api instance when no recreate occurs', () => {
    const onReady = vi.fn();
    const { rerender } = render(<Chessground fen="start" onReady={onReady} />);

    rerender(<Chessground fen="start" orientation="black" onReady={onReady} />);

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith(mockApis[0]);
  });

  it('applies className and style to the container div', () => {
    const { container } = render(<Chessground className="my-board" style={{ width: 400 }} />);
    const div = container.firstElementChild as HTMLDivElement;

    expect(div.className).toBe('my-board');
    expect(div.style.width).toBe('400px');
  });
});
