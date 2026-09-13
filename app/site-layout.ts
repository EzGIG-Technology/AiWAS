import { getIndustry } from './industries.ts';

// Schematic 3D site geometry. Coordinates are abstract plan units on a
// 100 x 72 plot, not surveyed positions. Height is the extrusion of a block
// above the ground plane; 0 means open ground.
//
// This is a coverage and occupancy diagram. It is deliberately not a
// floorplan: nothing here should be used to measure a distance, plan an
// evacuation route or claim that a person is standing at a point.

export type PlateKind = 'building' | 'open' | 'service' | 'boundary';

export type ZonePlate = {
  zone: string;
  x: number;
  y: number;
  w: number;
  d: number;
  height: number;
  kind: PlateKind;
};

export const PLOT = { w: 100, d: 72 };

const plate = (
  zone: string,
  x: number,
  y: number,
  w: number,
  d: number,
  height: number,
  kind: PlateKind,
): ZonePlate => ({ zone, x, y, w, d, height, kind });

const LAYOUTS: Record<string, ZonePlate[]> = {
  education: [
    plate('Block A corridor', 8, 8, 46, 14, 16, 'building'),
    plate('Assembly hall', 60, 8, 32, 26, 20, 'building'),
    plate('Canteen', 8, 30, 24, 20, 12, 'building'),
    plate('Courtyard', 36, 30, 30, 24, 0, 'open'),
    plate('Hostel common lobby', 70, 40, 22, 18, 14, 'building'),
    plate('Main gate', 8, 58, 24, 10, 4, 'service'),
    plate('East perimeter', 94, 4, 3, 64, 6, 'boundary'),
  ],
  healthcare: [
    plate('Ward corridor', 8, 8, 52, 14, 18, 'building'),
    plate('Pharmacy store entrance', 64, 8, 16, 14, 12, 'building'),
    plate('Emergency department waiting', 8, 32, 32, 22, 14, 'building'),
    plate('Ambulance bay', 62, 30, 30, 16, 5, 'service'),
    plate('Records store corridor', 64, 50, 28, 12, 10, 'building'),
    plate('Main entrance', 30, 58, 26, 10, 6, 'service'),
    plate('Staff car park', 4, 58, 22, 10, 0, 'open'),
  ],
  'aged-care': [
    plate('Resident corridor', 10, 8, 58, 14, 14, 'building'),
    plate('Laundry corridor', 72, 8, 24, 12, 10, 'building'),
    plate('Lounge', 10, 30, 28, 22, 12, 'building'),
    plate('Dining room', 42, 30, 26, 22, 12, 'building'),
    plate('Garden and courtyard', 72, 26, 24, 30, 0, 'open'),
    plate('Main entrance', 34, 58, 22, 10, 6, 'service'),
    plate('Visitor car park', 6, 58, 24, 10, 0, 'open'),
  ],
  retail: [
    plate('Main aisle', 20, 14, 44, 18, 10, 'building'),
    plate('Stockroom door', 68, 14, 14, 10, 8, 'service'),
    plate('Back corridor', 68, 26, 24, 12, 10, 'building'),
    plate('Checkout area', 20, 36, 44, 14, 8, 'building'),
    plate('Loading bay', 68, 42, 24, 16, 6, 'service'),
    plate('Shopfront entrance', 32, 54, 26, 10, 6, 'service'),
    plate('Customer car park', 4, 54, 24, 14, 0, 'open'),
  ],
  construction: [
    plate('Excavation edge', 6, 8, 26, 18, 2, 'open'),
    plate('Welfare cabin area', 38, 4, 26, 10, 8, 'service'),
    plate('Crane radius', 70, 14, 24, 30, 34, 'building'),
    plate('Scaffold zone', 38, 20, 26, 26, 26, 'building'),
    plate('Material laydown', 6, 32, 26, 16, 6, 'service'),
    plate('Site access road', 28, 52, 64, 10, 0, 'open'),
    plate('Site entrance', 6, 56, 20, 10, 4, 'service'),
  ],
  industrial: [
    plate('Racking aisle', 6, 10, 32, 26, 22, 'building'),
    plate('Pick face', 42, 10, 22, 26, 16, 'building'),
    plate('Machine cell', 68, 10, 24, 18, 18, 'building'),
    plate('Battery charging area', 68, 32, 24, 16, 8, 'service'),
    plate('Goods-in dock', 6, 40, 28, 10, 8, 'service'),
    plate('Packing line', 42, 40, 22, 10, 10, 'building'),
    plate('Yard', 4, 54, 88, 14, 0, 'open'),
  ],
  transport: [
    plate('Platform', 8, 6, 80, 12, 2, 'open'),
    plate('Concourse', 8, 22, 56, 22, 16, 'building'),
    plate('Escalator landing', 68, 22, 20, 10, 10, 'building'),
    plate('Security queue', 68, 36, 20, 12, 10, 'building'),
    plate('Gate hold room', 8, 48, 40, 16, 14, 'building'),
    plate('Restricted-side access door', 52, 48, 12, 8, 8, 'service'),
    plate('Taxi rank', 68, 52, 24, 12, 0, 'open'),
    plate('Perimeter fence', 95, 4, 3, 64, 6, 'boundary'),
  ],
  commercial: [
    plate('Lift lobby', 22, 12, 40, 20, 30, 'building'),
    plate('Plant room corridor', 66, 12, 26, 14, 20, 'building'),
    plate('Roof access', 66, 28, 18, 10, 34, 'building'),
    plate('Turnstile line', 22, 34, 40, 8, 6, 'service'),
    plate('Ground lobby', 22, 44, 40, 20, 14, 'building'),
    plate('Loading dock', 66, 44, 26, 16, 8, 'service'),
    plate('Car park', 4, 44, 14, 20, 0, 'open'),
    plate('Site perimeter', 95, 4, 3, 64, 5, 'boundary'),
  ],
};

