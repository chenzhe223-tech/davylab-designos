/** DAVYLAB Chat SDK transport v0: framework-neutral SSE client. */
export class ChatError extends Error { constructor(message,status=0){super(message);this.name='ChatError';this.status=status;} }
export function createChatClient({baseUrl,fetchImpl=fetch,credentials='include'}={}){
 if(!baseUrl||!/^https?:\/\//.test(baseUrl))throw new TypeError('Absolute baseUrl required');
 const endpoint=new URL('/v1/chat',baseUrl).toString();
 async function* stream(messages,{signal,maxTokens=1024}={}){
  if(!Array.isArray(messages)||!messages.length)throw new TypeError('messages required');
  const r=await fetchImpl(endpoint,{method:'POST',credentials,signal,headers:{'content-type':'application/json',accept:'text/event-stream'},body:JSON.stringify({messages,max_tokens:maxTokens})});
  if(!r.ok)throw new ChatError('Chat request failed',r.status);
  if(!r.body)throw new ChatError('Missing stream body');
  const reader=r.body.getReader(),decoder=new TextDecoder();let buf='';
  try{while(true){const {done,value}=await reader.read();if(done)break;buf+=decoder.decode(value,{stream:true});const lines=buf.split(/\r?\n/);buf=lines.pop()??'';for(const line of lines){if(!line.startsWith('data:'))continue;const s=line.slice(5).trim();if(s==='[DONE]')return;let data;try{data=JSON.parse(s)}catch{continue}const delta=data?.choices?.[0]?.delta?.content;if(typeof delta==='string'&&delta)yield delta;}}}
  finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 }
 return {stream};
}
