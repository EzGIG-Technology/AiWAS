import type { Incident } from './data';
import { needsReview, transitionChanges } from './workflow.ts';
export type TeacherCommand =
  | 'acknowledge'
  | 'claim'
  | 'on-way'
  | 'on-site'
  | 'verify'
  | 'note'
  | 'support'
  | 'handover'
  | 'close'
  | 'reopen';
export type TeacherOptions = {
  decision?: string;
  checks?: boolean[];
  recipient?: string;
};
export function teacherUpdate(
  i: Incident,
  school: string,
  actor: string,
  command: TeacherCommand,
  note: string,
  options: TeacherOptions = {},
  time = 'Now',
): Incident {
  if (i.school !== school)
    throw new Error('This alert does not belong to your school.');
  if (!actor.trim()) throw new Error('A teacher profile is required.');
  if (i.status === 'Closed' && command !== 'reopen')
    throw new Error('Reopen this incident before making changes.');
  const simple = ['acknowledge', 'claim', 'on-way', 'on-site'];
  if (!simple.includes(command) && note.trim().length < 10)
    throw new Error('Add at least 10 characters explaining your action.');
  let patch: Partial<Incident> = {},
    event = '';
  switch (command) {
    case 'acknowledge':
      if (i.acknowledged)
        throw new Error('This alert has already been acknowledged.');
      patch = { acknowledged: true };
      event = 'Acknowledged alert';
      break;
    case 'claim':
      patch = { assigned: actor, acknowledged: true, status: 'Under Review' };
      event = 'Accepted responsibility for this alert';
      break;
    case 'on-way':
    case 'on-site':
      if (!i.acknowledged) throw new Error('Acknowledge the alert first.');
      event =
        command === 'on-way'
          ? 'Response update: on my way'
          : 'Response update: at the location';
      break;
    case 'verify':
      if (!i.acknowledged)
        throw new Error('Acknowledge the alert before verification.');
      if (
        !['Confirmed', 'False alarm', 'Insufficient evidence'].includes(
          options.decision || '',
        )
      )
        throw new Error('Choose a verification outcome.');
      if (options.checks?.length !== 3 || !options.checks.every(Boolean))
        throw new Error(
          'Complete the three evidence checks before verification.',
        );
      patch = { validation: options.decision, status: 'Under Review' };
      event = `Verification: ${options.decision}`;
      break;
    case 'note':
      event = 'Added follow-up note';
      break;
    case 'support':
      patch = {
        severity: i.severity === 'Critical' ? 'Critical' : 'High',
        status: 'Under Review',
      };
      event = 'Support request recorded for school duty lead (demo; not sent)';
      break;
    case 'handover':
      if (!options.recipient?.trim() || options.recipient === actor)
        throw new Error('Choose another school team member for handover.');
      patch = { assigned: options.recipient, status: 'Under Review' };
      event = `Handover recorded to ${options.recipient}; acceptance not confirmed`;
      break;
    case 'close':
      patch = transitionChanges(i, 'Closed', note);
      event = 'Closed incident with a recorded resolution';
      break;
    case 'reopen':
      patch = transitionChanges(i, 'Open', note);
      event = 'Reopened incident for fresh verification';
      break;
    default:
      throw new Error('Choose a supported action.');
  }
  return {
    ...i,
    ...patch,
    history: [
      ...i.history,
      { text: event + (note.trim() ? ` · ${note.trim()}` : ''), actor, time },
    ],
  };
}
export function teacherSort(items: Incident[]) {
  const rank: Record<string, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };
  return [...items].sort(
    (a, b) =>
      (rank[a.severity] ?? 4) - (rank[b.severity] ?? 4) ||
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
  );
}
export const teacherNeedsReview = (i: Incident) =>
  i.status !== 'Closed' && needsReview(i);
