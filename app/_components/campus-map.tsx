'use client';
import { cn } from '@/lib/utils';
import {
  cameras,
  colleges,
  officers,
  type Incident,
  type Camera,
} from '../_data/um';
import { useDemo } from '../_lib/store';

/**
 * Schematic plan of the UM main campus. Positions are approximate and for
 * orientation only; it is not a surveyed map. Markers are HTML on top of an
 * SVG backdrop so they stay round at any aspect ratio.
 */
const regions: {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cls: string;
  dashed?: boolean;
}[] = [
  {
    label: 'Rimba Ilmu',
    x: 3,
    y: 38,
    w: 21,
    h: 34,
    cls: 'fill-success/15 stroke-success/30',
  },
  {
    label: 'Zone 5 · Petaling Jaya (off campus)',
    x: 2,
    y: 1,
    w: 21,
    h: 12,
    cls: 'fill-muted stroke-border',
    dashed: true,
  },
  {
    label: 'UM Central & LRT',
    x: 13,
    y: 13,
    w: 16,
    h: 11,
    cls: 'fill-info/10 stroke-info/30',
  },
  {
    label: 'Academic core',
    x: 27,
    y: 17,
    w: 31,
    h: 31,
    cls: 'fill-primary/8 stroke-primary/25',
  },
  {
    label: 'Residential colleges',
    x: 58,
    y: 13,
    w: 24,
    h: 29,
    cls: 'fill-chart-5/12 stroke-chart-5/30',
  },
  {
    label: 'Student life',
    x: 42,
    y: 43,
    w: 18,
    h: 15,
    cls: 'fill-chart-3/12 stroke-chart-3/30',
  },
  {
    label: 'UMMC',
    x: 78,
    y: 33,
    w: 20,
    h: 34,
    cls: 'fill-critical/8 stroke-critical/25',
  },
  {
    label: 'Engineering',
    x: 52,
    y: 54,
    w: 12,
    h: 12,
    cls: 'fill-muted stroke-border',
  },
  {
    label: 'Stores & estates',
    x: 60,
    y: 78,
    w: 15,
    h: 14,
    cls: 'fill-muted stroke-border',
  },
  {
    label: 'Contractor site',
    x: 19,
    y: 74,
    w: 15,
    h: 16,
    cls: 'fill-warning/12 stroke-warning/40',
    dashed: true,
  },
];

const sevColour: Record<string, string> = {
  Critical: 'bg-critical',
  High: 'bg-warning',
  Medium: 'bg-info',
  Low: 'bg-muted-foreground',
};

