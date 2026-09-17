'use client';
import { useState } from 'react';
import { FlaskConical, Download } from 'lucide-react';
import { matrixDetections } from './detection-matrix-data';
import { trialMetrics, type Trial } from './surveillance-data';
import { csvCell } from './workflow';
import type { Incident } from './data';
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
}: {
  school: string;
  onAlert?: (item: Incident) => void;
  onOpen?: (id: string) => void;
}) {
  const detectionCatalog = matrixDetections.filter((c) => c.mode === 'event');
  const [selected, setSelected] = useState('crowd'),
    [trials, setTrials] = useState<Trial[]>([]),
    [truth, setTruth] = useState('Event present'),
    [predicted, setPredicted] = useState('Alert raised'),
    [latency, setLatency] = useState(10),
    [condition, setCondition] = useState('Daylight'),
    [trialNote, setTrialNote] = useState('');
  const cohort = trials.filter(
      (t) => t.school === school && t.capability === selected,
    ),
    metrics = trialMetrics(cohort),
    percent = (n: number | null) =>
      n === null ? 'Not measured' : (n * 100).toFixed(1) + '%';
  return (
    <div className="detection-studio evaluation-workspace">
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
            <select value={truth} onChange={(e) => setTruth(e.target.value)}>
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
            if (!Number.isFinite(latency) || latency < 0 || latency > 3600) {
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
          True positives {metrics.tp} · False positives {metrics.fp} · Missed
          events {metrics.fn} · True negatives {metrics.tn}
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
            No trials yet. Record positive, negative and missed-event examples.
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
    </div>
  );
}
