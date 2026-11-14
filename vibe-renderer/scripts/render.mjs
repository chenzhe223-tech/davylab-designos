import {readFile,writeFile,mkdir,stat,unlink,rename} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runRendererCommand} from './process-runner.mjs';
import {prepareRenderProject} from '../render-input.mjs';
import {inspectMp4} from './qa-video.mjs';
import {createRenderJob,transitionRenderJob} from '../job-state.mjs';
const here=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hashOutput=path=>new Promise((resolveHash,reject)=>{const hash=createHash('sha256');const stream=createReadStream(path);stream.on('data',chunk=>hash.update(chunk));stream.on('error',reject);stream.on('end',()=>resolveHash(hash.digest('hex')))});
const input=process.argv[2];if(!input){console.error('Usage: npm run render -- /absolute/path/project.json');process.exit(2)}
const root=resolve(process.cwd(),'output');await mkdir(root,{recursive:true});
let prepared;try{prepared=prepareRenderProject(JSON.parse(await readFile(resolve(input),'utf8')))}catch(e){console.error('Invalid input: '+e.message);process.exit(2)}
const renderId=randomUUID();
const output=join(root,'vibe-'+renderId+'.mp4');
const propsFile=join(root,'.props-'+renderId+'.json');
const jobFile=join(root,'render-job-'+renderId+'.json');
let job=createRenderJob({id:renderId,project:prepared.project,output,expectedSeconds:prepared.durationSeconds});
const persist=async()=>{const temp=jobFile+'.tmp';await writeFile(temp,JSON.stringify(job,null,2));await rename(temp,jobFile)};
await persist();
await writeFile(propsFile,JSON.stringify({project:prepared.project}),{mode:0o600});
const bin=join(here,'node_modules','.bin',process.platform==='win32'?'remotion.cmd':'remotion');
const args=['render','src/index.ts','VibeFilm',output,'--codec=h264','--props='+propsFile,'--log=error'];
console.log('Rendering '+prepared.durationSeconds+'s '+prepared.width+'x'+prepared.height+' MP4 via Remotion');
try{
 job=transitionRenderJob(job,'running');await persist();
 await runRendererCommand(bin,args,{cwd:here,timeoutMs:600000});
 const file=await stat(output);if(file.size<10_000)throw new Error('MP4 file too small to count as validated video');
 const {getVideoMetadata}=await import('@remotion/renderer');
 const metadata=await getVideoMetadata(output);
 if(metadata.durationInSeconds<prepared.durationSeconds-1||metadata.durationInSeconds>prepared.durationSeconds+1||metadata.width!==prepared.width||metadata.height!==prepared.height)throw new Error('Rendered duration/resolution does not match storyboard');
 job=transitionRenderJob(job,'qa');await persist();
 const qa=await inspectMp4(output,{expectedSeconds:prepared.durationSeconds});
 if(qa.width!==prepared.width||qa.height!==prepared.height)throw new Error('QA resolution mismatch');
 const outputSha256=await hashOutput(output);
 job=transitionRenderJob(job,'verified',{evidence:{...qa,outputSha256}});await persist();
 console.log(JSON.stringify({jobFile,output,inputSha256:job.inputSha256,outputSha256,bytes:file.size,durationSeconds:qa.durationSeconds,expectedSeconds:prepared.durationSeconds,qa,verified:true}));
}catch(error){job=transitionRenderJob(job,'failed',{error:error.message});await unlink(output).catch(()=>{});await persist().catch(()=>{});console.error('Render/QA failed: '+error.message);process.exitCode=1}finally{await unlink(propsFile).catch(()=>{})}
