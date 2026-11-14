import {createHash} from 'node:crypto';
const canonical=value=>Array.isArray(value)?value.map(canonical):(value&&typeof value==='object')?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export const projectFingerprint=project=>createHash('sha256').update(JSON.stringify(canonical(project))).digest('hex');
const next={queued:['running','failed'],running:['qa','failed'],qa:['verified','failed'],verified:[],failed:[]};
export function createRenderJob({id,project,output,expectedSeconds}){
 if(typeof id!=='string'||!id||!Number.isFinite(expectedSeconds)||expectedSeconds<15)throw new Error('Invalid render job');
 return {schemaVersion:1,id,status:'queued',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),project:{title:String(project?.title||''),format:project?.format,shotCount:project?.shots?.length??0},inputSha256:projectFingerprint(project),output,expectedSeconds,evidence:null,error:null};
}
export function transitionRenderJob(job,to,{evidence,error}={}){
 if(!next[job.status]?.includes(to))throw new Error('Invalid render transition '+job.status+' -> '+to);
 if(to==='verified'&&(!evidence?.verified||evidence?.codec!=='h264'||evidence?.blackRegions!==0||!Number.isFinite(evidence?.bytes)||evidence.bytes<10000||!Number.isFinite(evidence?.durationSeconds)||Math.abs(evidence.durationSeconds-job.expectedSeconds)>.5||!Number.isInteger(evidence?.width)||evidence.width<320||!Number.isInteger(evidence?.height)||evidence.height<320))throw new Error('Verified requires passed media QA evidence');
 if(to==='failed'&&!String(error||'').trim())throw new Error('Failed jobs require an error reason');
 return {...job,status:to,updatedAt:new Date().toISOString(),...(evidence?{evidence}:{}),...(error?{error:String(error).slice(0,500)}:{})};
}
