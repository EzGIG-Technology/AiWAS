/**
 * Privacy, PDPA, roles, rollout and integrations, as set out in the
 * EzVision Campus System Spec. The controls and their reasons are the spec's;
 * requests, audit entries and users are fictional demo data.
 */
import { cam } from './um';

/** Privacy defaults that ship with every deployment. */
export const privacyControls = [
  {
    control: 'Face recognition',
    default:
      'Off. Opt-in for staff in restricted labs only, with written consent.',
    why: 'Biometric data is sensitive personal data under the amended PDPA; UCLA dropped face recognition over false matches.',
  },
  {
    control: 'Gender estimation',
    default: 'Only at single-gender block boundaries, during restricted hours.',
    why: 'Its purpose is to enforce published hostel rules. It names no one and stores no face template.',
  },
  {
    control: 'Classroom attention scoring',
    default: 'Not offered.',
    why: 'Unreliable, and the clearest red line globally.',
  },
  {
    control: 'Toilets and changing rooms',
    default: 'No cameras; radar only.',
    why: 'Singapore universities keep cameras at entrances only.',
  },
  {
    control: 'Retention',
    default: '30 days for alert clips; cases per university policy.',
    why: 'Edinburgh’s CCTV protocol uses 30 days.',
  },
  {
    control: 'Privacy masking',
    default:
      'Faces blurred in exports unless the security director unblurs for a case.',
    why: 'Minimises the data shared.',
  },
  {
    control: 'Access',
    default: 'Role-based, scoped by college or office; single sign-on.',
    why: 'A warden sees one college only.',
  },
  {
    control: 'Audit',
    default: 'Every view, export and rule change logged for 7 years.',
    why: 'DPO review and the police chain of custody.',
  },
  {
    control: 'Data residency',
    default: 'Edge on campus; metadata in Malaysia.',
    why: 'PDPA transfer rules.',
  },
  {
    control: 'Encryption',
    default: 'In transit and at rest.',
    why: 'Processor security duty.',
  },
  {
    control: 'Human decision',
    default: 'AI never issues a penalty; a person verifies every alert.',
    why: 'Fairness, and protection against false alarms.',
  },
];

/** Uses the system refuses, shown wherever detectors are configured. */
export const exclusions = [
  {
    item: 'Face recognition by default',
    reason:
      'Off. The only exception is opt-in face match for consenting staff at restricted labs.',
  },
  {
    item: 'Classroom attention or engagement scoring',
    reason: 'Not offered. Classroom counts stay anonymous.',
  },
  {
    item: 'Cameras in toilets and changing rooms',
    reason: 'Never. Falls there are sensed by radar, with no image.',
  },
  {
    item: 'Gender estimation outside hostel boundaries',
    reason:
      'The model runs only on lounge-line cameras of single-gender blocks.',
  },
  {
    item: 'Automatic penalties',
    reason:
      'AI never issues a penalty. Discipline is HEP’s decision on a confirmed case.',
  },
  {
    item: 'Welfare signals sent to discipline',
    reason:
      'Wellbeing and at-height alerts go to counselling, never to the disciplinary office.',
  },
];

export const shipsWith = [
  'Privacy impact assessment template',
  'Signage text in Malay and English',
  'Breach-response runbook',
  'Annual penetration test',
  'Bias test of the gender and behaviour models across hijab, hoodies, long hair and night infrared',
];

/** No accuracy figures are claimed until the pilot footage has been tested. */
export const biasTest = [
  {
    group: 'Hijab and tudung',
    status: 'Scheduled on pilot footage',
    note: 'Open question in the spec: accuracy with hijab is untested.',
  },
  {
    group: 'Hoodies and caps',
    status: 'Collecting',
    note: '1 false alarm logged (25 Oct, KK12 Blok A).',
  },
  {
    group: 'Long hair (all genders)',
    status: 'Scheduled on pilot footage',
    note: '',
  },
  {
    group: 'Night infrared',
    status: 'Scheduled on pilot footage',
    note: 'Open question: accuracy at night is untested.',
  },
];

/** What is kept, and for how long (the spec's data model). */
export const retention = [
  {
    entity: 'University, campus, block, zone, camera, edge box',
    keep: 'Contract term',
  },
  { entity: 'Rule', keep: 'Versioned forever' },
  {
    entity: 'Detection (time, camera, class, attributes, track ID)',
    keep: 'Seconds, on the edge box only',
  },
  {
    entity: 'Alert (rule, snapshot, clip, status)',
    keep: '30 days by default',
  },
  {
    entity: 'Case (linked alerts, notes, outcome, exports)',
    keep: 'Per university policy',
  },
  { entity: 'Vehicle permit, visitor pass', keep: 'Until expiry + 30 days' },
  { entity: 'User, role, duty roster', keep: 'While active' },
  { entity: 'Audit log', keep: '7 years' },
];

