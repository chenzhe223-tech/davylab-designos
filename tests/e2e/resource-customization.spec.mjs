import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const resourceUrl = process.env.RESOURCE_HUB_URL || 'http://127.0.0.1:4175/resources/';

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

test('resource hub: export production-ready JSON preset and CSS tokens', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(resourceUrl);
  await page.locator('#openUiStudio').click();
  await expect(page.locator('#uiStudioBackdrop')).toBeVisible();

  const jsonDownloadPromise=page.waitForEvent('download');
  await page.locator('#exportUiJson').click();
  const jsonDownload=await jsonDownloadPromise;
  expect(jsonDownload.suggestedFilename()).toBe('davylab-design-profile.json');
  const json=JSON.parse(await (await import('node:fs/promises')).readFile(await jsonDownload.path(),'utf8'));
  expect(json.source).toBe('DAVYLAB DesignOS Resource Hub');
  expect(json.appearance).toHaveProperty('accent');

  const cssDownloadPromise=page.waitForEvent('download');
  await page.locator('#exportUiCss').click();
  const cssDownload=await cssDownloadPromise;
  expect(cssDownload.suggestedFilename()).toBe('davylab-design-tokens.css');
  const css=await (await import('node:fs/promises')).readFile(await cssDownload.path(),'utf8');
  expect(css).toContain('--davy-accent:');
  expect(css).toContain(':root');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
  expect(overflow).toBe(false);
});

test('resource hub: import validated design preset and reject invalid configuration', async ({page}) => {
  await page.goto(resourceUrl);
  await page.locator('#openUiStudio').click();
  const valid={
    schemaVersion:'1.0.0',source:'DAVYLAB DesignOS Resource Hub',
    appearance:{theme:'midnight',accent:'#123456',background:'#101c2b',surface:'#17283a',text:'#eaf4ff',border:'#36516a',navSurface:'#1b3044',layout:'bento',nav:'top',motion:'spring',intensity:7,duration:600,font:'inter',reduced:false}
  };
  await page.locator('#importUiJsonFile').setInputFiles({name:'profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
  await expect(page.locator('body')).toHaveAttribute('data-theme','midnight');
  await expect(page.locator('body')).toHaveAttribute('data-layout','bento');
  await expect(page.locator('#uiStudioStatus')).toContainText('已导入');

  const invalid={...valid,appearance:{...valid.appearance,accent:'red; background:url(test)'}};
  await page.locator('#importUiJsonFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
  await expect(page.locator('#uiStudioStatus')).toContainText('导入失败');
  await expect(page.locator('#uiAccent')).toHaveValue('#123456');
});
