'use client';
import { useEffect, useEffectEvent, useState } from 'react';
import {
  Search,
  Play,
  Save,
  ShieldCheck,
  FlaskConical,
  Download,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DemoVideo } from './camera-media';
import {
  ruleError,
  trialMetrics,
  jpnCoverage,
  type StudioRule,
  type Trial,
} from './surveillance-data';
import { getIndustry, industryZoneError } from './industries';
import { severityClass, type Incident } from './data';
import { csvCell } from './workflow';
function download(rows: unknown[][], name: string) {
  const url = URL.createObjectURL(
    new Blob(
      [rows.map((r) => r.map((x) => csvCell(String(x))).join(',')).join('\n')],
      { type: 'text/csv' },
    ),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function DetectionStudio({
  school,
  industryId,
  onAlert,
  onOpen,
}: {
  school: string;
  industryId: string;
  onAlert: (i: Incident) => void;
  onOpen: (id: string) => void;
}) {
  const industry = getIndustry(industryId);
  const detectionCatalog = industry.capabilities;
  const publicZones = industry.zones;
  const [selected, setSelected] = useState(detectionCatalog[0].id),
    [query, setQuery] = useState(''),
    [kind, setKind] = useState('All'),
    [rules, setRules] = useState<Record<string, StudioRule>>({});
  // Switching industry replaces the register, so the previous selection may
  // not exist here. Fall back to this industry's first capability.
  const cap =
    detectionCatalog.find((c) => c.id === selected) ?? detectionCatalog[0];
  const key = industryId + '|' + school + '|' + cap.id;
  const defaults: StudioRule = {
    zone: publicZones[0],
    priority: cap.priority,
    threshold: 80,
    hold: 5,
    schedule: industry.lexicon.hours,
    reviewer: industry.lexicon.reviewTeam,
    publicOnly: true,
  };
  const [draft, setDraft] = useState<StudioRule>(defaults),
    [scope, setScope] = useState(key),
    [notice, setNotice] = useState(''),
    [log, setLog] = useState<{ school: string; text: string }[]>([]);
  const [run, setRun] = useState<number | null>(null),
    [elapsed, setElapsed] = useState(0),
    [outcome, setOutcome] = useState('Candidate event'),
    [last, setLast] = useState('');
  const [trials, setTrials] = useState<Trial[]>([]),
    [truth, setTruth] = useState('Event present'),
    [predicted, setPredicted] = useState('Alert raised'),
    [latency, setLatency] = useState(10),
    [condition, setCondition] = useState('Daylight'),
    [trialNote, setTrialNote] = useState('');
  if (scope !== key) {
    setScope(key);
    setDraft(rules[key] || defaults);
    setRun(null);
    setElapsed(0);
    setLast('');
    setNotice('');
    setTrialNote('');
  }
  const finish = useEffectEvent(() => {
    setRun(null);
    setElapsed(10);
    const saved = rules[key];
    if (!saved) {
      setNotice('Save a review rule before testing.');
      return;
    }
    if (outcome !== 'Candidate event') {
      const text =
        outcome === 'Feed unavailable'
          ? 'Coverage unavailable — do not interpret as all clear. Fallback patrol required.'
          : 'No candidate in this scripted example. This does not establish that the area is safe.';
      setNotice(text);
      setLog((l) => [{ school, text: `${cap.name}: ${text}` }, ...l]);
      return;
    }
    const id = 'SIM-DETECT-' + crypto.randomUUID().slice(0, 8),
      now = new Date();
    onAlert({
      id,
      category: cap.name,
      school,
      zone: saved.zone,
      block: 'Configured public area',
      camera:
        cap.kind === 'Staff report'
          ? 'Staff report'
          : cap.kind === 'Sensor integration'
            ? 'Sensor demo'
            : 'Camera demo',
      severity: saved.priority,
      confidence: 0,
      time: now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur',
      }),
      date: now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
      status: 'Open',
      validation: 'Pending',
      assigned: saved.reviewer,
      description: `Scripted ${cap.kind.toLowerCase()}: ${cap.signal} ${cap.limits} Response: ${cap.response} No live model ran.`,
      history: [
        {
          text: 'Unverified scripted candidate created. External delivery not connected.',
          actor: 'Detection studio · Demo',
          time: 'Now',
        },
      ],
    });
    setLast(id);
    setNotice(
      'Sample alert created in the incident queue. No external message was sent.',
    );
    setLog((l) => [
      {
        school,
        text: `${id}: ${cap.name} → ${saved.priority} → ${saved.reviewer}`,
      },
      ...l,
    ]);
  });
  useEffect(() => {
    if (run === null) return;
    const timer = setInterval(() => {
      const seconds = Math.min(10, (Date.now() - run) / 1000);
      setElapsed(seconds);
      if (seconds >= 10) finish();
    }, 100);
    return () => clearInterval(timer);
  }, [run]);
  const save = () => {
    const error =
      industryZoneError(industryId, draft.zone, draft.publicOnly) ||
      ruleError(draft, publicZones, [
        industry.lexicon.hours,
        'After hours',
        'Always',
      ]);
    if (error) {
      setNotice(error);
      return;
    }
    setRules((r) => ({ ...r, [key]: { ...draft } }));
    setNotice(
      'Review rule saved for this page session. No detector was activated.',
    );
    setLog((l) => [
      {
        school,
        text: `Rule saved: ${cap.name}, ${draft.zone}, ${draft.priority}, ${draft.schedule}`,
      },
      ...l,
    ]);
  };
  const cohort = trials.filter(
      (t) => t.school === school && t.capability === selected,
    ),
    metrics = trialMetrics(cohort);
  const percent = (v: number | null) =>
    v === null ? 'Not measured' : (v * 100).toFixed(1) + '%';
  return (
    <div className="detection-studio">
      <section className="studio-banner">
        <div>
          <span className="badge blue">School safety capabilities</span>
          <h2>Observe the event. Verify the context.</h2>
          <p>
            24 school safety capabilities, with clear evidence boundaries and a
            staff-owned response.
          </p>
        </div>
        <ShieldCheck size={42} />
      </section>
      <div className="info-note">
        Demonstration only · No biometric identification · Approved public areas
        · Rules and trials reset on refresh
      </div>
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Capability lab</TabsTrigger>
          <TabsTrigger value="evaluation">PoC evaluation</TabsTrigger>
          <TabsTrigger value="document">Platform coverage</TabsTrigger>
          <TabsTrigger value="history">Session history</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog">
          <div className="studio-layout">
            <aside className="studio-catalog">
              <label className="studio-search">
                <Search size={16} />
                <input
                  aria-label="Search detection capabilities"
                  placeholder="Search capabilities"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Capability type"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {[
                  'All',
                  'Video candidate',
                  'Sensor integration',
                  'Staff report',
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {detectionCatalog
                .filter(
                  (c) =>
                    (kind === 'All' || c.kind === kind) &&
                    (c.name + ' ' + c.signal)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((c) => (
                  <button
                    className={
                      'studio-option ' + (selected === c.id ? 'selected' : '')
                    }
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                  >
                    <strong>{c.name}</strong>
                    <span>
                      {c.kind}
                      <i className={'badge ' + severityClass(c.priority)}>
                        {c.priority}
                      </i>
                    </span>
                  </button>
                ))}
              {!detectionCatalog.some(
                (c) =>
                  (kind === 'All' || c.kind === kind) &&
                  (c.name + ' ' + c.signal)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              ) && <p>No matching capabilities.</p>}
            </aside>
            <div className="studio-detail">
              <header>
                <span className="badge blue">{cap.kind}</span>
                <h2>{cap.name}</h2>
                <p>{cap.signal}</p>
              </header>
              <div className="studio-video">
                <DemoVideo scene={cap.scene} />
              </div>
              <p className="muted">
                Synthetic context clip only; it does not demonstrate this
                detector working. Training media uses an inert blade prop, not a
                firearm. No scene is analysed.
              </p>
              <div className="studio-evidence">
                <section>
                  <h3>What needs verification</h3>
                  <p>{cap.limits}</p>
                </section>
                <section>
                  <h3>Response plan</h3>
                  <p>{cap.response}</p>
                </section>
              </div>
              <p className="muted">
                {cap.source.startsWith('https') ? (
                  <a href={cap.source} target="_blank" rel="noreferrer">
                    Capability evidence / research source ↗
                  </a>
                ) : (
                  cap.source
                )}{' '}
                · Vendor capability is not AiWAS validation.
              </p>
              <section className="panel studio-rule">
                <h3>Configure a demonstration rule</h3>
                <p>
                  Threshold is an illustrative tuning value, not measured
                  accuracy. The ten-second timer is separate from event
                  persistence.
                </p>
                <div className="studio-fields">
                  <label>
                    Approved public zone
                    <select
                      value={draft.zone}
                      onChange={(e) =>
                        setDraft({ ...draft, zone: e.target.value })
                      }
                    >
                      {publicZones.map((z) => (
                        <option key={z}>{z}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Response priority
                    <select
                      value={draft.priority}
                      onChange={(e) =>
                        setDraft({ ...draft, priority: e.target.value })
                      }
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Review threshold (1–100)
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={draft.threshold}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          threshold: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Persistence (seconds)
                    <input
                      type="number"
                      min="0"
                      max="600"
                      value={draft.hold}
                      onChange={(e) =>
                        setDraft({ ...draft, hold: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Active schedule
                    <select
                      value={draft.schedule}
                      onChange={(e) =>
                        setDraft({ ...draft, schedule: e.target.value })
                      }
                    >
                      {[
                        industry.lexicon.hours,
                        'After hours',
                        'Always',
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Responsible review team
                    <input
                      value={draft.reviewer}
                      onChange={(e) =>
                        setDraft({ ...draft, reviewer: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label className="studio-check" htmlFor="studio-public">
                  <Checkbox
                    id="studio-public"
                    checked={draft.publicOnly}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, publicOnly: v === true })
                    }
                  />{' '}
                  Public-area placement reviewed; no private-space cameras or
                  biometric identification
                </label>
                <button
                  className="btn-primary"
                  onClick={save}
                  disabled={run !== null}
                >
                  <Save size={16} /> Save demonstration rule
                </button>
              </section>
              <section className="panel studio-rule">
                <h3>Run the response preview</h3>
                <label>
                  Scripted outcome
                  <select
                    value={outcome}
                    disabled={run !== null}
                    onChange={(e) => setOutcome(e.target.value)}
                  >
                    {[
                      'Candidate event',
                      'No candidate',
                      'Feed unavailable',
                    ].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <p>
                  Saved rule:{' '}
                  {rules[key]
                    ? `${rules[key].zone} · ${rules[key].priority} · ${rules[key].reviewer}`
                    : 'Not configured'}
                </p>
                <progress
                  max={10}
                  value={elapsed}
                  aria-label="Ten-second simulation progress"
                />
                <div className="studio-actions">
                  <button
                    className="btn-primary"
                    disabled={run !== null || !rules[key]}
                    onClick={() => {
                      setLast('');
                      setNotice('');
                      setElapsed(0);
                      setRun(Date.now());
                    }}
                  >
                    <Play size={16} />
                    {run !== null
                      ? `Preview ${Math.floor(elapsed)}/10 seconds`
                      : 'Run 10-second preview'}
                  </button>
                  {run !== null && (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setRun(null);
                        setNotice('Preview cancelled.');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  {last && (
                    <button
                      className="btn-secondary"
                      onClick={() => onOpen(last)}
                    >
                      Review created incident
                    </button>
                  )}
                </div>
                <output>{notice}</output>
              </section>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="evaluation">
          <section className="panel studio-rule">
            <h2>
              <FlaskConical /> Measure what the pilot actually demonstrates
            </h2>
            <p>
              These metrics are calculated from the synthetic trials you enter
              below, for this school and capability only.
            </p>
            <label>
              Evaluation capability
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {detectionCatalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="concept-stats">
              <div>
                <strong>{cohort.length}</strong>
                <span>Scripted trials</span>
              </div>
              <div>
                <strong>{percent(metrics.precision)}</strong>
                <span>Precision · TP / (TP + FP)</span>
              </div>
              <div>
                <strong>{percent(metrics.recall)}</strong>
                <span>Recall · TP / (TP + FN)</span>
              </div>
              <div>
                <strong>
                  {metrics.p95 === null ? 'Not measured' : metrics.p95 + 's'}
                </strong>
                <span>p95 latency · true alerts only</span>
              </div>
            </div>
            <div className="studio-fields">
              <label>
                Staff ground truth
                <select
                  value={truth}
                  onChange={(e) => setTruth(e.target.value)}
                >
                  <option>Event present</option>
                  <option>No event</option>
                </select>
              </label>
              <label>
                System outcome
                <select
                  value={predicted}
                  onChange={(e) => setPredicted(e.target.value)}
                >
                  <option>Alert raised</option>
                  <option>No alert</option>
                </select>
              </label>
              <label>
                Capture-to-alert seconds
                <input
                  type="number"
                  min={0}
                  max={3600}
                  value={latency}
                  onChange={(e) => setLatency(Number(e.target.value))}
                />
              </label>
              <label>
                Test condition
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {[
                    'Daylight',
                    'Low light',
                    'Rain / glare',
                    'Occlusion',
                    'Crowd',
                    'Legitimate activity',
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                if (
                  !Number.isFinite(latency) ||
                  latency < 0 ||
                  latency > 3600
                ) {
                  setTrialNote('Latency must be between 0 and 3600 seconds.');
                  return;
                }
                setTrials((t) => [
                  ...t,
                  {
                    id: crypto.randomUUID(),
                    school,
                    capability: selected,
                    truth: truth === 'Event present',
                    alert: predicted === 'Alert raised',
                    latency,
                    condition,
                  },
                ]);
                setTrialNote(
                  'Synthetic trial recorded. This is not a model benchmark.',
                );
              }}
            >
              Record synthetic trial
            </button>
            <output>{trialNote}</output>
            <p>
              True positives {metrics.tp} · False positives {metrics.fp} ·
              Missed events {metrics.fn} · True negatives {metrics.tn}
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Condition</th>
                    <th>Ground truth</th>
                    <th>Outcome</th>
                    <th>Latency</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cohort.map((t) => (
                    <tr key={t.id}>
                      <td>{t.condition}</td>
                      <td>{t.truth ? 'Event' : 'No event'}</td>
                      <td>{t.alert ? 'Alert' : 'No alert'}</td>
                      <td>{t.alert ? t.latency + 's' : 'Not applicable'}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() =>
                            setTrials((all) => all.filter((x) => x.id !== t.id))
                          }
                        >
                          Remove trial
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!cohort.length && (
              <p>
                No trials yet. Record positive, negative and missed-event
                examples.
              </p>
            )}
            <button
              className="btn-secondary"
              disabled={!cohort.length}
              onClick={() =>
                download(
                  [
                    [
                      'school',
                      'capability',
                      'condition',
                      'event_present',
                      'alert',
                      'latency_seconds',
                    ],
                    ...cohort.map((t) => [
                      t.school,
                      t.capability,
                      t.condition,
                      t.truth,
                      t.alert,
                      t.alert ? t.latency : '',
                    ]),
                  ],
                  'aiwas-synthetic-evaluation.csv',
                )
              }
            >
              <Download size={16} /> Export trials
            </button>
          </section>
        </TabsContent>
        <TabsContent value="document">
          <section className="panel studio-rule">
            <h2>Platform capability coverage</h2>
            <p>
              Explore the available workflows and their demonstration
              boundaries. Live services require separate commissioning and
              validation.
            </p>
            {industryId !== 'education' && (
              <p className="studio-note">
                The requirement traceability table below is authored for the
                education programme. For {industry.name.toLowerCase()}, the
                capability register and excluded detections are shown on the
                Industry profile screen.
              </p>
            )}
            <div className="table-wrap" hidden={industryId !== 'education'}>
              <table>
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Where to find it</th>
                    <th>Implementation boundary</th>
                  </tr>
                </thead>
                <tbody>
                  {jpnCoverage.map((r) => (
                    <tr key={r[1]}>
                      {r.slice(1).map((v, i) => (
                        <td key={i}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Items to reconcile before a real pilot</h3>
            <p>
              Agree participation arrangements, public-area coverage, evidence
              handling, response ownership and evaluation criteria before
              commissioning.
            </p>
          </section>
        </TabsContent>
        <TabsContent value="history">
          <section className="panel studio-rule">
            <h2>School session history</h2>
            {log
              .filter((l) => l.school === school)
              .map((l, i) => (
                <p key={i}>{l.text}</p>
              ))}
            {!log.some((l) => l.school === school) && (
              <p>Save a rule or run a scenario to start the session history.</p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
