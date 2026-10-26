'use client';
import { useState } from 'react';
import {
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  Search,
  ShieldAlert,
  Timer,
  Video,
  Zap,
  FastForward,
  BedDouble,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CameraFeed } from '../../_components/camera-feed';
import { CampusMap } from '../../_components/campus-map';
import {
  AlertStatusBadge,
  PageHeader,
  Pill,
  SeverityBadge,
  Stat,
  VerdictBadge,
} from '../../_components/ui-bits';
import {
  cameras,
  cameraById,
  detectors,
  healthLabel,
  modules,
  moduleIds,
  precincts,
  precinctIds,
  blockLabel,
  type Camera,
  type ModuleId,
  type PrecinctId,
} from '../../_data/um';
import {
  ackTimes,
  demoTriggers,
  isEscalated,
  isOpen,
  severityRank,
  type Alert,
} from '../../_data/alerts';
import type { Persona } from '../../_data/personas';
import { useDemo, nextAlertId } from '../../_lib/store';
import { alertsFor } from '../../_lib/scope';
import { navigate } from '../../_lib/router';
import { notify } from '../../_lib/notify';
import { AlertSheet, EscalationNote } from './alert-sheet';

/** Escalated first, then severity, then New before handled, newest first. */
export function queueSort(now: string) {
  return (a: Alert, b: Alert) =>
    Number(isEscalated(b, now)) - Number(isEscalated(a, now)) ||
    severityRank[a.severity] - severityRank[b.severity] ||
    Number(b.status === 'New') - Number(a.status === 'New') ||
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
}

const sevBar = {
  High: 'bg-critical',
  Medium: 'bg-warning',
  Low: 'bg-muted-foreground/40',
};

export function AlertRow({
  alert,
  onOpen,
}: {
  alert: Alert;
  onOpen: () => void;
}) {
  const { now } = useDemo();
  const where = alert.camera
    ? cameraById(alert.camera)?.name
    : `${alert.block ? blockLabel(alert.block) : ''} radar`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      <span
        className={cn('h-10 w-1 shrink-0 rounded-full', sevBar[alert.severity])}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{alert.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {modules[alert.module].name} · {where}
        </div>
        {isEscalated(alert, now) && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-critical">
            <ShieldAlert className="size-3" /> Escalated: no warden accepted in
            5 min
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <AlertStatusBadge status={alert.status} />
        <span className="tabular text-xs text-muted-foreground">
          {alert.time}
        </span>
      </div>
    </button>
  );
}

/** Demo controls: raise an alert, and move the demo clock on to show escalation. */
export function DemoControls() {
  const { state, dispatch } = useDemo();
  const [n, setN] = useState(0);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          const t = demoTriggers[n % demoTriggers.length];
          const rule = state.rules.find((r) => r.id === t.rule)!;
          const id = nextAlertId(state.alerts);
          dispatch({
            type: 'raise',
            alert: {
              id,
              rule: rule.id,
              detector: rule.detector,
              module: rule.module,
              block: rule.block,
              severity: t.severity,
              title: t.title,
              camera: rule.camera,
              date: '',
              time: '',
              confidence: t.confidence,
              status: 'New',
              route: rule.route,
              attributes: t.attributes,
              summary: t.summary,
              timeline: [
                {
                  time: '',
                  text: `Rule ${rule.id} fired: ${rule.name}. Snapshot and 10-second clip attached.`,
                  actor: 'EzVision',
                },
                { time: '', text: `Sent to ${rule.route}`, actor: 'EzVision' },
              ],
            },
          });
          setN(n + 1);
          notify.warning('New alert', `${id} · ${t.title}`);
        }}
      >
        <Zap />
        Raise a demo alert
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          dispatch({ type: 'tick', minutes: 5 });
          notify.info(
            'Demo clock moved on 5 minutes',
            'Hostel alerts nobody accepted have now escalated to the command centre.',
          );
        }}
      >
        <FastForward />
        Skip 5 minutes
      </Button>
    </>
  );
}

// ---------------------------------------------------------------- console --

