import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestPost,onRequestGet} from '../functions/api/logo/generate.js';
const endpoint='https://davylab-designos.pages.dev/api/logo/generate';
const makeReq=(body={},headers={})=>new Request(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const base={request:'For DAVYLAB a minimalist international tech brand',brand:'DAVYLAB'};
const svg=i=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240"><path fill="#2563ff" d="M'+(i*18)+' 20h50v70z"/><text x="120" y="125" font-family="Arial" font-size="40" fill="#192330">DAVYLAB</text></svg>';
const concepts=()=>[1,2,3].map(i=>({name:'Concept '+i,rationale:'Original direction '+i,construction:'Distinct path geometry',color:'#2563ff',svg:svg(i)}));
const withFetch=async(mock,task)=>{const orig=globalThis.fetch;globalThis.fetch=mock;try{return await task()}finally{globalThis.fetch=orig}};
test('no-key rejects before provider call',async()=>{
 const r=await onRequestPost({request:makeReq(base),env:{}});
 assert.equal(r.status,503);assert.match((await r.json()).error,/configure|not configured/);
});
test('server funded provider requires access token',async()=>{
 const r=await onRequestPost({request:makeReq(base),env:{OPENAI_API_KEY:'test',LOGO_STUDIO_ACCESS_TOKEN:'gate'}});
 assert.equal(r.status,401);
});
test('server funded provider cannot run without an access gate',async()=>{
 const r=await onRequestPost({request:makeReq(base),env:{OPENAI_API_KEY:'test'}});
 assert.equal(r.status,503);assert.match((await r.json()).error,/access token/);
});

test('user BYOK overrides configured platform key without consuming its quota',async()=>{
 await withFetch(async(url,options)=>{
  assert.equal(options.headers.authorization,'Bearer user-own-key');
  return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({strategy:{},concepts:concepts()})}}]}),{status:200});
 },async()=>{
  const r=await onRequestPost({request:makeReq(base,{'X-Provider-Key':'user-own-key'}),env:{OPENAI_API_KEY:'platform-paid-key',LOGO_STUDIO_ACCESS_TOKEN:'admin'}});
  assert.equal(r.status,200);
 });
});
test('browser cross-origin request is rejected',async()=>{
 const r=await onRequestPost({request:makeReq(base,{origin:'https://attacker.example'}),env:{OPENAI_API_KEY:'test'}});
 assert.equal(r.status,403);
});
test('unknown provider and invalid model are rejected',async()=>{
 let r=await onRequestPost({request:makeReq({...base,provider:'attacker'}),env:{}});
 assert.equal(r.status,400);
 r=await onRequestPost({request:makeReq({...base,provider:'deepseek',model:'surprise-paid-model'}),env:{}});
 assert.equal(r.status,400);
});
test('OpenAI compatible live model generates three genuinely distinct editable SVGs',async()=>{
 await withFetch(async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({strategy:{positioning:'Design for independent creators'},concepts:concepts()})}}]}),{status:200}),async()=>{
  const r=await onRequestPost({request:makeReq(base,{'X-Provider-Key':'test-key'}),env:{}});
  assert.equal(r.status,200);const body=await r.json();
  assert.equal(body.concepts.length,3);assert.equal(body.source,'live-model');
  assert.equal(body.productionReady,false);assert.equal(body.strategy.positioning,'Design for independent creators');
  assert.equal(body.checks.svgStatic,true);assert.equal(body.designSkill,'davylab-logo-production-v1');
 });
});
test('DeepSeek provider routes to dedicated endpoint with allowlisted flash model',async()=>{
 let called=false;
 await withFetch(async(url,options)=>{
  called=true;assert.equal(url,'https://api.deepseek.com/chat/completions');
  const input=JSON.parse(options.body);assert.equal(input.model,'deepseek-flash');assert.equal(input.response_format.type,'json_object');
  assert.equal(options.headers.authorization,'Bearer mock-deepseek');
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({strategy:{personality:'Modern'},concepts:concepts()})}}]}),{status:200});
 },async()=>{
  const r=await onRequestPost({request:makeReq({...base,provider:'deepseek',model:'deepseek-flash'},{'X-Provider-Key':'mock-deepseek'}),env:{}});
  assert.equal(r.status,200);const body=await r.json();assert.equal(body.provider,'deepseek');assert.equal(body.model,'deepseek-flash');
 });
 assert.ok(called);
});
test('malicious SVG output fails closed',async()=>{
 await withFetch(async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({concepts:[1,2,3].map(i=>({name:'bad'+i,svg:'<svg viewBox="0 0 600 240"><script>alert(1)</script></svg>'}))})}}]}),{status:200}),async()=>{
  const r=await onRequestPost({request:makeReq(base,{'X-Provider-Key':'test'}),env:{}});
  assert.equal(r.status,422);
 });
});
test('identical geometries and image-only noneditable outputs are rejected',async()=>{
 for(const type of ['duplicate','image']){
  const c=concepts();
  if(type==='duplicate')c.forEach(x=>x.svg=svg(1));
  else c.forEach(x=>x.svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240"><image href="https://evil.example/logo.jpg"/></svg>');
  await withFetch(async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({concepts:c})}}]}),{status:200}),async()=>{
   const r=await onRequestPost({request:makeReq(base,{'X-Provider-Key':'test'}),env:{}});
   assert.equal(r.status,422);
  });
 }
});
test('refine without original valid SVG is rejected',async()=>{
 const r=await onRequestPost({request:makeReq({...base,mode:'refine'},{'X-Provider-Key':'test'}),env:{}});
 assert.equal(r.status,400);
});
test('GET describes providers but never reveals API keys',async()=>{
 const r=await onRequestGet();
 const json=await r.json();
 assert.equal(r.status,200);assert.deepEqual(json.availableProviders,['deepseek','openai']);
 assert.equal(json.productionReady,false);
});
