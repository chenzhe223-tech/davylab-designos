import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const canonical = JSON.parse(await readFile(new URL('../profiles/index.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const match = html.match(/const profiles=(\[[\s\S]*?\]);\nconst agents=\[/);
assert.ok(match, 'built page must contain generated profile registry');
const runtime = JSON.parse(match[1]);

test('built runtime profile registry is generated from the canonical source', () => {
  const selectable = canonical.filter(profile => profile.presentation && profile.status !== 'deprecated');
  assert.equal(runtime.length, selectable.length);
  for (const source of selectable) {
    const item = runtime.find(profile => profile.profileId === source.profileId);
    assert.ok(item, 'missing runtime profile for ' + source.profileId);
    assert.equal(item.version, source.version);
    assert.equal(item.name, source.name);
    assert.deepEqual(item.rules, source.rules);
    assert.equal(item.status, source.status);
    assert.equal(item.extends, source.extends);
    assert.equal(item.protected, Boolean(source.presentation.protected || source.layoutPreservation?.enabled));
  }
});

test('legacy UI identifiers are unique and map to stable canonical profile IDs', () => {
  const ids = runtime.map(profile => profile.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const profile of runtime) {
    assert.match(profile.id, /^[a-z0-9-]+$/);
    assert.ok(canonical.some(source => source.profileId === profile.profileId));
  }
});

test('inherited tokens resolve consistently and protected audit rules remain read-only', () => {
  const audit = runtime.find(profile => profile.id === 'dashboard-studio');
  assert.ok(audit);
  assert.equal(audit.protected, true);
  assert.equal(audit.tokens.color.canvas, '#F5F7FB');
  assert.ok(audit.rules.some(rule => rule.includes('不得重置') || rule.includes('生产发布')));
  const warm = runtime.find(profile => profile.id === 'warm-editorial');
  assert.ok(warm);
  assert.equal(warm.tokens.color.canvas, '#F8F4EC');
  assert.ok(warm.tokens.typography.fontFamily);
});
