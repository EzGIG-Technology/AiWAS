'use client';
import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Video,
  Siren,
  ClipboardCheck,
  ChartNoAxesCombined,
  Activity,
  SlidersHorizontal,
  Bell,
  Users,
  ChevronRight,
  ArrowUpRight,
  Clock3,
  Radio,
  School,
  Search,
  Download,
  Check,
  X,
  Plus,
  LockKeyhole,
  WifiOff,
  Maximize,
  Play,
  CheckCheck,
  Info,
  History,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Toaster, toast as toastManager } from '@/components/ui/toast';
const toast = {
  success: (title: string) => toastManager.add({ title, type: 'success' }),
  error: (title: string) => toastManager.add({ title, type: 'error' }),
  info: (title: string) => toastManager.add({ title, type: 'info' }),
};
import { CameraStill, DemoVideo, mediaFor, mediaSources } from './camera-media';
import { PriorityAlerts, scenarioOptions } from './priority-alerts';
import { FleetOverview, PresencePanel } from './workspace-panels';
import {
  needsReview,
  inPeriod,
  transitionError,
  transitionChanges,
  csvCell,
} from './workflow';
import { SchoolOnboarding } from './school-onboarding';
import { OperationsPanel } from './operations-panel';
import {
  schools as initialSchools,
  roles,
  categories,
  initialIncidents,
  cameras as initialCameras,
  initialUsers,
  severityClass,
  type Incident,
  type Camera,
  type Role,
  type User,
} from './data';
const nav = [
  ['Overview', LayoutDashboard],
  ['Schools', School],
  ['Attendance & presence', Users],
  ['Live cameras', Video],
  ['Incidents', Siren],
  ['Response workspace', ClipboardCheck],
  ['Validation queue', ClipboardCheck],
  ['Analytics', ChartNoAxesCombined],
  ['System health', Activity],
  ['Detection rules', SlidersHorizontal],
  ['Notification routing', Bell],
  ['Users & roles', Users],
] as const;
const headings: Record<string, string> = {
  Overview: 'School command centre',
  Schools: 'School directory',
  'Attendance & presence': 'Attendance & presence',
  'Live cameras': 'Live cameras',
  Incidents: 'Incident log',
  'Response workspace': 'Response workspace',
  'Validation queue': 'Validation queue',
  Analytics: 'Safety analytics',
  'System health': 'System health',
  'Detection rules': 'Detection rules',
  'Notification routing': 'Notification routing',
  'Users & roles': 'Users & roles',
};
const subtitles: Record<string, string> = {
  Overview: 'Today’s priorities, people and campus coverage.',
  Schools:
    'Manage coverage, configuration and access across connected schools.',
  'Attendance & presence':
    'Reconcile attendance, entry and departure records for your school.',
  'Live cameras': 'Monitor each zone with anonymous, real-time detection.',
  Incidents: 'Every flagged event, from detection to resolution.',
  'Response workspace':
    'Report concerns, coordinate follow-up and track maintenance.',
  'Validation queue': 'Your review helps make every detection more reliable.',
  Analytics: 'Understand patterns and measure detection quality.',
  'System health': 'Camera connectivity and central processing at a glance.',
  'Detection rules':
    'Calibrate thresholds for each school, zone, and category.',
  'Notification routing': 'Connect the right incident to the right people.',
  'Users & roles': 'Manage workspace access and school assignments.',
};
function Pick({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: string;
  onChange: (x: string) => void;
  options: string[];
  label: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className={'picker ' + className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Badge({ value }: { value: string }) {
  return <span className={'badge ' + severityClass(value)}>{value}</span>;
}
function Empty({
  title = 'No incidents found',
  text = 'Try a different filter or search.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty-state">
      <CheckCircle2 size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Cam({ cam, onClick }: { cam: Camera; onClick: () => void }) {
  return (
    <button
      className={'camera ' + (!cam.online ? 'offline' : '')}
      onClick={onClick}
      aria-label={`Open ${cam.zone} camera`}
    >
      <div className="cam-top">
        <span>
          {cam.online ? <i className="live-dot" /> : <WifiOff size={12} />}{' '}
          {cam.id}
        </span>
        <span>{cam.online ? 'MOCK CCTV' : 'OFFLINE'}</span>
      </div>
      {cam.online ? (
        <CameraStill scene={mediaFor(cam.zone)} />
      ) : (
        <div className="feed-blank">
          <WifiOff size={28} />
          <span>Connection lost</span>
          <small>Last seen at 10:28 MYT</small>
        </div>
      )}
      <div className="cam-bottom">
        <strong>{cam.zone}</strong>
        <span>
          {cam.block}
          <Maximize size={13} />
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const [schools, setSchools] = useState(initialSchools);
  const [cameras, setCameras] = useState(initialCameras);
  const [view, setView] = useState('Overview'),
    [school, setSchool] = useState(schools[0]),
    [role, setRole] = useState<Role>('School Admin'),
    [incidents, setIncidents] = useState(initialIncidents),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [camera, setCamera] = useState<Camera | null>(null),
    [search, setSearch] = useState(''),
    [severity, setSeverity] = useState('All severities'),
    [status, setStatus] = useState('All statuses'),
    [category, setCategory] = useState('All categories'),
    [zone, setZone] = useState('All zones'),
    [validationTab, setValidationTab] = useState('Pending'),
    [note, setNote] = useState(''),
    [exportOpen, setExportOpen] = useState(false),
    [startDate, setStartDate] = useState('2026-08-12'),
    [endDate, setEndDate] = useState('2026-09-10'),
    [users, setUsers] = useState(initialUsers),
    [userOpen, setUserOpen] = useState(false),
    [editUser, setEditUser] = useState<number | null>(null),
    [userName, setUserName] = useState(''),
    [userEmail, setUserEmail] = useState(''),
    [userRole, setUserRole] = useState<Role>('School Admin'),
    [userSchool, setUserSchool] = useState(schools[0]),
    [userActive, setUserActive] = useState(true),
    [audit, setAudit] = useState<
      { text: string; time: string; school: string }[]
    >([]),
    [healthTime, setHealthTime] = useState('10:44:00'),
    [configZone, setConfigZone] = useState('Canteen'),
    [configCategory, setConfigCategory] = useState('Crowd counting'),
    [config, setConfig] = useState<
      Record<
        string,
        {
          confidence: number;
          limit: number;
          tolerance: number;
          dwell: number;
          from: string;
          to: string;
          enabled: boolean;
        }
      >
    >({}),
    [draft, setDraft] = useState({
      confidence: 80,
      limit: 20,
      tolerance: 3,
      dwell: 10,
      from: '18:00',
      to: '06:00',
      enabled: true,
    }),
    [routes, setRoutes] = useState<Record<string, boolean>>({}),
    [savedRoutes, setSavedRoutes] = useState<Record<string, boolean>>({}),
    [routeCategory, setRouteCategory] = useState('All categories'),
    [routeSaved, setRouteSaved] = useState(false),
    [period, setPeriod] = useState('Today');
  const privileged = role === 'Internal Ops' || role === 'System Admin';
  const canManageUsers = privileged || role === 'School Admin';
  const allowedNav = nav.filter(([n]) => {
    if (n === 'Schools') return privileged;
    if (n === 'Attendance & presence') return !privileged;
    if (n === 'Detection rules') return privileged;
    if (n === 'Notification routing') return role === 'System Admin';
    if (n === 'Users & roles') return canManageUsers;
    return true;
  });
  const roleLabel = (r: string) =>
    r === 'System Admin'
      ? 'Superadmin'
      : r === 'Internal Ops'
        ? 'Platform operator'
        : r === 'School Admin'
          ? 'School administrator'
          : 'Teacher · incident review';
  const selectSchoolView = (name: string, target: string) => {
    setSchool(name);
    navigate(target);
  };
  const navigate = (n: string) => {
    if (!allowedNav.some(([x]) => x === n)) return;
    setView(n);
    window.history.pushState(
      null,
      '',
      '#' + n.toLowerCase().replaceAll(' ', '-'),
    );
    setSearch('');
    setSeverity('All severities');
    setStatus('All statuses');
    setCategory('All categories');
    setZone('All zones');
  };
  useEffect(() => {
    const readHash = () => {
      const name = nav.find(
        ([n]) =>
          '#' + n.toLowerCase().replaceAll(' ', '-') === window.location.hash,
      )?.[0];
      setView(name || 'Overview');
      setSelectedId(null);
    };
    const timer = window.setTimeout(readHash, 0);
    window.addEventListener('popstate', readHash);
    window.addEventListener('hashchange', readHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', readHash);
      window.removeEventListener('hashchange', readHash);
    };
  }, []);
  const [previousRole, setPreviousRole] = useState(role);
  if (previousRole !== role) {
    setPreviousRole(role);
    setSelectedId(null);
    if (!privileged) setSchool(schools[0]);
  }
  if (!allowedNav.some(([n]) => n === view)) setView('Overview');
  const schoolIncidents = incidents.filter(
    (i) =>
      i.school === school &&
      (role !== 'Discipline Teacher' ||
        [
          'Bullying',
          'Fighting',
          'Violent behaviour',
          'Smoking / vaping',
          'Vandalism',
          'Visible blade concern',
        ].includes(i.category)),
  );
  const selected = schoolIncidents.find((i) => i.id === selectedId);
  const schoolCameras = cameras.filter((c) => c.school === school);
  const pending = schoolIncidents.filter(needsReview);
  const open = schoolIncidents.filter((i) => i.status !== 'Closed');
  const high = open.filter((i) => ['High', 'Critical'].includes(i.severity));
  const acknowledge = (id: string) => {
    if (
      !schoolIncidents.some(
        (i) => i.id === id && !i.acknowledged && i.status !== 'Closed',
      )
    )
      return;
    setIncidents((all) =>
      all.map((i) =>
        i.id === id
          ? {
              ...i,
              acknowledged: true,
              history: [
                ...i.history,
                {
                  text: 'Alert acknowledged; staff review started',
                  actor: `Nadia Ahmad · ${role}`,
                  time: now(),
                },
              ],
            }
          : i,
      ),
    );
    toast.success('Alert acknowledged. Validation is still required.');
  };
  const addScenario = (scenario: string) => {
    const idx = scenarioOptions.indexOf(scenario);
    const newId = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const z = [
      'Block A corridor',
      'Canteen',
      'East perimeter',
      'Block A corridor',
    ][idx];
    const item: Incident = {
      id: newId,
      category: [
        'Fighting',
        'Crowd counting',
        'Restricted area intrusion',
        'Visible blade concern',
      ][idx],
      school,
      zone: z,
      block: idx === 2 ? 'Boundary' : 'Block A',
      camera: ['CAM-03', 'CAM-02', 'CAM-04', 'CAM-03'][idx],
      severity: ['High', 'Medium', 'High', 'Critical'][idx],
      confidence: [86, 89, 92, 72][idx],
      date: '2026-09-10',
      time: now(),
      status: 'Open',
      validation: 'Pending',
      assigned: 'Nadia Ahmad',
      description:
        idx === 3
          ? 'Synthetic training scene: a possible visible blade requires urgent human assessment. This is an evaluation-only scenario, not a validated production weapon detector.'
          : 'Synthetic camera scene analysed in a 10-second demo. The result is illustrative and has not been generated by a real detection model.',
      history: [
        {
          text: 'Demo frames received and analysed over 10 seconds',
          actor: 'Demo engine',
          time: now(),
        },
        {
          text: 'Unverified alert created; no external notifications sent',
          actor: 'Demo engine',
          time: now(),
        },
      ],
    };
    setIncidents((all) => [item, ...all]);
    toast.info(`${item.severity} priority: ${item.category}`);
  };
  const confirmed = schoolIncidents.filter(
    (i) => i.validation === 'Confirmed' && i.date === '2026-09-10',
  );
  const filtered = schoolIncidents.filter(
    (i) =>
      (severity === 'All severities' || i.severity === severity) &&
      (status === 'All statuses' || i.status === status) &&
      (category === 'All categories' || i.category === category) &&
      (zone === 'All zones' || i.zone === zone) &&
      `${i.id} ${i.category} ${i.zone} ${i.assigned}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const reportDate = schoolIncidents.reduce(
    (latest, i) => (i.date > latest ? i.date : latest),
    '2026-09-10',
  );
  const analysisIncidents = schoolIncidents.filter((i) =>
    inPeriod(i.date, period, reportDate),
  );
  const analysed = analysisIncidents.filter((i) => !needsReview(i));
  const falseCount = analysed.filter(
    (i) => i.validation === 'False alarm',
  ).length;
  const falseRate = analysed.length
    ? Math.round((falseCount / analysed.length) * 100)
    : 0;
  const now = () =>
    new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
    });
  const log = (text: string) =>
    setAudit((a) => [{ text, time: now(), school }, ...a]);
  const openIncident = (id: string) => {
    setSelectedId(id);
    setNote('');
    log(`Nadia Ahmad viewed incident ${id}`);
  };
  const updateIncident = (patch: Partial<Incident>, event: string) => {
    if (!selected) return;
    setIncidents((all) =>
      all.map((i) =>
        i.id === selected.id
          ? {
              ...i,
              ...patch,
              history: [
                ...i.history,
                { text: event, actor: `Nadia Ahmad · ${role}`, time: now() },
              ],
            }
          : i,
      ),
    );
    toast.success(event);
  };
  const validate = (outcome: string) => {
    if (!selected || !needsReview(selected)) return;
    if (note.trim().length < 10) {
      toast.error('Explain your review decision in at least 10 characters.');
      return;
    }
    updateIncident(
      {
        validation: outcome,
        status: 'Under Review',
      },
      `Marked ${outcome.toLowerCase()}${note.trim() ? ': ' + note.trim() : ''}`,
    );
    setNote('');
  };
  const effectiveZone = schoolCameras.some((c) => c.zone === configZone)
    ? configZone
    : schoolCameras[0]?.zone || '';
  const configKey = `${school}|${effectiveZone}|${configCategory}`;
  const [draftKey, setDraftKey] = useState(configKey);
  if (draftKey !== configKey) {
    setDraftKey(configKey);
    setDraft(
      config[configKey] || {
        confidence: 80,
        limit: 20,
        tolerance: 3,
        dwell: 10,
        from: '18:00',
        to: '06:00',
        enabled: true,
      },
    );
  }
  useEffect(() => {
    const ctx = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              description: string;
              inputSchema: object;
              annotations: object;
              execute: (input: unknown) => unknown;
            },
            options: { signal: AbortSignal },
          ) => unknown;
        };
      }
    ).modelContext;
    if (!ctx?.registerTool) return;
    const life = new AbortController();
    try {
      Promise.resolve(
        ctx.registerTool(
          {
            name: 'read_incident_summary',
            description:
              'Read the current school demo incident counts and validation queue.',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: unknown) => {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).length
              )
                throw Error('Expected an empty object');
              return {
                school,
                open: open.length,
                pending: pending.map((i) => ({
                  id: i.id,
                  category: i.category,
                  severity: i.severity,
                })),
              };
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => life.abort();
  }, [school, incidents, role, open.length, pending]);
  function exportReport() {
    if (!startDate || !endDate || startDate > endDate) {
      toast.error('Choose a valid date range.');
      return;
    }
    if ((Date.parse(endDate) - Date.parse(startDate)) / 86400000 >= 30) {
      toast.error('Choose no more than 30 days per export.');
      return;
    }
    const rows = filtered.filter(
      (i) => i.date >= startDate && i.date <= endDate,
    );
    if (!rows.length) {
      toast.error('No incidents in this date range.');
      return;
    }
    const csv = [
      ['DEMO DATA — AiWAS incident report'],
      ['School', school],
      ['Period', startDate, endDate],
      [
        'ID',
        'Date',
        'Time MYT',
        'Category',
        'Zone',
        'Severity',
        'Confidence %',
        'Status',
        'Validation',
        'Assigned to',
      ],
      ...rows.map((i) => [
        i.id,
        i.date,
        i.time,
        i.category,
        i.zone,
        i.severity,
        i.confidence,
        i.status,
        i.validation,
        i.assigned,
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
    const a = document.createElement('a');
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }),
    );
    a.href = url;
    a.download = `AiWAS-demo-report-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    log(
      `Nadia Ahmad exported ${rows.length} demo incidents (${startDate} to ${endDate})`,
    );
    setExportOpen(false);
    toast.success(`${rows.length} incidents exported`);
  }
  function openUser(index: number | null) {
    if (index !== null && !privileged && users[index]?.school !== school)
      return;
    setEditUser(index);
    const u = index !== null ? users[index] : null;
    setUserName(u?.name || '');
    setUserEmail(u?.email || '');
    setUserRole(u?.role || 'School Admin');
    setUserSchool(u?.school || school);
    setUserActive(u?.active ?? true);
    setUserOpen(true);
  }
  function saveUser(e: React.SyntheticEvent) {
    e.preventDefault();
    if (
      !privileged &&
      (!['School Admin', 'Discipline Teacher'].includes(userRole) ||
        userSchool !== school)
    ) {
      toast.error(
        'School administrators can manage their own school team only.',
      );
      return;
    }
    if (
      users.some(
        (u, i) =>
          u.email.toLowerCase() === userEmail.trim().toLowerCase() &&
          i !== editUser,
      )
    ) {
      toast.error('That email is already in the workspace.');
      return;
    }
    const u: User = {
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
      school:
        userRole === 'Internal Ops' || userRole === 'System Admin'
          ? 'All PoC schools'
          : userSchool,
      active: userActive,
    };
    if (!u.name) {
      toast.error('Enter a name.');
      return;
    }
    setUsers((list) =>
      editUser === null
        ? [...list, u]
        : list.map((x, i) => (i === editUser ? u : x)),
    );
    setUserOpen(false);
    toast.success(
      editUser === null
        ? 'Demo user added. No invitation sent.'
        : 'User updated for this demo session.',
    );
  }
  const incidentTable = (list: Incident[]) =>
    list.length ? (
      <Table>
        <TableHeader>
          <TableRow>
            {[
              'Incident',
              'Location',
              'Detected',
              'Severity',
              'Status',
              'Validation',
              '',
            ].map((x, i) => (
              <TableHead key={i}>{x}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((i) => (
            <TableRow key={i.id}>
              <TableCell>
                <button
                  className="incident-link"
                  onClick={() => openIncident(i.id)}
                >
                  <span className={'mini-icon ' + severityClass(i.severity)}>
                    <Siren size={16} />
                  </span>
                  <span>
                    <strong>{i.category}</strong>
                    <small>{i.id}</small>
                  </span>
                </button>
              </TableCell>
              <TableCell>
                <span>{i.zone}</span>
                <small>
                  {i.block} · {i.camera}
                </small>
              </TableCell>
              <TableCell>
                {i.time}
                <small>{i.date} · MYT</small>
              </TableCell>
              <TableCell>
                <Badge value={i.severity} />
              </TableCell>
              <TableCell>
                <span
                  className={
                    'status-text ' + (i.status === 'Closed' ? 'closed' : '')
                  }
                >
                  <i />
                  {i.status}
                </span>
              </TableCell>
              <TableCell>
                <Badge value={i.validation} />
              </TableCell>
              <TableCell>
                <button
                  className="icon-btn"
                  aria-label={`Review ${i.id}`}
                  onClick={() => openIncident(i.id)}
                >
                  <ChevronRight size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <Empty />
    );
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '244px' } as React.CSSProperties}
    >
      <Toaster />
      <Sidebar className="nav-rail">
        <SidebarHeader>
          <button className="brand" onClick={() => navigate('Overview')}>
            <ShieldCheck />
            <span>
              AiWAS<span className="brand-dot">.</span>
            </span>
          </button>
          <p className="brand-sub">SCHOOL SAFETY INTELLIGENCE</p>
          <div className="workspace">
            <span className="workspace-logo">E</span>
            <span>
              {privileged ? 'Platform administration' : 'School operations'}
              <small>
                {privileged
                  ? 'All connected schools'
                  : 'SMK Tunku Ampuan Durah'}
              </small>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <p className="nav-label">WORKSPACE</p>
          <SidebarMenu>
            {allowedNav.map(([label, Icon]) => (
              <SidebarMenuItem key={label}>
                {label === 'Detection rules' && (
                  <p className="nav-label">ADMINISTRATION</p>
                )}
                <SidebarMenuButton
                  isActive={view === label}
                  onClick={() => navigate(label)}
                >
                  <Icon />
                  <span>
                    {label === 'Overview' && privileged
                      ? 'Platform overview'
                      : label === 'Users & roles' && !privileged
                        ? 'School team'
                        : label}
                  </span>
                  {label === 'Incidents' && (
                    <b className="nav-count">{open.length}</b>
                  )}
                  {label === 'Validation queue' && pending.length > 0 && (
                    <i className="queue-dot" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="privacy">
            <ShieldCheck />
            <span>
              Protected workspace<small>School-scoped access</small>
            </span>
          </div>
          <div className="profile">
            <span className="avatar">NA</span>
            <span>
              Nadia Ahmad<small>{roleLabel(role)}</small>
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger />
            <span>{privileged ? 'Superadmin' : 'School workspace'}</span>
            <ChevronRight size={14} />
            <strong>{view}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-pill">Demo workspace</span>
            <div className="top-role">
              <Pick
                label="Demo workspace"
                value={privileged ? 'Superadmin' : 'School workspace'}
                onChange={(v) => {
                  setRole(v === 'Superadmin' ? 'System Admin' : 'School Admin');
                  setView('Overview');
                  window.history.pushState(null, '', '#overview');
                }}
                options={['School workspace', 'Superadmin']}
              />
            </div>
            <button
              className="icon-btn notification-bell"
              aria-label="Open validation queue"
              onClick={() => navigate('Validation queue')}
            >
              <Bell size={18} />
              {pending.length > 0 && <i />}
            </button>
            <span className="avatar small">NA</span>
          </div>
        </header>
        <main className="content">
          <div className="page-title">
            <div>
              <div className="eyebrow">THURSDAY, 10 SEPTEMBER 2026</div>
              <h1>
                {view === 'Overview' && privileged
                  ? 'Platform overview'
                  : view === 'Users & roles' && !privileged
                    ? 'School team'
                    : headings[view]}
              </h1>
              <p>
                {view === 'Overview' && privileged
                  ? 'Coverage, school operations and platform oversight.'
                  : subtitles[view]}
              </p>
            </div>
            {privileged &&
            ['Overview', 'Schools', 'Users & roles'].includes(view) ? (
              <span className="scope-chip">
                <School size={15} />
                {schools.length} connected schools
              </span>
            ) : (
              <div className="school-select">
                <School size={16} />
                {privileged ? (
                  <Pick
                    label="School"
                    value={school}
                    onChange={setSchool}
                    options={schools}
                  />
                ) : (
                  <span>{school}</span>
                )}
              </div>
            )}
          </div>
          {view === 'Overview' && privileged && (
            <FleetOverview
              schools={schools}
              cameras={cameras}
              incidents={incidents}
              onSelect={selectSchoolView}
            />
          )}
          {view === 'Schools' && privileged && (
            <>
              <SchoolOnboarding
                existing={schools}
                onCreate={(name, admin, email, zone) => {
                  if (users.some((u) => u.email.toLowerCase() === email)) {
                    toast.error(
                      'Administrator email already exists. Use Users & roles to assign an existing account.',
                    );
                    return false;
                  }
                  setSchools((all) => [...all, name]);
                  setUsers((all) => [
                    ...all,
                    {
                      name: admin,
                      email,
                      role: 'School Admin',
                      school: name,
                      active: false,
                    },
                  ]);
                  setCameras((all) => [
                    ...all,
                    {
                      id: 'CAM-01',
                      zone,
                      block: 'Unconfigured',
                      school: name,
                      online: false,
                      fps: 0,
                      latency: 0,
                    },
                  ]);
                  setSchool(name);
                  toast.success(
                    'Demo school created. Camera and account are inactive.',
                  );
                  return true;
                }}
              />
              <FleetOverview
                schools={schools}
                cameras={cameras}
                incidents={incidents}
                onSelect={selectSchoolView}
                directory
              />
            </>
          )}
          {!privileged && (
            <div hidden={view !== 'Attendance & presence'}>
              <PresencePanel key={school} school={school} />
            </div>
          )}
          {view === 'Overview' && !privileged && (
            <>
              <div className="monitor-banner">
                <div>
                  <span className="live-dot" />
                  <strong>Monitoring preview</strong>
                  <span>
                    {schoolCameras.filter((c) => c.online).length} of{' '}
                    {schoolCameras.length} cameras online · Demo
                  </span>
                </div>
                <span>
                  Sample status <Radio size={15} />
                </span>
              </div>
              <div className="stats">
                {[
                  [
                    'Open incidents',
                    String(open.length).padStart(2, '0'),
                    `${high.length} high priority`,
                    'red',
                  ],
                  [
                    'Awaiting validation',
                    String(pending.length).padStart(2, '0'),
                    'Ready for staff review',
                    'amber',
                  ],
                  [
                    'Cameras online',
                    `${schoolCameras.filter((c) => c.online).length} / ${schoolCameras.length}`,
                    schoolCameras.some((c) => !c.online)
                      ? '1 camera needs attention'
                      : 'All cameras available',
                    'blue',
                  ],
                  [
                    'Confirmed today',
                    String(confirmed.length).padStart(2, '0'),
                    'Reviewed by your team',
                    'green',
                  ],
                ].map(([l, v, s, c], i) => (
                  <button
                    className="stat"
                    key={l}
                    onClick={() =>
                      navigate(
                        [
                          'Incidents',
                          'Validation queue',
                          'System health',
                          'Analytics',
                        ][i],
                      )
                    }
                  >
                    <span>
                      {l}
                      <ArrowUpRight size={16} />
                    </span>
                    <strong>{v}</strong>
                    <small className={c}>{s}</small>
                  </button>
                ))}
              </div>
              <div className="school-quickstrip">
                <div>
                  <Users size={20} />
                  <span>
                    <strong>Student attendance & presence</strong>
                    <small>
                      Review arrivals, departures and records needing
                      verification
                    </small>
                  </span>
                </div>
                <button
                  className="text-btn"
                  onClick={() => navigate('Attendance & presence')}
                >
                  Open register
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <PriorityAlerts
                key={school + role}
                incidents={schoolIncidents}
                onOpen={openIncident}
                onCreate={addScenario}
                onAcknowledge={acknowledge}
              />
              <div className="overview-grid">
                <section className="panel">
                  <div className="panel-title">
                    <div>
                      <h2>
                        Live monitoring <span className="live-tag">DEMO</span>
                      </h2>
                      <p>{school}</p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() => navigate('Live cameras')}
                    >
                      View all cameras <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="camera-grid">
                    {schoolCameras.slice(0, 4).map((c) => (
                      <Cam key={c.id} cam={c} onClick={() => setCamera(c)} />
                    ))}
                  </div>
                </section>
                <section className="panel attention-panel">
                  <div className="panel-title">
                    <h2>
                      Needs attention{' '}
                      <span className="count">{pending.length}</span>
                    </h2>
                  </div>
                  {pending.length ? (
                    pending.slice(0, 3).map((i) => (
                      <button
                        className="alert-row"
                        key={i.id}
                        onClick={() => openIncident(i.id)}
                      >
                        <div
                          className={'alert-icon ' + severityClass(i.severity)}
                        >
                          <Siren size={18} />
                        </div>
                        <div>
                          <Badge value={i.severity} />
                          <h3>
                            {i.category === 'Fighting'
                              ? 'Possible fighting'
                              : i.category}
                          </h3>
                          <p>
                            {i.block} · {i.zone}
                          </p>
                          <small>
                            <Clock3 size={12} />
                            {i.time} MYT · Awaiting review
                          </small>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                    ))
                  ) : (
                    <Empty
                      title="All caught up"
                      text="No detections awaiting validation."
                    />
                  )}
                  <button
                    className="review-btn"
                    onClick={() => navigate('Validation queue')}
                  >
                    Review validation queue <ChevronRight size={16} />
                  </button>
                </section>
              </div>
              <section className="panel lower-panel">
                <div className="panel-title">
                  <div>
                    <h2>Recent incidents</h2>
                    <p>Detection events and their latest review status</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => navigate('Incidents')}
                  >
                    View incident log <ArrowUpRight size={15} />
                  </button>
                </div>
                {incidentTable(schoolIncidents.slice(0, 4))}
              </section>
            </>
          )}
          {view === 'Live cameras' && (
            <>
              <div className="toolbar">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    aria-label="Search cameras"
                    placeholder="Search camera or location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Pick
                  label="Camera zone"
                  value={zone}
                  onChange={setZone}
                  options={['All zones', ...schoolCameras.map((c) => c.zone)]}
                />
                <span className="toolbar-meta">
                  {schoolCameras.filter((c) => c.online).length} online ·{' '}
                  {schoolCameras.filter((c) => !c.online).length} offline
                </span>
              </div>
              <div className="full-camera-grid">
                {schoolCameras
                  .filter(
                    (c) =>
                      (zone === 'All zones' || c.zone === zone) &&
                      `${c.id} ${c.zone}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                  )
                  .map((c) => (
                    <div className="camera-tile" key={c.id}>
                      <Cam cam={c} onClick={() => setCamera(c)} />
                      <div className="camera-location">
                        <span>
                          {school} · {c.block}
                        </span>
                        <span>
                          {c.online ? '25 FPS · RTSP' : 'Reconnect pending'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              {!schoolCameras.some(
                (c) =>
                  (zone === 'All zones' || c.zone === zone) &&
                  `${c.id} ${c.zone}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              ) && <Empty title="No cameras match" />}
              <section className="panel media-library">
                <div className="panel-title">
                  <div>
                    <h2>Detection scenario library</h2>
                    <p>
                      Seven synthetic scenes · Play a demonstration to see
                      sample analysis overlays
                    </p>
                  </div>
                </div>
                <div className="scenario-grid">
                  {Object.entries(mediaSources).map(([key, m]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setCamera({
                          id: 'DEMO',
                          school,
                          zone: (
                            {
                              courtyard: 'Courtyard',
                              hall: 'Assembly hall',
                              corridor: 'Block A corridor',
                              canteen: 'Canteen',
                              perimeter: 'East perimeter',
                              gate: 'Main gate',
                              training: 'Safety training corridor',
                            } as Record<string, string>
                          )[key],
                          block: 'Scenario library',
                          online: true,
                          fps: 15,
                          latency: 0,
                        })
                      }
                    >
                      <CameraStill scene={key} />
                      <span>
                        {m.label}
                        <Play size={14} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <div className="info-note">
                <LockKeyhole size={17} />
                <p>
                  Live monitoring is not continuously recorded. Only flagged
                  incident evidence is retained. This UI preview contains no
                  real camera footage.
                </p>
              </div>
            </>
          )}
          {view === 'Incidents' && (
            <section className="panel">
              <div className="panel-title">
                <h2>
                  All incidents{' '}
                  <span className="count">{schoolIncidents.length}</span>
                </h2>
                <button className="btn" onClick={() => setExportOpen(true)}>
                  <Download size={16} />
                  Export report
                </button>
              </div>
              <div className="toolbar inset">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Search incidents"
                    placeholder="Search incidents…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Pick
                  label="Severity"
                  value={severity}
                  onChange={setSeverity}
                  options={[
                    'All severities',
                    'Critical',
                    'High',
                    'Medium',
                    'Low',
                  ]}
                />
                <Pick
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={['All statuses', 'Open', 'Under Review', 'Closed']}
                />
                <Pick
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  options={[
                    'All categories',
                    ...new Set([
                      ...categories,
                      ...schoolIncidents.map((i) => i.category),
                    ]),
                    'Visible blade concern',
                  ]}
                />
                {(search ||
                  severity !== 'All severities' ||
                  status !== 'All statuses' ||
                  category !== 'All categories') && (
                  <button
                    className="text-btn"
                    onClick={() => {
                      setSearch('');
                      setSeverity('All severities');
                      setStatus('All statuses');
                      setCategory('All categories');
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              {incidentTable(filtered)}
              <div className="table-footer">
                Showing {filtered.length} of {schoolIncidents.length} incidents{' '}
                <span>Only flagged events are included</span>
              </div>
            </section>
          )}
          {view === 'Validation queue' && (
            <>
              <div className="validation-intro">
                <div className="validation-symbol">
                  <ClipboardCheck size={25} />
                </div>
                <div>
                  <h2>
                    {pending.length
                      ? `${pending.length} detections need your review`
                      : 'Every detection has been reviewed'}
                  </h2>
                  <p>
                    Confirm genuine incidents or dismiss false alarms. Every
                    decision is logged as model feedback.
                  </p>
                </div>
                <span className="badge green">Human oversight</span>
              </div>
              <Tabs value={validationTab} onValueChange={setValidationTab}>
                <TabsList className="section-tabs">
                  <TabsTrigger value="Pending">
                    Awaiting review ({pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="Reviewed">
                    Reviewed ({schoolIncidents.length - pending.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="Pending">
                  <div className="validation-grid">
                    {pending.map((i) => (
                      <article className="panel validation-card" key={i.id}>
                        <div className="validation-card-top">
                          <Badge value={i.severity} />
                          <span>{i.id}</span>
                        </div>
                        <h2>{i.category}</h2>
                        <p>
                          {i.block} · {i.zone}
                        </p>
                        <div className="validation-image">
                          <CameraStill scene={mediaFor(i.zone, i.category)} />
                          <small>
                            Illustrative context · Not evidence of this event
                          </small>
                        </div>
                        <div className="confidence-row">
                          <span>Detection confidence</span>
                          <strong>
                            {i.id.startsWith('STAFF-')
                              ? 'Staff report'
                              : `${i.confidence}%`}
                          </strong>
                        </div>
                        {!i.id.startsWith('STAFF-') && (
                          <Progress value={i.confidence} />
                        )}
                        <div className="validation-meta">
                          <span>
                            <Clock3 size={14} />
                            {i.time} MYT
                          </span>
                          <span>Assigned to {i.assigned.split(' ')[0]}</span>
                        </div>
                        <button
                          className="btn primary full-width"
                          onClick={() => openIncident(i.id)}
                        >
                          Review incident <ArrowUpRight size={15} />
                        </button>
                      </article>
                    ))}
                  </div>
                  {!pending.length && (
                    <section className="panel">
                      <Empty
                        title="You're all caught up"
                        text="New detections will appear here when connected to the engine."
                      />
                    </section>
                  )}
                </TabsContent>
                <TabsContent value="Reviewed">
                  <section className="panel">
                    {incidentTable(
                      schoolIncidents.filter((i) => !needsReview(i)),
                    )}
                  </section>
                </TabsContent>
              </Tabs>
              <div className="info-note">
                <Info size={17} />
                <p>
                  Detections support staff judgement. AiWAS never makes
                  disciplinary decisions or takes automatic punitive action.
                </p>
              </div>
            </>
          )}
          <div hidden={view !== 'Response workspace'}>
            <OperationsPanel
              school={school}
              incidents={schoolIncidents}
              users={users}
              cameras={schoolCameras}
              onOpen={openIncident}
              onReport={(item) => {
                setIncidents((all) => [item, ...all]);
                openIncident(item.id);
              }}
            />
          </div>
          {view === 'Analytics' && (
            <>
              <div className="toolbar">
                <Pick
                  label="Analytics period"
                  value={period}
                  onChange={setPeriod}
                  options={['Today', 'Last 7 days', 'Last 30 days']}
                />
                <span className="toolbar-meta">
                  Through {reportDate} · Sample data
                </span>
                <button
                  className="btn push-right"
                  onClick={() => setExportOpen(true)}
                >
                  <Download size={16} />
                  Export report
                </button>
              </div>
              <div className="stats">
                {[
                  [
                    'Total incidents',
                    analysisIncidents.length,
                    'Flagged detections',
                  ],
                  [
                    'Confirmed incidents',
                    analysed.length - falseCount,
                    'Validated by staff',
                  ],
                  [
                    'False alarm rate',
                    `${falseRate}%`,
                    `${falseCount} of ${analysed.length} reviewed`,
                  ],
                  [
                    'Review coverage',
                    `${analysisIncidents.length ? Math.round((analysed.length / analysisIncidents.length) * 100) : 0}%`,
                    `${analysed.length} detections reviewed`,
                  ],
                ].map(([l, v, s]) => (
                  <div className="stat" key={l}>
                    <span>{l}</span>
                    <strong>{v}</strong>
                    <small>{s}</small>
                  </div>
                ))}
              </div>
              <div className="analytics-grid">
                <section className="panel">
                  <div className="panel-title">
                    <div>
                      <h2>Incidents by category</h2>
                      <p>Confirmed, false alarms, and awaiting review</p>
                    </div>
                  </div>
                  <div className="legend">
                    <span>
                      <i className="confirmed-dot" />
                      Confirmed
                    </span>
                    <span>
                      <i className="false-dot" />
                      False alarm
                    </span>
                    <span>
                      <i className="pending-dot" />
                      Pending
                    </span>
                  </div>
                  <div className="bar-chart">
                    {[...new Set(analysisIncidents.map((i) => i.category))]
                      .filter((c) =>
                        analysisIncidents.some((i) => i.category === c),
                      )
                      .map((c) => {
                        const items = analysisIncidents.filter(
                          (i) => i.category === c,
                        );
                        return (
                          <div className="bar-row" key={c}>
                            <span>{c}</span>
                            <div className="bar-track">
                              {['Confirmed', 'False alarm', 'Pending'].map(
                                (v, j) => (
                                  <div
                                    key={v}
                                    style={{
                                      width: `${(items.filter((i) => (v === 'Pending' ? needsReview(i) : i.validation === v)).length / Math.max(1, items.length)) * 100}%`,
                                      background: [
                                        '#329b7b',
                                        '#e5a19d',
                                        '#e4c27a',
                                      ][j],
                                    }}
                                  />
                                ),
                              )}
                            </div>
                            <strong>{items.length}</strong>
                          </div>
                        );
                      })}
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-title">
                    <div>
                      <h2>Time of day</h2>
                      <p>Incident count · Malaysia time</p>
                    </div>
                  </div>
                  <div className="time-chart">
                    {[7, 8, 9, 10, 11, 12, 13, 14].map((h) => {
                      const n = analysisIncidents.filter(
                        (i) => +i.time.split(':')[0] === h,
                      ).length;
                      return (
                        <div className="time-column" key={h}>
                          <span>{n}</span>
                          <div style={{ height: `${Math.max(2, n * 26)}px` }} />
                          <small>{String(h).padStart(2, '0')}:00</small>
                        </div>
                      );
                    })}
                  </div>
                  <div className="panel-title border-top">
                    <h2>By zone</h2>
                  </div>
                  <div className="zone-list">
                    {schoolCameras.map((c) => (
                      <div key={c.id}>
                        <span>{c.zone}</span>
                        <strong>
                          {
                            analysisIncidents.filter((i) => i.zone === c.zone)
                              .length
                          }
                        </strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <section className="panel lower-panel">
                <div className="panel-title">
                  <div>
                    <h2>Validation quality</h2>
                    <p>Observed review outcomes, not verified model accuracy</p>
                  </div>
                  <span className="badge amber">PoC calibration</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        'Category',
                        'Confirmed',
                        'False alarms',
                        'Pending',
                        'False alarm rate',
                      ].map((x) => (
                        <TableHead key={x}>{x}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...new Set(analysisIncidents.map((i) => i.category))]
                      .filter((c) =>
                        analysisIncidents.some((i) => i.category === c),
                      )
                      .map((c) => {
                        const a = analysisIncidents.filter(
                            (i) => i.category === c,
                          ),
                          t = a.filter(
                            (i) => i.validation === 'Confirmed',
                          ).length,
                          f = a.filter(
                            (i) => i.validation === 'False alarm',
                          ).length;
                        return (
                          <TableRow key={c}>
                            <TableCell>{c}</TableCell>
                            <TableCell>{t}</TableCell>
                            <TableCell>{f}</TableCell>
                            <TableCell>{a.length - t - f}</TableCell>
                            <TableCell>
                              {t + f
                                ? `${Math.round((f / (t + f)) * 100)}%`
                                : 'Not yet measured'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </section>
            </>
          )}
          {view === 'System health' && (
            <>
              <div className="monitor-banner">
                <div>
                  <Activity size={17} />
                  <strong>Central processing preview</strong>
                  <span>EzGIG office · Malaysia</span>
                </div>
                <button
                  className="text-btn"
                  onClick={() => {
                    setHealthTime(now());
                    toast.info(
                      'Demo status refreshed. No live system connected.',
                    );
                  }}
                >
                  <RefreshCw size={14} /> Refresh status
                </button>
              </div>
              <div className="stats">
                {[
                  [
                    'Connected cameras',
                    `${schoolCameras.filter((c) => c.online).length}/${schoolCameras.length}`,
                    'Sample connection status',
                  ],
                  [
                    'Stream latency',
                    '215 ms',
                    'Sample average · Not a measured SLA',
                  ],
                  ['Detection engine', 'Ready', 'Demo pipeline status'],
                  [
                    'Storage location',
                    'Malaysia',
                    'EzGIG office server · Planned',
                  ],
                ].map(([l, v, s]) => (
                  <div className="stat" key={l}>
                    <span>{l}</span>
                    <strong className={v.length > 7 ? 'stat-word' : ''}>
                      {v}
                    </strong>
                    <small>{s}</small>
                  </div>
                ))}
              </div>
              <section className="panel">
                <div className="panel-title">
                  <h2>Camera connectivity</h2>
                  <span className="muted text-sm">
                    Refreshed {healthTime} MYT
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        'Camera',
                        'Location',
                        'Connection',
                        'Frame rate',
                        'Latency',
                        '',
                      ].map((x, i) => (
                        <TableHead key={i}>{x}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolCameras.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <strong>{c.id}</strong>
                          <small>RTSP</small>
                        </TableCell>
                        <TableCell>
                          {c.zone}
                          <small>{c.block}</small>
                        </TableCell>
                        <TableCell>
                          <span
                            className={'badge ' + (c.online ? 'green' : 'red')}
                          >
                            {c.online ? 'Online' : 'Offline'}
                          </span>
                        </TableCell>
                        <TableCell>{c.online ? `${c.fps} fps` : '—'}</TableCell>
                        <TableCell>
                          {c.online ? `${c.latency} ms` : '—'}
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-btn"
                            onClick={() => setCamera(c)}
                          >
                            Details
                            <ChevronRight size={14} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
              <div className="info-note amber-note">
                <Info size={18} />
                <p>
                  Offline feeds require attention. School buffering, network
                  recovery, and uptime targets must be verified during
                  deployment.
                </p>
              </div>
              <section className="panel">
                <div className="panel-title">
                  <h2>Access activity</h2>
                  <span className="count">This demo session</span>
                </div>
                {audit.some((a) => a.school === school) ? (
                  <div className="audit-list">
                    {audit
                      .filter((a) => a.school === school)
                      .map((a, i) => (
                        <div key={i}>
                          <History size={16} />
                          <p>{a.text}</p>
                          <span>{a.time} MYT</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <Empty
                    title="No evidence access yet"
                    text="Incident views and report exports in this session will appear here."
                  />
                )}
              </section>
            </>
          )}
          {view === 'Detection rules' && privileged && (
            <>
              <div className="toolbar">
                <div className="scope-label">
                  <School size={16} />
                  <span>School-specific configuration</span>
                </div>
                <Pick
                  label="Configuration zone"
                  value={effectiveZone}
                  onChange={setConfigZone}
                  options={schoolCameras.map((c) => c.zone)}
                />
              </div>
              <div className="rules-layout">
                <section className="panel category-panel">
                  <div className="panel-title">
                    <h2>Detection categories</h2>
                    <span className="count">Phase 1</span>
                  </div>
                  {categories.map((c, i) => (
                    <button
                      key={c}
                      className={
                        'category-row ' +
                        (c === configCategory ? 'selected' : '')
                      }
                      onClick={() => setConfigCategory(c)}
                    >
                      <span className="category-number">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>
                        {c}
                        {i === 0 && <small>Foundation</small>}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </section>
                <div>
                  <section className="panel configuration-panel">
                    <div className="panel-title">
                      <div>
                        <div className="eyebrow">
                          {configZone.toUpperCase()}
                        </div>
                        <h2>{configCategory}</h2>
                      </div>
                      <ShieldCheck size={21} className="green" />
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setConfig((c) => ({ ...c, [configKey]: draft }));
                        toast.success(
                          'Detection rule saved for this demo session.',
                        );
                      }}
                    >
                      <div className="form-body">
                        <div className="setting-line">
                          <div>
                            <h3>Detection enabled</h3>
                            <p>
                              {configCategory === 'Person detection & tracking'
                                ? 'Required foundation for every detection category.'
                                : 'Include this category in the zone’s monitoring.'}
                            </p>
                          </div>
                          <Switch
                            aria-label="Detection enabled"
                            checked={draft.enabled}
                            disabled={
                              configCategory === 'Person detection & tracking'
                            }
                            onCheckedChange={(v) =>
                              setDraft((d) => ({ ...d, enabled: v }))
                            }
                          />
                        </div>
                        <div className="field-section">
                          <div className="confidence-row">
                            <label htmlFor="confidence">
                              Minimum confidence
                            </label>
                            <strong>{draft.confidence}%</strong>
                          </div>
                          <Slider
                            id="confidence"
                            aria-label="Minimum confidence"
                            min={1}
                            max={100}
                            value={[draft.confidence]}
                            onValueChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                confidence: Array.isArray(v) ? v[0] : v,
                              }))
                            }
                          />
                          <p>
                            Raise an alert only when the detection score meets
                            this threshold.
                          </p>
                        </div>
                        {configCategory === 'Crowd counting' && (
                          <label className="field">
                            Crowd limit{' '}
                            <div className="unit-input">
                              <input
                                type="number"
                                min={1}
                                max={1000}
                                required
                                value={draft.limit}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    limit: +e.target.value,
                                  }))
                                }
                              />
                              <span>people</span>
                            </div>
                            <small>
                              Trigger when the zone count exceeds this number.
                            </small>
                          </label>
                        )}
                        {configCategory === 'Entry / exit counting' && (
                          <label className="field">
                            Mismatch tolerance
                            <div className="unit-input">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                required
                                value={draft.tolerance}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    tolerance: +e.target.value,
                                  }))
                                }
                              />
                              <span>people</span>
                            </div>
                            <small>
                              Maximum difference between entry and exit counts.
                            </small>
                          </label>
                        )}
                        {[
                          'Unusual dwell time',
                          'Vehicles at drop-off / pick-up',
                        ].includes(configCategory) && (
                          <label className="field">
                            {configCategory === 'Unusual dwell time'
                              ? 'Dwell-time limit'
                              : 'Maximum parking duration'}
                            <div className="unit-input">
                              <input
                                type="number"
                                required
                                min={1}
                                max={240}
                                value={draft.dwell}
                                onChange={(e) =>
                                  setDraft((d) => ({
                                    ...d,
                                    dwell: +e.target.value,
                                  }))
                                }
                              />
                              <span>minutes</span>
                            </div>
                          </label>
                        )}
                        {configCategory === 'Restricted area intrusion' && (
                          <>
                            <div className="form-grid">
                              <label className="field">
                                Restricted from
                                <input
                                  type="time"
                                  required
                                  value={draft.from}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      from: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <label className="field">
                                Restricted until
                                <input
                                  type="time"
                                  required
                                  value={draft.to}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      to: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                            </div>
                            <p className="help-text">
                              Applies daily in Malaysia time. An end time
                              earlier than the start continues into the next
                              day.
                            </p>
                          </>
                        )}
                        <div className="info-note compact">
                          <Info size={17} />
                          <p>
                            Confidence targets are unverified until measured in
                            the PoC. Changes here affect this UI demo only.
                          </p>
                        </div>
                      </div>
                      <div className="form-footer">
                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            setDraft(
                              config[configKey] || {
                                confidence: 80,
                                limit: 20,
                                tolerance: 3,
                                dwell: 10,
                                from: '18:00',
                                to: '06:00',
                                enabled: true,
                              },
                            )
                          }
                        >
                          Discard changes
                        </button>
                        <button className="btn primary" type="submit">
                          Save rule <Check size={16} />
                        </button>
                      </div>
                    </form>
                  </section>
                  <section className="panel future-panel">
                    <div className="panel-title">
                      <div>
                        <h2>Designed for what comes next</h2>
                        <p>Phase 2 · Planned, not active</p>
                      </div>
                      <LockKeyhole size={18} />
                    </div>
                    <div className="future-tags">
                      {[
                        'Abandoned objects',
                        'Camera tampering',
                        'Smoke / fire',
                        'Fall / collapse',
                        'Weapon detection',
                        'Calendar-aware rules',
                        'Approved attendance integration',
                      ].map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
          {view === 'Notification routing' && role === 'System Admin' && (
            <>
              <div className="toolbar">
                <Pick
                  label="Routing category"
                  value={routeCategory}
                  onChange={(v) => {
                    setRouteCategory(v);
                    setRouteSaved(false);
                  }}
                  options={[
                    'All categories',
                    ...new Set([
                      ...categories,
                      ...schoolIncidents.map((i) => i.category),
                    ]),
                    'Visible blade concern',
                  ]}
                />
                <span className="toolbar-meta">
                  {school} · Per-severity routing
                </span>
                <button
                  className="btn primary push-right"
                  onClick={() => {
                    setSavedRoutes({ ...routes });
                    setRouteSaved(true);
                    toast.success(
                      'Routing saved for this demo session. No notifications sent.',
                    );
                  }}
                >
                  <Check size={16} />
                  {routeSaved ? 'Saved' : 'Save routing'}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setRoutes({ ...savedRoutes });
                    setRouteSaved(true);
                  }}
                >
                  Discard edits
                </button>
              </div>
              <section className="panel">
                <div className="panel-title">
                  <div>
                    <h2>Who should be notified?</h2>
                    <p>
                      Category settings override the all-category defaults in
                      this demo.
                    </p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        'Severity',
                        'Dashboard & log',
                        'School Admin',
                        'Discipline Teacher',
                        'KPM',
                        'JPN',
                      ].map((x) => (
                        <TableHead key={x}>{x}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                      <TableRow key={s}>
                        <TableCell>
                          <Badge value={s} />
                          <small>
                            {s === 'Low'
                              ? 'Dashboard only'
                              : ['High', 'Critical'].includes(s)
                                ? 'Immediate alert'
                                : 'Dashboard alert'}
                          </small>
                        </TableCell>
                        <TableCell>
                          <span className="green">
                            <CheckCheck size={19} />
                          </span>
                        </TableCell>
                        {[
                          'School Admin',
                          'Discipline Teacher',
                          'KPM',
                          'JPN',
                        ].map((recipient, j) => {
                          const key = `${school}|${routeCategory}|${s}|${recipient}`,
                            defaultKey = `${school}|All categories|${s}|${recipient}`;
                          const enabled =
                            s !== 'Low' &&
                            (routes[key] ??
                              routes[defaultKey] ??
                              (j === 0 ||
                                (j === 1 && ['High', 'Critical'].includes(s))));
                          return (
                            <TableCell key={recipient}>
                              <Switch
                                aria-label={`${s} ${recipient} notifications`}
                                checked={enabled}
                                disabled={
                                  s === 'Low' || (j === 0 && s !== 'Low')
                                }
                                onCheckedChange={(v) => {
                                  setRoutes((r) => ({ ...r, [key]: v }));
                                  setRouteSaved(false);
                                }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
              <div className="two-panels">
                <section className="panel">
                  <div className="panel-title">
                    <h2>Routing principles</h2>
                  </div>
                  <div className="prose-list">
                    <p>
                      <Badge value="Low" /> Logged for review and analytics. No
                      active notifications.
                    </p>
                    <p>
                      <Badge value="Medium" /> Notify the School Admin and
                      relevant assigned staff.
                    </p>
                    <p>
                      <Badge value="High" /> Instant alerts to School Admin. KPM
                      and JPN are optional.
                    </p>
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-title">
                    <h2>Notification preview</h2>
                  </div>
                  <div className="notification-preview">
                    <span className="eyebrow">AIWAS · DEMO ALERT</span>
                    <h3>
                      High severity:{' '}
                      {routeCategory === 'All categories'
                        ? 'Fighting'
                        : routeCategory}
                    </h3>
                    <p>
                      {school}
                      <br />
                      Block A · Corridor · CAM-03
                    </p>
                    <span>
                      Staff review required. No disciplinary decision has been
                      made.
                    </span>
                  </div>
                </section>
              </div>
              <div className="info-note">
                <Info size={18} />
                <p>
                  This preview does not send messages. KPM/JPN routing requires
                  the relevant agreements and configured recipients before live
                  use.
                </p>
              </div>
            </>
          )}
          {view === 'Users & roles' && canManageUsers && (
            <>
              <section className="panel">
                <div className="panel-title">
                  <div>
                    <h2>
                      Workspace members{' '}
                      <span className="count">
                        {
                          users.filter((u) => privileged || u.school === school)
                            .length
                        }
                      </span>
                    </h2>
                    <p>Demo accounts · No invitations are sent</p>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => openUser(null)}
                  >
                    <Plus size={16} />
                    Add user
                  </button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {['Member', 'Role', 'School access', 'Status', ''].map(
                        (x, i) => (
                          <TableHead key={i}>{x}</TableHead>
                        ),
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .map((u, i) => ({ u, i }))
                      .filter(({ u }) => privileged || u.school === school)
                      .map(({ u, i }) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="member">
                              <span className="avatar">
                                {u.name
                                  .split(' ')
                                  .map((x) => x[0])
                                  .slice(0, 2)
                                  .join('')}
                              </span>
                              <span>
                                <strong>{u.name}</strong>
                                <small>{u.email}</small>
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{roleLabel(u.role)}</TableCell>
                          <TableCell>{u.school}</TableCell>
                          <TableCell>
                            <span
                              className={
                                'badge ' + (u.active ? 'green' : 'red')
                              }
                            >
                              {u.active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button className="btn" onClick={() => openUser(i)}>
                              Edit
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </section>
              <section className="panel lower-panel role-reference">
                <div className="panel-title">
                  <h2>Role permissions</h2>
                </div>
                <div className="role-cards">
                  {[
                    [
                      'School Admin',
                      'Manage the school team, review incidents and reconcile attendance for one school.',
                    ],
                    [
                      'Discipline Teacher',
                      'Review and validate relevant behaviour categories at one school.',
                    ],
                    [
                      'Internal Ops',
                      'An optional Superadmin permission level for camera health and detection configuration.',
                    ],
                    [
                      'System Admin',
                      'Manage connected schools, user access, configuration and platform oversight.',
                    ],
                  ]
                    .filter(
                      ([r]) =>
                        privileged ||
                        ['School Admin', 'Discipline Teacher'].includes(r),
                    )
                    .map(([r, d]) => (
                      <div key={r}>
                        <ShieldCheck size={20} />
                        <h3>{roleLabel(r)}</h3>
                        <p>{d}</p>
                      </div>
                    ))}
                </div>
                <div className="table-footer">
                  KPM / JPN read-only access is planned for a future phase.
                </div>
              </section>
            </>
          )}
          <div className="demo-controls">
            <div>
              <Info size={16} />
              <span>
                Interactive demo{' '}
                <small>
                  Changes last for this session. No real school data or live
                  services.
                </small>
              </span>
            </div>
            <span className="scope-chip">
              <LockKeyhole size={14} />
              Workspace preview · not a sign-in
            </span>
          </div>
          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} /> Demo data · No live detection or
              notifications
            </span>
            <span>AiWAS by EzGIG</span>
          </footer>
        </main>
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
      >
        <SheetContent className="incident-sheet">
          {selected && (
            <>
              <SheetHeader>
                <div className="eyebrow">INCIDENT {selected.id}</div>
                <SheetTitle>{selected.category}</SheetTitle>
                <SheetDescription>
                  {selected.school} · {selected.block} · {selected.zone}
                </SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <div className="detail-badges">
                  <Badge value={selected.severity} />
                  <Badge value={selected.validation} />
                  <span>
                    {selected.date} · {selected.time} MYT
                  </span>
                </div>
                <DemoVideo scene={mediaFor(selected.zone, selected.category)} />
                <p className="help-text media-context">
                  Illustrative {selected.zone.toLowerCase()} scene, not footage
                  of this incident.{' '}
                  {selected.category === 'Visible blade concern'
                    ? 'Orange inert prop; weapon evaluation is not a production capability.'
                    : 'Staff must review actual incident evidence in production.'}
                </p>
                <div className="response-strip">
                  <span>
                    {selected.acknowledged
                      ? 'Acknowledged by Nadia Ahmad'
                      : 'Awaiting acknowledgement'}
                  </span>
                  <button
                    className="btn"
                    disabled={
                      selected.acknowledged || selected.status === 'Closed'
                    }
                    onClick={() => acknowledge(selected.id)}
                  >
                    <Check size={15} />
                    {selected.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
                <div className="detail-grid">
                  <div>
                    <span>Detection confidence</span>
                    <strong>
                      {selected.id.startsWith('STAFF-')
                        ? 'Staff report'
                        : `${selected.confidence}%`}{' '}
                      <small>
                        {selected.id.startsWith('STAFF-')
                          ? 'No AI score'
                          : 'Sample score'}
                      </small>
                    </strong>
                  </div>
                  <div>
                    <span>Assigned staff</span>
                    <Pick
                      label="Assigned responder"
                      value={selected.assigned}
                      onChange={(v) =>
                        updateIncident({ assigned: v }, `Assigned to ${v}`)
                      }
                      options={[
                        ...new Set([
                          selected.assigned,
                          ...users
                            .filter(
                              (u) =>
                                u.active &&
                                (u.school === school ||
                                  u.school === 'All PoC schools'),
                            )
                            .map((u) => u.name),
                        ]),
                      ]}
                    />
                  </div>
                </div>
                <p className="detail-description">{selected.description}</p>
                <Tabs defaultValue="review">
                  <TabsList className="section-tabs">
                    <TabsTrigger value="review">Review & follow-up</TabsTrigger>
                    <TabsTrigger value="history">
                      Audit trail ({selected.history.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="review">
                    <div className="review-form">
                      <div className="field">
                        Incident status
                        <Pick
                          label="Incident status"
                          value={selected.status}
                          onChange={(s) => {
                            const error = transitionError(selected, s, note);
                            if (error) {
                              toast.error(error);
                              return;
                            }
                            updateIncident(
                              transitionChanges(selected, s, note),
                              `Status changed to ${s.toLowerCase()}${note.trim() ? ': ' + note.trim() : ''}`,
                            );
                            setNote('');
                          }}
                          options={['Open', 'Under Review', 'Closed']}
                        />
                      </div>
                      {needsReview(selected) ? (
                        <>
                          <label className="field">
                            Review note{' '}
                            <span className="optional">
                              Required for a review decision
                            </span>
                            <textarea
                              placeholder="Add context for your team…"
                              rows={3}
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            />
                          </label>
                          <button
                            className="btn full-width uncertain-action"
                            onClick={() => validate('Insufficient evidence')}
                          >
                            <Info size={16} />
                            Insufficient evidence · keep under review
                          </button>
                          <div className="review-actions">
                            <button
                              className="btn danger"
                              onClick={() => validate('False alarm')}
                            >
                              <X size={16} />
                              False alarm
                            </button>
                            <button
                              className="btn primary"
                              onClick={() => validate('Confirmed')}
                            >
                              <Check size={16} />
                              Confirm incident
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="review-complete">
                          <CheckCircle2 size={21} />
                          <div>
                            <strong>Validation recorded</strong>
                            <p>
                              This incident was marked{' '}
                              {selected.validation.toLowerCase()}. Track
                              follow-up using the status above.
                            </p>
                          </div>
                        </div>
                      )}
                      {!needsReview(selected) && (
                        <label className="field">
                          Resolution / follow-up note
                          <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Describe the response, outcome or reason to reopen…"
                          />
                        </label>
                      )}
                      <button
                        className="btn full-width"
                        disabled={!note.trim()}
                        onClick={() => {
                          updateIncident({}, `Staff note: ${note.trim()}`);
                          setNote('');
                        }}
                      >
                        Add note to audit trail
                      </button>
                      <p className="help-text">
                        To close or reopen, enter a reason above before changing
                        the status. Unresolved evidence must remain under
                        review.
                      </p>
                      <div className="info-note compact">
                        <ShieldCheck size={17} />
                        <p>
                          Your validation is recorded in this demo’s audit
                          trail. No automatic disciplinary action is taken.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="timeline">
                      {selected.history.map((h, i) => (
                        <div key={i}>
                          <i />
                          <div>
                            <strong>{h.text}</strong>
                            <p>{h.actor}</p>
                            <small>{h.time} MYT</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!camera}
        onOpenChange={(o) => {
          if (!o) {
            setCamera(null);
          }
        }}
      >
        <DialogContent className="camera-dialog">
          <DialogHeader>
            <DialogTitle>
              {camera?.zone} <span className="muted">· {camera?.id}</span>
            </DialogTitle>
            <DialogDescription>
              {camera?.school} · {camera?.block}
            </DialogDescription>
          </DialogHeader>
          {camera && (
            <>
              {camera.online ? (
                <DemoVideo scene={mediaFor(camera.zone)} />
              ) : (
                <div className="camera-stage">
                  <div className="feed-blank">
                    <WifiOff size={40} />
                    <strong>Camera unavailable</strong>
                    <span>Check the camera connection and school network.</span>
                  </div>
                </div>
              )}
              <p className="help-text">
                {camera.zone === 'Safety training corridor'
                  ? 'Evaluation-only example with an inert orange training prop. Not a validated weapon detector.'
                  : '12-second animated still showing sample tracking and analysis overlays. No actual event inference or moving-person footage.'}
              </p>
              <div className="camera-dialog-footer">
                <span>
                  <ShieldCheck size={15} /> No facial recognition
                </span>
                <button
                  className="btn"
                  onClick={() => {
                    setCamera(null);
                    navigate('Incidents');
                    setZone(camera.zone);
                  }}
                >
                  View zone incidents <ArrowUpRight size={15} />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export incident report</DialogTitle>
            <DialogDescription>
              Create a CSV report for school review or the 30-day reporting
              cycle.
            </DialogDescription>
          </DialogHeader>
          <div className="export-school">
            <School size={18} />
            {school}
          </div>
          <div className="form-grid">
            <label className="field">
              Start date
              <input
                required
                type="date"
                max={reportDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="field">
              End date
              <input
                required
                type="date"
                max={reportDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <p className="help-text">
            Includes incident details, validation outcomes, and follow-up status
            for your permitted scope. Sample data is labelled in the export.
          </p>
          <div className="form-footer">
            <button className="btn" onClick={() => setExportOpen(false)}>
              Cancel
            </button>
            <button className="btn primary" onClick={exportReport}>
              <Download size={16} />
              Download CSV
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editUser === null ? 'Add workspace user' : 'Edit workspace user'}
            </DialogTitle>
            <DialogDescription>
              Manage a demo account. No invitation or access to real systems is
              created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveUser} className="user-form">
            <label className="field">
              Full name
              <input
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </label>
            <label className="field">
              Email
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </label>
            <div className="field">
              Role
              <Pick
                label="User role"
                value={userRole}
                onChange={(v) => setUserRole(v as Role)}
                options={
                  privileged
                    ? [...roles]
                    : ['School Admin', 'Discipline Teacher']
                }
              />
            </div>
            {privileged &&
              !['Internal Ops', 'System Admin'].includes(userRole) && (
                <div className="field">
                  Assigned school
                  <Pick
                    label="Assigned school"
                    value={userSchool}
                    onChange={setUserSchool}
                    options={schools}
                  />
                </div>
              )}
            <div className="setting-line">
              <span>Account active</span>
              <Switch
                aria-label="Account active"
                checked={userActive}
                onCheckedChange={setUserActive}
              />
            </div>
            <div className="form-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setUserOpen(false)}
              >
                Cancel
              </button>
              <button className="btn primary" type="submit">
                {editUser === null ? 'Add demo user' : 'Save changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
