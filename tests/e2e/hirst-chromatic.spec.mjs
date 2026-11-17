import {test,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';

const home=process.env.BASE_URL ? new URL('./',process.env.BASE_URL).href : 'http://127.0.0.1:4175/';

test('Hirst Chromatic changes actual composition, persists and exports source-linked colors',async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto(home);
  await page.locator('#topNew').click();
  await page.locator('#newProjectName').fill('赫斯特色彩实验');
  await page.locator('#projectForm [type=submit]').click();
  await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
  await expect(page.locator('#mockApp')).toHaveClass(/hirst-theme-spots/);
  await expect(page.locator('.hirst-art-spots i')).toHaveCount(42);
  await expect(page.locator('[data-action=hirst-variant]')).toHaveCount(4);
  await mkdir('artifacts/designos3',{recursive:true});
  await page.screenshot({path:'artifacts/designos3/hirst-spots.png',fullPage:true});

  await page.locator('[data-action=hirst-variant][data-variant=spin]').click();
  await expect(page.locator('#mockApp')).toHaveClass(/hirst-theme-spin/);
  await expect(page.locator('.hirst-spin-disc')).toHaveCount(1);
  await page.screenshot({path:'artifacts/designos3/hirst-spin.png',fullPage:true});

  const [download]=await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-action=export-json]').first().click()
  ]);
  const payload=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(payload.project.chromaticVariant).toBe('spin');
  expect(payload.design.artDirection.variant.colors).toHaveLength(6);
  expect(payload.design.artDirection.sourceStatus).toContain('not pixel sampled');
  expect(payload.design.artDirection.officialCollaboration).toBe(false);

  await page.reload();
  await expect(page.locator('#mockApp')).toHaveClass(/hirst-theme-spin/);
  expect(errors).toEqual([]);
});

test('Hirst Chromatic honors reduced motion and narrow mobile art layout',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(home);
  await page.locator('.mobile-nav [data-nav=studio]').click();
  await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
  await page.locator('[data-action=hirst-variant][data-variant=spin]').click();
  await page.locator('[data-action=device][data-device=phone]').click();
  await expect(page.locator('.hirst-spin-disc')).toHaveCSS('animation-name','none');
  await expect(page.locator('#canvasPaper')).toHaveClass(/is-phone/);
  const widths=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(widths.doc).toBeLessThanOrEqual(widths.viewport+1);
  await mkdir('artifacts/designos3',{recursive:true});
  await page.screenshot({path:'artifacts/designos3/hirst-mobile.png',fullPage:true});
});
