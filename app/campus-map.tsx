'use client';
// SVG interactive groups need button roles: HTML buttons are not valid SVG children.
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
import { useState } from 'react';
import {
  Plus,
  Minus,
  RotateCcw,
  Users,
  Video,
  Layers,
  ArrowUpRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import { mapAreas, clusterCounts, mapDots } from './campus-map-data';
import {
  campusZones,
  zoneSample,
  heatValue,
  heatColor,
  type HeatMetric,
} from './campus-insights-data';
import { DemoVideo } from './camera-media';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Camera, Incident } from './data';
type Props = {
  school: string;
  slot: number;
  metric: HeatMetric;
  selected: string;
  cameras: Camera[];
  incidents: Incident[];
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
};
export function CampusMap({
  school,
  slot,
  metric,
  selected,
  cameras,
  incidents,
  onSelect,
  onOpen,
}: Props) {
  const [zoom, setZoom] = useState(1),
    [people, setPeople] = useState(true),
    [heat, setHeat] = useState(true),
    [showCameras, setShowCameras] = useState(true),
    [alerts, setAlerts] = useState(true),
    [detail, setDetail] = useState<string | null>(null),
    [clip, setClip] = useState(false),
    [cluster, setCluster] = useState<number | null>(null);
  const [frame, setFrame] = useState(school + '|' + slot);
  if (frame !== school + '|' + slot) {
    setFrame(school + '|' + slot);
    setCluster(null);
    setClip(false);
  }
  const current = mapAreas.find((a) => a.id === detail),
    observed = campusZones.find((z) => z.id === detail),
    camera = cameras.find(
      (c) => c.school === school && c.zone === current?.name,
    ),
    ok = !!camera?.online;
  const data = observed ? zoneSample(school, observed.id, slot) : null;
  const linked = incidents.filter(
    (i) =>
      i.school === school && i.zone === current?.name && i.status !== 'Closed',
  );
  const choose = (id: string, c: number | null = null) => {
    setDetail(id);
    setCluster(c);
    if (campusZones.some((z) => z.id === id)) onSelect(id);
  };
  return (
    <div className="atlas">
      <div className="atlas-toolbar">
        <div className="atlas-layer-controls">
          {[
            [people, setPeople, 'People', Users],
            [heat, setHeat, 'Density', Layers],
            [showCameras, setShowCameras, 'Cameras', Video],
            [alerts, setAlerts, 'Alerts', ShieldAlert],
          ].map(([value, setter, label, Icon]) => {
            const I = Icon as typeof Users;
            return (
              <button
                key={String(label)}
                aria-pressed={!!value}
                onClick={() => {
                  (setter as (v: boolean) => void)(!value);
                }}
              >
                <I size={14} />
                {String(label)}
              </button>
            );
          })}
        </div>
        <div className="atlas-zoom">
          <button
            aria-label="Zoom out campus map"
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
          >
            <Minus size={15} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            aria-label="Zoom in campus map"
            disabled={zoom >= 2}
            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
          >
            <Plus size={15} />
          </button>
          <button
            aria-label="Reset campus map"
            onClick={() => {
              setZoom(1);
              setDetail(null);
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div className="atlas-viewport">
        <div
          className="atlas-canvas"
          style={{ width: `${zoom * 100}%`, minWidth: 680 }}
        >
          <svg
            viewBox="0 0 1000 680"
            aria-label="Interactive two-dimensional school campus plan"
            className="atlas-svg"
          >
            <defs>
              <pattern
                id="atlas-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M20 0H0V20"
                  fill="none"
                  stroke="#dbe3dc"
                  strokeWidth=".6"
                />
              </pattern>
              <pattern
                id="atlas-unknown"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="#edf0ee" />
                <path d="M0 0V8" stroke="#d8dfd9" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="1000" height="680" fill="#f1f4ee" />
            <rect width="1000" height="680" fill="url(#atlas-grid)" />
            <rect
              x="55"
              y="72"
              width="915"
              height="560"
              rx="14"
              fill="#f9faf6"
              stroke="#b7c9b7"
              strokeWidth="2"
              strokeDasharray="7 5"
            />
            <path
              d="M70 322H878M565 215V550M75 485H875M270 310V615"
              stroke="#e2e4dd"
              strokeWidth="22"
              fill="none"
            />
            <path
              d="M70 322H878M565 215V550M75 485H875"
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray="7 7"
              fill="none"
            />
            <rect x="0" y="642" width="1000" height="38" fill="#cfd3d1" />
            <path
              d="M0 660H1000"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="20 15"
            />
            <text x="340" y="637" className="atlas-road-label">
              JALAN SEKOLAH · DROP-OFF & PICK-UP
            </text>
            {[80, 200, 330, 450, 600, 720, 850, 940].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy="48" r={i % 2 ? 13 : 17} fill="#d1e2c6" />
                <circle cx={x - 4} cy="44" r="8" fill="#bed5b1" />
              </g>
            ))}
            <text x="68" y="32" className="atlas-plan-title">
              CAMPUS / GROUND LEVEL
            </text>
            <g transform="translate(936 28)">
              <path d="M0 20L8 0L16 20L8 15Z" fill="#59695e" />
              <text x="8" y="-8" textAnchor="middle" className="atlas-small">
                N
              </text>
            </g>
            {mapAreas.map((a, index) => {
              const z = campusZones.find((z) => z.id === a.id),
                c = cameras.find(
                  (c) => c.school === school && c.zone === a.name,
                ),
                available = !!z && !!c?.online,
                s = z ? zoneSample(school, z.id, slot) : null,
                count = available ? s!.occupancy : null,
                clusters = count === null ? [] : clusterCounts(count),
                events = incidents.filter(
                  (i) =>
                    i.school === school &&
                    i.zone === a.name &&
                    i.status !== 'Closed',
                );
              return (
                <g key={a.id}>
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${a.name}: ${count === null ? 'coverage unavailable' : heatValue(s!, metric) + ' ' + (metric === 'occupancy' ? 'estimated people' : metric === 'crossings' ? 'crossings' : 'minutes dwell')}`}
                    onClick={() => choose(a.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        choose(a.id);
                      }
                    }}
                    className="atlas-area"
                  >
                    <rect
                      x={a.x}
                      y={a.y}
                      width={a.w}
                      height={a.h}
                      rx="7"
                      fill={
                        !available
                          ? 'url(#atlas-unknown)'
                          : heat
                            ? heatColor(heatValue(s!, metric), metric)
                            : '#fff'
                      }
                      stroke={
                        selected === a.id || detail === a.id
                          ? '#c4374d'
                          : '#b8c4bd'
                      }
                      strokeWidth={
                        selected === a.id || detail === a.id ? 3 : 1.5
                      }
                    />
                    {a.id === 'classrooms' &&
                      [1, 2, 3, 4, 5].map((v) => (
                        <path
                          key={v}
                          d={`M${a.x + v * 69} ${a.y + 28}V${a.y + a.h}`}
                          stroke="#c3ccc4"
                        />
                      ))}
                    {a.id === 'field' && (
                      <g stroke="#c3cdbf" fill="none">
                        <rect
                          x={a.x + 15}
                          y={a.y + 29}
                          width={a.w - 30}
                          height={a.h - 42}
                        />
                        <path
                          d={`M${a.x + a.w / 2} ${a.y + 29}V${a.y + a.h - 13}`}
                        />
                        <circle cx={a.x + a.w / 2} cy={a.y + 65} r="19" />
                      </g>
                    )}
                    {a.id === 'canteen' &&
                      [0, 1, 2].map((i) => (
                        <g key={i} fill="#ffffff65">
                          <rect
                            x={a.x + 20 + i * 58}
                            y={a.y + 42}
                            width="38"
                            height="12"
                            rx="3"
                          />
                          <rect
                            x={a.x + 20 + i * 58}
                            y={a.y + 84}
                            width="38"
                            height="12"
                            rx="3"
                          />
                        </g>
                      ))}
                    <rect
                      x={a.x + 5}
                      y={a.y + 5}
                      width={a.w - 10}
                      height="23"
                      rx="4"
                      fill="#ffffffed"
                    />
                    <text
                      x={a.x + 12}
                      y={a.y + 21}
                      className="atlas-building-label"
                      transform={
                        a.w < 100
                          ? `rotate(90 ${a.x + 12} ${a.y + 21})`
                          : undefined
                      }
                    >
                      {a.id === 'toilets' ? 'Private' : a.name}
                    </text>
                    {people &&
                      available &&
                      mapDots(count!, a.w, a.h, index + slot).map((p, i) => (
                        <circle
                          key={i}
                          cx={a.x + p.x}
                          cy={a.y + p.y}
                          r="2.2"
                          fill="#7b2338"
                          opacity=".55"
                        />
                      ))}
                  </g>
                  {people &&
                    clusters.map((n, i) => (
                      <g
                        key={i}
                        role="button"
                        tabIndex={0}
                        aria-label={`${a.name} cluster ${i + 1}: ${n} anonymous people`}
                        onClick={() => choose(a.id, i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            choose(a.id, i);
                          }
                        }}
                        className="atlas-cluster"
                      >
                        <circle
                          cx={a.x + (a.w * (i + 1)) / (clusters.length + 1)}
                          cy={a.y + a.h * 0.65}
                          r={n > 30 ? 22 : 17}
                          fill="#fff"
                          stroke="#b72945"
                          strokeWidth="2"
                        />
                        <text
                          x={a.x + (a.w * (i + 1)) / (clusters.length + 1)}
                          y={a.y + a.h * 0.65 + 4}
                          textAnchor="middle"
                        >
                          {n}
                        </text>
                      </g>
                    ))}
                  {showCameras && c && (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect ${c.id} at ${a.name}`}
                      onClick={() => choose(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') choose(a.id);
                      }}
                      className="atlas-camera-marker"
                    >
                      <rect
                        x={a.x + a.w - 23}
                        y={a.y + a.h - 20}
                        width="28"
                        height="23"
                        rx="6"
                        fill={c.online ? '#315e91' : '#7f8790'}
                      />
                      <path
                        d={`M${a.x + a.w - 17} ${a.y + a.h - 14}h10v10h-10zM${a.x + a.w - 7} ${a.y + a.h - 11}l5-3v10l-5-3`}
                        fill="white"
                      />
                    </g>
                  )}
                  {alerts && events.length > 0 && (
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`${a.name}: ${events.length} open incidents`}
                      onClick={() => choose(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') choose(a.id);
                      }}
                    >
                      <circle
                        cx={a.x + a.w - 8}
                        cy={a.y + 8}
                        r="11"
                        fill="#c53548"
                      />
                      <text
                        x={a.x + a.w - 8}
                        y={a.y + 12}
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {events.length}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            <text x="70" y="618" className="atlas-small">
              ENTRY →
            </text>
            <text x="310" y="535" className="atlas-small">
              COVERED WALKWAY
            </text>
            <text x="114" y="212" className="atlas-small">
              CLASSROOMS A1–A6
            </text>
          </svg>
        </div>
      </div>
      <div className="atlas-bottom">
        <span>
          <i /> Anonymous people · synthetic positions
        </span>
        <span>Drag scrollbar to explore · Click a cluster to inspect</span>
      </div>
      {current && (
        <section className="atlas-inspector">
          <div className="atlas-inspector-heading">
            <div>
              <small>
                {current.kind}{' '}
                {cluster !== null ? ` / Cluster ${cluster + 1}` : ''}
              </small>
              <h3>{current.name}</h3>
            </div>
            <button
              className="icon-btn"
              aria-label="Close zone inspector"
              onClick={() => setDetail(null)}
            >
              <X size={17} />
            </button>
          </div>
          <div className="atlas-inspector-stats">
            <div>
              <strong>
                {ok && data
                  ? cluster === null
                    ? data.occupancy
                    : clusterCounts(data.occupancy)[cluster]
                  : '—'}
              </strong>
              <span>
                {cluster === null ? 'Estimated people' : 'People in cluster'}
              </span>
            </div>
            <div>
              <strong>{ok && data ? data.dwell + 'm' : '—'}</strong>
              <span>Zone average dwell</span>
            </div>
            <div>
              <strong>
                {camera
                  ? camera.online
                    ? 'Online'
                    : 'Offline'
                  : 'No coverage'}
              </strong>
              <span>{camera?.id || 'Not monitored'}</span>
            </div>
          </div>
          <p>
            {ok
              ? 'Counts describe anonymous observations. Dots are illustrative positions, not identified students or individual tracking.'
              : current.id === 'toilets'
                ? 'Private space: no cameras or interior tracking. Entrance counting, if installed outside, requires separate calibration.'
                : 'No current observations for this area. Do not assume it is empty.'}
          </p>
          {ok && observed && (
            <button className="btn" onClick={() => setClip(true)}>
              <Video size={15} /> Inspect camera sample
            </button>
          )}
          {linked.map((i) => (
            <button
              key={i.id}
              className="atlas-incident-link"
              onClick={() => onOpen(i.id)}
            >
              <span>
                <b>{i.category}</b>
                <small>
                  {i.id} · {i.severity} · {i.status}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
          {!linked.length && (
            <small className="atlas-no-events">
              No open incidents recorded in this zone.
            </small>
          )}
        </section>
      )}
      <Dialog open={clip} onOpenChange={setClip}>
        <DialogContent>
          <DialogTitle>{current?.name} · Camera sample</DialogTitle>
          <DialogDescription>
            Staged footage, not a live feed. Return to the zone to open any
            associated incident.
          </DialogDescription>
          {observed && <DemoVideo scene={observed.scene} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
