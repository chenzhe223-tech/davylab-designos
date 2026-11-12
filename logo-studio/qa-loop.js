/* DAVYLAB Logo QA closed-loop: factual human score diagnosis, revision and re-review.
 * Scoring remains human; this module never claims AI-based quality judgment. */
const el=id=>document.getElementById(id);
const dimensions=[
 {id:'brand',name:'品牌契合度',max:20,focus:'品牌定位、受众及差异化故事',action:'围绕品牌定位重构图形寓意，保留识别力并说明每个符号与品牌价值的关系'},
 {id:'original',name:'原创差异性',max:20,focus:'同质化、字母骨架和记忆点',action:'探索更独特的负空间与几何组织，避免常见模板和其他商标的近似结构；仍需独立商标人工检索'},
 {id:'legibility',name:'可读性',max:15,focus:'24px/32px、低对比及字距',action:'加粗易丢失的细节，简化交叉线条，校正字距及小尺寸高对比表现'},
 {id:'geometry',name:'几何构造',max:15,focus:'光学居中、曲线与网格比例',action:'优化曲线连续性、图形留白、线条权重和视觉重心，消除边缘锯齿及比例失衡'},
 {id:'versatility',name:'应用适配',max:15,focus:'单色、深浅底、App 图标及横竖版',action:'增强图形在横排、图标、深浅底、反白与单色场景的可复用性；未生成的版本需标注待交付'},
 {id:'typography',name:'字体与色彩',max:10,focus:'字形气质、品牌色和许可',action:'调整字标字体比例、字重、品牌色与文字对比；字体许可情况需人工核查'},
 {id:'production',name:'生产文件质量',max:5,focus:'SVG 可编辑性、安全性与输出文件',action:'提供结构清晰且无外部依赖的 SVG，并检查标志视口、透明背景和矢量路径'}
];
let baseline=null;
let approvedAsset=null;
const history=[];
const HISTORY_KEY='davylab-logo-qa-history-v1';
function persistHistory(){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(-25)))}catch{el('qaLoopStatus').textContent='本地空间不足，请导出历史记录备份。'}}
function restoreHistory(){try{const past=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(Array.isArray(past)){for(const record of past.slice(-25))if(record?.sha256&&typeof record.svg==='string'&&record.svg.length<=16000&&typeof record.score==='number')history.push(record);baseline=history.at(-1)||null}}catch{history.length=0}}

