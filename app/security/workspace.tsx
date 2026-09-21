'use client';
import { useState } from 'react';
import {
  Shield,
  Camera,
  Siren,
  ChevronRight,
  ArrowUpRight,
  Search,
  Plus,
  Download,
  Check,
  Radio,
  MapPin,
  Users,
  Clock,
  WifiOff,
  FileText,
  SlidersHorizontal,
  Activity,
} from 'lucide-react';
import { CameraStill, DemoVideo, securityScene } from '../camera-media';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { toast as toastManager } from '@/components/ui/toast';
const toast = {
  success: (title: string) => toastManager.add({ title, type: 'success' }),
  error: (title: string) => toastManager.add({ title, type: 'error' }),
};
import { initial, sites, guards, type Incident } from './data';
import {
  securityViews,
  updateIncident,
  assignGuard,
  makeIncident,
  filterIncidents,
  ruleKey,
  validateRule,
  type RuleConfiguration,
} from './workflow';
import { csvCell } from '../workflow';
import features from './features.json';

/**
 * Camera positions in the demonstration estate, and the one that is dark.
 * Both the wall and the camera dialog read this, so a camera cannot be shown
 * as offline in one place and playing in the other.
 */
const cameraZones = [
  'North fence',
  'Main entrance',
  'Loading bay',
  'Car park',
  'Reception',
  'East gate',
  'Service yard',
  'South corridor',
];
const isCameraOffline = (site: string, zone: string) =>
  site === sites[2] && zone === cameraZones[3];

const tone = (v: string) =>
  ['Critical', 'New', 'Offline'].includes(v)
    ? 'red'
    : [
          'High',
          'Medium',
          'Dispatched',
          'Arrived',
          'Attention needed',
          '1 camera offline',
        ].includes(v)
      ? 'amber'
      : 'green';
