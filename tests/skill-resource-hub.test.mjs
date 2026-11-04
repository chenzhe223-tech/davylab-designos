import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile(new URL('../resources/registry.json', import.meta.url), 'utf8'));
const page = await readFile(new URL('../resources/index.html', import.meta.url), 'utf8');
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const privateFunction = await readFile(new URL('../functions/resources/private-registry.json.js', import.meta.url), 'utf8');

test('public registry contains only public and reference resources', () => {
  assert.equal(registry.schemaVersion, '1.0.0');
  assert.ok(registry.registryVersion.startsWith('2026.11.04.'));
  const ids = registry.resources.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(registry.resources.length, 25);
  assert.equal(registry.resources.filter(item => item.type === 'skill').length, 22);
  assert.equal(registry.inventoryScope.catalog, 'public-and-reference-only');
  const serialized = JSON.stringify(registry);
  assert.equal(serialized.includes('workbuddy-workspace'), false);
  assert.equal(serialized.includes('chenzhe223-tech/dashboard-studio'), false);
  assert.equal(serialized.includes('"visibility":"private"'), false);
  for (const item of registry.resources) {
    assert.ok(item.name && item.summary && item.category && item.status, item.id);
    assert.ok(['skill','engine','visual-pack','profile-library'].includes(item.type), item.id);
    assert.ok(Array.isArray(item.whenToUse) && item.whenToUse.length, item.id + ' use cases');
    assert.ok(Array.isArray(item.guardrails) && item.guardrails.length, item.id + ' guardrails');
    assert.ok(Array.isArray(item.agentSupport) && item.agentSupport.length, item.id + ' Agent support');
    assert.ok(item.source, item.id + ' source');
    assert.ok(['public','reference'].includes(item.source.visibility), item.id + ' public source');
    for (const source of item.alternateSources || []) {
      assert.ok(['public','reference'].includes(source.visibility), item.id + ' public alternate source');
    }
  }
});

test('private-only entries are excluded while public references and public source variants remain', () => {
  const quote = registry.resources.find(item => item.id === 'bid-quote-cockpit');
  const mail = registry.resources.find(item => item.id === 'feishu-mail-workboard');
  const looseleaf = registry.resources.find(item => item.id === 'looseleaf-paper');
  const visualDNA = registry.resources.find(item => item.id === 'visual-dna-design');
  assert.equal(quote, undefined);
  assert.equal(mail, undefined);
  assert.equal(looseleaf.type, 'visual-pack');
  assert.equal(looseleaf.status, 'reference');
  assert.ok(looseleaf.guardrails.some(item => item.includes('不是可独立执行')));
  assert.equal(visualDNA.source.visibility, 'public');
  assert.equal(visualDNA.alternateSources.some(source => source.visibility === 'private'), false);
});

test('resource hub loads private metadata only from its protected endpoint', () => {
  assert.ok(page.includes('__RESOURCE_REGISTRY__'));
  assert.ok(page.includes('fetch("./private-registry.json"'));
  assert.ok(page.includes('credentials:"same-origin"'));
  assert.ok(page.includes('loadPrivateResources()'));
  assert.ok(page.includes('id="publicMarket"'));
  assert.ok(page.includes('id="integrations"'));
  assert.ok(page.includes('handoffKeyPocket'));
  assert.ok(page.includes('handoffNianBox'));
  assert.ok(page.includes('kp_capture='));
  assert.ok(page.includes('davySkill='));
  assert.ok(page.includes('/api/market/skills?q='));

  assert.ok(page.includes('const localIds=resources.map'));
  assert.ok(privateFunction.includes('Cf-Access-Jwt-Assertion'));
  assert.ok(privateFunction.includes('crypto.subtle.verify'));
  assert.ok(privateFunction.includes('env.PRIVATE_SKILLS.get("registry")'));
  assert.ok(privateFunction.includes('PRIVATE_REGISTRY_OWNER_EMAIL'));
  assert.ok(build.includes('resources/registry.json'));
  assert.ok(build.includes('__RESOURCE_REGISTRY__'));
  assert.ok(readme.includes('Skill Resource Hub'));
});
