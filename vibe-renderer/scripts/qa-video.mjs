import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const runMediaCommand=(command,args,{timeoutMs=300000,maxOutputBytes=524288,onStderr}={})=>new Promise((ok,bad)=>{
 if(!Number.isFinite(timeoutMs)||timeoutMs<100||timeoutMs>600000||!Number.isInteger(maxOutputBytes)||maxOutputBytes<1024) return bad(new Error('Invalid media command limits'));
 const p=spawn(command,args,{shell:false,windowsHide:true});
 let out='',err='',completed=false,timedOut=false;
 const finish=(error,result)=>{if(completed)return;completed=true;clearTimeout(timer);error?bad(error):ok(result)};
 p.stdout.on('data',chunk=>{out=(out+chunk.toString()).slice(-maxOutputBytes)});
 p.stderr.on('data',chunk=>{if(onStderr)onStderr(chunk.toString());err=(err+chunk.toString()).slice(-maxOutputBytes)});
 p.on('error',error=>finish(error));
 p.on('close',code=>{if(timedOut)return finish(new Error(command+' timed out after '+timeoutMs+' ms'));if(code!==0)return finish(new Error(command+' exited '+code+': '+err.slice(-800)));finish(null,{stdout:out,stderr:err})});
 const timer=setTimeout(()=>{timedOut=true;p.kill('SIGKILL')},timeoutMs);
});
export function createBlackRegionScanner(){
 let partial='',regions=0,first=null;
 const consume=line=>{if(/black_start:[0-9.]+\s+black_end:[0-9.]+/.test(line)){regions++;if(first===null)first=line.trim().slice(0,250)}};
 return {
  feed(chunk){const lines=(partial+String(chunk)).split(/\r?\n/);partial=(lines.pop()||'').slice(-2048);for(const line of lines)consume(line)},
  finish(){if(partial)consume(partial);partial='';return {regions,first}}
 };
}
export async function inspectMp4(path,{expectedSeconds,minBytes=10000}={}){
 const filename=resolve(path);
 const file=await stat(filename);
 if(file.size<minBytes)throw new Error('MP4 is unexpectedly small');
 const probe=await runMediaCommand('ffprobe',['-v','error','-show_streams','-show_format','-of','json',filename]);
 const media=JSON.parse(probe.stdout);
 const video=media.streams?.find(s=>s.codec_type==='video');
 if(!video)throw new Error('No video stream');
 const duration=Number(media.format?.duration);
 if(video.codec_name!=='h264')throw new Error('Expected H.264, got '+video.codec_name);
 if(!Number.isFinite(duration)||duration<=0)throw new Error('Invalid duration');
 if(Number.isFinite(expectedSeconds)&&Math.abs(duration-expectedSeconds)>.5)throw new Error('Duration mismatch: '+duration+' vs '+expectedSeconds);
 if(!Number.isInteger(video.width)||!Number.isInteger(video.height)||video.width<320||video.heigh const scanner=createBlackRegionScanner();
 await runMediaCommand('ffmpeg',['-hide_banner','-nostdin','-i',filename,'-vf','blackdetect=d=0.15:pix_th=0.05:pic_th=0.98','-an','-f','null','-'],{onStderr:chunk=>scanner.feed(chunk)});
 const black=scanner.finish();
 if(black.regions>0)throw new Error('Black frame region(s) detected: '+black.regions+'; first: '+black.first);
ected: '+blackMatches.map(x=>x[0]).join('; '));
 return {verified:true,codec:video.codec_name,width:video.width,height:video.height,durationSeconds:duration,bytes:file.size,blackRegions:0};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const path=process.argv[2],expected=process.argv[3]?Number(process.argv[3]):undefined;
 if(!path){console.error('Usage: node scripts/qa-video.mjs <video.mp4> [expectedSeconds]');process.exit(2)}
 inspectMp4(path,{expectedSeconds:expected}).then(r=>console.log(JSON.stringify(r,null,2)),err=>{console.error('QA FAILED: '+err.message);process.exitCode=1});
}
