/* DAVYLAB DesignOS 3.0 — dependency-free, browser-local productive design workspace. */
const boot = JSON.parse(document.querySelector('#bootstrap').textContent);
const profiles = Array.isArray(boot.profiles) ? boot.profiles : [];
const registry = Array.isArray(boot.resources) ? boot.resources : [];
const selectable = profiles.filter(p => !p.protected && p.status !== 'deprecated');
const byId = id => profiles.find(p => p.id === id) || selectable[0];
const validResourceIds = new Set(registry.map(r => r.id));
const STORAGE = 'davylab-designos-v3:workspace';
const SETTINGS = 'davylab-designos-v3:preferences';
const viewNames = {home:'总览',studio:'设计台',components:'组件',skills:'资源能力',archive:'作品档案',settings:'设置'};
const $ = selector => document.querySelector(selector);
const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const dateText = value => {try {return new Date(value).toLocaleDateString('zh-CN',{month:'short',day:'numeric'});}catch{return '—';}};
const randomId = () => 'd-' + (globalThis.crypto?.randomUUID?.() || String(Date.now())+'-'+Math.random().toString(36).slice(2));
const starter = {
  name:'未命名设计',goal:'',profileId:selectable[0]?.id||'balanced-saas',
  accent:'#557761',canvas:'#f7f7f3',ink:'#1e2922',radius:16,density:15,device:'desktop',skills:[]
};
const loadJson = (key,fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch {return fallback;}};
const validHex = value => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
const normalize = raw => {
  if(!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if(typeof raw.id !== 'string' || raw.id.length > 150 || !/^[a-zA-Z0-9-]+$/.test(raw.id))return null;
  const p = {
    id:raw.id,
    name:String(raw.name||'未命名设计').slice(0,70),
    goal:String(raw.goal||'').slice(0,900),
    profileId:selectable.some(x=>x.id===raw.profileId)?raw.profileId:starter.profileId,
    accent:validHex(raw.accent)?raw.accent:starter.accent,
    canvas:validHex(raw.canvas)?raw.canvas:starter.canvas,
    ink:validHex(raw.ink)?raw.ink:starter.ink,
    radius:Number.isFinite(raw.radius)?Math.max(2,Math.min(32,raw.radius)):16,
    density:Number.isFinite(raw.density)?Math.max(8,Math.min(28,raw.density)):15,
    device:raw.device==='phone'?'phone':'desktop',
    skills:Array.isArray(raw.skills)?raw.skills.filter(id=>validResourceIds.has(id)).slice(0,25):[],
    createdAt:Number.isFinite(Date.parse(raw.createdAt))?raw.createdAt:new Date().toISOString(),
    updatedAt:Number.isFinite(Date.parse(raw.updatedAt))?raw.updatedAt:new Date().toISOString()
  };
  return p;
};
const stored = loadJson(STORAGE,{});
const state = {
  projects:Array.isArray(stored.projects)?stored.projects.map(normalize).filter(Boolean).slice(0,50):[],
  snapshots:Array.isArray(stored.snapshots)?stored.snapshots.filter(x=>x&&typeof x==='object'&&x.project).slice(0,35):[],
  currentId:typeof stored.currentId==='string'?stored.currentId:null,
  view:Object.hasOwn(viewNames,location.hash.slice(1))?location.hash.slice(1):'home',
  mode:'preview',
  filter:'',
  skillType:'all',
  skillId:registry[0]?.id||null,
  componentCategory:'all',
  preferences:loadJson(SETTINGS,{theme:'light',reducedMotion:false,agent:'workbuddy'})
};
let toastTimeout;
function toast(message){
  const node=$('#toast');node.textContent=message;node.classList.add('is-visible');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>node.classList.remove('is-visible'),2800);
}
function persist(){
  try {localStorage.setItem(STORAGE,JSON.stringify({schemaVersion:1,projects:state.projects,snapshots:state.snapshots,currentId:state.currentId}));}
  catch {toast('本地存储不可用，请先导出备份');}
}
function persistSettings(){
  try {localStorage.setItem(SETTINGS,JSON.stringify(state.preferences));}catch{}
  document.body.dataset.appTheme=state.preferences.theme==='dark'?'dark':'light';
  document.body.dataset.reducedMotion=String(Boolean(state.preferences.reducedMotion));
}
persistSettings();
function currentProject(){return state.projects.find(p=>p.id===state.currentId)||null;}
function makeProject(name,goal,profileId){
  const now=new Date().toISOString();
  const p={...starter,id:randomId(),name:(name||'未命名设计').trim().slice(0,70),goal:(goal||'').trim().slice(0,900),profileId:profileId||starter.profileId,createdAt:now,updatedAt:now,skills:[]};
  const selected=byId(p.profileId);
  if(selected?.palette?.[2] && validHex(selected.palette[2]))p.accent=selected.palette[2];
  if(selected?.palette?.[0] && validHex(selected.palette[0]))p.canvas=selected.palette[0];
  if(selected?.palette?.[1] && validHex(selected.palette[1]))p.ink=selected.palette[1];
  state.projects.unshift(p);state.projects=state.projects.slice(0,50);state.currentId=p.id;persist();
  return p;
}
function ensureProject(){return currentProject()||makeProject('我的新设计','',starter.profileId);}
function updateProject(field,value){
  const p=ensureProject();
  if(['name','goal'].includes(field)){p[field]=String(value).slice(0,field==='name'?70:900);}
  else if(['accent','canvas','ink'].includes(field)&&validHex(value)){p[field]=value;}
  else if(field==='radius'||field==='density'){const n=Number(value);if(Number.isFinite(n))p[field]=Math.max(field==='radius'?2:8,Math.min(field==='radius'?32:28,n));}
  else return;
  p.updatedAt=new Date().toISOString();persist();
}
function go(view){
  if(!Object.hasOwn(viewNames,view))return;
  state.view=view;state.filter='';state.skillType='all';state.componentCategory='all';
  location.hash=view==='home'?'':view;
  document.querySelectorAll('[data-nav]').forEach(b=>{
    const active=b.dataset.nav===view;b.classList.toggle('is-active',active);
    if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  $('#breadcrumbCurrent').textContent=viewNames[view];
  render();window.scrollTo({top:0,behavior:'instant'});
}
function sectionHeader(title,description,button=''){
  return '<div class="page-heading"><div><span class="section-eyebrow">DAVYLAB / '+safe(viewNames[state.view].toUpperCase())+'</span><h1>'+safe(title)+'</h1><p>'+safe(description)+'</p></div>'+button+'</div>';
}
function empty(title,text){return '<div class="empty-state"><strong>'+safe(title)+'</strong>'+safe(text)+'</div>';}
function conceptTile(kind,title,subtitle,profileId){
  const art=kind==='editorial'
    ? '<div class="concept-sheet"><small>THE QUIET EDITION · 01</small><h3>Space to<br>think.</h3><span></span><i></i></div>'
    : kind==='system'
    ? '<div class="concept-sheet"><h3>Insights / Overview</h3><div class="mini-plot"></div><div class="plot-bars"><i></i><i></i><i></i></div></div>'
    : '<div class="concept-sheet"><small>FOCUS / PRODUCT SYSTEM</small><h3>A clearer<br>way forward.</h3><i></i></div>';
  return '<button type="button" class="concept-card" data-action="start-profile" data-profile="'+safe(profileId)+'"><div class="concept-art '+kind+'">'+art+'</div><div class="concept-meta"><div><h3>'+safe(title)+'</h3><p>'+safe(subtitle)+'</p></div><span class="concept-arrow">↗</span></div></button>';
}
function renderHome(){
  const recent=state.projects.slice(0,3).map(p=>
    '<div class="project-row"><div class="project-main"><span class="project-tag">D.</span><div><strong>'+safe(p.name)+'</strong><small>'+safe(byId(p.profileId)?.name||'Design direction')+' · '+dateText(p.updatedAt)+'</small></div></div><button class="button button-plain button-small" data-action="open-project" data-id="'+safe(p.id)+'">继续设计 ↗</button></div>'
  ).join('');
  return '<section class="hero-panel"><div class="hero-copy"><span class="section-eyebrow">THE DESIGN OPERATING SYSTEM</span><h1 class="hero-title">好的设计，<br>从<span style="color:#6c8a73">清晰</span>开始。</h1><p class="hero-description">不止于灵感，也不止于漂亮的界面。在这里探索风格、组合能力、实时预览，把每一种想法沉淀为可交付的设计资产。</p><div class="hero-buttons"><button class="button button-dark" data-action="new">开始一个设计 <span>↗</span></button><button class="button button-subtle" data-action="explore">探索设计方向</button></div></div><div class="hero-art" aria-label="精致设计界面示意图"><div class="art-window"><div class="art-sidebar"><div class="art-logo">atelier.</div><div class="art-side-line"></div><div class="art-side-line"></div><div class="art-side-line"></div></div><div class="art-body"><div class="art-overline">EDITORIAL SYSTEM / 2026</div><div class="art-headline">Form &<br>feeling.</div><div class="art-rule"></div><div class="art-shapes"><div class="art-shape-large"></div><div class="art-shape-small"></div></div></div></div><div class="art-floating"><strong>VISUAL LANGUAGE</strong><div class="art-dots"><i></i><i></i><i></i><i></i></div></div><span class="art-annotation">DESIGNED WITH INTENT</span></div></section>'+
  '<div id="concepts" class="section-heading"><div><h2>从优秀的视觉方向开始</h2><p>选择一个起点，在设计台里继续塑造它。</p></div><button class="text-link" data-action="open-studio">查看设计台 ↗</button></div>'+
  '<div class="curated-grid">'+conceptTile('editorial','Editorial','有温度的内容与品牌表达','warm-editorial')+conceptTile('system','Systematic','清晰、可靠的信息与数据体验','analytics-dashboard')+conceptTile('product','Product','简洁克制的数字产品语言','balanced-saas')+'</div>'+
  '<div class="section-heading"><div><h2>继续你的创作</h2><p>作品在当前浏览器内自动保存，支持快照和文件备份。</p></div><button class="text-link" data-action="archive">全部项目 ↗</button></div>'+
  '<div class="recent-grid"><section class="panel-card"><h3>最近项目</h3>'+(recent||empty('还没有设计项目','从上方任选一款视觉方向，开始你的第一个作品。'))+'</section><section class="panel-card"><h3>你的设计工具箱</h3><div class="info-list"><div><b>01</b><span>实时画布：调整配色、布局密度和移动端视图</span></div><div><b>02</b><span>能力调用：从 '+registry.length+' 项公开设计资源中找到合适的方法</span></div><div><b>03</b><span>成果交付：输出 JSON、CSS Tokens 与 Agent 指令</span></div></div><button class="button button-plain button-small" style="margin-top:20px" data-action="skills">探索资源能力 ↗</button></section></div>';
}
function mockCanvas(p){
  const visualName=safe(p.name.trim()||'你的产品');
  return '<div id="mockApp" class="mock-app" style="--sample-accent:'+safe(p.accent)+';--sample-paper:'+safe(p.canvas)+';--sample-ink:'+safe(p.ink)+';--sample-radius:'+Number(p.radius)+'px;--sample-gap:'+Number(p.density)+'px"><div class="mock-header"><strong>north.</strong><nav><span>Overview</span><span>Discover</span><span>Journal</span></nav><button type="button" data-action="demo">Get started ↗</button></div><div class="mock-main"><div class="mock-overline">A CONSIDERED DIGITAL EXPERIENCE</div><div class="mock-hero"><div class="mock-hero-copy"><h2 class="mock-headline">Find your<br>next perspective.</h2><p class="mock-copy">为「'+visualName+'」创建的视觉规则示例。改变右侧参数，你将立即看到页面的排版与风格变化。</p><button class="mock-cta" type="button" data-action="demo">探索体验 ↗</button></div><div class="mock-visual"><div class="visual-caption">Design<br>moves us.</div></div></div><div class="mock-stats"><div class="mock-stat"><strong>01</strong><small>Discover what matters</small></div><div class="mock-stat"><strong>02</strong><small>Make meaningful choices</small></div><div class="mock-stat"><strong>03</strong><small>Build with confidence</small></div></div></div></div>';
}
function renderCanvas(){
  const p=currentProject();if(!p)return;
  const frame=$('#canvasPaper');if(!frame)return;
  frame.classList.toggle('is-phone',p.device==='phone');
  frame.innerHTML=mockCanvas(p);
  const deviceStatus=$('#deviceStatus');if(deviceStatus)deviceStatus.textContent=p.device==='phone'?'375px · Phone preview':'Responsive · Desktop preview';
}
function profileButton(profile,p){
  return '<button type="button" class="profile-option '+(profile.id===p.profileId?'is-active':'')+'" data-action="choose-profile" data-profile="'+safe(profile.id)+'"><span><strong>'+safe(profile.name)+'</strong><br><small>'+safe(profile.type||'Design Profile')+'</small></span><span aria-hidden="true">'+(profile.id===p.profileId?'✓':'↗')+'</span></button>';
}
function profileRules(p){
  const profile=byId(p.profileId);
  const rules=profile?.rules||[];
  return '<div style="display:grid;gap:14px;padding:20px;background:white;min-height:430px"><div><span class="section-eyebrow">DESIGN SPECIFICATION</span><h2 style="font-size:21px;line-height:1.4;margin:12px 0 4px">'+safe(profile?.name||'Design Profile')+'</h2><p style="font-size:11px;color:#758078">以下为所选档案的真实规则记录，不代表目标产品已开发完成。</p></div><ul class="rule-list">'+rules.slice(0,7).map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul><div class="preview-caption">来源状态：'+safe(profile?.evidenceStatus||'待复核')+' · '+(profile?.protected?'只读档案':'可用于新项目候选方案')+'</div></div>';
}
function renderStudio(){
  const p=ensureProject();const profile=byId(p.profileId);
  const profileButtons=selectable.map(x=>profileButton(x,p)).join('');
  const colorChoices=['#20364e','#52745d','#b56e47','#527985','#8d765d'].map(hex=>
    '<button class="swatch '+(p.accent.toLowerCase()===hex?'is-active':'')+'" type="button" data-action="color" data-color="'+hex+'" style="background:'+hex+'" aria-label="强调色 '+hex+'"></button>').join('');
  const header=sectionHeader('让灵感成为真实的设计方向','所见即所得的规则预览。所有编辑仅保存在当前浏览器，不会修改其他项目。',
    '<div class="studio-head-actions"><button class="button button-plain" data-action="snapshot">保存快照</button><button class="button button-dark" data-action="export-json">交付设计资产 ↗</button></div>');
  const preview='<section class="canvas-panel"><div class="canvas-bar"><div><b>LIVE CANVAS <span class="badge badge-green">示例预览</span></b><small id="deviceStatus">'+(p.device==='phone'?'375px · Phone preview':'Responsive · Desktop preview')+'</small></div><div class="segmented"><button type="button" data-action="mode" data-mode="preview" class="'+(state.mode==='preview'?'is-active':'')+'">预览</button><button type="button" data-action="mode" data-mode="rules" class="'+(state.mode==='rules'?'is-active':'')+'">规范</button></div><div class="segmented"><button type="button" data-action="device" data-device="desktop" class="'+(p.device==='desktop'?'is-active':'')+'">桌面</button><button type="button" data-action="device" data-device="phone" class="'+(p.device==='phone'?'is-active':'')+'">手机</button></div></div>'+
    (state.mode==='preview'?'<div class="canvas-field"><div id="canvasPaper" class="canvas-paper '+(p.device==='phone'?'is-phone':'')+'">'+mockCanvas(p)+'</div></div>':'<div class="canvas-field">'+profileRules(p)+'</div>')+
    '<div class="canvas-foot"><span>规则驱动的演示页面 · 非目标应用实际截图</span><span>By DAVYLAB</span></div></section>';
  const candidates=registry.filter(r=>r.type==='skill')
    .map(r=>({resource:r,score:skillScore(r,p.goal+' '+p.name)}))
    .sort((a,b)=>b.score-a.score).slice(0,3);
  const skillControls='<section class="inspector-card"><h3>能力组合 <span>04 / SKILLS</span></h3><p class="inspector-note" style="margin:0 0 12px">基于项目意图的本地关键词推荐；勾选后纳入 Agent 交付指令，不会自动运行外部 Skill。</p>'+
    candidates.map(({resource:r,score})=>'<button type="button" class="profile-option '+(p.skills.includes(r.id)?'is-active':'')+'" style="width:100%;margin-bottom:7px" data-action="toggle-skill" data-skill="'+safe(r.id)+'"><span><strong>'+safe(r.name)+'</strong><br><small>'+(score>0?'与项目描述相关':'公开能力资源')+'</small></span><span>'+(p.skills.includes(r.id)?'✓':'+')+'</span></button>').join('')+
    '<p class="inspector-note">已关联 '+p.skills.length+' 项能力 · 仅引用经过登记的公开元数据</p></section>';
  const inspector='<aside class="inspector" aria-label="设计属性面板"><section class="inspector-card"><h3>当前项目 <span>01 / BRIEF</span></h3><label class="control-label" for="projectNameInput">项目名称</label><input class="control-input" data-field="name" id="projectNameInput" maxlength="70" value="'+safe(p.name)+'"><div class="control-group"><label class="control-label" for="projectGoalInput">设计意图</label><textarea class="control-textarea" data-field="goal" id="projectGoalInput" maxlength="900" placeholder="产品目标、受众或使用场景">'+safe(p.goal)+'</textarea></div></section>'+
    '<section class="inspector-card"><h3>设计方向 <span>02 / FOUNDATION</span></h3><div class="profile-select">'+profileButtons+'</div><p class="inspector-note">所有预设来自真实设计档案；受保护的 Dashboard Studio 仅供只读审计。</p></section>'+
    '<section class="inspector-card"><h3>视觉语言 <span>03 / STYLE</span></h3><span class="control-label">强调色</span><div class="swatch-row">'+colorChoices+'<input type="color" class="color-picker" data-field="accent" value="'+safe(p.accent)+'" aria-label="自定义强调色"></div>'+
    '<div class="control-group"><label class="control-label" for="canvasColor">画布底色</label><input id="canvasColor" class="color-picker" type="color" data-field="canvas" value="'+safe(p.canvas)+'"></div>'+
    '<div class="control-group"><label class="control-label" for="radiusRange">圆角 <span class="range-value">'+p.radius+'px</span></label><input id="radiusRange" class="control-range" type="range" data-field="radius" min="2" max="32" step="1" value="'+p.radius+'"></div>'+
    '<div class="control-group"><label class="control-label" for="densityRange">间距 <span class="range-value">'+p.density+'px</span></label><input id="densityRange" class="control-range" type="range" data-field="density" min="8" max="28" step="1" value="'+p.density+'"></div></section>'+
    skillControls+
    '<section class="inspector-card inspector-actions"><h3>下一步 <span>05 / DELIVER</span></h3><button class="button button-dark" data-action="export-json">导出设计方案 JSON ↗</button><button class="button button-plain" data-action="export-css">导出 CSS Tokens</button><button class="button button-plain" data-action="export-agent">生成 Agent 实施指令</button><button class="button button-ghost" data-action="skills">为项目添加 Skill</button><p class="inspector-note">导出的是设计数据与实施指令，不代表 Agent 已执行、代码已上线或设计已审核。</p></section></aside>';
  return header+'<div class="studio-layout">'+preview+inspector+'</div>';
}
function renderComponents(){
  const demos=[
    ['Buttons','交互','明确主次层级和触达状态','<button type="button" data-action="demo">Primary action ↗</button><button type="button" data-action="demo" style="background:#e3e9e1;color:#345940">Secondary</button>'],
    ['Text inputs','输入','聚焦、禁用与输入反馈','<input aria-label="组件输入示例" placeholder="Tell us your idea...">'],
    ['Tags & badges','状态','轻量标签和清晰的语义','<span class="chip">● Reviewed</span><span class="chip" style="background:#f2e8dc;color:#946c4b">Draft</span>'],
    ['Data cards','信息','清晰的数据密度','<div class="demo-mini"><b style="font-size:19px">+24.8%</b><br><span style="color:#7e897f">Performance overview</span></div>'],
    ['Layouts','结构','响应式分组与排版','<div class="demo-mini" style="width:125px;height:72px;display:grid;gap:5px;grid-template-columns:1fr 1fr"><i style="background:#b4c9b7;border-radius:4px"></i><i style="background:#d9e1d7;border-radius:4px"></i><i style="background:#d9e1d7;border-radius:4px"></i><i style="background:#b4c9b7;border-radius:4px"></i></div>'],
    ['Charts','数据','一致的可视化刻度','<div class="demo-bars"><i style="height:45px"></i><i style="height:68px"></i><i style="height:37px"></i><i style="height:74px"></i></div>'],
    ['Cards','容器','克制边框与层级','<div class="demo-mini" style="width:170px"><b>Product Overview</b><br><span style="color:#909c91">A well-framed section</span></div>'],
    ['Navigation','导航','一致且易于发现的路径','<div class="demo-mini" style="display:flex;gap:12px"><b>Overview</b><span>Library</span><span>Settings</span></div>']
  ];
  const filtered=state.componentCategory==='all'?demos:demos.filter(x=>x[1]===state.componentCategory);
  return sectionHeader('组件不是装饰，是体验的基础。','统一交互规则与视觉 Token。这里展示的是可交互的基础示例，不是已接入生产的 Astryx 组件。')+
    '<div class="toolbar"><div class="filter-row">'+['all','交互','输入','状态','信息','结构','数据','容器','导航'].map(x=>'<button class="filter-chip '+(state.componentCategory===x?'is-active':'')+'" data-action="component-category" data-category="'+safe(x)+'">'+(x==='all'?'全部':x)+'</button>').join('')+'</div><a class="text-link" href="https://github.com/meta/astryx" target="_blank" rel="noopener noreferrer">了解 Astryx ↗</a></div>'+
    '<div class="component-grid">'+filtered.map(x=>'<article class="component-card"><div class="component-demo">'+x[3]+'</div><div class="component-caption"><h3>'+safe(x[0])+'</h3><p>'+safe(x[2])+'</p></div></article>').join('')+'</div>'+
    '<div class="notice-panel" style="margin-top:18px">Astryx 的 React 组件已在隔离实验中验证基础交互；本页使用轻量演示组件，后续扩展遵循真实组件 API、无障碍检查及移动端回归。</div>';
}
function skillScore(resource,query){
  if(!query)return 0;
  const words=query.toLowerCase().split(/[\s,，。、;；:：/]+/).filter(x=>x.length>=2).slice(0,25);
  const content=[resource.name,resource.summary,...(resource.tags||[]),...(resource.whenToUse||[])].join(' ').toLowerCase();
  return words.reduce((sum,w)=>sum+(content.includes(w)?1:0),0);
}
function filteredSkills(){
  const q=state.filter.trim().toLowerCase();
  return registry.filter(r=>(state.skillType==='all'||r.type===state.skillType)&&(!q||[r.name,r.englishName,r.summary,r.categoryLabel,...(r.tags||[])].join(' ').toLowerCase().includes(q)))
    .sort((a,b)=>skillScore(b,currentProject()?.goal||'')-skillScore(a,currentProject()?.goal||''));
}
function renderSkillDetail(){
  const el=$('#resourceDetail');if(!el)return;
  const r=registry.find(x=>x.id===state.skillId);if(!r){el.innerHTML=empty('请选择资源','点击左侧条目查看能力与使用条件。');return;}
  const p=currentProject(),added=p?.skills?.includes(r.id);
  el.innerHTML='<span class="section-eyebrow">RESOURCE DETAILS</span><h3>'+safe(r.name)+'</h3><div class="detail-meta"><span>'+safe(r.categoryLabel||r.category)+'</span><span>'+safe(r.type)+'</span><span>'+safe(r.status||'reference')+'</span></div><p>'+safe(r.summary)+'</p>'+
    '<div class="detail-subtitle">适合什么场景</div><ul>'+(r.whenToUse||[]).slice(0,5).map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul>'+
    '<div class="detail-subtitle">使用边界</div><ul>'+(r.guardrails||[]).slice(0,4).map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul>'+
    '<div class="detail-note">仅关联能力元数据与规则引用，不在此自动执行外部 Skill。私有资源仍需要通过受保护的资源中心访问。</div>'+
    '<button class="button button-dark" data-action="toggle-skill" data-skill="'+safe(r.id)+'">'+(added?'从当前项目移除':'加入当前项目')+'</button><a href="./resources/" class="button button-plain" style="display:flex">打开完整资源中心 ↗</a>';
}
function renderSkills(){
  const filtered=filteredSkills();
  if(filtered.length && !filtered.some(x=>x.id===state.skillId))state.skillId=filtered[0].id;
  return sectionHeader('把合适的能力，放到对的项目里。','统一查找、筛选并关联公开 Skill、设计引擎及视觉资产；资源内容与执行权限保持原有边界。',
    '<a href="./resources/" class="button button-plain">打开能力资源库 ↗</a>')+
    '<div class="toolbar"><div class="search-field"><span>⌕</span><input data-search="skills" type="search" placeholder="搜索 Skill、用途或设计方法" value="'+safe(state.filter)+'" aria-label="搜索设计资源"></div><div class="filter-row">'+[['all','全部'],['skill','Skill'],['engine','引擎'],['visual-pack','视觉包'],['profile-library','档案']].map(([value,label])=>'<button class="filter-chip '+(state.skillType===value?'is-active':'')+'" data-action="skill-type" data-type="'+value+'">'+label+'</button>').join('')+'</div></div>'+
    '<div class="resource-grid"><div class="resource-list" id="resourceList">'+(filtered.length?filtered.map(r=>
    '<button type="button" class="resource-item '+(r.id===state.skillId?'is-active':'')+'" data-action="select-skill" data-skill="'+safe(r.id)+'"><span class="resource-icon">'+(r.type==='engine'?'⚙':r.type==='visual-pack'?'◇':'✳')+'</span><span class="resource-info"><strong>'+safe(r.name)+'</strong><p>'+safe(r.summary)+'</p></span><span aria-hidden="true">↗</span></button>'
    ).join(''):empty('没有匹配的资源','换个关键词，或清空筛选条件。'))+'</div><aside class="detail-card" id="resourceDetail"></aside></div>';
}
function renderArchive(){
  const cards=state.projects.map(p=>
    '<article class="archive-card"><div class="archive-top"><span class="badge badge-green">LOCAL PROJECT</span><small>'+dateText(p.updatedAt)+'</small></div><div><h3>'+safe(p.name)+'</h3><p>'+safe(p.goal||'尚未添加设计意图。')+'</p></div><div class="archive-bottom"><small>'+safe(byId(p.profileId)?.name||'Design Profile')+' · '+(p.skills?.length||0)+' Skills</small><div class="project-actions"><button class="button button-plain button-small" data-action="duplicate" data-id="'+safe(p.id)+'">复制</button><button class="button button-dark button-small" data-action="open-project" data-id="'+safe(p.id)+'">打开 ↗</button></div></div></article>'
  ).join('');
  const snaps=state.snapshots.slice(0,10).map(s=>
    '<div class="project-row"><div><strong>'+safe(s.name||s.project.name)+'</strong><small>'+dateText(s.createdAt)+' · 设计快照</small></div><div class="project-actions"><button class="button button-plain button-small" data-action="restore-snapshot" data-id="'+safe(s.id)+'">恢复副本</button><button class="button button-ghost button-small" data-action="delete-snapshot" data-id="'+safe(s.id)+'">删除</button></div></div>'
  ).join('');
  return sectionHeader('每一次思考，都值得留档。','项目、关键设计快照和可导出文件保存在当前浏览器；需要跨设备时请使用备份文件。',
    '<button class="button button-dark" data-action="new">新建项目 +</button>')+
    '<div class="archive-grid">'+(cards||'<div style="grid-column:1/-1">'+empty('还没有归档的设计','开始创作后，项目将在这里自动出现。')+'</div>')+'</div>'+
    '<div class="section-heading"><div><h2>设计快照</h2><p>主动保存关键节点，以便回溯或从历史版本开始新方案。</p></div><button class="text-link" data-action="export-workspace">导出全部备份 ↗</button></div>'+
    '<section class="panel-card">'+(snaps||empty('暂时没有快照','进入设计台，点击「保存快照」记录关键版本。'))+'</section>';
}
function renderSettings(){
  const t=state.preferences;
  return sectionHeader('把复杂留给系统，把专注留给你。','集中管理视觉偏好、本地数据及 Agent 输出方式。所有设置都可撤销。')+
    '<div class="settings-grid"><section class="settings-section"><span class="section-eyebrow">01 / APPEARANCE</span><h3 style="margin-top:14px">外观与体验</h3><p>偏好只影响工作台，不会擅自修改你的项目视觉规则。</p><div class="settings-row"><span>界面外观</span><div class="segmented"><button data-action="theme" data-theme="light" class="'+(t.theme!=='dark'?'is-active':'')+'">浅色</button><button data-action="theme" data-theme="dark" class="'+(t.theme==='dark'?'is-active':'')+'">深色</button></div></div><div class="settings-row"><label><input data-setting="reducedMotion" type="checkbox" '+(t.reducedMotion?'checked':'')+'> 减少动态效果</label><span class="toggle-text">尊重系统设置</span></div><div class="settings-row"><span>Agent 指令适配</span><select class="control-select" style="max-width:150px" data-setting="agent"><option value="workbuddy" '+(t.agent==='workbuddy'?'selected':'')+'>WorkBuddy</option><option value="codex" '+(t.agent==='codex'?'selected':'')+'>Codex</option><option value="cursor" '+(t.agent==='cursor'?'selected':'')+'>Cursor</option><option value="claude" '+(t.agent==='claude'?'selected':'')+'>Claude Code</option></select></div></section>'+
    '<section class="settings-section"><span class="section-eyebrow">02 / DATA & PRIVACY</span><h3 style="margin-top:14px">资料与安全</h3><p>浏览器内保存 '+state.projects.length+' 个项目和 '+state.snapshots.length+' 个快照。目前未启用账户同步，导出是跨设备迁移的可靠路径。</p><div class="setting-actions"><button class="button button-dark" data-action="export-workspace">导出工作区备份</button><button class="button button-plain" data-action="import-workspace">导入备份</button><input id="workspaceImportFile" type="file" accept=".json,application/json" hidden></div><div class="settings-row" style="margin-top:15px"><span>重置所有本地设计数据</span><button class="button button-ghost button-small" data-action="reset">清空数据</button></div></section>'+
    '<section class="settings-section"><span class="section-eyebrow">03 / CAPABILITIES</span><h3 style="margin-top:14px">集成能力</h3><p>已关联 '+registry.length+' 条公开资源元数据，包含设计 Skill、引擎与视觉包。生产敏感资源和访问策略由受保护的资源中心管理。</p><a href="./resources/" class="button button-plain">完整 Skill 资源中心 ↗</a><a href="./classic/" class="button button-ghost" style="margin-left:8px">经典工作台 ↗</a></section>'+
    '<section class="settings-section"><span class="section-eyebrow">04 / ABOUT</span><h3 style="margin-top:14px">DesignOS 3.0</h3><p>以设计资产交付为导向的本地优先工作台。真实工程实施须结合目标仓库与组件兼容性完成验收。</p><div class="notice-panel">Design with intent. Build with evidence.<br>By DAVYLAB · 把想法，做成能用的工具。</div></section></div>';
}
function render(){
  const v=$('#view');
  v.innerHTML=state.view==='home'?renderHome():
    state.view==='studio'?renderStudio():
    state.view==='components'?renderComponents():
    state.view==='skills'?renderSkills():
    state.view==='archive'?renderArchive():renderSettings();
  if(state.view==='skills')renderSkillDetail();
}
function blobDownload(filename,body,type){
  const link=document.createElement('a'),url=URL.createObjectURL(new Blob([body],{type}));
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('已生成文件：'+filename);
}
function projectOutput(){
  const p=ensureProject(),profile=byId(p.profileId);
  return {
    schemaVersion:'3.0.0',product:'DAVYLAB DesignOS',exportedAt:new Date().toISOString(),
    project:{...p,skills:p.skills.filter(x=>validResourceIds.has(x))},
    design:{selectedProfile:profile?{profileId:profile.profileId,name:profile.name,version:profile.version,evidenceStatus:profile.evidenceStatus,rules:profile.rules,protected:Boolean(profile.protected)}:null,
      tokens:{accent:p.accent,canvas:p.canvas,text:p.ink,radiusPx:p.radius,spacingPx:p.density}},
    skillReferences:p.skills.map(id=>registry.find(r=>r.id===id)).filter(Boolean).map(r=>({id:r.id,name:r.name,source:r.source,guardrails:r.guardrails})),
    delivery:{agentExecutionPerformed:false,productionDeployed:false,previewKind:'illustrative-rule-driven'}
  };
}
function exportProject(type){
  const pkg=projectOutput(),name='davylab-'+pkg.project.id;
  if(type==='json')blobDownload(name+'-design.json',JSON.stringify(pkg,null,2)+'\n','application/json');
  else if(type==='css'){
    const t=pkg.design.tokens;
    const css='/* DAVYLAB DesignOS 3.0 — project tokens */\n:root {\n'+[
      ['--davy-accent',t.accent],['--davy-canvas',t.canvas],['--davy-ink',t.text],
      ['--davy-radius',t.radiusPx+'px'],['--davy-spacing',t.spacingPx+'px']
    ].map(([key,value])=>'  '+key+': '+value+';').join('\n')+'\n}\n';
    blobDownload(name+'-tokens.css',css,'text/css');
  }else{
    const p=pkg.project,profile=pkg.design.selectedProfile;
    const md='# DAVYLAB DesignOS — Agent Implementation Brief\n\n'+
      'Agent: '+state.preferences.agent+'\nProject: '+p.name+'\nGoal: '+(p.goal||'Not specified')+'\n\n'+
      '## Selected design direction\n'+profile.name+' ('+profile.profileId+')\nEvidence status: '+profile.evidenceStatus+'\n\n'+
      '## Visual tokens\n'+JSON.stringify(pkg.design.tokens,null,2)+'\n\n'+
      '## Rules\n'+(profile.rules||[]).map(x=>'- '+x).join('\n')+'\n\n'+
      '## Relevant skill references\n'+(pkg.skillReferences.map(x=>'- '+x.name+' — '+(x.guardrails||[]).join('; ')).join('\n')||'- None')+'\n\n'+
      '## Execution and acceptance\n1. Confirm target repository and component compatibility before coding.\n2. Implement real interactive UI and responsive layouts.\n3. Test mobile widths 375/390/430px, keyboard navigation and contrast.\n4. Run build, runtime checks and actual user-flow tests.\n5. Deploy only after approval and report verifiable URL and commit.\n\n'+
      'Note: This brief does not imply an Agent was invoked, design implemented, or deployed.\n';
    blobDownload(name+'-agent-brief.md',md,'text/markdown');
  }
}
function snapshot(){
  const p=ensureProject();
  const snap={id:randomId(),name:p.name+' · '+new Date().toLocaleString('zh-CN'),createdAt:new Date().toISOString(),project:{...p,skills:[...p.skills]}};
  state.snapshots.unshift(snap);state.snapshots=state.snapshots.slice(0,35);persist();toast('设计快照已保存');
}
function exportWorkspace(){
  const payload={schema:'davylab-designos-workspace',version:3,exportedAt:new Date().toISOString(),projects:state.projects,snapshots:state.snapshots};
  blobDownload('davylab-designos-workspace.json',JSON.stringify(payload,null,2)+'\n','application/json');
}
function importWorkspace(file){
  if(!file || file.size>1024*1024*2){toast('备份文件无效或超过 2MB');return;}
  file.text().then(text=>{
    const j=JSON.parse(text);
    if(j.schema!=='davylab-designos-workspace'||j.version!==3||!Array.isArray(j.projects))throw Error('格式不受支持');
    const imported=j.projects.map(normalize).filter(Boolean);
    if(imported.length!==j.projects.length || imported.length>50)throw Error('项目数据不完整');
    if(!confirm('导入 '+imported.length+' 个项目？将替换当前浏览器工作区，请先导出现有备份。'))return;
    state.projects=imported;
    state.snapshots=Array.isArray(j.snapshots)?j.snapshots.filter(s=>s&&s.project&&normalize(s.project)).slice(0,35):[];
    state.currentId=state.projects[0]?.id||null;persist();toast('工作区备份已导入');go('archive');
  }).catch(()=>toast('备份导入失败，请检查格式'));
}
function openNewDialog(){
  const dialog=$('#projectDialog');if(!dialog.open)dialog.showModal();
  $('#newProjectName').focus();
}
function bindApp(){
  document.querySelectorAll('button[data-nav]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.nav)));
  $('#topNew').addEventListener('click',openNewDialog);
  $('#topExport').addEventListener('click',()=>exportProject('json'));
  $('#closeProjectDialog').addEventListener('click',()=>$('#projectDialog').close());
  $('#cancelProjectDialog').addEventListener('click',()=>$('#projectDialog').close());
  $('#projectForm').addEventListener('submit',event=>{
    event.preventDefault();const name=$('#newProjectName').value.trim(),goal=$('#newProjectGoal').value.trim();
    if(!name){$('#newProjectName').focus();return;}
    makeProject(name,goal);$('#projectDialog').close();$('#projectForm').reset();go('studio');toast('项目已创建');
  });
  $('#view').addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action,id=target.dataset.id,profileId=target.dataset.profile;
    switch(action){
      case 'new':openNewDialog();break;
      case 'explore':document.querySelector('#concepts')?.scrollIntoView({behavior:'smooth'});break;
      case 'open-studio':go('studio');break;
      case 'skills':go('skills');break;
      case 'archive':go('archive');break;
      case 'start-profile':makeProject('新设计方案','',selectable.some(x=>x.id===profileId)?profileId:starter.profileId);go('studio');break;
      case 'choose-profile':{
        const p=ensureProject(),profile=byId(profileId);
        if(profile.protected){toast('此档案为只读审计，不能用于覆盖现有项目');break;}
        p.profileId=profile.id;
        if(validHex(profile.palette?.[2]))p.accent=profile.palette[2];
        if(validHex(profile.palette?.[0]))p.canvas=profile.palette[0];
        if(validHex(profile.palette?.[1]))p.ink=profile.palette[1];
        p.updatedAt=new Date().toISOString();persist();render();break;
      }
      case 'mode':state.mode=target.dataset.mode==='rules'?'rules':'preview';render();break;
      case 'device':ensureProject().device=target.dataset.device==='phone'?'phone':'desktop';persist();render();break;
      case 'color':updateProject('accent',target.dataset.color);render();break;
      case 'snapshot':snapshot();break;
      case 'export-json':exportProject('json');break;
      case 'export-css':exportProject('css');break;
      case 'export-agent':exportProject('agent');break;
      case 'demo':toast('这是交互式组件演示，非已实现的业务流程');break;
      case 'component-category':state.componentCategory=target.dataset.category;render();break;
      case 'skill-type':state.skillType=target.dataset.type;render();break;
      case 'select-skill':state.skillId=target.dataset.skill;renderSkillDetail();document.querySelectorAll('.resource-item').forEach(x=>x.classList.toggle('is-active',x.dataset.skill===state.skillId));break;
      case 'toggle-skill':{
        const p=ensureProject(),skill=target.dataset.skill;if(!validResourceIds.has(skill))break;
        if(p.skills.includes(skill))p.skills=p.skills.filter(x=>x!==skill);else p.skills.push(skill);
        p.updatedAt=new Date().toISOString();persist();if(state.view==='skills')renderSkillDetail();else render();toast('项目能力清单已更新');break;
      }
      case 'open-project':{if(state.projects.some(x=>x.id===id)){state.currentId=id;persist();go('studio');}break;}
      case 'duplicate':{
        const original=state.projects.find(p=>p.id===id);if(!original)break;
        const p=makeProject(original.name+' · 副本',original.goal,original.profileId);
        Object.assign(p,{accent:original.accent,canvas:original.canvas,ink:original.ink,radius:original.radius,density:original.density,skills:[...original.skills]});
        persist();go('studio');break;
      }
      case 'restore-snapshot':{
        const snap=state.snapshots.find(s=>s.id===id);if(!snap)return;
        const original=normalize(snap.project);if(!original)return;
        const p=makeProject(original.name+' · 恢复版',original.goal,original.profileId);
        Object.assign(p,{accent:original.accent,canvas:original.canvas,ink:original.ink,radius:original.radius,density:original.density,skills:[...original.skills]});
        persist();go('studio');break;
      }
      case 'delete-snapshot':
        if(confirm('删除此快照？删除后无法恢复。')){state.snapshots=state.snapshots.filter(s=>s.id!==id);persist();render();}
        break;
      case 'export-workspace':exportWorkspace();break;
      case 'import-workspace':$('#workspaceImportFile')?.click();break;
      case 'reset':
        if(confirm('清空全部本地项目和快照？此操作不可撤销，请先导出备份。')){state.projects=[];state.snapshots=[];state.currentId=null;persist();go('home');toast('本地数据已清空');}
        break;
      case 'theme':state.preferences.theme=target.dataset.theme==='dark'?'dark':'light';persistSettings();render();break;
    }
  });
  $('#view').addEventListener('input',event=>{
    const field=event.target.dataset.field;
    if(field){
      updateProject(field,event.target.value);
      if(['radius','density'].includes(field)){
        const label=event.target.closest('.control-group')?.querySelector('.range-value');
        if(label)label.textContent=event.target.value+'px';
      }
      if(field!=='name'&&field!=='goal')renderCanvas();
      if(field==='name')$('#mockApp .mock-copy')?.setAttribute('data-dirty','true');
    }
    if(event.target.dataset.search==='skills'){
      state.filter=event.target.value;
      const caret=event.target.selectionStart;
      render();
      const input=$('[data-search="skills"]');if(input){input.focus();input.setSelectionRange(caret,caret);}
    }
  });
  $('#view').addEventListener('change',event=>{
    if(event.target.dataset.field==='goal'&&state.view==='studio')render();

    const setting=event.target.dataset.setting;
    if(setting==='reducedMotion'){state.preferences.reducedMotion=event.target.checked;persistSettings();}
    if(setting==='agent'){state.preferences.agent=event.target.value;persistSettings();}
    if(event.target.id==='workspaceImportFile'){importWorkspace(event.target.files?.[0]);event.target.value='';}
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){
      event.preventDefault();if(state.view==='studio')snapshot();else exportWorkspace();
    }
  });
}
bindApp();
go(state.view);
