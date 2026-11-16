import {readFile,writeFile,mkdir,stat,unlink,rename} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runRendererCommand} from './process-runner.mjs';
import {prepareRenderProject} from '../render-input.mjs';
import {inspectMp4} from './qa-video.mjs';
import {createRenderJob,transitionRenderJob} from '../job-state.mjs';
import {makeRenderReceipt,loadAndCheckReceipt} from '../artifact-receipt.mjs';
import {renderLicenseFlags} from '../render-license.mjs';
const here=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const hashOutput=path=>new Promise((resolveHash,reject)=>{const hash=createHash('sha256');const stream=createReadStream(path);stream.on('data',chunk=>hash.update(chunk));stream.on('error',reject);stream.on('end',()=>resolveHash(hash.digest('hex')))});
const input=process.argv[2];if(!input){console.error('Usage: npm run render -- /absolute/path/project.json');process.exit(2)}
const root=resolve(process.cwd(),'output');await mkdir(root,{recursive:true});
let prepared;try{prepared=prepareRenderProject(JSON.parse(await readFile(resolve(input),'utf8')))}catch(e){console.error('Invalid input: '+e.message);process.exit(2)}
let licenseFlags;try{licenseFlags=renderLicenseFlags()}catch(e){console.error('Render licensing not authorized: '+e.message);process.exit(2)}
const renderId=randomUUID();
const output=join(root,'vibe-'+renderId+'.mp4');
const propsFile=join(root,'.props-'+renderId+'.json');
const jobFile=join(root,'render-job-'+renderId+'.json');
const receiptFile=join(root,'render-receipt-'+renderId+'.json');
let job=createRenderJob({id:renderId,project:prepared.project,output,expectedSeconds:prepared.durationSeconds});
const persist=async(next=job)=>{const temp=jobFile+'.tmp';await writeFile(temp,JSON.stringify(next,null,2));await rename(temp,jobFile)};
const bin=join(here,'node_modules','.bin',process.platform==='win32'?'remotion.cmd':'remotion');
const args=['render','src/index.ts','VibeFilm',output,'--codec=h264','--props='+propsFile,'--log=error',...licenseFlags];
try{
 // Include initial job/props persistence in the guarded lifecycle so early I/O failures
 // cannot leave a misleading queued state or an unremoved temporary props file.
 await persist();
 await writeFile(propsFile,JSON.stringify({project:prepared.project}),{mode:0o600});
 console.log('Rendering '+prepared.durationSeconds+'s '+prepared.width+'x'+prepared.height+' MP4 via Remotion');
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
 const verifiedJob=transitionRenderJob(job,'verified',{evidence:{...qa,outputSha256}});
 const receipt=makeRenderReceipt(verifiedJob);
 const receiptTemp=receiptFile+'.tmp';
 await writeFile(receiptTemp,JSON.stringify(receipt,null,2),{mode:0o600});
 await rename(receiptTemp,receiptFile);
 // Independently read the persisted receipt and verify the actual MP4 bytes before publishing a verified job.
 const checked=await loadAndCheckReceipt(receiptFile,{file:output});
 if(checked.sha256!==outputSha256||checked.bytes!==file.size)throw new Error('Persisted render artifact failed independent readback');
 await persist(verifiedJob);
 job=verifiedJob;
 console.log(JSON.stringify({jobFile,receiptFile,output,inputSha256:job.inputSha256,outputSha256,bytes:file.size,durationSeconds:qa.durationSeconds,expectedSeconds:prepared.durationSeconds,qa,verified:true}));
}catch(error){
 const reason=error instanceof Error?error.message:String(error);
 // Always remove unverified media and receipts, even when setup failed before rendering.
 await Promise.all([output,receiptFile,receiptFile+'.tmp'].map(path=>unlink(path).catch(()=>{})));
 try{job=transitionRenderJob(job,'failed',{error:reason})}catch{job={...job,status:'failed',error:reason.slice(0,500),updatedAt:new Date().toISOString()}}
 await persist().catch(persistError=>console.error('Could not persist failed render status: '+persistError.message));
 console.error('Render/QA failed: '+reason);
 process.exitCode=1;
}finally{await unlink(propsFile).catch(()=>{})}
