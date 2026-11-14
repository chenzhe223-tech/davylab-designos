/** Immutable local project revisions; no cross-device persistence implied. */
export const MAX_REVISIONS=12;
export function saveRevision(project,history=[],{now=new Date().toISOString(),id}={}){
 if(!project||typeof project!=='object'||!Array.isArray(project.shots)||typeof project.prompt!=='string')throw Error('Invalid project revision');
 if(!Array.isArray(history))throw Error('Invalid revision history');
 const snapshot=JSON.parse(JSON.stringify(project)),key=JSON.stringify(snapshot);
 const previous=history.filter(x=>x&&typeof x==='object'&&x.id&&x.project).filter(x=>JSON.stringify(x.project)!==key);
 const entry={id:id||('rev-'+String(now)+'-'+(previous.length+1)),createdAt:String(now),label:project.prompt.trim().slice(0,48)||'未命名工程',shotCount:project.shots.length,project:snapshot};
 return [entry,...previous].slice(0,MAX_REVISIONS);
}
export function listRevisions(history=[]){
 if(!Array.isArray(history))return [];
 return history.filter(x=>x&&typeof x.id==='string'&&x.project).map(({id,createdAt,label,shotCount})=>({id,createdAt,label,shotCount}));
}
export function restoreRevision(history,id){
 if(!Array.isArray(history)||typeof id!=='string')throw Error('Invalid version selection');
 const entry=history.find(x=>x?.id===id);
 if(!entry?.project)throw Error('Revision not found');
 return JSON.parse(JSON.stringify(entry.project));
}
