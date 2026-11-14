import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const file = p => readFile(new URL('../'+p, import.meta.url),'utf8');
const registry = JSON.parse(await file('resources/registry.json'));
const names = ['awesome-design-md','design-extract','designer-skills','graphify','impeccable','hallmark','huashu-design','figma-context-mcp','open-pencil','react-bits','transitions-dev'];

test('P0 catalog adds 11 truthful external references without duplicating pinned UI UX Pro Max', ()=>{
  const ids=registry.resources.map(r=>r.id);
  assert.equal(ids.length,36);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(registry.resources.filter(r=>r.id==='ui-ux-pro-max').length,1);
  for(const name of names){
    const r=registry.resources.find(r=>r.id===name);
    assert.ok(r,'missing '+name);
    assert.equal(r.status,'reference');
    assert.equal(r.maturity,'public-upstream-reference-not-installed');
    assert.equal(r.source.visibility,'public');
    assert.equal(r.activation.mode,'reference-only');
    assert.ok(r.source.url.startsWith('https://github.com/'));
    assert.ok(r.guardrails.some(s=>s.includes('没有安装')));
  }
});

test('public reference UI never mislabels references as integrated engines',async()=>{
  const html=await file('resources/index.html');
  assert.match(html,/r\.status==="reference"\?"仅供参考 · 未接入"/);
  assert.match(html,/r\.status==="reference"\?" reference"/);
});

test('DAVYLAB native design charter preserves product and verification boundaries',async()=>{
  const doc=await file('DESIGN.md');
  for(const label of ['Primitive tokens','Semantic tokens','Components','Rules','Skills','375','390','430','prefers-reduced-motion','Code Completed','Production Deployed','ui-ux-pro-max']){
    assert.ok(doc.includes(label),'missing design system contract '+label);
  }
  assert.match(doc,/reference-only, not installed, not invoked/);
});
