// Visual editing helpers operate on actual editable SVG, never on raster-only previews.
const byId=id=>document.getElementById(id);
function applyVisual(){
 const source=byId('svgEditor').value.trim();
 if(!source){byId('aiStatus').textContent='请先生成或选择一个 SVG 设计';return}
 const doc=new DOMParser().parseFromString(source,'image/svg+xml');
 if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg'){byId('aiStatus').textContent='SVG 解析失败';return}
 const word=byId('wordmarkEdit').value.trim();
 const text=doc.querySelector('text');
 if(word&&text)text.textContent=word.slice(0,60);
 const color=byId('colorEdit').value;
 const path=[...doc.querySelectorAll('path,rect,circle,polygon,ellipse')].find(el=>{const fill=el.getAttribute('fill');return fill&&fill!=='none'&&!/^#(?:fff|ffffff)$/i.test(fill)});
 if(path)path.setAttribute('fill',color);
 const size=Number(byId('fontSizeEdit').value);
 if(text&&Number.isFinite(size)&&size>=8&&size<=120)text.setAttribute('font-size',String(size));
 const updated=new XMLSerializer().serializeToString(doc.documentElement);
 byId('svgEditor').value=updated;
 byId('applySvg').click();
}
byId('applyVisual').addEventListener('click',applyVisual);
