import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const hubUrl = process.env.RESOURCE_HUB_URL || (process.env.BASE_URL ? new URL('./resources/', process.env.BASE_URL).href : 'http://127.0.0.1:4175/resources/');
const privateFixture = {
  schemaVersion: '1.0.0',
  registryVersion: 'test-private-fixture',
  resources: [{
    id: 'private-procurement-sample',
    name: '私有采购 Skill 测试项',
    englishName: 'Private Procurement Test Skill',
    type: 'skill',
    category: 'procurement-private',
    categoryLabel: '私有采购能力',
    version: 'test',
    status: 'active',
    summary: '对供应商报价进行比较，检查税态、缺项并生成采购分析。',
    whenToUse: ['比较供应商报价与税态', '核对报价清单和缺项'],
    notFor: ['非采购场景'],
    triggers: ['供应商报价', '税态核查'],
    tags: ['采购', '报价'],
    capabilities: ['报价对比', '税态核查'],
    inputs: ['供应商报价文件'],
    outputs: ['采购比价结果'],
    requirements: ['读取完整 Skill 原文'],
    guardrails: ['不得编造报价数据'],
    agentSupport: ['WorkBuddy'],
    source: {
      repository: 'private/test-repository',
      visibility: 'private',
      ref: 'main',
      path: 'skills/private-procurement-sample/SKILL.md',
      blobSha: 'a'.repeat(40),
      access: 'authorized-github-connection-or-local-workspace'
    }
  }]
};

async function openHub(page) {
  await page.addInitScript((fixture) => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('private-registry.json')) {
        return Promise.resolve(new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }));
      }
      return originalFetch(input, init);
    };
  }, privateFixture);
  await page.goto(hubUrl);
  await expect(page.locator('#connectionState')).toContainText('私有目录已加载');
}

test('resource hub: public and authenticated private catalogues merge with filters and details', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openHub(page);
  await expect(page.locator('#resourceCards .resource-card')).toHaveCount(26);
  await expect(page.locator('#skillCount')).toHaveText('23');
  await expect(page.locator('#privateCount')).toHaveText('1');
  await expect(page.locator('#publicCount')).toHaveText('24');
  await page.locator('#visibilityFilter').selectOption('private');
  await expect(page.locator('#resourceCards .resource-card')).toHaveCount(1);
  await expect(page.locator('#resourceCards .resource-card').first()).toContainText('私有采购 Skill 测试项');
  await page.locator('#resourceCards .resource-card').first().click();
  await expect(page.locator('#resourceDetail')).toContainText('skills/private-procurement-sample/SKILL.md');
  await page.locator('#visibilityFilter').selectOption('all');
  await page.locator('[data-type="skill"]').click();
  await expect(page.locator('#resourceCards .resource-card')).toHaveCount(23);
  await page.locator('#searchInput').fill('文章插图');
  await expect(page.locator('#resourceCards .resource-card').first()).toContainText('文章插图规划与生成');
  expect(errors).toEqual([]);
});

test('resource hub: private resources participate in local task matching and mobile layout does not overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openHub(page);
  await page.locator('#intentInput').fill('比较供应商报价、检查税态和缺项');
  await page.locator('#matchButton').click();
  await expect(page.locator('#resourceCards .resource-card').first()).toContainText('私有采购 Skill 测试项');
  const size = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(size.body).toBeLessThanOrEqual(size.viewport + 1);
  expect(errors).toEqual([]);
});