export type DataRequest = {
  id: string;
  requester: string;
  kind: 'Police (PDRM)' | 'Data subject access' | 'Internal' | 'Correction';
  purpose: string;
  scope: string;
  status: 'Pending' | 'Approved' | 'Refused' | 'Completed';
  decision: string;
};

export const dataRequests: DataRequest[] = [
  {
    id: 'DR-26-014',
    requester: 'PDRM IPD Brickfields',
    kind: 'Police (PDRM)',
    purpose: 'Hit-and-run near the main gate (letter ref. 112/26)',
    scope: `${cam('gate')}, 24 Oct 22:00–23:00`,
    status: 'Pending',
    decision: '—',
  },
  {
    id: 'DR-26-013',
    requester: 'Student (data subject)',
    kind: 'Data subject access',
    purpose: 'Copy of alerts about me at KK12 Blok A',
    scope: 'Alerts 20–25 Oct',
    status: 'Approved',
    decision: 'DPO: third parties blurred; sent 26 Oct',
  },
  {
    id: 'DR-26-012',
    requester: 'Faculty of Law dean',
    kind: 'Internal',
    purpose: 'Check a staff parking dispute',
    scope: cam('office-carpark'),
    status: 'Refused',
    decision: 'DPO: not a permitted purpose',
  },
  {
    id: 'DR-26-011',
    requester: 'Student (data subject)',
    kind: 'Correction',
    purpose: 'Remove a false alarm from my record',
    scope: 'Alert of 25 Oct 21:15 (KK12 Blok A)',
    status: 'Completed',
    decision: 'Alert held no identity; note added that it was a false alarm',
  },
];

export const auditSeed = [
  {
    time: '18:25',
    who: 'Operator Aina',
    action: 'Viewed live',
    target: cam('roof-access'),
    reason: 'Alert at KK9 rooftop',
  },
  {
    time: '17:44',
    who: 'Operator Aina',
    action: 'Linked alert to case',
    target: 'CS-26-038',
    reason: 'Repeat vaping alerts',
  },
  {
    time: '17:12',
    who: 'Operator Hakim',
    action: 'Searched: Person, black jacket, 02:30–03:30',
    target: 'Zone 5 cameras',
    reason: 'Case CS-26-039',
  },
  {
    time: '12:02',
    who: 'Prof. Madya Dr. Rosli Ismail',
    action: 'Viewed breach report',
    target: 'KK12 Blok A',
    reason: 'Weekly college review',
  },
  {
    time: '10:20',
    who: 'Supt. (PB) Zulkifli Hassan',
    action: 'Exported evidence (unblurred, watermarked)',
    target: 'CS-26-039',
    reason: 'PDRM IPD Petaling Jaya',
  },
  {
    time: '06:00',
    who: 'System',
    action: 'Daily camera-health check',
    target: '60 cameras',
    reason: '5 issues found',
  },
  {
    time: '03:00',
    who: 'System',
    action: 'Auto-purged alert clips older than 30 days',
    target: '412 clips',
    reason: 'Retention policy',
  },
];

/** The spec's ten roles, plus the ministry's aggregate view. */
export const roles = [
  {
    role: 'Command centre operator',
    office: 'Bahagian Keselamatan',
    sees: 'All live alerts, all cameras',
    can: 'Acknowledge, dispatch guards, open cases',
  },
  {
    role: 'Security director',
    office: 'Bahagian Keselamatan',
    sees: 'Everything, plus reports',
    can: 'Approve evidence exports, change rules',
  },
  {
    role: 'Warden or felo on duty',
    office: 'Kolej Kediaman',
    sees: 'Hostel alerts for their college only',
    can: 'Accept, verify on site, close with outcome',
  },
  {
    role: 'Pengetua (college principal)',
    office: 'Kolej Kediaman',
    sees: 'Their college’s breach reports',
    can: 'Set visiting hours and curfew per block',
  },
  {
    role: 'HEP discipline officer',
    office: 'Student affairs',
    sees: 'Confirmed cases only, not live video',
    can: 'Open disciplinary action',
  },
  {
    role: 'Counsellor',
    office: 'Counselling unit',
    sees: 'Wellbeing alerts only',
    can: 'Follow up with the student',
  },
  {
    role: 'Facilities and OSH officer',
    office: 'Facilities',
    sees: 'HSE and Space alerts and dashboards',
    can: 'Dispatch maintenance',
  },
  {
    role: 'Traffic and parking officer',
    office: 'Traffic unit',
    sees: 'Mobility alerts, plate lists',
    can: 'Manage permits, issue notices',
  },
  {
    role: 'University DPO',
    office: 'Legal or registrar',
    sees: 'Audit log, exports, retention settings',
    can: 'Review access, handle data requests',
  },
  {
    role: 'System admin',
    office: 'IT and EzGIG',
    sees: 'Configuration, camera health',
    can: 'Add cameras, users and roles',
  },
];

