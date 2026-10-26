import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kpt, um, govern, alerts, logoFiles } from '../dist/test-ssr/entry.js';

const manifest = JSON.parse(
  readFileSync(
    new URL('../public/logos/manifest.json', import.meta.url),
    'utf8',
  ),
);

test('the audit covers 20 public and 18 private universities, matching the logo manifest', () => {
  const pub = kpt.institutions.filter((i) => i.type === 'Public (UA)');
  const priv = kpt.institutions.filter((i) => i.type === 'Private (IPTS)');
  assert.equal(pub.length, 20);
  assert.equal(priv.length, 18);
  const manifestIds = manifest
    .filter(
      (m) => !['ministry', 'emblem'].includes(m.type) && m.id !== 'jata-negara',
    )
    .map((m) => m.id)
    .sort();
  assert.deepEqual(kpt.institutions.map((i) => i.id).sort(), manifestIds);
});

test('every institution and the ministry has a logo slot; UM’s files exist', () => {
  for (const m of manifest.filter((x) => x.id !== 'jata-negara'))
    assert.ok(m.id in logoFiles, `no logo slot for ${m.id}`);
  for (const f of [logoFiles.um, 'um-lockup.png'])
    assert.ok(
      readFileSync(new URL(`../public/logos/${f}`, import.meta.url)).length >
        1000,
      `${f} missing`,
    );
});

test('the audit’s headline findings match the spec', () => {
  const t = kpt.auditTotals;
  assert.equal(t.ai, 4);
  assert.equal(t.aiPublic, 2);
  assert.equal(t.aiPrivate, 2);
  assert.deepEqual(
    kpt.institutions
      .filter((i) => i.ai)
      .map((i) => i.id)
      .sort(),
    ['apu', 'sunway', 'um', 'umpsa'],
  );
  assert.equal(t.hostelAi, 0);
  assert.equal(t.hostelClaims, 1);
  assert.deepEqual(
    kpt.institutions
      .filter((i) => i.policyAnalytics)
      .map((i) => i.acronym)
      .sort(),
    ['UMPSA', 'USM', 'UTHM'],
  );
  assert.deepEqual(
    kpt.institutions
      .filter((i) => i.faceRecognition)
      .map((i) => i.id)
      .sort(),
    ['sunway', 'um'],
  );
});

test('audit rows cite their sources; unknowns say so', () => {
  for (const i of kpt.institutions) {
    assert.ok(kpt.maturityLevels.includes(i.maturity), `${i.id} maturity`);
    for (const e of i.evidence)
      assert.match(e.url, /^https:\/\//, `${i.id} evidence`);
    if (
      i.ai ||
      i.policyAnalytics ||
      i.maturity === 'High' ||
      i.maturity.startsWith('Medium')
    )
      assert.ok(i.evidence.length > 0, `${i.id} has no evidence link`);
    if (i.maturity === 'Unknown') assert.equal(i.evidence.length, 0, `${i.id}`);
  }
  for (const l of kpt.leaders) assert.match(l.url, /^https:\/\//, l.university);
});

test('small counts are suppressed', () => {
  assert.equal(kpt.suppress(0), '0');
  for (const n of [1, 2, 3, 4]) assert.equal(kpt.suppress(n), '<5');
  assert.equal(kpt.suppress(5), '5');
  assert.equal(kpt.suppress(1234), '1,234');
});

test('the ministry data holds no media, plates, camera ids, blocks or names', () => {
  const blob = JSON.stringify({
    institutions: kpt.institutions,
    pilot: kpt.pilotAggregates,
    gap: kpt.capabilityGap,
  });
  assert.ok(!/\.(mp4|jpg|png)/.test(blob), 'ministry data references media');
  assert.ok(!/UM-C\d{3}/.test(blob), 'ministry data references a camera');
  assert.ok(!/Blok [AB]/.test(blob), 'ministry data names a hostel block');
  for (const p of um.plateReads)
    assert.ok(!blob.includes(p.plate), `holds plate ${p.plate}`);
  for (const n of govern.users.map((u) => u.name))
    assert.ok(!blob.includes(n), `names ${n}`);
});

test('pilot aggregates are derived from the university’s own hostel data', () => {
  const p = kpt.pilotAggregates;
  assert.equal(p.reporting, 1);
  assert.equal(p.blocks, um.blocks.length);
  assert.deepEqual(
    p.weekly.map((w) => w.confirmed),
    alerts.hostelWeekly.map((w) => w.a + w.b),
  );
  assert.equal(p.ackP50, alerts.ackTimes.at(-1).p50);
  assert.equal(p.uptime, um.uptimeDaily.at(-1).pilot);
});

test('the exclusion line names footage, plates and personal names', () => {
  for (const w of ['footage', 'plates', 'personal names', 'suppressed'])
    assert.ok(kpt.kptExclusionLine.includes(w), w);
});
