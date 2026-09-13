import test from 'node:test';
import assert from 'node:assert/strict';
import {
  teacherUpdate,
  teacherSort,
  teacherNeedsReview,
} from '../app/teacher-workflow.ts';
const base = {
  id: 'T1',
  school: 'School A',
  status: 'Open',
  validation: 'Pending',
  severity: 'Medium',
  assigned: 'Unassigned',
  history: [],
  date: '2026-09-14',
  time: '08:10',
};
const update = (i, action, note = '', options = {}) =>
  teacherUpdate(i, 'School A', 'Teacher One', action, note, options, '09:00');
test('teacher verification requires acknowledgement, context checks and a decision', () => {
  assert.throws(
    () =>
      update(base, 'verify', 'Context was reviewed', {
        decision: 'Confirmed',
        checks: [true, true, true],
      }),
    /Acknowledge/,
  );
  const ack = update(base, 'acknowledge');
  assert.throws(
    () =>
      update(ack, 'verify', 'Context was reviewed', {
        decision: 'Confirmed',
        checks: [true, false, true],
      }),
    /three evidence/,
  );
  assert.throws(
    () =>
      update(ack, 'verify', 'Context was reviewed', {
        decision: 'Unknown',
        checks: [true, true, true],
      }),
    /outcome/,
  );
  const verified = update(ack, 'verify', 'Context was reviewed', {
    decision: 'Confirmed',
    checks: [true, true, true],
  });
  assert.equal(verified.status, 'Under Review');
  assert.equal(verified.validation, 'Confirmed');
  assert.equal(verified.history.length, 2);
  assert.equal(base.history.length, 0);
});
test('unresolved evidence blocks closure and reopening requires fresh review', () => {
  assert.throws(
    () => update(base, 'close', 'Follow-up was completed'),
    /Resolve/,
  );
  const closed = update(
    { ...base, validation: 'False alarm' },
    'close',
    'Observed staged activity only',
  );
  assert.equal(closed.status, 'Closed');
  assert.throws(
    () => update(closed, 'note', 'Additional context here'),
    /Reopen/,
  );
  const reopened = update(closed, 'reopen', 'New evidence needs checking');
  assert.equal(reopened.validation, 'Pending');
  assert.equal(reopened.acknowledged, false);
  assert.equal(teacherNeedsReview(reopened), true);
});
test('school scope, meaningful notes and support priority are guarded', () => {
  assert.throws(
    () => teacherUpdate(base, 'School B', 'Teacher One', 'claim', ''),
    /your school/,
  );
  assert.throws(() => update(base, 'support', 'help'), /10 characters/);
  assert.equal(
    update(
      { ...base, severity: 'Critical' },
      'support',
      'Another responder needed',
    ).severity,
    'Critical',
  );
  assert.equal(
    update(base, 'support', 'Another responder needed').severity,
    'High',
  );
  assert.throws(
    () =>
      update(base, 'handover', 'Please follow up here', {
        recipient: 'Teacher One',
      }),
    /another/,
  );
});
test('teacher queue sorts by priority, ownership acknowledges and response is audited', () => {
  assert.deepEqual(
    teacherSort([base, { ...base, id: 'C', severity: 'Critical' }]).map(
      (i) => i.id,
    ),
    ['C', 'T1'],
  );
  assert.throws(() => update(base, 'on-site'), /Acknowledge/);
  const claimed = update(base, 'claim');
  assert.equal(claimed.assigned, 'Teacher One');
  assert.equal(claimed.acknowledged, true);
  assert.match(
    update(claimed, 'on-site').history.at(-1).text,
    /at the location/,
  );
});
