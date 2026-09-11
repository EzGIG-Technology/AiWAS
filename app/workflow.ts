import type { Incident } from './data';
export const needsReview = (i: Incident) =>
  !['Confirmed', 'False alarm'].includes(i.validation);
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

export function schoolSetupError(
  name: string,
  admin: string,
  email: string,
  zone: string,
  existing: string[],
) {
  if (name.trim().length < 2)
    return 'Enter a school name of at least two characters.';
  if (
    existing.some((n) => n.trim().toLowerCase() === name.trim().toLowerCase())
  )
    return 'This school already exists.';
  if (admin.trim().length < 2) return 'Enter the administrator’s name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Enter a valid administrator email.';
  if (!zone.trim()) return 'Enter a camera zone.';
  return '';
}
export function workItemError(title: string, detail: string, due: string) {
  if (title.trim().length < 3)
    return 'Enter a title of at least three characters.';
  if (detail.trim().length < 10)
    return 'Include at least 10 characters of detail.';
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(due) ||
    !Number.isFinite(Date.parse(due)) ||
    new Date(due).toISOString().slice(0, 10) !== due
  )
    return 'Choose a valid due date.';
  return '';
}

export function transitionChanges(
  i: Incident,
  status: string,
  reason: string,
): Partial<Incident> {
  const error = transitionError(i, status, reason);
  if (error) throw new Error(error);
  return i.status === 'Closed'
    ? { status, validation: 'Pending', acknowledged: false }
    : { status };
}
