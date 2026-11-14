import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {projectSnapshot} from '../vibe-studio/timeline.mjs';

test('portable project JSON normalizes legacy formats',()=>{const file={prompt:'城市生长',format:'landscape',shots:[{title:'开头',start:0,end:5,visual:'城市'},{title:'结尾',start:5,end:8}]};const imported=projectSnapshot(JSON.parse(JSON.stringify(file)));assert.equal(imported.shots[1].start,5);assert.equal(imported.shots[1].end,8);assert.equal(imported.format,'landscape');assert.equal(imported.prompt,'城市生长')});
test('UI exposes real import control and does not auto-save imported data',async()=>{const html=await readFile(resolve('dist/vibe-studio/index.html'),'utf8');const script=await readFile(resolve('dist/vibe-studio/studio.js'),'utf8');assert.match(html,/id="import-file"/);assert.match(html,/id="import-trigger"/);assert.match(script,/projectSnapshot\(raw\)/);assert.match(script,/file\.size>2\*1024\*1024/);assert.match(script,/尚未覆盖本地保存/)});
