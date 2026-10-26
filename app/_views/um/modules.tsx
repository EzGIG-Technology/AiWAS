'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  CalendarClock,
  Car,
  Download,
  Leaf,
  ParkingSquare,
  ScanLine,
  Timer,
  TrendingDown,
  TriangleAlert,
  Users,
  Video,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CameraFeed } from '../../_components/camera-feed';
import {
  DetectorStatusBadge,
  Meter,
  Note,
  PageHeader,
  Pill,
  Stat,
} from '../../_components/ui-bits';
import {
  blocks,
  blockLabel,
  cameras,
  cameraByScene,
  carParks,
  colleges,
  crowdEvents,
  densitySeries,
  detectorIds,
  detectors,
  energySavings,
  footfall,
  gateFlow,
  gateMethod,
  modules,
  moduleIds,
  nightRoutes,
  permits,
  plateReads,
  utilisation,
  zones,
  type BlockId,
  type ModuleId,
} from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';
import {
  ackTimes,
  hostelByDoor,
  hostelByHour,
  hostelWeekly,
  isOpen,
  pilotKpis,
  precisionByModule,
  scheduleText,
} from '../../_data/alerts';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { alertsFor, canEditHours } from '../../_lib/scope';
import { navigate } from '../../_lib/router';
import { notify } from '../../_lib/notify';
import { Pdf, download } from '../../_lib/pdf';
import { AlertSheet } from './alert-sheet';
import { AlertRow, queueSort } from './console';

function ModuleAlerts({
  persona,
  module,
  limit = 8,
}: {
  persona: Persona;
  module: ModuleId;
  limit?: number;
}) {
  const { state, now } = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);
  const list = alertsFor(persona, state.alerts)
    .filter((a) => a.module === module)
    .sort(queueSort(now));
  const shown = [
    ...list.filter(isOpen),
    ...list.filter((a) => !isOpen(a)),
  ].slice(0, limit);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{modules[module].name} alerts</CardTitle>
        <CardDescription>
          {list.filter(isOpen).length} open · {list.length} in the last days
        </CardDescription>
        {persona.id !== 'counsellor' && (
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/um/alerts')}
            >
              All <ArrowRight />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid gap-0.5">
        {shown.map((a) => (
          <AlertRow key={a.id} alert={a} onOpen={() => setOpenId(a.id)} />
        ))}
        {!shown.length && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No alerts.
          </p>
        )}
      </CardContent>
      <AlertSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </Card>
  );
}

