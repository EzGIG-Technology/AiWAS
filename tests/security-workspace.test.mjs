import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initial, sites, guards } from '../app/security/data.ts';
import {
  updateIncident,
  assignGuard,
  makeIncident,
  filterIncidents,
  ruleKey,
  validateRule,
  securityViews,
  securityRoute,
  securityViewForRoute,
  canAccessSecurity,
} from '../app/security/workflow.ts';
import { csvCell } from '../app/workflow.ts';
const at = '2026-09-16T04:00:00.000Z';
test('security incident completes verification, assignment, arrival and closure with immutable history', () => {
  const verified = updateIncident(
    initial[0],
    'Verified',
    'Checked site authorisation and the candidate event.',
    at,
  );
  const dispatched = assignGuard(
    verified,
    guards[0].name,
    [verified, ...initial.slice(1)],
    at,
  );
  const arrived = updateIncident(dispatched, 'Arrived', '', at);
  const closed = updateIncident(
    arrived,
    'Closed',
    'Guard checked the perimeter and secured the gate.',
    at,
  );
  assert.equal(closed.status, 'Closed');
  assert.equal(closed.guard, guards[0].name);
  assert.equal(closed.history.length, initial[0].history.length + 4);
  assert.equal(closed.notes.length, 2);
  assert.equal(initial[0].status, 'New');
  assert.equal(initial[0].history.length, 1);
});
test('verification, dismissal and closure require substantive notes and valid transitions', () => {
  assert.throws(
    () => updateIncident(initial[0], 'Verified', '  '),
    /10 characters/,
  );
  assert.throws(
    () => updateIncident(initial[0], 'Closed', 'done'),
    /10 characters/,
  );
  assert.throws(
    () => updateIncident(initial[0], 'Dispatched', 'Some reason'),
    /not permitted/,
  );
  const dismissed = updateIncident(
    initial[0],
    'Closed',
    'Authorised scheduled maintenance; event dismissed.',
    at,
  );
  assert.equal(dismissed.status, 'Closed');
  assert.throws(
    () =>
      updateIncident(dismissed, 'Verified', 'Cannot edit the final verdict'),
    /not permitted/,
  );
});
test('dispatch rejects unverified events, unknown guards, cross-site assignment and double booking', () => {
  assert.throws(
    () => assignGuard(initial[0], guards[0].name, initial),
    /Verify/,
  );
  const verified = updateIncident(
    initial[0],
    'Verified',
    'Reviewed and confirmed demo evidence.',
    at,
  );
  assert.throws(
    () => assignGuard(verified, 'Unknown', initial),
    /incident site/,
  );
  assert.throws(
    () => assignGuard(verified, guards[2].name, initial),
    /incident site/,
  );
  const booked = assignGuard(verified, guards[0].name, initial, at);
  const other = updateIncident(
    initial[1],
    'Verified',
    'Reviewed and confirmed demo evidence.',
    at,
  );
  assert.throws(
    () => assignGuard(other, guards[0].name, [booked]),
    /active assignment/,
  );
  assert.equal(
    assignGuard(other, guards[0].name, [{ ...booked, status: 'Closed' }], at)
      .guard,
    guards[0].name,
  );
});
test('manual reports validate title, site and priority and start unverified', () => {
  const value = makeIncident(
    { title: '  Gate left unsecured  ', site: sites[0], severity: 'High' },
    'test-1',
    at,
  );
  assert.equal(value.title, 'Gate left unsecured');
  assert.equal(value.status, 'New');
  assert.equal(value.guard, '');
  assert.match(value.id, /^SEC-/);
  assert.equal(value.time, '12:00');
  for (const input of [
    { title: '  ', site: sites[0], severity: 'High' },
    { title: 'Gate incident', site: 'School site', severity: 'High' },
    { title: 'Gate incident', site: sites[0], severity: 'Unknown' },
  ])
    assert.throws(() => makeIncident(input, 'test', at));
});
test('incident search composes site and status filters and produces honest empty results', () => {
  assert.deepEqual(
    filterIncidents(initial, {
      site: sites[0],
      status: 'New',
      query: '  perimeter ',
    }).map((i) => i.id),
    ['INC-2401'],
  );
  assert.equal(
    filterIncidents(initial, { site: sites[1], status: 'New', query: '' })
      .length,
    0,
  );
  assert.equal(
    filterIncidents(initial, {
      site: 'All sites',
      status: 'Verified',
      query: '',
    }).length,
    2,
  );
  assert.equal(
    filterIncidents(initial, {
      site: 'Unrecognised site',
      status: 'All statuses',
      query: '',
    }).length,
    0,
  );
});
test('rule configurations are distinct by site and reject missing, fractional and invalid inputs', () => {
  const a = validateRule(
    { featureId: 'F001', site: sites[0], graceSeconds: 5, enabled: true },
    '5',
  );
  const b = validateRule(
    { ...a, site: sites[1], graceSeconds: 20, enabled: false },
    '20',
  );
  const records = {
    [ruleKey(a.featureId, a.site)]: a,
    [ruleKey(b.featureId, b.site)]: b,
  };
  assert.equal(Object.keys(records).length, 2);
  assert.equal(records[ruleKey('F001', sites[0])].enabled, true);
  assert.equal(records[ruleKey('F001', sites[1])].graceSeconds, 20);
  for (const [seconds, raw] of [
    [0, ''],
    [NaN, 'abc'],
    [1.5, '1.5'],
    [-1, '-1'],
    [601, '601'],
  ])
    assert.throws(() => validateRule({ ...a, graceSeconds: seconds }, raw));
  assert.throws(() => validateRule({ ...a, featureId: 'F091' }, '5'));
  assert.throws(() => validateRule({ ...a, site: 'School site' }, '5'));
  assert.equal(
    validateRule({ ...a, featureId: 'F090', graceSeconds: 0 }, '0')
      .graceSeconds,
    0,
  );
});
test('all 90 feature specifications retain required details and complete journeys', () => {
  const features = JSON.parse(
    readFileSync(new URL('../app/security/features.json', import.meta.url)),
  );
  assert.equal(features.length, 90);
  assert.equal(new Set(features.map((f) => f.id)).size, 90);
  for (const [index, f] of features.entries()) {
    assert.equal(f.id, `F${String(index + 1).padStart(3, '0')}`);
    for (const key of [
      'title',
      'Outcome',
      'Inputs',
      'Configure',
      'Journey',
      'Rules',
      'Exceptions',
      'Acceptance',
      'Scope',
      'Dependencies',
      'Outputs',
    ])
      assert.ok(f[key]?.trim(), `${f.id} missing ${key}`);
    assert.equal(f.Journey.split(' > ').length, 5, f.id);
  }
});
test('security routes are unique and confined to platform preview roles', () => {
  assert.equal(new Set(securityViews.map(securityRoute)).size, 9);
  securityViews.forEach((view) =>
    assert.equal(securityViewForRoute(securityRoute(view)), view),
  );
  assert.equal(canAccessSecurity('System Admin'), true);
  assert.equal(canAccessSecurity('Internal Ops'), true);
  assert.equal(canAccessSecurity('School Admin'), false);
  assert.equal(canAccessSecurity('Discipline Teacher'), false);
  assert.equal(canAccessSecurity('Unknown'), false);
});
test('security export uses the existing formula-safe cell encoder', () => {
  for (const value of ['=CMD()', ' @SUM(1,2)', '\t=1+1', '+123', '-123'])
    assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('gate, "north"'), '"gate, ""north"""');
});
