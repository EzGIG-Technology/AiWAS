/**
 * Demo sign-in personas. Names are fictional. Selecting one previews that
 * role's workspace; no credentials are collected or checked.
 */
export type Workspace = 'um' | 'kpt' | 'app';
export type PersonaId =
  | 'director'
  | 'operator'
  | 'facilities'
  | 'dpo'
  | 'kpt'
  | 'mobile';

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
    id: 'director',
    workspace: 'um',
    name: 'Supt. (PB) Zulkifli Hassan',
    title: 'Director, Security Technology',
    org: 'Bahagian Keselamatan UM',
    landing: '/um/overview',
    summary:
      'Every camera, detection, count and report, and the analytics configuration.',
    video: true,
  },
  {
    id: 'operator',
    workspace: 'um',
    name: 'Aina Sofea',
    title: 'Video Analytics Operator',
    org: 'Pusat Kawalan Keselamatan UM',
    landing: '/um/events',
    summary:
      'Verifies AI detections, watches the video wall and searches recorded footage.',
    video: true,
  },
  {
    id: 'facilities',
    workspace: 'um',
    name: 'Ir. Salmah Yusof',
    title: 'Facilities & Space Planning',
    org: 'Jabatan Pembangunan & Penyenggaraan Harta',
    landing: '/um/occupancy',
    summary:
      'Anonymous occupancy, footfall, parking and crowd counts. No footage.',
    video: false,
  },
  {
    id: 'dpo',
    workspace: 'um',
    name: 'Gerald Wong',
    title: 'Data Protection Officer',
    org: 'Universiti Malaya',
    landing: '/um/privacy',
    summary: 'Footage requests, search and viewing audit, retention and DPIAs.',
    video: false,
  },
  {
    id: 'kpt',
    workspace: 'kpt',
    name: 'Pn. Rozita Abdullah',
    title: 'Campus Technology Oversight Officer',
    org: 'Jabatan Pendidikan Tinggi, KPT',
    landing: '/kpt/overview',
    summary:
      'Camera estate, analytics adoption, detection trends and privacy governance. Aggregates only.',
    video: false,
  },
  {
    id: 'mobile',
    workspace: 'app',
    name: 'Kpl. Hafiz Rahman',
    title: 'EzVision Mobile',
    org: 'Polis Bantuan UM',
    landing: '/app/mobile',
    summary:
      'Camera alerts on the phone: live view, verify, bookmark, camera health.',
    video: true,
  },
];

export const personaById = (id: PersonaId) =>
  personas.find((p) => p.id === id)!;

export const defaultPersona: Record<Workspace, PersonaId> = {
  um: 'director',
  kpt: 'kpt',
  app: 'mobile',
};
