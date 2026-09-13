import test from 'node:test';
import assert from 'node:assert/strict';
import {
  industries,
  getIndustry,
  industryZoneError,
  capabilityMix,
} from '../app/industries.ts';
import { seedFor, categoriesFor, CONFIDENCE_NONE } from '../app/industry-seed.ts';
import { conceptModules } from '../app/concept-data.ts';
import { ruleError } from '../app/surveillance-data.ts';

const moduleIds = new Set(conceptModules.map((m) => m.id));

test('every industry is complete and uniquely identified', () => {
  assert.ok(industries.length >= 8, 'expected at least eight industries');
  assert.equal(new Set(industries.map((i) => i.id)).size, industries.length);
  assert.equal(
    new Set(industries.map((i) => i.name)).size,
    industries.length,
  );
  for (const i of industries) {
    assert.ok(i.sector && i.tagline && i.regulator, `${i.id} missing summary`);
    assert.ok(i.zones.length >= 5, `${i.id} needs monitored zones`);
    assert.ok(i.privateZones.length >= 3, `${i.id} must name excluded areas`);
    assert.ok(i.sites.length >= 2, `${i.id} needs demonstration sites`);
    assert.ok(i.keyRisks.length >= 3, `${i.id} needs principal risks`);
    for (const key of ['site', 'sitePlural', 'siteTitle', 'person', 'staff'])
      assert.ok(i.lexicon[key], `${i.id} lexicon missing ${key}`);
    for (const m of i.modules)
      assert.ok(moduleIds.has(m), `${i.id} references unknown module ${m}`);
  }
});

test('capability registers are industry-specific and fully documented', () => {
  for (const i of industries) {
    assert.ok(
      i.capabilities.length >= 14,
      `${i.id} has too few capabilities to be a usable register`,
    );
    assert.equal(
      new Set(i.capabilities.map((c) => c.id)).size,
      i.capabilities.length,
      `${i.id} has duplicate capability ids`,
    );
    for (const c of i.capabilities) {
      assert.ok(c.signal, `${i.id}/${c.id} missing observable signal`);
      assert.ok(c.limits, `${i.id}/${c.id} missing limitations`);
      assert.ok(c.response, `${i.id}/${c.id} missing response`);
      assert.ok(c.source, `${i.id}/${c.id} missing source`);
      assert.ok(
        ['Video candidate', 'Sensor integration', 'Staff report'].includes(
          c.kind,
        ),
        `${i.id}/${c.id} has an unknown kind`,
      );
      assert.ok(
        ['Low', 'Medium', 'High', 'Critical'].includes(c.priority),
        `${i.id}/${c.id} has an unknown priority`,
      );
    }
    // Every register must carry service-health capabilities: a dark camera
    // must never read as a quiet area in any industry.
    for (const id of ['tamper', 'stale'])
      assert.ok(
        i.capabilities.some((c) => c.id === id),
        `${i.id} is missing the ${id} coverage capability`,
      );
  }
});

test('registers differ between industries rather than being relabelled', () => {
  const names = (id) => new Set(getIndustry(id).capabilities.map((c) => c.name));
  const health = names('healthcare');
  const build = names('construction');
  const shared = [...health].filter((n) => build.has(n));
  assert.ok(
    shared.length < Math.min(health.size, build.size) / 2,
    'healthcare and construction registers overlap too heavily',
  );
  assert.ok(names('construction').has('Helmet not detected'));
  assert.ok(names('industrial').has('Forklift / pedestrian proximity'));
  assert.ok(names('transport').has('Unattended baggage'));
  assert.ok(names('aged-care').has('Bathroom emergency (camera-free sensor)'));
  assert.ok(!names('retail').has('Helmet not detected'));
});

test('monitored and excluded areas never overlap', () => {
  for (const i of industries)
    for (const z of i.zones)
      assert.ok(
        !i.privateZones.includes(z),
        `${i.id} lists ${z} as both monitored and excluded`,
      );
});

