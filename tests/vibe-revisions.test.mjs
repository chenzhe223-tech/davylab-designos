import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_REVISIONS,saveRevision,listRevisions,restoreRevision} from '../vibe-studio/revisions.mjs';
const p=(i=0)=>({prompt:'项目'+i,mode:'animation',format:'landscape',shots:[{duration:15,title:'镜头'+i}]});
test('project versions are immutable and can restore a copied historical edit',()=>{
 const original=p(),history=saveRevision(original,[],{now:'2026-11-15T00:00:00Z',id:'r1'});
 original.shots[0].title='changed';
 assert.equal(history[0].project.shots[0].title,'镜头0');
 const restored=restoreRevision(history,'r1');restored.shots[0].title='again';
 assert.equal(history[0].project.shots[0].title,'镜头0');
});
test('deduplicates exact snapshots and sorts latest first',()=>{
 const history=saveRevision(p(),saveRevision(p(),[],{id:'r1'}),{id:'r2'});
 assert.equal(history.length,1);assert.equal(history[0].id,'r2');
 const next=saveRevision(p(1),history,{id:'r3'});
 assert.deepEqual(listRevisions(next).map(x=>x.id),['r3','r2']);
});
test('12 most recent versions retained and invalid selections rejected',()=>{
 let history=[];for(let i=0;i<20;i++)history=saveRevision(p(i),history,{id:'r'+i});
 assert.equal(history.length,MAX_REVISIONS);
 assert.equal(history[0].id,'r19');assert.equal(history.at(-1).id,'r8');
 assert.throws(()=>restoreRevision(history,'r3'),/not found/);
});
test('invalid stored versions cannot be promoted to projects',()=>{
 assert.throws(()=>saveRevision({prompt:'bad'},[]));assert.deepEqual(listRevisions({}),[]);
 assert.throws(()=>restoreRevision([],'missing'));
});
