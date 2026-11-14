import test from 'node:test';
import assert from 'node:assert/strict';
import {runMediaCommand,createBlackRegionScanner} from '../scripts/qa-video.mjs';

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

test('streaming QA catches black event split between stderr chunks',()=>{
 const scan=createBlackRegionScanner();
 scan.feed('[blackdetect @ 0x01] black_sta');
 scan.feed('rt:0.2 black_end:0.65 black_duration:0.45\n');
 assert.equal(scan.finish().regions,1);
});
test('early black frame cannot be lost when later diagnostic output exceeds buffer',()=>{
 const scan=createBlackRegionScanner();
 scan.feed('[blackdetect @ a] black_start:0 black_end:1.1 black_duration:1.1\n');
 for(let i=0;i<1000;i++)scan.feed('normal diagnostics '+String(i)+' '.repeat(900)+'\n');
 const result=scan.finish();
 assert.equal(result.regions,1);
 assert.match(result.first,/black_start:0/);
});
test('non-black FFmpeg output is not rejected and onStderr callbacks receive chunks',async()=>{
 const scan=createBlackRegionScanner();
 const code='process.stderr.write("ordinary warning\\n");process.stderr.write("[info] good frames\\n")';
 await runMediaCommand(process.execPath,['-e',code],{timeoutMs:2000,maxOutputBytes:1024,onStderr:chunk=>scan.feed(chunk)});
 assert.equal(scan.finish().regions,0);
});
