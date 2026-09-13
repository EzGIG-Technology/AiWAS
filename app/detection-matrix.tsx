'use client';
import { useEffect, useEffectEvent, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Save,
  Play,
  ArrowUpRight,
  Check,
  Timer,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DemoVideo } from './camera-media';
import {
  matrixDetections,
  matrixRuleError,
  matrixZones,
  type MatrixRule,
} from './detection-matrix-data';
import { severityClass, type Incident } from './data';
export function DetectionMatrix({
  school,
  onAlert,
  onOpen,
  incidents = [],
  onContext,
}: {
  school: string;
  onAlert: (i: Incident) => void;
  onOpen: (id: string) => void;
  incidents?: Incident[];
  onContext?: (id: string, text: string) => void;
}) {
  const [selected, setSelected] = useState('crowd'),
    [query, setQuery] = useState(''),
    [group, setGroup] = useState('All detections'),
    [saved, setSaved] = useState<Record<string, MatrixRule>>({}),
    [notice, setNotice] = useState(''),
    [last, setLast] = useState(''),
    [remaining, setRemaining] = useState<number | null>(null),
    [target, setTarget] = useState(''),
    [tag, setTag] = useState('Unknown'),
    [reason, setReason] = useState('');
  const cap = matrixDetections.find((c) => c.id === selected)!,
    key = school + '|' + selected;
  const defaults: MatrixRule = {
    enabled: true,
    zone: cap.id === 'crowd' ? 'Canteen' : 'Courtyard',
    priority: cap.priority,
    threshold: cap.value,
    confidence: 70,
    cooldown: cap.priority === 'Critical' ? 0 : 60,
    schedule: 'School hours',
    reviewer: 'School duty team',
    publicOnly: true,
  };
  const [draft, setDraft] = useState(defaults),
    [scope, setScope] = useState(key);
  if (scope !== key) {
    setScope(key);
    setDraft(
      Object.entries(saved).find(([k]) => k.startsWith(key + '|'))?.[1] ||
        defaults,
    );
    setNotice('');
    setRemaining(null);
    setLast('');
    setTarget('');
    setTag('Unknown');
    setReason('');
  }
  const finish = useEffectEvent(() => {
    setRemaining(null);
    const r = saved[key + '|' + draft.zone];
    if (!r?.enabled) return;
    const now = new Date(),
      id = 'SIM-MATRIX-' + crypto.randomUUID().slice(0, 8);
    onAlert({
      id,
      category: cap.name,
      school,
      zone: r.zone,
      block: 'Public school area',
      camera: 'Simulation',
      severity: r.priority,
      confidence: 0,
      date: now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
      time: now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Open',
      validation: 'Pending',
      assigned: r.reviewer,
      description: `Scripted candidate: ${cap.signal}. Threshold ${r.threshold} ${cap.unit}. ${cap.boundary} No live inference or external notification ran.`,
      history: [
        {
          text: `Detection preview completed → ${r.priority} → ${r.reviewer}. Incident-only sample capture; delivery not connected.`,
          actor: 'Detection centre · demo',
          time: 'Now',
        },
      ],
    });
    setLast(id);
    setNotice(
      'Sample incident created. Open it to acknowledge, verify and resolve.',
    );
  });
  useEffect(() => {
    if (remaining === null) return;
    const id = setTimeout(() => {
      if (remaining <= 1) finish();
      else setRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => clearTimeout(id);
  }, [remaining]);
  const list = matrixDetections.filter(
    (c) =>
      (group === 'All detections' || c.group === group) &&
      (c.name + ' ' + c.signal).toLowerCase().includes(query.toLowerCase()),
  );
  const update = (patch: Partial<MatrixRule>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setNotice('');
  };
  return (
    <div className="matrix-workspace">
      <div className="matrix-summary">
        <div>
          <span className="eyebrow">DETECTION CENTRE</span>
          <h2>Every signal. A defined response.</h2>
          <p>
            Configure a zone, test a candidate and review the resulting
            incident.
          </p>
        </div>
        <div>
          <strong>20</strong>
          <span>event types</span>
        </div>
        <div>
          <strong>2</strong>
          <span>context tags</span>
        </div>
      </div>
      <div className="matrix-layout">
        <aside className="matrix-list">
          <label className="matrix-search">
            <Search size={16} />
            <input
              aria-label="Search detection matrix"
              placeholder="Find a detection"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Detection category"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {[
              'All detections',
              'Behaviour',
              'Movement',
              'Security',
              'Emergency',
              'Context tags',
            ].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <div className="matrix-count">
            {list.length} matching requirements
          </div>
          {list.map((c) => (
            <button
              key={c.id}
              disabled={remaining !== null}
              className={
                'matrix-list-item ' + (c.id === selected ? 'selected' : '')
              }
              onClick={() => setSelected(c.id)}
            >
              <span>
                <strong>{c.name}</strong>
                <small>
                  {c.group} ·{' '}
                  {c.mode === 'context' ? 'Context only' : c.priority}
                </small>
              </span>
              {Object.keys(saved).some((k) =>
                k.startsWith(school + '|' + c.id + '|'),
              ) && <Check size={15} />}
            </button>
          ))}
          {!list.length && (
            <p className="matrix-empty">
              No matching detections. Try another search.
            </p>
          )}
        </aside>
        <div className="matrix-detail">
          <section className="panel matrix-card">
            <div className="matrix-card-heading">
              <div>
                <span className="eyebrow">{cap.group}</span>
                <h2>{cap.name}</h2>
              </div>
              <span className={'badge ' + severityClass(cap.priority)}>
                {cap.mode === 'context' ? 'Context only' : cap.priority}
              </span>
            </div>
            <p>{cap.signal}</p>
            <div className="matrix-evidence">
              <DemoVideo scene={cap.scene} />
            </div>
            <details>
              <summary>Evidence limits & model readiness</summary>
              <p>{cap.boundary}</p>
              <p>
                Sample footage illustrates the school environment and may not
                depict this event. No model is connected.{' '}
                {cap.baseline
                  ? `The supplied matrix reports an ${cap.baseline}% starting figure; it is unverified here.`
                  : 'The supplied matrix starts this feature at 0% because it is not trained or built.'}{' '}
                The &gt;90% target is not an achieved result.
              </p>
            </details>
          </section>
          {cap.mode === 'context' ? (
            <section className="panel matrix-card">
              <h3>
                <Tag size={17} /> Add context to an incident
              </h3>
              <p>{cap.boundary}</p>
              <label>
                Existing school incident
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Choose an incident</option>
                  {incidents
                    .filter((i) => i.school === school && i.status !== 'Closed')
                    .map((i) => (
                      <option value={i.id} key={i.id}>
                        {i.id} · {i.category}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Staff-reviewed context
                <select value={tag} onChange={(e) => setTag(e.target.value)}>
                  {(cap.id === 'uniform'
                    ? [
                        'Unknown',
                        'Uniform observed',
                        'Approved exception',
                        'Needs staff review',
                      ]
                    : [
                        'Unknown',
                        'Student · staff confirmed',
                        'Teacher / staff · confirmed',
                        'Visitor · staff confirmed',
                      ]
                  ).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Basis for this context
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Record the staff check, permission or uncertainty."
                />
              </label>
              <button
                className="btn primary"
                onClick={() => {
                  if (!target || reason.trim().length < 10) {
                    setNotice(
                      'Choose an incident and add at least 10 characters of context.',
                    );
                    return;
                  }
                  onContext?.(target, `${cap.name}: ${tag} · ${reason.trim()}`);
                  setLast(target);
                  setNotice(
                    'Context added to the existing incident. No new alert was created.',
                  );
                }}
              >
                <Save size={16} /> Save context
              </button>
            </section>
          ) : (
            <>
              <fieldset
                disabled={remaining !== null}
                className="panel matrix-card"
              >
                <h3>
                  <SlidersHorizontal size={18} /> Zone rule
                </h3>
                <div className="matrix-fields">
                  <label>
                    Public zone
                    <select
                      value={draft.zone}
                      onChange={(e) => {
                        const zone = e.target.value;
                        setDraft(
                          saved[key + '|' + zone] || { ...defaults, zone },
                        );
                        setNotice('');
                      }}
                    >
                      {matrixZones.map((z) => (
                        <option key={z}>{z}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      value={draft.priority}
                      onChange={(e) => update({ priority: e.target.value })}
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Trigger threshold · {cap.unit}
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={draft.threshold}
                      onChange={(e) =>
                        update({ threshold: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Model score threshold · %
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={draft.confidence}
                      onChange={(e) =>
                        update({ confidence: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Duplicate cooldown · seconds
                    <input
                      type="number"
                      min={0}
                      max={3600}
                      value={draft.cooldown}
                      onChange={(e) =>
                        update({ cooldown: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Schedule
                    <select
                      value={draft.schedule}
                      onChange={(e) => update({ schedule: e.target.value })}
                    >
                      {[
                        'School hours',
                        'Lessons only',
                        'After hours',
                        'Always',
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Initial review team
                  <input
                    value={draft.reviewer}
                    onChange={(e) => update({ reviewer: e.target.value })}
                  />
                </label>
                <div className="matrix-route">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Response route</strong>
                    <p>{cap.recipients}</p>
                    <small>
                      External escalation follows an approved SOP; this preview
                      sends nothing.
                    </small>
                  </div>
                </div>
                <label className="matrix-check" htmlFor="matrix-public">
                  <Checkbox
                    id="matrix-public"
                    checked={draft.publicOnly}
                    onCheckedChange={(v) => update({ publicOnly: v === true })}
                  />
                  Approved public-area placement; no biometrics
                </label>
                <label className="matrix-check" htmlFor="matrix-enabled">
                  <Checkbox
                    id="matrix-enabled"
                    checked={draft.enabled}
                    onCheckedChange={(v) => update({ enabled: v === true })}
                  />
                  Enable this demonstration rule
                </label>
                <button
                  disabled={remaining !== null}
                  className="btn primary"
                  onClick={() => {
                    const error = matrixRuleError(draft, cap);
                    if (error) {
                      setNotice(error);
                      return;
                    }
                    setSaved((s) => ({
                      ...s,
                      [key + '|' + draft.zone]: { ...draft },
                    }));
                    setNotice('Rule saved for this school and detection.');
                  }}
                >
                  <Save size={16} /> Save rule
                </button>
              </fieldset>
              <section className="panel matrix-card">
                <h3>
                  <Timer size={18} /> Test the response journey
                </h3>
                <p>
                  {saved[key + '|' + draft.zone]
                    ? `${saved[key + '|' + draft.zone].zone} → ${saved[key + '|' + draft.zone].priority} → ${saved[key + '|' + draft.zone].reviewer}`
                    : 'Save a rule to start the demonstration.'}
                </p>
                {remaining !== null && (
                  <progress
                    max={10}
                    value={10 - remaining}
                    aria-label="Detection preview progress"
                  />
                )}
                <div className="matrix-run">
                  <button
                    className="btn primary"
                    disabled={
                      !saved[key + '|' + draft.zone]?.enabled ||
                      remaining !== null
                    }
                    onClick={() => {
                      setLast('');
                      setNotice('');
                      setRemaining(10);
                    }}
                  >
                    <Play size={16} />
                    {remaining === null
                      ? 'Run 10-second preview'
                      : `Analysing sample · ${remaining}s`}
                  </button>
                  {remaining !== null && (
                    <button
                      className="btn"
                      onClick={() => {
                        setRemaining(null);
                        setNotice('Preview cancelled. No incident created.');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <small>
                  This is a timed UI simulation. Critical handling in production
                  must not wait for this demonstration timer.
                </small>
              </section>
            </>
          )}
          <output className="matrix-notice">{notice}</output>
          {last && (
            <button className="btn primary" onClick={() => onOpen(last)}>
              Open incident journey <ArrowUpRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
