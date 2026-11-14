import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,appendFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {makeRenderReceipt,checkRenderReceipt,loadAndCheckReceipt} from '../artifact-receipt.mjs';

const good=(file,bytes,outputSha256)=>({id:'test-001',status:'verified',expectedSeconds:15,output:file,inputSha256:'a'.repeat(64),evidence:{verified:true,codec:'h264',durationSeconds:15,width:1920,height:1080,bytes,outputSha256,blackRegions:0}});

test('verified render produces a traceable SHA-256 delivery receipt',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vibe-receipt-'));
 try{
  const file=join(dir,'sample.mp4'),data=Buffer.alloc(12000,0x41);
  await writeFile(file,data);
  const hash=createHash('sha256').update(data).digest('hex');
  const receipt=makeRenderReceipt(good(file,data.length,hash));
  assert.equal(receipt.outputSha256,hash);
  assert.equal(receipt.inputSha256,'a'.repeat(64));
  assert.equal(receipt.qaVerified,true);
  assert.equal((await checkRenderReceipt(receipt)).valid,true);
  const path=join(dir,'receipt.json');await writeFile(path,JSON.stringify(receipt));
  assert.equal((await loadAndCheckReceipt(path)).sha256,hash);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('failed or forged render metadata cannot produce a receipt',()=>{
 assert.throws(()=>makeRenderReceipt({...good('/tmp/x.mp4',12000,'b'.repeat(64)),status:'qa'}));
 assert.throws(()=>makeRenderReceipt({...good('/tmp/x.mp4',12000,'b'.repeat(64)),evidence:{...good('/tmp/x.mp4',12000,'b'.repeat(64)).evidence,blackRegions:1}}));
 assert.throws(()=>makeRenderReceipt(good('/tmp/x.mp4',12000,'not-a-digest')));
});

test('post-verification file tampering is detected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vibe-receipt-'));
 try{
  const file=join(dir,'sample.mp4'),data=Buffer.alloc(12000,0x41);await writeFile(file,data);
  const receipt=makeRenderReceipt(good(file,data.length,createHash('sha256').update(data).digest('hex')));
  await appendFile(file,Buffer.from('x'));
  await assert.rejects(checkRenderReceipt(receipt),/size no longer matches/);
  await writeFile(file,Buffer.alloc(12000,0x42));
  await assert.rejects(checkRenderReceipt(receipt),/SHA-256 mismatch/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
