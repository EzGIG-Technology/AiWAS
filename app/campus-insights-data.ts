export const insightWindows = [
  { time: '07:30', label: 'Arrival' },
  { time: '08:30', label: 'Lessons' },
  { time: '10:15', label: 'Morning break' },
  { time: '12:45', label: 'Lunch' },
  { time: '14:00', label: 'Dismissal' },
  { time: '17:30', label: 'After school' },
];
export const campusZones = [
  {
    id: 'gate',
    name: 'Main gate',
    scene: 'gate',
    threshold: 55,
    area: 'gate',
    purpose: 'Stagger collection and position gate stewards.',
  },
  {
    id: 'canteen',
    name: 'Canteen',
    scene: 'canteen',
    threshold: 90,
    area: 'canteen',
    purpose: 'Adjust serving lanes and break schedules.',
  },
  {
    id: 'corridor',
    name: 'Block A corridor',
    scene: 'corridor',
    threshold: 45,
    area: 'corridor',
    purpose: 'Review class-change flow and duty coverage.',
  },
  {
    id: 'perimeter',
    name: 'East perimeter',
    scene: 'perimeter',
    threshold: 15,
    area: 'perimeter',
    purpose: 'Check after-hours access and coverage.',
  },
  {
    id: 'courtyard',
    name: 'Courtyard',
    scene: 'courtyard',
    threshold: 110,
    area: 'courtyard',
    purpose: 'Plan assembly release and supervised activities.',
  },
  {
    id: 'hall',
    name: 'Assembly hall',
    scene: 'hall',
    threshold: 120,
    area: 'hall',
    purpose: 'Compare booked sessions with observed space usage.',
  },
];
export type ZoneSample = {
  occupancy: number;
  entries: number;
  exits: number;
  dwell: number;
  queue: number;
  vehicles: number;
  vehicleDwell: number;
};
const occupancy = [
  [46, 8, 12, 19, 67, 3],
  [12, 9, 118, 104, 20, 2],
  [31, 18, 58, 44, 50, 4],
  [2, 1, 3, 4, 5, 8],
  [92, 16, 78, 66, 86, 6],
  [106, 6, 19, 11, 25, 1],
];
// Each column is a separate fictional 15-minute observation window, not a continuous day.
export function zoneSample(
  school: string,
  zone: string,
  slot: number,
): ZoneSample {
  const z = campusZones.findIndex((z) => z.id === zone);
  if (
    z < 0 ||
    slot < 0 ||
    slot >= insightWindows.length ||
    !Number.isInteger(slot)
  )
    throw new Error('Unknown zone or observation window');
  const factor = school.includes('Seremban Jaya') ? 0.72 : 1;
  const n = Math.round(occupancy[z][slot] * factor);
  return {
    occupancy: n,
    entries: Math.round(n * (z === 0 ? 3.1 : 1.4) + slot * 2),
    exits:
      Math.round(n * (z === 0 ? 3.1 : 1.4) + slot * 2) -
      Math.round(n * (slot === 4 ? -0.35 : 0.25)),
    dwell:
      Math.round(
        (z === 1
          ? [2, 1, 8.4, 7.1, 2, 1][slot]
          : z === 0
            ? [3.4, 1, 1.4, 2, 6.2, 1][slot]
            : [2, 1.2, 3.3, 2.8, 3.8, 1.1][slot]) * 10,
      ) / 10,
    queue: z === 1 ? Math.round([3, 0, 31, 25, 4, 0][slot] * factor) : 0,
    vehicles: z === 0 ? Math.round([72, 6, 4, 13, 91, 2][slot] * factor) : 0,
    vehicleDwell: z === 0 ? [2.4, 0.8, 1, 1.8, 5.6, 0.5][slot] : 0,
  };
}
export type HeatMetric = 'occupancy' | 'crossings' | 'dwell';
export function heatValue(s: ZoneSample, metric: HeatMetric) {
  return metric === 'crossings'
    ? s.entries + s.exits
    : metric === 'dwell'
      ? s.dwell
      : s.occupancy;
}
export const heatScale = {
  occupancy: { max: 120, unit: 'estimated people' },
  crossings: { max: 350, unit: 'crossings / 15 min' },
  dwell: { max: 10, unit: 'minutes average dwell' },
};
export function heatColor(value: number | null, metric: HeatMetric) {
  if (value === null) return '#e3e8ee';
  const ratio = value / heatScale[metric].max;
  return ratio > 0.85
    ? '#ac382d'
    : ratio > 0.6
      ? '#e17c42'
      : ratio > 0.3
        ? '#eabf64'
        : ratio > 0.1
          ? '#a8c9b1'
          : '#e3ede5';
}
export function thresholdError(value: number) {
  return !Number.isInteger(value) || value < 1 || value > 1000
    ? 'Enter a whole-number operational threshold from 1 to 1,000.'
    : '';
}
export function comparableChange(current: number, previous: number) {
  return previous === 0
    ? null
    : Math.round(((current - previous) / previous) * 100);
}
export function zoneSummary(school: string, zone: string, threshold: number) {
  const samples = insightWindows.map((_, i) => zoneSample(school, zone, i));
  const peak = Math.max(...samples.map((s) => s.occupancy));
  return {
    peak,
    peakSlot: samples.findIndex((s) => s.occupancy === peak),
    occupiedSamples: samples.filter((s) => s.occupancy >= 5).length,
    overThresholdSamples: samples.filter((s) => s.occupancy > threshold).length,
  };
}