function Features({ module }: { module: ModuleId }) {
  const ids = detectorIds.filter((d) => detectors[d].module === module);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detectors</CardTitle>
        <CardDescription>
          What each one does and cannot do. Status: Live, PoC, Build (rules on
          the existing engine), New model, Partner.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {ids.map((d) => (
          <div
            key={d}
            className="grid gap-1 border-b pb-3 last:border-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{detectors[d].name}</span>
              <DetectorStatusBadge status={detectors[d].status} />
              <Pill>{detectors[d].priority}</Pill>
              <span className="text-xs text-muted-foreground">
                {cameras.filter((c) => c.detectors.includes(d)).length} cameras
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {detectors[d].detects}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Cannot: </span>
              {detectors[d].cannot}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function precisionOf(m: ModuleId) {
  const p = precisionByModule.find((x) => x.module === m)!;
  return Math.round((p.confirmed / (p.confirmed + p.false)) * 100);
}

// --------------------------------------------------------- modules overview --

export function ModulesOverview({ persona }: { persona: Persona }) {
  const { state } = useDemo();
  const route: Record<ModuleId, string> = {
    hostel: 'hostel',
    safe: 'safe',
    mobility: 'mobility',
    welfare: 'welfare',
    hse: 'hse',
    space: 'space',
  };
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Modules"
        description="Six modules on one platform core: the same engine, rules studio, alert router, case management, camera health and reports. Hostel Integrity leads; the others reuse the engine and console."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moduleIds.map((m) => {
          const mod = modules[m];
          const open = alertsFor(persona, state.alerts).filter(
            (a) => a.module === m && isOpen(a),
          ).length;
          return (
            <Card
              key={m}
              className={m === 'hostel' ? 'ring-2 ring-primary' : undefined}
            >
              <CardHeader>
                <CardTitle>
                  {mod.n}. {mod.name}
                  {m === 'hostel' && (
                    <span className="ml-2 text-xs font-normal text-primary">
                      Flagship
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{mod.users}</CardDescription>
                <CardAction>
                  <Pill t="brand">{mod.status}</Pill>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm text-muted-foreground">{mod.summary}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {mod.features.slice(0, 6).map((f) => (
                    <li key={f}>
                      <Pill>{f}</Pill>
                    </li>
                  ))}
                  {mod.features.length > 6 && (
                    <li className="text-xs text-muted-foreground">
                      +{mod.features.length - 6} more
                    </li>
                  )}
                </ul>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {open} open · {precisionOf(m)}% precision (30 d) ·{' '}
                    {mod.rollout}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/um/${route[m]}`)}
                  >
                    Open <ArrowRight />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform core, shared by every module</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              'Camera onboarding',
              'Any brand over RTSP/ONVIF; zones and lines drawn on each view.',
            ],
            [
              'Edge inference',
              'Video analysed on campus; only events, snapshots and short clips leave the box.',
            ],
            [
              'Rules studio',
              'Zone + object + condition + schedule + action, set by the university without code.',
            ],
            [
              'Alert router',
              'Routes by duty roster; escalates when nobody acknowledges.',
            ],
            [
              'Case management',
              'Link alerts, add notes, record the outcome, export evidence with an audit trail.',
            ],
            [
              'Camera health',
              'Offline, blocked, blurred or moved cameras flagged daily.',
            ],
            [
              'Reports',
              'Weekly and monthly PDFs for the TNC HEP and the security director.',
            ],
            [
              'Admin & privacy',
              'Users, roles, retention, audit log and data requests.',
            ],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg bg-muted/60 p-3">
              <div className="font-medium">{t}</div>
              <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ hostel --

const weeklyConfig = {
  a: { label: 'KK12 Blok A (female)', color: 'var(--chart-1)' },
  b: { label: 'KK9 Blok B (male)', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const doorConfig = {
  count: { label: 'Confirmed breaches', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function weeklyReport(scope: BlockId[]) {
  const pdf = new Pdf();
  pdf.rect(0, 0, 595, 42, [0.63, 0.11, 0.38]);
  pdf.text('EzVision Campus · Hostel Integrity weekly breach report', {
    y: 14,
    size: 13,
    bold: true,
    gray: 1,
  });
  pdf.y = 60;
  pdf.text(
    'Universiti Malaya · semester week 8 (live pilot week 5) · 19–25 Oct 2026',
    { bold: true },
  );
  pdf.text(`Blocks: ${scope.map(blockLabel).join(', ')}`, { gray: 0.3 });
  pdf.gap();
  pdf.text('Confirmed breaches per week', { bold: true, size: 11 });
  const max = 30;
  for (const w of hostelWeekly) {
    const v = scope.reduce((s, b) => s + (b === 'kk12-a' ? w.a : w.b), 0);
    pdf.need(16);
    pdf.text(w.week, { size: 9, y: pdf.y });
    pdf.rect(150, pdf.y, (v / max) * 330, 10, [0.63, 0.11, 0.38]);
    pdf.text(String(v), { x: 155 + (v / max) * 330, size: 9, y: pdf.y });
    pdf.y += 16;
  }
  pdf.gap();
  pdf.text('By door (live weeks 1–5)', { bold: true, size: 11 });
  for (const d of hostelByDoor.filter((x) => scope.includes(x.block)))
    pdf.text(`${blockLabel(d.block)} · ${d.door}: ${d.count}`, { size: 9 });
  pdf.gap();
  pdf.text('Busiest hours', { bold: true, size: 11 });
  const top = [...hostelByHour]
    .map((h) => ({
      hour: h.hour,
      n: scope.reduce((s, b) => s + (b === 'kk12-a' ? h.a : h.b), 0),
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 4);
  pdf.text(top.map((t) => `${t.hour} (${t.n})`).join(' · '), { size: 9 });
  pdf.gap();
  pdf.text('Pilot KPIs', { bold: true, size: 11 });
  for (const k of pilotKpis)
    pdf.text(`${k.kpi}: ${k.value} (target ${k.target})`, { size: 9 });
  pdf.gap();
  pdf.para(
    'A warden verified every alert counted as a breach. AI never issues a penalty. Counts name no one. Demonstration data.',
    { size: 8, gray: 0.45 },
  );
  download('hostel-weekly-breach-report.pdf', pdf.build());
}

/** Screen 6: hostel dashboard. Breaches by block, door and hour, and the semester trend. */
export function HostelView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const scoped = persona.alerts.college
    ? blocks.filter((b) => b.college === persona.alerts.college)
    : blocks;
  const [sel, setSel] = useState<'all' | BlockId>(
    scoped.length === 1 ? scoped[0].id : 'all',
  );
  const scope = sel === 'all' ? scoped.map((b) => b.id) : [sel];
  const [openId, setOpenId] = useState<string | null>(null);
  const editable = canEditHours(persona);

  const weekly = hostelWeekly.map((w) => ({
    week: w.week.split(' · ')[0],
    stage: w.week.split(' · ')[1],
    ...(scope.includes('kk12-a') ? { a: w.a } : {}),
    ...(scope.includes('kk9-b') ? { b: w.b } : {}),
  }));
  const sum = (w: (typeof hostelWeekly)[number]) =>
    scope.reduce((s, b) => s + (b === 'kk12-a' ? w.a : w.b), 0);
  const sumFalse = (w: (typeof hostelWeekly)[number]) =>
    scope.reduce((s, b) => s + (b === 'kk12-a' ? w.falseA : w.falseB), 0);
  const thisWeek = sum(hostelWeekly.at(-1)!);
  const firstLive = sum(hostelWeekly[2]);
  const doors = hostelByDoor
    .filter((d) => scope.includes(d.block))
    .map((d) => ({
      ...d,
      label: `${blockLabel(d.block).split(' ').at(-1)} · ${d.door}`,
    }));
  const hourMax = Math.max(...hostelByHour.map((h) => h.a + h.b));
  const recent = state.alerts
    .filter((a) => a.module === 'hostel' && a.block && scope.includes(a.block))
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 1 · Hostel Integrity"
        title="Hostel dashboard"
        description="Breaches a warden confirmed, by block, door and hour, and the trend since the pilot went live. Opposite-gender entry, visitors past the lounge, overstays, after-curfew entry, fire-exit use, tailgating and delivery riders."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              weeklyReport(scope);
              dispatch({
                type: 'audit',
                entry: {
                  who: persona.name,
                  action: 'Downloaded weekly breach report',
                  target: scope.map(blockLabel).join(', '),
                  reason: 'Weekly review',
                },
              });
            }}
          >
            <Download />
            Weekly breach report (PDF)
          </Button>
        }
      />
      {scoped.length > 1 && (
        <ToggleGroup
          value={[sel]}
          onValueChange={(v) => v[0] && setSel(v[0] as typeof sel)}
          variant="outline"
          aria-label="Block"
        >
          <ToggleGroupItem value="all">Both blocks</ToggleGroupItem>
          {scoped.map((b) => (
            <ToggleGroupItem key={b.id} value={b.id}>
              {blockLabel(b.id)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {persona.id === 'pengetua' && (
        <Note>
          You see {colleges.kk12.name} only. Live video is not available to your
          role; alerts open as records.
        </Note>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="Confirmed this week"
          value={thisWeek}
          hint={`${firstLive} in live week 1`}
          icon={TrendingDown}
          t="success"
        />
        <Stat
          label="False alarms this week"
          value={sumFalse(hostelWeekly.at(-1)!)}
          hint={`${(sumFalse(hostelWeekly.at(-1)!) / (7 * scope.length)).toFixed(1)} per block per night`}
          icon={TriangleAlert}
          t="warning"
        />
        <Stat
          label="Time to acknowledge"
          value={`${ackTimes.at(-1)!.p50} min`}
          hint="Median, target under 5"
          icon={Timer}
          t="info"
        />
        <Stat
          label="Warden adoption"
          value="94%"
          hint="Alerts closed with an outcome"
          icon={BadgeCheck}
          t="brand"
        />
        <Stat
          label="Residents covered"
          value={scoped
            .filter((b) => scope.includes(b.id))
            .reduce((s, b) => s + b.beds, 0)}
          hint={`${scope.length} block${scope.length > 1 ? 's' : ''}`}
          icon={BedDouble}
          t="muted"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend over the semester</CardTitle>
            <CardDescription>
              Confirmed breaches per week. Weeks 2–3 are the shadow run (alerts
              to EzGIG only); the live pilot starts in week 4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={weeklyConfig}
              className="aspect-auto h-64 w-full"
            >
              <LineChart data={weekly} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis
                  width={32}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ReferenceLine
                  x="W4"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Live',
                    position: 'insideTopRight',
                    fontSize: 10,
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend
                  content={<ChartLegendContent className="flex-wrap" />}
                />
                {scope.includes('kk12-a') && (
                  <Line dataKey="a" stroke="var(--color-a)" strokeWidth={2} />
                )}
                {scope.includes('kk9-b') && (
                  <Line dataKey="b" stroke="var(--color-b)" strokeWidth={2} />
                )}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Breaches by door</CardTitle>
            <CardDescription>
              Confirmed over the five live weeks. The doors with most breaches
              are where to put a guard or fix a door.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={doorConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={doors}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Breaches by hour</CardTitle>
          <CardDescription>
            Confirmed over the live weeks. Darker is more.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-[10px]">
            <thead>
              <tr>
                <th className="p-1 text-left font-medium text-muted-foreground">
                  Block
                </th>
                {hostelByHour.map((h) => (
                  <th
                    key={h.hour}
                    className="p-0.5 font-medium text-muted-foreground"
                  >
                    {h.hour.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scope.map((b) => (
                <tr key={b}>
                  <td className="p-1 pr-2 whitespace-nowrap">
                    {blockLabel(b)}
                  </td>
                  {hostelByHour.map((h) => {
                    const v = b === 'kk12-a' ? h.a : h.b;
                    return (
                      <td key={h.hour} className="p-0.5">
                        <span
                          title={`${blockLabel(b)} ${h.hour}: ${v}`}
                          className="tabular grid h-6 place-items-center rounded"
                          style={{
                            background: `color-mix(in oklch, var(--primary) ${Math.round((v / hourMax) * 140)}%, var(--muted))`,
                            color: v / hourMax > 0.4 ? 'white' : undefined,
                          }}
                        >
                          {v || ''}
                        </span>
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
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4" /> Visiting hours and curfew
            </CardTitle>
            <CardDescription>
              Set by the Pengetua for each block. Rules 03 (visitor still inside
              at closing) and 04 (any entry after curfew) follow these hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {scoped.map((b) => {
              const h = state.hours[b.id];
              const mayEdit =
                editable &&
                (persona.id === 'director' ||
                  persona.alerts.college === b.college);
              const set = (k: keyof typeof h, v: string) => {
                dispatch({
                  type: 'hours',
                  block: b.id,
                  hours: { ...h, [k]: v },
                });
              };
              return (
                <div key={b.id} className="grid gap-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {blockLabel(b.id)}
                    </span>
                    <Pill t={b.residents === 'female' ? 'brand' : 'info'}>
                      {b.type}
                    </Pill>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['visitFrom', 'visitTo', 'curfew'] as const).map((k) => (
                      <div key={k} className="grid gap-1">
                        <Label htmlFor={`${b.id}-${k}`} className="text-xs">
                          {
                            {
                              visitFrom: 'Visiting from',
                              visitTo: 'Visiting until',
                              curfew: 'Curfew',
                            }[k]
                          }
                        </Label>
                        <Input
                          id={`${b.id}-${k}`}
                          type="time"
                          value={h[k]}
                          disabled={!mayEdit}
                          onChange={(e) => set(k, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {mayEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="justify-self-start"
                      onClick={() => {
                        dispatch({
                          type: 'audit',
                          entry: {
                            who: persona.name,
                            action: `Set hours: visiting ${h.visitFrom}–${h.visitTo}, curfew ${h.curfew}`,
                            target: blockLabel(b.id),
                            reason: 'College rules',
                          },
                        });
                        notify.success(
                          'Hours saved',
                          `${blockLabel(b.id)}: rules 03 and 04 now run ${scheduleText({ kind: 'after-visiting' }, h).split(' ')[0]} and ${scheduleText({ kind: 'curfew' }, h).split(' ')[0]}.`,
                        );
                      }}
                    >
                      Save hours
                    </Button>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Defaults follow the UTeM rule book: visiting 5–10 pm on weekdays,
              midnight curfew. Each university sets its own.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent hostel alerts</CardTitle>
            <CardDescription>
              Each one checked by a warden before anything happens to a student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer"
                    onClick={() => setOpenId(a.id)}
                  >
                    <TableCell className="whitespace-normal">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.date.slice(8)} Oct {a.time} ·{' '}
                        {a.block && blockLabel(a.block)}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal text-xs">
                      {a.verdict ?? a.status}
                      {a.action && (
                        <div className="text-muted-foreground">{a.action}</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <AlertSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// ------------------------------------------------------- module pages --

const densityConfig = {
  dtc: { label: 'DTC bag check', color: 'var(--chart-1)' },
  gate: { label: 'Main gate', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function SafeView({ persona }: { persona: Persona }) {
  const ev = crowdEvents[0];
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 2 · Safe Campus"
        title="Safe Campus"
        description={modules.safe.summary}
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="grid min-w-0 content-start gap-4">
          <ModuleAlerts persona={persona} module="safe" />
          <Card>
            <CardHeader>
              <CardTitle>{ev.name}</CardTitle>
              <CardDescription>
                {ev.place} · {ev.when} · {ev.counted.toLocaleString()} counted
                of {ev.expected.toLocaleString()} expected · alert above{' '}
                {ev.limit} people/m²
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={densityConfig}
                className="aspect-auto h-56 w-full"
              >
                <LineChart data={densitySeries} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} />
                  <YAxis width={32} tickLine={false} axisLine={false} />
                  <ReferenceLine
                    y={ev.limit}
                    stroke="var(--critical)"
                    strokeDasharray="4 3"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="dtc"
                    stroke="var(--color-dtc)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="gate"
                    stroke="var(--color-gate)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <Features module="safe" />
      </div>
    </div>
  );
}

export function WelfareView({ persona }: { persona: Persona }) {
  const counsellor = persona.id === 'counsellor';
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 4 · Welfare (AIWAS)"
        title={counsellor ? 'Wellbeing alerts' : 'Welfare'}
        description={
          counsellor
            ? 'Repeated late-night presence at high-risk spots and people past a safe line at height. These come to counselling only and never to discipline. No identity is recorded; follow up through the college felo.'
            : modules.welfare.summary
        }
      />
      <Note>
        Welfare is not discipline. Wellbeing and at-height alerts route to
        counselling; bullying, vaping and vandalism go to the command centre
        and, once a person confirms them, to HEP. AI never issues a penalty.
      </Note>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="grid min-w-0 content-start gap-4">
          <ModuleAlerts persona={persona} module="welfare" />
          {counsellor && (
            <ModuleAlerts persona={persona} module="safe" limit={4} />
          )}
          <Card>
            <CardHeader>
              <CardTitle>Night routes</CardTitle>
              <CardDescription>
                Lone walkers and loitering after 20:00, last 30 days. Counts per
                path, for lighting and patrol planning; no one is tracked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead className="text-right">Lone walkers</TableHead>
                    <TableHead className="text-right">Loitering</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Lighting
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nightRoutes.map((r) => (
                    <TableRow key={r.path}>
                      <TableCell className="whitespace-normal">
                        {r.path}
                      </TableCell>
                      <TableCell className="tabular text-right">
                        {r.lone}
                      </TableCell>
                      <TableCell className="tabular text-right">
                        {r.loiter}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Pill t={r.lit === 'Lit' ? 'success' : 'warning'}>
                          {r.lit}
                        </Pill>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {!counsellor && <Features module="welfare" />}
        {counsellor && (
          <Card className="content-start">
            <CardHeader>
              <CardTitle>How to follow up</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>
                An alert says a place and a pattern, not a person. Ask the
                college felo for a friendly check-in at that place and time.
              </p>
              <p>
                Record “Counsellor follow-up” or “No follow-up needed”. There is
                no option to refer a wellbeing alert to HEP.
              </p>
              <p>
                Open question in the spec: the behaviour models come from AIWAS;
                EzGIG is confirming it can reuse them.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function HseView({ persona }: { persona: Persona }) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 5 · HSE"
        title="Health, safety & environment"
        description={modules.hse.summary}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Smoke cues (7 d)"
          value={2}
          hint="Both false: dust, steam"
          icon={TriangleAlert}
          t="warning"
        />
        <Stat
          label="PPE compliance, site"
          value="96%"
          hint="Hard hats on scaffold"
          icon={BadgeCheck}
          t="success"
        />
        <Stat
          label="Radar sensors"
          value={4}
          hint="Blok A toilets; no cameras"
          icon={ScanLine}
          t="info"
        />
        <Stat
          label="Animal sightings (7 d)"
          value={4}
          hint="Macaques at Blok A drying area"
          icon={Leaf}
          t="muted"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <ModuleAlerts persona={persona} module="hse" />
        <Features module="hse" />
      </div>
    </div>
  );
}

const flowConfig = {
  in: { label: 'Entering', color: 'var(--chart-1)' },
  out: { label: 'Leaving', color: 'var(--chart-2)' },
} satisfies ChartConfig;
const methodConfig = {
  plate: { label: 'Plate recognition', color: 'var(--chart-1)' },
  rfid: { label: 'RFID sticker', color: 'var(--chart-4)' },
} satisfies ChartConfig;

export function MobilityView({ persona }: { persona: Persona }) {
  const parked = carParks.reduce((a, c) => a + c.occupied, 0);
  const spaces = carParks.reduce((a, c) => a + c.capacity, 0);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 3 · Mobility (ParqOS, Vera)"
        title="Mobility"
        description={modules.mobility.summary}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Car parks"
          value={`${Math.round((parked / spaces) * 100)}% full`}
          hint={`${parked.toLocaleString()} of ${spaces.toLocaleString()} bays`}
          icon={ParkingSquare}
        />
        <Stat
          label="Main gate, last hour"
          value={(gateFlow.at(-1)!.in + gateFlow.at(-1)!.out).toLocaleString()}
          hint="Vehicles both ways"
          icon={Car}
          t="info"
        />
        <Stat
          label="Entries by plate"
          value={`${gateMethod.at(-1)!.plate}%`}
          hint="RFID stickers being retired"
          icon={ScanLine}
          t="brand"
        />
        <Stat
          label="Flagged plates today"
          value={plateReads.filter((p) => p.result !== 'Valid').length}
          hint="Blacklist, expired, unregistered"
          icon={TriangleAlert}
          t="warning"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {carParks.map((c) => {
          const pct = Math.round((c.occupied / c.capacity) * 100);
          return (
            <Card key={c.name} size="sm">
              {persona.video && (
                <CameraFeed
                  camera={cameraByScene(c.scene)}
                  compact
                  className="rounded-none rounded-t-xl ring-0"
                />
              )}
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                <CardDescription>
                  {'note' in c
                    ? c.note
                    : `${c.capacity - c.occupied} bays free · OKU ${c.okuFree}/${c.oku} free`}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-1">
                <div className="tabular flex justify-between text-xs text-muted-foreground">
                  <span>
                    {c.occupied} / {c.capacity}
                  </span>
                  <span>{pct}%</span>
                </div>
                <Meter
                  value={pct}
                  t={pct > 90 ? 'critical' : pct > 75 ? 'warning' : 'brand'}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ModuleAlerts persona={persona} module="mobility" />
        <Card>
          <CardHeader>
            <CardTitle>Plate reads at the main gate</CardTitle>
            <CardDescription>
              Matched against e-Pelekat permits, visitor pre-registration and
              the blacklist. Kept until permit expiry + 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plateReads.map((p) => (
                  <TableRow key={p.time + p.plate}>
                    <TableCell className="tabular">{p.time}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {p.plate}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Pill
                        t={
                          p.result === 'Valid'
                            ? 'success'
                            : p.result === 'Blacklisted'
                              ? 'critical'
                              : 'warning'
                        }
                      >
                        {p.result}
                      </Pill>
                      <div className="text-xs text-muted-foreground">
                        {p.permit}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Main gate traffic</CardTitle>
            <CardDescription>Vehicles per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={flowConfig}
              className="aspect-auto h-56 w-full"
            >
              <BarChart data={gateFlow} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(0, 2)}
                />
                <YAxis width={40} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="in"
                  fill="var(--color-in)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="out"
                  fill="var(--color-out)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plates replacing stickers</CardTitle>
            <CardDescription>
              % of main-gate entries, pilot weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={methodConfig}
              className="aspect-auto h-56 w-full"
            >
              <BarChart data={gateMethod} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis width={32} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="plate" stackId="m" fill="var(--color-plate)" />
                <Bar
                  dataKey="rfid"
                  stackId="m"
                  fill="var(--color-rfid)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permit lists</CardTitle>
            <CardDescription>Managed by the traffic unit</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {permits.map((p) => (
              <div
                key={p.type}
                className="flex items-center justify-between gap-2"
              >
                <span>
                  {p.type}
                  <span className="block text-xs text-muted-foreground">
                    {p.source}
                  </span>
                </span>
                <span className="tabular font-medium">
                  {p.active.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const footfallConfig = {
  cafeteria: { label: 'Cafeteria', color: 'var(--chart-1)' },
  central: { label: 'UM Central', color: 'var(--chart-2)' },
  dtc: { label: 'Dewan Tunku Canselor', color: 'var(--chart-3)' },
} satisfies ChartConfig;
const hours = footfall.map((f) => f.hour.slice(0, 2));

export function SpaceView({ persona }: { persona: Persona }) {
  const people = zones.reduce((a, z) => a + z.now, 0);
  const sorted = [...zones].sort(
    (a, b) => b.now / b.capacity - a.now / a.capacity,
  );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Module 6 · Space & Admin"
        title="Space & Admin"
        description={modules.space.summary}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="People counted now"
          value={people.toLocaleString()}
          hint={`${zones.length} zones`}
          icon={Users}
        />
        <Stat
          label="Zones above 85%"
          value={zones.filter((z) => z.now / z.capacity > 0.85).length}
          icon={TriangleAlert}
          t="warning"
        />
        <Stat
          label="Energy saved today"
          value={`${energySavings.reduce((s, e) => s + e.kwh, 0)} kWh`}
          hint={`${energySavings.length} rooms switched off`}
          icon={Leaf}
          t="success"
        />
        <Stat
          label="Cameras counting"
          value={
            cameras.filter((c) =>
              c.detectors.some((d) => detectors[d].module === 'space'),
            ).length
          }
          icon={Video}
          t="muted"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Counting zones</CardTitle>
            <CardDescription>
              Live anonymous count against capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead className="w-[38%]">Now</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Peak
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((z) => {
                  const pct = Math.round((z.now / z.capacity) * 100);
                  return (
                    <TableRow key={z.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-3">
                          {persona.video && (
                            <img
                              src={mediaUrl(scenes[z.scene].still)}
                              alt=""
                              loading="lazy"
                              className="hidden h-9 w-14 shrink-0 rounded object-cover sm:block"
                            />
                          )}
                          <span className="text-sm">{z.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="tabular mb-1 text-xs">
                          {z.now.toLocaleString()} /{' '}
                          {z.capacity.toLocaleString()} · {pct}%
                        </div>
                        <Meter
                          value={pct}
                          t={
                            pct > 85
                              ? 'critical'
                              : pct > 60
                                ? 'warning'
                                : 'brand'
                          }
                        />
                      </TableCell>
                      <TableCell className="tabular hidden text-right sm:table-cell">
                        {z.peak.toLocaleString()}
                        <div className="text-xs text-muted-foreground">
                          {z.peakAt}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Footfall by hour</CardTitle>
              <CardDescription>Entries counted today</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={footfallConfig}
                className="aspect-auto h-56 w-full"
              >
                <LineChart data={footfall} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => v.slice(0, 2)}
                  />
                  <YAxis width={40} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={<ChartLegendContent className="flex-wrap" />}
                  />
                  <Line
                    dataKey="cafeteria"
                    stroke="var(--color-cafeteria)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="central"
                    stroke="var(--color-central)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="dtc"
                    stroke="var(--color-dtc)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Empty-room energy saving</CardTitle>
              <CardDescription>
                BACnet switched off AC and lights when the room stayed empty 30
                minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {energySavings.map((e) => (
                <div
                  key={e.room}
                  className="flex items-center justify-between gap-2"
                >
                  <span>
                    {e.room}
                    <span className="block text-xs text-muted-foreground">
                      Off at {e.off} for {e.hours} h
                    </span>
                  </span>
                  <span className="tabular font-medium">{e.kwh} kWh</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekday utilisation</CardTitle>
          <CardDescription>Average % of capacity, 07:00–18:00</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[26rem] text-[11px]">
            <thead>
              <tr>
                <th className="p-1 text-left font-medium text-muted-foreground">
                  Zone
                </th>
                {hours.map((h) => (
                  <th key={h} className="p-1 font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {utilisation.map((u) => (
                <tr key={u.zone}>
                  <td className="p-1 pr-2 whitespace-nowrap">{u.zone}</td>
                  {u.values.map((v, i) => (
                    <td key={i} className="p-0.5">
                      <span
                        title={`${u.zone} ${hours[i]}:00 · ${v}%`}
                        className="tabular grid h-6 place-items-center rounded text-[10px]"
                        style={{
                          background: `color-mix(in oklch, var(--primary) ${Math.round(v * 0.85)}%, var(--muted))`,
                          color: v > 55 ? 'white' : undefined,
                        }}
                      >
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <ModuleAlerts persona={persona} module="space" />
        <Features module="space" />
      </div>
      <Note>
        Counts come from anonymous line crossings and people-in-zone estimates.
        Nobody is identified, and classroom counts never score attention.
      </Note>
    </div>
  );
}
