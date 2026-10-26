/**
 * Universiti Malaya demonstration data.
 *
 * Place names, residential colleges, the shuttle hub name and the security
 * organisation come from docs/research/university-campus-safety-audit.md
 * (§9). People, incidents, plates and every number are fictional
 * demonstration data. The demo clock is fixed so every render is identical.
 */
import type { SceneKey } from './media';

export const DEMO_NOW = '2026-10-26T18:40:00+08:00';
export const DEMO_DATE_LABEL = 'Monday, 26 October 2026';
export const DEMO_TIME = '18:40';

export const university = {
  id: 'um',
  name: 'Universiti Malaya',
  short: 'UM',
  campus: 'Main campus, Lembah Pantai, Kuala Lumpur',
  areaHa: 350,
  students: 27000,
  academicStaff: 2000,
  supportStaff: 3500,
  securityUnit: 'Bahagian Keselamatan & Polis Bantuan UM',
  hotline: '03-7967 7070',
} as const;

// ------------------------------------------------------------- precincts --

export type PrecinctId =
  | 'gates'
  | 'academic'
  | 'residential'
  | 'student'
  | 'ummc'
  | 'admin'
  | 'transit'
  | 'estates'
  | 'development'
  | 'zone5';

export const precincts: Record<
  PrecinctId,
  { name: string; description: string }
> = {
  gates: {
    name: 'Gates & perimeter',
    description:
      'Jalan Universiti main gate, Jalan Pantai Baru entrance and the Rimba Ilmu boundary.',
  },
  academic: {
    name: 'Academic core',
    description: 'Faculties, Perpustakaan Utama and Dewan Tunku Canselor.',
  },
  residential: {
    name: 'Residential colleges',
    description: 'Kolej Kediaman 1 to 13 on the main campus.',
  },
  student: {
    name: 'Student life & commerce',
    description: 'Cafeterias, the campus mart, playing fields and car parks.',
  },
  ummc: {
    name: 'UMMC teaching hospital',
    description:
      'Pusat Perubatan Universiti Malaya. Shared perimeter with the hospital security team.',
  },
  admin: {
    name: 'Chancellery & administration',
    description: 'Canselori, staff access and the mailroom.',
  },
  transit: {
    name: 'Transit & parking',
    description:
      'UM Central shuttle hub, Universiti LRT link and campus car parks.',
  },
  estates: {
    name: 'Estates, labs & stores',
    description:
      'Engineering workshops, the data centre, central stores and service routes.',
  },
  development: {
    name: 'Campus development',
    description:
      'Contractor site for the new research complex. Contractor-controlled access.',
  },
  zone5: {
    name: 'Zone 5 · Petaling Jaya',
    description:
      'KK9 Tun Syed Zahiruddin and International House, off the main campus.',
  },
};

export const precinctIds = Object.keys(precincts) as PrecinctId[];

// -------------------------------------------------------------- analytics --

export type AnalyticId =
  | 'intrusion'
  | 'loitering'
  | 'tailgating'
  | 'fall'
  | 'aggression'
  | 'crowd'
  | 'abandoned'
  | 'lpr'
  | 'traffic'
  | 'smoke'
  | 'flood'
  | 'wildlife'
  | 'tamper'
  | 'ppe'
  | 'queue'
  | 'keepclear'
  | 'object';

export const analytics: Record<
  AnalyticId,
  {
    name: string;
    detects: string;
    cannot: string;
    threshold: number;
    status: 'Live' | 'Pilot' | 'Evaluation only';
  }
> = {
  intrusion: {
    name: 'After-hours intrusion',
    detects: 'A person inside a zone during its closed hours.',
    cannot: 'Tell who the person is or whether they have permission.',
    threshold: 0.7,
    status: 'Live',
  },
  loitering: {
    name: 'Loitering',
    detects: 'A track staying in a zone longer than its dwell limit.',
    cannot: 'Infer intent. Waiting for a shuttle is not loitering.',
    threshold: 0.65,
    status: 'Live',
  },
  tailgating: {
    name: 'Tailgating / door held',
    detects:
      'A door held open past its limit, or two entries on one card read.',
    cannot:
      'Distinguish a resident holding the door for a friend from a stranger.',
    threshold: 0.7,
    status: 'Live',
  },
  fall: {
    name: 'Person down',
    detects: 'A person on the floor and not moving for more than 20 seconds.',
    cannot: 'Diagnose a medical cause.',
    threshold: 0.6,
    status: 'Live',
  },
  aggression: {
    name: 'Aggression / fight',
    detects: 'Rapid contact movement between two or more tracks.',
    cannot: 'Tell play-fighting or sport from violence. Always human-verified.',
    threshold: 0.75,
    status: 'Pilot',
  },
  crowd: {
    name: 'Crowd density',
    detects: 'People per square metre above the zone limit.',
    cannot: 'Count unique people across cameras.',
    threshold: 0.6,
    status: 'Live',
  },
  abandoned: {
    name: 'Unattended object',
    detects: 'An object left stationary with no track nearby for 5 minutes.',
    cannot: 'Tell what the object contains.',
    threshold: 0.7,
    status: 'Live',
  },
  lpr: {
    name: 'Plate reading (LPR)',
    detects: 'Vehicle registration plates at gates and car parks.',
    cannot: 'Identify the driver. Plates are retained for 30 days.',
    threshold: 0.85,
    status: 'Live',
  },
  traffic: {
    name: 'Wrong-way / speeding',
    detects: 'Vehicles against the one-way flow or above 30 km/h.',
    cannot: 'Issue a summons. A patrol officer decides.',
    threshold: 0.75,
    status: 'Live',
  },
  smoke: {
    name: 'Smoke / fire',
    detects: 'Visible smoke or flame in the frame.',
    cannot: 'Replace the fire alarm system. It is an early cue only.',
    threshold: 0.55,
    status: 'Live',
  },
  flood: {
    name: 'Water level',
    detects: 'Standing water rising past a painted gauge line.',
    cannot: 'Measure depth precisely; it is paired with a level sensor.',
    threshold: 0.6,
    status: 'Live',
  },
  wildlife: {
    name: 'Wildlife (macaque)',
    detects: 'Macaques entering buildings or bin stores.',
    cannot: 'Distinguish species reliably at night.',
    threshold: 0.6,
    status: 'Pilot',
  },
  tamper: {
    name: 'Camera tamper',
    detects: 'Lens covered, moved or defocused.',
    cannot: 'Tell vandalism from a maintenance visit.',
    threshold: 0.8,
    status: 'Live',
  },
  ppe: {
    name: 'PPE compliance',
    detects: 'Missing hard hat or vest in the contractor site.',
    cannot: 'Apply anywhere outside the contractor-controlled zone.',
    threshold: 0.7,
    status: 'Live',
  },
  queue: {
    name: 'Queue length',
    detects: 'Queue longer than the configured length.',
    cannot: 'Count people who are not in line.',
    threshold: 0.6,
    status: 'Live',
  },
  keepclear: {
    name: 'Keep-clear zone',
    detects: 'A vehicle stopped in an ambulance or fire lane.',
    cannot: 'Read whether the vehicle is an emergency vehicle on duty.',
    threshold: 0.75,
    status: 'Live',
  },
  object: {
    name: 'Dangerous object',
    detects: 'A long blade-like object held in hand (drills only).',
    cannot:
      'Be trusted alone. Evaluation only: never alerts outside the SOC without human verification.',
    threshold: 0.85,
    status: 'Evaluation only',
  },
};

/** Capabilities the platform refuses, in writing, with the reason. */
export const exclusions = [
  {
    name: 'Facial recognition and identification',
    reason:
      'Biometric data is sensitive under the PDPA amendments. Universities abroad have abandoned it after student opposition. Nothing in EzVision identifies a person from their face.',
  },
  {
    name: 'Protest, assembly or speech monitoring',
    reason:
      'Free-speech disciplinary cases at public universities were halted on 9 October 2026 and AUKU is being repealed. No analytic, saved search or report may target gatherings.',
  },
  {
    name: 'Emotion, attention or classroom behaviour scoring',
    reason:
      'No validated basis, and it chills learning. No cameras in teaching rooms.',
  },
  {
    name: 'Age, gender or ethnicity estimation',
    reason: 'Not needed for safety and a source of discriminatory error.',
  },
  {
    name: 'Cross-camera re-identification by appearance',
    reason:
      'Following a person across the campus by clothing is tracking an individual. Investigations use time and place, not a person search.',
  },
  {
    name: 'Cameras in private spaces',
    reason:
      'Toilets, bedrooms, counselling rooms, prayer rooms and clinical rooms are never covered. Corridors use non-camera vape and noise sensors instead.',
  },
  {
    name: 'Attendance or location tracking of students',
    reason:
      'Adult students are not tracked. Location is shared only when a student starts an SOS, Friend Walk or check-in, and only for that session.',
  },
] as const;

