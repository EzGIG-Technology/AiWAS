'use client';
import {
  LayoutDashboard,
  Building2,
  GitCompareArrows,
  Globe2,
  BedDouble,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona } from '../../_data/personas';
import {
  NationalOverview,
  UniversitiesView,
  GapsView,
  BenchmarksView,
  HostelsView,
  GovernanceView,
  KptReportsView,
} from './views';

export type KptView =
  | 'overview'
  | 'universities'
  | 'gaps'
  | 'benchmarks'
  | 'hostels'
  | 'governance'
  | 'reports';

export const kptTitles: Record<KptView, string> = {
  overview: 'Smart-campus overview',
  universities: 'Universities',
  gaps: 'Capability gap',
  benchmarks: 'Global benchmarks',
  hostels: 'Hostel integrity pilots',
  governance: 'Privacy & PDPA',
  reports: 'Reports',
};

export function KptWorkspace({
  persona,
  view,
  sub,
}: {
  persona: Persona;
  view?: string;
  sub?: string;
}) {
  const active = (view && view in kptTitles ? view : 'overview') as KptView;
  const groups: NavGroup[] = [
    {
      label: 'Audit',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'universities', label: 'Universities', icon: Building2 },
        { id: 'gaps', label: 'Capability gap', icon: GitCompareArrows },
        { id: 'benchmarks', label: 'Global benchmarks', icon: Globe2 },
      ],
    },
    {
      label: 'Pilots & policy',
      items: [
        { id: 'hostels', label: 'Hostel integrity pilots', icon: BedDouble },
        { id: 'governance', label: 'Privacy & PDPA', icon: ShieldCheck },
      ],
    },
    {
      label: 'Output',
      items: [{ id: 'reports', label: 'Reports', icon: FileDown }],
    },
  ];
  const views: Record<KptView, () => React.ReactNode> = {
    overview: () => <NationalOverview />,
    universities: () => <UniversitiesView focus={sub} />,
    gaps: () => <GapsView />,
    benchmarks: () => <BenchmarksView />,
    hostels: () => <HostelsView />,
    governance: () => <GovernanceView />,
    reports: () => <KptReportsView />,
  };
  return (
    <WorkspaceShell
      org={{
        id: 'kpt',
        acronym: 'KPT',
        name: 'Kementerian Pendidikan Tinggi',
        sub: 'Smart Campus Oversight',
      }}
      base="/kpt"
      groups={groups}
      active={active}
      title={kptTitles[active]}
      persona={persona}
    >
      {views[active]()}
    </WorkspaceShell>
  );
}
