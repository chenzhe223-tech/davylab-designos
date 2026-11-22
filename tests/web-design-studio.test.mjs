import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('P0 editor is emitted at its isolated route with real editable controls', async () => {
 const html = await readFile(new URL('../dist/web-design-studio/index.html', import.meta.url), 'utf8');
 for (const s of ['data-device="desktop"','data-device="tablet"','data-device="phone"','id="name"','id="title"','id="accent"','addEventListener']) assert.ok(html.includes(s), 'Missing '+s);
 assert.match(html,/Prototype only/);
 assert.match(html,/no AI generation yet/);
});
