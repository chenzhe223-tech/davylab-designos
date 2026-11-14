import {deepseekStoryboardRequest,parseDeepseekStoryboard} from '../../../vibe-studio/engine-contract.mjs';

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const sameSecret=async(actual,expected)=>{
 if(typeof actual!=='string'||typeof expected!=='string'||!actual||!expected)return false;
 const encoder=new TextEncoder();
 const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(actual)),crypto.subtle.digest('SHA-256',encoder.encode(expected))]);
 return new Uint8Array(a).every((byte,index)=>byte===new Uint8Array(b)[index]);
};
export async function onRequestPost({request,env}){
 if(!env?.DEEPSEEK_API_KEY||!env?.VIBE_STUDIO_ACCESS_TOKEN)return json({error:'AI 分镜服务尚未配置'},503);
 const origin=request.headers.get('Origin');
 if(origin!==new URL(request.url).origin)return json({error:'仅允许同源访问'},403);
 const authorization=request.headers.get('Authorization')||'';
 if(!authorization.startsWith('Bearer ')||!(await sameSecret(authorization.slice(7),env.VIBE_STUDIO_ACCESS_TOKEN)))return json({error:'访问口令无效'},401);
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return json({error:'请求必须是 JSON'},415);
 const size=Number(request.headers.get('Content-Length')||0);
 if(size>8192)return json({error:'请求过大'},413);
 let input;
 try{const raw=await request.text();if(raw.length>8192)return json({error:'请求过大'},413);input=JSON.parse(raw)}catch{return json({error:'请求数据无效'},400)}
 const prompt=typeof input?.prompt==='string'?input.prompt.trim():'';
 const duration=Number(input?.duration??30);
 const aspectRatio=input?.aspectRatio??'9:16';
 if(prompt.length<3||prompt.length>4000||!Number.isInteger(duration)||duration<15||duration>120||!['9:16','16:9','1:1'].includes(aspectRatio))return json({error:'创意、时长或画幅参数无效'},400);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
 try{
  const payload=deepseekStoryboardRequest(prompt,{duration,aspectRatio});
  const upstream=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+env.DEEPSEEK_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({...payload,max_tokens:2000})});
  if(!upstream.ok)return json({error:upstream.status===429?'模型服务请求过于频繁':'模型服务调用失败',code:'UPSTREAM_ERROR'},502);
  const data=await upstream.json();
  const storyboard=parseDeepseekStoryboard(data);
  if(storyboard.durationSeconds<15||storyboard.durationSeconds>120)return json({error:'分镜总时长须为 15–120 秒，请调整镜头时长后重试'},422);
  return json({source:'deepseek',storyboard});
 }catch(err){return json({error:err?.name==='AbortError'?'分镜生成超时':'模型响应解析失败',code:'GENERATION_FAILED'},502)}
 finally{clearTimeout(timeout)}
}
export function onRequest(){return json({error:'仅支持 POST'},405)}