export function CampusMap({
  layers = {
    cameras: true,
    incidents: true,
    officers: true,
    colleges: true,
    sessions: true,
  },
  onCamera,
  onIncident,
  highlightCollege,
  className,
}: {
  layers?: Partial<
    Record<
      'cameras' | 'incidents' | 'officers' | 'colleges' | 'sessions',
      boolean
    >
  >;
  onCamera?: (c: Camera) => void;
  onIncident?: (i: Incident) => void;
  highlightCollege?: string;
  className?: string;
}) {
  const { state } = useDemo();
  const open = state.incidents.filter(
    (i) => !['Resolved', 'False alarm'].includes(i.status) && !i.restricted,
  );

  return (
    <div
      className={cn(
        'relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border',
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        {/* Roads */}
        <path
          d="M0 22 H30 Q40 22 46 14 H100"
          className="fill-none stroke-border"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M30 22 V70 Q30 76 40 76 H100"
          className="fill-none stroke-border"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M58 22 V76 M76 14 V76"
          className="fill-none stroke-border"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {regions.map((r) => (
          <rect
            key={r.label}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx="1.6"
            className={r.cls}
            strokeDasharray={r.dashed ? '3 2' : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <ellipse
          cx="44"
          cy="67"
          rx="7"
          ry="5"
          className="fill-info/25 stroke-info/40"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {regions.map((r) => (
        <span
          key={r.label}
          className="pointer-events-none absolute text-[9px] font-medium text-muted-foreground sm:text-[10px]"
          style={{ left: `${r.x + 0.8}%`, top: `${r.y + 1}%` }}
        >
          {r.label}
        </span>
      ))}
      <span
        className="pointer-events-none absolute text-[9px] text-info sm:text-[10px]"
        style={{ left: '40%', top: '66%' }}
      >
        Tasik Varsiti
      </span>
      <span
        className="pointer-events-none absolute text-[9px] font-semibold sm:text-[10px]"
        style={{ left: '1%', top: '23.5%' }}
      >
        Main gate ▸
      </span>
      <span
        className="pointer-events-none absolute text-[9px] font-semibold sm:text-[10px]"
        style={{ left: '86%', top: '72%' }}
      >
        ◂ Jalan Pantai Baru
      </span>

      {layers.colleges &&
        colleges.map((c) => (
          <span
            key={c.id}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 rounded px-1 py-px text-[9px] font-semibold ring-1',
              highlightCollege === c.id
                ? 'z-10 bg-primary text-primary-foreground ring-primary'
                : 'bg-card/90 text-foreground ring-border',
            )}
            style={{ left: `${c.pos[0]}%`, top: `${c.pos[1]}%` }}
          >
            {c.short}
          </span>
        ))}

      {layers.cameras &&
        cameras.map((c) => (
          <button
            key={c.id}
            type="button"
            title={`${c.id} · ${c.name}`}
            aria-label={`Camera ${c.id}, ${c.name}${c.status !== 'online' ? `, ${c.status}` : ''}`}
            onClick={() => onCamera?.(c)}
            className={cn(
              'absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card transition-transform hover:scale-150 focus-visible:scale-150 focus-visible:outline-none',
              c.status === 'online'
                ? 'bg-foreground/70'
                : c.status === 'degraded'
                  ? 'bg-warning'
                  : 'bg-critical',
            )}
            style={{ left: `${c.pos[0]}%`, top: `${c.pos[1]}%` }}
          />
        ))}

      {layers.officers &&
        officers.map((o) => (
          <span
            key={o.id}
            title={`${o.callsign} · ${o.status}`}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-1.5 py-px font-mono text-[9px] font-bold text-white shadow',
              o.status === 'Responding'
                ? 'bg-primary'
                : o.status === 'On break'
                  ? 'bg-muted-foreground'
                  : 'bg-info',
            )}
            style={{ left: `${o.pos[0]}%`, top: `${o.pos[1] - 3}%` }}
          >
            {o.callsign}
          </span>
        ))}

      {layers.sessions &&
        state.sessions
          .filter((s) => s.kind === 'SOS' || s.kind === 'Friend Walk')
          .map((s) => (
            <span
              key={s.id}
              title={`${s.kind} · ${s.status}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${s.pos[0]}%`, top: `${s.pos[1]}%` }}
            >
              <span
                className={cn(
                  'absolute -inset-2 animate-ping rounded-full',
                  s.kind === 'SOS' ? 'bg-critical/40' : 'bg-primary/30',
                )}
              />
              <span
                className={cn(
                  'relative block size-3 rounded-full ring-2 ring-card',
                  s.kind === 'SOS' ? 'bg-critical' : 'bg-primary',
                )}
              />
            </span>
          ))}

      {layers.incidents &&
        open.map((i) => {
          const cam = i.camera
            ? cameras.find((c) => c.id === i.camera)
            : undefined;
          if (!cam) return null;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onIncident?.(i)}
              aria-label={`${i.severity} incident: ${i.title}`}
              title={i.title}
              className="absolute z-10 -translate-x-1/2 -translate-y-full focus-visible:outline-none"
              style={{ left: `${cam.pos[0]}%`, top: `${cam.pos[1]}%` }}
            >
              <span
                className={cn(
                  'block size-4 rotate-45 rounded-sm rounded-br-none shadow ring-2 ring-card',
                  sevColour[i.severity],
                )}
              />
            </button>
          );
        })}

      <div className="absolute right-2 bottom-2 flex flex-wrap gap-x-3 gap-y-1 rounded-md bg-card/90 px-2 py-1 text-[10px] text-muted-foreground ring-1 ring-border">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-foreground/70" />
          Camera
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-critical" />
          Offline / SOS
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rotate-45 bg-warning" />
          Incident
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full bg-info px-1 font-mono text-[8px] text-white">
            PB
          </span>
          Officer
        </span>
        <span>Schematic, not to scale</span>
      </div>
    </div>
  );
}
