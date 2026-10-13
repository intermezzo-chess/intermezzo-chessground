# Contributing

## Setup

Check out the repository, run `npm install` and you're ready to rock.

> **AI assistance:** Agentic development is welcome in this repository if you follow solid practices and your agents produce quality code. Have your agent read [AGENTS.md](AGENTS.md) before making changes. It is the repository's instruction entry point and links to the [TypeScript](docs/TYPESCRIPT.md), [React](docs/REACT.md), and [CSS](docs/CSS.md) conventions; follow each document relevant to the change. If you use [bb](https://getbb.app/), [.bb/AGENTS.md](.bb/AGENTS.md) handles everything for you. Repository-specific instructions take precedence over the supporting conventions. Review AI-assisted changes and run the same checks as any other contribution.

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

If a browser test is flaky or you're debugging drag geometry, `npm run demo:standalone` is the fastest way to reproduce and watch it happen in a real browser.

## The Next.js demo (`demo/nextjs`)

Unlike `demo/standalone` (which aliases straight to `src/*.ts` for hot-reload convenience), `demo/nextjs` is a separate Next.js app with that depends on `@intermezzo-chess/chessground-react` via `file:../..`. It exists to verify real-bundler (webpack, via Next.js) behavior that this repo's own Vite-based tooling can't exercise — most importantly, that the `style.css` import survives production tree-shaking rather than being silently stripped.

Because of the `file:../..` dependency, **the root package must be built before `demo/nextjs` will have anything real to resolve**:

```sh
npm run build            # from the repo root
cd demo/nextjs
npm install               # one-time; not part of the root `npm install`
npm run dev                # or `npm run build` for the production/tree-shaking check
```

`demo/nextjs` has its own ESLint/TypeScript config (from `create-next-app`) and is excluded from the root `lint`/`typecheck` — it's intentionally not part of the root project's workspace.

**Its `dev`/`build` scripts explicitly pass `--webpack`.** As of Next.js 16, Turbopack is the default bundler for both — since the entire point of this app is verifying _webpack's_ handling of the `sideEffects` field (the one bundler this repo's own Vite-based tooling can't exercise), leaving it on the default would silently test the wrong thing.

And it's just kinda neat to have a full Next.js demo sitting here to play with!

## Releasing

See [Releasing](docs/RELEASING.md) for the release steps and preparation checklist. Changesets must be created manually; version PRs are automatic; publishing is manual.

## Scripts

| Command                           | What it does                                                                                                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                   | Builds the library (`dist/`) — JS, bundled `.d.ts`, and CSS.                                                                                                                                                                                                                           |
| `npm run demo:standalone`         | Runs the Vite demo app against `src/` directly (no build step, hot-reloads).                                                                                                                                                                                                           |
| `npm run demo:nextjs`             | Runs the Next.js demo app, which installs the package for real (via `dist/`, not aliased source) — see the note below.                                                                                                                                                                 |
| `npm run storybook`               | Runs Storybook against `src/` directly.                                                                                                                                                                                                                                                |
| `npm run lint`                    | ESLint.                                                                                                                                                                                                                                                                                |
| `npm run format` / `format:check` | Prettier.                                                                                                                                                                                                                                                                              |
| `npm run typecheck`               | `tsc --noEmit`.                                                                                                                                                                                                                                                                        |
| `npm run test:unit`               | Vitest, jsdom, chessground mocked — wiring/lifecycle/prop-diffing correctness.                                                                                                                                                                                                         |
| `npm run test:browser`            | Vitest Browser Mode (Playwright, real Chromium), real chessground — genuine drag/click/premove/draw-shape interaction coverage. jsdom stubs `getBoundingClientRect()` and can't simulate real pointer sequences, so this layer is required for anything touching actual drag geometry. |
| `npm run test:all`                | Both test projects.                                                                                                                                                                                                                                                                    |
| `npm run docs`                    | Generates the TypeDoc API reference into `docs-api/` (gitignored).                                                                                                                                                                                                                     |
