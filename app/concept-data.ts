export type ConceptField = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'time' | 'select' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
};
export type ConceptModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  scene: string;
  mediaNote: string;
  topics: string[];
  stages: string[];
  checks: string[];
  fields: ConceptField[];
  samples: {
    title: string;
    topic: string;
    location: string;
    priority: string;
    details: string;
    values: Record<string, string>;
  }[];
  action: string;
  scope?: 'platform';
};
const field = (
  key: string,
  label: string,
  options?: string[],
): ConceptField => ({
  key,
  label,
  type: options ? 'select' : 'text',
  options,
  required: true,
});
export const conceptModules: ConceptModule[] = [
  {
    id: 'pilot-governance',
    title: 'Pilot governance',
    subtitle:
      'Agree the scope, protect participation and document the three-school pilot.',
    icon: 'shield',
    scene: 'hall',
    mediaNote:
      'Synthetic public assembly-area context. No real school approval or consent is represented.',
    action: 'Create pilot record',
    topics: [
      'JPN / PPD / school approvals',
      'Participation & parental consent',
      'CCTV compatibility & commissioning',
      'Public-area privacy assessment',
      'Funding & scope reconciliation',
      'Staff training & SOP rehearsal',
      'Pilot milestones & evaluation',
      'Evidence disposal & retention review',
      'Authority routing agreement',
    ],
    stages: [
      'Draft',
      'Review',
      'Actions underway',
      'Verification',
      'Completed',
    ],
    checks: [
      'Responsible reviewer and source references recorded',
      'Unresolved scope conflicts addressed',
      'Participation and public-area privacy reviewed',
      'Outcome and supporting evidence reference recorded',
    ],
    fields: [
      field('reference', 'Approval / evidence reference (fictional)'),
      field('decision', 'Review decision', [
        'Pending clarification',
        'Changes required',
        'Agreed for demonstration',
      ]),
      field('nextAction', 'Next action / unresolved issue'),
    ],
    samples: [
      {
        title: 'Three-school pilot scope review',
        topic: 'JPN / PPD / school approvals',
        location: 'School administration',
        priority: 'Medium',
        details:
          'Fictional coordination record: verify JPN and PPD references, principal and PIBG acknowledgement, school selection and the final pilot dates. No approval is asserted.',
        values: {
          reference: 'DEMO-JPN-001',
          decision: 'Pending clarification',
          nextAction: 'Agree pilot dates and obtain signed scope',
        },
      },
      {
        title: 'Voluntary participation and consent review',
        topic: 'Participation & parental consent',
        location: 'School administration',
        priority: 'High',
        details:
          'Confirm the applicable written-consent process and a workable withdrawal / non-participation arrangement. Do not collect real child records in this demo.',
        values: {
          reference: 'DEMO-CONSENT-001',
          decision: 'Pending clarification',
          nextAction: 'Confirm written-consent requirements',
          participant: 'Fictional cohort A',
          consent: 'Pending',
          withdrawal: 'Exclude from pilot activities pending decision',
        },
      },
    ],
  },
  {
    id: 'safeguarding',
    title: 'Safeguarding',
    subtitle: 'A trusted route from a concern to protection and follow-up.',
    icon: 'shield',
    scene: 'corridor',
    mediaNote:
      'Public corridor context only. Sensitive cases do not expose camera footage in the shared case list.',
    action: 'Record confidential concern',
    topics: [
      'Bullying & intimidation',
      'Verbal or discriminatory bullying',
      'Cyberbullying or threats',
      'Sexual safeguarding concern',
      'Adult conduct concern',
      'Retaliation after reporting',
      'Emotional wellbeing',
      'Substance support',
    ],
    stages: ['Received', 'Triage', 'Protection plan', 'Follow-up', 'Resolved'],
    checks: [
      'Immediate welfare checked',
      'Appropriate independent case owner assigned',
      'Protection / support plan agreed',
      'Follow-up and reporter update recorded',
    ],
    fields: [
      field('channel', 'Report received through', [
        'Staff observation',
        'Pupil report',
        'Parent / guardian',
        'Anonymous report',
      ]),
      field('privacy', 'Case access', [
        'Designated safeguarding team',
        'Independent reviewer only',
      ]),
      field('contact', 'Safe contact method', [
        'School counsellor',
        'Guardian through school',
        'Secure reference only',
      ]),
      field('referral', 'Referral route', [
        'School safeguarding lead',
        'Independent school reviewer',
        'PPD / JPN liaison',
        'Health / protection services',
      ]),
    ],
    samples: [
      {
        title: 'Repeated intimidation near the staircase',
        topic: 'Bullying & intimidation',
        location: 'Block A corridor',
        priority: 'High',
        details:
          'Fictional pupil report describes repeated intimidation between lessons. A staff welfare check is required. This is an allegation awaiting review, not an AI finding.',
        values: {
          channel: 'Pupil report',
          privacy: 'Designated safeguarding team',
          contact: 'School counsellor',
          referral: 'School safeguarding lead',
        },
      },
      {
        title: 'Concern about an adult’s conduct',
        topic: 'Adult conduct concern',
        location: 'School office',
        priority: 'High',
        details:
          'Fictional concern routed outside the usual reporting line. General staff should only see that an authorised review is in progress.',
        values: {
          channel: 'Parent / guardian',
          privacy: 'Independent reviewer only',
          contact: 'Guardian through school',
          referral: 'Independent school reviewer',
        },
      },
    ],
  },
  {
    id: 'emergency-centre',
    title: 'Emergency centre',
    subtitle:
      'Activate a response, account for people and record every handover.',
    icon: 'siren',
    scene: 'courtyard',
    mediaNote:
      'Staged assembly-area footage. Counts and response messages are simulated.',
    action: 'Start response exercise',
    topics: [
      'Evacuation / fire alarm',
      'Visible weapon or credible threat',
      'Medical assistance',
      'Missing pupil search',
      'Shelter in place',
      'Family reunification',
      'Emergency contact failure',
    ],
    stages: [
      'Activated',
      'Responders assigned',
      'People accounted for',
      'Handover',
      'Closed',
    ],
    checks: [
      'On-duty responder acknowledged',
      'Affected area and safe meeting point recorded',
      'People accounted for or unresolved persons escalated',
      'Response handover and family contact recorded',
    ],
    fields: [
      field('mode', 'Exercise type', [
        'Evacuation',
        'Medical response',
        'Protective response',
        'Reunification',
      ]),
      field('meeting', 'Meeting point'),
      field('lead', 'Response lead'),
      field('contact', 'Contact status', [
        'Not attempted',
        'Simulated contact attempted',
        'Simulated acknowledgement received',
        'Unable to reach — escalate',
      ]),
    ],
    samples: [
      {
        title: 'Assembly hall evacuation exercise',
        topic: 'Evacuation / fire alarm',
        location: 'Assembly hall',
        priority: 'Critical',
        details:
          'Training exercise: a sample alarm requires an orderly response. Start protective actions without waiting for model analysis. No real alarm or emergency service is contacted.',
        values: {
          mode: 'Evacuation',
          meeting: 'Courtyard assembly point A',
          lead: 'Ahmad Firdaus',
          contact: 'Not attempted',
        },
      },
      {
        title: 'First-aider requested at sports area',
        topic: 'Medical assistance',
        location: 'Courtyard',
        priority: 'High',
        details:
          'Fictional first-aid request. The interface coordinates staff and handover; it does not diagnose an injury or prescribe treatment.',
        values: {
          mode: 'Medical response',
          meeting: 'Sports area entrance',
          lead: 'Nur Aisyah',
          contact: 'Simulated contact attempted',
        },
      },
    ],
  },
  {
    id: 'hostel-operations',
    title: 'Hostel operations',
    subtitle:
      'Duty coverage, welfare rounds and a clear night-to-day handover.',
    icon: 'building',
    scene: 'hostel',
    mediaNote:
      'Synthetic hostel common-lobby scene. Bedrooms, bathrooms and changing areas are excluded.',
    action: 'Create hostel duty record',
    topics: [
      'Duty roster & shift handover',
      'Evening roll call',
      'Welfare round',
      'Leave & late return',
      'Unresolved welfare check',
    ],
    stages: [
      'Scheduled',
      'On duty',
      'Checks underway',
      'Handover ready',
      'Completed',
    ],
    checks: [
      'Duty staff confirmed',
      'Roll call reconciled with approved leave',
      'Welfare exceptions checked or escalated',
      'Incoming duty team received handover',
    ],
    fields: [
      field('shift', 'Duty shift', [
        'Morning 06:00–14:00',
        'Evening 14:00–22:00',
        'Night 22:00–06:00',
      ]),
      field('warden', 'Duty warden'),
      { key: 'round', label: 'Next round', type: 'time', required: true },
      field('handover', 'Incoming team'),
    ],
    samples: [
      {
        title: 'East hostel evening roll call',
        topic: 'Evening roll call',
        location: 'East hostel common lobby',
        priority: 'Medium',
        details:
          'Sample roll call: 46 residents expected, 44 checked, one on approved leave and one not yet checked. Not yet checked does not mean confirmed missing.',
        values: {
          shift: 'Evening 14:00–22:00',
          warden: 'Nadia Ahmad',
          round: '21:00',
          handover: 'Night duty team',
        },
      },
      {
        title: 'Night welfare rounds and duty handover',
        topic: 'Duty roster & shift handover',
        location: 'Hostel common areas',
        priority: 'Low',
        details:
          'Fictional duty schedule with a scheduled welfare round and written handover. Private living areas are not camera-monitored.',
        values: {
          shift: 'Night 22:00–06:00',
          warden: 'Ahmad Firdaus',
          round: '23:00',
          handover: 'Morning duty team',
        },
      },
    ],
  },
  {
    id: 'movement-visitors',
    title: 'Movement & visitors',
    subtitle:
      'Know the reason for a visit and verify each authorised handover.',
    icon: 'gate',
    scene: 'gate',
    mediaNote:
      'Synthetic gate scene. Authorisation comes from school records, not facial recognition.',
    action: 'Add movement record',
    topics: [
      'Authorised pupil collection',
      'School transport boarding / alighting',
      'Visitor access',
      'Contractor permit',
      'Gate congestion & near miss',
      'Attendance reconciliation',
    ],
    stages: [
      'Requested',
      'Verified',
      'In progress',
      'Handover recorded',
      'Completed',
    ],
    checks: [
      'Identity / authority checked by staff',
      'Host or guardian approval recorded',
      'Arrival and departure reconciled',
      'Final handover or sign-out confirmed',
    ],
    fields: [
      field('person', 'Fictional person / group'),
      field('authority', 'Authorised by'),
      field('purpose', 'Purpose'),
      field('verification', 'Verification method', [
        'Staff-confirmed school record',
        'Sample QR pass',
        'Guardian approval record',
        'Host approval record',
      ]),
    ],
    samples: [
      {
        title: 'Afternoon school van handover',
        topic: 'School transport boarding / alighting',
        location: 'Main gate',
        priority: 'Medium',
        details:
          'Training manifest for Route A. Students are checked on boarding and alighting; the driver must confirm the final handover. Campus cameras do not cover the whole route.',
        values: {
          person: 'Route A · sample group',
          authority: 'School transport coordinator',
          purpose: 'Afternoon home journey',
          verification: 'Staff-confirmed school record',
        },
      },
      {
        title: 'Electrical contractor access request',
        topic: 'Contractor permit',
        location: 'Main gate',
        priority: 'Low',
        details:
          'Fictional contractor requires host approval, a defined work area and sign-out. This record does not issue a real site credential.',
        values: {
          person: 'Demo contractor team',
          authority: 'Facilities lead',
          purpose: 'Electrical inspection',
          verification: 'Host approval record',
        },
      },
    ],
  },
  {
    id: 'facilities-health',
    title: 'Facilities & health',
    subtitle:
      'Prevent avoidable harm with inspections, traceability and verified repairs.',
    icon: 'wrench',
    scene: 'inspection',
    mediaNote:
      'Synthetic inspection scene. A photo supports a record; it does not certify an asset as safe.',
    action: 'Create inspection or health record',
    topics: [
      'Electrical / fire-equipment inspection',
      'Structural or sports-equipment defect',
      'Toilets / water / cleaning',
      'Canteen food safety',
      'Illness cluster review',
      'Asset theft / lost property',
      'Vaping support referral',
    ],
    stages: [
      'Reported',
      'Assessed',
      'Action underway',
      'Verification',
      'Closed',
    ],
    checks: [
      'Affected asset / group identified',
      'Immediate restriction or support action recorded',
      'Responsible person completed action',
      'Authorised verification documented',
    ],
    fields: [
      field('asset', 'Asset / meal batch / group'),
      field('specialist', 'Responsible specialist'),
      field('restriction', 'Interim action', [
        'No restriction required',
        'Area temporarily restricted',
        'Equipment isolated by authorised staff',
        'Health review requested',
      ]),
      field('evidence', 'Verification required', [
        'Staff checklist',
        'Competent-person clearance',
        'Health-authority follow-up',
        'Contractor completion and staff check',
      ]),
    ],
    samples: [
      {
        title: 'Sports goalpost anchoring inspection',
        topic: 'Structural or sports-equipment defect',
        location: 'Sports field',
        priority: 'High',
        details:
          'Fictional preventative inspection. Keep the equipment out of use until an appropriate person verifies the issue. A video cannot certify structural safety.',
        values: {
          asset: 'SPORT-014 · goalpost',
          specialist: 'Facilities lead',
          restriction: 'Area temporarily restricted',
          evidence: 'Competent-person clearance',
        },
      },
      {
        title: 'Canteen meal-batch follow-up',
        topic: 'Canteen food safety',
        location: 'Canteen',
        priority: 'High',
        details:
          'Fictional cluster of reported symptoms linked for human review. Record meal details and contact the responsible health team through approved procedures. No diagnosis is inferred.',
        values: {
          asset: 'Sample lunch batch B-014',
          specialist: 'School health liaison',
          restriction: 'Health review requested',
          evidence: 'Health-authority follow-up',
        },
      },
    ],
  },
  {
    id: 'activities-continuity',
    title: 'Activities & continuity',
    subtitle:
      'Prepare for weather, trips and the individual support pupils need.',
    icon: 'cloud',
    scene: 'courtyard',
    mediaNote:
      'Illustrative campus footage. Weather, trip manifests and closure notices are demonstration data.',
    action: 'Plan activity or continuity action',
    topics: [
      'Heat / outdoor activity review',
      'Flood closure & reopening',
      'Sports / excursion approval',
      'Water activity safety',
      'PPKI / individual assistance',
      'Power / communication outage',
    ],
    stages: [
      'Draft',
      'Risk review',
      'Approved plan',
      'In progress',
      'Completed',
    ],
    checks: [
      'Conditions and risks reviewed by responsible staff',
      'Permissions and support needs recorded',
      'Contingency and contact plan checked',
      'Return / reopening / completion verified',
    ],
    fields: [
      field('activity', 'Activity / affected operation'),
      field('approval', 'Approval owner'),
      field('contingency', 'Alternative arrangement'),
      field('support', 'Support arrangement', [
        'Standard staff supervision',
        'Individual assistance plan',
        'Accessible transport and escort',
        'School continuity team',
      ]),
    ],
    samples: [
      {
        title: 'Outdoor sports session: heat review',
        topic: 'Heat / outdoor activity review',
        location: 'Sports field',
        priority: 'Medium',
        details:
          'Sample weather observation: 36°C. Review the activity against the applicable school guidance and record the decision. No live weather service is connected.',
        values: {
          activity: 'Afternoon sports session',
          approval: 'School administrator',
          contingency: 'Move session to shaded indoor activity',
          support: 'Standard staff supervision',
        },
      },
      {
        title: 'Flood readiness and reopening checklist',
        topic: 'Flood closure & reopening',
        location: 'Campus-wide',
        priority: 'High',
        details:
          'Exercise: prepare a closure and later reopening decision, record damage and alternative communication arrangements. Cameras may be unavailable during a flood.',
        values: {
          activity: 'Campus continuity exercise',
          approval: 'School continuity lead',
          contingency: 'Approved remote learning and contact plan',
          support: 'School continuity team',
        },
      },
      {
        title: 'Inclusive water-activity planning',
        topic: 'PPKI / individual assistance',
        location: 'Off-site activity venue',
        priority: 'High',
        details:
          'Fictional activity plan records individual assistance and appropriate supervision. Campus video is not a substitute for qualified on-site supervision.',
        values: {
          activity: 'Supervised off-site activity',
          approval: 'Activity coordinator',
          contingency: 'Accessible alternative activity',
          support: 'Individual assistance plan',
        },
      },
    ],
  },
  {
    id: 'platform-readiness',
    title: 'Platform readiness',
    subtitle:
      'Provision access, verify integrations and make reduced coverage visible.',
    icon: 'server',
    scene: 'hall',
    mediaNote:
      'Sample camera context. Integrations remain simulated until provisioned and tested.',
    scope: 'platform',
    action: 'Create readiness review',
    topics: [
      'Staff invitation & role review',
      'Evidence access & retention',
      'Notification delivery test',
      'Camera obstruction / stale feed',
      'Power & network resilience',
      'Attendance import / report export',
      'Government aggregate reporting',
      'Uniform / person-type policy',
    ],
    stages: [
      'Not configured',
      'Configuration review',
      'Test in progress',
      'Verification',
      'Ready for demonstration',
    ],
    checks: [
      'Responsible owner and school scope confirmed',
      'Configuration and privacy boundaries reviewed',
      'Failure / recovery scenario documented',
      'Reviewer signed off the demonstration outcome',
    ],
    fields: [
      field('service', 'Service / integration'),
      field('environment', 'Environment', [
        'Demonstration only',
        'Proposed pilot — not connected',
      ]),
      field('reviewer', 'Authorised reviewer'),
      field('policy', 'Policy / control reference'),
    ],
    samples: [
      {
        title: 'Camera freshness and lost-feed exercise',
        topic: 'Camera obstruction / stale feed',
        location: 'School camera network',
        priority: 'High',
        details:
          'Simulate missing frames, obstruction and recovery. A network connection alone does not establish usable CCTV coverage.',
        values: {
          service: 'CCTV health',
          environment: 'Demonstration only',
          reviewer: 'Daniel Tan',
          policy: 'Freshness and escalation review',
        },
      },
      {
        title: 'Evidence permissions and retention review',
        topic: 'Evidence access & retention',
        location: 'Platform administration',
        priority: 'High',
        details:
          'Preview school-scoped access, restricted records and retention review. No production permission or deletion policy is provisioned by this screen.',
        values: {
          service: 'Evidence governance',
          environment: 'Demonstration only',
          reviewer: 'Daniel Tan',
          policy: 'School-approved evidence policy',
        },
      },
      {
        title: 'Appearance classification policy',
        topic: 'Uniform / person-type policy',
        location: 'Platform administration',
        priority: 'Low',
        details:
          'Policy review: uniform and appearance-derived person classifications remain disabled. Staff authorisation must come from verified accounts and school records.',
        values: {
          service: 'Optional feature policy',
          environment: 'Demonstration only',
          reviewer: 'Daniel Tan',
          policy: 'Disabled by default — necessity review',
        },
      },
    ],
  },
];
export type ConceptRecord = {
  id: string;
  module: string;
  school: string;
  title: string;
  topic: string;
  location: string;
  priority: string;
  owner: string;
  due: string;
  stage: number;
  details: string;
  values: Record<string, string>;
  checked: string[];
  history: { time: string; text: string }[];
};
export function makeConceptSeeds(schools: string[]): ConceptRecord[] {
  return schools.flatMap((school, si) =>
    conceptModules.flatMap((m, mi) =>
      m.samples.map((s, i) => ({
        ...s,
        id: `DEMO-${si + 1}${mi + 1}${i + 1}`,
        module: m.id,
        school,
        owner: m.scope ? 'Daniel Tan' : 'Nadia Ahmad',
        due: '2026-09-14',
        stage: i === 0 ? 1 : 0,
        checked: [],
        history: [
          {
            time: '10:30 MYT',
            text: 'Fictional demonstration record created; no external action taken.',
          },
        ],
      })),
    ),
  );
}
export function conceptAdvanceError(
  record: ConceptRecord,
  module: ConceptModule,
  note: string,
) {
  if (note.trim().length < 10)
    return 'Describe the action taken in at least 10 characters.';
  if (record.stage >= module.stages.length - 1)
    return 'This workflow is complete. Reopen it to record new work.';
  if (
    record.stage === module.stages.length - 2 &&
    module.checks.some((c) => !record.checked.includes(c))
  )
    return 'Complete the verification checklist before the final step.';
  if (record.stage === module.stages.length - 2) {
    if (module.id === 'emergency-centre' && !record.values.delivery)
      return 'Record the responder acknowledgement before closing the exercise.';
    if (
      module.id === 'emergency-centre' &&
      record.values.mode === 'Evacuation' &&
      [0, 1, 2].some((i) => !record.values[`muster${i}`])
    )
      return 'Reconcile the exercise headcounts before closing.';
    if (module.id === 'movement-visitors' && !record.values.gate3)
      return 'Complete authority, arrival, handover and sign-out checks first.';
    if (
      module.id === 'hostel-operations' &&
      record.topic === 'Evening roll call' &&
      [0, 1, 2, 3, 4, 5].some(
        (i) =>
          !['Present — staff checked', 'Approved leave'].includes(
            record.values[`roll${i}`] || (i === 4 ? 'Approved leave' : ''),
          ),
      )
    )
      return 'Reconcile every sample resident before completing roll call.';
  }
  if (
    module.id === 'pilot-governance' &&
    record.stage === module.stages.length - 2
  ) {
    if (record.values.decision !== 'Agreed for demonstration')
      return 'Resolve the review decision before completing this pilot record.';
    if (
      fieldsForTopic(module, record.topic).some(
        (f) => f.required && !record.values[f.key]?.trim(),
      )
    )
      return 'Complete the supporting pilot fields in Record details before completion.';
  }
  return '';
}

