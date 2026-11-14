import {createGateway,deepseekProvider} from './gateway-v1.mjs';
import {createSupabaseSessionVerifier,createD1Quota,createProjectScopeResolver} from './cloudflare-adapters.mjs';
// Deploy only to a new isolated Worker after permission table and secrets are configured.
export function buildHandler(env,{fetchImpl=fetch}={}){
 const verify=createSupabaseSessionVerifier({supabaseUrl:env.SUPABASE_URL,publishableKey:env.SUPABASE_PUBLISHABLE_KEY,fetchImpl});
 const quota=createD1Quota({db:env.DB,dailyCalls:Number(env.DAILY_CALLS||10)});
 const authorizeScope=createProjectScopeResolver({lookup:async({userId,appId,projectId})=>{
  const row=await env.DB.prepare('SELECT 1 AS allowed FROM ai_gateway_permissions WHERE user_id=?1 AND app_id=?2 AND project_id=?3 AND enabled=1 LIMIT 1').bind(userId,appId,projectId).first();
  return !!row;
 }});
 const provider=deepseekProvider({apiKey:env.DEEPSEEK_API_KEY,fetchImpl});
 return createGateway({verifySession:verify,authorizeScope,consumeQuota:quota,callProvider:provider,allowedOrigins:String(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean)});
}
export default {fetch(request,env){try{return buildHandler(env)(request)}catch{return new Response(JSON.stringify({error:'gateway_unconfigured'}),{status:503,headers:{'content-type':'application/json'}})}}};
