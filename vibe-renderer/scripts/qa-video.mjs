import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {stat} from 'node:fs/promises';
const run=(command,args)=>new Promise((ok,bad)=>{const p=spawn(command,args,{shell:false,windowsHide:true});let out='',err='';p.stdout.on('data',b=>out+=b.toString());p.stderr.on('data',b=>err+=b.toString());p.on('error',bad);p.on('close',code=>code===0?ok({stdout:out,stderr:err}):bad(new Error(command+' exited '+code+': '+err.slice(-800))))});
export async function inspectMp4(path,{expectedSeconds,minBytes=10000}={}){
 const filename=resolve(path);
 const file=await stat(filename);
 if(file.size<minBytes)throw new Error('MP4 is unexpectedly small');
 const probe=await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',filename]);
 const media=JSON.parse(probe.stdout);
 const video=media.streams?.find(s=>s.codec_type==='video');
 if(!video)throw new Error('No video stream');
 const duration=Number(media.format?.duration);
 if(video.codec_name!=='h264')throw new Error('Expected H.264, got '+video.codec_name);
 if(!Number.isFinite(duration)||duration<=0)throw new Error('Invalid duration');
 if(Number.isFinite(expectedSeconds)&&Math.abs(duration-expectedSeconds)>.5)throw new Error('Duration mismatch: '+duration+' vs '+expectedSeconds);
 if(!Number.isInteger(video.width)||!Number.isInteger(video.height)||video.width<320||video.height<320)throw new Error('Resolution is invalid');
 const scan=await run('ffmpeg',['-hide_banner','-nostdin','-i',filename,'-vf','blackdetect=d=0.15:pix_th=0.05:pic_th=0.98','-an','-f','null','-']);
 const blackMatches=[...scan.stderr.matchAll(/black_start:([\d.]+)\s+black_end:([\d.]+)/g)];
 if(blackMatches.length)throw new Error('Black frame region(s) detected: '+blackMatches.map(x=>x[0]).join('; '));
 return {verified:true,codec:video.codec_name,width:video.width,height:video.height,durationSeconds:duration,bytes:file.size,blackRegions:0};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 const path=process.argv[2],expected=process.argv[3]?Number(process.argv[3]):undefined;
 if(!path){console.error('Usage: node scripts/qa-video.mjs <video.mp4> [expectedSeconds]');process.exit(2)}
 inspectMp4(path,{expectedSeconds:expected}).then(r=>console.log(JSON.stringify(r,null,2)),err=>{console.error('QA FAILED: '+err.message);process.exitCode=1});
}
