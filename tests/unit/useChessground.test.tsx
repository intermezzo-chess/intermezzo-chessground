import { StrictMode, useRef } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChessground } from '../../src/useChessground';
import type { ChessgroundProps } from '../../src/types';

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

// Minimal harness: a headless consumer managing its own container, exactly the use case
// `useChessground` is exported (separately from `<Chessground>`) to support.
function Harness({ chessgroundProps }: { chessgroundProps: ChessgroundProps }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useChessground(containerRef, chessgroundProps);
  return <div ref={containerRef} data-testid="cg-container" />;
}

describe('useChessground', () => {
  it('constructs the instance exactly once against the given container element', () => {
    const { getByTestId } = render(<Harness chessgroundProps={{ fen: 'start' }} />);

    expect(mockCreateChessground).toHaveBeenCalledTimes(1);
    expect(mockCreateChessground.mock.calls[0]![0]).toBe(getByTestId('cg-container'));
  });

  it('calls api.set() on subsequent renders instead of reconstructing', () => {
    const { rerender } = render(<Harness chessgroundProps={{ orientation: 'white' }} />);
    const api = mockApis[0]!;

    rerender(<Harness chessgroundProps={{ orientation: 'black' }} />);

    expect(mockCreateChessground).toHaveBeenCalledTimes(1);
    expect(api.set).toHaveBeenCalledWith({ orientation: 'black' });
  });

  it('destroys the instance on unmount', () => {
    const { unmount } = render(<Harness chessgroundProps={{ fen: 'start' }} />);
    const api = mockApis[0]!;

    unmount();

    expect(api.destroy).toHaveBeenCalledTimes(1);
  });

  it.each<[string, ChessgroundProps, ChessgroundProps]>([
    ['viewOnly', { viewOnly: false }, { viewOnly: true }],
    ['drawable.visible', { drawable: { visible: true } }, { drawable: { visible: false } }],
  ])(
    'destroys the retired and replacement instances once each after a %s recreation',
    (_trigger, initial, next) => {
      const { rerender, unmount } = render(<Harness chessgroundProps={initial} />);
      rerender(<Harness chessgroundProps={next} />);

      expect(mockApis).toHaveLength(2);
      const [retired, replacement] = mockApis as [MockApi, MockApi];
      expect(retired.destroy).toHaveBeenCalledTimes(1);
      expect(replacement.destroy).not.toHaveBeenCalled();

      unmount();

      expect(retired.destroy).toHaveBeenCalledTimes(1);
      expect(replacement.destroy).toHaveBeenCalledTimes(1);
    },
  );

  it('destroys every instance exactly once under Strict Mode with repeated recreation', () => {
    const { rerender, unmount } = render(
      <StrictMode>
        <Harness chessgroundProps={{ viewOnly: false }} />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <Harness chessgroundProps={{ viewOnly: true }} />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <Harness chessgroundProps={{ viewOnly: false }} />
      </StrictMode>,
    );
    unmount();

    expect(mockApis.length).toBeGreaterThan(1);
    for (const api of mockApis) {
      expect(api.destroy).toHaveBeenCalledTimes(1);
    }
  });

  it('warns in dev when the container has zero width/height after mount', () => {
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = () =>
      ({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 }) as DOMRect;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      render(<Harness chessgroundProps={{ fen: 'start' }} />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('zero width/height'));
    } finally {
      Element.prototype.getBoundingClientRect = original;
      warn.mockRestore();
    }
  });

  it('does not warn when the container has a normal size', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      render(<Harness chessgroundProps={{ fen: 'start' }} />);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
