import test from 'node:test';
import assert from 'node:assert/strict';
import { industries } from '../app/industries.ts';
import {
  layoutFor,
  occupancyFor,
  observationsFor,
  observationSummary,
  PLOT,
} from '../app/site-layout.ts';
import { presenceSeed } from '../app/presence-data.ts';

test('every industry has plan geometry for every monitored zone', () => {
  for (const i of industries) {
    const plates = layoutFor(i.id);
    const mapped = new Set(plates.map((p) => p.zone));
    for (const z of i.zones)
      assert.ok(mapped.has(z), `${i.id}: no plan geometry for "${z}"`);
    assert.equal(mapped.size, plates.length, `${i.id}: duplicate plate`);
    // No plate may be placed for an area the industry never monitors.
    for (const p of plates)
      assert.ok(
        !i.privateZones.includes(p.zone),
        `${i.id}: excluded area "${p.zone}" is drawn on the plan`,
      );
  }
});

test('plates stay inside the plot', () => {
  for (const i of industries)
    for (const p of layoutFor(i.id)) {
      assert.ok(p.x >= 0 && p.y >= 0, `${i.id}/${p.zone} outside plot origin`);
      assert.ok(p.x + p.w <= PLOT.w, `${i.id}/${p.zone} overflows plot width`);
      assert.ok(p.y + p.d <= PLOT.d, `${i.id}/${p.zone} overflows plot depth`);
      assert.ok(p.height >= 0);
    }
});

test('an area without coverage reports unknown, never zero', () => {
  for (const i of industries) {
    const plates = layoutFor(i.id);
    const dark = [plates[0].zone, plates[1].zone];
    const occ = occupancyFor(i.id, plates, dark, 0);
    for (const o of occ) {
      if (dark.includes(o.zone)) {
        assert.equal(o.count, null, `${i.id}/${o.zone} must not report a count`);
        assert.equal(o.pressure, 'unknown');
        assert.equal(o.covered, false);
        assert.notEqual(o.count, 0, 'an unwatched area is not an empty area');
      } else {
        assert.ok(typeof o.count === 'number' && o.count >= 0);
        assert.notEqual(o.pressure, 'unknown');
      }
    }
  }
});

test('occupancy is anonymous: a count, never a roster', () => {
  const plates = layoutFor('education');
  const occ = occupancyFor('education', plates, [], 3);
  const names = new Set(presenceSeed.map((p) => p.name));
  for (const o of occ) {
    assert.deepEqual(
      Object.keys(o).sort(),
      ['capacity', 'count', 'covered', 'pressure', 'zone'],
      'occupancy must not carry per-person fields',
    );
    assert.ok(!names.has(o.zone));
  }
});

test('occupancy is deterministic for a given tick', () => {
  const plates = layoutFor('retail');
  const a = occupancyFor('retail', plates, [], 7);
  const b = occupancyFor('retail', plates, [], 7);
  assert.deepEqual(a, b);
  const c = occupancyFor('retail', plates, [], 8);
  assert.notDeepEqual(a, c, 'estimates should move between ticks');
});

test('observations are placed with an age and a certainty, not a live fix', () => {
  const plates = layoutFor('education');
  const obs = observationsFor(presenceSeed, plates, 'Main gate');
  assert.equal(obs.length, presenceSeed.length);
  const zones = new Set(plates.map((p) => p.zone));
  for (const o of obs) {
    assert.ok(o.zone === null || zones.has(o.zone), 'placed off the plan');
    assert.ok(Number.isFinite(o.ageMinutes) && o.ageMinutes >= 0);
    assert.ok(
      ['recorded', 'stale', 'unverified', 'departed'].includes(o.certainty),
    );
    assert.ok(o.source, 'every placement must name where the record came from');
    // Boundary areas are never a plausible "last seen" location.
    if (o.zone) {
      const plate = plates.find((p) => p.zone === o.zone);
      assert.notEqual(plate.kind, 'boundary');
    }
  }
});

test('a record needing verification is never shown as confirmed', () => {
  const plates = layoutFor('education');
  for (const o of observationsFor(presenceSeed, plates, 'Main gate')) {
    const seed = presenceSeed.find((p) => p.id === o.id);
    if (seed.status === 'Needs verification')
      assert.equal(o.certainty, 'unverified');
    if (seed.status === 'Not recorded today') assert.equal(o.zone, null);
    if (seed.status === 'Departure recorded')
      assert.equal(o.certainty, 'departed');
  }
});

test('summary separates on-plan records from off-site records', () => {
  const plates = layoutFor('education');
  const obs = observationsFor(presenceSeed, plates, 'Main gate');
  const s = observationSummary(obs);
  assert.equal(s.total, presenceSeed.length);
  assert.equal(s.placed + s.offSite, s.total);
  assert.equal(s.recorded + s.stale + s.unverified, s.placed);
});

test('industries without a presence register place nobody', () => {
  for (const i of industries.filter((x) => !x.presence)) {
    const plates = layoutFor(i.id);
    assert.deepEqual(observationsFor([], plates, plates[0].zone), []);
  }
});
