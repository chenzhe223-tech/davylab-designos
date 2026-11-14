/** Standalone, zero-API-cost MP4 technical proof. NOT Remotion/official P0 acceptance. Linux FFmpeg 7+ and Noto CJK font are required. */
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {prepareRenderProject} from '../render-input.mjs';
const FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc';
const PALETTES={particles:['0x102947','0x5a91c1'],city:['0x122d4b','0x628dae'],nature:['0x15384b','0x4c9c9c']};
const sha=b=>createHash('sha256').update(b).digest('hex');
const label=(s,n=120)=>String(s||'').replace(/[\r\n\t]+/g,' ').trim().slice(0,n);
const ffPath=p=>p.replaceAll('\\','/').replaceAll(':','\\:').replaceAll("'","\\'");
export const runProcess=(binary,args,{timeoutMs=300000}={})=>new Promise((yes,no)=>{
 const proc=spawn(binary,args,{stdio:['ignore','pipe','pipe'],shell:false});let err='',done=false;
 const timer=setTimeout(()=>proc.kill('SIGKILL'),timeoutMs);
 const finish=e=>{if(done)return;done=true;clearTimeout(timer);e?no(e):yes()};
 proc.stdout.on('data',()=>{});proc.stderr.on('data',b=>{err=(err+b.toString()).slice(-1500)});
 proc.on('error',finish);proc.on('close',(code,signal)=>code===0?finish():finish(new Error(binary+' '+(signal||code)+' '+err)));
});
export async function renderTechnicalProof(input,output,{width=854,height=480,font=FONT}={}){
 const prepared=prepareRenderProject(input);
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||height<240||width>1920||height>1920||width%2||height%2)throw Error('Invalid proof resolution');
 const dest=resolve(output);await mkdir(resolve(dest,'..'),{recursive:true});
 const work=await mkdtemp(join(tmpdir(),'vibe-ffmpeg-')),segments=[];
 try{
  for(const [i,shot] of prepared.project.shots.entries()){
   const family=shot.visualFamily==='auto'?(/城市|建筑|楼/i.test(shot.visual)?'city':/自然|山|海|森林/i.test(shot.visual)?'nature':'particles'):shot.visualFamily;
   const [c0,c1]=PALETTES[family]||PALETTES.particles;
   const title=join(work,'title-'+i+'.txt'),desc=join(work,'desc-'+i+'.txt'),sub=join(work,'sub-'+i+'.txt');
   await Promise.all([writeFile(title,label(shot.title,60)),writeFile(desc,label(shot.visual,80)),writeFile(sub,label(shot.narration,90))]);
   const f=ffPath(font),t=ffPath(title),d=ffPath(desc),n=ffPath(sub),ts=Math.round(width*.056),ds=Math.round(width*.023);
   const filters=[
    'format=yuv420p','drawgrid=w=iw/12:h=ih/8:t=1:c=white@0.055',
    "drawtext=fontfile='"+f+"':textfile='"+t+"':fontsize="+ts+":fontcolor=white:x=(w-text_w)/2:y=h*0.30:box=1:boxcolor=0x09243c@0.18:boxborderw=14",
    "drawtext=fontfile='"+f+"':textfile='"+d+"':fontsize="+ds+":fontcolor=0xe3f4ff:x=(w-text_w)/2:y=h*0.53",
    "drawtext=fontfile='"+f+"':text='DAVYLAB VIBE STUDIO':fontsize=15:fontcolor=white@0.8:x=w*0.055:y=h*0.07",
    "drawtext=fontfile='"+f+"':text='FFmpeg verification render - not Remotion':fontsize=12:fontcolor=white@0.65:x=w*0.055:y=h*0.92"
   ];
   if(label(shot.narration))filters.push("drawtext=fontfile='"+f+"':textfile='"+n+"':fontsize="+ds+":fontcolor=white:x=(w-text_w)/2:y=h*0.80:box=1:boxcolor=0x061b2e@0.55:boxborderw=8");
   filters.push('fade=t=in:st=0:d=0.35','fade=t=out:st='+Math.max(0,shot.duration-.35)+':d=0.35');
   const segment=join(work,'scene-'+String(i).padStart(2,'0')+'.mp4');
   const src='gradients=s='+width+'x'+height+':r=30:c0='+c0+':c1='+c1+':type=radial:speed=0.065:duration='+shot.duration+':seed=12345';
   await runProcess('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','lavfi','-i',src,'-vf',filters.join(','),'-frames:v',String(shot.duration*30),'-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-video_track_timescale','30000',segment]);
   segments.push(segment);
  }
  const list=join(work,'scenes.txt');
  await writeFile(list,segments.map(p=>"file '"+p.replaceAll("'","'\\''")+"'").join('\n'));
  await runProcess('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',dest]);
  const probe=join(work,'probe.json');
  await runProcess('ffprobe',['-v','error','-show_streams','-show_format','-of','json','-o',probe,dest]);
  const meta=JSON.parse(await readFile(probe,'utf8')),video=meta.streams?.find(x=>x.codec_type==='video'),seconds=Number(meta.format?.duration);
  if(video?.codec_name!=='h264'||video.width!==width||video.height!==height||!Number.isFinite(seconds)||Math.abs(seconds-prepared.durationSeconds)>.2)throw Error('MP4 metadata QA failed');
  const bytes=await readFile(dest);
  const receipt={kind:'DAVYLAB-FFmpeg-technical-proof',remotionVerified:false,sourceSha256:sha(Buffer.from(JSON.stringify(prepared.project))),outputSha256:sha(bytes),durationSeconds:seconds,expectedSeconds:prepared.durationSeconds,shotCount:prepared.project.shots.length,bytes:bytes.byteLength,width,height,codec:'h264'};
  await writeFile(dest+'.qa.json',JSON.stringify(receipt,null,2));return receipt;
 }catch(error){await rm(dest,{force:true}).catch(()=>{});throw error}
 finally{await rm(work,{recursive:true,force:true}).catch(()=>{})}
}
if(process.argv[1]?.endsWith('/render-ffmpeg-proof.mjs')){
 const [src,out]=process.argv.slice(2);if(!src||!out){console.error('Usage: node render-ffmpeg-proof.mjs project.json output.mp4');process.exit(2)}
 try{console.log(JSON.stringify(await renderTechnicalProof(JSON.parse(await readFile(src,'utf8')),out),null,2))}
 catch(error){console.error(error.message);process.exitCode=1}
}
