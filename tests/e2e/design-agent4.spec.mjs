import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const sample={
  source:'live-deepseek',model:'deepseek-flash',
  strategy:{brand_name:'ISLAND DAYS',tagline:'自然相伴',positioning:'高品质海岛度假',audience:'年轻家庭',personality:'温暖',core_value:'亲子同行',brand_story:'每一段旅行都值得记忆',usage:'网页及印刷',keywords:['海岛','家庭'],assumptions:['商标待查']},
  directions:[
    {id:'A',name:'自然奢华',positioning:'松弛自然',rationale:'温暖绿色',symbol:'日出',typography:'衬线',logo_type:'组合',headline:'自然相伴',palette:['#F5F1E7','#355B46','#E5B76A','#D6DCD3']},
    {id:'B',name:'阳光活力',positioning:'活力',rationale:'阳光假期',symbol:'海浪',typography:'无衬线',logo_type:'图形',headline:'阳光旅途',palette:['#FFF5EA','#185C63','#FCA849','#B1D8DC']},
    {id:'C',name:'国际极简',positioning:'国际',rationale:'海岛现代主义',symbol:'棕榈',typography:'极简字标',logo_type:'字标',headline:'岛屿之间',palette:['#F8F8F3','#1A344B','#ACB0A2','#E9E0D1']}
  ]
};
test('Demo directions are clearly labelled, selectable and saved',async({page})=>{
  await page.goto('/design-agent/');
  await expect(page.getByRole('heading',{name:'一句话，开始设计你的品牌。'})).toBeVisible();
  await page.getByRole('button',{name:'先看看效果'}).click();
  await expect(page.locator('#conceptGrid .concept')).toHaveCount(3);
  await page.locator('[data-edit="0"]').click();
  await page.locator('#d_name').fill('自然奢华 · 定制版');
  await page.locator('#directionForm button[type="submit"]').click();
  await expect(page.locator('#conceptGrid .concept').first()).toContainText('自然奢华 · 定制版');
  await expect(page.locator('#conceptSource')).toContainText('示例');
  await expect(page.locator('.concept .labelnotice').first()).toContainText('非正式 Logo');
  await page.locator('[data-select="0"]').click();
  await expect(page.locator('#openLogo')).toBeEnabled();
  await page.reload();
  await expect(page.locator('#conceptGrid .concept.chosen')).toHaveCount(1);
  await page.locator('#openLogo').click();
  await expect(page).toHaveURL(/\/logo-studio\/\?source=design-agent4/);
  await expect(page.getByText('已接收 Design Agent 4.0 的品牌策略')).toBeVisible();
});
test('AI brand plan handles a genuine response contract and editable strategy',async({page})=>{
  await page.route('**/api/brand/plan',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/design-agent/');
  await page.locator('#brief').fill('我希望打造一个面向年轻家庭的高品质海岛度假品牌');
  await page.locator('#runPlan').click();
  await expect(page.locator('#conceptGrid .concept')).toHaveCount(3);
  await expect(page.locator('#conceptSource')).toContainText('AI STRATEGY');
  await expect(page.locator('#brand_name')).toHaveValue('ISLAND DAYS');
  await page.locator('#tagline').fill('每一程都有光');
  await page.locator('#applyStrategy').click();
  await expect(page.locator('#tagline')).toHaveValue('每一程都有光');
});
test('Provider error is shown without simulated results',async({page})=>{
  await page.route('**/api/brand/plan',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'请先配置 DeepSeek API Key'})}));
  await page.goto('/design-agent/');
  await page.locator('#brief').fill('为一家面向家庭的海岛度假酒店设计品牌');
  await page.locator('#runPlan').click();
  await expect(page.locator('#planFeedback')).toContainText('设计暂未完成');
  await expect(page.locator('#conceptGrid .concept')).toHaveCount(0);
});
for(const width of [375,390,430,1440]){
  test('Responsive P0 workspace at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/design-agent/');
    await page.locator('#loadDemo').click();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    expect(overflow).toBe(false);
    await expect(page.locator('#conceptGrid .concept')).toHaveCount(3);
  });
}
test('Mobile starts with a single obvious action and hides premature workflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/design-agent/');
 await expect(page.getByRole('button',{name:'开始设计 →'})).toBeVisible();
 await expect(page.getByText('你只需要做三件事')).toBeVisible();
 await expect(page.locator('#concepts')).toBeHidden();
 await expect(page.locator('#production')).toBeHidden();
 await expect(page.locator('#strategy')).toBeHidden();
 await page.locator('#brief').fill('我想设计一个面向家庭的高品质海岛度假品牌');
 await page.route('**/api/brand/plan',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'请先配置 DeepSeek API Key'})}));
 await page.locator('#runPlan').click();
 await expect(page.locator('.advanced-settings')).not.toHaveAttribute('open','');
 await expect(page.locator('#planFeedback')).toContainText('设计暂未完成');
});

