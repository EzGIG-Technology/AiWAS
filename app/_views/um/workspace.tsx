'use client';
import {
  LayoutDashboard,
  ScanEye,
  MonitorPlay,
  Map,
  Search,
  Users,
  CarFront,
  UsersRound,
  FileBarChart,
  SlidersHorizontal,
  ShieldCheck,
  Server,
  UserCog,
  Smartphone,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona, PersonaId } from '../../_data/personas';
import { isOpenEvent } from '../../_data/um';
import { useDemo } from '../../_lib/store';
import { Overview, EventsView, VideoWall, MapView } from './operations';
import {
  OccupancyView,
  VehiclesView,
  CrowdView,
  SearchView,
  ReportsView,
} from './insight';
import { AnalyticsView, PrivacyView, DevicesView, UsersView } from './govern';
import { MobileShowcase } from '../apps/workspace';

export type UmView =
  | 'overview'
  | 'events'
  | 'wall'
  | 'map'
  | 'search'
  | 'occupancy'
  | 'vehicles'
  | 'crowd'
  | 'reports'
  | 'analytics'
  | 'devices'
  | 'privacy'
  | 'users'
  | 'mobile';

export const umTitles: Record<UmView, string> = {
  overview: 'Overview',
  events: 'AI detections',
  wall: 'Video wall',
  map: 'Camera map',
  search: 'Footage search',
  occupancy: 'Occupancy & footfall',
  vehicles: 'Vehicles & parking',
  crowd: 'Crowd analytics',
  reports: 'Reports',
  analytics: 'AI analytics & exclusions',
  devices: 'Cameras & edge health',
  privacy: 'Privacy centre',
  users: 'Users & roles',
  mobile: 'EzVision Mobile',
};

/** Which views each role may open. Roles without video never get the wall. */
export const umAccess: Record<
  Exclude<PersonaId, 'kpt' | 'mobile'>,
  UmView[]
> = {
  director: Object.keys(umTitles) as UmView[],
  operator: [
    'overview',
    'events',
    'wall',
    'map',
    'search',
    'crowd',
    'vehicles',
    'devices',
    'mobile',
  ],
  facilities: ['occupancy', 'vehicles', 'crowd', 'reports', 'devices'],
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
    umAccess[persona.id as keyof typeof umAccess] ?? umAccess.director;
  const active = (
    allowed.includes(view as UmView) ? view : allowed[0]
  ) as UmView;
  const awaiting = state.events.filter((e) => e.status === 'New').length;
  const open = state.events.filter(isOpenEvent).length;

  const groups: NavGroup[] = [
    {
      label: 'Monitor',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        {
          id: 'events',
          label: 'AI detections',
          icon: ScanEye,
          badge: awaiting || open,
        },
        { id: 'wall', label: 'Video wall', icon: MonitorPlay },
        { id: 'map', label: 'Camera map', icon: Map },
        { id: 'search', label: 'Footage search', icon: Search },
      ],
    },
    {
      label: 'Insight',
      items: [
        { id: 'occupancy', label: 'Occupancy & footfall', icon: Users },
        { id: 'vehicles', label: 'Vehicles & parking', icon: CarFront },
        { id: 'crowd', label: 'Crowd analytics', icon: UsersRound },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
      ],
    },
    {
      label: 'Configure',
      items: [
        { id: 'analytics', label: 'AI analytics', icon: SlidersHorizontal },
        { id: 'devices', label: 'Cameras & edge health', icon: Server },
        { id: 'privacy', label: 'Privacy centre', icon: ShieldCheck },
        { id: 'users', label: 'Users & roles', icon: UserCog },
      ],
    },
    {
      label: 'Apps',
      items: [{ id: 'mobile', label: 'EzVision Mobile', icon: Smartphone }],
    },
  ]
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => allowed.includes(i.id as UmView)),
    }))
    .filter((g) => g.items.length);

  const views: Record<UmView, React.ReactNode> = {
    overview: <Overview persona={persona} />,
    events: <EventsView persona={persona} focus={sub} />,
    wall: <VideoWall />,
    map: <MapView persona={persona} />,
    search: <SearchView persona={persona} />,
    occupancy: <OccupancyView persona={persona} />,
    vehicles: <VehiclesView persona={persona} />,
    crowd: <CrowdView persona={persona} />,
    reports: <ReportsView persona={persona} />,
    analytics: <AnalyticsView persona={persona} />,
    devices: <DevicesView persona={persona} />,
    privacy: <PrivacyView persona={persona} />,
    users: <UsersView />,
    mobile: <MobileShowcase />,
  };

  return (
    <WorkspaceShell
      org={{
        id: 'um',
        acronym: 'UM',
        name: 'Universiti Malaya',
        sub: 'Camera Intelligence',
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
