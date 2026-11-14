import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderLicenseFlags} from './render-license.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)));
export const runBinary=(command,{spawn=spawnSync}={})=>{
 try{
  const result=spawn(command,['-version'],{timeout:5000,encoding:'utf8',windowsHide:true});
  return result.status===0?{ok:true,version:String(result.stdout||result.stderr).split('\n')[0].slice(0,140)}:{ok:false,reason:result.error?.code||'Nonzero exit'};
 }catch{return {ok:false,reason:'Cannot execute binary'}}
};
export function checkRendererEnvironment({env=process.env,exists=existsSync,runner=runBinary,nodeVersion=process.versions.node}={}){
 const major=Number(String(nodeVersion).split('.')[0]);
 const node={ok:Number.isInteger(major)&&major>=20,version:nodeVersion};
 const ffmpeg=runner('ffmpeg'),ffprobe=runner('ffprobe');
 const cli=exists(join(root,'node_modules','.bin',process.platform==='win32'?'remotion.cmd':'remotion'));
 const packages=['remotion','@remotion/cli','@remotion/renderer','react','react-dom'];
 const deps=packages.map(name=>({name,ok:exists(join(root,'node_modules',...name.split('/'),'package.json'))}));
 let license={ok:false,reason:'Remotion license consent is missing'};
 try{renderLicenseFlags(env);license={ok:true,mode:env.VIBE_RENDER_PRODUCTION==='true'?'production':'development'}}catch(error){license={ok:false,reason:String(error.message||error)}}
 return {ready:node.ok&&ffmpeg.ok&&ffprobe.ok&&cli&&deps.every(x=>x.ok)&&license.ok,node,ffmpeg,ffprobe,cli:{ok:cli},deps,license,renderInvoked:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=checkRendererEnvironment();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(!result.ready)process.exitCode=2;
}
