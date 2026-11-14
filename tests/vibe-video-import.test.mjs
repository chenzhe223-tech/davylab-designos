import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('video UI exposes native, separate Canvas and MP4 playback controls',async()=>{
 const [html,js,css]=await Promise.all(['vibe-studio/index.html','vibe-studio/studio.js','vibe-studio/premium.css'].map(p=>readFile(p,'utf8')));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const id of ['scene','play','record','load-mp4','render-file','rendered-video'])assert.ok(ids.includes(id),'missing '+id);
 assert.match(html,/<video id="rendered-video" controls playsinline/);
 assert.match(js,/URL\.createObjectURL\(file\)/);assert.match(js,/URL\.revokeObjectURL\(importedMp4Url\)/);
 assert.match(js,/尚未执行成片 QA/);assert.match(css,/\[hidden\]\{display:none!important\}/);
});