/**
 * Plan geometry for an industry. Any zone in the register without hand-authored
 * geometry is appended on a spare row so the map can never silently omit a
 * monitored area.
 */
export function layoutFor(industryId: string): ZonePlate[] {
  const zones = getIndustry(industryId).zones;
  const authored = LAYOUTS[industryId] ?? [];
  const known = new Set(authored.map((p) => p.zone));
  const missing = zones.filter((z) => !known.has(z));
  const extras = missing.map((z, i) =>
    plate(z, 4 + (i % 4) * 24, 2, 20, 8, 6, 'service'),
  );
  // Only keep plates whose zone is still in the register.
  return [...authored.filter((p) => zones.includes(p.zone)), ...extras];
}

/** Deterministic pseudo-random in [0,1) so the demo is stable per render tick. */
function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export type ZoneOccupancy = {
  zone: string;
  /** Estimated people visible in the zone, or null when coverage is down. */
  count: number | null;
  /** Capacity used only to shade the plate; not a fire-safety limit. */
  capacity: number;
  covered: boolean;
  pressure: 'unknown' | 'quiet' | 'normal' | 'busy' | 'crowded';
};

const CAPACITY: Record<PlateKind, number> = {
  building: 60,
  open: 90,
  service: 30,
  boundary: 6,
};

/**
 * Anonymous estimated occupancy per zone.
 *
 * Two rules matter more than the numbers. A zone whose camera is offline
 * returns null and reports 'unknown' — never zero, because an unwatched room
 * is not an empty room. And the result is a count, never a list of people:
 * this layer knows how many, never who.
 */
export function occupancyFor(
  industryId: string,
  plates: ZonePlate[],
  offlineZones: string[],
  tick: number,
): ZoneOccupancy[] {
  return plates.map((p) => {
    const capacity = CAPACITY[p.kind];
    const covered = !offlineZones.includes(p.zone);
    if (!covered)
      return { zone: p.zone, count: null, capacity, covered, pressure: 'unknown' };
    const base = hash(industryId + p.zone);
    const drift = hash(industryId + p.zone + String(tick)) * 0.35;
    const load = Math.min(0.98, base * 0.75 + drift);
    const count = Math.round(load * capacity);
    const ratio = count / capacity;
    return {
      zone: p.zone,
      count,
      capacity,
      covered,
      pressure:
        ratio > 0.75
          ? 'crowded'
          : ratio > 0.45
            ? 'busy'
            : ratio > 0.15
              ? 'normal'
              : 'quiet',
    };
  });
}

export type Observation = {
  id: string;
  name: string;
  className: string;
  zone: string | null;
  status: string;
  last: string;
  source: string;
  /** Minutes since the observation was recorded, at the demo clock. */
  ageMinutes: number;
  /** How much the record can be relied on as a current location. */
  certainty: 'recorded' | 'stale' | 'unverified' | 'departed';
  /** Jitter so co-located records do not stack into one dot. */
  ox: number;
  oy: number;
};

const DEMO_NOW_MINUTES = 11 * 60 + 5; // 11:05 on the demo clock.

function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : DEMO_NOW_MINUTES;
}

/**
 * Place presence records on the plan at the zone of their LAST RECORDED
 * OBSERVATION. This is not live positioning and must never be presented as
 * such: it is where a person was last seen by a gate reader or confirmed by a
 * member of staff, with the age of that record attached. A record older than
 * 45 minutes is marked stale precisely so the map cannot be read as current.
 */
export function observationsFor(
  people: {
    id: string;
    name: string;
    className: string;
    status: string;
    last: string;
    source: string;
  }[],
  plates: ZonePlate[],
  entranceZone: string,
): Observation[] {
  const placeable = plates.filter(
    (p) => p.kind !== 'boundary' && p.zone !== entranceZone,
  );
  return people.map((p) => {
    const departed = p.status === 'Departure recorded';
    const absent = p.status === 'Not recorded today';
    const unverified = p.status === 'Needs verification';
    const ageMinutes = Math.max(0, DEMO_NOW_MINUTES - minutesOf(p.last));
    const pick = placeable[Math.floor(hash(p.id) * placeable.length)];
    const zone = absent
      ? null
      : departed
        ? entranceZone
        : (pick?.zone ?? entranceZone);
    return {
      id: p.id,
      name: p.name,
      className: p.className,
      zone,
      status: p.status,
      last: p.last,
      source: p.source,
      ageMinutes,
      certainty: absent
        ? 'departed'
        : departed
          ? 'departed'
          : unverified
            ? 'unverified'
            : ageMinutes > 45
              ? 'stale'
              : 'recorded',
      ox: hash(p.id + 'x') * 0.7 + 0.15,
      oy: hash(p.id + 'y') * 0.7 + 0.15,
    };
  });
}

/** Headline counts for the observation layer. */
export function observationSummary(observations: Observation[]) {
  const on = observations.filter((o) => o.zone !== null && o.certainty !== 'departed');
  return {
    placed: on.length,
    recorded: on.filter((o) => o.certainty === 'recorded').length,
    stale: on.filter((o) => o.certainty === 'stale').length,
    unverified: on.filter((o) => o.certainty === 'unverified').length,
    offSite: observations.length - on.length,
    total: observations.length,
  };
}
