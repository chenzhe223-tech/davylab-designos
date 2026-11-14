const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const json = (value, status=200) => new Response(JSON.stringify(value), {status,headers});
const safeEqual = (a,b) => { if(typeof a!=='string'||typeof b!=='string') return false; const x=new TextEncoder().encode(a), y=new TextEncoder().encode(b); let d=x.length^y.length; for(let i=0;i<Math.max(x.length,y.length);i++) d|=(x[i]||0)^(y[i]||0); return d===0; };
export async function handle(request, env) {
  const url=new URL(request.url);
  if(url.pathname==='/health' && request.method==='GET') return json({status:'ok',service:'davylab-ai-gateway',mode:'prototype'});
  if(url.pathname==='/v1/capabilities' && request.method==='GET') return json({chat:true,streaming:true,actions:false,files:false,search:false});
  if(url.pathname!=='/v1/chat') return json({error:'not_found'},404);
  if(request.method!=='POST') return json({error:'method_not_allowed'},405);
  const auth=request.headers.get('authorization')||'';
  if(!env?.DAVYLAB_GATEWAY_TOKEN || !safeEqual(auth,`Bearer ${env.DAVYLAB_GATEWAY_TOKEN}`)) return json({error:'unauthorized'},401);
  const origin=request.headers.get('origin');
  if(origin && (!env.ALLOWED_ORIGIN || origin!==env.ALLOWED_ORIGIN)) return json({error:'forbidden_origin'},403);
  if(Number(request.headers.get('content-length')||0)>32768) return json({error:'payload_too_large'},413);
  let body;
  try {body=await request.json();}catch{return json({error:'invalid_json'},400)}
  if(!body || !Array.isArray(body.messages)||body.messages.length<1||body.messages.length>30||body.messages.some(m=>!['user','assistant','system'].includes(m.role)||typeof m.content!=='string'||m.content.length>8000))return json({error:'invalid_messages'},400);
  if(!env.DEEPSEEK_API_KEY)return json({error:'upstream_not_configured'},503);
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),25000);
  try {
    const upstream=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',headers:{authorization:`Bearer ${env.DEEPSEEK_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:'deepseek-chat',messages:body.messages,stream:true,max_tokens:Math.min(Math.max(Number(body.max_tokens)||1024,1),2048)}),signal:AbortSignal.any([controller.signal,request.signal])});
    if(!upstream.ok)return json({error:'upstream_failure',status:upstream.status},502);
    return new Response(upstream.body,{status:200,headers:{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  } catch(e) {return json({error:controller.signal.aborted?'upstream_timeout':'upstream_unavailable'},controller.signal.aborted?504:502)} finally {clearTimeout(timeout)}
}
export default {fetch:handle};
