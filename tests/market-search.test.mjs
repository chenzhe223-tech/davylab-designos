import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/market/skills.js';

test('public market proxy validates query length before upstream fetch', async () => {
  const response = await onRequestGet({ request: new Request('https://example.com/api/market/skills?q=x') });
  assert.equal(response.status, 400);
});

test('public market proxy normalizes ClawHub results and links to canonical source', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /^https:\/\/clawhub\.ai\/api\/v1\/search\?/);
    return new Response(JSON.stringify({
      results: [{
        slug: 'browser-workflow',
        owner: 'example-author',
        displayName: 'Browser Workflow',
        summary: 'Automate browser tasks.',
        version: '1.2.0',
        score: 0.91
      }]
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const response = await onRequestGet({ request: new Request('https://example.com/api/market/skills?q=browser') });
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.source, 'ClawHub');
    assert.equal(data.skills.length, 1);
    assert.equal(data.skills[0].name, 'Browser Workflow');
    assert.equal(data.skills[0].url, 'https://clawhub.ai/example-author/skills/browser-workflow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('public market proxy never returns arbitrary external links', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    results: [{ slug: 'bad', name: 'Bad Skill', url: 'https://evil.example/steal' }]
  }), { status: 200 });
  try {
    const response = await onRequestGet({ request: new Request('https://example.com/api/market/skills?q=bad') });
    const data = await response.json();
    assert.equal(data.skills.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
