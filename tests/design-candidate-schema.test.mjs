import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = JSON.parse(await readFile(new URL('../schemas/design-candidate.schema.json', import.meta.url), 'utf8'));

test('design candidate contract requires traceable reasoning, evidence, preview and delivery', () => {
  assert.equal(schema.properties.schemaVersion.const, '1.0.0');
  assert.deepEqual(schema.required, ['schemaVersion', 'candidateId', 'brief', 'direction', 'decision', 'evidence', 'preview', 'delivery', 'rawEngineOutput']);
  assert.ok(schema.properties.brief.properties.productCategory);
  assert.ok(schema.properties.direction.properties.style);
  assert.ok(schema.properties.direction.properties.palette);
  assert.ok(schema.properties.direction.properties.typography);
  assert.ok(schema.properties.decision.properties.hardConstraints);
  assert.ok(schema.properties.evidence.properties.items);
  assert.ok(schema.properties.preview.properties.kind);
  assert.ok(schema.properties.delivery.properties.agentExecutionPerformed);
});

test('candidate contract explicitly distinguishes upstream engine mode from authored fallback', () => {
  assert.deepEqual(schema.properties.evidence.properties.engine.properties.mode.enum, ['live', 'cli', 'build-time', 'authored-fallback', 'unknown']);
  assert.deepEqual(schema.properties.preview.properties.kind.enum, ['interactive-prototype', 'static-illustration', 'implemented-application']);
});

test('unreviewed candidates preserve unknown evaluation scores instead of fabricating them', () => {
  assert.deepEqual(schema.properties.decision.properties.eligible.type, ['boolean', 'null']);
  assert.deepEqual(schema.properties.decision.properties.softPreferenceScore.type, ['number', 'null']);
  assert.ok(schema.properties.decision.properties.reviewStatus.enum.includes('not-reviewed'));
  assert.ok(schema.required.includes('rawEngineOutput'));
  assert.equal(schema.properties.rawEngineOutput.type, 'object');
});

test('stack compatibility stays unknown until evidence proves compatibility', async () => {
  assert.deepEqual(schema.properties.direction.properties.techStackFit.items.properties.compatible.type, ['boolean', 'null']);
  assert.deepEqual(schema.properties.direction.properties.techStackFit.items.properties.guidanceStatus.enum, ['not-requested', 'matched', 'no-matches']);
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /stackGuidelineCount/);
  assert.match(html, /stackGuidelineResults\.length>0/);
  assert.match(html, /compatible:null,guidanceStatus:stackGuidanceStatus/);
  assert.doesNotMatch(html, /compatible:!!stack/);
});
