# Contributing

## Setup

```sh
npm install
```

## Scripts

| Command                           | What it does                                                                                                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                   | Builds the library (`dist/`) — JS, bundled `.d.ts`, and CSS.                                                                                                                                                                                                                           |
| `npm run demo`                    | Runs the demo app against `src/` directly (no build step, hot-reloads).                                                                                                                                                                                                                |
| `npm run storybook`               | Runs Storybook against `src/` directly.                                                                                                                                                                                                                                                |
| `npm run lint`                    | ESLint.                                                                                                                                                                                                                                                                                |
| `npm run format` / `format:check` | Prettier.                                                                                                                                                                                                                                                                              |
| `npm run typecheck`               | `tsc --noEmit`.                                                                                                                                                                                                                                                                        |
| `npm run test:unit`               | Vitest, jsdom, chessground mocked — wiring/lifecycle/prop-diffing correctness.                                                                                                                                                                                                         |
| `npm run test:browser`            | Vitest Browser Mode (Playwright, real Chromium), real chessground — genuine drag/click/premove/draw-shape interaction coverage. jsdom stubs `getBoundingClientRect()` and can't simulate real pointer sequences, so this layer is required for anything touching actual drag geometry. |
| `npm run test:all`                | Both test projects.                                                                                                                                                                                                                                                                    |
| `npm run docs`                    | Generates the TypeDoc API reference into `docs-api/` (gitignored).                                                                                                                                                                                                                     |

## Before opening a PR

```sh
npm run lint && npm run typecheck && npm run test:all && npm run build
```

All four should pass — this mirrors what CI runs.

## Architecture notes

- **Never call chessground's `Chessground(el, config)` constructor on every render.** It's constructed once on mount; every subsequent prop change goes through `api.set()` via `diffConfig` (`src/diffConfig.ts`), or — for the `viewOnly`/`drawable.visible` special case — an explicit destroy + reconstruct. Recreating the instance on a normal prop change destroys in-flight drag/selection/animation state.
- **`diffConfig` is pure and React-free** — extend its test coverage (`tests/unit/diffConfig.test.ts`) directly when adding new special-cased fields, without needing to mount anything.
- **Reuse chessground's own exported types** (`@lichess-org/chessground/{api,config,types,draw,fen}`) rather than redefining shapes — this is how the wrapper avoids drifting out of sync as chessground's own `Config`/`Api` evolve upstream.
- **The `chess-js` integration must stay fully decoupled** from the core wrapper — `src/chess-js/` has zero imports from `@lichess-org/chessground` itself (only its type-only re-exports), so consumers who never import `@intermezzo-chess/chessground-react/chess-js` never pull chess.js into their bundle.

## Testing a real interaction manually

If a browser test is flaky or you're debugging drag geometry, `npm run demo` is the fastest way to reproduce and watch it happen in a real browser.

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets). Run `npm run changeset` after a change that should ship in the next release, and follow the prompts to describe it and pick a semver bump. `.github/workflows/release.yml` handles versioning and publishing once merged to `main` — see that workflow for the one-time `NPM_TOKEN` setup it expects.
