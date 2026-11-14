import React from 'react';
import {SceneArt} from './scene-art';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,spring} from 'remotion';
type Shot={title:string;visual?:string;duration?:number;start?:number;end?:number};
type Project={title?:string;format?:string;shots:Shot[]};
export const Film=({project}:{project:Project})=>{
 const frame=useCurrentFrame();const {fps,width,height}=useVideoConfig();const seconds=frame/fps;
 const shotList=project.shots??[];let cursor=0;
 const shots=shotList.map((s,i)=>{const duration=Number(s.duration??(Number(s.end)-Number(s.start)));const start=cursor;cursor+=duration;return {...s,index:i,start,end:cursor}});
 const shot=shots.find(s=>seconds>=s.start && seconds<s.end)??shots[shots.length-1];
 if(!shot)return <AbsoluteFill style={{background:'#071a2f'}}/>;
 const local=Math.max(0,frame-shot.start*fps);const duration=Math.max(1,(shot.end-shot.start)*fps);
 const appear=spring({frame:local,fps,config:{damping:18}});
 const fade=Math.min(1,local/18,Math.max(0,(duration-local)/18));
 const portrait=height>width;
 return <AbsoluteFill style={{overflow:'hidden',background:'#102a4c',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',color:'white'}}>
  <SceneArt frame={local} fps={fps} width={width} height={height} durationFrames={duration} index={shot.index} title={shot.title||''} visual={shot.visual}/>
  <div style={{position:'absolute',left:width*.085,right:width*.085,top:height*.28,opacity:fade,transform:`translateY(${(1-appear)*40}px)`}}>
   <div style={{letterSpacing:8,fontSize:portrait?28:23,opacity:.8}}>DAVYLAB · VIBE STUDIO</div>
   <div style={{marginTop:32,fontSize:portrait?88:104,fontWeight:750,letterSpacing:-4,lineHeight:1.18,textShadow:'0 6px 40px #05162988'}}>{shot.title||'创意正在成形'}</div>
   <div style={{marginTop:20,fontSize:portrait?34:33,opacity:.82,maxWidth:width*.78,lineHeight:1.5}}>{shot.visual||'创意与技术，构成新的表达方式'}</div>
  </div>
  <div style={{position:'absolute',bottom:height*.055,left:width*.085,right:width*.085,borderTop:'2px solid #ffffff48',paddingTop:23,display:'flex',justifyContent:'space-between',letterSpacing:4,fontSize:portrait?23:20}}>
   <span>BY DAVYLAB</span><span>{String(shot.index+1).padStart(2,'0')} / {String(shots.length).padStart(2,'0')}</span>
  </div>
 </AbsoluteFill>;
};
