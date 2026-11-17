import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {renderHirstCanvas,renderHirstVariantButtons,getHirstVariant} from '../studio/hirst-chromatic.js';

const profiles=JSON.parse(readFileSync(new URL('../profiles/index.json',import.meta.url),'utf8'));
const profile=profiles.find(p=>p.profileId==='davylab-hirst-chromatic');
const safe=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const project={name:'Color & Form',accent:'#E94676',canvas:'#F7FAFF',ink:'#17233A',radius:14,density:15,chromaticVariant:'spots'};

test('new artwork-derived profile is source-backed and valid',()=>{
  assert.ok(profile);
  assert.equal(profile.status,'draft');
  assert.equal(profile.presentation.id,'hirst-chromatic');
  assert.equal(profile.artPalette.sampled,false);
  assert.match(profile.source.evidence,/mp.weixin.qq.com/);
  assert.equal(profile.artPalette.variants.length,4);
  for(const v of profile.artPalette.variants){
    assert.equal(v.colors.length,6);
    assert.equal(new Set(v.colors).size,6);
    for(const color of [...v.colors,v.accent,v.canvas,v.ink])assert.match(color,/^#[0-9a-f]{6}$/i);
  }
});

test('every chromatic variant can render an original HTML/CSS preview',()=>{
  for(const v of profile.artPalette.variants){
    const preview=renderHirstCanvas({...project,chromaticVariant:v.id},profile,safe);
    assert.match(preview,/mock-hirst/);
    assert.ok(preview.includes(v.name));
    assert.ok(preview.includes(v.colors[0]));
    assert.ok(preview.includes('ORIGINAL STUDY'));
    assert.ok(!/<img\b/i.test(preview),'do not embed any original Hirst artwork');
  }
});

test('art previews escape user-supplied project names',()=>{
  const preview=renderHirstCanvas({...project,name:'<script>alert(1)</script>'},profile,safe);
  assert.doesNotMatch(preview,/<script>/);
  assert.match(preview,/&lt;script&gt;/);
});

test('selection buttons expose four accessible functional variants',()=>{
  const buttons=renderHirstVariantButtons(project,profile,safe);
  assert.equal((buttons.match(/data-action="hirst-variant"/g)||[]).length,4);
  assert.match(buttons,/aria-pressed="true"/);
  assert.equal(getHirstVariant(profile,'unknown').id,'spots');
});

test('stylesheet and built root include chromatic assets',()=>{
  assert.ok(existsSync(new URL('../studio/hirst-chromatic.css',import.meta.url)));
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(html,/hirst-chromatic\.css/);
  assert.match(html,/"id":"hirst-chromatic"/);
  assert.match(html,/"artPalette"/);
});
