import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {renderTechnicalProof} from '../scripts/render-ffmpeg-proof.mjs';

const sample=(seconds=[5,5,5])=>({prompt:'城市从光中出现',format:'landscape',mode:'animation',shots:seconds.map((duration,index)=>({duration,title:'镜头 '+(index+1),visual:index===1?'建筑在晨光中生长':'星光粒子',narration:'一段原创旁白字幕',visualFamily:index===1?'city':'particles'}))});
test('offline proof fails early on invalid projects without invoking FFmpeg',async()=>{
 await assert.rejects(renderTechnicalProof({prompt:'bad',format:'landscape',shots:[]},'/tmp/invalid-vibe.mp4'),/Storyboard is empty/);
 await assert.rejects(renderTechnicalProof(sample([5,5,4]),'/tmp/short-vibe.mp4'),/15/);
});
test('offline proof never misrepresents FFmpeg as Remotion',async()=>{
 const source=await readFile(new URL('../scripts/render-ffmpeg-proof.mjs',import.meta.url),'utf8');
 assert.match(source,/remotionVerified:false/);
 assert.match(source,/inspectMp4\(dest/);
 assert.match(source,/blackRegions:qa\.blackRegions/);
});
test('explicitly opted-in integration renders original and edited actual H264 MP4', {skip:process.env.VIBE_RUN_FULL_FFMPEG_PROOF!=='true'},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'vibe-proof-test-'));
 try{
  const a=await renderTechnicalProof(sample(),join(dir,'first.mp4'));
  const b=await renderTechnicalProof(sample([5,7,5]),join(dir,'edited.mp4'));
  assert.equal(a.durationSeconds,15);assert.equal(b.durationSeconds,17);
  assert.equal(a.codec,'h264');assert.equal(b.codec,'h264');
  assert.equal(a.blackRegions,0);assert.equal(b.blackRegions,0);
  assert.notEqual(a.outputSha256,b.outputSha256);
  assert.equal(a.remotionVerified,false);assert.equal(b.remotionVerified,false);
 }finally{await rm(dir,{recursive:true,force:true})}
});
