import React from 'react';
import {AbsoluteFill,interpolate} from 'remotion';

type SceneArtProps={frame:number;fps:number;width:number;height:number;durationFrames:number;index:number;title:string;visual?:string;visualFamily?:'auto'|'city'|'particles'|'nature'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const hash=(n:number)=>((Math.sin(n*127.1+71.7)*43758.5453)%1+1)%1;

export const SceneArt=({frame,fps,width,height,durationFrames,index,title,visual='',visualFamily='auto'}:SceneArtProps)=>{
 const text=(title+' '+visual).toLowerCase();
 const isCity=/城市|高楼|建筑|街道|都市|天际|city|building/.test(text);
 const isSpace=/星|宇宙|太空|银河|粒子|星光|space|galaxy|particle/.test(text);
 const isNature=/山|森林|自然|云|海|森林|mountain|forest|ocean/.test(text);
 const family=visualFamily==='auto'?(isCity?'city':isSpace?'particles':isNature?'nature':index%2?'city':'particles'):visualFamily;
 const progress=Math.max(0,Math.min(1,frame/Math.max(1,durationFrames)));
 const t=frame/fps;
 const colors=[['#102a4c','#2474a4','#c7edff'],['#122f4c','#3b83a5','#bce8ff'],['#132c4e','#575dab','#d0c8ff'],['#0a3542','#3b9aaf','#b5f2e8']][index%4];
 const [dark,mid,light]=colors;
 const glow=interpolate(frame,[0,Math.max(1,durationFrames)],[.3,1],clamp);
 const camera=interpolate(frame,[0,Math.max(1,durationFrames)],[0,-width*.025],clamp);
 const particles=Array.from({length:70},(_,i)=>{const x=hash(i*3+index*31)*width,y=hash(i*7+103)*height,r=1.3+hash(i*5+49)*4;return <circle key={i} cx={x} cy={y} r={r} opacity={.2+Math.min(1,glow)*hash(i+70)*.6} fill={light}/>});
 const horizon=height*.75;
 const buildings=Array.from({length:32},(_,i)=>{const bw=width/24,x=i*width/31-width*.03;const h=height*(.10+hash(i*9+5)*.29)*(Math.min(1,Math.max(0,(progress-.02)*3)));const y=horizon-h;const windows=Array.from({length:4},(_,j)=>Array.from({length:8},(_,k)=>{const wx=x+7+j*(bw/5),wy=y+9+k*(h/10);return <rect key={j+'-'+k} x={wx} y={wy} width={Math.max(1,bw/15)} height={Math.max(1,h/65)} fill={light} opacity={hash(i*19+j*11+k*31)>.34?.85:0}/> }));return <g key={i}><rect x={x} y={y} width={bw} height={horizon-y} fill={i%3===0?'#244763':'#143650'} stroke={mid} strokeWidth={1}/>{windows}</g>});
 const mountains=Array.from({length:7},(_,i)=>{const x=i*width/6-width*.18;const peakY=height*(.34+hash(i*4+10)*.2);const points=`${x},${horizon} ${x+width*.18},${peakY} ${x+width*.46},${horizon}`;return <polygon key={i} points={points} fill={i%2?mid:dark} stroke={light} strokeWidth={2} opacity={.92}/>});
 const orbits=Array.from({length:5},(_,i)=>{const radius=height*(.08+i*.055);return <ellipse key={i} cx={width*.66} cy={height*.47} rx={radius*1.7} ry={radius*.5} fill="none" stroke={light} strokeWidth={2+i%2} opacity={.16+.28*Math.sin(t*.3+i)**2} transform={`rotate(${-18+i*7},${width*.66},${height*.47})`}/>});
 return <AbsoluteFill style={{overflow:'hidden',background:`linear-gradient(155deg,${dark},${mid} 68%,#799fc4)`}}>
 <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{position:'absolute',inset:0}}>
 <defs><radialGradient id="skyglow"><stop offset="0%" stopColor={light} stopOpacity=".75"/><stop offset="100%" stopColor={dark} stopOpacity="0"/></radialGradient><linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mid}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
 <circle cx={width*.66} cy={height*.43} r={height*.52} fill="url(#skyglow)" opacity={glow}/>
 {particles}
 <g transform={`translate(${camera} 0)`}>
 {family==='city'?<><rect x="0" y={horizon} width={width*1.1} height={height-horizon} fill="url(#floor)"/>{buildings}<path d={`M0 ${horizon} Q${width*.5} ${horizon-15} ${width} ${horizon}`} stroke={light} strokeWidth="5" fill="none" opacity=".65"/></>:null}
 {family==='nature'?<><rect x="0" y={horizon} width={width} height={height-horizon} fill="url(#floor)"/>{mountains}<ellipse cx={width*.48} cy={horizon+height*.12} rx={width*.6} ry={height*.04} fill={light} opacity=".18"/></>:null}
 {family==='particles'?<>{orbits}<circle cx={width*.66} cy={height*.47} r={height*.048+Math.sin(t)*height*.008} fill={light} opacity=".72"/><path d={`M0 ${horizon} Q${width*.5} ${horizon-height*.08} ${width} ${horizon}`} fill="none" stroke={light} strokeWidth="3" opacity=".2"/></>:null}
 </g>
 </svg>
 </AbsoluteFill>;
};
