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
