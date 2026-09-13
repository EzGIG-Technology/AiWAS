'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Camera as CameraIcon,
  Grid2x2,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CameraStill, mediaFor } from './camera-media';
import { severityClass, type Camera, type Incident } from './data';
import { getIndustry } from './industries';
import { CONFIDENCE_NONE } from './industry-seed';

const GRIDS = [
  { id: '2x2', slots: 4 },
  { id: '3x3', slots: 9 },
  { id: '4x4', slots: 16 },
];

const FILTERS = ['All', 'Active', 'Critical', 'High'] as const;
type Filter = (typeof FILTERS)[number];

/** Synthetic but stable stream addresses for the demonstration console. */
function streamAddress(camera: Camera, index: number) {
  return `192.168.50.${10 + index}`;
}

/**
 * Security Operations Room.
 *
 * The operator console: camera estate on the left, video wall in the middle,
 * live event queue on the right. Two platform rules are enforced here rather
 * than left to the operator's judgement. An offline camera renders as an
 * explicit loss-of-signal tile, never a dark rectangle that reads as a quiet
 * room. And a confidence figure is shown only for a video candidate - a sensor
 * event or a reported concern says so instead of carrying a number.
 */
export function SecurityOperationsRoom({
  industryId,
  site,
  cameras,
  incidents,
  operator,
  onOpenIncident,
  onAcknowledge,
}: {
  industryId: string;
  site: string;
  cameras: Camera[];
  incidents: Incident[];
  operator: string;
  onOpenIncident: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const industry = getIndustry(industryId);
  const siteCameras = useMemo(
    () => cameras.filter((c) => c.school === site),
    [cameras, site],
  );
  const siteIncidents = useMemo(
    () => incidents.filter((i) => i.school === site),
    [incidents, site],
  );

  const [grid, setGrid] = useState('2x2');
  const [wall, setWall] = useState<string[]>(() =>
    siteCameras
      .filter((c) => c.online)
      .slice(0, 4)
      .map((c) => c.id),
  );
  const [cameraQuery, setCameraQuery] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [eventQuery, setEventQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [audio, setAudio] = useState(false);
  const [clock, setClock] = useState('--:--:--');
  const [log, setLog] = useState<string[]>([]);

  const slots = GRIDS.find((g) => g.id === grid)?.slots ?? 4;

  // Operator clock. Rendered after mount so server and client markup agree.
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kuala_Lumpur',
        }),
      );
    tick();
    const t = window.setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const online = siteCameras.filter((c) => c.online);
  const offline = siteCameras.filter((c) => !c.online);
  const recording = online;

  const visibleCameras = siteCameras.filter(
    (c) =>
      (!onlineOnly || c.online) &&
      `${c.id} ${c.zone} ${c.block}`
        .toLowerCase()
        .includes(cameraQuery.toLowerCase()),
  );

  const openEvents = siteIncidents.filter((i) => i.status !== 'Closed');
  const critical = openEvents.filter((i) => i.severity === 'Critical');
  const high = openEvents.filter((i) => i.severity === 'High');

  const visibleEvents = siteIncidents
    .filter((i) => {
      if (filter === 'Active') return i.status !== 'Closed';
      if (filter === 'Critical') return i.severity === 'Critical';
      if (filter === 'High') return i.severity === 'High';
      return true;
    })
    .filter((i) =>
      `${i.category} ${i.zone} ${i.id}`
        .toLowerCase()
        .includes(eventQuery.toLowerCase()),
    );

  const snapshot =
    siteIncidents.find((i) => i.id === selectedEvent) ?? visibleEvents[0];

  const note = (text: string) =>
    setLog((l) => [`${clock} · ${text}`, ...l].slice(0, 6));

  const addToWall = (id: string) => {
    if (wall.includes(id)) return;
    if (wall.length >= slots) {
      note(`Wall is full at ${grid}. Remove a stream or use a larger grid.`);
      return;
    }
    setWall((w) => [...w, id]);
  };

  const capabilityKind = (category: string) =>
    industry.capabilities.find((c) => c.name === category)?.kind ??
    'Video candidate';

  return (
    <div className="sor">
      <header className="sor-topbar">
        <div className="sor-topbar-left">
          <span className="sor-app">AIWAS · SOR v3.0</span>
          <button
            type="button"
            className="sor-mini"
            onClick={() =>
              note(
                'Connection check simulated. No live stream service is connected.',
              )
            }
          >
            <RefreshCw size={13} /> Connect
          </button>
          <button
            type="button"
            className="sor-mini"
            onClick={() => note('Camera estate refreshed.')}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <span className="sor-grid-pick">
            Grid:
            {GRIDS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={'sor-chip' + (grid === g.id ? ' current' : '')}
                aria-pressed={grid === g.id}
                onClick={() => {
                  setGrid(g.id);
                  setWall((w) => w.slice(0, g.slots));
                }}
              >
                {g.id}
              </button>
            ))}
          </span>
        </div>
        <span className="sor-title">SECURITY OPERATIONS ROOM</span>
        <div className="sor-topbar-right">
          <button
            type="button"
            className="sor-mini"
            aria-pressed={audio}
            onClick={() => setAudio((a) => !a)}
          >
            {audio ? <Volume2 size={13} /> : <VolumeX size={13} />} Audio
            preview
          </button>
        </div>
      </header>

      <div className="sor-body">
        {/* ---------------------------------------------------- cameras */}
        <aside className="sor-panel sor-cameras">
          <div className="sor-panel-head">
            <h3>CAMERAS</h3>
          </div>
          <ul className="sor-stats">
            <li>
              <i className="dot grey" />
              Total: <strong>{siteCameras.length}</strong>
            </li>
            <li>
              <i className="dot green" />
              Online: <strong>{online.length}</strong>
            </li>
            <li>
              <i className="dot red" />
              Offline: <strong>{offline.length}</strong>
            </li>
            <li>
              <i className="dot amber" />
              Sample feeds: <strong>{recording.length}</strong>
            </li>
          </ul>
          <label className="sor-search" htmlFor="sor-camera-search">
            <Search size={13} />
            <input
              id="sor-camera-search"
              placeholder="Search cameras…"
              value={cameraQuery}
              onChange={(e) => setCameraQuery(e.target.value)}
            />
          </label>
          <label className="sor-check" htmlFor="sor-online-only">
            <input
              id="sor-online-only"
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
            />
            Show online only
          </label>
          <ul className="sor-camera-list">
            {visibleCameras.map((c, i) => (
              <li key={c.id} className={c.online ? '' : 'offline'}>
                <span className={'dot ' + (c.online ? 'green' : 'red')} />
                <div>
                  <strong>{c.zone}</strong>
                  <small>{c.block}</small>
                  <small className="mono">{streamAddress(c, i)}</small>
                  <small className="mono">
                    {c.online ? `${c.fps} FPS · ${c.latency} ms` : 'No signal'}
                  </small>
                </div>
                <div className="sor-camera-actions">
                  <button
                    type="button"
                    aria-label={`Add ${c.zone} to the wall`}
                    disabled={wall.includes(c.id)}
                    onClick={() => addToWall(c.id)}
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${c.zone} from the wall`}
                    disabled={!wall.includes(c.id)}
                    onClick={() => setWall((w) => w.filter((x) => x !== c.id))}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
            {visibleCameras.length === 0 && (
              <li className="sor-empty">No camera matches that filter.</li>
            )}
          </ul>
          <div className="sor-panel-foot">
            <button
              type="button"
              className="sor-mini"
              onClick={() => note('Camera list refreshed.')}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              type="button"
              className="sor-mini"
              onClick={() =>
                note(
                  'Camera registration requires commissioning; not available in the demonstration.',
                )
              }
            >
              <Plus size={12} /> Add Camera
            </button>
          </div>
        </aside>

        {/* ------------------------------------------------- video wall */}
        <section className="sor-panel sor-wall">
          <div className="sor-panel-head">
            <h3>VIDEO MONITORING</h3>
            <span className="sor-count">{wall.length} Active Streams</span>
          </div>
          <div className="sor-wall-bar">
            <span>
              Grid Layout: <strong>{grid}</strong>
            </span>
            <span>
              Active:{' '}
              <strong>
                {wall.length} / {slots}
              </strong>{' '}
              slots
            </span>
            <button
              type="button"
              className="sor-mini"
              onClick={() => setWall([])}
            >
              Clear All
            </button>
            <button
              type="button"
              className="sor-mini"
              onClick={() => setWall(online.slice(0, slots).map((c) => c.id))}
            >
              <Grid2x2 size={12} /> Arrange
            </button>
          </div>
          <div className={'sor-grid g' + grid}>
            {Array.from({ length: slots }).map((_, i) => {
              const cam = siteCameras.find((c) => c.id === wall[i]);
              if (!cam)
                return (
                  <div key={i} className="sor-tile empty">
                    <span>Empty slot</span>
                  </div>
                );
              return (
                <div key={cam.id} className="sor-tile">
                  <div className="sor-tile-head">
                    <span className={'dot ' + (cam.online ? 'green' : 'red')} />
                    <strong>{cam.zone}</strong>
                    <div>
                      <button
                        type="button"
                        aria-label={`Expand ${cam.zone}`}
                        onClick={() =>
                          note(
                            `${cam.zone}: expanded view is not available in the demonstration.`,
                          )
                        }
                      >
                        <Maximize2 size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Close ${cam.zone}`}
                        onClick={() =>
                          setWall((w) => w.filter((x) => x !== cam.id))
                        }
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  {cam.online ? (
                    <div className="sor-tile-media">
                      <CameraStill scene={mediaFor(cam.zone)} />
                      <span className="sor-live">
                        <i /> LIVE · {cam.fps} FPS
                      </span>
                    </div>
                  ) : (
                    // An offline feed is a coverage gap, not a quiet room.
                    <div className="sor-tile-lost">
                      <CameraIcon size={20} />
                      <strong>Signal lost</strong>
                      <span>
                        Coverage unavailable. Do not read this area as clear —
                        request a patrol.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ----------------------------------------------------- events */}
        <aside className="sor-panel sor-events">
          <div className="sor-panel-head alert">
            <h3>EVENTS</h3>
            <span className="sor-count">{siteIncidents.length}</span>
          </div>
          <ul className="sor-stats">
            <li>
              <i className="dot grey" />
              Total: <strong>{siteIncidents.length}</strong>
            </li>
            <li>
              <i className="dot amber" />
              Active: <strong>{openEvents.length}</strong>
            </li>
            <li>
              <i className="dot red" />
              Critical: <strong>{critical.length}</strong>
            </li>
            <li>
              <i className="dot orange" />
              High: <strong>{high.length}</strong>
            </li>
          </ul>
          <label className="sor-search" htmlFor="sor-event-search">
            <Search size={13} />
            <input
              id="sor-event-search"
              placeholder="Search events…"
              value={eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
          </label>
          <div className="sor-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={'sor-chip' + (filter === f ? ' current' : '')}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="sor-event-list">
            {visibleEvents.map((i) => {
              const kind = capabilityKind(i.category);
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    className={selectedEvent === i.id ? 'current' : ''}
                    onClick={() => setSelectedEvent(i.id)}
                  >
                    <span className={'sor-sev ' + severityClass(i.severity)}>
                      {i.severity}
                    </span>
                    <strong>{i.category}</strong>
                    <small>
                      {i.zone} · {i.camera}
                    </small>
                    <small className="mono">
                      {kind === 'Video candidate' &&
                      i.confidence !== CONFIDENCE_NONE &&
                      i.confidence > 0 &&
                      !/^(SIM-|STAFF-)/.test(i.id)
                        ? `Confidence: ${i.confidence}%`
                        : `${kind} · no model score`}
                    </small>
                    <span className="sor-time">{i.time}</span>
                  </button>
                </li>
              );
            })}
            {visibleEvents.length === 0 && (
              <li className="sor-empty">No event matches that filter.</li>
            )}
          </ul>
          {snapshot && (
            <div className="sor-snapshot">
              <div className="sor-snapshot-head">Event Snapshot</div>
              <CameraStill scene={mediaFor(snapshot.zone, snapshot.category)} />
              <p className="sor-snapshot-meta">
                {snapshot.category} · {snapshot.zone} · {snapshot.time}
              </p>
              <p className="sor-snapshot-note">
                Illustrative context, not evidence of this event.
              </p>
              <div className="sor-snapshot-actions">
                <button
                  type="button"
                  className="sor-mini"
                  onClick={() => onOpenIncident(snapshot.id)}
                >
                  Open record
                </button>
                <button
                  type="button"
                  className="sor-mini"
                  disabled={
                    snapshot.acknowledged || snapshot.status === 'Closed'
                  }
                  onClick={() => {
                    onAcknowledge(snapshot.id);
                    note(`${snapshot.id} acknowledged by ${operator}.`);
                  }}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          )}
          <div className="sor-panel-foot">
            <button
              type="button"
              className="sor-mini"
              onClick={() => note('Event queue refreshed.')}
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              type="button"
              className="sor-mini"
              onClick={() => {
                setFilter('All');
                setEventQuery('');
                setSelectedEvent(null);
              }}
            >
              Clear filters
            </button>
            <button
              type="button"
              className="sor-mini"
              onClick={() =>
                note(
                  'No message was sent. External delivery is not connected in this build.',
                )
              }
            >
              <Bell size={12} /> Text Alert
            </button>
          </div>
        </aside>
      </div>

      <footer className="sor-statusbar">
        <span>
          <i className="dot green" /> Connected · demonstration data
        </span>
        <span>
          Cameras: {online.length} / {siteCameras.length}
        </span>
        <span>Events: {siteIncidents.length}</span>
        <span>Operator: {operator}</span>
        <span className="mono">Last update: {clock} MYT</span>
      </footer>

      {log.length > 0 && (
        <ul className="sor-log">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
