'use client';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  EyeOff,
  FileText,
  Fingerprint,
  HelpCircle,
  ScanEye,
  ScrollText,
  Search,
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
  Note,
  PageHeader,
  Pill,
  Stat,
  csvDownload,
  type Tone,
} from '../../_components/ui-bits';
import {
  auditMethod,
  auditTotals,
  capabilityGap,
  governanceLessons,
  institutionById,
  institutions,
  kptExclusionLine,
  leaders,
  maturityLevels,
  patterns,
  pdpaPoints,
  pdpaUrl,
  pilotAggregates,
  suppress,
  type Institution,
  type Maturity,
  type StateId,
} from '../../_data/kpt';
import { navigate } from '../../_lib/router';
import { Pdf, download } from '../../_lib/pdf';

function ExclusionBanner() {
  return (
    <Alert className="border-primary/20 bg-accent/50">
      <EyeOff />
      <AlertTitle>Aggregates only</AlertTitle>
      <AlertDescription>{kptExclusionLine}</AlertDescription>
    </Alert>
  );
}

export const maturityTone: Record<Maturity, Tone> = {
  High: 'success',
  'Medium–High': 'success',
  Medium: 'info',
  'Low–Medium': 'warning',
  Low: 'critical',
  Unknown: 'muted',
};

const ExtLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
  >
    {children}
    <ExternalLink className="size-3" />
  </a>
);

const maturityConfig = {
  public: { label: 'Public (UA)', color: 'var(--chart-1)' },
  private: { label: 'Private (IPTS)', color: 'var(--chart-3)' },
} satisfies ChartConfig;

// ---------------------------------------------------------------- overview --

