import {normalizeCreationMode,modeDescription,demoShotsForMode} from './creation-modes.mjs';
import {normalizeShots,updateShot,moveShot,removeShot,projectSnapshot,totalDuration} from './timeline.mjs';
import {resolvePreviewFrame} from './canvas-plan.mjs';
import {planDirectorProject,ENGINE_CATALOG} from './director.mjs';
const $=id=>document.getElementById(id);
const KEY='davylab.vibe.p0';
let project={prompt:$('prompt').value,format:'portrait',mode:'animation',shots:[]};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved.prompt==='string'){project=projectSnapshot(saved);$('prompt').value=project.prompt;$('format').value=project.format}}catch(error){console.warn('本地项目恢复失败，使用空白项目',error)}
const status=message=>{$('status').textContent=message};
function selectCreationMode(mode,{announce=true}={}){
 const selected=normalizeCreationMode(mode);project.mode=selected;
 document.querySelectorAll('.entry-card[data-mode]').forEach(card=>{
  const active=card.dataset.mode===selected;
  card.classList.toggle('is-selected',active);
  if(active)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current');
 });
 $('current-mode').textContent=modeDescription(selected).title;
 if(announce)status('已选择「'+modeDescription(selected).title+'」；当前内容保留。此入口与其他模式共用编辑器。');
 if($('director-plan'))renderDirectorPlan();
}
document.querySelectorAll('.entry-card[data-mode]').forEach(card=>card.addEventListener('click',()=>selectCreationMode(card.dataset.mode)));
selectCreationMode(project.mode,{announce:false});

