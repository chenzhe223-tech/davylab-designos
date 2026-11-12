import { test, expect } from '@playwright/test';
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
  await expect(page.getByRole('heading',{name:'让品牌，从想法走向完整表达。'})).toBeVisible();
  await page.getByRole('button',{name:'查看示例预览'}).click();
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
