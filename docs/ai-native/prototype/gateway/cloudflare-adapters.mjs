// DAVYLAB Cloudflare adapters: never store bearer tokens or model keys in client code.
export function createSupabaseSessionVerifier({supabaseUrl,publishableKey,fetchImpl=fetch,allowedUserIds=null}){
 if(!/^https:\/\//.test(supabaseUrl||'')||!publishableKey)throw new TypeError('Supabase configuration required');
 return async request=>{
  const auth=request.headers.get('authorization')||'';
  if(!/^Bearer [A-Za-z0-9._-]{20,4096}$/.test(auth))return null;
  const response=await fetchImpl(new URL('/auth/v1/user',supabaseUrl),{headers:{apikey:publishableKey,authorization:auth},signal:AbortSignal.timeout(7000)});
  if(response.status===401||response.status===403)return null;
  if(!response.ok)throw Error('Authentication provider unavailable');
  const user=await response.json();
  if(!user?.id||typeof user.id!=='string')return null;
  if(allowedUserIds&&!allowedUserIds.includes(user.id))return null;
  // Project-scoped permissions MUST be resolved server-side; never trust user_metadata or request scopes.
  return {userId:user.id,scopes:[]};
 };
}
export function createD1Quota({db,dailyCalls=20}){
 if(!db?.prepare||!Number.isSafeInteger(dailyCalls)||dailyCalls<1)throw new TypeError('D1 quota configuration required');
 return async ({userId,appId,projectId})=>{
  if(!userId||!appId||!projectId)throw new TypeError('Quota scope missing');
  const day=new Date().toISOString().slice(0,10);
  const id=JSON.stringify([day,userId,appId,projectId,'chat']);
  // A single D1 write prevents concurrent requests from racing past the limit.
  const row=await db.prepare('INSERT INTO ai_gateway_usage(id, uses, updated_at) VALUES (?1,1,?2) ON CONFLICT(id) DO UPDATE SET uses=uses+1, updated_at=excluded.updated_at WHERE uses < ?3 RETURNING uses').bind(id,new Date().toISOString(),dailyCalls).first();
  return {allowed:!!row,remaining:row?Math.max(0,dailyCalls-row.uses):0};
 };
}
export function createProjectScopeResolver({lookup}){
 if(typeof lookup!=='function')throw new TypeError('Server-side lookup required');
 return async (session,{appId,projectId})=>{
  if(!session?.userId)return null;
  const allowed=await lookup({userId:session.userId,appId,projectId});
  return allowed?{...session,scopes:[appId+':'+projectId+':chat']}:null;
 };
}
