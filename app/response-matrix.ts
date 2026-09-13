// AiWAS Detection & Response Matrix.
//
// Transcribed from the supplied programme document: every detection category
// with what the system claims to detect, an example incident, severity, the
// automatic system action, who is notified, and the stated confidence baseline
// and target.
//
// Three columns are added that the source document does not carry, because
// without them the matrix reads as a delivery promise rather than a plan:
//
//   status   - whether the detection is live, requested, or suggested.
//   gate     - what must be true before it may be enabled on real cameras.
//   caution  - where the stated behaviour conflicts with the platform's own
//              limits, so the conflict is visible at the point of decision
//              rather than discovered during a pilot.

export type MatrixStatus = 'Existing' | 'Requested' | 'Suggested';

export type MatrixGate =
  | 'Ready to evaluate'
  | 'Needs measurement'
  | 'Needs governance decision';

export type MatrixRow = {
  id: string;
  category: string;
  detects: string;
  example: string;
  severity: string;
  action: string;
  notify: string[];
  initial: number | null;
  target: number;
  status: MatrixStatus;
  gate: MatrixGate;
  /** Capability id in the education register, where one exists. */
  capability?: string;
  caution?: string;
};

const r = (x: MatrixRow) => x;

export const responseMatrix: MatrixRow[] = [
  // ------------------------------------------------- existing categories
  r({
    id: 'littering',
    category: 'Littering',
    detects: 'Someone throwing or dropping items in a public area.',
    example: 'Trash dropped in open areas.',
    severity: 'Low',
    action: 'Analytics log for monitoring',
    notify: ['School admin'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Ready to evaluate',
    capability: 'litter',
  }),
  r({
    id: 'cheating',
    category: 'Cheating (exams)',
    detects: 'Suspicious movement patterns during exams.',
    example: 'Whispering or passing papers.',
    severity: 'Medium',
    action: 'Incident flagged',
    notify: ['School admin'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'cheating',
    caution:
      'Movement is not evidence of cheating, and an exam finding carries an appeal process and an academic penalty. This must stay an invigilator report, not a camera verdict.',
  }),
  r({
    id: 'smoking',
    category: 'Smoking / vaping',
    detects:
      'Object recognition for cigarette or vape, with hand movement and posture.',
    example: 'Smoking in toilets or behind school buildings.',
    severity: 'Medium',
    action: 'Real-time alert, footage saved',
    notify: ['School admin', 'Discipline teacher'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'vape',
    caution:
      'The stated example is toilets, which the platform never monitors. Detect at the building line or use a camera-free air-quality sensor instead.',
  }),
  r({
    id: 'truancy',
    category: 'Truancy / skipping class',
    detects:
      'A person outside class during lesson time, or in a restricted area during lesson time.',
    example: 'Student wandering during lesson time.',
    severity: 'Low → Medium',
    action: 'Dashboard alert, incident log',
    notify: ['School admin', 'Discipline teacher'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs measurement',
    capability: 'truancy',
    caution:
      'An anonymous track cannot establish which pupil it is or whether they hold a pass. Reconcile against the register and approved leave.',
  }),
  r({
    id: 'theft',
    category: 'Theft',
    detects: 'Suspicious movement combined with a missing item.',
    example: 'Taking a bag or item without permission.',
    severity: 'High',
    action: 'Immediate alert, footage saved',
    notify: ['School admin', 'Ministry of Education', 'Authorities'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'removed',
    caution:
      'CCTV cannot establish theft or permission, and notifying authorities automatically converts an unverified candidate into an allegation against a child.',
  }),
  r({
    id: 'vandalism',
    category: 'Vandalism',
    detects: 'Aggressive movement directed at property.',
    example: 'Damaging desks, doors or walls.',
    severity: 'High',
    action: 'Immediate alert, footage saved',
    notify: ['School admin', 'Ministry of Education'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs measurement',
    capability: 'vandalism',
  }),
  r({
    id: 'bullying',
    category: 'Bullying',
    detects: 'Group behaviour, emotion and aggressive movement.',
    example: 'Shoving, surrounding or cornering, threats.',
    severity: 'High',
    action: 'Real-time alert; identifies aggressor and victim',
    notify: ['School admin', 'Ministry of Education', 'Counsellor'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'fight',
    caution:
      'Bullying is defined by repetition, intent and power imbalance, none of which are visible in a frame. Emotion inference has no validated basis, and naming an aggressor and a victim from video is a safeguarding determination a camera cannot make. Route to a human safeguarding review instead.',
  }),
  r({
    id: 'fighting',
    category: 'Fighting',
    detects: 'Violent movement and physical contact.',
    example: 'Punching or hitting.',
    severity: 'High',
    action: 'Critical real-time alert',
    notify: ['School admin', 'Ministry of Education', 'Authorities'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'fight',
    caution:
      'Usable as a review candidate, but the notify list reaches Authorities. Play-fighting, sport and crowding produce the same signal, so a named human must confirm before anything leaves the school.',
  }),
  r({
    id: 'violent',
    category: 'Violent behaviour',
    detects: 'Repeated aggressive patterns and extreme gestures.',
    example: 'Physical threats.',
    severity: 'High',
    action: 'Critical alert with automatic escalation',
    notify: ['School admin', 'Ministry of Education', 'Authorities'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Needs governance decision',
    capability: 'fight',
    caution:
      'Automatic escalation to authorities from a model output is the highest-consequence design error available here. Escalation must follow a recorded human decision.',
  }),
  r({
    id: 'tampering',
    category: 'System tampering',
    detects: 'Camera interference, covering or redirection.',
    example: 'Camera covered or damaged.',
    severity: 'High',
    action: 'System security alert',
    notify: ['School admin', 'Ministry of Education'],
    initial: 80,
    target: 90,
    status: 'Existing',
    gate: 'Ready to evaluate',
    capability: 'tamper',
  }),

  // ------------------------------------------------ requested detections
  r({
    id: 'crowd-count',
    category: 'Crowd counting',
    detects: 'Counts people in an area against a set threshold.',
    example: 'Uncontrolled gathering or crowding in corridors and stairs.',
    severity: 'Medium → High',
    action: 'Dashboard alert and incident log; escalation if the threshold is crossed',
    notify: ['School admin', 'Discipline teacher'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Ready to evaluate',
    capability: 'crowd',
  }),
  r({
    id: 'entry-exit',
    category: 'Entry / exit counting',
    detects:
      'A mismatch between how many people enter and how many leave an enclosed space.',
    example: 'Three pupils enter a space, only one leaves.',
    severity: 'High',
    action: 'Immediate alert, footage saved',
    notify: ['School admin', 'Discipline teacher'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Needs measurement',
    capability: 'occupancy',
    caution:
      'A genuinely useful signal, but the document’s example is a toilet doorway. Count at the door from outside; never place a camera inside.',
  }),
  r({
    id: 'dwell',
    category: 'Unusual dwell time',
    detects: 'A person or group staying in one spot beyond a time limit.',
    example: 'Lingering in a corridor during lesson time.',
    severity: 'Low → Medium',
    action: 'Dashboard alert, incident log',
    notify: ['School admin', 'Discipline teacher'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Ready to evaluate',
    capability: 'dwell',
  }),
  r({
    id: 'uniform',
    category: 'Uniform compliance',
    detects: 'Whether a person is in school uniform.',
    example: 'Pupil not in uniform on campus.',
    severity: 'Low',
    action: 'Analytics log for monitoring',
    notify: ['School admin'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Needs governance decision',
    caution:
      'Clothing classification is unreliable for religious dress, PE kit, medical exemptions and weather layers, and the failures fall on the same pupils repeatedly. Low safety value against a real discrimination risk.',
  }),
  r({
    id: 'person-type',
    category: 'Person type: male / female / teacher',
    detects:
      'Classifies people by category from clothing and posture cues rather than facial recognition.',
    example: 'Tagging pupils and staff in incident reports.',
    severity: 'Supporting tag',
    action: 'Metadata label added to the incident log',
    notify: ['School admin'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Needs governance decision',
    caution:
      'The document correctly avoids biometrics here, but sex classification of children from clothing is still profiling of minors: it is wrong for gender-nonconforming pupils and for cultural dress, it adds nothing a responder acts on, and it cannot be corrected. Adult-versus-child is the distinction that actually helps a responder; recommend that instead.',
  }),
  r({
    id: 'weapon',
    category: 'Weapon detection',
    detects: 'Weapon-shaped objects: knives, blunt objects, firearms.',
    example: 'Someone carrying or brandishing a dangerous object.',
    severity: 'Critical',
    action: 'Critical real-time alert with automatic escalation',
    notify: ['School admin', 'Ministry of Education', 'Authorities'],
    initial: null,
    target: 90,
    status: 'Requested',
    gate: 'Needs governance decision',
    capability: 'blade',
    caution:
      'Experimental. Tools, sports equipment, phones and props confuse it, and concealed weapons are invisible to it. A verified human review must precede any external escalation; an automated police response to a child from an unvalidated model is the failure mode the FTC sanctioned a comparable vendor over.',
  }),

  // ----------------------------------------------- additional suggestions
  r({
    id: 'fall',
    category: 'Fall / collapse detection',
    detects: 'A person suddenly falling or lying motionless.',
    example: 'A pupil fainting or a medical emergency.',
    severity: 'High',
    action: 'Immediate alert',
    notify: ['School admin', 'Duty teacher', 'Nurse'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Ready to evaluate',
    capability: 'fall',
  }),
  r({
    id: 'afterhours',
    category: 'After-hours / restricted area intrusion',
    detects: 'A person or vehicle in a restricted area outside school hours.',
    example: 'Unauthorised entry after school hours.',
    severity: 'Medium → High',
    action: 'System security alert',
    notify: ['School admin', 'Security guard'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Ready to evaluate',
    capability: 'afterhours',
  }),
  r({
    id: 'smokefire',
    category: 'Smoke / fire detection',
    detects: 'Visual recognition of smoke or flames.',
    example: 'Fire breaking out on school grounds.',
    severity: 'Critical',
    action: 'Critical real-time alert with automatic escalation',
    notify: ['School admin', 'Fire department', 'Ministry of Education'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Needs governance decision',
    capability: 'smoke',
    caution:
      'Ordinary CCTV is not an approved fire detection system and must not be relied on as one. Pair with an approved device; automatic escalation is appropriate only from that device, not from video.',
  }),
  r({
    id: 'abandoned',
    category: 'Abandoned object',
    detects: 'An unattended item or bag left beyond a time limit.',
    example: 'A bag left unattended in a public area.',
    severity: 'Medium',
    action: 'Dashboard alert, incident log',
    notify: ['School admin', 'Security guard'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Ready to evaluate',
    capability: 'left',
  }),
  r({
    id: 'fence',
    category: 'Fence climbing',
    detects: 'Climbing motion at the school boundary or fence.',
    example: 'Someone climbing over the school fence.',
    severity: 'High',
    action: 'Immediate alert, footage saved',
    notify: ['School admin', 'Security guard'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Ready to evaluate',
    capability: 'intrusion',
  }),
  r({
    id: 'vehicles',
    category: 'Vehicles at drop-off / pick-up zones',
    detects: 'Unauthorised vehicles, or vehicles parked too long at gates.',
    example: 'A vehicle dwelling in the pick-up zone.',
    severity: 'Low → Medium',
    action: 'Analytics log for monitoring',
    notify: ['School admin', 'Security guard'],
    initial: null,
    target: 90,
    status: 'Suggested',
    gate: 'Ready to evaluate',
    capability: 'traffic',
  }),
];

export function matrixSummary() {
  const by = (s: MatrixStatus) =>
    responseMatrix.filter((x) => x.status === s).length;
  const gate = (g: MatrixGate) =>
    responseMatrix.filter((x) => x.gate === g).length;
  return {
    total: responseMatrix.length,
    existing: by('Existing'),
    requested: by('Requested'),
    suggested: by('Suggested'),
    ready: gate('Ready to evaluate'),
    measure: gate('Needs measurement'),
    governance: gate('Needs governance decision'),
    withCaution: responseMatrix.filter((x) => x.caution).length,
    mapped: responseMatrix.filter((x) => x.capability).length,
  };
}

/** Every distinct recipient named across the matrix. */
export function notifyTargets() {
  return [...new Set(responseMatrix.flatMap((r) => r.notify))].sort();
}