// ---------------------------------------------------------------- cameras --

export type CameraStatus = 'online' | 'offline' | 'degraded';
export type Camera = {
  id: string;
  name: string;
  scene: SceneKey;
  precinct: PrecinctId;
  building: string;
  analytics: AnalyticId[];
  status: CameraStatus;
  /** Partner feeds are view-only and not recorded by UM. */
  partner?: string;
  /** Schematic position on the campus map, 0-100. */
  pos: [number, number];
};

type CamSeed = [
  SceneKey,
  string,
  PrecinctId,
  string,
  AnalyticId[],
  [number, number],
  CameraStatus?,
  string?,
];

const cameraSeeds: CamSeed[] = [
  // Gates & perimeter
  [
    'gate',
    'Main gate, Jalan Universiti',
    'gates',
    'Main gate',
    ['lpr', 'traffic', 'loitering'],
    [9, 22],
  ],
  [
    'perimeter',
    'Rimba Ilmu boundary path',
    'gates',
    'Rimba Ilmu',
    ['intrusion', 'wildlife'],
    [14, 62],
  ],
  [
    'transit-fence',
    'Southern boundary fence, Pantai Dalam',
    'gates',
    'South boundary',
    ['intrusion', 'tamper'],
    [40, 92],
    'offline',
  ],
  // Academic core
  [
    'courtyard',
    'Faculty of Arts & Social Sciences courtyard',
    'academic',
    'FASS',
    ['crowd', 'aggression', 'abandoned'],
    [33, 30],
  ],
  [
    'corridor',
    'Faculty of Engineering, Block E corridor',
    'academic',
    'Faculty of Engineering',
    ['aggression', 'loitering'],
    [56, 58],
  ],
  [
    'hall',
    'Dewan Tunku Canselor, main hall',
    'academic',
    'Dewan Tunku Canselor',
    ['crowd', 'smoke'],
    [42, 24],
  ],
  [
    'training',
    'Faculty of Science walkway (drill camera)',
    'academic',
    'Faculty of Science',
    ['object', 'aggression'],
    [50, 40],
  ],
  [
    'records-corridor',
    'Perpustakaan Utama, closed stacks',
    'academic',
    'Perpustakaan Utama',
    ['intrusion'],
    [38, 42],
  ],
  [
    'lift-lobby',
    'Faculty of Business & Economics, lift lobby',
    'academic',
    'FBE',
    ['crowd', 'loitering'],
    [30, 46],
  ],
  // Residential
  [
    'hostel',
    'KK12 Raja Dr Nazrin Shah, lobby',
    'residential',
    'KK12',
    ['tailgating', 'wildlife', 'loitering'],
    [70, 30],
  ],
  [
    'gate-hold',
    'International House, arrivals lounge',
    'zone5',
    'International House',
    ['crowd', 'abandoned'],
    [8, 8],
  ],
  [
    'office-perimeter',
    'KK9 Tun Syed Zahiruddin, night walkway',
    'zone5',
    'KK9',
    ['loitering', 'intrusion'],
    [16, 6],
  ],
  // Student life & commerce
  [
    'canteen',
    'Cafeteria, student centre',
    'student',
    'Student centre',
    ['crowd', 'aggression', 'smoke'],
    [46, 50],
  ],
  [
    'inspection',
    'Padang, sports equipment inspection',
    'student',
    'Playing fields',
    ['intrusion'],
    [62, 76],
  ],
  [
    'shop-entrance',
    'Campus mart, entrance',
    'student',
    'Campus mart',
    ['crowd', 'abandoned'],
    [52, 46],
  ],
  [
    'retail-checkout',
    'Campus mart, checkout',
    'student',
    'Campus mart',
    ['queue'],
    [53, 47],
  ],
  [
    'retail-aisle',
    'Campus mart, aisle 3',
    'student',
    'Campus mart',
    ['fall'],
    [54, 45],
  ],
  [
    'stockroom-door',
    'Campus mart, stockroom door',
    'student',
    'Campus mart',
    ['tailgating'],
    [55, 46],
  ],
  [
    'retail-dock',
    'Campus mart, loading bay',
    'student',
    'Campus mart',
    ['keepclear'],
    [56, 47],
  ],
  [
    'retail-back',
    'Campus mart, back-of-house corridor',
    'student',
    'Campus mart',
    ['intrusion'],
    [55, 48],
  ],
  [
    'retail-carpark',
    'Student centre car park',
    'student',
    'Student centre',
    ['lpr', 'flood', 'loitering'],
    [49, 54],
  ],
  // UMMC
  [
    'hosp-entrance',
    'UMMC main entrance',
    'ummc',
    'UMMC',
    ['crowd', 'abandoned'],
    [84, 52],
  ],
  [
    'ed-waiting',
    'UMMC Emergency Department waiting area',
    'ummc',
    'UMMC',
    ['crowd', 'aggression'],
    [86, 56],
  ],
  [
    'ward-corridor',
    'UMMC Menara Selatan ward corridor',
    'ummc',
    'UMMC',
    ['fall'],
    [88, 48],
  ],
  [
    'pharmacy-door',
    'UMMC pharmacy store door',
    'ummc',
    'UMMC',
    ['tailgating', 'intrusion'],
    [85, 47],
  ],
  [
    'ambulance-bay',
    'UMMC ambulance bay',
    'ummc',
    'UMMC',
    ['keepclear'],
    [87, 60],
  ],
  [
    'hosp-carpark',
    'UMMC visitor car park',
    'ummc',
    'UMMC',
    ['lpr', 'flood'],
    [82, 63],
  ],
  [
    'care-entrance',
    'UMMC rehabilitation centre, reception',
    'ummc',
    'Rehabilitation centre',
    ['crowd'],
    [91, 40],
  ],
  [
    'care-lounge',
    'Rehabilitation centre, day lounge',
    'ummc',
    'Rehabilitation centre',
    ['fall'],
    [92, 41],
  ],
  [
    'care-dining',
    'Rehabilitation centre, dining room',
    'ummc',
    'Rehabilitation centre',
    ['fall', 'smoke'],
    [93, 42],
  ],
  [
    'care-corridor',
    'Rehabilitation centre, ward corridor',
    'ummc',
    'Rehabilitation centre',
    ['fall'],
    [92, 43],
  ],
  [
    'care-garden',
    'Rehabilitation centre, therapy garden',
    'ummc',
    'Rehabilitation centre',
    ['intrusion', 'fall'],
    [94, 38],
  ],
  [
    'care-laundry',
    'Rehabilitation centre, laundry',
    'ummc',
    'Rehabilitation centre',
    ['smoke'],
    [93, 44],
    'degraded',
  ],
  [
    'care-carpark',
    'Rehabilitation centre, drop-off',
    'ummc',
    'Rehabilitation centre',
    ['keepclear', 'lpr'],
    [90, 36],
  ],
  // Chancellery & administration
  [
    'office-lobby',
    'Canselori, ground-floor lobby',
    'admin',
    'Canselori',
    ['crowd', 'abandoned'],
    [40, 34],
  ],
  [
    'turnstile-line',
    'Canselori, staff turnstiles',
    'admin',
    'Canselori',
    ['tailgating'],
    [41, 35],
  ],
  [
    'office-dock',
    'Canselori, mailroom service bay',
    'admin',
    'Canselori',
    ['abandoned', 'keepclear'],
    [42, 36],
  ],
  [
    'office-carpark',
    'Faculty of Law, basement car park',
    'transit',
    'Faculty of Law',
    ['flood', 'lpr'],
    [72, 66],
  ],
  // Transit
  [
    'security-queue',
    'DTC convocation entry, bag check',
    'academic',
    'Dewan Tunku Canselor',
    ['queue', 'crowd', 'abandoned'],
    [43, 22],
  ],
  [
    'transit-concourse',
    'UM Central shuttle hub, concourse',
    'transit',
    'UM Central',
    ['crowd', 'abandoned'],
    [26, 18],
  ],
  [
    'taxi-rank',
    'UM Central, e-hailing pick-up',
    'transit',
    'UM Central',
    ['queue', 'keepclear'],
    [24, 16],
  ],
  [
    'escalator-landing',
    'Universiti LRT link bridge',
    'transit',
    'LRT link',
    ['crowd', 'fall'],
    [18, 10],
  ],
  [
    'transit-platform',
    'Universiti LRT platform (partner feed)',
    'transit',
    'Universiti LRT',
    ['crowd'],
    [16, 4],
    'online',
    'Rapid Rail · view only',
  ],
  // Estates, labs & stores
  [
    'restricted-door',
    'Data centre, server hall door',
    'estates',
    'IT data centre',
    ['tailgating', 'intrusion'],
    [36, 38],
  ],
  [
    'plant-corridor',
    'Engineering service tunnel',
    'estates',
    'Faculty of Engineering',
    ['intrusion', 'smoke'],
    [58, 62],
    'offline',
  ],
  [
    'roof-access',
    'Engineering tower, rooftop access',
    'estates',
    'Faculty of Engineering',
    ['intrusion'],
    [57, 56],
  ],
  [
    'machine-cell',
    'Engineering machining workshop',
    'estates',
    'Faculty of Engineering',
    ['intrusion', 'fall', 'smoke'],
    [59, 60],
  ],
  [
    'goods-dock',
    'Central stores, loading dock',
    'estates',
    'Central stores',
    ['keepclear', 'abandoned'],
    [66, 84],
  ],
  [
    'racking-aisle',
    'Central stores, racking aisle',
    'estates',
    'Central stores',
    ['fall'],
    [67, 85],
  ],
  [
    'pick-face',
    'Library book depository',
    'estates',
    'Book depository',
    ['fall', 'intrusion'],
    [68, 83],
  ],
  [
    'packing-line',
    'Penerbit UM, packing room',
    'estates',
    'Penerbit UM',
    ['smoke'],
    [64, 82],
  ],
  [
    'plant-yard',
    'Estates yard, waste & recycling',
    'estates',
    'Estates yard',
    ['traffic', 'intrusion'],
    [70, 88],
  ],
  [
    'charging-bay',
    'Central stores, forklift charging bay',
    'estates',
    'Central stores',
    ['smoke'],
    [65, 86],
  ],
  // Campus development
  [
    'site-entrance',
    'Research complex site, gate',
    'development',
    'Research complex site',
    ['intrusion', 'lpr'],
    [28, 78],
  ],
  [
    'site-laydown',
    'Research complex site, laydown area',
    'development',
    'Research complex site',
    ['ppe', 'intrusion'],
    [26, 80],
  ],
  [
    'site-scaffold',
    'Research complex site, scaffold face',
    'development',
    'Research complex site',
    ['ppe'],
    [24, 82],
  ],
  [
    'site-excavation',
    'Research complex site, excavation',
    'development',
    'Research complex site',
    ['intrusion', 'fall'],
    [27, 84],
  ],
  [
    'site-crane',
    'Research complex site, crane zone',
    'development',
    'Research complex site',
    ['ppe', 'intrusion'],
    [25, 86],
  ],
  [
    'site-road',
    'Research complex site, haul road',
    'development',
    'Research complex site',
    ['traffic'],
    [30, 82],
  ],
  [
    'site-welfare',
    'Research complex site, welfare cabins',
    'development',
    'Research complex site',
    ['smoke'],
    [29, 86],
  ],
];

