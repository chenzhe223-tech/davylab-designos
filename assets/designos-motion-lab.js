/* Adapted DAVYLAB Visual DNA Motion Lab v0.2.0 */
(function(w){
"use strict";
const KEY="davylab-designos:motion-presets:v1";
const effects=[
["fade-up","淡入上移","柔和上移并渐显，适合内容区块与结果面板。","content"],
["spring","弹性聚焦","轻微回弹强调新对象，适合选中状态与操作反馈。","feedback"],
["slide","方向滑入","沿明确方向进入，适合抽屉、侧栏与步骤切换。","panel"],
["blur","清晰显影","由柔焦变清晰，适合主视觉与精选成果。","focus"],
["stagger","错峰展开","多个元素按节奏依次出现，适合列表与流程。","list"],
["orbit","空间回旋","受控旋转表达空间关系，适合低频品牌主视觉。","brand"]
];
const personalities={
editorial:{name:"克制编辑",effect:"fade-up",durationMs:1800,intensityPercent:70,distancePx:20,direction:"up",easing:"cubic-bezier(0.22,1,0.36,1)",playback:"once",staggerMs:70},
product:{name:"产品交互",effect:"spring",durationMs:1500,intensityPercent:100,distancePx:24,direction:"up",easing:"cubic-bezier(0.34,1.56,0.64,1)",playback:"once",staggerMs:60},
immersive:{name:"沉浸空间",effect:"orbit",durationMs:4000,intensityPercent:80,distancePx:48,direction:"up",easing:"cubic-bezier(0.65,0,0.35,1)",playback:"loop",staggerMs:120}
};
const scenes=[["content","内容入场","文章、功能区与信息块。","fade-up"],["feedback","操作反馈","按钮、确认状态与成功提示。","spring"],["panel","面板切换","抽屉、侧栏与步骤切换。","slide"],["focus","重点显影","封面与精选成果。","blur"],["list","列表错峰","列表、流程与功能分组。","stagger"],["brand","品牌主视觉","低频品牌展示与探索场景。","orbit"]];
const base={schema:"davylab.visual-dna-motion/v1",adapterVersion:"0.2.0",effect:"fade-up",durationMs:1800,intensityPercent:70,distancePx:24,direction:"up",easing:"cubic-bezier(0.22,1,0.36,1)",playback:"once",globalTokens:{staggerMs:70},personality:"editorial",scene:"content",reducedMotionBehavior:"respect-system-and-user"};
let cfg=JSON.parse(JSON.stringify(base)),root=null,host=null,cleanup=null,timeout=null,candidateCleanup=null;
const clone=x=>JSON.parse(JSON.stringify(x));
const reduced=()=>!!(w.matchMedia&&w.matchMedia("(prefers-reduced-motion: reduce)").matches)||!!root?.querySelector("#dsl-reduce")?.checked;
const effect=()=>effects.find(x=>x[0]===cfg.effect)||effects[0];
function validate(x){
 if(!x||x.schema!==base.schema)throw Error("配置 schema 不匹配");
 if(!effects.some(e=>e[0]===x.effect))throw Error("不支持的动效 ID");
 const num=(v,min,max,n)=>{v=Number(v);if(!Number.isFinite(v)||v<min||v>max)throw Error(n+" 超出范围");return v};
 if(!["up","down","left","right"].includes(x.direction)||!["once","loop"].includes(x.playback))throw Error("方向或播放方式无效");
 if(!["cubic-bezier(0.22,1,0.36,1)","cubic-bezier(0.34,1.56,0.64,1)","cubic-bezier(0.65,0,0.35,1)","cubic-bezier(0.2,0.75,0.25,1)","linear"].includes(x.easing))throw Error("缓动曲线无效");
 return {...clone(base),...x,durationMs:num(x.durationMs,1000,5000,"时长"),intensityPercent:num(x.intensityPercent,0,150,"幅度"),distancePx:num(x.distancePx,8,80,"距离"),globalTokens:{staggerMs:num(x.globalTokens?.staggerMs??70,0,300,"错峰间隔")}};
}
function saved(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x.slice(0,30):[]}catch(e){return[]}}
function status(id,msg){const el=root?.querySelector("#"+id);if(el)el.textContent=msg}
function stop(){if(cleanup){cleanup();cleanup=null}if(candidateCleanup){candidateCleanup();candidateCleanup=null}if(timeout){clearTimeout(timeout);timeout=null}}
function getConfig(){return {...clone(cfg),description:effect()[2]}}
function snippet(){
 const e=root.querySelector("#dsl-engine").value,d=(cfg.durationMs/1000).toFixed(2),sel="#designos-motion-target";
 if(e==="gsap")return '// GSAP starter — verify property ownership and teardown.\nconst el = document.querySelector("'+sel+'");\nconst tween = gsap.fromTo(el,{autoAlpha:0,y:'+cfg.distancePx+'},{autoAlpha:1,y:0,duration:'+d+',ease:"power3.out"});\n// Cleanup: tween.kill();';
 if(e==="motion")return '// Motion vanilla starter — install Motion separately if required.\nimport { animate } from "motion";\nconst el = document.querySelector("'+sel+'");\nconst animation = animate(el,{opacity:[0,1],y:['+cfg.distancePx+',0]},{duration:'+d+',ease:[0.22,1,0.36,1]});\n// Cleanup: animation.cancel();';
 return 'const config = '+JSON.stringify(getConfig(),null,2)+';\nconst cleanup = DAVYLABMotion.applyPreset("'+sel+'", config);\n// Call cleanup() before another engine takes ownership.';
}
function update(){
 if(!root)return;
 root.querySelectorAll("[data-effect]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.effect===cfg.effect)));
 root.querySelectorAll("[data-personality]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.personality===cfg.personality)));
 root.querySelectorAll("[data-scene]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.scene===cfg.scene)));
 root.querySelector("#dsl-name").textContent=effect()[1];root.querySelector("#dsl-desc").textContent=effect()[2];root.querySelector("#dsl-seconds").textContent=(cfg.durationMs/1000).toFixed(1)+" SEC";
 const vals={duration:cfg.durationMs,intensity:cfg.intensityPercent,distance:cfg.distancePx,direction:cfg.direction,easing:cfg.easing,playback:cfg.playback,stagger:cfg.globalTokens.staggerMs};
 Object.keys(vals).forEach(k=>root.querySelector("#dsl-"+k).value=String(vals[k]));
 root.querySelector("#dsl-duration-out").textContent=(cfg.durationMs/1000).toFixed(1)+"s";root.querySelector("#dsl-intensity-out").textContent=cfg.intensityPercent+"%";root.querySelector("#dsl-distance-out").textContent=cfg.distancePx+"px";root.querySelector("#dsl-stagger-out").textContent=cfg.globalTokens.staggerMs+"ms";
 root.querySelector("#dsl-reduced-note").textContent=reduced()?"减少动态效果已启用：保留方案和参数，预览保持静止。":"系统级减少动态效果设置优先。";
 root.querySelector("#dsl-saved").innerHTML='<option value="">选择本机预设…</option>'+saved().map(x=>'<option value="'+String(x.id).replace(/"/g,"")+'">'+String(x.name).replace(/[&<>"]/g,"")+'</option>').join("");
 root.querySelector("#dsl-json").value=JSON.stringify(getConfig(),null,2);root.querySelector("#dsl-snippet").value=snippet();
}
function play(){
 if(!root)return;stop();const obj=root.querySelector("#dsl-object"),items=[...root.querySelectorAll(".dsl-item")];[obj,...items].forEach(x=>{x.style.opacity="1";x.style.filter="none";x.style.transform="none"});
 if(reduced()){status("dsl-status","预览保持静止（减少动态效果）。仍可调参、保存和导出。");return}
 if(!w.DAVYLABMotion?.applyPreset){status("dsl-status","动效运行时未加载；当前未播放动画，配置与导出仍可用。");return}
 const target=cfg.effect==="stagger"?items:obj;cleanup=w.DAVYLABMotion.applyPreset(target,cfg);
 const started=(Array.isArray(target)?target:[target]).some(x=>x.getAnimations&&x.getAnimations().length);
 if(!started){status("dsl-status","浏览器未启动动画，未报告预览成功。");return}
 status("dsl-status","正在预览「"+effect()[1]+"」 · "+(cfg.durationMs/1000).toFixed(1)+" 秒");
 timeout=setTimeout(()=>{if(cleanup){cleanup();cleanup=null}status("dsl-status","预览结束。可重播、微调或导出。")},cfg.durationMs+cfg.globalTokens.staggerMs*items.length+100);
}
function set(next){cfg=validate({...cfg,...next,globalTokens:{...cfg.globalTokens,...(next.globalTokens||{})}});update();play()}
function mount(container){
 host=container;root=document.createElement("section");root.className="designos-motion-lab";root.id="designosMotionLab";
 root.innerHTML='<div class="dsl-head"><div><span class="dsl-kicker">DAVYLAB VISUAL DNA / MOTION SYSTEM 0.2.0</span><h3>让动效成为设计系统的一部分</h3><p>选择 → 预览 → 理解 → 微调 → 保存 / 导出。动效配置同步进入候选设计规范。</p></div><span class="dsl-mark">MOTION LAB</span></div>'+
 '<div class="dsl-personalities">'+Object.keys(personalities).map(k=>'<button type="button" data-personality="'+k+'" aria-pressed="'+(k==="editorial")+'"><b>'+personalities[k].name+'</b><small>'+({editorial:"柔和节奏 · 内容与专业工具",product:"清晰反馈 · 操作与状态变化",immersive:"空间表达 · 主视觉与探索"}[k])+'</small></button>').join("")+'</div>'+
 '<div class="dsl-scenes">'+scenes.map(x=>'<button type="button" data-scene="'+x[0]+'" aria-pressed="false"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>').join("")+'</div>'+
 '<div class="dsl-picker"><div class="dsl-effects">'+effects.map((e,i)=>'<button type="button" data-effect="'+e[0]+'" aria-pressed="'+(i===0)+'"><span>MOTION / 0'+(i+1)+'</span><b>'+e[1]+'</b><small>'+e[2]+'</small></button>').join("")+'</div>'+
 '<div class="dsl-preview"><div class="dsl-preview-top"><div><span>LIVE PREVIEW</span><b id="dsl-name">淡入上移</b></div><strong id="dsl-seconds">1.8 SEC</strong></div><div class="dsl-stage"><div class="dsl-orbit"></div><div id="dsl-object" class="dsl-object">✳</div><div class="dsl-items"><i class="dsl-item"></i><i class="dsl-item"></i><i class="dsl-item"></i><i class="dsl-item"></i><i class="dsl-item"></i></div></div><p id="dsl-desc" aria-live="polite"></p><div class="dsl-actions"><button type="button" class="dsl-primary" id="dsl-replay">重播预览 ↻</button><button type="button" id="dsl-apply-candidate">预览到候选方案</button></div></div></div>'+
 '<div class="dsl-tuning"><b>微调当前效果</b><div class="dsl-controls"><label>预览时长 <output id="dsl-duration-out">1.8s</output><input id="dsl-duration" type="range" min="1000" max="5000" step="500" value="1800"></label><label>运动幅度 <output id="dsl-intensity-out">70%</output><input id="dsl-intensity" type="range" min="0" max="150" step="10" value="70"></label><label>位移距离 <output id="dsl-distance-out">24px</output><input id="dsl-distance" type="range" min="8" max="80" step="4" value="24"></label><label>运动方向<select id="dsl-direction"><option value="up">向上</option><option value="down">向下</option><option value="left">向左</option><option value="right">向右</option></select></label><label>缓动曲线<select id="dsl-easing"><option value="cubic-bezier(0.22,1,0.36,1)">柔和减速</option><option value="cubic-bezier(0.34,1.56,0.64,1)">轻弹回</option><option value="cubic-bezier(0.65,0,0.35,1)">平滑进出</option><option value="cubic-bezier(0.2,0.75,0.25,1)">标准</option><option value="linear">匀速</option></select></label><label>播放方式<select id="dsl-playback"><option value="once">单次播放</option><option value="loop">预览时长内循环</option></select></label><label>错峰间隔 <output id="dsl-stagger-out">70ms</output><input id="dsl-stagger" type="range" min="0" max="300" step="10" value="70"></label></div><div class="dsl-reduced"><label><input id="dsl-reduce" type="checkbox"> 减少动态效果</label><span id="dsl-reduced-note">尊重系统设置。</span></div>'+
 '<div class="dsl-workbench"><section><b>本机预设</b><p>最多保存 30 个命名配置，仅保存在此浏览器。</p><input id="dsl-preset-name" maxlength="48" placeholder="例如：卡片轻入场"><select id="dsl-saved"><option value="">选择本机预设…</option></select><div class="dsl-actions"><button id="dsl-save" type="button">保存 / 更新</button><button id="dsl-load" type="button">载入</button><button id="dsl-delete" type="button">删除</button></div><div id="dsl-saved-status" role="status"></div></section>'+
 '<section><b>导入 / 分享</b><p>导入前校验 schema 与参数；分享链接只在 URL 片段中携带配置。</p><textarea id="dsl-import" placeholder="粘贴 davylab.visual-dna-motion/v1 JSON…"></textarea><input id="dsl-file" type="file" accept=".json,application/json"><div class="dsl-actions"><button id="dsl-import-apply" type="button">校验并应用</button><button id="dsl-export" type="button">导出 JSON</button><button id="dsl-share" type="button">生成分享链接</button></div><input id="dsl-share-url" readonly placeholder="分享链接"><div id="dsl-import-status" role="status"></div></section>'+
 '<section><b>生成接入代码</b><p>示例代码需要按目标框架生命周期和动画属性所有权复核，不代表已自动接入。</p><select id="dsl-engine"><option value="waapi">原生 Web Animations API</option><option value="gsap">GSAP</option><option value="motion">Motion vanilla</option></select><textarea id="dsl-snippet" readonly></textarea><div class="dsl-actions"><button id="dsl-copy-snippet" type="button">复制接入代码</button><button id="dsl-copy-json" type="button">复制 JSON</button></div></section></div>'+
 '<textarea id="dsl-json" readonly aria-label="当前动效 JSON"></textarea><div id="dsl-status" role="status">选择效果开始预览。</div><p class="dsl-boundary">预览使用 DAVYLABMotion v0.2.0 原生 Web Animations API 适配器。GSAP / Motion 仅生成接入示例；Three.js 为可选空间场景，不会为普通 UI 强行加载。</p></div>';
 container.appendChild(root);
 root.addEventListener("click",e=>{
  const b=e.target.closest("[data-effect]");if(b){const row=effects.find(x=>x[0]===b.dataset.effect);set({effect:row[0],scene:row[3]});return}
  const p=e.target.closest("[data-personality]");if(p){const x=personalities[p.dataset.personality];set({...x,personality:p.dataset.personality,globalTokens:{staggerMs:x.staggerMs}});return}
  const s=e.target.closest("[data-scene]");if(s){const x=scenes.find(y=>y[0]===s.dataset.scene);set({scene:x[0],effect:x[3]});return}
  const id=e.target.id;
  if(id==="dsl-replay")play();if(id==="dsl-apply-candidate")applyCandidate();if(id==="dsl-save")save();if(id==="dsl-load")load();if(id==="dsl-delete")del();if(id==="dsl-import-apply")imp();if(id==="dsl-export")download("davylab-visual-dna-motion.json",root.querySelector("#dsl-json").value,"application/json");if(id==="dsl-share")share();if(id==="dsl-copy-snippet")copyText(root.querySelector("#dsl-snippet").value,"接入代码已复制。");if(id==="dsl-copy-json")copyText(root.querySelector("#dsl-json").value,"JSON 已复制。");
 });
 root.addEventListener("input",e=>{const id=e.target.id,map={"dsl-duration":"durationMs","dsl-intensity":"intensityPercent","dsl-distance":"distancePx","dsl-direction":"direction","dsl-easing":"easing","dsl-playback":"playback"};if(map[id])set({[map[id]]:["durationMs","intensityPercent","distancePx"].includes(map[id])?Number(e.target.value):e.target.value});if(id==="dsl-stagger")set({globalTokens:{staggerMs:Number(e.target.value)}});if(id==="dsl-reduce"){update();play()}});
 root.querySelector("#dsl-file").addEventListener("change",async e=>{const f=e.target.files?.[0];if(f)root.querySelector("#dsl-import").value=await f.text()});
 root.querySelector("#dsl-engine").addEventListener("change",update);
 const h=w.location.hash.match(/(?:^#|&)motion=([^&]+)/);if(h){try{cfg=validate(JSON.parse(decodeURIComponent(escape(atob(h[1])))))}catch(e){status("dsl-import-status","分享链接无效，保留默认设置。")}}
 update();play();
}
function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
async function copyText(value,msg){try{await navigator.clipboard.writeText(value);status("dsl-status",msg)}catch(e){status("dsl-status","复制不可用，请手动复制文本框内容。")}}
function save(){const name=root.querySelector("#dsl-preset-name").value.trim();if(!name){status("dsl-saved-status","请先输入预设名称。");return}const a=saved(),i=a.findIndex(x=>x.name===name),item={id:i>=0?a[i].id:"motion-"+Date.now(),name,config:clone(cfg)};if(i<0&&a.length>=30){status("dsl-saved-status","最多保存 30 个预设，请先删除一个。");return}if(i>=0)a.splice(i,1,item);else a.push(item);try{localStorage.setItem(KEY,JSON.stringify(a));update();root.querySelector("#dsl-saved").value=item.id;status("dsl-saved-status","已保存在本机浏览器。")}catch(e){status("dsl-saved-status","本机存储不可用，请导出 JSON 备份。")}}
function load(){const x=saved().find(p=>p.id===root.querySelector("#dsl-saved").value);if(!x){status("dsl-saved-status","请选择有效预设。");return}try{set(validate(x.config));root.querySelector("#dsl-preset-name").value=x.name}catch(e){status("dsl-saved-status","预设无效，未覆盖当前配置。")}}
function del(){const id=root.querySelector("#dsl-saved").value;if(!id)return;try{localStorage.setItem(KEY,JSON.stringify(saved().filter(x=>x.id!==id)));update();status("dsl-saved-status","已从本机删除。")}catch(e){status("dsl-saved-status","无法更新本机存储。")}}
function imp(){try{set(validate(JSON.parse(root.querySelector("#dsl-import").value)));status("dsl-import-status","配置通过校验并已应用。")}catch(e){status("dsl-import-status","导入失败："+e.message)}}
function share(){try{const u=new URL(w.location.href);u.hash="motion="+btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));root.querySelector("#dsl-share-url").value=u.toString();copyText(u.toString(),"分享链接已复制；配置仅保存在 URL 片段中。")}catch(e){status("dsl-import-status","无法生成分享链接。")}}
function applyCandidate(){const target=host?.querySelector(".candidate-live-preview");if(!target){status("dsl-status","尚未找到候选预览。");return}if(reduced()){status("dsl-status","减少动态效果已启用，候选预览保持静止。");return}if(!w.DAVYLABMotion){status("dsl-status","动效适配器未加载。");return}if(candidateCleanup)candidateCleanup();candidateCleanup=w.DAVYLABMotion.applyPreset(target,cfg);status("dsl-status",target.getAnimations().length?"已在候选预览中播放当前动效。":"候选预览未启动动画。")}
function getMarkdown(){return ["## Motion design system","", "- Effect: "+effect()[1]+" ("+cfg.effect+")","- Personality: "+(personalities[cfg.personality]?.name||cfg.personality),"- Scenario: "+cfg.scene,"- Duration: "+cfg.durationMs+"ms","- Intensity: "+cfg.intensityPercent+"%","- Distance: "+cfg.distancePx+"px","- Direction: "+cfg.direction,"- Easing: "+cfg.easing,"- Playback: "+cfg.playback,"- Stagger: "+cfg.globalTokens.staggerMs+"ms","- Reduced motion: "+cfg.reducedMotionBehavior,"- Runtime adapter: DAVYLABMotion v0.2.0","","### Purpose","",effect()[2],"","### Integration boundary","","- Check existing transform/opacity ownership and cleanup on view teardown.","- Respect prefers-reduced-motion.","- GSAP/Motion/Three.js are optional target integrations; they are not loaded in the static DesignOS preview."].join("\n")}
w.DesignOSMotionLab={version:"0.2.0",mount,getConfig,getMarkdown,validate};
})(window);
