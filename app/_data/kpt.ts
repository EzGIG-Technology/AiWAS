/**
 * Kementerian Pendidikan Tinggi (KPT) oversight data.
 *
 * Design rule from docs/research/university-campus-safety-audit.md §10.3:
 * the ministry sees aggregates and compliance status only. No footage, no
 * names, no student IDs. Counts from 1 to 4 at institution level are
 * suppressed. This module therefore holds numbers and statuses only, and a
 * test asserts it carries no media file or person name.
 *
 * Institution names and states come from public/logos/manifest.json. All
 * metrics are generated demonstration figures, not real statistics.
 */
import {
  incidents as umIncidents,
  cameras as umCameras,
  responseTimes as umResponse,
} from './um';

export type InstitutionType = 'Public (UA)' | 'Private (IPTS)';
export type Connection = 'EzVision live' | 'EzVision pilot' | 'Manual return';
export type Compliance = 'Met' | 'Partly met' | 'Not met';

export type Institution = {
  id: string;
  acronym: string;
  name: string;
  type: InstitutionType;
  state: StateId;
  city: string;
  enrolment: number;
  connection: Connection;
  cameras: number;
  uptime: number;
  p50: number;
  p90: number;
  openHigh: number;
  incidents12m: number;
  safetyIndex: number;
  inspection: Compliance[];
  policies: boolean[];
  privacy: boolean[];
  housedPct: number;
  counsellingPer1000: number;
  floodRisk: 'Low' | 'Medium' | 'High';
  lastDrill: string;
};

export type StateId =
  | 'Perlis'
  | 'Kedah'
  | 'Pulau Pinang'
  | 'Perak'
  | 'Kelantan'
  | 'Terengganu'
  | 'Pahang'
  | 'Selangor'
  | 'WP Kuala Lumpur'
  | 'WP Putrajaya'
  | 'Negeri Sembilan'
  | 'Melaka'
  | 'Johor'
  | 'Sabah'
  | 'Sarawak'
  | 'WP Labuan';

/** Tile-grid map of Malaysia: [column, row]. Schematic, not geographic. */
export const stateTiles: Record<StateId, [number, number]> = {
  Perlis: [0, 0],
  Kedah: [1, 0],
  Kelantan: [2, 0],
  'Pulau Pinang': [0, 1],
  Perak: [1, 1],
  Terengganu: [2, 1],
  Selangor: [0, 2],
  Pahang: [1, 2],
  'WP Kuala Lumpur': [0, 3],
  'WP Putrajaya': [1, 3],
  'Negeri Sembilan': [0, 4],
  Melaka: [1, 4],
  Johor: [1, 5],
  'WP Labuan': [4, 0],
  Sabah: [5, 0],
  Sarawak: [4, 1],
};

export const inspectionItems = [
  'Access control at residence entrances',
  'CCTV at entrances and common corridors',
  'Lighting audit of walking routes',
  'Hostel visitor entry/exit procedure',
  'Rapid response (P90 under 8 min)',
  'PDRM community policing liaison',
  'Flood / business-continuity plan tested',
  'Rooftop and ledge access secured',
] as const;

export const policyItems = [
  'Anti-bullying reporting mechanism',
  'Sexual harassment guideline',
  'Student Disciplinary Rules (2024)',
  'Off-campus student guideline (2021)',
  'Mental-health referral pathway',
  'Residential college policy (Circular 3/2024)',
  'Flood / BCP plan',
] as const;

export const privacyItems = [
  'Data protection officer appointed',
  'DPIA for CCTV and AI analytics',
  'Retention policy published',
  'CCTV signage in place',
  'Facial recognition disabled',
  'AIGE self-assessment filed',
] as const;

type Seed = [
  string,
  string,
  string,
  InstitutionType,
  StateId,
  string,
  number,
  Connection,
  'Low' | 'Medium' | 'High',
];

