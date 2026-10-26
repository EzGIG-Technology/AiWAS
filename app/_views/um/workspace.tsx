'use client';
import {
  LayoutDashboard,
  Siren,
  MonitorPlay,
  Map,
  LifeBuoy,
  Footprints,
  BedDouble,
  CarFront,
  CalendarDays,
  Megaphone,
  HeartHandshake,
  FileBarChart,
  ScanEye,
  ShieldCheck,
  Server,
  Users,
  Smartphone,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona, PersonaId } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import {
  Overview,
  IncidentsView,
  VideoWall,
  MapView,
  SosView,
  PatrolView,
} from './operations';
import {
  CollegesView,
  VisitorsView,
  EventsView,
  EmergencyView,
} from './campus';
import { WelfareView, ReportsView } from './insight';
import { AnalyticsView, PrivacyView, DevicesView, UsersView } from './govern';
import { AppsShowcase } from '../apps/workspace';

export type UmView =
  | 'overview'
  | 'incidents'
  | 'wall'
  | 'map'
  | 'sos'
  | 'patrol'
  | 'colleges'
  | 'visitors'
  | 'events'
  | 'emergency'
  | 'welfare'
  | 'reports'
  | 'analytics'
  | 'privacy'
  | 'devices'
  | 'users'
  | 'apps';

export const umTitles: Record<UmView, string> = {
  overview: 'Command overview',
  incidents: 'Alarm queue & incidents',
  wall: 'Video wall',
  map: 'Campus map',
  sos: 'SOS & safe walks',
  patrol: 'Patrol & dispatch',
  colleges: 'Residential colleges',
  visitors: 'Visitors & vehicles',
  events: 'Events',
  emergency: 'Emergency & mass notification',
  welfare: 'Student welfare',
  reports: 'Reports & KPT inspection',
  analytics: 'AI analytics & exclusions',
  privacy: 'Privacy centre',
  devices: 'Devices & health',
  users: 'Users & roles',
  apps: 'Mobile apps',
};

/** Which views each role may open. Roles without video never get the wall. */
export const umAccess: Record<
  Exclude<PersonaId, 'kpt' | 'student' | 'officer'>,
  UmView[]
> = {
  chief: Object.keys(umTitles) as UmView[],
  soc: [
    'overview',
    'incidents',
    'wall',
    'map',
    'sos',
    'patrol',
    'colleges',
    'visitors',
    'events',
    'emergency',
    'devices',
    'apps',
  ],
  pengetua: ['colleges', 'incidents', 'visitors', 'emergency', 'apps'],
  hepa: ['welfare', 'reports', 'colleges', 'events', 'emergency'],
  dpo: ['privacy', 'analytics', 'reports', 'users', 'devices'],
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
    umAccess[persona.id as keyof typeof umAccess] ?? umAccess.chief;
  const active = (
    allowed.includes(view as UmView) ? view : allowed[0]
  ) as UmView;
  const openAlarms = state.incidents.filter((i) =>
    ['New', 'Acknowledged'].includes(i.status),
  ).length;
  const sos = state.sessions.filter((s) => s.kind === 'SOS').length;

  const groups: NavGroup[] = [
    {
      label: 'Operate',
      items: [
        { id: 'overview', label: 'Command overview', icon: LayoutDashboard },
        {
          id: 'incidents',
          label: 'Alarm queue',
          icon: Siren,
          badge: openAlarms,
        },
        { id: 'wall', label: 'Video wall', icon: MonitorPlay },
        { id: 'map', label: 'Campus map', icon: Map },
        { id: 'sos', label: 'SOS & safe walks', icon: LifeBuoy, badge: sos },
        { id: 'patrol', label: 'Patrol & dispatch', icon: Footprints },
      ],
    },
    {
      label: 'Campus',
      items: [
        {
          id: 'colleges',
          label:
            persona.id === 'pengetua'
              ? 'My college · KK12'
              : 'Residential colleges',
          icon: BedDouble,
        },
        { id: 'visitors', label: 'Visitors & vehicles', icon: CarFront },
        { id: 'events', label: 'Events', icon: CalendarDays },
        { id: 'emergency', label: 'Emergency & alerts', icon: Megaphone },
      ],
    },
    {
      label: 'Insight',
      items: [
        { id: 'welfare', label: 'Student welfare', icon: HeartHandshake },
        {
          id: 'reports',
          label: 'Reports & KPT inspection',
          icon: FileBarChart,
        },
      ],
    },
    {
      label: 'Govern',
      items: [
        { id: 'analytics', label: 'AI analytics', icon: ScanEye },
        { id: 'privacy', label: 'Privacy centre', icon: ShieldCheck },
        { id: 'devices', label: 'Devices & health', icon: Server },
        { id: 'users', label: 'Users & roles', icon: Users },
      ],
    },
    {
      label: 'Apps',
      items: [{ id: 'apps', label: 'EzSafe & EzPatrol', icon: Smartphone }],
    },
  ]
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => allowed.includes(i.id as UmView)),
    }))
    .filter((g) => g.items.length);

  const views: Record<UmView, React.ReactNode> = {
    overview: <Overview persona={persona} />,
    incidents: <IncidentsView persona={persona} focus={sub} />,
    wall: <VideoWall />,
    map: <MapView persona={persona} />,
    sos: <SosView persona={persona} />,
    patrol: <PatrolView persona={persona} />,
    colleges: <CollegesView persona={persona} />,
    visitors: <VisitorsView persona={persona} />,
    events: <EventsView persona={persona} />,
    emergency: <EmergencyView persona={persona} />,
    welfare: <WelfareView />,
    reports: <ReportsView persona={persona} />,
    analytics: <AnalyticsView persona={persona} />,
    privacy: <PrivacyView persona={persona} />,
    devices: <DevicesView persona={persona} />,
    users: <UsersView />,
    apps: <AppsShowcase />,
  };

  return (
    <WorkspaceShell
      org={{
        id: 'um',
        acronym: 'UM',
        name: 'Universiti Malaya',
        sub: 'Campus Safety Operations',
      }}
      base="/um"
      groups={groups}
      active={active}
      title={umTitles[active]}
      persona={persona}
    >
      {views[active]}
    </WorkspaceShell>
  );
}
