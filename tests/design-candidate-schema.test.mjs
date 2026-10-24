import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = JSON.parse(await readFile(new URL('../schemas/design-candidate.schema.json', import.meta.url), 'utf8'));

test('design candidate contract requires traceable reasoning, evidence, preview and delivery', () => {
  assert.equal(schema.schemaVersion, undefined);
  assert.deepEqual(schema.required, ['schemaVersion', 'candidateId', 'brief', 'direction', 'decision', 'evidence', 'preview', 'delivery']);
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
