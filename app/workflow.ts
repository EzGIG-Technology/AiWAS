import type { Incident } from './data';
export const needsReview = (i: Incident) =>
  ['Pending', 'Insufficient evidence'].includes(i.validation);
export function inPeriod(date: string, period: string, anchor: string) {
  const elapsed =
    (Date.parse(anchor + 'T00:00:00Z') - Date.parse(date + 'T00:00:00Z')) /
    86400000;
  return (
    elapsed >= 0 &&
    elapsed <
      (period === 'Last 30 days' ? 30 : period === 'Last 7 days' ? 7 : 1)
  );
}
export function transitionError(i: Incident, status: string, reason: string) {
  if (!['Open', 'Under Review', 'Closed'].includes(status))
    return 'Choose a valid status.';
  if (status === i.status) return 'This incident already has that status.';
  if (status === 'Closed' && needsReview(i))
    return 'Resolve the evidence review before closing this incident.';
  if (
    (status === 'Closed' || i.status === 'Closed') &&
    reason.trim().length < 10
  )
    return 'Add a resolution or reopening reason of at least 10 characters.';
  return '';
}
export function csvCell(value: string | number | boolean | null | undefined) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
