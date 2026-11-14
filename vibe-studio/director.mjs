/** Shot-level director contract; metadata is not engine installation evidence. */
export const ENGINE_CATALOG=Object.freeze({
 remotion:{role:'compositor',phase:'P0',capabilities:['composition','timeline','subtitles','procedural'],status:'code-only'},
 anidoodle:{role:'animation',phase:'P0',capabilities:['procedural','illustration'],status:'not-integrated'},
 knowledgeFilm:{role:'knowledge',phase:'P1',capabilities:['knowledge','explanation'],status:'not-integrated'},
 stickman:{role:'narrative',phase:'P2',capabilities:['characters','story'],status:'not-integrated'},
 shotcraft:{role:'product',phase:'P2',capabilities:['product','cinematic'],status:'not-integrated'},
 manim:{role:'precision',phase:'P3',capabilities:['math','data'],status:'not-integrated'}
});
const MODES=Object.freeze({animation:'procedural',knowledge:'knowledge',story:'characters',brand:'product'});
export const ENGINE_STATES=Object.freeze(['not-integrated','code-only','tested','runtime-verified']);
export function chooseEngine({mode,visualFamily='auto',tags=[]}={}){
 if(!Object.hasOwn(MODES,mode))throw new Error('Unsupported creation mode');
 if(!Array.isArray(tags)||tags.some(t=>typeof t!=='string'))throw new Error('Invalid shot tags');
 if(tags.includes('precise-math'))return 'manim';
 if(tags.includes('cinematic-product'))return 'shotcraft';
 if(tags.includes('character-story'))return 'stickman';
 if(tags.includes('knowledge-explainer'))return 'knowledgeFilm';
 if(mode==='knowledge')return 'knowledgeFilm';
 if(mode==='story')return 'stickman';
 if(mode==='brand')return 'shotcraft';
 return 'anidoodle';
}
export function planDirectorProject(project,{engineState={}}={}){
 if(!project||typeof project!=='object'||!Array.isArray(project.shots)||project.shots.length<1||project.shots.length>24)throw new Error('Storyboard must contain 1–24 shots');
 if(!Object.hasOwn(MODES,project.mode))throw new Error('Creation mode missing or unsupported');
 let cursor=0;
 const shots=project.shots.map((shot,index)=>{
  if(!shot||typeof shot!=='object'||!Number.isInteger(shot.duration)||shot.duration<1||shot.duration>120)throw new Error('Invalid duration for shot '+(index+1));
  const preferred=chooseEngine({mode:project.mode,visualFamily:shot.visualFamily,tags:shot.tags??[]});
  const state=engineState[preferred]??ENGINE_CATALOG[preferred].status;
  if(!ENGINE_STATES.includes(state))throw new Error('Unknown engine verification state');
  const item={index,shotId:String(shot.id??('shot-'+(index+1))),start:cursor,end:cursor+shot.duration,preferredEngine:preferred,engineState:state,canDispatch:state==='runtime-verified',artifactStatus:'not-rendered'};
  cursor=item.end;return item;
 });
 return {schemaVersion:1,mode:project.mode,compositionEngine:'remotion',durationSeconds:cursor,shots,renderStatus:'not-rendered',requiresSourceAssets:project.mode==='knowledge'||project.mode==='brand'};
}
export function validateKnowledgeSources({claims=[],sources=[]}={}){
 if(!Array.isArray(claims)||!Array.isArray(sources)||claims.length<1||sources.length<1)return {pass:false,missing:['knowledge sources and claims required']};
 const known=new Set(sources.filter(x=>x&&typeof x.id==='string'&&/^https?:\/\//.test(x.url??'')).map(x=>x.id));
 const missing=claims.filter(x=>!x||typeof x.text!=='string'||!x.text.trim()||!Array.isArray(x.sourceIds)||!x.sourceIds.some(id=>known.has(id)));
 return {pass:missing.length===0,missing:missing.map(x=>x?.id??'unidentified')};
}
export function validateCharacterContinuity({characters=[],shots=[]}={}){
 if(!Array.isArray(characters)||!Array.isArray(shots))return {pass:false,unknown:['invalid character data']};
 const ids=new Set(characters.filter(x=>x&&typeof x.id==='string'&&x.id).map(x=>x.id)),unknown=[];
 for(const [index,shot] of shots.entries()){
  const refs=shot?.characterIds??[];
  if(!Array.isArray(refs)){unknown.push('shot-'+(index+1)+':bad-references');continue}
  for(const id of refs)if(!ids.has(id))unknown.push('shot-'+(index+1)+':'+String(id));
 }
 return {pass:unknown.length===0,unknown};
}
export function dispatchShot(plan,index,adapters={}){
 if(!plan||!Array.isArray(plan.shots)||!Number.isInteger(index)||index<0||index>=plan.shots.length)throw new Error('Invalid production plan');
 const shot=plan.shots[index];
 if(!shot.canDispatch)throw new Error(shot.preferredEngine+' is not runtime verified; real engine execution is blocked');
 const adapter=adapters[shot.preferredEngine];
 if(!adapter||typeof adapter.render!=='function')throw new Error('Missing real '+shot.preferredEngine+' renderer adapter');
 return adapter.render(Object.freeze({...shot}));
}
