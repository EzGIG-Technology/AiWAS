'use client';
import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  GraduationCap,
  Info,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Video,
  WifiOff,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { schools, cameras, type Incident } from './data';

function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="picker" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function FleetOverview({
  incidents,
  onSelect,
  directory = false,
}: {
  incidents: Incident[];
  onSelect: (school: string, view: string) => void;
  directory?: boolean;
}) {
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All schools'),
    [selected, setSelected] = useState<string | null>(null);
  const records = schools.map((name, index) => {
    const feeds = cameras.filter((c) => c.school === name),
      events = incidents.filter((i) => i.school === name);
    return {
      name,
      index,
      feeds,
      events,
      online: feeds.filter((c) => c.online).length,
      open: events.filter((i) => i.status !== 'Closed').length,
      pending: events.filter((i) => i.validation === 'Pending').length,
    };
  });
  const selectedRecord = records.find((r) => r.name === selected);
  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'All schools' ||
        (filter === 'Needs attention'
          ? r.online < r.feeds.length
          : r.online === r.feeds.length)),
  );
  const online = cameras.filter((c) => c.online).length;
  const open = incidents.filter((i) => i.status !== 'Closed');
  return (
    <>
      {!directory && (
        <>
          <section className="fleet-banner">
            <div>
              <span className="command-kicker">
                <span className="live-dot" /> PLATFORM OPERATIONS · DEMO
              </span>
              <h2>Every school. One clear picture.</h2>
              <p>
                {schools.length} connected schools across Negeri Sembilan.
                <br />
                Keep coverage reliable and school teams supported.
              </p>
            </div>
            <div className="fleet-health">
              <span className="health-ring">
                {Math.round((online / cameras.length) * 100)}
                <small>%</small>
              </span>
              <div>
                <strong>Camera availability</strong>
                <span>
                  {online} of {cameras.length} feeds online
                </span>
                <small>Sample snapshot · 10:44 MYT</small>
              </div>
            </div>
          </section>
          <div className="stats fleet-stats">
            {[
              [
                'Connected schools',
                schools.length,
                '2 pilot schools',
                Building2,
              ],
              [
                'Cameras online',
                `${online} / ${cameras.length}`,
                '1 connection needs attention',
                Video,
              ],
              [
                'Open incidents',
                open.length,
                'Managed by school teams',
                ShieldCheck,
              ],
              [
                'Awaiting review',
                incidents.filter((i) => i.validation === 'Pending').length,
                'Across connected schools',
                ClipboardCheck,
              ],
            ].map(([label, value, sub, Icon]) => {
              const I = Icon as typeof Building2;
              return (
                <div className="stat" key={String(label)}>
                  <span>
                    {String(label)}
                    <I size={18} />
                  </span>
                  <strong>{String(value)}</strong>
                  <small>{String(sub)}</small>
                </div>
              );
            })}
          </div>
          <div className="platform-attention">
            <span className="attention-mark">
              <WifiOff size={20} />
            </span>
            <div>
              <strong>One camera connection needs attention</strong>
              <p>SMK Tunku Ampuan Durah · Assembly hall · CAM-06</p>
            </div>
            <button
              className="btn"
              onClick={() => onSelect(schools[0], 'System health')}
            >
              Investigate
              <ArrowUpRight size={15} />
            </button>
          </div>
        </>
      )}
      <section className="panel school-directory">
        <div className="panel-title">
          <div>
            <h2>
              {directory ? 'Connected schools' : 'School overview'}{' '}
              <span className="count">{schools.length}</span>
            </h2>
            <p>Operational status and review workload by school</p>
          </div>
          <span className="scope-chip">
            <LockKeyhole size={14} /> Superadmin
          </span>
        </div>
        <div className="directory-tools">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label="Search schools"
              placeholder="Search a school…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Choice
            label="School health filter"
            value={filter}
            onChange={setFilter}
            options={['All schools', 'Needs attention', 'Healthy']}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                'School',
                'Camera coverage',
                'Open incidents',
                'Pending review',
                'Connection',
                '',
              ].map((x, i) => (
                <TableHead key={i}>{x}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.name}>
                <TableCell>
                  <button
                    className="school-name"
                    onClick={() => setSelected(r.name)}
                  >
                    <span className="school-monogram">
                      {r.index === 0 ? 'SMK' : 'SK'}
                    </span>
                    <span>
                      <strong>{r.name}</strong>
                      <small>
                        {r.index === 0 ? 'Secondary school' : 'Primary school'}{' '}
                        · Seremban
                      </small>
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="coverage-cell">
                    <strong>
                      {r.online} / {r.feeds.length}
                    </strong>
                    <span>
                      <i
                        style={{
                          width: `${(r.online / r.feeds.length) * 100}%`,
                        }}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <strong>{r.open}</strong>
                </TableCell>
                <TableCell>
                  <span className={'badge ' + (r.pending ? 'amber' : 'green')}>
                    {r.pending} pending
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      'connection-status ' +
                      (r.online === r.feeds.length ? 'healthy' : 'attention')
                    }
                  >
                    <i />
                    {r.online === r.feeds.length
                      ? 'Healthy'
                      : 'Needs attention'}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className="text-btn"
                    onClick={() => setSelected(r.name)}
                  >
                    Manage
                    <ChevronRight size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={28} />
            <h3>No schools match</h3>
            <p>Try another name or connection filter.</p>
          </div>
        )}
        <div className="table-footer">
          {filtered.length} of {schools.length} schools · Fictional operational
          data
        </div>
      </section>
      {!directory && (
        <div className="fleet-bottom">
          <section className="panel">
            <div className="panel-title">
              <div>
                <h2>Platform responsibilities</h2>
                <p>Keep administration separate from student casework</p>
              </div>
            </div>
            <div className="responsibility-list">
              <div>
                <Activity />
                <span>
                  <strong>Coverage & reliability</strong>
                  <p>Camera connections, processing and notification health</p>
                </span>
              </div>
              <div>
                <Users />
                <span>
                  <strong>Schools & access</strong>
                  <p>
                    Individual staff accounts with an assigned school and role
                  </p>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <strong>Configuration & oversight</strong>
                  <p>School-specific rules, routing and activity records</p>
                </span>
              </div>
            </div>
          </section>
          <section className="future-access">
            <div className="future-icon">
              <Building2 size={24} />
            </div>
            <span className="scope-chip">FUTURE ACCESS</span>
            <h2>Government insights</h2>
            <p>
              A read-only view of aggregated trends, coverage and response
              outcomes. Student identities and routine live footage stay outside
              this view.
            </p>
            <span className="future-footer">
              <LockKeyhole size={14} /> Planned · No government portal enabled
            </span>
          </section>
        </div>
      )}
      <Sheet
        open={!!selectedRecord}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        <SheetContent className="incident-sheet">
          {selectedRecord && (
            <>
              <SheetHeader>
                <div className="eyebrow">SCHOOL ADMINISTRATION</div>
                <SheetTitle>{selectedRecord.name}</SheetTitle>
                <SheetDescription>
                  Seremban · Negeri Sembilan · Pilot school
                </SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <div className="school-detail-banner">
                  <GraduationCap size={32} />
                  <div>
                    <strong>
                      {selectedRecord.index === 0
                        ? 'Secondary school'
                        : 'Primary school'}
                    </strong>
                    <span>Sample school record</span>
                  </div>
                </div>
                <div className="detail-grid">
                  <div>
                    <span>Camera coverage</span>
                    <strong>
                      {selectedRecord.online} / {selectedRecord.feeds.length}{' '}
                      online
                    </strong>
                  </div>
                  <div>
                    <span>Incident workload</span>
                    <strong>
                      {selectedRecord.open} open · {selectedRecord.pending}{' '}
                      pending
                    </strong>
                  </div>
                </div>
                <div className="school-admin-links">
                  {[
                    ['System health', 'Check cameras and processing', Activity],
                    [
                      'Detection rules',
                      'Review school-specific thresholds',
                      ShieldCheck,
                    ],
                    ['Users & roles', 'Manage individual staff access', Users],
                    [
                      'Incidents',
                      'Review this school’s incident log',
                      ClipboardCheck,
                    ],
                  ].map(([view, description, Icon]) => {
                    const I = Icon as typeof Activity;
                    return (
                      <button
                        key={String(view)}
                        onClick={() => {
                          setSelected(null);
                          onSelect(selectedRecord.name, String(view));
                        }}
                      >
                        <I size={20} />
                        <span>
                          <strong>{String(view)}</strong>
                          <small>{String(description)}</small>
                        </span>
                        <ChevronRight size={18} />
                      </button>
                    );
                  })}
                </div>
                <div className="info-note compact">
                  <Info size={18} />
                  <p>
                    School selection changes this demo’s operational scope.
                    Production permissions must be enforced for every individual
                    account.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

type PresenceStatus =
  | 'Recorded on campus'
  | 'Departure recorded'
  | 'Not recorded today'
  | 'Needs verification';
type Pupil = {
  id: string;
  name: string;
  className: string;
  status: PresenceStatus;
  arrival: string;
  last: string;
  source: string;
  history: { text: string; time: string }[];
};
const presenceSeed: Pupil[] = [
  [
    'ST-101',
    'Adam Hakim',
    '1 Amanah',
    'Recorded on campus',
    '07:18',
    '07:18',
    'Main gate · Card record',
  ],
  [
    'ST-102',
    'Sofia Tan',
    '1 Amanah',
    'Recorded on campus',
    '07:24',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-103',
    'Aiman Faris',
    '2 Bestari',
    'Needs verification',
    '07:21',
    '10:12',
    'Exit record incomplete',
  ],
  [
    'ST-104',
    'Kavya Devi',
    '2 Bestari',
    'Departure recorded',
    '07:12',
    '10:10',
    'Approved early release',
  ],
  [
    'ST-105',
    'Daniel Wong',
    '3 Cekal',
    'Recorded on campus',
    '07:29',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-106',
    'Nur Hana',
    '3 Cekal',
    'Not recorded today',
    '—',
    '—',
    'No attendance record',
  ],
  [
    'ST-107',
    'Amir Zaki',
    '1 Amanah',
    'Recorded on campus',
    '07:31',
    '07:31',
    'Main gate · Card record',
  ],
  [
    'ST-108',
    'Mei Lin',
    '2 Bestari',
    'Departure recorded',
    '07:16',
    '09:55',
    'Guardian handover',
  ],
  [
    'ST-109',
    'Irfan Azmi',
    '3 Cekal',
    'Needs verification',
    '07:35',
    '10:20',
    'Gate reader unavailable',
  ],
  [
    'ST-110',
    'Sara Imani',
    '1 Amanah',
    'Not recorded today',
    '—',
    '—',
    'No attendance record',
  ],
  [
    'ST-111',
    'Ravi Kumar',
    '2 Bestari',
    'Recorded on campus',
    '07:26',
    '07:40',
    'Teacher roll call',
  ],
  [
    'ST-112',
    'Alya Syafiqah',
    '3 Cekal',
    'Departure recorded',
    '07:19',
    '10:05',
    'Approved early release',
  ],
].map((r) => ({
  id: r[0],
  name: r[1],
  className: r[2],
  status: r[3] as PresenceStatus,
  arrival: r[4],
  last: r[5],
  source: r[6],
  history: [{ text: r[6], time: r[5] }],
}));
const statusTone = (s: string) =>
  s === 'Recorded on campus'
    ? 'blue'
    : s === 'Departure recorded'
      ? 'green'
      : s === 'Needs verification'
        ? 'amber'
        : 'neutral';
export function PresencePanel({ school }: { school: string }) {
  const [pupils, setPupils] = useState(presenceSeed),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All records'),
    [classFilter, setClassFilter] = useState('All classes'),
    [selected, setSelected] = useState<string | null>(null),
    [nextStatus, setNextStatus] =
      useState<PresenceStatus>('Recorded on campus'),
    [source, setSource] = useState('Teacher confirmation'),
    [reason, setReason] = useState(''),
    [error, setError] = useState(''),
    [review, setReview] = useState(false);
  const pupil = pupils.find((p) => p.id === selected);
  const counts = {
    present: pupils.filter((p) => p.arrival !== '—').length,
    campus: pupils.filter((p) => p.status === 'Recorded on campus').length,
    left: pupils.filter((p) => p.status === 'Departure recorded').length,
    verify: pupils.filter((p) => p.status === 'Needs verification').length,
  };
  const filtered = useMemo(
    () =>
      pupils.filter(
        (p) =>
          (filter === 'All records' || p.status === filter) &&
          (classFilter === 'All classes' || p.className === classFilter) &&
          `${p.name} ${p.id}`.toLowerCase().includes(query.toLowerCase()) &&
          (!review ||
            ['Recorded on campus', 'Needs verification'].includes(p.status)),
      ),
    [pupils, filter, classFilter, query, review],
  );
  const openRecord = (p: Pupil) => {
    setSelected(p.id);
    setNextStatus(
      p.status === 'Not recorded today' ? 'Recorded on campus' : p.status,
    );
    setSource('Teacher confirmation');
    setReason('');
    setError('');
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pupil || !reason.trim()) {
      setError('Add the evidence or confirmation behind this update.');
      return;
    }
    if (source === 'Unable to verify' && nextStatus !== 'Needs verification') {
      setError(
        'Choose Needs verification when the status cannot be confirmed.',
      );
      return;
    }
    const time = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
    });
    setPupils((all) =>
      all.map((p) =>
        p.id === pupil.id
          ? {
              ...p,
              status: nextStatus,
              arrival:
                nextStatus === 'Not recorded today'
                  ? '—'
                  : p.arrival === '—' && nextStatus !== 'Needs verification'
                    ? time
                    : p.arrival,
              last: time,
              source,
              history: [
                {
                  text: `${p.status} → ${nextStatus}. ${source}: ${reason.trim()} · Nadia Ahmad (demo)`,
                  time,
                },
                ...p.history,
              ],
            }
          : p,
      ),
    );
    setSelected(null);
  };
  const exportRows = () => {
    const csv = [
      ['DEMO DATA — Student presence, 10 September 2026'],
      ['School', school],
      [
        'Student ID',
        'Student',
        'Class',
        'Presence status',
        'Arrival',
        'Latest record',
        'Source',
      ],
      ...filtered.map((p) => [
        p.id,
        p.name,
        p.className,
        p.status,
        p.arrival,
        p.last,
        p.source,
      ]),
    ]
      .map((row) =>
        row.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(','),
      )
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AiWAS-demo-presence.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <div className="presence-intro">
        <div className="presence-intro-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <strong>Attendance is a record. Presence needs confirmation.</strong>
          <p>
            Use gate records and staff checks to reconcile arrivals and
            departures. Missing exit data does not confirm that a student is
            still on campus.
          </p>
        </div>
        <span className="scope-chip">12 sample students</span>
      </div>
      <div className="stats presence-stats">
        {[
          [
            'Attendance recorded',
            `${counts.present} / ${pupils.length}`,
            'Recorded at least once today',
            'All records',
          ],
          [
            'Recorded on campus',
            counts.campus,
            'Based on latest confirmed record',
            'Recorded on campus',
          ],
          [
            'Departure recorded',
            counts.left,
            'Release or exit recorded',
            'Departure recorded',
          ],
          [
            'Needs verification',
            counts.verify,
            'Incomplete or unavailable exit data',
            'Needs verification',
          ],
        ].map(([label, value, hint, status]) => (
          <button
            key={label}
            className={'stat ' + (filter === status ? 'selected-stat' : '')}
            onClick={() => {
              setFilter(String(status));
              setReview(false);
            }}
          >
            <span>
              {label}
              <ArrowUpRight size={17} />
            </span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </button>
        ))}
      </div>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>{review ? 'Departure reconciliation' : 'Student presence'}</h2>
            <p>Thursday, 10 September 2026 · Fictional register</p>
          </div>
          <button className="btn" onClick={exportRows}>
            <ArrowDownToLine size={16} />
            Export view
          </button>
        </div>
        <div className="presence-mode">
          <button
            className={!review ? 'active' : ''}
            onClick={() => {
              setReview(false);
              setFilter('All records');
            }}
          >
            All students <span>{pupils.length}</span>
          </button>
          <button
            className={review ? 'active' : ''}
            onClick={() => {
              setReview(true);
              setFilter('All records');
            }}
          >
            Departure review <span>{counts.campus + counts.verify}</span>
          </button>
        </div>
        {review && (
          <div className="departure-note">
            <Clock3 size={17} />
            <span>
              Reconcile these records at dismissal. They are not a verified list
              of students physically remaining inside.
            </span>
          </div>
        )}
        <div className="directory-tools">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label="Search student records"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student or ID…"
            />
          </div>
          <Choice
            label="Class"
            value={classFilter}
            onChange={setClassFilter}
            options={['All classes', '1 Amanah', '2 Bestari', '3 Cekal']}
          />
          <Choice
            label="Presence status"
            value={filter}
            onChange={setFilter}
            options={
              review
                ? ['All records', 'Recorded on campus', 'Needs verification']
                : [
                    'All records',
                    'Recorded on campus',
                    'Departure recorded',
                    'Not recorded today',
                    'Needs verification',
                  ]
            }
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {[
                'Student',
                'Class',
                'Attendance',
                'Latest record',
                'Presence status',
                '',
              ].map((x, i) => (
                <TableHead key={i}>{x}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <button
                    className="student-name"
                    onClick={() => openRecord(p)}
                  >
                    <span className="avatar">
                      {p.name
                        .split(' ')
                        .map((x) => x[0])
                        .join('')}
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.id}</small>
                    </span>
                  </button>
                </TableCell>
                <TableCell>{p.className}</TableCell>
                <TableCell>
                  {p.arrival === '—' ? 'Not recorded' : p.arrival}
                  <small>
                    {p.arrival === '—'
                      ? 'Staff check needed'
                      : 'Recorded today'}
                  </small>
                </TableCell>
                <TableCell>
                  {p.last}
                  <small>{p.source}</small>
                </TableCell>
                <TableCell>
                  <span className={'badge ' + statusTone(p.status)}>
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  <button className="text-btn" onClick={() => openRecord(p)}>
                    {p.status === 'Needs verification' ? 'Verify' : 'Review'}
                    <ChevronRight size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length && (
          <div className="empty-state">
            <CheckCircle2 size={28} />
            <h3>No matching records</h3>
            <p>Change the filters to see other students.</p>
          </div>
        )}
        <div className="table-footer">
          {filtered.length} records shown · Updates last for this demo session
        </div>
      </section>
      <div className="presence-bottom">
        <div>
          <ShieldCheck size={22} />
          <span>
            <strong>Non-biometric by default</strong>
            <p>
              Gate/card records and teacher confirmation. No face enrolment or
              facial matching is active.
            </p>
          </span>
        </div>
        <div>
          <ClipboardCheck size={22} />
          <span>
            <strong>A clear correction history</strong>
            <p>
              Every manual update records its source and reason. Review
              uncertainty before marking a departure.
            </p>
          </span>
        </div>
      </div>
      <Dialog open={!!pupil} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="presence-dialog">
          <DialogHeader>
            <div className="eyebrow">PRESENCE REVIEW</div>
            <DialogTitle>{pupil?.name}</DialogTitle>
            <DialogDescription>
              {pupil?.id} · {pupil?.className} · Demo student
            </DialogDescription>
          </DialogHeader>
          {pupil && (
            <form onSubmit={save}>
              <div className="current-presence">
                <span>Current record</span>
                <span className={'badge ' + statusTone(pupil.status)}>
                  {pupil.status}
                </span>
              </div>
              <label className="field">
                Confirmed status
                <Choice
                  label="Confirmed presence status"
                  value={nextStatus}
                  onChange={(v) => setNextStatus(v as PresenceStatus)}
                  options={[
                    'Recorded on campus',
                    'Departure recorded',
                    'Not recorded today',
                    'Needs verification',
                  ]}
                />
              </label>
              <label className="field">
                Verification source
                <Choice
                  label="Verification source"
                  value={source}
                  onChange={setSource}
                  options={[
                    'Teacher confirmation',
                    'Gate record checked',
                    'Guardian handover',
                    'Office register',
                    'Unable to verify',
                  ]}
                />
              </label>
              <label className="field">
                Reason or evidence
                <textarea
                  required
                  rows={3}
                  placeholder="Who confirmed the status, and what was checked?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              {error && (
                <p role="alert" className="red">
                  {error}
                </p>
              )}
              <details className="presence-history">
                <summary>Record history ({pupil.history.length})</summary>
                {pupil.history.map((h, i) => (
                  <p key={i}>
                    <strong>{h.time} MYT</strong> {h.text}
                  </p>
                ))}
              </details>
              <p className="help-text">
                This updates a fictional register only. No parent notification
                is sent.
              </p>
              <div className="form-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </button>
                <button className="btn primary" type="submit">
                  <Check size={16} />
                  Save demo record
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
