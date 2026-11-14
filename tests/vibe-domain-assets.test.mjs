import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectSnapshot,updateShot} from '../vibe-studio/timeline.mjs';
import {planDirectorProject,validateKnowledgeSources,validateCharacterContinuity} from '../vibe-studio/director.mjs';

test('knowledge references survive JSON import and engine routing',()=>{
 const p=projectSnapshot({mode:'knowledge',prompt:'知识视频',shots:[{duration:15,tags:['precise-math'],sourceIds:['s1']}],sources:[{id:'s1',url:'https://example.org',excerpt:'正文要点'}],claims:[{id:'c1',text:'具体论点',sourceIds:['s1']}]});
 assert.equal(validateKnowledgeSources(p).pass,true);
 assert.equal(planDirectorProject(p).shots[0].preferredEngine,'manim');
 assert.equal(planDirectorProject(p).shots[0].canDispatch,false);
 assert.equal(projectSnapshot(JSON.parse(JSON.stringify(p))).sources[0].id,'s1');
});
test('story character references remain valid after storyboard edits',()=>{
 const project=projectSnapshot({mode:'story',prompt:'故事',characters:[{id:'hero',name:'主人公',appearance:'红色外套'}],shots:[{duration:15,characterIds:['hero']}]});
 assert.equal(validateCharacterContinuity(project).pass,true);
 const edited=updateShot(project.shots,0,{visual:'森林'});
 assert.equal(validateCharacterContinuity({...project,shots:edited}).pass,true);
 const invalid=updateShot(project.shots,0,{characterIds:['unknown']});
 assert.equal(validateCharacterContinuity({...project,shots:invalid}).pass,false);
});
test('UI supports source, claim, character and engine selection without pretending to render',async()=>{
 const [html,js,css]=await Promise.all(['vibe-studio/index.html','vibe-studio/studio.js','vibe-studio/premium.css'].map(p=>readFile(new URL('../'+p,import.meta.url),'utf8')));
 for(const id of ['knowledge-panel','source-url','source-excerpt','source-list','claim-list','add-source','add-claim','characters-panel','character-name','character-look','character-list','add-character']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(js,/renderDomainAssets/);assert.match(js,/engine-tag-select/);
 assert.match(js,/character-ref-select/);assert.match(js,/source-ref-select/);
 assert.match(js,/尚未自动核验/);assert.match(css,/\.production-assets/);
});
test('source and character editors are hidden outside their creation mode',async()=>{
 const js=await readFile(new URL('../vibe-studio/studio.js',import.meta.url),'utf8');
 assert.match(js,/\$\('knowledge-panel'\)\.hidden=project\.mode!=='knowledge'/);
 assert.match(js,/\$\('characters-panel'\)\.hidden=project\.mode!=='story'/);
});
