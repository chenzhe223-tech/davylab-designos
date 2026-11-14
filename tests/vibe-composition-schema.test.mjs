import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {prepareRenderProject} from '../vibe-renderer/render-input.mjs';

const sample=(durations=[5,5,5],format='landscape')=>({
  prompt:'一座未来城市从星光中生长',
  format,
  mode:'animation',
  shots:durations.map((duration,index)=>({title:'镜头 '+(index+1),visual:'星光组成建筑',duration}))
});

test('Remotion Composition imports exactly the same production validator as render CLI',async()=>{
  const source=await readFile(new URL('../vibe-renderer/src/root.tsx',import.meta.url),'utf8');
  assert.match(source,/import\s+\{prepareRenderProject\}\s+from\s+['"]\.\.\/render-input\.mjs['"]/);
  assert.match(source,/prepareRenderProject\(props\.project\?\?DEFAULT\)/);
  assert.match(source,/const DEFAULT=\{[^\n]*prompt:/,'default props must include a valid prompt');
  assert.doesNotMatch(source,/seconds<1\|\|seconds>600/);
});

test('actual default Composition props are accepted by renderer without fallback',async()=>{
  const source=await readFile(new URL('../vibe-renderer/src/root.tsx',import.meta.url),'utf8');
  const literal=source.match(/^const DEFAULT=(\\{.*\\});$/m)?.[1];
  assert.ok(literal,'default project literal missing');
  const defaults=runInNewContext('('+literal+')',Object.create(null),{timeout:1000});
  const render=prepareRenderProject(defaults);
  assert.equal(render.durationSeconds,15);
  assert.equal(render.project.mode,'animation');
  assert.equal(render.project.prompt,'星光构成一座未来城市');
});

test('shared composition input resolves 15-second, 450-frame landscape video',()=>{
  const prepared=prepareRenderProject(sample());
  assert.equal(prepared.durationSeconds,15);
  assert.equal(prepared.durationInFrames,450);
  assert.deepEqual([prepared.width,prepared.height],[1920,1080]);
});

test('shared validator resolves 120-second portrait limit',()=>{
  const prepared=prepareRenderProject(sample([40,40,40],'portrait'));
  assert.equal(prepared.durationInFrames,3600);
  assert.deepEqual([prepared.width,prepared.height],[1080,1920]);
  assert.throws(()=>prepareRenderProject(sample([41,40,40])) ,/15–120/);
});

test('invalid project cannot enter composition metadata calculations',()=>{
  assert.throws(()=>prepareRenderProject(sample([5,5,4])),/15–120/);
  assert.throws(()=>prepareRenderProject(sample([15,0])),/1–120/);
  assert.throws(()=>prepareRenderProject(sample(Array.from({length:25},()=>1))),/0–24/);
});