test('P1 native design QA flags example-only output and exports inspectable JSON',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('#runDesignQA').click();
 await expect(page.locator('#qaSummary')).toContainText('需要修正');
 await expect(page.locator('#qaFindings')).toContainText('演示方案');
 await expect(page.locator('#exportDesignQA')).toBeEnabled();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#exportDesignQA').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^DAVYLAB-design-QA-/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 expect(overflow).toBe(false);
});

for(const width of [375,390,430,768,1440]){
 test('P1 rendered layout audit + screenshot evidence at '+width+'px',async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/design-agent/');
  await page.locator('#loadDemo').click();
  await page.locator('#runDesignQA').click();
  await expect(page.locator('#qaSummary')).toContainText('需要修正');
  const evidence=await page.evaluate(()=>{
   const viewport=window.innerWidth;
   const roots=['#briefPanel','#concepts','#designQA','#production','#archive'];
   const selectors=['#runPlan','#loadDemo','#runDesignQA','#exportDesignQA','#generateVectors','#openLogo'];
   const rect=(el)=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,width:b.width,height:b.height}};
   const panels=roots.map(s=>{const el=document.querySelector(s);return {selector:s,rect:rect(el),visible:getComputedStyle(el).display!=='none'}});
   const controls=selectors.map(s=>{const el=document.querySelector(s);const b=rect(el);return {selector:s,...b,visible:el.checkVisibility({checkVisibilityCSS:true}),disabled:el.disabled}});
   return {viewport,documentWidth:document.documentElement.scrollWidth,panels,controls};
  });
  expect(evidence.documentWidth,'document horizontal overflow').toBeLessThanOrEqual(width+1);
  for(const panel of evidence.panels.filter(x=>x.visible)){
   expect(panel.rect.left,panel.selector+' left').toBeGreaterThanOrEqual(-1);
   expect(panel.rect.right,panel.selector+' right').toBeLessThanOrEqual(width+1);
  }
  for(const control of evidence.controls.filter(x=>x.visible)){
   expect(control.width,control.selector+' touch width').toBeGreaterThanOrEqual(40);
   expect(control.height,control.selector+' touch height').toBeGreaterThanOrEqual(28);
  }
  const screenshot=await page.screenshot({fullPage:true,animations:'disabled'});
  const evidenceDir='artifacts/design-agent-p1';
  await mkdir(evidenceDir,{recursive:true});
  await writeFile(evidenceDir+'/rendered-layout-'+width+'.json',JSON.stringify(evidence,null,2));
  await writeFile(evidenceDir+'/design-agent-'+width+'.png',screenshot);
  await testInfo.attach('rendered-layout-'+width+'.json',{body:Buffer.from(JSON.stringify(evidence,null,2)),contentType:'application/json'});
  await testInfo.attach('design-agent-'+width+'.png',{body:screenshot,contentType:'image/png'});
 });
}

test('QA report cannot be exported after a user changes unsaved brand inputs',async({page})=>{
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('#runDesignQA').click();
 await expect(page.locator('#exportDesignQA')).toBeEnabled();
 await page.locator('#brief').fill('重新定位为更亲民的家庭海岛品牌');
 await expect(page.locator('#exportDesignQA')).toBeDisabled();
 await expect(page.locator('#qaSummary')).toContainText('重新检查');
});

