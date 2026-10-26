// The EzVision Campus spec, checked against the Universiti Malaya data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  um,
  alerts,
  search,
  govern,
  personas,
  umAccess,
  alertsFor,
} from '../dist/test-ssr/entry.js';

const A = alerts;

test('cameras are unique, on the map and run known detectors', () => {
  assert.equal(new Set(um.cameras.map((c) => c.id)).size, um.cameras.length);
  for (const c of um.cameras) {
    assert.ok(
      c.pos.every((v) => v >= 0 && v <= 100),
      `${c.id} off map`,
    );
    assert.ok(c.detectors.includes('health'), `${c.id} has no health check`);
    for (const d of c.detectors) assert.ok(um.detectors[d], `${c.id}: ${d}`);
  }
});

test('six modules, and every detector belongs to one of them or the core', () => {
  assert.deepEqual(um.moduleIds, [
    'hostel',
    'safe',
    'mobility',
    'welfare',
    'hse',
    'space',
  ]);
  for (const [id, d] of Object.entries(um.detectors))
    assert.ok(d.module === 'core' || um.moduleIds.includes(d.module), id);
});

test('the pilot is two hostel blocks, one female and one male, plus the main gate', () => {
  assert.deepEqual(um.blocks.map((b) => b.residents).sort(), [
    'female',
    'male',
  ]);
  for (const b of um.blocks) {
    const cams = um.cameras.filter((c) => c.block === b.id);
    assert.ok(cams.length >= 5, `${b.id} has ${cams.length} cameras`);
    assert.ok(
      cams.some((c) => c.zoneType === 'lounge'),
      `${b.id} lounge line`,
    );
    assert.ok(
      cams.some((c) => c.zoneType === 'exit-only'),
      `${b.id} exit-only door`,
    );
    assert.ok(
      cams.every((c) => c.pilot && c.edge),
      `${b.id} pilot edge box`,
    );
    assert.deepEqual(b.hours, {
      visitFrom: '17:00',
      visitTo: '22:00',
      curfew: '00:00',
    });
  }
  assert.ok(um.cameraByScene('gate').pilot);
});

test('gender estimation runs only on lounge-line cameras of single-gender blocks', () => {
  for (const c of um.cameras.filter((x) =>
    x.detectors.includes('gender_boundary'),
  )) {
    assert.equal(c.zoneType, 'lounge', c.id);
    assert.ok(c.block, `${c.id} is not in a hostel block`);
  }
});

test('each block has the spec’s six hostel rules, escalating to the command centre in 5 min', () => {
  const six = [
    'Other gender past the lounge line',
    'Visitor past the lounge line',
    'Visitor still inside at closing',
    'Any entry after curfew',
    'Entry through exit-only door or fire exit',
    'More people than card taps',
  ];
  for (const b of um.blocks) {
    const rules = A.seedRules.filter(
      (r) => r.block === b.id && r.module === 'hostel',
    );
    for (const n of six)
      assert.ok(
        rules.some((r) => r.name === n),
        `${b.id}: ${n}`,
      );
    for (const r of rules) {
      assert.equal(r.escalateMin, 5, `${r.id} escalation`);
      assert.match(r.route, /^warden on duty/);
    }
  }
  const other = A.seedRules.find((r) => r.id === 'R-A01');
  assert.match(other.condition, /gender_est = male/);
  assert.equal(
    A.seedRules.find((r) => r.id === 'R-B01').condition,
    'gender_est = female',
  );
});

test('rule ids are unique and every rule’s camera runs its detector', () => {
  assert.equal(new Set(A.seedRules.map((r) => r.id)).size, A.seedRules.length);
  for (const r of A.seedRules) {
    if (r.camera === null) {
      assert.equal(r.detector, 'radar_fall', `${r.id} has no camera`);
      assert.ok(r.sensor);
      continue;
    }
    const c = um.cameraById(r.camera);
    assert.ok(
      c.detectors.includes(r.detector),
      `${r.id}: ${c.id} does not run ${r.detector}`,
    );
  }
});

test('the rule language reads like the spec', () => {
  const r = A.seedRules.find((x) => x.id === 'R-A01');
  const dsl = A.ruleDsl(r, um.blocks[0].hours);
  assert.match(dsl, /^WHEN person \(gender_est = male, confidence ≥ 0\.80\)/);
  assert.match(
    dsl,
    /CROSSES line "Blok A lounge line" INTO zone "residential"/,
  );
  assert.match(dsl, /DURING 00:00–24:00 daily/);
  assert.match(dsl, /THEN alert severity HIGH → warden on duty, KK12/);
  assert.match(dsl, /ESCALATE to command centre if not acknowledged in 5 min/);
});