export function fieldsForTopic(
  module: ConceptModule,
  topic: string,
): ConceptField[] {
  const extra: ConceptField[] = [];
  if (module.id === 'pilot-governance') {
    if (topic.includes('approvals'))
      extra.push(
        field('jpn', 'JPN reference'),
        field('ppd', 'PPD reference'),
        field('schoolAck', 'Principal / PIBG acknowledgement'),
        field('cohort', 'Three-school selection status', [
          'Proposed',
          'Under review',
          'Selection recorded',
        ]),
      );
    if (topic.includes('consent'))
      extra.push(
        field('participant', 'Fictional participant / cohort reference'),
        field('consent', 'Participation status', [
          'Pending',
          'Consent recorded',
          'Declined',
          'Withdrawn',
        ]),
        field('withdrawal', 'Non-participation / withdrawal arrangement'),
      );
    if (topic.includes('CCTV'))
      extra.push(
        field('supply', 'Camera provision', [
          'Existing CCTV',
          'Third-party upgrade review',
          'Micropay upgrade review',
        ]),
        field(
          'compatibility',
          'Resolution / protocol / lighting test reference',
        ),
        field('coverage', 'Coverage and connectivity gaps'),
      );
    if (topic.includes('privacy'))
      extra.push(
        field('placement', 'Public-area placement review'),
        field('exclusions', 'Private areas excluded'),
        field('retentionScope', 'Video / metadata retention reconciliation'),
      );
    if (topic.includes('Funding'))
      extra.push(
        field('payer', 'Funding assurance reference'),
        field('schoolCost', 'School / parent charge', [
          'None in agreed pilot scope',
          'Unresolved scope — do not proceed',
        ]),
        field('budget', 'Budget discrepancy resolution'),
      );
    if (topic.includes('training'))
      extra.push(
        field('attendees', 'Staff / team references'),
        field('rehearsal', 'Scenario and acknowledgement test'),
        field('sop', 'Approved SOP reference'),
      );
    if (topic.includes('milestones'))
      extra.push(
        field('phase', 'Pilot phase', [
          'Month 1 — preparation',
          'Month 2 — monitoring',
          'Month 3 — evaluation',
        ]),
        field('dates', 'Agreed start / finish dates'),
        field('evaluation', 'Evaluation cohort and metric definitions'),
      );
    if (topic.includes('disposal'))
      extra.push(
        field('evidenceDecision', 'Evidence status', [
          'Unverified candidate',
          'Confirmed incident',
          'False alarm / routine material',
        ]),
        field('disposal', 'Disposal / retention decision reference'),
        field('legalHold', 'Authorised hold or release review'),
      );
    if (topic.includes('routing'))
      extra.push(
        field('recipients', 'School / JPN / KPM / authority recipients'),
        field('routeSop', 'Authorised escalation protocol reference'),
        field('channel', 'Notification channel', [
          'WhatsApp demo',
          'Dashboard demo',
          'Emergency contact rehearsal',
        ]),
        field('fallback', 'Acknowledgement timeout and fallback action'),
      );
  }

  if (/Cyberbullying/.test(topic))
    extra.push(
      field('reference', 'Evidence reference (do not upload abusive material)'),
      field('onlineSupport', 'Online safety action', [
        'Safe contact agreed',
        'Platform report advised',
        'Specialist referral requested',
      ]),
    );
  if (/Sexual|Adult conduct|Retaliation/.test(topic))
    extra.push(
      field('independent', 'Independent review contact'),
      field('safePlan', 'Immediate protection arrangement'),
    );
  if (/Leave|late return/.test(topic))
    extra.push(
      field('resident', 'Fictional resident reference'),
      field('leaveAuthority', 'Leave approved by'),
      {
        key: 'returnTime',
        label: 'Expected return',
        type: 'time',
        required: true,
      },
    );
  if (/transport/.test(topic))
    extra.push(
      field('vehicle', 'Vehicle / route reference'),
      field('operator', 'Approved operator'),
      field('manifest', 'Manifest / group reference'),
    );
  if (/collection/.test(topic))
    extra.push(
      field('collector', 'Authorised collector reference'),
      field('collectionApproval', 'Collection approval reference'),
    );
  if (/Visitor|Contractor/.test(topic))
    extra.push(field('host', 'Host / escort'), {
      key: 'expiry',
      label: 'Expected sign-out',
      type: 'time',
      required: true,
    });
  if (/food|Canteen/.test(topic))
    extra.push(
      field('supplier', 'Meal supplier'),
      {
        key: 'mealDate',
        label: 'Meal service date',
        type: 'date',
        required: true,
      },
      field('batch', 'Meal / batch reference'),
    );
  if (/Illness/.test(topic))
    extra.push(
      field('group', 'Affected group (fictional)'),
      field('reportedCount', 'Number reported to staff'),
      field('healthContact', 'School health liaison'),
    );
  if (/excursion|Water activity|PPKI/.test(topic))
    extra.push(
      field('venue', 'Activity venue'),
      field('provider', 'Qualified provider / lead'),
      field('consent', 'Consent / permissions record'),
      field('assistance', 'Individual assistance / headcount plan'),
    );
  if (/invitation/.test(topic))
    extra.push(
      field('inviteEmail', 'Fictional staff email'),
      field('grantRole', 'Proposed role', [
        'School administrator',
        'Designated safeguarding staff',
        'Teacher',
        'Technical operator',
      ]),
      field('inviteState', 'Invitation state', [
        'Draft only',
        'Simulated invitation sent',
        'Simulated accepted',
        'Simulated revoked',
      ]),
    );
  if (/Government/.test(topic))
    extra.push(
      field('reportPeriod', 'Reporting period'),
      field('suppression', 'Small-group suppression', [
        'Suppress groups below 10',
        'Suppress groups below 20',
      ]),
      field('reportAuthority', 'Release approval owner'),
    );
  if (/Evidence/.test(topic))
    extra.push(
      field('retention', 'Proposed retention period'),
      field('access', 'Allowed access', [
        'School case team',
        'Designated safeguarding team',
        'Approved investigation access',
      ]),
    );
  if (/Attendance import/.test(topic))
    extra.push(
      field('system', 'Source record', [
        'Approved sample CSV',
        'APDM / eKehadiran concept',
        'School register',
      ]),
      field('batchRef', 'Import / export batch reference'),
    );
  return [...module.fields, ...extra];
}

