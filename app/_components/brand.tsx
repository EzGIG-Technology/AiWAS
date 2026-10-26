/* oxlint-disable next/no-img-element */
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { logoFiles, logoLockups } from '../_data/logos';
import { assetUrl } from '../_data/media';

/**
 * AiWAS wordmark, redrawn as a vector from the official artwork
 * (public/brand/aiwas-logo.svg holds the same paths as a standalone file).
 * Colour follows `currentColor` so it sits on plum, white or dark surfaces.
 */
const A =
  'M5 411 L163 148 Q186 118 209 148 L368 411 L309 411 L268 343 L138 343 L161 304 L245 304 L184 202 L60 411 Z';
const STAR =
  'M424 0 C424 58 400 94 350 97 C400 101 424 137 424 195 C424 137 448 101 497 97 C448 94 424 58 424 0 Z';

export function AiwasLogo({ className }: { className?: string }) {
  // Unique per instance: the wordmark appears more than once on some screens.
  const titleId = useId();
  return (
    <svg
      viewBox="0 0 1566 420"
      aria-labelledby={titleId}
      className={cn('h-6 w-auto text-brand', className)}
    >
      <title id={titleId}>AiWAS</title>
      <g fill="currentColor">
        <path d={A} />
        <path d="M399 411 L399 247 L448 195 L448 411 Z" />
        <path d={STAR} />
        <path d="M484 138 L540 138 L651 348 L693 273 L622 138 L680 138 L786 348 L897 138 L951 138 L809 403 Q785 428 760 403 L717 321 L675 403 Q651 428 626 403 Z" />
        <path transform="translate(872 0)" d={A} />
        <path d="M1350 138 L1547 138 L1547 185 L1350 185 C1328 185 1314 199 1314 218 C1314 238 1328 252 1350 252 L1477 252 C1530 252 1561 280 1561 332 C1561 384 1530 411 1477 411 L1269 411 L1269 364 L1477 364 C1502 364 1515 352 1515 329 C1515 306 1502 293 1477 293 L1350 293 C1297 293 1265 262 1265 215 C1265 168 1297 138 1350 138 Z" />
      </g>
    </svg>
  );
}

/** The four-point spark on its own, for compact places. */
export function AiwasSpark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="340 -6 168 208"
      aria-hidden="true"
      className={cn('size-5 text-brand', className)}
    >
      <path d={STAR} fill="currentColor" />
    </svg>
  );
}

/** Product lockup: AiWAS wordmark with the EzVision Campus line. */
export function ProductLockup({
  className,
  inverted,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <AiwasLogo className={cn('h-5', inverted && 'text-white')} />
      <span
        className={cn(
          'text-[10px] font-semibold tracking-[0.18em] uppercase',
          inverted ? 'text-white/70' : 'text-muted-foreground',
        )}
      >
        EzVision · Campus
      </span>
    </div>
  );
}

/** Stable hue per institution for the fallback crest. */
function hue(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

const crestColours: Record<string, [string, string]> = {
  um: ['oklch(0.33 0.11 262)', 'oklch(0.83 0.15 88)'],
  kpt: ['oklch(0.35 0.1 255)', 'oklch(0.84 0.15 90)'],
};

/**
 * University or ministry logo. Renders the official file when one has been
 * added to public/logos and registered in app/_data/logos.ts; until then a
 * neutral acronym crest, so no institution is shown with a wrong mark.
 */
/**
 * Full crest-and-wordmark lockup on a white plate, so its dark wordmark stays
 * legible on dark surfaces. Renders nothing when no lockup was supplied.
 */
export function UniversityLockup({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const file = logoLockups[id];
  if (!file) return null;
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 justify-self-start rounded-lg bg-white px-3 py-2 ring-1 ring-black/10',
        className,
      )}
    >
      <img
        src={assetUrl(`logos/${file}`)}
        alt={`${name} logo`}
        className="h-11 w-auto"
      />
    </span>
  );
}

export function UniversityLogo({
  id,
  acronym,
  className,
}: {
  id: string;
  acronym: string;
  className?: string;
}) {
  const file = logoFiles[id];
  if (file) {
    return (
      <img
        src={assetUrl(`logos/${file}`)}
        alt={`${acronym} logo`}
        className={cn('size-9 shrink-0 object-contain', className)}
      />
    );
  }
  const [bg, fg] = crestColours[id] ?? [
    `oklch(0.42 0.09 ${hue(id)})`,
    'oklch(0.97 0.01 90)',
  ];
  const label = acronym.replace(/[^A-Za-z']/g, '').slice(0, 4);
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg text-[10px] leading-none font-bold tracking-tight ring-1 ring-black/10',
        className,
      )}
      style={{ background: bg, color: fg }}
    >
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{acronym}</span>
    </span>
  );
}
