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
  CheckCircle2,
  CircleDashed,
  Cpu,
  Download,
  FileText,
  PlugZap,
  Search,
  ServerCog,
  Video,
  VideoOff,
  EyeOff,
  Move,
  Droplets,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Note,
  PageHeader,
  Pill,
  Stat,
  csvDownload,
} from '../../_components/ui-bits';
import {
  blockLabel,
  blocks,
  cameras,
  cameraById,
  edgeBoxes,
  healthIssues,
  healthLabel,
  modelVersions,
  modules,
  pilotCameras,
  uptimeDaily,
  type ModuleId,
} from '../../_data/um';
import {
  ackTimes,
  hostelByDoor,
  hostelWeekly,
  pilotKpis,
  precisionByModule,
} from '../../_data/alerts';
import {
  biasTest,
  dataRequests as seedRequests,
  integrations,
  openQuestions,
  perBlockCameras,
  privacyControls,
  retention,
  roles,
  rollout,
  shipsWith,
  siteComponents,
  sizing,
  users,
  type DataRequest,
} from '../../_data/govern';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';
import { Pdf, download } from '../../_lib/pdf';

// ----------------------------------------------------------- camera health --

const issueIcon = {
  offline: VideoOff,
  blocked: EyeOff,
  blurred: Droplets,
  moved: Move,
};

