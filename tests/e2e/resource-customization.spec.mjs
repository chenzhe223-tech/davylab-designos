import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const resourceUrl = process.env.RESOURCE_HUB_URL || pathToFileURL(resolve('dist/resources/index.html')).href;

test('resource hub: customize theme, layout, navigation and motion; persist settings', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(resourceUrl);
  const open = page.locator('#openUiStudio');
  await expect(open).toBeVisible();
  await open.click();
  const dialog = page.locator('#uiStudioBackdrop');
  await expect(dialog).toBeVisible();

  await dialog.locator('[data-theme="midnight"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'midnight');
  await dialog.locator('#uiLayout').selectOption('bento');
  await expect(page.locator('body')).toHaveAttribute('data-layout', 'bento');
  await dialog.locator('#uiNav').selectOption('hidden');
  await expect(page.locator('body')).toHaveAttribute('data-nav', 'hidden');
  await dialog.locator('#doneUiStudio').click();
  const restoreNav = page.locator('#restoreNavButton');
  await expect(restoreNav).toBeVisible();
  await restoreNav.click();
  await expect(page.locator('body')).toHaveAttribute('data-nav', 'left');
  await page.locator('#openUiStudio').click();

  await dialog.locator('[data-motion="spring"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-motion', 'spring');
  await dialog.locator('#uiMotionIntensity').evaluate(el => { el.value = '8'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await dialog.locator('#uiMotionDuration').evaluate(el => { el.value = '650'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await expect(dialog.locator('#uiIntensityValue')).toHaveText('8 / 10');
  await expect(dialog.locator('#uiDurationValue')).toHaveText('650 ms');
  await dialog.locator('#uiReducedMotion').check();
  await expect(page.locator('body')).toHaveAttribute('data-low-motion', 'true');

  await dialog.locator('#doneUiStudio').click();
  await expect(dialog).toBeHidden();
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'midnight');
  await expect(page.locator('body')).toHaveAttribute('data-layout', 'bento');
  await expect(page.locator('body')).toHaveAttribute('data-motion', 'spring');
  await expect(page.locator('body')).toHaveAttribute('data-low-motion', 'true');
  expect(errors).toEqual([]);
});

test('resource hub: mobile customization dialog fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(resourceUrl);
  await page.locator('#openUiStudio').click();
  const dialog = page.locator('.ui-studio');
  await expect(dialog).toBeVisible();
  const dimensions = await dialog.evaluate(el => ({
    width: el.getBoundingClientRect().width,
    viewport: document.documentElement.clientWidth,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.scrollHeight).toBeGreaterThanOrEqual(dimensions.clientHeight);
  await page.locator('#closeUiStudio').click();
  await expect(page.locator('#uiStudioBackdrop')).toBeHidden();
});

test('resource hub: custom accent tokens update and dialog traps keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(resourceUrl);
  const open = page.locator('#openUiStudio');
  await open.click();
  const backdrop = page.locator('#uiStudioBackdrop');
  await expect(backdrop).toBeVisible();

  await backdrop.locator('#uiAccent').evaluate(el => {
    el.value = '#ff5500';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const tokens = await page.locator('body').evaluate(el => ({
    accent: getComputedStyle(el).getPropertyValue('--green').trim(),
    accentStrong: getComputedStyle(el).getPropertyValue('--green-2').trim(),
    accentSoft: getComputedStyle(el).getPropertyValue('--green-soft').trim()
  }));
  expect(tokens.accent).toBe('#ff5500');
  expect(tokens.accentStrong).toContain('color-mix');
  expect(tokens.accentSoft).toContain('color-mix');

  const focusable = backdrop.locator('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])').filter({ visible: true });
  const count = await focusable.count();
  expect(count).toBeGreaterThan(1);
  const first = focusable.first();
  const last = focusable.last();
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(first).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(backdrop).toBeHidden();
  await expect(open).toBeFocused();
});
