import test from 'node:test';
import assert from 'node:assert/strict';
import {createRenderJob,transitionRenderJob} from '../job-state.mjs';
const sample=()=>createRenderJob({id:'test-render-001',project:{title:'Vibe',format:'landscape',shots:[{},{}]},output:'/tmp/test.mp4',expectedSeconds:15});
test('render-job lifecycle has ordered transitions',()=>{let job=sample();assert.equal(job.status,'queued');job=transitionRenderJob(job,'running');job=transitionRenderJob(job,'qa');job=transitionRenderJob(job,'verified',{evidence:{verified:true,codec:'h264',blackRegions:0,bytes:30000,durationSeconds:15,width:1920,height:1080}});assert.equal(job.status,'verified');assert.equal(job.evidence.blackRegions,0);assert.equal(job.project.shotCount,2)});
test('cannot mark verified without real QA evidence',()=>{let job=transitionRenderJob(transitionRenderJob(sample(),'running'),'qa');assert.throws(()=>transitionRenderJob(job,'verified'));assert.throws(()=>transitionRenderJob(job,'verified',{evidence:{verified:true,codec:'h264',blackRegions:1,bytes:30000}}))});
test('failed job stores a reason and cannot restart implicitly',()=>{let job=transitionRenderJob(sample(),'failed',{error:'Cannot start codec'});assert.equal(job.error,'Cannot start codec');assert.throws(()=>transitionRenderJob(job,'running'));assert.throws(()=>transitionRenderJob(sample(),'failed'))});
test('invalid job request rejected',()=>{assert.throws(()=>createRenderJob({id:'',expectedSeconds:15}));assert.throws(()=>createRenderJob({id:'x',expectedSeconds:3}))});
