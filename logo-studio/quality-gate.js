const $=id=>document.getElementById(id);
const rubric=[['brand','品牌契合度',20],['original','原创差异性',20],['legibility','可读性',15],['geometry','几何构造',15],['versatility','应用适配',15],['typography','字体与色彩',10],['production','生产文件质量',5]];
const area=$('rubric');for(const [id,label,max] of rubric){const wrap=document.createElement('div');wrap.innerHTML='<label for="score-'+id+'">'+label+'（0–'+max+'）</label><input type="number" id="score-'+id+'" min="0" max="'+max+'" step="1" value="0" required>';area.append(wrap)}
function report(){
 const scores=Object.fromEntries(rubric.map(([id,,max])=>[id,Math.max(0,Math.min(max,Number($('score-'+id).value)||0))]));
 const score=Object.values(scores).reduce((a,b)=>a+b,0);
 const gates=['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'].map(id=>({id,checked:$(id).checked}));
 const complete=gates.every(x=>x.checked);
 return {schema:'davylab-logo-qa-v1',generatedAt:new Date().toISOString(),scores,total:score,threshold:90,manualSelfAttestation:complete,gates,internalReviewPassed:score>=90&&complete,legalTrademarkRegistrationVerified:false,automatedSvgReviewNotReplaced:true,reviewer: $('reviewer').value.trim()||null,notes:$('reviewNotes').value.trim(),disclaimer:'User-entered scores and attestations; NOT independent originality verification, legal clearance or trademark registration.'};
}
function refresh(){const r=report();$('qaSummary').textContent=r.total+'/100 · '+(r.internalReviewPassed?'内部质量门禁通过（非法律认证）':'未通过发布门禁');$('downloadReview').disabled=false}
area.addEventListener('input',refresh);for(const id of ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'])$(id).addEventListener('change',refresh);
$('reviewer').addEventListener('input',refresh);$('reviewNotes').addEventListener('input',refresh);
$('downloadReview').onclick=()=>{const blob=new Blob([JSON.stringify(report(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='DAVYLAB-logo-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)};
refresh();
