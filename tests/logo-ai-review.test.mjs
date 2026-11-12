import test from 'node:test';import assert from 'node:assert/strict';import {onRequestPost} from '../functions/api/logo/review.js';
const endpoint='https://davylab-designos.pages.dev/api/logo/review';
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240"><path d="M0 0L100 0L100 100Z" fill="#111"/></svg>';
const req=(body,headers={})=>new Request(endpoint,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
test('AI advisory rejects missing credentials without any upstream call',async()=>{const r=await onRequestPost({request:req({svg}),env:{}});assert.equal(r.status,503)});
test('AI advisory protects server-owned model with required access token',async()=>{const r=await onRequestPost({request:req({svg}),env:{OPENAI_API_KEY:'test',LOGO_STUDIO_ACCESS_TOKEN:'gate'}});assert.equal(r.status,401)});
test('AI advisory rejects malicious SVG and unsupported origin',async()=>{
 let r=await onRequestPost({request:req({svg:svg.replace('</svg>','<script>alert(1)</script></svg>')},{'X-Provider-Key':'test'}),env:{}});assert.equal(r.status,422);
 r=await onRequestPost({request:req({svg},{origin:'https://evil.example','X-Provider-Key':'test'}),env:{}});assert.equal(r.status,403)
});
test('AI advisory validates proposed scores and never auto-approves trademarks',async()=>{
 const fetchOriginal=globalThis.fetch;
 const scores={brand:18,original:12,legibility:12,geometry:12,versatility:12,typography:8,production:4};
 globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({scores,strengths:['clear visual metaphor'],risks:['small size requires human visual test'],recommendations:['simplify shape'],limitations:['SVG source only']})}}]}),{status:200});
 try{const r=await onRequestPost({request:req({svg,brief:'DAVYLAB tech brand'},{'X-Provider-Key':'test'}),env:{}});assert.equal(r.status,200);const body=await r.json();assert.equal(body.reviewType,'advisory-source-only');assert.equal(body.total,78);assert.equal(body.autoApproved,false);assert.equal(body.manualGatesUnchanged,true)}finally{globalThis.fetch=fetchOriginal}
});
