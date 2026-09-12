'use client';
import { useEffect, useState } from 'react';
import {
  Map,
  Users,
  ArrowUpRight,
  Play,
  Pause,
  Download,
  Video,
  ChartNoAxesCombined,
  Check,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CameraStill } from './camera-media';
import {
  campusZones,
  insightWindows,
  zoneSample,
  heatValue,
  heatScale,
  heatColor,
  thresholdError,
  zoneSummary,
  comparableChange,
  type HeatMetric,
} from './campus-insights-data';
import { csvCell } from './workflow';
import type { Camera, Incident } from './data';
type Action = {
  id: string;
  school: string;
  zone: string;
  title: string;
  owner: string;
  window: string;
  done: boolean;
};
export function CampusInsights({
  school,
  cameras,
  onAlert,
  onOpen,
}: {
  school: string;
  cameras: Camera[];
  onAlert: (i: Incident) => void;
  onOpen: (id: string) => void;
}) {
  const [slot, setSlot] = useState(2),
    [metric, setMetric] = useState<HeatMetric>('occupancy'),
    [selected, setSelected] = useState('canteen'),
    [playing, setPlaying] = useState(false),
    [thresholds, setThresholds] = useState<Record<string, number>>({}),
    [draft, setDraft] = useState(90),
    [scope, setScope] = useState(school + '|canteen'),
    [notice, setNotice] = useState(''),
    [actions, setActions] = useState<Action[]>([]),
    [owner, setOwner] = useState('Duty teacher team'),
    [actionTitle, setActionTitle] = useState(''),
    [lastAlert, setLastAlert] = useState('');
  const zone = campusZones.find((z) => z.id === selected)!;
  const key = school + '|' + selected;
  const threshold = thresholds[key] ?? zone.threshold;
  if (scope !== key) {
    setScope(key);
    setDraft(threshold);
    setNotice('');
    setPlaying(false);
    setActionTitle('');
    setLastAlert('');
  }
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setSlot((s) => (s + 1) % insightWindows.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [playing]);
  const isAvailable = (name: string) =>
    cameras.some((c) => c.school === school && c.zone === name && c.online);
  const available = isAvailable(zone.name),
    sample = zoneSample(school, selected, slot),
    summary = zoneSummary(school, selected, threshold);
  const availableZones = campusZones.filter((z) => isAvailable(z.name));
  const ranked = availableZones
    .map((z) => ({ zone: z, sample: zoneSample(school, z.id, slot) }))
    .sort((a, b) => b.sample.occupancy - a.sample.occupancy);
  const busy = ranked[0];
  const overloaded = ranked.filter(
    (r) =>
      r.sample.occupancy >
      (thresholds[school + '|' + r.zone.id] ?? r.zone.threshold),
  );
  const previous = Math.round(sample.occupancy * 0.84);
  const change = comparableChange(sample.occupancy, previous);
  const addAction = () => {
    if (actionTitle.trim().length < 5 || owner.trim().length < 2) {
      setNotice('Enter an action and a responsible team.');
      return;
    }
    setActions((a) => [
      {
        id: crypto.randomUUID(),
        school,
        zone: zone.name,
        title: actionTitle.trim(),
        owner: owner.trim(),
        window: insightWindows[slot].time,
        done: false,
      },
      ...a,
    ]);
    setActionTitle('');
    setNotice('Action added to the school planning list. No message sent.');
  };
  const flag = () => {
    if (!available) return;
    const id = 'STAFF-HEAT-' + crypto.randomUUID().slice(0, 8),
      date = new Date();
    onAlert({
      id,
      school,
      category: 'Crowd threshold review',
      zone: zone.name,
      block: 'Campus insights',
      camera:
        cameras.find((c) => c.school === school && c.zone === zone.name)?.id ||
        'Demo',
      severity: sample.occupancy > threshold ? 'High' : 'Medium',
      confidence: 0,
      time: date.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
      status: 'Open',
      validation: 'Pending',
      assigned: owner.trim() || 'Duty teacher team',
      description: `Fictional ${insightWindows[slot].time} observation: ${sample.occupancy} estimated people, operational threshold ${threshold}. This is not a certified capacity or a real-time count. Staff requested a crowd review.`,
      history: [
        {
          text: 'Staff requested review from synthetic campus heatmap',
          actor: 'Campus insights · Demo',
          time: 'Now',
        },
      ],
    });
    setLastAlert(id);
    setNotice('Sample crowd concern created. Review it in the incident queue.');
  };
  const exportData = () => {
    const rows = [
      [
        'school',
        'zone',
        'window',
        'coverage',
        'estimated_people',
        'entries',
        'exits',
        'average_dwell_minutes',
        'operational_threshold',
      ],
      ...campusZones.map((z) => {
        const s = zoneSample(school, z.id, slot),
          ok = isAvailable(z.name);
        return [
          school,
          z.name,
          insightWindows[slot].time,
          ok ? 'Synthetic sample' : 'Unavailable',
          ok ? s.occupancy : '',
          ok ? s.entries : '',
          ok ? s.exits : '',
          ok ? s.dwell : '',
          thresholds[school + '|' + z.id] ?? z.threshold,
        ];
      }),
    ];
    const url = URL.createObjectURL(
      new Blob(
        [
          rows
            .map((r) => r.map((c) => csvCell(String(c))).join(','))
            .join('\n'),
        ],
        { type: 'text/csv' },
      ),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiwas-campus-observation.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="campus-insights">
      <section className="campus-hero">
        <div>
          <span className="campus-kicker">EVERY CAMERA, EVERYDAY VALUE</span>
          <h2>A clearer picture of the school day.</h2>
          <p>
            See where people gather, when movement peaks and where staff
            attention makes a difference.
          </p>
        </div>
        <Map size={48} />
      </section>
      <div className="campus-toolbar">
        <label>
          Observation window
          <select
            aria-label="Campus observation window"
            value={slot}
            onChange={(e) => {
              setSlot(Number(e.target.value));
              setPlaying(false);
            }}
          >
            {insightWindows.map((w, i) => (
              <option key={w.time} value={i}>
                {w.time} · {w.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-secondary" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause size={16} /> : <Play size={16} />}{' '}
          {playing ? 'Pause replay' : 'Replay sample day'}
        </button>
        <button className="btn-secondary" onClick={exportData}>
          <Download size={16} /> Export window
        </button>
        <span className="badge blue">Synthetic data · MYT</span>
      </div>
      <div className="campus-stats">
        <div>
          <Users size={19} />
          <span>Busiest observed zone</span>
          <strong>{busy?.zone.name || 'No coverage'}</strong>
          <small>
            {busy
              ? busy.sample.occupancy + ' estimated people'
              : 'No valid observations'}
          </small>
        </div>
        <div>
          <ArrowUpRight size={19} />
          <span>Above review threshold</span>
          <strong>{overloaded.length} zones</strong>
          <small>Operational setting, not certified capacity</small>
        </div>
        <div>
          <Video size={19} />
          <span>Observable zones</span>
          <strong>
            {availableZones.length} / {campusZones.length}
          </strong>
          <small>Offline areas stay unknown</small>
        </div>
        <div>
          <ChartNoAxesCombined size={19} />
          <span>Canteen queue</span>
          <strong>
            {isAvailable('Canteen')
              ? zoneSample(school, 'canteen', slot).queue + ' people'
              : 'Unavailable'}
          </strong>
          <small>Estimated canteen queue in this sample</small>
        </div>
      </div>
      <Tabs defaultValue="heatmap">
        <TabsList>
          <TabsTrigger value="heatmap">Campus heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trends & movement</TabsTrigger>
          <TabsTrigger value="planning">School planning</TabsTrigger>
          <TabsTrigger value="definitions">What the numbers mean</TabsTrigger>
        </TabsList>
        <TabsContent value="heatmap">
          <div className="campus-grid">
            <section className="panel campus-map-panel">
              <div className="campus-section-title">
                <div>
                  <h2>People across the campus</h2>
                  <p>
                    {insightWindows[slot].time} · {insightWindows[slot].label} ·
                    Select a section
                  </p>
                </div>
                <select
                  aria-label="Heatmap metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as HeatMetric)}
                >
                  <option value="occupancy">Estimated occupancy</option>
                  <option value="crossings">Movement volume</option>
                  <option value="dwell">Average dwell</option>
                </select>
              </div>
              <div
                className="campus-map"
                aria-label="Illustrative school zone heatmap"
              >
                {campusZones.map((z) => {
                  const s = zoneSample(school, z.id, slot),
                    ok = isAvailable(z.name),
                    value = ok ? heatValue(s, metric) : null;
                  return (
                    <button
                      key={z.id}
                      style={{
                        gridArea: z.area,
                        background: heatColor(value, metric),
                      }}
                      className={
                        'campus-zone ' +
                        (selected === z.id ? 'selected' : '') +
                        (value !== null && value / heatScale[metric].max > 0.85
                          ? ' intense'
                          : '')
                      }
                      aria-pressed={selected === z.id}
                      aria-label={`${z.name}: ${value === null ? 'coverage unavailable' : value + ' ' + heatScale[metric].unit}`}
                      onClick={() => setSelected(z.id)}
                    >
                      <span>{z.name}</span>
                      <strong>{value === null ? '—' : value}</strong>
                      <small>
                        {value === null
                          ? 'Coverage unavailable'
                          : metric === 'occupancy'
                            ? 'estimated people'
                            : metric === 'crossings'
                              ? 'crossings / 15 min'
                              : 'minutes dwell'}
                      </small>
                    </button>
                  );
                })}
                <div className="campus-path">
                  CAMPUS WALKWAY · ILLUSTRATIVE LAYOUT
                </div>
              </div>
              <div className="campus-legend">
                <span>Lower activity</span>
                {[0, 0.15, 0.45, 0.7, 1].map((v) => (
                  <i
                    key={v}
                    style={{
                      background: heatColor(v * heatScale[metric].max, metric),
                    }}
                  />
                ))}
                <span>
                  {heatScale[metric].max}+ {heatScale[metric].unit}
                </span>
                <span className="campus-unknown">Grey = unavailable</span>
              </div>
              <p className="campus-footnote">
                This is a schematic of the six demonstration zones, not a
                surveyed school plan or a pixel-level camera heatmap. Counts
                from overlapping camera views must not be added into a campus
                population total.
              </p>
            </section>
            <aside className="panel campus-zone-detail">
              <div className="campus-camera">
                <CameraStill scene={zone.scene} overlay={false} />
                <span>
                  {available
                    ? 'Synthetic camera context'
                    : 'Current coverage unavailable'}
                </span>
              </div>
              <div className="campus-detail-body">
                <h2>{zone.name}</h2>
                <p>{zone.purpose}</p>
                <dl>
                  <div>
                    <dt>Estimated occupancy</dt>
                    <dd>{available ? sample.occupancy : 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Entries / exits · 15 min</dt>
                    <dd>
                      {available
                        ? sample.entries + ' / ' + sample.exits
                        : 'Unknown'}
                    </dd>
                  </div>
                  <div>
                    <dt>Average zone dwell</dt>
                    <dd>{available ? sample.dwell + ' min' : 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>vs comparable sample</dt>
                    <dd>
                      {available && change !== null
                        ? '+' + change + '%'
                        : 'Not available'}
                    </dd>
                  </div>
                </dl>
                <p className="campus-footnote">
                  Comparison uses a fictional matched observation, not a
                  measured improvement.
                </p>
                <label>
                  Operational occupancy threshold
                  <input
                    aria-label="Operational occupancy threshold"
                    type="number"
                    min={1}
                    max={1000}
                    value={draft}
                    onChange={(e) => setDraft(Number(e.target.value))}
                  />
                </label>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const error = thresholdError(draft);
                    if (error) {
                      setNotice(error);
                      return;
                    }
                    setThresholds((t) => ({ ...t, [key]: draft }));
                    setNotice(
                      'Threshold saved for this school and zone in this session.',
                    );
                  }}
                >
                  Save threshold
                </button>
                <button
                  className="btn-primary"
                  disabled={!available}
                  onClick={flag}
                >
                  Request crowd review
                </button>
                {lastAlert && (
                  <button
                    className="btn-secondary"
                    onClick={() => onOpen(lastAlert)}
                  >
                    Open created concern
                  </button>
                )}
                <output>{notice}</output>
              </div>
            </aside>
          </div>
        </TabsContent>
        <TabsContent value="trends">
          <section className="panel campus-map-panel">
            <div className="campus-section-title">
              <div>
                <h2>How the day changes</h2>
                <p>
                  Six separate 15-minute samples · not a continuous daily total
                </p>
              </div>
              <select
                aria-label="Trend zone"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {campusZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="campus-trend">
              {insightWindows.map((w, i) => {
                const s = zoneSample(school, selected, i);
                return (
                  <button
                    key={w.time}
                    className={i === slot ? 'active' : ''}
                    onClick={() => {
                      setSlot(i);
                      setPlaying(false);
                    }}
                    aria-label={`${w.time} ${available ? s.occupancy + ' estimated people' : 'unavailable'}`}
                  >
                    <strong>{available ? s.occupancy : '—'}</strong>
                    <div className="campus-bar-track">
                      <i
                        style={{
                          height: available
                            ? Math.max(2, (s.occupancy / 150) * 100) + '%'
                            : '2%',
                          background: available
                            ? heatColor(s.occupancy, 'occupancy')
                            : '#e3e8ee',
                        }}
                      />
                    </div>
                    <span>{w.time}</span>
                    <small>{w.label}</small>
                  </button>
                );
              })}
            </div>
            <div className="campus-insight-strip">
              <div>
                <strong>{available ? summary.peak : 'Unknown'}</strong>
                <span>
                  Peak sampled occupancy
                  {available
                    ? ' · ' + insightWindows[summary.peakSlot].time
                    : ''}
                </span>
              </div>
              <div>
                <strong>
                  {available
                    ? summary.overThresholdSamples + ' / 6'
                    : 'Unknown'}
                </strong>
                <span>Samples above operational threshold</span>
              </div>
              <div>
                <strong>
                  {available ? summary.occupiedSamples + ' / 6' : 'Unknown'}
                </strong>
                <span>Samples with at least 5 people</span>
              </div>
            </div>
          </section>
          <div className="campus-two">
            <section className="panel campus-map-panel">
              <h2>Movement at {insightWindows[slot].time}</h2>
              <p>Entries and exits are crossing events, not distinct pupils.</p>
              <div className="campus-flow">
                <div>
                  <span>Entering the zone</span>
                  <strong>{available ? sample.entries : '—'}</strong>
                </div>
                <ArrowUpRight />
                <div>
                  <span>Leaving the zone</span>
                  <strong>{available ? sample.exits : '—'}</strong>
                </div>
              </div>
              <p>
                {available
                  ? `${sample.entries - sample.exits} net crossings in this window. Opening occupancy and all entrances are required to estimate total occupancy from counters.`
                  : 'Restore observation coverage before interpreting flow.'}
              </p>
            </section>
            <section className="panel campus-map-panel">
              <h2>Arrival & dismissal</h2>
              <p>Main gate · selected observation window</p>
              <div className="campus-flow">
                <div>
                  <span>Vehicle arrivals</span>
                  <strong>
                    {isAvailable('Main gate')
                      ? zoneSample(school, 'gate', slot).vehicles
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span>Average vehicle dwell</span>
                  <strong>
                    {isAvailable('Main gate')
                      ? zoneSample(school, 'gate', slot).vehicleDwell + ' min'
                      : '—'}
                  </strong>
                </div>
              </div>
              <p>
                Use matched school-day samples to plan staggered collection and
                steward coverage. No number plates or driver identities are
                used.
              </p>
            </section>
          </div>
          <section className="panel campus-map-panel">
            <h2>Where observation is strongest</h2>
            <div className="campus-table">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Coverage</th>
                    <th>People estimate</th>
                    <th>Movement events</th>
                    <th>Review threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {campusZones.map((z) => {
                    const ok = isAvailable(z.name),
                      s = zoneSample(school, z.id, slot);
                    return (
                      <tr key={z.id}>
                        <td>
                          <button
                            className="text-btn"
                            onClick={() => setSelected(z.id)}
                          >
                            {z.name}
                          </button>
                        </td>
                        <td>{ok ? 'Sample available' : 'Unavailable'}</td>
                        <td>{ok ? s.occupancy : 'Unknown'}</td>
                        <td>{ok ? s.entries + s.exits : 'Unknown'}</td>
                        <td>
                          {thresholds[school + '|' + z.id] ?? z.threshold}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="planning">
          <div className="campus-two">
            <section className="panel campus-map-panel">
              <h2>Turn an observation into a school action</h2>
              <p>
                Choose a zone and create a staff-owned plan. These are planning
                suggestions, not automatic decisions.
              </p>
              <label>
                Planning zone
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {campusZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="campus-suggestion">
                <strong>{zone.name}</strong>
                <p>
                  {available
                    ? zone.purpose
                    : 'Coverage is unavailable. Arrange a manual observation before making a crowd or staffing decision.'}
                </p>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setActionTitle(
                      available
                        ? zone.purpose
                        : 'Arrange a manual observation and restore coverage.',
                    )
                  }
                >
                  Use suggested action
                </button>
              </div>
              <label>
                Action
                <input
                  aria-label="Campus planning action"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. Trial a second serving lane at break"
                />
              </label>
              <label>
                Responsible team
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </label>
              <p>
                Observation window: {insightWindows[slot].time} ·{' '}
                {insightWindows[slot].label}
              </p>
              <button className="btn-primary" onClick={addAction}>
                Add school action
              </button>
              <output>{notice}</output>
            </section>
            <section className="panel campus-map-panel">
              <h2>School action list</h2>
              <p>
                Use comparable observations to assess a change before adopting
                it.
              </p>
              {!actions.some((a) => a.school === school) && (
                <p className="campus-empty">
                  No actions yet. Start with a busy queue, a gate bottleneck or
                  a coverage gap.
                </p>
              )}
              {actions
                .filter((a) => a.school === school)
                .map((a) => (
                  <article className="campus-action" key={a.id}>
                    <span className={'badge ' + (a.done ? 'green' : 'blue')}>
                      {a.done ? 'Reviewed' : 'Planned'}
                    </span>
                    <h3>{a.title}</h3>
                    <p>
                      {a.zone} · {a.window} · {a.owner}
                    </p>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setActions((all) =>
                          all.map((x) =>
                            x.id === a.id ? { ...x, done: !x.done } : x,
                          ),
                        )
                      }
                    >
                      <Check size={15} />
                      {a.done ? 'Reopen action' : 'Mark reviewed'}
                    </button>
                  </article>
                ))}
            </section>
          </div>
          <section className="panel campus-map-panel">
            <h2>More value from the camera network</h2>
            <div className="campus-opportunities">
              {[
                [
                  'Canteen service',
                  'Queue length and zone dwell guide serving lanes; POS data would be needed to forecast meals accurately.',
                ],
                [
                  'Duty planning',
                  'Use recurring movement peaks to place adults where congestion is observed.',
                ],
                [
                  'Timetable transitions',
                  'Compare like-for-like class-change samples before and after staggered release.',
                ],
                [
                  'Space use',
                  'Compare observed occupancy with bookings; entrances can be measured without classroom surveillance.',
                ],
                [
                  'School events',
                  'Plan gate and assembly coverage from comparable events and known blind spots.',
                ],
                [
                  'Camera investment',
                  'Prioritise blind spots and overlapping views, rather than buying cameras by count alone.',
                ],
              ].map(([title, text]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="definitions">
          <section className="panel campus-map-panel">
            <h2>Useful statistics, with honest boundaries</h2>
            <dl className="campus-definitions">
              {[
                [
                  'Occupancy',
                  'Estimated people in a defined visible area at one instant. Overlapping views need deduplication before aggregation.',
                ],
                [
                  'Movement volume',
                  'Entries plus exits during a 15-minute window. The same person may cross many times.',
                ],
                [
                  'Dwell',
                  'Average time for anonymous tracks observed in a zone. It is not automatically queue wait or learning engagement.',
                ],
                [
                  'Queue length',
                  'Estimated people inside a defined service queue. Waiting time needs a validated queue-specific method.',
                ],
                [
                  'Space usage',
                  'Here, the number of sampled windows with at least five people; it is not a daily utilisation percentage.',
                ],
                [
                  'Coverage',
                  'A missing or offline camera produces unknown values, not zero people. Real freshness checks need capture timestamps.',
                ],
                [
                  'Comparison',
                  'A fictional matched comparison demonstrates the UI. It is not evidence of savings or improved safety.',
                ],
                [
                  'Privacy',
                  'No named movement histories, face matching, engagement scoring or biometric attendance. Attendance remains a separate verified register.',
                ],
              ].map(([term, meaning]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        </TabsContent>
      </Tabs>
      <p className="campus-footnote">
        Fictional school-day samples · Session-only settings and actions · No
        live camera analytics, messages or physical controls
      </p>
    </div>
  );
}
