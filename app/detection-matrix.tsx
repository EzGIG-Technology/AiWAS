'use client';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, ShieldQuestion } from 'lucide-react';
import {
  responseMatrix,
  matrixSummary,
  notifyTargets,
  type MatrixGate,
  type MatrixStatus,
} from './response-matrix';

const STATUSES: (MatrixStatus | 'All')[] = [
  'All',
  'Existing',
  'Requested',
  'Suggested',
];
const GATES: (MatrixGate | 'All')[] = [
  'All',
  'Ready to evaluate',
  'Needs measurement',
  'Needs governance decision',
];

const gateTone = (g: MatrixGate) =>
  g === 'Ready to evaluate'
    ? 'green'
    : g === 'Needs measurement'
      ? 'amber'
      : 'red';

/**
 * The programme's Detection & Response Matrix as a working screen.
 *
 * The source document lists each detection with a system action, a notify list
 * and a confidence target. Three columns are added here - status, gate and
 * caution - so the matrix reads as a plan with conditions rather than a set of
 * delivered promises, and so a conflict with the platform's stated limits is
 * visible next to the row it applies to.
 */
export function DetectionMatrix() {
  const [status, setStatus] = useState<MatrixStatus | 'All'>('All');
  const [gate, setGate] = useState<MatrixGate | 'All'>('All');
  const [query, setQuery] = useState('');
  const [cautionOnly, setCautionOnly] = useState(false);
  const s = matrixSummary();

  const rows = responseMatrix.filter(
    (r) =>
      (status === 'All' || r.status === status) &&
      (gate === 'All' || r.gate === gate) &&
      (!cautionOnly || r.caution) &&
      `${r.category} ${r.detects} ${r.example}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <div className="matrix">
      <section className="panel matrix-summary">
        <div className="concept-stats">
          {(
            [
              ['Detections', s.total],
              ['Existing', s.existing],
              ['Requested', s.requested],
              ['Suggested', s.suggested],
              ['Ready to evaluate', s.ready],
              ['Need a decision', s.governance],
            ] as [string, number][]
          ).map(([k, v]) => (
            <div key={k}>
              <strong>{v}</strong>
              <span>{k}</span>
            </div>
          ))}
        </div>
        <p className="muted">
          {s.mapped} of {s.total} rows map to a capability already in the
          register. Every row states a confidence target of 90%; none has been
          measured in this build, so the target is an acceptance criterion for a
          pilot, not a claim about performance.
        </p>
        <p className="matrix-notify">
          <strong>Recipients named across the matrix:</strong>{' '}
          {notifyTargets().join(' · ')}
        </p>
      </section>

      <section className="panel matrix-controls">
        <div className="studio-fields">
          <label htmlFor="matrix-search">
            Search
            <input
              id="matrix-search"
              placeholder="Search category, signal or example…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label htmlFor="matrix-status">
            Status
            <select
              id="matrix-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MatrixStatus)}
            >
              {STATUSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label htmlFor="matrix-gate">
            Readiness gate
            <select
              id="matrix-gate"
              value={gate}
              onChange={(e) => setGate(e.target.value as MatrixGate)}
            >
              {GATES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="matrix-toggle" htmlFor="matrix-caution">
            <input
              id="matrix-caution"
              type="checkbox"
              checked={cautionOnly}
              onChange={(e) => setCautionOnly(e.target.checked)}
            />
            Only rows with a stated conflict ({s.withCaution})
          </label>
        </div>
      </section>

      <div className="matrix-rows">
        {rows.map((r) => (
          <article key={r.id} className={'matrix-row ' + gateTone(r.gate)}>
            <header>
              <div>
                <span className={'badge ' + (r.status === 'Existing' ? 'blue' : 'neutral')}>
                  {r.status}
                </span>
                <h3>{r.category}</h3>
              </div>
              <span className={'matrix-gate ' + gateTone(r.gate)}>
                {r.gate === 'Ready to evaluate' ? (
                  <CheckCircle2 size={13} />
                ) : r.gate === 'Needs measurement' ? (
                  <Gauge size={13} />
                ) : (
                  <ShieldQuestion size={13} />
                )}
                {r.gate}
              </span>
            </header>

            <dl className="matrix-grid">
              <div>
                <dt>What it detects</dt>
                <dd>{r.detects}</dd>
              </div>
              <div>
                <dt>Example incident</dt>
                <dd>{r.example}</dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd>{r.severity}</dd>
              </div>
              <div>
                <dt>System action</dt>
                <dd>{r.action}</dd>
              </div>
              <div>
                <dt>Who is notified</dt>
                <dd>{r.notify.join(', ')}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>
                  <span className="matrix-conf">
                    {r.initial === null ? 'Not measured' : `${r.initial}% today`}
                    {' → '}
                    <strong>target {r.target}%</strong>
                  </span>
                </dd>
              </div>
            </dl>

            {r.caution && (
              <p className="matrix-caution">
                <AlertTriangle size={14} />
                <span>{r.caution}</span>
              </p>
            )}
          </article>
        ))}
        {rows.length === 0 && (
          <p className="muted">No detection matches that filter.</p>
        )}
      </div>
    </div>
  );
}
