export { Chessground } from './Chessground';
export { useChessground } from './useChessground';
export { diffConfig } from './diffConfig';
export type { ConfigDiff } from './diffConfig';
export type { ChessgroundProps, ChessgroundHandle } from './types';

// Re-exports of chessground's own types, so consumers never need to depend on
// `@lichess-org/chessground` directly just to type their own props/state.
export type { Config } from '@lichess-org/chessground/config';
export type { Api } from '@lichess-org/chessground/api';
export type {
  Color,
  Role,
  File,
  Rank,
  Key,
  FEN,
  Piece,
  Drop,
  Pieces,
  PiecesDiff,
  KeyPair,
  NumberPair,
  Dests,
  Elements,
  MoveMetadata,
  SetPremoveMetadata,
  MouchEvent,
  RanksPosition,
  BrushColor,
  SquareClasses,
  Mobility,
  MobilityContext,
} from '@lichess-org/chessground/types';
export type {
  DrawShape,
  DrawModifiers,
  DrawShapePiece,
  DrawBrush,
  DrawBrushes,
} from '@lichess-org/chessground/draw';
export {
  read as readFen,
  write as writeFen,
  initial as initialFen,
} from '@lichess-org/chessground/fen';
