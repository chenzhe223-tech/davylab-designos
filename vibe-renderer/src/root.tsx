import React from 'react';
import {Composition} from 'remotion';
import {Film} from './film';
const DEFAULT={title:'DAVYLAB Vibe Studio',format:'landscape',shots:[{title:'创意开始',visual:'星光汇聚',duration:5},{title:'世界生长',visual:'城市逐渐成形',duration:5},{title:'创意成片',visual:'光线形成品牌',duration:5}]};
export const Root=()=> <Composition
 id="VibeFilm" component={Film} fps={30} width={1920} height={1080} durationInFrames={450}
 defaultProps={{project:DEFAULT}}
 calculateMetadata={({props})=>{
  const project=props.project ?? DEFAULT;
  const shots=Array.isArray(project.shots)?project.shots:[];
  const seconds=shots.reduce((n,s)=>n+Number(s.duration??(Number(s.end)-Number(s.start))),0);
  if(!Number.isFinite(seconds)||seconds<1||seconds>600)throw Error('Invalid video duration');
  return {durationInFrames:Math.ceil(seconds*30),width:project.format==='portrait'?1080:1920,height:project.format==='portrait'?1920:1080};
 }}
/>;