test('P2 remediation plan exports actual before-after contrast without changing design',async({page})=>{
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('[data-edit="0"]').click();
 await page.locator('#d_palette').fill('#FFFFFF, #EEEEEE, #DEAC62, #C7D0B8');
 await page.locator('#directionForm button[type="submit"]').click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#exportRemediation').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^DAVYLAB-remediation-/);
 await expect(page.locator('#qaSummary')).toContainText('1 项');
 await expect(page.locator('#conceptGrid .swatches').first().locator('i').nth(1)).toHaveAttribute('style',/EEEEEE/i);
});

test('P2 user-approved remediation applies change and exports before-after evidence',async({page})=>{
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('[data-edit="0"]').click();
 await page.locator('#d_palette').fill('#FFFFFF, #EEEEEE, #DEAC62, #C7D0B8');
 await page.locator('#directionForm button[type="submit"]').click();
 await page.locator('#runDesignQA').click();
 await expect(page.locator('#qaFindings')).toContainText('预览主色对比不足');
 page.once('dialog',dialog=>dialog.accept());
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#applyRemediation').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^DAVYLAB-remediation-evidence-/);
 await expect(page.locator('#conceptGrid .swatches').first().locator('i').nth(1)).toHaveAttribute('style',/000000/i);
 await page.locator('#runDesignQA').click();
 await expect(page.locator('#qaFindings')).not.toContainText('预览主色对比不足');
 await page.reload();
 await expect(page.locator('#conceptGrid .swatches').first().locator('i').nth(1)).toHaveAttribute('style',/000000/i);
});
test('P2 remediation respects cancellation and does not alter project',async({page})=>{
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('[data-edit="0"]').click();
 await page.locator('#d_palette').fill('#FFFFFF, #EEEEEE, #DEAC62, #C7D0B8');
 await page.locator('#directionForm button[type="submit"]').click();
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#applyRemediation').click();
 await expect(page.locator('#conceptGrid .swatches').first().locator('i').nth(1)).toHaveAttribute('style',/EEEEEE/i);
});

test('P2 actual browser before-after remediation screenshots and measured evidence',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/design-agent/');
 await page.locator('#loadDemo').click();
 await page.locator('[data-edit="0"]').click();
 await page.locator('#d_palette').fill('#FFFFFF, #EEEEEE, #DEAC62, #C7D0B8');
 await page.locator('#directionForm button[type="submit"]').click();
 const evidenceDir='artifacts/design-agent-p2';
 await mkdir(evidenceDir,{recursive:true});
 const before=await page.screenshot({fullPage:true,animations:'disabled'});
 await writeFile(evidenceDir+'/remediation-before-390.png',before);
 const beforeColor=await page.locator('#conceptGrid .swatches').first().locator('i').nth(1).evaluate(el=>getComputedStyle(el).backgroundColor);
 page.once('dialog',dialog=>dialog.accept());
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#applyRemediation').click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/^DAVYLAB-remediation-evidence-/);
 const afterColor=await page.locator('#conceptGrid .swatches').first().locator('i').nth(1).evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(beforeColor).toBe('rgb(238, 238, 238)');
 expect(afterColor).toBe('rgb(0, 0, 0)');
 const after=await page.screenshot({fullPage:true,animations:'disabled'});
 await writeFile(evidenceDir+'/remediation-after-390.png',after);
 const report={schema:'davylab-remediation-visual-evidence-v1',viewport:{width:390,height:844},before_color:beforeColor,after_color:afterColor,before_contrast_ratio:1.16,after_contrast_ratio:21,screenshot_files:['remediation-before-390.png','remediation-after-390.png'],source:'playwright-rendered-browser',manual_visual_approval:false};
 await writeFile(evidenceDir+'/remediation-comparison-390.json',JSON.stringify(report,null,2));
 await testInfo.attach('remediation-before-390.png',{body:before,contentType:'image/png'});
 await testInfo.attach('remediation-after-390.png',{body:after,contentType:'image/png'});
 await testInfo.attach('remediation-comparison-390.json',{body:Buffer.from(JSON.stringify(report,null,2)),contentType:'application/json'});
});
