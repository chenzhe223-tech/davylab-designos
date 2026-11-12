// Cloudflare Pages Function: server-side authenticated, bounded logo generation.
// Do not expose OPENAI_API_KEY in static assets.
const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const safeText=(v,n=600)=>String(v||'').slice(0,n);
export async function onRequestPost({request,env}){
  const origin=request.headers.get('origin');
  if(origin && new URL(origin).origin!==new URL(request.url).origin)return respond({error:'cross-origin forbidden'},403);
  const length=Number(request.headers.get('content-length')||0);
  if(length>12000)return respond({error:'request too large'},413);
  const token=request.headers.get('X-Logo-Access-Token')||'';
  if(env.LOGO_STUDIO_ACCESS_TOKEN && token!==env.LOGO_STUDIO_ACCESS_TOKEN)return respond({error:'access token required'},401);
  // If platform key is absent, user can provide a temporary per-request key; it is never persisted here.
  const key=env.OPENAI_API_KEY||request.headers.get('X-Provider-Key');
  if(!key)return respond({error:'AI model not configured. Set OPENAI_API_KEY in Pages secrets or provide a temporary provider key.'},503);
  let data;try{data=await request.json()}catch{return respond({error:'invalid JSON'},400)}
  if(!data||!data.request||typeof data.request!=='string'||data.request.length>1500)return respond({error:'brand brief required (max 1500 chars)'},400);
  const revise=data.mode==='refine';
  if(revise && (typeof data.sourceSvg!=='string'||data.sourceSvg.length>20000))return respond({error:'source SVG required'},400);
  const input={brand:safeText(data.brand,70),request:safeText(data.request,1500),tagline:safeText(data.tagline,120),type:safeText(data.type,40),style:safeText(data.style,70),color:safeText(data.color,24),usage:safeText(data.usage,90),revision:safeText(data.revision,500),sourceSvg:revise?safeText(data.sourceSvg,20000):undefined};
  const instruction=revise?'Refine the supplied SVG concept according to the revision instruction. Return exactly one modified concept in the same JSON schema.':'Create exactly THREE clearly differentiated original logo directions.';
  const system=['You are a senior brand identity designer and SVG craftsperson.',instruction,'Respond with ONLY a JSON object: {"concepts":[{"name":"...","rationale":"...","svg":"<svg ...>...</svg>"}]}.','Each SVG is standalone, viewBox 0 0 600 240, simple vector shapes and editable text, explicit fill colors, no foreignObject, script, image, use, external URL, remote font, CSS, gradients with URL references, filters, animations or event handlers. Avoid resemblance to existing brands.','Prioritize legibility, typography and distinctive forms; keep every SVG under 15000 characters.','Never claim trademark clearance or final production certification.'].join(' ');
  let upstream;
  try{
    upstream=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'authorization':'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({model:env.LOGO_STUDIO_MODEL||'gpt-4.1-mini',temperature:0.7,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(input)}],max_completion_tokens:5500})});
  }catch{return respond({error:'provider network error'},502)}
  if(!upstream.ok){const msg=await upstream.text();return respond({error:'model request failed',providerStatus:upstream.status,detail:msg.slice(0,300)},502)}
  let payload;try{payload=await upstream.json()}catch{return respond({error:'invalid provider response'},502)}
  let parsed;try{parsed=JSON.parse(payload?.choices?.[0]?.message?.content||'')}catch{return respond({error:'AI returned invalid JSON'},502)}
  const concepts=parsed.concepts;
  if(!Array.isArray(concepts)||concepts.length!==(revise?1:3))return respond({error:'AI did not return the required number of concepts'},422);
  function validateSvg(svg){
    if(typeof svg!=='string'||svg.length>16000||!/^\s*<svg\b/i.test(svg)||!/</.test(svg))return false;
    const normalized=svg.replace(/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/g,'');
    if(/<!DOCTYPE|<!ENTITY|<\/?(?:script|foreignObject|iframe|object|embed|image|use|animate|set|style|filter)\b|\bon[a-z]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|https?:|@import/i.test(svg))return false;
    if(!/\bviewBox\s*=\s*["'][^"']+["']/.test(svg))return false;
    return true;
  }
  if(!concepts.every(x=>x&&validateSvg(x.svg)))return respond({error:'AI result rejected by SVG safety gate; retry with a different brief'},422);
  return respond({concepts:concepts.map(x=>({name:safeText(x.name,80),rationale:safeText(x.rationale,650),svg:x.svg})),source:'live-model',model:env.LOGO_STUDIO_MODEL||'gpt-4.1-mini',productionReady:false,manualReview:['trademark','originality','font licensing','small-size optical legibility']});
}
export async function onRequestGet(){return respond({configured:false,info:'POST only; model provider credentials required for live generation'},405)}