const synchronize=()=>{project.prompt=$('prompt').value.trim();project.format=$('format').value;project.shots=normalizeShots(project.shots||[]);return projectSnapshot(project)};
function storyboard(){if(!$('prompt').value.trim()){status('请先输入创意');return}project.prompt=$('prompt').value.trim();project.format=$('format').value;project.shots=normalizeShots(demoShotsForMode(project.mode));renderShots();status('已生成「'+modeDescription(project.mode).title+'」规则式示例分镜（非 AI 生成），可调整时长与顺序')}
const makeButton=(label,action,disabled=false)=>{const btn=document.createElement('button');btn.type='button';btn.className='shot-action';btn.textContent=label;btn.disabled=disabled;btn.addEventListener('click',action);return btn};
function renderDirectorPlan(){
 const container=$('director-plan');if(!container)return;
 container.replaceChildren();
 if(!project.shots?.length){container.textContent='创建分镜后显示每个镜头的引擎建议和接入状态';return}
 try{
  const plan=planDirectorProject({mode:project.mode,shots:project.shots});
  for(const shot of plan.shots){
   const item=document.createElement('div');item.className='director-shot';
   const title=document.createElement('span');title.textContent='镜头 '+(shot.index+1)+' · '+shot.preferredEngine;
   const status=document.createElement('span');status.className='director-status';status.textContent=shot.canDispatch?'运行已验证':'未集成，不能直接渲染';
   item.append(title,status);container.append(item)
  }
  const foot=document.createElement('small');foot.textContent='Remotion 为统一合成底座；其他 Skill 必须通过独立真实运行测试才能启用。';container.append(foot)
 }catch(error){container.textContent='引擎建议无法计算：'+error.message}
}
function renderShots(){const shots=project.shots||[];const container=$('shots');container.replaceChildren();shots.forEach((shot,i)=>{const li=document.createElement('li');li.className='shot-row';const details=document.createElement('div');details.className='shot-details';const clock=document.createElement('span');clock.className='shot-clock';clock.textContent=shot.start+'–'+shot.end+'s';const title=document.createElement('input');title.value=shot.title;title.maxLength=100;title.setAttribute('aria-label','镜头 '+(i+1)+' 标题');const duration=document.createElement('input');duration.type='number';duration.min='1';duration.max='120';duration.step='1';duration.value=String(shot.duration);duration.className='duration-input';duration.setAttribute('aria-label','镜头 '+(i+1)+' 时长（秒）');const visual=document.createElement('input');visual.value=shot.visual||'';visual.maxLength=1000;visual.className='visual-input';visual.setAttribute('aria-label','镜头 '+(i+1)+' 画面说明');title.addEventListener('change',()=>{project.shots=updateShot(project.shots,i,{title:title.value});renderShots()});duration.addEventListener('change',()=>{try{project.shots=updateShot(project.shots,i,{duration:Number(duration.value)});status('镜头时长已更新')}catch(e){status(e.message)}renderShots()});visual.addEventListener('change',()=>{project.shots=updateShot(project.shots,i,{visual:visual.value});renderShots()});const family=document.createElement('select');family.className='visual-family-select';family.setAttribute('aria-label','镜头 '+(i+1)+' 程序化画面');for(const [value,label] of [['auto','画面：自动匹配'],['particles','画面：星光粒子'],['city','画面：城市建筑'],['nature','画面：自然山景']]){const option=document.createElement('option');option.value=value;option.textContent=label;family.append(option)}family.value=shot.visualFamily||'auto';family.addEventListener('change',()=>{project.shots=updateShot(project.shots,i,{visualFamily:family.value});renderShots();status('已修改镜头 '+(i+1)+' 画面类型；预览将同步更新')});const motion=document.createElement('input');motion.className='motion-input';motion.value=shot.motion||'';motion.maxLength=1000;motion.placeholder='导演镜头运动（暂不控制动画）';motion.setAttribute('aria-label','镜头 '+(i+1)+' 导演镜头运动');motion.addEventListener('change',()=>{project.shots=updateShot(project.shots,i,{motion:motion.value});renderShots()});const narration=document.createElement('input');narration.className='narration-input';narration.value=shot.narration||'';narration.maxLength=1000;narration.placeholder='字幕文案（不生成配音）';narration.setAttribute('aria-label','镜头 '+(i+1)+' 字幕文案');narration.addEventListener('change',()=>{project.shots=updateShot(project.shots,i,{narration:narration.value});renderShots();status('镜头字幕已更新；预览将同步更新')});details.append(clock,title,duration,visual,family,motion,narration);const actions=document.createElement('div');actions.className='shot-actions';actions.append(makeButton('↑',()=>{project.shots=moveShot(project.shots,i,-1);renderShots()},i===0),makeButton('↓',()=>{project.shots=moveShot(project.shots,i,1);renderShots()},i===shots.length-1),makeButton('删除',()=>{project.shots=removeShot(project.shots,i);renderShots()}));li.append(details,actions);container.append(li)});renderTimeline();renderDirectorPlan()}
function renderTimeline(){const shots=project.shots||[];const duration=shots.length?totalDuration(shots):0;$('timeline-duration').textContent=duration+' 秒';const track=$('timeline');track.replaceChildren();if(!duration){const empty=document.createElement('span');empty.textContent='生成分镜后显示镜头时间轴';track.append(empty);return}shots.forEach((shot,i)=>{const block=document.createElement('button');block.type='button';block.className='timeline-shot';block.setAttribute('aria-label','跳转镜头 '+(i+1));block.addEventListener('click',()=>{if(recording){status('录制期间无法跳转，请完成录制后再操作');return}start=performance.now()-shot.start*1000;status('跳转到镜头 '+(i+1)+'：'+shot.title)});block.style.flexGrow=String(shot.duration);block.style.flexBasis='0';block.title=shot.title+'：'+shot.start+'–'+shot.end+' 秒';block.textContent=(i+1)+' · '+shot.duration+'s';track.append(block)})}
function download(name,content,type='application/json'){const a=document.createElement('a');const u=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
$('create').onclick=storyboard;
$('generate-ai').onclick=async()=>{
 const pass=$('ai-access-key').value;
 const promptText=$('prompt').value.trim();
 if(!pass){status('请先输入 AI 服务访问口令（并在服务端启用）');return}
 if(promptText.length<3){status('创意描述至少需要 3 个字符');return}
 if(project.shots?.length&&!confirm('生成新分镜将替换当前未保存的镜头列表，是否继续？'))return;
 const button=$('generate-ai');button.disabled=true;button.textContent='分镜生成中…';
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),55000);
 try{
  status('正在通过安全服务请求 DeepSeek，生成完成后将更新分镜及程序化预览');
  const response=await fetch('/api/vibe/storyboard',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+pass},body:JSON.stringify({prompt:promptText,duration:Number($('target-duration').value),mode:project.mode,aspectRatio:$('format').value==='landscape'?'16:9':'9:16'}),signal:controller.signal,credentials:'same-origin'});
  const data=await response.json();
  if(!response.ok)throw new Error(data?.error||'服务请求失败');
  if(data?.source!=='deepseek'||!Array.isArray(data?.storyboard?.scenes))throw new Error('服务响应结构不正确');
  const shots=normalizeShots(data.storyboard.scenes.map(s=>({title:s.title,duration:s.durationSeconds,visual:s.visual,motion:s.motion,narration:s.narration})));
  project.shots=shots;project.prompt=promptText;project.format=$('format').value;renderShots();
  status('DeepSeek 分镜已生成：'+shots.length+' 个镜头，共 '+totalDuration(shots)+' 秒。请检查并保存；Canvas 展示的是近似程序化预览，不是 Remotion 成片。');
 }catch(e){status(e.name==='AbortError'?'AI 分镜请求超时':('AI 分镜失败：'+e.message))}
 finally{clearTimeout(timeout);button.disabled=false;button.textContent='DeepSeek 智能分镜'}
};

