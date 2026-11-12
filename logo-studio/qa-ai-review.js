/* Optional AI SVG-source review; recommendations never approve legal gates. */
const qaEl=id=>document.getElementById(id);
let latestAdvice=null;
async function digestSVG(svg){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(svg));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const advisoryDimensions=['brand','original','legibility','geometry','versatility','typography','production'];
function showAdvisory(data){
 const host=qaEl('qaAdvisoryResult');host.replaceChildren();
 const title=document.createElement('p');title.textContent='AI 源码初评建议：'+data.total+'/100（仅供参考，未写入人工评分）';host.append(title);
 const scores=document.createElement('p');scores.className='muted';scores.textContent=advisoryDimensions.map(key=>key+' '+data.scores[key]).join(' · ');host.append(scores);
 for(const [titleText,key] of [['发现的问题','risks'],['建议改进','recommendations'],['评估限制','limitations']]){
  const h=document.createElement('strong');h.textContent=titleText;host.append(h);
  const ul=document.createElement('ul');for(const line of data[key]||[]){const li=document.createElement('li');li.textContent=line;ul.append(li)}host.append(ul)
 }
}
qaEl('qaAIReview').addEventListener('click',async()=>{
 const svg=qaEl('svgEditor').value.trim();
 if(!svg){qaEl('qaLoopStatus').textContent='先生成或导入 SVG 才能进行 AI 初评';return}
 const button=qaEl('qaAIReview');button.disabled=true;latestAdvice=null;qaEl('qaAdoptAIScores').disabled=true;
 qaEl('qaLoopStatus').textContent='正在请求真实模型分析 SVG 源码；该过程不包含商标检索或真实图像视觉检查。';
 try{
  const fingerprint=await digestSVG(svg),headers={'content-type':'application/json'};
  if(qaEl('providerKey').value.trim())headers['X-Provider-Key']=qaEl('providerKey').value.trim();
  if(qaEl('accessToken').value.trim())headers['X-Logo-Access-Token']=qaEl('accessToken').value.trim();
  const r=await fetch('../api/logo/review',{method:'POST',headers,body:JSON.stringify({brief:qaEl('brief').value.trim(),svg})});
  const data=await r.json().catch(()=>({error:'服务器未返回有效 JSON'}));
  if(!r.ok)throw new Error(data.error||'AI 初评请求失败（'+r.status+'）');
  if(data.source!=='live-model'||data.reviewType!=='advisory-source-only'||!data.scores||data.autoApproved!==false)throw new Error('模型响应未通过质量协议检查');
  if(fingerprint!==await digestSVG(qaEl('svgEditor').value.trim()))throw new Error('生成过程中 SVG 已改变，建议分已失效；请重新初评');
  latestAdvice={...data,fingerprint};showAdvisory(data);qaEl('qaAdoptAIScores').disabled=false;
  qaEl('qaLoopStatus').textContent='模型源码初评完成。请人工核实建议分数，不能自动通过审核门禁。';
 }catch(err){qaEl('qaLoopStatus').textContent='AI 初评未完成：'+err.message}
 finally{button.disabled=false}
});
qaEl('qaAdoptAIScores').addEventListener('click',async()=>{
 if(!latestAdvice)return;
 if(latestAdvice.fingerprint!==await digestSVG(qaEl('svgEditor').value.trim())){qaEl('qaLoopStatus').textContent='当前 SVG 已更改，请重新初评';qaEl('qaAdoptAIScores').disabled=true;return}
 for(const key of advisoryDimensions){qaEl('score-'+key).value=latestAdvice.scores[key]}
 for(const id of ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'])qaEl(id).checked=false;
 qaEl('rubric').dispatchEvent(new Event('input',{bubbles:true}));
 qaEl('qaLoopStatus').textContent='已将 AI 建议分数填入人工评审表；请逐项审阅修改，商标/授权等门禁均未自动通过。';
});
