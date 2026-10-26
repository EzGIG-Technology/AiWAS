import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kpt, um, logoFiles } from '../dist/test-ssr/entry.js';

const manifest = JSON.parse(
  readFileSync(
    new URL('../public/logos/manifest.json', import.meta.url),
    'utf8',
  ),
);

test('all 20 public universities and the 8 private ones are present', () => {
  const pub = kpt.institutions.filter((i) => i.type === 'Public (UA)');
  const priv = kpt.institutions.filter((i) => i.type === 'Private (IPTS)');
  assert.equal(pub.length, 20);
  assert.equal(priv.length, 8);
  const manifestIds = manifest
    .filter((m) => m.type !== 'ministry')
    .map((m) => m.id)
    .sort();
  assert.deepEqual(kpt.institutions.map((i) => i.id).sort(), manifestIds);
});

test('every institution and the ministry has a logo slot', () => {
  for (const m of manifest.filter((x) => x.id !== 'jata-negara')) {
    assert.ok(m.id in logoFiles, `no logo slot for ${m.id}`);
  }
});

test('small counts are suppressed', () => {
  assert.equal(kpt.suppress(0), '0');
  for (const n of [1, 2, 3, 4]) assert.equal(kpt.suppress(n), '<5');
  assert.equal(kpt.suppress(5), '5');
  assert.equal(kpt.suppress(1234), '1,234');
});

test('the ministry data holds no media and no names', () => {
  const blob = JSON.stringify({
    institutions: kpt.institutions,
    escalations: kpt.escalations,
    events: kpt.nationalEvents,
    monthly: kpt.nationalMonthly,
  });
  assert.ok(!/\.(mp4|jpg|png)/.test(blob), 'ministry data references media');
  const names = [
    ...um.officers.map((o) => o.name),
    ...um.users.map((u) => u.name),
  ];
  for (const n of names)
    assert.ok(!blob.includes(n), `ministry data names ${n}`);
  assert.ok(!/UM-C\d{3}/.test(blob), 'ministry data references a camera');
});

test('UM’s row is derived from its own workspace', () => {
  const row = kpt.institutionById('um');
  assert.equal(row.cameras, um.cameras.length);
  assert.equal(row.p90, um.responseTimes.at(-1).p90);
  const openHigh = um.incidents.filter(
    (i) =>
      ['Critical', 'High'].includes(i.severity) &&
      !['Resolved', 'False alarm'].includes(i.status),
  ).length;
  assert.equal(row.openHigh, openHigh);
  assert.ok(
    row.privacy.every(Boolean),
    'UM runs with every privacy control in place',
  );
});

test('every escalation belongs to a known institution and is written without names', () => {
  for (const e of kpt.escalations) {
    assert.ok(kpt.institutionById(e.institution), e.id);
    assert.ok(
      !/\b(Encik|Puan|Cik|Dr\.|Prof\.)/.test(e.summary),
      `${e.id} names a person`,
    );
  }
});

test('the exclusion line names protests and individuals', () => {
  for (const w of ['footage', 'names', 'protests', 'individuals'])
    assert.ok(kpt.kptExclusionLine.includes(w));
});

test('institution figures are plausible and within range', () => {
  for (const i of kpt.institutions) {
    assert.ok(
      i.safetyIndex > 0 && i.safetyIndex <= 100,
      `${i.id} safety index`,
    );
    assert.ok(i.p50 < i.p90, `${i.id} P50 should be below P90`);
    assert.ok(i.housedPct >= 0 && i.housedPct <= 100, `${i.id} housed %`);
    assert.equal(i.inspection.length, kpt.inspectionItems.length);
    if (i.connection === 'Manual return')
      assert.equal(i.cameras, 0, `${i.id} has cameras without EzVision`);
  }
});
