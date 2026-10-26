'use client';
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import { VideoOff, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scenes, mediaUrl } from '../_data/media';
import type { Camera } from '../_data/um';

/**
 * One camera tile.
 *
 * - With a clip and `live`, it plays the synthetic clip muted on loop.
 * - Without a clip, it shows the still with a slow pan, never another
 *   scene's video.
 * - An offline camera is an explicit "signal lost" tile that tells the
 *   operator not to read the area as clear. It is never a dark rectangle.
 *
 * The boxes are hand-placed illustrations, labelled as such.
 */
export function CameraFeed({
  camera,
  live = true,
  showBoxes = true,
  compact = false,
  className,
  onClick,
}: {
  camera: Camera;
  live?: boolean;
  showBoxes?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const scene = scenes[camera.scene];
  const [failed, setFailed] = useState(false);
  const offline = camera.status === 'offline';
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group/cam relative block aspect-video w-full overflow-hidden rounded-lg bg-neutral-900 text-left ring-1 ring-black/10',
        onClick &&
          'cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none',
        className,
      )}
      aria-label={onClick ? `Open ${camera.id}, ${camera.name}` : undefined}
    >
      {offline ? (
        <div className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(45deg,oklch(0.25_0.01_0)_0_10px,oklch(0.22_0.01_0)_10px_20px)] p-3 text-center text-white">
          <div className="flex flex-col items-center gap-1.5">
            <VideoOff className="size-5 text-warning" />
            <span className="text-xs font-semibold">Signal lost</span>
            {!compact && (
              <span className="max-w-[24ch] text-[11px] text-white/70">
                Do not read this area as clear: it is a coverage gap until
                repaired.
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          {live && scene.clip && !failed ? (
            <video
              className="absolute inset-0 size-full object-cover"
              src={mediaUrl(scene.clip)}
              poster={mediaUrl(scene.still)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
            />
          ) : (
            <img
              src={mediaUrl(scene.still)}
              alt=""
              loading="lazy"
              className={cn(
                'absolute inset-0 size-full object-cover',
                live &&
                  'motion-safe:animate-[pan_24s_ease-in-out_infinite_alternate]',
              )}
            />
          )}
          {showBoxes &&
            !compact &&
            scene.boxes.map(([x, y, w, h], i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute rounded-[3px] border-2 border-primary/90 shadow-[0_0_0_1px_oklch(0_0_0/30%)]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                }}
              />
            ))}
          {camera.status === 'degraded' && (
            <span className="absolute inset-0 bg-black/25 backdrop-grayscale" />
          )}
        </>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-2 text-white">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-white/75">{camera.id}</div>
          {!compact && (
            <div className="truncate text-xs font-medium">{camera.name}</div>
          )}
        </div>
        {!offline && live && (
          <span className="flex shrink-0 items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold">
            <Radio className="pulse-dot size-3 text-red-400" />
            {camera.partner ? 'PARTNER' : 'LIVE'}
          </span>
        )}
      </div>
      {!offline && !compact && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white/85">
          <span className="truncate">{scene.overlay}</span>
          <span className="shrink-0">
            {camera.status === 'degraded'
              ? 'Degraded · 8 fps'
              : scene.clip
                ? 'Synthetic clip'
                : 'Synthetic still'}
          </span>
        </div>
      )}
    </Wrapper>
  );
}
