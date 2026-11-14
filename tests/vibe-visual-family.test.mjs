import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeShots,projectSnapshot,updateShot} from '../vibe-studio/timeline.mjs';
import {resolveVisualFamily,resolvePreviewFrame} from '../vibe-studio/canvas-plan.mjs';
import {prepareRenderProject} from '../vibe-renderer/render-input.mjs';

test('user-selected procedural art overrides inferred art in Canvas',()=>{
 const cityText={title:'未来城市',visual:'城市建筑',visualFamily:'particles',duration:5};
 assert.equal(resolveVisualFamily(cityText,0),'particles');
 assert.equal(resolvePreviewFrame([cityText],1).family,'particles');
 assert.equal(resolveVisualFamily({...cityText,visualFamily:'auto'},0),'city');
});
test('visual preset survives edit, normalized project export and renderer input',()=>{
 const shots=normalizeShots([{title:'镜头A',visual:'城市',duration:7,visualFamily:'nature'},{title:'镜头B',duration:8}]);
 const edited=updateShot(shots,1,{visualFamily:'city'});
 const project=projectSnapshot({prompt:'A video',format:'landscape',mode:'animation',shots:edited});
 const result=prepareRenderProject(project);
 assert.deepEqual(result.project.shots.map(s=>s.visualFamily),['nature','city']);
 assert.deepEqual(result.project.shots.map(s=>s.start),[0,7]);
 assert.equal(result.durationInFrames,450);
});
test('invalid and legacy visual styles fall back to automatic without code injection',()=>{
 const shots=normalizeShots([{title:'A',duration:15,visualFamily:'__proto__'}]);
 assert.equal(shots[0].visualFamily,'auto');
 assert.equal(normalizeShots([{duration:15}])[0].visualFamily,'auto');
});
test('Remotion and browser UI pass the visual family through to scene art',async()=>{
 const [renderer,art,studio,css]=await Promise.all([
  readFile(new URL('../vibe-renderer/src/film.tsx',import.meta.url),'utf8'),
  readFile(new URL('../vibe-renderer/src/scene-art.tsx',import.meta.url),'utf8'),
  readFile(new URL('../vibe-studio/studio.js',import.meta.url),'utf8'),
  readFile(new URL('../vibe-studio/premium.css',import.meta.url),'utf8')]);
 assert.match(renderer,/visualFamily=\{shot\.visualFamily\}/);
 assert.match(art,/visualFamily==='auto'/);
 assert.match(studio,/visual-family-select/);
 assert.match(css,/\.visual-family-select/);
});
