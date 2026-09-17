export type MatrixDetection = {
  id: string;
  name: string;
  group: string;
  priority: string;
  signal: string;
  unit: string;
  value: number;
  scene: string;
  recipients: string;
  mode: 'event' | 'context';
  baseline: number;
  boundary: string;
};
const row = (
  id: string,
  name: string,
  group: string,
  priority: string,
  signal: string,
  unit: string,
  value: number,
  scene: string,
  recipients: string,
  boundary: string,
  mode: 'event' | 'context' = 'event',
  baseline = 0,
): MatrixDetection => ({
  id,
  name,
  group,
  priority,
  signal,
  unit,
  value,
  scene,
  recipients,
  boundary,
  mode,
  baseline,
});
export const matrixDetections: MatrixDetection[] = [
  row(
    'litter',
    'Littering',
    'Behaviour',
    'Low',
    'Possible dropped item in a public area',
    'seconds',
    3,
    'courtyard',
    'School admin',
    'An item drop does not establish deliberate littering.',
    'event',
    80,
  ),
  row(
    'exam',
    'Cheating / exam concern',
    'Behaviour',
    'Medium',
    'Paper passing or unusual movement during an exam',
    'seconds',
    5,
    'hall',
    'School admin',
    'Only an invigilator can determine whether exam rules were broken.',
    'event',
    80,
  ),
  row(
    'vape',
    'Smoking / vaping',
    'Behaviour',
    'Medium',
    'Possible cigarette or vape object and hand movement',
    'seconds',
    5,
    'perimeter',
    'School admin, Discipline teacher',
    'Small objects and gestures are ambiguous. No camera inside toilets.',
    'event',
    80,
  ),
  row(
    'truancy',
    'Truancy / skipping class',
    'Behaviour',
    'Low',
    'Presence outside class during a configured lesson period',
    'minutes',
    10,
    'corridor',
    'School admin, Discipline teacher',
    'Check timetable, permission and context before alleging absence.',
    'event',
    80,
  ),
  row(
    'theft',
    'Theft concern',
    'Behaviour',
    'High',
    'Possible item removal requiring an ownership check',
    'seconds',
    5,
    'corridor',
    'School admin → authorised escalation',
    'Permission and ownership cannot be determined by video alone.',
    'event',
    80,
  ),
  row(
    'vandalism',
    'Vandalism',
    'Behaviour',
    'High',
    'Possible forceful contact with school property',
    'seconds',
    3,
    'corridor',
    'School admin → authorised escalation',
    'Inspect damage and legitimate activity before confirmation.',
    'event',
    80,
  ),
  row(
    'bullying',
    'Bullying concern',
    'Behaviour',
    'High',
    'Possible shoving, surrounding or cornering',
    'seconds',
    3,
    'corridor',
    'School admin, Counsellor → authorised escalation',
    'No emotion inference, aggressor identification or victim label from video. Staff assess context.',
    'event',
    80,
  ),
  row(
    'fight',
    'Fighting',
    'Behaviour',
    'High',
    'Possible hitting or forceful physical contact',
    'seconds',
    2,
    'corridor',
    'School admin → authorised escalation',
    'Sport and play can look similar. Review urgently without automatic punishment.',
    'event',
    80,
  ),
  row(
    'violent',
    'Violent behaviour',
    'Behaviour',
    'High',
    'Repeated forceful movements or threatening gestures',
    'seconds',
    3,
    'corridor',
    'School admin → authorised escalation',
    'Video cannot establish intent. Request human review.',
    'event',
    80,
  ),
  row(
    'tamper',
    'System tampering',
    'Security',
    'High',
    'Covered lens, moved view or interrupted camera signal',
    'seconds',
    10,
    'perimeter',
    'School admin, Platform operator',
    'Maintenance, lighting and network failure can trigger this signal.',
    'event',
    80,
  ),
  row(
    'crowd',
    'Crowd counting',
    'Movement',
    'Medium',
    'Estimated count exceeds a configured zone threshold',
    'people',
    90,
    'canteen',
    'School admin, Discipline teacher',
    'Threshold is a review trigger, not certified capacity.',
  ),
  row(
    'entry',
    'Entry / exit mismatch',
    'Movement',
    'High',
    'Entry count minus exit count exceeds a review tolerance',
    'people',
    2,
    'hall',
    'School admin, Discipline teacher',
    'Missed crossings and occlusion require a physical check; no proof anyone remains inside.',
  ),
  row(
    'dwell',
    'Unusual dwell time',
    'Movement',
    'Low',
    'Anonymous presence persists beyond the zone timer',
    'minutes',
    10,
    'courtyard',
    'School admin, Discipline teacher',
    'Waiting or legitimate activity may explain a long dwell.',
  ),
  row(
    'uniform',
    'Uniform context',
    'Context tags',
    'Low',
    'Staff-reviewed uniform context for an existing incident',
    'seconds',
    1,
    'courtyard',
    'School admin',
    'Context only; no standalone compliance alert. Allow unknown and approved exceptions.',
    'context',
  ),
  row(
    'person',
    'Person role context',
    'Context tags',
    'Low',
    'Staff-confirmed student, teacher, visitor or unknown role',
    'seconds',
    1,
    'courtyard',
    'School admin',
    'No gender inference from appearance. The matrix gender request is not automated; role remains unknown until staff confirm.',
    'context',
  ),
  row(
    'weapon',
    'Weapon-shaped object',
    'Emergency',
    'Critical',
    'Possible knife, blunt weapon or firearm-shaped object',
    'seconds',
    1,
    'training',
    'School duty lead → authorised emergency route',
    'A visual candidate is not proof of a weapon. Inert blade sample does not validate firearm detection.',
  ),
  row(
    'fall',
    'Fall / collapse',
    'Emergency',
    'High',
    'Possible sudden fall or person lying motionless',
    'seconds',
    3,
    'courtyard',
    'School admin, Duty teacher / first-aid team',
    'This is a welfare alert, not a diagnosis; no health workspace is introduced.',
  ),
  row(
    'intrusion',
    'After-hours / restricted entry',
    'Security',
    'High',
    'Person or vehicle crosses a restricted boundary or time window',
    'seconds',
    3,
    'perimeter',
    'School admin, Security guard',
    'Check permits and authorised activities. No biometric identification.',
  ),
  row(
    'fire',
    'Smoke / fire',
    'Emergency',
    'Critical',
    'Possible visible smoke or flames',
    'seconds',
    1,
    'courtyard',
    'School duty lead → authorised fire response',
    'Video complements certified alarms; smoke and steam can be confused.',
  ),
  row(
    'abandoned',
    'Abandoned object',
    'Security',
    'Medium',
    'Item remains unattended beyond a configured timer',
    'minutes',
    5,
    'hall',
    'School admin, Security guard',
    'An unattended item is not automatically dangerous.',
  ),
  row(
    'fence',
    'Fence climbing',
    'Security',
    'High',
    'Possible climbing movement at a boundary',
    'seconds',
    3,
    'perimeter',
    'School admin, Security guard',
    'Inspect camera perspective and authorised maintenance.',
  ),
  row(
    'vehicle',
    'Drop-off / pick-up vehicles',
    'Movement',
    'Low',
    'Vehicle remains at a gate beyond a configured dwell limit',
    'minutes',
    5,
    'gate',
    'School admin, Security guard',
    'Permission cannot be inferred without the authorised vehicle register.',
  ),
];
export type MatrixRule = {
  enabled: boolean;
  zone: string;
  priority: string;
  threshold: number;
  confidence: number;
  cooldown: number;
  schedule: string;
  reviewer: string;
  publicOnly: boolean;
};
export const matrixZones = [
  'Main gate',
  'Canteen',
  'Block A corridor',
  'East perimeter',
  'Courtyard',
  'Assembly hall',
];
export function matrixRuleError(rule: MatrixRule, cap: MatrixDetection) {
  if (!matrixZones.includes(rule.zone) || !rule.publicOnly)
    return 'Choose an approved public zone and confirm placement.';
  if (!['Low', 'Medium', 'High', 'Critical'].includes(rule.priority))
    return 'Choose a valid priority.';
  if (cap.priority === 'Critical' && rule.priority !== 'Critical')
    return 'Weapon and smoke/fire candidates must retain Critical priority.';
  if (
    !Number.isInteger(rule.threshold) ||
    rule.threshold < 1 ||
    rule.threshold > 1000
  )
    return 'Set an observation threshold between 1 and 1,000.';
  if (
    !Number.isInteger(rule.confidence) ||
    rule.confidence < 1 ||
    rule.confidence > 99
  )
    return 'Set a model score threshold from 1 to 99; this is not measured accuracy.';
  if (
    !Number.isInteger(rule.cooldown) ||
    rule.cooldown < 0 ||
    rule.cooldown > 3600
  )
    return 'Cooldown must be a whole number from 0 to 3,600 seconds.';
  if (cap.priority === 'Critical' && rule.cooldown !== 0)
    return 'Critical candidates must use zero cooldown in this preview.';
  if (rule.reviewer.trim().length < 3)
    return 'Assign a responsible review team.';
  if (
    !['School hours', 'Lessons only', 'After hours', 'Always'].includes(
      rule.schedule,
    )
  )
    return 'Choose a supported schedule.';
  return '';
}
