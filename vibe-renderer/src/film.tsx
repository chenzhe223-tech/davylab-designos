import React from 'react';
import {AbsoluteFill,interpolate,useCurrentFrame,useVideoConfig,spring} from 'remotion';
type Shot={title:string;visual?:string;duration?:number;start?:number;end?:number};
type Project={title?:string;format?:string;shots:Shot[]};
const palette=[['#071a2f','#24547d','#7bc9ff'],['#0c2540','#315d81','#adcfee'],['#12203b','#516b9b','#b8a8ed'],['#152e44','#3b8293','#9ce6e2']];
export const Film=({project}:{project:Project})=>{
 const frame=useCurrentFrame();const {fps,width,height}=useVideoConfig();const seconds=frame/fps;
 const shotList=project.shots??[];let cursor=0;
 const shots=shotList.map((s,i)=>{const duration=Number(s.duration??(Number(s.end)-Number(s.start)));const start=cursor;cursor+=duration;return {...s,index:i,start,end:cursor}});
 const shot=shots.find(s=>seconds>=s.start && seconds<s.end)??shots[shots.length-1];
 if(!shot)return <AbsoluteFill style={{background:'#071a2f'}}/>;
 const local=Math.max(0,frame-shot.start*fps);const duration=Math.max(1,(shot.end-shot.start)*fps);
 const zoom=interpolate(local,[0,duration],[1.06,1.22],{extrapolateRight:'clamp'});const appear=spring({frame:local,fps,config:{damping:18}});
 const fade=Math.min(1,local/18,Math.max(0,(duration-local)/18));
 const [base,mid,accent]=palette[shot.index%palette.length];
 const portrait=height>width;
 return <AbsoluteFill style={{overflow:'hidden',background:base,fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',color:'white'}}>
  <AbsoluteFill style={{background:`radial-gradient(circle at 70% 42%,${mid} 0%,${base} 68%)`,transform:`scale(${zoom})`}}/>
  <AbsoluteFill style={{opacity:.18,backgroundImage:`linear-gradient(90deg,transparent 98%,${accent} 100%),linear-gradient(transparent 98%,${accent} 100%)`,backgroundSize:portrait?'90px 90px':'110px 110px',transform:`translateX(${local*.45}px)`}}/>
  <div style={{position:'absolute',width:width*.54,height:width*.54,borderRadius:'50%',left:width*.48,top:height*.15,border:`3px solid ${accent}88`,boxShadow:`0 0 140px ${accent}50,inset 0 0 120px ${accent}33`,transform:`scale(${1+Math.sin(local/37)*.04})`}}/>
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
