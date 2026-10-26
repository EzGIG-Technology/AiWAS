/**
 * Alerts, rules and cases: the platform core of EzVision Campus.
 *
 * - A rule is zone + object + condition + schedule + action, written in the
 *   rules studio. Rules are versioned forever.
 * - An alert is a rule firing, with a snapshot and a 10-second clip. Every
 *   alert moves New → Acknowledged → Verified → Actioned → Closed. An alert a
 *   warden has not acknowledged escalates to the command centre after 5
 *   minutes, and false alarms feed back to tuning per camera.
 * - A case links alerts, notes, an outcome and evidence exports.
 *
 * The system stores events and alerts, not identities. Everything here is
 * fictional demo data.
 */
import {
  DEMO_DATE,
  blocks,
  blockById,
  blockLabel,
  cam,
  colleges,
  detectors,
  modules,
  rand,
  toMin,
  fromMin,
  type BlockHours,
  type BlockId,
  type CollegeId,
  type DetectorId,
  type ModuleId,
} from './um';

export type Severity = 'High' | 'Medium' | 'Low';
export const severityRank: Record<Severity, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export type AlertStatus =
  | 'New'
  | 'Acknowledged'
  | 'Verified'
  | 'Actioned'
  | 'Closed';
export const lifecycle: { status: AlertStatus; text: string }[] = [
  { status: 'New', text: 'The rule fires; clip and snapshot attached.' },
  {
    status: 'Acknowledged',
    text: 'A warden or operator accepts it; the escalation timer stops.',
  },
  {
    status: 'Verified',
    text: 'Checked on site or on video: true, false alarm or unsure.',
  },
  { status: 'Actioned', text: 'For true alerts, the action taken.' },
  {
    status: 'Closed',
    text: 'Outcome recorded. False alarms feed back to tuning.',
  },
];

export type Verdict = 'True' | 'False alarm' | 'Unsure';

export type TimelineEntry = { time: string; text: string; actor: string };

export type Alert = {
  id: string;
  rule: string;
  detector: DetectorId;
  module: ModuleId;
  severity: Severity;
  title: string;
  /** Null for radar sensors, which have no video at all. */
  camera: string | null;
  sensor?: string;
  block?: BlockId;
  date: string;
  time: string;
  confidence: number;
  status: AlertStatus;
  verdict?: Verdict;
  action?: string;
  outcome?: string;
  assignee?: string;
  route: string;
  alsoNotify?: string;
  /** What the engine saw: estimates and clothing, never an identity. */
  attributes: string[];
  plate?: string;
  summary: string;
  caseId?: string;
  timeline: TimelineEntry[];
};

export const ESCALATE_AFTER_MIN = 5;

/** Wardens get hostel alerts first; everything else goes straight to its office. */
export const routesToWarden = (a: Pick<Alert, 'module'>) =>
  a.module === 'hostel';

/** Minutes since the alert fired, on the demo clock (same day only). */
export function minutesSince(a: Pick<Alert, 'date' | 'time'>, now: string) {
  if (a.date !== DEMO_DATE) return Infinity;
  return toMin(now) - toMin(a.time);
}

/** An unacknowledged hostel alert escalates to the command centre after 5 min. */
export function isEscalated(a: Alert, now: string) {
  if (!routesToWarden(a)) return false;
  if (a.timeline.some((t) => t.text.startsWith('Escalated'))) return true;
  return a.status === 'New' && minutesSince(a, now) >= ESCALATE_AFTER_MIN;
}

export const isOpen = (a: Pick<Alert, 'status'>) => a.status !== 'Closed';

/** Actions a person can record, per module. Welfare signals never offer discipline. */
export function actionsFor(a: Pick<Alert, 'module' | 'detector'>): string[] {
  if (a.detector === 'wellbeing' || a.detector === 'at_height')
    return [
      'Counsellor follow-up',
      'Guard sent to check',
      'No follow-up needed',
    ];
  return {
    hostel: [
      'Warning given',
      'Visitor removed',
      'HEP referral',
      'Rider turned back',
      'Late return recorded',
    ],
    safe: [
      'Guards dispatched',
      'Medical team sent',
      'PDRM informed',
      'Case opened',
    ],
    mobility: [
      'Notice issued',
      'Gate held for guard',
      'Vehicle clamped',
      'Permit renewed',
    ],
    welfare: ['HEP referral', 'Counsellor follow-up', 'Facilities repair'],
    hse: [
      'Maintenance dispatched',
      'Fire panel checked',
      'Area closed',
      'Wildlife team called',
    ],
    space: ['BMS switched off', 'Cleaner sent', 'Outlet told'],
  }[a.module];
}

/** Outcomes in two taps on the warden app. */
export const wardenOutcomes = [
  'Warning given',
  'Visitor removed',
  'HEP referral',
  'Late return recorded',
  'No action needed',
];

// ------------------------------------------------------------------ rules --

export type Schedule =
  | { kind: 'always' }
  | { kind: 'after-visiting' }
  | { kind: 'curfew' }
  | { kind: 'window'; from: string; to: string };

export type Rule = {
  id: string;
  name: string;
  module: ModuleId;
  detector: DetectorId;
  block?: BlockId;
  camera: string | null;
  sensor?: string;
  object: string;
  condition: string;
  /** The line or zone in rules-studio words. */
  where: string;
  /** Line drawn on the camera view: x1, y1, x2, y2 in percent. */
  line?: [number, number, number, number];
  threshold: number;
  schedule: Schedule;
  severity: Severity;
  route: string;
  alsoNotify?: string;
  escalateMin: number | null;
  enabled: boolean;
  version: number;
  updated: string;
  updatedBy: string;
  fired7d: number;
  false7d: number;
  /** Earlier versions saved in this session; every version is kept forever. */
  history?: { version: number; updated: string; by: string; change: string }[];
};

export const scheduleText = (s: Schedule, h?: BlockHours) => {
  switch (s.kind) {
    case 'always':
      return '00:00–24:00 daily';
    case 'after-visiting':
      return `${h?.visitTo ?? '22:00'}–06:00 daily (after visiting hours)`;
    case 'curfew':
      return `${h?.curfew ?? '00:00'}–06:00 daily (curfew)`;
    case 'window':
      return `${s.from}–${s.to} daily`;
  }
};

/** Is a time (HH:MM) inside the rule's schedule? Windows can cross midnight. */
export function inSchedule(s: Schedule, t: string, h?: BlockHours) {
  const [from, to] =
    s.kind === 'always'
      ? ['00:00', '24:00']
      : s.kind === 'after-visiting'
        ? [h?.visitTo ?? '22:00', '06:00']
        : s.kind === 'curfew'
          ? [h?.curfew ?? '00:00', '06:00']
          : [s.from, s.to];
  const m = toMin(t);
  const a = toMin(from);
  const b = to === '24:00' ? 1440 : toMin(to);
  return a <= b ? m >= a && m < b : m >= a || m < b;
}

