/**
 * Search and investigation: recorded sightings searchable by time, camera,
 * clothing colour, object or plate, and a cross-camera timeline built from
 * one sighting.
 *
 * A sighting is what the engine kept about an object in view: class, colours,
 * what it carried, and a plate for vehicles. There is no face template and no
 * name. Every search needs a purpose and is written to the audit log.
 */
import {
  cameras,
  cam,
  rand,
  fromMin,
  toMin,
  type Camera,
  type PrecinctId,
} from './um';

export const objectClasses = [
  'Person',
  'Vehicle',
  'Motorcycle',
  'Bag',
] as const;
export type ObjectClass = (typeof objectClasses)[number];

export const topColours = [
  'Black',
  'White',
  'Grey',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Maroon',
] as const;
export const bottomColours = [
  'Black',
  'Blue',
  'Grey',
  'Beige',
  'White',
] as const;
export const carryOptions = ['Backpack', 'Handbag', 'Nothing'] as const;
export const vehicleColours = [
  'White',
  'Silver',
  'Black',
  'Red',
  'Blue',
  'Grey',
] as const;

export type Sighting = {
  id: string;
  camera: string;
  time: string;
  cls: ObjectClass;
  top?: (typeof topColours)[number];
  bottom?: (typeof bottomColours)[number];
  carrying?: (typeof carryOptions)[number];
  colour?: (typeof vehicleColours)[number];
  plate?: string;
};

const platePool = [
  'WXX 4821',
  'VBK 1190',
  'JQR 551',
  'WA 2214 K',
  'VCE 8890',
  'PKR 3017',
  'NDH 6672',
  'WA 8812 F',
  'BMT 7302',
  'VDL 2045',
  'WTF 118',
  'BPA 9031',
  'JHM 4470',
  'VAA 6123',
  'WVK 3381',
];

const vehicleCam = (c: Camera) =>
  c.zoneType === 'road' || c.zoneType === 'car park';

function generated(): Sighting[] {
  const out: Sighting[] = [];
  cameras
    .filter((c) => c.status !== 'offline' && !c.partner)
    .forEach((c, ci) => {
      const n = 5;
      for (let k = 0; k < n; k++) {
        const key = `${c.id}-${k}`;
        const minute = 6 * 60 + Math.floor(rand(`${key}m`) * (12 * 60 + 35));
        const time = fromMin(minute);
        if (vehicleCam(c)) {
          const moto = rand(`${key}k`) < 0.3;
          out.push({
            id: `S-${key}`,
            camera: c.id,
            time,
            cls: moto ? 'Motorcycle' : 'Vehicle',
            colour:
              vehicleColours[
                Math.floor(rand(`${key}c`) * vehicleColours.length)
              ],
            plate: platePool[(ci * 5 + k) % platePool.length],
          });
        } else if (rand(`${key}b`) < 0.12) {
          out.push({ id: `S-${key}`, camera: c.id, time, cls: 'Bag' });
        } else {
          const top =
            topColours[Math.floor(rand(`${key}t`) * topColours.length)];
          const bottom =
            bottomColours[Math.floor(rand(`${key}u`) * bottomColours.length)];
          let carrying =
            carryOptions[Math.floor(rand(`${key}y`) * carryOptions.length)];
          // Keep the scripted track's description unique.
          if (top === 'Red' && bottom === 'Black' && carrying === 'Backpack')
            carrying = 'Nothing';
          out.push({
            id: `S-${key}`,
            camera: c.id,
            time,
            cls: 'Person',
            top,
            bottom,
            carrying,
          });
        }
      }
    });
  return out;
}

/**
 * One scripted walk for the demo: a person in a red top and black trousers
 * with a backpack, from UM Central to the KK12 Blok A lounge line, where the
 * boundary rule fired at 18:31.
 */
const track: Sighting[] = [
  ['transit-concourse', '18:02'],
  ['courtyard', '18:10'],
  ['shop-entrance', '18:16'],
  ['care-entrance', '18:29'],
  ['hostel', '18:31'],
].map(([scene, time], i) => ({
  id: `S-track-${i}`,
  camera: cam(scene as Parameters<typeof cam>[0]),
  time,
  cls: 'Person' as const,
  top: 'Red' as const,
  bottom: 'Black' as const,
  carrying: 'Backpack' as const,
}));

export const sightings: Sighting[] = [...generated(), ...track].sort((a, b) =>
  a.time.localeCompare(b.time),
);

export type SearchQuery = {
  from: string;
  to: string;
  /** A camera id, or 'all'. */
  camera: string;
  precinct: PrecinctId | 'all';
  cls: ObjectClass;
  top: string;
  bottom: string;
  carrying: string;
  colour: string;
  plate: string;
};

export const emptyQuery: SearchQuery = {
  from: '17:00',
  to: '18:40',
  camera: 'all',
  precinct: 'all',
  cls: 'Person',
  top: 'Any',
  bottom: 'Any',
  carrying: 'Any',
  colour: 'Any',
  plate: '',
};

export function search(q: SearchQuery) {
  const lo = toMin(q.from);
  const hi = toMin(q.to);
  const plate = q.plate.replace(/\s/g, '').toUpperCase();
  return sightings.filter((s) => {
    const c = cameras.find((x) => x.id === s.camera)!;
    if (toMin(s.time) < lo || toMin(s.time) > hi) return false;
    if (q.camera !== 'all' && s.camera !== q.camera) return false;
    if (q.precinct !== 'all' && c.precinct !== q.precinct) return false;
    if (plate) return !!s.plate && s.plate.replace(/\s/g, '').includes(plate);
    if (s.cls !== q.cls) return false;
    if (s.cls === 'Person') {
      if (q.top !== 'Any' && s.top !== q.top) return false;
      if (q.bottom !== 'Any' && s.bottom !== q.bottom) return false;
      if (q.carrying !== 'Any' && s.carrying !== q.carrying) return false;
    }
    if (
      (s.cls === 'Vehicle' || s.cls === 'Motorcycle') &&
      q.colour !== 'Any' &&
      s.colour !== q.colour
    )
      return false;
    return true;
  });
}

/** Same description (or same plate) on other cameras within 90 minutes. */
export function crossCameraTimeline(s: Sighting) {
  const t = toMin(s.time);
  return sightings
    .filter((x) =>
      s.plate
        ? x.plate === s.plate
        : x.cls === s.cls &&
          x.top === s.top &&
          x.bottom === s.bottom &&
          x.carrying === s.carrying,
    )
    .filter((x) => Math.abs(toMin(x.time) - t) <= 90)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function describe(s: Sighting) {
  if (s.cls === 'Person')
    return `${s.top} top, ${s.bottom?.toLowerCase()} trousers${s.carrying && s.carrying !== 'Nothing' ? `, ${s.carrying.toLowerCase()}` : ''}`;
  if (s.cls === 'Bag') return 'Bag or object';
  return `${s.colour} ${s.cls === 'Motorcycle' ? 'motorcycle' : 'vehicle'} · ${s.plate}`;
}
