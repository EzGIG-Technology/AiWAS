/**
 * Universiti Malaya camera-intelligence demonstration data.
 *
 * Everything here is something a camera and its analytics produce: camera
 * status, AI detections, anonymous counts, crowd density, plate reads and
 * searchable recorded footage. Place names come from
 * docs/research/university-campus-safety-audit.md (§9). Detections, plates,
 * people and numbers are fictional. The demo clock is fixed so every render
 * is identical.
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
    cannot: 'Issue a summons. Enforcement is decided by a person.',
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
      'Adult students are not tracked. Cameras count people anonymously per zone; no analytic follows, logs or locates a named person.',
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

// Tamper detection (covered, moved or defocused lens) runs on every camera.
export const cameras: Camera[] = cameraSeeds.map(
  ([scene, name, precinct, building, a, pos, status, partner], i) => ({
    id: `UM-C${String(i + 1).padStart(3, '0')}`,
    name,
    scene,
    precinct,
    building,
    analytics: a.includes('tamper') ? a : [...a, 'tamper'],
    status: status ?? 'online',
    partner,
    pos,
  }),
);

export const cameraById = (id: string) => cameras.find((c) => c.id === id);
export const cameraByScene = (scene: SceneKey) =>
  cameras.find((c) => c.scene === scene)!;

const cam = (scene: SceneKey) => cameraByScene(scene).id;

// ------------------------------------------------------------ detections --

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type EventStatus =
  | 'New'
  | 'Verified'
  | 'False alarm'
  | 'Shared'
  | 'Closed';

/**
 * One AI detection from one camera. Every event has a camera and a model
 * confidence, because every event is produced by an analytic; nothing here
 * comes from a phone, a door sensor or a person's report.
 */
export type CameraEvent = {
  id: string;
  title: string;
  analytic: AnalyticId;
  severity: Severity;
  status: EventStatus;
  confidence: number;
  camera: string;
  time: string;
  date: string;
  summary: string;
  bookmarked?: boolean;
  /** Team the verified clip was handed to, if any. */
  sharedWith?: string;
  timeline: { time: string; text: string; actor: string }[];
};

const T = (time: string, text: string, actor: string) => ({
  time,
  text,
  actor,
});

type EventSeed = [
  id: number,
  scene: SceneKey,
  analytic: AnalyticId,
  title: string,
  severity: Severity,
  status: EventStatus,
  confidence: number,
  time: string,
  summary: string,
  after?: { time: string; text: string; actor: string }[],
  sharedWith?: string,
];

