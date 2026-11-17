import {test,expect} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';

const home=process.env.BASE_URL ? new URL('./',process.env.BASE_URL).href : 'http://127.0.0.1:4175/';

test('desktop studio uses available width with readable inspector and a tall centered canvas',async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1731,height:900});
  await page.goto(home+'#studio');
  await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
  await expect(page.locator('#mockApp')).toHaveClass(/mock-hirst/);
  const metrics=await page.evaluate(()=>{
    const box=s=>document.querySelector(s).getBoundingClientRect();
    const sidebar=box('.sidebar'),view=box('.main-view'),canvas=box('.canvas-panel'),paper=box('#canvasPaper'),inspector=box('.inspector'),header=box('.studio-workspace-header');
    return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,sidebar:sidebar.width,view:view.width,
      canvas:{x:canvas.x,width:canvas.width,height:canvas.height},paper:{width:paper.width,height:paper.height},
      inspector:{x:inspector.x,width:inspector.width,height:inspector.height,scrollHeight:document.querySelector('.inspector').scrollHeight},
      headerHeight:header.height,remainingRight:innerWidth-inspector.right};
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.view).toBeGreaterThan(1400);
  expect(metrics.canvas.width).toBeGreaterThan(900);
  expect(metrics.canvas.height).toBeGreaterThan(610);
  expect(metrics.paper.width).toBeGreaterThan(850);
  expect(metrics.inspector.width).toBeGreaterThanOrEqual(310);
  expect(metrics.inspector.width).toBeLessThanOrEqual(370);
  expect(metrics.inspector.scrollHeight).toBeGreaterThan(metrics.inspector.height);
  expect(metrics.remainingRight).toBeLessThan(70);
  expect(metrics.headerHeight).toBeLessThan(105);
  await mkdir('artifacts/designos3',{recursive:true});
  await page.screenshot({path:'artifacts/designos3/studio-wide-desktop.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('zoom, fit, immersive canvas and escape work without changing exported design',async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto(home+'#studio');
  await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
  await expect(page.locator('#canvasPaper')).toHaveCSS('zoom','1');
  await page.getByRole('button',{name:'放大预览'}).click();
  await expect(page.locator('#canvasZoomValue')).toHaveText('110%');
  await expect(page.locator('#canvasPaper')).toHaveCSS('zoom','1.1');
  await page.getByRole('button',{name:'适应窗口'}).click();
  await expect(page.locator('#canvasPaper')).toHaveCSS('zoom','1');
  await page.locator('[data-action=toggle-fullscreen]').click();
  await expect(page.locator('body')).toHaveClass(/studio-fullscreen/);
  await expect(page.locator('.canvas-panel')).toHaveCSS('position','fixed');
  const width=await page.locator('.canvas-panel').evaluate(el=>el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(1390);
  await mkdir('artifacts/designos3',{recursive:true});
  await page.screenshot({path:'artifacts/designos3/studio-fullscreen.png',fullPage:true});
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/studio-fullscreen/);
  await page.locator('[data-action=hirst-variant][data-variant=blossom]').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-json]').first().click()]);
  const data=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(data.project.chromaticVariant).toBe('blossom');
  expect(data.design.artDirection.variant.colors).toHaveLength(6);
});

test('tablet properties open in a reversible drawer with canvas prioritized',async ({page})=>{
  await page.setViewportSize({width:1024,height:820});
  await page.goto(home+'#studio');
  await expect(page.locator('.canvas-panel')).toBeVisible();
  await expect(page.locator('.studio-inspector-toggle')).toBeVisible();
  await expect(page.locator('#inspectorPanel')).toBeHidden();
  const canvasWidth=await page.locator('.canvas-panel').evaluate(el=>el.getBoundingClientRect().width);
  expect(canvasWidth).toBeGreaterThan(650);
  await page.locator('.studio-inspector-toggle').click();
  await expect(page.locator('#inspectorPanel')).toBeVisible();
  await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
  await expect(page.locator('#mockApp')).toHaveClass(/mock-hirst/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#inspectorPanel')).toBeHidden();
  await expect(page.locator('.canvas-panel')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1025);
});

for(const width of [375,390,430,820]){
  test('studio viewport '+width+'px preserves usability and avoids horizontal overflow',async ({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto(home+'#studio');
    await expect(page.locator('.canvas-panel')).toBeVisible();
    await expect(page.locator('.studio-inspector-toggle')).toBeVisible();
    const first=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(first).toBeLessThanOrEqual(width+1);
    await page.locator('.studio-inspector-toggle').click();
    await expect(page.locator('#inspectorPanel')).toBeVisible();
    await page.locator('[data-action=choose-profile][data-profile=hirst-chromatic]').click();
    await page.locator('[data-action=hirst-variant][data-variant=spin]').click();
    await expect(page.locator('#mockApp')).toHaveClass(/hirst-theme-spin/);
    await page.locator('.inspector-mobile-header [data-action=toggle-inspector]').click();
    await expect(page.locator('#inspectorPanel')).toBeHidden();
    await page.locator('[data-action=device][data-device=phone]').click();
    await expect(page.locator('#canvasPaper')).toHaveClass(/is-phone/);
    const last=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(last).toBeLessThanOrEqual(width+1);
    if(width===390||width===820){
      await mkdir('artifacts/designos3',{recursive:true});
      await page.screenshot({path:'artifacts/designos3/studio-'+width+'px.png',fullPage:true});
    }
  });
}
