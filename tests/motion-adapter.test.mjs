import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source=await readFile("assets/davylab-motion.js","utf8");
let reduce=false;
const targets=[];
function makeTarget(){
 const target={nodeType:1,calls:[],animate(keyframes,options){const a={keyframes,options,cancelled:false,cancel(){this.cancelled=true}};this.calls.push(a);return a}};
 targets.push(target);return target;
}
const doc={querySelectorAll:s=>s===".items"?targets:[targets[0]],addEventListener(){},removeEventListener(){},hidden:false};
const win={document:doc,matchMedia:()=>({matches:reduce})};
vm.runInNewContext(source,{window:win});
const api=win.DAVYLABMotion;
assert.equal(api.version,"0.2.0");
test("official DAVYLAB adapter runs and cleans all six portable motion presets",()=>{
 for(const effect of ["fade-up","spring","slide","blur","stagger","orbit"]){
  const el=makeTarget();const cleanup=api.applyPreset(el,{effect,durationMs:1800,intensityPercent:100,distancePx:32,direction:"left",easing:"cubic-bezier(0.22,1,0.36,1)",playback:"once",globalTokens:{staggerMs:80}});
  assert.equal(el.calls.length,1,effect+" starts one Web Animations API animation");
  assert.equal(el.calls[0].options.duration,1800);
  assert.equal(el.calls[0].options.iterations,1);
  cleanup();assert.equal(el.calls[0].cancelled,true);
 }
});
test("stagger timing, bounded loop and reduced-motion behavior are honored",()=>{
 const list=[makeTarget(),makeTarget(),makeTarget()];
 const stop=api.applyPreset(list,{effect:"stagger",durationMs:2000,globalTokens:{staggerMs:80}});
 assert.deepEqual(list.map(x=>x.calls[0].options.delay),[0,80,160]);stop();
 const loop=makeTarget();api.applyPreset(loop,{effect:"orbit",durationMs:4000,playback:"loop"});
 assert.equal(loop.calls[0].options.duration,2000);assert.equal(loop.calls[0].options.iterations,2);
 reduce=true;const quiet=makeTarget();api.applyPreset(quiet,{effect:"fade-up",durationMs:1800});
 assert.equal(quiet.calls.length,0);
});
test("motion tokens define reduced-motion and semantic timing fallbacks",async()=>{
 const css=await readFile("assets/motion-tokens.css","utf8");
 assert.match(css,/--vdm-duration-micro/);assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
 assert.match(css,/transition: none !important/);
});