const eventSeeds: EventSeed[] = [
  [
    1043,
    'office-carpark',
    'flood',
    'Water above gauge line in basement car park',
    'High',
    'New',
    0.88,
    '18:29',
    'Standing water passed the 10 cm painted gauge. The level sensor on the same wall agrees. This car park flooded in October 2024.',
  ],
  [
    1042,
    'machine-cell',
    'intrusion',
    'Person in machining workshop after hours',
    'High',
    'New',
    0.81,
    '18:27',
    'One person at the machine cell; the workshop closes at 18:00. Could be a researcher working late.',
  ],
  [
    1041,
    'roof-access',
    'intrusion',
    'Person at rooftop access after hours',
    'High',
    'Shared',
    0.79,
    '18:24',
    'One person passed the rooftop door outside permitted hours. Verified and handed to the security desk.',
    [
      T('18:25', 'Verified on live view', 'Operator Aina'),
      T('18:25', 'Clip shared with security desk', 'Operator Aina'),
    ],
    'Security desk',
  ],
  [
    1040,
    'security-queue',
    'crowd',
    'Crowd density 3.7 p/m² at convocation bag check',
    'Medium',
    'Verified',
    0.91,
    '18:20',
    'Queue for the evening convocation session exceeded 3.5 people per m² for two minutes.',
    [T('18:21', 'Verified; event team notified', 'Operator Aina')],
  ],
  [
    1039,
    'hostel',
    'wildlife',
    'Macaques in KK12 lobby',
    'Low',
    'New',
    0.79,
    '18:14',
    'Two macaques entered through the lobby door, likely from the Block C bin store.',
  ],
  [
    1038,
    'canteen',
    'aggression',
    'Possible altercation in cafeteria',
    'Medium',
    'New',
    0.77,
    '18:11',
    'Rapid contact movement between three tracks. Pilot analytic: verify on video before anyone acts.',
  ],
  [
    1037,
    'ambulance-bay',
    'keepclear',
    'Vehicle stopped in ambulance lane',
    'High',
    'Shared',
    0.93,
    '17:58',
    'Private car stopped in the keep-clear lane for 4 minutes. Clip shared with UMMC security.',
    [
      T('17:59', 'Verified', 'Operator Aina'),
      T('17:59', 'Shared with UMMC security', 'Operator Aina'),
      T('18:03', 'Lane clear on camera', 'EzVision'),
    ],
    'UMMC security',
  ],
  [
    1036,
    'transit-concourse',
    'abandoned',
    'Unattended bag at UM Central',
    'High',
    'False alarm',
    0.82,
    '17:42',
    'Backpack stationary for 5 minutes. Owner visible returning at 17:45; marked false alarm.',
    [T('17:45', 'Owner returned on camera; false alarm', 'Operator Aina')],
  ],
  [
    1035,
    'care-lounge',
    'fall',
    'Person on floor in rehabilitation lounge',
    'Critical',
    'Shared',
    0.9,
    '13:05',
    'Person on the floor and not moving for 20 seconds. Clip shared with the ward station.',
    [
      T('13:05', 'Verified', 'Operator Hakim'),
      T('13:05', 'Shared with ward station', 'Operator Hakim'),
      T('13:06', 'Staff visible attending', 'EzVision'),
    ],
    'UMMC ward station',
  ],
  [
    1034,
    'charging-bay',
    'smoke',
    'Smoke cue at forklift charging bay',
    'High',
    'False alarm',
    0.61,
    '14:48',
    'Dust from sweeping. Zone mask suggested for the floor area.',
    [T('14:50', 'Checked against fire panel; false alarm', 'Operator Hakim')],
  ],
  [
    1033,
    'site-entrance',
    'intrusion',
    'Entry to contractor site after hours',
    'Medium',
    'Closed',
    0.86,
    '17:20',
    'Two people entered after 17:00. The contractor confirmed its night watchman.',
    [
      T('17:24', 'Verified; contractor confirmed', 'Operator Aina'),
      T('17:30', 'Closed', 'Operator Aina'),
    ],
  ],
  [
    1032,
    'site-scaffold',
    'ppe',
    'Missing hard hat on scaffold',
    'Low',
    'Closed',
    0.81,
    '10:32',
    'Worker without a hard hat on the level 2 scaffold.',
    [
      T(
        '10:40',
        'Shared with contractor safety officer; closed',
        'Operator Hakim',
      ),
    ],
  ],
  [
    1031,
    'gate',
    'traffic',
    'Wrong-way vehicle at main gate',
    'Low',
    'Closed',
    0.84,
    '12:10',
    'Car entered through the exit lane.',
    [T('12:12', 'Verified; closed', 'Operator Hakim')],
  ],
  [
    1030,
    'pharmacy-door',
    'tailgating',
    'Pharmacy store door held open 90 s',
    'Medium',
    'Closed',
    0.74,
    '16:55',
    'Door held during a stock delivery, visible on camera.',
    [T('16:57', 'Verified as delivery; closed', 'Operator Hakim')],
  ],
  [
    1029,
    'retail-checkout',
    'queue',
    'Queue over 12 at campus mart checkout',
    'Low',
    'Closed',
    0.88,
    '12:35',
    'Lunchtime queue passed the configured length of 12.',
    [T('12:50', 'Queue cleared; closed', 'EzVision')],
  ],
  [
    1028,
    'care-laundry',
    'tamper',
    'Lens partly obscured: rehabilitation laundry',
    'Medium',
    'New',
    0.83,
    '16:05',
    'Image sharpness fell by 60% and has not recovered. Likely condensation or a moved camera.',
  ],
  [
    1027,
    'taxi-rank',
    'keepclear',
    'Vehicle idling 14 min in e-hailing bay',
    'Low',
    'Closed',
    0.7,
    '15:10',
    'Vehicle stopped in the pick-up bay beyond its 10-minute limit.',
    [T('15:14', 'Verified; driver left; closed', 'Operator Hakim')],
  ],
  [
    1026,
    'turnstile-line',
    'tailgating',
    'Two entries on one pass at Canselori turnstiles',
    'Medium',
    'Verified',
    0.76,
    '08:42',
    'Two people passed one turnstile cycle.',
    [T('08:45', 'Verified', 'Operator Hakim')],
  ],
  [
    1025,
    'restricted-door',
    'intrusion',
    'Person at data centre door after hours',
    'High',
    'Closed',
    0.88,
    '01:20',
    'One person at the server hall door at 01:20. IT on-call engineer, confirmed by IT.',
    [T('01:24', 'Verified; IT confirmed on-call visit', 'Operator Hakim')],
  ],
  [
    1024,
    'site-road',
    'traffic',
    'Vehicle at 42 km/h on haul road',
    'Low',
    'Closed',
    0.8,
    '09:15',
    'Above the 30 km/h site limit.',
    [T('09:20', 'Shared with contractor; closed', 'Operator Hakim')],
  ],
];