export const users = [
  {
    name: 'Supt. (PB) Zulkifli Hassan',
    role: 'Security director',
    scope: 'Whole campus',
    sso: true,
    last: '18:22',
  },
  {
    name: 'Aina Sofea',
    role: 'Command centre operator',
    scope: 'Whole campus',
    sso: true,
    last: 'Now',
  },
  {
    name: 'Hakim Roslan',
    role: 'Command centre operator',
    scope: 'Whole campus (night shift)',
    sso: true,
    last: '07:00',
  },
  {
    name: 'Dr. Farah Aziz',
    role: 'Warden or felo on duty',
    scope: 'KK12',
    sso: true,
    last: '18:08',
  },
  {
    name: 'Mohd Hafiz Zain',
    role: 'Warden or felo on duty',
    scope: 'KK9',
    sso: true,
    last: '18:24',
  },
  {
    name: 'Prof. Madya Dr. Rosli Ismail',
    role: 'Pengetua',
    scope: 'KK12',
    sso: true,
    last: '12:02',
  },
  {
    name: 'Kamarul Ariffin',
    role: 'HEP discipline officer',
    scope: 'Confirmed cases',
    sso: true,
    last: '09:30',
  },
  {
    name: 'Pn. Melissa Tan',
    role: 'Counsellor',
    scope: 'Wellbeing alerts',
    sso: true,
    last: '08:30',
  },
  {
    name: 'Ir. Salmah Yusof',
    role: 'Facilities and OSH officer',
    scope: 'HSE and Space',
    sso: true,
    last: '17:40',
  },
  {
    name: 'Insp. (PB) Ravi Chandran',
    role: 'Traffic and parking officer',
    scope: 'Mobility',
    sso: true,
    last: '18:06',
  },
  {
    name: 'Gerald Wong',
    role: 'University DPO',
    scope: 'Audit and requests',
    sso: true,
    last: '16:58',
  },
  {
    name: 'Lee Wei Jie',
    role: 'System admin',
    scope: 'Configuration (PTM and EzGIG)',
    sso: true,
    last: '11:15',
  },
];

/** On-duty roster for the warden app (KK12). */
export const roster = [
  {
    name: 'Dr. Farah Aziz',
    college: 'KK12',
    shift: '17:00–01:00',
    onDuty: true,
  },
  {
    name: 'En. Syafiq Rahim',
    college: 'KK12',
    shift: '01:00–08:00',
    onDuty: false,
  },
  {
    name: 'Mohd Hafiz Zain',
    college: 'KK9',
    shift: '17:00–01:00',
    onDuty: true,
  },
];

// ----------------------------------------------------------------- rollout --

export const rollout = [
  {
    stage: 'Survey',
    length: '2 weeks',
    work: 'Walk both blocks, list cameras and blind doors, agree rules with the Pengetua and DPO.',
    gate: 'Signed rules sheet and privacy assessment.',
    status: 'Done',
  },
  {
    stage: 'Pilot build',
    length: '4 weeks',
    work: 'Install the edge box and missing door cameras, map zones, connect WhatsApp alerts.',
    gate: 'All cameras online; test alerts reach the warden.',
    status: 'Done',
  },
  {
    stage: 'Shadow run',
    length: '2 weeks',
    work: 'Alerts go to EzGIG only, to tune thresholds at night.',
    gate: 'False alarms under the agreed limit.',
    status: 'Done',
  },
  {
    stage: 'Live pilot',
    length: '8 weeks',
    work: 'Wardens receive alerts and verify them.',
    gate: 'Pilot KPIs met; management sign-off.',
    status: 'Week 5 of 8',
  },
  {
    stage: 'Phase 1',
    length: 'One semester',
    work: 'All hostel blocks at the campus, plus Safe Campus rules in the command centre.',
    gate: '—',
    status: 'Planned',
  },
  {
    stage: 'Phase 2 onward',
    length: '—',
    work: 'Mobility at gates, Welfare, HSE, Space & Admin, then other campuses.',
    gate: '—',
    status: 'Planned',
  },
];

export const sizing = [
  {
    stage: 'Pilot',
    scope: '2 hostel blocks (one female, one male) + 1 main gate',
    cameras: 'About 20',
  },
  {
    stage: 'Phase 1',
    scope: 'All hostel blocks at one campus (assume 20 blocks)',
    cameras: 'About 160–200',
  },
  {
    stage: 'Full campus',
    scope: 'Hostels + gates + car parks + academic buildings',
    cameras: '600–1,000+',
  },
];

