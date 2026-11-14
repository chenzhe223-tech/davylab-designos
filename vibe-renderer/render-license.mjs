// Remotion 4.0.539+ licensing flags: never silently classify a test render as production.
export function renderLicenseFlags(env=process.env){
 const license=String(env.VIBE_REMOTION_LICENSE_KEY||'').trim();
 if(!license)throw new Error('Missing VIBE_REMOTION_LICENSE_KEY. Confirm free-license eligibility or configure an authorized company license.');
 if(license==='free-license'){
  if(env.VIBE_FREE_LICENSE_CONFIRMED!=='true')throw new Error('Free Remotion license eligibility must be explicitly confirmed before rendering');
 }else if(!/^rm_sec_[A-Za-z0-9_-]+$/.test(license)){
  throw new Error('Invalid server-side Remotion license key');
 }
 const production=env.VIBE_RENDER_PRODUCTION==='true';
 if(production&&env.VIBE_RENDER_COST_APPROVED!=='true')throw new Error('Production rendering needs explicit cost authorization');
 return ['--license-key='+license,'--is-production='+String(production)];
}
