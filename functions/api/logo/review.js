// Optional, explicit AI advisory scoring. Model reads SVG SOURCE; this is not a visual, legal or trademark audit.
const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const MAX={brand:20,original:20,legibility:15,geometry:15,versatility:15,typography:10,production:5};
export async function onRequestPost({request,env}){
 const origin=request.headers.get('origin');
 if(origin){let ok=false;try{ok=new URL(origin).origin===new URL(request.url).origin}catch{}if(!ok)return respond({error:'cross-origin forbidden'},403)}
 if(Number(request.headers.get('content-length')||0)>25000)return respond({error:'request too large'},413);
 if(env.OPENAI_API_KEY&&!env.LOGO_STUDIO_ACCESS_TOKEN)return respond({error:'server model requires access token protection'},503);
 if(env.LOGO_STUDIO_ACCESS_TOKEN&&request.headers.get('X-Logo-Access-Token')!==env.LOGO_STUDIO_ACCESS_TOKEN)return respond({error:'access token required'},401);
 const key=env.OPENAI_API_KEY||request.headers.get('X-Provider-Key');
 if(!key)return respond({error:'AI model not configured'},503);
 let data;try{data=await request.json()}catch{return respond({error:'invalid JSON'},400)}
 const svg=data?.svg;
 if(typeof svg!=='string'||svg.length>16000||!/^\s*<svg\b/i.test(svg)||!(/\bviewBox\s*=/.test(svg)))return respond({error:'valid editable SVG required'},400);
 const normalized=svg.replace(/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/g,'');
 if(/<!DOCTYPE|<!ENTITY|<\/?(?:script|foreignObject|iframe|object|embed|image|use|animate|set|style|filter)\b|\bon[a-z]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|https?:|@import/i.test(normalized))return respond({error:'unsafe SVG rejected'},422);
 const instructions='You are a brand-design QA advisor. You are given only SVG XML SOURCE CODE and a brief, NOT a rendered image. Do not claim visual inspection, trademark clearance, originality legal verification, registration, or font licensing. Evaluate cautiously, mark uncertain criteria as tentative, and distinguish actual source evidence from assumptions. Return ONLY JSON: {"scores":{"brand":0,"original":0,"legibility":0,"geometry":0,"versatility":0,"typography":0,"production":0},"strengths":["..."],"risks":["..."],"recommendations":["..."],"limitations":["..."]}. Respect maximum points brand20 original20 legibility15 geometry15 versatility15 typography10 production5. Every score should be realistically conservative. No automatic approvals or legal claims.';
 let response;try{response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:env.LOGO_STUDIO_MODEL||'gpt-4.1-mini',temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:instructions},{role:'user',content:JSON.stringify({brief:String(data.brief||'').slice(0,1200),svg})}],max_completion_tokens:1600})})}catch{return respond({error:'model provider network failure'},502)}
 if(!response.ok)return respond({error:'AI provider rejected request',providerStatus:response.status},502);
 let result;try{const raw=await response.json();result=JSON.parse(raw?.choices?.[0]?.message?.content||'')}catch{return respond({error:'invalid AI review response'},502)}
 if(!result?.scores||Object.keys(MAX).some(key=>!Number.isFinite(result.scores[key])||result.scores[key]<0||result.scores[key]>MAX[key]))return respond({error:'AI scores invalid'},422);
 const list=k=>Array.isArray(result[k])?result[k].slice(0,6).map(x=>String(x).slice(0,300)):[];
 const scores=Object.fromEntries(Object.keys(MAX).map(k=>[k,Math.round(result.scores[k])]));
 const total=Object.values(scores).reduce((a,b)=>a+b,0);
 return respond({source:'live-model',reviewType:'advisory-source-only',scores,total,strengths:list('strengths'),risks:list('risks'),recommendations:list('recommendations'),limitations:[...list('limitations'),'The SVG source is not a rendered-image visual inspection. Human trademark, font licensing, small-size visual inspection and originality verification remain required.'],autoApproved:false,manualGatesUnchanged:true});
}
export function onRequestGet(){return respond({error:'POST only'},405)}
