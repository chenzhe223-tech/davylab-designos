import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'..')
test('workbench exposes all integrated design modules',async()=>{const html=await readFile(resolve(root,'workbench/index.html'),'utf8');for(const id of ['brief','providers','components','layout','stage','qa','handoff'])assert.match(html,new RegExp('id="view-'+id+'"'));assert.match(html,/aria-live="polite"/)})
test('workbench app contains working local workflows and explicit safety boundaries',async()=>{const js=await readFile(resolve(root,'workbench/app.js'),'utf8');for(const name of ['registry','providers','components','layout','play','qa','handoff','download'])assert.ok(js.includes(name));assert.match(js,/不会安装第三方依赖|没有安装第三方依赖/)})
test('provider registry keeps DAVYLAB core and optional providers separate',async()=>{const r=JSON.parse(await readFile(resolve(root,'integrations/design-capability-registry.json'),'utf8'));const ids=r.capabilities.map(x=>x.id);for(const id of ['davylab-core','looseleaf','stageshow'])assert.ok(ids.includes(id));assert.equal(r.policy.preserveExistingProfiles,true);assert.equal(r.policy.noAutomaticGlobalThemeOverwrite,true)})
