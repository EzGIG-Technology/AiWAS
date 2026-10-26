'use client';
import { cn } from '@/lib/utils';
import {
  cameras,
  cameraById,
  cameraByScene,
  zones,
  isOpenEvent,
  type CameraEvent,
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
    label: 'Zone 5 · Petaling Jaya',
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

export type MapLayers = {
  cameras: boolean;
  detections: boolean;
  occupancy: boolean;
};

export function CampusMap({
  layers = { cameras: true, detections: true, occupancy: true },
  onCamera,
  onEvent,
  className,
}: {
  layers?: Partial<MapLayers>;
  onCamera?: (c: Camera) => void;
  onEvent?: (e: CameraEvent) => void;
  className?: string;
}) {
  const { state } = useDemo();
  const open = state.events.filter(isOpenEvent);

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

      {layers.occupancy &&
        zones.map((z) => {
          const c = cameraByScene(z.scene);
          const pct = z.now / z.capacity;
          const size = 14 + Math.sqrt(z.now) * 0.9;
          return (
            <span
              key={z.id}
              title={`${z.name}: ${z.now} people (${Math.round(pct * 100)}% of capacity)`}
              className={cn(
                'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
                pct > 0.85
                  ? 'bg-critical/25'
                  : pct > 0.6
                    ? 'bg-warning/25'
                    : 'bg-primary/15',
              )}
              style={{
                left: `${c.pos[0]}%`,
                top: `${c.pos[1]}%`,
                width: size,
                height: size,
              }}
            />
          );
        })}

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

      {layers.detections &&
        open.map((e) => {
          const cam = cameraById(e.camera);
          if (!cam) return null;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onEvent?.(e)}
              aria-label={`${e.severity} detection: ${e.title}`}
              title={e.title}
              className="absolute z-10 -translate-x-1/2 -translate-y-full focus-visible:outline-none"
              style={{ left: `${cam.pos[0]}%`, top: `${cam.pos[1]}%` }}
            >
              <span
                className={cn(
                  'block size-4 rotate-45 rounded-sm rounded-br-none shadow ring-2 ring-card',
                  sevColour[e.severity],
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
          Offline
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rotate-45 bg-warning" />
          Detection
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full bg-primary/30" />
          People counted
        </span>
        <span>Schematic, not to scale</span>
      </div>
    </div>
  );
}
