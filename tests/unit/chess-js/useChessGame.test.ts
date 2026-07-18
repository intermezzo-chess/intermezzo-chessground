import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChessGame } from '../../../src/chess-js/useChessGame';

describe('useChessGame', () => {
  it('starts at the standard position by default', () => {
    const { result } = renderHook(() => useChessGame());
    expect(result.current.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result.current.turnColor).toBe('white');
    expect(result.current.isGameOver).toBe(false);
  });

  it('accepts a custom starting fen', () => {
    const fen = '8/8/8/4k3/8/8/4K3/8 w - - 0 1';
    const { result } = renderHook(() => useChessGame({ fen }));
    expect(result.current.fen).toBe(fen);
  });

  it('produces a dests map matching chess.js legal moves for the starting position', () => {
    const { result } = renderHook(() => useChessGame());
    expect(result.current.dests.get('e2')).toEqual(['e3', 'e4']);
    expect(result.current.dests.get('g1')).toEqual(['f3', 'h3']);
    expect(result.current.dests.has('e7')).toBe(false); // black's pawn, not white's turn
  });

  it('applies a legal move and updates fen/turnColor/dests', () => {
    const { result } = renderHook(() => useChessGame());

    let returnedFen: string | null = null;
    act(() => {
      returnedFen = result.current.move('e2', 'e4');
    });

    expect(returnedFen).not.toBeNull();
    expect(result.current.fen).toBe(returnedFen);
    expect(result.current.turnColor).toBe('black');
    expect(result.current.dests.get('e7')).toEqual(['e6', 'e5']);
  });

  it('returns null and leaves state unchanged for an illegal move', () => {
    const { result } = renderHook(() => useChessGame());
    const fenBefore = result.current.fen;

    let returnedFen: string | null = 'not-null-sentinel';
    act(() => {
      returnedFen = result.current.move('e2', 'e5');
    });

    expect(returnedFen).toBeNull();
    expect(result.current.fen).toBe(fenBefore);
  });

  it('calls onMove with the resulting fen after a successful move', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useChessGame({ onMove }));

    act(() => {
      result.current.move('e2', 'e4');
    });

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith(result.current.fen);
  });

  it('defaults promotion to queen', () => {
    const { result } = renderHook(() => useChessGame({ fen: '8/P7/8/4k3/8/8/4K3/8 w - - 0 1' }));

    act(() => {
      result.current.move('a7', 'a8');
    });

    expect(result.current.fen.startsWith('Q7/')).toBe(true);
  });

  it('detects checkmate (scholar’s mate)', () => {
    const { result } = renderHook(() => useChessGame());
    act(() => {
      result.current.move('e2', 'e4');
    });
    act(() => {
      result.current.move('e7', 'e5');
    });
    act(() => {
      result.current.move('d1', 'h5');
    });
    act(() => {
      result.current.move('b8', 'c6');
    });
    act(() => {
      result.current.move('f1', 'c4');
    });
    act(() => {
      result.current.move('g8', 'f6');
    });
    act(() => {
      result.current.move('h5', 'f7');
    });

    expect(result.current.isCheckmate).toBe(true);
    expect(result.current.inCheck).toBe(true);
    expect(result.current.isGameOver).toBe(true);
  });

  it('reset() restores the configured starting fen', () => {
    const fen = '8/8/8/4k3/8/8/4K3/8 w - - 0 1';
    const { result } = renderHook(() => useChessGame({ fen }));

    act(() => {
      result.current.move('e2', 'e3'); // illegal (no pawn there) — state unaffected
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.fen).toBe(fen);
  });
});
