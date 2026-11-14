import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {onRequestPost} from '../functions/api/vibe/storyboard.js';
import {projectSnapshot} from '../vibe-studio/timeline.mjs';
import {prepareRenderProject} from '../vibe-renderer/render-input.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
test('DeepSeek response contract can be imported into renderer without losing scene metadata',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({title:'光之城',scenes:[{title:'粒子汇聚',durationSeconds:8,visual:'星光汇聚',motion:'推近',narration:'光出现了'},{title:'城市生长',durationSeconds:9,visual:'建筑拔地而起',motion:'俯拍'},{title:'晨曦',durationSeconds:8,visual:'天空渐亮',motion:'慢速平移'}]})}}]}),{status:200});
 try{
  const request=new Request('https://example.test/api/vibe/storyboard',{method:'POST',headers:{Origin:'https://example.test',Authorization:'Bearer test-pass','Content-Type':'application/json'},body:JSON.stringify({prompt:'一座城市从星光中生长',duration:25,aspectRatio:'16:9'})});
  const response=await onRequestPost({request,env:{VIBE_STUDIO_ACCESS_TOKEN:'test-pass',DEEPSEEK_API_KEY:'test-deepseek-key'}});
  assert.equal(response.status,200);
  const {storyboard}=await response.json();
  const project=projectSnapshot({prompt:'一座城市从星光中生长',format:'landscape',shots:storyboard.scenes.map(s=>({title:s.title,visual:s.visual,motion:s.motion,narration:s.narration,duration:s.durationSeconds}))});
  const render=prepareRenderProject(project);
  assert.equal(render.durationSeconds,25);
  assert.equal(render.durationInFrames,750);
  assert.deepEqual(render.project.shots.map(s=>s.start),[0,8,17]);
  assert.equal(render.project.shots[0].motion,'推近');
  assert.equal(render.project.shots[0].narration,'光出现了');
  assert.deepEqual([render.width,render.height],[1920,1080]);
 }finally{globalThis.fetch=originalFetch}
});
