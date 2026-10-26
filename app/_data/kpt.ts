/**
 * Kementerian Pendidikan Tinggi (KPT) oversight of campus camera
 * intelligence.
 *
 * The ministry sees aggregates and compliance status only: camera estate,
 * uptime, analytics in use, detection volumes by category, verification
 * precision, the CCTV items of the 2025 inspection directive and privacy and
 * AI governance. No footage, images, plate numbers or names. Counts from 1
 * to 4 at institution level are suppressed.
 *
 * Institution names and states come from public/logos/manifest.json. Every
 * figure except Universiti Malaya's row is generated demonstration data.
 */
import {
  cameras as umCameras,
  cameraEvents as umEvents,
  analytics as umAnalytics,
  uptimeWeekly,
  verifyTimes,
  verification,
  cctvChecklist,
} from './um';

export type InstitutionType = 'Public (UA)' | 'Private (IPTS)';
export type Connection = 'EzVision live' | 'EzVision pilot' | 'Manual return';
export type Compliance = 'Met' | 'Partly met' | 'Not met';

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

export type Institution = {
  id: string;
  acronym: string;
  name: string;
  type: InstitutionType;
  state: StateId;
  city: string;
  enrolment: number;
  connection: Connection;
  /** Cameras registered (reported manually when not on EzVision). */
  cameras: number;
  /** Cameras with analytics running; 0 for manual returns. */
  analysed: number;
  /** % of residence and campus entrances covered by a camera. */
  coverage: number;
  /** % uptime over 30 days; null when not measured by EzVision. */
  uptime: number | null;
  analyticsLive: number;
  detections30d: number | null;
  /** % of detections an operator confirmed as true. */
  precision: number | null;
  verifyP50: number | null;
  maturity: number;
  cctv: Compliance[];
  privacy: boolean[];
};

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

export const cctvItems = cctvChecklist.map((c) => c.item);

