'use client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import {
  HeartHandshake,
  Footprints,
  Timer,
  ClipboardCheck,
  Download,
  Landmark,
  EyeOff,
  CheckCircle2,
  CircleDashed,
  XCircle,
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  PageHeader,
  Stat,
  Pill,
  Meter,
  csvDownload,
} from '../../_components/ui-bits';
import {
  welfareMonthly,
  welfareCategories,
  appUsage,
  colleges,
  responseTimes,
  verification,
  inspectionChecklist,
} from '../../_data/um';
import { suppress } from '../../_data/kpt';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

// Chart config keys become CSS variable names, so they must not contain spaces.
const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, '-');
const welfareConfig: ChartConfig = Object.fromEntries(
  welfareCategories.map((c, i) => [
    slug(c),
    {
      label: c,
      color: [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
        'var(--critical)',
        'var(--muted-foreground)',
      ][i],
    },
  ]),
);
const welfareData = welfareMonthly.map((r) => ({
  month: r.month,
  ...Object.fromEntries(welfareCategories.map((c) => [slug(c), r[c]])),
}));

const usageConfig = {
  walks: { label: 'Friend Walks', color: 'var(--chart-1)' },
  escorts: { label: 'Escorts', color: 'var(--chart-2)' },
  timers: { label: 'Safety timers', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export function WelfareView() {
  const oct = welfareMonthly.at(-1)!;
  const total = welfareCategories.reduce((a, c) => a + (oct[c] as number), 0);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="TNC HEPA · Student Affairs & Alumni"
        title="Student welfare"
        description="Cases involving students, aggregated by category and college. No video, no names. Case detail stays with the case owner."
      />
      <Alert>
        <EyeOff />
        <AlertTitle>Aggregated view</AlertTitle>
        <AlertDescription>
          Counts from 1 to 4 at college level show as “&lt;5”. Welfare referrals
          from the security office carry a summary only, never footage.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Student cases, October"
          value={total}
          hint="All categories"
          icon={HeartHandshake}
        />
        <Stat
          label="Counselling referrals"
          value={oct['Mental-health referral'] as number}
          hint="0.67 per 1,000 students"
          icon={HeartHandshake}
          t="info"
        />
        <Stat
          label="Safe-walk sessions"
          value={appUsage.at(-1)!.walks}
          hint={`${appUsage.at(-1)!.sos} SOS`}
          icon={Footprints}
          t="brand"
        />
        <Stat
          label="Time to welfare contact"
          value="6.2 h"
          hint="Median, target 24 h"
          icon={Timer}
          t="success"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cases by category</CardTitle>
            <CardDescription>Last six months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={welfareConfig}
              className="aspect-auto h-72 w-full"
            >
              <BarChart data={welfareData} margin={{ left: 0, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis width={28} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  content={<ChartLegendContent className="flex-wrap" />}
                />
                {welfareCategories.map((c, i) => (
                  <Bar
                    key={c}
                    dataKey={slug(c)}
                    stackId="a"
                    fill={`var(--color-${slug(c)})`}
                    radius={
                      i === welfareCategories.length - 1 ? [4, 4, 0, 0] : 0
                    }
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>EzSafe app use</CardTitle>
            <CardDescription>
              Sessions started by students and staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={usageConfig}
              className="aspect-auto h-72 w-full"
            >
              <LineChart data={appUsage} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis width={40} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="walks"
                  stroke="var(--color-walks)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="escorts"
                  stroke="var(--color-escorts)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="timers"
                  stroke="var(--color-timers)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>By residential college (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead className="text-right">Residents</TableHead>
                <TableHead className="text-right">Incidents</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Per 1,000
                </TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Visitor overstays
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold">
                      {c.short}
                    </span>{' '}
                    {c.name}
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {c.occupied.toLocaleString()}
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {suppress(c.incidents30d)}
                  </TableCell>
                  <TableCell className="tabular hidden text-right sm:table-cell">
                    {c.incidents30d >= 5
                      ? ((c.incidents30d / c.occupied) * 1000).toFixed(1)
                      : '—'}
                  </TableCell>
                  <TableCell className="tabular hidden text-right md:table-cell">
                    {suppress(c.overstays)}
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

const rtConfig = {
  p50: { label: 'Median (P50)', color: 'var(--chart-2)' },
  p90: { label: 'P90', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const statusIcon = {
  Met: CheckCircle2,
  'Partly met': CircleDashed,
  'Not met': XCircle,
} as const;
const statusTone = {
  Met: 'success',
  'Partly met': 'warning',
  'Not met': 'critical',
} as const;
const iconTone = {
  Met: 'text-success',
  'Partly met': 'text-warning',
  'Not met': 'text-critical',
} as const;

export function ReportsView({ persona }: { persona: Persona }) {
  const { state } = useDemo();
  const met = inspectionChecklist.filter((i) => i.status === 'Met').length;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Reports & KPT inspection"
        description="Response performance, how often each analytic was right, and the evidence for KPT's campus and residence safety-inspection directive."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                csvDownload('um-incidents-oct-2026.csv', [
                  [
                    'id',
                    'date',
                    'time',
                    'category',
                    'severity',
                    'status',
                    'source',
                    'precinct',
                  ],
                  ...state.incidents.map((i) => [
                    i.id,
                    i.date,
                    i.time,
                    i.category,
                    i.severity,
                    i.status,
                    i.source,
                    i.precinct,
                  ]),
                ])
              }
            >
              <Download />
              Monthly incident CSV
            </Button>
            {(persona.id === 'chief' || persona.id === 'hepa') && (
              <Button
                onClick={() =>
                  notify.success(
                    'Monthly return submitted to KPT',
                    'Aggregate counts and checklist status only. No names, locations below precinct, or footage.',
                  )
                }
              >
                <Landmark />
                Submit return to KPT
              </Button>
            )}
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="KPT checklist met"
          value={`${met}/${inspectionChecklist.length}`}
          icon={ClipboardCheck}
          t="success"
        />
        <Stat
          label="P50 response, wk 43"
          value={`${responseTimes.at(-1)!.p50} min`}
          icon={Timer}
          t="info"
        />
        <Stat
          label="P90 response, wk 43"
          value={`${responseTimes.at(-1)!.p90} min`}
          hint="Target under 8"
          icon={Timer}
          t="brand"
        />
        <Stat
          label="AI alerts verified"
          value="83%"
          hint="Confirmed by an operator"
          icon={CheckCircle2}
          t="success"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response time</CardTitle>
            <CardDescription>
              Alarm to officer on scene, minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={rtConfig}
              className="aspect-auto h-64 w-full"
            >
              <LineChart data={responseTimes} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis width={28} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <ReferenceLine
                  y={8}
                  stroke="var(--critical)"
                  strokeDasharray="4 4"
                />
                <Line dataKey="p50" stroke="var(--color-p50)" strokeWidth={2} />
                <Line dataKey="p90" stroke="var(--color-p90)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytic precision (90 days)</CardTitle>
            <CardDescription>
              Operator-verified outcomes. Low precision means more false alarms
              for operators.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {verification.map((v) => {
              const p = Math.round(
                (v.confirmed / (v.confirmed + v.false)) * 100,
              );
              return (
                <div key={v.analytic} className="grid gap-1">
                  <div className="flex justify-between text-sm">
                    <span>{v.analytic}</span>
                    <span className="tabular text-muted-foreground">
                      {p}% · {v.confirmed + v.false} alerts
                    </span>
                  </div>
                  <Meter
                    value={p}
                    t={p >= 80 ? 'success' : p >= 50 ? 'warning' : 'critical'}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>KPT safety-inspection directive</CardTitle>
          <CardDescription>
            Campus and residence checklist with the evidence the platform holds
          </CardDescription>
          <CardAction>
            <Pill t="success">{met} met</Pill>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-2">
          {inspectionChecklist.map((c) => {
            const I = statusIcon[c.status];
            return (
              <div
                key={c.item}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <I className={`mt-0.5 size-4 shrink-0 ${iconTone[c.status]}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{c.item}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.evidence}
                  </div>
                </div>
                <Pill t={statusTone[c.status]}>{c.status}</Pill>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
