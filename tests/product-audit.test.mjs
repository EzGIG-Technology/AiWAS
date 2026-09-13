import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matrixDetections,
  matrixRuleError,
  matrixZones,
} from '../app/detection-matrix-data.ts';
import { mapAreas, clusterCounts, mapDots } from '../app/campus-map-data.ts';
import {
  campusZones,
  zoneSample,
  insightWindows,
} from '../app/campus-insights-data.ts';
import { workspaceSections, sectionFor } from '../app/navigation.ts';
const rule = {
  enabled: true,
  zone: 'Courtyard',
  priority: 'Medium',
  threshold: 30,
  confidence: 70,
  cooldown: 60,
  schedule: 'School hours',
  reviewer: 'Duty team',
  publicOnly: true,
};
test('all 22 matrix requirements are uniquely represented with 20 events and two context-only tags', () => {
  assert.equal(matrixDetections.length, 22);
  assert.equal(new Set(matrixDetections.map((c) => c.id)).size, 22);
  assert.equal(matrixDetections.filter((c) => c.mode === 'event').length, 20);
  assert.deepEqual(
    matrixDetections.filter((c) => c.mode === 'context').map((c) => c.id),
    ['uniform', 'person'],
  );
  assert.equal(matrixDetections.filter((c) => c.baseline === 80).length, 10);
  assert.ok(
    matrixDetections.every((c) => c.signal && c.boundary && c.recipients),
  );
  assert.match(
    matrixDetections.find((c) => c.id === 'person').boundary,
    /No gender inference/,
  );
});
test('rules reject private placement, critical downgrades and invalid operating thresholds', () => {
  const crowd = matrixDetections.find((c) => c.id === 'crowd');
  assert.equal(matrixRuleError(rule, crowd), '');
  for (const zone of ['Toilets', 'Changing room', ''])
    assert.match(matrixRuleError({ ...rule, zone }, crowd), /public/);
  assert.match(
    matrixRuleError({ ...rule, publicOnly: false }, crowd),
    /public/,
  );
  for (const id of ['weapon', 'fire']) {
    const cap = matrixDetections.find((c) => c.id === id);
    assert.match(matrixRuleError(rule, cap), /Critical/);
    assert.equal(
      matrixRuleError({ ...rule, priority: 'Critical', cooldown: 0 }, cap),
      '',
    );
  }
  for (const threshold of [0, 1.5, NaN, Infinity, 1001])
    assert.ok(matrixRuleError({ ...rule, threshold }, crowd));
  for (const confidence of [0, 100, NaN])
    assert.ok(matrixRuleError({ ...rule, confidence }, crowd));
  assert.ok(matrixRuleError({ ...rule, cooldown: -1 }, crowd));
  assert.ok(matrixRuleError({ ...rule, schedule: 'Anytime' }, crowd));
});
test('campus clusters reconcile exactly to each synthetic zone observation and remain inside zones', () => {
  for (const school of ['SMK Tunku Ampuan Durah', 'SK Seremban Jaya'])
    for (const zone of campusZones)
      for (let slot = 0; slot < insightWindows.length; slot++) {
        const count = zoneSample(school, zone.id, slot).occupancy;
        assert.equal(
          clusterCounts(count).reduce((a, b) => a + b, 0),
          count,
        );
        const area = mapAreas.find((a) => a.id === zone.id);
        assert.ok(area);
        for (const dot of mapDots(count, area.w, area.h, slot)) {
          assert.ok(dot.x > 0 && dot.x < area.w);
          assert.ok(dot.y > 0 && dot.y < area.h);
        }
      }
  assert.throws(() => clusterCounts(-1));
  assert.throws(() => clusterCounts(1.2));
  assert.ok(!matrixZones.includes('Toilets'));
  assert.ok(mapAreas.find((a) => a.id === 'toilets'));
});
test('navigation groups every active page once and retires duplicate calibration', () => {
  const views = workspaceSections.flatMap((s) => s.views);
  assert.equal(new Set(views).size, views.length);
  assert.equal(workspaceSections.length, 9);
  assert.equal(sectionFor('Validation queue').label, 'Incidents');
  assert.equal(sectionFor('System health').label, 'Cameras');
  assert.equal(sectionFor('Analytics').label, 'Campus insights');
  assert.equal(sectionFor('Detection rules'), undefined);
  assert.ok(!views.includes('Facilities & health'));
});

import {
  defaultDeviceConfig,
  deviceConfigError,
} from '../app/device-settings-data.ts';
test('device settings enforce transient buffers and reject invalid configuration', () => {
  assert.equal(deviceConfigError(defaultDeviceConfig), '');
  for (const patch of [
    { fps: 0 },
    { fps: 31 },
    { width: 100 },
    { reconnect: 0 },
    { retention: 91 },
    { preEvent: 16 },
    { postEvent: 61 },
    { incidentOnly: false },
    { logging: 'Invalid' },
  ])
    assert.ok(deviceConfigError({ ...defaultDeviceConfig, ...patch }));
});
