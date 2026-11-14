import {projectSnapshot} from '../vibe-studio/timeline.mjs';
export const FPS=30;
export function prepareRenderProject(raw,{minimumSeconds=15,maximumSeconds=120}={}){
 if(!raw||typeof raw!=='object'||typeof raw.prompt!=='string'||!raw.prompt.trim()||!Array.isArray(raw.shots))throw new Error('Invalid Vibe Studio project');
 if(raw.format!=null&&!['landscape','portrait'].includes(raw.format))throw new Error('Unsupported video aspect ratio');
 if(raw.shots.some(shot=>!shot||typeof shot!=='object'||!Number.isInteger(Number(shot.duration??(Number(shot.end)-Number(shot.start))))))throw new Error('Shot duration must be whole seconds');
 const project=projectSnapshot(raw);
 if(project.shots.length===0)throw new Error('Storyboard is empty');
 const seconds=project.shots.reduce((total,shot)=>total+shot.duration,0);
 if(!Number.isFinite(seconds)||seconds<minimumSeconds||seconds>maximumSeconds)throw new Error('Video duration must be '+minimumSeconds+'–'+maximumSeconds+' seconds');
 if(project.shots.some(s=>!s.title))throw new Error('Every shot needs a title');
 return {project:{...project,title:raw.title?.slice?.(0,120)||'DAVYLAB Vibe Film'},durationSeconds:seconds,durationInFrames:Math.ceil(seconds*FPS),width:project.format==='portrait'?1080:1920,height:project.format==='portrait'?1920:1080};
}