export const perBlockCameras = [
  {
    position: 'Main entrance, inside facing in and out',
    cameras: '2',
    notes: '2.5–3 m height, head-and-shoulder view, infrared for night',
  },
  {
    position: 'Lounge (ruang tamu) to corridor boundary',
    cameras: '1',
    notes: 'The line visitors must not cross',
  },
  {
    position: 'Each side door, stairwell door and fire exit',
    cameras: '1 each',
    notes: 'Usually 2–4 per block; often new cameras',
  },
  {
    position: 'Corridors, one per floor (optional)',
    cameras: '0–4',
    notes: 'Only where overstay tracking needs it',
  },
  { position: 'Typical total', cameras: '6–10', notes: '' },
];

export const siteComponents = [
  {
    part: 'Edge AI box',
    detail:
      'GPU appliance in the block’s or college’s network room. Stream capacity is sized in the pilot.',
  },
  {
    part: 'Network',
    detail:
      'Existing CCTV VLAN. The AI reads the camera’s 720p sub-stream, so bandwidth stays low.',
  },
  {
    part: 'Storage',
    detail:
      'Alert clips on the edge box for 30 days; continuous recording stays on the university’s NVR.',
  },
  {
    part: 'Command centre',
    detail: 'A web console; no special hardware beyond screens.',
  },
  {
    part: 'Hosting',
    detail:
      'On-premises in the university data centre, or hybrid with metadata in a Malaysian cloud region.',
  },
];

export const integrations = [
  {
    system: 'Existing cameras and NVR (Hikvision, Dahua, others)',
    why: 'Video source',
    how: 'RTSP / ONVIF sub-stream',
    pilot: 'Yes',
    state: 'Connected',
  },
  {
    system: 'Existing VMS (HikCentral, Milestone, Genetec)',
    why: 'Show alerts inside the console operators already use',
    how: 'Event API or plug-in',
    pilot: 'No',
    state: 'Not connected',
  },
  {
    system: 'Hostel card readers',
    why: 'Count card taps vs. people for tailgating',
    how: 'Door-event export or controller API',
    pilot: 'No',
    state: 'Connected (KK9 only)',
  },
  {
    system: 'Student information system',
    why: 'Which block each resident belongs to',
    how: 'Nightly file or API, block assignment only',
    pilot: 'No',
    state: 'Not connected',
  },
  {
    system: 'Visitor registration',
    why: 'Known visitors and plates; flags walk-ins',
    how: 'API, or EzVision’s own visitor pass',
    pilot: 'No',
    state: 'EzVision visitor pass',
  },
  {
    system: 'e-Pelekat / RFID sticker database',
    why: 'Permit list for plate recognition',
    how: 'Export or API',
    pilot: 'Mobility only',
    state: 'Nightly export',
  },
  {
    system: 'ParqOS',
    why: 'Gates, parking occupancy, payment',
    how: 'Native',
    pilot: 'Mobility only',
    state: 'Connected',
  },
  {
    system: 'Building management (BMS)',
    why: 'Turn off AC and lights in empty rooms',
    how: 'BACnet',
    pilot: 'Space only',
    state: 'FBE only',
  },
  {
    system: 'Fire alarm panel',
    why: 'Confirm smoke alerts with the panel',
    how: 'Dry contact or API',
    pilot: 'HSE only',
    state: 'Not connected',
  },
  {
    system: 'WhatsApp Business, Telegram, SMS',
    why: 'Alerts to wardens and guards',
    how: 'Messaging API',
    pilot: 'Yes',
    state: 'WhatsApp connected',
  },
  {
    system: 'University sign-in (Microsoft Entra, Google)',
    why: 'Single sign-on; leavers removed automatically',
    how: 'SAML / OIDC',
    pilot: 'No',
    state: 'Entra ID',
  },
  {
    system: 'HEP discipline system',
    why: 'Hand confirmed cases to student affairs',
    how: 'Case export (PDF) or API',
    pilot: 'No',
    state: 'PDF export',
  },
  {
    system: 'PDRM requests',
    why: 'Evidence handover for police cases',
    how: 'Watermarked export with audit entry',
    pilot: 'No',
    state: 'Watermarked export',
  },
];

export const openQuestions = [
  'Gender estimation accuracy at night and with hijab: test on pilot footage before promising a number.',
  'AIWAS IP: confirm EzGIG can reuse the bullying and vape models outside Micropay’s school deal.',
  'Pilot university: UMPSA, USM or UM first.',
  'Commercial model: outright, rental or per-camera subscription; reuse the ParqOS deal menu.',
  'Hardware: who supplies the extra door cameras, EzGIG or the university’s CCTV contractor.',
  'Consent and signage: how each university informs residents before go-live.',
  'Radar: confirm whether 60 GHz radar is piloted or only in the portfolio.',
];