export const cameraEvents: CameraEvent[] = eventSeeds.map(
  ([
    id,
    scene,
    analytic,
    title,
    severity,
    status,
    confidence,
    time,
    summary,
    after = [],
    sharedWith,
  ]) => ({
    id: `EV-26-${id}`,
    title,
    analytic,
    severity,
    status,
    confidence,
    camera: cam(scene),
    time,
    date: '2026-10-26',
    summary,
    sharedWith,
    bookmarked: status === 'Shared',
    timeline: [
      T(time, `${analytics[analytic].name} detected`, 'EzVision'),
      ...after,
    ],
  }),
);

export const isOpenEvent = (e: { status: EventStatus }) =>
  e.status === 'New' || e.status === 'Verified';

/** Cameras an operator can raise a demo detection on, with its analytic. */
export const demoDetections: {
  scene: SceneKey;
  analytic: AnalyticId;
  title: string;
  severity: Severity;
}[] = [
  {
    scene: 'perimeter',
    analytic: 'intrusion',
    title: 'Person on Rimba Ilmu boundary path after dark',
    severity: 'High',
  },
  {
    scene: 'corridor',
    analytic: 'aggression',
    title: 'Possible altercation in Engineering corridor',
    severity: 'Medium',
  },
  {
    scene: 'courtyard',
    analytic: 'abandoned',
    title: 'Unattended object in FASS courtyard',
    severity: 'Medium',
  },
];

// -------------------------------------------------- occupancy & footfall --

export type Zone = {
  id: string;
  name: string;
  scene: SceneKey;
  capacity: number;
  now: number;
  peak: number;
  peakAt: string;
  dwellMin: number;
};

const zoneSeeds: [string, SceneKey, number, number, number, string, number][] =
  [
    ['Dewan Tunku Canselor', 'hall', 3200, 1840, 2950, '10:40', 95],
    ['Cafeteria, student centre', 'canteen', 400, 352, 388, '12:50', 34],
    ['Convocation bag check', 'security-queue', 250, 186, 241, '18:20', 9],
    ['UM Central concourse', 'transit-concourse', 600, 244, 520, '17:10', 6],
    [
      'Universiti LRT link bridge',
      'escalator-landing',
      200,
      132,
      196,
      '17:25',
      2,
    ],
    ['UMMC Emergency waiting area', 'ed-waiting', 90, 71, 84, '15:30', 52],
    ['FASS courtyard', 'courtyard', 300, 64, 210, '13:05', 11],
    ['Campus mart', 'shop-entrance', 120, 58, 109, '12:40', 8],
    ['International House lounge', 'gate-hold', 80, 37, 61, '16:00', 22],
    ['Canselori lobby', 'office-lobby', 150, 22, 96, '08:50', 4],
    ['KK12 lobby', 'hostel', 60, 14, 41, '18:05', 7],
    ['FBE lift lobby', 'lift-lobby', 80, 11, 66, '09:55', 2],
  ];

export const zones: Zone[] = zoneSeeds.map(
  ([name, scene, capacity, now, peak, peakAt, dwellMin], i) => ({
    id: `z${i + 1}`,
    name,
    scene,
    capacity,
    now,
    peak,
    peakAt,
    dwellMin,
  }),
);

