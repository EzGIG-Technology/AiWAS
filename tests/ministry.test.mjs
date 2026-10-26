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

test('every institution and the ministry has a logo slot; UM’s files exist', () => {
  for (const m of manifest.filter((x) => x.id !== 'jata-negara')) {
    assert.ok(m.id in logoFiles, `no logo slot for ${m.id}`);
  }
  for (const f of [logoFiles.um, 'um-lockup.png']) {
    assert.ok(
      readFileSync(new URL(`../public/logos/${f}`, import.meta.url)).length >
        1000,
      `${f} missing`,
    );
  }
});

test('small counts are suppressed', () => {
  assert.equal(kpt.suppress(0), '0');
  for (const n of [1, 2, 3, 4]) assert.equal(kpt.suppress(n), '<5');
  assert.equal(kpt.suppress(5), '5');
  assert.equal(kpt.suppress(1234), '1,234');
});

test('the ministry data holds no media, plates, cameras or names', () => {
  const blob = JSON.stringify({
    institutions: kpt.institutions,
    monthly: kpt.nationalMonthly,
    totals: kpt.nationalTotals,
  });
  assert.ok(!/\.(mp4|jpg|png)/.test(blob), 'ministry data references media');
  assert.ok(!/UM-C\d{3}/.test(blob), 'ministry data references a camera');
  for (const p of um.plateReads)
    assert.ok(!blob.includes(p.plate), `ministry data holds plate ${p.plate}`);
  for (const n of um.users.map((u) => u.name))
    assert.ok(!blob.includes(n), `ministry data names ${n}`);
});

test('UM’s row is derived from its own workspace', () => {
  const row = kpt.institutionById('um');
  assert.equal(row.cameras, um.cameras.length);
  assert.equal(row.uptime, um.uptimeWeekly.at(-1).uptime);
  assert.equal(row.verifyP50, um.verifyTimes.at(-1).p50);
  assert.deepEqual(
    row.cctv,
    um.cctvChecklist.map((c) => c.status),
  );
  const confirmed = um.verification.reduce((a, v) => a + v.confirmed, 0);
  const all = um.verification.reduce((a, v) => a + v.confirmed + v.false, 0);
  assert.equal(row.precision, Math.round((confirmed / all) * 100));
  assert.ok(row.privacy.every(Boolean), 'UM runs every privacy control');
});

test('manual returns carry no measured analytics figures', () => {
  for (const i of kpt.institutions.filter(
    (x) => x.connection === 'Manual return',
  )) {
    assert.equal(i.analysed, 0, `${i.id} analysed`);
    assert.equal(i.uptime, null, `${i.id} uptime`);
    assert.equal(i.detections30d, null, `${i.id} detections`);
    assert.equal(i.precision, null, `${i.id} precision`);
  }
});

test('institution figures are within range', () => {
  for (const i of kpt.institutions) {
    assert.ok(i.maturity > 0 && i.maturity <= 100, `${i.id} maturity`);
    assert.ok(i.coverage >= 0 && i.coverage <= 100, `${i.id} coverage`);
    assert.ok(i.analysed <= i.cameras, `${i.id} analysed > cameras`);
    assert.equal(i.cctv.length, kpt.cctvItems.length);
    assert.equal(i.privacy.length, kpt.privacyItems.length);
    if (i.uptime !== null) assert.ok(i.uptime > 90 && i.uptime <= 100);
  }
});

test('the exclusion line names footage, plates, protests and individuals', () => {
  for (const w of ['footage', 'plate', 'protests', 'individuals'])
    assert.ok(kpt.kptExclusionLine.includes(w), w);
});
