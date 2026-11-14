import {auditBrandProject} from './quality.js';
// DAVYLAB Design Agent 4.0 P0 — browser-local project state, live model strategy and SVG concepts.
const $=id=>document.getElementById(id);
const STORAGE='davylab-design-agent-projects-p0';
const HANDOFF='davylab-design-agent-handoff-v1';
const STRATEGY_FIELDS=['brand_name','tagline','positioning','audience','personality','core_value','brand_story','usage'];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const cap=(v,n=240)=>String(v??'').trim().slice(0,n);
const hex=v=>/^#[a-f\d]{6}$/i.test(v||'')?v:'#57785e';
const newId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'brand-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
let p={id:newId(),brief:'',strategy:null,directions:[],selected:null,source:'',model:'deepseek-flash',updated:new Date().toISOString(),vectors:false};
let busy=false;
let imageURLs=[];
const safeStorage=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}};
function projects(){const value=safeStorage();return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}
function save(silent=false){
  if(!p.brief.trim()&&!p.strategy)return;
  p.updated=new Date().toISOString();
  try{const all=projects();all[p.id]=p;const ordered=Object.values(all).filter(x=>x?.id).sort((a,b)=>String(b.updated).localeCompare(String(a.updated))).slice(0,25);localStorage.setItem(STORAGE,JSON.stringify(Object.fromEntries(ordered.map(x=>[x.id,x]))));if(!silent)feedback('planFeedback','已保存至当前浏览器（不是云端同步）');renderArchive();}
  catch{feedback('planFeedback','本地空间不足，建议导出项目 JSON','error')}
}
function feedback(id,message,type='info'){$(id).textContent=message;$(id).classList.toggle('error',type==='error')}
function setBusy(value){busy=value;['runPlan','generateVectors'].forEach(id=>$(id).disabled=value||(id==='generateVectors'&&!p.directions.length));$('runPlan').textContent=value?'正在构思品牌方案…':'开始设计 →';$('generateVectors').textContent=value?'正在制作 Logo…':'继续制作 Logo →'}
function validSVG(s){
  if(typeof s!=='string'||s.length>16000||s.length<140||/<!DOCTYPE|<!ENTITY|<\s*\/?\s*(?:script|style|foreignObject|iframe|object|embed|image|use|animate|set|filter|pattern)\b|\bon[a-z-]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|@import/i.test(s.replace(/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/gi,'')))return false;
  const d=new DOMParser().parseFromString(s,'image/svg+xml');
  return !d.querySelector('parsererror')&&d.documentElement.localName==='svg'&&!!d.documentElement.getAttribute('viewBox');
}
function phaseIndex(){if(p.selected!==null)return p.vectors?5:4;if(p.vectors)return 3;if(p.directions.length)return 3;if(p.strategy)return 2;return 1}
function render(){
  $('brief').value=p.brief||'';
  $('model').value=p.model||'deepseek-flash';
  $('projectLabel').textContent=p.strategy?.brand_name||'新品牌项目';
  $('projectStatus').textContent=p.source==='example-only'?'◉ 示例预览 · 非 AI 成果':p.vectors?'● 已生成真实 SVG':p.strategy?'● 策划已保存 · 待完成生产':'● 新项目 · 尚未生成';
  const active=phaseIndex();
  for(let i=1;i<=6;i++){$('phase'+i).classList.toggle('done',i<active);$('phase'+i).classList.toggle('active',i===active)}
  $('strategyEmpty').classList.toggle('is-hidden',!!p.strategy);
  $('strategyEditor').classList.toggle('is-hidden',!p.strategy);
  if(p.strategy){for(const k of STRATEGY_FIELDS)$(k).value=p.strategy[k]||'';const k=p.strategy.keywords||[];$('keywords').innerHTML='<b>品牌关键词</b><p>'+k.map(w=>'<span class="tag">'+escapeHtml(w)+'</span>').join('')+'</p>';}
  renderConcepts();
  $('generateVectors').disabled=busy||!p.strategy||!p.directions.length;
  $('copyBrief').disabled=p.selected===null;
  $('openLogo').disabled=p.selected===null;
  $('copyAgent').disabled=p.selected===null;
  $('stageName').textContent=p.vectors?'真实 SVG 已生成，等待设计审核':p.selected!==null?'设计方向已选定':p.directions.length?'三套策划已就绪': '等待项目开始';
  $('statusDetails').textContent=p.source==='example-only'?'示例规划仅作视觉体验。请使用 DeepSeek 获取自己的品牌策划。':p.selected!==null?'已选方向 '+p.directions[p.selected]?.name+'，可继续生图或交接 Agent。':p.directions.length?'请选择一个方向，或先调用 AI 制作真实矢量三案。':'完成 AI 分析后继续。';
  renderArchive();
}
function renderConcepts(){
  const host=$('conceptGrid');host.innerHTML='';imageURLs.forEach(url=>URL.revokeObjectURL(url));imageURLs=[];
  const has=p.directions?.length===3;
  $('emptyConcepts').classList.toggle('is-hidden',has);
  host.classList.toggle('is-hidden',!has);
  if(!has){$('conceptSource').textContent='02 · 等待 AI 策划';return}
  $('conceptSource').textContent=p.source==='example-only'?'EXAMPLE · 示例方案':p.vectors?'LIVE SVG · 真实模型结果':'AI STRATEGY · 预览模拟';
  p.directions.forEach((d,i)=>{
    const colors=(d.palette||[]).slice(0,4).map(hex);
    while(colors.length<4)colors.push(['#E4E9DE','#325F47','#D4AF79','#F6F1E5'][colors.length]);
    const style='--c0:'+colors[0]+';--c1:'+colors[1]+';--c2:'+colors[2]+';--c3:'+colors[3]+';';
    const selected=p.selected===i;
    const brand=escapeHtml(p.strategy?.brand_name||'BRAND');
    const title=escapeHtml(d.name), rationale=escapeHtml(d.rationale), headline=escapeHtml(d.headline||p.strategy?.tagline||'为每一段日常创造更多可能');
    const card=document.createElement('article');
    card.className='concept'+(selected?' chosen':'');
    const real=validSVG(d.svg);
    const logo=real?'<img class="vectorLogo" alt="AI 生成的可编辑 SVG Logo" />':'<div class="monogram" aria-hidden="true">'+escapeHtml(brand.slice(0,1).toUpperCase())+'</div><div class="wordmark">'+brand+'</div>';
    card.innerHTML='<div class="art" style="'+style+'"><div class="artlogo">'+logo+'</div><div class="mockup"><div class="mock-nav"><span>'+brand+'</span><span>DISCOVER&nbsp;&nbsp; JOURNAL&nbsp;&nbsp; CONTACT</span></div><div class="mock-body"><div><strong>'+headline+'</strong><small>'+escapeHtml(d.positioning||'品牌视觉应用意向')+'</small><br><span class="mock-pill">EXPLORE</span></div><div class="mock-photo"></div></div></div></div><div class="concept-info"><div class="kicker">DIRECTION '+escapeHtml(d.id||'ABC'[i])+'</div><h3>方案 '+escapeHtml(d.id||'ABC'[i])+' · '+title+'</h3><p>'+rationale+'</p><div class="swatches">'+colors.map(c=>'<i style="background:'+c+'"></i>').join('')+'</div><div class="labelnotice">'+(real?'真实模型矢量图 · 场景模拟':'排版/场景模拟 · 非正式 Logo')+'</div><button type="button" class="btn '+(selected?'primary':'')+'" data-select="'+i+'">'+(selected?'✓ 已选定':'选择此方向')+'</button><button type="button" class="btn edit-direction" data-edit="'+i+'">编辑此方向</button></div>';
    if(real){const url=URL.createObjectURL(new Blob([d.svg],{type:'image/svg+xml'}));imageURLs.push(url);card.querySelector('.vectorLogo').src=url;}
    card.querySelector('[data-select]').addEventListener('click',()=>{p.selected=i;save(true);render();feedback('vectorFeedback','已选择方案 '+d.id+' · '+d.name+'；可进入双轨生产。');});
    card.querySelector('[data-edit]').addEventListener('click',()=>openDirectionEditor(i));
    host.append(card);
  });
}
function renderArchive(){
  const host=$('archiveEntries');const items=Object.values(projects()).filter(x=>x&&x.id).sort((a,b)=>String(b.updated).localeCompare(String(a.updated))).slice(0,25);
  if(!items.length){host.textContent='暂无本地项目';return}
  host.innerHTML='';
  for(const item of items){
    const div=document.createElement('div');div.className='archiveentry';
    const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=item.strategy?.brand_name||item.brief?.slice(0,24)||'未命名项目';
    const sub=document.createElement('small');sub.textContent=(item.source==='example-only'?'示例 · ':'')+(item.vectors?'已有 SVG · ':'策划项目 · ')+(item.updated||'').slice(0,10);
    info.append(strong,sub);
    const control=document.createElement('div');control.className='actions';
    const open=document.createElement('button');open.className='btn';open.textContent='打开';open.addEventListener('click',()=>{p=structuredClone(item);render();location.hash='#start';});
    const remove=document.createElement('button');remove.className='btn';remove.textContent='删除';remove.setAttribute('aria-label','删除项目 '+strong.textContent);remove.addEventListener('click',()=>{if(!confirm('确定删除该浏览器中的项目记录吗？此操作不可撤销。'))return;const all=projects();delete all[item.id];localStorage.setItem(STORAGE,JSON.stringify(all));if(p.id===item.id){p=blank();render()}else renderArchive();});
    control.append(open,remove);div.append(info,control);host.append(div);
  }
}
function blank(){return {id:newId(),brief:'',strategy:null,directions:[],selected:null,source:'',model:'deepseek-flash',updated:new Date().toISOString(),vectors:false}}
function headerKey(){const h={'content-type':'application/json'};if($('key').value.trim())h['X-Provider-Key']=$('key').value.trim();if($('token').value.trim())h['X-Logo-Access-Token']=$('token').value.trim();return h}
async function call(url,body){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),98000);
  try{const res=await fetch(url,{method:'POST',headers:headerKey(),body:JSON.stringify(body),signal:controller.signal});const data=await res.json().catch(()=>({error:'服务器未返回有效 JSON'}));if(!res.ok)throw Error(data.error||'服务异常：'+res.status);return data}finally{clearTimeout(timeout)}
}
async function plan(){
  if(busy)return;
  const brief=$('brief').value.trim();
  if(brief.length<8){feedback('planFeedback','请先填写至少 8 个字的品牌需求','error');return}
  p.brief=brief;p.model=$('model').value;setBusy(true);feedback('planFeedback','正在构思三个品牌方向…');
  try{
    const r=await call('/api/brand/plan',{brief,model:p.model});
    if(r.source!=='live-deepseek'||r.directions?.length!==3||!r.strategy?.brand_name)throw Error('策划结果不完整');
    p.strategy=r.strategy;p.directions=r.directions.map(x=>({...x,svg:''}));p.selected=null;p.source=r.source;p.vectors=false;
    save(true);render();feedback('planFeedback','DeepSeek 已返回真实品牌策划和三套差异化方向。可修改右侧策略，再生成矢量稿。');location.hash='#concepts';
  }catch(err){const msg=String(err.message||'');if(/登录|验证|401/i.test(msg)){feedback('planFeedback','请先登录 DAVYLAB，再重新开始设计。','error')}else if(/额度|429/i.test(msg)){feedback('planFeedback','今日 AI 策划次数已达上限，请明天再试。','error')}else feedback('planFeedback','设计暂未完成：'+msg,'error')}finally{setBusy(false)}
}
function applyStrategy(){
  if(!p.strategy)return;
  for(const k of STRATEGY_FIELDS)p.strategy[k]=cap($(k).value,Number($(k).maxLength)||600);
  if(!p.strategy.brand_name.trim()){feedback('planFeedback','品牌名称不能为空','error');return}
  p.vectors=false;p.directions.forEach(d=>delete d.svg);p.selected=null;
  save(true);render();feedback('planFeedback','品牌策略已更新。旧的矢量方案已从当前草稿解除关联，请重新生成以确保一致性。');
}
async function vectors(){
  if(busy||p.directions.length!==3||!p.strategy)return;
  applyPendingInputs();
  const directionBrief=p.directions.map(x=>x.id+' '+x.name+': '+x.rationale+'; symbol '+x.symbol+'; palette '+(x.palette||[]).join('/')).join(' | ');
  const prompt=cap('品牌 '+p.strategy.brand_name+'；定位：'+p.strategy.positioning+'；受众：'+p.strategy.audience+'；核心价值：'+p.strategy.core_value+'；品牌故事：'+p.strategy.brand_story+'。三个提案方向：'+directionBrief+'。依次为三个方向创作真正差异化、可编辑的 SVG Logo。',1490);
  setBusy(true);feedback('vectorFeedback','正在调用真实模型设计三个矢量标志，请勿关闭页面…');
  try{
    const r=await call('/api/logo/generate',{request:prompt,brand:p.strategy.brand_name,tagline:p.strategy.tagline,usage:p.strategy.usage,provider:'deepseek',model:p.model,color:'auto',style:'根据三个方向分别设计'});
    if(r.source!=='live-model'||r.concepts?.length!==3||!r.concepts.every(x=>validSVG(x.svg)))throw Error('真实 SVG 未通过安全和数量检查');
    p.directions.forEach((d,i)=>{d.svg=r.concepts[i].svg;d.vector_rationale=r.concepts[i].rationale});p.vectors=true;p.selected=null;save(true);render();feedback('vectorFeedback','已生成真实 SVG Logo 三案。请选定方向，并完成商标、字体和适用场景人工审核。');
  }catch(err){feedback('vectorFeedback','矢量生成失败：'+err.message,'error')}finally{setBusy(false)}
}
function applyPendingInputs(){if(p.strategy){for(const k of STRATEGY_FIELDS)p.strategy[k]=cap($(k).value,Number($(k).maxLength)||650)}}
function standardPrompt(){
  if(p.selected===null)return '';
  applyPendingInputs();
  const d=p.directions[p.selected],s=p.strategy;
  return [
    '# DAVYLAB Design Agent · 品牌制作任务',
    '## 任务编号：'+p.id,
    '## 执行平台：'+$('agent').value,
    '## 用户原始需求\n'+p.brief,
    '## 已确认品牌策略\n'+JSON.stringify(s,null,2),
    '## 已选设计方向\n'+JSON.stringify({...d,svg:undefined},null,2),
    '## 任务',
    '按照已确认方向制作成套品牌识别系统，包括三种 Logo 结构版本、黑白反白、色板、字体建议、品牌故事、应用场景、网站/移动端界面预览；视觉层级和字体排版遵守高端品牌设计规范。',
    '所有图片须为真正生成的高清资产，杜绝简笔画占位、预览与成品失配。不要模仿现有品牌商标或声称已完成商标检索。',
    '## 必须交付',
    'logo-primary.svg / logo-secondary.svg / logo-monochrome.svg / logo-primary.png / brand-guide.md / preview-web.png / preview-mobile.png / manifest.json',
    'manifest.json 应包含 task_id、brand、direction_id、file list、media type、SHA256、source_agent、created_at 与 QA status，文件名按实际产物校正。',
    '结果交给用户审核后，再上传到用户授权的指定 GitHub 仓库；未提供仓库路径或授权时先提供可下载 ZIP，不要擅自推送或公开。',
    '最终检查：品牌匹配度、可识别性、多场景一致性、小尺寸清晰度、导出完整性；商标与字体授权标记为待人工核验。',
    '注意：复制任务仅完成交接，不代表 Agent 已执行。'
  ].join('\n\n');
}
async function copy(text,id){
  if(!text){feedback(id,'请先选定一个品牌方案','error');return}
  try{await navigator.clipboard.writeText(text);feedback(id,'已复制到剪贴板，可粘贴到目标 Agent。')}
  catch{const box=document.createElement('textarea');box.value=text;document.body.append(box);box.select();const ok=document.execCommand('copy');box.remove();feedback(id,ok?'已复制':'复制不可用，请通过导出项目获取内容',ok?'info':'error')}
}
function openLogo(){
  if(p.selected===null)return;
  applyPendingInputs();save(true);
  const d=p.directions[p.selected];
  try{localStorage.setItem(HANDOFF,JSON.stringify({id:p.id,brief:p.brief,strategy:p.strategy,direction:d,createdAt:new Date().toISOString()}))}
  catch{feedback('vectorFeedback','交接存储失败，建议先导出项目 JSON','error');return}
  location.href='../logo-studio/?source=design-agent4';
}
function demo(){
  p=blank();p.brief='为 ISLAND DAYS 打造一个面向年轻家庭的高品质海岛度假品牌，兼顾自然、高级感与轻松度假体验。';
  p.source='example-only';p.strategy={brand_name:'ISLAND DAYS',tagline:'海岛度假 · 自然相伴',positioning:'面向年轻家庭的品质海岛度假体验',audience:'25–45 岁注重体验和美学的家庭',personality:'自然、温暖、松弛、精致',core_value:'放慢脚步，与家人共同创造独特假期',brand_story:'在海风、晨光与岛屿之间，留下每一段亲子时光。',usage:'官网、App、度假礼品、酒店导视',keywords:['自然','家庭','海岛','度假'],assumptions:['名称及商标仍需核验']};
  p.directions=[
    {id:'A',name:'自然奢华',positioning:'自然与亲密感',rationale:'暖纸色与深绿，突出自然、有温度的轻奢体验。',symbol:'日出与海浪',typography:'优雅字距',logo_type:'组合标志',headline:'海岛度假，与爱同行',palette:['#EBE6D6','#3F634E','#DEAC62','#C7D0B8']},
    {id:'B',name:'阳光活力',positioning:'年轻人的家庭假期',rationale:'日光橙与海水青，聚焦活力、探索及陪伴。',symbol:'阳光与海面',typography:'友好圆体',logo_type:'几何符号',headline:'快乐，从这一刻开始',palette:['#F8EEE5','#245E5B','#FFB44E','#55B6B2']},
    {id:'C',name:'国际极简',positioning:'高级海岛度假服务',rationale:'深蓝与砂岩色呈现稳定、现代的高级度假氛围。',symbol:'棕榈叶与海平线',typography:'高对比衬线',logo_type:'文字与符号',headline:'寻找属于你的日光',palette:['#F3EFE8','#142B43','#C8B9A0','#879DA1']}
  ];p.selected=null;p.vectors=false;save(true);render();feedback('planFeedback','正在查看显式标记的示例方案；没有调用 AI，不会将示例标记为真实生成。');location.hash='#concepts';
}
function exportProject(){
  applyPendingInputs();const copyOfProject=structuredClone(p);
  const blob=new Blob([JSON.stringify({schema:'davylab-design-agent-4-p0',exported_at:new Date().toISOString(),project:copyOfProject},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='DAVYLAB-brand-'+(p.strategy?.brand_name||'project').replace(/[^a-zA-Z0-9_-]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);
}

let latestQA=null;
function runDesignQA(){
  applyPendingInputs();
  latestQA=auditBrandProject(p);
  const blockers=latestQA.issues.filter(i=>i.severity==='blocker').length;
  const major=latestQA.issues.filter(i=>i.severity==='major').length;
  $('qaSummary').textContent=(latestQA.passed?'基础检查通过':'需要修正')+' · 阻断 '+blockers+' · 重要 '+major+' · 共 '+latestQA.issues.length+' 项发现';
  const list=$('qaFindings');list.replaceChildren();
  for(const finding of latestQA.issues){
    const li=document.createElement('li');
    li.textContent='['+finding.severity+'] '+finding.message+' — '+finding.action;
    list.append(li);
  }
  if(!latestQA.issues.length){const li=document.createElement('li');li.textContent='基础静态检查无发现。仍需完成真实视觉、可访问性与授权验收。';list.append(li)}
  $('exportDesignQA').disabled=false;
}
function exportDesignQA(){
  if(!latestQA)return;
  const report={...latestQA,project_id:p.id,project_updated:p.updated,checked_at:new Date().toISOString()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='DAVYLAB-design-QA-'+p.id+'.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}
$('runDesignQA').addEventListener('click',runDesignQA);
$('exportDesignQA').addEventListener('click',exportDesignQA);
let editingIndex=-1;
function openDirectionEditor(index){
  if(!p.directions[index])return;
  editingIndex=index;const d=p.directions[index];
  for(const k of ['name','rationale','symbol','typography','headline'])$('d_'+k).value=d[k]||'';
  $('d_palette').value=(d.palette||[]).join(', ');
  $('directionError').textContent='';
  $('directionDialog').showModal();
}
$('cancelDirection').addEventListener('click',()=>$('directionDialog').close());
$('directionForm').addEventListener('submit',event=>{
  event.preventDefault();
  if(editingIndex<0||!p.directions[editingIndex])return;
  const colors=$('d_palette').value.split(',').map(v=>v.trim());
  if(colors.length!==4||colors.some(v=>!/^#[0-9a-fA-F]{6}$/.test(v))){
    $('directionError').textContent='请填写四个合法的 HEX 色值，例如 #F4F1E9, #234536, #BDA882, #D5DCD2';return;
  }
  const name=$('d_name').value.trim(),rationale=$('d_rationale').value.trim();
  if(!name||!rationale){$('directionError').textContent='方向名称与设计理由不能为空';return}
  if(p.directions.some((d,i)=>i!==editingIndex&&d.name===name)){$('directionError').textContent='三套方向不能使用相同名称';return}
  const d=p.directions[editingIndex];
  for(const k of ['name','rationale','symbol','typography','headline'])d[k]=cap($('d_'+k).value,450);
  d.palette=colors.map(v=>v.toUpperCase());
  if(p.vectors){for(const x of p.directions)delete x.svg;p.vectors=false;}
  save(true);render();$('directionDialog').close();
  feedback('vectorFeedback','已保存方向修改；如曾生成 SVG，需重新生成以确保素材与方案一致。');
});

$('runPlan').addEventListener('click',plan);
$('loadDemo').addEventListener('click',demo);
$('saveProject').addEventListener('click',()=>{p.brief=$('brief').value.trim();applyPendingInputs();save()});
$('newProject').addEventListener('click',()=>{save(true);p=blank();render();feedback('planFeedback','新项目已创建，可以开始输入品牌需求。');location.hash='#start'});
$('exportProject').addEventListener('click',exportProject);
$('applyStrategy').addEventListener('click',applyStrategy);
$('generateVectors').addEventListener('click',vectors);
$('copyBrief').addEventListener('click',()=>copy(standardPrompt(),'vectorFeedback'));
$('copyAgent').addEventListener('click',()=>copy(standardPrompt(),'vectorFeedback'));
$('openLogo').addEventListener('click',openLogo);
const entries=Object.values(projects()).filter(x=>x&&x.id).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
if(entries[0])p=structuredClone(entries[0]);
render();
