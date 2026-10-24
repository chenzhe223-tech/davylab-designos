import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const appUrl = process.env.BASE_URL || pathToFileURL(resolve('dist/index.html')).href;

test('desktop: search, select, preview, compare and generate an agent prompt', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(appUrl);
  await expect(page.locator('#cards .profile')).toHaveCount(5);
  await page.locator('#intentInput').fill('高级、有科技感、适合手机的 AI 数据看板');
  await page.locator('#matchIntent').click();
  await expect(page.locator('#matchSummary')).toContainText('Analytics Dashboard');
  await page.locator('#confirmDesign').click();
  await expect(page.locator('#promptOutput')).toBeVisible();
  await expect(page.locator('#promptOutput')).toHaveValue(/Analytics Dashboard/);
  expect(errors).toEqual([]);
});

test('mobile: layout fits viewport and keyboard focus hides fixed action dock', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appUrl);
  await expect(page.locator('#cards .profile')).toHaveCount(5);
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
  await page.locator('#intentInput').focus();
  await expect(page.locator('body')).toHaveClass(/keyboard-open/);
  await expect(page.locator('.mobile-action-dock')).toBeHidden();
  expect(errors).toEqual([]);
});

test('JSON export preview contains canonical profile identifiers and version', async ({ page }) => {
  await page.goto(appUrl);
  await page.locator('#exportAll').click();
  const json = await page.locator('#jsonPreview').textContent();
  const parsed = JSON.parse(json);
  expect(parsed.profiles.length).toBe(5);
  expect(parsed.profiles.some(profile => profile.profileId === 'davylab-warm-editorial')).toBeTruthy();
  expect(parsed.profiles.every(profile => Boolean(profile.version))).toBeTruthy();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#confirmDownload').click()]);
  const filePath = await download.path();
  const downloaded = JSON.parse(await readFile(filePath, 'utf8'));
  expect(downloaded.profiles.length).toBe(5);
  expect(downloaded.profiles.some(profile => profile.profileId === 'davylab-warm-editorial')).toBeTruthy();
});

test('first-run experience is product-category agnostic, not dashboard-first', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(appUrl);
  await expect(page.locator('h1')).toContainText('先理解你想做的产品');
  await expect(page.locator('#intentInput')).toHaveAttribute('placeholder', /AI 旅行 App/);
  const firstProjectType = await page.locator('#projectType option').first().textContent();
  expect(firstProjectType).toContain('移动应用');
  expect(firstProjectType).not.toMatch(/dashboard|看板/i);
  await expect(page.locator('[data-intent="AI 旅行 App，探索小众目的地并记录旅行记忆"]')).toBeVisible();
});

test('production UI: live Skill search, candidate generation, selection and capability catalog', async ({ page }) => {
  test.skip(!process.env.BASE_URL, 'Real external engine acceptance runs only after deployment against the configured live URL.');
  test.setTimeout(180000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(appUrl);
  await page.locator('#intentInput').fill('Travel app for young travelers: discover hidden destinations, plan routes and save travel memories');
  await page.locator('#matchIntent').click();
  await expect(page.locator('#engineStatus')).toContainText('已完成真实检索', { timeout: 90000 });
  await expect(page.locator('#engineEvidenceBody')).toContainText('产品类别映射');
  await page.locator('#generateEngineCandidate').click();
  await expect(page.locator('#engineCandidate .engine-candidate-card').first()).toBeVisible({ timeout: 120000 });
  await expect(page.locator('#engineCandidate .candidate-live-preview').first()).toBeVisible();
  await expect(page.locator('#engineCandidate .candidate-preview-notice').first()).toContainText('对比度');
  await page.locator('#engineCandidate .engine-candidate-card [data-choose-direction]').first().click();
  await expect(page.locator('#engineCandidate .engine-candidate-card.is-selected')).toHaveCount(1);
  await expect(page.locator('#engineCandidate .engine-candidate-actions button').filter({ hasText: '下载此方向 JSON' }).first()).toBeVisible();
  await page.locator('#toggleSkillCatalog').click();
  await expect(page.locator('#skillCatalogDomain option').first()).toBeVisible({ timeout: 30000 });
  await page.locator('#skillCatalogDomain').selectOption('styles.csv');
  await page.locator('#skillCatalogSearchButton').click();
  await expect(page.locator('#skillCatalogResults .engine-catalog-record').first()).toBeVisible({ timeout: 30000 });
  await page.locator('#skillCatalogResults .engine-catalog-record summary').first().click();
  await expect(page.locator('#skillCatalogResults .engine-catalog-record pre').first()).toBeVisible();
  expect(errors).toEqual([]);
});