function Badge({ value }: { value: string }) {
  return <span className={'badge ' + tone(value)}>{value}</span>;
}
function Pick({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger aria-label={label} className="picker">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="security-select-content">
        {options.map((x) => (
          <SelectItem value={x} key={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function saveCSV(name: string, rows: string[][]) {
  const blob = new Blob(
    ['\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n')],
    { type: 'text/csv;charset=utf-8;' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function SecurityWorkspace({
  view,
  navigate,
  visible = true,
}: {
  view: string;
  navigate: (v: string) => void;
  visible?: boolean;
}) {
  const [incidents, setIncidents] = useState(initial),
    [selected, setSelected] = useState<string | null>(null),
    [site, setSite] = useState('All sites'),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('All statuses'),
    [note, setNote] = useState(''),
    [assigned, setAssigned] = useState(''),
    [newOpen, setNewOpen] = useState(false),
    [title, setTitle] = useState(''),
    [newSite, setNewSite] = useState(sites[0]),
    [severity, setSeverity] = useState('High'),
    [rule, setRule] = useState<(typeof features)[number] | null>(null),
    [rulesQuery, setRulesQuery] = useState(''),
    [release, setRelease] = useState('All releases'),
    [configurations, setConfigurations] = useState<
      Record<string, RuleConfiguration>
    >({}),
    [draftEnabled, setDraftEnabled] = useState(false),
    [ruleSite, setRuleSite] = useState(sites[0]),
    [duration, setDuration] = useState('5'),
    [camera, setCamera] = useState<string | null>(null),
    [inspectedSite, setInspectedSite] = useState<string | null>(null),
    [cases, setCases] = useState<string[]>([]);
  const active = incidents.filter((i) => i.status !== 'Closed');
  const current = incidents.find((i) => i.id === selected);
  const available = guards.filter(
    (g) => !active.some((i) => i.guard === g.name),
  );
  const [previousVisible, setPreviousVisible] = useState(visible);
  if (previousVisible !== visible) {
    setPreviousVisible(visible);
    if (!visible) {
      setSelected(null);
      setNewOpen(false);
      setRule(null);
      setCamera(null);
    }
  }
  const filtered = filterIncidents(incidents, { site, status, query });
  const selectedSites = sites.filter((s) => site === 'All sites' || s === site);
  function loadDraft(featureId: string, targetSite: string) {
    const saved = configurations[ruleKey(featureId, targetSite)];
    setRuleSite(targetSite);
    setDuration(String(saved?.graceSeconds ?? 5));
    setDraftEnabled(saved?.enabled ?? false);
  }
  function openRule(feature: (typeof features)[number]) {
    setRule(feature);
    loadDraft(feature.id, site === 'All sites' ? sites[0] : site);
  }
  function saveRule() {
    if (!rule) return;
    try {
      const configuration = validateRule(
        {
          featureId: rule.id,
          site: ruleSite,
          graceSeconds: Number(duration),
          enabled: draftEnabled,
        },
        duration,
      );
      setConfigurations((all) => ({
        ...all,
        [ruleKey(rule.id, ruleSite)]: configuration,
      }));
      toast.success(
        'Site-specific demo configuration saved. No detector activated.',
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save configuration',
      );
    }
  }
  function open(i: Incident) {
    setSelected(i.id);
    setNote('');
    setAssigned('');
  }
  function change(next: string) {
    if (!current) return;
    try {
      const changed = updateIncident(current, next, note);
      setIncidents((all) =>
        all.map((i) => (i.id === changed.id ? changed : i)),
      );
      setNote('');
      toast.success('Demo incident updated');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update incident',
      );
    }
  }
  function dispatch() {
    if (!current) return;
    try {
      const changed = assignGuard(current, assigned, incidents);
      setIncidents((all) =>
        all.map((i) => (i.id === changed.id ? changed : i)),
      );
      setAssigned('');
      toast.success('Guard assigned in this demo');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to assign guard',
      );
    }
  }
  function exportIncidents() {
    saveCSV('AiWAS-demo-incidents.csv', [
      [
        'ID',
        'Incident',
        'Site',
        'Zone',
        'Severity',
        'Status',
        'Guard',
        'Notes',
      ],
      ...filtered.map((i) => [
        i.id,
        i.title,
        i.site,
        i.zone,
        i.severity,
        i.status,
        i.guard,
        i.notes.join(' | '),
      ]),
    ]);
    toast.success('Incident report downloaded');
  }
  const table = (
    <div className="panel">
      <Table>
        <TableHeader>
          <TableRow>
            {[
              'Incident',
              'Site / zone',
              'Priority',
              'Status',
              'Detected',
              '',
            ].map((s, i) => (
              <TableHead key={i}>{s}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((i) => (
            <TableRow key={i.id}>
              <TableCell>
                <button className="table-link" onClick={() => open(i)}>
                  {i.title}
                  <small>{i.id}</small>
                </button>
              </TableCell>
              <TableCell>
                {i.site}
                <small className="cell-small">{i.zone}</small>
              </TableCell>
              <TableCell>
                <Badge value={i.severity} />
              </TableCell>
              <TableCell>
                <Badge value={i.status} />
              </TableCell>
              <TableCell>{i.time}</TableCell>
              <TableCell>
                <button
                  className="icon-button"
                  aria-label={'Review ' + i.id}
                  onClick={() => open(i)}
                >
                  <ArrowUpRight size={17} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!filtered.length && (
        <div className="empty">
          <Search />
          <h3>No incidents match</h3>
          <p>Try another site, status or search term.</p>
          <button
            className="secondary"
            onClick={() => {
              setSite('All sites');
              setStatus('All statuses');
              setQuery('');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
  const filters = (
    <div className="toolbar">
      <div className="search-box">
        <Search size={17} />
        <input
          aria-label="Search incidents"
          placeholder="Search incident, ID or zone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Pick
        value={site}
        onChange={setSite}
        options={['All sites', ...sites]}
        label="Filter by site"
      />
      <Pick
        value={status}
        onChange={setStatus}
        options={[
          'All statuses',
          'New',
          'Verified',
          'Dispatched',
          'Arrived',
          'Closed',
        ]}
        label="Filter by status"
      />
      <span className="subtle">{filtered.length} results</span>
    </div>
  );
  return (
    <div className="aiwas-security">
      <div className="heading">
        <div>
          <div className="eyebrow">
            SECURITY OPERATIONS /{' '}
            {view === 'Overview' ? 'TODAY' : view.toUpperCase()}
          </div>
          <h1>{view === 'Overview' ? 'Security overview' : view}</h1>
          <p>
            {
              {
                Overview:
                  'Your sites, incidents and response teams. One clear picture.',
                Monitoring:
                  'Camera coverage and the events that need your attention.',
                Incidents:
                  'Verify the event. Coordinate a response. Record the outcome.',
                Sites:
                  'Coverage, camera health and response readiness by location.',
                'Guard dispatch':
                  'Assign the right person and follow the response.',
                Investigations:
                  'Find relevant events and build a reviewed case.',
                'Detection rules':
                  'Configure security capabilities from your AiWAS specification.',
                Reports: 'Understand incident volume, outcomes and coverage.',
              }[view]
            }
          </p>
        </div>
        {view === 'Overview' ? (
          <button className="primary" onClick={() => navigate('Incidents')}>
            Open incident queue <ArrowUpRight size={17} />
          </button>
        ) : view === 'Incidents' ? (
          <button
            className="primary"
            onClick={() => (
              setNewSite(site === 'All sites' ? sites[0] : site),
              setNewOpen(true)
            )}
          >
            <Plus size={17} />
            Create incident
          </button>
        ) : view === 'Reports' ? (
          <button className="primary" onClick={exportIncidents}>
            <Download size={17} />
            Export current report
          </button>
        ) : view !== 'Detection rules' && view !== 'Investigations' ? (
          <Pick
            value={site}
            onChange={setSite}
            options={['All sites', ...sites]}
            label="Select site"
          />
        ) : null}
      </div>
      <nav className="security-tabs" aria-label="Security sections">
        {securityViews.map((name) => (
          <button
            key={name}
            aria-current={view === name ? 'page' : undefined}
            onClick={() => navigate(name)}
          >
            {name}
          </button>
        ))}
      </nav>
      {view === 'Overview' && (
        <>
          <div className="metrics">
            {[
              [
                'Open incidents',
                String(active.length).padStart(2, '0'),
                `${active.filter((i) => i.status === 'New').length} require verification`,
                'red',
              ],
              ['Monitored sites', '03', 'All sites reporting', 'green'],
              [
                'Cameras online',
                '23 / 24',
                '1 connection needs attention',
                'amber',
              ],
              [
                'Available guards',
                String(available.length).padStart(2, '0'),
                'Across 3 protected sites',
                'green',
              ],
            ].map(([a, b, c, d]) => (
              <section className="metric" key={a}>
                <label>{a}</label>
                <strong>{b}</strong>
                <small className={d}>
                  <span className="dot" />
                  {c}
                </small>
              </section>
            ))}
          </div>
          <div className="overview-grid">
            <section className="panel">
              <div className="panel-head">
                <h2>Site watch</h2>
                <span className="subtle">3 protected sites</span>
              </div>
              <div className="site-map">
                <div className="map-grid" />
                <div className="map-caption">
                  PORTFOLIO COVERAGE<span>SCHEMATIC · NOT TO SCALE</span>
                </div>
                {sites.map((s, i) => (
                  <button
                    key={s}
                    className={'site-node node-' + i}
                    onClick={() => {
                      setSite(s);
                      navigate('Sites');
                    }}
                  >
                    <span
                      className={
                        'node-icon ' +
                        (active.some((j) => j.site === s) ? 'alert' : '')
                      }
                    >
                      <Shield size={20} />
                    </span>
                    <strong>{s}</strong>
                    <small>
                      {active.filter((j) => j.site === s).length} active
                      incidents
                    </small>
                  </button>
                ))}
              </div>
              <div className="map-legend">
                <span>
                  <i className="dot green" />
                  Reporting
                </span>
                <span>
                  <i className="dot red" />
                  Needs response
                </span>
                <span>Illustrative locations</span>
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2>Priority queue</h2>
                <span className="badge red">{active.length} open</span>
              </div>
              {active.slice(0, 4).map((i) => (
                <button
                  className="queue-row"
                  key={i.id}
                  onClick={() => open(i)}
                >
                  <span className={'event-icon ' + tone(i.severity)}>
                    <Siren size={18} />
                  </span>
                  <div>
                    <strong>{i.title}</strong>
                    <small>
                      {i.site} · {i.time}
                    </small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
              {!active.length && (
                <div className="empty">
                  <Check />
                  <h3>Queue clear</h3>
                  <p>All demo incidents have been closed.</p>
                </div>
              )}
              <div className="panel-foot">
                Human verification required before response
              </div>
            </section>
          </div>
          <section className="panel">
            <div className="panel-head">
              <h2>Shift activity</h2>
              <span className="subtle">Sample records + this session</span>
            </div>
            {incidents.slice(0, 3).map((i) => (
              <div className="activity-item" key={i.id}>
                <Activity size={18} />
                <div>
                  <strong>
                    {i.title} · {i.status}
                  </strong>
                  <small>{i.history.at(-1)}</small>
                </div>
                <button className="text-button" onClick={() => open(i)}>
                  Review <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </section>
        </>
      )}
      {view === 'Incidents' && (
        <>
          {filters}
          {table}
        </>
      )}
      {view === 'Monitoring' && (
        <>
          <div className="notice">
            <Radio size={18} />
            <div>
              <strong>Camera workspace preview</strong>
              <span>
                Every position shows a synthetic demonstration scene, not a
                connected stream. Select a camera to play its clip and see the
                related incidents.
              </span>
            </div>
          </div>
          <div className="camera-grid">
            {sites
              .filter((s) => site === 'All sites' || s === site)
              .flatMap((s) =>
                cameraZones.map((z, k) => {
                  const offline = isCameraOffline(s, z);
                  return (
                    <button
                      className="camera-card"
                      key={s + z}
                      onClick={() => setCamera(s + '|' + z)}
                    >
                      <div
                        className={
                          'camera-screen' + (offline ? '' : ' camera-live')
                        }
                      >
                        <span className="camera-id">
                          {sites.indexOf(s) + 1} / CAM-0{k + 1}
                        </span>
                        <span
                          className={'camera-state ' + (offline ? 'fault' : '')}
                        >
                          {offline ? 'OFFLINE' : 'DEMO FEED'}
                        </span>
                        {offline ? (
                          <>
                            <WifiOff size={32} />
                            <span>
                              Connection lost — do not read this position as
                              clear
                            </span>
                          </>
                        ) : (
                          <CameraStill
                            scene={securityScene(z)}
                            overlay={false}
                          />
                        )}
                      </div>
                      <div className="camera-caption">
                        <div>
                          <strong>{z}</strong>
                          <small>{s}</small>
                        </div>
                        <ArrowUpRight size={17} />
                      </div>
                    </button>
                  );
                }),
              )}
          </div>
          <p className="helper">
            24 configured camera positions in the fictional demo estate. Live
            video requires your camera or VMS integration.
          </p>
        </>
      )}
      {view === 'Sites' && (
        <>
          <div className="site-cards">
            {sites
              .filter((s) => site === 'All sites' || s === site)
              .map((s) => (
                <section className="panel site-card" key={s}>
                  <div className="site-card-top">
                    <span className="large-icon">
                      <MapPin />
                    </span>
                    <Badge
                      value={s === sites[2] ? 'Attention needed' : 'Reporting'}
                    />
                  </div>
                  <h2>{s}</h2>
                  <p>
                    {
                      [
                        'Distribution & warehousing',
                        'Commercial offices',
                        'Retail & parking',
                      ][sites.indexOf(s)]
                    }
                  </p>
                  <div className="site-stats">
                    <div>
                      <strong>{s === sites[2] ? '7 / 8' : '8 / 8'}</strong>
                      <small>Cameras online</small>
                    </div>
                    <div>
                      <strong>
                        {active.filter((i) => i.site === s).length}
                      </strong>
                      <small>Open incidents</small>
                    </div>
                    <div>
                      <strong>
                        {guards.filter((g) => g.site === s).length}
                      </strong>
                      <small>On-duty guards</small>
                    </div>
                  </div>
                  <button
                    className="secondary full"
                    onClick={() =>
                      setInspectedSite(inspectedSite === s ? null : s)
                    }
                  >
                    View site operations <ArrowUpRight size={16} />
                  </button>
                </section>
              ))}
          </div>
          {inspectedSite && (
            <section className="panel section-gap">
              <div className="panel-head">
                <h2>{inspectedSite}</h2>
                <Badge value="Demo site" />
              </div>
              <div className="site-detail">
                <div>
                  <h3>Site response procedure</h3>
                  <ol>
                    <li>
                      Verify the alert and check available camera coverage.
                    </li>
                    <li>Confirm authorised access with the site contact.</li>
                    <li>Assign an available guard for a verified incident.</li>
                    <li>Record findings and complete the incident review.</li>
                  </ol>
                </div>
                <div>
                  <h3>Operational settings</h3>
                  <p>Timezone: Asia/Kuala_Lumpur</p>
                  <p>Demo armed schedule: 20:00–08:00</p>
                  <p>Evidence retention: 30 days (proposed)</p>
                  <button
                    className="primary"
                    onClick={() => {
                      setSite(inspectedSite);
                      navigate('Incidents');
                    }}
                  >
                    Open site incidents
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      {view === 'Guard dispatch' && (
        <>
          <div className="dispatch-layout">
            <section className="panel">
              <div className="panel-head">
                <h2>Response team</h2>
                <span className="subtle">
                  {
                    available.filter(
                      (g) => site === 'All sites' || g.site === site,
                    ).length
                  }{' '}
                  available
                </span>
              </div>
              {guards
                .filter((g) => site === 'All sites' || g.site === site)
                .map((g) => {
                  const task = active.find((i) => i.guard === g.name);
                  return (
                    <div className="guard-row" key={g.name}>
                      <div className="avatar">
                        {g.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <strong>{g.name}</strong>
                        <small>{g.site}</small>
                        {task && (
                          <button
                            className="text-button"
                            onClick={() => open(task)}
                          >
                            {task.id} · {task.status} <ArrowUpRight size={14} />
                          </button>
                        )}
                      </div>
                      <Badge value={task ? 'Assigned' : 'Available'} />
                    </div>
                  );
                })}
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2>Ready for response</h2>
                <span className="subtle">Verified incidents</span>
              </div>
              {active
                .filter(
                  (i) =>
                    i.status === 'Verified' &&
                    (site === 'All sites' || i.site === site),
                )
                .map((i) => (
                  <button
                    className="queue-row"
                    key={i.id}
                    onClick={() => open(i)}
                  >
                    <span className="event-icon amber">
                      <Siren size={18} />
                    </span>
                    <div>
                      <strong>{i.title}</strong>
                      <small>
                        {i.site} · {i.id}
                      </small>
                    </div>
                    <ChevronRight size={17} />
                  </button>
                ))}
              {!active.some(
                (i) =>
                  i.status === 'Verified' &&
                  (site === 'All sites' || i.site === site),
              ) && (
                <div className="empty">
                  <Check />
                  <h3>No pending assignments</h3>
                  <p>Verify an incident to make it ready for response.</p>
                </div>
              )}
              <div className="panel-foot">
                Assignments in this preview do not notify real guards.
              </div>
            </section>
          </div>
          <section className="panel section-gap">
            <div className="panel-head">
              <h2>Response workflow</h2>
            </div>
            <div className="steps">
              {[
                'Verify incident',
                'Assign guard',
                'Record arrival',
                'Resolve & close',
              ].map((s, i) => (
                <div key={s}>
                  <b>{i + 1}</b>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      {view === 'Investigations' && (
        <>
          <Tabs defaultValue="events">
            <TabsList className="workspace-tabs">
              <TabsTrigger value="events">Event search</TabsTrigger>
              <TabsTrigger value="cases">
                Case workspace ({cases.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              {filters}
              {table}
              <div className="notice section-gap">
                <FileText size={19} />
                <div>
                  <strong>Build a case from verified observations</strong>
                  <span>
                    Open an incident and select “Add to case”. Original footage
                    is not available in this demo.
                  </span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="cases">
              <section className="panel">
                <div className="panel-head">
                  <h2>CASE-001 · Security review</h2>
                  <button
                    className="secondary"
                    disabled={!cases.length}
                    onClick={() => {
                      saveCSV('AiWAS-demo-case.csv', [
                        ['Incident', 'Site', 'Status', 'Review notes'],
                        ...incidents
                          .filter((i) => cases.includes(i.id))
                          .map((i) => [
                            i.id,
                            i.site,
                            i.status,
                            i.notes.join(' | '),
                          ]),
                      ]);
                      toast.success('Case summary downloaded');
                    }}
                  >
                    <Download size={16} />
                    Export summary
                  </button>
                </div>
                {incidents
                  .filter((i) => cases.includes(i.id))
                  .map((i) => (
                    <div className="case-row" key={i.id}>
                      <FileText size={22} />
                      <button className="table-link" onClick={() => open(i)}>
                        {i.title}
                        <small>
                          {i.id} · {i.site}
                        </small>
                      </button>
                      <Badge value={i.status} />
                      <button
                        className="text-button"
                        onClick={() =>
                          setCases((c) => c.filter((id) => id !== i.id))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                {!cases.length && (
                  <div className="empty">
                    <FileText />
                    <h3>No events in this case</h3>
                    <p>Find an event, review it, then add it to this case.</p>
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </>
      )}
      {view === 'Detection rules' && (
        <>
          <div className="notice">
            <SlidersHorizontal size={19} />
            <div>
              <strong>90 capabilities, one security workspace</strong>
              <span>
                Review the complete feature scope. Configuration changes below
                are demonstrations and do not activate detections.
              </span>
            </div>
          </div>
          <div className="toolbar">
            <div className="search-box">
              <Search size={17} />
              <input
                value={rulesQuery}
                onChange={(e) => setRulesQuery(e.target.value)}
                placeholder="Find a capability or feature ID…"
                aria-label="Search capabilities"
              />
            </div>
            <Pick
              value={release}
              onChange={setRelease}
              options={['All releases', 'R1', 'R2', 'R3']}
              label="Filter release"
            />
            <span className="subtle">
              {Object.values(configurations).filter((c) => c.enabled).length}{' '}
              demo configurations enabled
            </span>
          </div>
          <div className="rule-grid">
            {features
              .filter(
                (f) =>
                  (f.id + ' ' + f.title + ' ' + f.Outcome)
                    .toLowerCase()
                    .includes(rulesQuery.toLowerCase()) &&
                  (release === 'All releases' || f.release === release),
              )
              .map((f) => (
                <button
                  className="panel rule-card"
                  key={f.id}
                  onClick={() => {
                    openRule(f);
                  }}
                >
                  <div>
                    <span className="feature-id">{f.id}</span>
                    <span className="badge">
                      {f.release} · {f.route}
                    </span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.Outcome}</p>
                  <footer>
                    <span
                      className={
                        Object.values(configurations).some(
                          (c) => c.featureId === f.id && c.enabled,
                        )
                          ? 'green'
                          : 'subtle'
                      }
                    >
                      {Object.values(configurations).some(
                        (c) => c.featureId === f.id && c.enabled,
                      )
                        ? '● Demo enabled'
                        : 'Not configured'}
                    </span>
                    <ArrowUpRight size={17} />
                  </footer>
                </button>
              ))}
          </div>
          {!features.some(
            (f) =>
              (f.id + ' ' + f.title + ' ' + f.Outcome)
                .toLowerCase()
                .includes(rulesQuery.toLowerCase()) &&
              (release === 'All releases' || f.release === release),
          ) && (
            <div className="empty">
              <Search />
              <h3>No matching capabilities</h3>
              <button
                className="secondary"
                onClick={() => {
                  setRulesQuery('');
                  setRelease('All releases');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
      {view === 'Reports' && (
        <>
          <p className="report-period">
            <Clock size={16} />
            Sample records + this session
          </p>
          {filters}
          <div className="metrics">
            {[
              ['Recorded events', filtered.length],
              ['Closed', filtered.filter((i) => i.status === 'Closed').length],
              [
                'Awaiting review',
                filtered.filter((i) => i.status === 'New').length,
              ],
              [
                'Assigned',
                filtered.filter((i) => i.guard && i.status !== 'Closed').length,
              ],
            ].map(([l, v]) => (
              <div className="metric" key={l}>
                <label>{l}</label>
                <strong>{v}</strong>
                <small className="subtle">Selected demo records</small>
              </div>
            ))}
          </div>
          <div className="overview-grid">
            <section className="panel">
              <div className="panel-head">
                <h2>Incidents by site</h2>
                <span className="subtle">Selected filters</span>
              </div>
              <div className="bars">
                {selectedSites.map((s) => {
                  const n = filtered.filter((i) => i.site === s).length;
                  return (
                    <div key={s}>
                      <div>
                        <span>{s}</span>
                        <b>{n}</b>
                      </div>
                      <div className="bar-track">
                        <span
                          style={{
                            width: Math.max(
                              ...sites.map(
                                (x) =>
                                  filtered.filter((i) => i.site === x).length,
                              ),
                            )
                              ? (n /
                                  Math.max(
                                    ...sites.map(
                                      (x) =>
                                        filtered.filter((i) => i.site === x)
                                          .length,
                                    ),
                                  )) *
                                  100 +
                                '%'
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="panel">
              <div className="panel-head">
                <h2>Coverage exceptions</h2>
                <Badge
                  value={
                    selectedSites.includes(sites[2])
                      ? '1 camera offline'
                      : 'No reported faults'
                  }
                />
              </div>
              <div className="report-callout">
                {selectedSites.includes(sites[2]) ? (
                  <>
                    <WifiOff />
                    <h3>Harbour Retail Centre · P-04</h3>
                    <p>
                      Connection lost at 14:16. Coverage is unknown until a
                      successful recovery check.
                    </p>
                    <button
                      className="secondary"
                      onClick={() =>
                        open(incidents.find((i) => i.id === 'INC-2404')!)
                      }
                    >
                      Review maintenance incident
                    </button>
                  </>
                ) : (
                  <>
                    <Check />
                    <h3>No demo coverage faults for this site</h3>
                    <p>
                      Health values are illustrative; no live video source is
                      connected.
                    </p>
                  </>
                )}
              </div>
            </section>
          </div>
          {table}
        </>
      )}
      <p className="demo-note">
        Simulated operational data · Changes last for this open session · No
        live cameras or emergency services connected
      </p>
      <Sheet
        open={visible && !!current}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        <SheetContent className="aiwas-security security-overlay detail-sheet">
          <SheetHeader>
            <div className="eyebrow">INCIDENT REVIEW · {current?.id}</div>
            <SheetTitle>{current?.title}</SheetTitle>
            <SheetDescription>
              {current?.site} · {current?.zone}
            </SheetDescription>
          </SheetHeader>
          {current && (
            <div className="sheet-body">
              <div className="inline-badges">
                <Badge value={current.severity} />
                <Badge value={current.status} />
                <span className="subtle">Detected {current.time}</span>
              </div>
              <div className="evidence-scene">
                <CameraStill scene={securityScene(current.zone)} />
                <p className="helper">
                  Illustrative scene for {current.zone}, not footage of this
                  event. Recorded evidence needs your camera or VMS
                  integration.
                </p>
              </div>
              <Tabs defaultValue="response" key={current.id}>
                <TabsList className="workspace-tabs">
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="notes">
                    Notes ({current.notes.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="response">
                  <h3>Operator review</h3>
                  <p className="helper">
                    Confirm what is observable, check site permissions and
                    record the reason for your decision.
                  </p>
                  {current.status !== 'Closed' && (
                    <>
                      <label className="field-label" htmlFor="review-note">
                        Review note{' '}
                        {['New', 'Verified', 'Arrived'].includes(
                          current.status,
                        ) && (
                          <span>
                            · 10 characters required for verdict or closure
                          </span>
                        )}
                      </label>
                      <textarea
                        id="review-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Describe the observation and response outcome (at least 10 characters)…"
                        rows={3}
                      />
                    </>
                  )}
                  {current.status === 'New' && (
                    <div className="action-row">
                      <button
                        className="primary"
                        disabled={note.trim().length < 10}
                        onClick={() => change('Verified')}
                      >
                        <Check size={16} />
                        Verify event
                      </button>
                      <button
                        className="secondary"
                        disabled={note.trim().length < 10}
                        onClick={() => change('Closed')}
                      >
                        Dismiss & close
                      </button>
                    </div>
                  )}
                  {current.status === 'Verified' && (
                    <>
                      <h3>Assign response</h3>
                      <p className="helper">
                        Choose an available guard at this site.
                      </p>
                      {available.some((g) => g.site === current.site) ? (
                        <>
                          <Pick
                            value={assigned}
                            onChange={setAssigned}
                            options={available
                              .filter((g) => g.site === current.site)
                              .map((g) => g.name)}
                            label="Choose guard"
                          />
                          <button
                            className="primary section-gap"
                            disabled={!assigned}
                            onClick={dispatch}
                          >
                            Assign guard
                          </button>
                        </>
                      ) : (
                        <div className="notice">
                          No available guards at this site. Coordinate
                          alternative coverage.
                        </div>
                      )}
                      <button
                        className="secondary section-gap"
                        disabled={note.trim().length < 10}
                        onClick={() => change('Closed')}
                      >
                        Resolve without dispatch
                      </button>
                    </>
                  )}
                  {['Dispatched', 'Arrived'].includes(current.status) && (
                    <div className="assigned-box">
                      <Users size={22} />
                      <div>
                        <strong>{current.guard}</strong>
                        <p>
                          {current.status === 'Dispatched'
                            ? 'Awaiting arrival confirmation'
                            : 'Arrival recorded'}
                        </p>
                      </div>
                    </div>
                  )}
                  {current.status === 'Dispatched' && (
                    <button
                      className="primary"
                      onClick={() => change('Arrived')}
                    >
                      Record guard arrival
                    </button>
                  )}
                  {current.status === 'Arrived' && (
                    <button
                      className="primary"
                      disabled={note.trim().length < 10}
                      onClick={() => change('Closed')}
                    >
                      Resolve & close incident
                    </button>
                  )}
                  {current.status === 'Closed' && (
                    <div className="notice">
                      <Check />
                      Incident closed. The review history is preserved in this
                      session.
                    </div>
                  )}
                  <button
                    className="secondary full section-gap"
                    disabled={cases.includes(current.id)}
                    onClick={() => {
                      setCases((c) => [...c, current.id]);
                      toast.success('Added to CASE-001');
                    }}
                  >
                    <FileText size={16} />
                    {cases.includes(current.id)
                      ? 'Added to case'
                      : 'Add to case'}
                  </button>
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="timeline">
                    {current.history.map((h, i) => (
                      <div key={i}>
                        <span className="dot green" />
                        <p>{h}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="notes">
                  {current.notes.length ? (
                    current.notes.map((n, i) => (
                      <p className="note" key={i}>
                        {n}
                      </p>
                    ))
                  ) : (
                    <p className="helper">No review notes yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={visible && newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="aiwas-security security-overlay">
          <DialogHeader>
            <DialogTitle>Create security incident</DialogTitle>
            <DialogDescription>
              Record a manual event in the demo incident queue.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              let i: Incident;
              try {
                i = makeIncident(
                  { title, site: newSite, severity },
                  crypto.randomUUID(),
                );
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Invalid incident',
                );
                return;
              }
              setIncidents((p) => [i, ...p]);
              setQuery('');
              setStatus('All statuses');
              setSite(i.site);
              setNewOpen(false);
              setTitle('');
              open(i);
              toast.success('Demo incident created');
            }}
          >
            <label className="field-label" htmlFor="incident-title">
              Incident title
            </label>
            <input
              id="incident-title"
              required
              minLength={5}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What happened?"
            />
            <span className="field-label">Site</span>
            <Pick
              value={newSite}
              onChange={setNewSite}
              options={sites}
              label="Incident site"
            />
            <span className="field-label">Priority</span>
            <Pick
              value={severity}
              onChange={setSeverity}
              options={['Critical', 'High', 'Medium', 'Low']}
              label="Incident priority"
            />
            <button className="primary full section-gap" type="submit">
              Create incident
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Sheet open={visible && !!rule} onOpenChange={(v) => !v && setRule(null)}>
        <SheetContent className="aiwas-security security-overlay detail-sheet">
          <SheetHeader>
            <div className="eyebrow">{rule?.id} · CAPABILITY SPECIFICATION</div>
            <SheetTitle>{rule?.title}</SheetTitle>
            <SheetDescription>
              {rule?.actor} · {rule?.release} · {rule?.route}
            </SheetDescription>
          </SheetHeader>
          {rule && (
            <div className="sheet-body">
              <Tabs defaultValue="scope" key={rule.id}>
                <TabsList className="workspace-tabs">
                  <TabsTrigger value="scope">Scope & journey</TabsTrigger>
                  <TabsTrigger value="configure">
                    Demo configuration
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="scope">
                  <p>{rule.Outcome}</p>
                  <h3>User journey</h3>
                  <ol className="journey-list">
                    {rule.Journey.split(' > ').map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  {[
                    ['Inputs', rule.Inputs],
                    ['Configuration', rule.Configure],
                    ['Runtime rules', rule.Rules],
                    ['Exceptions', rule.Exceptions],
                    ['Acceptance tests', rule.Acceptance],
                    ['Scope boundaries', rule.Scope],
                    ['Dependencies', rule.Dependencies],
                    ['Stored outputs', rule.Outputs],
                  ].map(([a, b]) => (
                    <section className="spec-section" key={a}>
                      <h3>{a}</h3>
                      <p>{b}</p>
                    </section>
                  ))}
                </TabsContent>
                <TabsContent value="configure">
                  <div className="notice">
                    This is a configuration preview. Saving does not activate a
                    model or send an alert.
                  </div>
                  <span className="field-label">Site</span>
                  <Pick
                    value={ruleSite}
                    onChange={(v) => loadDraft(rule.id, v)}
                    options={sites}
                    label="Rule site"
                  />
                  <label className="field-label" htmlFor="rule-grace">
                    Review grace period (seconds)
                  </label>
                  <input
                    id="rule-grace"
                    type="number"
                    min="0"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <p className="helper">
                    Illustrative incident-routing setting. Feature-specific
                    inputs are listed under Scope & journey.
                  </p>
                  <div className="switch-row">
                    <label htmlFor="rule-enabled">
                      Enable in demo configuration
                    </label>
                    <Switch
                      id="rule-enabled"
                      checked={draftEnabled}
                      onCheckedChange={setDraftEnabled}
                    />
                  </div>
                  <button
                    className="primary full"
                    disabled={
                      duration === '' ||
                      Number(duration) < 0 ||
                      Number(duration) > 600 ||
                      !Number.isInteger(Number(duration))
                    }
                    onClick={saveRule}
                  >
                    Save demo configuration
                  </button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={visible && !!camera}
        onOpenChange={(v) => !v && setCamera(null)}
      >
        <DialogContent className="aiwas-security security-overlay">
          <DialogHeader>
            <DialogTitle>{camera?.split('|')[1]} camera</DialogTitle>
            <DialogDescription>{camera?.split('|')[0]}</DialogDescription>
          </DialogHeader>
          {camera &&
          isCameraOffline(camera.split('|')[0], camera.split('|')[1]) ? (
            <div className="evidence-panel">
              <Camera size={32} />
              <strong>No source connected</strong>
              <p>
                This position is offline. Coverage is unavailable — do not read
                it as clear.
              </p>
            </div>
          ) : (
            camera && (
              <>
                <DemoVideo scene={securityScene(camera.split('|')[1])} />
                <p className="helper">
                  Synthetic demonstration scene, not footage from this estate.
                  A live stream needs your camera or VMS integration.
                </p>
              </>
            )
          )}
          <h3>Related demo incidents</h3>
          {incidents
            .filter((i) => i.site === camera?.split('|')[0])
            .map((i) => (
              <button
                key={i.id}
                className="queue-row"
                onClick={() => {
                  setCamera(null);
                  open(i);
                }}
              >
                <div>
                  <strong>{i.title}</strong>
                  <small>
                    {i.id} · {i.zone}
                  </small>
                </div>
                <ArrowUpRight size={16} />
              </button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