const uptimeConfig = {
  all: { label: 'All cameras', color: 'var(--chart-2)' },
  pilot: { label: 'Pilot cameras', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Screen 8: camera health. Offline, blocked, blurred or moved cameras, checked daily. */
export function HealthView({ persona }: { persona: Persona }) {
  const { dispatch } = useDemo();
  const [name, setName] = useState('');
  const [url, setUrl] = useState(
    'rtsp://10.20.4.31:554/Streaming/Channels/102',
  );
  const [edge, setEdge] = useState(edgeBoxes[1].id);
  const admin = persona.id === 'sysadmin' || persona.id === 'director';
  const count = (s: string) => cameras.filter((c) => c.status === s).length;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Camera health"
        description="Every camera is checked at 06:00 daily: no stream (offline), lens covered (blocked), out of focus or fogged (blurred), or pointing somewhere else (moved). A camera that cannot see is a coverage gap, never a quiet area."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="Online"
          value={`${count('online')}/${cameras.length}`}
          hint={`${uptimeDaily.at(-1)!.all.toFixed(1)}% today`}
          icon={Video}
          t="success"
        />
        <Stat
          label="Offline"
          value={count('offline')}
          icon={VideoOff}
          t="critical"
        />
        <Stat
          label="Blocked"
          value={count('blocked')}
          icon={EyeOff}
          t="warning"
        />
        <Stat
          label="Blurred"
          value={count('blurred')}
          icon={Droplets}
          t="warning"
        />
        <Stat
          label="Moved"
          value={count('moved')}
          hint="Rule paused until re-aimed"
          icon={Move}
          t="warning"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today’s health check</CardTitle>
          <CardDescription>
            06:00 run · {healthIssues.length} cameras need attention · all{' '}
            {pilotCameras.length} pilot cameras healthy
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {healthIssues.map((h) => {
            const c = cameraById(h.camera)!;
            const Icon = issueIcon[h.issue];
            return (
              <div
                key={h.camera}
                className="grid content-start gap-2 rounded-lg border p-3"
              >
                {persona.video && (
                  <CameraFeed camera={c} compact live={false} />
                )}
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-warning" />
                  <span className="text-sm font-medium">
                    {healthLabel[h.issue]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    since {h.since}
                  </span>
                </div>
                <div className="text-sm">{c.name}</div>
                <p className="text-xs text-muted-foreground">{h.detail}</p>
                <p className="text-xs">
                  <span className="font-medium">Action: </span>
                  {h.action}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily uptime</CardTitle>
            <CardDescription>
              % of cameras online, last 14 days. Pilot target 98% or better.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={uptimeConfig}
              className="aspect-auto h-56 w-full"
            >
              <LineChart data={uptimeDaily} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.split(' ')[0]}
                />
                <YAxis
                  width={36}
                  domain={[94, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <ReferenceLine
                  y={98}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 3"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="all"
                  stroke="var(--color-all)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="pilot"
                  stroke="var(--color-pilot)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="size-4" /> Edge boxes
            </CardTitle>
            <CardDescription>
              Video is analysed on campus; only events, snapshots and short
              clips leave the box.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Box</TableHead>
                  <TableHead className="text-right">Cameras</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    GPU
                  </TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Temp
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {edgeBoxes.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-normal">
                      <div className="font-mono text-xs">{b.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.site}
                      </div>
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {b.cameras}
                    </TableCell>
                    <TableCell className="tabular hidden text-right sm:table-cell">
                      {b.gpu}%
                    </TableCell>
                    <TableCell className="tabular hidden text-right sm:table-cell">
                      {b.temp}°C
                    </TableCell>
                    <TableCell>
                      <Pill t={b.status === 'Healthy' ? 'success' : 'warning'}>
                        {b.status}
                      </Pill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
              {modelVersions.map((m) => (
                <div key={m.model} className="flex justify-between gap-2">
                  <span>{m.model}</span>
                  <span className="font-mono">{m.version}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {admin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlugZap className="size-4" /> Add a camera
            </CardTitle>
            <CardDescription>
              Any brand over RTSP/ONVIF. EzVision reads the 720p sub-stream, so
              bandwidth stays low. Draw its zones and lines in the rules studio
              afterwards.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_1.4fr_12rem_auto] md:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="cam-name">Name</Label>
              <Input
                id="cam-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="KK12 Blok A, side door"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cam-url">Stream URL</Label>
              <Input
                id="cam-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cam-edge">Edge box</Label>
              <NativeSelect
                id="cam-edge"
                value={edge}
                onChange={(e) => setEdge(e.target.value)}
              >
                {edgeBoxes.map((b) => (
                  <NativeSelectOption key={b.id} value={b.id}>
                    {b.id}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                dispatch({
                  type: 'audit',
                  entry: {
                    who: persona.name,
                    action: `Added camera "${name.trim()}" (pending zones)`,
                    target: edge,
                    reason: 'Camera onboarding',
                  },
                });
                notify.success(
                  'Stream found',
                  `ONVIF Profile S · 1280×720 sub-stream · 15 fps. “${name.trim()}” is waiting for zones in the rules studio.`,
                );
                setName('');
              }}
            >
              Test and add
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Camera register</CardTitle>
          <CardDescription>
            {cameras.length} cameras · {pilotCameras.length} in the pilot
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                csvDownload('um-camera-register.csv', [
                  [
                    'Camera',
                    'Name',
                    'Zone type',
                    'Edge box',
                    'Health',
                    'Pilot',
                  ],
                  ...cameras.map((c) => [
                    c.id,
                    c.name,
                    c.zoneType,
                    c.edge,
                    c.status,
                    c.pilot ? 'yes' : 'no',
                  ]),
                ])
              }
            >
              <Download />
              CSV
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camera</TableHead>
                <TableHead className="hidden md:table-cell">
                  Zone type
                </TableHead>
                <TableHead className="hidden sm:table-cell">Edge</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cameras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-normal">
                    <div className="text-sm">{c.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {c.id}
                      {c.pilot && ' · pilot'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.zoneType}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs sm:table-cell">
                    {c.edge}
                  </TableCell>
                  <TableCell>
                    <Pill
                      t={
                        c.status === 'online'
                          ? 'success'
                          : c.status === 'offline'
                            ? 'critical'
                            : 'warning'
                      }
                    >
                      {healthLabel[c.status]}
                    </Pill>
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

// --------------------------------------------------------------- reports --

type ReportKind = 'weekly' | 'monthly' | 'hostel' | 'privacy' | 'module';

const reportCatalog: {
  kind: ReportKind;
  title: string;
  audience: string;
  when: string;
  contents: string[];
  for: Persona['id'][];
}[] = [
  {
    kind: 'weekly',
    title: 'Weekly security summary',
    audience: 'Security director',
    when: 'Every Monday, 08:00',
    contents: [
      'Alerts by module and outcome',
      'Escalations and time to acknowledge',
      'Camera health',
      'Open cases',
    ],
    for: ['director', 'operator'],
  },
  {
    kind: 'monthly',
    title: 'Monthly management report',
    audience: 'Deputy Vice-Chancellor (TNC HEP) and security director',
    when: '1st of each month',
    contents: [
      'Hostel breach trend',
      'Pilot KPIs',
      'Precision by module',
      'Cases referred to HEP',
      'Privacy and data requests',
    ],
    for: ['director'],
  },
  {
    kind: 'hostel',
    title: 'Hostel weekly breach report',
    audience: 'Pengetua and wardens (their college only)',
    when: 'Every Monday, 08:00',
    contents: [
      'Breaches by block, door and hour',
      'Semester trend',
      'Warden response times',
    ],
    for: ['director', 'pengetua'],
  },
  {
    kind: 'module',
    title: 'Monthly module report',
    audience: 'Office that owns the module',
    when: '1st of each month',
    contents: [
      'Alerts and outcomes for your module',
      'Precision and false alarms',
      'Camera health in your area',
    ],
    for: ['facilities', 'traffic', 'hep', 'director'],
  },
  {
    kind: 'privacy',
    title: 'Quarterly privacy report',
    audience: 'University DPO',
    when: 'Quarterly',
    contents: [
      'Views, searches and exports from the audit log',
      'Data requests',
      'Retention purges',
      'Rule changes',
    ],
    for: ['dpo', 'director'],
  },
];

const moduleFor: Partial<Record<Persona['id'], ModuleId[]>> = {
  facilities: ['hse', 'space'],
  traffic: ['mobility'],
  hep: ['hostel', 'welfare'],
};

function buildReport(
  kind: ReportKind,
  persona: Persona,
  state: ReturnType<typeof useDemo>['state'],
) {
  const r = reportCatalog.find((x) => x.kind === kind)!;
  const pdf = new Pdf();
  pdf.rect(0, 0, 595, 42, [0.63, 0.11, 0.38]);
  pdf.text(`EzVision Campus · ${r.title}`, {
    y: 14,
    size: 13,
    bold: true,
    gray: 1,
  });
  pdf.y = 60;
  pdf.text('Universiti Malaya · prepared 26 Oct 2026', { bold: true });
  pdf.text(`For: ${r.audience} · requested by ${persona.name}`, { gray: 0.3 });
  pdf.gap();
  const mods =
    kind === 'module'
      ? (moduleFor[persona.id] ?? (['safe'] as ModuleId[]))
      : (Object.keys(modules) as ModuleId[]);
  if (kind !== 'privacy') {
    pdf.text('Alerts by module (30 days)', { bold: true, size: 11 });
    for (const p of precisionByModule.filter((x) => mods.includes(x.module))) {
      pdf.text(
        `${modules[p.module].name}: ${p.confirmed} verified true, ${p.false} false alarms (${Math.round((p.confirmed / (p.confirmed + p.false)) * 100)}% precision)`,
        { size: 9 },
      );
    }
    pdf.gap();
  }
  if (kind === 'weekly' || kind === 'monthly' || kind === 'hostel') {
    pdf.text('Hostel Integrity: confirmed breaches per week', {
      bold: true,
      size: 11,
    });
    const scope =
      persona.id === 'pengetua'
        ? blocks.filter((b) => b.college === persona.alerts.college)
        : blocks;
    for (const w of hostelWeekly) {
      const v = scope.reduce((s, b) => s + (b.id === 'kk12-a' ? w.a : w.b), 0);
      pdf.need(16);
      pdf.text(w.week, { size: 9, y: pdf.y });
      pdf.rect(150, pdf.y, (v / 30) * 330, 10, [0.63, 0.11, 0.38]);
      pdf.text(String(v), { x: 155 + (v / 30) * 330, size: 9, y: pdf.y });
      pdf.y += 16;
    }
    for (const d of hostelByDoor.filter((x) =>
      scope.some((b) => b.id === x.block),
    ))
      pdf.text(`${blockLabel(d.block)} · ${d.door}: ${d.count}`, { size: 9 });
    pdf.text(
      `Time to acknowledge: median ${ackTimes.at(-1)!.p50} min, P90 ${ackTimes.at(-1)!.p90} min`,
      { size: 9 },
    );
    pdf.gap();
  }
  if (kind === 'monthly') {
    pdf.text('Pilot KPIs', { bold: true, size: 11 });
    for (const k of pilotKpis)
      pdf.text(`${k.kpi}: ${k.value} (target: ${k.target})`, { size: 9 });
    pdf.gap();
  }
  if (kind === 'weekly' || kind === 'monthly' || kind === 'module') {
    pdf.text('Cases', { bold: true, size: 11 });
    for (const c of state.cases.filter(
      (c) => kind !== 'module' || mods.includes(c.module),
    ))
      pdf.text(`${c.id} · ${c.status} · ${c.title}`, { size: 9 });
    pdf.gap();
    pdf.text('Camera health', { bold: true, size: 11 });
    pdf.text(
      `${cameras.filter((c) => c.status === 'online').length} of ${cameras.length} online; pilot cameras ${uptimeDaily.at(-1)!.pilot}% today.`,
      { size: 9 },
    );
    for (const h of healthIssues)
      pdf.text(
        `${healthLabel[h.issue]}: ${cameraById(h.camera)?.name} since ${h.since}`,
        { size: 9 },
      );
    pdf.gap();
  }
  if (kind === 'privacy' || kind === 'monthly') {
    pdf.text('Privacy', { bold: true, size: 11 });
    const exports = state.audit.filter((a) =>
      a.action.startsWith('Exported'),
    ).length;
    const searches = state.audit.filter((a) =>
      a.action.startsWith('Searched'),
    ).length;
    pdf.text(
      `Audit entries this session: ${state.audit.length} · searches ${searches} · exports ${exports}`,
      { size: 9 },
    );
    for (const d of seedRequests)
      pdf.text(`${d.id} · ${d.kind} · ${d.status}`, { size: 9 });
    if (kind === 'privacy')
      for (const a of state.audit.slice(0, 20))
        pdf.para(
          `${a.time} · ${a.who} · ${a.action} · ${a.target} · ${a.reason}`,
          { size: 8 },
        );
    pdf.gap();
  }
  pdf.para(
    'Counts name no one. A person verified every alert counted as true; AI never issues a penalty. Demonstration data.',
    { size: 8, gray: 0.45 },
  );
  download(`ezvision-${kind}-report.pdf`, pdf.build());
}

const precConfig = {
  confirmed: { label: 'Verified true', color: 'var(--chart-1)' },
  false: { label: 'False alarm', color: 'var(--chart-4)' },
} satisfies ChartConfig;

/** Screen 9: weekly and monthly PDFs for management. */
export function ReportsView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const mine = reportCatalog.filter((r) => r.for.includes(persona.id));
  const scoped = moduleFor[persona.id];
  const prec = precisionByModule
    .filter((p) => !scoped || scoped.includes(p.module))
    .map((p) => ({ ...p, name: modules[p.module].name }));
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Reports"
        description="Weekly and monthly PDF summaries, generated from the same alerts, cases and camera-health data as the console. Each office gets the report for its own area."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mine.map((r) => (
          <Card key={r.kind}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                {r.title}
              </CardTitle>
              <CardDescription>
                {r.audience} · {r.when}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ul className="grid gap-1 text-sm text-muted-foreground">
                {r.contents.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="justify-self-start"
                onClick={() => {
                  buildReport(r.kind, persona, state);
                  dispatch({
                    type: 'audit',
                    entry: {
                      who: persona.name,
                      action: `Downloaded ${r.title}`,
                      target: 'Reports',
                      reason: r.audience,
                    },
                  });
                }}
              >
                <Download />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Precision by module</CardTitle>
            <CardDescription>
              Alerts a person verified as true vs false alarms, 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={precConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={prec}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="confirmed"
                  stackId="p"
                  fill="var(--color-confirmed)"
                />
                <Bar
                  dataKey="false"
                  stackId="p"
                  fill="var(--color-false)"
                  radius={[0, 3, 3, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pilot KPIs</CardTitle>
            <CardDescription>
              Agreed with the university at the survey · live pilot week 5 of 8
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Now</TableHead>
                  <TableHead className="hidden md:table-cell">Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilotKpis.map((k) => (
                  <TableRow key={k.kpi}>
                    <TableCell className="whitespace-normal">
                      <div className="text-sm">{k.kpi}</div>
                      <div className="text-xs text-muted-foreground">
                        {k.measured}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2
                          className={cn(
                            'size-4 shrink-0',
                            k.met ? 'text-success' : 'text-warning',
                          )}
                        />
                        {k.value}
                      </span>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal text-xs text-muted-foreground md:table-cell">
                      {k.target}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {(persona.id === 'director' || persona.id === 'operator') && (
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() =>
            csvDownload('ezvision-alerts.csv', [
              [
                'Alert',
                'Date',
                'Time',
                'Module',
                'Rule',
                'Severity',
                'Status',
                'Verdict',
                'Action',
                'Outcome',
              ],
              ...state.alerts.map((a) => [
                a.id,
                a.date,
                a.time,
                modules[a.module].name,
                a.rule,
                a.severity,
                a.status,
                a.verdict ?? '',
                a.action ?? '',
                a.outcome ?? '',
              ]),
            ])
          }
        >
          <Download />
          Export alerts (CSV)
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------- admin & privacy --

const requestTone = {
  Pending: 'warning',
  Approved: 'success',
  Refused: 'critical',
  Completed: 'muted',
} as const;

/** Screen 10: admin and privacy. Users, roles, retention, audit log, data requests. */
export function AdminView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const [requests, setRequests] = useState<DataRequest[]>(seedRequests);
  const [q, setQ] = useState('');
  const [clipDays, setClipDays] = useState('30');
  const [newUser, setNewUser] = useState('');
  const [newRole, setNewRole] = useState(roles[2].role);
  const isDpo = persona.id === 'dpo' || persona.id === 'director';
  const isAdmin = persona.id === 'sysadmin' || persona.id === 'director';
  const audit = state.audit.filter(
    (a) =>
      !q ||
      `${a.who} ${a.action} ${a.target} ${a.reason}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  const decide = (id: string, status: 'Approved' | 'Refused') => {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === id
          ? { ...r, status, decision: `DPO: ${status.toLowerCase()} 26 Oct` }
          : r,
      ),
    );
    dispatch({
      type: 'audit',
      entry: {
        who: persona.name,
        action: `${status} data request`,
        target: id,
        reason: requests.find((r) => r.id === id)!.purpose,
      },
    });
    notify.success(
      `${id} ${status.toLowerCase()}`,
      'Written to the audit log.',
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Admin & privacy"
        description="Users and roles, retention, the audit log and data requests. Privacy is built into the defaults so the DPO can approve the system quickly under the amended PDPA."
      />
      <Tabs defaultValue={isDpo ? 'audit' : 'users'} className="grid gap-4">
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="users">Users & roles</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
            <TabsTrigger value="requests">Data requests</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="privacy">Privacy defaults</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="users" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Single sign-on through Microsoft Entra ID; leavers are removed
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Scope
                    </TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Last active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.name}>
                      <TableCell className="whitespace-normal">
                        {u.name}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {u.role}
                      </TableCell>
                      <TableCell className="hidden whitespace-normal md:table-cell">
                        {u.scope}
                      </TableCell>
                      <TableCell className="tabular hidden text-right sm:table-cell">
                        {u.last}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isAdmin && (
                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-user">University email</Label>
                    <Input
                      id="new-user"
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      placeholder="name@um.edu.my"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-role">Role</Label>
                    <NativeSelect
                      id="new-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      {roles.map((r) => (
                        <NativeSelectOption key={r.role} value={r.role}>
                          {r.role}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button
                    disabled={!newUser.includes('@')}
                    onClick={() => {
                      dispatch({
                        type: 'audit',
                        entry: {
                          who: persona.name,
                          action: `Added user as ${newRole}`,
                          target: newUser,
                          reason: 'Admin',
                        },
                      });
                      notify.success(
                        'User invited',
                        `${newUser} signs in with university SSO as ${newRole}.`,
                      );
                      setNewUser('');
                    }}
                  >
                    Add user
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Ten roles, each seeing only its own module and area. A warden
                sees one college; the command centre sees the whole campus.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Sees</TableHead>
                    <TableHead>Can do</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r.role}>
                      <TableCell className="font-medium whitespace-normal">
                        {r.role}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.office}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.sees}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.can}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>
                Every view, search, export and rule change, kept for 7 years.
                Includes what you did in this demo session.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    csvDownload('ezvision-audit.csv', [
                      ['Time', 'Who', 'Action', 'Target', 'Reason'],
                      ...state.audit.map((a) => [
                        a.time,
                        a.who,
                        a.action,
                        a.target,
                        a.reason,
                      ]),
                    ])
                  }
                >
                  <Download />
                  CSV
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="relative max-w-sm">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Filter the log"
                  className="pl-8"
                  aria-label="Filter the audit log"
                />
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[36rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Who</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="tabular">{a.time}</TableCell>
                        <TableCell className="whitespace-normal">
                          {a.who}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {a.action}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-normal">
                          {a.target}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {a.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Data requests</CardTitle>
              <CardDescription>
                Police requests, data subject access and corrections. The DPO
                decides; every decision is logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-normal">
                        <div className="font-mono text-xs">{r.id}</div>
                        <div className="text-sm">{r.requester}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.kind}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.purpose}
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-normal">
                        {r.scope}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <Pill t={requestTone[r.status]}>{r.status}</Pill>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {r.decision}
                        </div>
                        {r.status === 'Pending' && isDpo && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => decide(r.id, 'Approved')}
                              aria-label={`Approve ${r.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decide(r.id, 'Refused')}
                              aria-label={`Refuse ${r.id}`}
                            >
                              Refuse
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention</CardTitle>
              <CardDescription>
                The system stores events and alerts, not identities. Raw
                detections live seconds on the edge box.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="clip-days">Alert clips kept for</Label>
                  <NativeSelect
                    id="clip-days"
                    value={clipDays}
                    disabled={!isDpo}
                    onChange={(e) => setClipDays(e.target.value)}
                  >
                    {['14', '30', '60', '90'].map((d) => (
                      <NativeSelectOption key={d} value={d}>
                        {d} days{d === '30' ? ' (default)' : ''}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                {isDpo && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch({
                        type: 'audit',
                        entry: {
                          who: persona.name,
                          action: `Set alert clip retention to ${clipDays} days`,
                          target: 'Retention policy',
                          reason: 'DPO review',
                        },
                      });
                      notify.success(
                        'Retention saved',
                        `Alert clips older than ${clipDays} days are purged nightly at 03:00.`,
                      );
                    }}
                  >
                    Save
                  </Button>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Kept for</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retention.map((r) => (
                    <TableRow key={r.entity}>
                      <TableCell className="whitespace-normal">
                        {r.entity}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.entity.startsWith('Alert')
                          ? `${clipDays} days${clipDays === '30' ? ' by default' : ''}`
                          : r.keep}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy defaults</CardTitle>
              <CardDescription>
                Biometric data is sensitive personal data under the amended
                PDPA; DPO and breach-notification duties apply from 1 June 2025;
                fines reach RM1,000,000; processors such as EzGIG carry security
                duties directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[36rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Control</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Why</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privacyControls.map((c) => (
                    <TableRow key={c.control}>
                      <TableCell className="font-medium whitespace-normal">
                        {c.control}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {c.default}
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {c.why}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bias test</CardTitle>
                <CardDescription>
                  Gender and behaviour models, across hijab, hoodies, long hair
                  and night infrared. No accuracy figure is claimed before this
                  runs on pilot footage.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {biasTest.map((b) => (
                  <div
                    key={b.group}
                    className="flex items-start justify-between gap-3"
                  >
                    <span>
                      {b.group}
                      {b.note && (
                        <span className="block text-xs text-muted-foreground">
                          {b.note}
                        </span>
                      )}
                    </span>
                    <Pill t="warning">
                      <CircleDashed className="size-3" />
                      {b.status}
                    </Pill>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ships with every deployment</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1.5 text-sm">
                {shipsWith.map((s) => (
                  <div key={s} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {s}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------- rollout --

const stageTone = { Done: 'success', Planned: 'muted' } as const;

export function RolloutView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Pilot & rollout"
        description="One paid pilot on two hostel blocks (one female, one male) and the main gate, about 20 cameras. Prove the numbers, then expand block by block. Each phase passes a gate before the next starts."
      />
      <Note>
        This demo shows all six modules running so every screen can be seen. In
        the real pilot only Hostel Integrity at KK12 Blok A and KK9 Blok B, and
        plate recognition at the main gate, would be live.
      </Note>
      <Card>
        <CardHeader>
          <CardTitle>Stages and gates</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {rollout.map((r, i) => (
              <li
                key={r.stage}
                className={cn(
                  'grid content-start gap-1.5 rounded-lg border p-3',
                  r.status.startsWith('Week') &&
                    'border-primary ring-2 ring-primary/20',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {i + 1} · {r.length}
                  </span>
                  <Pill
                    t={stageTone[r.status as keyof typeof stageTone] ?? 'brand'}
                  >
                    {r.status}
                  </Pill>
                </div>
                <div className="text-sm font-medium">{r.stage}</div>
                <p className="text-xs text-muted-foreground">{r.work}</p>
                {r.gate !== '—' && (
                  <p className="text-xs">
                    <span className="font-medium">Gate: </span>
                    {r.gate}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilot KPIs</CardTitle>
            <CardDescription>Measured over live weeks 1–5</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Now</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilotKpis.map((k) => (
                  <TableRow key={k.kpi}>
                    <TableCell className="whitespace-normal">{k.kpi}</TableCell>
                    <TableCell className="whitespace-normal font-medium">
                      {k.value}
                    </TableCell>
                    <TableCell className="whitespace-normal text-xs text-muted-foreground">
                      {k.target}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sizing</CardTitle>
            <CardDescription>
              Planning estimates, to be confirmed in a site survey
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-right">Cameras</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizing.map((s) => (
                  <TableRow key={s.stage}>
                    <TableCell>{s.stage}</TableCell>
                    <TableCell className="whitespace-normal">
                      {s.scope}
                    </TableCell>
                    <TableCell className="text-right whitespace-normal">
                      {s.cameras}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">
              This demo mounts {pilotCameras.length} pilot cameras on sample
              footage; the side doors that most hostels lack would get new
              cameras after the survey.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cameras per hostel block</CardTitle>
            <CardDescription>
              Reuse existing cameras that cover a doorway at head-and-shoulder
              angle; add cameras only at side doors and fire exits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Cameras</TableHead>
                  <TableHead className="hidden sm:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perBlockCameras.map((p) => (
                  <TableRow key={p.position}>
                    <TableCell className="whitespace-normal">
                      {p.position}
                    </TableCell>
                    <TableCell>{p.cameras}</TableCell>
                    <TableCell className="hidden whitespace-normal text-xs text-muted-foreground sm:table-cell">
                      {p.notes}
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
              <ServerCog className="size-4" /> Site components
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {siteComponents.map((s) => (
              <div key={s.part}>
                <span className="font-medium">{s.part}. </span>
                <span className="text-muted-foreground">{s.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Only the camera feed and messaging are needed for the pilot; the
            rest add accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[44rem]">
            <TableHeader>
              <TableRow>
                <TableHead>System</TableHead>
                <TableHead>Why</TableHead>
                <TableHead>How</TableHead>
                <TableHead>Pilot?</TableHead>
                <TableHead>At UM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((x) => (
                <TableRow key={x.system}>
                  <TableCell className="font-medium whitespace-normal">
                    {x.system}
                  </TableCell>
                  <TableCell className="whitespace-normal">{x.why}</TableCell>
                  <TableCell className="whitespace-normal">{x.how}</TableCell>
                  <TableCell>{x.pilot}</TableCell>
                  <TableCell className="whitespace-normal">
                    <Pill t={x.state === 'Not connected' ? 'muted' : 'success'}>
                      {x.state}
                    </Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Open questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-1.5 text-sm">
            {openQuestions.map((q) => (
              <li key={q} className="flex gap-2">
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-warning" />
                {q}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
