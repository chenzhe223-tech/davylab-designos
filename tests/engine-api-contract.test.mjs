import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const api = await readFile(new URL('../engine-api/server.py', import.meta.url), 'utf8');
const docker = await readFile(new URL('../engine-api/Dockerfile', import.meta.url), 'utf8');

test('engine API exposes only the explicit health, status, capabilities and official engine routes', () => {
  assert.match(api, /path == "\/health"/);
  assert.match(api, /path == "\/api\/status"/);
  assert.match(api, /path == "\/api\/capabilities"/);
  assert.match(api, /path == "\/api\/search"/);\n  assert.match(api, /self\._json\(200, result\)/);
  assert.match(api, /path == "\/api\/generate"/);
  assert.match(api, /node.*designos\.mjs/);
  assert.match(api, /ui-ux-pro-max/);
});

test('engine API has bounded input, origin allowlist, rate limiting, and no credential literals', () => {
  assert.match(api, /REQUEST_LIMIT = 12_000/);
  assert.match(api, /RATE_LIMIT = 20/);
  assert.match(api, /ALLOWED_ORIGINS/);
  assert.match(api, /origin_not_allowed/);
  assert.match(api, /rate_limit_exceeded/);
  assert.doesNotMatch(api, /sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}/);
});

test('Docker image installs the pinned engine before starting the API bridge', () => {
  assert.match(docker, /npm run engine:setup/);
  assert.match(docker, /capability-inventory\.py/);
  assert.match(docker, /test -s \/app\/generated\/skill-capability-inventory\.json/);
  assert.match(docker, /engine-api\/server\.py/);
});
