# @intermezzo-chess/chessground-react

## 1.0.0

### Major Changes

- [`1115718`](https://github.com/intermezzo-chess/intermezzo-chessground/commit/1115718bcdf7bff5822e19527ba770d18a1279f8) Thanks [@nloding](https://github.com/nloding)! - Initial 1.0 alpha release: a strongly-typed React wrapper for lichess.org's chessground, exposing its full `Config`/`Api` surface via `<Chessground>` and the headless `useChessground` hook, plus an optional `useChessGame` (chess.js) integration with legal-move, check/checkmate, and algebraic-notation (`moveSan`) support.

### Patch Changes

- [#7](https://github.com/intermezzo-chess/intermezzo-chessground/pull/7) [`b92c5db`](https://github.com/intermezzo-chess/intermezzo-chessground/commit/b92c5dbc0638ec3a3109523aee38c76f6f8be688) Thanks [@nloding](https://github.com/nloding)! - Destroy the live board instance on unmount after a `viewOnly` or `drawable.visible` recreation. Previously, unmount destroyed the original instance a second time and left the replacement running.
  
  Develop and test against `@lichess-org/chessground` 10.4.2. The peer range remains `^10.1.1` because the wrapper uses no APIs added after 10.1.1. Chessground 10.2.0 and later also disconnect the board's `ResizeObserver` when it is destroyed; earlier versions keep the observer alive after unmount or recreation.

## 1.0.0-alpha.0

### Major Changes

- Initial 1.0 alpha release: a strongly-typed React wrapper for lichess.org's chessground, exposing its full `Config`/`Api` surface via `<Chessground>` and the headless `useChessground` hook, plus an optional `useChessGame` (chess.js) integration with legal-move, check/checkmate, and algebraic-notation (`moveSan`) support.
