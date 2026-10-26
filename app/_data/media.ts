/**
 * Camera scene registry.
 *
 * Every still and clip in public/media is used. Each scene is placed at a
 * location that a research university with a teaching hospital genuinely has:
 * gates, faculties, residential colleges, the hospital, a construction site,
 * central stores and workshops, a campus mart and a transit hub.
 *
 * None of this is real footage. The scenes are synthetic, the people in them
 * are not real, and the overlay boxes are hand-placed illustrations
 * ([x, y, w, h] as percentages of the frame), not detections.
 */

export type SceneKey = keyof typeof scenes;

export type Scene = {
  /** Still image file in /media. */
  still: string;
  /** Matching clip in /media, or null when only a still exists. */
  clip: string | null;
  /** Illustrative anonymous track boxes. Empty when none were reviewed. */
  boxes: number[][];
  /** What the analytic is looking at in this frame. */
  overlay: string;
};

const s = (
  key: string,
  overlay: string,
  boxes: number[][] = [],
  opts: { ext?: 'jpg' | 'png'; clip?: boolean } = {},
): Scene => ({
  still: `${key}.${opts.ext ?? 'jpg'}`,
  clip: opts.clip === false ? null : `${key}.mp4`,
  boxes,
  overlay,
});

export const scenes = {
  gate: s('gate', 'Vehicle tracks', [
    [37.5, 45, 18, 22],
    [46, 61, 25, 35],
  ]),
  perimeter: s('perimeter', 'Restricted perimeter', [[66.7, 41, 2.6, 12]]),
  'transit-fence': s('transit-fence', 'Boundary line'),
  'office-perimeter': s('office-perimeter', 'Night walkway', [], {
    clip: false,
  }),
  courtyard: s('courtyard', 'Anonymous tracks', [
    [17.5, 29, 2, 8],
    [34.3, 38.5, 3, 13],
    [44.7, 36.5, 2.5, 11],
    [54.5, 30.5, 2.5, 10],
    [64.3, 39.5, 4, 15],
    [75, 54, 5.5, 19],
  ]),
  corridor: s('corridor', 'Anonymous tracks', [
    [40, 23, 6, 32],
    [47, 21, 7, 32],
    [57, 31, 9, 39],
  ]),
  hall: s('hall', 'Entry / exit line', [
    [35.2, 18, 3.4, 13.5],
    [40.5, 21, 3, 13],
    [41.3, 13.5, 2.5, 11.5],
    [44, 15, 2.5, 10.5],
  ]),
  training: s('training', 'Drill · inert prop', [
    [37, 13, 10, 47],
    [45.8, 39.8, 1.4, 6.5],
  ]),
  inspection: s('inspection', 'Facilities inspection', [], { ext: 'png' }),
  canteen: s('canteen', 'Crowd density', [[68, 13, 30, 59]]),
  hostel: s('hostel', 'Common-area duty', [], { ext: 'png' }),
  'records-corridor': s('records-corridor', 'Restricted stacks'),
  'lift-lobby': s('lift-lobby', 'Anonymous tracks', [], { clip: false }),
  'restricted-door': s('restricted-door', 'Access-controlled door'),
  'plant-corridor': s('plant-corridor', 'Restricted service route', [], {
    clip: false,
  }),
  'roof-access': s('roof-access', 'Rooftop access', [], { clip: false }),
  'office-lobby': s('office-lobby', 'Entry / exit line'),
  'turnstile-line': s('turnstile-line', 'Access control', [], { clip: false }),
  'office-carpark': s('office-carpark', 'Vehicle tracks', [], { clip: false }),
  'office-dock': s('office-dock', 'Service bay', [], { clip: false }),
  'security-queue': s('security-queue', 'Queue length'),
  'gate-hold': s('gate-hold', 'Crowd density'),
  'escalator-landing': s('escalator-landing', 'Flow direction'),
  'transit-concourse': s('transit-concourse', 'Crowd density'),
  'transit-platform': s('transit-platform', 'Platform edge'),
  'taxi-rank': s('taxi-rank', 'Pick-up queue'),
  'shop-entrance': s('shop-entrance', 'Entry / exit line'),
  'retail-checkout': s('retail-checkout', 'Queue length'),
  'retail-aisle': s('retail-aisle', 'Anonymous tracks'),
  'stockroom-door': s('stockroom-door', 'Access-controlled door'),
  'retail-dock': s('retail-dock', 'Vehicle tracks'),
  'retail-back': s('retail-back', 'Back-of-house route'),
  'retail-carpark': s('retail-carpark', 'Vehicle tracks'),
  'hosp-entrance': s('hosp-entrance', 'Entry / exit line'),
  'ed-waiting': s('ed-waiting', 'Crowd density'),
  'ward-corridor': s('ward-corridor', 'Anonymous tracks'),
  'pharmacy-door': s('pharmacy-door', 'Access-controlled door'),
  'ambulance-bay': s('ambulance-bay', 'Keep-clear zone'),
  'hosp-carpark': s('hosp-carpark', 'Vehicle tracks'),
  'care-entrance': s('care-entrance', 'Entry / exit line'),
  'care-lounge': s('care-lounge', 'Fall detection'),
  'care-dining': s('care-dining', 'Fall detection'),
  'care-corridor': s('care-corridor', 'Fall detection'),
  'care-garden': s('care-garden', 'Secure boundary'),
  'care-laundry': s('care-laundry', 'Back-of-house route'),
  'care-carpark': s('care-carpark', 'Vehicle tracks'),
  'site-entrance': s('site-entrance', 'Site access'),
  'site-laydown': s('site-laydown', 'Lifting zone'),
  'site-scaffold': s('site-scaffold', 'PPE compliance'),
  'site-excavation': s('site-excavation', 'Edge protection'),
  'site-crane': s('site-crane', 'Exclusion zone'),
  'site-road': s('site-road', 'Plant / pedestrian split'),
  'site-welfare': s('site-welfare', 'Muster point'),
  'goods-dock': s('goods-dock', 'Vehicle tracks'),
  'racking-aisle': s('racking-aisle', 'Plant / pedestrian split'),
  'pick-face': s('pick-face', 'Anonymous tracks'),
  'machine-cell': s('machine-cell', 'Machine guard zone'),
  'packing-line': s('packing-line', 'Anonymous tracks'),
  'plant-yard': s('plant-yard', 'Vehicle tracks'),
  'charging-bay': s('charging-bay', 'Restricted bay'),
} satisfies Record<string, Scene>;

export const sceneKeys = Object.keys(scenes) as SceneKey[];

/** Resolve a public file against the build base so it works under any path. */
export function assetUrl(path: string) {
  const base =
    (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/${path}`;
}

export const mediaUrl = (file: string) => assetUrl(`media/${file}`);
