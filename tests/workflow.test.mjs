import test from 'node:test';
import assert from 'node:assert/strict';
import {
  needsReview,
  inPeriod,
  transitionError,
  csvCell,
} from '../app/workflow.ts';
const incident = {
  status: 'Under Review',
  validation: 'Insufficient evidence',
};
test('inconclusive evidence remains reviewable and cannot be closed', () => {
  assert.equal(needsReview(incident), true);
  assert.match(
    transitionError(incident, 'Closed', 'Reviewed all relevant evidence'),
    /Resolve/,
  );
});
test('confirmed incidents require a meaningful closure resolution', () => {
  const confirmed = { ...incident, validation: 'Confirmed' };
  assert.match(transitionError(confirmed, 'Closed', 'done'), /reason/);
  assert.equal(
    transitionError(
      confirmed,
      'Closed',
      'Staff separated pupils and completed follow-up.',
    ),
    '',
  );
});
test('reopening preserves an explicit reason and rejects unknown states', () => {
  const closed = { status: 'Closed', validation: 'Confirmed' };
  assert.match(transitionError(closed, 'Open', ''), /reason/);
  assert.equal(
    transitionError(closed, 'Open', 'New witness information received.'),
    '',
  );
  assert.match(transitionError(closed, 'Deleted', 'Some information'), /valid/);
});
test('review completion excludes pending and insufficient evidence', () => {
  const outcomes = [
    'Pending',
    'Insufficient evidence',
    'Confirmed',
    'False alarm',
  ];
  assert.deepEqual(
    outcomes.filter((validation) => !needsReview({ validation })),
    ['Confirmed', 'False alarm'],
  );
});
test('period boundaries include correct days and exclude future records', () => {
  assert.equal(inPeriod('2026-09-04', 'Last 7 days', '2026-09-10'), true);
  assert.equal(inPeriod('2026-09-03', 'Last 7 days', '2026-09-10'), false);
  assert.equal(inPeriod('2026-09-03', 'Last 30 days', '2026-09-10'), true);
  assert.equal(inPeriod('2026-09-11', 'Last 30 days', '2026-09-10'), false);
  assert.equal(inPeriod('2026-09-09', 'Today', '2026-09-10'), false);
});
test('spreadsheet exports neutralize formulas and preserve quotes and commas', () => {
  assert.equal(
    csvCell('=HYPERLINK("https://example.com")'),
    '"\'=HYPERLINK(""https://example.com"")"',
  );
  assert.equal(csvCell('hello, "team"'), '"hello, ""team"""');
  assert.equal(csvCell(' @SUM(1,2)').startsWith('"\''), true);
});

test('unknown evidence outcomes fail closed instead of counting as reviewed', () => {
  assert.equal(needsReview({ validation: 'Unrecognized outcome' }), true);
  assert.match(
    transitionError(
      { status: 'Open', validation: '' },
      'Closed',
      'Resolution has been recorded',
    ),
    /Resolve/,
  );
});
test('malformed and future dates do not enter reporting periods', () => {
  assert.equal(inPeriod('not-a-date', 'Last 30 days', '2026-09-10'), false);
  assert.equal(inPeriod('2027-01-01', 'Today', '2026-09-10'), false);
});
const { schoolSetupError, workItemError } = await import('../app/workflow.ts');
test('school setup rejects whitespace-only fields and normalized duplicates', () => {
  assert.notEqual(
    schoolSetupError('  ', 'Admin', 'admin@example.com', 'Gate', []),
    '',
  );
  assert.notEqual(
    schoolSetupError(' School A ', 'Admin', 'admin@example.com', 'Gate', [
      'school a',
    ]),
    '',
  );
  assert.notEqual(
    schoolSetupError('School B', '   ', 'admin@example.com', 'Gate', []),
    '',
  );
  assert.notEqual(
    schoolSetupError('School B', 'Admin', 'admin@example.com', '   ', []),
    '',
  );
});
test('school setup validates email and accepts a complete new workspace', () => {
  assert.notEqual(
    schoolSetupError('School B', 'Admin', 'invalid@', 'Gate', []),
    '',
  );
  assert.equal(
    schoolSetupError('School B', 'Admin', 'admin@example.com', 'Gate', []),
    '',
  );
});
test('work items reject empty summaries, insufficient details and impossible dates', () => {
  assert.notEqual(workItemError('   ', 'A detailed action', '2026-09-12'), '');
  assert.notEqual(workItemError('Inspect camera', 'short', '2026-09-12'), '');
  assert.notEqual(
    workItemError('Inspect camera', 'A detailed action', '2026-02-30'),
    '',
  );
  assert.equal(
    workItemError('Inspect camera', 'A detailed action', '2026-09-12'),
    '',
  );
});

const { transitionChanges } = await import('../app/workflow.ts');
test('reopening a resolved case returns it to the evidence and acknowledgement queues', () => {
  const closed = {
    status: 'Closed',
    validation: 'False alarm',
    acknowledged: true,
  };
  const reopened = {
    ...closed,
    ...transitionChanges(closed, 'Open', 'New witness evidence has arrived'),
  };
  assert.equal(needsReview(reopened), true);
  assert.equal(reopened.acknowledged, false);
  assert.equal(reopened.status, 'Open');
});
test('transition helper refuses closure without a final evidence decision', () => {
  assert.throws(
    () =>
      transitionChanges(
        { status: 'Open', validation: 'Pending' },
        'Closed',
        'A detailed resolution',
      ),
    /Resolve/,
  );
});
