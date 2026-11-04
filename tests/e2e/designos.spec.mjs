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
  await expect(page.locator('#cards .profile')).toHaveCount(6);
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
  await expect(page.locator('#cards .profile')).toHaveCount(6);
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
  expect(parsed.profiles.length).toBe(6);
  expect(parsed.profiles.some(profile => profile.profileId === 'davylab-warm-editorial')).toBeTruthy();
  expect(parsed.profiles.every(profile => Boolean(profile.version))).toBeTruthy();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#confirmDownload').click()]);
  const filePath = await download.path();
  const downloaded = JSON.parse(await readFile(filePath, 'utf8'));
  expect(downloaded.profiles.length).toBe(6);
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


test('Looseleaf Paper: profile selection renders the paper-and-ink preview on desktop and mobile', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(appUrl);
  const looseleafCard = page.locator('.profile[data-id="looseleaf-paper"]');
  await expect(looseleafCard).toBeVisible();
  await looseleafCard.locator('[data-preview="looseleaf-paper"]').click();
  const preview = page.locator('#livePreview');
  await expect(preview).toHaveAttribute('data-profile', 'looseleaf-paper');
  await expect(preview).toHaveClass(/looseleaf-preview/);
  const paperStyle = await preview.evaluate(element => ({
    background: getComputedStyle(element).backgroundColor,
    borderWidth: getComputedStyle(element).borderTopWidth,
  }));
  expect(paperStyle.background).toBe('rgb(247, 241, 229)');
  expect(paperStyle.borderWidth).toBe('2px');
  await expect(page.locator('#detail')).toContainText('手绘墨线');
  await expect(page.locator('#detail a[href="https://looseleaf-preview.davylab-designos.pages.dev/examples/looseleaf-showcase.html"]')).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 900 });
  let widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
  await page.locator('[data-device="mobile"]').click();
  await page.setViewportSize({ width: 390, height: 844 });
  widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);
  await page.locator('#confirmDesign').click();
  await expect(page.locator('#promptOutput')).toBeVisible();
  await expect(page.locator('#promptOutput')).toHaveValue(/贴纸、印章、涂鸦仅作为少量辅助标记/);
  await expect(page.locator('#promptOutput')).toHaveValue(/"displayFamily"/);
  expect(errors).toEqual([]);
});


test('Looseleaf showcase: responsive navigation, checklist and quick-add work in a real browser', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const showcaseUrl = pathToFileURL(resolve('dist/examples/looseleaf-showcase.html')).href;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(showcaseUrl);
  await expect(page.locator('h1')).toContainText('Make room for');
  await page.getByRole('button', { name: /灵感 Notes/ }).click();
  await expect(page.locator('#sectionTitle')).toHaveText('灵感收集页');
  const checklist = page.locator('.task input');
  await checklist.nth(1).check();
  await expect(page.locator('#doneCount')).toHaveText('09');
  await page.locator('#quickInput').fill('验证交互预览');
  await page.locator('#addTask').click();
  await expect(page.locator('.task').last()).toContainText('验证交互预览');
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    navTargetHeight: Math.round(document.querySelector('.rail button').getBoundingClientRect().height),
    addTargetHeight: Math.round(document.querySelector('#addTask').getBoundingClientRect().height),
  }));
  expect(mobile.bodyWidth).toBeLessThanOrEqual(mobile.viewportWidth + 1);
  expect(mobile.navTargetHeight).toBeGreaterThanOrEqual(44);
  expect(mobile.addTargetHeight).toBeGreaterThanOrEqual(44);
  expect(errors).toEqual([]);
});


