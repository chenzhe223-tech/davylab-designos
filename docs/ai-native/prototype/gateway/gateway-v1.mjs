// DAVYLAB isolated AI Gateway v1 — framework-neutral security boundary
const reply=(error,status)=>new Response(JSON.stringify({error}),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
export function createGateway({verifySession,authorizeScope,consumeQuota,callProvider,allowedOrigins=[]}){
 if([verifySession,consumeQuota,callProvider].some(f=>typeof f!=="function"))throw new TypeError("Missing security adapter");
 const origins=new Set(allowedOrigins);
 return async request=>{
  const u=new URL(request.url);
  if(u.pathname==="/health"&&request.method==="GET")return Response.json({status:"ok",mode:"prototype"});
  if(u.pathname!=="/v1/chat")return reply("not_found",404);
  if(request.method!=="POST")return reply("method_not_allowed",405);
  const origin=request.headers.get("origin");
  if(!origin||!origins.has(origin))return reply("origin_denied",403);
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")||""))return reply("invalid_content_type",415);
  if(Number(request.headers.get("content-length")||0)>32768)return reply("payload_too_large",413);
  let session;try{session=await verifySession(request)}catch{return reply("auth_unavailable",503)}
  if(!session?.userId)return reply("unauthorized",401);
  let data;try{const raw=await request.text();if(raw.length>32768)return reply("payload_too_large",413);data=JSON.parse(raw)}catch{return reply("invalid_json",400)}
  const {appId,projectId,messages}=data||{};
  if(!/^[a-z][a-z0-9-]{1,63}$/.test(appId||"")||typeof projectId!=="string"||!projectId||projectId.length>128)return reply("invalid_scope",400);
  try{if(authorizeScope)session=await authorizeScope(session,{appId,projectId})}catch{return reply("scope_unavailable",503)}
  if(!Array.isArray(session?.scopes)||!session.scopes.includes(appId+":"+projectId+":chat"))return reply("scope_denied",403);
  if(!Array.isArray(messages)||messages.length<1||messages.length>24||messages.some(m=>!m||!["user","assistant"].includes(m.role)||typeof m.content!=="string"||!m.content||m.content.length>8000))return reply("invalid_messages",400);
  if(messages.reduce((n,m)=>n+m.content.length,0)>12000)return reply("input_too_large",413);
  const maxTokens=Math.min(1024,Math.max(1,Number.isInteger(data.max_tokens)?data.max_tokens:512));
  let quota;try{quota=await consumeQuota({userId:session.userId,appId,projectId,maxTokens,requestId:crypto.randomUUID()})}catch{return reply("quota_unavailable",503)}
  if(!quota?.allowed)return reply("quota_exceeded",429);
  try{
   const upstream=await callProvider({messages,maxTokens,signal:request.signal,userId:session.userId,appId,projectId});
   if(!(upstream instanceof Response)||!upstream.ok||!upstream.body)return reply("provider_failed",502);
   return new Response(upstream.body,{headers:{"content-type":"text/event-stream; charset=utf-8","cache-control":"no-store","access-control-allow-origin":origin,"vary":"Origin"}});
  }catch(e){return reply(e?.name==="TimeoutError"?"provider_timeout":"provider_unavailable",e?.name==="TimeoutError"?504:502)}
 };
}
export function deepseekProvider({apiKey,fetchImpl=fetch,model="deepseek-chat",timeoutMs=25000}){
 if(!apiKey)throw new TypeError("Missing server-side key");
 return ({messages,maxTokens,signal})=>fetchImpl("https://api.deepseek.com/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+apiKey},body:JSON.stringify({model,messages,stream:true,max_tokens:maxTokens}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs)});
}
