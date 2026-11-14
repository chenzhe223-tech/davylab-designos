import test from 'node:test';
import assert from 'node:assert/strict';
import {decodedFrameMd5,verifyVisualRerender} from '../frame-qa.mjs';
const hashA='a'.repeat(32),hashB='b'.repeat(32);
const mock=(_,args)=>'MD5='+(args.includes('before.mp4')?hashA:hashB)+'\n';

test('frame verifier uses decoded video frame at a shared timestamp',()=>{
 const result=verifyVisualRerender('before.mp4','after.mp4',{second:6,run:mock});
 assert.equal(result.verified,true);
 assert.equal(result.second,6);
 assert.equal(result.originalFrameMd5,hashA);
 assert.equal(result.editedFrameMd5,hashB);
});
test('identical decoded frames fail even when container video files differ',()=>{
 assert.throws(()=>verifyVisualRerender('before.mp4','after.mp4',{run:()=> 'MD5='+hashA+'\n'}),/did not change decoded video pixels/);
});
test('missing decoded frames cannot falsely pass validation',()=>{
 assert.throws(()=>decodedFrameMd5('file.mp4',{run:()=>''}),/Could not decode/);
 assert.throws(()=>decodedFrameMd5('',{run:mock}),/Invalid frame/);
 assert.throws(()=>decodedFrameMd5('file.mp4',{second:-1,run:mock}),/Invalid frame/);
});
