'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  FileClock,
  ScrollText,
  Check,
  X,
  Cpu,
  Thermometer,
  Video,
  Server,
  Ban,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { PageHeader, Stat, Pill, Meter, Note } from '../../_components/ui-bits';
import {
  analytics,
  exclusions,
  cameras,
  precincts,
  accessRequests,
  retention,
  dpiaRegister,
  edgeAppliances,
  users,
  type AnalyticId,
} from '../../_data/um';
import { scenes, mediaUrl } from '../../_data/media';
import type { Persona } from '../../_data/personas';
import { useDemo } from '../../_lib/store';
import { notify } from '../../_lib/notify';

// --------------------------------------------------------------- analytics --

export function AnalyticsView({ persona }: { persona: Persona }) {
  const ids = Object.keys(analytics) as AnalyticId[];
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      ids.map((id) => [id, analytics[id].status !== 'Evaluation only']),
    ),
  );
  const canEdit = persona.id === 'director';
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="AI analytics & exclusions"
        description="What each analytic can detect, what it cannot establish, its alert threshold and where it runs. Below them, the capabilities this platform refuses in writing."
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analytic</TableHead>
                <TableHead className="hidden lg:table-cell">Detects</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Cannot establish
                </TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Cameras
                </TableHead>
                <TableHead className="text-right">Alerting</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ids.map((id) => {
                const a = analytics[id];
                const evalOnly = a.status === 'Evaluation only';
                return (
                  <TableRow key={id}>
                    <TableCell className="whitespace-normal">
                      <div className="font-medium">{a.name}</div>
                      <Pill
                        t={
                          a.status === 'Live'
                            ? 'success'
                            : a.status === 'Pilot'
                              ? 'warning'
                              : 'muted'
                        }
                        className="mt-1"
                      >
                        {a.status}
                      </Pill>
                    </TableCell>
                    <TableCell className="hidden max-w-xs whitespace-normal text-muted-foreground lg:table-cell">
                      {a.detects}
                    </TableCell>
                    <TableCell className="hidden max-w-xs whitespace-normal text-muted-foreground xl:table-cell">
                      {a.cannot}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {a.threshold.toFixed(2)}
                    </TableCell>
                    <TableCell className="tabular hidden text-right sm:table-cell">
                      {cameras.filter((c) => c.analytics.includes(id)).length}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={on[id]}
                        disabled={!canEdit || evalOnly}
                        aria-label={`Alerting for ${a.name}`}
                        onCheckedChange={(v) => {
                          setOn((s) => ({ ...s, [id]: v }));
                          notify.info(
                            `${a.name} alerting ${v ? 'on' : 'off'}`,
                            'Change recorded in the audit log',
                          );
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Note className="mt-3">
            The dangerous-object analytic runs on the drill camera for
            evaluation only and cannot alert anyone. Every detection carries its
            model confidence and waits for an operator to verify it before it is
            shared with anyone.
          </Note>
        </CardContent>
      </Card>
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Ban className="size-4 text-critical" />
          Refused capabilities
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exclusions.map((e) => (
            <Card key={e.name} size="sm" className="bg-critical-soft/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-3.5 text-critical" />
                  {e.name}
                </CardTitle>
                <CardDescription>{e.reason}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- privacy --

export function PrivacyView({ persona }: { persona: Persona }) {
  const { state, dispatch } = useDemo();
  const [requests, setRequests] = useState(
    accessRequests.map((r) => ({ ...r })),
  );
  const isDpo = persona.id === 'dpo' || persona.id === 'director';
  const decide = (id: string, ok: boolean) => {
    setRequests(
      (rs) =>
        rs.map((r) =>
          r.id === id
            ? { ...r, status: ok ? 'Approved' : 'Refused', approver: 'DPO' }
            : r,
        ) as typeof rs,
    );
    dispatch({
      type: 'audit',
      entry: {
        who: persona.name,
        action: ok ? 'Approved playback' : 'Refused playback',
        target: id,
        reason: ok ? 'Lawful police request' : 'No permitted purpose',
      },
    });
    notify.success(
      ok ? 'Request approved' : 'Request refused',
      `${id} recorded in the audit log`,
    );
  };
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="PDPA 2010 (as amended 2024)"
        title="Privacy centre"
        description="Who asked to see which footage and why, every view and export, how long each kind of data is kept, and the impact assessments behind each system."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Pending requests"
          value={requests.filter((r) => r.status === 'Pending').length}
          icon={FileClock}
          t="warning"
        />
        <Stat
          label="Audit entries today"
          value={state.audit.length}
          icon={ScrollText}
        />
        <Stat
          label="DPIAs approved"
          value={`${dpiaRegister.filter((d) => d.status === 'Approved').length}/${dpiaRegister.length}`}
          icon={ShieldCheck}
          t="success"
        />
        <Stat
          label="Breaches notified (12 mo)"
          value={0}
          icon={KeyRound}
          t="muted"
        />
      </div>
      <Tabs defaultValue="requests">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList>
            <TabsTrigger value="requests">Footage requests</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="dpia">DPIA & breaches</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="requests">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Purpose
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Cameras & window
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-normal">
                        <div className="font-mono text-xs">{r.id}</div>
                        {r.requester}
                      </TableCell>
                      <TableCell className="hidden max-w-xs whitespace-normal md:table-cell">
                        {r.purpose}
                      </TableCell>
                      <TableCell className="hidden whitespace-normal text-muted-foreground lg:table-cell">
                        {r.cameras}
                        <div className="text-xs">{r.window}</div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <Pill
                          t={
                            r.status === 'Approved'
                              ? 'success'
                              : r.status === 'Pending'
                                ? 'warning'
                                : 'critical'
                          }
                        >
                          {r.status}
                        </Pill>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {r.approver}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === 'Pending' && isDpo ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              onClick={() => decide(r.id, true)}
                              aria-label={`Approve ${r.id}`}
                            >
                              <Check />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="outline"
                              onClick={() => decide(r.id, false)}
                              aria-label={`Refuse ${r.id}`}
                            >
                              <X />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Note className="mt-3">
                Exports are watermarked with the requester and request ID, and
                faces of third parties are blurred before release.
              </Note>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Who</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Target
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Reason
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.audit.map((a, n) => (
                    <TableRow key={n}>
                      <TableCell className="tabular">{a.time}</TableCell>
                      <TableCell className="whitespace-normal">
                        {a.who}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {a.action}
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {a.target}
                      </TableCell>
                      <TableCell className="hidden whitespace-normal text-muted-foreground lg:table-cell">
                        {a.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Kept for</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Basis
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retention.map((r) => (
                    <TableRow key={r.data}>
                      <TableCell className="whitespace-normal">
                        {r.data}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {r.period}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {r.basis}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dpia" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>DPIA register</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {dpiaRegister.map((d) => (
                <div
                  key={d.system}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
                >
                  <span className="min-w-0">
                    {d.system}
                    <span className="block text-xs text-muted-foreground">
                      Reviewed {d.reviewed}
                    </span>
                  </span>
                  <Pill
                    t={
                      d.status === 'Approved'
                        ? 'success'
                        : d.status === 'Conditional'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {d.status}
                  </Pill>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Breach notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShieldCheck />
                  </EmptyMedia>
                  <EmptyTitle>No breaches in the last 12 months</EmptyTitle>
                  <EmptyDescription>
                    A breach is notified to the Commissioner and affected people
                    under the 2025 breach-notification duty.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------------------------------------------------------- devices --

export function DevicesView({ persona }: { persona: Persona }) {
  const [filter, setFilter] = useState<'all' | 'attention'>('all');
  const list = cameras.filter((c) => filter === 'all' || c.status !== 'online');
  const online = cameras.filter((c) => c.status === 'online').length;
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Devices & health"
        description="Cameras and the edge appliances that run their analytics. A camera that stops reporting is shown as a gap in coverage, never as a quiet area."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Cameras online"
          value={`${online}/${cameras.length}`}
          icon={Video}
          t="success"
        />
        <Stat
          label="Offline"
          value={cameras.filter((c) => c.status === 'offline').length}
          icon={Video}
          t="critical"
        />
        <Stat
          label="Degraded"
          value={cameras.filter((c) => c.status === 'degraded').length}
          icon={Video}
          t="warning"
        />
        <Stat
          label="Edge appliances"
          value={edgeAppliances.length}
          hint="All reporting"
          icon={Server}
          t="info"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {edgeAppliances.map((e) => (
          <Card key={e.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm">{e.id}</span>
                <Pill t={e.status === 'Healthy' ? 'success' : 'warning'}>
                  {e.status}
                </Pill>
              </CardTitle>
              <CardDescription>
                {e.site} · {e.cameras} cameras
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs">
              {[
                ['CPU', e.cpu, Cpu],
                ['GPU', e.gpu, Cpu],
                ['Temp °C', e.temp, Thermometer],
              ].map(([k, v, I]) => {
                const Icon = I as typeof Cpu;
                return (
                  <div
                    key={k as string}
                    className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2"
                  >
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon className="size-3" />
                      {k as string}
                    </span>
                    <Meter
                      value={v as number}
                      t={(v as number) > 70 ? 'warning' : 'brand'}
                    />
                    <span className="tabular text-right">{v as number}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Camera estate</CardTitle>
          <CardDescription>
            {persona.video
              ? 'Thumbnail is the last still received.'
              : 'Thumbnails are hidden for your role.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <TabsList>
              <TabsTrigger value="all">All ({cameras.length})</TabsTrigger>
              <TabsTrigger value="attention">
                Needs attention ({cameras.length - online})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camera</TableHead>
                <TableHead className="hidden md:table-cell">Precinct</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Analytics
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-3">
                      {persona.video ? (
                        <img
                          src={mediaUrl(scenes[c.scene].still)}
                          alt=""
                          loading="lazy"
                          className={cn(
                            'h-10 w-16 shrink-0 rounded object-cover',
                            c.status === 'offline' && 'opacity-30 grayscale',
                          )}
                        />
                      ) : (
                        <span className="grid h-10 w-16 shrink-0 place-items-center rounded bg-muted">
                          <Video className="size-4 text-muted-foreground" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-muted-foreground">
                          {c.id}
                        </div>
                        <div className="text-sm">{c.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {precincts[c.precinct].name}
                  </TableCell>
                  <TableCell className="tabular hidden lg:table-cell">
                    {c.analytics.length}
                  </TableCell>
                  <TableCell>
                    <Pill
                      t={
                        c.status === 'online'
                          ? 'success'
                          : c.status === 'degraded'
                            ? 'warning'
                            : 'critical'
                      }
                      dot
                    >
                      {c.status === 'online'
                        ? 'Online'
                        : c.status === 'degraded'
                          ? 'Degraded'
                          : 'Offline'}
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

// ------------------------------------------------------------------- users --

const capabilities = [
  'Live video',
  'Verify detections',
  'Footage search',
  'Recorded playback',
  'Anonymous counts',
  'Approve footage',
  'Configure analytics',
] as const;
const matrix: Record<string, (typeof capabilities)[number][]> = {
  'Director, security technology': [
    'Live video',
    'Verify detections',
    'Footage search',
    'Recorded playback',
    'Anonymous counts',
    'Configure analytics',
  ],
  'Video analytics operator': [
    'Live video',
    'Verify detections',
    'Footage search',
    'Anonymous counts',
  ],
  'Facilities & space planning': ['Anonymous counts'],
  'Data protection officer': ['Approve footage'],
  'Mobile responder': ['Live video', 'Verify detections'],
};

export function UsersView() {
  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        title="Users & roles"
        description="University single sign-on with multi-factor authentication. Each role sees only what its job needs; recorded playback always needs an approved purpose."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Scope</TableHead>
                  <TableHead className="text-right">Last seen</TableHead>
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
                    <TableCell className="hidden whitespace-normal text-muted-foreground sm:table-cell">
                      {u.scope}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {u.last}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role permissions</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-xs">
              <thead>
                <tr>
                  <th className="p-1.5 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  {capabilities.map((c) => (
                    <th
                      key={c}
                      className="p-1.5 text-center font-medium text-muted-foreground"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(matrix).map(([role, caps]) => (
                  <tr key={role} className="border-t">
                    <td className="p-1.5 font-medium">{role}</td>
                    {capabilities.map((c) => (
                      <td key={c} className="p-1.5 text-center">
                        {caps.includes(c) ? (
                          <Check className="mx-auto size-3.5 text-success" />
                        ) : (
                          <span className="text-muted-foreground/50">·</span>
                        )}
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
  );
}
