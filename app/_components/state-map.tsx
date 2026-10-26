'use client';
import { cn } from '@/lib/utils';
import {
  institutions,
  maturityScore,
  stateTiles,
  type StateId,
} from '../_data/kpt';

const abbr: Record<StateId, string> = {
  Perlis: 'PLS',
  Kedah: 'KDH',
  Kelantan: 'KTN',
  'Pulau Pinang': 'PNG',
  Perak: 'PRK',
  Terengganu: 'TRG',
  Selangor: 'SGR',
  Pahang: 'PHG',
  'WP Kuala Lumpur': 'KUL',
  'WP Putrajaya': 'PJY',
  'Negeri Sembilan': 'NSN',
  Melaka: 'MLK',
  Johor: 'JHR',
  'WP Labuan': 'LBN',
  Sabah: 'SBH',
  Sarawak: 'SWK',
};

/**
 * Tile-grid map: each state is one square in roughly its geographic place,
 * Peninsular Malaysia on the left and Borneo on the right. Equal tiles keep
 * small states readable, which a choropleth would not.
 */
export function StateTileMap({
  selected,
  onSelect,
}: {
  selected?: StateId | null;
  onSelect?: (s: StateId | null) => void;
}) {
  return (
    <fieldset className="grid grid-cols-6 gap-1.5">
      <legend className="sr-only">Institutions by state</legend>
      {Array.from({ length: 6 * 6 }, (_, cell) => {
        const col = cell % 6;
        const row = Math.floor(cell / 6);
        const state = (Object.keys(stateTiles) as StateId[]).find(
          (s) => stateTiles[s][0] === col && stateTiles[s][1] === row,
        );
        if (!state) {
          if (row === 0 && col === 3)
            return (
              <div
                key={cell}
                className="grid place-items-center text-[9px] text-muted-foreground"
              >
                South China Sea
              </div>
            );
          return <div key={cell} />;
        }
        const list = institutions.filter((i) => i.state === state);
        const known = list.filter((i) => i.maturity !== 'Unknown');
        const avg = known.length
          ? known.reduce((a, i) => a + maturityScore[i.maturity], 0) /
            known.length
          : 0;
        const level =
          avg >= 3
            ? 'bg-success/30'
            : avg >= 2
              ? 'bg-warning/30'
              : avg > 0
                ? 'bg-critical/25'
                : '';
        return (
          <button
            key={cell}
            type="button"
            onClick={() => onSelect?.(selected === state ? null : state)}
            aria-pressed={selected === state}
            title={`${state}: ${list.length} universities audited`}
            className={cn(
              'flex aspect-square flex-col justify-between rounded-md p-1 text-left ring-1 ring-border transition-shadow focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none sm:p-1.5',
              list.length ? level : 'bg-muted/50 text-muted-foreground',
              selected === state && 'ring-2 ring-primary',
            )}
          >
            <span className="text-[10px] font-bold sm:text-xs">
              {abbr[state]}
            </span>
            <span className="tabular text-[9px] leading-tight opacity-90 sm:text-[10px]">
              {list.length ? `${list.length} inst.` : '—'}
              {list.length > 0 && <br />}
              {known.length > 0 && `Avg ${avg.toFixed(1)}`}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