export function NationalOverview() {
  const [state, setState] = useState<StateId | null>(null);
  const t = auditTotals;
  const byMaturity = maturityLevels.map((m) => ({
    maturity: m,
    public: institutions.filter(
      (i) => i.maturity === m && i.type === 'Public (UA)',
    ).length,
    private: institutions.filter(
      (i) => i.maturity === m && i.type === 'Private (IPTS)',
    ).length,
  }));
  const inState = state ? institutions.filter((i) => i.state === state) : [];

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Kementerian Pendidikan Tinggi"
        title="Smart-campus overview"
        description="Where Malaysian universities stand on campus video analytics, from a public-evidence audit of 20 public and 18 private universities, and what EzVision pilots report back in aggregate."
      />
      <ExclusionBanner />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat
          label="Universities audited"
          value={t.audited}
          hint={`${t.public} public · ${t.private} private`}
          icon={Building2}
        />
        <Stat
          label="Confirmed AI or vision"
          value={t.ai}
          hint={`${t.aiPublic} public · ${t.aiPrivate} private`}
          icon={ScanEye}
          t="info"
        />
        <Stat
          label="AI at hostels"
          value={t.hostelAi}
          hint={`${t.hostelClaims} unverified claim`}
          icon={BedDouble}
          t="critical"
        />
        <Stat
          label="Policies asking for analytics"
          value={t.policyAnalytics}
          hint="USM, UTHM, UMPSA"
          icon={ScrollText}
          t="warning"
        />
        <Stat
          label="Face recognition in use"
          value={t.faceRecognition}
          hint="Sensitive data under PDPA"
          icon={Fingerprint}
          t="brand"
        />
        <Stat
          label="No public evidence"
          value={t.unknown}
          hint="Call the security office"
          icon={HelpCircle}
          t="muted"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Maturity</CardTitle>
            <CardDescription>
              Most universities sit at “CCTV unit + control room”, with guards
              watching screens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={maturityConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart data={byMaturity} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="maturity"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  width={28}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="public" stackId="m" fill="var(--color-public)" />
                <Bar
                  dataKey="private"
                  stackId="m"
                  fill="var(--color-private)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By state</CardTitle>
            <CardDescription>
              Average maturity of universities with public evidence (High 4 …
              Low 1). Select a state.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <StateTileMap selected={state} onSelect={setState} />
            {state && (
              <div className="grid gap-1 text-sm">
                <div className="font-medium">{state}</div>
                {inState.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="flex items-center justify-between gap-2 text-left hover:underline"
                    onClick={() => navigate(`/kpt/universities/${i.id}`)}
                  >
                    <span className="truncate">{i.name}</span>
                    <Pill t={maturityTone[i.maturity]}>{i.maturity}</Pill>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What the pattern means</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {patterns.map((p) => (
            <div key={p.title} className="rounded-lg bg-muted/60 p-3">
              <div className="text-sm font-medium">{p.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Hostel integrity pilots</CardTitle>
          <CardDescription>
            {pilotAggregates.reporting} university reporting through EzVision ·{' '}
            {pilotAggregates.blocks} hostel blocks · aggregates only
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/kpt/hostels')}
            >
              Open <ArrowRight />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Confirmed breaches, last week"
            value={suppress(pilotAggregates.weekly.at(-1)!.confirmed)}
            hint={`${suppress(pilotAggregates.weekly[2].confirmed)} in live week 1`}
          />
          <Stat
            label="Alert precision"
            value={`${pilotAggregates.precision}%`}
          />
          <Stat
            label="Time to acknowledge"
            value={`${pilotAggregates.ackP50} min`}
            hint="Median"
          />
          <Stat
            label="Pilot camera uptime"
            value={`${pilotAggregates.uptime}%`}
          />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{auditMethod}</p>
    </div>
  );
}

// ------------------------------------------------------------ universities --

function Flag({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {on ? (
        <CheckCircle2 className="size-4 text-success" />
      ) : (
        <span className="size-4 rounded-full border" />
      )}
      <span className={on ? '' : 'text-muted-foreground'}>{children}</span>
    </div>
  );
}

function UniversityProfile({
  inst,
  onClose,
}: {
  inst: Institution | undefined;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!inst} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-lg">
        {inst && (
          <>
            <SheetHeader className="gap-2 border-b p-4 pr-12">
              <div className="flex items-center gap-3">
                <UniversityLogo
                  id={inst.id}
                  acronym={inst.acronym}
                  className="size-10"
                />
                <div className="min-w-0">
                  <SheetTitle>{inst.name}</SheetTitle>
                  <SheetDescription>
                    {inst.acronym} · {inst.type} · {inst.city}, {inst.state}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill t={maturityTone[inst.maturity]}>
                  Maturity: {inst.maturity}
                </Pill>
                {inst.ezvision && (
                  <Pill t="brand">EzVision {inst.ezvision}</Pill>
                )}
              </div>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              <div className="grid gap-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  What’s deployed
                </div>
                <p className="text-sm">{inst.deployed}</p>
              </div>
              <div className="grid gap-1.5">
                <Flag on={inst.ai}>Confirmed AI or vision security system</Flag>
                <Flag on={inst.policyAnalytics}>
                  CCTV policy asks for video analytics
                </Flag>
                <Flag on={inst.faceRecognition}>
                  Face recognition in use (sensitive data under the amended
                  PDPA)
                </Flag>
                <Flag on={inst.hostelAi !== 'None found'}>
                  AI at hostels{' '}
                  {inst.hostelAi !== 'None found' &&
                    `(${inst.hostelAi.toLowerCase()})`}
                </Flag>
                <div className="text-sm text-muted-foreground">
                  Vehicles: {inst.vehicles}
                </div>
              </div>
              <div className="grid gap-1.5">
                <div className="text-xs font-medium text-muted-foreground">
                  Evidence
                </div>
                {inst.evidence.length ? (
                  <ul className="grid gap-1 text-sm">
                    {inst.evidence.map((e) => (
                      <li key={e.url}>
                        <ExtLink href={e.url}>{e.label}</ExtLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No public evidence found. “Unknown” is not proof of absence.
                  </p>
                )}
              </div>
              {inst.ezvision && (
                <Note>
                  EzVision reports this university’s hostel pilot to the
                  ministry as totals only: confirmed breaches per week,
                  precision, time to acknowledge and camera uptime. No footage,
                  blocks, cameras or people.
                </Note>
              )}
              <p className="text-[11px] text-muted-foreground">{auditMethod}</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function UniversitiesView({ focus }: { focus?: string }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | Institution['type']>('all');
  const [mat, setMat] = useState<'all' | Maturity>('all');
  const rows = institutions
    .filter((i) => type === 'all' || i.type === type)
    .filter((i) => mat === 'all' || i.maturity === mat)
    .filter(
      (i) =>
        !q ||
        `${i.name} ${i.acronym} ${i.state} ${i.deployed}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    );
  const open = focus ? institutionById(focus) : undefined;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Universities"
        description="The smart-campus audit: what each university has deployed, how mature it is, and the public page it came from."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              csvDownload('kpt-smart-campus-audit.csv', [
                [
                  'University',
                  'Acronym',
                  'Type',
                  'State',
                  'Maturity',
                  'Confirmed AI',
                  'Policy asks for analytics',
                  'Face recognition',
                  'Vehicles',
                  'Deployed',
                  'Evidence',
                ],
                ...institutions.map((i) => [
                  i.name,
                  i.acronym,
                  i.type,
                  i.state,
                  i.maturity,
                  i.ai ? 'Yes' : 'No',
                  i.policyAnalytics ? 'Yes' : 'No',
                  i.faceRecognition ? 'Yes' : 'No',
                  i.vehicles,
                  i.deployed,
                  i.evidence.map((e) => e.url).join(' '),
                ]),
              ])
            }
          >
            <Download />
            CSV
          </Button>
        }
      />
      <ExclusionBanner />
      <Card>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search universities"
                className="pl-8"
                aria-label="Search universities"
              />
            </div>
            <NativeSelect
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              aria-label="Type"
            >
              <NativeSelectOption value="all">
                Public and private
              </NativeSelectOption>
              <NativeSelectOption value="Public (UA)">
                Public (UA)
              </NativeSelectOption>
              <NativeSelectOption value="Private (IPTS)">
                Private (IPTS)
              </NativeSelectOption>
            </NativeSelect>
            <NativeSelect
              value={mat}
              onChange={(e) => setMat(e.target.value as typeof mat)}
              aria-label="Maturity"
            >
              <NativeSelectOption value="all">Any maturity</NativeSelectOption>
              {maturityLevels.map((m) => (
                <NativeSelectOption key={m} value={m}>
                  {m}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead className="hidden lg:table-cell">
                  What’s deployed
                </TableHead>
                <TableHead className="hidden md:table-cell">Vehicles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow
                  key={i.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/kpt/universities/${i.id}`)}
                >
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-3">
                      <UniversityLogo
                        id={i.id}
                        acronym={i.acronym}
                        className="size-8 shrink-0"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/kpt/universities/${i.id}`);
                          }}
                        >
                          {i.name}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {i.type} · {i.state}
                          {i.ezvision && ' · EzVision pilot'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Pill t={maturityTone[i.maturity]}>{i.maturity}</Pill>
                  </TableCell>
                  <TableCell className="hidden max-w-md whitespace-normal text-xs text-muted-foreground lg:table-cell">
                    {i.deployed}
                  </TableCell>
                  <TableCell className="hidden whitespace-normal text-xs md:table-cell">
                    {i.vehicles}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UniversityProfile
        inst={open}
        onClose={() => navigate('/kpt/universities')}
      />
    </div>
  );
}

// -------------------------------------------------------------------- gaps --

export function GapsView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Capability gap"
        description="Malaysian campuses are roughly where Arizona State and Binghamton were before their command centres: the cameras exist, but nobody gets an alert. Hostel AI is the biggest gap."
      />
      <Card>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[48rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Global leaders</TableHead>
                <TableHead>Malaysian public</TableHead>
                <TableHead>Malaysian private</TableHead>
                <TableHead>EzVision today</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capabilityGap.map((g) => (
                <TableRow key={g.capability}>
                  <TableCell className="font-medium whitespace-normal">
                    {g.capability}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {g.leaders}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {g.public}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {g.private}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Pill t="brand">{g.ezvision}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Command centre with live alerts"
          value="1 of 38"
          hint="UMPSA’s Intelligent Operation Centre (May 2026)"
        />
        <Stat
          label="Plate recognition at gates"
          value="1–2 of 38"
          hint="APU confirmed; UPM likely"
        />
        <Stat
          label="Hostel entry analytics"
          value="0 of 38"
          hint="Taylor’s claims “AI-CCTV”, no detail"
        />
      </div>
    </div>
  );
}

// -------------------------------------------------------------- benchmarks --

export function BenchmarksView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Global benchmarks"
        description="The leaders bought one command centre joining cameras, access, plates and evidence, then staffed it close to 24/7. ITS Surabaya is the closest regional model."
      />
      <Card>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead>University</TableHead>
                <TableHead>What’s deployed</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Result or note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaders.map((l) => (
                <TableRow key={l.university}>
                  <TableCell className="font-medium whitespace-normal">
                    <ExtLink href={l.url}>{l.university}</ExtLink>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {l.deployed}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {l.vendor}
                  </TableCell>
                  <TableCell className="whitespace-normal">{l.year}</TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {l.result}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {governanceLessons.map((g) => (
          <Card key={g.title}>
            <CardHeader>
              <CardTitle>{g.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="text-muted-foreground">{g.text}</p>
              <ExtLink href={g.url}>Source</ExtLink>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- hostels --

const pilotConfig = {
  confirmed: { label: 'Confirmed breaches', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function HostelsView() {
  const p = pilotAggregates;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Hostel integrity pilots"
        description="Aggregate results from EzVision hostel pilots: opposite-gender entry, visitors past the lounge, overstays, after-curfew and fire-exit entry. A warden verified every breach counted here; the AI issued no penalty."
      />
      <ExclusionBanner />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Universities reporting"
          value={p.reporting}
          hint="Universiti Malaya (demo)"
          icon={Building2}
        />
        <Stat
          label="Hostel blocks"
          value={p.blocks}
          hint="One female, one male"
          icon={BedDouble}
          t="brand"
        />
        <Stat
          label="Alert precision"
          value={`${p.precision}%`}
          hint="Marked true by wardens"
          icon={CheckCircle2}
          t="success"
        />
        <Stat
          label="Time to acknowledge"
          value={`${p.ackP50} min`}
          hint="Median, target under 5"
          t="info"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Confirmed breaches per week</CardTitle>
            <CardDescription>
              Both pilot blocks together. Weeks 2–3 are the shadow run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pilotConfig}
              className="aspect-auto h-60 w-full"
            >
              <LineChart
                data={p.weekly.map((w) => ({
                  week: w.week.split(' · ')[0],
                  confirmed: w.confirmed,
                }))}
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis width={32} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="confirmed"
                  stroke="var(--color-confirmed)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly totals</CardTitle>
            <CardDescription>
              Counts from 1 to 4 are shown as “&lt;5”.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead className="text-right">Confirmed</TableHead>
                  <TableHead className="text-right">False alarms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.weekly.map((w) => (
                  <TableRow key={w.week}>
                    <TableCell>{w.week}</TableCell>
                    <TableCell className="tabular text-right">
                      {suppress(w.confirmed)}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {suppress(w.falseAlarms)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pilot KPIs</CardTitle>
          <CardDescription>
            Agreed between EzGIG and the university before go-live
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead>KPI</TableHead>
                <TableHead>How measured</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.kpis.map((k) => (
                <TableRow key={k.kpi}>
                  <TableCell className="font-medium whitespace-normal">
                    {k.kpi}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {k.measured}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {k.target}
                  </TableCell>
                  <TableCell className="whitespace-normal">{k.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// -------------------------------------------------------------- governance --

export function GovernanceView() {
  const fr = institutions.filter((i) => i.faceRecognition);
  const policies = institutions.filter((i) => i.policyAnalytics);
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Privacy & PDPA"
        description="What the amended Personal Data Protection Act means for campus cameras, and where universities already stand."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {pdpaPoints.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {p.text}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Source:{' '}
        <ExtLink href={pdpaUrl}>
          Data Protection Report, Malaysia PDPA Amendment Act 2024
        </ExtLink>
      </p>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="size-4" /> Face recognition in use
            </CardTitle>
            <CardDescription>
              Biometric data is sensitive: these need explicit consent and a
              DPIA.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {fr.map((i) => (
              <div key={i.id}>
                <div className="font-medium">{i.name}</div>
                <p className="text-xs text-muted-foreground">{i.deployed}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="size-4" /> CCTV policies that ask for
              analytics
            </CardTitle>
            <CardDescription>
              Written into policy; few can show it running.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {policies.map((i) => (
              <div key={i.id}>
                <div className="font-medium">{i.name}</div>
                <p className="text-xs text-muted-foreground">{i.deployed}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>The published template</CardTitle>
            <CardDescription>
              University of Edinburgh CCTV protocol
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1.5 text-sm">
            {[
              'A privacy impact assessment for every camera',
              'Privacy masking',
              '30-day retention',
              'Named viewer roles',
              'Logged access',
              'Quarterly audits',
            ].map((x) => (
              <div key={x} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {x}
              </div>
            ))}
            <p className="mt-1 text-xs text-muted-foreground">
              XMUM’s privacy notice already covers CCTV and biometric data; it
              is the only private university that publishes one.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Red lines worth stating nationally</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              'No classroom attention scoring',
              'Unreliable, and the clearest red line globally; China’s ministry curbed it in 2019.',
            ],
            [
              'No cameras in toilets or changing rooms',
              'Singapore universities keep CCTV at entrances only; radar can sense falls without images.',
            ],
            [
              'Face recognition off by default',
              'UCLA dropped it in 2020 after 58 false matches.',
            ],
            [
              'A person decides',
              'AI flags; a warden, operator or HEP officer decides. Welfare alerts go to counselling, not discipline.',
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

// ----------------------------------------------------------------- reports --

function nationalBrief() {
  const pdf = new Pdf();
  const t = auditTotals;
  pdf.rect(0, 0, 595, 42, [0.12, 0.2, 0.4]);
  pdf.text('KPT · Smart-campus brief', {
    y: 14,
    size: 14,
    bold: true,
    gray: 1,
  });
  pdf.y = 60;
  pdf.text('Campus video analytics in Malaysian universities · 26 Oct 2026', {
    bold: true,
  });
  pdf.gap();
  pdf.para(
    `${t.audited} universities audited (${t.public} public, ${t.private} private). ${t.ai} have a confirmed AI or vision security system. None shows AI at hostels (${t.hostelClaims} unverified claim). ${t.policyAnalytics} CCTV policies ask for video analytics. ${t.faceRecognition} run face recognition. ${t.unknown} show no public evidence.`,
  );
  pdf.gap();
  pdf.text('Patterns', { bold: true, size: 11 });
  for (const p of patterns) pdf.para(`${p.title}. ${p.text}`, { size: 9 });
  pdf.gap();
  pdf.text('Hostel integrity pilots (aggregates)', { bold: true, size: 11 });
  pdf.text(
    `Reporting: ${pilotAggregates.reporting} university, ${pilotAggregates.blocks} blocks. Precision ${pilotAggregates.precision}%. Median time to acknowledge ${pilotAggregates.ackP50} min.`,
    { size: 9 },
  );
  for (const w of pilotAggregates.weekly)
    pdf.text(
      `${w.week}: ${suppress(w.confirmed)} confirmed, ${suppress(w.falseAlarms)} false alarms`,
      { size: 9 },
    );
  pdf.gap();
  pdf.text('PDPA', { bold: true, size: 11 });
  for (const p of pdpaPoints) pdf.para(`${p.title}. ${p.text}`, { size: 9 });
  pdf.gap();
  pdf.para(auditMethod, { size: 8, gray: 0.45 });
  pdf.para(kptExclusionLine, { size: 8, gray: 0.45 });
  download('kpt-smart-campus-brief.pdf', pdf.build());
}

export function KptReportsView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Reports"
        description="Briefs and data for the ministry. Aggregates and public-evidence audit rows only."
      />
      <ExclusionBanner />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" /> Smart-campus brief (PDF)
            </CardTitle>
            <CardDescription>
              The audit’s findings, hostel pilot aggregates and PDPA points, on
              two pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={nationalBrief}>
              <Download />
              Download PDF
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" /> Audit data (CSV)
            </CardTitle>
            <CardDescription>
              All 38 rows with maturity, flags and evidence links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate('/kpt/universities')}
            >
              Open universities
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">{auditMethod}</p>
    </div>
  );
}
