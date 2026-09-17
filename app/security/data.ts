export type Incident = {
  id: string;
  title: string;
  site: string;
  zone: string;
  severity: string;
  status: string;
  time: string;
  guard: string;
  notes: string[];
  history: string[];
};
export const sites = [
  'Northpoint Logistics',
  'Meridian Business Park',
  'Harbour Retail Centre',
];
export const guards = [
  { name: 'Sarah Chen', site: sites[0] },
  { name: 'Marcus Reed', site: sites[0] },
  { name: 'Amir Hassan', site: sites[1] },
  { name: 'Priya Patel', site: sites[2] },
];
export const initial: Incident[] = [
  {
    id: 'INC-2401',
    title: 'After-hours perimeter entry',
    site: sites[0],
    zone: 'North fence · N-02',
    severity: 'Critical',
    status: 'New',
    time: '14:22',
    guard: '',
    notes: [],
    history: [
      '14:22 · Rule F001 detected person presence during a temporary armed window (14:00–16:00).',
    ],
  },
  {
    id: 'INC-2402',
    title: 'Loading bay restricted access',
    site: sites[0],
    zone: 'Loading bay · L-03',
    severity: 'High',
    status: 'New',
    time: '14:20',
    guard: '',
    notes: [],
    history: ['14:20 · Rule F003 detected entry into a restricted zone.'],
  },
  {
    id: 'INC-2403',
    title: 'Door held open',
    site: sites[1],
    zone: 'East entrance · E-01',
    severity: 'Medium',
    status: 'Verified',
    time: '14:18',
    guard: '',
    notes: ['Door remains open beyond the 60-second threshold.'],
    history: [
      '14:18 · Access system event received.',
      '14:19 · Alex Morgan verified the event.',
    ],
  },
  {
    id: 'INC-2404',
    title: 'Camera connection lost',
    site: sites[2],
    zone: 'Car park · P-04',
    severity: 'Medium',
    status: 'Verified',
    time: '14:16',
    guard: '',
    notes: [],
    history: [
      '14:16 · Stream heartbeat missing; coverage is unknown.',
      '14:17 · Operator confirmed connection failure.',
    ],
  },
];
