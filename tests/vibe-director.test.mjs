import test from 'node:test';
import assert from 'node:assert/strict';
import {ENGINE_CATALOG,chooseEngine,planDirectorProject,validateKnowledgeSources,validateCharacterContinuity,dispatchShot} from '../vibe-studio/director.mjs';
const sample=(mode='animation')=>({mode,shots:[{id:'first',duration:5,visualFamily:'particles'},{id:'second',duration:10,visualFamily:'city'}]});
test('engine inventory never treats planned Skills as installed',()=>{
 assert.ok(Object.values(ENGINE_CATALOG).every(x=>x.status!=='runtime-verified'));
 assert.equal(chooseEngine({mode:'knowledge'}),'knowledgeFilm');
 assert.equal(chooseEngine({mode:'story'}),'stickman');
 assert.equal(chooseEngine({mode:'brand'}),'shotcraft');
 assert.equal(chooseEngine({mode:'animation',tags:['precise-math']}),'manim');
});
test('director creates reproducible shot timing with explicit unmet capabilities',()=>{
 const p=planDirectorProject(sample());
 assert.equal(p.durationSeconds,15);
 assert.deepEqual(p.shots.map(x=>[x.start,x.end]),[[0,5],[5,15]]);
 assert.equal(p.shots[0].canDispatch,false);
 assert.equal(p.renderStatus,'not-rendered');
 assert.equal(p.compositionEngine,'remotion');
});
test('cannot dispatch unintegrated engines or spoof adapters',()=>{
 const p=planDirectorProject(sample('story'));
 assert.throws(()=>dispatchShot(p,0,{stickman:{render(){return true}}}),/not runtime verified/);
 const ready=planDirectorProject(sample('story'),{engineState:{stickman:'runtime-verified'}});
 assert.throws(()=>dispatchShot(ready,0),/Missing real/);
 assert.equal(dispatchShot(ready,0,{stickman:{render:x=>x.shotId}}),'first');
});
test('knowledge factual claims must link to at least one valid source URL',()=>{
 assert.equal(validateKnowledgeSources({claims:[{id:'one',text:'water boils',sourceIds:['a']}],sources:[{id:'a',url:'https://example.org/article'}]}).pass,true);
 assert.equal(validateKnowledgeSources({claims:[{id:'one',text:'unsupported',sourceIds:['a']}],sources:[{id:'a',url:'javascript:alert(1)'}]}).pass,false);
 assert.equal(validateKnowledgeSources({claims:[],sources:[]}).pass,false);
});
test('character references are consistent with declared character assets',()=>{
 assert.deepEqual(validateCharacterContinuity({characters:[{id:'hero'}],shots:[{characterIds:['hero']},{characterIds:['villain']}]}),{pass:false,unknown:['shot-2:villain']});
 assert.equal(validateCharacterContinuity({characters:[{id:'hero'}],shots:[{characterIds:['hero']}]}).pass,true);
});
test('unsupported mode or duration is rejected before dispatch',()=>{
 assert.throws(()=>planDirectorProject(sample('fake')));
 assert.throws(()=>planDirectorProject({mode:'animation',shots:[{duration:0}]}));
 assert.throws(()=>chooseEngine({mode:'animation',tags:'x'}));
});