/** Screen 1: command centre console. */
export function ConsoleView({ persona }: { persona: Persona }) {
  const { state, now } = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);
  const [cam, setCam] = useState<Camera | null>(null);
  const mine = alertsFor(persona, state.alerts);
  const open = mine.filter(isOpen).sort(queueSort(now));
  const escalated = open.filter((a) => isEscalated(a, now));
  const hostelTonight = mine.filter(
    (a) =>
      a.module === 'hostel' && a.date === '2026-10-26' && a.time >= '17:00',
  ).length;
  const online = cameras.filter((c) => c.status === 'online').length;
  const openCases = state.cases.filter((c) => c.status !== 'Closed').length;
  const wallCams = [
    ...new Set([
      ...open.map((a) => a.camera).filter((c): c is string => !!c),
      ...cameras.filter((c) => c.pilot).map((c) => c.id),
    ]),
  ]
    .map((id) => cameraById(id)!)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Universiti Malaya · EzVision Campus"
        title="Command centre"
        description="Live alerts from every module, most urgent first, on the campus map and the video wall. Hostel alerts go to the warden on duty first and come here if nobody accepts them within 5 minutes."
        actions={<DemoControls />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat
          label="Open alerts"
          value={open.length}
          hint={`${open.filter((a) => a.status === 'New').length} not yet acknowledged`}
          icon={BellRing}
          t="critical"
        />
        <Stat
          label="Escalated now"
          value={escalated.length}
          hint="Warden did not accept in 5 min"
          icon={ShieldAlert}
          t={escalated.length ? 'critical' : 'success'}
        />
        <Stat
          label="Hostel alerts tonight"
          value={hostelTonight}
          hint="Since 17:00, two pilot blocks"
          icon={BedDouble}
          t="brand"
        />
        <Stat
          label="Time to acknowledge"
          value={`${ackTimes.at(-1)!.p50} min`}
          hint={`P90 ${ackTimes.at(-1)!.p90} min`}
          icon={Timer}
          t="success"
        />
        <Stat
          label="Cameras online"
          value={`${online}/${cameras.length}`}
          hint={`${cameras.length - online} flagged by health check`}
          icon={Video}
          t="warning"
        />
        <Stat label="Open cases" value={openCases} icon={FolderOpen} t="info" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Campus map</CardTitle>
              <CardDescription>
                Open alerts, cameras and people counts. Pilot blocks: KK12 Blok
                A and KK9 Blok B (Zone 5).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampusMap
                alerts={open}
                onEvent={(a) => setOpenId(a.id)}
                onCamera={setCam}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Video wall</CardTitle>
              <CardDescription>
                Cameras with open alerts first, then the pilot cameras.
              </CardDescription>
              <CardAction>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/um/wall')}
                >
                  All {cameras.length} <ArrowRight />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {wallCams.map((c) => (
                <CameraFeed key={c.id} camera={c} onClick={() => setCam(c)} />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="content-start">
          <CardHeader>
            <CardTitle>Live alert queue</CardTitle>
            <CardDescription>
              Sorted by escalation, then severity.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/um/alerts')}
              >
                All <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-0.5">
            {open.map((a) => (
              <AlertRow key={a.id} alert={a} onOpen={() => setOpenId(a.id)} />
            ))}
            {open.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No open alerts.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
      <CameraDialog
        camera={cam}
        onClose={() => setCam(null)}
        onAlert={(id) => {
          setCam(null);
          setOpenId(id);
        }}
      />
    </div>
  );
}

// ----------------------------------------------------------------- alerts --

export function AlertsView({
  persona,
  focus,
  module,
  title = 'Alerts',
  description,
}: {
  persona: Persona;
  focus?: string;
  module?: ModuleId;
  title?: string;
  description?: string;
}) {
  const { state, now } = useDemo();
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [tab, setTab] = useState<'open' | 'closed' | 'all'>('open');
  const [q, setQ] = useState('');
  const [mod, setMod] = useState<'all' | ModuleId>(module ?? 'all');
  const mine = alertsFor(persona, state.alerts);
  const modsAvailable = moduleIds.filter((m) =>
    mine.some((a) => a.module === m),
  );

  const rows = mine
    .filter((a) =>
      tab === 'open' ? isOpen(a) : tab === 'closed' ? !isOpen(a) : true,
    )
    .filter((a) => mod === 'all' || a.module === mod)
    .filter(
      (a) =>
        !q ||
        `${a.id} ${a.title} ${a.camera ?? ''} ${a.camera ? cameraById(a.camera)?.name : a.sensor}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort(
      tab === 'open'
        ? queueSort(now)
        : (a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
    );

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title={title}
        description={
          description ??
          'Every alert moves through the same five steps: New, Acknowledged, Verified (true, false alarm or unsure), Actioned and Closed. False alarms feed back to tuning, so thresholds improve per camera.'
        }
        actions={
          (persona.id === 'director' || persona.id === 'operator') && (
            <DemoControls />
          )
        }
      />
      <Card>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="open">
                  Open ({mine.filter(isOpen).length})
                </TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-1 gap-2 md:justify-end">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search alerts"
                  className="pl-8"
                  aria-label="Search alerts"
                />
              </div>
              {!module && modsAvailable.length > 1 && (
                <NativeSelect
                  value={mod}
                  onChange={(e) => setMod(e.target.value as typeof mod)}
                  aria-label="Module"
                >
                  <NativeSelectOption value="all">
                    All modules
                  </NativeSelectOption>
                  {modsAvailable.map((m) => (
                    <NativeSelectOption key={m} value={m}>
                      {modules[m].name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-24 sm:table-cell">
                  Severity
                </TableHead>
                <TableHead>Alert</TableHead>
                <TableHead className="hidden md:table-cell">Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(a.id)}
                >
                  <TableCell className="hidden sm:table-cell">
                    <SeverityBadge severity={a.severity} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setOpenId(a.id);
                      }}
                    >
                      {a.title}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{a.id}</span> ·{' '}
                      {a.camera
                        ? cameraById(a.camera)?.name
                        : `${a.sensor} (radar)`}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <EscalationNote alert={a} now={now} />
                      {a.verdict && <VerdictBadge verdict={a.verdict} />}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal md:table-cell">
                    {modules[a.module].name}
                  </TableCell>
                  <TableCell>
                    <AlertStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {a.date === '2026-10-26'
                      ? a.time
                      : `${a.date.slice(8)} Oct ${a.time}`}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No alerts match.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// ------------------------------------------------------------- video wall --

export function CameraDialog({
  camera,
  onClose,
  onAlert,
}: {
  camera: Camera | null;
  onClose: () => void;
  onAlert?: (id: string) => void;
}) {
  const { state } = useDemo();
  const linked = camera
    ? state.alerts.filter((a) => a.camera === camera.id).slice(0, 5)
    : [];
  return (
    <Dialog open={!!camera} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        {camera && (
          <>
            <DialogHeader>
              <DialogTitle>{camera.name}</DialogTitle>
              <DialogDescription>
                {camera.id} · {precincts[camera.precinct].name} · {camera.edge}{' '}
                · zone type {camera.zoneType}
                {camera.partner && ` · ${camera.partner}`}
              </DialogDescription>
            </DialogHeader>
            <CameraFeed camera={camera} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Detectors on this camera
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {camera.detectors.map((d) => (
                    <Pill
                      key={d}
                      t={detectors[d].module === 'core' ? 'muted' : 'brand'}
                    >
                      {detectors[d].name}
                    </Pill>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  Health:{' '}
                  <Pill t={camera.status === 'online' ? 'success' : 'warning'}>
                    {healthLabel[camera.status]}
                  </Pill>
                  {camera.pilot && <Pill t="brand">Pilot camera</Pill>}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Recent alerts
                </div>
                {linked.length ? (
                  <ul className="grid gap-1 text-sm">
                    {linked.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left hover:underline"
                          onClick={() => onAlert?.(a.id)}
                        >
                          <AlertStatusBadge status={a.status} />
                          <span className="truncate">{a.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None.</p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VideoWall({ persona }: { persona: Persona }) {
  const [layout, setLayout] = useState<'4' | '9' | '16'>('9');
  const [filter, setFilter] = useState<'all' | 'pilot' | PrecinctId>('all');
  const [page, setPage] = useState(0);
  const [cam, setCam] = useState<Camera | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const list = cameras.filter(
    (c) =>
      filter === 'all' ||
      (filter === 'pilot' ? c.pilot : c.precinct === filter),
  );
  const per = Number(layout);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const p = Math.min(page, pages - 1);
  const shown = list.slice(p * per, p * per + per);
  const cols = {
    '4': 'sm:grid-cols-2',
    '9': 'sm:grid-cols-2 lg:grid-cols-3',
    '16': 'grid-cols-2 lg:grid-cols-4',
  }[layout];

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Video wall"
        description={`${cameras.length} cameras over RTSP/ONVIF sub-streams. Footage is synthetic. Live viewing is logged to the audit trail.`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as typeof filter);
            setPage(0);
          }}
          aria-label="Cameras"
        >
          <NativeSelectOption value="all">
            All cameras ({cameras.length})
          </NativeSelectOption>
          <NativeSelectOption value="pilot">
            Pilot cameras ({cameras.filter((c) => c.pilot).length})
          </NativeSelectOption>
          {precinctIds.map((id) => (
            <NativeSelectOption key={id} value={id}>
              {precincts[id].name} (
              {cameras.filter((c) => c.precinct === id).length})
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <ToggleGroup
          value={[layout]}
          onValueChange={(v) => {
            if (v[0]) {
              setLayout(v[0] as typeof layout);
              setPage(0);
            }
          }}
          variant="outline"
          aria-label="Layout"
        >
          <ToggleGroupItem value="4" aria-label="2 by 2">
            <Grid2x2 />
          </ToggleGroupItem>
          <ToggleGroupItem value="9" aria-label="3 by 3">
            <Grid3x3 />
          </ToggleGroupItem>
          <ToggleGroupItem value="16" aria-label="4 by 4">
            <LayoutGrid />
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={p === 0}
            onClick={() => setPage(p - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <span className="tabular">
            Page {p + 1} of {pages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={p >= pages - 1}
            onClick={() => setPage(p + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className={cn('grid gap-2', cols)}>
        {shown.map((c) => (
          <CameraFeed
            key={c.id}
            camera={c}
            compact={layout === '16'}
            onClick={() => setCam(c)}
          />
        ))}
      </div>
      <CameraDialog
        camera={cam}
        onClose={() => setCam(null)}
        onAlert={(id) => {
          setCam(null);
          setOpenId(id);
        }}
      />
      <AlertSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
