"""KNOWA deterministic no-video-model rendering service. Isolated Render free worker."""
import asyncio, json, os, pathlib, secrets, shutil, subprocess, tempfile, time, hmac, base64, hashlib, math
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from playwright.sync_api import sync_playwright

app=FastAPI(title="KNOWA Zero-Model Motion",docs_url=None,redoc_url=None)
TOKEN=os.getenv("KNOWA_MOTION_TOKEN","")
JOBS={}
QUEUE_LIMIT=2
TTL=3600
ENGINE_VERSION="knowa-motion-render-p0.1"

HTML=r'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>html,body{padding:0;margin:0;background:#102238}canvas{display:block}</style><canvas id="stage" width="540" height="720"></canvas><script>
const sceneData=window.__STORYBOARD__;
const c=document.getElementById("stage"),g=c.getContext("2d",{alpha:false});
c.width=sceneData.width;c.height=sceneData.height;
c.setAttribute("data-composition-id","knowa-science");
c.setAttribute("data-width",c.width);
c.setAttribute("data-height",c.height);
c.setAttribute("data-duration",sceneData.durationSec);
c.setAttribute("data-fps",sceneData.fps);
const W=c.width,H=c.height,scenes=sceneData.scenes,P=sceneData.palette,D=sceneData.durationSec;
function clamp(x){return Math.max(0,Math.min(1,x))}
function ease(x){return .5-.5*Math.cos(Math.PI*clamp(x))}
function lines(s,x,y,maxW,px,col){g.font="bold "+px+"px sans-serif";g.fillStyle=col;g.textAlign="left";let cur="",rows=[];for(const ch of String(s||"")){if(g.measureText(cur+ch).width>maxW&&cur){rows.push(cur);cur=ch}else cur+=ch}if(cur)rows.push(cur);rows.slice(0,4).forEach((str,i)=>g.fillText(str,x,y+i*px*1.4))}
function rect(x,y,w,h,r){g.beginPath();g.roundRect(x,y,Math.max(1,w),Math.max(1,h),r);g.fill()}
function background(t){g.fillStyle=P.bg1;g.fillRect(0,0,W,H);const gra=g.createLinearGradient(0,0,W,H);gra.addColorStop(0,P.bg2);gra.addColorStop(1,P.bg1);g.fillStyle=gra;g.fillRect(W*.025,H*.025,W*.95,H*.95);g.strokeStyle="#ffffff30";g.strokeRect(W*.045,H*.045,W*.91,H*.91);g.font="bold "+Math.floor(W*.025)+"px sans-serif";g.fillStyle=P.text;g.fillText("KNOWA  /  SCIENCE MOTION",W*.07,H*.095);for(let i=0;i<55;i++){const a=i*2.399963+Math.sin(i*4.72)*.2,x=(i*127.12%W)+Math.sin(t*.22+i)*9,y=(i*177.81%H);g.beginPath();g.arc(x,y,1.2+i%3,0,Math.PI*2);g.fillStyle=P.primary;g.globalAlpha=.11+.09*Math.sin(a+t*.45)**2;g.fill()}g.globalAlpha=1}
function drawScene(scene,local,t){const cx=W*.5,cy=H*.4,r=W*.13,type=scene.visualType;g.lineWidth=Math.max(2,W*.005);if(type==="svg-stroke-hero"){for(let i=0;i<4;i++){g.beginPath();g.ellipse(cx,cy,r+i*W*.035,r*.62+i*W*.022,i*.38+t*.025,0,Math.PI*2*ease(local));g.strokeStyle=i===1?P.accent:P.primary;g.stroke()}}else if(type==="concept-cards"){for(let i=0;i<3;i++){g.globalAlpha=ease(local*2-i*.3);g.fillStyle=i===1?P.accent:P.primary;rect(W*(.09+i*.285),cy-60+Math.sin(t*.5+i)*8,W*.25,W*.19,9);g.fillStyle=P.bg1;lines(["能量","营养","修复"][i],W*(.135+i*.285),cy+10,W*.2,Math.round(W*.045),P.bg1)}g.globalAlpha=1}else if(type==="svg-mechanism"){for(let i=0;i<3;i++){const x=W*(.18+i*.31);g.fillStyle=P.bg2;g.strokeStyle=P.primary;g.strokeRect(x-W*.1,cy-W*.075,W*.2,W*.15);lines(["食物","营养","身体"][i],x-W*.067,cy+8,W*.17,Math.round(W*.04),P.text);if(i<2){g.beginPath();g.moveTo(x+W*.105,cy);g.lineTo(x+W*.19*ease(local),cy);g.strokeStyle=P.accent;g.stroke()}}}else if(type==="canvas-physics-sim"){for(let i=0;i<24;i++){const u=(i/24+local*.65)%1;g.beginPath();g.arc(W*(.19+.62*u),cy+Math.sin(u*6.283+local*3)*W*.075,3+i%5,0,Math.PI*2);g.fillStyle=i%3===0?P.accent:P.primary;g.fill()}}else if(type==="comparison-bars"){const vals=[.72,.88,.57];for(let i=0;i<3;i++){const hi=W*.30*vals[i]*ease(local);g.fillStyle=i===1?P.accent:P.primary;rect(W*(.16+i*.27),cy+W*.17-hi,W*.18,hi,5)}}else{for(let i=0;i<3;i++){g.globalAlpha=ease(local*1.9-i*.27);g.fillStyle=i===1?P.accent:P.primary;rect(W*.13,cy-W*.20+i*W*.17,W*.74,W*.125,8);lines(["能量","知识","结论"][i],W*.19,cy-W*.12+i*W*.17,W*.6,Math.round(W*.048),P.bg1)}g.globalAlpha=1}}
function alpha(s,t){const fade=Math.max(.04,Math.min(.4,s.durationSec*.04));return clamp(Math.min((t-s.startSec)/fade,(s.startSec+s.durationSec-t)/fade,1))}
window.__hyperSeek=async function(time){const t=Math.max(0,Math.min(D-0.0001,Number(time)||0));background(t);let shown=0;for(const s of scenes){const a=alpha(s,t);if(a<=0)continue;shown++;g.save();g.globalAlpha=a;drawScene(s,clamp((t-s.startSec)/s.durationSec),t);lines(s.title,W*.08,H*.70,W*.84,Math.round(W*.056),P.text);lines(s.subtitle,W*.08,H*.80,W*.84,Math.round(W*.034),P.text);g.restore()}if(!shown){const s=scenes[t>=D*.5?scenes.length-1:0];drawScene(s,.6,t);lines(s.title,W*.08,H*.7,W*.84,Math.round(W*.056),P.text)}g.fillStyle=P.accent;rect(W*.08,H*.94,(W*.84)*t/D,Math.max(4,W*.006),3);return true};window.__hyperSeek(0);
</script></html>'''

def validate(b):
    if not isinstance(b,dict): raise ValueError("Invalid storyboard")
    D=int(b.get("durationSec",0))
    if D not in (5,15,30,45):raise ValueError("Duration must be 5/15/30/45")
    ch=b.get("channel","wechat")
    if ch not in ("wechat","xiaohongshu","douyin"):raise ValueError("Unsupported channel")
    p=b.get("palette") or {}
    allowed={"bg1":"#112c45","bg2":"#224666","primary":"#77bedb","accent":"#e9bd75","text":"#ffffff"}
    palette={k:str(p.get(k,allowed[k])) if isinstance(p.get(k,allowed[k]),str) and len(str(p.get(k,allowed[k])))<20 else allowed[k] for k in allowed}
    scenes=b.get("scenes")
    if not isinstance(scenes,list) or not 3<=len(scenes)<=8:raise ValueError("3-8 scenes required")
    out=[]
    for i,s in enumerate(scenes):
        if not isinstance(s,dict): raise ValueError("Bad scene")
        st=float(s.get("startSec",0));dur=float(s.get("durationSec",0))
        if st<0 or dur<=0 or st+dur>D+0.2:raise ValueError("Scene timings out of bounds")
        out.append({"id":str(s.get("id",f"S{i+1}"))[:12],"title":str(s.get("title",""))[:80],"subtitle":str(s.get("subtitle",""))[:160],"startSec":st,"durationSec":dur,"visualType":str(s.get("visualType","concept-cards"))})
    return {"durationSec":D,"width":540,"height":960 if ch=="douyin" else 720,"fps":12,"palette":palette,"scenes":out,"topic":str(b.get("topic",""))[:120],"channel":ch}

def render(project,dir_name):
    path=pathlib.Path(dir_name); path.mkdir(parents=True,exist_ok=True)
    D,W,H,F=project["durationSec"],project["width"],project["height"],project["fps"]
    frames=int(D*F); output=path/"knowa_science.mp4";raw=path/"video_raw.mp4"
    safe=json.dumps(project,ensure_ascii=False).replace("<","\\u003c").replace(">","\\u003e")
    html=HTML.replace("window.__STORYBOARD__",safe)
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","image2pipe","-framerate",str(F),"-vcodec","png","-i","pipe:0","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart",str(raw)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    errors=[];hashes=[]
    try:
      with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path="/usr/bin/chromium",headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
        page=browser.new_page(viewport={"width":W+5,"height":H+5},device_scale_factor=1)
        page.on("pageerror",lambda error:errors.append(str(error)))
        page.set_content(html,wait_until="domcontentloaded")
        page.wait_for_function("typeof window.__hyperSeek === 'function'")
        for i in range(frames):
            page.evaluate("window.__hyperSeek",i/F)
            img=base64.b64decode(page.evaluate("document.querySelector('#stage').toDataURL('image/png').split(',')[1]"))
            proc.stdin.write(img)
            if i in (max(0,int(frames*.10)),int(frames*.45),min(frames-1,int(frames*.98))):hashes.append(hashlib.sha256(img).hexdigest())
        browser.close()
      proc.stdin.close();err=proc.stderr.read().decode();rc=proc.wait(timeout=30)
      if rc or errors:raise RuntimeError("Frame rendering failed: "+err[:300]+" "+str(errors)[:300])
      if len(set(hashes))!=3:raise RuntimeError("Static/blank motion frames")
      cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(raw),"-f","lavfi","-i",f"sine=frequency=164.81:sample_rate=44100:duration={D}","-filter:a",f"volume=0.08,afade=t=in:st=0:d=0.25,afade=t=out:st={max(0,D-.75)}:d=0.75,loudnorm=I=-14:TP=-1.5:LRA=11","-c:v","copy","-c:a","aac","-b:a","192k","-ar","44100","-shortest","-movflags","+faststart",str(output)]
      subprocess.run(cmd,check=True,timeout=80,capture_output=True)
      check=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(output)],timeout=20))
      codecs={v["codec_name"] for v in check["streams"]}
      duration=float(check["format"]["duration"])
      if "h264" not in codecs or "aac" not in codecs or abs(duration-D)>1.1:raise RuntimeError("Media QA failed")
      return {"duration":duration,"codecs":sorted(codecs),"frameHashes":[x[:12] for x in hashes],"resolution":f"{W}x{H}","bytes":output.stat().st_size}
    finally:
      if proc.poll() is None: proc.kill()
      try: proc.stdin.close()
      except Exception:pass
      if raw.exists():raw.unlink()

def cleanup():
    now=time.time()
    for k,v in list(JOBS.items()):
        if now-v["created"]>TTL and v["state"]!="running":
            shutil.rmtree(v.get("dir",""),ignore_errors=True)
            JOBS.pop(k,None)

@app.get("/health")
def health():
    return {"ok":True,"engine":ENGINE_VERSION,"mode":"zero-external-generation-model","available":bool(TOKEN)}

@app.post("/jobs")
async def create_job(request:Request):
    cleanup()
    if not TOKEN:raise HTTPException(503,"Renderer token not configured")
    if not hmac.compare_digest(request.headers.get("x-knowa-motion-token",""),TOKEN):raise HTTPException(403,"Forbidden")
    if int(request.headers.get("content-length","0") or "0")>22000:raise HTTPException(413,"Storyboard too large")
    if sum(x["state"] in ("pending","running") for x in JOBS.values())>=QUEUE_LIMIT:raise HTTPException(429,"Render queue full")
    try:story=validate(await request.json())
    except Exception as e:raise HTTPException(400,str(e))
    job_id=secrets.token_urlsafe(24)
    directory=tempfile.mkdtemp(prefix="knowa_motion_")
    JOBS[job_id]={"state":"pending","created":time.time(),"dir":directory,"metadata":None}
    async def process():
        JOBS[job_id]["state"]="running"
        try:
            JOBS[job_id]["metadata"]=await asyncio.to_thread(render,story,directory)
            JOBS[job_id]["state"]="completed"
        except Exception as e:
            JOBS[job_id]["state"]="failed"
            JOBS[job_id]["error"]=str(e)[:300]
    asyncio.create_task(process())
    return {"ok":True,"jobId":job_id,"status":"pending","engine":ENGINE_VERSION}

@app.get("/jobs/{job_id}")
def job_status(job_id:str):
    cleanup()
    job=JOBS.get(job_id)
    if not job:raise HTTPException(404,"Job not found or expired")
    return {"state":job["state"],"metadata":job.get("metadata"),"error":job.get("error")}

@app.get("/jobs/{job_id}/file")
def job_file(job_id:str):
    job=JOBS.get(job_id)
    if not job or job["state"]!="completed":raise HTTPException(404,"Result not ready")
    return FileResponse(pathlib.Path(job["dir"])/"knowa_science.mp4",media_type="video/mp4",filename="KNOWA_science_motion.mp4")
