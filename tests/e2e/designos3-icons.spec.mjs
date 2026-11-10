import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const home=process.env.BASE_URL?new URL('./',process.env.BASE_URL).href:'http://127.0.0.1:4175/';
const broken=/[\u2733\u2699\u2197]/; // ✳ ⚙ ↗, emoji-prone on iOS.

for (const width of [375,390,430]) {
  test('mobile '+width+'px uses stable vector icons with no emoji glyphs',async ({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto(home);
    await expect(page.locator('.mobile-nav button .ui-icon')).toHaveCount(6);
    await expect(page.locator('.mobile-nav [data-nav=skills]')).toContainText('资源');
    await page.locator('.mobile-nav [data-nav=skills]').click();
    await expect(page.locator('.resource-icon .ui-icon')).toHaveCount(25);
    await expect(page.locator('.resource-trailing .ui-icon')).toHaveCount(25);
    const findings=await page.evaluate(()=>{
      const body=document.body;
      const first=document.querySelector('.resource-item strong');
      return {
        symbols:/[\u2733\u2699\u2197]/.test(body.innerText),
        itemColor:getComputedStyle(first).color,
        appColor:getComputedStyle(body).color,
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        iconWidths:[...document.querySelectorAll('.resource-icon svg')].map(x=>x.getBoundingClientRect().width)
      };
    });
    expect(findings.symbols).toBe(false);
    expect(findings.overflow).toBe(false);
    expect(findings.itemColor).toBe(findings.appColor);
    expect(Math.min(...findings.iconWidths)).toBeGreaterThanOrEqual(17);
    if(width===390){
      await mkdir('artifacts/designos3',{recursive:true});
      await page.screenshot({path:'artifacts/designos3/mobile-resource-icons-light.png',fullPage:true});
    }
  });
}

test('iPhone-style dark mode preserves readable resource names and icons',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(home);
  await page.locator('.mobile-nav [data-nav=settings]').click();
  await page.locator('[data-action=theme][data-theme=dark]').click();
  await expect(page.locator('body')).toHaveAttribute('data-app-theme','dark');
  await page.locator('.mobile-nav [data-nav=skills]').click();
  await expect(page.locator('.resource-icon .ui-icon')).toHaveCount(25);
  const colors=await page.locator('.resource-item').first().evaluate(button=>{
    const strong=button.querySelector('strong'),svg=button.querySelector('svg');
    return {
      text:getComputedStyle(strong).color,
      body:getComputedStyle(document.body).color,
      icon:getComputedStyle(svg).stroke,
      bg:getComputedStyle(button).backgroundColor,
      overflow:document.documentElement.scrollWidth>innerWidth+1
    };
  });
  expect(colors.text).toBe(colors.body);
  expect(colors.icon).not.toBe('none');
  expect(colors.overflow).toBe(false);
  expect(broken.test(await page.locator('body').innerText())).toBe(false);
  await mkdir('artifacts/designos3',{recursive:true});
  await page.screenshot({path:'artifacts/designos3/mobile-resource-icons-dark.png',fullPage:true});
});

test('external actions render vector arrows, not blue-square emoji',async ({page})=>{
  await page.goto(home);
  await expect(page.locator('#topExport [data-icon=arrow-up-right] svg')).toHaveCount(1);
  const mobileSkills=page.locator('.mobile-nav [data-nav=skills]');
  if(await mobileSkills.isVisible()) await mobileSkills.click();
  else await page.locator('.primary-nav [data-nav=skills]').click();
  await expect(page.locator('.page-heading a .inline-icon svg')).toHaveCount(1);
  await expect(page.locator('.resource-item .resource-trailing svg')).toHaveCount(25);
  expect(broken.test(await page.locator('body').innerText())).toBe(false);
});
