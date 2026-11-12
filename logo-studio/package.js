// Self-contained ZIP (stored entries, no third-party JS or network dependency).
const enc=new TextEncoder();
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xEDB88320^(n>>>1):n>>>1;return n>>>0});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function u16(v){return [v&255,(v>>>8)&255]}function u32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
function zipFiles(files){
 const local=[],central=[];let offset=0;
 for(const {name,bytes} of files){
  const filename=enc.encode(name),size=bytes.length,crc=crc32(bytes);
  const header=Uint8Array.from([80,75,3,4,...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0)]);
  local.push(header,filename,bytes);
  central.push(Uint8Array.from([80,75,1,2,...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]),filename);
  offset+=header.length+filename.length+size;
 }
 const centralLen=central.reduce((n,b)=>n+b.length,0);
 const tail=Uint8Array.from([80,75,5,6,...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralLen),...u32(offset),...u16(0)]);
 return new Blob([...local,...central,tail],{type:'application/zip'});
}
async function raster(svg){
 const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{const img=new Image();img.src=u;await img.decode();const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=480;canvas.getContext('2d').drawImage(img,0,0,1200,480);return new Uint8Array(await (await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG failed')),'image/png'))).arrayBuffer())}finally{URL.revokeObjectURL(u)}
}
document.getElementById('downloadPackage').addEventListener('click',async()=>{
 const status=document.getElementById('aiStatus'),svg=document.getElementById('svgEditor').value.trim();
 if(!svg){status.textContent='需要先生成或导入 SVG 后才能打包';return}
 try{
  const xml=new DOMParser().parseFromString(svg,'image/svg+xml');
  if(xml.querySelector('parsererror')||xml.documentElement.localName!=='svg')throw new Error('SVG 无效');
  const guide=window.DAVYLAB_BRAND_GUIDE();
  const qa=window.DAVYLAB_LOGO_QA();
  const hash=await crypto.subtle.digest('SHA-256',enc.encode(svg));
  qa.svgSha256=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');
  document.getElementById('makePrompt').click();
  const brief=document.getElementById('instruction').textContent;
  const files=[{name:'logo.svg',bytes:enc.encode(svg)},{name:'logo.png',bytes:await raster(svg)},{name:'brand-guide.md',bytes:enc.encode(guide)},{name:'agent-brief.md',bytes:enc.encode(brief)},{name:'qa-report.json',bytes:enc.encode(JSON.stringify(qa,null,2))}];
  const blob=zipFiles(files),url=URL.createObjectURL(blob),a=document.createElement('a');a.download='DAVYLAB-Logo-Studio-Delivery.zip';a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);status.textContent='已生成五文件交付包，人工商标、字体及原创性验收状态见 QA 报告';
 }catch(err){status.textContent='打包失败：'+err.message}
});
