import test from 'node:test';
import assert from 'node:assert/strict';
import {runRendererCommand} from '../scripts/process-runner.mjs';
test('render command finishes for successful process',async()=>{
 await runRendererCommand(process.execPath,['-e','process.exit(0)'],{timeoutMs:1000,stdio:'ignore'});
});
test('render command rejects nonzero exit',async()=>{
 await assert.rejects(runRendererCommand(process.execPath,['-e','process.exit(7)'],{timeoutMs:1000,stdio:'ignore'}),/exited 7/);
});
test('render command times out and terminates stalled process',async()=>{
 await assert.rejects(runRendererCommand(process.execPath,['-e','setInterval(()=>{},1000)'],{timeoutMs:150,stdio:'ignore'}),/timed out/);
});
test('invalid config fails closed',()=>{
 assert.throws(()=>runRendererCommand('node',[],{timeoutMs:-1}),/Invalid renderer/);
});
