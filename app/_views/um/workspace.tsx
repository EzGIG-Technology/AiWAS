'use client';
import {
  Activity,
  BedDouble,
  BellRing,
  Boxes,
  Building2,
  CarFront,
  FileBarChart,
  FolderOpen,
  HardHat,
  HeartHandshake,
  MonitorDot,
  MonitorPlay,
  Rocket,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Workflow,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona, PersonaId } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { alertsFor } from '../../_lib/scope';
import { ConsoleView, AlertsView, VideoWall } from './console';
import { SearchView, CasesView } from './investigate';
import {
  ModulesOverview,
  HostelView,
  SafeView,
  MobilityView,
  WelfareView,
  HseView,
  SpaceView,
} from './modules';
import { RulesStudio } from './studio';
import { HealthView, ReportsView, AdminView, RolloutView } from './govern';
import { WardenShowcase } from '../apps/workspace';

export type UmView =
  | 'console'
  | 'alerts'
  | 'wall'
  | 'search'
  | 'cases'
  | 'modules'
  | 'hostel'
  | 'safe'
  | 'mobility'
  | 'welfare'
  | 'hse'
  | 'space'
  | 'rules'
  | 'health'
  | 'reports'
  | 'admin'
  | 'rollout'
  | 'warden';

export const umTitles: Record<UmView, string> = {
  console: 'Command centre',
  alerts: 'Alerts',
  wall: 'Video wall',
  search: 'Search & investigation',
  cases: 'Cases',
  modules: 'Modules',
  hostel: 'Hostel dashboard',
  safe: 'Safe Campus',
  mobility: 'Mobility',
  welfare: 'Welfare',
  hse: 'HSE',
  space: 'Space & Admin',
  rules: 'Rules studio',
  health: 'Camera health',
  reports: 'Reports',
  admin: 'Admin & privacy',
  rollout: 'Pilot & rollout',
  warden: 'Warden app',
};

/**
 * Which screens each role may open, following the spec's role table. Roles
 * without video (Pengetua, HEP, counsellor, DPO) never get the wall, search
 * or the console.
 */
export const umAccess: Record<
  Exclude<PersonaId, 'kpt' | 'warden'>,
  UmView[]
> = {
  director: Object.keys(umTitles) as UmView[],
  operator: [
    'console',
    'alerts',
    'wall',
    'search',
    'cases',
    'modules',
    'hostel',
    'safe',
    'health',
    'reports',
    'warden',
  ],
  pengetua: ['hostel', 'rules', 'reports'],
  hep: ['cases', 'reports'],
  counsellor: ['welfare'],
  facilities: ['hse', 'space', 'alerts', 'health', 'reports'],
  traffic: ['mobility', 'alerts', 'search', 'reports'],
  dpo: ['admin', 'reports'],
  sysadmin: ['health', 'admin', 'rules', 'modules', 'rollout'],
};

export function UmWorkspace({
  persona,
  view,
  sub,
}: {
  persona: Persona;
  view?: string;
  sub?: string;
}) {
  const { state } = useDemo();
  const allowed =
    umAccess[persona.id as keyof typeof umAccess] ?? umAccess.director;
  const active = (
    allowed.includes(view as UmView) ? view : allowed[0]
  ) as UmView;
  const fresh = alertsFor(persona, state.alerts).filter(
    (a) => a.status === 'New',
  ).length;

  const groups: NavGroup[] = [
    {
      label: 'Command centre',
      items: [
        { id: 'console', label: 'Console', icon: MonitorDot },
        {
          id: 'alerts',
          label: 'Alerts',
          icon: BellRing,
          badge: fresh || undefined,
        },
        { id: 'wall', label: 'Video wall', icon: MonitorPlay },
        { id: 'search', label: 'Search & investigation', icon: Search },
        {
          id: 'cases',
          label: persona.id === 'hep' ? 'Confirmed cases' : 'Cases',
          icon: FolderOpen,
        },
      ],
    },
    {
      label: 'Modules',
      items: [
        { id: 'modules', label: 'All modules', icon: Boxes },
        { id: 'hostel', label: 'Hostel Integrity', icon: BedDouble },
        { id: 'safe', label: 'Safe Campus', icon: Shield },
        { id: 'mobility', label: 'Mobility', icon: CarFront },
        {
          id: 'welfare',
          label: persona.id === 'counsellor' ? 'Wellbeing alerts' : 'Welfare',
          icon: HeartHandshake,
        },
        { id: 'hse', label: 'HSE', icon: HardHat },
        { id: 'space', label: 'Space & Admin', icon: Building2 },
      ],
    },
    {
      label: 'Platform',
      items: [
        { id: 'rules', label: 'Rules studio', icon: Workflow },
        { id: 'health', label: 'Camera health', icon: Activity },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
        { id: 'admin', label: 'Admin & privacy', icon: ShieldCheck },
        { id: 'rollout', label: 'Pilot & rollout', icon: Rocket },
      ],
    },
    {
      label: 'Apps',
      items: [{ id: 'warden', label: 'Warden app', icon: Smartphone }],
    },
  ]
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => allowed.includes(i.id as UmView)),
    }))
    .filter((g) => g.items.length);

  const views: Record<UmView, () => React.ReactNode> = {
    console: () => <ConsoleView persona={persona} />,
    alerts: () => <AlertsView persona={persona} focus={sub} />,
    wall: () => <VideoWall persona={persona} />,
    search: () => <SearchView persona={persona} />,
    cases: () => <CasesView persona={persona} focus={sub} />,
    modules: () => <ModulesOverview persona={persona} />,
    hostel: () => <HostelView persona={persona} />,
    safe: () => <SafeView persona={persona} />,
    mobility: () => <MobilityView persona={persona} />,
    welfare: () => <WelfareView persona={persona} />,
    hse: () => <HseView persona={persona} />,
    space: () => <SpaceView persona={persona} />,
    rules: () => <RulesStudio persona={persona} focus={sub} />,
    health: () => <HealthView persona={persona} />,
    reports: () => <ReportsView persona={persona} />,
    admin: () => <AdminView persona={persona} />,
    rollout: () => <RolloutView />,
    warden: () => <WardenShowcase />,
  };

  return (
    <WorkspaceShell
      org={{
        id: 'um',
        acronym: 'UM',
        name: 'Universiti Malaya',
        sub: 'EzVision Campus',
      }}
      base="/um"
      groups={groups}
      active={active}
      title={umTitles[active]}
      persona={persona}
    >
      {views[active]()}
    </WorkspaceShell>
  );
}
