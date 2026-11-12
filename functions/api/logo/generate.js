// DAVYLAB Logo Studio — real model-assisted, editable SVG production.
// Deterministic local templates remain explicitly separate from this endpoint.
// Never store or log any supplied API key; never advertise trademark clearance.
const reply=(body,status=200)=>new Response(JSON.stringify(body),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, private',
  'x-content-type-options':'nosniff','referrer-policy':'no-referrer'}
});
const clean=(value,max=600)=>String(value??'').trim().slice(0,max);
const MODELS={deepseek:['deepseek-flash','deepseek-v4-pro'],openai:['gpt-4.1-mini']};
const PROVIDERS={deepseek:'https://api.deepseek.com/chat/completions',openai:'https://api.openai.com/v1/chat/completions'};
const GUIDANCE=[
  'You are DAVYLAB Logo System, an expert identity strategist, typography director and meticulous SVG designer.',
  'Create real original bespoke vector concepts; never select from a fixed icon/template library.',
  'Brand craft: legible at 24/32px, strong silhouette, balanced negative space, optical correction, purposeful kerning, meaningful brand metaphor.',
  'Provide exactly three STRUCTURALLY DIFFERENT directions: distinctive wordmark, geometric abstract symbol and distinctive combination mark (unless user explicitly specifies a different logo type).',
  'SVG must be XML-parseable standalone <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240"> with purposeful path / circle / rect / polygon / line / polyline and editable text.',
  'Use explicit fill/stroke colors; no raster images, embedded SVG, filters, gradients, CSS, external fonts, remote references, handlers, scripts, animation, <use>, foreignObject, data URLs or style tags.',
  'Use platform fonts with a documented fallback; all text must remain editable. Do not claim text is outlined or font licensing verified.',
  'Avoid resemblance to famous marks; do not use an existing logo or imitate a named brand. Never claim trademark search or copyright clearance.',
  'Return VALID JSON ONLY; use keys strategy and concepts. Strategy object keys: positioning, audience, personality, promise, palette, typography, assumptions. Each concept keys: name, rationale, construction, color, svg.',
  'Important: "JSON" output; three distinct svg strings, each < 15000 characters. Do not write markdown.'
].join('\n');
const REFINE=[
  'You are DAVYLAB Logo System, refining exactly one existing editable logo SVG.',
  'Preserve the recognizable design identity unless instruction explicitly requests change.',
  'Return JSON ONLY with concepts array containing exactly one object {name,rationale,construction,color,svg}.',
  GUIDANCE
].join('\n');
const rejectSvg=(svg)=>{
  if(typeof svg!=='string'||svg.length>16000||svg.length<140||!/^<svg\b/i.test(svg.trim()))return 'SVG format/length';
  const stripped=svg.replace(/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/gi,'');
  if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|<\s*\/?\s*(?:script|style|foreignObject|iframe|object|embed|image|use|animate|set|filter|pattern)\b|\bon[a-z-]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|https?:|@import/i.test(stripped))return 'prohibited SVG element/reference';
  if(!/viewBox\s*=\s*["']0 0 600 240["']/i.test(svg))return 'viewBox must be 0 0 600 240';
  if(!/<(?:path|circle|rect|polygon|ellipse|polyline|line)\b/i.test(svg))return 'missing editable vector geometry';
  if(!/<text\b/i.test(svg))return 'missing editable brand text';
  if((svg.match(/<svg\b/gi)||[]).length!==1)return 'nested SVG unsupported';
  if(/<\s*(?:path|circle|rect|polygon|ellipse)\b[^>]*\b(?:d|r|width|points)\s*=\s*["']\s*["']/i.test(svg))return 'empty geometry';
  const tags=svg.match(/<\s*\/?\s*([a-zA-Z][\w:-]*)\b/g)||[];
  const valid=new Set(['svg','g','title','desc','path','circle','rect','ellipse','line','polyline','polygon','text','tspan']);
  if(tags.some(t=>!valid.has(t.replace(/^<\s*\/?\s*/,'').split(/\s/)[0])))return 'unsupported SVG tag';
  return '';
};
function validateConcepts(input,expected){
  if(!Array.isArray(input)||input.length!==expected)return {error:'incorrect concept count'};
  const concepts=[];
  for(let i=0;i<input.length;i++){
    const x=input[i];
    const issue=rejectSvg(x?.svg);
    if(issue)return {error:'concept '+(i+1)+': '+issue};
    concepts.push({name:clean(x.name,80),rationale:clean(x.rationale,650),
      construction:clean(x.construction,500),color:clean(x.color,160),svg:x.svg});
  }
  const signatures=concepts.map(x=>x.svg.replace(/<text\b[\s\S]*?<\/text>/gi,'').replace(/\s+/g,''));
  if(new Set(signatures).size!==signatures.length)return {error:'repeated visual geometries'};
  return {concepts};
}
export async function onRequestPost({request,env}){
  const origin=request.headers.get('origin');
  if(origin){try{if(new URL(origin).origin!==new URL(request.url).origin)return reply({error:'cross-origin request refused'},403)}
    catch{return reply({error:'invalid origin'},403)}}
  if(request.headers.get('sec-fetch-site')==='cross-site')return reply({error:'cross-site request refused'},403);
  const size=Number(request.headers.get('content-length')||0);
  if(size>25000)return reply({error:'request too large'},413);
  let data;try{data=await request.json()}catch{return reply({error:'invalid request JSON'},400)}
  if(!data||typeof data.request!=='string'||!data.request.trim()||data.request.length>1500)return reply({error:'brand brief required (1-1500 characters)'},400);
  const provider=clean(data.provider||'openai',20);
  if(!Object.hasOwn(MODELS,provider))return reply({error:'unsupported provider'},400);
  const model=clean(data.model||MODELS[provider][0],50);
  if(!MODELS[provider].includes(model))return reply({error:'model is not allowlisted'},400);
  const revise=data.mode==='refine';
  if(revise&&(!data.sourceSvg||rejectSvg(data.sourceSvg)||!clean(data.revision,500)))return reply({error:'valid source SVG and revision instruction required'},400);
  const serverKey=provider==='deepseek'?env.DEEPSEEK_API_KEY:env.OPENAI_API_KEY;
  if(serverKey){
    if(!env.LOGO_STUDIO_ACCESS_TOKEN)return reply({error:'server-funded generation disabled without access token'},503);
    if(request.headers.get('X-Logo-Access-Token')!==env.LOGO_STUDIO_ACCESS_TOKEN)return reply({error:'studio access token required'},401);
  }else if(env.LOGO_STUDIO_ACCESS_TOKEN&&request.headers.get('X-Logo-Access-Token')!==env.LOGO_STUDIO_ACCESS_TOKEN){
    return reply({error:'studio access token required'},401);
  }
  const temporaryKey=request.headers.get('X-Provider-Key')||'';
  const apiKey=serverKey||temporaryKey;
  if(!apiKey||apiKey.length>300)return reply({error:'configure '+(provider==='deepseek'?'DEEPSEEK_API_KEY':'OPENAI_API_KEY')+' secret or supply a temporary provider key'},503);
  const input={
    request:clean(data.request,1500),brand:clean(data.brand,80),tagline:clean(data.tagline,120),
    type:clean(data.type,40),style:clean(data.style,70),color:clean(data.color,24),
    usage:clean(data.usage,90),revision:revise?clean(data.revision,500):'',
    sourceSvg:revise?data.sourceSvg:undefined
  };
  const system=revise?REFINE:GUIDANCE;
  const user=JSON.stringify({task:revise?'Refine the single SVG.':'Create three distinct original production-grade vector directions and a coherent brand strategy.',brief:input});
  const options={model,messages:[{role:'system',content:system},{role:'user',content:user}],
    response_format:{type:'json_object'},temperature:0.65,stream:false};
  if(provider==='deepseek')options.max_tokens=10500;
  else options.max_completion_tokens=10500;
  let upstream;
  try{
    upstream=await fetch(PROVIDERS[provider],{method:'POST',headers:{'authorization':'Bearer '+apiKey,'content-type':'application/json'},
      body:JSON.stringify(options),signal:AbortSignal.timeout(85000)});
  }catch{return reply({error:'provider connection failed or timed out'},502)}
  if(!upstream.ok)return reply({error:'provider request failed',providerStatus:upstream.status},502);
  let payload;try{payload=await upstream.json()}catch{return reply({error:'provider returned invalid JSON'},502)}
  const message=payload?.choices?.[0]?.message?.content;
  if(!message||payload?.choices?.[0]?.finish_reason==='length')return reply({error:'provider response incomplete; try a shorter brand brief'},502);
  let parsed;try{parsed=JSON.parse(message)}catch{return reply({error:'provider did not return JSON'},422)}
  const checked=validateConcepts(parsed.concepts,revise?1:3);
  if(checked.error)return reply({error:'AI vector quality gate: '+checked.error},422);
  const raw=parsed.strategy||{};
  const strategy={positioning:clean(raw.positioning,350),audience:clean(raw.audience,350),
    personality:clean(raw.personality,350),promise:clean(raw.promise,350),
    palette:clean(raw.palette,350),typography:clean(raw.typography,350),assumptions:clean(raw.assumptions,350)};
  return reply({concepts:checked.concepts,strategy,
    source:'live-model',provider,model,designSkill:'davylab-logo-production-v1',
    productionReady:false,checks:{svgStatic:true,conceptCount:true,manualPending:['商标检索','原创差异审查','字体许可','24/32px实测','实体介质']},
    note:'Real model-generated editable vector candidates. Publication approval remains manual.'});
}
export async function onRequestGet(){
  return reply({info:'POST for real logo generation. Keys are never exposed; use BYOK or Cloudflare secrets.',availableProviders:['deepseek','openai'],productionReady:false},200);
}
