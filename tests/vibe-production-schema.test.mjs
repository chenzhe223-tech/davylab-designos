import test from 'node:test';
import assert from 'node:assert/strict';
import {projectSnapshot,normalizeShots,updateShot,normalizeSources,normalizeCharacters,totalDuration} from '../vibe-studio/timeline.mjs';
test('P1 knowledge sources and factual claims survive project export/reimport',()=>{
 const p=projectSnapshot({prompt:'科普',mode:'knowledge',shots:[{duration:15,title:'太阳',tags:['knowledge-explainer'],sourceIds:['src1']}],sources:[{id:'src1',url:'https://example.org',excerpt:'事实依据'}],claims:[{id:'c1',text:'可检查的主张',sourceIds:['src1']}]});
 assert.equal(p.schemaVersion,2);assert.equal(p.sources[0].excerpt,'事实依据');
 assert.deepEqual(p.shots[0].sourceIds,['src1']);assert.equal(projectSnapshot(p).claims[0].sourceIds[0],'src1');
});
test('P2 character IDs survive editing without accidental duplication',()=>{
 const shots=normalizeShots([{duration:8,characterIds:['hero','hero'],tags:['character-story']},{duration:7,characterIds:['hero']}]);
 assert.deepEqual(shots[0].characterIds,['hero']);
 assert.deepEqual(updateShot(shots,1,{duration:9})[1].characterIds,['hero']);
 assert.equal(totalDuration(shots),15);
});
test('P3 engine tags preserved while unrecognized tags are rejected',()=>{
 const shots=normalizeShots([{duration:15,tags:['precise-math','cinematic-product','javascript:evil']}]);
 assert.deepEqual(shots[0].tags,['precise-math','cinematic-product']);
 assert.throws(()=>normalizeShots([{duration:4.5}]));
});
test('schema v1 projects migrate without losing storyboard',()=>{
 const p=projectSnapshot({schemaVersion:1,prompt:'旧项目',shots:[{start:0,end:15,title:'A'}]});
 assert.equal(p.schemaVersion,2);assert.equal(p.shots[0].duration,15);
 assert.deepEqual(p.sources,[]);assert.deepEqual(p.characters,[]);
});
test('reject unsafe source URLs and normalize declared characters',()=>{
 assert.deepEqual(normalizeSources([{id:'bad',url:'javascript:alert(1)'}]),[]);
 assert.equal(normalizeCharacters([{id:'hero',name:'Person',appearance:'red coat'}])[0].appearance,'red coat');
});
