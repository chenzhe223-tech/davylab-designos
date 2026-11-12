// In-browser design session; AI generation is always a real network request.
const $=id=>document.getElementById(id);
const state={concepts:[],selected:0,source:'',pending:false,strategy:null,provider:'',model:''};
const note=(message)=>{$('aiStatus').textContent=message};
function getBrief(){const advanced=!$('advanced').hidden;return {request:$('brief').value.trim(),brand:$('brand').value.trim(),tagline:$('tagline').value.trim(),type:advanced?$('type').value:'auto',style:advanced?$('style').value:'auto',color:advanced?$('color').value:'auto',usage:advanced?$('usage').value:'all'}}
function isSafeSvg(svg){
  const normalized=typeof svg==='string'?svg.replace(/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/g,''):svg;
  if(typeof svg!=='string'||svg.length>16000||/<!DOCTYPE|<!ENTITY|<\/?(?:script|foreignObject|iframe|object|embed|image|use|animate|set|style|filter)\b|\bon[a-z]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|https?:|@import/i.test(normalized))return false;
  const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg'||!doc.documentElement.getAttribute('viewBox'))return false;
  for(const el of doc.querySelectorAll('*'))for(const attr of el.attributes){if(attr.name.toLowerCase().startsWith('on')||(/url\s*\(|javascript:|data:|https?:|@import/i.test(attr.value)&&attr.name!=='xmlns'))return false}
  return true;
}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.download=name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}
const previous=[];
function render(){
  const container=$('aiResults');container.replaceChildren();
  state.concepts.forEach((concept,index)=>{
    const article=document.createElement('article');
    const title=document.createElement('h3');title.textContent=(index+1)+'. '+concept.name;
    const description=document.createElement('p');description.textContent=concept.rationale;description.className='muted';
    const img=document.createElement('img');img.alt=concept.name+' 可编辑 SVG AI 设计方案';img.style.width='100%';img.style.height='170px';img.style.objectFit='contain';
    const url=URL.createObjectURL(new Blob([concept.svg],{type:'image/svg+xml'}));previous.push(url);img.src=url;
    const select=document.createElement('button');select.textContent=index===state.selected?'当前精修方案 ✓':'选择精修';select.addEventListener('click',()=>{state.selected=index;syncEditor();render()});
    article.append(img,title,description,select);container.append(article);
  });
  if(state.concepts.length)syncEditor();
  while(previous.length>20)URL.revokeObjectURL(previous.shift());
}
function syncEditor(){const c=state.concepts[state.selected];$('svgEditor').value=c?.svg||'';$('selectedName').textContent=c?'精修：'+c.name:'请选择 AI 生成方案'}
async function generate(mode){
  if(state.pending)return;
  const b=getBrief();if(!b.request){note('请先填写品牌需求');return}
  const payload={...b,mode,provider:document.getElementById('aiProvider')?.value||'deepseek',model:document.getElementById('aiModel')?.value||'deepseek-flash'};
  if(mode==='refine'){payload.sourceSvg=state.concepts[state.selected]?.svg;payload.revision=$('revision').value.trim();if(!payload.sourceSvg||!payload.revision){note('请先选择方案并填写精修要求');return}}
  state.pending=true;$('aiGenerate').disabled=true;$('aiRefine').disabled=true;note(mode==='refine'?'正在请求模型精修，请勿关闭页面…':'正在请求模型生成三套原创概念…');
  try{
    const headers={'content-type':'application/json'};
    if($('accessToken').value.trim())headers['X-Logo-Access-Token']=$('accessToken').value.trim();
    if($('providerKey').value.trim())headers['X-Provider-Key']=$('providerKey').value.trim();
    const res=await fetch('../api/logo/generate',{method:'POST',headers,body:JSON.stringify(payload)});
    const body=await res.json().catch(()=>({error:'服务器没有返回有效 JSON'}));
    if(!res.ok)throw new Error(body.error||'模型请求失败（'+res.status+'）');
    if(body.source!=='live-model'||!Array.isArray(body.concepts)||!body.concepts.every(c=>isSafeSvg(c.svg)))throw new Error('模型输出未通过安全验证');
    if(mode==='refine'){state.concepts[state.selected]=body.concepts[0]}else{state.concepts=body.concepts;state.selected=0}state.strategy=body.strategy||state.strategy;state.provider=body.provider||payload.provider;state.model=body.model||payload.model;
    render();document.dispatchEvent(new CustomEvent('davylab-logo-live-generated',{detail:{strategy:state.strategy,provider:state.provider,model:state.model,concepts:state.concepts.map(x=>({name:x.name,rationale:x.rationale,construction:x.construction,color:x.color}))}}));note('已接收 '+(body.provider||payload.provider)+' 的真实模型 SVG 方案；待人工核验原创性、商标与字体授权。');
  }catch(err){note('未完成 AI 生成：'+err.message)}
  finally{state.pending=false;$('aiGenerate').disabled=false;$('aiRefine').disabled=false}
}
$('aiGenerate').addEventListener('click',()=>generate('generate'));$('aiRefine').addEventListener('click',()=>generate('refine'));
$('applySvg').addEventListener('click',()=>{
  const svg=$('svgEditor').value;
  if(!isSafeSvg(svg)){note('修改后的 SVG 未通过安全检查，未应用');return}
  if(!state.concepts.length){note('请先生成 AI 方案');return}
  state.concepts[state.selected].svg=svg;render();note('已更新本地设计预览；尚未通过商标/授权审查。');
});
$('downloadAI').addEventListener('click',()=>{const c=state.concepts[state.selected];if(c)download('DAVYLAB-logo-design.svg',c.svg,'image/svg+xml');else note('尚无 AI 设计可导出')});
$('downloadPNG').addEventListener('click',async()=>{
  const c=state.concepts[state.selected];if(!c){note('尚无 AI 设计可导出');return}
  const u=URL.createObjectURL(new Blob([c.svg],{type:'image/svg+xml'}));
  try{
    const img=new Image();img.src=u;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=480;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,1200,480);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('PNG 编码失败');
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='DAVYLAB-logo-design.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(e){note('PNG 导出失败：'+e.message)}finally{URL.revokeObjectURL(u)}
});
$('saveAI').addEventListener('click',()=>{if(!state.concepts.length){note('尚无 AI 设计可保存');return}try{localStorage.setItem('davylab-logo-ai-archive-v1',JSON.stringify({concepts:state.concepts,selected:state.selected,strategy:state.strategy,provider:state.provider,model:state.model,updatedAt:new Date().toISOString()}));note('已保存在当前浏览器（不是云端同步）')}catch{note('浏览器存储空间不足，建议导出 SVG 备份')}});
$('restoreAI').addEventListener('click',()=>{try{const record=JSON.parse(localStorage.getItem('davylab-logo-ai-archive-v1')||'null');if(!record||!record.concepts?.length||!record.concepts.every(c=>isSafeSvg(c.svg)))throw new Error('没有有效归档');state.concepts=record.concepts;state.selected=Math.max(0,Math.min(record.selected||0,state.concepts.length-1));state.strategy=record.strategy||null;state.provider=record.provider||'';state.model=record.model||'';render();document.dispatchEvent(new CustomEvent('davylab-logo-live-generated',{detail:{strategy:state.strategy,provider:state.provider,model:state.model}}));note('已恢复本地方案')}catch(err){note('无法恢复：'+err.message)}});

window.DAVYLAB_LOGO_SESSION={snapshot(){return {concepts:state.concepts.map(c=>({...c})),selected:state.selected,strategy:state.strategy,provider:state.provider,model:state.model,source:state.source}},loadImported(svg,name='外部 Agent 设计'){if(!isSafeSvg(svg))throw new Error('SVG 安全校验失败');state.concepts=[{name,rationale:'已导入的外部 Agent 交付成果，非当前站内模型生成。',svg}];state.selected=0;state.provider='external-import';state.model='';state.strategy=null;render();note('外部 SVG 已进入在线精修工作台，商标和许可审查仍待完成。')}};