export const cameras: Camera[] = cameraSeeds.map(
  ([scene, name, precinct, building, a, pos, status, partner], i) => ({
    id: `UM-C${String(i + 1).padStart(3, '0')}`,
    name,
    scene,
    precinct,
    building,
    analytics: a,
    status: status ?? 'online',
    partner,
    pos,
  }),
);

export const cameraById = (id: string) => cameras.find((c) => c.id === id);
export const cameraByScene = (scene: SceneKey) =>
  cameras.find((c) => c.scene === scene)!;

// -------------------------------------------------------- residential --

export type College = {
  id: string;
  name: string;
  short: string;
  beds: number;
  occupied: number;
  wardenOnDuty: string;
  doorAlarms: number;
  visitorsOnSite: number;
  overstays: number;
  maintenance: number;
  incidents30d: number;
  zone: 'Main campus' | 'Zone 5 · PJ';
  note?: string;
  pos: [number, number];
};

const collegeSeeds: [
  string,
  string,
  number,
  number,
  string,
  number,
  number,
  number,
  number,
  number,
  [number, number],
  string?,
][] = [
  [
    'KK1',
    'Kolej Tuanku Abdul Rahman',
    820,
    781,
    'Felo Haziq',
    1,
    4,
    0,
    2,
    3,
    [60, 22],
    'Oldest college, built 1959',
  ],
  [
    'KK2',
    'Kolej Tuanku Bahiyah',
    760,
    742,
    'Felo Mei Ling',
    0,
    2,
    0,
    1,
    1,
    [64, 20],
  ],
  [
    'KK3',
    'Kolej Tuanku Kurshiah',
    740,
    701,
    'Felo Aiman',
    2,
    3,
    1,
    3,
    4,
    [68, 18],
  ],
  ['KK4', 'Kolej Bestari', 900, 884, 'Felo Kavitha', 1, 5, 0, 0, 2, [72, 22]],
  ['KK5', 'Kolej Dayasari', 880, 859, 'Felo Rahim', 0, 1, 0, 2, 1, [74, 26]],
  [
    'KK6',
    'Kolej Ibnu Sina',
    640,
    612,
    'Felo Dr. Lee',
    0,
    0,
    0,
    1,
    0,
    [80, 44],
    'Clinical students: medicine, dentistry, pharmacy',
  ],
  ['KK7', "Kolej Za'ba", 860, 840, 'Felo Nadia', 3, 6, 2, 4, 6, [66, 34]],
  ['KK8', 'Kolej Kinabalu', 820, 797, 'Felo Jeffrey', 1, 2, 0, 1, 2, [62, 38]],
  [
    'KK9',
    'Kolej Tun Syed Zahiruddin',
    1100,
    1043,
    'Felo Suresh',
    2,
    7,
    1,
    2,
    5,
    [14, 8],
    'Off main campus, Zone 5 Petaling Jaya',
  ],
  [
    'KK10',
    'Kolej Tun Ahmad Zaidi',
    980,
    951,
    'Felo Wan Aina',
    0,
    3,
    0,
    1,
    2,
    [76, 30],
  ],
  [
    'KK11',
    'Kolej Ungku Aziz',
    1200,
    1164,
    'Felo Syafiq',
    1,
    4,
    0,
    2,
    3,
    [78, 24],
    'Foundation (PASUM) students',
  ],
  [
    'KK12',
    'Kolej Raja Dr Nazrin Shah',
    2100,
    2032,
    'Felo Amirul',
    4,
    9,
    2,
    3,
    7,
    [70, 30],
    'Largest residential college',
  ],
  [
    'KK13',
    'Kolej Kediaman 13',
    1600,
    1488,
    'Felo Farhana',
    2,
    4,
    1,
    5,
    4,
    [74, 36],
    'Blocks include Blok Zainab',
  ],
  [
    'IH',
    'International House',
    420,
    377,
    'Felo Grace',
    0,
    3,
    0,
    1,
    1,
    [8, 8],
    'Zone 5 Petaling Jaya',
  ],
];

export const colleges: College[] = collegeSeeds.map(
  ([
    short,
    name,
    beds,
    occupied,
    wardenOnDuty,
    doorAlarms,
    visitorsOnSite,
    overstays,
    maintenance,
    incidents30d,
    pos,
    note,
  ]) => ({
    id: short.toLowerCase(),
    short,
    name,
    beds,
    occupied,
    wardenOnDuty,
    doorAlarms,
    visitorsOnSite,
    overstays,
    maintenance,
    incidents30d,
    zone: short === 'KK9' || short === 'IH' ? 'Zone 5 · PJ' : 'Main campus',
    note,
    pos,
  }),
);

export const collegeById = (id: string) => colleges.find((c) => c.id === id);

// ---------------------------------------------------------------- officers --

export type OfficerStatus = 'Responding' | 'On patrol' | 'At post' | 'On break';
export type Officer = {
  id: string;
  callsign: string;
  name: string;
  rank: string;
  status: OfficerStatus;
  precinct: PrecinctId;
  beat: string;
  shiftEnds: string;
  pos: [number, number];
};

