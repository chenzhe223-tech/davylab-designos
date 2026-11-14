import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareRenderProject} from '../vibe-renderer/render-input.mjs';

test('Remotion P0 contract produces 450 frames for 15-second project',()=>{
 const input={prompt:'星光城市',format:'landscape',shots:[{title:'星光',duration:5},{title:'城市',duration:5},{title:'结束',duration:5}]};
 const result=prepareRenderProject(input);
 assert.equal(result.durationInFrames,450);
 assert.equal(result.project.shots[2].start,10);
 assert.deepEqual([result.width,result.height],[1920,1080]);
});
test('Remotion composition and renderer stay separate from Workers',async()=>{
 const [entry,root,video,script,pkg]=await Promise.all([
  readFile('vibe-renderer/src/index.ts','utf8'),
  readFile('vibe-renderer/src/root.tsx','utf8'),
  readFile('vibe-renderer/src/film.tsx','utf8'),
  readFile('vibe-renderer/scripts/render.mjs','utf8'),
  readFile('vibe-renderer/package.json','utf8')
 ]);
 assert.match(entry,/registerRoot\(Root\)/);
 assert.match(root,/calculateMetadata/);
 assert.match(video,/useCurrentFrame\(\)/);
 assert.match(script,/getVideoMetadata/);
 assert.match(script,/video.*mp4|\.mp4/);
 const dependencies=JSON.parse(pkg).dependencies;
 assert.equal(dependencies.remotion,dependencies['@remotion/renderer']);
 assert.equal(dependencies.remotion,dependencies['@remotion/cli']);
});
test('Remotion rejects shorter than 15 seconds and excess runtime',()=>{
 assert.throws(()=>prepareRenderProject({prompt:'x',shots:[{title:'x',duration:14}]}));
 assert.throws(()=>prepareRenderProject({prompt:'x',shots:[{title:'x',duration:121}]}));
});
