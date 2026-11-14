// Deterministic timeline-to-preview mapping. No AI scene is passed off as a rendered film.
export const resolveVisualFamily=(shot,index=0)=>{
 const text=String(shot?.visual||'')+' '+String(shot?.title||'');
 if(/城市|大楼|高楼|建筑|街道|都市|天际|city|building|skyline/i.test(text))return 'city';
 if(/星|宇宙|太空|银河|粒子|星光|星球|space|galaxy|particle|orbit/i.test(text))return 'particles';
 if(/山|森林|自然|云|海|河流|草原|mountain|forest|ocean|nature/i.test(text))return 'nature';
 return index%2===0?'particles':'city';
};
export function resolvePreviewFrame(shots,seconds){
 if(!Array.isArray(shots)||!shots.length)return {duration:10,index:0,localSeconds:Math.max(0,Number(seconds)||0)%10,family:'particles',shot:{title:'本地预览动画',visual:''}};
 const durations=shots.map(s=>Number(s.duration??Number(s.end)-Number(s.start)));
 if(durations.some(n=>!Number.isFinite(n)||n<=0))throw new Error('无效分镜时长');
 const duration=durations.reduce((a,b)=>a+b,0);
 const t=((Number(seconds)||0)%duration+duration)%duration;
 let cursor=0;
 for(let index=0;index<shots.length;index++){
  const end=cursor+durations[index];
  if(t<end||index===shots.length-1)return {duration,index,localSeconds:t-cursor,family:resolveVisualFamily(shots[index],index),shot:shots[index]};
  cursor=end;
 }
}