export const officers: Officer[] = [
  [
    'PB-01',
    'Hafiz Rahman',
    'Kpl. Polis Bantuan',
    'Responding',
    'academic',
    'Library – Law loop',
    [37, 44],
  ],
  [
    'PB-02',
    'Nurul Izzati',
    'Kons. Polis Bantuan',
    'On patrol',
    'residential',
    'KK10 – KK13 loop',
    [73, 32],
  ],
  [
    'PB-03',
    'Ravi Chandran',
    'Sjn. Polis Bantuan',
    'At post',
    'gates',
    'Main gate',
    [10, 23],
  ],
  [
    'PB-04',
    'Lim Wei Jie',
    'Kons. Polis Bantuan',
    'On patrol',
    'estates',
    'Engineering & stores',
    [60, 70],
  ],
  [
    'PB-05',
    'Siti Aminah',
    'Kons. Polis Bantuan',
    'On patrol',
    'transit',
    'UM Central & LRT link',
    [24, 15],
  ],
  [
    'PB-06',
    'Daniel Jimbun',
    'Kpl. Polis Bantuan',
    'Responding',
    'residential',
    'KK1 – KK5 loop',
    [66, 24],
  ],
  [
    'PB-07',
    'Farah Hanim',
    'Kons. Polis Bantuan',
    'At post',
    'ummc',
    'UMMC perimeter liaison',
    [84, 54],
  ],
  [
    'PB-08',
    'Mohd Aiman',
    'Kons. Polis Bantuan',
    'On break',
    'admin',
    'Canselori',
    [41, 35],
  ],
  [
    'PB-09',
    'Kamal Ariffin',
    'Sjn. Polis Bantuan',
    'On patrol',
    'zone5',
    'KK9 & International House',
    [12, 7],
  ],
  [
    'PB-10',
    'Priya Devi',
    'Kons. Polis Bantuan',
    'At post',
    'academic',
    'DTC convocation',
    [43, 23],
  ],
  [
    'SG-11',
    'Ahmad Zaki',
    'Pengawal Keselamatan',
    'On patrol',
    'development',
    'Contractor site gate',
    [28, 79],
  ],
  [
    'SG-12',
    'Tan Mei Ling',
    'Pengawal Keselamatan',
    'At post',
    'gates',
    'Jalan Pantai Baru entrance',
    [90, 70],
  ],
].map(([callsign, name, rank, status, precinct, beat, pos], i) => ({
  id: `off-${i + 1}`,
  callsign: callsign as string,
  name: name as string,
  rank: rank as string,
  status: status as OfficerStatus,
  precinct: precinct as PrecinctId,
  beat: beat as string,
  shiftEnds: '23:00',
  pos: pos as [number, number],
}));

export const guardTours = [
  {
    route: 'Academic core night tour',
    officer: 'PB-01',
    checkpoints: 14,
    done: 9,
    missed: 1,
    due: '19:30',
  },
  {
    route: 'Residential loop A (KK1–KK5)',
    officer: 'PB-06',
    checkpoints: 12,
    done: 7,
    missed: 0,
    due: '19:15',
  },
  {
    route: 'Residential loop B (KK10–KK13)',
    officer: 'PB-02',
    checkpoints: 16,
    done: 11,
    missed: 2,
    due: '19:45',
  },
  {
    route: 'Estates & stores',
    officer: 'PB-04',
    checkpoints: 10,
    done: 6,
    missed: 0,
    due: '20:00',
  },
  {
    route: 'Zone 5 · KK9 & International House',
    officer: 'PB-09',
    checkpoints: 8,
    done: 8,
    missed: 0,
    due: '19:00',
  },
  {
    route: 'Rimba Ilmu boundary',
    officer: '—',
    checkpoints: 9,
    done: 0,
    missed: 3,
    due: 'Overdue',
  },
];

// --------------------------------------------------------------- incidents --

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus =
  | 'New'
  | 'Acknowledged'
  | 'Dispatched'
  | 'On scene'
  | 'Resolved'
  | 'False alarm';
export type IncidentSource =
  | 'AI video'
  | 'Student app SOS'
  | 'Help point'
  | 'Access control'
  | 'Sensor'
  | 'Patrol report'
  | 'Confidential report'
  | 'Staff report';
export type IncidentCategory =
  | 'Personal safety'
  | 'Medical'
  | 'Intrusion'
  | 'Violence'
  | 'Theft'
  | 'Fire & smoke'
  | 'Flood & weather'
  | 'Traffic'
  | 'Wildlife'
  | 'Harassment'
  | 'Facilities'
  | 'Suspicious item';

export type Incident = {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: Severity;
  status: IncidentStatus;
  source: IncidentSource;
  analytic?: AnalyticId;
  /** Model confidence, only for AI video candidates. */
  confidence?: number;
  camera?: string;
  location: string;
  precinct: PrecinctId;
  college?: string;
  time: string;
  date: string;
  assigned?: string;
  summary: string;
  /** Visible only to case officers; never to KPT and never in exports. */
  restricted?: boolean;
  timeline: { time: string; text: string; actor: string }[];
  sop: { step: string; done: boolean }[];
};

const T = (time: string, text: string, actor: string) => ({
  time,
  text,
  actor,
});
const cam = (scene: SceneKey) => cameraByScene(scene).id;