test('schedules handle windows across midnight and follow block hours', () => {
  const h = um.blocks[0].hours;
  assert.ok(A.inSchedule({ kind: 'curfew' }, '00:30', h));
  assert.ok(!A.inSchedule({ kind: 'curfew' }, '07:00', h));
  assert.ok(A.inSchedule({ kind: 'after-visiting' }, '23:15', h));
  assert.ok(!A.inSchedule({ kind: 'after-visiting' }, '21:00', h));
  assert.ok(
    A.inSchedule({ kind: 'after-visiting' }, '21:00', {
      ...h,
      visitTo: '20:00',
    }),
  );
  assert.ok(
    A.inSchedule({ kind: 'window', from: '18:00', to: '06:00' }, '03:00'),
  );
});

test('lowering a threshold never removes preview hits', () => {
  for (const r of A.seedRules) {
    const strict = A.previewRule({ ...r, threshold: 0.9 }).hits.length;
    const loose = A.previewRule({ ...r, threshold: 0.6 }).hits.length;
    assert.ok(loose >= strict, r.id);
  }
});

test('every alert follows its rule and the five-step lifecycle', () => {
  const statuses = A.lifecycle.map((s) => s.status);
  assert.deepEqual(statuses, [
    'New',
    'Acknowledged',
    'Verified',
    'Actioned',
    'Closed',
  ]);
  assert.equal(
    new Set(A.seedAlerts.map((a) => a.id)).size,
    A.seedAlerts.length,
  );
  for (const a of A.seedAlerts) {
    const r = A.seedRules.find((x) => x.id === a.rule);
    assert.ok(r, `${a.id} rule ${a.rule}`);
    assert.equal(a.module, r.module, `${a.id} module`);
    assert.equal(a.detector, r.detector, `${a.id} detector`);
    assert.equal(a.camera, r.camera, `${a.id} camera`);
    assert.ok(statuses.includes(a.status), `${a.id} status`);
    assert.ok(a.confidence > 0.5 && a.confidence <= 1, `${a.id} confidence`);
    if (['Verified', 'Actioned'].includes(a.status))
      assert.ok(a.verdict, `${a.id} verdict`);
    if (a.status === 'Actioned') assert.ok(a.action, `${a.id} action`);
    if (a.status === 'Closed')
      assert.ok(a.outcome, `${a.id} closed without an outcome`);
    if (a.verdict === 'False alarm')
      assert.equal(a.status, 'Closed', `${a.id} open false alarm`);
    assert.ok(
      a.timeline[0].text.startsWith(`Rule ${a.rule} fired`),
      `${a.id} timeline`,
    );
  }
});

test('cases and alerts point at each other', () => {
  for (const c of A.seedCases)
    for (const id of c.alerts) {
      const a = A.seedAlerts.find((x) => x.id === id);
      assert.ok(a, `${c.id} links missing ${id}`);
      assert.equal(a.caseId, c.id, `${id} does not point back to ${c.id}`);
    }
  for (const a of A.seedAlerts.filter((x) => x.caseId))
    assert.ok(
      A.seedCases.find((c) => c.id === a.caseId)?.alerts.includes(a.id),
      a.id,
    );
});

test('welfare is not discipline: wellbeing and at-height alerts never offer HEP', () => {
  for (const d of ['wellbeing', 'at_height']) {
    const acts = A.actionsFor({ module: 'welfare', detector: d });
    assert.ok(!acts.some((x) => /HEP/.test(x)), d);
    assert.ok(acts.includes('Counsellor follow-up'), d);
  }
  for (const a of A.seedAlerts.filter((x) => x.detector === 'wellbeing'))
    assert.ok(!a.caseId && a.route === 'counselling unit', a.id);
});

test('an unaccepted hostel alert escalates after 5 minutes; other modules do not', () => {
  const lounge = A.alertByKey('track');
  assert.equal(lounge.status, 'New');
  assert.equal(lounge.time, '18:31');
  assert.ok(!A.isEscalated(lounge, '18:35'));
  assert.ok(A.isEscalated(lounge, '18:36'));
  assert.ok(A.isEscalated(lounge, um.DEMO_TIME));
  const plate = A.alertByKey('plate');
  assert.ok(
    !A.isEscalated(plate, '23:00'),
    'mobility alerts route straight to their office',
  );
});

test('the radar alert has no camera and no clip', () => {
  const radar = A.seedAlerts.find((a) => a.detector === 'radar_fall');
  assert.equal(radar.camera, null);
  assert.ok(radar.sensor);
  assert.match(radar.timeline[0].text, /no video exists/);
});

test('the search example follows one description across cameras to the 18:31 alert', () => {
  const q = {
    ...search.emptyQuery,
    from: '17:30',
    to: '18:40',
    top: 'Red',
    bottom: 'Black',
    carrying: 'Backpack',
  };
  const r = search.search(q);
  assert.equal(r.length, 5);
  const t = search.crossCameraTimeline(r[0]);
  assert.equal(t.length, 5);
  assert.equal(t.at(-1).camera, um.cam('hostel'));
  assert.equal(t.at(-1).time, A.alertByKey('track').time);
  assert.equal(new Set(t.map((s) => s.camera)).size, 5);
});

