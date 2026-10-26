'use client';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BedDouble,
  DoorOpen,
  UserRoundCheck,
  Clock,
  Wrench,
  Megaphone,
  Send,
  Users,
  ScanLine,
  CarFront,
  Search,
  Siren,
  PlayCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CameraFeed } from '../../_components/camera-feed';
import {
  PageHeader,
  Stat,
  Pill,
  Meter,
  Note,
  StatusBadge,
} from '../../_components/ui-bits';
import {
  colleges,
  collegeById,
  cameraById,
  cameraByScene,
  visitors,
  plateReads,
  events,
  densitySeries,
  broadcastTemplates,
  muster,
  precincts,
  precinctIds,
} from '../../_data/um';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

// ---------------------------------------------------------------- colleges --

function NoticeDialog({
  open,
  onClose,
  college,
}: {
  open: boolean;
  onClose: () => void;
  college: string;
}) {
  const { dispatch } = useDemo();
  const [text, setText] = useState(
    'Macaques are entering through the lobby. Please keep food indoors and close bin lids at Block C.',
  );
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notice to residents · {college}</DialogTitle>
          <DialogDescription>
            Sent as an EzSafe app push to residents of this college only.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="notice">Message</Label>
        <Textarea
          id="notice"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({
                type: 'broadcast',
                broadcast: {
                  time: '',
                  template: `Notice: ${text.slice(0, 40)}…`,
                  audience: college,
                  reach: 2032,
                  read: 0,
                },
              });
              notify.success('Notice sent', `${college} residents`);
              onClose();
            }}
          >
            <Send />
            Send notice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MyCollege() {
  const { state } = useDemo();
  const c = collegeById('kk12')!;
  const [notice, setNotice] = useState(false);
  const alerts = state.incidents.filter((i) => i.college === 'kk12');
  const doorEvents = [
    {
      time: '18:22',
      text: 'Block B side door held open 2 min',
      state: 'Closed by fellow',
    },
    {
      time: '17:48',
      text: 'Block D fire door opened (alarm)',
      state: 'False alarm: drill check',
    },
    {
      time: '16:05',
      text: 'Block A rooftop door contact',
      state: 'Estates maintenance',
    },
    { time: '14:30', text: 'Main lobby tailgating x2', state: 'Reviewed' },
  ];
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Pengetua portal"
        title={`${c.short} · ${c.name}`}
        description={`${c.note}. Duty fellow tonight: ${c.wardenOnDuty}. Camera coverage is entrances and lobbies only: never corridors with bedrooms, toilets or prayer rooms.`}
        actions={
          <Button onClick={() => setNotice(true)}>
            <Megaphone />
            Notice to residents
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="Occupancy"
          value={`${Math.round((c.occupied / c.beds) * 100)}%`}
          hint={`${c.occupied.toLocaleString()} of ${c.beds.toLocaleString()} beds`}
          icon={BedDouble}
        />
        <Stat
          label="Door alarms today"
          value={c.doorAlarms}
          icon={DoorOpen}
          t="warning"
        />
        <Stat
          label="Visitors on site"
          value={c.visitorsOnSite}
          hint={`${c.overstays} overstayed`}
          icon={UserRoundCheck}
          t="info"
        />
        <Stat
          label="Open maintenance"
          value={c.maintenance}
          hint="Lighting & locks"
          icon={Wrench}
          t="muted"
        />
        <Stat
          label="Incidents (30 days)"
          value={c.incidents30d}
          icon={Siren}
          t="critical"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Lobby camera</CardTitle>
            <CardDescription>
              Wildlife and tailgating analytics on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraFeed camera={cameraByScene('hostel')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tonight in KK12</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {alerts.map((i) => (
              <div
                key={i.id}
                className="flex items-start gap-2 rounded-lg border p-2.5 text-sm"
              >
                <StatusBadge status={i.status} />
                <div className="min-w-0">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-muted-foreground">{i.time}</div>
                </div>
              </div>
            ))}
            {doorEvents.map((d) => (
              <div
                key={d.time}
                className="flex items-start gap-2 rounded-lg border p-2.5 text-sm"
              >
                <DoorOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div>{d.text}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.time} · {d.state}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor log</CardTitle>
            <CardDescription>
              KPT hostel visitor entry/exit procedure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Until</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['V-2210', 'Parent visit', '19:00', 'On site'],
                  ['V-2198', 'Sibling visit', '18:00', 'Overstayed'],
                  ['V-2191', 'Course-mate (day pass)', '17:00', 'Left'],
                  ['V-2188', 'Furniture delivery', '15:00', 'Left'],
                ].map(([p, v, u, s]) => (
                  <TableRow key={p}>
                    <TableCell className="font-mono text-xs">{p}</TableCell>
                    <TableCell>{v}</TableCell>
                    <TableCell className="tabular">{u}</TableCell>
                    <TableCell>
                      <Pill
                        t={
                          s === 'Overstayed'
                            ? 'warning'
                            : s === 'On site'
                              ? 'info'
                              : 'muted'
                        }
                      >
                        {s}
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
            <CardTitle>Residents’ reports (30 days)</CardTitle>
            <CardDescription>
              Category counts only. Reporters stay anonymous to the college.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ['Noise after quiet hours', 9],
              ['Lighting or lock fault', 6],
              ['Vaping in common areas (sensor)', 5],
              ['Wildlife', 7],
              ['Bullying or harassment', '<5'],
            ].map(([k, v]) => (
              <div
                key={k as string}
                className="flex items-center justify-between text-sm"
              >
                <span>{k}</span>
                <span className="tabular font-medium">{v}</span>
              </div>
            ))}
            <Note>
              Counts from 1 to 4 show as “&lt;5” so no single student can be
              singled out. Bullying and harassment cases go straight to HEP.
            </Note>
          </CardContent>
        </Card>
      </div>
      <NoticeDialog
        open={notice}
        onClose={() => setNotice(false)}
        college="KK12"
      />
    </div>
  );
}

export function CollegesView({ persona }: { persona: Persona }) {
  if (persona.id === 'pengetua') return <MyCollege />;
  const totalBeds = colleges.reduce((a, c) => a + c.beds, 0);
  const occupied = colleges.reduce((a, c) => a + c.occupied, 0);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Residential colleges"
        description="Thirteen Kolej Kediaman and International House. Entrances and lobbies only are covered by cameras; private spaces never are."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Residents"
          value={occupied.toLocaleString()}
          hint={`${Math.round((occupied / totalBeds) * 100)}% of ${totalBeds.toLocaleString()} beds`}
          icon={BedDouble}
        />
        <Stat
          label="Door alarms today"
          value={colleges.reduce((a, c) => a + c.doorAlarms, 0)}
          icon={DoorOpen}
          t="warning"
        />
        <Stat
          label="Visitors on site"
          value={colleges.reduce((a, c) => a + c.visitorsOnSite, 0)}
          hint={`${colleges.reduce((a, c) => a + c.overstays, 0)} overstays`}
          icon={UserRoundCheck}
          t="info"
        />
        <Stat
          label="Open maintenance"
          value={colleges.reduce((a, c) => a + c.maintenance, 0)}
          icon={Wrench}
          t="muted"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {colleges.map((c) => {
          const occ = Math.round((c.occupied / c.beds) * 100);
          return (
            <Card key={c.id} size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-xs text-primary-foreground">
                    {c.short}
                  </span>
                  <span className="truncate">{c.name}</span>
                </CardTitle>
                <CardDescription className="truncate">
                  {c.note ?? c.zone} · {c.wardenOnDuty}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Occupancy</span>
                  <span className="tabular">{occ}%</span>
                </div>
                <Meter value={occ} t={occ > 96 ? 'warning' : 'brand'} />
                <div className="mt-1 grid grid-cols-4 gap-1 text-center">
                  {[
                    ['Alarms', c.doorAlarms],
                    ['Visitors', c.visitorsOnSite],
                    ['Overstay', c.overstays],
                    ['Repairs', c.maintenance],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md bg-muted/60 py-1">
                      <div className="tabular text-sm font-semibold">{v}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {k}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {persona.video ? null : (
        <Note>
          Video is not available to your role. College figures are aggregated.
        </Note>
      )}
    </div>
  );
}

// -------------------------------------------------------- visitors & cars --

export function VisitorsView({ persona }: { persona: Persona }) {
  const [q, setQ] = useState('');
  const list =
    persona.id === 'pengetua'
      ? visitors.filter((v) => v.place.startsWith('KK'))
      : visitors;
  const gateCams = [
    'gate',
    'retail-carpark',
    'hosp-carpark',
    'care-carpark',
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Visitors & vehicles"
        description="Pre-registered visitor passes with host approval, and plate reads at gates and car parks. Plate reads are kept for 30 days; visitors are never identified by face."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Visitors on site"
          value={list.filter((v) => v.status === 'On site').length}
          icon={Users}
          t="info"
        />
        <Stat
          label="Overstayed"
          value={list.filter((v) => v.status === 'Overstayed').length}
          icon={Clock}
          t="warning"
        />
        <Stat
          label="Plate reads (1 h)"
          value={412}
          hint="Convocation traffic"
          icon={ScanLine}
        />
        <Stat
          label="Flagged plates"
          value={plateReads.filter((p) => p.result !== 'Valid').length}
          icon={CarFront}
          t="critical"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor passes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead className="hidden sm:table-cell">Where</TableHead>
                  <TableHead>Until</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((v) => (
                  <TableRow key={v.pass}>
                    <TableCell className="font-mono text-xs">
                      {v.pass}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {v.name}
                      <div className="text-xs text-muted-foreground">
                        Host: {v.host}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {v.place}
                    </TableCell>
                    <TableCell className="tabular">{v.until}</TableCell>
                    <TableCell>
                      <Pill
                        t={
                          v.status === 'Overstayed'
                            ? 'warning'
                            : v.status === 'On site'
                              ? 'info'
                              : v.status === 'Expected'
                                ? 'brand'
                                : 'muted'
                        }
                      >
                        {v.status}
                      </Pill>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {persona.id !== 'pengetua' && (
          <Card>
            <CardHeader>
              <CardTitle>Plate reads</CardTitle>
              <CardAction>
                <div className="relative">
                  <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Plate"
                    aria-label="Search plate"
                    className="h-7 w-28 rounded-md border bg-transparent pl-7 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead className="hidden sm:table-cell">Gate</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plateReads
                    .filter(
                      (p) =>
                        p.plate
                          .toLowerCase()
                          .includes(q.toLowerCase().replace(/\s/g, '')) ||
                        p.plate.toLowerCase().includes(q.toLowerCase()),
                    )
                    .map((p) => (
                      <TableRow key={p.time + p.plate}>
                        <TableCell className="tabular">{p.time}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">
                          {p.plate}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {p.gate}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <Pill
                            t={p.result === 'Valid' ? 'success' : 'warning'}
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
        )}
      </div>
      {persona.video && persona.id !== 'pengetua' && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {gateCams.map((s) => (
            <CameraFeed key={s} camera={cameraByScene(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ events --

const densityConfig = {
  dtc: { label: 'DTC bag check', color: 'var(--chart-1)' },
  gate: { label: 'Main gate', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function EventsView({ persona }: { persona: Persona }) {
  const ev = events[0];
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Event mode · live"
        title={ev.name}
        description={`${ev.place} · ${ev.when}. Temporary command post at the DTC foyer. Crowd density is counted, never identified.`}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              notify.info(
                'Lost-person alert sent to event staff',
                'Description and last-seen location only. No face search.',
              )
            }
          >
            <Search />
            Lost person
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Guests expected"
          value={ev.attendance.toLocaleString()}
          icon={Users}
        />
        <Stat
          label="Staff deployed"
          value={ev.staff}
          icon={UserRoundCheck}
          t="info"
        />
        <Stat
          label="Peak density"
          value="3.7 p/m²"
          hint="18:20 at bag check"
          icon={Siren}
          t="warning"
        />
        <Stat
          label="Readiness"
          value={`${ev.readiness}%`}
          icon={PlayCircle}
          t="success"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Crowd density</CardTitle>
            <CardDescription>People per m², alert above 3.5</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={densityConfig}
              className="aspect-auto h-56 w-full"
            >
              <AreaChart data={densitySeries} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="t" tickLine={false} axisLine={false} />
                <YAxis
                  width={32}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 4]}
                  ticks={[0, 1, 2, 3, 4]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={3.5}
                  stroke="var(--critical)"
                  strokeDasharray="4 4"
                />
                <Area
                  dataKey="dtc"
                  type="monotone"
                  stroke="var(--color-dtc)"
                  fill="var(--color-dtc)"
                  fillOpacity={0.18}
                />
                <Area
                  dataKey="gate"
                  type="monotone"
                  stroke="var(--color-gate)"
                  fill="var(--color-gate)"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {events.slice(1).map((e) => (
              <div key={e.name} className="grid gap-1">
                <div className="text-sm font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {e.place} · {e.when}
                </div>
                <Meter
                  value={e.readiness}
                  t={e.readiness < 50 ? 'warning' : 'brand'}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {persona.video && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {ev.cameras.map((id) => (
            <CameraFeed key={id} camera={cameraById(id)!} />
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------- emergency --

export function EmergencyView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const [compose, setCompose] = useState<string | null>(null);
  const [audience, setAudience] = useState('Whole campus');
  const tpl = broadcastTemplates.find((t) => t.id === compose);
  const canSend = persona.id === 'chief' || persona.id === 'soc';
  const respond = Math.round(
    ((muster.safe + muster.needHelp) / muster.invited) * 100,
  );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Emergency & mass notification"
        description="Pre-approved templates sent by app push, SMS, email and PA to the whole campus, a geofenced precinct or one building. Check-ins feed the muster board."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {broadcastTemplates.map((t) => (
          <Card key={t.id} size="sm">
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>
                {t.audience} · {t.channels.join(', ')}
              </CardDescription>
              <CardAction>
                <Button
                  size="sm"
                  variant={t.id === 'flood' ? 'default' : 'outline'}
                  disabled={!canSend}
                  onClick={() => setCompose(t.id)}
                >
                  <Megaphone />
                  Compose
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Audience
                  </TableHead>
                  <TableHead className="text-right">Reach</TableHead>
                  <TableHead className="text-right">Read</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.broadcasts.map((b, n) => (
                  <TableRow key={n}>
                    <TableCell className="tabular">{b.time}</TableCell>
                    <TableCell className="whitespace-normal">
                      {b.template}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {b.audience}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {b.reach.toLocaleString()}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {b.read ? `${Math.round(b.read * 100)}%` : 'Sending'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Muster board</CardTitle>
            <CardDescription>{muster.drill}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-end justify-between">
              <span className="tabular text-3xl font-semibold">{respond}%</span>
              <span className="text-xs text-muted-foreground">
                accounted for
              </span>
            </div>
            <Meter value={respond} t="success" />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-success-soft p-2 text-success">
                <div className="tabular text-base font-semibold">
                  {muster.safe.toLocaleString()}
                </div>
                I’m safe
              </div>
              <div className="rounded-md bg-critical-soft p-2 text-critical">
                <div className="tabular text-base font-semibold">
                  {muster.needHelp}
                </div>
                Need help
              </div>
              <div className="rounded-md bg-muted p-2 text-muted-foreground">
                <div className="tabular text-base font-semibold">
                  {muster.noResponse}
                </div>
                No reply
              </div>
            </div>
            {muster.points.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span className="truncate">{p.name}</span>
                <span className="tabular">{p.count.toLocaleString()}</span>
              </div>
            ))}
            <Button
              variant="outline"
              disabled={!canSend}
              onClick={() =>
                notify.info(
                  'Drill scheduled',
                  'Faculty of Engineering, Fri 30 Oct 10:00',
                )
              }
            >
              Schedule a drill
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!tpl} onOpenChange={(o) => !o && setCompose(null)}>
        <DialogContent>
          {tpl && (
            <>
              <DialogHeader>
                <DialogTitle>{tpl.name}</DialogTitle>
                <DialogDescription>
                  Channels: {tpl.channels.join(', ')}. Two-person approval
                  applies to whole-campus sends in production.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="aud">Audience</Label>
                <NativeSelect
                  id="aud"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full"
                >
                  <NativeSelectOption>Whole campus</NativeSelectOption>
                  {precinctIds.map((p) => (
                    <NativeSelectOption key={p}>
                      {precincts[p].name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Label htmlFor="msg" className="mt-2">
                  Message
                </Label>
                <Textarea
                  id="msg"
                  rows={4}
                  defaultValue={
                    tpl.id === 'flood'
                      ? 'FLASH FLOOD WARNING: Water is rising in the Faculty of Law basement car park. Do not enter. Move vehicles to higher ground only if safe. Shuttle route C is diverted.'
                      : `${tpl.name}. Follow instructions from security staff. Check in on the EzSafe app when you are safe.`
                  }
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompose(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    dispatch({
                      type: 'broadcast',
                      broadcast: {
                        time: '',
                        template: tpl.name,
                        audience,
                        reach: audience === 'Whole campus' ? 31840 : 4200,
                        read: 0,
                      },
                    });
                    notify.success(
                      'Broadcast sent',
                      `${tpl.name} → ${audience}`,
                    );
                    setCompose(null);
                  }}
                >
                  <Send />
                  Send now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
