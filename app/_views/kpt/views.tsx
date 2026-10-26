'use client';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Building2,
  Users,
  Video,
  TriangleAlert,
  Timer,
  ClipboardCheck,
  ShieldCheck,
  EyeOff,
  Search,
  Download,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Send,
  CloudRain,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { UniversityLogo } from '../../_components/brand';
import { StateTileMap } from '../../_components/state-map';
import {
  PageHeader,
  Stat,
  Pill,
  Meter,
  Note,
  csvDownload,
} from '../../_components/ui-bits';
import {
  institutions,
  institutionById,
  nationalMonthly,
  nationalCategories,
  nationalTotals,
  escalations,
  nationalEvents,
  inspectionItems,
  policyItems,
  privacyItems,
  suppress,
  kptExclusionLine,
  type Institution,
  type StateId,
  type Compliance,
} from '../../_data/kpt';
import { navigate } from '../../_lib/router';
import { notify } from '../../_lib/notify';

function ExclusionBanner() {
  return (
    <Alert className="border-primary/20 bg-accent/50">
      <EyeOff />
      <AlertTitle>Aggregates only</AlertTitle>
      <AlertDescription>
        {kptExclusionLine} Figures are demonstration data, not real statistics.
      </AlertDescription>
    </Alert>
  );
}

const cIcon: Record<Compliance, typeof CheckCircle2> = {
  Met: CheckCircle2,
  'Partly met': CircleDashed,
  'Not met': XCircle,
};
const cTone: Record<Compliance, string> = {
  Met: 'text-success',
  'Partly met': 'text-warning',
  'Not met': 'text-critical',
};
const metCount = (i: Institution) =>
  i.inspection.filter((x) => x === 'Met').length;
const siTone = (si: number): 'success' | 'warning' | 'critical' =>
  si >= 80 ? 'success' : si >= 70 ? 'warning' : 'critical';

const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, '-');
const trendCats = [
  'Accident',
  'Medical',
  'Theft',
  'Flood & weather',
  'Wildlife',
] as const;
const trendConfig: ChartConfig = Object.fromEntries(
  trendCats.map((c, i) => [
    slug(c),
    { label: c, color: `var(--chart-${i + 1})` },
  ]),
);
const trendData = nationalMonthly.map((r) => ({
  month: r.month,
  ...Object.fromEntries(trendCats.map((c) => [slug(c), r[c]])),
}));

// ---------------------------------------------------------------- overview --