test('sightings hold clothing, objects and plates, never a face or an identity', () => {
  const keys = new Set(search.sightings.flatMap((s) => Object.keys(s)));
  assert.deepEqual(
    [...keys].sort((a, b) => a.localeCompare(b)),
    [
      'bottom',
      'camera',
      'carrying',
      'cls',
      'colour',
      'id',
      'plate',
      'time',
      'top',
    ],
  );
  assert.ok(
    search.sightings.every((s) => um.cameraById(s.camera).status !== 'offline'),
  );
  const plate = search.search({
    ...search.emptyQuery,
    from: '06:00',
    plate: 'jqr551',
  });
  assert.ok(plate.length > 0 && plate.every((s) => s.plate === 'JQR 551'));
});

test('edge boxes add up to the camera estate', () => {
  assert.equal(
    um.edgeBoxes.reduce((a, b) => a + b.cameras, 0),
    um.cameras.length,
  );
});

test('privacy defaults and refusals are written down', () => {
  const controls = govern.privacyControls.map((c) => c.control);
  for (const c of [
    'Face recognition',
    'Gender estimation',
    'Classroom attention scoring',
    'Toilets and changing rooms',
    'Retention',
    'Privacy masking',
    'Audit',
    'Human decision',
  ])
    assert.ok(controls.includes(c), c);
  const ex = govern.exclusions.map((e) => e.item.toLowerCase()).join(' | ');
  for (const must of ['face recognition', 'attention', 'toilets', 'penalties'])
    assert.ok(ex.includes(must), must);
  assert.ok(
    govern.biasTest.every((b) => !/\d+%/.test(b.status)),
    'no accuracy claimed before the bias test',
  );
});

test('ten spec roles plus the ministry, and roles without video never see footage screens', () => {
  const ids = personas.personas.map((p) => p.id);
  assert.equal(ids.length, 11);
  assert.equal(govern.roles.length, 10);
  for (const p of personas.personas.filter((x) => x.workspace === 'um')) {
    const views = umAccess[p.id];
    assert.ok(views?.length, `${p.id} has no views`);
    assert.ok(
      views.includes(p.landing.split('/')[2]),
      `${p.id} lands on a view it cannot open`,
    );
    if (!p.video)
      for (const v of ['wall', 'search', 'console', 'alerts'])
        assert.ok(!views.includes(v), `${p.id} can open ${v}`);
  }
  assert.equal(personas.personaById('warden').workspace, 'app');
});

test('alert scope: a warden sees one college, a counsellor wellbeing only, HEP no live alerts', () => {
  const warden = alertsFor(personas.personaById('warden'), A.seedAlerts);
  assert.ok(warden.length > 0);
  assert.ok(warden.every((a) => a.module === 'hostel' || a.block === 'kk12-a'));
  assert.ok(warden.every((a) => um.blockById(a.block).college === 'kk12'));
  const counsellor = alertsFor(
    personas.personaById('counsellor'),
    A.seedAlerts,
  );
  assert.ok(counsellor.length > 0);
  assert.ok(
    counsellor.every((a) => ['wellbeing', 'at_height'].includes(a.detector)),
  );
  for (const id of ['hep', 'pengetua', 'dpo', 'sysadmin', 'kpt'])
    assert.equal(
      alertsFor(personas.personaById(id), A.seedAlerts).length,
      0,
      id,
    );
  const traffic = alertsFor(personas.personaById('traffic'), A.seedAlerts);
  assert.ok(traffic.every((a) => a.module === 'mobility'));
});

test('pilot KPIs agree with the data behind them', () => {
  const h = A.precisionByModule.find((p) => p.module === 'hostel');
  const precision = Math.round((h.confirmed / (h.confirmed + h.false)) * 100);
  assert.equal(
    A.pilotKpis.find((k) => k.kpi === 'Alert precision').value,
    `${precision}%`,
  );
  assert.ok(
    A.pilotKpis
      .find((k) => k.kpi === 'Time to acknowledge')
      .value.startsWith(`${A.ackTimes.at(-1).p50} min`),
  );
  const w = A.hostelWeekly;
  assert.ok(
    w.at(-1).a + w.at(-1).b < w[2].a + w[2].b,
    'breach trend is not falling',
  );
  assert.equal(
    A.pilotKpis.find((k) => k.kpi === 'Breach trend').value,
    `${w[2].a + w[2].b} → ${w.at(-1).a + w.at(-1).b} a week`,
  );
});

test('counting zones and car parks sit on real cameras and within capacity', () => {
  for (const z of um.zones) {
    assert.ok(um.cameraByScene(z.scene), `${z.name} camera`);
    assert.ok(
      z.now <= z.capacity && z.peak <= z.capacity,
      `${z.name} over capacity`,
    );
  }
  for (const c of um.carParks)
    assert.ok(c.occupied <= c.capacity && c.okuFree <= c.oku, c.name);
});
