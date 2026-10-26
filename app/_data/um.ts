/**
 * EzVision Campus at Universiti Malaya: the campus, its hostel blocks, the six
 * modules, the detectors and the cameras.
 *
 * Structure follows the EzVision Campus System Spec (26 Oct 2026):
 * university → campus → block → zone → camera, six modules on one engine,
 * and a pilot on two hostel blocks (one female, one male) plus the main gate.
 *
 * Place names are UM's; block names, genders, people, plates, alerts and
 * numbers are fictional. The demo clock is fixed so every render is
 * identical.
 */
import type { SceneKey } from './media';

export const DEMO_NOW = '2026-10-26T18:40:00+08:00';
export const DEMO_DATE = '2026-10-26';
export const DEMO_DATE_LABEL = 'Monday, 26 October 2026';
export const DEMO_TIME = '18:40';

export const university = {
  id: 'um',
  name: 'Universiti Malaya',
  short: 'UM',
  campus: 'Main campus, Lembah Pantai, Kuala Lumpur',
  timeZone: 'Asia/Kuala_Lumpur',
  students: 27000,
  securityUnit: 'Bahagian Keselamatan & Polis Bantuan UM',
  retention: '30 days for alert clips; cases per university policy',
} as const;

/** Small deterministic hash in [0, 1), so seeded data never changes. */
export function rand(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export const toMin = (t: string) =>
  Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
export const fromMin = (m: number) => {
  const d = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`;
};

// ---------------------------------------------------------------- modules --

export type ModuleId =
  | 'hostel'
  | 'safe'
  | 'mobility'
  | 'welfare'
  | 'hse'
  | 'space';

export const moduleIds: ModuleId[] = [
  'hostel',
  'safe',
  'mobility',
  'welfare',
  'hse',
  'space',
];

export const modules: Record<
  ModuleId,
  {
    name: string;
    n: number;
    users: string;
    status: string;
    route: string;
    summary: string;
    features: string[];
    rollout: string;
  }
> = {
  hostel: {
    name: 'Hostel Integrity',
    n: 1,
    users: 'Wardens, felo, Pengetua, HEP',
    status: 'Build',
    route: 'Warden on duty',
    summary:
      'The flagship. Opposite-gender entry, visitors past the lounge, overstays, after-midnight entry and fire-exit use, checked by a warden before anything happens to a student.',
    features: [
      'Block and zone mapping',
      'Opposite-gender boundary alerts',
      'Visitor beyond the lounge',
      'Overstay past visiting hours',
      'After-midnight entry',
      'Side-door and fire-exit entry',
      'Tailgating vs. card taps',
      'Delivery riders past drop-off',
      'Weekly breach report by block, door and hour',
    ],
    rollout: 'Pilot: two blocks',
  },
  safe: {
    name: 'Safe Campus',
    n: 2,
    users: 'Command centre, auxiliary police',
    status: 'PoC + Build',
    route: 'Command centre',
    summary:
      'Fights, falls, crowds, loitering and after-hours intrusion for the command centre, plus search by clothing, colour or plate with a cross-camera timeline.',
    features: [
      'Fight',
      'Person down',
      'Crowd build-up or sudden run',
      'Loitering',
      'After-hours intrusion',
      'Person at height or water edge',
      'Person or plate of interest',
      'Search by clothing, colour or plate',
      'Cross-camera tracking',
      'Weapon and unattended bag (new models)',
    ],
    rollout: 'Phase 1',
  },
  mobility: {
    name: 'Mobility',
    n: 3,
    users: 'Traffic unit, parking office',
    status: 'Live + Build',
    route: 'Traffic unit',
    summary:
      'ParqOS and Vera: plate-recognition gates that replace RFID stickers, parking occupancy, illegal parking, helmets, speeding and blacklisted vehicles.',
    features: [
      'Plate-recognition gates replacing RFID stickers',
      'Visitor plate pre-registration',
      'Parking occupancy',
      'Illegal and OKU-bay parking',
      'Helmet compliance',
      'Speeding',
      'Blacklisted vehicles',
      'Barrier-free visitor payment',
    ],
    rollout: 'Pilot: main gate',
  },
  welfare: {
    name: 'Welfare',
    n: 4,
    users: 'HEP, counselling',
    status: 'PoC',
    route: 'HEP or counselling',
    summary:
      'AIWAS on campus: bullying and ragging, vaping, vandalism and unsafe night routes. Wellbeing signals go to counselling, never to discipline.',
    features: [
      'Bullying and ragging',
      'Vaping and smoking',
      'Vandalism',
      'Unsafe night routes',
      'Wellbeing signals routed to counselling, never to discipline',
    ],
    rollout: 'Phase 2',
  },
  hse: {
    name: 'HSE',
    n: 5,
    users: 'Facilities, OSH',
    status: 'Live + New',
    route: 'Facilities & OSH',
    summary:
      'Smoke and fire, lab and construction PPE, flash flood, radar falls in toilets and changing rooms (no cameras), and animal intrusion.',
    features: [
      'Smoke and fire',
      'Lab and construction PPE',
      'Flash flood',
      'Radar falls in toilets and changing rooms',
      'Animal intrusion (monkeys, dogs)',
    ],
    rollout: 'Phase 2',
  },
  space: {
    name: 'Space & Admin',
    n: 6,
    users: 'Facilities, academic affairs',
    status: 'Build',
    route: 'Facilities',
    summary:
      'Anonymous counts: room and library occupancy, cafeteria queues, event crowds, empty-room energy saving, lost-item search and open-day analytics.',
    features: [
      'Room and library occupancy',
      'Cafeteria queues',
      'Event crowd counts',
      'Empty-room energy saving',
      'Lost-item search',
      'Open-day analytics',
    ],
    rollout: 'Phase 3',
  },
};

// -------------------------------------------------------------- detectors --

export type DetectorStatus =
  | 'Live'
  | 'PoC'
  | 'Build'
  | 'New model'
  | 'Partner'
  | 'To confirm';

export type DetectorId =
  | 'gender_boundary'
  | 'visitor_lounge'
  | 'overstay'
  | 'curfew'
  | 'exit_only'
  | 'tailgating'
  | 'delivery'
  | 'fight'
  | 'person_down'
  | 'crowd'
  | 'loitering'
  | 'intrusion'
  | 'at_height'
  | 'poi'
  | 'weapon'
  | 'abandoned'
  | 'lpr'
  | 'permit'
  | 'illegal_parking'
  | 'helmet'
  | 'speeding'
  | 'blacklist'
  | 'bullying'
  | 'vaping'
  | 'vandalism'
  | 'night_route'
  | 'wellbeing'
  | 'smoke'
  | 'ppe'
  | 'flood'
  | 'radar_fall'
  | 'animal'
  | 'occupancy'
  | 'queue'
  | 'event_count'
  | 'energy'
  | 'lost_item'
  | 'health';

export type Detector = {
  name: string;
  module: ModuleId | 'core';
  detects: string;
  cannot: string;
  status: DetectorStatus;
  priority: 'P1' | 'P2' | 'P3';
};

const d = (
  module: Detector['module'],
  name: string,
  status: DetectorStatus,
  priority: Detector['priority'],
  detects: string,
  cannot: string,
): Detector => ({ module, name, status, priority, detects, cannot });

export const detectors: Record<DetectorId, Detector> = {
  gender_boundary: d(
    'hostel',
    'Opposite-gender entry',
    'Build',
    'P1',
    'A person whose estimated gender differs from the block’s crosses its door or lounge line. Used only at single-gender block boundaries.',
    'Identify anyone, or tell a permitted parent, contractor or staff member from a breach. Accuracy at night and with hijab is untested until the pilot. A warden checks every alert.',
  ),
  visitor_lounge: d(
    'hostel',
    'Visitor beyond the lounge',
    'Build',
    'P1',
    'A person tagged as a visitor at the lounge sign-in crosses into the residential corridors.',
    'Tell a visitor from a resident without the lounge sign-in.',
  ),
  overstay: d(
    'hostel',
    'Overstay past visiting hours',
    'Build',
    'P1',
    'A visitor seen entering during visiting hours who is not seen leaving by closing time.',
    'See exits through doors that have no camera; a missed exit looks like an overstay.',
  ),
  curfew: d(
    'hostel',
    'Entry after curfew',
    'Build',
    'P1',
    'Anyone entering the block after the curfew set by the Pengetua.',
    'Know whether the resident had permission to be out late.',
  ),
  exit_only: d(
    'hostel',
    'Side-door and fire-exit entry',
    'Build',
    'P1',
    'Anyone entering through a door that should be exit-only.',
    'Tell a fire drill from a breach unless the drill is scheduled in the rules studio.',
  ),
  tailgating: d(
    'hostel',
    'More people than card taps',
    'Build',
    'P1',
    'More people pass a card door than cards were tapped, using the reader’s door events.',
    'Work without the card-reader export; without it, the rule stays off.',
  ),
  delivery: d(
    'hostel',
    'Delivery rider past drop-off',
    'Build',
    'P2',
    'A person with a delivery helmet or bag crosses past the parcel drop-off line.',
    'Tell a resident who rides for a delivery app from a visiting rider.',
  ),
  fight: d(
    'safe',
    'Fight / assault',
    'PoC',
    'P1',
    'Violent body motion between two or more people.',
    'Tell play-fighting or sport from assault. Verify on video before anyone acts.',
  ),
  person_down: d(
    'safe',
    'Person down',
    'Build',
    'P1',
    'A fall or collapse with no movement after it.',
    'Say whether the person is hurt.',
  ),
  crowd: d(
    'safe',
    'Crowd build-up or sudden run',
    'Build',
    'P1',
    'Fast build-up past a density limit, or sudden dispersal, in a zone.',
    'Say why people are gathering or running.',
  ),
  loitering: d(
    'safe',
    'Loitering',
    'Build',
    'P1',
    'A person staying in a zone past its time limit (hostel entrances, ATMs, dark paths).',
    'Infer intent. Waiting for a friend is not a threat.',
  ),
  intrusion: d(
    'safe',
    'After-hours intrusion',
    'Build',
    'P1',
    'A person or vehicle in a closed zone (labs, server rooms, rooftops) during its closed hours.',
    'Know whether the person has permission.',
  ),
  at_height: d(
    'safe',
    'Person at height or water edge',
    'Build',
    'P2',
    'A person beyond a safe line on rooftops, bridges or the lake edge. Counselling is told as well as the command centre.',
    'Know why the person is there.',
  ),
  poi: d(
    'safe',
    'Person or plate of interest',
    'Build',
    'P1',
    'A listed plate, or a person matching a described clothing and colour, appears on a camera.',
    'Identify a person by face. Descriptions match clothing, not identity.',
  ),
  weapon: d(
    'safe',
    'Weapon in view',
    'New model',
    'P2',
    'A knife, parang or firearm held in hand.',
    'Tell a prop or a tool from a weapon reliably. New model, evaluation only.',
  ),
  abandoned: d(
    'safe',
    'Unattended bag',
    'New model',
    'P2',
    'An object left alone beyond a time limit.',
    'Know what is inside. New model, evaluation only.',
  ),
  lpr: d(
    'mobility',
    'Plate-recognition gate',
    'Live',
    'P1',
    'Reads plates and matches staff, student and visitor permits, replacing RFID stickers.',
    'Read plates that are dirty, bent or covered.',
  ),
  permit: d(
    'mobility',
    'Permit enforcement',
    'Live',
    'P1',
    'A plate parked in a zone its permit does not cover.',
    'Know about a permit issued on paper and not entered.',
  ),
  illegal_parking: d(
    'mobility',
    'Illegal and OKU-bay parking',
    'Build',
    'P1',
    'Double parking, fire lanes, yellow lines, keep-clear and OKU bays.',
    'See an OKU sticker on the windscreen.',
  ),
  helmet: d(
    'mobility',
    'Helmet compliance',
    'Build',
    'P1',
    'A motorcycle rider or pillion without a helmet on campus roads.',
    'Identify the rider; the plate is read only if the rule asks for it.',
  ),
  speeding: d(
    'mobility',
    'Speeding',
    'Build',
    'P2',
    'Speed estimated between two calibrated points on a campus road.',
    'Produce a speed that would stand as legal evidence.',
  ),
  blacklist: d(
    'mobility',
    'Blacklisted vehicle',
    'Live',
    'P1',
    'A plate on the university’s or police list at a gate.',
    'Know whether the list is current; the traffic unit owns it.',
  ),
  bullying: d(
    'welfare',
    'Bullying and ragging',
    'PoC',
    'P1',
    'Group-on-one aggression, especially in orientation week and hostels.',
    'Know the history between the students. HEP decides; AI never issues a penalty.',
  ),
  vaping: d(
    'welfare',
    'Vaping and smoking',
    'PoC',
    'P1',
    'Vaping or smoking in a no-smoking zone.',
    'Tell vapour from steam in every light.',
  ),
  vandalism: d(
    'welfare',
    'Vandalism',
    'PoC',
    'P2',
    'Damage to property or spray painting.',
    'Tell sanctioned murals from graffiti unless the zone is masked.',
  ),
  night_route: d(
    'welfare',
    'Unsafe night routes',
    'Build',
    'P2',
    'Lone-person and loitering patterns on dark paths, to plan lighting and patrols.',
    'Track any individual; output is counts per path and hour.',
  ),
  wellbeing: d(
    'welfare',
    'Wellbeing signal',
    'Build',
    'P3',
    'Repeated late-night presence at a high-risk spot. Routed to counselling, never to discipline.',
    'Say anything about a person’s state of mind. A counsellor decides whether to follow up.',
  ),
  smoke: d(
    'hse',
    'Smoke and fire',
    'New model',
    'P1',
    'Early smoke or flame in view, before the detector trips.',
    'Replace the fire alarm. Confirm against the fire panel.',
  ),
  ppe: d(
    'hse',
    'Lab and construction PPE',
    'Live',
    'P2',
    'Lab coat, goggles and gloves in labs; hard hat and vest on building sites.',
    'Check that PPE is the right grade.',
  ),
  flood: d(
    'hse',
    'Flash flood',
    'New model',
    'P2',
    'Rising water at drains, underpasses and car parks against a painted gauge.',
    'Measure depth precisely.',
  ),
  radar_fall: d(
    'hse',
    'Radar fall (no camera)',
    'To confirm',
    'P2',
    '60 GHz radar senses a fall or prolonged presence in toilets and changing rooms, with no video.',
    'Show anything: there is no image. Radar status is still to be confirmed.',
  ),
  animal: d(
    'hse',
    'Animal intrusion',
    'New model',
    'P3',
    'Monkeys, stray dogs or snakes in hostels, cafeterias and walkways.',
    'Tell species apart reliably.',
  ),
  occupancy: d(
    'space',
    'Room and space occupancy',
    'Build',
    'P1',
    'Anonymous headcount per room, hall or zone.',
    'Identify anyone. Counts only.',
  ),
  queue: d(
    'space',
    'Queue length',
    'Build',
    'P2',
    'Queue length and wait time per outlet.',
    'Identify anyone. Counts only.',
  ),
  event_count: d(
    'space',
    'Event crowd count',
    'Build',
    'P1',
    'Live counts per hall and gate against capacity.',
    'Identify anyone. Counts only.',
  ),
  energy: d(
    'space',
    'Empty-room energy saving',
    'Partner',
    'P2',
    'An empty room signals the building system (BACnet) to switch off air-conditioning and lights.',
    'Override a booking; the timetable wins.',
  ),
  lost_item: d(
    'space',
    'Lost-item search',
    'Build',
    'P2',
    'Finds where a bag or laptop was left by searching footage.',
    'Say who took an item.',
  ),
  health: d(
    'core',
    'Camera health',
    'Live',
    'P1',
    'Offline, blocked, blurred or moved cameras, checked daily.',
    'Repair the camera.',
  ),
};

export const detectorIds = Object.keys(detectors) as DetectorId[];

// -------------------------------------------------------------- precincts --

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
    description: 'Main gate on Jalan Universiti and the Rimba Ilmu boundary.',
  },
  academic: {
    name: 'Academic core',
    description: 'Faculties and Dewan Tunku Canselor.',
  },
  residential: {
    name: 'Residential colleges',
    description:
      'Kolej Kediaman on the main campus, including the KK12 pilot block.',
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
    description: 'UM Central shuttle hub, the LRT link and campus car parks.',
  },
  estates: {
    name: 'Estates, labs & stores',
    description: 'Engineering workshops, central stores and service routes.',
  },
  development: {
    name: 'Campus development',
    description: 'Contractor site for the new research complex.',
  },
  zone5: {
    name: 'Zone 5 · Petaling Jaya',
    description:
      'KK9 Tun Syed Zahiruddin, including the KK9 pilot block, and International House.',
  },
};

export const precinctIds = Object.keys(precincts) as PrecinctId[];

// ----------------------------------------------------------------- blocks --

export type BlockId = 'kk12-a' | 'kk9-b';
export type CollegeId = 'kk12' | 'kk9';

export const colleges: Record<
  CollegeId,
  { name: string; short: string; precinct: PrecinctId }
> = {
  kk12: {
    name: 'Kolej Kediaman 12 Raja Dr Nazrin Shah',
    short: 'KK12',
    precinct: 'residential',
  },
  kk9: {
    name: 'Kolej Kediaman 9 Tun Syed Zahiruddin',
    short: 'KK9',
    precinct: 'zone5',
  },
};

export type BlockHours = {
  /** Weekday visiting window in the lounge. */
  visitFrom: string;
  visitTo: string;
  /** Any entry after this time raises an alert until 06:00. */
  curfew: string;
};

export type Block = {
  id: BlockId;
  college: CollegeId;
  name: string;
  type: 'Hostel (female)' | 'Hostel (male)';
  /** Residents' gender; the boundary rule flags the other one. */
  residents: 'female' | 'male';
  beds: number;
  floors: number;
  hours: BlockHours;
};

/**
 * The pilot's two blocks. Hours follow the UTeM rule book as the spec's
 * example (visiting 5–10 pm on weekdays, midnight curfew); each Pengetua can
 * change them in the rules studio. Block names and genders are illustrative.
 */
export const blocks: Block[] = [
  {
    id: 'kk12-a',
    college: 'kk12',
    name: 'Blok A',
    type: 'Hostel (female)',
    residents: 'female',
    beds: 412,
    floors: 5,
    hours: { visitFrom: '17:00', visitTo: '22:00', curfew: '00:00' },
  },
  {
    id: 'kk9-b',
    college: 'kk9',
    name: 'Blok B',
    type: 'Hostel (male)',
    residents: 'male',
    beds: 380,
    floors: 4,
    hours: { visitFrom: '17:00', visitTo: '22:00', curfew: '00:00' },
  },
];

export const blockById = (id: BlockId) => blocks.find((b) => b.id === id)!;
export const blockLabel = (id: BlockId) => {
  const b = blockById(id);
  return `${colleges[b.college].short} ${b.name}`;
};

// ---------------------------------------------------------------- cameras --

export type Health = 'online' | 'offline' | 'blocked' | 'blurred' | 'moved';
export type ZoneType =
  | 'entrance'
  | 'lounge'
  | 'corridor'
  | 'exit-only'
  | 'restricted'
  | 'outdoor'
  | 'road'
  | 'car park'
  | 'indoor';

export type Camera = {
  id: string;
  name: string;
  scene: SceneKey;
  precinct: PrecinctId;
  building: string;
  zoneType: ZoneType;
  block?: BlockId;
  detectors: DetectorId[];
  status: Health;
  edge: string;
  pilot: boolean;
  partner?: string;
  /** [x, y] on the schematic campus map, in percent. */
  pos: [number, number];
};

type CamSeed = Omit<
  Camera,
  'id' | 'status' | 'edge' | 'pilot' | 'detectors'
> & {
  detectors: DetectorId[];
  status?: Health;
};

const C = (
  scene: SceneKey,
  name: string,
  precinct: PrecinctId,
  building: string,
  zoneType: ZoneType,
  detectorList: DetectorId[],
  pos: [number, number],
  extra: Partial<CamSeed> = {},
): CamSeed => ({
  scene,
  name,
  precinct,
  building,
  zoneType,
  detectors: detectorList,
  pos,
  ...extra,
});

const cameraSeeds: CamSeed[] = [
  // Pilot: KK12 Blok A (female)
  C(
    'care-entrance',
    'KK12 Blok A, main entrance (inside)',
    'residential',
    'KK12 Blok A',
    'entrance',
    ['curfew', 'tailgating', 'overstay'],
    [66, 22],
    { block: 'kk12-a' },
  ),
  C(
    'hostel',
    'KK12 Blok A, lounge to corridor line',
    'residential',
    'KK12 Blok A',
    'lounge',
    ['gender_boundary', 'visitor_lounge', 'overstay', 'animal'],
    [68, 24],
    { block: 'kk12-a' },
  ),
  C(
    'care-corridor',
    'KK12 Blok A, level 2 corridor',
    'residential',
    'KK12 Blok A',
    'corridor',
    ['overstay', 'bullying'],
    [70, 22],
    { block: 'kk12-a' },
  ),
  C(
    'stockroom-door',
    'KK12 Blok A, parcel room door',
    'residential',
    'KK12 Blok A',
    'entrance',
    ['delivery'],
    [65, 26],
    { block: 'kk12-a' },
  ),
  C(
    'plant-corridor',
    'KK12 Blok A, ground-floor fire exit',
    'residential',
    'KK12 Blok A',
    'exit-only',
    ['exit_only'],
    [71, 27],
    { block: 'kk12-a' },
  ),
  C(
    'care-laundry',
    'KK12 Blok A, laundry and drying area',
    'residential',
    'KK12 Blok A',
    'indoor',
    ['animal', 'smoke'],
    [69, 28],
    { block: 'kk12-a' },
  ),
  // Pilot: KK9 Blok B (male)
  C(
    'restricted-door',
    'KK9 Blok B, main entrance (card door)',
    'zone5',
    'KK9 Blok B',
    'entrance',
    ['curfew', 'tailgating', 'overstay'],
    [12, 6],
    { block: 'kk9-b' },
  ),
  C(
    'retail-back',
    'KK9 Blok B, lounge to corridor line',
    'zone5',
    'KK9 Blok B',
    'lounge',
    ['gender_boundary', 'visitor_lounge', 'overstay'],
    [14, 7],
    { block: 'kk9-b' },
  ),
  C(
    'corridor',
    'KK9 Blok B, level 1 open corridor',
    'zone5',
    'KK9 Blok B',
    'corridor',
    ['bullying', 'fight', 'overstay'],
    [15, 5],
    { block: 'kk9-b' },
  ),
  C(
    'records-corridor',
    'KK9 Blok B, stairwell door',
    'zone5',
    'KK9 Blok B',
    'exit-only',
    ['exit_only', 'vaping'],
    [16, 8],
    { block: 'kk9-b' },
  ),
  C(
    'roof-access',
    'KK9 Blok B, rooftop door',
    'zone5',
    'KK9 Blok B',
    'restricted',
    ['at_height', 'wellbeing', 'intrusion'],
    [13, 4],
    { block: 'kk9-b' },
  ),
  C(
    'office-perimeter',
    'KK9, path from Blok B to the bus stop',
    'zone5',
    'KK9',
    'outdoor',
    ['loitering', 'night_route'],
    [18, 10],
  ),
  // Pilot: main gate
  C(
    'gate',
    'Main gate, Jalan Universiti',
    'gates',
    'Main gate',
    'road',
    ['lpr', 'blacklist', 'permit', 'helmet', 'poi'],
    [9, 22],
  ),
  // Gates & perimeter
  C(
    'perimeter',
    'Rimba Ilmu boundary path',
    'gates',
    'Rimba Ilmu',
    'outdoor',
    ['intrusion', 'animal', 'loitering'],
    [14, 62],
  ),
  C(
    'transit-fence',
    'Southern boundary fence, Pantai Dalam',
    'gates',
    'South boundary',
    'outdoor',
    ['intrusion'],
    [40, 92],
    { status: 'offline' },
  ),
  // Academic core
  C(
    'courtyard',
    'Faculty of Arts & Social Sciences courtyard',
    'academic',
    'FASS',
    'outdoor',
    ['fight', 'crowd', 'bullying', 'vaping', 'abandoned'],
    [33, 30],
  ),
  C(
    'hall',
    'Dewan Tunku Canselor, main hall',
    'academic',
    'Dewan Tunku Canselor',
    'indoor',
    ['event_count', 'crowd', 'smoke'],
    [42, 24],
  ),
  C(
    'training',
    'Faculty of Science walkway (drill camera)',
    'academic',
    'Faculty of Science',
    'outdoor',
    ['weapon', 'fight'],
    [50, 40],
  ),
  C(
    'lift-lobby',
    'Faculty of Business & Economics, lift lobby',
    'academic',
    'FBE',
    'indoor',
    ['occupancy', 'energy', 'loitering'],
    [30, 46],
  ),
  C(
    'security-queue',
    'DTC convocation entry, bag check',
    'academic',
    'Dewan Tunku Canselor',
    'entrance',
    ['queue', 'crowd', 'abandoned', 'weapon'],
    [43, 22],
  ),
  // Student life & commerce
  C(
    'canteen',
    'Cafeteria, student centre',
    'student',
    'Student centre',
    'indoor',
    ['queue', 'occupancy', 'fight', 'smoke'],
    [46, 50],
  ),
  C(
    'inspection',
    'Padang, sports equipment check',
    'student',
    'Playing fields',
    'outdoor',
    ['intrusion', 'event_count'],
    [62, 76],
  ),
  C(
    'shop-entrance',
    'Campus mart, entrance',
    'student',
    'Campus mart',
    'entrance',
    ['occupancy', 'vandalism', 'abandoned'],
    [52, 46],
  ),
  C(
    'retail-checkout',
    'Campus mart, checkout',
    'student',
    'Campus mart',
    'indoor',
    ['queue'],
    [53, 47],
  ),
  C(
    'retail-aisle',
    'Campus mart, aisle 3',
    'student',
    'Campus mart',
    'indoor',
    ['person_down'],
    [54, 45],
  ),
  C(
    'retail-dock',
    'Campus mart, loading bay',
    'student',
    'Campus mart',
    'road',
    ['illegal_parking'],
    [56, 47],
  ),
  C(
    'retail-carpark',
    'Student centre car park',
    'student',
    'Student centre',
    'car park',
    ['occupancy', 'illegal_parking', 'permit', 'flood'],
    [49, 54],
  ),
  // UMMC
  C(
    'hosp-entrance',
    'UMMC main entrance',
    'ummc',
    'UMMC',
    'entrance',
    ['crowd', 'abandoned'],
    [84, 52],
  ),
  C(
    'ed-waiting',
    'UMMC Emergency Department waiting area',
    'ummc',
    'UMMC',
    'indoor',
    ['fight', 'crowd', 'occupancy'],
    [86, 56],
  ),
  C(
    'ward-corridor',
    'UMMC Menara Selatan ward corridor',
    'ummc',
    'UMMC',
    'corridor',
    ['person_down'],
    [88, 48],
  ),
  C(
    'pharmacy-door',
    'UMMC pharmacy store door',
    'ummc',
    'UMMC',
    'restricted',
    ['tailgating', 'intrusion'],
    [85, 47],
  ),
  C(
    'ambulance-bay',
    'UMMC ambulance bay',
    'ummc',
    'UMMC',
    'road',
    ['illegal_parking'],
    [87, 60],
  ),
  C(
    'hosp-carpark',
    'UMMC visitor car park',
    'ummc',
    'UMMC',
    'car park',
    ['occupancy', 'permit', 'flood'],
    [82, 63],
  ),
  C(
    'care-lounge',
    'UMMC rehabilitation centre, day lounge',
    'ummc',
    'Rehabilitation centre',
    'indoor',
    ['person_down'],
    [92, 41],
  ),
  C(
    'care-dining',
    'Rehabilitation centre, dining room',
    'ummc',
    'Rehabilitation centre',
    'indoor',
    ['person_down', 'smoke'],
    [93, 42],
    { status: 'blurred' },
  ),
  C(
    'care-garden',
    'Rehabilitation centre, therapy garden',
    'ummc',
    'Rehabilitation centre',
    'outdoor',
    ['person_down', 'intrusion'],
    [94, 38],
  ),
  C(
    'care-carpark',
    'Rehabilitation centre, drop-off',
    'ummc',
    'Rehabilitation centre',
    'road',
    ['illegal_parking'],
    [90, 36],
  ),
  // Chancellery & administration
  C(
    'office-lobby',
    'Canselori, ground-floor lobby',
    'admin',
    'Canselori',
    'indoor',
    ['occupancy', 'abandoned'],
    [40, 34],
  ),
  C(
    'turnstile-line',
    'Canselori, staff turnstiles',
    'admin',
    'Canselori',
    'entrance',
    ['tailgating'],
    [41, 35],
  ),
  C(
    'office-dock',
    'Canselori, mailroom service bay',
    'admin',
    'Canselori',
    'road',
    ['abandoned', 'illegal_parking'],
    [42, 36],
  ),
  // Transit & parking
  C(
    'office-carpark',
    'Faculty of Law, basement car park',
    'transit',
    'Faculty of Law',
    'car park',
    ['flood', 'occupancy'],
    [72, 66],
  ),
  C(
    'transit-concourse',
    'UM Central shuttle hub, concourse',
    'transit',
    'UM Central',
    'indoor',
    ['crowd', 'abandoned', 'lost_item'],
    [26, 18],
  ),
  C(
    'taxi-rank',
    'UM Central, e-hailing pick-up',
    'transit',
    'UM Central',
    'road',
    ['illegal_parking', 'queue'],
    [24, 16],
    { status: 'moved' },
  ),
  C(
    'escalator-landing',
    'Universiti LRT link bridge',
    'transit',
    'LRT link',
    'outdoor',
    ['crowd', 'person_down'],
    [18, 13],
  ),
  C(
    'transit-platform',
    'Universiti LRT platform (partner feed)',
    'transit',
    'Universiti LRT',
    'outdoor',
    ['crowd'],
    [16, 11],
    { partner: 'Rapid Rail · view only' },
  ),
  // Estates, labs & stores
  C(
    'machine-cell',
    'Engineering machining workshop',
    'estates',
    'Faculty of Engineering',
    'restricted',
    ['intrusion', 'ppe', 'smoke'],
    [59, 60],
  ),
  C(
    'goods-dock',
    'Central stores, loading dock',
    'estates',
    'Central stores',
    'road',
    ['illegal_parking', 'abandoned'],
    [66, 84],
  ),
  C(
    'racking-aisle',
    'Central stores, racking aisle',
    'estates',
    'Central stores',
    'indoor',
    ['person_down', 'ppe'],
    [67, 85],
  ),
  C(
    'pick-face',
    'Library book depository',
    'estates',
    'Book depository',
    'indoor',
    ['person_down', 'intrusion'],
    [68, 83],
  ),
  C(
    'packing-line',
    'Penerbit UM, packing room',
    'estates',
    'Penerbit UM',
    'indoor',
    ['smoke'],
    [64, 82],
    { status: 'blocked' },
  ),
  C(
    'plant-yard',
    'Estates yard, waste & recycling',
    'estates',
    'Estates yard',
    'road',
    ['speeding', 'intrusion'],
    [70, 88],
    { status: 'offline' },
  ),
  C(
    'charging-bay',
    'Central stores, forklift charging bay',
    'estates',
    'Central stores',
    'indoor',
    ['smoke'],
    [65, 86],
  ),
  // Campus development
  C(
    'site-entrance',
    'Research complex site, gate',
    'development',
    'Research complex site',
    'entrance',
    ['intrusion', 'lpr'],
    [28, 78],
  ),
  C(
    'site-laydown',
    'Research complex site, laydown area',
    'development',
    'Research complex site',
    'outdoor',
    ['ppe', 'intrusion'],
    [26, 80],
  ),
  C(
    'site-scaffold',
    'Research complex site, scaffold face',
    'development',
    'Research complex site',
    'outdoor',
    ['ppe'],
    [24, 82],
  ),
  C(
    'site-excavation',
    'Research complex site, excavation',
    'development',
    'Research complex site',
    'outdoor',
    ['at_height', 'intrusion'],
    [27, 84],
  ),
  C(
    'site-crane',
    'Research complex site, crane zone',
    'development',
    'Research complex site',
    'outdoor',
    ['ppe', 'intrusion'],
    [25, 86],
  ),
  C(
    'site-road',
    'Research complex site, haul road',
    'development',
    'Research complex site',
    'road',
    ['speeding'],
    [30, 82],
  ),
  C(
    'site-welfare',
    'Research complex site, welfare cabins',
    'development',
    'Research complex site',
    'outdoor',
    ['smoke'],
    [29, 86],
  ),
  // Zone 5
  C(
    'gate-hold',
    'International House, arrivals lounge',
    'zone5',
    'International House',
    'indoor',
    ['occupancy', 'abandoned'],
    [8, 8],
  ),
];

const edgeFor = (s: CamSeed) =>
  s.block === 'kk12-a'
    ? 'EZ-EDGE-02'
    : s.block === 'kk9-b' || s.precinct === 'zone5'
      ? 'EZ-EDGE-06'
      : s.precinct === 'ummc'
        ? 'EZ-EDGE-03'
        : s.precinct === 'estates'
          ? 'EZ-EDGE-04'
          : s.precinct === 'development'
            ? 'EZ-EDGE-05'
            : 'EZ-EDGE-01';

/** Camera health checks run on every camera, so `health` is always present. */
export const cameras: Camera[] = cameraSeeds.map((s, i) => ({
  ...s,
  id: `UM-C${String(i + 1).padStart(3, '0')}`,
  detectors: [...s.detectors, 'health'],
  status: s.status ?? 'online',
  edge: edgeFor(s),
  pilot: !!s.block || s.scene === 'gate',
}));

export const cameraById = (id: string) => cameras.find((c) => c.id === id);
export const cameraByScene = (scene: SceneKey) =>
  cameras.find((c) => c.scene === scene)!;
export const cam = (scene: SceneKey) => cameraByScene(scene).id;
export const pilotCameras = cameras.filter((c) => c.pilot);

export const healthLabel: Record<Health, string> = {
  online: 'Online',
  offline: 'Offline',
  blocked: 'Blocked',
  blurred: 'Blurred',
  moved: 'Moved',
};

/** Today's daily camera-health check: everything not online. */
export const healthIssues: {
  camera: string;
  issue: Exclude<Health, 'online'>;
  since: string;
  detail: string;
  action: string;
}[] = [
  {
    camera: cam('transit-fence'),
    issue: 'offline',
    since: '25 Oct 23:10',
    detail: 'No stream for 19 h. The edge box cannot reach the camera.',
    action: 'Ticket JPPHB-4471: PoE switch replacement, parts due 27 Oct.',
  },
  {
    camera: cam('plant-yard'),
    issue: 'offline',
    since: '26 Oct 14:02',
    detail: 'Power cut at the estates yard.',
    action: 'Estates restoring supply; camera returns with power.',
  },
  {
    camera: cam('packing-line'),
    issue: 'blocked',
    since: '26 Oct 09:15',
    detail: 'Lens covered: boxes stacked in front of the camera.',
    action: 'Penerbit UM asked to clear the shelf.',
  },
  {
    camera: cam('care-dining'),
    issue: 'blurred',
    since: '25 Oct 06:40',
    detail: 'Sharpness down 58%; condensation likely after cleaning.',
    action: 'Wipe the dome; recheck at tomorrow’s 06:00 health run.',
  },
  {
    camera: cam('taxi-rank'),
    issue: 'moved',
    since: '22 Oct 11:30',
    detail:
      'View shifted 12° to the left. The keep-clear zone no longer lines up, so its rule is paused.',
    action: 'Re-aim the camera, then redraw the zone in the rules studio.',
  },
];

/** Daily uptime of all cameras and of the pilot cameras, last 14 days. */
export const uptimeDaily = Array.from({ length: 14 }, (_, i) => {
  const day = 13 + i;
  const all = Math.round((95.4 + rand(`up${i}`) * 3.4) * 10) / 10;
  const pilot = Math.round((98.2 + rand(`pu${i}`) * 1.8) * 10) / 10;
  return {
    day: `${day} Oct`,
    all: i === 13 ? 96.7 : all,
    pilot: i === 13 ? 100 : Math.min(100, pilot),
  };
});

// ------------------------------------------------------------ edge boxes --

export const edgeBoxes = [
  {
    id: 'EZ-EDGE-01',
    site: 'Canselori server room',
    gpu: 58,
    temp: 61,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-02',
    site: 'KK12 network room (pilot)',
    gpu: 44,
    temp: 57,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-03',
    site: 'UMMC security office',
    gpu: 71,
    temp: 66,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-04',
    site: 'Engineering faculty',
    gpu: 49,
    temp: 74,
    status: 'Warm',
  },
  {
    id: 'EZ-EDGE-05',
    site: 'Contractor site cabin',
    gpu: 28,
    temp: 59,
    status: 'Healthy',
  },
  {
    id: 'EZ-EDGE-06',
    site: 'KK9 network room (pilot)',
    gpu: 39,
    temp: 55,
    status: 'Healthy',
  },
].map((b) => ({
  ...b,
  cameras: cameras.filter((c) => c.edge === b.id).length,
}));

export const modelVersions = [
  {
    model: 'Person & vehicle detector',
    version: 'v3.2.1',
    note: 'Shared by every module',
  },
  {
    model: 'Gender estimation (hostel boundaries only)',
    version: 'v0.9.4',
    note: 'Bias test on pilot footage scheduled',
  },
  {
    model: 'Plate reader (ParqOS)',
    version: 'v5.1.0',
    note: 'Malaysian plates incl. motorcycles',
  },
  {
    model: 'Behaviour (fight, bullying, vape)',
    version: 'v2.0.3-aiwas',
    note: 'PoC; AIWAS IP to confirm',
  },
  {
    model: 'Smoke & flame',
    version: 'v0.4.0',
    note: 'New model, evaluation only',
  },
];

// ----------------------------------------------------- counts (Space & Admin) --

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
    ['KK12 Blok A lounge', 'hostel', 60, 14, 41, '18:05', 7],
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

/** Average weekday occupancy (% of capacity) by hour, 07:00–18:00. */
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
    zone: 'FBE lift lobby',
    values: [8, 64, 52, 41, 33, 22, 25, 37, 35, 30, 14, 5],
  },
];

/** Rooms the energy rule switched off today (BACnet integration). */
export const energySavings = [
  { room: 'FBE lecture hall DK1', off: '13:10', hours: 2.5, kwh: 48 },
  { room: 'FBE tutorial room 2.14', off: '15:05', hours: 1.5, kwh: 9 },
  { room: 'FASS seminar room A', off: '16:20', hours: 2, kwh: 14 },
];

// --------------------------------------------------------------- mobility --

export const carParks = [
  {
    name: 'Student centre car park',
    scene: 'retail-carpark' as SceneKey,
    capacity: 420,
    occupied: 388,
    oku: 8,
    okuFree: 1,
  },
  {
    name: 'UMMC visitor car park',
    scene: 'hosp-carpark' as SceneKey,
    capacity: 600,
    occupied: 571,
    oku: 20,
    okuFree: 4,
  },
  {
    name: 'Faculty of Law basement',
    scene: 'office-carpark' as SceneKey,
    capacity: 180,
    occupied: 96,
    oku: 4,
    okuFree: 2,
    note: 'Ramp closed: water on gauge',
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
    permit: 'Visitor (pre-registered)',
    result: 'Valid',
  },
  {
    time: '18:35',
    gate: 'Main gate',
    plate: 'JQR 551',
    permit: 'On university blacklist',
    result: 'Blacklisted',
  },
  {
    time: '18:33',
    gate: 'Main gate',
    plate: 'WA 2214 K',
    permit: 'Student permit (expired)',
    result: 'Expired permit',
  },
  {
    time: '18:31',
    gate: 'Main gate',
    plate: 'VCE 8890',
    permit: 'Staff permit',
    result: 'Valid',
  },
  {
    time: '18:30',
    gate: 'Main gate',
    plate: 'PKR 3017',
    permit: 'None',
    result: 'Unregistered',
  },
  {
    time: '18:27',
    gate: 'Research complex site',
    plate: 'NDH 6672',
    permit: 'Contractor',
    result: 'Valid',
  },
] as const;

export const permits = [
  { type: 'Staff', active: 6120, source: 'e-Pelekat export' },
  { type: 'Student', active: 9480, source: 'e-Pelekat export' },
  {
    type: 'Visitor (pre-registered today)',
    active: 214,
    source: 'EzVision visitor pass',
  },
  { type: 'Contractor', active: 86, source: 'JPPHB list' },
  { type: 'Blacklist', active: 37, source: 'Traffic unit and PDRM list' },
];

/** RFID sticker reads vs. plate reads at the main gate during the pilot. */
export const gateMethod = [
  { week: 'W1', plate: 61, rfid: 39 },
  { week: 'W2', plate: 68, rfid: 32 },
  { week: 'W3', plate: 74, rfid: 26 },
  { week: 'W4', plate: 81, rfid: 19 },
  { week: 'W5', plate: 86, rfid: 14 },
];

// ------------------------------------------------------------------ crowd --

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

/** Night-route counts for lighting and patrol planning (welfare). */
export const nightRoutes = [
  { path: 'KK9 Blok B to bus stop', lone: 46, loiter: 5, lit: 'Partly lit' },
  {
    path: 'Rimba Ilmu boundary path',
    lone: 21,
    loiter: 3,
    lit: 'Unlit section 80 m',
  },
  { path: 'FASS courtyard to UM Central', lone: 58, loiter: 1, lit: 'Lit' },
  { path: 'LRT link bridge', lone: 73, loiter: 2, lit: 'Lit' },
];
