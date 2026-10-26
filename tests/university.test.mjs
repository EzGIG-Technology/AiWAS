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

test('every incident points at a real camera, officer and precinct', () => {
  const callsigns = new Set(um.officers.map((o) => o.callsign));
  for (const i of um.incidents) {
    if (i.camera)
      assert.ok(um.cameraById(i.camera), `${i.id} camera ${i.camera}`);
    if (i.assigned)
      assert.ok(callsigns.has(i.assigned), `${i.id} officer ${i.assigned}`);
    assert.ok(um.precincts[i.precinct], `${i.id} precinct`);
  }
});

test('model confidence appears only on AI video candidates', () => {
  for (const i of um.incidents) {
    if (i.confidence !== undefined)
      assert.equal(
        i.source,
        'AI video',
        `${i.id} has confidence from ${i.source}`,
      );
  }
});

test('confidential reports carry no camera', () => {
  for (const i of um.incidents.filter((x) => x.restricted)) {
    assert.equal(i.camera, undefined, `${i.id} restricted but linked to video`);
    assert.equal(i.location, 'Withheld');
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

test('residential colleges match the UM handbook numbering', () => {
  const shorts = um.colleges.map((c) => c.short);
  for (let n = 1; n <= 13; n++)
    assert.ok(shorts.includes(`KK${n}`), `KK${n} missing`);
  assert.ok(shorts.includes('IH'));
  for (const c of um.colleges)
    assert.ok(c.occupied <= c.beds, `${c.short} over capacity`);
});

test('roles without video never get the video wall', () => {
  for (const p of personas.personas.filter((x) => x.workspace === 'um')) {
    const views = umAccess[p.id];
    assert.ok(views?.length, `${p.id} has no views`);
    if (!p.video)
      assert.ok(!views.includes('wall'), `${p.id} can open the video wall`);
    assert.ok(p.landing.startsWith('/um/'), `${p.id} lands outside UM`);
    assert.ok(
      views.includes(p.landing.split('/')[2]),
      `${p.id} lands on a view it cannot open`,
    );
  }
});

test('every college count and the edge appliances add up to the camera estate', () => {
  const total = um.edgeAppliances.reduce((a, e) => a + e.cameras, 0);
  assert.equal(total, um.cameras.length);
});
