/* Hero particle system · original DAVYLAB local motion rendering.
 * Native Canvas2D (not a claimed remote Motion Lab engine integration). */
const canvas=document.getElementById('heroParticles');
if(canvas){
 const frame=canvas.closest('.hero-cover'),ctx=canvas.getContext('2d',{alpha:true});
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const controls={density:document.getElementById('heroParticleDensity'),speed:document.getElementById('heroParticleSpeed'),glow:document.getElementById('heroParticleGlow'),play:document.getElementById('heroParticlePlay')};
 let width=0,height=0,pixelRatio=1,visible=true,playing=!reduce.matches,raf=0,last=0,particles=[],pointer={x:0,y:0,active:false},density=Number(controls.density.value),speed=Number(controls.speed.value),glow=Number(controls.glow.value);
 const random=(a,b)=>a+Math.random()*(b-a);
 function resize(){
  const bounds=frame.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
  pixelRatio=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);
  canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  reseed();
 }
 function reseed(){
  const count=Math.min(100,Math.round(density*.75));particles=Array.from({length:count},(_,i)=>({
   angle:random(0,Math.PI*2),distance:random(.26,.53),radius:random(.6,2.5),phase:random(0,Math.PI*2),
   drift:random(.13,.6),shade:i%4,x:0,y:0
  }));
 }
 function render(timestamp){
  raf=0;if(!visible||!playing)return;
  const dt=Math.min(36,Math.max(0,timestamp-last||16));last=timestamp;
  ctx.clearRect(0,0,width,height);
  const t=timestamp*.00025*speed,centerX=width*.53,centerY=height*.50,span=Math.min(width,height);
  ctx.save();
  // Two restrained orbital rings to visually anchor the brand, not a busy neon effect.
  ctx.strokeStyle='rgba(98,143,241,.14)';ctx.lineWidth=.85;
  ctx.beginPath();ctx.ellipse(centerX,centerY,span*.40,span*.30,-.42,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(185,118,221,.10)';ctx.beginPath();ctx.ellipse(centerX,centerY,span*.49,span*.34,.46,0,Math.PI*2);ctx.stroke();
  const colors=['110,176,255','145,125,244','247,162,202','155,188,213'];
  for(const p of particles){
   p.angle+=dt*.00004*p.drift*speed;
   const a=p.angle+t*.20+p.phase*.03;
   const radius=p.distance*span;
   const px=centerX+Math.cos(a)*radius*1.35;
   const py=centerY+Math.sin(a)*radius*.81;
   const dx=px-pointer.x,dy=py-pointer.y,dist=Math.hypot(dx,dy);
   const influence=pointer.active?Math.max(0,1-dist/140)*10:0;
   const x=px+Math.cos(a+.4)*influence,y=py+Math.sin(a+.4)*influence;
   const opacity=.26+glow*.005+Math.sin(t*2+p.phase)*.10;
   ctx.beginPath();ctx.arc(x,y,p.radius,0,Math.PI*2);
   ctx.fillStyle='rgba('+colors[p.shade]+','+Math.min(.85,opacity)+')';ctx.fill();
  }
  ctx.restore();
  raf=requestAnimationFrame(render);
 }
 function schedule(){cancelAnimationFrame(raf);raf=0;last=0;if(visible&&playing&&!reduce.matches)raf=requestAnimationFrame(render)}
 function freeze(){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,width,height)}
 function status(){controls.play.textContent=playing&&!reduce.matches?'Ⅱ 暂停粒子':'▶ 播放粒子';controls.play.setAttribute('aria-pressed',String(playing&&!reduce.matches));frame.style.setProperty('--hero-glow',String(glow/100));}
 controls.density.addEventListener('input',()=>{density=Number(controls.density.value);reseed();});
 controls.speed.addEventListener('input',()=>{speed=Number(controls.speed.value)});
 controls.glow.addEventListener('input',()=>{glow=Number(controls.glow.value);status()});
 controls.play.addEventListener('click',()=>{playing=!playing;if(reduce.matches&&playing)playing=false;status();playing?schedule():freeze()});
 frame.addEventListener('pointermove',e=>{const r=frame.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true},{passive:true});
 frame.addEventListener('pointerleave',()=>{pointer.active=false});
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false;if(visible)schedule();else freeze()},{threshold:.05});intersection.observe(frame);
 const observer=new ResizeObserver(resize);observer.observe(frame);
 reduce.addEventListener('change',()=>{if(reduce.matches){playing=false;freeze()}else playing=true;status();schedule()});
 resize();status();schedule();
 window.addEventListener('pagehide',()=>{freeze();intersection.disconnect();observer.disconnect()},{once:true});
}
