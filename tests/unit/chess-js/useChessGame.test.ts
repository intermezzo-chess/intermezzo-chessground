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

  describe('moveSan', () => {
    it('applies a plain pawn move given in SAN', () => {
      const { result } = renderHook(() => useChessGame());

      let returnedFen: string | null = null;
      act(() => {
        returnedFen = result.current.moveSan('e4');
      });

      expect(returnedFen).not.toBeNull();
      expect(result.current.fen).toBe(returnedFen);
      expect(result.current.turnColor).toBe('black');
    });

    it('applies a piece move given in SAN', () => {
      const { result } = renderHook(() => useChessGame());

      act(() => {
        result.current.moveSan('Nf3');
      });

      expect(result.current.fen).toContain('5N2');
    });

    it('applies castling given in SAN', () => {
      const { result } = renderHook(() =>
        useChessGame({ fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1' }),
      );

      act(() => {
        result.current.moveSan('O-O');
      });

      expect(result.current.fen.startsWith('r3k2r/8/8/8/8/8/8/R4RK1')).toBe(true);
    });

    it('applies a promotion given in SAN', () => {
      const { result } = renderHook(() => useChessGame({ fen: '8/P7/8/4k3/8/8/4K3/8 w - - 0 1' }));

      act(() => {
        result.current.moveSan('a8=Q');
      });

      expect(result.current.fen.startsWith('Q7/')).toBe(true);
    });

    it('trims incidental whitespace', () => {
      const { result } = renderHook(() => useChessGame());

      let returnedFen: string | null = null;
      act(() => {
        returnedFen = result.current.moveSan('  e4  ');
      });

      expect(returnedFen).not.toBeNull();
    });

    it('returns null and leaves state unchanged for an illegal-but-well-formed SAN string', () => {
      const { result } = renderHook(() => useChessGame());
      const fenBefore = result.current.fen;

      let returnedFen: string | null = 'not-null-sentinel';
      act(() => {
        returnedFen = result.current.moveSan('e5'); // black's move; it's white's turn
      });

      expect(returnedFen).toBeNull();
      expect(result.current.fen).toBe(fenBefore);
    });

    it('returns null and does not throw for a malformed string', () => {
      const { result } = renderHook(() => useChessGame());
      const fenBefore = result.current.fen;

      let returnedFen: string | null = 'not-null-sentinel';
      expect(() => {
        act(() => {
          returnedFen = result.current.moveSan('not a move');
        });
      }).not.toThrow();

      expect(returnedFen).toBeNull();
      expect(result.current.fen).toBe(fenBefore);
    });

    it('calls onMove with the resulting fen after a successful moveSan', () => {
      const onMove = vi.fn();
      const { result } = renderHook(() => useChessGame({ onMove }));

      act(() => {
        result.current.moveSan('e4');
      });

      expect(onMove).toHaveBeenCalledTimes(1);
      expect(onMove).toHaveBeenCalledWith(result.current.fen);
    });
  });

  describe('lastMove', () => {
    it('is null before any move has been made', () => {
      const { result } = renderHook(() => useChessGame());
      expect(result.current.lastMove).toBeNull();
    });

    it('updates to [from, to] after a coordinate move', () => {
      const { result } = renderHook(() => useChessGame());

      act(() => {
        result.current.move('e2', 'e4');
      });

      expect(result.current.lastMove).toEqual(['e2', 'e4']);
    });

    it('updates to [from, to] after a SAN move', () => {
      const { result } = renderHook(() => useChessGame());

      act(() => {
        result.current.moveSan('Nf3');
      });

      expect(result.current.lastMove).toEqual(['g1', 'f3']);
    });

    it('is left unchanged by a failed move attempt', () => {
      const { result } = renderHook(() => useChessGame());

      act(() => {
        result.current.move('e2', 'e4');
      });
      act(() => {
        // Black to move; no black knight can reach f3 from the starting position — illegal.
        result.current.moveSan('Nf3');
      });

      expect(result.current.lastMove).toEqual(['e2', 'e4']);
    });

    it('resets to null on reset()', () => {
      const { result } = renderHook(() => useChessGame());

      act(() => {
        result.current.move('e2', 'e4');
      });
      act(() => {
        result.current.reset();
      });

      expect(result.current.lastMove).toBeNull();
    });
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
