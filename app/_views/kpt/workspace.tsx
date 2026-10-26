'use client';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  ClipboardCheck,
  TriangleAlert,
  BedDouble,
  CloudRain,
  FileDown,
} from 'lucide-react';
import { WorkspaceShell, type NavGroup } from '../../_components/shell';
import type { Persona } from '../../_data/personas';
import { escalations } from '../../_data/kpt';
import {
  NationalOverview,
  UniversitiesView,
  TrendsView,
  ComplianceView,
  EscalationsView,
  ResidentialView,
  ReadinessView,
  KptReportsView,
} from './views';

export type KptView =
  | 'overview'
  | 'universities'
  | 'trends'
  | 'compliance'
  | 'escalations'
  | 'residential'
  | 'readiness'
  | 'reports';

export const kptTitles: Record<KptView, string> = {
  overview: 'National overview',
  universities: 'Universities',
  trends: 'Incident trends',
  compliance: 'Inspection & compliance',
  escalations: 'Escalations',
  residential: 'Residential & welfare',
  readiness: 'Disaster & event readiness',
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
  const open = escalations.filter((e) => e.status !== 'Closed').length;
  const groups: NavGroup[] = [
    {
      label: 'Oversight',
      items: [
        { id: 'overview', label: 'National overview', icon: LayoutDashboard },
        { id: 'universities', label: 'Universities', icon: Building2 },
        {
          id: 'escalations',
          label: 'Escalations',
          icon: TriangleAlert,
          badge: open,
        },
      ],
    },
    {
      label: 'Analysis',
      items: [
        { id: 'trends', label: 'Incident trends', icon: TrendingUp },
        {
          id: 'compliance',
          label: 'Inspection & compliance',
          icon: ClipboardCheck,
        },
        { id: 'residential', label: 'Residential & welfare', icon: BedDouble },
        { id: 'readiness', label: 'Disaster & events', icon: CloudRain },
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
    trends: <TrendsView />,
    compliance: <ComplianceView />,
    escalations: <EscalationsView />,
    residential: <ResidentialView />,
    readiness: <ReadinessView />,
    reports: <KptReportsView />,
  };
  return (
    <WorkspaceShell
      org={{
        id: 'kpt',
        acronym: 'KPT',
        name: 'Kementerian Pendidikan Tinggi',
        sub: 'Campus Safety Oversight',
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
