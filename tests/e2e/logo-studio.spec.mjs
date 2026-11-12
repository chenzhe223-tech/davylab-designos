import {test,expect} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';
const base='http://127.0.0.1:4175/';
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240"><path d="M10 10L120 10L120 120Z" fill="#2563ff"/><text x="140" y="80">DAVYLAB</text></svg>';
for(const width of [375,390,430,1280]){
  test('Logo Studio responsive workspace '+width+'px',async({page})=>{
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    await page.setViewportSize({width,height:844});await page.goto(base);
    const nav=page.locator('a[href="./logo-studio/"]:visible').first();await expect(nav).toBeVisible();await nav.click();
    await expect(page).toHaveURL(/logo-studio/);
    await expect(page.locator('#quickBtn')).toBeVisible();
    await page.locator('#advancedBtn').click();
    await expect(page.locator('#advanced')).toBeVisible();
    await expect(page.locator('#type option')).toHaveCount(7);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if(width===390){await mkdir('artifacts/logo-studio',{recursive:true});await page.screenshot({path:'artifacts/logo-studio/mobile.png',fullPage:true})}
    expect(errors).toEqual([]);
  });
}
test('Logo Studio exports full instructions for seven provider targets',async({page})=>{
 await page.goto(base+'logo-studio/');
 for(const label of ['ChatGPT','Claude','WorkBuddy','通义千问','Kimi','GLM','Gemini']){
   await page.locator('#agent').selectOption({label});
   await page.locator('#makePrompt').click();
   await expect(page.locator('#instruction')).toContainText(label);
   await expect(page.locator('#instruction')).toContainText('商标');
 }
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadPrompt').click()]);
 expect(download.suggestedFilename()).toMatch(/\.md$/);
});
test('Logo Studio shows honest error without live server credentials',async({page})=>{
 await page.goto(base+'logo-studio/');
 await page.locator('#aiGenerate').click();
 await expect(page.locator('#aiStatus')).toContainText('未完成 AI 生成');
 await expect(page.locator('#aiResults article')).toHaveCount(0);
});
test('Logo Studio renders vetted model outputs; manual SVG editing and SVG export',async({page})=>{
 await page.route('**/api/logo/generate',async route=>{
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({source:'live-model',concepts:[1,2,3].map(i=>({name:'Concept '+i,rationale:'Different concept '+i,svg}))})});
 });
 await page.goto(base+'logo-studio/');
 await page.locator('#aiGenerate').click();
 await expect(page.locator('#aiResults article')).toHaveCount(3);
 await page.locator('#aiResults article').nth(1).getByRole('button').click();
 await expect(page.locator('#selectedName')).toContainText('Concept 2');
 await page.locator('#wordmarkEdit').fill('DAVYLAB AI');
 await page.locator('#colorEdit').fill('#aa22ff');
 await page.locator('#applyVisual').click();
 await page.locator('#applySvg').click();
 await expect(page.locator('#aiStatus')).toContainText('已更新本地设计预览');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadAI').click()]);
 const content=await readFile(await download.path(),'utf8');expect(content).toContain('DAVYLAB AI');expect(content).toContain('#aa22ff');
 const [guideDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadBrandGuide').click()]);
 const guide=await readFile(await guideDownload.path(),'utf8');expect(guide).toContain('#AA22FF');expect(guide).toContain('字体及素材授权');
 const [zipDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadPackage').click()]);
 const zip=await readFile(await zipDownload.path());expect(zip.subarray(0,4).toString('hex')).toBe('504b0304');
 for(const part of ['logo.svg','logo.png','brand-guide.md','agent-brief.md','qa-report.json'])expect(zip.includes(Buffer.from(part))).toBe(true);
 await page.locator('#saveAI').click();
 await expect(page.locator('#aiStatus')).toContainText('已保存在当前浏览器');
});
test('Logo Studio rejects unsafe SVG imports',async({page})=>{
 await page.goto(base+'logo-studio/');
 await page.locator('#svgUpload').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><script>alert(1)</script></svg>')});
 await expect(page.locator('#importStatus')).toContainText('未通过检查');
 await expect(page.locator('#exportImported')).toBeDisabled();
 await page.locator('#svgUpload').setInputFiles({name:'good.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
 await expect(page.locator('#importStatus')).toContainText('静态结构检查通过');
 await expect(page.locator('#exportImported')).toBeEnabled();
 await page.locator('#editImported').click();
 await expect(page.locator('#selectedName')).toContainText('外部 Agent Logo');
 await page.locator('#wordmarkEdit').fill('NEW LAB');
 await page.locator('#applyVisual').click();
 await expect(page.locator('#svgEditor')).toHaveValue(/NEW LAB/);
});

test('Logo Studio quality gate cannot be bypassed below 90 or with missing legal attestations',async({page})=>{
 await page.goto(base+'logo-studio/');
 await expect(page.locator('#qaSummary')).toContainText('0/100');
 const scores={brand:18,original:18,legibility:14,geometry:14,versatility:13,typography:9,production:4};
 for(const [key,value] of Object.entries(scores))await page.locator('#score-'+key).fill(String(value));
 await expect(page.locator('#qaSummary')).toContainText('90/100');
 await expect(page.locator('#qaSummary')).toContainText('未通过发布门禁');
 for(const id of ['logoTrademark','logoFont','logoLegible','logoOriginal','logoVisual'])await page.locator('#'+id).check();
 await expect(page.locator('#qaSummary')).toContainText('内部质量门禁通过');
 await page.locator('#score-brand').fill('17');
 await expect(page.locator('#qaSummary')).toContainText('89/100');
 await expect(page.locator('#qaSummary')).toContainText('未通过发布门禁');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadReview').click()]);
 const review=JSON.parse(await readFile(await download.path(),'utf8'));
 expect(review.internalReviewPassed).toBe(false);
 expect(review.legalTrademarkRegistrationVerified).toBe(false);
});

test('Editorial iOS theme defaults light, Dark Atelier toggles and preference persists',async({page})=>{
 await page.goto(base+'logo-studio/');
 await expect(page.locator('.hero-editorial')).toBeVisible();
 await expect(page.locator('.workspace-grid')).toBeVisible();
 await expect(page.locator('#stageScreen')).toBeVisible();
 await expect(page.locator('body')).toHaveAttribute('data-theme','light');
 await page.locator('#themeSwitch').click();
 await expect(page.locator('body')).toHaveAttribute('data-theme','dark');
 await page.reload();
 await expect(page.locator('body')).toHaveAttribute('data-theme','dark');
 await page.locator('#selectLight').click();
 await expect(page.locator('body')).toHaveAttribute('data-theme','light');
});
test('Motion Lab dynamic preview presets, controls, pause and reusable export',async({page})=>{
 await page.goto(base+'logo-studio/');
 const mark=page.locator('#stageContent');
 await expect(mark).toHaveAttribute('data-motion','float');
 await page.locator('[data-preset="reveal"]').click();
 await expect(mark).toHaveAttribute('data-motion','reveal');
 await page.locator('#motionDuration').fill('5');
 await expect(page.locator('#durationValue')).toContainText('5');
 await page.locator('#motionIntensity').fill('70');
 await expect(page.locator('#intensityValue')).toContainText('70%');
 await page.locator('#playMotion').click();
 await expect(page.locator('#stageScreen')).toHaveClass(/stage-paused/);
 await page.locator('[data-backdrop="black"]').click();
 await expect(page.locator('#stageScreen')).toHaveAttribute('data-backdrop','black');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportMotionSettings').click()]);
 const data=JSON.parse(await readFile(await download.path(),'utf8'));
 expect(data.preset).toBe('reveal');expect(data.durationSeconds).toBe(5);expect(data.intensity).toBe(70);
 expect(data.videoExported).toBe(false);expect(data.skillExecutionClaimed).toBe(false);
});
test('Editorial preview updates from actual edited SVG without presenting templates as AI',async({page})=>{
 await page.route('**/api/logo/generate',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({source:'live-model',concepts:[1,2,3].map(i=>({name:'Concept '+i,rationale:'Different concept '+i,svg}))})}));
 await page.goto(base+'logo-studio/');
 await expect(page.locator('#stageOrigin')).toContainText('OFFLINE');
 await page.locator('#aiGenerate').click();
 await expect(page.locator('#aiResults article')).toHaveCount(3);
 await expect(page.locator('#stageOrigin')).toContainText('AI VECTOR');
 await page.locator('#wordmarkEdit').fill('DAVYLAB EDITORIAL');
 await page.locator('#applyVisual').click();
 await expect(page.locator('#svgEditor')).toHaveValue(/DAVYLAB EDITORIAL/);
 await expect(page.locator('#studioConcepts .concept-card')).toHaveCount(3);
});
for(const width of [375,390,430,1440]){
 test('Editorial canvas layout fits viewport '+width,async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto(base+'logo-studio/');
  await expect(page.locator('.hero-editorial')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  if(width===390){await mkdir('artifacts/logo-studio',{recursive:true});await page.screenshot({path:'artifacts/logo-studio/editorial-mobile.png',fullPage:true})}
  if(width===1440){await mkdir('artifacts/logo-studio',{recursive:true});await page.screenshot({path:'artifacts/logo-studio/editorial-desktop.png',fullPage:true})}
 });
}
