import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
test('production build retains Canvas timeline mapping module and all event controls',async()=>{
 const root=resolve('dist/vibe-studio');
 const [html,js,planner,css]=await Promise.all(['index.html','studio.js','canvas-plan.mjs','premium.css'].map(name=>readFile(resolve(root,name),'utf8')));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size);
 const required=[...js.matchAll(/\$\('([^']+)'\)/g)].map(x=>x[1]);
 for(const id of required)assert.ok(ids.includes(id),'DOM ID missing: '+id);
 assert.match(js,/from '\.\/canvas-plan\.mjs'/);
 assert.match(js,/resolvePreviewFrame\(project\.shots,elapsed\)/);
 assert.match(js,/addEventListener\('click',\(\)=>\{start=performance\.now\(\)-shot\.start\*1000/);
 assert.match(js,/fitCanvas\(\)/);
 assert.match(planner,/resolveVisualFamily/);
 assert.match(css,/@media\(max-width:750px\)/);
 assert.match(html,/MP4 尚未接通/);
});
