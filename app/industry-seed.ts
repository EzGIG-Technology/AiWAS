import type { Camera, Incident, Role, User } from './data.ts';
import { getIndustry, type Industry } from './industries.ts';

// Demonstration records are generated from each industry's own capability
// register rather than a fixed school-shaped table. Two rules are enforced
// here so they cannot drift again:
//
//  1. Only a 'Video candidate' carries a detection confidence. Sensor events
//     and staff reports have no model score, so the UI must not invent one.
//  2. The description never names a "detector" for a capability that requires
//     human context. It describes the observable signal and stops there.

export const CONFIDENCE_NONE = -1;

/**
 * Tenant sentinel for an account whose scope spans every site. Deliberately
 * industry-neutral: it is a relational value, so it must not change when the
 * displayed vocabulary does.
 */
export const ALL_SITES = 'All sites';

/** Structural roles keep their union type; each industry relabels them. */
export function roleLabel(industry: Industry, role: Role) {
  const l = industry.lexicon;
  if (role === 'School Admin') return `${l.siteTitle} admin`;
  if (role === 'Discipline Teacher') return industryFrontlineRole(industry.id);
  return role;
}

export function industryFrontlineRole(id: string) {
  return (
    {
      education: 'Discipline teacher',
      healthcare: 'Nurse in charge',
      'aged-care': 'Care shift lead',
      retail: 'Duty manager',
      construction: 'Site safety officer',
      industrial: 'Shift supervisor',
      transport: 'Station controller',
      commercial: 'Building manager',
    }[id] ?? 'Duty reviewer'
  );
}

const staffNames = [
  'Nur Aisyah',
  'Ahmad Firdaus',
  'Nadia Ahmad',
  'Daniel Tan',
  'Priya Raman',
  'Lim Wei Sheng',
];

const times = [
  '10:42',
  '10:38',
  '10:34',
  '10:21',
  '10:13',
  '09:56',
  '09:42',
  '09:30',
  '09:10',
  '08:55',
  '08:38',
  '08:22',
  '08:04',
  '07:55',
  '07:41',
  '07:32',
];

const cycle = ['Open', 'Under Review', 'Open', 'Closed'] as const;
const outcome = ['Pending', 'Pending', 'Confirmed', 'False alarm'] as const;

/**
 * Deterministic confidence for a video candidate. Sensor integrations and
 * staff reports return CONFIDENCE_NONE so no score is displayed anywhere.
 */
function confidenceFor(kind: string, index: number) {
  if (kind !== 'Video candidate') return CONFIDENCE_NONE;
  return 74 + ((index * 7) % 22);
}

function describe(
  name: string,
  kind: string,
  signal: string,
  zone: string,
  limits: string,
) {
  if (kind === 'Staff report')
    return `Staff report recorded in ${zone}. ${signal} No model score applies to a reported concern.`;
  if (kind === 'Sensor integration')
    return `Sensor event in ${zone}. ${signal} ${limits}`;
  return `Review candidate in ${zone}. ${signal} ${limits} Verify context before confirming.`;
}

export function seedFor(industryId: string) {
  const industry = getIndustry(industryId);
  const sites = industry.sites;
  const zones = industry.zones;

  const cameras: Camera[] = sites.flatMap((site, siteIndex) =>
    zones.map((zone, i) => ({
      id: `CAM-${String(i + 1).padStart(2, '0')}`,
      zone,
      block: zone.split(' ')[0],
      school: site,
      online: !(i === zones.length - 1 && siteIndex === 0),
      fps: 25,
      latency: i === zones.length - 1 && siteIndex === 0 ? 0 : 180 + i * 15,
    })),
  );

  // One record per capability, capped so the demonstration log stays readable.
  const seeded = industry.capabilities.slice(0, 16);
  const incidents: Incident[] = seeded.map((cap, i) => {
    const zone = zones[i % zones.length];
    const site = sites[i > seeded.length - 3 ? 1 : 0];
    const status = cycle[i % cycle.length];
    const validation = status === 'Closed' ? outcome[2 + (i % 2)] : 'Pending';
    const confidence = confidenceFor(cap.kind, i);
    return {
      id: `AIW-${String(1048 - i).padStart(4, '0')}`,
      category: cap.name,
      zone,
      block: zone.split(' ')[0],
      school: site,
      camera: `CAM-${String((i % zones.length) + 1).padStart(2, '0')}`,
      severity: cap.priority,
      confidence,
      time: times[i % times.length],
      date: i > 11 ? '2026-09-09' : '2026-09-10',
      status,
      validation,
      description: describe(cap.name, cap.kind, cap.signal, zone, cap.limits),
      assigned: staffNames[i % 3],
      history: [
        {
          text:
            cap.kind === 'Staff report'
              ? 'Concern reported by staff; record opened for review'
              : 'Candidate raised; evidence reserved for review',
          actor:
            cap.kind === 'Staff report'
              ? staffNames[i % 3]
              : `${cap.kind} · Demo`,
          time: times[i % times.length],
        },
        ...(validation !== 'Pending'
          ? [
              {
                text: `Marked ${validation.toLowerCase()}`,
                actor: staffNames[i % 3],
                time: times[i % times.length],
              },
            ]
          : []),
      ],
    };
  });

  const frontline = industryFrontlineRole(industry.id);
  const users: User[] = [
    {
      name: 'Nadia Ahmad',
      email: 'nadia@example.com',
      role: 'Internal Ops' as Role,
      school: ALL_SITES,
      active: true,
    },
    {
      name: 'Nur Aisyah',
      email: 'aisyah@example.com',
      role: 'Discipline Teacher' as Role,
      school: sites[0],
      active: true,
    },
    {
      name: 'Ahmad Firdaus',
      email: 'firdaus@example.com',
      role: 'School Admin' as Role,
      school: sites[0],
      active: true,
    },
    {
      name: 'Daniel Tan',
      email: 'daniel@example.com',
      role: 'System Admin' as Role,
      school: ALL_SITES,
      active: true,
    },
  ];

  return { sites, cameras, incidents, users, frontline };
}

/** Categories offered by filters and the rules screen, per industry. */
export function categoriesFor(industryId: string) {
  return getIndustry(industryId).capabilities.map((c) => c.name);
}
