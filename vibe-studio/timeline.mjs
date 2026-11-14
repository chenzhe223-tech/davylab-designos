import {normalizeCreationMode} from './creation-modes.mjs';
const text=(value,max)=>String(value??'').trim().slice(0,max);
const list=(raw,max=24)=>Array.isArray(raw)?raw.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim().slice(0,80)).filter((x,i,all)=>all.indexOf(x)===i).slice(0,max):[];
const tags=new Set(['precise-math','cinematic-product','character-story','knowledge-explainer']);
export function normalizeShots(raw){
 if(!Array.isArray(raw)||raw.length>24)throw new Error('镜头数量必须在 0–24 之间');
 let cursor=0;
 return raw.map((s,i)=>{
  if(!s||typeof s!=='object')throw Error('镜头数据结构无效');
  const duration=Number(s.duration??(Number(s.end)-Number(s.start)));
  if(!Number.isInteger(duration)||duration<1||duration>120)throw new Error('第 '+(i+1)+' 个镜头时长必须为 1–120 整数秒');
  const shot={id:text(s.id,80)||'shot-'+(i+1),start:cursor,end:cursor+duration,duration,title:text(s.title,100)||'镜头 '+(i+1),visual:text(s.visual,1000),visualFamily:['city','particles','nature'].includes(s.visualFamily)?s.visualFamily:'auto',motion:text(s.motion,1000),narration:text(s.narration,1000),tags:list(s.tags).filter(x=>tags.has(x)),characterIds:list(s.characterIds),sourceIds:list(s.sourceIds)};
  cursor+=duration;return shot;
 });
}
export function normalizeSources(raw){return (Array.isArray(raw)?raw:[]).slice(0,40).flatMap(s=>{
 if(!s||typeof s!=='object')return [];
 const id=text(s.id,80),url=text(s.url,2048);
 if(!id||!/^https?:\/\//i.test(url))return [];
 return [{id,url,title:text(s.title,200),excerpt:text(s.excerpt,3000),retrievedAt:text(s.retrievedAt,35)}];
})}
export function normalizeClaims(raw){return (Array.isArray(raw)?raw:[]).slice(0,80).flatMap(c=>c&&typeof c==='object'&&text(c.text,600)?[{id:text(c.id,80),text:text(c.text,600),sourceIds:list(c.sourceIds,40)}]:[])}
export function normalizeCharacters(raw){return (Array.isArray(raw)?raw:[]).slice(0,24).flatMap(c=>c&&typeof c==='object'&&text(c.id,80)?[{id:text(c.id,80),name:text(c.name,120),appearance:text(c.appearance,1000),assetIds:list(c.assetIds,40)}]:[])}
export function updateShot(shots,index,patch){if(!Number.isInteger(index)||index<0||index>=shots.length)throw new Error('无效镜头索引');const next=shots.map((s,i)=>i===index?{...s,...patch}:s);return normalizeShots(next)}
export function moveShot(shots,index,delta){const target=index+delta;if(index<0||index>=shots.length||target<0||target>=shots.length)return normalizeShots(shots);const next=shots.map(s=>({...s}));[next[index],next[target]]=[next[target],next[index]];return normalizeShots(next)}
export function removeShot(shots,index){if(index<0||index>=shots.length)return normalizeShots(shots);return normalizeShots(shots.filter((_,i)=>i!==index))}
export function totalDuration(shots){return normalizeShots(shots).reduce((t,s)=>t+s.duration,0)}
export function projectSnapshot(project){if(!project||typeof project!=='object')throw Error('无效工程');return {schemaVersion:2,mode:normalizeCreationMode(project.mode),prompt:text(project.prompt,4000),format:project.format==='landscape'?'landscape':'portrait',shots:normalizeShots(project.shots||[]),sources:normalizeSources(project.sources),claims:normalizeClaims(project.claims),characters:normalizeCharacters(project.characters)}}
