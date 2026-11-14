import React from 'react';
import {Composition} from 'remotion';
import {prepareRenderProject} from '../render-input.mjs';
import {Film} from './film';
const DEFAULT={title:'DAVYLAB Vibe Studio',format:'landscape',shots:[{title:'创意开始',visual:'星光汇聚',duration:5},{title:'世界生长',visual:'城市逐渐成形',duration:5},{title:'创意成片',visual:'光线形成品牌',duration:5}]};
export const Root=()=> <Composition
 id="VibeFilm" component={Film} fps={30} width={1920} height={1080} durationInFrames={450}
 defaultProps={{project:DEFAULT}}
 calculateMetadata={({props})=>{
  const prepared=prepareRenderProject(props.project??DEFAULT);
  return {durationInFrames:prepared.durationInFrames,width:prepared.width,height:prepared.height};
 }}
/>;
