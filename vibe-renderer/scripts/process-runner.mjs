import {spawn} from 'node:child_process';
export function runRendererCommand(bin,args,{cwd,timeoutMs=600000,stdio='inherit'}={}){
 if(typeof bin!=='string'||!bin||!Array.isArray(args)||!Number.isFinite(timeoutMs)||timeoutMs<100||timeoutMs>900000)throw new Error('Invalid renderer command settings');
 return new Promise((resolve,reject)=>{
  let child,ended=false,timedOut=false,timeout,forceKill;
  const finish=error=>{if(ended)return;ended=true;clearTimeout(timeout);clearTimeout(forceKill);error?reject(error):resolve()};
  try{child=spawn(bin,args,{cwd,stdio,shell:false,windowsHide:true})}catch(error){finish(error);return}
  timeout=setTimeout(()=>{timedOut=true;child.kill('SIGTERM');forceKill=setTimeout(()=>child.kill('SIGKILL'),5000);forceKill.unref?.()},timeoutMs);
  child.once('error',error=>finish(error));
  child.once('close',(code,signal)=>{
   if(timedOut)return finish(new Error('Renderer timed out after '+timeoutMs+' ms'));
   if(code!==0)return finish(new Error('Renderer exited '+code+' '+(signal||'')));
   finish();
  });
 });
}
