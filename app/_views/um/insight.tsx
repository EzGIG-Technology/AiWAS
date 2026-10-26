'use client';
/* oxlint-disable next/no-img-element */
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
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
  Users,
  TriangleAlert,
  Clock,
  Car,
  ScanLine,
  ParkingSquare,
  Download,
  Landmark,
  Search,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Timer,
  Video,
  BadgeCheck,
  ShieldCheck,
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
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  PageHeader,
  Stat,
  Pill,
  Meter,
  Note,
  csvDownload,
} from '../../_components/ui-bits';
import {
  zones,
  footfall,
  utilisation,
  carParks,
  gateFlow,
  plateReads,
  crowdEvents,
  densitySeries,
  cameraById,
  cameraByScene,
  precincts,
  precinctIds,
  searchClasses,
  vehicleColours,
  searchFootage,
  verifyTimes,
  uptimeWeekly,
  verification,
  cctvChecklist,
  analytics,
  type SearchClass,
  type PrecinctId,
} from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

const AnonNote = () => (
  <Note>
    Counts come from anonymous line crossings and people-in-zone estimates.
    Nobody is identified, and no count is linked to a person.
  </Note>
);

// --------------------------------------------------------------- occupancy --

const footfallConfig = {
  cafeteria: { label: 'Cafeteria', color: 'var(--chart-1)' },
  central: { label: 'UM Central', color: 'var(--chart-2)' },
  dtc: { label: 'Dewan Tunku Canselor', color: 'var(--chart-3)' },
} satisfies ChartConfig;

const hours = footfall.map((f) => f.hour.slice(0, 2));

