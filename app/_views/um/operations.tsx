'use client';
import { useMemo, useState } from 'react';
import {
  Siren,
  LifeBuoy,
  Footprints,
  Video,
  Timer,
  CalendarDays,
  CloudRain,
  ArrowRight,
  Search,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Phone,
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CameraFeed } from '../../_components/camera-feed';
import { CampusMap } from '../../_components/campus-map';
import {
  PageHeader,
  Stat,
  SeverityBadge,
  StatusBadge,
  Pill,
  Note,
  Meter,
} from '../../_components/ui-bits';
import {
  cameras,
  cameraById,
  cameraByScene,
  officers,
  guardTours,
  helpPoints,
  events,
  precincts,
  precinctIds,
  responseTimes,
  analytics,
  type Camera,
  type Incident,
  type PrecinctId,
} from '../../_data/um';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { navigate } from '../../_lib/router';
import { notify } from '../../_lib/notify';
import { IncidentSheet } from './incident-sheet';

const isOpen = (i: Incident) => !['Resolved', 'False alarm'].includes(i.status);
const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

function AlarmRow({
  incident,
  onOpen,
}: {
  incident: Incident;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      <span
        className={cn(
          'h-9 w-1 shrink-0 rounded-full',
          incident.severity === 'Critical'
            ? 'bg-critical'
            : incident.severity === 'High'
              ? 'bg-warning'
              : incident.severity === 'Medium'
                ? 'bg-info'
                : 'bg-muted-foreground/40',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{incident.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {incident.restricted ? 'Location withheld' : incident.location} ·{' '}
          {incident.source}
          {incident.confidence !== undefined &&
            ` · ${Math.round(incident.confidence * 100)}%`}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusBadge status={incident.status} />
        <span className="tabular text-xs text-muted-foreground">
          {incident.time}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------- overview --

export function Overview({ persona }: { persona: Persona }) {
  const { state } = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = state.incidents
    .filter(isOpen)
    .sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  const critical = open.filter(
    (i) => i.severity === 'Critical' || i.severity === 'High',
  );
  const online = cameras.filter((c) => c.status === 'online').length;
  const responding = officers.filter((o) => o.status !== 'On break').length;
  const live = state.sessions.filter(
    (s) => s.kind === 'SOS' || s.kind === 'Friend Walk',
  );
  const priority = open.find(
    (i) =>
      i.camera && !i.restricted && cameraById(i.camera)?.status === 'online',
  );
  const wallPreview = (
    ['security-queue', 'hall', 'gate', 'transit-concourse'] as const
  ).map(cameraByScene);

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Universiti Malaya · Main campus"
        title="Command overview"
        description="Everything that needs a decision right now: open alarms, people who asked for help, officers on the ground and what the cameras can and cannot see."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/um/wall')}>
              <Video />
              Video wall
            </Button>
            <Button onClick={() => navigate('/um/incidents')}>
              <Siren />
              Alarm queue
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat
          label="Open alarms"
          value={open.length}
          hint={`${critical.length} critical or high`}
          icon={Siren}
          t="critical"
        />
        <Stat
          label="SOS & safe walks"
          value={live.length}
          hint={`${state.sessions.filter((s) => s.kind === 'SOS').length} SOS active`}
          icon={LifeBuoy}
          t="brand"
        />
        <Stat
          label="Officers on duty"
          value={responding}
          hint={`${officers.filter((o) => o.status === 'Responding').length} responding`}
          icon={Footprints}
          t="info"
        />
        <Stat
          label="Cameras online"
          value={`${online}/${cameras.length}`}
          hint={`${cameras.length - online} need attention`}
          icon={Video}
          t="warning"
        />
        <Stat
          label="P90 response"
          value={`${responseTimes.at(-1)!.p90} min`}
          hint="Week 43 · target 8"
          icon={Timer}
          t="success"
        />
        <Stat
          label="Events live"
          value="1"
          hint="Convocation 19:30"
          icon={CalendarDays}
          t="info"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Live alarm queue</CardTitle>
            <CardDescription>
              AI video, access control, app SOS, help points and patrol reports
              in one list.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/um/incidents')}
              >
                All <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-0.5">
            {open.slice(0, 7).map((i) => (
              <AlarmRow
                key={i.id}
                incident={i}
                onOpen={() => setOpenId(i.id)}
              />
            ))}
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          {priority && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SeverityBadge severity={priority.severity} />
                  <span className="truncate">Priority camera</span>
                </CardTitle>
                <CardDescription className="truncate">
                  {priority.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CameraFeed
                  camera={cameraById(priority.camera!)!}
                  onClick={() => setOpenId(priority.id)}
                />
              </CardContent>
            </Card>
          )}
          <Card size="sm" className="bg-info-soft/60">
            <CardContent className="flex gap-3">
              <CloudRain className="mt-0.5 size-5 shrink-0 text-info" />
              <div className="text-sm">
                <div className="font-medium">
                  Heavy rain warning until 22:00
                </div>
                <div className="text-muted-foreground">
                  MetMalaysia warning for Kuala Lumpur. Faculty of Law basement
                  car park flooded in October 2024; the water-level analytic is
                  armed there.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Campus picture</CardTitle>
            <CardDescription>
              Cameras, open incidents, officers and active SOS or Friend Walk
              sessions.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/um/map')}
              >
                Map <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CampusMap
              onIncident={(i) => setOpenId(i.id)}
              onCamera={() => navigate('/um/wall')}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People who asked for help</CardTitle>
            <CardDescription>
              Location is shared only for the length of each session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {state.sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border p-2.5"
              >
                <Pill
                  t={
                    s.kind === 'SOS'
                      ? 'critical'
                      : s.kind === 'Safety timer'
                        ? 'warning'
                        : 'brand'
                  }
                >
                  {s.kind}
                </Pill>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="truncate">
                    {s.from}
                    {s.to !== '—' && ` → ${s.to}`}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {s.who} · {s.status}
                  </div>
                </div>
                <span className="tabular text-xs text-muted-foreground">
                  {s.started}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convocation tonight · Dewan Tunku Canselor</CardTitle>
          <CardDescription>
            {events[0].attendance.toLocaleString()} guests expected ·{' '}
            {events[0].staff} staff deployed · readiness {events[0].readiness}%
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/um/events')}
            >
              Event mode <ArrowRight />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {wallPreview.map((c) => (
            <CameraFeed key={c.id} camera={c} />
          ))}
        </CardContent>
      </Card>

      <IncidentSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// --------------------------------------------------------------- incidents --

export function IncidentsView({
  persona,
  focus,
}: {
  persona: Persona;
  focus?: string;
}) {
  const { state } = useDemo();
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [tab, setTab] = useState<'open' | 'all' | 'closed'>('open');
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');

  const scoped =
    persona.id === 'pengetua'
      ? state.incidents.filter(
          (i) => i.college === 'kk12' || i.precinct === 'residential',
        )
      : state.incidents;
  const rows = scoped
    .filter((i) =>
      tab === 'open' ? isOpen(i) : tab === 'closed' ? !isOpen(i) : true,
    )
    .filter((i) => sev === 'all' || i.severity === sev)
    .filter(
      (i) =>
        !q ||
        `${i.id} ${i.title} ${i.location} ${i.category}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (tab === 'open' ? sevRank[a.severity] - sevRank[b.severity] : 0) ||
        b.time.localeCompare(a.time),
    );

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title={
          persona.id === 'pengetua'
            ? 'KK12 alarms & incidents'
            : 'Alarm queue & incidents'
        }
        description={
          persona.id === 'pengetua'
            ? 'Alarms in and around your college. Case details for the wider campus stay with the security office.'
            : 'Every signal becomes one incident with one owner. AI candidates show a model confidence and must be verified by an operator before anything leaves the SOC.'
        }
      />
      <Card>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="open">
                  Open ({scoped.filter(isOpen).length})
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
                  placeholder="Search incidents"
                  className="pl-8"
                  aria-label="Search incidents"
                />
              </div>
              <NativeSelect
                value={sev}
                onChange={(e) => setSev(e.target.value)}
                aria-label="Severity"
              >
                <NativeSelectOption value="all">
                  All severities
                </NativeSelectOption>
                {Object.keys(sevRank).map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {s}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-24 sm:table-cell">
                  Severity
                </TableHead>
                <TableHead>Incident</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(i.id)}
                >
                  <TableCell className="hidden sm:table-cell">
                    <SeverityBadge severity={i.severity} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="mb-1 sm:hidden">
                      <SeverityBadge severity={i.severity} />
                    </div>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(i.id);
                      }}
                    >
                      {i.title}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{i.id}</span> ·{' '}
                      {i.restricted ? 'Location withheld' : i.location}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{i.source}</div>
                    {i.confidence !== undefined && (
                      <div className="tabular text-xs text-muted-foreground">
                        {Math.round(i.confidence * 100)}% confidence
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {i.assigned ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {i.time}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No incidents match.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <IncidentSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// -------------------------------------------------------------- video wall --

export function CameraDialog({
  camera,
  onClose,
}: {
  camera: Camera | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useDemo();
  const linked = camera
    ? state.incidents.filter((i) => i.camera === camera.id)
    : [];
  return (
    <Dialog open={!!camera} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        {camera && (
          <>
            <DialogHeader>
              <DialogTitle>{camera.name}</DialogTitle>
              <DialogDescription>
                {camera.id} · {precincts[camera.precinct].name} ·{' '}
                {camera.building}
                {camera.partner && ` · ${camera.partner}`}
              </DialogDescription>
            </DialogHeader>
            <CameraFeed camera={camera} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Analytics on this camera
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {camera.analytics.map((a) => (
                    <Pill
                      key={a}
                      t={analytics[a].status === 'Live' ? 'brand' : 'warning'}
                    >
                      {analytics[a].name}
                    </Pill>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Linked incidents
                </div>
                {linked.length ? (
                  <ul className="grid gap-1 text-sm">
                    {linked.map((i) => (
                      <li key={i.id} className="flex items-center gap-2">
                        <StatusBadge status={i.status} />
                        <span className="truncate">{i.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None today.</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="justify-self-start"
              onClick={() => {
                dispatch({
                  type: 'audit',
                  entry: {
                    who: 'Current user',
                    action: 'Requested playback',
                    target: camera.id,
                    reason: 'Pending DPO approval',
                  },
                });
                notify.info(
                  'Playback request sent to the DPO',
                  'Recorded footage needs an approved purpose. Live view is logged.',
                );
              }}
            >
              Request recorded playback
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VideoWall() {
  const [layout, setLayout] = useState<'4' | '9' | '16'>('9');
  const [precinct, setPrecinct] = useState<'all' | PrecinctId>('all');
  const [page, setPage] = useState(0);
  const [cam, setCam] = useState<Camera | null>(null);
  const list = cameras.filter(
    (c) => precinct === 'all' || c.precinct === precinct,
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
        description={`${cameras.length} cameras across ${precinctIds.length} precincts. Footage is synthetic. Live view is logged to the privacy audit trail.`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          value={precinct}
          onChange={(e) => {
            setPrecinct(e.target.value as typeof precinct);
            setPage(0);
          }}
          aria-label="Precinct"
        >
          <NativeSelectOption value="all">
            All precincts ({cameras.length})
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
      <CameraDialog camera={cam} onClose={() => setCam(null)} />
    </div>
  );
}

// --------------------------------------------------------------------- map --

export function MapView({ persona }: { persona: Persona }) {
  const [layers, setLayers] = useState({
    cameras: true,
    incidents: true,
    officers: true,
    colleges: true,
    sessions: true,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [cam, setCam] = useState<Camera | null>(null);
  const { state } = useDemo();
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Campus map"
        description="Schematic plan of the main campus with Zone 5 in Petaling Jaya inset. Select a camera or an incident marker."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_18rem]">
        <Card>
          <CardContent>
            <CampusMap
              layers={layers}
              onIncident={(i) => setOpenId(i.id)}
              onCamera={setCam}
            />
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Layers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <Label htmlFor={`layer-${k}`} className="capitalize">
                    {k === 'sessions' ? 'SOS & walks' : k}
                  </Label>
                  <Switch
                    id={`layer-${k}`}
                    checked={layers[k]}
                    onCheckedChange={(v) =>
                      setLayers((l) => ({ ...l, [k]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>By precinct</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {precinctIds.map((id) => {
                const cams = cameras.filter((c) => c.precinct === id);
                const open = state.incidents.filter(
                  (i) => i.precinct === id && isOpen(i),
                ).length;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{precincts[id].name}</span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {cams.length} cam{open ? ` · ${open} open` : ''}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
      <IncidentSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
      <CameraDialog camera={cam} onClose={() => setCam(null)} />
    </div>
  );
}

// --------------------------------------------------------------------- SOS --

export function SosView({ persona }: { persona: Persona }) {
  const { state } = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);
  const sosIncident = state.incidents.find(
    (i) => i.source === 'Student app SOS' && isOpen(i),
  );
  const okHp = helpPoints.filter((h) => h.ok).length;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="SOS & safe walks"
        description="Requests from the EzSafe app and the blue-light help points. Location is visible only while a session is running and is deleted when a Friend Walk ends."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Active SOS"
          value={state.sessions.filter((s) => s.kind === 'SOS').length}
          icon={Siren}
          t="critical"
        />
        <Stat
          label="Friend Walks"
          value={state.sessions.filter((s) => s.kind === 'Friend Walk').length}
          icon={Footprints}
          t="brand"
        />
        <Stat
          label="Escort requests"
          value={
            state.sessions.filter((s) => s.kind === 'Escort request').length
          }
          icon={LifeBuoy}
          t="info"
        />
        <Stat
          label="Help points working"
          value={`${okHp}/${helpPoints.length}`}
          icon={Phone}
          t="warning"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Requester
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Pill
                        t={
                          s.kind === 'SOS'
                            ? 'critical'
                            : s.kind === 'Safety timer'
                              ? 'warning'
                              : 'brand'
                        }
                      >
                        {s.kind}
                      </Pill>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {s.from}
                      {s.to !== '—' && ` → ${s.to}`}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {s.who}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {s.status}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {s.started}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          {sosIncident && (
            <Card size="sm" className="ring-critical/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Siren className="size-4 text-critical" />
                  SOS in progress
                </CardTitle>
                <CardDescription>{sosIncident.location}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {sosIncident.camera && persona.video && (
                  <CameraFeed camera={cameraById(sosIncident.camera)!} />
                )}
                <Button onClick={() => setOpenId(sosIncident.id)}>
                  Open incident
                </Button>
              </CardContent>
            </Card>
          )}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Help points</CardTitle>
              <CardDescription>
                Blue-light intercoms, last self-test 06:00
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-6 gap-1.5">
              {helpPoints.map((h) => (
                <span
                  key={h.id}
                  title={`${h.id} ${h.ok ? 'OK' : 'fault'}`}
                  className={cn(
                    'rounded py-1 text-center font-mono text-[10px]',
                    h.ok
                      ? 'bg-success-soft text-success'
                      : 'bg-critical-soft text-critical',
                  )}
                >
                  {h.id.slice(3)}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <IncidentSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// ------------------------------------------------------------------ patrol --

export function PatrolView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const waiting = useMemo(
    () =>
      state.incidents.filter((i) => isOpen(i) && !i.assigned && !i.restricted),
    [state.incidents],
  );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Patrol & dispatch"
        description="Polis Bantuan and security officers on shift, guard-tour progress and incidents still waiting for an officer."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Officers on shift</CardTitle>
            <CardDescription>Shift ends 23:00</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Callsign</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead className="hidden md:table-cell">Beat</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((o) => {
                  const job = state.incidents.find(
                    (i) => i.assigned === o.callsign && isOpen(i),
                  );
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {o.callsign}
                      </TableCell>
                      <TableCell>
                        <div>{o.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.rank}
                        </div>
                      </TableCell>
                      <TableCell className="hidden whitespace-normal md:table-cell">
                        {o.beat}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <Pill
                          t={
                            job
                              ? 'brand'
                              : o.status === 'On break'
                                ? 'muted'
                                : 'info'
                          }
                        >
                          {job ? 'Responding' : o.status}
                        </Pill>
                        {job && (
                          <div className="mt-1 max-w-[14rem] truncate text-xs text-muted-foreground">
                            {job.title}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Waiting for an officer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {waiting.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Every open incident has an officer.
                </p>
              )}
              {waiting.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-2 rounded-lg border p-2"
                >
                  <SeverityBadge severity={i.severity} />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {i.title}
                  </span>
                  {(persona.id === 'chief' || persona.id === 'soc') && (
                    <Button
                      size="xs"
                      onClick={() => {
                        const o =
                          officers.find(
                            (x) =>
                              x.status === 'On patrol' &&
                              x.precinct === i.precinct,
                          ) ?? officers.find((x) => x.status === 'On patrol')!;
                        dispatch({
                          type: 'assign',
                          id: i.id,
                          officer: o.callsign,
                          actor: persona.name,
                        });
                        notify.success(`${o.callsign} dispatched`, i.title);
                      }}
                    >
                      Dispatch nearest
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Guard tours tonight</CardTitle>
              <CardDescription>
                NFC checkpoints scanned in the EzPatrol app
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {guardTours.map((g) => (
                <div key={g.route} className="grid gap-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{g.route}</span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {g.done}/{g.checkpoints}
                    </span>
                  </div>
                  <Meter
                    value={(g.done / g.checkpoints) * 100}
                    t={
                      g.missed > 1
                        ? 'warning'
                        : g.done === g.checkpoints
                          ? 'success'
                          : 'brand'
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {g.officer === '—' ? 'Unassigned' : g.officer}
                      {g.missed > 0 && ` · ${g.missed} missed`}
                    </span>
                    <span
                      className={
                        g.due === 'Overdue' ? 'font-medium text-critical' : ''
                      }
                    >
                      {g.due === 'Overdue' ? 'Overdue' : `Due ${g.due}`}
                    </span>
                  </div>
                </div>
              ))}
              <Note>
                Rimba Ilmu boundary has no officer and a camera is offline on
                the southern fence. Consider reassigning PB-08 after break.
              </Note>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
