const next={queued:['running','failed'],running:['qa','failed'],qa:['verified','failed'],verified:[],failed:[]};
export function createRenderJob({id,project,output,expectedSeconds}){
 if(typeof id!=='string'||!id||!Number.isFinite(expectedSeconds)||expectedSeconds<15)throw new Error('Invalid render job');
 return {schemaVersion:1,id,status:'queued',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),project:{title:String(project?.title||''),format:project?.format,shotCount:project?.shots?.length??0},output,expectedSeconds,evidence:null,error:null};
}
export function transitionRenderJob(job,to,{evidence,error}={}){
 if(!next[job.status]?.includes(to))throw new Error('Invalid render transition '+job.status+' -> '+to);
 if(to==='verified'&&(!evidence?.verified||evidence?.codec!=='h264'||evidence?.blackRegions!==0||!Number.isFinite(evidence?.bytes)))throw new Error('Verified requires passed media QA evidence');
 if(to==='failed'&&!String(error||'').trim())throw new Error('Failed jobs require an error reason');
 return {...job,status:to,updatedAt:new Date().toISOString(),...(evidence?{evidence}:{}),...(error?{error:String(error).slice(0,500)}:{})};
}
