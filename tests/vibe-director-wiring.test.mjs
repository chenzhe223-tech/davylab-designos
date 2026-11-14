import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planDirectorProject} from '../vibe-studio/director.mjs';
test('four creative modes map to truthful shot engine choices',()=>{
 const modes={animation:'anidoodle',knowledge:'knowledgeFilm',story:'stickman',brand:'shotcraft'};
 for(const [mode,engine] of Object.entries(modes)){
  const p=planDirectorProject({mode,shots:[{duration:5},{duration:10}]});
  assert.equal(p.shots[0].preferredEngine,engine);
  assert.equal(p.shots[0].canDispatch,false);
  assert.equal(p.renderStatus,'not-rendered');
 }
});
test('director UI never claims unfinished skill rendering is done',async()=>{
 const [js,html,css]=await Promise.all(['vibe-studio/studio.js','vibe-studio/index.html','vibe-studio/premium.css'].map(p=>readFile(new URL('../'+p,import.meta.url),'utf8')));
 assert.match(js,/planDirectorProject/);
 assert.match(js,/renderDirectorPlan/);
 assert.match(js,/未集成，不能直接渲染/);
 assert.match(html,/id="director-plan"/);
 assert.match(css,/\.director-shot/);
});
test('WebM preview recorder follows 15-120 second project instead of hardcoded 10s',async()=>{
 const [js,html]=await Promise.all(['vibe-studio/studio.js','vibe-studio/index.html'].map(p=>readFile(new URL('../'+p,import.meta.url),'utf8')));
 assert.match(js,/duration=totalDuration\(project\.shots\)/);
 assert.match(js,/duration<15\|\|duration>120/);
 assert.match(js,/duration\*1000/);
 assert.doesNotMatch(js,/setTimeout\(\(\)=>\{if\(recorder\.state==='recording'\)recorder\.stop\(\)\},10000\)/);
 assert.match(html,/录制完整分镜 WebM/);
 assert.match(html,/MP4 尚未接通/);
});
