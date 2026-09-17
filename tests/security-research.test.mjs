import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  researchCoverage,
  validateCapabilityDraft,
} from '../app/security/research-workflow.ts';
const features = JSON.parse(
  readFileSync(new URL('../app/security/features.json', import.meta.url)),
);
test('all 91 source capabilities have setup, dependencies, acceptance and valid cross references', () => {
  const rows = researchCoverage();
  assert.equal(rows.length, 91);
  assert.equal(new Set(rows.map((r) => r.category)).size, 14);
  assert.equal(new Set(rows.map((r) => r.id)).size, 91);
  for (const r of rows) {
    assert.ok(r.description);
    assert.ok(r.setup.dependency);
    assert.ok(r.setup.acceptance);
    assert.equal(r.setup.fields.length, 4);
    for (const id of r.related)
      assert.ok(
        features.some((f) => f.id === id),
        id,
      );
  }
  assert.equal(
    rows.at(-1).title,
    'Model versioning & explainability reporting',
  );
});
test('configuration draft rejects missing and whitespace-only required settings', () => {
  const fields = ['Zone', 'Schedule'];
  assert.ok(validateCapabilityDraft({}, fields));
  assert.ok(validateCapabilityDraft({ Zone: 'North', Schedule: '  ' }, fields));
  assert.equal(
    validateCapabilityDraft({ Zone: 'North', Schedule: 'After hours' }, fields),
    '',
  );
});
