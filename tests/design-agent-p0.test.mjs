import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeStrategy, onRequestPost, onRequestGet } from '../functions/api/brand/plan.js';

const payload={
  strategy:{brand_name:'ISLAND DAYS',tagline:'自然相伴',positioning:'品质海岛度假',audience:'年轻家庭',personality:'自然温暖',core_value:'亲子同行',brand_story:'以海岛为家的旅途',usage:'网站和物料',keywords:['自然'],assumptions:['需商标核验']},
  directions:[
    {name:'自然奢华',positioning:'自然',rationale:'松弛奢华',symbol:'日出',typography:'衬线',logo_type:'组合',headline:'海岛时光',palette:['#234567','#456789','#789ABC','#F3F4F5']},
    {name:'阳光活力',positioning:'家庭',rationale:'朝气轻快',symbol:'浪花',typography:'圆体',logo_type:'图形',headline:'日光之旅',palette:['#123456','#234567','#456789','#ABCDEF']},
    {name:'国际极简',positioning:'理性',rationale:'时尚国际化',symbol:'棕榈',typography:'简洁',logo_type:'字标',headline:'专属海岛',palette:['#111111','#333333','#555555','#777777']}
  ]
};
const request=(brief,headers={})=>new Request('https://davylab-designos.pages.dev/api/brand/plan',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify({brief})});

test('exactly three distinct directions with valid colors',()=>{
  const result=normalizeStrategy(payload);
  assert.equal(result.directions.length,3);
  assert.equal(result.strategy.brand_name,'ISLAND DAYS');
  assert.deepEqual(result.directions.map(x=>x.id),['A','B','C']);
  assert.ok(!normalizeStrategy({...payload,directions:payload.directions.slice(0,2)}).directions);
  assert.ok(normalizeStrategy({...payload,directions:[payload.directions[0],payload.directions[0],payload.directions[0]]}).error);
});
test('unconfigured provider never fabricates response',async()=>{
  const response=await onRequestPost({request:request('打造一个新的海岛度假品牌'),env:{}});
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/Key/);
});
test('reject cross origin before upstream call',async()=>{
  const response=await onRequestPost({request:request('打造一个新的海岛度假品牌',{origin:'https://evil.example'}),env:{}});
  assert.equal(response.status,403);
});
test('platform-funded request requires authorization',async()=>{
  const response=await onRequestPost({request:request('打造一个新的海岛度假品牌'),env:{DEEPSEEK_API_KEY:'SECRET',LOGO_STUDIO_ACCESS_TOKEN:'ACCESS'}});
  assert.equal(response.status,401);
});
test('GET reports supported models without exposing secrets',async()=>{
  const response=await onRequestGet();const data=await response.json();
  assert.equal(data.provider,'deepseek');assert.ok(data.models.includes('deepseek-flash'));
});
test('live DeepSeek response becomes validated plan, key only in upstream header',async()=>{
  const former=globalThis.fetch;let calls=0;
  globalThis.fetch=async(url,opts)=>{calls++;assert.equal(url,'https://api.deepseek.com/chat/completions');assert.equal(opts.headers.authorization,'Bearer test-user-key');assert.ok(!opts.body.includes('test-user-key'));return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(payload)},finish_reason:'stop'}]}),{status:200,headers:{'content-type':'application/json'}})};
  try{
    const res=await onRequestPost({request:request('为我设计海岛度假品牌，面向年轻家庭',{'X-Provider-Key':'test-user-key'}),env:{}});
    assert.equal(res.status,200);const body=await res.json();
    assert.equal(body.source,'live-deepseek');assert.equal(body.directions.length,3);assert.equal(calls,1);
  }finally{globalThis.fetch=former}
});
test('P0 route and build contract preserve existing Logo Studio',async()=>{
  const html=await readFile(new URL('../design-agent/index.html',import.meta.url),'utf8');
  const build=await readFile(new URL('../scripts/build.mjs',import.meta.url),'utf8');
  const js=await readFile(new URL('../design-agent/app.js',import.meta.url),'utf8');
  assert.match(html,/AI 品牌策略书/);assert.match(html,/三个创意方向/);assert.match(html,/双轨交接/);
  assert.match(build,/resolve\(root, 'logo-studio'\)/);assert.match(build,/resolve\(root, 'design-agent'\)/);
  assert.match(js,/davylab-design-agent-handoff-v1/);
});