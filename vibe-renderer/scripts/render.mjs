import {readFile,writeFile,mkdir,stat,unlink} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {prepareRenderProject} from '../render-input.mjs';
import {inspectMp4} from './qa-video.mjs';
const here=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];if(!input){console.error('Usage: npm run render -- /absolute/path/project.json');process.exit(2)}
const root=resolve(process.cwd(),'output');await mkdir(root,{recursive:true});
let prepared;try{prepared=prepareRenderProject(JSON.parse(await readFile(resolve(input),'utf8')))}catch(e){console.error('Invalid input: '+e.message);process.exit(2)}
const output=join(root,'vibe-'+Date.now()+'.mp4');
const propsFile=join(root,'.props-'+Date.now()+'.json');
await writeFile(propsFile,JSON.stringify({project:prepared.project}),{mode:0o600});
const bin=join(here,'node_modules','.bin',process.platform==='win32'?'remotion.cmd':'remotion');
const args=['render','src/index.ts','VibeFilm',output,'--codec=h264','--props='+propsFile,'--log=error'];
console.log('Rendering '+prepared.durationSeconds+'s '+prepared.width+'x'+prepared.height+' MP4 via Remotion');
try{
 await new Promise((done,reject)=>{const child=spawn(bin,args,{cwd:here,stdio:'inherit',shell:false});child.on('error',reject);child.on('exit',(code,signal)=>code===0?done():reject(new Error('Renderer exited '+code+' '+(signal||''))))});
 const file=await stat(output);if(file.size<10_000)throw new Error('MP4 file too small to count as validated video');
 const {getVideoMetadata}=await import('@remotion/renderer');
 const metadata=await getVideoMetadata(output);
 if(metadata.durationInSeconds<prepared.durationSeconds-1||metadata.durationInSeconds>prepared.durationSeconds+1||metadata.width!==prepared.width||metadata.height!==prepared.height)throw new Error('Rendered duration/resolution does not match storyboard');
 const qa=await inspectMp4(output,{expectedSeconds:prepared.durationSeconds});
 if(qa.width!==prepared.width||qa.height!==prepared.height)throw new Error('QA resolution mismatch');
 console.log(JSON.stringify({output,bytes:file.size,durationSeconds:qa.durationSeconds,expectedSeconds:prepared.durationSeconds,qa,verified:true}));
}catch(error){console.error('Render/QA failed: '+error.message);process.exitCode=1}finally{await unlink(propsFile).catch(()=>{})}
