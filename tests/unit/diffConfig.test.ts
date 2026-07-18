import { describe, expect, it } from 'vitest';
import type { Config } from '@lichess-org/chessground/config';
import type { Dests, Key } from '@lichess-org/chessground/types';
import { diffConfig } from '../../src/diffConfig';

function dests(entries: [Key, Key[]][]): Dests {
  return new Map(entries);
}

describe('diffConfig', () => {
  it('sends the full config through (with no recreate) when there is no previous config', () => {
    const next: Config = { fen: 'start', orientation: 'white' };
    const { config, needsRecreate } = diffConfig(undefined, next);
    expect(needsRecreate).toBe(false);
    expect(config).toEqual({ fen: 'start', orientation: 'white' });
  });

  it('includes only the scalar keys that changed', () => {
    const prev: Config = { fen: 'start', orientation: 'white' };
    const next: Config = { fen: 'start', orientation: 'black' };
    const { config, needsRecreate } = diffConfig(prev, next);
    expect(needsRecreate).toBe(false);
    expect(config).toEqual({ orientation: 'black' });
  });

  it('omits fen from the diff when it is unchanged, even if other props changed', () => {
    const prev: Config = { fen: 'start', orientation: 'white', coordinates: true };
    const next: Config = { fen: 'start', orientation: 'black', coordinates: false };
    const { config } = diffConfig(prev, next);
    expect(config).not.toHaveProperty('fen');
    expect(config).toEqual({ orientation: 'black', coordinates: false });
  });

  describe('`check` presence semantics', () => {
    it('never includes check when it is absent from next, regardless of prev', () => {
      const prev: Config = { check: 'white' };
      const next: Config = { orientation: 'black' };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('check');
    });

    it('includes an explicit false to unset check', () => {
      const prev: Config = { check: 'white' };
      const next: Config = { check: false };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ check: false });
    });

    it('omits check when present but unchanged from prev', () => {
      const prev: Config = { check: 'white' };
      const next: Config = { check: 'white' };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('check');
    });

    it('includes check on first appearance even if prev had no check key at all', () => {
      const prev: Config = { orientation: 'white' };
      const next: Config = { orientation: 'white', check: 'black' };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ check: 'black' });
    });
  });

  describe('`lastMove` presence semantics', () => {
    it('never includes lastMove when absent from next', () => {
      const prev: Config = { lastMove: ['e2', 'e4'] };
      const next: Config = { orientation: 'black' };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('lastMove');
    });

    it('forwards a present-but-empty lastMove verbatim to unset it', () => {
      const prev: Config = { lastMove: ['e2', 'e4'] };
      const next: Config = { lastMove: [] };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ lastMove: [] });
    });

    it('treats equal-content arrays as unchanged even with a new array reference', () => {
      const prev: Config = { lastMove: ['e2', 'e4'] };
      const next: Config = { lastMove: ['e2', 'e4'] };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('lastMove');
    });
  });

  describe('movable.dests wholesale-replace semantics', () => {
    it('always resends the full current dests map whenever the movable group changes', () => {
      const destsA = dests([['e2', ['e3', 'e4']]]);
      const destsB = dests([['d2', ['d3', 'd4']]]);
      const prev: Config = { movable: { color: 'white', dests: destsA } };
      const next: Config = { movable: { color: 'black', dests: destsB } };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ movable: { color: 'black', dests: destsB } });
    });

    it('resends dests even when only a sibling movable field changed and dests itself did not', () => {
      const d = dests([['e2', ['e3', 'e4']]]);
      const prev: Config = { movable: { color: 'white', dests: d } };
      const next: Config = { movable: { color: 'black', dests: d } };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ movable: { color: 'black', dests: d } });
    });

    it('does not touch movable at all when nothing in the group changed', () => {
      const d = dests([['e2', ['e3', 'e4']]]);
      const prev: Config = { movable: { color: 'white', dests: d } };
      const next: Config = { movable: { color: 'white', dests: d } };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('movable');
    });
  });

  describe('drawable.autoShapes wholesale-replace semantics', () => {
    it('always resends the full current autoShapes array whenever the drawable group changes', () => {
      const shapesA = [{ orig: 'e2' as const, brush: 'green' }];
      const shapesB = [{ orig: 'd2' as const, brush: 'red' }];
      const prev: Config = { drawable: { enabled: true, autoShapes: shapesA } };
      const next: Config = { drawable: { enabled: false, autoShapes: shapesB } };
      const { config } = diffConfig(prev, next);
      expect(config).toEqual({ drawable: { enabled: false, autoShapes: shapesB } });
    });
  });

  describe('nested `events` field-by-field comparison (movable/premovable/predroppable)', () => {
    it('movable: does not resend the group when a fresh events object wraps the same callback', () => {
      const after = () => {};
      const prev: Config = { movable: { color: 'white', events: { after } } };
      // A brand-new `events` object literal, but the same `after` reference inside — exactly
      // what an inline `movable={{ events: { after: memoizedFn } }}` produces every render.
      const next: Config = { movable: { color: 'white', events: { after } } };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('movable');
    });

    it('movable: resends the group when the after callback reference actually changes', () => {
      const prev: Config = { movable: { color: 'white', events: { after: () => {} } } };
      const next: Config = { movable: { color: 'white', events: { after: () => {} } } };
      const { config } = diffConfig(prev, next);
      expect(config).toHaveProperty('movable.events');
    });

    it('premovable: does not resend the group when a fresh events object wraps the same callbacks', () => {
      const set = () => {};
      const unset = () => {};
      const prev: Config = { premovable: { enabled: true, events: { set, unset } } };
      const next: Config = { premovable: { enabled: true, events: { set, unset } } };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('premovable');
    });

    it('premovable: resends the group when a callback reference actually changes', () => {
      const set = () => {};
      const prev: Config = { premovable: { enabled: true, events: { set } } };
      const next: Config = { premovable: { enabled: true, events: { set: () => {} } } };
      const { config } = diffConfig(prev, next);
      expect(config).toHaveProperty('premovable.events');
    });

    it('predroppable: does not resend the group when a fresh events object wraps the same callbacks', () => {
      const set = () => {};
      const prev: Config = { predroppable: { enabled: true, events: { set } } };
      const next: Config = { predroppable: { enabled: true, events: { set } } };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('predroppable');
    });

    it('the top-level events group is unaffected (already compares individual callbacks)', () => {
      const change = () => {};
      const prev: Config = { events: { change } };
      const next: Config = { events: { change } };
      const { config } = diffConfig(prev, next);
      expect(config).not.toHaveProperty('events');
    });
  });

  describe('viewOnly / drawable.visible recreate semantics', () => {
    it('reports needsRecreate and excludes viewOnly from the set() payload', () => {
      const prev: Config = { viewOnly: false };
      const next: Config = { viewOnly: true };
      const { config, needsRecreate } = diffConfig(prev, next);
      expect(needsRecreate).toBe(true);
      expect(config).not.toHaveProperty('viewOnly');
    });

    it('reports needsRecreate for drawable.visible and excludes it from the drawable payload', () => {
      const prev: Config = { drawable: { visible: true, enabled: true } };
      const next: Config = { drawable: { visible: false, enabled: false } };
      const { config, needsRecreate } = diffConfig(prev, next);
      expect(needsRecreate).toBe(true);
      expect(config).toEqual({ drawable: { enabled: false } });
    });

    it('does not report needsRecreate when neither viewOnly nor drawable.visible changed', () => {
      const prev: Config = { viewOnly: false, drawable: { visible: true } };
      const next: Config = { viewOnly: false, drawable: { visible: true, enabled: false } };
      const { needsRecreate } = diffConfig(prev, next);
      expect(needsRecreate).toBe(false);
    });
  });
});
