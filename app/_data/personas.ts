/**
 * Demo sign-in personas: the spec's ten roles plus the ministry. Names are
 * fictional. Selecting one previews that role's workspace; no credentials are
 * collected or checked.
 */
import type { CollegeId, ModuleId } from './um';

export type Workspace = 'um' | 'kpt' | 'app';
export type PersonaId =
  | 'director'
  | 'operator'
  | 'warden'
  | 'pengetua'
  | 'hep'
  | 'counsellor'
  | 'facilities'
  | 'traffic'
  | 'dpo'
  | 'sysadmin'
  | 'kpt';

export type Persona = {
  id: PersonaId;
  workspace: Workspace;
  name: string;
  title: string;
  org: string;
  landing: string;
  summary: string;
  /** Whether this role may see camera footage at all. */
  video: boolean;
  /** Live alerts this role receives: modules, and a college for hostel roles. */
  alerts: {
    modules: ModuleId[] | 'all' | 'none';
    college?: CollegeId;
    wellbeingOnly?: boolean;
  };
};

export const personas: Persona[] = [
  {
    id: 'director',
    workspace: 'um',
    name: 'Supt. (PB) Zulkifli Hassan',
    title: 'Security director',
    org: 'Bahagian Keselamatan UM',
    landing: '/um/console',
    summary:
      'Everything, plus reports. Approves evidence exports and changes rules.',
    video: true,
    alerts: { modules: 'all' },
  },
  {
    id: 'operator',
    workspace: 'um',
    name: 'Aina Sofea',
    title: 'Command centre operator',
    org: 'Pusat Kawalan, Bahagian Keselamatan',
    landing: '/um/console',
    summary:
      'All live alerts and all cameras. Acknowledges, dispatches guards, opens cases.',
    video: true,
    alerts: { modules: 'all' },
  },
  {
    id: 'warden',
    workspace: 'app',
    name: 'Dr. Farah Aziz',
    title: 'Felo on duty, KK12',
    org: 'Kolej Kediaman 12',
    landing: '/app/warden',
    summary:
      'Hostel alerts for KK12 only, on the phone. Accepts, verifies on site, closes with an outcome.',
    video: true,
    alerts: { modules: ['hostel'], college: 'kk12' },
  },
  {
    id: 'pengetua',
    workspace: 'um',
    name: 'Prof. Madya Dr. Rosli Ismail',
    title: 'Pengetua, KK12',
    org: 'Kolej Kediaman 12',
    landing: '/um/hostel',
    summary:
      'KK12’s breach reports. Sets visiting hours and curfew per block. No live video.',
    video: false,
    alerts: { modules: 'none', college: 'kk12' },
  },
  {
    id: 'hep',
    workspace: 'um',
    name: 'Kamarul Ariffin',
    title: 'HEP discipline officer',
    org: 'Bahagian Hal Ehwal Pelajar',
    landing: '/um/cases',
    summary: 'Confirmed cases only, not live video. Opens disciplinary action.',
    video: false,
    alerts: { modules: 'none' },
  },
  {
    id: 'counsellor',
    workspace: 'um',
    name: 'Pn. Melissa Tan',
    title: 'Counsellor',
    org: 'Unit Kaunseling',
    landing: '/um/welfare',
    summary:
      'Wellbeing alerts only, never discipline. Follows up with the student.',
    video: false,
    alerts: { modules: ['welfare', 'safe'], wellbeingOnly: true },
  },
  {
    id: 'facilities',
    workspace: 'um',
    name: 'Ir. Salmah Yusof',
    title: 'Facilities and OSH officer',
    org: 'Jabatan Pembangunan & Penyenggaraan Harta',
    landing: '/um/hse',
    summary: 'HSE and Space alerts and dashboards. Dispatches maintenance.',
    video: true,
    alerts: { modules: ['hse', 'space'] },
  },
  {
    id: 'traffic',
    workspace: 'um',
    name: 'Insp. (PB) Ravi Chandran',
    title: 'Traffic and parking officer',
    org: 'Unit Trafik, Bahagian Keselamatan',
    landing: '/um/mobility',
    summary:
      'Mobility alerts and plate lists. Manages permits and issues notices.',
    video: true,
    alerts: { modules: ['mobility'] },
  },
  {
    id: 'dpo',
    workspace: 'um',
    name: 'Gerald Wong',
    title: 'University DPO',
    org: 'Pejabat Penasihat Undang-Undang',
    landing: '/um/admin',
    summary: 'Audit log, exports, retention and data requests. No live video.',
    video: false,
    alerts: { modules: 'none' },
  },
  {
    id: 'sysadmin',
    workspace: 'um',
    name: 'Lee Wei Jie',
    title: 'System admin',
    org: 'Pusat Teknologi Maklumat & EzGIG',
    landing: '/um/health',
    summary: 'Configuration and camera health. Adds cameras, users and roles.',
    video: true,
    alerts: { modules: 'none' },
  },
  {
    id: 'kpt',
    workspace: 'kpt',
    name: 'Pn. Rozita Abdullah',
    title: 'Campus Technology Oversight Officer',
    org: 'Jabatan Pendidikan Tinggi, KPT',
    landing: '/kpt/overview',
    summary:
      'The 38-university smart-campus audit, global benchmarks and pilot aggregates. Aggregates only.',
    video: false,
    alerts: { modules: 'none' },
  },
];

export const personaById = (id: PersonaId) =>
  personas.find((p) => p.id === id)!;

export const defaultPersona: Record<Workspace, PersonaId> = {
  um: 'director',
  kpt: 'kpt',
  app: 'warden',
};