export const incidents: Incident[] = [
  {
    id: 'UM-26-1043',
    title: 'SOS: student in student-centre car park',
    category: 'Personal safety',
    severity: 'Critical',
    status: 'Dispatched',
    source: 'Student app SOS',
    location: 'Student centre car park, on the library to KK12 route',
    precinct: 'academic',
    time: '18:36',
    date: '2026-10-26',
    assigned: 'PB-01',
    camera: cam('retail-carpark'),
    summary:
      'A Friend Walk from the library to KK12 escalated to SOS. Location sharing started with the SOS and ends when the incident closes. Nearest camera auto-opened.',
    timeline: [
      T(
        '18:31',
        'Friend Walk started: Perpustakaan Utama to KK12',
        'EzSafe app',
      ),
      T('18:36', 'SOS pressed. Live location shared with SOC', 'EzSafe app'),
      T('18:36', 'Nearest car-park camera opened on video wall', 'EzVision'),
      T('18:37', 'Acknowledged; callback attempted', 'Operator Aina'),
      T('18:37', 'PB-01 dispatched, ETA 2 min', 'Operator Aina'),
    ],
    sop: [
      { step: 'Call the student back', done: true },
      { step: 'Dispatch nearest officer', done: true },
      { step: 'Keep camera on wall until officer on scene', done: true },
      { step: 'Officer confirms student safe', done: false },
      { step: 'Log lighting fault if relevant', done: false },
    ],
  },
  {
    id: 'UM-26-1042',
    title: 'Work Alone check-in missed: machining workshop',
    category: 'Personal safety',
    severity: 'High',
    status: 'Acknowledged',
    source: 'Staff report',
    location: 'Engineering machining workshop',
    precinct: 'estates',
    camera: cam('machine-cell'),
    time: '18:30',
    date: '2026-10-26',
    assigned: 'PB-04',
    summary:
      'A registered researcher working alone did not answer the 18:30 check-in. Camera shows a person at the machine cell; officer asked to attend.',
    timeline: [
      T(
        '17:30',
        'Work Alone session started (2 h, 30 min check-ins)',
        'EzSafe app',
      ),
      T('18:30', 'Check-in missed; automatic reminder sent', 'EzSafe app'),
      T('18:33', 'Escalated to SOC', 'EzVision'),
      T('18:34', 'Acknowledged; PB-04 asked to attend', 'Operator Aina'),
    ],
    sop: [
      { step: 'Call the researcher', done: true },
      { step: 'View workshop camera', done: true },
      { step: 'Officer attends in person', done: false },
    ],
  },
  {
    id: 'UM-26-1041',
    title: 'Water level rising in basement car park',
    category: 'Flood & weather',
    severity: 'High',
    status: 'New',
    source: 'AI video',
    analytic: 'flood',
    confidence: 0.88,
    camera: cam('office-carpark'),
    location: 'Faculty of Law, basement car park',
    precinct: 'transit',
    time: '18:29',
    date: '2026-10-26',
    summary:
      'Standing water passed the 10 cm gauge line. The level sensor agrees. This car park flooded in October 2024; consider closing the ramp and notifying vehicle owners.',
    timeline: [
      T('18:12', 'Heavy rain warning (MetMalaysia) received', 'Weather feed'),
      T('18:29', 'Water above gauge line; sensor reads 11 cm', 'EzVision'),
    ],
    sop: [
      { step: 'Confirm on camera', done: false },
      { step: 'Close basement ramp barrier', done: false },
      {
        step: 'Send flood notice to Law faculty car-park permit holders',
        done: false,
      },
      { step: 'Raise Estates work order for pumps', done: false },
    ],
  },
  {
    id: 'UM-26-1040',
    title: 'Rooftop door opened after hours',
    category: 'Intrusion',
    severity: 'High',
    status: 'Dispatched',
    source: 'Access control',
    analytic: 'intrusion',
    camera: cam('roof-access'),
    location: 'Engineering tower, rooftop access',
    precinct: 'estates',
    time: '18:24',
    date: '2026-10-26',
    assigned: 'PB-04',
    summary:
      'Rooftop door contact opened outside permitted hours. Rooftop access is treated as a welfare-priority alarm. Approach calmly, do not broadcast.',
    timeline: [
      T('18:24', 'Door contact opened (no valid card read)', 'Access control'),
      T('18:24', 'Rooftop camera opened automatically', 'EzVision'),
      T('18:25', 'PB-04 dispatched; welfare SOP selected', 'Operator Aina'),
    ],
    sop: [
      { step: 'View rooftop camera', done: true },
      { step: 'Dispatch officer with welfare SOP', done: true },
      { step: 'Notify duty counsellor on standby', done: false },
    ],
  },
  {
    id: 'UM-26-1039',
    title: 'Crowd density high at convocation entry',
    category: 'Personal safety',
    severity: 'Medium',
    status: 'On scene',
    source: 'AI video',
    analytic: 'crowd',
    confidence: 0.91,
    camera: cam('security-queue'),
    location: 'Dewan Tunku Canselor, bag check',
    precinct: 'academic',
    time: '18:20',
    date: '2026-10-26',
    assigned: 'PB-10',
    summary:
      'Queue for the evening convocation session exceeded 3.5 people per m². Second bag-check lane requested.',
    timeline: [
      T('18:20', 'Density above 3.5 p/m² for 2 min', 'EzVision'),
      T('18:21', 'Event commander notified', 'EzVision'),
      T('18:23', 'PB-10 opened second lane', 'PB-10'),
    ],
    sop: [
      { step: 'Open second lane', done: true },
      { step: 'Announce staggered entry on PA', done: false },
    ],
  },
  {
    id: 'UM-26-1038',
    title: 'Macaques in KK12 lobby',
    category: 'Wildlife',
    severity: 'Low',
    status: 'Acknowledged',
    source: 'AI video',
    analytic: 'wildlife',
    confidence: 0.79,
    camera: cam('hostel'),
    location: 'KK12 Raja Dr Nazrin Shah, lobby',
    precinct: 'residential',
    college: 'kk12',
    time: '18:14',
    date: '2026-10-26',
    summary:
      'Two macaques entered through the lobby door. Food-waste bins at Block C uncovered. Estates notified to secure bins.',
    timeline: [
      T('18:14', 'Wildlife detected in lobby', 'EzVision'),
      T('18:15', 'College office notified', 'EzVision'),
    ],
    sop: [
      { step: 'Notify college office', done: true },
      { step: 'Secure bin store', done: false },
    ],
  },
  {
    id: 'UM-26-1037',
    title: 'Possible altercation at cafeteria',
    category: 'Violence',
    severity: 'Medium',
    status: 'New',
    source: 'AI video',
    analytic: 'aggression',
    confidence: 0.77,
    camera: cam('canteen'),
    location: 'Cafeteria, student centre',
    precinct: 'student',
    time: '18:11',
    date: '2026-10-26',
    summary:
      'Rapid contact movement between three tracks. Pilot analytic: an operator must verify before any dispatch or notification.',
    timeline: [T('18:11', 'Aggression candidate flagged (pilot)', 'EzVision')],
    sop: [
      { step: 'Verify on video before acting', done: false },
      {
        step: 'If confirmed, dispatch and note for HEP welfare referral',
        done: false,
      },
    ],
  },
  {
    id: 'UM-26-1036',
    title: 'Ambulance bay blocked',
    category: 'Traffic',
    severity: 'High',
    status: 'Resolved',
    source: 'AI video',
    analytic: 'keepclear',
    confidence: 0.93,
    camera: cam('ambulance-bay'),
    location: 'UMMC ambulance bay',
    precinct: 'ummc',
    time: '17:58',
    date: '2026-10-26',
    assigned: 'PB-07',
    summary:
      'Private car stopped in the ambulance lane for 4 minutes. Driver moved on by PB-07.',
    timeline: [
      T('17:58', 'Keep-clear breach', 'EzVision'),
      T('17:59', 'UMMC security liaison informed', 'Operator Aina'),
      T('18:03', 'Vehicle moved; closed', 'PB-07'),
    ],
    sop: [
      { step: 'Inform UMMC liaison', done: true },
      { step: 'Clear lane', done: true },
    ],
  },
  {
    id: 'UM-26-1035',
    title: 'Unattended bag at shuttle hub',
    category: 'Suspicious item',
    severity: 'High',
    status: 'False alarm',
    source: 'AI video',
    analytic: 'abandoned',
    confidence: 0.82,
    camera: cam('transit-concourse'),
    location: 'UM Central shuttle hub, concourse',
    precinct: 'transit',
    time: '17:42',
    date: '2026-10-26',
    assigned: 'PB-05',
    summary:
      'Backpack left beside bench. Owner returned within 3 minutes. Marked false alarm.',
    timeline: [
      T('17:42', 'Object stationary 5 min with no track nearby', 'EzVision'),
      T('17:43', 'PB-05 attending', 'Operator Aina'),
      T('17:45', 'Owner returned; false alarm', 'PB-05'),
    ],
    sop: [
      { step: 'Do not use radio within 15 m', done: true },
      { step: 'Officer checks area', done: true },
    ],
  },
  {
    id: 'UM-26-1034',
    title: 'Fallen tree across Jalan Pantai Baru entrance',
    category: 'Flood & weather',
    severity: 'High',
    status: 'On scene',
    source: 'Patrol report',
    location: 'Jalan Pantai Baru entrance',
    precinct: 'gates',
    time: '17:35',
    date: '2026-10-26',
    assigned: 'SG-12',
    summary:
      'Storm brought down a tree across the inbound lane. Shuttle route C diverted via main gate. Estates tree crew on site.',
    timeline: [
      T('17:35', 'Patrol photo report submitted', 'SG-12'),
      T('17:38', 'Shuttle route C diversion notice sent', 'Operator Aina'),
      T('17:50', 'Estates tree crew on scene', 'Estates'),
    ],
    sop: [
      { step: 'Cone off lane', done: true },
      { step: 'Divert shuttle route', done: true },
      { step: 'Notify UMMC (ambulance approach)', done: true },
      { step: 'Reopen and log', done: false },
    ],
  },
  {
    id: 'UM-26-1033',
    title: 'Unauthorised entry to contractor site',
    category: 'Intrusion',
    severity: 'Medium',
    status: 'Resolved',
    source: 'AI video',
    analytic: 'intrusion',
    confidence: 0.86,
    camera: cam('site-entrance'),
    location: 'Research complex site, gate',
    precinct: 'development',
    time: '17:20',
    date: '2026-10-26',
    assigned: 'SG-11',
    summary:
      "Two people entered after the contractor left at 17:00. Turned out to be the contractor's night watchman arriving early.",
    timeline: [
      T('17:20', 'After-hours intrusion', 'EzVision'),
      T('17:24', 'SG-11 verified identity at gate', 'SG-11'),
    ],
    sop: [{ step: 'Verify at site gate', done: true }],
  },
  {
    id: 'UM-26-1032',
    title: 'Pharmacy store door held open',
    category: 'Intrusion',
    severity: 'Medium',
    status: 'Resolved',
    source: 'Access control',
    analytic: 'tailgating',
    camera: cam('pharmacy-door'),
    location: 'UMMC pharmacy store door',
    precinct: 'ummc',
    time: '16:55',
    date: '2026-10-26',
    summary:
      'Door held for 90 seconds during a stock delivery. Delivery confirmed by pharmacy.',
    timeline: [
      T('16:55', 'Door held > 60 s', 'Access control'),
      T('16:57', 'Pharmacy confirmed delivery', 'UMMC liaison'),
    ],
    sop: [{ step: 'Confirm with pharmacy', done: true }],
  },
  {
    id: 'UM-26-1031',
    title: 'Laptop reported stolen in library',
    category: 'Theft',
    severity: 'Medium',
    status: 'Acknowledged',
    source: 'Staff report',
    location: 'Perpustakaan Utama, level 2 study area',
    precinct: 'academic',
    time: '16:40',
    date: '2026-10-26',
    assigned: 'PB-01',
    summary:
      'Reported at the library counter. No cameras cover study areas; the closed-stacks and entrance cameras are being reviewed by time window.',
    timeline: [
      T('16:40', 'Report taken at library counter', 'Library staff'),
      T('16:52', 'Footage review requested (entrance, 15:30–16:30)', 'PB-01'),
    ],
    sop: [
      { step: 'Take statement', done: true },
      { step: 'Request footage review via DPO log', done: true },
      { step: 'Advise police report if value > RM1,000', done: false },
    ],
  },
  {
    id: 'UM-26-1030',
    title: 'Confidential report: harassment',
    category: 'Harassment',
    severity: 'High',
    status: 'Acknowledged',
    source: 'Confidential report',
    location: 'Withheld',
    precinct: 'academic',
    time: '15:12',
    date: '2026-10-26',
    restricted: true,
    summary:
      'Submitted through the EzSafe confidential lane. Details visible to the case officer and HEP only. No video is attached to welfare cases.',
    timeline: [
      T('15:12', 'Confidential report received', 'EzSafe app'),
      T('15:40', 'Assigned to HEP case officer', 'HEP'),
    ],
    sop: [
      { step: 'Acknowledge to reporter within 24 h', done: true },
      { step: 'Case officer contact', done: false },
    ],
  },
  {
    id: 'UM-26-1029',
    title: 'Smoke cue at forklift charging bay',
    category: 'Fire & smoke',
    severity: 'High',
    status: 'False alarm',
    source: 'AI video',
    analytic: 'smoke',
    confidence: 0.61,
    camera: cam('charging-bay'),
    location: 'Central stores, forklift charging bay',
    precinct: 'estates',
    time: '14:48',
    date: '2026-10-26',
    assigned: 'PB-04',
    summary:
      'Dust from sweeping triggered the smoke cue. Fire panel clear. Marked false alarm; zone mask suggested.',
    timeline: [
      T('14:48', 'Smoke cue', 'EzVision'),
      T('14:50', 'Fire panel checked: clear', 'Operator Hakim'),
      T('14:55', 'False alarm', 'PB-04'),
    ],
    sop: [{ step: 'Check fire panel', done: true }],
  },
  {
    id: 'UM-26-1028',
    title: 'Person down in rehabilitation lounge',
    category: 'Medical',
    severity: 'Critical',
    status: 'Resolved',
    source: 'AI video',
    analytic: 'fall',
    confidence: 0.9,
    camera: cam('care-lounge'),
    location: 'Rehabilitation centre, day lounge',
    precinct: 'ummc',
    time: '13:05',
    date: '2026-10-26',
    summary:
      'Patient fall detected; ward nurse attended within 40 seconds. Handed to UMMC clinical team.',
    timeline: [
      T('13:05', 'Person down > 20 s', 'EzVision'),
      T('13:05', 'Ward nurse station alerted', 'EzVision'),
      T('13:06', 'Nurse on scene; handed to UMMC', 'UMMC'),
    ],
    sop: [{ step: 'Alert ward station', done: true }],
  },
  {
    id: 'UM-26-1027',
    title: 'Wrong-way vehicle at main gate',
    category: 'Traffic',
    severity: 'Low',
    status: 'Resolved',
    source: 'AI video',
    analytic: 'traffic',
    confidence: 0.84,
    camera: cam('gate'),
    location: 'Main gate, Jalan Universiti',
    precinct: 'gates',
    time: '12:10',
    date: '2026-10-26',
    assigned: 'PB-03',
    summary: 'Car entered via the exit lane. Advised by PB-03.',
    timeline: [
      T('12:10', 'Wrong-way entry', 'EzVision'),
      T('12:12', 'Driver advised', 'PB-03'),
    ],
    sop: [{ step: 'Advise driver', done: true }],
  },
  {
    id: 'UM-26-1026',
    title: 'Missing PPE on scaffold',
    category: 'Facilities',
    severity: 'Low',
    status: 'Resolved',
    source: 'AI video',
    analytic: 'ppe',
    confidence: 0.81,
    camera: cam('site-scaffold'),
    location: 'Research complex site, scaffold face',
    precinct: 'development',
    time: '10:32',
    date: '2026-10-26',
    summary:
      'Worker without hard hat on level 2 scaffold. Contractor safety officer notified.',
    timeline: [
      T('10:32', 'PPE non-compliance', 'EzVision'),
      T('10:40', 'Contractor SHO acknowledged', 'Contractor'),
    ],
    sop: [{ step: 'Notify contractor safety officer', done: true }],
  },
  {
    id: 'UM-26-1025',
    title: 'Help point call: Rimba Ilmu path',
    category: 'Personal safety',
    severity: 'Medium',
    status: 'Resolved',
    source: 'Help point',
    camera: cam('perimeter'),
    location: 'Rimba Ilmu boundary path, help point HP-07',
    precinct: 'gates',
    time: '01:12',
    date: '2026-10-26',
    summary:
      'Student asked for an escort to KK8 after a late lab. Escort completed by PB-04.',
    timeline: [
      T('01:12', 'Help point call answered', 'Operator Hakim'),
      T('01:20', 'Escort completed', 'PB-04'),
    ],
    sop: [{ step: 'Offer escort', done: true }],
  },
  {
    id: 'UM-26-1024',
    title: 'Camera offline: southern boundary fence',
    category: 'Facilities',
    severity: 'Medium',
    status: 'Acknowledged',
    source: 'Sensor',
    analytic: 'tamper',
    camera: cam('transit-fence'),
    location: 'Southern boundary fence, Pantai Dalam',
    precinct: 'gates',
    time: '23:48',
    date: '2026-10-25',
    summary:
      'Camera stopped reporting after the storm. This stretch is not being watched; a patrol checkpoint has been added until repaired.',
    timeline: [
      T('23:48', 'Heartbeat lost', 'EzVision'),
      T('07:30', 'Work order raised with Estates', 'Operator Hakim'),
    ],
    sop: [
      { step: 'Add temporary patrol checkpoint', done: true },
      { step: 'Estates repair', done: false },
    ],
  },
];

