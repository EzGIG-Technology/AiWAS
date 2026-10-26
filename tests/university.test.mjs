import test from 'node:test';
import assert from 'node:assert/strict';
import { um, personas, umAccess } from '../dist/test-ssr/entry.js';

test('camera ids are unique and positions are on the map', () => {
  const ids = new Set(um.cameras.map((c) => c.id));
  assert.equal(ids.size, um.cameras.length);
  for (const c of um.cameras) {
    assert.ok(
      c.pos.every((v) => v >= 0 && v <= 100),
      `${c.id} off map`,
    );
    assert.ok(c.analytics.length > 0, `${c.id} has no analytic`);
    for (const a of c.analytics)
      assert.ok(um.analytics[a], `${c.id} unknown analytic ${a}`);
  }
});

test('every detection comes from a camera that runs its analytic', () => {
  for (const e of um.cameraEvents) {
    const cam = um.cameraById(e.camera);
    assert.ok(cam, `${e.id} camera ${e.camera}`);
    assert.ok(um.analytics[e.analytic], `${e.id} analytic`);
    assert.ok(
      cam.analytics.includes(e.analytic),
      `${e.id}: ${cam.id} does not run ${e.analytic}`,
    );
    assert.ok(e.confidence > 0 && e.confidence <= 1, `${e.id} confidence`);
  }
});

test('the demo detections use cameras that run their analytic', () => {
  for (const d of um.demoDetections) {
    assert.ok(
      um.cameraByScene(d.scene).analytics.includes(d.analytic),
      d.title,
    );
  }
});

test('shared detections name the team and keep the clip', () => {
  for (const e of um.cameraEvents.filter((x) => x.status === 'Shared')) {
    assert.ok(e.sharedWith, `${e.id} shared with nobody`);
    assert.ok(e.bookmarked, `${e.id} clip not kept`);
  }
});

test('the evaluation-only analytic is the dangerous-object one', () => {
  const evalOnly = Object.entries(um.analytics)
    .filter(([, a]) => a.status === 'Evaluation only')
    .map(([k]) => k);
  assert.deepEqual(evalOnly, ['object']);
});

test('the platform refuses facial recognition and protest monitoring in writing', () => {
  const names = um.exclusions.map((e) => e.name.toLowerCase()).join(' | ');
  for (const must of [
    'facial recognition',
    'protest',
    'private spaces',
    're-identification',
  ]) {
    assert.ok(names.includes(must), `missing exclusion: ${must}`);
  }
  const analytics = JSON.stringify(um.analytics).toLowerCase();
  for (const banned of ['face', 'gender', 'emotion', 'protest']) {
    assert.ok(!analytics.includes(banned), `analytic mentions ${banned}`);
  }
});

test('the scope is camera intelligence: no safety-desk workflows remain', () => {
  const blob = JSON.stringify(um).toLowerCase();
  for (const gone of [
    'sos',
    'friend walk',
    'muster',
    'student welfare',
    'dispatch',
    'guard tour',
  ]) {
    assert.ok(!blob.includes(gone), `data still mentions "${gone}"`);
  }
});

test('counting zones and car parks sit on real cameras and within capacity', () => {
  for (const z of um.zones) {
    assert.ok(um.cameraByScene(z.scene), `${z.name} camera`);
    assert.ok(
      z.now <= z.capacity && z.peak <= z.capacity,
      `${z.name} over capacity`,
    );
  }
  for (const c of um.carParks) {
    assert.ok(um.cameraByScene(c.scene), `${c.name} camera`);
    assert.ok(c.occupied <= c.capacity, `${c.name} over capacity`);
  }
});

test('footage search returns places and times only, never offline cameras', () => {
  const results = um.searchFootage({
    cls: 'Person',
    precinct: 'all',
    from: '07:00',
    to: '20:00',
    colour: 'Any colour',
  });
  assert.ok(results.length > 0);
  for (const r of results) {
    assert.notEqual(r.camera.status, 'offline');
    assert.deepEqual(Object.keys(r).sort(), ['camera', 'id', 'label', 'time']);
    assert.equal(r.label, 'Person');
    assert.match(r.time, /^\d{2}:[0-5]\d$/);
  }
  const red = um.searchFootage({
    cls: 'Vehicle',
    precinct: 'all',
    from: '07:00',
    to: '20:00',
    colour: 'Red',
  });
  assert.ok(red.every((r) => r.label === 'Red vehicle'));
  assert.ok(!um.searchClasses.some((c) => /face|cloth|gender/i.test(c)));
});

test('roles without video never get the video wall or footage search', () => {
  for (const p of personas.personas.filter((x) => x.workspace === 'um')) {
    const views = umAccess[p.id];
    assert.ok(views?.length, `${p.id} has no views`);
    if (!p.video) {
      assert.ok(!views.includes('wall'), `${p.id} can open the video wall`);
      assert.ok(!views.includes('search'), `${p.id} can search footage`);
    }
    assert.ok(
      views.includes(p.landing.split('/')[2]),
      `${p.id} lands on a view it cannot open`,
    );
  }
});

test('edge appliances add up to the camera estate', () => {
  const total = um.edgeAppliances.reduce((a, e) => a + e.cameras, 0);
  assert.equal(total, um.cameras.length);
});
