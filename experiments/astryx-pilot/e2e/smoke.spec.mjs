import {test,expect} from '@playwright/test';
test('Astryx button increments and responsive layout does not overflow',async ({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Astryx compatibility lab'})).toBeVisible();
  const button=page.getByRole('button',{name:'Clicked 0 times'});
  await button.click();
  await expect(page.getByRole('button',{name:'Clicked 1 times'})).toBeVisible();
  const filter=page.getByRole('textbox',{name:'Filter examples'});
  await filter.fill('navigation');
  await expect(page.locator('li').filter({hasText:'Navigation'})).toBeVisible();
  await expect(page.locator('p[role="status"]')).toHaveText('1 results');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
  expect(overflow).toBe(false);
});
