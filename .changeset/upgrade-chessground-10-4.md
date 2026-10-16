---
'@intermezzo-chess/chessground-react': patch
---

Destroy the live board instance on unmount after a `viewOnly` or `drawable.visible` recreation. Previously, unmount destroyed the original instance a second time and left the replacement running.

Develop and test against `@lichess-org/chessground` 10.4.2. The peer range remains `^10.1.1` because the wrapper uses no APIs added after 10.1.1. Chessground 10.2.0 and later also disconnect the board's `ResizeObserver` when it is destroyed; earlier versions keep the observer alive after unmount or recreation.
