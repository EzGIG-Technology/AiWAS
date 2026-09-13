'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Boxes,
  Camera as CameraIcon,
  Compass,
  Eye,
  EyeOff,
  Siren,
  Users,
} from 'lucide-react';
import type { Camera, Incident } from './data.ts';
import {
  PLOT,
  layoutFor,
  occupancyFor,
  observationsFor,
  observationSummary,
  type ZoneOccupancy,
  type ZonePlate,
} from './site-layout.ts';

/** Plan units to screen pixels. */
const U = 7;

type Layer = 'occupancy' | 'coverage' | 'observations';

type Person = {
  id: string;
  name: string;
  className: string;
  status: string;
  last: string;
  source: string;
};

/**
 * Schematic 3D site view.
 *
 * Rendered with CSS 3D transforms rather than WebGL: the scene is a few dozen
 * extruded plates, so a renderer would add hundreds of kilobytes to a bundle
 * that is already flagged oversized, for no visual gain at this fidelity.
 */
export function SiteMap({
  industryId,
  site,
  cameras,
  incidents,
  people,
  canSeeObservations,
  onOpenIncident,
}: {
  industryId: string;
  site: string;
  cameras: Camera[];
  incidents: Incident[];
  people: Person[];
  canSeeObservations: boolean;
  onOpenIncident: (id: string) => void;
}) {
  const plates = layoutFor(industryId);
  const [yaw, setYaw] = useState(-28);
  const [pitch, setPitch] = useState(58);
  const [zoom, setZoom] = useState(0.82);
  const [layer, setLayer] = useState<Layer>('occupancy');
  const [selected, setSelected] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(
    null,
  );

  // A slow tick so estimated occupancy visibly moves. It re-derives the same
  // deterministic values; no data is fetched and no model runs.
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 4000);
    return () => clearInterval(t);
  }, [live]);

  const siteCameras = cameras.filter((c) => c.school === site);
  const offlineZones = siteCameras.filter((c) => !c.online).map((c) => c.zone);
  const occupancy = occupancyFor(industryId, plates, offlineZones, tick);
  const byZone = new Map(occupancy.map((o) => [o.zone, o]));

  const openIncidents = incidents.filter(
    (i) => i.school === site && i.status !== 'Closed',
  );

  const entrance =
    plates.find((p) => p.kind === 'service')?.zone ?? plates[0]?.zone ?? '';
  const observations = canSeeObservations
    ? observationsFor(people, plates, entrance)
    : [];
  const summary = observationSummary(observations);

  const covered = occupancy.filter((o) => o.covered).length;
  const known = occupancy.filter((o) => o.count !== null);
  const totalSeen = known.reduce((n, o) => n + (o.count ?? 0), 0);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, yaw, pitch };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setYaw(drag.current.yaw + dx * 0.4);
    setPitch(Math.min(85, Math.max(18, drag.current.pitch - dy * 0.3)));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const nudge = (dYaw: number, dPitch: number) => {
    setYaw((y) => y + dYaw);
    setPitch((p) => Math.min(85, Math.max(18, p + dPitch)));
  };

  const selectedPlate = plates.find((p) => p.zone === selected);
  const selectedOcc = selected ? byZone.get(selected) : undefined;
  const selectedCam = siteCameras.find((c) => c.zone === selected);
  const selectedIncidents = openIncidents.filter((i) => i.zone === selected);
  const selectedObs = observations.filter((o) => o.zone === selected);

  return (
    <div className="site-map">
      <section className="panel site-map-controls">
        <fieldset className="site-map-layers">
          <legend className="sr-only">Map layer</legend>
          {(
            [
              ['occupancy', 'Anonymous occupancy', Users],
              ['coverage', 'Camera coverage', CameraIcon],
              ...(canSeeObservations
                ? ([['observations', 'Last recorded observations', Compass]] as const)
                : []),
            ] as [Layer, string, typeof Users][]
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={'chip-btn' + (layer === id ? ' current' : '')}
              aria-pressed={layer === id}
              onClick={() => setLayer(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </fieldset>
        <div className="site-map-view">
          <button type="button" className="btn" onClick={() => nudge(-15, 0)}>
            Rotate left
          </button>
          <button type="button" className="btn" onClick={() => nudge(15, 0)}>
            Rotate right
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setYaw(-28);
              setPitch(58);
              setZoom(0.82);
            }}
          >
            Reset view
          </button>
          <button type="button" className="btn" onClick={() => setPitch(85)}>
            Plan view
          </button>
          <label className="site-map-zoom" htmlFor="site-zoom">
            Zoom
            <input
              id="site-zoom"
              type="range"
              min="50"
              max="140"
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
            />
          </label>
          <button
            type="button"
            className="btn"
            aria-pressed={live}
            onClick={() => setLive((v) => !v)}
          >
            {live ? <Eye size={14} /> : <EyeOff size={14} />}
            {live ? 'Estimates updating' : 'Estimates paused'}
          </button>
        </div>
      </section>

      <div className="site-map-body">
        <section className="panel site-stage-panel">
          <div
            className="site-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div
              className="site-stage-inner"
              style={{
                transform: `translate(-50%, -50%) rotateX(${pitch}deg) rotateZ(${yaw}deg) scale(${zoom})`,
              }}
            >
              <div
                className="site-ground"
                style={{ width: PLOT.w * U, height: PLOT.d * U }}
              />
              {plates.map((p) => (
                <Plate
                  key={p.zone}
                  plate={p}
                  occupancy={byZone.get(p.zone)}
                  layer={layer}
                  selected={selected === p.zone}
                  onSelect={() =>
                    setSelected((z) => (z === p.zone ? null : p.zone))
                  }
                />
              ))}

              {/* Billboard markers counter-rotate so they always face the viewer. */}
              {layer === 'occupancy' &&
                plates.map((p) => {
                  const o = byZone.get(p.zone);
                  if (!o) return null;
                  return (
                    <Billboard
                      key={'occ-' + p.zone}
                      plate={p}
                      yaw={yaw}
                      pitch={pitch}
                      lift={16}
                    >
                      <span
                        className={
                          'site-count ' + (o.covered ? o.pressure : 'unknown')
                        }
                      >
                        {o.count === null ? 'No coverage' : o.count}
                      </span>
                    </Billboard>
                  );
                })}

              {layer === 'coverage' &&
                siteCameras.map((c) => {
                  const p = plates.find((z) => z.zone === c.zone);
                  if (!p) return null;
                  return (
                    <Billboard
                      key={'cam-' + c.id}
                      plate={p}
                      yaw={yaw}
                      pitch={pitch}
                      lift={20}
                    >
                      <span
                        className={'site-cam ' + (c.online ? 'online' : 'offline')}
                      >
                        <CameraIcon size={12} />
                        {c.id}
                      </span>
                    </Billboard>
                  );
                })}

              {layer === 'observations' &&
                observations
                  .filter((o) => o.zone)
                  .map((o) => {
                    const p = plates.find((z) => z.zone === o.zone);
                    if (!p) return null;
                    return (
                      <Billboard
                        key={'obs-' + o.id}
                        plate={p}
                        yaw={yaw}
                        pitch={pitch}
                        lift={10}
                        fx={o.ox}
                        fy={o.oy}
                      >
                        <span
                          className={'site-dot ' + o.certainty}
                          title={`${o.name} · last recorded ${o.last} · ${o.source}`}
                        />
                      </Billboard>
                    );
                  })}

              {openIncidents.map((i) => {
                const p = plates.find((z) => z.zone === i.zone);
                if (!p) return null;
                return (
                  <Billboard
                    key={'inc-' + i.id}
                    plate={p}
                    yaw={yaw}
                    pitch={pitch}
                    lift={30}
                    fx={0.78}
                    fy={0.22}
                  >
                    <button
                      type="button"
                      className={'site-pin ' + i.severity.toLowerCase()}
                      onClick={() => onOpenIncident(i.id)}
                      title={`${i.category} · ${i.severity}`}
                    >
                      <Siren size={12} />
                    </button>
                  </Billboard>
                );
              })}
            </div>
          </div>
          <p className="site-stage-hint">
            Drag to orbit. Select an area to inspect it.
            Plan geometry is schematic and not a surveyed floorplan.
          </p>
        </section>

        <aside className="site-map-side">
          <section className="panel">
            <h3>
              <Boxes size={16} />
              {layer === 'occupancy'
                ? 'Anonymous occupancy'
                : layer === 'coverage'
                  ? 'Camera coverage'
                  : 'Last recorded observations'}
            </h3>
            {layer === 'occupancy' && (
              <>
                <div className="site-figures">
                  <div>
                    <strong>{totalSeen}</strong>
                    <span>estimated people in covered areas</span>
                  </div>
                  <div>
                    <strong>
                      {covered}/{plates.length}
                    </strong>
                    <span>areas with working coverage</span>
                  </div>
                </div>
                <p className="muted">
                  Counts are estimates from a single camera view per area. They
                  are anonymous: this layer knows how many, never who. An area
                  without coverage reports <strong>no coverage</strong>, never
                  zero — an unwatched area is not an empty one.
                </p>
              </>
            )}
            {layer === 'coverage' && (
              <>
                <div className="site-figures">
                  <div>
                    <strong>{siteCameras.filter((c) => c.online).length}</strong>
                    <span>cameras online</span>
                  </div>
                  <div>
                    <strong>{siteCameras.filter((c) => !c.online).length}</strong>
                    <span>coverage gaps</span>
                  </div>
                </div>
                {offlineZones.length > 0 ? (
                  <p className="site-warn">
                    No coverage in {offlineZones.join(', ')}. Fallback patrol
                    required; do not read these areas as clear.
                  </p>
                ) : (
                  <p className="muted">
                    All demonstration cameras are reporting. Feed health is
                    synthetic in this build.
                  </p>
                )}
              </>
            )}
            {layer === 'observations' && (
              <>
                <div className="site-figures">
                  <div>
                    <strong>{summary.placed}</strong>
                    <span>records placed on the plan</span>
                  </div>
                  <div>
                    <strong>{summary.offSite}</strong>
                    <span>departed or not recorded</span>
                  </div>
                </div>
                <p className="site-warn">
                  This is not live tracking. Each dot is where a person was{' '}
                  <strong>last recorded</strong> by a gate reader or confirmed
                  by staff, with the age of that record. It does not establish
                  that anyone is there now.
                </p>
                <ul className="site-legend">
                  <li>
                    <i className="site-dot recorded" /> Recorded within 45
                    minutes ({summary.recorded})
                  </li>
                  <li>
                    <i className="site-dot stale" /> Record older than 45
                    minutes ({summary.stale})
                  </li>
                  <li>
                    <i className="site-dot unverified" /> Needs verification (
                    {summary.unverified})
                  </li>
                </ul>
              </>
            )}
          </section>

          <section className="panel">
            <h3>{selected ?? 'No area selected'}</h3>
            {!selectedPlate && (
              <p className="muted">
                Select an area on the plan to see its coverage, estimated
                occupancy and open records.
              </p>
            )}
            {selectedPlate && (
              <dl className="site-detail">
                <div>
                  <dt>Estimated occupancy</dt>
                  <dd>
                    {selectedOcc?.count === null || selectedOcc === undefined
                      ? 'No coverage — unknown'
                      : `${selectedOcc.count} people · ${selectedOcc.pressure}`}
                  </dd>
                </div>
                <div>
                  <dt>Camera</dt>
                  <dd>
                    {selectedCam
                      ? `${selectedCam.id} · ${selectedCam.online ? 'online' : 'offline'}`
                      : 'No camera assigned to this area'}
                  </dd>
                </div>
                <div>
                  <dt>Open records here</dt>
                  <dd>
                    {selectedIncidents.length === 0
                      ? 'None'
                      : selectedIncidents.map((i) => (
                          <button
                            key={i.id}
                            type="button"
                            className="link-btn"
                            onClick={() => onOpenIncident(i.id)}
                          >
                            {i.category} · {i.id}
                          </button>
                        ))}
                  </dd>
                </div>
                {canSeeObservations && (
                  <div>
                    <dt>Last recorded here</dt>
                    <dd>
                      {selectedObs.length === 0
                        ? 'No presence records point to this area'
                        : selectedObs.map((o) => (
                            <span key={o.id} className="site-obs">
                              {o.name} · {o.className} · last recorded {o.last}{' '}
                              ({o.ageMinutes} min ago) · {o.source}
                            </span>
                          ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Plate({
  plate,
  occupancy,
  layer,
  selected,
  onSelect,
}: {
  plate: ZonePlate;
  occupancy?: ZoneOccupancy;
  layer: Layer;
  selected: boolean;
  onSelect: () => void;
}) {
  const w = plate.w * U;
  const d = plate.d * U;
  const z = Math.max(plate.height * U * 0.5, 2);
  const tone =
    layer === 'occupancy' && occupancy
      ? occupancy.covered
        ? occupancy.pressure
        : 'unknown'
      : layer === 'coverage'
        ? occupancy?.covered
          ? 'covered'
          : 'unknown'
        : plate.kind;
  return (
    <div
      className={'site-plate ' + tone + (selected ? ' selected' : '')}
      style={{
        left: plate.x * U,
        top: plate.y * U,
        width: w,
        height: d,
      }}
    >
      <button
        type="button"
        className="site-face top"
        style={{ transform: `translateZ(${z}px)` }}
        onClick={onSelect}
      >
        <span>{plate.zone}</span>
      </button>
      <i
        className="site-face wall"
        style={{ width: w, height: z, transformOrigin: '0 0', transform: 'rotateX(90deg)' }}
      />
      <i
        className="site-face wall"
        style={{
          width: w,
          height: z,
          top: d,
          transformOrigin: '0 0',
          transform: 'rotateX(90deg)',
        }}
      />
      <i
        className="site-face wall side"
        style={{ width: z, height: d, transformOrigin: '0 0', transform: 'rotateY(-90deg)' }}
      />
      <i
        className="site-face wall side"
        style={{
          width: z,
          height: d,
          left: w,
          transformOrigin: '0 0',
          transform: 'rotateY(-90deg)',
        }}
      />
    </div>
  );
}

function Billboard({
  plate,
  yaw,
  pitch,
  lift,
  fx = 0.5,
  fy = 0.5,
  children,
}: {
  plate: ZonePlate;
  yaw: number;
  pitch: number;
  lift: number;
  fx?: number;
  fy?: number;
  children: React.ReactNode;
}) {
  const z = Math.max(plate.height * U * 0.5, 2) + lift;
  return (
    <div
      className="site-billboard"
      style={{
        left: (plate.x + plate.w * fx) * U,
        top: (plate.y + plate.d * fy) * U,
        transform: `translateZ(${z}px) rotateZ(${-yaw}deg) rotateX(${-pitch}deg)`,
      }}
    >
      {children}
    </div>
  );
}