/** Hourly people counts (entries per hour), anonymous line crossings. */
export const footfall = [
  { hour: '07:00', cafeteria: 120, central: 410, dtc: 60 },
  { hour: '08:00', cafeteria: 340, central: 980, dtc: 420 },
  { hour: '09:00', cafeteria: 280, central: 760, dtc: 1650 },
  { hour: '10:00', cafeteria: 310, central: 620, dtc: 2100 },
  { hour: '11:00', cafeteria: 520, central: 540, dtc: 900 },
  { hour: '12:00', cafeteria: 910, central: 700, dtc: 380 },
  { hour: '13:00', cafeteria: 860, central: 650, dtc: 240 },
  { hour: '14:00', cafeteria: 430, central: 590, dtc: 1480 },
  { hour: '15:00', cafeteria: 390, central: 610, dtc: 1720 },
  { hour: '16:00', cafeteria: 360, central: 880, dtc: 640 },
  { hour: '17:00', cafeteria: 470, central: 1240, dtc: 310 },
  { hour: '18:00', cafeteria: 610, central: 890, dtc: 1950 },
];

/** Average weekday occupancy (% of capacity) by hour, for space planning. */
export const utilisation = [
  {
    zone: 'Cafeteria',
    values: [12, 38, 30, 34, 58, 96, 90, 46, 41, 38, 49, 64],
  },
  {
    zone: 'UM Central',
    values: [28, 72, 55, 44, 39, 50, 47, 42, 44, 63, 88, 64],
  },
  {
    zone: 'FASS courtyard',
    values: [4, 18, 22, 25, 31, 61, 70, 34, 27, 22, 19, 12],
  },
  {
    zone: 'Campus mart',
    values: [10, 35, 40, 44, 66, 91, 84, 52, 48, 50, 61, 47],
  },
  {
    zone: 'Canselori lobby',
    values: [8, 64, 52, 41, 33, 22, 25, 37, 35, 30, 14, 5],
  },
];

// ---------------------------------------------------------------- vehicles --

export const carParks = [
  {
    name: 'Student centre car park',
    scene: 'retail-carpark' as SceneKey,
    capacity: 420,
    occupied: 388,
  },
  {
    name: 'UMMC visitor car park',
    scene: 'hosp-carpark' as SceneKey,
    capacity: 600,
    occupied: 571,
  },
  {
    name: 'Faculty of Law basement',
    scene: 'office-carpark' as SceneKey,
    capacity: 180,
    occupied: 96,
    note: 'Ramp closed: water on gauge',
  },
  {
    name: 'Rehabilitation drop-off',
    scene: 'care-carpark' as SceneKey,
    capacity: 40,
    occupied: 18,
  },
];

export const gateFlow = [
  { hour: '07:00', in: 820, out: 140 },
  { hour: '08:00', in: 1460, out: 310 },
  { hour: '09:00', in: 990, out: 420 },
  { hour: '10:00', in: 610, out: 380 },
  { hour: '11:00', in: 520, out: 470 },
  { hour: '12:00', in: 640, out: 690 },
  { hour: '13:00', in: 580, out: 610 },
  { hour: '14:00', in: 540, out: 500 },
  { hour: '15:00', in: 470, out: 620 },
  { hour: '16:00', in: 520, out: 980 },
  { hour: '17:00', in: 690, out: 1420 },
  { hour: '18:00', in: 910, out: 860 },
];

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

// ------------------------------------------------------------ crowd events --

