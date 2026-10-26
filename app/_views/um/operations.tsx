'use client';
import { useState } from 'react';
import {
  ScanEye,
  Video,
  Users,
  Timer,
  BadgeCheck,
  ArrowRight,
  Search,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bookmark,
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
import { CampusMap, type MapLayers } from '../../_components/campus-map';
import {
  PageHeader,
  Stat,
  SeverityBadge,
  EventStatusBadge,
  Pill,
  Meter,
} from '../../_components/ui-bits';
import {
  cameras,
  cameraById,
  cameraByScene,
  precincts,
  precinctIds,
  analytics,
  zones,
  verifyTimes,
  verification,
  demoDetections,
  isOpenEvent,
  type Camera,
  type CameraEvent,
  type PrecinctId,
} from '../../_data/um';
import type { Persona } from '../../_data/personas';
import { useDemo, nextEventId } from '../../_lib/store';
import { navigate } from '../../_lib/router';
import { notify } from '../../_lib/notify';
import { EventSheet } from './event-sheet';

const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

function EventRow({
  event,
  onOpen,
}: {
  event: CameraEvent;
  onOpen: () => void;
}) {
  const cam = cameraById(event.camera)!;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      <span
        className={cn(
          'h-9 w-1 shrink-0 rounded-full',
          event.severity === 'Critical'
            ? 'bg-critical'
            : event.severity === 'High'
              ? 'bg-warning'
              : event.severity === 'Medium'
                ? 'bg-info'
                : 'bg-muted-foreground/40',
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{event.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {cam.id} · {analytics[event.analytic].name} ·{' '}
          {Math.round(event.confidence * 100)}%
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <EventStatusBadge status={event.status} />
        <span className="tabular text-xs text-muted-foreground">
          {event.time}
        </span>
      </div>
    </button>
  );
}

/** Simulates a new detection so the console → mobile loop can be shown live. */
function DemoDetectionButton() {
  const { state, dispatch } = useDemo();
  const [n, setN] = useState(0);
  return (
    <Button
      variant="outline"
      onClick={() => {
        const d = demoDetections[n % demoDetections.length];
        const id = nextEventId(state.events);
        dispatch({
          type: 'raise',
          event: {
            id,
            title: d.title,
            analytic: d.analytic,
            severity: d.severity,
            status: 'New',
            confidence: 0.84,
            camera: cameraByScene(d.scene).id,
            time: '',
            date: '2026-10-26',
            summary:
              'Raised by the demo control to show a live detection arriving in the console and on EzVision Mobile.',
            timeline: [
              {
                time: '',
                text: `${analytics[d.analytic].name} detected`,
                actor: 'EzVision',
              },
            ],
          },
        });
        setN(n + 1);
        notify.warning('New detection', `${id} · ${d.title}`);
      }}
    >
      <Zap />
      Run a demo detection
    </Button>
  );
}

// ---------------------------------------------------------------- overview --

export function Overview({ persona }: { persona: Persona }) {
  const { state } = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = state.events
    .filter(isOpenEvent)
    .sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  const awaiting = state.events.filter((e) => e.status === 'New').length;
  const online = cameras.filter((c) => c.status === 'online').length;
  const people = zones.reduce((a, z) => a + z.now, 0);
  const confirmed = verification.reduce((a, v) => a + v.confirmed, 0);
  const all = verification.reduce((a, v) => a + v.confirmed + v.false, 0);
  const priority = open.find((e) => cameraById(e.camera)?.status === 'online');
  const busiest = [...zones]
    .sort((a, b) => b.now / b.capacity - a.now / a.capacity)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Universiti Malaya · Camera intelligence"
        title="Overview"
        description="What the campus cameras and their analytics are seeing now: detections awaiting a person, live counts, and which cameras are not seeing anything."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/um/wall')}>
              <Video />
              Video wall
            </Button>
            <Button onClick={() => navigate('/um/events')}>
              <ScanEye />
              Detections
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat
          label="Cameras online"
          value={`${online}/${cameras.length}`}
          hint={`${cameras.length - online} need attention`}
          icon={Video}
          t="warning"
        />
        <Stat
          label="Analytics live"
          value={
            Object.values(analytics).filter((a) => a.status === 'Live').length
          }
          hint="2 pilot · 1 evaluation"
          icon={ScanEye}
          t="brand"
        />
        <Stat
          label="Detections today"
          value={state.events.length}
          hint={`${awaiting} awaiting verification`}
          icon={Zap}
          t="critical"
        />
        <Stat
          label="People counted now"
          value={people.toLocaleString()}
          hint={`${zones.length} counting zones`}
          icon={Users}
          t="info"
        />
        <Stat
          label="Time to verify"
          value={`${verifyTimes.at(-1)!.p50} s`}
          hint={`P90 ${verifyTimes.at(-1)!.p90} s`}
          icon={Timer}
          t="success"
        />
        <Stat
          label="Precision (90 d)"
          value={`${Math.round((confirmed / all) * 100)}%`}
          hint="Operator-confirmed"
          icon={BadgeCheck}
          t="success"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Open detections</CardTitle>
            <CardDescription>
              New and verified detections from every analytic, most severe
              first.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/um/events')}
              >
                All <ArrowRight />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-0.5">
            {open.slice(0, 7).map((e) => (
              <EventRow key={e.id} event={e} onOpen={() => setOpenId(e.id)} />
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
                  camera={cameraById(priority.camera)!}
                  onClick={() => setOpenId(priority.id)}
                />
              </CardContent>
            </Card>
          )}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Busiest zones now</CardTitle>
              <CardAction>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/um/occupancy')}
                >
                  Counts <ArrowRight />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {busiest.map((z) => {
                const pct = Math.round((z.now / z.capacity) * 100);
                return (
                  <div key={z.id} className="grid gap-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate">{z.name}</span>
                      <span className="tabular shrink-0 text-muted-foreground">
                        {z.now.toLocaleString()} · {pct}%
                      </span>
                    </div>
                    <Meter
                      value={pct}
                      t={pct > 85 ? 'critical' : pct > 60 ? 'warning' : 'brand'}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera map</CardTitle>
          <CardDescription>
            Cameras, open detections and anonymous people counts by zone.
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
            onEvent={(e) => setOpenId(e.id)}
            onCamera={() => navigate('/um/wall')}
          />
        </CardContent>
      </Card>

      <EventSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// --------------------------------------------------------------- detections --

export function EventsView({
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
  const [analytic, setAnalytic] = useState('all');

  const rows = state.events
    .filter((e) =>
      tab === 'open'
        ? isOpenEvent(e)
        : tab === 'closed'
          ? !isOpenEvent(e)
          : true,
    )
    .filter((e) => analytic === 'all' || e.analytic === analytic)
    .filter(
      (e) =>
        !q ||
        `${e.id} ${e.title} ${e.camera} ${cameraById(e.camera)?.name}`
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
        title="AI detections"
        description="Every detection from every analytic, with the camera, the model's confidence and the operator's decision. Nothing is shared with anyone until an operator has verified it on video."
        actions={
          (persona.id === 'director' || persona.id === 'operator') && (
            <DemoDetectionButton />
          )
        }
      />
      <Card>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="open">
                  Open ({state.events.filter(isOpenEvent).length})
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
                  placeholder="Search detections"
                  className="pl-8"
                  aria-label="Search detections"
                />
              </div>
              <NativeSelect
                value={analytic}
                onChange={(e) => setAnalytic(e.target.value)}
                aria-label="Analytic"
              >
                <NativeSelectOption value="all">
                  All analytics
                </NativeSelectOption>
                {Object.entries(analytics).map(([id, a]) => (
                  <NativeSelectOption key={id} value={id}>
                    {a.name}
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
                <TableHead>Detection</TableHead>
                <TableHead className="hidden md:table-cell">Analytic</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Confidence
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => (
                <TableRow
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(e.id)}
                >
                  <TableCell className="hidden sm:table-cell">
                    <SeverityBadge severity={e.severity} />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="mb-1 sm:hidden">
                      <SeverityBadge severity={e.severity} />
                    </div>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setOpenId(e.id);
                      }}
                    >
                      {e.title}
                    </button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-mono">{e.id}</span> ·{' '}
                      {cameraById(e.camera)?.name}
                      {e.bookmarked && (
                        <Bookmark
                          className="size-3 text-primary"
                          aria-label="Clip kept"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal md:table-cell">
                    {analytics[e.analytic].name}
                  </TableCell>
                  <TableCell className="tabular hidden text-right lg:table-cell">
                    {Math.round(e.confidence * 100)}%
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                    {e.time}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No detections match.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EventSheet
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
    ? state.events.filter((e) => e.camera === camera.id)
    : [];
  const zone = camera ? zones.find((z) => z.scene === camera.scene) : undefined;
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
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
                <div className="mt-3 mb-1.5 text-xs font-medium text-muted-foreground">
                  Detections today
                </div>
                {linked.length ? (
                  <ul className="grid gap-1 text-sm">
                    {linked.map((e) => (
                      <li key={e.id} className="flex items-center gap-2">
                        <EventStatusBadge status={e.status} />
                        <span className="truncate">{e.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None today.</p>
                )}
              </div>
              {zone && (
                <div className="rounded-lg bg-muted/60 p-3">
                  <div className="text-xs text-muted-foreground">
                    People in view now
                  </div>
                  <div className="tabular text-2xl font-semibold">
                    {zone.now.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {zone.capacity.toLocaleString()} · peak{' '}
                    {zone.peak.toLocaleString()} at {zone.peakAt}
                  </div>
                </div>
              )}
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
  const [layers, setLayers] = useState<MapLayers>({
    cameras: true,
    detections: true,
    occupancy: true,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [cam, setCam] = useState<Camera | null>(null);
  const { state } = useDemo();
  const labels: Record<keyof MapLayers, string> = {
    cameras: 'Cameras',
    detections: 'Open detections',
    occupancy: 'People counts',
  };
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Camera map"
        description="Schematic plan of the main campus with Zone 5 in Petaling Jaya inset. Select a camera or a detection."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_18rem]">
        <Card>
          <CardContent>
            <CampusMap
              layers={layers}
              onEvent={(e) => setOpenId(e.id)}
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
              {(Object.keys(layers) as (keyof MapLayers)[]).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <Label htmlFor={`layer-${k}`}>{labels[k]}</Label>
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
                const down = cams.filter((c) => c.status !== 'online').length;
                const open = state.events.filter(
                  (e) =>
                    isOpenEvent(e) && cameraById(e.camera)?.precinct === id,
                ).length;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{precincts[id].name}</span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                      {cams.length} cam{down ? ` · ${down} down` : ''}
                      {open ? ` · ${open} open` : ''}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
      <EventSheet
        id={openId}
        persona={persona}
        onClose={() => setOpenId(null)}
      />
      <CameraDialog camera={cam} onClose={() => setCam(null)} />
    </div>
  );
}
