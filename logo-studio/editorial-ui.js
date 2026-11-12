/* Logo Studio presentation controller: preserves existing form, generation, QA and export IDs.
   Motion presets are local visual presets; no false claim of Motion Lab API execution. */
const $ = id => document.getElementById(id);
const main=document.querySelector('main');
const oldHeader=document.querySelector('header');
const panels=[...main.querySelectorAll(':scope > section')];
const [briefPanel,productionPanel,offlinePanel,agentPanel,qaPanel,importPanel]=panels;
briefPanel.classList.add('creator-panel');
productionPanel.classList.add('production-panel');
agentPanel.classList.add('delivery-panel');
qaPanel.classList.add('qa-panel');
importPanel.classList.add('import-panel');
const intro=[...main.children].filter(el=>el.tagName==='P'||el.tagName==='H1').slice(0,3);
const make=(tag,cls,html)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(html!==undefined)el.innerHTML=html;return el};
oldHeader.innerHTML='<a class="header-brand" href="../">◈ DAVYLAB <strong>DesignOS</strong></a><nav class="header-nav" aria-label="主导航"><a href="../">DesignOS</a><a href="./" class="current" aria-current="page">Logo Studio</a><a href="#motion-lab">Motion Lab</a><a href="#delivery">Agent / Export</a><a href="#quality">QA</a></nav><div class="header-tools"><button type="button" class="theme-switch" id="themeSwitch" aria-label="切换浅色和深色主题">◐ 深色</button></div>';
const hero=make('div','hero-editorial hero-showcase',`<div class="hero-copy hero-intro"><div class="eyebrow">DAVYLAB / DESIGNOS / BRAND IDENTITY</div><h1>Logo <em>Studio.</em></h1><div class="hero-rule"></div><p>Identity. Motion. Form.</p><span class="hero-subnote">标志设计 · 动态预览 · 品牌系统</span><div class="hero-actions"><a class="hero-start" href="#workspace">开始设计 <span aria-hidden="true">↗</span></a><button type="button" id="heroExplore" class="hero-secondary">探索动态展示 <span aria-hidden="true">↗</span></button></div><div class="hero-counter"><span>01 / 03</span><span>IDENTITY IN MOTION</span></div></div><div class="hero-cover hero-particle-stage" aria-label="DAVYLAB Logo 动态粒子展示"><canvas id="heroParticles" aria-hidden="true"></canvas><div class="hero-ambient" aria-hidden="true"></div><svg class="hero-identity" viewBox="0 0 560 370" role="img" aria-label="DAVYLAB 品牌标志动态概念演示"><defs><linearGradient id="heroMarkGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9EE8FF"/><stop offset=".35" stop-color="#347DFF"/><stop offset=".72" stop-color="#9074EC"/><stop offset="1" stop-color="#EF99C7"/></linearGradient><filter id="heroMarkShadow" x="-35%" y="-35%" width="170%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="12" flood-color="#4A73C7" flood-opacity=".16"/></filter></defs><g transform="translate(183 48)" filter="url(#heroMarkShadow)"><path d="M21 16h91c68 0 112 40 112 102s-44 102-112 102H21v-38h89c42 0 68-24 68-64s-26-64-68-64H21z" fill="url(#heroMarkGradient)"/><path d="M21 54v128h48V54z" fill="url(#heroMarkGradient)"/><path d="M92 73q8 24 33 32q-25 8-33 32q-8-24-33-32q25-8 33-32" fill="#F8FBFF" opacity=".93"/></g><text x="280" y="313" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" letter-spacing="8" font-size="24" fill="currentColor">DAVYLAB</text></svg><div class="hero-stage-meta"><span>DESIGN STUDY — 001</span><span>PARTICLE / 60 FPS TARGET</span></div><div class="hero-particle-controls"><label for="heroParticleDensity">粒子 <input id="heroParticleDensity" type="range" min="12" max="100" value="60"></label><label for="heroParticleSpeed">速度 <input id="heroParticleSpeed" type="range" min=".25" max="2" step=".25" value=".75"></label><label for="heroParticleGlow">光感 <input id="heroParticleGlow" type="range" min="0" max="100" value="40"></label><button type="button" id="heroParticlePlay" aria-pressed="true">Ⅱ 暂停粒子</button></div></div>`);
main.insertBefore(hero,main.firstChild);
hero.querySelector('#heroExplore')?.addEventListener('click',()=>hero.querySelector('.hero-particle-stage')?.scrollIntoView({behavior:'smooth',block:'center'}));
intro.forEach(el=>el.remove());
const studio=make('div','workspace-grid');
studio.id='workspace';
const right=make('div','workspace-right');
studio.append(briefPanel,right);
main.insertBefore(studio,productionPanel);
const stage=make('div','stage-panel',`<div class="stage-head"><div><span class="panel-kicker">THE CREATIVE CANVAS / 02</span><strong style="display:block">Logo Preview Stage</strong><small>以真实 SVG 为基准的设计预览 · 离线草图明确标注</small></div><div class="stage-tools"><button type="button" id="playMotion" aria-pressed="true">Ⅱ 暂停</button><button type="button" id="refreshStage" title="重新播放">↻</button></div></div><div id="stageScreen" class="stage-screen" data-backdrop="gradient"><div class="light-orb"></div><div id="stageContent" class="stage-content" data-motion="float" role="img" aria-label="当前 Logo 预览"></div><span class="stage-demo-caption" id="stageOrigin">OFFLINE VECTOR SKETCH · NOT AI</span><span class="stage-stamp">Motion Preview</span></div><div class="stage-progress"><span></span></div><div class="panel-kicker" style="margin-top:14px">THREE DESIGN DIRECTIONS / 03</div><div class="concept-grid" id="studioConcepts" aria-label="三套概念对比"></div>`);
right.append(stage);
const controls=make('div','editorial-controls',`<section class="motion-panel" id="motion-lab"><div class="panel-kicker">MOTION LAB · LOCAL PRESETS</div><h3>让标志拥有呼吸感。</h3><div class="preset-grid" id="motionPresets"><button type="button" data-preset="float" aria-pressed="true">漂浮 Float</button><button type="button" data-preset="reveal" aria-pressed="false">描绘 Reveal</button><button type="button" data-preset="scale" aria-pressed="false">聚焦 Scale</button><button type="button" data-preset="fade" aria-pressed="false">柔显 Fade</button><button type="button" data-preset="orbit" aria-pressed="false">轨道 Orbit</button><button type="button" data-preset="none" aria-pressed="false">静态 None</button></div><label class="control-line" for="motionDuration">持续时间 <output id="durationValue">3.0s</output></label><input id="motionDuration" type="range" min="1" max="8" step=".25" value="3"><label class="control-line" for="motionIntensity">动效强度 <output id="intensityValue">35%</output></label><input id="motionIntensity" type="range" min="0" max="100" value="35"><div class="actions"><button type="button" id="exportMotionSettings">导出动效参数 JSON</button></div><p class="muted">实时 CSS 动效预览，可导出参数供 Motion Lab / 外部 Agent 使用；不冒充已生成视频。</p></section><section class="visual-panel" id="visual-control"><div class="panel-kicker">VISUAL DIRECTOR / 04</div><h3>将视觉质感握在手中。</h3><label class="control-line">场景背景</label><div class="swatches" id="backdropSwatches"><button type="button" class="swatch" data-backdrop="gradient" style="background:linear-gradient(130deg,#86d5ff,#c884f2,#ffbbd3)" aria-label="iOS 渐变背景" aria-pressed="true"></button><button type="button" class="swatch" data-backdrop="white" style="background:#fff" aria-label="纯白背景" aria-pressed="false"></button><button type="button" class="swatch" data-backdrop="paper" style="background:#f6f0e7" aria-label="温暖纸张背景" aria-pressed="false"></button><button type="button" class="swatch" data-backdrop="black" style="background:#121827" aria-label="深色背景" aria-pressed="false"></button></div><label class="control-line">主题模式</label><div class="actions"><button type="button" id="selectLight">iOS Light</button><button type="button" id="selectDark">Dark Atelier</button></div><label class="control-line">品牌点缀色</label><div class="swatches" id="paletteSwatches"><button type="button" class="swatch" data-color="#286dff" style="background:#286dff" aria-label="科技蓝"></button><button type="button" class="swatch" data-color="#9d62f4" style="background:#9d62f4" aria-label="灵感紫"></button><button type="button" class="swatch" data-color="#ff758b" style="background:#ff758b" aria-label="珊瑚粉"></button><button type="button" class="swatch" data-color="#194d40" style="background:#194d40" aria-label="森林绿"></button></div><p class="muted">调色直接同步矢量编辑器色值；已生成或导入 SVG 后可应用到实际图形。</p></section>`);
right.append(controls);
const about=make('div','panel-kicker','DESIGN YOUR MARK / 01');
briefPanel.prepend(about);
const sectionHeads=briefPanel.querySelector('h2');
if(sectionHeads)sectionHeads.textContent='品牌创意简报';
const offlineWrap=make('div','resource-details');
offlineWrap.innerHTML='<details id="offlineDetails"><summary>探索草图 · 三套离线可编辑概念（非 AI）</summary></details>';
offlineWrap.querySelector('details').append(offlinePanel);
main.insertBefore(offlineWrap,agentPanel);
main.insertBefore(productionPanel,offlineWrap);
const secondary=make('div','secondary-grid');
main.insertBefore(secondary,agentPanel);
secondary.append(agentPanel,importPanel);
agentPanel.id='delivery';
qaPanel.id='quality';
main.append(qaPanel);
const mobile=make('nav','mobile-workflow',`<button type="button" data-target="workspace">创作</button><button type="button" data-target="stageScreen">预览</button><button type="button" data-target="motion-lab">动效</button><button type="button" data-target="delivery">交付</button>`);
mobile.setAttribute('aria-label','Logo Studio 移动导航');
document.body.append(mobile);
mobile.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));
let backdrop='gradient',motion='float',duration=3,intensity=35,paused=false,selectedOffline=0,activeObjectUrl=null;
const setTheme=value=>{document.body.dataset.theme=value;$('themeSwitch').textContent=value==='dark'?'☼ 浅色':'◐ 深色';$('themeSwitch').setAttribute('aria-label',value==='dark'?'切换 iOS 浅色主题':'切换 Dark Atelier 深色主题');try{localStorage.setItem('davylab-logo-theme',value)}catch{}};
setTheme(localStorage.getItem('davylab-logo-theme')==='dark'?'dark':'light');
$('themeSwitch').onclick=()=>setTheme(document.body.dataset.theme==='dark'?'light':'dark');
$('selectLight').onclick=()=>setTheme('light');$('selectDark').onclick=()=>setTheme('dark');
const screen=$('stageScreen'),stageContent=$('stageContent');
function applyMotion(){stageContent.dataset.motion=motion;stageContent.style.setProperty('--motion-duration',duration+'s');stageContent.style.setProperty('--motion-intensity',String(Math.round(intensity*.3)));screen.classList.toggle('stage-paused',paused);$('playMotion').textContent=paused?'▶ 播放':'Ⅱ 暂停';$('playMotion').setAttribute('aria-pressed',String(!paused));$('durationValue').textContent=duration.toFixed(2)+'s';$('intensityValue').textContent=intensity+'%'}
$('motionPresets').addEventListener('click',e=>{const btn=e.target.closest('[data-preset]');if(!btn)return;motion=btn.dataset.preset;$('motionPresets').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));applyMotion()});
$('motionDuration').oninput=e=>{duration=Number(e.target.value);applyMotion()};
$('motionIntensity').oninput=e=>{intensity=Number(e.target.value);applyMotion()};
$('playMotion').onclick=()=>{paused=!paused;applyMotion()};
$('refreshStage').onclick=()=>{stageContent.style.animation='none';void stageContent.offsetHeight;stageContent.style.animation=''};
$('exportMotionSettings').onclick=()=>{const settings={schema:'davylab-motion-preview-v1',engine:'local-css-presets',preset:motion,durationSeconds:duration,intensity,backdrop,theme:document.body.dataset.theme,videoExported:false,skillExecutionClaimed:false};const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='DAVYLAB-logo-motion-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
$('backdropSwatches').addEventListener('click',e=>{const btn=e.target.closest('[data-backdrop]');if(!btn)return;backdrop=btn.dataset.backdrop;screen.dataset.backdrop=backdrop;$('backdropSwatches').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)))});
$('paletteSwatches').addEventListener('click',e=>{const btn=e.target.closest('[data-color]');if(!btn)return;$('colorEdit').value=btn.dataset.color;$('color').value=btn.dataset.color;$('paletteSwatches').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));if($('svgEditor').value.trim())$('applyVisual').click()});
function putSVG(svg,origin){
 stageContent.replaceChildren();
 if(activeObjectUrl){URL.revokeObjectURL(activeObjectUrl);activeObjectUrl=null}
 if(typeof svg==='string'&&svg.includes('<svg')){
  const blob=new Blob([svg],{type:'image/svg+xml'});activeObjectUrl=URL.createObjectURL(blob);
  const img=document.createElement('img');img.src=activeObjectUrl;img.alt='Logo SVG 预览';stageContent.append(img);$('stageOrigin').textContent=origin;
 }
 applyMotion();
}
function offlineSVG(index){return $('results').querySelectorAll('.preview svg')[index]?.outerHTML||''}
function setOffline(index){selectedOffline=index;putSVG(offlineSVG(index),'OFFLINE VECTOR SKETCH · NOT AI');paintCards(false)}
function paintCards(isAI){
 const cards=$('studioConcepts');cards.replaceChildren();
 const aiElements=[...$('aiResults').querySelectorAll('article')];
 for(let i=0;i<3;i++){
  const svg=isAI?null:offlineSVG(i);
  const card=make('button','concept-card');
  card.type='button';card.setAttribute('aria-pressed',String(i===(isAI?Math.max(0,aiElements.findIndex(el=>el.querySelector('button')?.textContent?.includes('当前精修'))):selectedOffline)));
  const thumb=make('div','concept-thumb');const title=make('strong','',isAI?(aiElements[i]?.querySelector('h3')?.textContent||'概念 '+(i+1)):['01 · Forward','02 · Geometry','03 · Orbit'][i]);
  const sub=make('small','',isAI?'AI 候选 · 待审核':'本地矢量草图');
  if(isAI && aiElements[i]){const source=aiElements[i].querySelector('img');if(source)thumb.append(source.cloneNode(true))}
  else if(svg){const icon=offlineSVG(i);const parsed=new DOMParser().parseFromString(icon,'image/svg+xml');if(!parsed.querySelector('parsererror'))thumb.append(document.importNode(parsed.documentElement,true))}
  card.append(thumb,title,sub);
  card.onclick=()=>{if(isAI){aiElements[i]?.querySelector('button')?.click();setTimeout(sync,10)}else setOffline(i)};
  cards.append(card);
 }
}
function sync(){
 const svg=$('svgEditor').value.trim();
 if(svg && $('aiResults').querySelector('article')){
  putSVG(svg,'AI VECTOR WORKSPACE · REVIEW PENDING');
  paintCards(true);
 }else if(svg){
  putSVG(svg,'EDITABLE IMPORTED SVG · REVIEW PENDING');
  paintCards(false);
 }else setOffline(selectedOffline);
}
$('applySvg').addEventListener('click',()=>setTimeout(sync,0));
$('applyVisual').addEventListener('click',()=>setTimeout(sync,0));
$('restoreAI').addEventListener('click',()=>setTimeout(sync,80));
$('editImported').addEventListener('click',()=>setTimeout(sync,40));
$('svgEditor').addEventListener('change',sync);
$('aiResults').addEventListener('click',()=>setTimeout(sync,30));
const observer=new MutationObserver(()=>{clearTimeout(observer._timer);observer._timer=setTimeout(sync,30)});
observer.observe($('aiResults'),{childList:true});
$('generate').addEventListener('click',()=>setTimeout(()=>setOffline(0),0));
applyMotion();setOffline(0);
