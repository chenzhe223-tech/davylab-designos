/* DAVYLAB Logo Studio P0–P3: real model UX, brand brief, same-source inspectable previews. */
const byId=id=>document.getElementById(id);
const production=byId('aiResults').closest('section');
const providerLine=document.createElement('div');
providerLine.className='logo-provider-settings';
providerLine.innerHTML='<div><label for="aiProvider">品牌设计引擎</label><select id="aiProvider"><option value="deepseek">DeepSeek · 创意策略 + 原创 SVG</option><option value="openai">OpenAI · 原有兼容模式</option></select></div><div><label for="aiModel">模型档位（按实际 API 计费）</label><select id="aiModel"><option value="deepseek-flash">DeepSeek Flash · 优先</option><option value="deepseek-v4-pro">DeepSeek V4 Pro · 高精修</option></select></div>';
production.insertBefore(providerLine,byId('aiStatus'));
const providerKeyLabel=production.querySelector('label[for="providerKey"]');
const providerKey=byId('providerKey');
providerKeyLabel.textContent='临时 DeepSeek API Key（只用于本次请求）';
providerKey.placeholder='输入 DeepSeek Key；若管理员配置了服务器 Secret 可留空';
providerKey.autocomplete='off';
providerKey.setAttribute('spellcheck','false');
byId('aiProvider').addEventListener('change',event=>{
  const deepseek=event.target.value==='deepseek';
  byId('aiModel').replaceChildren();
  const choices=deepseek?[['deepseek-flash','DeepSeek Flash · 优先'],['deepseek-v4-pro','DeepSeek V4 Pro · 高精修']]:[['gpt-4.1-mini','GPT-4.1 mini · 兼容模式']];
  for(const [value,label] of choices){const option=document.createElement('option');option.value=value;option.textContent=label;byId('aiModel').append(option)}
  providerKeyLabel.textContent='临时 '+(deepseek?'DeepSeek':'OpenAI')+' API Key（只用于本次请求）';
  providerKey.placeholder='输入 '+(deepseek?'DeepSeek':'OpenAI')+' Key；或由服务器安全配置';
});
byId('aiGenerate').textContent='真正生成三套 AI 矢量 Logo';
const oneSentence=document.createElement('button');
oneSentence.type='button';oneSentence.id='oneSentenceAi';
oneSentence.className='primary';
oneSentence.textContent='✦ 一句话 AI 生成 Logo';
const actions=byId('generate').parentElement;
actions.prepend(oneSentence);
byId('generate').textContent='离线草图参考（非 AI）';
oneSentence.addEventListener('click',()=>{
  if(!byId('brief').value.trim()){byId('conceptStatus').textContent='请先输入一句品牌需求';byId('brief').focus();return}
  byId('aiGenerate').click();
  production.scrollIntoView({behavior:'smooth',block:'start'});
});
const statusHelp=document.createElement('p');
statusHelp.className='muted';
statusHelp.id='providerKeyHelp';
statusHelp.textContent='只有点击“AI 生成”后才发起真实模型调用，可能产生 API 费用；页面不储存 Key。离线草图始终与 AI 原创明确区分。';
providerLine.after(statusHelp);
const output=document.createElement('div');
output.id='brandStrategy';
output.className='logo-brand-strategy';
output.hidden=true;
byId('aiResults').before(output);
function strategyView(strategy,provider,model){
  output.replaceChildren();
  const entries=[['品牌定位',strategy?.positioning],['目标人群',strategy?.audience],['品牌性格',strategy?.personality],['价值主张',strategy?.promise],['建议色彩',strategy?.palette],['字标策略',strategy?.typography],['前提与假设',strategy?.assumptions]];
  if(!entries.some(([,v])=>v)){output.hidden=true;return}
  output.hidden=false;
  const head=document.createElement('h3');
  head.textContent='真实品牌策略 · '+(provider||'AI')+' / '+(model||'');
  output.append(head);
  const grid=document.createElement('div');grid.className='logo-strategy-grid';
  entries.forEach(([key,value])=>{if(!value)return;const item=document.createElement('div');const h=document.createElement('strong');h.textContent=key;const p=document.createElement('p');p.textContent=value;item.append(h,p);grid.append(item)});
  output.append(grid);
}
document.addEventListener('davylab-logo-live-generated',event=>{
  strategyView(event.detail?.strategy,event.detail?.provider,event.detail?.model);
});
const inspector=document.createElement('section');
inspector.className='logo-inspector';
inspector.id='logoInspector';
inspector.innerHTML='<h3>生产可用性检查 · 同源 SVG 实时预览</h3><p class="muted" id="svgInspectorStatus">先生成或导入真实 SVG。验证结构不代表原创、商标或字体审核通过。</p><div class="logo-mini-previews" id="logoMiniPreviews"></div>';
production.append(inspector);
let previewUrl;
function inspect(){
  const svg=byId('svgEditor').value.trim();
  const preview=byId('logoMiniPreviews');
  preview.replaceChildren();
  if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}
  if(!svg){byId('svgInspectorStatus').textContent='尚无 SVG · 请先生成或导入';return}
  const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg'){byId('svgInspectorStatus').textContent='SVG 结构错误，不能进行导出';return}
  const shapeCount=doc.querySelectorAll('path,rect,circle,polygon,ellipse,polyline,line').length;
  const editableText=doc.querySelectorAll('text').length;
  byId('svgInspectorStatus').textContent=shapeCount+' 个矢量图形元素 · '+editableText+' 组可编辑文字 · '+new TextEncoder().encode(svg).length+' 字节 · 24px 可读性仍需人工确认';
  previewUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  for(const [label,background,size] of [['大尺寸 / 白','#ffffff',195],['深底','#101820',195],['32px / 识别','#ffffff',32],['24px / 识别','#ffffff',24]]){
    const card=document.createElement('div');card.className='logo-inspector-card';card.style.background=background;
    const img=document.createElement('img');img.src=previewUrl;img.alt=label+' Logo 同源渲染';img.width=size;img.style.width=size+'px';img.style.maxWidth='100%';
    const note=document.createElement('small');note.textContent=label;note.style.color=background==='#101820'?'#e2e9ee':'#435065';
    card.append(img,note);preview.append(card);
  }
}
byId('svgEditor').addEventListener('input',inspect);
for(const id of ['aiGenerate','aiRefine','applySvg','applyVisual','restoreAI','editImported'])byId(id)?.addEventListener('click',()=>setTimeout(inspect,200));
byId('aiResults').addEventListener('click',()=>setTimeout(inspect,60));
document.addEventListener('davylab-logo-live-generated',()=>setTimeout(inspect,60));
inspect();
