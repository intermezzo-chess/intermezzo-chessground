import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const script = path.resolve(import.meta.dirname, '../../scripts/check-release-prepared.mjs');

let root: string;

function write(file: string, contents: string) {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function writeChangeset(id: string, releases: string) {
  write(`.changeset/${id}.md`, `---\n${releases}---\n\nSummary.\n`);
}

function enterPre(mode: 'pre' | 'exit') {
  write('.changeset/pre.json', JSON.stringify({ mode, tag: 'alpha' }));
}

function check() {
  return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'check-release-prepared-'));
  write('package.json', JSON.stringify({ name: 'fixture', version: '1.0.0-alpha.0' }));
  write('.changeset/config.json', JSON.stringify({ changelog: false, access: 'public' }));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('check-release-prepared', () => {
  it('accepts a prepared prerelease version with consumed prerelease history', () => {
    enterPre('pre');
    writeChangeset('pre/initial-alpha-release', "'fixture': major\n");

    expect(check().status).toBe(0);
  });

  it('rejects a queued changeset that the version PR has not prepared', () => {
    enterPre('pre');
    writeChangeset('pre/initial-alpha-release', "'fixture': major\n");
    writeChangeset('queued-fix', "'fixture': patch\n");

    const result = check();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('fixture@1.0.0-alpha.1');
  });

  it('accepts an empty changeset, which plans no release', () => {
    writeChangeset('empty', '');

    expect(check().status).toBe(0);
  });

  it('rejects a pending prerelease exit', () => {
    enterPre('exit');
    writeChangeset('pre/initial-alpha-release', "'fixture': major\n");

    expect(check().status).toBe(1);
  });
});