export function OccupancyView({ persona }: { persona: Persona }) {
  const people = zones.reduce((a, z) => a + z.now, 0);
  const hot = zones.filter((z) => z.now / z.capacity > 0.85);
  const sorted = [...zones].sort(
    (a, b) => b.now / b.capacity - a.now / a.capacity,
  );
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Occupancy & footfall"
        description="How many people are in each counting zone now, how busy each space was through the day, and when it peaks. For space planning, cleaning and catering schedules, and crowd limits."
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
          value={hot.length}
          hint={hot.map((z) => z.name.split(',')[0]).join(', ') || 'None'}
          icon={TriangleAlert}
          t="warning"
        />
        <Stat
          label="Footfall today, UM Central"
          value={footfall.reduce((a, f) => a + f.central, 0).toLocaleString()}
          hint="Entries counted"
          icon={ScanLine}
          t="info"
        />
        <Stat
          label="Median dwell, cafeteria"
          value={`${zones.find((z) => z.scene === 'canteen')!.dwellMin} min`}
          icon={Clock}
          t="muted"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Counting zones</CardTitle>
            <CardDescription>
              Live count against the zone’s capacity
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
                  <TableHead className="hidden text-right md:table-cell">
                    Dwell
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
                          <div className="min-w-0">
                            <div className="text-sm">{z.name}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {cameraByScene(z.scene).id}
                            </div>
                          </div>
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
                      <TableCell className="tabular hidden text-right md:table-cell">
                        {z.dwellMin} min
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Footfall by hour</CardTitle>
              <CardDescription>Entries counted today</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={footfallConfig}
                className="aspect-auto h-60 w-full"
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
              <CardTitle>Weekday utilisation</CardTitle>
              <CardDescription>
                Average % of capacity, 07:00–18:00
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[26rem] text-[11px]">
                <thead>
                  <tr>
                    <th className="p-1 text-left font-medium text-muted-foreground">
                      Zone
                    </th>
                    {hours.map((h) => (
                      <th
                        key={h}
                        className="p-1 font-medium text-muted-foreground"
                      >
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
        </div>
      </div>
      <AnonNote />
    </div>
  );
}

// ---------------------------------------------------------------- vehicles --

const flowConfig = {
  in: { label: 'Entering', color: 'var(--chart-1)' },
  out: { label: 'Leaving', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function VehiclesView({ persona }: { persona: Persona }) {
  const parked = carParks.reduce((a, c) => a + c.occupied, 0);
  const spaces = carParks.reduce((a, c) => a + c.capacity, 0);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Vehicles & parking"
        description="Car-park occupancy counted by camera, traffic through the main gate, and plate reads at gates and car parks. Plate reads are kept for 30 days and are never used to identify a driver."
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
          label="Plate reads, last hour"
          value={412}
          hint="Convocation traffic"
          icon={ScanLine}
          t="brand"
        />
        <Stat
          label="Flagged plates"
          value={plateReads.filter((p) => p.result !== 'Valid').length}
          hint="Unregistered or expired"
          icon={TriangleAlert}
          t="warning"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    : `${c.capacity - c.occupied} bays free`}
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
        <Card>
          <CardHeader>
            <CardTitle>Main gate traffic</CardTitle>
            <CardDescription>
              Vehicles per hour, counted on camera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={flowConfig}
              className="aspect-auto h-64 w-full"
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
        {persona.video ? (
          <Card>
            <CardHeader>
              <CardTitle>Plate reads</CardTitle>
              <CardDescription>
                Latest reads at gates and car parks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Where
                    </TableHead>
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
                      <TableCell className="hidden sm:table-cell">
                        {p.gate}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <Pill t={p.result === 'Valid' ? 'success' : 'warning'}>
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
        ) : (
          <Note>
            Plate numbers are not shown to your role. Counts and occupancy only.
          </Note>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- crowd --

const densityConfig = {
  dtc: { label: 'DTC bag check', color: 'var(--chart-1)' },
  gate: { label: 'Main gate', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function CrowdView({ persona }: { persona: Persona }) {
  const ev = crowdEvents[0];
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Crowd analytics · live"
        title={ev.name}
        description={`${ev.place} · ${ev.when}. Density is estimated from camera views as people per square metre; nobody is identified.`}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Guests expected"
          value={ev.expected.toLocaleString()}
          icon={Users}
        />
        <Stat
          label="Counted in hall"
          value={ev.counted.toLocaleString()}
          hint={`${Math.round((ev.counted / ev.expected) * 100)}% of expected`}
          icon={ScanLine}
          t="info"
        />
        <Stat
          label="Peak density"
          value="3.7 p/m²"
          hint="18:20 at bag check"
          icon={TriangleAlert}
          t="warning"
        />
        <Stat
          label="Alert threshold"
          value={`${ev.limit} p/m²`}
          icon={ShieldCheck}
          t="muted"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Crowd density</CardTitle>
            <CardDescription>
              People per m²; dashed line is the alert threshold
            </CardDescription>
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
                  y={ev.limit}
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
            {crowdEvents.slice(1).map((e) => (
              <div key={e.name} className="grid gap-0.5 text-sm">
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {e.place} · {e.when} · {e.expected.toLocaleString()} expected
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.cameras.length} camera on crowd density
                </div>
              </div>
            ))}
            <Note>
              Add a camera to an event and set its density threshold; the
              analytic switches to event mode for the event’s hours.
            </Note>
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

// ------------------------------------------------------------------ search --

export function SearchView({ persona }: { persona: Persona }) {
  const { dispatch } = useDemo();
  const [cls, setCls] = useState<SearchClass>('Vehicle');
  const [precinct, setPrecinct] = useState<PrecinctId | 'all'>('transit');
  const [from, setFrom] = useState('16:00');
  const [to, setTo] = useState('18:00');
  const [colour, setColour] =
    useState<(typeof vehicleColours)[number]>('Any colour');
  const [purpose, setPurpose] = useState('');
  const [ran, setRan] = useState<null | {
    cls: SearchClass;
    precinct: PrecinctId | 'all';
    from: string;
    to: string;
    colour: (typeof vehicleColours)[number];
  }>(null);
  const results = useMemo(() => (ran ? searchFootage(ran) : []), [ran]);

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Footage search"
        description="Find recorded moments by object class, place and time, without scrubbing through hours of video. Every search needs a purpose and is written to the audit log."
      />
      <Alert>
        <ShieldCheck />
        <AlertTitle>No search by face, clothing or appearance</AlertTitle>
        <AlertDescription>
          A person can be found only as “a person, here, at this time”. Vehicles
          can be filtered by colour; plates are searched in Vehicles & parking.
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!purpose.trim()) {
                notify.error(
                  'Enter a purpose',
                  'Searches without a purpose are not allowed',
                );
                return;
              }
              const q = {
                cls,
                precinct,
                from,
                to,
                colour: cls === 'Vehicle' ? colour : ('Any colour' as const),
              };
              setRan(q);
              dispatch({
                type: 'audit',
                entry: {
                  who: persona.name,
                  action: `Searched footage: ${cls}, ${precinct === 'all' ? 'all precincts' : precincts[precinct].name}, ${from}–${to}`,
                  target: `${searchFootage(q).length} results`,
                  reason: purpose,
                },
              });
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="s-cls">Looking for</Label>
              <NativeSelect
                id="s-cls"
                value={cls}
                onChange={(e) => setCls(e.target.value as SearchClass)}
                className="w-full"
              >
                {searchClasses.map((c) => (
                  <NativeSelectOption key={c}>{c}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-where">Where</Label>
              <NativeSelect
                id="s-where"
                value={precinct}
                onChange={(e) => setPrecinct(e.target.value as typeof precinct)}
                className="w-full"
              >
                <NativeSelectOption value="all">
                  All precincts
                </NativeSelectOption>
                {precinctIds.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {precincts[p].name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-from">From</Label>
              <Input
                id="s-from"
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-to">To</Label>
              <Input
                id="s-to"
                type="time"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-colour">Vehicle colour</Label>
              <NativeSelect
                id="s-colour"
                value={colour}
                disabled={cls !== 'Vehicle'}
                onChange={(e) => setColour(e.target.value as typeof colour)}
                className="w-full"
              >
                {vehicleColours.map((c) => (
                  <NativeSelectOption key={c}>{c}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-purpose">Purpose</Label>
              <Input
                id="s-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. parking complaint P-221"
              />
            </div>
            <Button
              type="submit"
              className="sm:col-span-2 lg:col-span-6 lg:justify-self-end"
            >
              <Search />
              Search footage
            </Button>
          </form>
        </CardContent>
      </Card>
      {ran && (
        <Card>
          <CardHeader>
            <CardTitle>
              {results.length} {results.length === 1 ? 'moment' : 'moments'}{' '}
              found
            </CardTitle>
            <CardDescription>
              {ran.cls}
              {ran.cls === 'Vehicle' && ran.colour !== 'Any colour'
                ? ` · ${ran.colour}`
                : ''}{' '}
              ·{' '}
              {ran.precinct === 'all'
                ? 'All precincts'
                : precincts[ran.precinct].name}{' '}
              · {ran.from}–{ran.to}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing in that window. Widen the time or the place.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                {results.slice(0, 24).map((r) => (
                  <figure
                    key={r.id}
                    className="overflow-hidden rounded-lg ring-1 ring-border"
                  >
                    <img
                      src={mediaUrl(scenes[r.camera.scene].still)}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                    <figcaption className="grid gap-0.5 p-2 text-xs">
                      <span className="flex justify-between gap-2">
                        <span className="font-medium">{r.label}</span>
                        <span className="tabular">{r.time}</span>
                      </span>
                      <span className="truncate text-muted-foreground">
                        {r.camera.id} · {r.camera.name}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
            {results.length > 24 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing 24 of {results.length}. Narrow the search to see the
                rest.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- reports --

const verifyConfig = {
  p50: { label: 'Median (P50)', color: 'var(--chart-2)' },
  p90: { label: 'P90', color: 'var(--chart-1)' },
} satisfies ChartConfig;
const uptimeConfig = {
  uptime: { label: 'Uptime %', color: 'var(--chart-4)' },
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
  const met = cctvChecklist.filter((i) => i.status === 'Met').length;
  const confirmed = verification.reduce((a, v) => a + v.confirmed, 0);
  const all = verification.reduce((a, v) => a + v.confirmed + v.false, 0);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Reports"
        description="How well the cameras and analytics are performing: uptime, time to verify, how often each analytic is right, and the CCTV evidence for KPT's inspection directive."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                csvDownload('um-detections-2026-10-26.csv', [
                  [
                    'id',
                    'date',
                    'time',
                    'analytic',
                    'severity',
                    'status',
                    'confidence',
                    'camera',
                  ],
                  ...state.events.map((e) => [
                    e.id,
                    e.date,
                    e.time,
                    analytics[e.analytic].name,
                    e.severity,
                    e.status,
                    e.confidence,
                    e.camera,
                  ]),
                ])
              }
            >
              <Download />
              Detections CSV
            </Button>
            {persona.id === 'director' && (
              <Button
                onClick={() =>
                  notify.success(
                    'Monthly return submitted to KPT',
                    'Camera estate, uptime, detection counts by category and CCTV checklist. No footage, plates or names.',
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
          label="Camera uptime, wk 43"
          value={`${uptimeWeekly.at(-1)!.uptime}%`}
          hint="Target 95%"
          icon={Video}
          t="success"
        />
        <Stat
          label="Median time to verify"
          value={`${verifyTimes.at(-1)!.p50} s`}
          hint={`P90 ${verifyTimes.at(-1)!.p90} s`}
          icon={Timer}
          t="info"
        />
        <Stat
          label="Precision (90 d)"
          value={`${Math.round((confirmed / all) * 100)}%`}
          hint={`${all.toLocaleString()} verified detections`}
          icon={BadgeCheck}
          t="success"
        />
        <Stat
          label="KPT CCTV items met"
          value={`${met}/${cctvChecklist.length}`}
          icon={CheckCircle2}
          t="brand"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time to verify</CardTitle>
            <CardDescription>
              Detection to operator decision, seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={verifyConfig}
              className="aspect-auto h-60 w-full"
            >
              <LineChart data={verifyTimes} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis width={36} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="p50" stroke="var(--color-p50)" strokeWidth={2} />
                <Line dataKey="p90" stroke="var(--color-p90)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Camera uptime</CardTitle>
            <CardDescription>
              Weekly, all 60 cameras; dashed line is the 95% target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={uptimeConfig}
              className="aspect-auto h-60 w-full"
            >
              <AreaChart data={uptimeWeekly} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis
                  width={36}
                  tickLine={false}
                  axisLine={false}
                  domain={[90, 100]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  y={95}
                  stroke="var(--critical)"
                  strokeDasharray="4 4"
                />
                <Area
                  dataKey="uptime"
                  type="monotone"
                  stroke="var(--color-uptime)"
                  fill="var(--color-uptime)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analytic precision (90 days)</CardTitle>
            <CardDescription>
              Share of detections an operator confirmed. Low precision means
              operators spend time on false alarms.
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
                      {p}% · {v.confirmed + v.false}
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
        <Card>
          <CardHeader>
            <CardTitle>KPT inspection directive: CCTV items</CardTitle>
            <CardDescription>
              Evidence the camera platform holds
            </CardDescription>
            <CardAction>
              <Pill t="success">{met} met</Pill>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-2">
            {cctvChecklist.map((c) => {
              const I = statusIcon[c.status];
              return (
                <div
                  key={c.item}
                  className="flex items-start gap-3 rounded-lg border p-2.5"
                >
                  <I
                    className={cn('mt-0.5 size-4 shrink-0', iconTone[c.status])}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{c.item}</div>
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
    </div>
  );
}
