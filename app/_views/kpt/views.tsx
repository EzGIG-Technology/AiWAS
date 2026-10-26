'use client';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import {
  Building2,
  Video,
  ScanEye,
  Activity,
  BadgeCheck,
  ShieldCheck,
  EyeOff,
  Search,
  Download,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Send,
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
  detectionCategories,
  nationalTotals,
  cctvItems,
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
const mTone = (m: number): 'success' | 'warning' | 'critical' =>
  m >= 75 ? 'success' : m >= 60 ? 'warning' : 'critical';
const dash = (v: number | null, suffix = '') =>
  v === null ? '—' : `${v.toLocaleString('en-MY')}${suffix}`;

const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, '-');
const trendCats = [
  'Vehicle & traffic',
  'Intrusion',
  'Crowd density',
  'Unattended object',
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
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Jabatan Pendidikan Tinggi · KPT"
        title="Campus camera intelligence"
        description={`${nationalTotals.publicCount} public and ${nationalTotals.privateCount} private universities. Universities on EzVision report live figures; the rest file a monthly CCTV return.`}
        actions={
          <Button onClick={() => navigate('/kpt/coverage')}>
            <Video />
            CCTV coverage
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
          label="Cameras registered"
          value={nationalTotals.cameras.toLocaleString()}
          hint={`${nationalTotals.analysed.toLocaleString()} with analytics`}
          icon={Video}
          t="info"
        />
        <Stat
          label="Detections (30 d)"
          value={nationalTotals.detections30d.toLocaleString()}
          hint="EzVision campuses"
          icon={ScanEye}
          t="brand"
        />
        <Stat
          label="Median uptime"
          value={`${nationalTotals.medianUptime}%`}
          hint="Target 95%"
          icon={Activity}
          t="success"
        />
        <Stat
          label="Median precision"
          value={`${nationalTotals.medianPrecision}%`}
          hint="Operator-confirmed"
          icon={BadgeCheck}
          t="success"
        />
        <Stat
          label="Facial recognition off"
          value={`${nationalTotals.frDisabled}/${nationalTotals.institutions}`}
          icon={ShieldCheck}
          t="warning"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>By state</CardTitle>
            <CardDescription>
              Average camera-intelligence maturity. Select a state.
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
                    <Pill t={mTone(i.maturity)}>{i.maturity}</Pill>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>National detections</CardTitle>
            <CardDescription>
              Five largest categories, campuses on EzVision, last 12 months
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kpt/detections')}
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
                <YAxis width={40} tickLine={false} axisLine={false} />
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
      <Card>
        <CardHeader>
          <CardTitle>Lowest camera-intelligence maturity</CardTitle>
          <CardDescription>
            Composite of entrance coverage, CCTV directive items, privacy
            governance, analytics in use and uptime
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2.5 md:grid-cols-2">
          {[...institutions]
            .sort((a, b) => a.maturity - b.maturity)
            .slice(0, 8)
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
                    value={i.maturity}
                    t={mTone(i.maturity)}
                    className="mt-1"
                  />
                </div>
                <span className="tabular text-right text-sm font-semibold">
                  {i.maturity}
                </span>
              </button>
            ))}
        </CardContent>
      </Card>
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
                  ['Maturity', i.maturity],
                  ['Cameras registered', i.cameras.toLocaleString()],
                  ['With analytics', i.analysed.toLocaleString()],
                  ['Entrance coverage', `${i.coverage}%`],
                  ['Uptime (30 d)', dash(i.uptime, '%')],
                  ['Analytics live', i.analyticsLive],
                  [
                    'Detections (30 d)',
                    i.detections30d === null ? '—' : suppress(i.detections30d),
                  ],
                  ['Precision', dash(i.precision, '%')],
                  ['Median time to verify', dash(i.verifyP50, ' s')],
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
                  Inspection directive: CCTV items
                </div>
                <ul className="grid gap-1.5">
                  {cctvItems.map((item, n) => {
                    const I = cIcon[i.cctv[n]];
                    return (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <I
                          className={cn('size-4 shrink-0', cTone[i.cctv[n]])}
                        />
                        <span className="flex-1">{item}</span>
                        <span className="text-xs text-muted-foreground">
                          {i.cctv[n]}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Privacy & AI governance
                </div>
                <ul className="grid gap-1 text-sm sm:grid-cols-2">
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
              {i.connection === 'Manual return' && (
                <Note>
                  This university is not on EzVision, so uptime, detections and
                  precision are not measured. Its figures come from the monthly
                  CCTV return.
                </Note>
              )}
              <Button
                onClick={() =>
                  notify.success(
                    `Update requested from ${i.acronym}`,
                    'The university receives the request in its EzVision inbox',
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
        description="Each university's camera estate, analytics in use, uptime and precision, and its CCTV directive status."
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
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-right">Maturity</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Cameras
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Coverage
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Uptime
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Precision
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
                          {i.acronym} · {i.state}
                        </div>
                      </div>
                    </div>
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
                    <Pill t={mTone(i.maturity)}>{i.maturity}</Pill>
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">
                    {i.cameras.toLocaleString()}
                  </TableCell>
                  <TableCell className="tabular hidden text-right lg:table-cell">
                    {i.coverage}%
                  </TableCell>
                  <TableCell className="tabular hidden text-right lg:table-cell">
                    {dash(i.uptime, '%')}
                  </TableCell>
                  <TableCell className="tabular hidden text-right xl:table-cell">
                    {dash(i.precision, '%')}
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

// -------------------------------------------------------------- detections --

export function DetectionsView() {
  const totals = detectionCategories.map((c) => ({
    category: c,
    total: nationalMonthly.reduce((a, r) => a + (r[c] as number), 0),
    last: nationalMonthly.at(-1)![c] as number,
    prev: nationalMonthly.at(-2)![c] as number,
  }));
  const catConfig = {
    total: { label: 'Detections (12 months)', color: 'var(--chart-1)' },
  } satisfies ChartConfig;
  const connected = institutions.filter((i) => i.detections30d !== null);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Detection trends"
        description="What campus analytics detected across universities on EzVision, by category. Water-level detections rise with the east-coast monsoon; crowd density follows convocations and the semester."
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
                  width={112}
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
                        {t.last.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'tabular text-right',
                          d > 0
                            ? 'text-warning'
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
      <Card>
        <CardHeader>
          <CardTitle>Detections per camera and precision</CardTitle>
          <CardDescription>
            Universities on EzVision, last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead className="text-right">Detections</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Per camera
                </TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Time to verify
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connected.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UniversityLogo
                        id={i.id}
                        acronym={i.acronym}
                        className="size-7"
                      />
                      {i.acronym}
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {suppress(i.detections30d!)}
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">
                    {(i.detections30d! / Math.max(1, i.analysed)).toFixed(1)}
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {i.precision}%
                  </TableCell>
                  <TableCell className="tabular hidden text-right md:table-cell">
                    {i.verifyP50} s
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- coverage --

export function CoverageView() {
  const uptimeData = institutions
    .filter((i) => i.uptime !== null)
    .sort((a, b) => b.uptime! - a.uptime!)
    .map((i) => ({
      acronym: i.acronym,
      ok: i.uptime! >= 95 ? i.uptime! : 0,
      low: i.uptime! < 95 ? i.uptime! : 0,
    }));
  const config = {
    ok: { label: 'At or above 95%', color: 'var(--chart-4)' },
    low: { label: 'Below 95%', color: 'var(--warning)' },
  } satisfies ChartConfig;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="CCTV coverage & uptime"
        description="The CCTV items of KPT's 2025 campus and residence safety-inspection directive, and camera uptime at each university on EzVision."
      />
      <ExclusionBanner />
      <Card>
        <CardHeader>
          <CardTitle>Inspection directive: CCTV items by university</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card p-2 text-left font-medium text-muted-foreground">
                  Institution
                </th>
                {cctvItems.map((it) => (
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
                  {i.cctv.map((c, n) => {
                    const I = cIcon[c];
                    return (
                      <td
                        key={n}
                        className="p-2 text-center"
                        title={`${cctvItems[n]}: ${c}`}
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
      <Card>
        <CardHeader>
          <CardTitle>Camera uptime, last 30 days</CardTitle>
          <CardDescription>
            Universities on EzVision; dashed line is the 95% directive target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config} className="aspect-auto h-64 w-full">
            <BarChart data={uptimeData} margin={{ left: 0, right: 8 }}>
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
                width={32}
                tickLine={false}
                axisLine={false}
                domain={[90, 100]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={95}
                stroke="var(--foreground)"
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="ok"
                stackId="u"
                fill="var(--color-ok)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="low"
                stackId="u"
                fill="var(--color-low)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// -------------------------------------------------------------- governance --

export function GovernanceView() {
  const pct = (n: number) =>
    Math.round(
      (institutions.filter((i) => i.privacy[n]).length / institutions.length) *
        100,
    );
  const frOn = institutions.filter((i) => !i.privacy[4]);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Privacy & AI governance"
        description="PDPA readiness under the 2024 amendments and MOSTI's AI governance guidelines, for every camera-analytics deployment."
      />
      <ExclusionBanner />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adoption across institutions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {privacyItems.map((p, n) => {
              const v = pct(n);
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
        <Card>
          <CardHeader>
            <CardTitle>Facial recognition still enabled</CardTitle>
            <CardDescription>
              Biometric data is sensitive under the PDPA amendments. These
              institutions need a DPIA justification or to switch it off.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {frOn.length === 0 && (
              <p className="text-sm text-muted-foreground">None.</p>
            )}
            {frOn.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <UniversityLogo
                  id={i.id}
                  acronym={i.acronym}
                  className="size-8"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-xs text-muted-foreground">
                    DPIA for CCTV: {i.privacy[1] ? 'filed' : 'missing'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    notify.success(`Justification requested from ${i.acronym}`)
                  }
                >
                  Request
                </Button>
              </div>
            ))}
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
            desc: 'Camera estate, coverage, uptime, analytics, detections, precision and maturity per institution.',
            run: () =>
              csvDownload('kpt-camera-intelligence-summary.csv', [
                [
                  'acronym',
                  'name',
                  'type',
                  'state',
                  'data_source',
                  'cameras',
                  'with_analytics',
                  'coverage_pct',
                  'uptime_pct',
                  'detections_30d',
                  'precision_pct',
                  'maturity',
                ],
                ...institutions.map((i: Institution) => [
                  i.acronym,
                  i.name,
                  i.type,
                  i.state,
                  i.connection,
                  i.cameras,
                  i.analysed,
                  i.coverage,
                  i.uptime ?? '',
                  i.detections30d === null ? '' : suppress(i.detections30d),
                  i.precision ?? '',
                  i.maturity,
                ]),
              ]),
          },
          {
            title: 'National detections (CSV)',
            desc: 'Twelve months by detection category across EzVision campuses.',
            run: () =>
              csvDownload('kpt-national-detections.csv', [
                ['month', ...detectionCategories],
                ...nationalMonthly.map((r) => [
                  r.month as string,
                  ...detectionCategories.map((c) => r[c] as number),
                ]),
              ]),
          },
          {
            title: 'Briefing note',
            desc: 'One page on campus CCTV and analytics: coverage, uptime, governance and where to act.',
            run: () =>
              notify.success(
                'Briefing note generated',
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