// ------------------------------------------------------ app sessions (SOS) --

export const appSessions = [
  {
    id: 'S-881',
    kind: 'SOS',
    who: 'Student · Faculty of Science',
    from: 'Perpustakaan Utama',
    to: 'KK12',
    started: '18:36',
    status: 'Officer en route',
    pos: [38, 44] as [number, number],
  },
  {
    id: 'S-879',
    kind: 'Friend Walk',
    who: 'Student · FSKTM',
    from: 'FSKTM',
    to: 'KK8',
    started: '18:33',
    status: 'Walking · 4 min left',
    pos: [58, 40] as [number, number],
  },
  {
    id: 'S-878',
    kind: 'Friend Walk',
    who: 'Student · FBE',
    from: 'UM Central',
    to: 'KK4',
    started: '18:30',
    status: 'Walking · 6 min left',
    pos: [40, 22] as [number, number],
  },
  {
    id: 'S-877',
    kind: 'Escort request',
    who: 'Staff · Faculty of Medicine',
    from: 'UMMC staff car park',
    to: 'Faculty of Medicine',
    started: '18:28',
    status: 'Waiting for officer',
    pos: [82, 62] as [number, number],
  },
  {
    id: 'S-876',
    kind: 'Safety timer',
    who: 'Researcher · Engineering',
    from: 'Machining workshop',
    to: '—',
    started: '17:30',
    status: 'Check-in missed',
    pos: [59, 60] as [number, number],
  },
  {
    id: 'S-874',
    kind: 'Safety timer',
    who: 'Student · Creative Arts',
    from: 'Dewan Budaya',
    to: '—',
    started: '18:00',
    status: 'Due 19:00',
    pos: [45, 30] as [number, number],
  },
];

export const helpPoints = Array.from({ length: 24 }, (_, i) => ({
  id: `HP-${String(i + 1).padStart(2, '0')}`,
  ok: ![6, 17].includes(i),
}));

// --------------------------------------------------- visitors & vehicles --

