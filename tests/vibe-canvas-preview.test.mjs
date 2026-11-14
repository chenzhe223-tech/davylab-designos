import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePreviewFrame,resolveVisualFamily} from '../vibe-studio/canvas-plan.mjs';
const shots=[{title:'星光汇聚',visual:'星光粒子',duration:5},{title:'城市生长',visual:'建筑逐渐出现',duration:7},{title:'云海山谷',visual:'山脉',duration:3}];
test('preview selects each shot on its actual time boundary',()=>{assert.deepEqual([0,5,11.5,12,14.9].map(t=>resolvePreviewFrame(shots,t).index),[0,1,1,2,2]);});
test('preview loops over the entire editable timeline',()=>{const a=resolvePreviewFrame(shots,15);assert.equal(a.index,0);assert.equal(a.localSeconds,0);assert.equal(a.duration,15);assert.equal(resolvePreviewFrame(shots,17).localSeconds,2);});
test('shot edit changes frame selection immediately',()=>{const edited=[{...shots[0],duration:8},...shots.slice(1)];assert.equal(resolvePreviewFrame(edited,6).index,0);assert.equal(resolvePreviewFrame(shots,6).index,1);});
test('visual families reflect shot metadata, not fixed ten-second scene labels',()=>{assert.deepEqual(shots.map((s,i)=>resolveVisualFamily(s,i)),['particles','city','nature']);assert.equal(resolveVisualFamily({title:'A'},1),'city');});
test('empty project previews a clearly local demo, invalid duration fails closed',()=>{assert.equal(resolvePreviewFrame([],3).shot.title,'本地预览动画');assert.throws(()=>resolvePreviewFrame([{duration:0}],1));});