$('save').onclick=()=>{try{localStorage.setItem(KEY,JSON.stringify(synchronize()));status('已保存在当前浏览器；尚未跨设备同步')}catch(e){status('本地保存失败：'+e.message)}};
$('import-trigger').onclick=()=>$('import-file').click();
$('import-file').addEventListener('change',async()=>{const file=$('import-file').files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('工程文件超过 2 MB');const raw=JSON.parse(await file.text());if(!raw||typeof raw!=='object'||typeof raw.prompt!=='string'||!Array.isArray(raw.shots))throw new Error('不是有效的 Vibe Studio 项目');const imported=projectSnapshot(raw);project=imported;$('prompt').value=project.prompt;$('format').value=project.format;selectCreationMode(project.mode,{announce:false});renderShots();status('工程已导入（尚未覆盖本地保存，点击「保存项目」才会写入）')}catch(e){status('项目导入失败：'+e.message)}finally{$('import-file').value=''}});
$('export').onclick=()=>{try{download('vibe-project.json',JSON.stringify(synchronize(),null,2))}catch(e){status('项目导出失败：'+e.message)}};
$('handoff').onclick=()=>{try{const snapshot=synchronize();download('vibe-agent-handoff.md','# Vibe Studio 任务交接\n\n创意：'+snapshot.prompt+'\n\n画幅：'+snapshot.format+'\n\n总时长：'+totalDuration(snapshot.shots)+' 秒\n\n分镜：\n'+snapshot.shots.map(s=>'- '+s.start+'–'+s.end+'s '+s.title+'：'+s.visual+' | 画面：'+(s.visualFamily||'auto')+' | 导演运动：'+(s.motion||'未指定')+' | 字幕：'+(s.narration||'无')).join('\n')+'\n\n执行：WorkBuddy 根据分镜实现 Remotion 合成与渲染，回传实际文件及测试证据。\n验收：时长、尺寸、播放、无黑帧。此交接单不代表 MP4 已生成。','text/markdown')}catch(e){status('交接导出失败：'+e.message)}};
const c=$('scene'),ctx=c.getContext('2d');let start=performance.now();let recordingSnapshot=null;
let lastQuarter=-1;
const particles=Array.from({length:90},(_,i)=>({x:(i*97%540)/540,y:(i*137%720)/720,r:1+(i%3)}));
function fitCanvas(){const landscape=(recordingSnapshot?.format??$('format').value)==='landscape';const w=landscape?960:540,h=landscape?540:960;if(c.width!==w||c.height!==h){c.width=w;c.height=h}c.style.aspectRatio=landscape?'16 / 9':'9 / 16'}
$('format').addEventListener('change',fitCanvas);
function draw(now){
 requestAnimationFrame(draw);fitCanvas();
 const elapsed=Math.max(0,(now-start)/1000),selected=resolvePreviewFrame(recordingSnapshot?.shots??project.shots,elapsed);
 const {shot,family,localSeconds}=selected,w=c.width,h=c.height;
 const quarter=Math.floor(elapsed*4);
 if(quarter!==lastQuarter){
  lastQuarter=quarter;
  const formatTime=n=>{const sec=Math.max(0,Math.floor(n));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')};
  const displayAt=elapsed%selected.duration;
  $('preview-clock').textContent=formatTime(displayAt)+' / '+formatTime(selected.duration);
  $('preview-shot-name').textContent=(project.shots?.length?'镜头 '+(selected.index+1)+' · ':'')+String(shot.title||'本地预览动画');
  document.querySelectorAll('.timeline-shot').forEach((element,index)=>element.classList.toggle('is-active',index===selected.index));
 }

 const shotDuration=Number(shot.duration??Number(shot.end)-Number(shot.start))||10;
 const progress=Math.min(1,Math.max(0,localSeconds/shotDuration));
 ctx.fillStyle='#071729';ctx.fillRect(0,0,w,h);
 const gradient=ctx.createRadialGradient(w*.65,h*.46,10,w*.65,h*.46,h*.78);
 gradient.addColorStop(0,'#497ea7');gradient.addColorStop(.6,'#1d405e');gradient.addColorStop(1,'#071729');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 for(const p of particles){ctx.fillStyle='rgba(201,227,255,'+(.18+.6*Math.abs(Math.sin(elapsed*.4+p.x*11)))+')';ctx.beginPath();ctx.arc(p.x*w+Math.sin(elapsed*.4+p.y*8)*6,p.y*h,p.r,0,Math.PI*2);ctx.fill()}
 if(family==='city'){
  const horizon=h*.82,scale=Math.min(1,progress*3);
  for(let i=0;i<24;i++){const x=i*w/24,bw=w/27,building=(.15+(i*37%100)/280)*h*scale;
   ctx.fillStyle=i%3?'#254b6a':'#326484';ctx.fillRect(x,horizon-building,bw,building);
   ctx.fillStyle='#b9eaff';for(let row=12;row<building-4;row+=24)for(let col=7;col<bw-4;col+=12)if((i+row+col)%5!==0)ctx.fillRect(x+col,horizon-row,3,5)
  }
 }else if(family==='nature'){
  ctx.fillStyle='#224f67';ctx.fillRect(0,h*.78,w,h*.22);
  for(let i=0;i<7;i++){const x=i*w/6-w*.2,peak=h*(.3+(i*17%31)/100),rise=progress*.12*h;
   ctx.fillStyle=i%2?'#376d82':'#234c71';ctx.beginPath();ctx.moveTo(x,h*.8);ctx.lineTo(x+w*.18,peak+rise);ctx.lineTo(x+w*.48,h*.8);ctx.closePath();ctx.fill()
  }
 }else{
  const radius=Math.min(w,h)*(.1+progress*.14),x=w*.63,y=h*.48;
  for(let i=0;i<5;i++){ctx.strokeStyle='rgba(174,228,255,'+(.17+i*.1)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,radius*(1.1+i*.25),radius*(.35+i*.07),-.35,0,Math.PI*2);ctx.stroke()}
  ctx.fillStyle='#c4efff';ctx.beginPath();ctx.arc(x,y,radius*.3,0,Math.PI*2);ctx.fill()
 }
 const title=String(shot.title||'创意正在成形'),visual=String(shot.visual||'');
 const fontSize=Math.max(20,Math.min(37,w*.045));ctx.textAlign='center';ctx.fillStyle='#f7fbff';ctx.font='bold '+fontSize+'px system-ui';
 ctx.fillText(title.slice(0,22),w/2,h*.19);
 ctx.font=Math.max(12,Math.min(20,w*.022))+'px system-ui';ctx.fillStyle='#d3e9ff';ctx.fillText(visual.slice(0,35),w/2,h*.19+40);
 if(shot.narration){ctx.font=Math.max(17,Math.min(24,w*.027))+'px system-ui';ctx.fillStyle='#ffffff';ctx.fillText(String(shot.narration).slice(0,32),w/2,h*.87)}
 ctx.font=Math.max(11,Math.min(17,w*.02))+'px system-ui';ctx.fillStyle='#d1e5f8';ctx.fillText('DAVYLAB VIBE STUDIO · 预览动画',w/2,h-25);
}
$('play').onclick=()=>{if(recording){status('录制期间无法重启播放');return}showCanvas();start=performance.now();status('正在播放分镜对应的程序化 Canvas 动画（不等于最终视频）')};
const importedVideo=$('rendered-video');let importedMp4Url=null;
function showCanvas(){importedVideo.pause();importedVideo.hidden=true;c.hidden=false}
$('load-mp4').onclick=()=>$('render-file').click();
$('render-file').addEventListener('change',()=>{
 const file=$('render-file').files?.[0];if(!file)return;
 try{
  if(file.size===0||file.size>2*1024*1024*1024)throw new Error('视频文件应在 1B 至 2GB 之间');
  if(file.type&&file.type!=='video/mp4'&&!file.name.toLowerCase().endsWith('.mp4'))throw new Error('请选择 MP4 视频');
  const url=URL.createObjectURL(file);
  importedVideo.pause();
  if(importedMp4Url)URL.revokeObjectURL(importedMp4Url);
  importedMp4Url=url;importedVideo.src=url;importedVideo.hidden=false;c.hidden=true;
  importedVideo.onloadedmetadata=()=>status('本地 MP4 已加载：'+Math.round(importedVideo.duration)+' 秒。仅供预览，尚未执行成片 QA。');
  importedVideo.onerror=()=>status('MP4 文件无法播放，请检查编码格式或文件完整性');
 }catch(e){status('视频导入失败：'+e.message)}finally{$('render-file').value=''}
});
window.addEventListener('pagehide',()=>{if(importedMp4Url)URL.revokeObjectURL(importedMp4Url)});