const svgNow=()=>el('svgEditor').value.trim();
async function hash(s){if(!s)return null;const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('')}
function score(){return window.DAVYLAB_LOGO_QA()}
function diagnosis(r){
 const low=dimensions.map(d=>({...d,value:r.scores[d.id],missing:d.max-r.scores[d.id],ratio:1-r.scores[d.id]/d.max}))
 .filter(d=>d.missing>0).sort((a,b)=>b.ratio-a.ratio||b.missing-a.missing);
 const gates=r.gates.filter(g=>!g.checked).map(g=>({logoTrademark:'商标冲突检索',logoFont:'字体及素材许可',logoLegible:'24/32px 实测',logoOriginal:'原创性人工复核',logoVisual:'SVG 与预览一致性'}[g.id]));
 return {low,gates,total:r.total};
}
function instruction(r){
 const d=diagnosis(r);const lines=[
 '# DAVYLAB Logo QA · 迭代精修交接指令',
 '当前分数：'+r.total+'/100；达标要求：≥90 且五项人工门禁全部审核',
 '品牌需求：'+el('brief').value.trim(),
 '当前问题（由人工评分推导，并非 AI 独立评估）：',
 ...d.low.map(x=>'- '+x.name+' '+x.value+'/'+x.max+'：'+x.focus+'。修改要求：'+x.action),
 '待完成的人工审核：'+(d.gates.join('、')||'暂无待勾选项；仍需保留证据'),
 '精修边界：只修改选中的当前 SVG 标志，不改变品牌名称，不得将现有未审查素材声称为商标原创。',
 '交付：1 套改进后可编辑 SVG、同源预览、变更说明以及待人工重新评分的记录。',
 '不允许：直接写入 90+ 分数、伪造商标法律结论、未经授权更换字体、凭渲染截图冒充 SVG。',
 '请以精修前后可量化差异说明改动，不要宣称自动质量验收通过。'
 ];
 return lines.join('\n');
}
function emit(){const r=score(),d=diagnosis(r),out=el('qaInsight');if(!out)return;
 const toplow=d.low;
 out.replaceChildren();
 const title=document.createElement('p');title.className='muted';title.textContent=r.total+'/100 · '+(r.internalReviewPassed?'人工门禁已确认，仍非商标注册认证':'需改进并重新审核');
 out.append(title);
 if(!svgNow()){const p=document.createElement('p');p.textContent='先生成或导入 SVG，并选中设计，再开始与具体作品绑定的评分闭环。';out.append(p)}
 if(!toplow.length){const p=document.createElement('p');p.textContent='各评分项已达到填写的满分。仍需逐项提交人工审核证据。';out.append(p)}
 const list=document.createElement('ul');list.className='qa-insight-list';
 toplow.forEach(x=>{const li=document.createElement('li');li.textContent=x.name+' '+x.value+'/'+x.max+' · '+x.focus;list.append(li)});out.append(list);
 if(d.gates.length){const p=document.createElement('p');p.className='muted';p.textContent='未确认门禁：'+d.gates.join('、');out.append(p)}
 el('qaGenerateInstruction').disabled=!svgNow();
 el('qaAiRefine').disabled=!svgNow();
 el('qaSaveReview').disabled=!svgNow();
}
async function saveReview(){
 const svg=svgNow();if(!svg)throw Error('请先生成或导入 SVG');
 const r=score(),fingerprint=await hash(svg);const d=diagnosis(r);
 const record={version:history.length+1,createdAt:new Date().toISOString(),svg,sha256:fingerprint,score:r.total,scores:r.scores,gates:r.gates,internalReviewPassed:r.internalReviewPassed,notes:r.notes,reviewer:r.reviewer,
 issues:d.low.map(x=>({key:x.id,score:x.value,max:x.max,guidance:x.action})),pendingManualGates:d.gates,
 origin:'human-review',legalApproval:false};
 history.push(record);baseline=record;approvedAsset=fingerprint;persistHistory();renderHistory();el('qaLoopStatus').textContent='已记录版本 V'+record.version+' · '+fingerprint.slice(0,12)+'… 评分关联当前 SVG。';return record
}
function renderHistory(){
 const root=el('qaVersionHistory');root.replaceChildren();
 history.forEach((r,index)=>{const box=document.createElement('div');box.className='qa-version';
 const b=document.createElement('button');b.type='button';b.textContent='V'+r.version+' · '+r.score+'/100 · '+r.sha256.slice(0,8);b.onclick=()=>restore(index);
 const span=document.createElement('span');span.textContent=r.internalReviewPassed?'内部审核通过（非法律认证）':'待改进／待人工审核';box.append(b,span);root.append(box)})
}
function restore(index){
 const record=history[index];if(!record)return;
 const loader=window.DAVYLAB_LOGO_SESSION?.loadImported;
 if(typeof loader!=='function'){el('qaLoopStatus').textContent='当前工作台暂不支持恢复 SVG';return}
 loader(record.svg,'QA 历史版本 V'+record.version);
 // Review is intentionally not restored as valid: human must re-attest each version.
 approvedAsset=null;const note='已恢复 V'+record.version+' 设计；请对当前内容重新评分和审核，不能继承旧版的商标/许可确认。';
 el('qaLoopStatus').textContent=note;
 ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'].forEach(id=>el(id).checked=false);
 dimensions.forEach(d=>el('score-'+d.id).value='0');
 el('reviewNotes').value='';el('rubric').dispatchEvent(new Event('input',{bubbles:true}));emit()
}
async function compare(){
 const old=baseline,newSvg=svgNow();
 if(!old){el('qaLoopStatus').textContent='请先点击“记录当前版本与评分”保存基线。';return}
 const newHash=await hash(newSvg);const changed=newHash!==old.sha256;
 const now=score();const delta=now.total-old.score;
 el('qaComparison').textContent='基线 V'+old.version+' '+old.score+'/100 → 当前 '+now.total+'/100（'+(delta>=0?'+':'')+delta+'） · SVG '+(changed?'已更改，必须重新人工评审':'未改变')+'。';
}
async function invalidateChangedAsset(){
 if(!approvedAsset)return;
 const current=svgNow(),fingerprint=await hash(current);
 if(fingerprint===approvedAsset)return;
 approvedAsset=null;
 ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'].forEach(id=>el(id).checked=false);
 dimensions.forEach(d=>el('score-'+d.id).value='0');
 el('reviewNotes').value='';el('rubric').dispatchEvent(new Event('input',{bubbles:true}));
 el('qaLoopStatus').textContent='检测到新 SVG 版本：已清空旧版评分与审核确认，请重新评分并保存新版本。';
 emit();
}
function attach(){
 restoreHistory();renderHistory();
 el('rubric').addEventListener('input',emit);
 ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'].forEach(id=>el(id).addEventListener('change',emit));
 el('svgEditor').addEventListener('input',()=>{emit();invalidateChangedAsset()});
 el('svgEditor').addEventListener('change',()=>{emit();invalidateChangedAsset()});
 ['applySvg','applyVisual','aiGenerate','aiRefine','restoreAI','editImported'].forEach(id=>el(id)?.addEventListener('click',()=>setTimeout(invalidateChangedAsset,180)));
 el('aiResults').addEventListener('click',()=>setTimeout(invalidateChangedAsset,70));
 el('qaGenerateInstruction').onclick=()=>{
  const r=score(),prompt=instruction(r);
  el('qaGeneratedPrompt').value=prompt;el('revision').value=prompt;
  el('qaLoopStatus').textContent='已生成基于人工评分的精修指令，已同步至 AI 精修意见框。未调用模型。';
 };
 el('qaCopyPrompt').onclick=async()=>{const text=el('qaGeneratedPrompt').value;if(!text){el('qaLoopStatus').textContent='请先生成精修指令';return}
  try{await navigator.clipboard.writeText(text);el('qaLoopStatus').textContent='精修指令已复制，可用于外部 Agent。'}catch{el('qaLoopStatus').textContent='复制受浏览器限制，请手动复制指令。'}
 };
 el('qaAiRefine').onclick=async()=>{
  if(!svgNow()){el('qaLoopStatus').textContent='未选择 SVG，无法精修';return}
  if(!el('qaGeneratedPrompt').value)el('qaGenerateInstruction').click();
  if(!baseline)await saveReview();
  el('revision').value=el('qaGeneratedPrompt').value;
  el('qaLoopStatus').textContent='已提交精修指令到站内 AI 工作台；仅在模型配置有效时会生成新 SVG。';
  el('aiRefine').click();
 };
 el('qaSaveReview').onclick=async()=>{try{await saveReview()}catch(err){el('qaLoopStatus').textContent=err.message}};
 el('qaCompare').onclick=compare;
 el('qaDownloadHistory').onclick=()=>{
  if(!history.length){el('qaLoopStatus').textContent='先记录一次评分';return}
  const exported=history;const url=URL.createObjectURL(new Blob([JSON.stringify({schema:'davylab-logo-review-history-v1',records:exported},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='DAVYLAB-logo-quality-history.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)
 };
 emit();
}
attach();
