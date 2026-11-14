import {execFileSync} from 'node:child_process';

// Compare decoded pixels, not MP4 container bytes or codec timestamps.
// Use a common storyboard moment inside the edited second shot (6 seconds).
export function decodedFrameMd5(videoPath,{second=6,run=execFileSync}={}){
 if(typeof videoPath!=='string'||!videoPath.trim()||!Number.isFinite(second)||second<0||second>120)throw new Error('Invalid frame verification input');
 const output=run('ffmpeg',['-v','error','-ss',String(second),'-i',videoPath,'-map','0:v:0','-frames:v','1','-f','md5','-'],{encoding:'utf8',timeout:30000,maxBuffer:1048576});
 const digest=/^MD5=([0-9a-f]{32})\s*$/im.exec(String(output))?.[1];
 if(!digest)throw new Error('Could not decode a video frame for visual-change verification');
 return digest;
}
export function verifyVisualRerender(before,after,options={}){
 const originalFrameMd5=decodedFrameMd5(before,options);
 const editedFrameMd5=decodedFrameMd5(after,options);
 if(originalFrameMd5===editedFrameMd5)throw new Error('Storyboard edit did not change decoded video pixels at the comparison timestamp');
 return {verified:true,second:options.second??6,originalFrameMd5,editedFrameMd5};
}