const seeds: Seed[] = [
  [
    'um',
    'UM',
    'Universiti Malaya',
    'Public (UA)',
    'WP Kuala Lumpur',
    'Kuala Lumpur',
    27000,
    'EzVision live',
    'Medium',
  ],
  [
    'usm',
    'USM',
    'Universiti Sains Malaysia',
    'Public (UA)',
    'Pulau Pinang',
    'Gelugor',
    30000,
    'EzVision pilot',
    'Low',
  ],
  [
    'ukm',
    'UKM',
    'Universiti Kebangsaan Malaysia',
    'Public (UA)',
    'Selangor',
    'Bangi',
    27500,
    'EzVision pilot',
    'Low',
  ],
  [
    'upm',
    'UPM',
    'Universiti Putra Malaysia',
    'Public (UA)',
    'Selangor',
    'Serdang',
    30500,
    'EzVision live',
    'Low',
  ],
  [
    'utm',
    'UTM',
    'Universiti Teknologi Malaysia',
    'Public (UA)',
    'Johor',
    'Skudai',
    33000,
    'EzVision live',
    'Medium',
  ],
  [
    'uitm',
    'UiTM',
    'Universiti Teknologi MARA',
    'Public (UA)',
    'Selangor',
    'Shah Alam',
    170000,
    'Manual return',
    'Medium',
  ],
  [
    'iium',
    'UIAM',
    'Universiti Islam Antarabangsa Malaysia',
    'Public (UA)',
    'Selangor',
    'Gombak',
    30000,
    'Manual return',
    'Medium',
  ],
  [
    'uum',
    'UUM',
    'Universiti Utara Malaysia',
    'Public (UA)',
    'Kedah',
    'Sintok',
    30000,
    'EzVision pilot',
    'Medium',
  ],
  [
    'unimas',
    'UNIMAS',
    'Universiti Malaysia Sarawak',
    'Public (UA)',
    'Sarawak',
    'Kota Samarahan',
    19000,
    'Manual return',
    'Medium',
  ],
  [
    'ums',
    'UMS',
    'Universiti Malaysia Sabah',
    'Public (UA)',
    'Sabah',
    'Kota Kinabalu',
    20000,
    'EzVision pilot',
    'Low',
  ],
  [
    'upsi',
    'UPSI',
    'Universiti Pendidikan Sultan Idris',
    'Public (UA)',
    'Perak',
    'Tanjong Malim',
    20000,
    'Manual return',
    'Medium',
  ],
  [
    'usim',
    'USIM',
    'Universiti Sains Islam Malaysia',
    'Public (UA)',
    'Negeri Sembilan',
    'Nilai',
    12000,
    'Manual return',
    'Low',
  ],
  [
    'umt',
    'UMT',
    'Universiti Malaysia Terengganu',
    'Public (UA)',
    'Terengganu',
    'Kuala Nerus',
    10000,
    'EzVision pilot',
    'High',
  ],
  [
    'uthm',
    'UTHM',
    'Universiti Tun Hussein Onn Malaysia',
    'Public (UA)',
    'Johor',
    'Batu Pahat',
    18000,
    'Manual return',
    'High',
  ],
  [
    'utem',
    'UTeM',
    'Universiti Teknikal Malaysia Melaka',
    'Public (UA)',
    'Melaka',
    'Durian Tunggal',
    13000,
    'Manual return',
    'Low',
  ],
  [
    'umpsa',
    'UMPSA',
    'Universiti Malaysia Pahang Al-Sultan Abdullah',
    'Public (UA)',
    'Pahang',
    'Pekan',
    12000,
    'Manual return',
    'High',
  ],
  [
    'unimap',
    'UniMAP',
    'Universiti Malaysia Perlis',
    'Public (UA)',
    'Perlis',
    'Arau',
    11000,
    'Manual return',
    'Medium',
  ],
  [
    'unisza',
    'UniSZA',
    'Universiti Sultan Zainal Abidin',
    'Public (UA)',
    'Terengganu',
    'Kuala Nerus',
    12000,
    'Manual return',
    'High',
  ],
  [
    'umk',
    'UMK',
    'Universiti Malaysia Kelantan',
    'Public (UA)',
    'Kelantan',
    'Kota Bharu',
    12000,
    'EzVision pilot',
    'High',
  ],
  [
    'upnm',
    'UPNM',
    'Universiti Pertahanan Nasional Malaysia',
    'Public (UA)',
    'WP Kuala Lumpur',
    'Sungai Besi',
    4000,
    'Manual return',
    'Low',
  ],
  [
    'taylors',
    "Taylor's",
    "Taylor's University",
    'Private (IPTS)',
    'Selangor',
    'Subang Jaya',
    15000,
    'EzVision live',
    'Low',
  ],
  [
    'monash-my',
    'Monash',
    'Monash University Malaysia',
    'Private (IPTS)',
    'Selangor',
    'Bandar Sunway',
    8000,
    'Manual return',
    'Low',
  ],
  [
    'sunway',
    'Sunway',
    'Sunway University',
    'Private (IPTS)',
    'Selangor',
    'Bandar Sunway',
    16000,
    'EzVision pilot',
    'Low',
  ],
  [
    'ucsi',
    'UCSI',
    'UCSI University',
    'Private (IPTS)',
    'WP Kuala Lumpur',
    'Cheras',
    12000,
    'Manual return',
    'Medium',
  ],
  [
    'mmu',
    'MMU',
    'Multimedia University',
    'Private (IPTS)',
    'Selangor',
    'Cyberjaya',
    18000,
    'Manual return',
    'Low',
  ],
  [
    'uniten',
    'UNITEN',
    'Universiti Tenaga Nasional',
    'Private (IPTS)',
    'Selangor',
    'Kajang',
    10000,
    'Manual return',
    'Low',
  ],
  [
    'utp',
    'UTP',
    'Universiti Teknologi PETRONAS',
    'Private (IPTS)',
    'Perak',
    'Seri Iskandar',
    7000,
    'EzVision pilot',
    'Medium',
  ],
  [
    'apu',
    'APU',
    'Asia Pacific University of Technology & Innovation',
    'Private (IPTS)',
    'WP Kuala Lumpur',
    'Bukit Jalil',
    13000,
    'Manual return',
    'Low',
  ],
];

