import test from 'node:test';
import assert from 'node:assert/strict';
import {runMediaCommand} from '../scripts/qa-video.mjs';

test('media QA subprocess returns bounded stdout on successful execution',async()=>{
 const result=await runMediaCommand(process.execPath,['-e','process.stdout.write("ok")'],{timeoutMs:2000});
 assert.equal(result.stdout,'ok');
});

test('media QA subprocess rejects codec/probe process errors',async()=>{
 await assert.rejects(runMediaCommand(process.execPath,['-e','process.stderr.write("failure");process.exit(12)'],{timeoutMs:2000}),/exited 12/);
});

test('media QA hangs terminate instead of blocking a render indefinitely',async()=>{
 await assert.rejects(runMediaCommand(process.execPath,['-e','setInterval(()=>{},1000)'],{timeoutMs:150}),/timed out/);
});

test('media QA rejects invalid limits before spawning',async()=>{
 await assert.rejects(runMediaCommand(process.execPath,['-e',''],{timeoutMs:0}),/Invalid media command limits/);
});