export const privacyItems = [
  'Data protection officer appointed',
  'DPIA for CCTV and video analytics',
  'Retention policy published',
  'CCTV signage in place',
  'Facial recognition disabled',
  'Footage access and search audited',
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
const round1 = (n: number) => Math.round(n * 10) / 10;

// UM's row comes from its own workspace so the two points of view agree.
const umConfirmed = verification.reduce((a, v) => a + v.confirmed, 0);
const umAll = verification.reduce((a, v) => a + v.confirmed + v.false, 0);
export const umFigures = {
  cameras: umCameras.length,
  analysed: umCameras.filter((c) => c.status !== 'offline').length,
  uptime: uptimeWeekly.at(-1)!.uptime,
  analyticsLive: Object.values(umAnalytics).filter((a) => a.status === 'Live')
    .length,
  detections30d: umEvents.length * 30,
  precision: Math.round((umConfirmed / umAll) * 100),
  verifyP50: verifyTimes.at(-1)!.p50,
  cctv: cctvChecklist.map((c) => c.status) as Compliance[],
};

function maturityOf(i: Omit<Institution, 'maturity'>) {
  const cctvMet = i.cctv.filter((c) => c === 'Met').length / i.cctv.length;
  const priv = i.privacy.filter(Boolean).length / i.privacy.length;
  const analytics = i.connection === 'Manual return' ? 0 : 1;
  return Math.round(
    i.coverage * 0.25 +
      cctvMet * 25 +
      priv * 25 +
      analytics * 15 +
      (i.uptime ? i.uptime - 90 : 0),
  );
}

export const institutions: Institution[] = seeds.map(
  ([id, acronym, name, type, state, city, enrolment, connection]) => {
    const live = connection !== 'Manual return';
    const cameras =
      id === 'um'
        ? umFigures.cameras
        : Math.round((enrolment / 1000) * pick(id + 'cam', 1.6, 4.2));
    const cctv: Compliance[] =
      id === 'um'
        ? umFigures.cctv
        : cctvItems.map((item) => {
            const r = rand(id + item);
            return r > 0.3 ? 'Met' : r > 0.1 ? 'Partly met' : 'Not met';
          });
    const privacy = privacyItems.map((p) =>
      id === 'um'
        ? true
        : rand(id + p) > (p === 'Facial recognition disabled' ? 0.08 : 0.24),
    );
    const base = {
      id,
      acronym,
      name,
      type,
      state,
      city,
      enrolment,
      connection,
      cameras,
      analysed:
        id === 'um'
          ? umFigures.analysed
          : live
            ? Math.round(cameras * pick(id + 'an', 0.35, 0.9))
            : 0,
      coverage:
        id === 'um'
          ? 94
          : Math.round(pick(id + 'cov', live ? 72 : 48, live ? 98 : 88)),
      uptime:
        id === 'um'
          ? umFigures.uptime
          : live
            ? round1(pick(id + 'up', 93.5, 99.4))
            : null,
      analyticsLive:
        id === 'um'
          ? umFigures.analyticsLive
          : live
            ? Math.round(pick(id + 'al', 4, 13))
            : 0,
      detections30d:
        id === 'um'
          ? umFigures.detections30d
          : live
            ? Math.round(cameras * pick(id + 'det', 4, 14))
            : null,
      precision:
        id === 'um'
          ? umFigures.precision
          : live
            ? Math.round(pick(id + 'pr', 62, 91))
            : null,
      verifyP50:
        id === 'um'
          ? umFigures.verifyP50
          : live
            ? Math.round(pick(id + 'vt', 25, 95))
            : null,
      cctv,
      privacy,
    };
    return { ...base, maturity: Math.min(98, maturityOf(base)) };
  },
);

export const institutionById = (id: string) =>
  institutions.find((i) => i.id === id);

/** Small-count suppression at institution level (1 to 4 shows as "<5"). */
export function suppress(n: number): string {
  return n > 0 && n < 5 ? '<5' : n.toLocaleString('en-MY');
}

export const detectionCategories = [
  'Intrusion',
  'Crowd density',
  'Vehicle & traffic',
  'Unattended object',
  'Person down',
  'Smoke / fire',
  'Water level',
  'Wildlife',
  'Camera tamper',
  'PPE',
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

/** National monthly detections by category, institutions on EzVision. */
export const nationalMonthly = months.map((month, m) => {
  const monsoon = [0, 1, 2, 3].includes(m) ? 1 : 0;
  const term = [3, 4, 5, 9, 10, 11].includes(m) ? 1 : 0;
  // Adoption grows through the year as pilots go live.
  const growth = 0.7 + m * 0.03;
  const row: Record<string, string | number> = { month };
  for (const c of detectionCategories) {
    const base = {
      Intrusion: 410,
      'Crowd density': 290,
      'Vehicle & traffic': 760,
      'Unattended object': 180,
      'Person down': 40,
      'Smoke / fire': 35,
      'Water level': 22,
      Wildlife: 95,
      'Camera tamper': 60,
      PPE: 70,
    }[c];
    const swing =
      c === 'Water level'
        ? monsoon * 60
        : c === 'Crowd density'
          ? term * 120
          : 0;
    row[c] = Math.round(
      (base + swing + pick(c + month, -base * 0.12, base * 0.12)) * growth,
    );
  }
  return row;
});

const connected = institutions.filter((i) => i.connection !== 'Manual return');
const median = (xs: number[]) =>
  [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

export const nationalTotals = {
  institutions: institutions.length,
  publicCount: institutions.filter((i) => i.type === 'Public (UA)').length,
  privateCount: institutions.filter((i) => i.type === 'Private (IPTS)').length,
  connected: connected.length,
  cameras: institutions.reduce((a, i) => a + i.cameras, 0),
  analysed: institutions.reduce((a, i) => a + i.analysed, 0),
  medianUptime: median(connected.map((i) => i.uptime!)),
  medianPrecision: median(connected.map((i) => i.precision!)),
  detections30d: connected.reduce((a, i) => a + i.detections30d!, 0),
  frDisabled: institutions.filter((i) => i.privacy[4]).length,
};

/** Shown on every KPT screen. */
export const kptExclusionLine =
  'This dashboard holds aggregate camera-analytics figures and compliance status only. It has no footage, images, plate numbers or names, and nothing in it identifies or tracks individuals, protests, assemblies or speech.';
