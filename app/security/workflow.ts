import { guards, sites, type Incident } from './data.ts';

export const securityViews = [
  'Overview',
  'Monitoring',
  'Incidents',
  'Sites',
  'Guard dispatch',
  'Investigations',
  'Detection rules',
  'Reports',
  'Capability library',
] as const;
export const securityRoute = (view: string) => `Security ${view.toLowerCase()}`;
export const isSecurityView = (view: string) =>
  securityViews.some((name) => securityRoute(name) === view);
export const securityViewForRoute = (route: string) =>
  securityViews.find((name) => securityRoute(name) === route) ?? 'Overview';
export const canAccessSecurity = (role: string) =>
  role === 'System Admin' || role === 'Internal Ops';
export const incidentStatuses = [
  'New',
  'Verified',
  'Dispatched',
  'Arrived',
  'Closed',
];
const allowed: Record<string, string[]> = {
  New: ['Verified', 'Closed'],
  Verified: ['Closed'],
  Dispatched: ['Arrived'],
  Arrived: ['Closed'],
  Closed: [],
};
const stamp = () => new Date().toISOString();
export function updateIncident(
  incident: Incident,
  next: string,
  note: string,
  at = stamp(),
): Incident {
  if (!allowed[incident.status]?.includes(next))
    throw new Error('This incident transition is not permitted.');
  const trimmed = note.trim();
  if (['Verified', 'Closed'].includes(next) && trimmed.length < 10)
    throw new Error(
      'Record a review or resolution note of at least 10 characters.',
    );
  return {
    ...incident,
    status: next,
    notes: trimmed ? [...incident.notes, trimmed] : incident.notes,
    history: [
      ...incident.history,
      `${at} · Alex Morgan: ${next}${trimmed ? ' — ' + trimmed : ''}`,
    ],
  };
}
export function assignGuard(
  incident: Incident,
  name: string,
  incidents: Incident[],
  at = stamp(),
): Incident {
  if (incident.status !== 'Verified')
    throw new Error('Verify the incident before assigning a guard.');
  const guard = guards.find((g) => g.name === name && g.site === incident.site);
  if (!guard)
    throw new Error('Choose an available guard from the incident site.');
  if (incidents.some((i) => i.status !== 'Closed' && i.guard === name))
    throw new Error('This guard already has an active assignment.');
  return {
    ...incident,
    status: 'Dispatched',
    guard: name,
    history: [
      ...incident.history,
      `${at} · Demo assignment recorded for ${name}. No external notification sent.`,
    ],
  };
}
export function makeIncident(
  input: { title: string; site: string; severity: string },
  id: string,
  at = stamp(),
): Incident {
  const title = input.title.trim();
  if (title.length < 5 || title.length > 120)
    throw new Error('Use an incident title between 5 and 120 characters.');
  if (!sites.includes(input.site))
    throw new Error('Select a valid security site.');
  if (!['Critical', 'High', 'Medium', 'Low'].includes(input.severity))
    throw new Error('Select a valid priority.');
  if (!id.trim()) throw new Error('An incident identifier is required.');
  return {
    id: `SEC-${id}`,
    title,
    site: input.site,
    zone: 'Manual report',
    severity: input.severity,
    status: 'New',
    time: new Date(at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kuala_Lumpur',
    }),
    guard: '',
    notes: [],
    history: [`${at} · Manual demo incident created by Alex Morgan.`],
  };
}
export function filterIncidents(
  incidents: Incident[],
  filters: { site: string; status: string; query: string },
) {
  const query = filters.query.trim().toLowerCase();
  return incidents.filter(
    (i) =>
      (filters.site === 'All sites' || i.site === filters.site) &&
      (filters.status === 'All statuses' || i.status === filters.status) &&
      `${i.title} ${i.id} ${i.zone}`.toLowerCase().includes(query),
  );
}
export type RuleConfiguration = {
  featureId: string;
  site: string;
  graceSeconds: number;
  enabled: boolean;
};
export const ruleKey = (featureId: string, site: string) =>
  `${featureId}::${site}`;
export function validateRule(
  config: RuleConfiguration,
  rawValue: string,
): RuleConfiguration {
  if (!/^F0(?:0[1-9]|[1-8]\d|90)$/.test(config.featureId))
    throw new Error('Unknown capability.');
  if (!sites.includes(config.site))
    throw new Error('Select a valid security site.');
  if (
    !rawValue.trim() ||
    !Number.isInteger(config.graceSeconds) ||
    config.graceSeconds < 0 ||
    config.graceSeconds > 600
  )
    throw new Error('Use a whole number from 0 to 600 seconds.');
  return { ...config };
}
