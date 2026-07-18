import type { Config } from '@lichess-org/chessground/config';

type ConfigGroupKey =
  | 'highlight'
  | 'animation'
  | 'movable'
  | 'premovable'
  | 'predroppable'
  | 'draggable'
  | 'selectable'
  | 'events'
  | 'drawable';

const GROUP_KEYS = [
  'highlight',
  'animation',
  'movable',
  'premovable',
  'predroppable',
  'draggable',
  'selectable',
  'events',
  'drawable',
] as const satisfies readonly ConfigGroupKey[];

/**
 * Scalar (non-nested) `Config` keys handled by simple reference comparison.
 * `viewOnly` is intentionally excluded — it's a recreate trigger, never a `.set()` field.
 * `check` and `lastMove` are handled separately below to preserve chessground's
 * presence-based (not just truthiness-based) semantics.
 */
const SCALAR_KEYS = [
  'fen',
  'orientation',
  'turnColor',
  'selected',
  'coordinates',
  'coordinatesOnSquares',
  'ranksPosition',
  'autoCastle',
  'disableContextMenu',
  'addPieceZIndex',
  'addDimensionsCssVarsTo',
  'blockTouchScroll',
  'touchIgnoreRadius',
  'trustAllEvents',
  'jsHover',
] as const satisfies readonly (keyof Config)[];

function arraysEqual(
  a: readonly unknown[] | undefined,
  b: readonly unknown[] | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => Object.is(value, b[index]));
}

/**
 * Groups whose `events` subkey is itself a nested object of callbacks (`{after?, ...}`) rather
 * than a callback directly — comparing that object by reference would treat a fresh inline
 * `events: { after: fn }` literal (the pattern used throughout this library's own docs) as
 * "changed" on every render, even when the individual callbacks are stable (e.g. memoized with
 * `useCallback`). The top-level `Config.events` group is unaffected: its own subkeys (`change`,
 * `move`, ...) are already individual callbacks, compared directly below.
 */
const NESTED_EVENTS_GROUPS = new Set(['movable', 'premovable', 'predroppable']);

function shallowChanged(
  prev: Record<string, unknown> | undefined,
  next: Record<string, unknown>,
): boolean {
  if (!prev) return true;
  return Object.keys(next).some((key) => !Object.is(prev[key], next[key]));
}

export interface ConfigDiff {
  /** Minimal partial config to pass to `api.set()`. Empty when nothing changed. */
  config: Partial<Config>;
  /**
   * True when `viewOnly` or `drawable.visible` changed since `prev`. Both fields only take
   * effect at construction time inside chessground, so the caller must destroy and reconstruct
   * the instance rather than calling `api.set()`.
   */
  needsRecreate: boolean;
}

/**
 * Computes the minimal partial `Config` needed to move chessground from `prev` to `next` via
 * `api.set()`, preserving chessground's own merge / wholesale-replace / unset semantics:
 *
 * - Only changed top-level scalars and changed group subkeys are included, relying on
 *   chessground's own deep-merge for everything left out.
 * - `check` is only included when present on `next` (mirrors chessground's `'check' in config`
 *   check — omitting the prop must leave existing check state untouched).
 * - `lastMove` is only included when present on `next`; a present-but-falsy value is forwarded
 *   verbatim so chessground's own "falsy lastMove unsets it" behavior still fires.
 * - `movable.dests` / `drawable.autoShapes` are always resent in full whenever their parent
 *   group has any change, matching chessground's wholesale-replace (never partial-merge)
 *   handling of those two fields.
 * - `viewOnly` / `drawable.visible` changes are reported via `needsRecreate` instead of being
 *   included in `config`.
 * - `movable.events` / `premovable.events` / `predroppable.events` are compared field-by-field
 *   (per callback), not by the wrapping object's identity — so passing a fresh inline `events`
 *   object each render doesn't by itself count as a change, as long as the individual callback
 *   references are stable (e.g. memoized with `useCallback`).
 *
 * Pure and React-free — safe to unit test directly.
 */
export function diffConfig(prev: Config | undefined, next: Config): ConfigDiff {
  const needsRecreate =
    prev !== undefined &&
    (!Object.is(prev.viewOnly, next.viewOnly) ||
      !Object.is(prev.drawable?.visible, next.drawable?.visible));

  const config: Record<string, unknown> = {};

  for (const key of SCALAR_KEYS) {
    if (key === 'fen') {
      if (next.fen !== undefined && next.fen !== prev?.fen) config.fen = next.fen;
      continue;
    }
    const prevVal = prev?.[key];
    const nextVal = next[key];
    if (!Object.is(prevVal, nextVal)) {
      config[key] = nextVal;
    }
  }

  if ('check' in next && (!prev || !('check' in prev) || !Object.is(prev.check, next.check))) {
    config.check = next.check;
  }

  if ('lastMove' in next && !arraysEqual(prev?.lastMove, next.lastMove)) {
    config.lastMove = next.lastMove;
  }

  for (const groupKey of GROUP_KEYS) {
    const nextGroup = next[groupKey] as Record<string, unknown> | undefined;
    if (nextGroup === undefined) continue;
    const prevGroup = prev?.[groupKey] as Record<string, unknown> | undefined;

    const groupDiff: Record<string, unknown> = {};
    let groupChanged = false;
    for (const subKey of Object.keys(nextGroup)) {
      // Handled via `needsRecreate` above — never forwarded to `.set()`.
      if (groupKey === 'drawable' && subKey === 'visible') continue;

      const nextVal = nextGroup[subKey];
      const prevVal = prevGroup?.[subKey];

      const changed =
        subKey === 'events' &&
        NESTED_EVENTS_GROUPS.has(groupKey) &&
        nextVal &&
        typeof nextVal === 'object'
          ? shallowChanged(
              prevVal as Record<string, unknown> | undefined,
              nextVal as Record<string, unknown>,
            )
          : !Object.is(prevVal, nextVal);

      if (changed) {
        groupDiff[subKey] = nextVal;
        groupChanged = true;
      }
    }

    if (!groupChanged) continue;

    if (groupKey === 'movable' && 'dests' in nextGroup) groupDiff.dests = nextGroup.dests;
    if (groupKey === 'drawable' && 'autoShapes' in nextGroup)
      groupDiff.autoShapes = nextGroup.autoShapes;

    config[groupKey] = groupDiff;
  }

  return { config: config as Partial<Config>, needsRecreate };
}
