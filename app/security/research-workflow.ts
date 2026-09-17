import research from './research.json' with { type: 'json' };
export const relatedFeatures: Record<string, string[]> = {
  CV001: ['F002'],
  CV002: ['F003'],
  CV003: ['F001', 'F003'],
  CV004: ['F005'],
  CV005: ['F008'],
  CV006: ['F004'],
  CV008: ['F036', 'F067'],
  CV009: ['F081'],
  CV014: ['F034'],
  CV015: ['F032', 'F033'],
  CV016: ['F030'],
  CV017: ['F030'],
  CV019: ['F030'],
  CV021: ['F030'],
  CV022: ['F071'],
  CV023: ['F033'],
  CV024: ['F073'],
  CV025: ['F074', 'F075'],
  CV027: ['F071'],
  CV028: ['F043'],
  CV029: ['F041'],
  CV030: ['F046'],
  CV031: ['F047'],
  CV032: ['F021'],
  CV033: ['F061'],
  CV034: ['F045'],
  CV035: ['F044'],
  CV036: ['F044'],
  CV038: ['F012', 'F019'],
  CV039: ['F012'],
  CV040: ['F019'],
  CV041: ['F051'],
  CV042: ['F049', 'F054'],
  CV043: ['F050'],
  CV044: ['F055'],
  CV045: ['F057'],
  CV046: ['F052'],
  CV047: ['F087'],
  CV048: ['F087'],
  CV049: ['F046', 'F089'],
  CV050: ['F088'],
  CV051: ['F089'],
  CV052: ['F087'],
  CV053: ['F089'],
  CV056: ['F089'],
  CV057: ['F090'],
  CV058: ['F063', 'F064'],
  CV059: ['F090'],
  CV060: ['F031'],
  CV061: ['F038'],
  CV062: ['F032', 'F033'],
  CV063: ['F037'],
  CV064: ['F039'],
  CV065: ['F040'],
  CV066: ['F010'],
  CV067: ['F010'],
  CV071: ['F013'],
  CV077: ['F086'],
  CV078: ['F040'],
  CV081: ['F040'],
  CV088: ['F013'],
};
export const categorySetup: Record<
  string,
  {
    destination: string;
    dependency: string;
    fields: string[];
    acceptance: string;
  }
