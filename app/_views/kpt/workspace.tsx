'use client';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Video,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona } from '../../_data/personas';
import {
  NationalOverview,
  UniversitiesView,
  DetectionsView,
  CoverageView,
  GovernanceView,
  KptReportsView,
} from './views';

export type KptView =
  | 'overview'
  | 'universities'
  | 'detections'
  | 'coverage'
  | 'governance'
  | 'reports';

export const kptTitles: Record<KptView, string> = {
  overview: 'National overview',
  universities: 'Universities',
  detections: 'Detection trends',
  coverage: 'CCTV coverage & uptime',
  governance: 'Privacy & AI governance',
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
      label: 'Oversight',
      items: [
        { id: 'overview', label: 'National overview', icon: LayoutDashboard },
        { id: 'universities', label: 'Universities', icon: Building2 },
      ],
    },
    {
      label: 'Analysis',
      items: [
        { id: 'detections', label: 'Detection trends', icon: TrendingUp },
        { id: 'coverage', label: 'CCTV coverage & uptime', icon: Video },
        {
          id: 'governance',
          label: 'Privacy & AI governance',
          icon: ShieldCheck,
        },
      ],
    },
    {
      label: 'Output',
      items: [{ id: 'reports', label: 'Reports', icon: FileDown }],
    },
  ];
  const views: Record<KptView, React.ReactNode> = {
    overview: <NationalOverview />,
    universities: <UniversitiesView focus={sub} />,
    detections: <DetectionsView />,
    coverage: <CoverageView />,
    governance: <GovernanceView />,
    reports: <KptReportsView />,
  };
  return (
    <WorkspaceShell
      org={{
        id: 'kpt',
        acronym: 'KPT',
        name: 'Kementerian Pendidikan Tinggi',
        sub: 'Campus Camera Intelligence',
      }}
      base="/kpt"
      groups={groups}
      active={active}
      title={kptTitles[active]}
      persona={persona}
    >
      {views[active]}
    </WorkspaceShell>
  );
}
