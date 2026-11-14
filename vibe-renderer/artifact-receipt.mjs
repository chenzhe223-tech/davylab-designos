import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const isDigest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export function makeRenderReceipt(job){
 const e=job?.evidence;
 if(job?.status!=='verified'||!e?.verified||e?.codec!=='h264'||e?.blackRegions!==0||!Number.isFinite(e?.durationSeconds)||Math.abs(e.durationSeconds-job.expectedSeconds)>.5||!Number.isInteger(e?.width)||!Number.isInteger(e?.height)||e.width<320||e.height<320||!Number.isInteger(e?.bytes)||e.bytes<10000||!isDigest(job.inputSha256)||!isDigest(e.outputSha256)||typeof job.output!=='string')throw new Error('Only fully QA-verified jobs can generate an artifact receipt');
 return {schemaVersion:1,kind:'davylab.vibe.render-receipt',renderId:job.id,createdAt:new Date().toISOString(),file:job.output,inputSha256:job.inputSha256,outputSha256:e.outputSha256,format:'mp4',codec:e.codec,durationSeconds:e.durationSeconds,width:e.width,height:e.height,bytes:e.bytes,blackRegions:e.blackRegions,qaVerified:true};
}
export async function hashFile(path){
 return new Promise((yes,no)=>{const h=createHash('sha256'),s=createReadStream(path);s.on('data',b=>h.update(b));s.once('error',no);s.once('end',()=>yes(h.digest('hex')))});
}
export async function checkRenderReceipt(receipt,{file=receipt?.file}={}){
 if(!receipt||receipt.kind!=='davylab.vibe.render-receipt'||receipt.qaVerified!==true||!isDigest(receipt.outputSha256)||!file)throw new Error('Invalid render receipt');
 const absolute=resolve(file);
 const size=(await stat(absolute)).size;
 if(size!==receipt.bytes)throw new Error('Artifact size no longer matches QA receipt');
 const digest=await hashFile(absolute);
 if(digest!==receipt.outputSha256)throw new Error('Artifact SHA-256 mismatch');
 return {valid:true,path:absolute,bytes:size,sha256:digest};
}
export async function loadAndCheckReceipt(receiptPath,{file}={}){
 const receipt=JSON.parse(await readFile(receiptPath,'utf8'));
 return checkRenderReceipt(receipt,{file:file||receipt.file});
}