/** Deterministic 0..1 from a string, so every render is identical. */
function rand(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
const pick = (key: string, lo: number, hi: number) =>
  lo + rand(key) * (hi - lo);

const umOpenHigh = umIncidents.filter(
  (i) =>
    (i.severity === 'Critical' || i.severity === 'High') &&
    !['Resolved', 'False alarm'].includes(i.status),
).length;

export const institutions: Institution[] = seeds.map(
  ([
    id,
    acronym,
    name,
    type,
    state,
    city,
    enrolment,
    connection,
    floodRisk,
  ]) => {
    const live = connection !== 'Manual return';
    const inspection = inspectionItems.map((item): Compliance => {
      const r = rand(id + item);
      return r > 0.28 ? 'Met' : r > 0.1 ? 'Partly met' : 'Not met';
    });
    if (id === 'um') {
      inspection.splice(
        0,
        inspection.length,
        'Met',
        'Met',
        'Partly met',
        'Met',
        'Met',
        'Met',
        'Partly met',
        'Not met',
      );
    }
    // UM runs EzVision with FR off and a published DPIA; its rows match its own workspace.
    const policies = policyItems.map((p) => id === 'um' || rand(id + p) > 0.18);
    const privacy = privacyItems.map((p) =>
      id === 'um'
        ? true
        : p === 'Facial recognition disabled'
          ? rand(id + p) > 0.08
          : rand(id + p) > 0.22,
    );
    const met = inspection.filter((x) => x === 'Met').length;
    const safetyIndex = Math.round(
      50 +
        met * 4 +
        policies.filter(Boolean).length * 1.6 +
        privacy.filter(Boolean).length * 1.2 -
        (floodRisk === 'High' ? 4 : 0) +
        pick(id + 'si', -3, 3),
    );
    return {
      id,
      acronym,
      name,
      type,
      state,
      city,
      enrolment,
      connection,
      cameras:
        id === 'um'
          ? umCameras.length
          : live
            ? Math.round(pick(id + 'cam', 40, 220))
            : 0,
      uptime: live ? Math.round(pick(id + 'up', 94, 99.6) * 10) / 10 : 0,
      // UM's row is derived from its own EzVision workspace so the two views agree.
      p50:
        id === 'um'
          ? umResponse.at(-1)!.p50
          : Math.round(pick(id + 'p50', 2.2, 5.5) * 10) / 10,
      p90:
        id === 'um'
          ? umResponse.at(-1)!.p90
          : Math.round(pick(id + 'p90', 5.2, 12.5) * 10) / 10,
      openHigh: id === 'um' ? umOpenHigh : Math.floor(pick(id + 'oh', 0, 4)),
      incidents12m: Math.round((enrolment / 1000) * pick(id + 'inc', 9, 16)),
      safetyIndex: Math.min(safetyIndex, 96),
      inspection,
      policies,
      privacy,
      housedPct: Math.round(pick(id + 'h', 38, 92)),
      counsellingPer1000: Math.round(pick(id + 'c', 0.4, 1.4) * 100) / 100,
      floodRisk,
      lastDrill: ['Oct 2026', 'Sep 2026', 'Aug 2026', 'Jun 2026', 'Mar 2026'][
        Math.floor(rand(id + 'drill') * 5)
      ],
    };
  },
);

export const institutionById = (id: string) =>
  institutions.find((i) => i.id === id);

/** Small-count suppression at institution level (1 to 4 shows as "<5"). */
export function suppress(n: number): string {
  return n > 0 && n < 5 ? '<5' : n.toLocaleString('en-MY');
}

export const nationalCategories = [
  'Accident',
  'Medical',
  'Violent crime',
  'Theft',
  'Bullying',
  'Harassment',
  'Fire',
  'Flood & weather',
  'Bomb threat',
  'Wildlife',
] as const;

const months = [
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
];

/** National monthly incidents by category, all reporting institutions. */
export const nationalMonthly = months.map((month, m) => {
  const monsoon = [0, 1, 2, 3].includes(m) ? 1 : 0;
  const term = [3, 4, 5, 9, 10, 11].includes(m) ? 1 : 0;
  const row: Record<string, string | number> = { month };
  for (const c of nationalCategories) {
    const base = {
      Accident: 46,
      Medical: 61,
      'Violent crime': 6,
      Theft: 58,
      Bullying: 3,
      Harassment: 7,
      Fire: 4,
      'Flood & weather': 9,
      'Bomb threat': 1,
      Wildlife: 12,
    }[c];
    const swing =
      c === 'Flood & weather' ? monsoon * 22 : term * Math.round(base * 0.25);
    row[c] = Math.max(
      0,
      Math.round(base + swing + pick(c + month, -base * 0.18, base * 0.18)),
    );
  }
  return row;
});

export const nationalTotals = {
  institutions: institutions.length,
  publicCount: institutions.filter((i) => i.type === 'Public (UA)').length,
  privateCount: institutions.filter((i) => i.type === 'Private (IPTS)').length,
  connected: institutions.filter((i) => i.connection !== 'Manual return')
    .length,
  enrolment: institutions.reduce((a, i) => a + i.enrolment, 0),
  cameras: institutions.reduce((a, i) => a + i.cameras, 0),
  openHigh: institutions.reduce((a, i) => a + i.openHigh, 0),
  medianP90: [...institutions].map((i) => i.p90).sort((a, b) => a - b)[
    Math.floor(institutions.length / 2)
  ],
};

export type Escalation = {
  id: string;
  institution: string;
  type: string;
  severity: 'Critical' | 'High';
  opened: string;
  status: 'Open' | 'Monitoring' | 'Closed';
  nextUpdate: string;
  owner: string;
  summary: string;
};

/**
 * Escalations requiring ministry attention. Summaries are written the way a
 * university would file them: category, scale and actions, never names.
 */
export const escalations: Escalation[] = [
  {
    id: 'ESC-2610-07',
    institution: 'um',
    type: 'Flash flood: campus car park and access road',
    severity: 'High',
    opened: '26 Oct, 18:31',
    status: 'Open',
    nextUpdate: '26 Oct, 20:00',
    owner: 'UM Bahagian Keselamatan',
    summary:
      'Water rising in one basement car park; one entrance blocked by a fallen tree. No injuries. Shuttle diverted.',
  },
  {
    id: 'ESC-2610-06',
    institution: 'umt',
    type: 'Monsoon readiness: relief centre activated',
    severity: 'High',
    opened: '25 Oct, 09:10',
    status: 'Monitoring',
    nextUpdate: '27 Oct, 09:00',
    owner: 'UMT disaster operations room',
    summary:
      'Pre-emptive activation ahead of east-coast monsoon. Residential college used as relief centre for students.',
  },
  {
    id: 'ESC-2610-05',
    institution: 'sunway',
    type: 'Bomb threat by email',
    severity: 'Critical',
    opened: '24 Oct, 11:42',
    status: 'Closed',
    nextUpdate: '—',
    owner: 'University security with PDRM',
    summary:
      'Two buildings evacuated; muster complete in 14 minutes; PDRM sweep found nothing. After-action report filed.',
  },
  {
    id: 'ESC-2610-04',
    institution: 'uum',
    type: 'Serious road accident on campus',
    severity: 'High',
    opened: '22 Oct, 21:15',
    status: 'Monitoring',
    nextUpdate: '29 Oct, 12:00',
    owner: 'UUM security & HEP',
    summary:
      'Motorcycle collision on internal road; casualties hospitalised. Speed-calming review under way.',
  },
  {
    id: 'ESC-2610-03',
    institution: 'utem',
    type: 'Personal data breach notification (PDPA)',
    severity: 'High',
    opened: '19 Oct, 16:00',
    status: 'Monitoring',
    nextUpdate: '2 Nov, 12:00',
    owner: 'University DPO',
    summary:
      'Misdirected email exposed a residential allocation list. Commissioner notified within the statutory window.',
  },
  {
    id: 'ESC-2610-02',
    institution: 'umk',
    type: 'Fire in residential college kitchen',
    severity: 'High',
    opened: '15 Oct, 02:20',
    status: 'Closed',
    nextUpdate: '—',
    owner: 'UMK security & Bomba',
    summary:
      'Contained by Bomba within 20 minutes. Block evacuated, no injuries. Kitchen appliance policy reissued.',
  },
];

export const nationalEvents = [
  {
    name: 'UM Convocation 2026',
    institution: 'um',
    when: '24 Oct – 1 Nov',
    readiness: 92,
    risk: 'Crowd & traffic',
  },
  {
    name: 'UKM Convocation',
    institution: 'ukm',
    when: '7 – 12 Nov',
    readiness: 74,
    risk: 'Crowd & traffic',
  },
  {
    name: 'USM Convocation',
    institution: 'usm',
    when: '14 – 19 Nov',
    readiness: 70,
    risk: 'Crowd & traffic',
  },
  {
    name: 'East-coast monsoon season',
    institution: 'umt',
    when: 'Nov – Mar',
    readiness: 61,
    risk: 'Flood',
  },
  {
    name: 'Inter-varsity games (SUKIPT)',
    institution: 'upm',
    when: '5 – 12 Dec',
    readiness: 48,
    risk: 'Crowd & travel',
  },
  {
    name: 'Semester 1 final examinations',
    institution: 'um',
    when: 'Jan 2027',
    readiness: 30,
    risk: 'Welfare',
  },
];

/** Exclusions shown as a banner on every KPT screen. */
export const kptExclusionLine =
  'This dashboard holds aggregate counts and compliance status only. It has no footage, no names and no student IDs, and it does not track individuals, protests, assemblies or speech.';
