import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const api = await readFile(new URL('../engine-api/server.py', import.meta.url), 'utf8');
const docker = await readFile(new URL('../engine-api/Dockerfile', import.meta.url), 'utf8');
const inventory = await readFile(new URL('../scripts/capability-inventory.py', import.meta.url), 'utf8');

test('engine API exposes only the explicit health, status, capabilities and official engine routes', () => {
  assert.match(api, /path == "\/health"/);
  assert.match(api, /path == "\/api\/status"/);
  assert.match(api, /path == "\/api\/capabilities"/);
  assert.match(api, /path == "\/api\/search"/);
  assert.match(api, /payload\.get\("limit", 3\)/);
  assert.match(api, /"--max-results", str\(max_results\)/);
  assert.match(api, /invalid_max_results/);
  assert.match(api, /self\._json\(200, result\)/);
  assert.match(api, /path == "\/api\/generate"/);
  assert.match(api, /invalid_design_dial/);
  assert.match(api, /for dial in \("variance", "motion", "density"\)/);
  assert.match(api, /args \+= \["--" \+ dial, str\(value\)\]/);
  assert.match(api, /def read_json_output\(args, timeout=60\)/);
  assert.match(api, /timeout=timeout/);
  assert.match(api, /node.*designos\.mjs/);
  assert.match(api, /engine-status/);
});
test('engine API has bounded input, origin allowlist, rate limiting, and no credential literals', () => {
  assert.match(api, /REQUEST_LIMIT = 12_000/);
  assert.match(api, /RATE_LIMIT = 60/);
  assert.match(api, /def client_rate_limit_key\(handler\)/);
  assert.match(api, /CF-Connecting-IP/);
  assert.match(api, /trusted_local_proxy/);
  assert.match(api, /requests_by_ip\[client_rate_limit_key\(self\)\]/);
  assert.match(api, /Retry-After/);
  assert.match(api, /ALLOWED_ORIGINS/);
  assert.match(api, /parsed\.hostname\.endswith\("\.davylab-designos\.pages\.dev"\)/);
  assert.match(api, /parsed\.scheme == "https"/);
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

test('capability endpoint supports source-backed filtering and bounded pagination', () => {
  assert.match(api, /parse_qs/);
  assert.match(api, /requested_domain/);
  assert.match(api, /params.get\("q"/);
  assert.match(api, /max\(1, min\(100/);
  assert.match(api, /totalMatches/);
  assert.match(api, /nextOffset/);
  assert.match(api, /record\.get\("fields", \{\}\)/);
  assert.match(inventory, /"fields": row/);
});

test('official CLI forwards native design dials only within 1-10 bounds', async () => {
  const cli = await readFile(new URL('../scripts/designos.mjs', import.meta.url), 'utf8');
  assert.match(cli, /for \(const dial of \['variance', 'motion', 'density'\]\)/);
  assert.match(cli, /value < 1 \|\| value > 10/);
  assert.match(cli, /engineArgs\.push\('--' \+ dial, String\(value\)\)/);
});


test('Skill Resource Hub exposes read-only registry routes and deterministic Agent matching', () => {
  assert.match(api, /REGISTRY_PATH = ROOT \/ "resources" \/ "registry\.json"/);
  assert.match(api, /path == "\/api\/skills"/);
  assert.match(api, /path\.startswith\("\/api\/skills\/"\)/);
  assert.match(api, /path == "\/api\/skills\/match"/);
  assert.match(api, /def load_resource_registry\(\)/);
  assert.match(api, /def resource_tokens\(value\)/);
  assert.match(api, /def find_resource_matches\(/);
  assert.match(api, /"matchMode": "weighted-keyword"/);
  assert.match(api, /"semantic": False/);
  assert.match(api, /"matchScore": score/);
  assert.match(api, /"matchReasons": reasons/);
  assert.match(api, /"maxCharacters": 2000/);
  assert.match(api, /"invalid_limit"/);
  assert.match(api, /def resource_has_visibility\(resource, visibility\)/);
  assert.match(api, /params\.get\("visibility"/);
  assert.match(api, /payload\.get\("visibility"\)/);
  assert.match(api, /private_registry_requires_cloudflare_access/);
});