> = {
  '2.1': {
    destination: 'Detection rules',
    dependency:
      'Calibrated camera streams, object tracks and a versioned geometry/rule engine.',
    fields: [
      'Camera and zone reference',
      'Geometry and crossing direction',
      'Armed schedule and timezone',
      'Dwell and cooldown seconds',
    ],
    acceptance:
      'Test qualifying and nonqualifying movement, obscured video and schedule boundaries; require one reviewable event per episode.',
  },
  '2.2': {
    destination: 'Investigations',
    dependency:
      'Object detector, per-camera tracker and searchable event index; cross-camera matching requires a separately validated re-identification service.',
    fields: [
      'Camera group',
      'Allowed object classes',
      'Minimum match confidence',
      'Track expiry seconds',
    ],
    acceptance:
      'Test occlusion and lookalike subjects; show uncertain candidate matches and avoid asserting identity from appearance.',
  },
  '2.3': {
    destination: 'Detection rules',
    dependency:
      'Separately approved biometric service, enrolled reference data, purpose-limited access and documented privacy review. No biometric processing is connected.',
    fields: [
      'Approved purpose and authorisation reference',
      'Enrolment source and deletion policy',
      'Candidate review threshold',
      'Liveness requirement',
    ],
    acceptance:
      'Test consent withdrawal, spoof attempts, false matches and access denial. Demographic inference is optional and must not drive adverse decisions.',
  },
  '2.4': {
    destination: 'Investigations',
    dependency:
      'ANPR camera/OCR service, synchronised vehicle events, plate format validation and parking or toll-system connector as applicable.',
    fields: [
      'Lane and camera reference',
      'Plate region and format',
      'Watchlist or session policy reference',
      'Retention and review threshold',
    ],
    acceptance:
      'Test day/night reads, unreadable plates, duplicate reads and entry without exit; report measured accuracy with sample size, never assume a tender target is achieved.',
  },
  '2.5': {
    destination: 'Incidents',
    dependency:
      'Validated temporal behaviour model, event clips and operator review queue.',
    fields: [
      'Camera and scene reference',
      'Observation window seconds',
      'Sensitivity and confidence threshold',
      'Review and response procedure',
    ],
    acceptance:
      'Test ordinary activity and ambiguous motion; present candidate behaviours for human review without inferring criminal intent.',
  },
  '2.6': {
    destination: 'Incidents',
    dependency:
      'Validated threat model and human verification service; lockdown, screening and emergency dispatch require separately commissioned integrations.',
    fields: [
      'Covered camera or sensor group',
      'Verification procedure',
      'Authorised escalation recipient',
      'Action connector and approval policy',
    ],
    acceptance:
      'Test false positives, analyst rejection, connector outage and duplicate suppression. No real emergency call or door action is made by this demo.',
  },
  '2.7': {
    destination: 'Detection rules',
    dependency:
      'Calibrated safety zones, task-specific models and site safety procedures; CCTV is supplementary to certified safety systems.',
    fields: [
      'Hazard zone and camera',
      'Required equipment or safe distance',
      'Presence duration limit',
      'Safety response owner',
    ],
    acceptance:
      'Validate distance calibration and obscured PPE; report unknown coverage on feed loss and retain human incident verification.',
  },
  '2.8': {
    destination: 'Reports',
    dependency:
      'Calibrated directional counters and aggregate time-series storage.',
    fields: [
      'Counting line or area',
      'Capacity or queue threshold',
      'Aggregation interval minutes',
      'Counter reset and correction policy',
    ],
    acceptance:
      'Test simultaneous entry/exit, occlusion and counter drift; expose coverage gaps and manual correction history.',
  },
  '2.9': {
    destination: 'Reports',
    dependency:
      'Aggregate occupancy and dwell metrics, optional POS correlation and a documented data minimisation policy.',
    fields: [
      'Zone or counter reference',
      'Reporting window',
      'POS or service event source',
      'Staffing or exception threshold',
    ],
    acceptance:
      'Test missing POS periods, duplicate visits and sparse data; show sample coverage and avoid treating correlations as proof of theft.',
  },
  '2.10': {
    destination: 'Investigations',
    dependency:
      'Indexed recordings, search service, case store and secure export/share service.',
    fields: [
      'Case and authorised purpose',
      'Camera and time range',
      'Search attributes or query',
      'Export access and expiry policy',
    ],
    acceptance:
      'Check time ordering, source clip links, redaction, export hashes and expired shares. Current event search and CSV exports are demo workflows, not a video evidence service.',
  },
  '2.11': {
    destination: 'Monitoring',
    dependency:
      'Compatible camera/sensor drivers, timestamp alignment and calibration pipeline.',
    fields: [
      'Device and feed reference',
      'Modality and calibration profile',
      'Timestamp alignment tolerance',
      'Weather or dewarping profile',
    ],
    acceptance:
      'Validate compatible input formats, calibrated projections and sensor loss; do not claim a camera or sensor connection from a saved draft.',
  },
  '2.12': {
    destination: 'Sites',
    dependency:
      'Authenticated backend, tenant isolation, camera/VMS connectors and commissioned infrastructure.',
    fields: [
      'Site and integration name',
      'Protocol or connector type',
      'Deployment region and inference location',
      'Capacity and failover target',
    ],
    acceptance:
      'Test access denial across tenants, connection loss, rate limits and load. Never store credentials in these draft notes.',
  },
  '2.13': {
    destination: 'Reports',
    dependency:
      'Authorisation service, durable audit store, encryption/key management and retention/redaction services. Legal mapping requires qualified review.',
    fields: [
      'Data class and processing purpose',
      'Retention period days',
      'Access role and policy owner',
      'Notice or assessment reference',
    ],
    acceptance:
      'Test deletion deadlines, access revocation, audit integrity and masked exports. A saved policy draft does not enforce deletion, encryption or legal compliance.',
  },
  '2.14': {
    destination: 'Detection rules',
    dependency:
      'Model registry, evaluation datasets, deployment orchestrator and monitored inference infrastructure.',
    fields: [
      'Model and version reference',
      'Evaluation dataset reference',
      'Deployment target and fallback',
      'Acceptance threshold and rollback owner',
    ],
    acceptance:
      'Test version traceability, failed rollout, feedback review and rollback; operator feedback must not automatically retrain or publish a model.',
  },
};
export function setupFor(category: string) {
  return categorySetup[category.split(' ')[0]];
}
export type CapabilityDraft = {
  site: string;
  values: Record<string, string>;
  notes: string;
  updatedAt: string;
};
export function validateCapabilityDraft(
  values: Record<string, string>,
  fields: string[],
) {
  return fields.every((f) => values[f]?.trim())
    ? ''
    : 'Complete all setup fields before saving the draft.';
}
export function researchCoverage() {
  return research.map((item) => ({
    ...item,
    related: relatedFeatures[item.id] ?? [],
    setup: setupFor(item.category),
  }));
}
