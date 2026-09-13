'use client';
import { useState } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  House,
  ClipboardCheck,
  History,
  UserRound,
  Search,
  ChevronRight,
  MapPin,
  Check,
  Plus,
  Radio,
  PhoneCall,
  Send,
  CheckCheck,
  Video,
  LockKeyhole,
  LogOut,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { CameraStill, DemoVideo, mediaFor } from './camera-media';
import {
  teacherSort,
  teacherNeedsReview,
  type TeacherCommand,
  type TeacherOptions,
} from './teacher-workflow';
import { needsReview } from './workflow';
import { severityClass, type Incident, type User } from './data';
type Props = {
  school: string;
  incidents: Incident[];
  users: User[];
  teacher: string;
  onExit: () => void;
  onAction: (
    id: string,
    action: TeacherCommand,
    note: string,
    options?: TeacherOptions,
  ) => string;
  onReport: (item: Incident) => void;
};
const title = (i: Incident) =>
  ['Fighting', 'Bullying', 'Vandalism', 'Violent behaviour'].includes(
    i.category,
  )
    ? 'Possible ' + i.category.toLowerCase()
    : i.category;
export function TeacherApp({
  school,
  incidents,
  users,
  teacher,
  onExit,
  onAction,
  onReport,
}: Props) {
  const [tab, setTab] = useState('Today'),
    [selected, setSelected] = useState<string | null>(null),
    [filter, setFilter] = useState('Needs review'),
    [query, setQuery] = useState(''),
    [priority, setPriority] = useState('All priorities'),
    [detailTab, setDetailTab] = useState('Evidence'),
    [note, setNote] = useState(''),
    [checks, setChecks] = useState([false, false, false]),
    [decision, setDecision] = useState(''),
    [message, setMessage] = useState(''),
    [dialog, setDialog] = useState<'report' | 'support' | 'handover' | null>(
      null,
    ),
    [recipient, setRecipient] = useState(''),
    [available, setAvailable] = useState(true),
    [routine, setRoutine] = useState(true),
    [prefSaved, setPrefSaved] = useState(false);
  const items = incidents.filter((i) => i.school === school),
    active = teacherSort(items.filter((i) => i.status !== 'Closed')),
    pending = active.filter(teacherNeedsReview),
    mine = active.filter((i) => i.assigned === teacher),
    urgent = active.filter((i) => ['Critical', 'High'].includes(i.severity));
  const item = items.find((i) => i.id === selected);
  const open = (i: Incident) => {
    setSelected(i.id);
    setNote('');
    setChecks([false, false, false]);
    setDecision('');
    setDetailTab('Evidence');
    setMessage('');
  };
  const apply = (action: TeacherCommand, options?: TeacherOptions) => {
    if (!item) return;
    const error = onAction(item.id, action, note, options);
    setMessage(error || 'Saved to the school workspace.');
    if (!error) {
      setNote('');
      if (action === 'verify') {
        setChecks([false, false, false]);
        setDecision('');
      }
      setDialog(null);
    }
  };
  const shown = teacherSort(
    items.filter(
      (i) =>
        (filter === 'All alerts' || filter === 'Closed'
          ? filter === 'All alerts' || i.status === 'Closed'
          : filter === 'Assigned to me'
            ? i.assigned === teacher && i.status !== 'Closed'
            : teacherNeedsReview(i)) &&
        (priority === 'All priorities' || i.severity === priority) &&
        `${i.category} ${i.zone} ${i.id}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ),
  );
  const activity = items
    .flatMap((i) => i.history.map((h, index) => ({ incident: i, ...h, index })))
    .filter((h) => h.actor === teacher)
    .reverse();
  const navigate = (next: string) => {
    setTab(next);
    setSelected(null);
    setMessage('');
  };
  const card = (i: Incident, compact = false) => (
    <button
      key={i.id}
      className={'teacher-alert ' + (compact ? 'compact' : '')}
      onClick={() => open(i)}
    >
      <div className={'teacher-priority-line ' + i.severity.toLowerCase()} />
      {!compact && (
        <div className="teacher-alert-image">
          <CameraStill scene={mediaFor(i.zone, i.category)} overlay={false} />
          <span>
            <Video size={12} /> Sample scene
          </span>
        </div>
      )}
      <div className="teacher-alert-body">
        <div className="teacher-alert-meta">
          <span className={'badge ' + severityClass(i.severity)}>
            {i.severity}
          </span>
          <small>
            {i.status === 'Closed'
              ? 'Closed'
              : i.acknowledged
                ? 'Acknowledged'
                : 'New · needs attention'}
          </small>
        </div>
        <h3>{title(i)}</h3>
        <p>
          <MapPin size={13} />
          {i.zone}
        </p>
        <div className="teacher-alert-bottom">
          <span>
            {i.date.slice(5)} · {i.time} MYT
          </span>
          <span>
            {i.status === 'Closed'
              ? 'Closed'
              : teacherNeedsReview(i)
                ? 'Verify alert'
                : 'Follow up'}{' '}
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </button>
  );
  return (
    <div className="teacher-stage">
      <div className="teacher-desktop-note">
        <ShieldCheck size={32} />
        <h1>Safety, with you.</h1>
        <p>A focused workspace for the people who look after the school.</p>
        <span>AiWAS · Teacher experience</span>
        <button onClick={onExit}>
          <ArrowLeft size={15} /> School dashboard
        </button>
      </div>
      <div className="teacher-shell">
        <header className="teacher-header">
          <button className="teacher-logo" onClick={() => navigate('Today')}>
            <ShieldCheck size={25} />
            <span>
              AiWAS<small>TEACHER</small>
            </span>
          </button>
          <div className="teacher-header-actions">
            <span className="teacher-demo-chip">Demo</span>
            <button aria-label="Back to school dashboard" onClick={onExit}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="teacher-main">
          {item ? (
            <>
              <button
                className="teacher-back"
                onClick={() => {
                  setSelected(null);
                  setMessage('');
                }}
              >
                <ArrowLeft size={17} /> Back to {tab.toLowerCase()}
              </button>
              <div className="teacher-detail-heading">
                <div>
                  <span className={'badge ' + severityClass(item.severity)}>
                    {item.severity} priority
                  </span>
                  <span className="teacher-id">{item.id}</span>
                </div>
                <h1>{title(item)}</h1>
                <p>
                  <MapPin size={15} />
                  {item.zone} · {item.camera}
                </p>
                <small>
                  {item.date} · {item.time} MYT
                </small>
              </div>
              <div className="teacher-response-status">
                <span>
                  <Radio size={16} />
                  {item.status === 'Closed'
                    ? 'Incident closed'
                    : item.acknowledged
                      ? 'Acknowledged'
                      : 'Awaiting acknowledgement'}
                </span>
                <strong>{item.validation}</strong>
              </div>
              <div
                className="teacher-segments"
                aria-label="Alert detail sections"
              >
                {['Evidence', 'Respond', 'Timeline'].map((t) => (
                  <button
                    aria-pressed={detailTab === t}
                    key={t}
                    onClick={() => setDetailTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {detailTab === 'Evidence' && (
                <>
                  <div className="teacher-evidence">
                    <DemoVideo scene={mediaFor(item.zone, item.category)} />
                  </div>
                  <div className="teacher-info">
                    <Video size={17} />
                    <p>
                      Staged context only. This clip is not evidence of the
                      incident. No live analysis is running.
                    </p>
                  </div>
                  <section className="teacher-section">
                    <h2>What was flagged</h2>
                    <p>{item.description}</p>
                    <div className="teacher-detail-grid">
                      <div>
                        <small>Source</small>
                        <strong>
                          {item.id.startsWith('STAFF-')
                            ? 'Staff report'
                            : 'Simulated alert'}
                        </strong>
                      </div>
                      <div>
                        <small>Assigned to</small>
                        <strong>{item.assigned || 'Unassigned'}</strong>
                      </div>
                    </div>
                  </section>
                  <section className="teacher-section">
                    <h2>Verify the situation</h2>
                    <p>
                      Assess the context before deciding. You can keep the
                      evidence unresolved.
                    </p>
                    {[
                      'I checked the location, time and available context',
                      'I considered whether the scene supports the reported event',
                      'I checked immediate welfare or recorded why it is unknown',
                    ].map((text, index) => (
                      <label
                        className="teacher-check"
                        key={text}
                        htmlFor={'teacher-check-' + index}
                      >
                        <Checkbox
                          id={'teacher-check-' + index}
                          checked={checks[index]}
                          onCheckedChange={(v) =>
                            setChecks((c) =>
                              c.map((x, j) => (j === index ? v === true : x)),
                            )
                          }
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                    <label className="teacher-field">
                      Verification outcome
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        disabled={item.status === 'Closed'}
                      >
                        <option value="">Choose an outcome</option>
                        <option value="Confirmed">
                          Confirmed event · follow-up required
                        </option>
                        <option value="False alarm">
                          False alarm · explain the context
                        </option>
                        <option value="Insufficient evidence">
                          Insufficient evidence · keep reviewing
                        </option>
                      </select>
                    </label>
                    <label className="teacher-field">
                      Review note
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What did you observe, and what should happen next?"
                        rows={4}
                      />
                    </label>
                    <button
                      className="teacher-primary"
                      disabled={item.status === 'Closed'}
                      onClick={() => apply('verify', { decision, checks })}
                    >
                      <ShieldCheck size={17} /> Save verification
                    </button>
                    <p className="teacher-caption">
                      Verification does not issue a disciplinary decision or
                      automatically close the case.
                    </p>
                  </section>
                </>
              )}
              {detailTab === 'Respond' && (
                <>
                  <section className="teacher-section">
                    <h2>Coordinate the response</h2>
                    <p>
                      Record your status so the school team can follow the
                      response.
                    </p>
                    <div className="teacher-action-grid">
                      <button
                        disabled={item.status === 'Closed'}
                        onClick={() => apply('claim')}
                      >
                        <UserRound />
                        Take ownership
                      </button>
                      <button
                        disabled={
                          !item.acknowledged || item.status === 'Closed'
                        }
                        onClick={() => apply('on-way')}
                      >
                        <ArrowUpRight />
                        On my way
                      </button>
                      <button
                        disabled={
                          !item.acknowledged || item.status === 'Closed'
                        }
                        onClick={() => apply('on-site')}
                      >
                        <MapPin />
                        At the location
                      </button>
                      <button
                        disabled={item.status === 'Closed'}
                        onClick={() => {
                          setMessage('');
                          setDialog('handover');
                        }}
                      >
                        <Send />
                        Hand over
                      </button>
                    </div>
                    <button
                      className="teacher-support"
                      disabled={item.status === 'Closed'}
                      onClick={() => {
                        setMessage('');
                        setDialog('support');
                      }}
                    >
                      <PhoneCall size={18} />
                      <span>
                        Request school support
                        <small>Record a request to the duty lead</small>
                      </span>
                      <ChevronRight size={17} />
                    </button>
                  </section>
                  <section className="teacher-section">
                    <h2>
                      {item.status === 'Closed'
                        ? 'Reopen for review'
                        : 'Follow-up & resolution'}
                    </h2>
                    <label className="teacher-field">
                      Action or resolution note
                      <textarea
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Record the action taken, welfare check and next steps…"
                      />
                    </label>
                    {item.status === 'Closed' ? (
                      <button
                        className="teacher-primary"
                        onClick={() => apply('reopen')}
                      >
                        Reopen incident
                      </button>
                    ) : (
                      <>
                        <button
                          className="teacher-secondary"
                          onClick={() => apply('note')}
                        >
                          Add follow-up note
                        </button>
                        <button
                          className="teacher-primary"
                          disabled={needsReview(item)}
                          onClick={() => apply('close')}
                        >
                          <CheckCheck size={17} /> Close with resolution
                        </button>
                        {needsReview(item) && (
                          <p className="teacher-caption">
                            Complete the evidence decision before closing.
                          </p>
                        )}
                      </>
                    )}
                  </section>
                </>
              )}
              {detailTab === 'Timeline' && (
                <section className="teacher-section">
                  <h2>Incident timeline</h2>
                  <p>Recorded actions and review decisions for this alert.</p>
                  <ol className="teacher-timeline">
                    {item.history.map((h, index) => (
                      <li key={index}>
                        <i />
                        <div>
                          <strong>{h.text}</strong>
                          <p>
                            {h.actor} · {h.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <output className="teacher-feedback">{message}</output>
              {!item.acknowledged && item.status !== 'Closed' && (
                <div className="teacher-sticky-action">
                  <button
                    className="teacher-primary"
                    onClick={() => apply('acknowledge')}
                  >
                    <Check size={18} /> Acknowledge alert
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {tab === 'Today' && (
                <>
                  <div className="teacher-greeting">
                    <span>{school}</span>
                    <h1>
                      Hello, {teacher.split(' ')[0]}.<br />
                      <em>Let’s keep today safe.</em>
                    </h1>
                    <button
                      className={'teacher-duty ' + (available ? 'active' : '')}
                      onClick={() => setAvailable((v) => !v)}
                    >
                      <i />
                      {available
                        ? 'Available for duty'
                        : 'Availability paused'}{' '}
                      <ChevronRight size={12} />
                    </button>
                  </div>
                  <section className="teacher-summary">
                    <div>
                      <span>Awaiting your team</span>
                      <strong>
                        {pending.length}
                        <small>alerts to verify</small>
                      </strong>
                    </div>
                    <button
                      onClick={() => {
                        setFilter('Needs review');
                        navigate('Alerts');
                      }}
                    >
                      <ArrowUpRight size={23} />
                      <span>Open inbox</span>
                    </button>
                    <div className="teacher-summary-footer">
                      <span>{urgent.length} high-priority cases</span>
                      <span>{mine.length} assigned to you</span>
                    </div>
                  </section>
                  <div className="teacher-quick-actions">
                    <button
                      onClick={() => {
                        setMessage('');
                        setDialog('report');
                      }}
                    >
                      <Plus size={20} />
                      <span>Report a concern</span>
                    </button>
                    <button onClick={() => navigate('My work')}>
                      <ClipboardCheck size={20} />
                      <span>My follow-ups</span>
                    </button>
                  </div>
                  <div className="teacher-section-heading">
                    <h2>Needs attention</h2>
                    <button onClick={() => navigate('Alerts')}>
                      See all <ChevronRight size={14} />
                    </button>
                  </div>
                  {pending.length ? (
                    pending.slice(0, 2).map((i) => card(i))
                  ) : (
                    <div className="teacher-empty">
                      <ShieldCheck />
                      <h2>You’re up to date</h2>
                      <p>No alerts currently need verification.</p>
                    </div>
                  )}
                  <div className="teacher-reassurance">
                    <ShieldCheck />
                    <div>
                      <strong>Observe. Verify. Support.</strong>
                      <p>
                        Your judgement matters. AiWAS helps organise the
                        response; people make the decisions.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {tab === 'Alerts' && (
                <>
                  <div className="teacher-page-title">
                    <span>SCHOOL ALERT INBOX</span>
                    <h1>
                      Every alert.
                      <br />A clear next step.
                    </h1>
                    <p>All alerts for {school}, ordered by priority.</p>
                  </div>
                  <label className="teacher-search">
                    <Search size={17} />
                    <input
                      aria-label="Search teacher alerts"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search a location or incident"
                    />
                  </label>
                  <div className="teacher-filter-row">
                    <select
                      aria-label="Teacher alert filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      {[
                        'Needs review',
                        'Assigned to me',
                        'All alerts',
                        'Closed',
                      ].map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Teacher alert priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {[
                        'All priorities',
                        'Critical',
                        'High',
                        'Medium',
                        'Low',
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="teacher-section-heading">
                    <h2>
                      {shown.length} {shown.length === 1 ? 'alert' : 'alerts'}
                    </h2>
                    <span>Priority first</span>
                  </div>
                  {shown.map((i) => card(i, true))}
                  {!shown.length && (
                    <div className="teacher-empty">
                      <Search />
                      <h2>No matching alerts</h2>
                      <p>Try another filter or search.</p>
                      <button
                        className="teacher-secondary"
                        onClick={() => {
                          setQuery('');
                          setFilter('All alerts');
                          setPriority('All priorities');
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </>
              )}
              {tab === 'My work' && (
                <>
                  <div className="teacher-page-title">
                    <span>YOUR RESPONSE WORKSPACE</span>
                    <h1>
                      Follow through,
                      <br />
                      with confidence.
                    </h1>
                    <p>
                      Assigned cases stay here until they are resolved or handed
                      over.
                    </p>
                  </div>
                  <div className="teacher-work-count">
                    <ClipboardCheck size={24} />
                    <strong>{mine.length}</strong>
                    <span>active assignments</span>
                  </div>
                  {mine.map((i) => card(i, true))}
                  {!mine.length && (
                    <div className="teacher-empty">
                      <CheckCheck />
                      <h2>No active assignments</h2>
                      <p>
                        Open an alert and take ownership when you are ready to
                        respond.
                      </p>
                    </div>
                  )}
                  <button
                    className="teacher-secondary"
                    onClick={() => {
                      setFilter('All alerts');
                      navigate('Alerts');
                    }}
                  >
                    Browse school alerts
                  </button>
                </>
              )}
              {tab === 'Activity' && (
                <>
                  <div className="teacher-page-title">
                    <span>YOUR AUDIT TRAIL</span>
                    <h1>
                      Small actions.
                      <br />A safer school.
                    </h1>
                    <p>
                      Your acknowledgements, notes and decisions are recorded
                      with the incident.
                    </p>
                  </div>
                  {activity.length ? (
                    activity.map((h, index) => (
                      <button
                        className="teacher-activity"
                        key={index}
                        onClick={() => open(h.incident)}
                      >
                        <span className="teacher-activity-icon">
                          <Check size={17} />
                        </span>
                        <div>
                          <strong>{h.text}</strong>
                          <p>
                            {h.incident.zone} · {h.time}
                          </p>
                          <small>{h.incident.id}</small>
                        </div>
                        <ChevronRight size={15} />
                      </button>
                    ))
                  ) : (
                    <div className="teacher-empty">
                      <History />
                      <h2>Your activity starts here</h2>
                      <p>
                        Acknowledge or review an alert to record your first
                        action.
                      </p>
                    </div>
                  )}
                </>
              )}
              {tab === 'Profile' && (
                <>
                  <div className="teacher-profile">
                    <div>
                      {teacher
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <h1>{teacher}</h1>
                    <p>Teacher · incident verification</p>
                    <span>{school}</span>
                  </div>
                  <section className="teacher-section">
                    <h2>Duty & notifications</h2>
                    <label
                      className="teacher-check"
                      htmlFor="teacher-available"
                    >
                      <Checkbox
                        id="teacher-available"
                        checked={available}
                        onCheckedChange={(v) => setAvailable(v === true)}
                      />
                      <span>Available for school response</span>
                    </label>
                    <label className="teacher-check" htmlFor="teacher-routine">
                      <Checkbox
                        id="teacher-routine"
                        checked={routine}
                        onCheckedChange={(v) => {
                          setRoutine(v === true);
                          setPrefSaved(false);
                        }}
                      />
                      <span>Include routine update previews</span>
                    </label>
                    <div className="teacher-info">
                      <Bell size={17} />
                      <p>
                        Critical alerts remain visible. These preferences do not
                        control real push notifications.
                      </p>
                    </div>
                    <button
                      className="teacher-secondary"
                      onClick={() => setPrefSaved(true)}
                    >
                      Save preferences
                    </button>
                    {prefSaved && (
                      <output className="teacher-feedback">
                        Saved for this teacher preview.
                      </output>
                    )}
                  </section>
                  <section className="teacher-section">
                    <h2>School access</h2>
                    <p>
                      Your inbox is scoped to this school. School administrators
                      manage team access.
                    </p>
                    <div className="teacher-info">
                      <LockKeyhole size={17} />
                      <p>
                        This is a web-app demonstration, not authenticated
                        access. No real pupil data, live camera feeds or
                        external messages are connected.
                      </p>
                    </div>
                    <button className="teacher-secondary" onClick={onExit}>
                      Return to school dashboard
                    </button>
                  </section>
                </>
              )}
            </>
          )}
          <p className="teacher-session-note">
            Demonstration · Changes last for this page session
          </p>
        </main>
        <nav className="teacher-bottom-nav" aria-label="Teacher app navigation">
          {[
            ['Today', House],
            ['Alerts', Bell],
            ['My work', ClipboardCheck],
            ['Activity', History],
            ['Profile', UserRound],
          ].map(([name, Icon]) => {
            const I = Icon as typeof House;
            return (
              <button
                key={String(name)}
                aria-current={tab === name ? 'page' : undefined}
                onClick={() => navigate(String(name))}
              >
                <span>
                  <I size={21} />
                  {name === 'Alerts' && pending.length > 0 && (
                    <i>{pending.length}</i>
                  )}
                </span>
                <small>{String(name)}</small>
              </button>
            );
          })}
        </nav>
      </div>
      <Dialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
      >
        <DialogContent className="teacher-dialog">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'report'
                ? 'Report a school concern'
                : dialog === 'support'
                  ? 'Request school support'
                  : 'Hand over this alert'}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'report'
                ? 'Create a fictional report for your school team.'
                : 'This records a demonstration action. No call, notification or message is sent.'}
            </DialogDescription>
          </DialogHeader>
          {dialog === 'report' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const field = (key: string) => {
                  const value = data.get(key);
                  return typeof value === 'string' ? value : '';
                };
                const description = field('description').trim(),
                  category = field('category'),
                  zone = field('zone').trim();
                if (description.length < 10 || !zone) {
                  setMessage(
                    'Include a location and at least 10 characters of detail.',
                  );
                  return;
                }
                const now = new Date(),
                  id = 'STAFF-TEACHER-' + crypto.randomUUID().slice(0, 8);
                const report: Incident = {
                  id,
                  school,
                  category,
                  zone,
                  block: 'Staff observation',
                  camera: 'Staff report',
                  severity: field('severity'),
                  confidence: 0,
                  time: now.toLocaleTimeString('en-GB', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  date: now.toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Kuala_Lumpur',
                  }),
                  status: 'Open',
                  validation: 'Pending',
                  assigned: teacher,
                  acknowledged: true,
                  description,
                  history: [
                    {
                      text: 'Teacher concern reported · fictional demonstration',
                      actor: teacher,
                      time: 'Now',
                    },
                  ],
                };
                onReport(report);
                setDialog(null);
                open(report);
              }}
            >
              <label className="teacher-field">
                Concern type
                <select name="category">
                  {[
                    'Welfare concern',
                    'Possible physical altercation',
                    'Crowd concern',
                    'Access concern',
                    'Other school safety concern',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="teacher-field">
                Location
                <input
                  name="zone"
                  required
                  placeholder="e.g. Block A corridor"
                />
              </label>
              <label className="teacher-field">
                Priority
                <select name="severity">
                  {['Medium', 'High', 'Critical', 'Low'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="teacher-field">
                What needs attention?
                <textarea
                  name="description"
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Use fictional details. Describe the observation and immediate action."
                />
              </label>
              <button className="teacher-primary" type="submit">
                Create school report
              </button>
            </form>
          ) : (
            <>
              <p className="teacher-caption">
                {item ? title(item) : 'Selected alert'} · {item?.zone}
              </p>
              {dialog === 'handover' && (
                <label className="teacher-field">
                  Receiving team member
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  >
                    <option value="">Choose a colleague</option>
                    {users
                      .filter(
                        (u) =>
                          u.active && u.school === school && u.name !== teacher,
                      )
                      .map((u) => (
                        <option key={u.email}>{u.name}</option>
                      ))}
                  </select>
                </label>
              )}
              <label className="teacher-field">
                {dialog === 'support' ? 'Support needed' : 'Handover context'}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Explain the situation and what the next responder needs to know."
                />
              </label>
              <button
                className="teacher-primary"
                onClick={() =>
                  apply(dialog === 'support' ? 'support' : 'handover', {
                    recipient,
                  })
                }
              >
                {dialog === 'support'
                  ? 'Record support request'
                  : 'Record handover'}
              </button>
            </>
          )}
          <output className="teacher-feedback">{message}</output>
        </DialogContent>
      </Dialog>
    </div>
  );
}