export const visitors = [
  {
    pass: 'V-2210',
    name: 'Parent visit (pre-registered)',
    host: 'KK12 resident',
    place: 'KK12',
    in: '17:05',
    until: '19:00',
    status: 'On site',
  },
  {
    pass: 'V-2209',
    name: 'Contractor · lift maintenance',
    host: 'Estates',
    place: 'Canselori',
    in: '14:00',
    until: '18:00',
    status: 'Overstayed',
  },
  {
    pass: 'V-2208',
    name: 'Guest speaker',
    host: 'Faculty of Law',
    place: 'Faculty of Law',
    in: '15:30',
    until: '19:30',
    status: 'On site',
  },
  {
    pass: 'V-2207',
    name: 'Convocation guests (family of 4)',
    host: 'Graduate',
    place: 'Dewan Tunku Canselor',
    in: '17:40',
    until: '22:00',
    status: 'On site',
  },
  {
    pass: 'V-2206',
    name: 'Courier',
    host: 'Mailroom',
    place: 'Canselori',
    in: '16:10',
    until: '16:40',
    status: 'Left',
  },
  {
    pass: 'V-2205',
    name: 'Parent visit',
    host: 'KK7 resident',
    place: 'KK7',
    in: '16:00',
    until: '18:00',
    status: 'Overstayed',
  },
  {
    pass: 'V-2204',
    name: 'Industry partner',
    host: 'FSKTM',
    place: 'FSKTM',
    in: '—',
    until: '20:00',
    status: 'Expected',
  },
  {
    pass: 'V-2203',
    name: 'Contractor · tree crew',
    host: 'Estates',
    place: 'Jalan Pantai Baru',
    in: '17:50',
    until: '21:00',
    status: 'On site',
  },
] as const;

export const plateReads = [
  {
    time: '18:39',
    gate: 'Main gate',
    plate: 'WXX 4821',
    permit: 'Staff permit',
    result: 'Valid',
  },
  {
    time: '18:38',
    gate: 'Main gate',
    plate: 'VBK 1190',
    permit: 'Convocation day pass',
    result: 'Valid',
  },
  {
    time: '18:37',
    gate: 'UMMC car park',
    plate: 'BMT 7302',
    permit: 'Hospital visitor',
    result: 'Valid',
  },
  {
    time: '18:35',
    gate: 'Main gate',
    plate: 'JQR 551',
    permit: 'None',
    result: 'Unregistered',
  },
  {
    time: '18:33',
    gate: 'Student centre car park',
    plate: 'WA 2214 K',
    permit: 'Student permit (expired)',
    result: 'Expired permit',
  },
  {
    time: '18:31',
    gate: 'Faculty of Law car park',
    plate: 'VCE 8890',
    permit: 'Staff permit',
    result: 'Valid',
  },
  {
    time: '18:30',
    gate: 'Main gate',
    plate: 'PKR 3017',
    permit: 'Convocation day pass',
    result: 'Valid',
  },
  {
    time: '18:27',
    gate: 'Research complex site',
    plate: 'NDH 6672',
    permit: 'Contractor',
    result: 'Valid',
  },
] as const;

// ------------------------------------------------------------------ events --

export const events = [
  {
    name: 'UM Convocation 2026, Day 3 (evening session)',
    place: 'Dewan Tunku Canselor',
    when: 'Today, 19:30',
    status: 'Live',
    attendance: 3200,
    staff: 46,
    readiness: 92,
    cameras: [
      cam('hall'),
      cam('security-queue'),
      cam('gate'),
      cam('transit-concourse'),
    ],
  },
  {
    name: 'Inter-college futsal finals',
    place: 'Playing fields',
    when: 'Sat 31 Oct, 20:00',
    status: 'Planned',
    attendance: 800,
    staff: 12,
    readiness: 64,
    cameras: [cam('inspection')],
  },
  {
    name: 'Final examinations, semester 1',
    place: 'All faculties',
    when: 'From 18 Jan 2027',
    status: 'Planned',
    attendance: 21000,
    staff: 60,
    readiness: 30,
    cameras: [],
  },
] as const;

export const densitySeries = [
  { t: '18:00', dtc: 1.2, gate: 0.6 },
  { t: '18:05', dtc: 1.6, gate: 0.8 },
  { t: '18:10', dtc: 2.1, gate: 1.1 },
  { t: '18:15', dtc: 2.9, gate: 1.4 },
  { t: '18:20', dtc: 3.7, gate: 1.6 },
  { t: '18:25', dtc: 3.3, gate: 1.5 },
  { t: '18:30', dtc: 2.8, gate: 1.9 },
  { t: '18:35', dtc: 2.6, gate: 2.2 },
  { t: '18:40', dtc: 2.4, gate: 2.0 },
];

// ---------------------------------------------------------- emergencies --

export const broadcastTemplates = [
  {
    id: 'flood',
    name: 'Flash flood warning',
    channels: ['App push', 'SMS', 'Email', 'PA'],
    audience: 'Geofence',
  },
  {
    id: 'storm',
    name: 'Severe storm / fallen trees',
    channels: ['App push', 'Email'],
    audience: 'Whole campus',
  },
  {
    id: 'bomb',
    name: 'Bomb threat: evacuate building',
    channels: ['App push', 'SMS', 'PA'],
    audience: 'Geofence',
  },
  {
    id: 'fire',
    name: 'Fire: evacuate building',
    channels: ['App push', 'PA'],
    audience: 'Building',
  },
  {
    id: 'lockdown',
    name: 'Shelter in place',
    channels: ['App push', 'SMS', 'PA', 'Desktop'],
    audience: 'Whole campus',
  },
  {
    id: 'haze',
    name: 'Haze: API above 200',
    channels: ['App push', 'Email'],
    audience: 'Whole campus',
  },
] as const;

export const broadcasts = [
  {
    time: '17:38',
    template: 'Severe storm / fallen trees',
    audience: 'Whole campus',
    reach: 31840,
    read: 0.71,
  },
  {
    time: '12:00',
    template: 'Convocation traffic advisory',
    audience: 'Staff & students',
    reach: 30210,
    read: 0.64,
  },
  {
    time: 'Fri 10:00',
    template: 'Evacuation drill: Faculty of Science',
    audience: 'Faculty of Science',
    reach: 4620,
    read: 0.93,
  },
];

export const muster = {
  drill: 'Evacuation drill · Faculty of Science (Fri 23 Oct)',
  invited: 4620,
  safe: 4198,
  needHelp: 3,
  noResponse: 419,
  points: [
    { name: 'Assembly point A · Padang', count: 1820 },
    { name: 'Assembly point B · Tasik Varsiti', count: 1504 },
    { name: 'Assembly point C · Car park 3', count: 874 },
  ],
};

// -------------------------------------------------------- welfare (HEP) --

export const welfareCategories = [
  'Medical',
  'Personal safety',
  'Harassment',
  'Bullying',
  'Theft',
  'Mental-health referral',
  'Accident',
] as const;

/** Monthly student-involved cases, last 6 months, aggregated. */
export const welfareMonthly = [
  {
    month: 'May',
    Medical: 21,
    'Personal safety': 9,
    Harassment: 3,
    Bullying: 2,
    Theft: 14,
    'Mental-health referral': 11,
    Accident: 6,
  },
  {
    month: 'Jun',
    Medical: 18,
    'Personal safety': 7,
    Harassment: 2,
    Bullying: 1,
    Theft: 11,
    'Mental-health referral': 9,
    Accident: 5,
  },
  {
    month: 'Jul',
    Medical: 16,
    'Personal safety': 6,
    Harassment: 4,
    Bullying: 2,
    Theft: 10,
    'Mental-health referral': 8,
    Accident: 4,
  },
  {
    month: 'Aug',
    Medical: 24,
    'Personal safety': 11,
    Harassment: 5,
    Bullying: 3,
    Theft: 15,
    'Mental-health referral': 14,
    Accident: 7,
  },
  {
    month: 'Sep',
    Medical: 27,
    'Personal safety': 13,
    Harassment: 4,
    Bullying: 4,
    Theft: 17,
    'Mental-health referral': 16,
    Accident: 8,
  },
  {
    month: 'Oct',
    Medical: 25,
    'Personal safety': 15,
    Harassment: 6,
    Bullying: 3,
    Theft: 13,
    'Mental-health referral': 18,
    Accident: 6,
  },
];

export const appUsage = [
  { month: 'May', sos: 9, walks: 412, escorts: 61, timers: 140 },
  { month: 'Jun', sos: 6, walks: 288, escorts: 44, timers: 102 },
  { month: 'Jul', sos: 7, walks: 301, escorts: 47, timers: 118 },
  { month: 'Aug', sos: 12, walks: 690, escorts: 93, timers: 221 },
  { month: 'Sep', sos: 14, walks: 802, escorts: 118, timers: 268 },
  { month: 'Oct', sos: 13, walks: 851, escorts: 126, timers: 290 },
];

// ------------------------------------------------- analytics & reporting --