test('Looseleaf component reference: button states, form feedback, dialog keyboard flow and mobile targets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const componentsUrl = pathToFileURL(resolve('dist/examples/looseleaf-components.html')).href;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(componentsUrl);
  await expect(page.locator('h1')).toContainText('Small pieces');
  await page.locator('#primaryAction').click();
  await expect(page.locator('#buttonStatus')).toContainText('主要操作');
  await page.locator('#submitForm').click();
  await expect(page.locator('#formStatus')).toContainText('请先填写项目名称');
  await page.locator('#projectName').fill('E2E component form');
  await page.locator('#submitForm').click();
  await expect(page.locator('#formStatus')).toContainText('E2E component form');
  const dialog = page.locator('[role="dialog"]');
  await page.locator('#openDialog').click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialogBackdrop')).toBeHidden();
  await expect(page.locator('#openDialog')).toBeFocused();
  await page.locator('#openDialog').click();
  await page.locator('#confirmDialog').click();
  await expect(page.locator('#dialogStatus')).toContainText('没有发送请求');
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    buttonHeight: Math.round(document.querySelector('#primaryAction').getBoundingClientRect().height),
    inputHeight: Math.round(document.querySelector('#projectName').getBoundingClientRect().height),
  }));
  expect(mobile.bodyWidth).toBeLessThanOrEqual(mobile.viewportWidth + 1);
  expect(mobile.buttonHeight).toBeGreaterThanOrEqual(44);
  expect(mobile.inputHeight).toBeGreaterThanOrEqual(44);
  expect(errors).toEqual([]);
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
  const candidateCards = page.locator('#engineCandidate .engine-candidate-card');
  await expect(candidateCards).toHaveCount(3);
  await expect(candidateCards.locator('h4')).toHaveText(['均衡现代', '大胆表达', '克制留白']);
  const motionLab = page.locator('#designosMotionLab');
  await expect(motionLab).toBeVisible();
  await expect(motionLab.locator('[data-effect]')).toHaveCount(6);
  await motionLab.locator('[data-effect="spring"]').click();
  await expect(motionLab.locator('[data-effect="spring"]')).toHaveAttribute('aria-pressed', 'true');
  await motionLab.locator('#dsl-duration').fill('2500');
  await expect(motionLab.locator('#dsl-duration-out')).toHaveText('2.5s');
  await motionLab.locator('#dsl-preset-name').fill('E2E product motion');
  await motionLab.locator('#dsl-save').click();
  await expect(motionLab.locator('#dsl-saved-status')).toContainText('已保存在本机');
  await motionLab.locator('#dsl-import').fill('{"schema":"wrong"}');
  await motionLab.locator('#dsl-import-apply').click();
  await expect(motionLab.locator('#dsl-import-status')).toContainText('导入失败');

  const firstCandidate = candidateCards.first();
  await expect(firstCandidate.locator('.candidate-live-preview')).toBeVisible();
  await expect(firstCandidate.locator('.candidate-preview-notice').first()).toContainText('对比度');
  await firstCandidate.locator('.candidate-preview-device button').filter({ hasText: '手机' }).click();
  await expect(firstCandidate.locator('.candidate-live-preview')).toHaveClass(/is-mobile/);
  await firstCandidate.locator('.candidate-preview-device button').filter({ hasText: '桌面' }).click();
  await expect(firstCandidate.locator('.candidate-live-preview')).not.toHaveClass(/is-mobile/);
  await firstCandidate.locator('[data-choose-direction]').click();
  await expect(firstCandidate).toHaveClass(/is-selected/);
  await expect(page.locator('#engineCandidate .engine-candidate-card.is-selected')).toHaveCount(1);

  const [candidateJsonDownload] = await Promise.all([
    page.waitForEvent('download'),
    firstCandidate.getByRole('button', { name: '下载此方向 JSON' }).click(),
  ]);
  const candidateJson = JSON.parse(await readFile(await candidateJsonDownload.path(), 'utf8'));
  expect(candidateJson.schemaVersion).toBe('1.0.0');
  expect(candidateJson.brief.productCategory).toMatch(/travel|tourism/i);
  expect(candidateJson.evidence.engine.version).toBe('2.15.0');
  expect(candidateJson.direction.designDials).toMatchObject({ variance: 5, motion: 5, density: 5 });
  expect(candidateJson.rawEngineOutput.result.design_system.dials).toMatchObject({ variance: 5, motion: 5, density: 5 });
  expect(candidateJson.delivery.agentExecutionPerformed).toBe(false);
  expect(candidateJson.delivery.designSpecAvailable).toBe(false);
  expect(candidateJson.motion.effect).toBe('spring');
  expect(candidateJson.motion.durationMs).toBe(2500);
  expect(candidateJson.motion.schema).toBe('davylab.visual-dna-motion/v1');

  const [designMarkdownDownload] = await Promise.all([
    page.waitForEvent('download'),
    firstCandidate.getByRole('button', { name: '下载此方向 Markdown' }).click(),
  ]);
  const designMarkdown = await readFile(await designMarkdownDownload.path(), 'utf8');
  expect(designMarkdown).toContain('## Product brief');
  expect(designMarkdown).toContain('## Upstream UX guidance');
  expect(designMarkdown).toContain('The candidate has not been approved');

  const [agentBriefDownload] = await Promise.all([
    page.waitForEvent('download'),
    firstCandidate.getByRole('button', { name: '下载 Agent 执行指令' }).click(),
  ]);
  const agentBrief = await readFile(await agentBriefDownload.path(), 'utf8');
  expect(agentBrief).toContain('Agent Implementation Brief');
  expect(agentBrief).toContain('not an implemented application');
  expect(agentBrief).toContain('Acceptance checklist');

  await page.locator('#toggleSkillCatalog').click();
  await expect(page.locator('#skillCatalogDomain option[value="styles.csv"]')).toHaveCount(1, { timeout: 30000 });
  await page.locator('#skillCatalogDomain').selectOption('styles.csv');
  await page.locator('#skillCatalogSearchButton').click();
  await expect(page.locator('#skillCatalogResults .engine-catalog-record').first()).toBeVisible({ timeout: 30000 });
  await page.locator('#skillCatalogResults .engine-catalog-record summary').first().click();
  await expect(page.locator('#skillCatalogResults .engine-catalog-record pre').first()).toBeVisible();
  expect(errors).toEqual([]);
});