export const crowdEvents = [
  {
    name: 'UM Convocation 2026, Day 3 (evening session)',
    place: 'Dewan Tunku Canselor',
    when: 'Today, 19:30',
    status: 'Live',
    expected: 3200,
    counted: 1840,
    limit: 3.5,
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
    expected: 800,
    counted: 0,
    limit: 3,
    cameras: [cam('inspection')],
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

// --------------------------------------------------------- forensic search --

export const searchClasses = [
  'Person',
  'Vehicle',
  'Bag or object',
  'Bicycle or motorcycle',
] as const;
export type SearchClass = (typeof searchClasses)[number];
export const vehicleColours = [
  'Any colour',
  'White',
  'Silver',
  'Black',
  'Red',
  'Blue',
] as const;

const classFor: Partial<Record<AnalyticId, SearchClass[]>> = {
  lpr: ['Vehicle', 'Bicycle or motorcycle'],
  traffic: ['Vehicle'],
  keepclear: ['Vehicle'],
  abandoned: ['Bag or object', 'Person'],
};

/**
 * Recorded-footage search by time, place and object class. People can be
 * found only as "a person, here, at this time": there is no search by face,
 * clothing or appearance. Every search needs a purpose and is audited.
 */
export function searchFootage(q: {
  cls: SearchClass;
  precinct: PrecinctId | 'all';
  from: string;
  to: string;
  colour: (typeof vehicleColours)[number];
}) {
  const hours = (t: string) => Number(t.slice(0, 2)) + Number(t.slice(3)) / 60;
  const lo = hours(q.from);
  const hi = hours(q.to);
  const out: { id: string; camera: Camera; time: string; label: string }[] = [];
  cameras
    .filter((c) => c.status !== 'offline')
    .filter((c) => q.precinct === 'all' || c.precinct === q.precinct)
    .forEach((c, ci) => {
      const classes = c.analytics.flatMap((a) => classFor[a] ?? ['Person']);
      if (!classes.includes(q.cls)) return;
      for (let k = 0; k < 3; k++) {
        const h = 7 + ((ci * 7 + k * 5) % 12) + ((ci + k) % 4) * 0.25;
        if (h < lo || h > hi) continue;
        const colour =
          q.cls === 'Vehicle' ? vehicleColours[1 + ((ci + k) % 5)] : null;
        if (q.colour !== 'Any colour' && colour && colour !== q.colour)
          continue;
        const hh = String(Math.floor(h)).padStart(2, '0');
        const mm = String(
          Math.round((h % 1) * 60) + ((ci * 3 + k) % 14),
        ).padStart(2, '0');
        out.push({
          id: `${c.id}-${k}`,
          camera: c,
          time: `${hh}:${mm}`,
          label: colour ? `${colour} vehicle` : q.cls,
        });
      }
    });
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

// ------------------------------------------------------------- reporting --

/** Detection to operator verification, seconds. */
export const verifyTimes = [
  { week: 'W36', p50: 48, p90: 140 },
  { week: 'W37', p50: 44, p90: 131 },
  { week: 'W38', p50: 45, p90: 128 },
  { week: 'W39', p50: 39, p90: 117 },
  { week: 'W40', p50: 36, p90: 104 },
  { week: 'W41', p50: 33, p90: 99 },
  { week: 'W42', p50: 34, p90: 101 },
  { week: 'W43', p50: 29, p90: 88 },
];

export const uptimeWeekly = [
  { week: 'W36', uptime: 97.9 },
  { week: 'W37', uptime: 98.4 },
  { week: 'W38', uptime: 98.1 },
  { week: 'W39', uptime: 96.2 },
  { week: 'W40', uptime: 97.6 },
  { week: 'W41', uptime: 98.7 },
  { week: 'W42', uptime: 98.2 },
  { week: 'W43', uptime: 96.8 },
];

/** Operator-verified outcomes over 90 days. */
export const verification = [
  { analytic: 'Crowd density', confirmed: 61, false: 7 },
  { analytic: 'After-hours intrusion', confirmed: 44, false: 12 },
  { analytic: 'Plate reading (LPR)', confirmed: 1290, false: 21 },
  { analytic: 'Person down', confirmed: 9, false: 4 },
  { analytic: 'Unattended object', confirmed: 6, false: 15 },
  { analytic: 'Aggression / fight (pilot)', confirmed: 5, false: 9 },
  { analytic: 'Smoke / fire', confirmed: 2, false: 6 },
];

/** CCTV items from KPT's 2025 campus safety-inspection directive. */
export const cctvChecklist = [
  {
    item: 'CCTV covers residential college entrances and common corridors',
    status: 'Met',
    evidence: '14/14 colleges on the coverage map',
  },
  {
    item: 'CCTV covers campus entrances and car parks',
    status: 'Met',
    evidence: 'Both gates, 5 car parks',
  },
  {
    item: 'Camera uptime at least 95% over 30 days',
    status: 'Met',
    evidence: '96.8% in week 43',
  },
  {
    item: 'Offline cameras repaired within 72 hours',
    status: 'Partly met',
    evidence: 'Southern fence camera offline 19 h, awaiting parts',
  },
  {
    item: 'Coverage map and camera register filed',
    status: 'Met',
    evidence: 'Register export, 60 cameras',
  },
  {
    item: '30-day retention applied and purged on schedule',
    status: 'Met',
    evidence: 'Auto-purge log, daily',
  },
  {
    item: 'CCTV signage at every covered zone',
    status: 'Met',
    evidence: 'Signage register, 48 zones',
  },
  {
    item: 'Rooftop and ledge access covered',
    status: 'Not met',
    evidence: '3 of 9 rooftop doors have no camera',
  },
] as const;

// ------------------------------------------------------- privacy (DPO) --

export const accessRequests = [
  {
    id: 'FR-311',
    requester: 'Kpl. Hafiz Rahman (Polis Bantuan)',
    purpose: 'Theft report, library entrance (police ref. BRK/1042/26)',
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
    time: '18:25',
    who: 'Operator Aina',
    action: 'Viewed live',
    target: cam('roof-access'),
    reason: 'Event EV-26-1041',
  },
  {
    time: '18:21',
    who: 'Operator Aina',
    action: 'Viewed live',
    target: cam('security-queue'),
    reason: 'Event EV-26-1040',
  },
  {
    time: '17:12',
    who: 'Operator Hakim',
    action: 'Searched footage: Vehicle, Transit & parking, 16:00–17:00',
    target: '5 cameras',
    reason: 'Parking complaint ref. P-221',
  },
  {
    time: '16:58',
    who: 'DPO',
    action: 'Approved playback',
    target: 'FR-311',
    reason: 'Police-referenced theft report',
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
    data: 'Verified event clips',
    period: '1 year, or until the matter closes',
    basis: 'Investigation',
  },
  {
    data: 'Plate reads (LPR)',
    period: '30 days',
    basis: 'Parking and access control',
  },
  {
    data: 'Anonymous counts (occupancy, footfall)',
    period: '2 years, aggregated hourly',
    basis: 'Space planning',
  },
  { data: 'Footage search queries', period: '1 year', basis: 'Accountability' },
  { data: 'Audit log', period: '7 years', basis: 'Accountability' },
] as const;

export const dpiaRegister = [
  {
    system: 'CCTV & video analytics (EzVision)',
    status: 'Approved',
    reviewed: 'Aug 2026',
  },
  {
    system: 'Plate reading (LPR) at gates',
    status: 'Approved',
    reviewed: 'Jul 2026',
  },
  {
    system: 'Anonymous occupancy counting',
    status: 'Approved',
    reviewed: 'Sep 2026',
  },
  {
    system: 'Aggression analytic pilot',
    status: 'Conditional',
    reviewed: 'Oct 2026',
  },
  {
    system: 'Forensic footage search',
    status: 'Approved',
    reviewed: 'Oct 2026',
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
    name: 'Supt. (PB) Zulkifli Hassan',
    role: 'Director, security technology',
    scope: 'All cameras',
    mfa: true,
    last: '18:22',
  },
  {
    name: 'Aina Sofea',
    role: 'Video analytics operator',
    scope: 'All cameras',
    mfa: true,
    last: 'Now',
  },
  {
    name: 'Hakim Roslan',
    role: 'Video analytics operator',
    scope: 'All cameras',
    mfa: true,
    last: '07:00',
  },
  {
    name: 'Ir. Salmah Yusof',
    role: 'Facilities & space planning',
    scope: 'Counts only, no footage',
    mfa: true,
    last: '17:40',
  },
  {
    name: 'Mr. Gerald Wong',
    role: 'Data protection officer',
    scope: 'Audit & approvals',
    mfa: true,
    last: '16:58',
  },
  {
    name: 'Kpl. Hafiz Rahman',
    role: 'Mobile responder',
    scope: 'EzVision Mobile alerts',
    mfa: true,
    last: 'Now',
  },
] as const;