/** The rule in the studio's language, as the spec writes it. */
export function ruleDsl(r: Rule, h?: BlockHours) {
  const block = r.block ? blockById(r.block) : undefined;
  const lines = [
    `WHEN ${r.object} (${r.condition ? `${r.condition}, ` : ''}confidence ≥ ${r.threshold.toFixed(2)})`,
    r.where,
    `DURING ${scheduleText(r.schedule, h)}${
      r.detector === 'gender_boundary' && block
        ? `   // ${block.residents} block, no ${block.residents === 'female' ? 'male' : 'female'} entry`
        : ''
    }`,
    `THEN alert severity ${r.severity.toUpperCase()} → ${r.route}${r.alsoNotify ? ` + ${r.alsoNotify}` : ''}`,
  ];
  if (r.escalateMin)
    lines.push(
      `ESCALATE to command centre if not acknowledged in ${r.escalateMin} min`,
    );
  return lines.join('\n');
}

const warden = (c: CollegeId) => `warden on duty, ${colleges[c].short}`;

function hostelRules(
  blockId: BlockId,
  letter: string,
  cams: {
    entrance: string;
    lounge: string;
    exit: string;
    exitName: string;
    parcel?: string;
  },
): Rule[] {
  const b = blockById(blockId);
  const other = b.residents === 'female' ? 'male' : 'female';
  const base = {
    module: 'hostel' as const,
    block: blockId,
    route: warden(b.college),
    escalateMin: 5,
    enabled: true,
    updated: '12 Oct 2026',
    updatedBy: 'Pengetua, ' + colleges[b.college].short,
  };
  const lounge = `"${b.name} lounge line"`;
  const rules: Rule[] = [
    {
      ...base,
      id: `R-${letter}01`,
      name: 'Other gender past the lounge line',
      detector: 'gender_boundary',
      camera: cams.lounge,
      object: 'person',
      condition: `gender_est = ${other}`,
      where: `CROSSES line ${lounge} INTO zone "residential"`,
      line: [18, 78, 88, 62],
      threshold: 0.8,
      schedule: { kind: 'always' },
      severity: 'High',
      version: 4,
      fired7d: 6,
      false7d: 1,
    },
    {
      ...base,
      id: `R-${letter}02`,
      name: 'Visitor past the lounge line',
      detector: 'visitor_lounge',
      camera: cams.lounge,
      object: 'person',
      condition: 'visitor_tag = true',
      where: `CROSSES line ${lounge} INTO zone "residential"`,
      line: [18, 78, 88, 62],
      threshold: 0.75,
      schedule: { kind: 'always' },
      severity: 'Medium',
      version: 2,
      fired7d: 4,
      false7d: 1,
    },
    {
      ...base,
      id: `R-${letter}03`,
      name: 'Visitor still inside at closing',
      detector: 'overstay',
      camera: cams.lounge,
      object: 'person',
      condition: 'visitor_tag = true, not seen leaving',
      where: `INSIDE zone "${b.name} lounge and residential"`,
      threshold: 0.7,
      schedule: { kind: 'after-visiting' },
      severity: 'Medium',
      version: 3,
      fired7d: 2,
      false7d: 0,
    },
    {
      ...base,
      id: `R-${letter}04`,
      name: 'Any entry after curfew',
      detector: 'curfew',
      camera: cams.entrance,
      object: 'person',
      condition: '',
      where: `CROSSES line "${b.name} main door" INTO zone "building"`,
      line: [30, 70, 75, 70],
      threshold: 0.7,
      schedule: { kind: 'curfew' },
      severity: 'Medium',
      version: 2,
      fired7d: 5,
      false7d: 0,
    },
    {
      ...base,
      id: `R-${letter}05`,
      name: 'Entry through exit-only door or fire exit',
      detector: 'exit_only',
      camera: cams.exit,
      object: 'person',
      condition: '',
      where: `CROSSES line "${cams.exitName}" INTO zone "building"`,
      line: [35, 82, 70, 82],
      threshold: 0.75,
      schedule: { kind: 'always' },
      severity: 'Medium',
      version: 1,
      fired7d: 3,
      false7d: 1,
    },
    {
      ...base,
      id: `R-${letter}06`,
      name: 'More people than card taps',
      detector: 'tailgating',
      camera: cams.entrance,
      object: 'person',
      condition: 'count > card_taps within 3 s',
      where: `CROSSES line "${b.name} main door" INTO zone "building"`,
      line: [30, 70, 75, 70],
      threshold: 0.75,
      schedule: { kind: 'always' },
      severity: 'Low',
      version: 3,
      fired7d: 7,
      false7d: 3,
    },
  ];
  if (cams.parcel)
    rules.push({
      ...base,
      id: `R-${letter}07`,
      name: 'Delivery rider past drop-off',
      detector: 'delivery',
      camera: cams.parcel,
      object: 'person',
      condition: 'delivery_helmet_or_bag = true',
      where: `CROSSES line "${b.name} parcel drop-off" INTO zone "building"`,
      line: [40, 85, 75, 75],
      threshold: 0.7,
      schedule: { kind: 'always' },
      severity: 'Low',
      version: 1,
      fired7d: 5,
      false7d: 1,
    });
  return rules;
}

const R = (
  id: string,
  name: string,
  module: ModuleId,
  detector: DetectorId,
  camera: string | null,
  object: string,
  condition: string,
  where: string,
  schedule: Schedule,
  severity: Severity,
  route: string,
  extra: Partial<Rule> = {},
): Rule => ({
  id,
  name,
  module,
  detector,
  camera,
  object,
  condition,
  where,
  schedule,
  severity,
  route,
  threshold: 0.75,
  escalateMin: null,
  enabled: true,
  version: 1,
  updated: '1 Oct 2026',
  updatedBy: 'Security director',
  fired7d: 3,
  false7d: 1,
  ...extra,
});

export const seedRules: Rule[] = [
  ...hostelRules('kk12-a', 'A', {
    entrance: cam('care-entrance'),
    lounge: cam('hostel'),
    exit: cam('plant-corridor'),
    exitName: 'Blok A fire exit',
    parcel: cam('stockroom-door'),
  }),
  ...hostelRules('kk9-b', 'B', {
    entrance: cam('restricted-door'),
    lounge: cam('retail-back'),
    exit: cam('records-corridor'),
    exitName: 'Blok B stairwell door',
  }),
  R(
    'R-S01',
    'Loitering on KK9 path after dark',
    'safe',
    'loitering',
    cam('office-perimeter'),
    'person',
    'dwell > 5 min',
    'INSIDE zone "KK9 bus-stop path"',
    { kind: 'window', from: '18:00', to: '06:00' },
    'Medium',
    'command centre',
    { fired7d: 4, false7d: 2 },
  ),
  R(
    'R-S02',
    'Workshop after hours',
    'safe',
    'intrusion',
    cam('machine-cell'),
    'person',
    '',
    'INSIDE zone "Machining workshop"',
    { kind: 'window', from: '18:00', to: '07:00' },
    'High',
    'command centre',
    { fired7d: 3, false7d: 2 },
  ),
  R(
    'R-S03',
    'Person past rooftop safe line',
    'safe',
    'at_height',
    cam('roof-access'),
    'person',
    '',
    'CROSSES line "KK9 Blok B roof safe line" INTO zone "roof edge"',
    { kind: 'always' },
    'High',
    'command centre',
    {
      alsoNotify: 'counselling unit',
      threshold: 0.7,
      line: [20, 80, 80, 60],
      fired7d: 1,
      false7d: 0,
    },
  ),
  R(
    'R-S04',
    'Crowd density at convocation',
    'safe',
    'crowd',
    cam('security-queue'),
    'crowd',
    'density > 3.5 people/m² for 2 min',
    'INSIDE zone "DTC bag check"',
    { kind: 'window', from: '07:00', to: '23:00' },
    'Medium',
    'command centre',
    { fired7d: 5, false7d: 0 },
  ),
  R(
    'R-S05',
    'Fight in cafeteria',
    'safe',
    'fight',
    cam('canteen'),
    'people',
    'violent motion, 2 or more tracks',
    'INSIDE zone "Cafeteria floor"',
    { kind: 'always' },
    'Medium',
    'command centre',
    { threshold: 0.7, fired7d: 3, false7d: 2 },
  ),
  R(
    'R-S06',
    'Unattended bag at UM Central',
    'safe',
    'abandoned',
    cam('transit-concourse'),
    'bag',
    'alone > 5 min',
    'INSIDE zone "UM Central concourse"',
    { kind: 'always' },
    'Medium',
    'command centre',
    { fired7d: 4, false7d: 3 },
  ),
  R(
    'R-M01',
    'Blacklisted plate at a gate',
    'mobility',
    'blacklist',
    cam('gate'),
    'vehicle',
    'plate IN list "blacklist"',
    'CROSSES line "Main gate entry lane"',
    { kind: 'always' },
    'High',
    'traffic unit',
    { alsoNotify: 'command centre', threshold: 0.9, fired7d: 2, false7d: 0 },
  ),
  R(
    'R-M02',
    'OKU bay without sticker',
    'mobility',
    'illegal_parking',
    cam('retail-carpark'),
    'vehicle',
    'parked > 10 min AND plate NOT IN list "OKU"',
    'INSIDE zone "OKU bays"',
    { kind: 'always' },
    'Low',
    'traffic unit',
    { fired7d: 9, false7d: 1 },
  ),
  R(
    'R-M03',
    'Ambulance lane kept clear',
    'mobility',
    'illegal_parking',
    cam('ambulance-bay'),
    'vehicle',
    'stopped > 2 min',
    'INSIDE zone "Ambulance lane"',
    { kind: 'always' },
    'High',
    'traffic unit',
    { alsoNotify: 'UMMC security', fired7d: 6, false7d: 0 },
  ),
  R(
    'R-M04',
    'Speeding on haul road',
    'mobility',
    'speeding',
    cam('site-road'),
    'vehicle',
    'speed > 30 km/h',
    'BETWEEN lines "Haul road A" AND "Haul road B"',
    { kind: 'always' },
    'Low',
    'traffic unit',
    { fired7d: 4, false7d: 0 },
  ),
  R(
    'R-W01',
    'Group-on-one in hostel corridors',
    'welfare',
    'bullying',
    cam('corridor'),
    'people',
    '3 or more around 1, aggressive motion',
    'INSIDE zone "KK9 Blok B corridor"',
    { kind: 'always' },
    'High',
    'command centre',
    { alsoNotify: 'HEP', threshold: 0.7, fired7d: 2, false7d: 1 },
  ),
  R(
    'R-W02',
    'Vaping in no-smoking zones',
    'welfare',
    'vaping',
    cam('records-corridor'),
    'person',
    'vape or smoke plume',
    'INSIDE zone "KK9 Blok B stairwell"',
    { kind: 'always' },
    'Medium',
    'command centre',
    { alsoNotify: 'HEP', fired7d: 5, false7d: 2 },
  ),
  R(
    'R-W03',
    'Repeated late-night presence at the rooftop',
    'welfare',
    'wellbeing',
    cam('roof-access'),
    'person',
    'seen 3+ nights in 7',
    'NEAR zone "KK9 Blok B rooftop door"',
    { kind: 'window', from: '00:00', to: '05:00' },
    'Medium',
    'counselling unit',
    { fired7d: 1, false7d: 0 },
  ),
  R(
    'R-H01',
    'Smoke at charging bay',
    'hse',
    'smoke',
    cam('charging-bay'),
    'smoke',
    'plume > 3 s',
    'INSIDE zone "Charging bay"',
    { kind: 'always' },
    'Medium',
    'facilities & OSH',
    { fired7d: 2, false7d: 2 },
  ),
  R(
    'R-H02',
    'Hard hat on scaffold',
    'hse',
    'ppe',
    cam('site-scaffold'),
    'person',
    'hard_hat = false',
    'INSIDE zone "Scaffold face"',
    { kind: 'window', from: '07:00', to: '19:00' },
    'Low',
    'facilities & OSH',
    { fired7d: 6, false7d: 1 },
  ),
  R(
    'R-H03',
    'Monkeys at Blok A drying area',
    'hse',
    'animal',
    cam('care-laundry'),
    'animal',
    'macaque or dog',
    'INSIDE zone "Blok A drying area"',
    { kind: 'always' },
    'Low',
    'facilities & OSH',
    { block: 'kk12-a', fired7d: 4, false7d: 0 },
  ),
  R(
    'R-H04',
    'Radar fall in Blok A level 2 toilets',
    'hse',
    'radar_fall',
    null,
    'radar presence',
    'fall, then still > 30 s',
    'INSIDE sensor "RADAR-A2-WC"',
    { kind: 'always' },
    'High',
    'warden on duty, KK12',
    {
      sensor: 'RADAR-A2-WC',
      block: 'kk12-a',
      alsoNotify: 'command centre',
      escalateMin: 5,
      fired7d: 1,
      false7d: 0,
    },
  ),
  R(
    'R-H05',
    'Water above gauge in basement car park',
    'hse',
    'flood',
    cam('office-carpark'),
    'water',
    'level > 10 cm gauge',
    'INSIDE zone "Basement ramp"',
    { kind: 'always' },
    'High',
    'facilities & OSH',
    { fired7d: 1, false7d: 0 },
  ),
  R(
    'R-P01',
    'Queue at campus mart',
    'space',
    'queue',
    cam('retail-checkout'),
    'queue',
    'length > 12',
    'INSIDE zone "Checkout queue"',
    { kind: 'window', from: '08:00', to: '22:00' },
    'Low',
    'facilities',
    { fired7d: 8, false7d: 0 },
  ),
  R(
    'R-P02',
    'Empty room with AC on',
    'space',
    'energy',
    cam('lift-lobby'),
    'person',
    'count = 0 for 30 min',
    'INSIDE zone "FBE level 1"',
    { kind: 'window', from: '08:00', to: '20:00' },
    'Low',
    'facilities',
    { fired7d: 11, false7d: 0 },
  ),
  R(
    'R-P03',
    'Hall over capacity',
    'space',
    'event_count',
    cam('hall'),
    'person',
    'count > 95% of capacity',
    'INSIDE zone "DTC main hall"',
    { kind: 'always' },
    'Medium',
    'facilities',
    { alsoNotify: 'command centre', fired7d: 1, false7d: 0 },
  ),
];

/** Yesterday's candidate detections for a rule, for the studio preview. */
export function yesterdayCandidates(r: Rule) {
  return Array.from({ length: 16 }, (_, i) => {
    const conf = Math.round((0.5 + rand(`${r.id}c${i}`) * 0.48) * 100) / 100;
    const minute = Math.floor(rand(`${r.id}t${i}`) * 1440);
    const truth = rand(`${r.id}v${i}`) < (conf - 0.45) * 1.7;
    return { time: fromMin(minute), confidence: conf, truth };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

/** What a draft rule would have done against yesterday's footage. */
export function previewRule(r: Rule, h?: BlockHours) {
  const hits = yesterdayCandidates(r).filter(
    (c) => c.confidence >= r.threshold && inSchedule(r.schedule, c.time, h),
  );
  return {
    hits,
    trueCount: hits.filter((c) => c.truth).length,
    falseCount: hits.filter((c) => !c.truth).length,
  };
}

// ----------------------------------------------------------------- alerts --

const T = (time: string, text: string, actor: string): TimelineEntry => ({
  time,
  text,
  actor,
});

type AlertSeed = Omit<
  Alert,
  'id' | 'module' | 'detector' | 'route' | 'timeline' | 'block' | 'date'
> & {
  key: string;
  date?: string;
  after?: TimelineEntry[];
};

const ruleById = (id: string) => seedRules.find((r) => r.id === id)!;

const seeds: AlertSeed[] = [
  {
    key: 'track',
    rule: 'R-A01',
    severity: 'High',
    title: 'Male estimated past Blok A lounge line',
    camera: cam('hostel'),
    time: '18:31',
    confidence: 0.86,
    status: 'New',
    attributes: [
      'Estimated male · 0.86',
      'Red top, black trousers, backpack',
      'Crossed the lounge line inward at 18:31:12',
    ],
    summary:
      'One person crossed from the lounge into the residential corridor of a female block during visiting hours. Visitors may sit in the lounge only. A warden must check before anything happens.',
  },
  {
    key: 'loiter',
    rule: 'R-S01',
    severity: 'Medium',
    title: 'Person lingering 9 min on KK9 bus-stop path',
    camera: cam('office-perimeter'),
    time: '18:36',
    confidence: 0.78,
    status: 'New',
    attributes: ['1 person', 'Dark hoodie, black trousers'],
    summary:
      'One person has stayed on the unlit section of the path for 9 minutes. Waiting for a bus is common here; look before sending a guard.',
  },
  {
    key: 'plate',
    rule: 'R-M01',
    severity: 'High',
    title: 'Blacklisted plate JQR 551 at main gate',
    camera: cam('gate'),
    time: '18:35',
    confidence: 0.97,
    status: 'New',
    plate: 'JQR 551',
    attributes: [
      'Silver hatchback',
      'Plate on university blacklist since 3 Oct',
    ],
    summary:
      'The plate matches the traffic unit’s blacklist (unpaid clamping and two speeding notices). The barrier stayed down; the car is in the visitor lane.',
  },
  {
    key: 'workshop',
    rule: 'R-S02',
    severity: 'High',
    title: 'Person in machining workshop after hours',
    camera: cam('machine-cell'),
    time: '18:27',
    confidence: 0.81,
    status: 'New',
    attributes: ['1 person', 'Lab coat'],
    summary:
      'One person at the machine cell; the workshop closes at 18:00. Could be a researcher working late.',
  },
  {
    key: 'roof',
    rule: 'R-S03',
    severity: 'High',
    title: 'Person past rooftop safe line, KK9 Blok B',
    camera: cam('roof-access'),
    time: '18:24',
    confidence: 0.83,
    status: 'Actioned',
    verdict: 'True',
    action: 'Guard sent to check',
    assignee: 'Operator Aina',
    alsoNotify: 'Counselling unit',
    attributes: ['1 person', 'Beyond the safe line for 40 s'],
    summary:
      'One person went past the painted safe line by the roof parapet. The command centre and the counselling unit were told together.',
    after: [
      T('18:24', 'Acknowledged', 'Operator Aina'),
      T('18:25', 'Verified true on live view', 'Operator Aina'),
      T(
        '18:25',
        'Guard sent to check; counselling unit informed',
        'Operator Aina',
      ),
      T(
        '18:31',
        'Guard with the student; walked back inside',
        'Kpl. Hafiz Rahman',
      ),
    ],
  },
  {
    key: 'visitor',
    rule: 'R-B02',
    severity: 'Medium',
    title: 'Visitor past Blok B lounge line',
    camera: cam('retail-back'),
    time: '18:22',
    confidence: 0.79,
    status: 'Acknowledged',
    assignee: 'Mohd Hafiz Zain (warden, KK9)',
    attributes: [
      'Visitor tag from lounge sign-in at 18:02',
      'White T-shirt, grey trousers',
    ],
    summary:
      'A signed-in visitor walked from the lounge into the ground-floor corridor.',
    after: [
      T(
        '18:24',
        'Accepted on the warden app; walking to the lounge',
        'Mohd Hafiz Zain',
      ),
    ],
  },
  {
    key: 'crowd',
    rule: 'R-S04',
    severity: 'Medium',
    title: 'Crowd density 3.7 p/m² at convocation bag check',
    camera: cam('security-queue'),
    time: '18:20',
    confidence: 0.91,
    status: 'Actioned',
    verdict: 'True',
    action: 'Guards dispatched',
    assignee: 'Operator Aina',
    attributes: ['Density 3.7 people/m² for 2 min'],
    summary:
      'The queue for the evening convocation session passed 3.5 people per m².',
    after: [
      T('18:20', 'Acknowledged', 'Operator Aina'),
      T('18:21', 'Verified true', 'Operator Aina'),
      T('18:22', 'Second bag-check lane opened', 'Operator Aina'),
    ],
  },
  {
    key: 'monkeys',
    rule: 'R-H03',
    severity: 'Low',
    title: 'Two macaques in Blok A drying area',
    camera: cam('care-laundry'),
    time: '18:14',
    confidence: 0.79,
    status: 'New',
    attributes: ['2 animals (macaque)'],
    summary:
      'Two macaques came in through the open louvres, likely from the bin store. Residents have reported clothes taken from the lines.',
  },
  {
    key: 'fight',
    rule: 'R-S05',
    severity: 'Medium',
    title: 'Possible scuffle in cafeteria',
    camera: cam('canteen'),
    time: '18:11',
    confidence: 0.74,
    status: 'Verified',
    verdict: 'Unsure',
    assignee: 'Operator Aina',
    attributes: ['3 tracks', 'Fast contact motion'],
    summary:
      'Rapid contact between three people. PoC analytic: verify on video before anyone acts.',
    after: [
      T('18:12', 'Acknowledged', 'Operator Aina'),
      T(
        '18:13',
        'Marked unsure: pushing seen, no blows. Guard asked to walk past.',
        'Operator Aina',
      ),
    ],
  },
  {
    key: 'rider',
    rule: 'R-A07',
    severity: 'Low',
    title: 'Delivery rider past Blok A parcel drop-off',
    camera: cam('stockroom-door'),
    time: '18:05',
    confidence: 0.82,
    status: 'Closed',
    verdict: 'True',
    action: 'Rider turned back',
    outcome: 'Rider left the parcel on the drop-off shelf.',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['Delivery helmet and bag'],
    summary:
      'A food-delivery rider walked past the parcel shelf towards the stairs.',
    after: [
      T('18:06', 'Accepted on the warden app', 'Dr. Farah Aziz'),
      T('18:07', 'Verified true on the clip', 'Dr. Farah Aziz'),
      T('18:08', 'Rider turned back', 'Dr. Farah Aziz'),
      T('18:08', 'Closed with outcome', 'Dr. Farah Aziz'),
    ],
  },
  {
    key: 'oku',
    rule: 'R-M02',
    severity: 'Low',
    title: 'Car in OKU bay without sticker',
    camera: cam('retail-carpark'),
    time: '18:02',
    confidence: 0.88,
    status: 'Actioned',
    verdict: 'True',
    action: 'Notice issued',
    plate: 'WA 8812 F',
    assignee: 'Insp. (PB) Ravi Chandran',
    attributes: ['White sedan', 'Parked 14 min'],
    summary: 'A car with no OKU permit has been in an OKU bay for 14 minutes.',
    after: [
      T('18:05', 'Verified true', 'Insp. (PB) Ravi Chandran'),
      T(
        '18:06',
        'Notice issued to the permit holder',
        'Insp. (PB) Ravi Chandran',
      ),
    ],
  },
  {
    key: 'ambulance',
    rule: 'R-M03',
    severity: 'High',
    title: 'Vehicle stopped in UMMC ambulance lane',
    camera: cam('ambulance-bay'),
    time: '17:58',
    confidence: 0.93,
    status: 'Closed',
    verdict: 'True',
    action: 'Gate held for guard',
    outcome: 'Driver moved on after 4 minutes.',
    attributes: ['Black MPV'],
    summary: 'A private car stopped in the keep-clear lane.',
    after: [
      T('17:59', 'Verified; UMMC security told', 'Operator Aina'),
      T('18:03', 'Lane clear on camera; closed', 'Operator Aina'),
    ],
  },
  {
    key: 'stair',
    rule: 'R-B05',
    severity: 'Medium',
    title: 'Entry through Blok B stairwell door',
    camera: cam('records-corridor'),
    time: '17:52',
    confidence: 0.76,
    status: 'Verified',
    verdict: 'Unsure',
    assignee: 'Mohd Hafiz Zain (warden, KK9)',
    attributes: ['1 person', 'Door propped open'],
    summary:
      'Someone came in through the exit-only stairwell door. The door was propped open with a bin.',
    after: [
      T('17:54', 'Accepted', 'Mohd Hafiz Zain'),
      T(
        '17:58',
        'Marked unsure: could not tell who; door un-propped',
        'Mohd Hafiz Zain',
      ),
    ],
  },
  {
    key: 'vape',
    rule: 'R-W02',
    severity: 'Medium',
    title: 'Vaping in Blok B stairwell',
    camera: cam('records-corridor'),
    time: '17:40',
    confidence: 0.84,
    status: 'Actioned',
    verdict: 'True',
    action: 'HEP referral',
    caseId: 'CS-26-038',
    assignee: 'Operator Aina',
    attributes: ['2 people', 'Vapour plume'],
    summary:
      'Two people vaping on the stairwell landing. Third alert at this spot in two weeks.',
    after: [
      T('17:41', 'Verified true', 'Operator Aina'),
      T(
        '17:44',
        'Linked to case CS-26-038 and referred to HEP',
        'Operator Aina',
      ),
    ],
  },
  {
    key: 'bag',
    rule: 'R-S06',
    severity: 'Medium',
    title: 'Unattended bag at UM Central',
    camera: cam('transit-concourse'),
    time: '17:42',
    confidence: 0.82,
    status: 'Closed',
    verdict: 'False alarm',
    outcome:
      'Owner returned at 17:45. Threshold review suggested for this camera.',
    attributes: ['Black backpack'],
    summary: 'Backpack stationary for 5 minutes.',
    after: [
      T('17:45', 'False alarm: owner returned on camera', 'Operator Aina'),
    ],
  },
  {
    key: 'bully',
    rule: 'R-W01',
    severity: 'High',
    title: 'Group of four around one student, Blok B corridor',
    camera: cam('corridor'),
    time: '16:50',
    confidence: 0.81,
    status: 'Actioned',
    verdict: 'True',
    action: 'HEP referral',
    caseId: 'CS-26-041',
    assignee: 'Operator Hakim',
    alsoNotify: 'HEP',
    attributes: ['5 tracks', '4 around 1, pushing'],
    summary:
      'Four people surrounded one student and pushed him against the railing for about a minute.',
    after: [
      T('16:51', 'Verified true; warden KK9 and guards sent', 'Operator Hakim'),
      T('16:58', 'Guards on site; group dispersed', 'Kpl. Hafiz Rahman'),
      T('17:20', 'Case CS-26-041 opened and referred to HEP', 'Operator Hakim'),
    ],
  },
  {
    key: 'radar',
    rule: 'R-H04',
    severity: 'High',
    title: 'Possible fall in Blok A level 2 toilets (radar)',
    camera: null,
    sensor: 'RADAR-A2-WC',
    time: '16:05',
    confidence: 0.88,
    status: 'Closed',
    verdict: 'True',
    action: 'Warning given',
    outcome:
      'Resident slipped; warden and clinic attended. No video exists: radar only.',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['Radar: fall, then still 35 s', 'No camera in this space'],
    summary:
      'The 60 GHz radar sensed a fall and no movement for 35 seconds. There is no camera in toilets; nothing was recorded.',
    after: [
      T('16:06', 'Accepted', 'Dr. Farah Aziz'),
      T('16:09', 'Verified on site: resident slipped', 'Dr. Farah Aziz'),
      T('16:30', 'Closed: clinic checked the resident', 'Dr. Farah Aziz'),
    ],
  },
  {
    key: 'smoke',
    rule: 'R-H01',
    severity: 'Medium',
    title: 'Smoke cue at forklift charging bay',
    camera: cam('charging-bay'),
    time: '14:48',
    confidence: 0.61,
    status: 'Closed',
    verdict: 'False alarm',
    outcome:
      'Dust from sweeping; fire panel normal. Zone mask added for the floor.',
    attributes: ['Plume 4 s'],
    summary: 'New model, evaluation only.',
    after: [
      T(
        '14:50',
        'False alarm: checked against the fire panel',
        'Operator Hakim',
      ),
    ],
  },
  {
    key: 'energy',
    rule: 'R-P02',
    severity: 'Low',
    title: 'FBE level 1 empty 30 min with AC on',
    camera: cam('lift-lobby'),
    time: '13:10',
    confidence: 0.95,
    status: 'Closed',
    verdict: 'True',
    action: 'BMS switched off',
    outcome: 'AC and lights off until the 15:00 booking.',
    attributes: ['0 people for 30 min'],
    summary: 'Nobody in the level 1 lecture rooms since 12:40.',
    after: [T('13:10', 'BMS switched off automatically', 'EzVision')],
  },
  {
    key: 'queue',
    rule: 'R-P01',
    severity: 'Low',
    title: 'Queue over 12 at campus mart checkout',
    camera: cam('retail-checkout'),
    time: '12:35',
    confidence: 0.88,
    status: 'Closed',
    verdict: 'True',
    action: 'Outlet told',
    outcome: 'Second till opened.',
    attributes: ['Queue 14'],
    summary: 'Lunchtime queue passed 12.',
    after: [T('12:50', 'Queue cleared; closed', 'Ir. Salmah Yusof')],
  },
  {
    key: 'ppe',
    rule: 'R-H02',
    severity: 'Low',
    title: 'Missing hard hat on scaffold',
    camera: cam('site-scaffold'),
    time: '10:32',
    confidence: 0.81,
    status: 'Closed',
    verdict: 'True',
    action: 'Maintenance dispatched',
    outcome: 'Contractor safety officer spoke to the worker.',
    attributes: ['1 worker, no hard hat'],
    summary: 'Worker without a hard hat on the level 2 scaffold.',
    after: [
      T(
        '10:40',
        'Shared with the contractor safety officer; closed',
        'Ir. Salmah Yusof',
      ),
    ],
  },
  {
    key: 'speed',
    rule: 'R-M04',
    severity: 'Low',
    title: 'Vehicle at 42 km/h on haul road',
    camera: cam('site-road'),
    time: '09:15',
    confidence: 0.8,
    status: 'Closed',
    verdict: 'True',
    action: 'Notice issued',
    outcome: 'Contractor informed.',
    attributes: ['Tipper truck', '42 km/h'],
    summary: 'Above the 30 km/h site limit.',
  },
  {
    key: 'tailgate',
    rule: 'R-B06',
    severity: 'Low',
    title: 'Two people in on one card tap, Blok B main door',
    camera: cam('restricted-door'),
    time: '07:55',
    confidence: 0.77,
    status: 'Closed',
    verdict: 'False alarm',
    outcome:
      'The card reader export lagged 4 s; the second person had tapped. Fed back to tuning: tap window widened to 5 s.',
    attributes: ['2 people, 1 tap in 3 s'],
    summary: 'More people than card taps at the main door.',
    after: [
      T('07:58', 'False alarm: second tap arrived late', 'Mohd Hafiz Zain'),
      T('08:10', 'Tuning: tap window 3 s → 5 s on this camera', 'EzVision'),
    ],
  },
  {
    key: 'wellbeing',
    rule: 'R-W03',
    severity: 'Medium',
    title: 'Repeated late-night presence at KK9 rooftop door',
    camera: cam('roof-access'),
    time: '02:10',
    confidence: 0.8,
    status: 'Acknowledged',
    assignee: 'Pn. Melissa Tan (counsellor)',
    attributes: [
      'Same spot 4 nights this week, 00:40–02:30',
      'No identity recorded',
    ],
    summary:
      'Someone has been at the rooftop door late at night on four of the last seven nights. Routed to counselling only, never to discipline.',
    after: [
      T(
        '08:30',
        'Accepted; will ask the KK9 felo to arrange a friendly check-in',
        'Pn. Melissa Tan',
      ),
    ],
  },
  {
    key: 'curfewA',
    rule: 'R-A04',
    severity: 'Medium',
    title: 'Entry after curfew, Blok A main door',
    camera: cam('care-entrance'),
    time: '00:47',
    confidence: 0.9,
    status: 'Closed',
    verdict: 'True',
    action: 'Late return recorded',
    outcome: 'Resident back from a late lab session; logged, no action.',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['1 person'],
    summary: 'Entry after the midnight curfew.',
    after: [
      T('00:49', 'Accepted', 'Dr. Farah Aziz'),
      T('00:52', 'Late return recorded; closed', 'Dr. Farah Aziz'),
    ],
  },
  {
    key: 'curfewB',
    rule: 'R-B04',
    severity: 'Medium',
    title: 'Entry after curfew, Blok B main door',
    camera: cam('restricted-door'),
    time: '00:21',
    confidence: 0.88,
    status: 'Closed',
    verdict: 'True',
    action: 'Warning given',
    outcome: 'Verbal warning; second late entry this month.',
    assignee: 'Mohd Hafiz Zain (warden, KK9)',
    attributes: ['2 people'],
    summary: 'Two people entered after curfew.',
    after: [
      T('00:23', 'Accepted', 'Mohd Hafiz Zain'),
      T('00:30', 'Warning given; closed', 'Mohd Hafiz Zain'),
    ],
  },
  {
    key: 'overstay',
    date: '2026-10-25',
    rule: 'R-B03',
    severity: 'Medium',
    title: 'Visitor still inside Blok B at closing',
    camera: cam('retail-back'),
    time: '22:31',
    confidence: 0.81,
    status: 'Closed',
    verdict: 'True',
    action: 'Visitor removed',
    outcome: 'Visitor escorted out at 22:44.',
    assignee: 'Mohd Hafiz Zain (warden, KK9)',
    attributes: ['Visitor tag from 19:10'],
    summary: 'A visitor who signed in at 19:10 was not seen leaving by 22:00.',
    after: [
      T('22:33', 'Accepted', 'Mohd Hafiz Zain'),
      T('22:44', 'Visitor escorted out; closed', 'Mohd Hafiz Zain'),
    ],
  },
  {
    key: 'hoodie',
    date: '2026-10-25',
    rule: 'R-A01',
    severity: 'High',
    title: 'Male estimated past Blok A lounge line',
    camera: cam('hostel'),
    time: '21:15',
    confidence: 0.81,
    status: 'Closed',
    verdict: 'False alarm',
    outcome:
      'A resident in a hoodie with short hair. False alarm fed back to tuning for this camera; logged for the bias test.',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['Estimated male · 0.81', 'Grey hoodie'],
    summary: 'Boundary rule fired at the lounge line.',
    after: [
      T('21:17', 'Accepted', 'Dr. Farah Aziz'),
      T('21:20', 'False alarm: resident', 'Dr. Farah Aziz'),
      T(
        '21:20',
        'Feedback sent to tuning (camera threshold review)',
        'EzVision',
      ),
    ],
  },
  {
    key: 'repeat2',
    date: '2026-10-25',
    rule: 'R-A01',
    severity: 'High',
    title: 'Male estimated past Blok A lounge line',
    camera: cam('hostel'),
    time: '20:40',
    confidence: 0.9,
    status: 'Actioned',
    verdict: 'True',
    action: 'HEP referral',
    caseId: 'CS-26-040',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['Estimated male · 0.90', 'Blue jersey, black shorts'],
    summary:
      'A non-resident went up to level 2 during visiting hours. Second time in a week at this block.',
    after: [
      T('20:42', 'Accepted', 'Dr. Farah Aziz'),
      T('20:47', 'Verified on site: visitor on level 2', 'Dr. Farah Aziz'),
      T(
        '20:50',
        'Visitor removed; referred to HEP as a repeat',
        'Dr. Farah Aziz',
      ),
    ],
  },
  {
    key: 'repeat1',
    date: '2026-10-22',
    rule: 'R-A01',
    severity: 'High',
    title: 'Male estimated past Blok A lounge line',
    camera: cam('hostel'),
    time: '21:52',
    confidence: 0.88,
    status: 'Closed',
    verdict: 'True',
    action: 'Warning given',
    outcome: 'Visitor warned and escorted out.',
    caseId: 'CS-26-040',
    assignee: 'Dr. Farah Aziz (felo, KK12)',
    attributes: ['Estimated male · 0.88', 'Blue jersey, black shorts'],
    summary: 'A visitor crossed the lounge line.',
    after: [
      T('21:55', 'Accepted', 'Dr. Farah Aziz'),
      T('22:01', 'Warning given; closed', 'Dr. Farah Aziz'),
    ],
  },
  {
    key: 'theft',
    date: '2026-10-21',
    rule: 'R-S01',
    severity: 'Medium',
    title: 'Person handling parked motorcycles, KK9 path',
    camera: cam('office-perimeter'),
    time: '03:10',
    confidence: 0.83,
    status: 'Closed',
    verdict: 'True',
    action: 'Case opened',
    outcome: 'Handed to PDRM with a watermarked export.',
    caseId: 'CS-26-039',
    assignee: 'Operator Hakim',
    attributes: ['1 person', 'Black jacket, helmet on'],
    summary: 'One person tried the locks of three parked motorcycles.',
    after: [
      T('03:11', 'Verified true; guards sent', 'Operator Hakim'),
      T('03:30', 'Motorcycle missing; case opened', 'Operator Hakim'),
    ],
  },
];

const sortKey = (s: AlertSeed) => `${s.date ?? DEMO_DATE} ${s.time}`;

export const seedAlerts: Alert[] = [...seeds]
  .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  .map((s, i) => {
    const rule = ruleById(s.rule);
    const { key: _key, after = [], ...rest } = s;
    const timeline: TimelineEntry[] = [
      T(
        s.time,
        `Rule ${rule.id} fired: ${rule.name}. ${s.camera ? 'Snapshot and 10-second clip attached.' : 'Radar event; no video exists.'}`,
        'EzVision',
      ),
      T(
        s.time,
        `Sent to ${rule.route}${rule.alsoNotify ? ` and ${rule.alsoNotify}` : ''}`,
        'EzVision',
      ),
      ...after,
    ];
    return {
      ...rest,
      id: `AL-26-${2001 + i}`,
      date: s.date ?? DEMO_DATE,
      detector: rule.detector,
      module: rule.module,
      block: rule.block,
      route: rule.route,
      alsoNotify:
        s.alsoNotify ??
        (rule.alsoNotify
          ? rule.alsoNotify[0].toUpperCase() + rule.alsoNotify.slice(1)
          : undefined),
      timeline,
    };
  })
  .reverse();

export const alertByKey = (key: string) => {
  const s = seeds.find((x) => x.key === key)!;
  return seedAlerts.find(
    (a) =>
      a.rule === s.rule &&
      a.time === s.time &&
      a.date === (s.date ?? DEMO_DATE),
  )!;
};

/** Alerts a demo operator can raise to show the lifecycle live. */
export const demoTriggers: {
  rule: string;
  title: string;
  severity: Severity;
  attributes: string[];
  summary: string;
  confidence: number;
}[] = [
  {
    rule: 'R-A01',
    title: 'Male estimated crossing Blok A lounge line now',
    severity: 'High',
    confidence: 0.84,
    attributes: ['Estimated male · 0.84', 'Black T-shirt, blue jeans'],
    summary:
      'Raised by the demo control: a boundary alert goes to the warden on duty and escalates to the command centre if nobody accepts it within 5 minutes.',
  },
  {
    rule: 'R-B05',
    title: 'Blok B stairwell door opened from outside',
    severity: 'Medium',
    confidence: 0.79,
    attributes: ['1 person'],
    summary: 'Raised by the demo control.',
  },
  {
    rule: 'R-S05',
    title: 'Possible fight in cafeteria',
    severity: 'Medium',
    confidence: 0.76,
    attributes: ['2 tracks', 'Fast contact motion'],
    summary: 'Raised by the demo control.',
  },
];

// ------------------------------------------------------------------ cases --

export type CaseStatus =
  | 'Open'
  | 'With HEP'
  | 'With counselling'
  | 'Handed to PDRM'
  | 'Closed';

export type CaseFile = {
  id: string;
  title: string;
  module: ModuleId;
  block?: BlockId;
  status: CaseStatus;
  owner: string;
  opened: string;
  alerts: string[];
  notes: { time: string; who: string; text: string }[];
  outcome?: string;
  exports: {
    time: string;
    who: string;
    to: string;
    blurred: boolean;
    watermark: string;
  }[];
};

export const seedCases: CaseFile[] = [
  {
    id: 'CS-26-041',
    title: 'Group-on-one incident, KK9 Blok B corridor',
    module: 'welfare',
    block: 'kk9-b',
    status: 'With HEP',
    owner: 'Operator Hakim',
    opened: '26 Oct 17:20',
    alerts: [alertByKey('bully').id],
    notes: [
      {
        time: '26 Oct 17:20',
        who: 'Operator Hakim',
        text: 'Four residents surrounded one first-year for about a minute. Guards reached the corridor at 16:58; the group dispersed.',
      },
      {
        time: '26 Oct 17:45',
        who: 'Mohd Hafiz Zain (warden, KK9)',
        text: 'Spoke to the student, who is not hurt and is staying with a friend tonight. Orientation week; possible ragging.',
      },
    ],
    exports: [],
  },
  {
    id: 'CS-26-040',
    title: 'Repeated entry past Blok A lounge line',
    module: 'hostel',
    block: 'kk12-a',
    status: 'With HEP',
    owner: 'Dr. Farah Aziz (felo, KK12)',
    opened: '25 Oct 20:55',
    alerts: [alertByKey('repeat1').id, alertByKey('repeat2').id],
    notes: [
      {
        time: '25 Oct 20:55',
        who: 'Dr. Farah Aziz (felo, KK12)',
        text: 'Same visitor description on 22 and 25 Oct, both verified on site. Visitor is a student from another college.',
      },
      {
        time: '26 Oct 09:10',
        who: 'Prof. Madya Dr. Rosli Ismail (Pengetua, KK12)',
        text: 'Referred to HEP under the college rules on visitors. Resident host to be seen with the visitor.',
      },
    ],
    exports: [],
  },
  {
    id: 'CS-26-039',
    title: 'Motorcycle theft, KK9 bus-stop path',
    module: 'safe',
    status: 'Handed to PDRM',
    owner: 'Operator Hakim',
    opened: '21 Oct 03:30',
    alerts: [alertByKey('theft').id],
    notes: [
      {
        time: '21 Oct 03:30',
        who: 'Operator Hakim',
        text: 'Black Honda EX5 missing from the KK9 motorcycle shelter. Owner informed at 07:00.',
      },
      {
        time: '21 Oct 10:15',
        who: 'Supt. (PB) Zulkifli Hassan',
        text: 'Cross-camera timeline built from clothing search: rider left via the Zone 5 gate at 03:22. Approved export to PDRM.',
      },
    ],
    outcome: 'Police report BRK/2210/26 filed by the owner.',
    exports: [
      {
        time: '21 Oct 10:20',
        who: 'Supt. (PB) Zulkifli Hassan',
        to: 'PDRM IPD Petaling Jaya',
        blurred: false,
        watermark:
          'UM · CS-26-039 · PDRM IPD PJ · 21 Oct 2026 10:20 · Zulkifli Hassan',
      },
    ],
  },
  {
    id: 'CS-26-038',
    title: 'Vaping in Blok B stairwell (third time)',
    module: 'welfare',
    block: 'kk9-b',
    status: 'Open',
    owner: 'Operator Aina',
    opened: '26 Oct 17:44',
    alerts: [alertByKey('vape').id],
    notes: [
      {
        time: '26 Oct 17:44',
        who: 'Operator Aina',
        text: 'Third vaping alert on this landing in two weeks. Warden KK9 asked to put up no-vaping signage before any referral.',
      },
    ],
    exports: [],
  },
  {
    id: 'CS-26-036',
    title: 'Lost laptop bag, UM Central',
    module: 'space',
    status: 'Closed',
    owner: 'Operator Hakim',
    opened: '19 Oct 15:05',
    alerts: [],
    notes: [
      {
        time: '19 Oct 15:20',
        who: 'Operator Hakim',
        text: 'Lost-item search: grey laptop bag left on bench B at 14:12; picked up by a cleaner at 14:40 and handed to the counter.',
      },
    ],
    outcome: 'Returned to the owner at the UM Central counter.',
    exports: [],
  },
];

// ------------------------------------------------------- hostel dashboard --

/** Confirmed breaches per week: two shadow weeks, then the live pilot. */
export const hostelWeekly = [
  { week: 'W2 · shadow', a: 13, b: 16, falseA: 9, falseB: 11 },
  { week: 'W3 · shadow', a: 12, b: 15, falseA: 6, falseB: 8 },
  { week: 'W4 · live 1', a: 9, b: 12, falseA: 3, falseB: 4 },
  { week: 'W5 · live 2', a: 8, b: 11, falseA: 3, falseB: 3 },
  { week: 'W6 · live 3', a: 6, b: 9, falseA: 2, falseB: 3 },
  { week: 'W7 · live 4', a: 5, b: 7, falseA: 2, falseB: 2 },
  { week: 'W8 · live 5', a: 4, b: 6, falseA: 1, falseB: 2 },
];

/** Confirmed breaches by door over the five live weeks. */
export const hostelByDoor: {
  block: BlockId;
  door: string;
  camera: string | null;
  count: number;
}[] = [
  { block: 'kk12-a', door: 'Lounge line', camera: cam('hostel'), count: 12 },
  {
    block: 'kk12-a',
    door: 'Parcel room door',
    camera: cam('stockroom-door'),
    count: 9,
  },
  {
    block: 'kk12-a',
    door: 'Main entrance',
    camera: cam('care-entrance'),
    count: 7,
  },
  {
    block: 'kk12-a',
    door: 'Ground-floor fire exit',
    camera: cam('plant-corridor'),
    count: 4,
  },
  {
    block: 'kk9-b',
    door: 'Main entrance',
    camera: cam('restricted-door'),
    count: 15,
  },
  {
    block: 'kk9-b',
    door: 'Lounge line',
    camera: cam('retail-back'),
    count: 11,
  },
  {
    block: 'kk9-b',
    door: 'Stairwell door',
    camera: cam('records-corridor'),
    count: 13,
  },
  {
    block: 'kk9-b',
    door: 'Rooftop door',
    camera: cam('roof-access'),
    count: 2,
  },
];

/** Confirmed breaches by hour of day over the live weeks, per block. */
export const hostelByHour = Array.from({ length: 24 }, (_, h) => {
  const curve = (x: number) =>
    x >= 17 && x <= 23
      ? 2 + (x - 16) * 0.6
      : x <= 2
        ? 3.5 - x
        : x >= 7 && x <= 9
          ? 1
          : 0.2;
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    a: Math.round(curve(h) * (0.6 + rand(`ha${h}`) * 0.6)),
    b: Math.round(curve(h) * (0.8 + rand(`hb${h}`) * 0.7)),
  };
});

export const hostelByRule = (block: BlockId) =>
  seedRules
    .filter((r) => r.block === block && r.module === 'hostel')
    .map((r) => ({
      rule: r.id,
      name: r.name,
      fired: r.fired7d,
      false: r.false7d,
    }));

// -------------------------------------------------------------- pilot KPIs --

export const pilotKpis = [
  {
    kpi: 'Alert precision',
    measured: '% of alerts the warden marks true',
    target: 'Agree in survey (proposed 75%)',
    value: '81%',
    met: true,
  },
  {
    kpi: 'False alarms per block per night',
    measured: 'Alerts marked false',
    target: 'Agree in survey (proposed under 1)',
    value: '0.7',
    met: true,
  },
  {
    kpi: 'Time to acknowledge',
    measured: 'Alert to warden accept',
    target: 'Under 5 minutes',
    value: '2.6 min median · 4% escalated',
    met: true,
  },
  {
    kpi: 'Breach trend',
    measured: 'Confirmed breaches per week, weeks 1–8',
    target: 'Falling',
    value: '21 → 10 a week',
    met: true,
  },
  {
    kpi: 'Camera uptime',
    measured: '% of cameras online daily',
    target: '98% or better',
    value: '99.3% (pilot cameras)',
    met: true,
  },
  {
    kpi: 'Warden adoption',
    measured: '% of alerts closed with an outcome',
    target: '90% or better',
    value: '94%',
    met: true,
  },
];

/** Time from alert to warden accept, minutes, by live week. */
export const ackTimes = [
  { week: 'Live 1', p50: 4.1, p90: 9.8 },
  { week: 'Live 2', p50: 3.5, p90: 8.2 },
  { week: 'Live 3', p50: 3.0, p90: 7.1 },
  { week: 'Live 4', p50: 2.8, p90: 6.6 },
  { week: 'Live 5', p50: 2.6, p90: 6.4 },
];

/** Verified outcomes by module over 30 days (true vs false alarm). */
export const precisionByModule: {
  module: ModuleId;
  confirmed: number;
  false: number;
}[] = [
  { module: 'hostel', confirmed: 118, false: 28 },
  { module: 'safe', confirmed: 64, false: 31 },
  { module: 'mobility', confirmed: 412, false: 9 },
  { module: 'welfare', confirmed: 19, false: 11 },
  { module: 'hse', confirmed: 23, false: 14 },
  { module: 'space', confirmed: 140, false: 2 },
];

export { blocks, blockLabel, detectors, modules };
