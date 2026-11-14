import test from 'node:test';
import assert from 'node:assert/strict';
import {CREATION_MODES,normalizeCreationMode,modeDescription,demoShotsForMode} from '../vibe-studio/creation-modes.mjs';
import {projectSnapshot} from '../vibe-studio/timeline.mjs';
import {deepseekStoryboardRequest} from '../vibe-studio/engine-contract.mjs';
import {readFile} from 'node:fs/promises';

test('four creation modes have distinct titles and honest local storyboards',()=>{
 assert.deepEqual(Object.keys(CREATION_MODES),['animation','knowledge','story','brand']);
 const titles=Object.values(CREATION_MODES).map(m=>m.title);
 assert.equal(new Set(titles).size,4);
 for(const id of Object.keys(CREATION_MODES)){
  const samples=demoShotsForMode(id);assert.equal(samples.length,3);
  assert.equal(samples.reduce((n,shot)=>n+shot.duration,0),15);
  samples[0].title='changed';assert.notEqual(demoShotsForMode(id)[0].title,'changed');
 }
});
test('project export retains mode and old projects default safely',()=>{
 const newer=projectSnapshot({prompt:'作品',mode:'brand',shots:[]});
 assert.equal(newer.mode,'brand');
 assert.equal(projectSnapshot({prompt:'legacy',shots:[]}).mode,'animation');
 assert.equal(projectSnapshot({mode:'../../bad',shots:[]}).mode,'animation');
});
test('DeepSeek request includes per-mode directing guidance',()=>{
 const a=deepseekStoryboardRequest('介绍一款新产品',{mode:'brand',duration:30});
 const k=deepseekStoryboardRequest('解释太阳系',{mode:'knowledge',duration:30});
 const brand=JSON.parse(a.messages[1].content),knowledge=JSON.parse(k.messages[1].content);
 assert.equal(brand.creationMode,'brand');assert.equal(knowledge.creationMode,'knowledge');
 assert.notEqual(brand.creationGuidance,knowledge.creationGuidance);
 assert.equal(modeDescription(normalizeCreationMode('unexpected')).title,CREATION_MODES.animation.title);
});
test('four homepage entries and shared editor remain wired in shipped UI',async()=>{
 const html=await readFile('dist/vibe-studio/index.html','utf8');
 const js=await readFile('dist/vibe-studio/studio.js','utf8');
 for(const id of Object.keys(CREATION_MODES))assert.match(html,new RegExp('data-mode="'+id+'"'));
 assert.match(html,/id="current-mode"/);
 assert.match(js,/selectCreationMode/);
 assert.match(js,/mode:project\.mode/);
});
