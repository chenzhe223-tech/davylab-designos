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
 await page.locator('#svgEditor').fill(svg.replace('DAVYLAB','DAVYLAB AI'));
 await page.locator('#applySvg').click();
 await expect(page.locator('#aiStatus')).toContainText('已更新本地设计预览');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#downloadAI').click()]);
 const content=await readFile(await download.path(),'utf8');expect(content).toContain('DAVYLAB AI');
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
});
