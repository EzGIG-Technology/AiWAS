import test from 'node:test';
import assert from 'node:assert/strict';
import {
  responseMatrix,
  matrixSummary,
  notifyTargets,
} from '../app/response-matrix.ts';
import { detectionCatalog } from '../app/surveillance-data.ts';

const ids = new Set(detectionCatalog.map((c) => c.id));

test('the matrix transcribes every detection in the source document', () => {
  assert.equal(responseMatrix.length, 22);
  assert.equal(new Set(responseMatrix.map((r) => r.id)).size, 22);
  const s = matrixSummary();
  assert.equal(s.existing, 10, 'ten existing categories');
  assert.equal(s.requested, 6, 'six requested detections');
  assert.equal(s.suggested, 6, 'six additional suggestions');
  assert.equal(s.existing + s.requested + s.suggested, s.total);
});

test('every row is complete and internally consistent', () => {
  for (const r of responseMatrix) {
    assert.ok(r.category && r.detects && r.example, `${r.id} incomplete`);
    assert.ok(r.action, `${r.id} has no system action`);
    assert.ok(r.notify.length > 0, `${r.id} notifies nobody`);
    assert.ok(r.target > 0 && r.target <= 100);
    assert.ok(
      ['Existing', 'Requested', 'Suggested'].includes(r.status),
      `${r.id} bad status`,
    );
    assert.ok(
      ['Ready to evaluate', 'Needs measurement', 'Needs governance decision'].includes(
        r.gate,
      ),
      `${r.id} bad gate`,
    );
    if (r.capability)
      assert.ok(ids.has(r.capability), `${r.id} maps to unknown capability`);
  }
});

test('only existing categories claim a measured baseline', () => {
  for (const r of responseMatrix) {
    if (r.status === 'Existing') assert.equal(r.initial, 80);
    else
      assert.equal(
        r.initial,
        null,
        `${r.id} is not live so it must report no baseline, not a number`,
      );
  }
});

test('anything that escalates outside the school needs a decision first', () => {
  const external = responseMatrix.filter(
    (r) =>
      r.notify.some((n) => /Authorities|Fire department/.test(n)) ||
      /automatic escalation/i.test(r.action),
  );
  assert.ok(external.length >= 4, 'expected external-escalation rows');
  for (const r of external)
    assert.equal(
      r.gate,
      'Needs governance decision',
      `${r.id} escalates outside the school and must not be marked ready`,
    );
});

test('rows that conflict with the platform limits carry a stated reason', () => {
  for (const id of [
    'bullying',
    'weapon',
    'person-type',
    'cheating',
    'theft',
    'violent',
    'uniform',
    'smoking',
  ]) {
    const row = responseMatrix.find((r) => r.id === id);
    assert.ok(row, `${id} missing from the matrix`);
    assert.ok(row.caution && row.caution.length > 40, `${id} needs a caution`);
    assert.equal(
      row.gate,
      'Needs governance decision',
      `${id} conflicts with a platform limit and cannot be ready`,
    );
  }
});

test('no row is both ready to evaluate and carrying a conflict', () => {
  for (const r of responseMatrix)
    if (r.gate === 'Ready to evaluate')
      assert.equal(r.caution, undefined, `${r.id} is ready but has a caution`);
});

test('notify targets are a clean deduplicated set', () => {
  const t = notifyTargets();
  assert.equal(new Set(t).size, t.length);
  assert.ok(t.includes('School admin'));
  assert.deepEqual(t, [...t].sort());
});