renderShots();draw(performance.now());
// Browser-native recording: real canvas frames, never mislabeled as MP4.
let recording=false;
$('record').onclick=async()=>{
 if(recording)return;
 let duration;
 try{duration=totalDuration(project.shots);if(!Number.isInteger(duration)||duration<15||duration>120)throw new Error('请先准备 15–120 秒的完整分镜')}catch(e){status('录制未开始：'+e.message);return}
 $('rendered-video').pause();$('rendered-video').hidden=true;c.hidden=false;
 if(typeof MediaRecorder==='undefined'||typeof c.captureStream!=='function'){$('status').textContent='当前浏览器不支持 Canvas 视频录制';return}
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));
 if(!mime){$('status').textContent='当前浏览器没有可用的 WebM 编码器';return}
 const stream=c.captureStream(30),chunks=[];let recorder;
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:2500000})}catch(e){stream.getTracks().forEach(x=>x.stop());$('status').textContent='无法启动录制：'+e.message;return}
 recordingSnapshot=projectSnapshot({...project,prompt:$('prompt').value,format:$('format').value});recording=true;$('record').disabled=true;start=performance.now();$('status').textContent='录制中：'+duration+' 秒分镜动画（WebM，非正式 MP4）';
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onerror=()=>{$('status').textContent='录制失败，请检查浏览器权限与编码器'};
 recorder.onstop=()=>{stream.getTracks().forEach(x=>x.stop());recording=false;recordingSnapshot=null;$('record').disabled=false;if(chunks.length){download('davylab-vibe-'+duration+'s-preview.webm',new Blob(chunks,{type:mime}),mime);$('status').textContent='WebM 已导出；此文件不是 MP4'}else $('status').textContent='未生成有效视频数据'};
 try{recorder.start(250)}catch(e){stream.getTracks().forEach(x=>x.stop());recording=false;recordingSnapshot=null;$('record').disabled=false;status('录制启动失败：'+e.message);return}
 setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},duration*1000);
};