export function conceptFormError(
  module: ConceptModule,
  values: Record<string, string>,
  owners: string[],
) {
  if (
    (values.title || '').trim().length < 3 ||
    (values.details || '').trim().length < 10
  )
    return 'Add a clear title and at least 10 characters of detail.';
  if (!(values.location || '').trim()) return 'Enter a location.';
  if (!module.topics.includes(values.topic))
    return 'Choose a valid workflow type.';
  if (!['Low', 'Medium', 'High', 'Critical'].includes(values.priority))
    return 'Choose a valid priority.';
  if (!owners.includes(values.owner))
    return 'Choose an active owner in this school.';
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.due || '') ||
    !Number.isFinite(Date.parse(values.due)) ||
    new Date(values.due).toISOString().slice(0, 10) !== values.due
  )
    return 'Choose a valid review date.';
  for (const f of fieldsForTopic(module, values.topic)) {
    const value = (values[f.key] || '').trim();
    if (f.required && !value) return `Complete ${f.label.toLowerCase()}.`;
    if (f.options && !f.options.includes(value))
      return `Choose a valid ${f.label.toLowerCase()}.`;
  }
  return '';
}
export const studyCoverage: {
  need: string;
  workspace: string;
  workflow: string;
}[] = [
  {
    need: 'Visible fighting or assault',
    workspace: 'Incidents',
    workflow: 'Evidence review and response',
  },
  ...[
    [
      'Repeated bullying, intimidation and extortion',
      'Safeguarding',
      'Bullying & intimidation',
    ],
    [
      'Verbal, discriminatory or social exclusion bullying',
      'Safeguarding',
      'Verbal or discriminatory bullying',
    ],
    ['Cyberbullying and threats', 'Safeguarding', 'Cyberbullying or threats'],
    [
      'Sexual harassment, grooming or abuse',
      'Safeguarding',
      'Sexual safeguarding concern',
    ],
    [
      'Adult misconduct or abuse of authority',
      'Safeguarding',
      'Adult conduct concern',
    ],
    [
      'Visible weapon or credible threat',
      'Emergency centre',
      'Visible weapon or credible threat',
    ],
    [
      'Emotional distress or self-harm concern',
      'Safeguarding',
      'Emotional wellbeing',
    ],
    ['Medical collapse or injury', 'Emergency centre', 'Medical assistance'],
    ['Smoking/vaping/substance concern', 'Safeguarding', 'Substance support'],
    [
      'Missing pupil / unexplained absence',
      'Emergency centre',
      'Missing pupil search',
    ],
    ['Visitor or contractor access', 'Movement & visitors', 'Visitor access'],
    [
      'Boarding-school supervision',
      'Hostel operations',
      'Duty roster & shift handover',
    ],
    [
      'Retaliation after a complaint',
      'Safeguarding',
      'Retaliation after reporting',
    ],
    [
      'Emergency family contact/reunification',
      'Emergency centre',
      'Family reunification',
    ],
    ['Fire and smoke', 'Emergency centre', 'Evacuation / fire alarm'],
    [
      'Electrical hazards',
      'Facilities & health',
      'Electrical / fire-equipment inspection',
    ],
    [
      'Structural defects, drains and unsafe equipment',
      'Facilities & health',
      'Structural or sports-equipment defect',
    ],
    [
      'Flood and severe-weather disruption',
      'Activities & continuity',
      'Flood closure & reopening',
    ],
    [
      'Heat and outdoor activities',
      'Activities & continuity',
      'Heat / outdoor activity review',
    ],
    [
      'Food safety / canteen hygiene',
      'Facilities & health',
      'Canteen food safety',
    ],
    [
      'Infectious-disease clusters',
      'Facilities & health',
      'Illness cluster review',
    ],
    [
      'Toilets, water and cleaning',
      'Facilities & health',
      'Toilets / water / cleaning',
    ],
    [
      'Gate congestion and pedestrian conflict',
      'Movement & visitors',
      'Gate congestion & near miss',
    ],
    [
      'School transport and collection',
      'Movement & visitors',
      'School transport boarding / alighting',
    ],
    [
      'Excursions, sports and water activities',
      'Activities & continuity',
      'Sports / excursion approval',
    ],
    [
      'Accessibility / PPKI support',
      'Activities & continuity',
      'PPKI / individual assistance',
    ],
    [
      'Camera obstruction, stale video and network failure',
      'Platform readiness',
      'Camera obstruction / stale feed',
    ],
    [
      'Power outage and communications failure',
      'Activities & continuity',
      'Power / communication outage',
    ],
    [
      'Attendance administration',
      'Movement & visitors',
      'Attendance reconciliation',
    ],
    [
      'Reporting burden and case accountability',
      'Platform readiness',
      'Attendance import / report export',
    ],
    [
      'Theft, vandalism and lost property',
      'Facilities & health',
      'Asset theft / lost property',
    ],
    [
      'Uniform/person-type classification',
      'Platform readiness',
      'Uniform / person-type policy',
    ],
  ].map(([need, workspace, workflow]) => ({ need, workspace, workflow })),
];
