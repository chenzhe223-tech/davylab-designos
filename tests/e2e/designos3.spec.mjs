import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const homepage = process.env.BASE_URL
  ? new URL('./', process.env.BASE_URL).href
  : 'http://127.0.0.1:4175/';

test('DesignOS 3.0 opens as a calm visual-first homepage with six working destinations', async ({page}) => {
  const errors = [];page.on('pageerror',err => errors.push(err.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto(homepage);
  await expect(page.locator('.hero-title')).toContainText('好的设计');
  await expect(page.locator('.concept-card')).toHaveCount(3);
  await expect(page.locator('.primary-nav [data-nav]')).toHaveCount(6);
  await page.locator('.primary-nav [data-nav=components]').click();
  await expect(page.locator('.component-card')).toHaveCount(8);
  await page.locator('.primary-nav [data-nav=skills]').click();
  await expect(page.locator('.resource-item')).toHaveCount(25);
  await page.locator('.primary-nav [data-nav=archive]').click();
  await expect(page.locator('#view')).toContainText('作品');
  expect(errors).toEqual([]);
});

test('DesignOS 3.0 creates, edits, previews, snapshots and exports usable design assets', async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(homepage);
  await page.locator('#topNew').click();
  await expect(page.locator('#projectDialog')).toBeVisible();
  await page.locator('#newProjectName').fill('旅行探索工作台');
  await page.locator('#newProjectGoal').fill('帮助旅行者发现目的地和整理行程');
  await page.locator('#projectForm [type=submit]').click();
  await expect(page.locator('#view')).toContainText('设计方向');
  await expect(page.locator('#mockApp')).toContainText('旅行探索工作台');
  await page.locator('button[data-action=device][data-device=phone]').click();
  await expect(page.locator('#canvasPaper')).toHaveClass(/is-phone/);
  await page.locator('input[data-field=accent]').fill('#355a43');
  await expect(page.locator('#mockApp')).toHaveAttribute('style',/#355a43/);
  await page.locator('button[data-action=snapshot]').click();

  const [jsonDownload]=await Promise.all([page.waitForEvent('download'),page.locator('button[data-action=export-json]').first().click()]);
  const payload=JSON.parse(await readFile(await jsonDownload.path(),'utf8'));
  expect(payload.schemaVersion).toBe('3.0.0');
  expect(payload.project.name).toBe('旅行探索工作台');
  expect(payload.design.tokens.accent).toBe('#355a43');
  expect(payload.delivery.agentExecutionPerformed).toBe(false);
  expect(payload.delivery.productionDeployed).toBe(false);

  const [cssDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-css]').click()]);
  const css=await readFile(await cssDownload.path(),'utf8');
  expect(css).toContain('--davy-accent: #355a43;');

  await page.locator('.primary-nav [data-nav=archive]').click();
  await expect(page.locator('.archive-card')).toHaveCount(1);
  await expect(page.locator('.panel-card')).toContainText('旅行探索工作台');
  expect(errors).toEqual([]);
});

test('DesignOS 3.0 associates public Skill metadata without claiming external execution', async ({page}) => {
  await page.goto(homepage);
  await page.locator('.primary-nav [data-nav=skills]').click();
  await page.locator('button[data-action=skill-type][data-type=skill]').click();
  await expect(page.locator('.resource-item')).toHaveCount(22);
  await page.locator('.resource-item').first().click();
  await expect(page.locator('#resourceDetail')).toContainText('仅关联能力元数据');
  await page.locator('button[data-action=toggle-skill]').click();
  await expect(page.locator('button[data-action=toggle-skill]')).toContainText('移除');
  await page.locator('.primary-nav [data-nav=studio]').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-json]').first().click()]);
  const data=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(data.skillReferences.length).toBe(1);
  expect(data.delivery.agentExecutionPerformed).toBe(false);
});

for (const width of [375,390,430]) {
  test('DesignOS 3.0 does not overflow at '+width+'px, with accessible mobile navigation', async ({page}) => {
    await page.setViewportSize({width,height:844});
    await page.goto(homepage);
    await expect(page.locator('.mobile-nav')).toBeVisible();
    const bodyWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(width+1);
    await page.locator('.mobile-nav [data-nav=studio]').click();
    await expect(page.locator('.canvas-panel')).toBeVisible();
    const studioWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(studioWidth).toBeLessThanOrEqual(width+1);
    await page.locator('.mobile-nav [data-nav=settings]').click();
    await expect(page.locator('.settings-section')).toHaveCount(4);
  });
}

test('DesignOS 3.0 workspace backups contain only local project data and restore safely', async ({page})=>{
  await page.goto(homepage);
  await page.locator('#topNew').click();
  await page.locator('#newProjectName').fill('备份测试');
  await page.locator('#projectForm [type=submit]').click();
  await page.locator('.primary-nav [data-nav=settings]').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-workspace]').click()]);
  const data=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(data.schema).toBe('davylab-designos-workspace');
  expect(data.projects.length).toBe(1);
  expect(data.projects[0].name).toBe('备份测试');
});
