import test from 'node:test';
import assert from 'node:assert/strict';
import {checkRendererEnvironment} from '../preflight.mjs';
const validEnv={VIBE_REMOTION_LICENSE_KEY:'free-license',VIBE_FREE_LICENSE_CONFIRMED:'true'};
const allPresent={env:validEnv,exists:()=>true,runner:()=>({ok:true,version:'fixture'}),nodeVersion:'22.16.0'};
test('fully configured local renderer passes offline preflight without rendering',()=>{
 const result=checkRendererEnvironment(allPresent);
 assert.equal(result.ready,true);
 assert.equal(result.renderInvoked,false);
 assert.ok(result.deps.every(x=>x.ok));
 assert.equal(result.license.mode,'development');
});
test('missing FFmpeg, dependency or unsafe Node version prevents render readiness',()=>{
 assert.equal(checkRendererEnvironment({...allPresent,runner:x=>({ok:x!=='ffmpeg'})}).ready,false);
 assert.equal(checkRendererEnvironment({...allPresent,exists:()=>false}).ready,false);
 assert.equal(checkRendererEnvironment({...allPresent,nodeVersion:'18.0.0'}).ready,false);
});
test('missing license consent is reported without exposing API or license secrets',()=>{
 const result=checkRendererEnvironment({...allPresent,env:{VIBE_REMOTION_LICENSE_KEY:'rm_sec_private_value'}});
 assert.equal(result.ready,true);
 assert.equal(JSON.stringify(result).includes('private_value'),false);
 const missing=checkRendererEnvironment({...allPresent,env:{}});
 assert.equal(missing.ready,false);
 assert.equal(missing.license.ok,false);
 assert.equal(JSON.stringify(missing).includes('rm_sec_'),false);
});
