// WORLD/TOON / DAVYLAB design asset packaging — local ZIP with CRC32 and SHA256.
// All previews come from real SVG files, never image-only substitutes.
const enc=new TextEncoder();
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xEDB88320^(n>>>1):n>>>1;return n>>>0});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function u16(v){return [v&255,(v>>>8)&255]}function u32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
function zipFiles(files){
 const local=[],central=[];let offset=0;
 for(const {name,bytes} of files){
  const filename=enc.encode(name),size=bytes.length,crc=crc32(bytes);
  const header=Uint8Array.from([80,75,3,4,...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0)]);
  local.push(header,filename,bytes);
  central.push(Uint8Array.from([80,75,1,2,...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]),filename);
  offset+=header.length+filename.length+size;
 }
 const centralLen=central.reduce((n,b)=>n+b.length,0);
 const tail=Uint8Array.from([80,75,5,6,...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralLen),...u32(offset),...u16(0)]);
 return new Blob([...local,...central,tail],{type:'application/zip'});
}
function validateSvg(svg){
 if(typeof svg!=='string'||svg.length<100||svg.length>16000)return false;
 const normalized=svg.replace(/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/gi,'');
 if(/<!DOCTYPE|<!ENTITY|<\s*\/?\s*(?:script|style|foreignObject|iframe|object|embed|image|use|animate|set|filter|pattern)\b|\bon[a-z]+\s*=|(?:href|src)\s*=|url\s*\(|javascript:|data:|https?:|@import/i.test(normalized))return false;
 const d=new DOMParser().parseFromString(svg,'image/svg+xml');
 return !d.querySelector('parsererror')&&d.documentElement.localName==='svg'&&!!d.documentElement.getAttribute('viewBox');
}
async function raster(svg,width=1200,height=480,background=null){
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{
  const img=new Image();img.src=url;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,width,height)}
  ctx.drawImage(img,0,0,width,height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(new Error('PNG 编码失败')),'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
 }finally{URL.revokeObjectURL(url)}
}
async function sha256(bytes){
 const sum=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(sum),x=>x.toString(16).padStart(2,'0')).join('');
}
function motionConfig(){
 const preset=document.querySelector('#motionPresets button[aria-pressed="true"]')?.dataset.preset||'none';
 return {schema:'davylab-logo-motion-preview-v1',engine:'CSS-local-preview',preset,
 durationSeconds:Number(document.getElementById('motionDuration')?.value||0),
 intensity:Number(document.getElementById('motionIntensity')?.value||0),
 videoExported:false,externalMotionSkillExecuted:false};
}
document.getElementById('downloadPackage').addEventListener('click',async()=>{
 const status=document.getElementById('aiStatus'),selectedSvg=document.getElementById('svgEditor').value.trim();
 if(!validateSvg(selectedSvg)){status.textContent='交付前 SVG 安全/结构检查失败，请检查源文件';return}
 const button=document.getElementById('downloadPackage');button.disabled=true;
 try{
  const snapshot=window.DAVYLAB_LOGO_SESSION?.snapshot?.()||{concepts:[],selected:0};
  const variants=[...snapshot.concepts].filter(c=>validateSvg(c.svg)).map(c=>({...c}));
  if(!variants.length)variants.push({name:'已导入的 SVG 设计',svg:selectedSvg,rationale:'外部导入'});
  // The editor is the canonical source for the selected concept, not its stale thumbnail.
  const selectedIndex=Math.max(0,Math.min(snapshot.selected||0,variants.length-1));
  variants[selectedIndex].svg=selectedSvg;
  if(variants.some(c=>!validateSvg(c.svg)))throw new Error('候选方案包含无效 SVG');
  const qa=window.DAVYLAB_LOGO_QA();
  const guide=window.DAVYLAB_BRAND_GUIDE();
  document.getElementById('makePrompt').click();
  const brief=document.getElementById('instruction').textContent;
  const files=[];
  const add=(name,bytes)=>{files.push({name,bytes:typeof bytes==='string'?enc.encode(bytes):bytes})};
  add('logo.svg',selectedSvg);add('logo.png',await raster(selectedSvg));
  add('preview/light.png',await raster(selectedSvg,1200,480,'#ffffff'));
  add('preview/dark.png',await raster(selectedSvg,1200,480,'#101820'));
  // Small previews are evidence for review, NOT an automatic pass.
  add('preview/32px.png',await raster(selectedSvg,32,13));
  add('preview/24px.png',await raster(selectedSvg,24,10));
  for(let i=0;i<variants.length;i++){
   const stem='concepts/'+String(i+1).padStart(2,'0');
   add(stem+'.svg',variants[i].svg);
   add(stem+'.png',await raster(variants[i].svg));
  }
  add('brand-strategy.json',JSON.stringify({schema:'davylab-logo-strategy-v1',strategy:snapshot.strategy||null,
    provider:snapshot.provider||'external-import',model:snapshot.model||null,
    concepts:variants.map((c,i)=>({index:i+1,name:c.name,rationale:c.rationale||'',construction:c.construction||'',color:c.color||''}))},null,2));
  add('brand-guide.md',guide);
  add('agent-brief.md',brief);
  add('motion-preview.json',JSON.stringify(motionConfig(),null,2));
  const svgHash=await sha256(enc.encode(selectedSvg));
  add('qa-report.json',JSON.stringify({...qa,svgSha256:svgHash,productionReady:false,
    manualReviewRequired:true,structuralCheckPassed:true,trademarkRegistered:false,
    statement:'Static validation and local PNG renders are not independent trademark, typography, or print approvals.'},null,2));
  const entries=[];
  for(const f of files)entries.push({file:f.name,bytes:f.bytes.length,sha256:await sha256(f.bytes)});
  const manifest={schema:'davylab-logo-delivery-v2',createdAt:new Date().toISOString(),brand:document.getElementById('brand').value.trim(),
    source:'svg-live-or-imported',selectedConcept:selectedIndex+1,conceptCount:variants.length,
    provider:snapshot.provider||'external-import',model:snapshot.model||null,
    productionReady:false,reviewState:qa.internalReviewPassed?'internal-review-only':'manual-review-pending',
    files:entries};
  add('manifest.json',JSON.stringify(manifest,null,2));
  const zip=zipFiles(files),url=URL.createObjectURL(zip),a=document.createElement('a');
  a.download='DAVYLAB-Logo-Production.zip';a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  status.textContent='已打包 '+files.length+' 个真实素材（含 '+variants.length+' 套独立 SVG/PNG）；SHA256 清单完整，商标与字体许可仍待人工复核。';
 }catch(error){status.textContent='真实交付打包失败：'+error.message}
 finally{button.disabled=false}
});
