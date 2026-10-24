import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

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
  await expect(page.locator('#promptOutput')).toContainText('Analytics Dashboard');
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
});