test('rule placement is rejected outside an industry’s monitored areas', () => {
  const care = getIndustry('aged-care');
  assert.equal(industryZoneError('aged-care', care.zones[0], true), '');
  assert.match(
    industryZoneError('aged-care', 'Resident bedrooms', true),
    /excluded from camera monitoring/,
  );
  assert.match(
    industryZoneError('aged-care', 'Racking aisle', true),
    /approved monitored areas/,
  );
  // A zone from one industry must not be accepted by another.
  assert.match(
    industryZoneError('retail', 'Ward corridor', true),
    /approved monitored areas/,
  );
  assert.match(industryZoneError('retail', 'Checkout area', false), /approved/);
});

test('rule validation accepts each industry’s own zones and hours', () => {
  for (const i of industries) {
    const schedules = [i.lexicon.hours, 'After hours', 'Always'];
    const rule = {
      zone: i.zones[0],
      priority: 'High',
      threshold: 80,
      hold: 5,
      schedule: i.lexicon.hours,
      reviewer: i.lexicon.reviewTeam,
      publicOnly: true,
    };
    assert.equal(ruleError(rule, i.zones, schedules), '', `${i.id} rejected`);
    assert.match(
      ruleError({ ...rule, schedule: 'Nonsense' }, i.zones, schedules),
      /valid schedule/,
    );
  }
});

test('only video candidates carry a detection confidence', () => {
  for (const i of industries) {
    const { incidents } = seedFor(i.id);
    assert.ok(incidents.length > 0, `${i.id} produced no records`);
    for (const record of incidents) {
      const cap = i.capabilities.find((c) => c.name === record.category);
      assert.ok(cap, `${i.id}: ${record.category} is not in the register`);
      if (cap.kind === 'Video candidate') {
        assert.notEqual(record.confidence, CONFIDENCE_NONE);
        assert.ok(record.confidence > 0 && record.confidence <= 100);
      } else {
        assert.equal(
          record.confidence,
          CONFIDENCE_NONE,
          `${i.id}: ${cap.kind} "${cap.name}" must not carry a model score`,
        );
      }
    }
  }
});

test('a contextual category is never described as a detector finding', () => {
  for (const i of industries)
    for (const record of seedFor(i.id).incidents) {
      const cap = i.capabilities.find((c) => c.name === record.category);
      if (cap.kind !== 'Video candidate')
        assert.doesNotMatch(
          record.description,
          /detector/i,
          `${i.id}: ${cap.name} description claims a detector`,
        );
    }
});

test('seeded records stay inside their own industry', () => {
  for (const i of industries) {
    const { incidents, cameras, sites, users } = seedFor(i.id);
    assert.deepEqual(sites, i.sites);
    for (const c of cameras) {
      assert.ok(i.zones.includes(c.zone), `${i.id} camera in a foreign zone`);
      assert.ok(i.sites.includes(c.school));
    }
    for (const record of incidents) {
      assert.ok(i.zones.includes(record.zone), `${i.id} record in a foreign zone`);
      assert.ok(i.sites.includes(record.school));
    }
    assert.ok(
      cameras.some((c) => !c.online),
      `${i.id} should demonstrate an offline camera`,
    );
    assert.equal(users.length, 4);
  }
});

test('categories offered by filters match the industry register', () => {
  for (const i of industries)
    assert.deepEqual(categoriesFor(i.id), i.capabilities.map((c) => c.name));
});

test('every industry refuses biometric identification in writing', () => {
  for (const i of industries) {
    assert.ok(i.excluded.length >= 4, `${i.id} needs an exclusion list`);
    const text = i.excluded.map((e) => e.name + ' ' + e.why).join(' ').toLowerCase();
    assert.match(text, /facial recognition|biometric/, `${i.id} must exclude biometrics`);
    for (const e of i.excluded)
      assert.ok(e.why && e.why.length > 20, `${i.id}: "${e.name}" needs a reason`);
  }
});

test('capability mix totals agree with the register', () => {
  for (const i of industries) {
    const mix = capabilityMix(i.id);
    assert.equal(mix.total, i.capabilities.length);
    assert.equal(mix.video + mix.sensor + mix.report, mix.total);
    assert.equal(mix.excluded, i.excluded.length);
    assert.ok(mix.video > 0 && mix.report > 0, `${i.id} needs a balanced register`);
  }
});
