'use client';
import { useEffect, useEffectEvent, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  FileText,
  LockKeyhole,
  MapPin,
  Play,
  Plus,
  Search,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ReportingPreview } from './reporting-preview';
import { CameraStill, DemoVideo } from './camera-media';
import {
  conceptModules,
  fieldsForTopic,
  makeConceptSeeds,
  conceptAdvanceError,
  conceptFormError,
  type ConceptModule,
  type ConceptRecord,
} from './concept-data';
import { csvCell } from './workflow';
import type { Incident, User } from './data';
const stamp = () =>
  new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
  });
function FeaturePanel({
  record,
  module,
  onChange,
}: {
  record: ConceptRecord;
  module: ConceptModule;
  onChange: (patch: Record<string, string>, event: string) => void;
}) {
  const [message, setMessage] = useState('');
  if (module.id === 'hostel-operations') {
    const names = [
      'Resident 01',
      'Resident 02',
      'Resident 03',
      'Resident 04',
      'Resident 05',
      'Resident 06',
    ];
    return (
      <section className="concept-special">
        <h3>
          Roll-call reconciliation{' '}
          <span className="badge blue">Fictional sample</span>
        </h3>
        <p>
          Check each resident against approved leave. Unchecked records remain
          unresolved.
        </p>
        <div className="concept-roll">
          {names.map((n, i) => {
            const status =
              record.values[`roll${i}`] ||
              (i === 4 ? 'Approved leave' : 'Not checked');
            return (
              <div key={n}>
                <span>{n}</span>
                <select
                  aria-label={`${n} roll call`}
                  value={status}
                  onChange={(e) =>
                    onChange(
                      { [`roll${i}`]: e.target.value },
                      `${n}: ${e.target.value}`,
                    )
                  }
                >
                  {[
                    'Not checked',
                    'Present — staff checked',
                    'Approved leave',
                    'Welfare check requested',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <div className="concept-inline-actions">
          <button
            className="btn"
            onClick={() =>
              onChange(
                { lastRound: stamp() },
                'Welfare round recorded by demo staff',
              )
            }
          >
            Record welfare round
          </button>
          <span>Last round: {record.values.lastRound || 'Not recorded'}</span>
        </div>
      </section>
    );
  }
  if (module.id === 'emergency-centre')
    return (
      <section className="concept-special">
        <h3>People & responder accountability</h3>
        <p>
          Exercise only. Acknowledgement and headcounts are entered by staff.
        </p>
        <div className="concept-roll">
          {[
            'Block A · 24 people',
            'Assembly hall · 32 people',
            'Visitors · 2 people',
          ].map((n, i) => (
            <div key={n}>
              <span>{n}</span>
              <button
                className={`btn ${record.values[`muster${i}`] ? '' : 'primary'}`}
                onClick={() =>
                  onChange(
                    {
                      [`muster${i}`]: record.values[`muster${i}`]
                        ? ''
                        : 'Confirmed',
                    },
                    `${n}: ${record.values[`muster${i}`] ? 'recheck requested' : 'accounted for in exercise'}`,
                  )
                }
              >
                {record.values[`muster${i}`]
                  ? 'Accounted for · recheck'
                  : 'Confirm headcount'}
              </button>
            </div>
          ))}
        </div>
        <div className="concept-delivery">
          <span>
            <i /> School response team
          </span>
          <strong>{record.values.delivery || 'Not acknowledged'}</strong>
          <button
            className="btn"
            onClick={() =>
              onChange(
                { delivery: 'Simulated acknowledgement received' },
                'Simulated responder acknowledgement. No message sent.',
              )
            }
          >
            Simulate acknowledgement
          </button>
        </div>
        <button
          className="btn"
          onClick={() =>
            onChange(
              { family: `Simulated attempt ${stamp()}` },
              'Family contact attempt recorded in exercise',
            )
          }
        >
          Record family contact attempt
        </button>
        <p className="help-text">
          {record.values.family || 'No contact attempt recorded'} · No emergency
          service is contacted.
        </p>
      </section>
    );
  if (module.id === 'movement-visitors')
    return (
      <section className="concept-special">
        <h3>Pass & handover ledger</h3>
        <div className="concept-pass">
          <ShieldCheck size={30} />
          <div>
            <strong>
              {record.values.person || 'Fictional visitor / group'}
            </strong>
            <p>{record.values.purpose}</p>
            <code>{record.id}</code>
          </div>
          <span className="badge blue">SAMPLE PASS</span>
        </div>
        <div className="concept-inline-actions">
          {[
            'Authority checked',
            'Arrival recorded',
            'Handover recorded',
            'Departure recorded',
          ].map((s, i) => (
            <button
              key={s}
              className="btn"
              disabled={
                !!record.values[`gate${i}`] ||
                (i > 0 && !record.values[`gate${i - 1}`])
              }
              onClick={() =>
                onChange({ [`gate${i}`]: stamp() }, `${s} by demo staff`)
              }
            >
              {record.values[`gate${i}`] ? (
                <Check size={14} />
              ) : (
                <Plus size={14} />
              )}{' '}
              {s}
            </button>
          ))}
        </div>
        <p className="help-text">
          This sample pass grants no physical access. Collection authority must
          be verified against school records.
        </p>
      </section>
    );
  if (module.id === 'safeguarding')
    return (
      <section className="concept-special">
        <h3>
          <LockKeyhole size={16} /> Protection & safe contact
        </h3>
        <p>
          This screen contains invented records. Production access must be
          limited to authorised safeguarding staff.
        </p>
        <label className="field">
          Safe follow-up / referral note
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Record the agreed safe contact or independent referral…"
          />
        </label>
        <button
          className="btn"
          disabled={message.trim().length < 10}
          onClick={() => {
            onChange(
              { support: message.trim() },
              `Protection update: ${message.trim()}`,
            );
            setMessage('');
          }}
        >
          Record protection update
        </button>
        <p className="help-text">
          Latest support action: {record.values.support || 'Not yet recorded'}
        </p>
        <button
          className="btn"
          onClick={() =>
            onChange(
              { referral: 'Independent school reviewer' },
              'Independent review requested in demonstration',
            )
          }
        >
          Route to independent reviewer
        </button>
      </section>
    );
  if (module.id === 'activities-continuity')
    return (
      <section className="concept-special">
        <h3>Conditions & decision record</h3>
        <div className="concept-weather">
          <div>
            <strong>{record.values.weather || '36°C'}</strong>
            <span>Sample conditions · no live feed</span>
          </div>
          <select
            aria-label="Sample weather condition"
            value={record.values.weather || '36°C'}
            onChange={(e) =>
              onChange(
                { weather: e.target.value },
                `Sample condition changed to ${e.target.value}`,
              )
            }
          >
            {['36°C', '29°C', 'Heavy rain warning', 'Network outage'].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </div>
        <label className="field">
          Operational decision
          <select
            value={record.values.decision || 'Awaiting review'}
            onChange={(e) =>
              onChange(
                { decision: e.target.value },
                `Operational decision: ${e.target.value}`,
              )
            }
          >
            {[
              'Awaiting review',
              'Postpone activity',
              'Use alternative venue',
              'School closure exercise',
              'Proceed with approved support plan',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <p className="help-text">
          School-approved guidance and responsible staff determine the decision;
          this sample weather does not trigger real notices.
        </p>
      </section>
    );
  if (module.id === 'pilot-governance')
    return (
      <section className="concept-special">
        <h3>Pilot review checkpoint</h3>
        <p>
          Record the reviewer’s finding and update the supporting fields in
          Record details. This records a demonstration review, not external
          approval.
        </p>
        <label>
          Review finding
          <textarea
            aria-label="Pilot review finding"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Summarise the remaining issue or reviewed evidence…"
          />
        </label>
        <button
          className="btn"
          disabled={message.trim().length < 10}
          onClick={() => {
            onChange(
              { checkpoint: message.trim() },
              `Pilot checkpoint: ${message.trim()}`,
            );
            setMessage('');
          }}
        >
          Record review checkpoint
        </button>
        <p>Latest checkpoint: {record.values.checkpoint || 'Not recorded'}</p>
      </section>
    );
  if (module.id === 'platform-readiness')
    return (
      <section className="concept-special">
        <h3>Integration test bench</h3>
        <div className="concept-delivery">
          <WifiOff size={20} />
          <span>Current simulated service</span>
          <strong>{record.values.health || 'Not connected'}</strong>
        </div>
        <div className="concept-inline-actions">
          {[
            'Healthy sample',
            'Stale frames',
            'Connection lost',
            'Recovery verified',
          ].map((x) => (
            <button
              className="btn"
              key={x}
              onClick={() => onChange({ health: x }, `Simulation: ${x}`)}
            >
              {x}
            </button>
          ))}
        </div>
        <p className="help-text">
          No credential, real invitation, deletion or external integration is
          created by these controls.
        </p>
        <div className="concept-policy">
          <strong>Privacy defaults</strong>
          <span>
            School-scoped access · restricted cases · controlled exports
          </span>
          <span>
            Facial recognition / appearance-based authorisation: disabled
          </span>
        </div>
      </section>
    );
  return null;
}
function RecordDetailEditor({
  record,
  definition,
  onSave,
}: {
  record: ConceptRecord;
  definition: ConceptModule;
  onSave: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState(record.values),
    [saved, setSaved] = useState(false);
  return (
    <form
      className="operations-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(values);
        setSaved(true);
      }}
    >
      {fieldsForTopic(definition, record.topic).map((f) => (
        <label className="field" key={f.key}>
          {f.label}
          {f.options ? (
            <select
              required={f.required}
              value={values[f.key] || ''}
              onChange={(e) => {
                setValues({ ...values, [f.key]: e.target.value });
                setSaved(false);
              }}
            >
              <option value="">Choose an option</option>
              {f.options.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          ) : (
            <input
              required={f.required}
              type={f.type || 'text'}
              value={values[f.key] || ''}
              onChange={(e) => {
                setValues({ ...values, [f.key]: e.target.value });
                setSaved(false);
              }}
            />
          )}
        </label>
      ))}
      <button className="btn primary" type="submit">
        {saved ? 'Details saved' : 'Save record details'}
      </button>
    </form>
  );
}
export function ConceptWorkspace({
  view,
  school,
  schools,
  users,
  privileged,
  onAlert,
}: {
  view: string;
  school: string;
  schools: string[];
  users: User[];
  privileged: boolean;
  onAlert: (i: Incident) => void;
}) {
  const [records, setRecords] = useState(() => makeConceptSeeds(schools));
  const [selectedId, setSelectedId] = useState<string | null>(null),
    [create, setCreate] = useState(false),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('Active'),
    [note, setNote] = useState(''),
    [error, setError] = useState(''),
    [tab, setTab] = useState('register'),
    [scope, setScope] = useState(`${school}|${view}`),
    [topic, setTopic] = useState(''),
    [run, setRun] = useState<{
      start: number;
      module: string;
      school: string;
    } | null>(null),
    [elapsed, setElapsed] = useState(0),
    [result, setResult] = useState('');
  const definition = conceptModules.find((m) => m.title === view);
  if (scope !== `${school}|${view}`) {
    setScope(`${school}|${view}`);
    setSelectedId(null);
    setCreate(false);
    setQuery('');
    setFilter('Active');
    setNote('');
    setError('');
    setTab('register');
    setTopic('');
    setRun(null);
    setElapsed(0);
    setResult('');
  }
  const permitted = !!definition && (!definition.scope || privileged);
  const items = records.filter(
    (r) => r.school === school && r.module === definition?.id,
  );
  const selected = items.find((r) => r.id === selectedId);
  const finishRun = useEffectEvent(() => {
    if (!run) return;
    const m = conceptModules.find((x) => x.id === run.module);
    if (!m) return;
    const sample = m.samples[0];
    const id = `SIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const record: ConceptRecord = {
      ...sample,
      id,
      module: m.id,
      school: run.school,
      owner: m.scope ? 'Daniel Tan' : 'Nadia Ahmad',
      due: '2026-09-14',
      stage: 0,
      checked: [],
      history: [
        {
          time: stamp(),
          text: 'Ten-second demonstration completed. Synthetic scenario; no model or notification service used.',
        },
      ],
    };
    setRecords((all) => [record, ...all]);
    setResult(id);
    setRun(null);
    onAlert({
      id,
      school: run.school,
      category: m.id === 'safeguarding' ? 'Confidential concern' : sample.topic,
      zone: sample.location,
      block: 'Demo workflow',
      camera: 'Workflow simulation',
      severity: sample.priority,
      confidence: 0,
      date: new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
      }),
      time: stamp(),
      status: 'Open',
      validation: 'Pending',
      assigned: record.owner,
      description:
        m.id === 'safeguarding'
          ? 'Fictional restricted concern. Review the safeguarding workspace.'
          : `Simulated workflow event: ${sample.title}. No live detection or notification.`,
      history: [
        {
          time: stamp(),
          actor: 'Scenario simulator',
          text: 'Synthetic workflow event created after a ten-second showcase.',
        },
      ],
    });
  });
  useEffect(() => {
    if (!run) return;
    const timer = setInterval(() => {
      const seconds = Math.min(10, (Date.now() - run.start) / 1000);
      setElapsed(seconds);
      if (seconds >= 10) {
        clearInterval(timer);
        finishRun();
      }
    }, 100);
    return () => clearInterval(timer);
  }, [run]);
  if (!definition || !permitted) return null;
  const active = items.filter((r) => r.stage < definition.stages.length - 1);
  const shown = items.filter(
    (r) =>
      (filter === 'All' ||
        (filter === 'Completed'
          ? r.stage === definition.stages.length - 1
          : r.stage < definition.stages.length - 1)) &&
      `${r.title} ${r.topic} ${r.location} ${r.owner}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function update(patch: Partial<ConceptRecord>, event: string) {
    if (!selected) return;
    setRecords((all) =>
      all.map((r) =>
        r.id === selected.id && r.school === school
          ? {
              ...r,
              ...patch,
              history: [...r.history, { time: stamp(), text: event }],
            }
          : r,
      ),
    );
    setError('');
  }
  function createRecord(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!definition) return;
    const fd = new FormData(e.currentTarget);
    const get = (key: string) => {
      const v = fd.get(key);
      return typeof v === 'string' ? v.trim() : '';
    };
    if (get('title').length < 3 || get('details').length < 10) {
      setError('Add a clear title and at least 10 characters of detail.');
      return;
    }
    if (
      fieldsForTopic(definition, get('topic')).some(
        (f) => f.required && !get(f.key),
      )
    ) {
      setError('Complete the required workflow fields.');
      return;
    }
    const values = Object.fromEntries(
      Array.from(fd.keys()).map((key) => [key, get(key)]),
    );
    const issue = conceptFormError(
      definition,
      values,
      users
        .filter(
          (u) =>
            u.active && (u.school === school || u.school === 'All PoC schools'),
        )
        .map((u) => u.name),
    );
    if (issue) {
      setError(issue);
      return;
    }
    const id = `CASE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    setRecords((all) => [
      {
        id,
        module: definition.id,
        school,
        title: get('title'),
        topic: get('topic'),
        location: get('location'),
        priority: get('priority'),
        owner: get('owner'),
        due: get('due'),
        stage: 0,
        details: get('details'),
        values: Object.fromEntries(
          fieldsForTopic(definition, get('topic')).map((f) => [
            f.key,
            get(f.key),
          ]),
        ),
        checked: [],
        history: [
          { time: stamp(), text: 'Fictional record created by demo staff.' },
        ],
      },
      ...all,
    ]);
    setCreate(false);
    setSelectedId(id);
    setNote('');
    setError('');
  }
  function exportRegister() {
    const csv = [
      ['DEMONSTRATION DATA — ' + school],
      ['ID', 'Topic', 'Title', 'Priority', 'Stage', 'Owner', 'Due'],
      ...shown.map((r) => [
        r.id,
        r.topic,
        definition?.id === 'safeguarding'
          ? 'Restricted concern — details excluded'
          : r.title,
        r.priority,
        definition?.stages[r.stage] || '',
        r.owner,
        r.due,
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiwas-${definition?.id}-demo.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="concept-workspace">
      <div className="concept-command">
        <div className="concept-command-copy">
          <span className="concept-kicker">
            {definition.scope ? 'PLATFORM CONTROL' : 'SCHOOL OPERATIONS'} <i />{' '}
            FICTIONAL WORKSPACE
          </span>
          <h2>{definition.subtitle}</h2>
          <div className="concept-command-actions">
            <button
              className="btn primary"
              onClick={() => {
                setCreate(true);
                setError('');
              }}
            >
              <Plus size={16} />
              {definition.action}
            </button>
            <button className="btn" onClick={() => setTab('showcase')}>
              <Play size={15} />
              See the workflow
            </button>
          </div>
        </div>
        <div className="concept-command-image">
          <CameraStill scene={definition.scene} overlay={false} />
          <span>
            {definition.id === 'safeguarding'
              ? 'Public-area context only'
              : 'Staged campus scene'}
          </span>
        </div>
      </div>
      <div className="concept-stats">
        {[
          ['Active records', active.length, 'Needs action'],
          [
            'High priority',
            active.filter((r) => ['Critical', 'High'].includes(r.priority))
              .length,
            'Human response required',
          ],
          [
            'Completed',
            items.length - active.length,
            'Verified workflow steps',
          ],
          [
            'Available workflows',
            definition.topics.length,
            'Select a type when creating',
          ],
        ].map(([l, n, h]) => (
          <div key={l}>
            <span>{l}</span>
            <strong>{n}</strong>
            <small>{h}</small>
          </div>
        ))}
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="section-tabs">
          <TabsTrigger value="register">Work register</TabsTrigger>
          <TabsTrigger value="showcase">Scenario & media</TabsTrigger>
          {definition.scope && (
            <TabsTrigger value="aggregate">Aggregate preview</TabsTrigger>
          )}
          {definition.id === 'safeguarding' && (
            <TabsTrigger value="reporting">Pupil & family portal</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="register">
          <div className="toolbar">
            <div className="concept-search">
              <Search size={16} />
              <input
                aria-label="Search workflow records"
                placeholder="Search records, locations or owners…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Workflow status filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {['Active', 'Completed', 'All'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <button className="btn push-right" onClick={exportRegister}>
              <Download size={15} />
              Export register
            </button>
          </div>
          <div className="concept-register">
            {shown.map((r) => (
              <button
                className="concept-record"
                key={r.id}
                onClick={() => {
                  setSelectedId(r.id);
                  setNote('');
                  setError('');
                }}
              >
                <span
                  className={`concept-priority ${r.priority.toLowerCase()}`}
                />
                <div className="concept-record-main">
                  <span className="concept-record-topic">
                    {definition.id === 'safeguarding' && (
                      <LockKeyhole size={12} />
                    )}{' '}
                    {r.topic} · {r.id}
                  </span>
                  <strong>{r.title}</strong>
                  <span>
                    <MapPin size={12} />
                    {r.location} <i />
                    {r.owner}
                  </span>
                </div>
                <div className="concept-record-state">
                  <span className="badge blue">
                    {definition.stages[r.stage]}
                  </span>
                  <small>Due {r.due}</small>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
            {!shown.length && (
              <div className="response-empty">
                <FileText size={26} />
                <h3>No matching records</h3>
                <p>
                  Change the filters or create a record to start this workflow.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="showcase">
          <div className="concept-showcase">
            <section className="panel">
              <div className="panel-title">
                <div>
                  <h2>Scenario preview</h2>
                  <p>{definition.samples[0].title}</p>
                </div>
                <span className="badge blue">SIMULATED</span>
              </div>
              <DemoVideo scene={definition.scene} />
              <p className="concept-media-note">{definition.mediaNote}</p>
              <div className="concept-simulation">
                <div className="concept-simulation-track">
                  <span style={{ width: `${elapsed * 10}%` }} />
                </div>
                <div>
                  <strong>
                    {run
                      ? `${elapsed.toFixed(1)} / 10 seconds`
                      : result
                        ? 'Sample event created'
                        : 'Ready to demonstrate'}
                  </strong>
                  <button
                    className="btn primary"
                    disabled={!!run}
                    onClick={() => {
                      setElapsed(0);
                      setResult('');
                      setRun({
                        start: Date.now(),
                        module: definition.id,
                        school,
                      });
                    }}
                  >
                    <Play size={15} />
                    {run ? 'Scenario running' : 'Run 10-second scenario'}
                  </button>
                </div>
                <p>
                  Illustrates receipt → assessment → alert. Manual emergencies
                  can be activated immediately. No AI model is running.
                </p>
                {result && (
                  <button
                    className="btn"
                    onClick={() => {
                      setSelectedId(result);
                      setNote('');
                      setError('');
                    }}
                  >
                    Open created record <ArrowUpRight size={14} />
                  </button>
                )}
              </div>
            </section>
            <section className="panel concept-journey">
              <h2>How staff respond</h2>
              {definition.stages.map((s, i) => (
                <div key={s}>
                  <b>{i + 1}</b>
                  <div>
                    <strong>{s}</strong>
                    <p>
                      {i === 0
                        ? 'A report, observation or connected service starts a record.'
                        : i === definition.stages.length - 1
                          ? 'Document the outcome after the verification checklist is complete.'
                          : definition.checks[
                              Math.min(i - 1, definition.checks.length - 1)
                            ]}
                    </p>
                  </div>
                </div>
              ))}
              <div className="concept-policy">
                <ShieldCheck size={20} />
                <p>
                  Every action has an owner and an audit entry. These controls
                  currently demonstrate the intended service.
                </p>
              </div>
            </section>
          </div>
        </TabsContent>
        {definition.id === 'safeguarding' && (
          <TabsContent value="reporting">
            <ReportingPreview
              key={school}
              school={school}
              onReport={(data) => {
                const id = `REPORT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
                setRecords((all) => [
                  {
                    id,
                    module: definition.id,
                    school,
                    title: `${data.source}: confidential concern`,
                    topic: data.topic,
                    location: 'Reported through portal',
                    priority: 'High',
                    owner: 'Nadia Ahmad',
                    due: '2026-09-14',
                    stage: 0,
                    details: data.message,
                    values: {
                      channel: data.source,
                      contact: data.contact,
                      privacy: 'Designated safeguarding team',
                      referral: 'School safeguarding lead',
                    },
                    checked: [],
                    history: [
                      {
                        time: stamp(),
                        text: 'Fictional report received through pupil / family portal preview.',
                      },
                    ],
                  },
                  ...all,
                ]);
                return id;
              }}
            />
          </TabsContent>
        )}
        {definition.scope && (
          <TabsContent value="aggregate">
            <section className="panel concept-aggregate">
              <div className="panel-title">
                <div>
                  <h2>Approved aggregate reporting concept</h2>
                  <p>
                    Demonstration workflow counts across sample schools. No case
                    details or pupil identities.
                  </p>
                </div>
                <span className="badge blue">READ-ONLY PREVIEW</span>
              </div>
              <div className="concept-aggregate-table">
                <div>
                  <strong>School</strong>
                  <strong>Active workflows</strong>
                  <strong>Completed workflows</strong>
                  <strong>Small-group detail</strong>
                </div>
                {schools.map((name) => {
                  const rows = records.filter((r) => r.school === name);
                  const completed = rows.filter(
                    (r) =>
                      r.stage ===
                      (conceptModules.find((m) => m.id === r.module)?.stages
                        .length || 1) -
                        1,
                  ).length;
                  return (
                    <div key={name}>
                      <span>{name}</span>
                      <strong>{rows.length - completed}</strong>
                      <strong>{completed}</strong>
                      <span>Suppressed in this preview</span>
                    </div>
                  );
                })}
              </div>
              <p className="concept-media-note">
                This demonstrates a future authorised aggregate view. It does
                not publish government reports or grant authorities access to
                school records. Totals describe sample workflow records, not
                real incident rates.
              </p>
            </section>
          </TabsContent>
        )}
      </Tabs>
      <div className="concept-session-note">
        <ShieldCheck size={14} /> Fictional data · Changes last for this page
        session · No external messages, credentials or physical controls are
        issued.
      </div>
      <Dialog open={create} onOpenChange={setCreate}>
        <DialogContent className="operations-dialog">
          <DialogHeader>
            <DialogTitle>{definition.action}</DialogTitle>
            <DialogDescription>
              {school} · Use invented information only
            </DialogDescription>
          </DialogHeader>
          <form className="operations-form" onSubmit={createRecord}>
            <div className="operations-fields">
              <label className="field">
                Workflow type
                <select
                  name="topic"
                  value={topic || definition.topics[0]}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {definition.topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Priority
                <select name="priority" defaultValue="Medium">
                  {['Low', 'Medium', 'High', 'Critical'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              Title
              <input
                name="title"
                required
                minLength={3}
                maxLength={140}
                placeholder="Describe the concern or planned action"
              />
            </label>
            <div className="operations-fields">
              <label className="field">
                Location
                <input
                  name="location"
                  required
                  defaultValue={definition.samples[0].location}
                />
              </label>
              <label className="field">
                Owner
                <select name="owner" required>
                  {[
                    ...new Set(
                      users
                        .filter(
                          (u) =>
                            u.active &&
                            (u.school === school ||
                              u.school === 'All PoC schools'),
                        )
                        .map((u) => u.name),
                    ),
                  ].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Review / due date
                <input
                  type="date"
                  name="due"
                  required
                  defaultValue="2026-09-14"
                />
              </label>
            </div>
            {fieldsForTopic(definition, topic || definition.topics[0]).map(
              (f) => (
                <label className="field" key={f.key}>
                  {f.label}
                  {f.type === 'select' ? (
                    <select name={f.key} required={f.required}>
                      {f.options?.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={f.key}
                      type={f.type || 'text'}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  )}
                </label>
              ),
            )}
            <label className="field">
              Details / planned response
              <textarea
                name="details"
                rows={3}
                required
                minLength={10}
                placeholder="Use fictional observations and next steps…"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="response-action-buttons">
              <button
                className="btn"
                type="button"
                onClick={() => setCreate(false)}
              >
                Cancel
              </button>
              <button className="btn primary">
                Create demonstration record
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Sheet
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelectedId(null);
        }}
      >
        <SheetContent className="incident-sheet concept-sheet">
          {selected && (
            <>
              <SheetHeader>
                <span className="eyebrow">
                  {selected.id} · {selected.priority.toUpperCase()}
                </span>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  {school} · {selected.location}
                </SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <div className="concept-stage-path">
                  {definition.stages.map((s, i) => (
                    <span
                      className={
                        i === selected.stage
                          ? 'current'
                          : i < selected.stage
                            ? 'done'
                            : ''
                      }
                      key={s}
                    >
                      {i < selected.stage ? <Check size={13} /> : i + 1} {s}
                    </span>
                  ))}
                </div>
                <p className="detail-description">{selected.details}</p>
                <div className="concept-detail-grid">
                  <label className="field">
                    Assigned owner
                    <select
                      value={selected.owner}
                      onChange={(e) =>
                        update(
                          { owner: e.target.value },
                          `Owner changed to ${e.target.value}`,
                        )
                      }
                    >
                      {[
                        ...new Set([
                          selected.owner,
                          ...users
                            .filter(
                              (u) =>
                                u.active &&
                                (u.school === school ||
                                  u.school === 'All PoC schools'),
                            )
                            .map((u) => u.name),
                        ]),
                      ].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Review / due date
                    <input
                      type="date"
                      value={selected.due}
                      onChange={(e) => {
                        if (e.target.value)
                          update(
                            { due: e.target.value },
                            `Review date changed to ${e.target.value}`,
                          );
                      }}
                    />
                  </label>
                </div>
                <Tabs defaultValue="response">
                  <TabsList className="section-tabs">
                    <TabsTrigger value="response">
                      Response & checks
                    </TabsTrigger>
                    <TabsTrigger value="details">Record details</TabsTrigger>
                    <TabsTrigger value="history">
                      History ({selected.history.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="response">
                    <FeaturePanel
                      key={selected.id}
                      record={selected}
                      module={definition}
                      onChange={(patch, event) =>
                        update(
                          { values: { ...selected.values, ...patch } },
                          event,
                        )
                      }
                    />
                    <section className="concept-checklist">
                      <h3>Verification checklist</h3>
                      {definition.checks.map((c) => (
                        <label key={c}>
                          <input
                            type="checkbox"
                            checked={selected.checked.includes(c)}
                            onChange={(e) =>
                              update(
                                {
                                  checked: e.target.checked
                                    ? [...selected.checked, c]
                                    : selected.checked.filter((x) => x !== c),
                                },
                                `${e.target.checked ? 'Checked' : 'Unchecked'}: ${c}`,
                              )
                            }
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </section>
                    <label className="field">
                      Action / outcome note
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Record the action taken before moving to the next stage…"
                      />
                    </label>
                    {error && (
                      <p className="form-error" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="concept-inline-actions">
                      <button
                        className="btn"
                        disabled={note.trim().length < 10}
                        onClick={() => {
                          update({}, `Staff note: ${note.trim()}`);
                          setNote('');
                        }}
                      >
                        Add note
                      </button>
                      {selected.stage < definition.stages.length - 1 ? (
                        <button
                          className="btn primary"
                          onClick={() => {
                            const issue = conceptAdvanceError(
                              selected,
                              definition,
                              note,
                            );
                            if (issue) {
                              setError(issue);
                              return;
                            }
                            update(
                              { stage: selected.stage + 1 },
                              `${definition.stages[selected.stage + 1]}: ${note.trim()}`,
                            );
                            setNote('');
                          }}
                        >
                          Move to {definition.stages[selected.stage + 1]}{' '}
                          <ChevronRight size={14} />
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => {
                            if (note.trim().length < 10) {
                              setError(
                                'Explain why this record needs to be reopened.',
                              );
                              return;
                            }
                            update(
                              { stage: 0, checked: [] },
                              `Reopened: ${note.trim()}`,
                            );
                            setNote('');
                          }}
                        >
                          Reopen record
                        </button>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="details">
                    <RecordDetailEditor
                      key={selected.id}
                      record={selected}
                      definition={definition}
                      onSave={(values) =>
                        update(
                          { values: { ...selected.values, ...values } },
                          'Workflow details updated by demo staff',
                        )
                      }
                    />
                    <p className="help-text">{definition.mediaNote}</p>
                    {definition.id !== 'safeguarding' && (
                      <DemoVideo scene={definition.scene} />
                    )}
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="timeline">
                      {selected.history.map((h, i) => (
                        <div key={i}>
                          <i />
                          <div>
                            <strong>{h.text}</strong>
                            <small>{h.time} · Demo session</small>
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
    </div>
  );
}