export const responseTimes = [
  { week: 'W36', p50: 3.4, p90: 7.9 },
  { week: 'W37', p50: 3.1, p90: 7.2 },
  { week: 'W38', p50: 3.3, p90: 7.4 },
  { week: 'W39', p50: 2.9, p90: 6.8 },
  { week: 'W40', p50: 2.8, p90: 6.1 },
  { week: 'W41', p50: 2.6, p90: 5.9 },
  { week: 'W42', p50: 2.7, p90: 6.2 },
  { week: 'W43', p50: 2.4, p90: 5.6 },
];

export const verification = [
  { analytic: 'Crowd density', confirmed: 61, false: 7 },
  { analytic: 'After-hours intrusion', confirmed: 44, false: 12 },
  { analytic: 'Plate reading (LPR)', confirmed: 1290, false: 21 },
  { analytic: 'Person down', confirmed: 9, false: 4 },
  { analytic: 'Unattended object', confirmed: 6, false: 15 },
  { analytic: 'Aggression / fight (pilot)', confirmed: 5, false: 9 },
  { analytic: 'Smoke / fire', confirmed: 2, false: 6 },
];

/** KPT 2025 safety-inspection directive: campus and residence checklist. */
export const inspectionChecklist = [
  {
    item: 'Access control working at every residential college entrance',
    status: 'Met',
    evidence: '14/14 colleges, door audit 20 Oct',
  },
  {
    item: 'CCTV covers college entrances and common corridors',
    status: 'Met',
    evidence: 'Coverage map export, 60 cameras',
  },
  {
    item: 'Safe, well-lit walking routes (lighting audit)',
    status: 'Partly met',
    evidence: '6 dark-spot tickets open',
  },
  {
    item: 'Hostel visitor entry/exit procedure in use',
    status: 'Met',
    evidence: 'Visitor log, 2 overstays today',
  },
  {
    item: 'Rapid incident response (P90 under 8 min)',
    status: 'Met',
    evidence: 'P90 5.6 min, week 43',
  },
  {
    item: 'Community policing liaison with PDRM',
    status: 'Met',
    evidence: 'Monthly meeting minutes',
  },
  {
    item: 'Flood and business-continuity plan tested',
    status: 'Partly met',
    evidence: 'Drill done; Law car park pumps pending',
  },
  {
    item: 'Rooftop and ledge access secured',
    status: 'Not met',
    evidence: '3 of 9 rooftop doors lack alarms',
  },
] as const;

// ------------------------------------------------------- privacy (DPO) --

export const accessRequests = [
  {
    id: 'FR-311',
    requester: 'Kpl. Hafiz Rahman (PB-01)',
    purpose: 'Theft investigation UM-26-1031',
    cameras: `${cam('records-corridor')}, ${cam('lift-lobby')}`,
    window: '26 Oct 15:30–16:30',
    status: 'Approved',
    approver: 'DPO',
  },
  {
    id: 'FR-310',
    requester: 'PDRM IPD Brickfields',
    purpose: 'Police request (letter ref. 112/26)',
    cameras: cam('gate'),
    window: '24 Oct 22:00–23:00',
    status: 'Pending',
    approver: '—',
  },
  {
    id: 'FR-309',
    requester: 'Faculty of Law dean',
    purpose: 'Check a parking dispute',
    cameras: cam('office-carpark'),
    window: '22 Oct',
    status: 'Refused',
    approver: 'DPO: not a permitted purpose',
  },
  {
    id: 'FR-308',
    requester: 'Data subject (student)',
    purpose: 'Access request for own footage (DSAR)',
    cameras: cam('canteen'),
    window: '20 Oct 12:00–12:15',
    status: 'Approved',
    approver: 'DPO: third parties blurred',
  },
] as const;

export const auditLog = [
  {
    time: '18:37',
    who: 'Operator Aina',
    action: 'Viewed live',
    target: cam('retail-carpark'),
    reason: 'Incident UM-26-1043',
  },
  {
    time: '18:25',
    who: 'Operator Aina',
    action: 'Viewed live',
    target: cam('roof-access'),
    reason: 'Incident UM-26-1040',
  },
  {
    time: '16:52',
    who: 'Kpl. Hafiz Rahman',
    action: 'Requested playback',
    target: cam('records-corridor'),
    reason: 'FR-311',
  },
  {
    time: '16:58',
    who: 'DPO',
    action: 'Approved playback',
    target: 'FR-311',
    reason: 'Theft investigation',
  },
  {
    time: '17:05',
    who: 'Kpl. Hafiz Rahman',
    action: 'Exported clip (watermarked, faces blurred)',
    target: cam('records-corridor'),
    reason: 'FR-311',
  },
  {
    time: '11:20',
    who: 'System',
    action: 'Auto-purged footage older than 30 days',
    target: '60 cameras',
    reason: 'Retention policy',
  },
] as const;

export const retention = [
  {
    data: 'Continuous recording',
    period: '30 days',
    basis: 'Security of premises',
  },
  {
    data: 'Incident evidence clips',
    period: '1 year, or until case closed',
    basis: 'Investigation',
  },
  {
    data: 'Plate reads (LPR)',
    period: '30 days',
    basis: 'Parking and access control',
  },
  {
    data: 'App SOS location trail',
    period: '90 days',
    basis: 'Incident review',
  },
  {
    data: 'Friend Walk location',
    period: 'Deleted when the walk ends',
    basis: 'Consent',
  },
  { data: 'Audit log', period: '7 years', basis: 'Accountability' },
] as const;

export const dpiaRegister = [
  {
    system: 'CCTV & video analytics (EzVision)',
    status: 'Approved',
    reviewed: 'Aug 2026',
  },
  {
    system: 'EzSafe student & staff app',
    status: 'Approved',
    reviewed: 'Sep 2026',
  },
  {
    system: 'Plate reading (LPR) at gates',
    status: 'Approved',
    reviewed: 'Jul 2026',
  },
  {
    system: 'Aggression analytic pilot',
    status: 'Conditional',
    reviewed: 'Oct 2026',
  },
  {
    system: 'Vape / noise sensors in colleges',
    status: 'In review',
    reviewed: '—',
  },
] as const;

// --------------------------------------------------------------- devices --

export const edgeAppliances = [
  {
    id: 'EZ-EDGE-01',
    site: 'Canselori server room',
    cameras: 13,
    cpu: 46,
    gpu: 58,
    temp: 61,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-02',
    site: 'Residential cluster hub',
    cameras: 9,
    cpu: 39,
    gpu: 44,
    temp: 57,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-03',
    site: 'UMMC security office',
    cameras: 13,
    cpu: 63,
    gpu: 71,
    temp: 66,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-04',
    site: 'Engineering faculty',
    cameras: 12,
    cpu: 52,
    gpu: 49,
    temp: 74,
    status: 'Warm',
  },
  {
    id: 'EZ-EDGE-05',
    site: 'Contractor site cabin',
    cameras: 7,
    cpu: 31,
    gpu: 28,
    temp: 59,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-06',
    site: 'Zone 5 · KK9',
    cameras: 6,
    cpu: 22,
    gpu: 19,
    temp: 52,
    status: 'Healthy',
  },
] as const;

// ------------------------------------------------------------------ users --

export const users = [
  {
    name: 'Aina Sofea',
    role: 'SOC operator',
    scope: 'All precincts',
    mfa: true,
    last: 'Now',
  },
  {
    name: 'Hakim Roslan',
    role: 'SOC operator',
    scope: 'All precincts',
    mfa: true,
    last: '07:00',
  },
  {
    name: 'Supt. (PB) Zulkifli Hassan',
    role: 'Chief security officer',
    scope: 'All precincts',
    mfa: true,
    last: '18:22',
  },
  {
    name: 'Prof. Dr. Norhayati Ismail',
    role: 'Pengetua',
    scope: 'KK12',
    mfa: true,
    last: '17:50',
  },
  {
    name: 'Prof. Dr. Azlan Mohd Noor',
    role: 'TNC HEPA',
    scope: 'Aggregated, no video',
    mfa: true,
    last: 'Yesterday',
  },
  {
    name: 'Mr. Gerald Wong',
    role: 'Data protection officer',
    scope: 'Audit & approvals',
    mfa: true,
    last: '16:58',
  },
  {
    name: 'Ir. Salmah Yusof',
    role: 'Estates & IT admin',
    scope: 'Devices, no footage',
    mfa: true,
    last: '09:12',
  },
  {
    name: 'Kpl. Hafiz Rahman',
    role: 'Patrol officer',
    scope: 'Officer app',
    mfa: true,
    last: 'Now',
  },
] as const;
