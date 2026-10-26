/**
 * Demo sign-in personas. Names are fictional. Selecting one previews that
 * role's workspace; no credentials are collected or checked.
 */
export type Workspace = 'um' | 'kpt' | 'app';
export type PersonaId =
  | 'soc'
  | 'chief'
  | 'pengetua'
  | 'hepa'
  | 'dpo'
  | 'kpt'
  | 'student'
  | 'officer';

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
};

export const personas: Persona[] = [
  {
    id: 'chief',
    workspace: 'um',
    name: 'Supt. (PB) Zulkifli Hassan',
    title: 'Chief Security Officer',
    org: 'Bahagian Keselamatan & Polis Bantuan UM',
    landing: '/um/overview',
    summary: 'Full command view: alarms, video, patrols, colleges, compliance.',
    video: true,
  },
  {
    id: 'soc',
    workspace: 'um',
    name: 'Aina Sofea',
    title: 'SOC Operator',
    org: 'Pusat Kawalan Keselamatan UM',
    landing: '/um/incidents',
    summary: 'Unified alarm queue, video wall, SOS and dispatch.',
    video: true,
  },
  {
    id: 'pengetua',
    workspace: 'um',
    name: 'Prof. Dr. Norhayati Ismail',
    title: 'Pengetua',
    org: 'KK12 Kolej Raja Dr Nazrin Shah',
    landing: '/um/colleges',
    summary: 'My college: door alarms, visitors, occupancy and notices.',
    video: true,
  },
  {
    id: 'hepa',
    workspace: 'um',
    name: 'Prof. Dr. Azlan Mohd Noor',
    title: 'Deputy Vice-Chancellor (HEPA)',
    org: 'Student Affairs & Alumni',
    landing: '/um/welfare',
    summary: 'Aggregated student welfare and KPT inspection status. No video.',
    video: false,
  },
  {
    id: 'dpo',
    workspace: 'um',
    name: 'Gerald Wong',
    title: 'Data Protection Officer',
    org: 'Universiti Malaya',
    landing: '/um/privacy',
    summary: 'Footage access approvals, audit log, retention and DPIAs.',
    video: false,
  },
  {
    id: 'kpt',
    workspace: 'kpt',
    name: 'Pn. Rozita Abdullah',
    title: 'Campus Safety Oversight Officer',
    org: 'Jabatan Pendidikan Tinggi, KPT',
    landing: '/kpt/overview',
    summary:
      'National trends, inspection compliance and escalations. Aggregates only.',
    video: false,
  },
  {
    id: 'student',
    workspace: 'app',
    name: 'Student (KK12 resident)',
    title: 'EzSafe student app',
    org: 'Universiti Malaya',
    landing: '/app/student',
    summary: 'SOS, Friend Walk, safety timer, confidential report, alerts.',
    video: false,
  },
  {
    id: 'officer',
    workspace: 'app',
    name: 'Kpl. Hafiz Rahman (PB-01)',
    title: 'EzPatrol officer app',
    org: 'Polis Bantuan UM',
    landing: '/app/patrol',
    summary: 'Dispatch, guard tour, incident report and shift log.',
    video: true,
  },
];

export const personaById = (id: PersonaId) =>
  personas.find((p) => p.id === id)!;

export const defaultPersona: Record<Workspace, PersonaId> = {
  um: 'chief',
  kpt: 'kpt',
  app: 'student',
};