export function NationalOverview() {
  const [state, setState] = useState<StateId | null>(null);
  const inState = state ? institutions.filter((i) => i.state === state) : [];
  const inspectionPct = Math.round(
    (institutions.reduce((a, i) => a + metCount(i), 0) /
      (institutions.length * inspectionItems.length)) *
      100,
  );
  const openEsc = escalations.filter((e) => e.status !== 'Closed');
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Jabatan Pendidikan Tinggi · KPT"
        title="National campus safety overview"
        description={`${nationalTotals.publicCount} public universities and ${nationalTotals.privateCount} private universities reporting. Live figures come from campuses on EzVision; the rest file a monthly return.`}
        actions={
          <Button onClick={() => navigate('/kpt/escalations')}>
            <TriangleAlert />
            Escalations ({openEsc.length})
          </Button>
        }
      />
      <ExclusionBanner />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat
          label="Institutions"
          value={nationalTotals.institutions}
          hint={`${nationalTotals.connected} on EzVision`}
          icon={Building2}
        />
        <Stat
          label="Students covered"
          value={`${Math.round(nationalTotals.enrolment / 1000)}k`}
          icon={Users}
          t="info"
        />
        <Stat
          label="Cameras on analytics"
          value={nationalTotals.cameras.toLocaleString()}
          icon={Video}
          t="muted"
        />
        <Stat
          label="Open high-severity"
          value={nationalTotals.openHigh}
          hint="Across all institutions"
          icon={TriangleAlert}
          t="critical"
        />
        <Stat
          label="Median P90 response"
          value={`${nationalTotals.medianP90} min`}
          hint="Target under 8"
          icon={Timer}
          t="warning"
        />
        <Stat
          label="Inspection items met"
          value={`${inspectionPct}%`}
          hint="KPT 2025 directive"
          icon={ClipboardCheck}
          t="success"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>By state</CardTitle>
            <CardDescription>
              Open high-severity incidents. Select a state.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <StateTileMap selected={state} onSelect={setState} />
            {state && (
              <div className="grid gap-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  {state}
                </div>
                {inState.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => navigate(`/kpt/universities/${i.id}`)}
                    className="flex items-center gap-2 rounded-md p-1.5 text-left text-sm hover:bg-muted"
                  >
                    <UniversityLogo
                      id={i.id}
                      acronym={i.acronym}
                      className="size-7"
                    />
                    <span className="min-w-0 flex-1 truncate">{i.name}</span>
                    <Pill t={siTone(i.safetyIndex)}>{i.safetyIndex}</Pill>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>National incident trend</CardTitle>
            <CardDescription>
              Five largest categories, all reporting institutions, last 12
              months
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kpt/trends')}
              >
                All categories <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trendConfig}
              className="aspect-auto h-72 w-full"
            >
              <AreaChart data={trendData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis width={32} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  content={<ChartLegendContent className="flex-wrap" />}
                />
                {trendCats.map((c) => (
                  <Area
                    key={c}
                    dataKey={slug(c)}
                    type="monotone"
                    stackId="1"
                    stroke={`var(--color-${slug(c)})`}
                    fill={`var(--color-${slug(c)})`}
                    fillOpacity={0.35}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs ministry attention</CardTitle>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kpt/escalations')}
              >
                All <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-2">
            {openEsc.map((e) => {
              const inst = institutionById(e.institution)!;
              return (
                <div
                  key={e.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <UniversityLogo id={inst.id} acronym={inst.acronym} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{e.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {inst.name} · opened {e.opened} · next update{' '}
                      {e.nextUpdate}
                    </div>
                  </div>
                  <Pill t={e.severity === 'Critical' ? 'critical' : 'warning'}>
                    {e.status}
                  </Pill>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lowest safety index</CardTitle>
            <CardDescription>
              Composite of inspection, policy and privacy compliance, adjusted
              for flood exposure
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {[...institutions]
              .sort((a, b) => a.safetyIndex - b.safetyIndex)
              .slice(0, 6)
              .map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => navigate(`/kpt/universities/${i.id}`)}
                  className="grid grid-cols-[auto_1fr_3rem] items-center gap-3 rounded-md p-1 text-left hover:bg-muted"
                >
                  <UniversityLogo
                    id={i.id}
                    acronym={i.acronym}
                    className="size-7"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm">{i.name}</div>
                    <Meter
                      value={i.safetyIndex}
                      t={siTone(i.safetyIndex)}
                      className="mt-1"
                    />
                  </div>
                  <span className="tabular text-right text-sm font-semibold">
                    {i.safetyIndex}
                  </span>
                </button>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ universities --

function UniversityProfile({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const i = id ? institutionById(id) : null;
  return (
    <Sheet open={!!i} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-xl">
        {i && (
          <>
            <SheetHeader className="flex-row items-center gap-3 border-b p-4 pr-12">
              <UniversityLogo
                id={i.id}
                acronym={i.acronym}
                className="size-12 text-xs"
              />
              <div className="min-w-0">
                <SheetTitle>{i.name}</SheetTitle>
                <SheetDescription>
                  {i.type} · {i.city}, {i.state} · {i.connection}
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ['Safety index', i.safetyIndex],
                  ['Enrolment', i.enrolment.toLocaleString()],
                  ['Open high-severity', suppress(i.openHigh)],
                  ['Incidents (12 mo)', suppress(i.incidents12m)],
                  [
                    'Per 1,000 students',
                    ((i.incidents12m / i.enrolment) * 1000).toFixed(1),
                  ],
                  ['P50 / P90 response', `${i.p50} / ${i.p90} min`],
                  ['Students housed', `${i.housedPct}%`],
                  ['Flood risk', i.floodRisk],
                  ['Last drill', i.lastDrill],
                ].map(([k, v]) => (
                  <div
                    key={k as string}
                    className="rounded-lg bg-muted/60 p-2.5"
                  >
                    <div className="text-[11px] text-muted-foreground">{k}</div>
                    <div className="tabular text-sm font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Inspection directive
                </div>
                <ul className="grid gap-1.5">
                  {inspectionItems.map((item, n) => {
                    const I = cIcon[i.inspection[n]];
                    return (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <I
                          className={cn(
                            'size-4 shrink-0',
                            cTone[i.inspection[n]],
                          )}
                        />
                        <span className="flex-1">{item}</span>
                        <span className="text-xs text-muted-foreground">
                          {i.inspection[n]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Policies adopted
                  </div>
                  <ul className="grid gap-1 text-sm">
                    {policyItems.map((p, n) => (
                      <li key={p} className="flex items-start gap-2">
                        {i.policies[n] ? (
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                        ) : (
                          <XCircle className="mt-0.5 size-3.5 shrink-0 text-critical" />
                        )}
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Privacy & AI governance
                  </div>
                  <ul className="grid gap-1 text-sm">
                    {privacyItems.map((p, n) => (
                      <li key={p} className="flex items-start gap-2">
                        {i.privacy[n] ? (
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                        ) : (
                          <XCircle className="mt-0.5 size-3.5 shrink-0 text-critical" />
                        )}
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Note>
                The ministry view stops at institution-level category counts.
                Case detail, names and footage stay with the university and are
                shared only through a formal escalation.
              </Note>
              <Button
                onClick={() =>
                  notify.success(
                    `Update requested from ${i.acronym}`,
                    'The university security office receives the request in its EzVision inbox',
                  )
                }
              >
                <Send />
                Request update from {i.acronym}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function UniversitiesView({ focus }: { focus?: string }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [conn, setConn] = useState('all');
  const [open, setOpen] = useState<string | null>(focus ?? null);
  const rows = useMemo(
    () =>
      institutions
        .filter((i) => type === 'all' || i.type === type)
        .filter((i) => conn === 'all' || i.connection === conn)
        .filter(
          (i) =>
            !q ||
            `${i.name} ${i.acronym} ${i.state} ${i.city}`
              .toLowerCase()
              .includes(q.toLowerCase()),
        ),
    [q, type, conn],
  );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Universities"
        description="Every public university and the private universities in this programme, with their safety index, inspection status and response performance."
      />
      <ExclusionBanner />
      <Card>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, acronym or state"
                className="pl-8"
                aria-label="Search universities"
              />
            </div>
            <NativeSelect
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Type"
            >
              <NativeSelectOption value="all">All types</NativeSelectOption>
              <NativeSelectOption>Public (UA)</NativeSelectOption>
              <NativeSelectOption>Private (IPTS)</NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              value={conn}
              onChange={(e) => setConn(e.target.value)}
              aria-label="Data source"
            >
              <NativeSelectOption value="all">
                All data sources
              </NativeSelectOption>
              <NativeSelectOption>EzVision live</NativeSelectOption>
              <NativeSelectOption>EzVision pilot</NativeSelectOption>
              <NativeSelectOption>Manual return</NativeSelectOption>
            </NativeSelect>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead className="hidden lg:table-cell">State</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-right">Safety index</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Inspection
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Open high
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  P90
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() => setOpen(i.id)}
                >
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-3">
                      <UniversityLogo id={i.id} acronym={i.acronym} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(i.id);
                          }}
                        >
                          {i.name}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {i.acronym} · {i.type}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {i.state}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Pill
                      t={
                        i.connection === 'EzVision live'
                          ? 'success'
                          : i.connection === 'EzVision pilot'
                            ? 'info'
                            : 'muted'
                      }
                    >
                      {i.connection}
                    </Pill>
                  </TableCell>
                  <TableCell className="text-right">
                    <Pill t={siTone(i.safetyIndex)}>{i.safetyIndex}</Pill>
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">
                    {metCount(i)}/{inspectionItems.length}
                  </TableCell>
                  <TableCell className="tabular hidden text-right md:table-cell">
                    {suppress(i.openHigh)}
                  </TableCell>
                  <TableCell className="tabular hidden text-right xl:table-cell">
                    {i.p90} min
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UniversityProfile
        id={open}
        onClose={() => {
          setOpen(null);
          if (focus) navigate('/kpt/universities');
        }}
      />
    </div>
  );
}

// ------------------------------------------------------------------ trends --

export function TrendsView() {
  const totals = nationalCategories.map((c) => ({
    category: c,
    total: nationalMonthly.reduce((a, r) => a + (r[c] as number), 0),
    last: nationalMonthly.at(-1)![c] as number,
    prev: nationalMonthly.at(-2)![c] as number,
  }));
  const byType = (['Public (UA)', 'Private (IPTS)'] as const).map((t) => {
    const list = institutions.filter((i) => i.type === t);
    const inc = list.reduce((a, i) => a + i.incidents12m, 0);
    const enr = list.reduce((a, i) => a + i.enrolment, 0);
    return { t, inc, per: ((inc / enr) * 1000).toFixed(1) };
  });
  const catConfig = {
    total: { label: 'Incidents (12 months)', color: 'var(--chart-1)' },
  } satisfies ChartConfig;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Incident trends"
        description="Twelve months of incidents reported by universities, by category. Flood and weather rise with the east-coast monsoon; theft and medical cases follow the semester."
      />
      <ExclusionBanner />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>By category, 12 months</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={catConfig}
              className="aspect-auto h-80 w-full"
            >
              <BarChart
                data={[...totals].sort((a, b) => b.total - a.total)}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={104}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Month on month</CardTitle>
            <CardDescription>October against September</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Oct</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {totals.map((t) => {
                  const d = t.last - t.prev;
                  return (
                    <TableRow key={t.category}>
                      <TableCell>{t.category}</TableCell>
                      <TableCell className="tabular text-right">
                        {t.last}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'tabular text-right',
                          d > 0
                            ? 'text-critical'
                            : d < 0
                              ? 'text-success'
                              : 'text-muted-foreground',
                        )}
                      >
                        {d > 0 ? `+${d}` : d}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {byType.map((b) => (
          <Stat
            key={b.t}
            label={`${b.t}: incidents per 1,000 students`}
            value={b.per}
            hint={`${b.inc.toLocaleString()} incidents in 12 months`}
            icon={Building2}
          />
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- compliance --

export function ComplianceView() {
  const pct = (arr: boolean[][], n: number) =>
    Math.round((arr.filter((a) => a[n]).length / arr.length) * 100);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Inspection & compliance"
        description="KPT's 2025 campus and residence safety-inspection directive, the student-safety policies each university has adopted, and PDPA and AI-governance readiness."
      />
      <ExclusionBanner />
      <Card>
        <CardHeader>
          <CardTitle>Inspection directive by university</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card p-2 text-left font-medium text-muted-foreground">
                  Institution
                </th>
                {inspectionItems.map((it) => (
                  <th
                    key={it}
                    className="p-2 text-center align-bottom font-medium text-muted-foreground"
                  >
                    <span className="block w-20">{it}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {institutions.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="sticky left-0 bg-card p-2 font-medium">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => navigate(`/kpt/universities/${i.id}`)}
                    >
                      {i.acronym}
                    </button>
                  </td>
                  {i.inspection.map((c, n) => {
                    const I = cIcon[c];
                    return (
                      <td
                        key={n}
                        className="p-2 text-center"
                        title={`${inspectionItems[n]}: ${c}`}
                      >
                        <I
                          className={cn('mx-auto size-4', cTone[c])}
                          aria-label={c}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Policy adoption</CardTitle>
            <CardDescription>
              Share of institutions with each policy in force
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {policyItems.map((p, n) => {
              const v = pct(
                institutions.map((i) => i.policies),
                n,
              );
              return (
                <div key={p} className="grid gap-1">
                  <div className="flex justify-between text-sm">
                    <span>{p}</span>
                    <span className="tabular text-muted-foreground">{v}%</span>
                  </div>
                  <Meter value={v} t={v >= 85 ? 'success' : 'warning'} />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Privacy & AI governance</CardTitle>
            <CardDescription>
              PDPA 2024 amendments and MOSTI’s AI governance guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {privacyItems.map((p, n) => {
              const v = pct(
                institutions.map((i) => i.privacy),
                n,
              );
              return (
                <div key={p} className="grid gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      {p === 'Facial recognition disabled' && (
                        <ShieldCheck className="size-3.5 text-primary" />
                      )}
                      {p}
                    </span>
                    <span className="tabular text-muted-foreground">{v}%</span>
                  </div>
                  <Meter value={v} t={v >= 85 ? 'success' : 'warning'} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------------------------------------- escalations --

export function EscalationsView() {
  const [status, setStatus] = useState<Record<string, string>>({});
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Escalations"
        description="Events a university has escalated to the ministry: deaths and serious injuries, bomb threats, disasters, data breaches. Each carries an owner and the time of the next update."
      />
      <ExclusionBanner />
      <div className="grid gap-3 lg:grid-cols-2">
        {escalations.map((e) => {
          const inst = institutionById(e.institution)!;
          const s = status[e.id] ?? e.status;
          return (
            <Card key={e.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <UniversityLogo
                    id={inst.id}
                    acronym={inst.acronym}
                    className="size-10"
                  />
                  <div className="min-w-0">
                    <CardTitle>{e.type}</CardTitle>
                    <CardDescription>
                      {inst.name} · {e.id}
                    </CardDescription>
                  </div>
                </div>
                <CardAction>
                  <Pill
                    t={
                      s === 'Closed'
                        ? 'muted'
                        : e.severity === 'Critical'
                          ? 'critical'
                          : 'warning'
                    }
                  >
                    {s}
                  </Pill>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm">{e.summary}</p>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Opened</dt>
                  <dd>{e.opened}</dd>
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd>{e.owner}</dd>
                  <dt className="text-muted-foreground">Next update</dt>
                  <dd>{e.nextUpdate}</dd>
                </dl>
                {s !== 'Closed' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setStatus((x) => ({ ...x, [e.id]: 'Monitoring' }));
                        notify.info('Acknowledged by KPT', e.id);
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        notify.success(
                          `Update requested from ${inst.acronym}`,
                          e.id,
                        )
                      }
                    >
                      <Send />
                      Request update
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setStatus((x) => ({ ...x, [e.id]: 'Closed' }));
                        notify.success('Escalation closed', e.id);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------- residential --

export function ResidentialView() {
  const data = [...institutions]
    .filter((i) => i.type === 'Public (UA)')
    .sort((a, b) => b.housedPct - a.housedPct)
    .map((i) => ({
      acronym: i.acronym,
      housed: i.housedPct,
      met: i.housedPct >= 70 ? i.housedPct : 0,
      below: i.housedPct < 70 ? i.housedPct : 0,
    }));
  const config = {
    met: { label: 'At or above target (%)', color: 'var(--chart-1)' },
    below: { label: 'Below target (%)', color: 'var(--warning)' },
  } satisfies ChartConfig;
  const meeting = data.filter((d) => d.housed >= 70).length;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Residential & welfare"
        description="Residential capacity against the target of housing at least 70% of full-time undergraduates by 2035, and counselling referrals per 1,000 students."
      />
      <ExclusionBanner />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat
          label="Public universities at 70% or more"
          value={`${meeting}/${data.length}`}
          icon={Building2}
          t="success"
        />
        <Stat
          label="Counselling referrals per 1,000"
          value={(
            institutions.reduce((a, i) => a + i.counsellingPer1000, 0) /
            institutions.length
          ).toFixed(2)}
          hint="Mean across institutions"
          icon={Users}
          t="info"
        />
        <Stat
          label="Escalated welfare events (30 d)"
          value="<5"
          hint="Suppressed below 5"
          icon={TriangleAlert}
          t="muted"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Students housed, public universities</CardTitle>
          <CardDescription>Dashed line: 70% target for 2035</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart data={data} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="acronym"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
                fontSize={10}
              />
              <YAxis
                width={28}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={70}
                stroke="var(--foreground)"
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="met"
                stackId="h"
                fill="var(--color-met)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="below"
                stackId="h"
                fill="var(--color-below)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// --------------------------------------------------------------- readiness --

export function ReadinessView() {
  const flood = institutions
    .filter((i) => i.floodRisk !== 'Low')
    .sort(
      (a, b) =>
        (a.floodRisk === 'High' ? -1 : 1) - (b.floodRisk === 'High' ? -1 : 1),
    );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Disaster & event readiness"
        description="Flood-exposed campuses ahead of the November–March monsoon, and high-risk events such as convocations, inter-varsity games and examinations."
      />
      <ExclusionBanner />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="size-4 text-info" />
              Flood exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    BCP plan
                  </TableHead>
                  <TableHead className="text-right">Last drill</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flood.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-2">
                        <UniversityLogo
                          id={i.id}
                          acronym={i.acronym}
                          className="size-7"
                        />
                        {i.acronym}
                        <span className="hidden text-muted-foreground md:inline">
                          · {i.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Pill t={i.floodRisk === 'High' ? 'critical' : 'warning'}>
                        {i.floodRisk}
                      </Pill>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {i.policies[6] ? (
                        'In force'
                      ) : (
                        <span className="text-critical">Missing</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {i.lastDrill}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              High-risk events
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {nationalEvents.map((e) => {
              const inst = institutionById(e.institution)!;
              return (
                <div
                  key={e.name}
                  className="grid grid-cols-[auto_1fr] items-center gap-3"
                >
                  <UniversityLogo
                    id={inst.id}
                    acronym={inst.acronym}
                    className="size-8"
                  />
                  <div className="min-w-0">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{e.name}</span>
                      <span className="tabular shrink-0 text-muted-foreground">
                        {e.readiness}%
                      </span>
                    </div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      {e.when} · {e.risk}
                    </div>
                    <Meter
                      value={e.readiness}
                      t={
                        e.readiness >= 70
                          ? 'success'
                          : e.readiness >= 50
                            ? 'warning'
                            : 'critical'
                      }
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- reports --

export function KptReportsView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Reports"
        description="National exports for ministry briefings and parliamentary replies. Every export is aggregate, with counts below 5 suppressed."
      />
      <ExclusionBanner />
      <div className="grid gap-3 md:grid-cols-3">
        {[
          {
            title: 'Institution summary (CSV)',
            desc: 'Safety index, inspection status, response times and suppressed incident counts per institution.',
            run: () =>
              csvDownload('kpt-institution-summary.csv', [
                [
                  'acronym',
                  'name',
                  'type',
                  'state',
                  'data_source',
                  'safety_index',
                  'inspection_met',
                  'open_high',
                  'incidents_12m',
                  'p90_min',
                ],
                ...institutions.map((i) => [
                  i.acronym,
                  i.name,
                  i.type,
                  i.state,
                  i.connection,
                  i.safetyIndex,
                  metCount(i),
                  suppress(i.openHigh),
                  suppress(i.incidents12m),
                  i.p90,
                ]),
              ]),
          },
          {
            title: 'National monthly trend (CSV)',
            desc: 'Twelve months by category across all reporting institutions.',
            run: () =>
              csvDownload('kpt-national-monthly.csv', [
                ['month', ...nationalCategories],
                ...nationalMonthly.map((r) => [
                  r.month as string,
                  ...nationalCategories.map((c) => r[c] as number),
                ]),
              ]),
          },
          {
            title: 'Parliamentary reply pack',
            desc: 'One-page brief on campus safety: trends, inspection compliance, escalations and actions.',
            run: () =>
              notify.success(
                'Brief generated',
                'Aggregates only, ready for review by the KSU office',
              ),
          },
        ].map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                {r.title}
              </CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={r.run}>
                <Download />
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
