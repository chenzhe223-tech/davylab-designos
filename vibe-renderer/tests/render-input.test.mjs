import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareRenderProject} from '../render-input.mjs';
const sample=(durations=[5,5,5],format='landscape')=>({prompt:'城市从光中生长',format,shots:durations.map((duration,i)=>({title:'镜头'+i,visual:'真实程序化文字动画',duration}))});
test('P0 rendering accepts 15-second storyboard and 450 frames',()=>{const data=prepareRenderProject(sample());assert.equal(data.durationSeconds,15);assert.equal(data.durationInFrames,450);assert.deepEqual([data.width,data.height],[1920,1080]);assert.equal(data.project.shots[2].start,10)});
test('portrait output switches to 1080x1920',()=>{const data=prepareRenderProject(sample([5,5,5],'portrait'));assert.deepEqual([data.width,data.height],[1080,1920])});
test('reject short/overlong videos and zero scenes',()=>{assert.throws(()=>prepareRenderProject(sample([5,5,4])));assert.throws(()=>prepareRenderProject(sample([121])));assert.throws(()=>prepareRenderProject({...sample(),shots:[]}))});
test('converts legacy start/end data without mutating source',()=>{const old={prompt:'test',shots:[{title:'a',start:0,end:8},{title:'b',start:8,end:16}]};const valid=prepareRenderProject(old);assert.equal(valid.project.shots[1].start,8);assert.equal(old.shots[0].duration,undefined)});

test('rejects unsupported format, missing brief and fractional second cuts',()=>{
 assert.throws(()=>prepareRenderProject({...sample(),format:'square'}),/aspect ratio/);
 assert.throws(()=>prepareRenderProject({...sample(),prompt:'   '}),/Invalid Vibe Studio project/);
 assert.throws(()=>prepareRenderProject(sample([5.5,5,5])),/whole seconds/);
});
test('a valid edited 20 second project remains frame exact',()=>{
 const p=prepareRenderProject(sample([5,7,8]));
 assert.equal(p.durationSeconds,20);
 assert.equal(p.durationInFrames,600);
 assert.deepEqual(p.project.shots.map(s=>s.start),[0,5,12]);
});
