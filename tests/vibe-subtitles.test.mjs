import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projectSnapshot,updateShot} from '../vibe-studio/timeline.mjs';
import {prepareRenderProject} from '../vibe-renderer/render-input.mjs';

test('AI director notes and narration survive edit, JSON project and render contract',()=>{
 const original=projectSnapshot({prompt:'A city at sunrise',format:'landscape',shots:[{title:'Sunrise',duration:15,motion:'slow dolly',narration:'城市在清晨苏醒'}]});
 const changed=updateShot(original.shots,0,{narration:'一座城市从光中诞生',motion:'pan left'});
 const prepared=prepareRenderProject({...original,shots:changed});
 assert.equal(prepared.project.shots[0].narration,'一座城市从光中诞生');
 assert.equal(prepared.project.shots[0].motion,'pan left');
 assert.equal(prepared.durationInFrames,450);
});
test('older projects without director metadata still render',()=>{
 const old=projectSnapshot({prompt:'legacy',format:'landscape',shots:[{title:'Legacy',duration:15}]});
 assert.equal(old.shots[0].narration,'');
 assert.equal(old.shots[0].motion,'');
});
test('editor and Canvas expose subtitle control with clear non-audio semantics',async()=>{
 const js=await readFile(new URL('../vibe-studio/studio.js',import.meta.url),'utf8');
 assert.match(js,/narration-input/);
 assert.match(js,/motion-input/);
 assert.match(js,/字幕文案（不生成配音）/);
 assert.match(js,/if\(shot\.narration\)/);
 assert.match(js,/画面：/);
 assert.match(js,/导演运动：/);
});
test('Remotion draws subtitles from project data without pretending voice synthesis',async()=>{
 const film=await readFile(new URL('../vibe-renderer/src/film.tsx',import.meta.url),'utf8');
 const css=await readFile(new URL('../vibe-studio/premium.css',import.meta.url),'utf8');
 assert.match(film,/\{shot\.narration\?<div/);
 assert.match(film,/\{shot\.narration\}<\/div>/);
 assert.match(css,/narration-input/);
 assert.match(css,/@media\(max-width:750px\)/);
});
