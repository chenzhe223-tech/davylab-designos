const el=id=>document.getElementById(id);
function makeGuide(){
 const svg=el('svgEditor').value.trim();if(!svg)throw new Error('尚无可导出的 AI / 导入 SVG');
 const brand=el('brand').value.trim()||'DAVYLAB',tagline=el('tagline').value.trim();
 const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
 if(doc.querySelector('parsererror'))throw new Error('SVG XML 解析失败');
 const colors=[...new Set([...svg.matchAll(/#[0-9a-fA-F]{6}\b/g)].map(m=>m[0].toUpperCase()))].slice(0,12);
 const fonts=[...new Set([...doc.querySelectorAll('[font-family]')].map(x=>x.getAttribute('font-family')))].slice(0,8);
 return ['# '+brand+' · Brand Usage Guide','',tagline?'**品牌主张：**'+tagline:'','', '## 标志','- 主文件：logo.svg（以交付的矢量文件为准）','- 变体：单色、深底、浅底及小图标版本需从同一源设计复核；未生成的变体不能冒充已交付','- 安全区域：建议按字标高度的 20% 起步，正式数值需人工确认','- 最小尺寸：需通过 24 / 32 / 64 px 实测，不自动认定通过','','## 从 SVG 提取的色彩',...(colors.length?colors.map(x=>'- '+x):['- 文件中未发现标准六位 HEX 色值，请人工记录最终品牌色']),'','## 字体',...(fonts.length?fonts.map(x=>'- '+x+'（须确认授权及是否转曲）'):['- 未在 SVG 中发现明确 font-family 声明，需补字体规范']),'','## 应用与输出','- 网站、App 图标、印刷品、社交媒体、PPT、标牌','- 印刷需检查 CMYK、工艺及实体小尺寸；数字稿不等于印刷合格','','## 发布门禁','- 商标相似性和注册可用性：未自动认证','- 字体及素材授权：需审查','- 视觉稿与 SVG 一致性：需复核','- 24px 可读性：需人工实测','','By DAVYLAB'].filter(Boolean).join('\n');
}
function saveFile(filename,content,type){const blob=new Blob([content],{type});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
el('downloadBrandGuide').addEventListener('click',()=>{try{saveFile('DAVYLAB-brand-guide.md',makeGuide(),'text/markdown');el('aiStatus').textContent='已根据当前 SVG 生成品牌规范草案，需人工补充授权和商标审查。'}catch(err){el('aiStatus').textContent=err.message}});

window.DAVYLAB_BRAND_GUIDE=makeGuide;
