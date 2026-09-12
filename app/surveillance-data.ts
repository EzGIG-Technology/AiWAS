export type DetectionCapability = {
  id: string;
  name: string;
  kind: 'Video candidate' | 'Sensor integration' | 'Staff report';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scene: string;
  signal: string;
  limits: string;
  response: string;
  source: string;
};
const d = (
  id: string,
  name: string,
  kind: DetectionCapability['kind'],
  priority: DetectionCapability['priority'],
  scene: string,
  signal: string,
  limits: string,
  response: string,
  source: string,
): DetectionCapability => ({
  id,
  name,
  kind,
  priority,
  scene,
  signal,
  limits,
  response,
  source,
});
const axis = 'https://help.axis.com/en-us/axis-object-analytics';
const ipro =
  'https://i-pro.com/products_and_solutions/en/surveillance/newsroom/i-pro-introduces-industrys-first-ai-scene-change-detection-capability';
export const detectionCatalog: DetectionCapability[] = [
  d(
    'intrusion',
    'Restricted-area entry',
    'Video candidate',
    'High',
    'perimeter',
    'An anonymous track crosses an approved boundary.',
    'A crossing does not establish identity or permission.',
    'Verify access and send a staff member.',
    axis,
  ),
  d(
    'tailgate',
    'Close-following at entrance',
    'Video candidate',
    'Medium',
    'hall',
    'Two tracks cross an entrance within a short interval.',
    'Friends entering together may be legitimate; access events are needed.',
    'Check access logs and entrance context.',
    axis,
  ),
  d(
    'wrongway',
    'Movement against one-way flow',
    'Video candidate',
    'Medium',
    'hall',
    'A track crosses a directional line against the configured flow.',
    'Only meaningful while a one-way plan is active.',
    'Ask a steward to assess crowd flow.',
    axis,
  ),
  d(
    'crowd',
    'Crowding & queue pressure',
    'Video candidate',
    'High',
    'canteen',
    'Visible count exceeds a zone threshold for a set period.',
    'Count is an estimate; it cannot measure crush forces or account for unseen people.',
    'Reduce inflow and verify safe movement.',
    axis,
  ),
  d(
    'dwell',
    'Prolonged presence',
    'Video candidate',
    'Medium',
    'courtyard',
    'A track remains in an approved area beyond a dwell limit.',
    'Waiting, disability and social activity are normal explanations.',
    'Check context; do not label a person suspicious.',
    axis,
  ),
  d(
    'afterhours',
    'After-hours public-area presence',
    'Video candidate',
    'Medium',
    'hostel',
    'Presence occurs during a scheduled restricted period.',
    'Approved activities and staff rounds create legitimate exceptions.',
    'Contact the duty warden or site lead.',
    axis,
  ),
  d(
    'fall',
    'Possible fall / person down',
    'Video candidate',
    'High',
    'courtyard',
    'A posture transition or person-down candidate needs welfare review.',
    'Sport, sitting and occlusion can confuse a model; this is not a diagnosis.',
    'Check welfare and activate first-aid response if needed.',
    'https://www.hanwhavision.com/wp-content/uploads/2026/01/White-Paper_Slip-and-fall-detection.pdf',
  ),
  d(
    'fight',
    'Possible physical altercation',
    'Video candidate',
    'High',
    'corridor',
    'Rapid close interaction creates an evidence-review candidate.',
    'Video cannot establish bullying, intent, blame or repeated abuse.',
    'Protect pupils and review the wider context.',
    'https://arxiv.org/abs/2202.09550',
  ),
  d(
    'blade',
    'Visible blade concern',
    'Video candidate',
    'Critical',
    'training',
    'A visible object may resemble a blade.',
    'Experimental candidate; tools and props can look similar. Concealed objects are not detectable.',
    'Use the approved emergency protocol and human verification.',
    'https://arxiv.org/abs/2303.10703',
  ),
  d(
    'firearm',
    'Visible firearm concern',
    'Video candidate',
    'Critical',
    'training',
    'A visible weapon-like object needs urgent review.',
    'Firearm evidence does not validate knife detection. Vendor geography and camera constraints apply.',
    'Immediately assess and follow emergency procedures.',
    'https://www.omnilert.com/blog/what-is-visual-gun-detection-technology-training-and-impact',
  ),
  d(
    'exit',
    'Blocked exit / changed scene',
    'Video candidate',
    'High',
    'hall',
    'A persistent scene change appears in a marked exit zone.',
    'A scene change is not a certified fire-safety inspection.',
    'Verify the exit and remove obstructions safely.',
    ipro,
  ),
  d(
    'door',
    'Door held open',
    'Sensor integration',
    'Medium',
    'hall',
    'A door contact remains open beyond its allowed period.',
    'Requires a door contact or separately validated scene model.',
    'Check the door and approved delivery schedule.',
    ipro,
  ),
  d(
    'left',
    'Unattended item',
    'Video candidate',
    'Medium',
    'hall',
    'An object remains after a scene change.',
    'Cannot determine ownership or whether contents are dangerous.',
    'Ask staff to assess using the school protocol.',
    ipro,
  ),
  d(
    'removed',
    'Item removal / theft report',
    'Video candidate',
    'High',
    'inspection',
    'A protected scene changes or an item is reported missing.',
    'Removal may be authorised; CCTV cannot establish theft.',
    'Check inventory and responsible staff before classification.',
    ipro,
  ),
  d(
    'vandalism',
    'Possible property damage',
    'Staff report',
    'High',
    'inspection',
    'A staff observation or reviewed scene suggests damage.',
    'A changed scene alone cannot prove vandalism or identify the responsible person.',
    'Restrict unsafe equipment and record evidence.',
    'School workflow requirement',
  ),
  d(
    'litter',
    'Litter / housekeeping concern',
    'Staff report',
    'Low',
    'canteen',
    'A staff report records litter or a housekeeping problem.',
    'Routine dropped-object analytics have not been validated for this school.',
    'Create a housekeeping task without automatic sanctions.',
    'School workflow requirement',
  ),
  d(
    'truancy',
    'Unexplained absence / early exit',
    'Staff report',
    'Medium',
    'gate',
    'An attendance exception needs reconciliation.',
    'Anonymous entry counts cannot establish which pupil left or whether leave was approved.',
    'Reconcile the register and approved leave.',
    'School workflow requirement',
  ),
  d(
    'cheating',
    'Exam integrity concern',
    'Staff report',
    'Low',
    'hall',
    'An invigilator records a concern for review.',
    'No gaze, face or behaviour-based cheating classifier is enabled.',
    'Follow the examination evidence and appeal process.',
    'School workflow requirement',
  ),
  d(
    'vape',
    'Vape / air-quality sensor event',
    'Sensor integration',
    'Medium',
    'perimeter',
    'An environmental sensor reports a threshold event.',
    'Humidity, aerosols and cleaning products require contextual review; no person is identified.',
    'Check welfare and ventilation; verify the sensor.',
    'https://halodetect.com/',
  ),
  d(
    'smoke',
    'Smoke / flame warning',
    'Sensor integration',
    'Critical',
    'inspection',
    'An approved fire device or specialist video system sends a warning.',
    'Ordinary CCTV is not a substitute for an approved fire alarm system.',
    'Follow the school fire response procedure.',
    'https://catalog.boschbuildingtechnologies.com/lifesafetysystems/en/Video-based-Fire-Detection/c/22570758923',
  ),
  d(
    'tamper',
    'Camera obstruction / scene shift',
    'Sensor integration',
    'High',
    'perimeter',
    'Feed health or view change suggests impaired coverage.',
    'Dirt, lighting or maintenance may cause the event; intent is unknown.',
    'Arrange a patrol and maintenance check.',
    axis,
  ),
  d(
    'stale',
    'Stale feed / connection loss',
    'Sensor integration',
    'High',
    'gate',
    'Capture timestamps stop advancing or the connection drops.',
    'A network failure is not a normal or all-clear scene.',
    'Mark coverage unavailable and initiate fallback patrols.',
    axis,
  ),
  d(
    'traffic',
    'Vehicle dwell / pedestrian conflict',
    'Video candidate',
    'High',
    'gate',
    'A vehicle remains in a configured pedestrian or drop-off area.',
    'Perspective is not a calibrated speed measurement or proof of a near miss.',
    'Ask a gate steward to separate traffic and pedestrians.',
    axis,
  ),
  d(
    'wellbeing',
    'Welfare / mental-health concern',
    'Staff report',
    'High',
    'courtyard',
    'A pupil, parent or staff member requests support.',
    'No emotion, diagnosis, intent or suicide-risk inference is made from video.',
    'Use the confidential safeguarding and support route.',
    'School workflow requirement',
  ),
];
export const publicZones = [
  'Main gate',
  'Canteen',
  'Block A corridor',
  'East perimeter',
  'Courtyard',
  'Assembly hall',
  'Hostel common lobby',
];
export type StudioRule = {
  zone: string;
  priority: string;
  threshold: number;
  hold: number;
  schedule: string;
  reviewer: string;
  publicOnly: boolean;
};
export function ruleError(r: StudioRule) {
  if (!publicZones.includes(r.zone) || !r.publicOnly)
    return 'Only approved public areas are available for this demonstration.';
  if (!['Low', 'Medium', 'High', 'Critical'].includes(r.priority))
    return 'Select a valid priority.';
  if (!Number.isFinite(r.threshold) || r.threshold < 1 || r.threshold > 100)
    return 'Threshold must be between 1 and 100.';
  if (!Number.isFinite(r.hold) || r.hold < 0 || r.hold > 600)
    return 'Persistence must be between 0 and 600 seconds.';
  if (!r.reviewer.trim()) return 'Name a responsible review team.';
  if (!['School hours', 'After hours', 'Always'].includes(r.schedule))
    return 'Select a valid schedule.';
  return '';
}
export type Trial = {
  id: string;
  school: string;
  capability: string;
  truth: boolean;
  alert: boolean;
  latency: number;
  condition: string;
};
export function trialMetrics(trials: Trial[]) {
  const tp = trials.filter((t) => t.truth && t.alert).length,
    fp = trials.filter((t) => !t.truth && t.alert).length,
    fn = trials.filter((t) => t.truth && !t.alert).length,
    tn = trials.filter((t) => !t.truth && !t.alert).length;
  const times = trials
    .filter((t) => t.truth && t.alert)
    .map((t) => t.latency)
    .sort((a, b) => a - b);
  return {
    tp,
    fp,
    fn,
    tn,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
    p95: times.length ? times[Math.ceil(times.length * 0.95) - 1] : null,
  };
}
export const jpnCoverage = [
  [
    'PDF 10, 25',
    'Buli / pergaduhan / ganas',
    'Incidents + Detection studio',
    'Possible altercation and manual safeguarding; no bully labels',
  ],
  [
    'PDF 10, 25',
    'Vandalisme / kecurian',
    'Detection studio + Facilities & health',
    'Scene-change candidate and staff verification',
  ],
  [
    'PDF 10, 25',
    'Ponteng / merokok / vape',
    'Detection studio + Attendance & presence',
    'Register reconciliation and sensor-event preview',
  ],
  [
    'PDF 10, 25',
    'Kesihatan mental / meniru / buang sampah',
    'Detection studio + Safeguarding',
    'Staff reporting; no inferred diagnosis or cheating',
  ],
  [
    'PDF 15–18',
    'Anonymous movement, space and crowd analysis',
    'Detection studio + Live cameras',
    'Zones, schedules, counts, dwell and direction candidates',
  ],
  [
    'PDF 15, 25',
    'System interruption and false alarms',
    'Detection studio + System health',
    'Unavailable feed outcome, validation and evaluation',
  ],
  [
    'PDF 12–13, 28–34',
    'Voluntary participation, consent and three-school PoC',
    'Pilot governance',
    'Approval, participation, readiness, training and evaluation records',
  ],
  [
    'PDF 22',
    'No biometrics; public areas only',
    'Detection studio + Pilot governance',
    'Public-zone guard and fixed biometric exclusion',
  ],
  [
    'PDF 23',
    'Existing CCTV and upgrade options',
    'Pilot governance',
    'Compatibility and financing-option review',
  ],
  [
    'PDF 19, 25–26',
    'School / JPN / KPM / authority routing',
    'Notification routing + Pilot governance',
    'Human-owned routing agreement; no messages sent',
  ],
  [
    'PDF 26',
    'Confirmed evidence retention and routine disposal',
    'Platform readiness + Pilot governance',
    'Policy and reconciliation record; backend enforcement pending',
  ],
  [
    'PDF 25–26, 28',
    'Pilot evaluation and adjustable thresholds',
    'Detection studio',
    'Calculated synthetic precision and recall',
  ],
  [
    'PDF 29–30',
    'No-cost pilot and budgets',
    'Pilot governance',
    'Funding assurance and unresolved budget review',
  ],
] as const;
