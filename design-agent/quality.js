// DAVYLAB native, dependency-free design quality gates.
// Heuristic review only: not a substitute for rendered browser/a11y or legal review.
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function luminance(color){
 if(!/^#[0-9a-f]{6}$/i.test(color||''))return null;
 const n=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*n[0]+.7152*n[1]+.0722*n[2];
}
export function contrastRatio(a,b){
 const x=luminance(a),y=luminance(b);
 return x===null||y===null?null:(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
// Defense-in-depth for project exports; full DOM parsing is enforced separately at render time.
export function inspectSVGSource(svg){
 if(typeof svg!=='string'||svg.length<140||svg.length>16000)return {safe:false,reason:'size'};
 const normalized=svg.replace(/xmlns\\s*=\\s*["']http:\\/\\/www\\.w3\\.org\\/2000\\/svg["']/gi,'');
 if(!/<svg\\b/i.test(svg)||!/<\\/svg\\s*>/i.test(svg)||!/<svg\\b[^>]*\\bviewBox\\s*=\\s*["'][^"']+["']/i.test(svg))return {safe:false,reason:'structure'};
 if(/<!DOCTYPE|<!ENTITY|<\\s*\\/?\\s*(?:script|style|foreignObject|iframe|object|embed|image|use|animate|set|filter|pattern)\\b|\\bon[a-z-]+\\s*=|(?:href|src)\\s*=|url\\s*\\(|javascript:|data:|@import/i.test(normalized))return {safe:false,reason:'active-content'};
 return {safe:true,reason:'static-source-only'};
}
const issue=(code,severity,message,evidence,action)=>({code,severity,message,evidence,action});
export function auditBrandProject(project){
 const issues=[],checks=[];
 const add=(name,pass,detail)=>checks.push({name,pass,detail});
 const dirs=Array.isArray(project?.directions)?project.directions:[];
 const strategy=project?.strategy||{};
 add('strategy',!!strategy.brand_name?.trim()&&!!strategy.positioning?.trim(),'品牌名称与定位必须明确');
 if(!checks.at(-1).pass)issues.push(issue('STRATEGY_INCOMPLETE','blocker','品牌策略不完整',null,'补齐品牌名称和定位'));
 add('directions',dirs.length===3,'必须提供三套方案');
 if(dirs.length!==3)issues.push(issue('DIRECTION_COUNT','blocker','必须恰好提供三套方向',dirs.length,'重新生成或补全方向'));
 const names=dirs.map(d=>String(d?.name||'').trim().toLowerCase());
 const unique=names.every(Boolean)&&new Set(names).size===names.length;
 add('distinct_names',unique,'方向名称必须不同');
 if(!unique)issues.push(issue('DIRECTION_DUPLICATE','major','方向名称重复或缺失',names,'重新命名并说明差异'));
 const paletteValid=dirs.every(d=>Array.isArray(d.palette)&&d.palette.length===4&&d.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c)));
 add('palette',paletteValid,'每个方向必须有四个六位 HEX 色值');
 if(!paletteValid)issues.push(issue('PALETTE_INVALID','major','色板缺失或色值非法',null,'补全四个有效 HEX 色值'));
 for(let i=0;i<dirs.length;i++){
  const d=dirs[i],id=d.id||'ABC'[i];
  if(!d.rationale?.trim()||!d.symbol?.trim())issues.push(issue('RATIONALE_MISSING','major',id+' 缺少设计理由或视觉符号',id,'明确设计意图与独特符号'));
  if(Array.isArray(d.palette)&&/^#[0-9a-f]{6}$/i.test(d.palette[0]||'')&&/^#[0-9a-f]{6}$/i.test(d.palette[1]||'')){
   const ratio=contrastRatio(d.palette[0],d.palette[1]);
   // These colors are used as art background and foreground in Design Agent preview.
   if(ratio<4.5)issues.push(issue('PREVIEW_CONTRAST','major',id+' 预览主色对比不足',Number(ratio.toFixed(2)),'调整背景或前景色，达到正文 4.5:1'));
  }
  if(d.svg&&!project?.vectors)issues.push(issue('VECTOR_PROVENANCE','blocker',id+' SVG 与生产状态不一致',id,'重新核验 SVG 来源和生产状态'));
  if(d.svg&&project?.vectors&&!inspectSVGSource(d.svg).safe)issues.push(issue('SVG_UNSAFE','blocker',id+' SVG 来源未通过静态安全检查',id,'重新生成安全、带 viewBox 的静态 SVG'));
 }
 if(project?.vectors&&dirs.some(d=>!d.svg?.trim()))issues.push(issue('VECTOR_MISSING','blocker','标记为已生成 SVG，但缺少部分矢量文件',null,'重新生成缺失的 SVG'));
 if(project?.source==='example-only')issues.push(issue('DEMO_ONLY','blocker','当前为演示方案，不能作为正式生成成果',null,'运行真实模型并完成审核'));
 if(!project?.vectors)issues.push(issue('NO_FINAL_ASSET','info','目前只有设计策划或预览，尚无正式矢量资产',null,'按需生成真实 SVG'));
 issues.sort((a,b)=>({blocker:0,major:1,minor:2,info:3}[a.severity]-{blocker:0,major:1,minor:2,info:3}[b.severity]));
 return {schema:'davylab-design-qa-v1',engine:'native-static-heuristics',passed:!issues.some(x=>x.severity==='blocker'||x.severity==='major'),automated_asset_gate_passed:!!project?.vectors&&project?.source!=='example-only'&&!issues.some(x=>x.severity==='blocker'||x.severity==='major'),checks,issues,limits:['未运行真实浏览器视觉比对','SVG 仅静态源码启发式检查，未替代浏览器 DOM 安全解析或可编辑性验收','未核查商标、字体和图片授权','未验证实际模型供应商响应']};
}
