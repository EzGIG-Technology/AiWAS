'use client';
import { useState } from 'react';
import { RotateCcw, Save, SlidersHorizontal } from 'lucide-react';

// Defaults transcribed from the supplied device Detection settings tab, so the
// demonstration shows the real operating parameters rather than invented ones.

type Activity = {
  name: string;
  confidence: number;
  severity: string;
  cooldown: number;
};

const DEFAULT_ACTIVITIES: Activity[] = [
  { name: 'violence', confidence: 0.7, severity: 'critical', cooldown: 60 },
  { name: 'guns', confidence: 0.8, severity: 'critical', cooldown: 60 },
  { name: 'knife', confidence: 0.85, severity: 'critical', cooldown: 60 },
  { name: 'blood', confidence: 0.7, severity: 'critical', cooldown: 60 },
  { name: 'weapon', confidence: 0.8, severity: 'critical', cooldown: 60 },
  { name: 'fire', confidence: 0.4, severity: 'critical', cooldown: 30 },
  { name: 'smoke', confidence: 0.5, severity: 'high', cooldown: 30 },
  { name: 'vape', confidence: 0.75, severity: 'high', cooldown: 120 },
  { name: 'cigarette', confidence: 0.5, severity: 'high', cooldown: 120 },
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const DEFAULT_CROWD = {
  enabled: true,
  minCrowdSize: 3,
  stationarity: 5,
  proximity: 150,
  movement: 20,
  cooldown: 60,
};
const DEFAULT_VIOLENCE = {
  windowSize: 5,
  minHits: 3,
  minConfidence: 0.65,
  minPersons: 2,
  proximity: 200,
  cooldown: 60,
};
const DEFAULT_TRACKER = {
  enabled: true,
  iou: 0.5,
  cooldown: 30,
  crowdMaxMisses: 2,
};
const DEFAULT_LINE = {
  enabled: true,
  lineType: 'horizontal',
  direction: 'up',
  position: 0.5,
};

/**
 * Detection tuning.
 *
 * Two things are enforced here that the source settings screen leaves to the
 * operator. Lowering a confidence threshold raises the false-alert rate, so the
 * screen says so next to the control and warns below 0.5. And a cooldown of
 * zero means an event can re-fire every frame, which floods the queue and is
 * the fastest way to make an operator stop reading alerts.
 */
export function DetectionTuning() {
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [crowd, setCrowd] = useState(DEFAULT_CROWD);
  const [violence, setViolence] = useState(DEFAULT_VIOLENCE);
  const [tracker, setTracker] = useState(DEFAULT_TRACKER);
  const [entrance, setEntrance] = useState(DEFAULT_LINE);
  const [exitLine, setExitLine] = useState(DEFAULT_LINE);
  const [operations, setOperations] = useState(true);
  const [notice, setNotice] = useState('');

  const setActivity = (i: number, patch: Partial<Activity>) =>
    setActivities((a) => a.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  // A low threshold on a life-safety activity is a deliberate trade: it is
  // better to check a false fire alert than to miss a real one. On everything
  // else it is a false-alert problem, so the two are reported differently.
  const LIFE_SAFETY = ['fire', 'smoke'];
  const lowLifeSafety = activities.filter(
    (a) => a.confidence < 0.5 && LIFE_SAFETY.includes(a.name),
  );
  const risky = activities.filter(
    (a) => a.confidence < 0.5 && !LIFE_SAFETY.includes(a.name),
  );
  const noCooldown = activities.filter((a) => a.cooldown === 0);

  const reset = () => {
    setActivities(DEFAULT_ACTIVITIES);
    setCrowd(DEFAULT_CROWD);
    setViolence(DEFAULT_VIOLENCE);
    setTracker(DEFAULT_TRACKER);
    setEntrance(DEFAULT_LINE);
    setExitLine(DEFAULT_LINE);
    setNotice('Restored the shipped defaults for this session.');
  };

  return (
    <div className="tuning detection-studio">
      <section className="panel studio-rule">
        <h2>
          <SlidersHorizontal size={18} />
          Activities
        </h2>
        <p className="muted">
          Per-activity confidence threshold, severity and cooldown. A threshold
          is a trade, not a quality setting: lowering it finds more true events
          and more false ones. Cooldown is the minimum gap before the same
          activity may raise another event on the same camera.
        </p>
        <label className="studio-check" htmlFor="tuning-ops">
          <input
            id="tuning-ops"
            type="checkbox"
            checked={operations}
            onChange={(e) => setOperations(e.target.checked)}
          />
          Operations enabled
        </label>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Cooldown (sec)</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={a.name}>
                  <td>
                    <strong>{a.name}</strong>
                  </td>
                  <td>
                    <input
                      aria-label={`${a.name} confidence`}
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={a.confidence}
                      onChange={(e) =>
                        setActivity(i, { confidence: Number(e.target.value) })
                      }
                    />
                  </td>
                  <td>
                    <select
                      aria-label={`${a.name} severity`}
                      value={a.severity}
                      onChange={(e) =>
                        setActivity(i, { severity: e.target.value })
                      }
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      aria-label={`${a.name} cooldown`}
                      type="number"
                      min="0"
                      max="3600"
                      value={a.cooldown}
                      onChange={(e) =>
                        setActivity(i, { cooldown: Number(e.target.value) })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {risky.length > 0 && (
          <p className="tuning-warn">
            {risky.map((a) => a.name).join(', ')} below 0.50. Under half
            confidence most alerts will be wrong, and an operator who stops
            trusting the queue stops reading it.
          </p>
        )}
        {lowLifeSafety.length > 0 && (
          <p className="tuning-note">
            {lowLifeSafety.map((a) => a.name).join(', ')} sit below 0.50 by
            design. For life safety it is better to check a false alarm than to
            miss a real one — but budget for the extra checks, and never let
            this route anywhere automatically.
          </p>
        )}
        {noCooldown.length > 0 && (
          <p className="tuning-warn">
            {noCooldown.map((a) => a.name).join(', ')} have no cooldown. The
            same activity can re-fire continuously on one camera.
          </p>
        )}
      </section>

      <div className="tuning-grid">
        <section className="panel studio-rule">
          <h3>Crowd detection</h3>
          <label className="studio-check" htmlFor="crowd-enabled">
            <input
              id="crowd-enabled"
              type="checkbox"
              checked={crowd.enabled}
              onChange={(e) => setCrowd({ ...crowd, enabled: e.target.checked })}
            />
            Enabled
          </label>
          {(
            [
              ['Min crowd size', 'minCrowdSize', 1, 100],
              ['Stationarity duration (sec)', 'stationarity', 0, 600],
              ['Proximity threshold (px)', 'proximity', 10, 1000],
              ['Movement threshold (px)', 'movement', 0, 500],
              ['Cooldown (sec)', 'cooldown', 0, 3600],
            ] as [string, keyof typeof crowd, number, number][]
          ).map(([label, key, min, max]) => (
            <label key={key} htmlFor={'crowd-' + key}>
              {label}
              <input
                id={'crowd-' + key}
                type="number"
                min={min}
                max={max}
                value={crowd[key] as number}
                onChange={(e) =>
                  setCrowd({ ...crowd, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
        </section>

        <section className="panel studio-rule">
          <h3>Altercation detection</h3>
          <p className="muted">
            Persistence controls. Requiring several hits inside a window is what
            separates a scuffle candidate from one frame of fast movement.
          </p>
          {(
            [
              ['Window size (frames)', 'windowSize', 1, 60],
              ['Min hits in window', 'minHits', 1, 60],
              ['Min confidence', 'minConfidence', 0, 1],
              ['Min persons', 'minPersons', 2, 20],
              ['Proximity (px)', 'proximity', 10, 1000],
              ['Cooldown (sec)', 'cooldown', 0, 3600],
            ] as [string, keyof typeof violence, number, number][]
          ).map(([label, key, min, max]) => (
            <label key={key} htmlFor={'viol-' + key}>
              {label}
              <input
                id={'viol-' + key}
                type="number"
                step={key === 'minConfidence' ? 0.05 : 1}
                min={min}
                max={max}
                value={violence[key]}
                onChange={(e) =>
                  setViolence({ ...violence, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
        </section>

        <section className="panel studio-rule">
          <h3>Tracker</h3>
          <label className="studio-check" htmlFor="tracker-enabled">
            <input
              id="tracker-enabled"
              type="checkbox"
              checked={tracker.enabled}
              onChange={(e) =>
                setTracker({ ...tracker, enabled: e.target.checked })
              }
            />
            Enabled
          </label>
          {(
            [
              ['IOU threshold', 'iou', 0, 1],
              ['Default cooldown (sec)', 'cooldown', 0, 3600],
              ['Crowd max misses', 'crowdMaxMisses', 0, 30],
            ] as [string, keyof typeof tracker, number, number][]
          ).map(([label, key, min, max]) => (
            <label key={key} htmlFor={'trk-' + key}>
              {label}
              <input
                id={'trk-' + key}
                type="number"
                step={key === 'iou' ? 0.05 : 1}
                min={min}
                max={max}
                value={tracker[key] as number}
                onChange={(e) =>
                  setTracker({ ...tracker, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
          <p className="muted">
            Tracks are within a single camera view and are not retained between
            cameras. A person leaving and re-entering is a new track.
          </p>
        </section>
      </div>

      <div className="tuning-grid two">
        {(
          [
            ['Counting line — entrance', entrance, setEntrance, 'ent'],
            ['Counting line — exit', exitLine, setExitLine, 'ext'],
          ] as [string, typeof DEFAULT_LINE, (v: typeof DEFAULT_LINE) => void, string][]
        ).map(([title, line, set, k]) => (
          <section key={k} className="panel studio-rule">
            <h3>{title}</h3>
            <label className="studio-check" htmlFor={k + '-enabled'}>
              <input
                id={k + '-enabled'}
                type="checkbox"
                checked={line.enabled}
                onChange={(e) => set({ ...line, enabled: e.target.checked })}
              />
              Enabled
            </label>
            <label htmlFor={k + '-type'}>
              Line type
              <select
                id={k + '-type'}
                value={line.lineType}
                onChange={(e) => set({ ...line, lineType: e.target.value })}
              >
                <option>horizontal</option>
                <option>vertical</option>
              </select>
            </label>
            <label htmlFor={k + '-dir'}>
              Direction
              <select
                id={k + '-dir'}
                value={line.direction}
                onChange={(e) => set({ ...line, direction: e.target.value })}
              >
                <option>up</option>
                <option>down</option>
                <option>left</option>
                <option>right</option>
              </select>
            </label>
            <label htmlFor={k + '-pos'}>
              Position (0.0 – 1.0)
              <input
                id={k + '-pos'}
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={line.position}
                onChange={(e) =>
                  set({ ...line, position: Number(e.target.value) })
                }
              />
            </label>
          </section>
        ))}
      </div>

      <section className="panel studio-rule">
        <div className="studio-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              setNotice(
                'Saved for this page session. No detector was configured and nothing was sent to a device.',
              )
            }
          >
            <Save size={14} /> Save settings
          </button>
          <button type="button" className="btn-secondary" onClick={reset}>
            <RotateCcw size={14} /> Restore defaults
          </button>
        </div>
        {notice && <p className="muted">{notice}</p>}
        <p className="muted">
          Frame rate is set per camera, not here. The supplied guidance is 8 FPS
          for entrance and exit counting, where a missed frame is a missed
          crossing, and around 3 FPS for cameras only watching for smoke or
          altercations.
        </p>
      </section>
    </div>
  );
}
