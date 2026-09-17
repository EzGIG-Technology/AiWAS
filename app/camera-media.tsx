'use client';
// Static media must work on both Vercel and Sites without a Next image service.
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import { Video, ShieldCheck } from 'lucide-react';

/**
 * Demonstration scene registry.
 *
 * Every monitored zone in every industry resolves to its own synthetic camera
 * view, so a video wall shows a distribution centre when you are running a
 * distribution centre rather than a school corridor with a different caption.
 * None of this is real footage: the scenes are generated, the people in them
 * are not real people, and the overlays are drawn, not detected.
 *
 * `boxes` are hand-placed illustrative tracking rectangles in percentages of
 * the frame ([x, y, width, height]). A scene with no reviewed box placement
 * carries an empty list rather than rectangles floating over empty floor.
 */
export type Scene = {
  label: string;
  boxes: number[][];
  tag: string;
  /** File extension of the still. */
  ext?: 'jpg' | 'png';
  /** Scene whose clip to play. Defaults to the scene's own clip. */
  clip?: string;
};

export const mediaSources: Record<string, Scene> = {
  // ------------------------------------------------------------ education
  hostel: {
    label: 'Hostel common-area duty check',
    boxes: [],
    tag: 'Common-area supervision',
    ext: 'png',
  },
  inspection: {
    label: 'Sports equipment safety inspection',
    boxes: [],
    tag: 'Preventive inspection',
    ext: 'png',
  },
  courtyard: {
    label: 'Courtyard anonymous tracking',
    boxes: [
      [17.5, 29, 2, 8],
      [34.3, 38.5, 3, 13],
      [44.7, 36.5, 2.5, 11],
      [54.5, 30.5, 2.5, 10],
      [64.3, 39.5, 4, 15],
      [75, 54, 5.5, 19],
    ],
    tag: 'Anonymous tracks',
  },
  hall: {
    label: 'Assembly hall entry / exit',
    boxes: [
      [35.2, 18, 3.4, 13.5],
      [40.5, 21, 3, 13],
      [41.3, 13.5, 2.5, 11.5],
      [44, 15, 2.5, 10.5],
    ],
    tag: 'Entry / exit zone',
  },
  corridor: {
    label: 'Staged corridor disagreement',
    boxes: [
      [40, 23, 6, 32],
      [47, 21, 7, 32],
      [57, 31, 9, 39],
    ],
    tag: 'Anonymous tracks',
  },
  canteen: {
    label: 'Canteen crowd and queue',
    boxes: [[68, 13, 30, 59]],
    tag: 'Crowd review zone',
  },
  perimeter: {
    label: 'Restricted perimeter presence',
    boxes: [[66.7, 41, 2.6, 12]],
    tag: 'Restricted zone',
  },
  gate: {
    label: 'Drop-off vehicle dwell',
    boxes: [
      [37.5, 45, 18, 22],
      [46, 61, 25, 35],
    ],
    tag: 'Vehicle tracks',
  },
  training: {
    label: 'Visible blade evaluation',
    boxes: [
      [37, 13, 10, 47],
      [45.8, 39.8, 1.4, 6.5],
    ],
    tag: 'Inert training prop',
  },

  // ----------------------------------------------------------- healthcare
  'hosp-entrance': {
    label: 'Hospital main entrance',
    boxes: [],
    tag: 'Entry / exit zone',
  },
  'ed-waiting': {
    label: 'Emergency department waiting area',
    boxes: [],
    tag: 'Crowd review zone',
  },
  'ward-corridor': {
    label: 'Inpatient ward corridor',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'pharmacy-door': {
    label: 'Pharmacy store entrance',
    boxes: [],
    tag: 'Restricted zone',
  },
  'ambulance-bay': {
    label: 'Ambulance bay',
    boxes: [],
    tag: 'Keep-clear zone',
  },
  'records-corridor': {
    label: 'Records store corridor',
    boxes: [],
    tag: 'Restricted zone',
  },
  'hosp-carpark': {
    label: 'Staff car park',
    boxes: [],
    tag: 'Vehicle tracks',
  },

  // ------------------------------------------------------------- aged care
  'care-entrance': {
    label: 'Care home main entrance',
    boxes: [],
    tag: 'Entry / exit zone',
  },
  'care-lounge': {
    label: 'Residents’ lounge',
    boxes: [],
    tag: 'Common-area supervision',
  },
  'care-dining': {
    label: 'Dining room service',
    boxes: [],
    tag: 'Common-area supervision',
  },
  'care-corridor': {
    label: 'Residents’ corridor',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'care-garden': {
    label: 'Garden and courtyard',
    boxes: [],
    tag: 'Secure boundary',
  },
  'care-laundry': {
    label: 'Laundry corridor',
    boxes: [],
    tag: 'Back-of-house route',
  },
  'care-carpark': {
    label: 'Visitor car park',
    boxes: [],
    tag: 'Vehicle tracks',
  },

  // ---------------------------------------------------------------- retail
  'shop-entrance': {
    label: 'Shopfront entrance',
    boxes: [],
    tag: 'Entry / exit zone',
  },
  'retail-checkout': {
    label: 'Checkout lanes',
    boxes: [],
    tag: 'Queue review zone',
  },
  'retail-aisle': {
    label: 'Main shop aisle',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'stockroom-door': {
    label: 'Stockroom door',
    boxes: [],
    tag: 'Restricted zone',
  },
  'retail-dock': {
    label: 'Store loading bay',
    boxes: [],
    tag: 'Vehicle tracks',
  },
  'retail-back': {
    label: 'Back-of-house corridor',
    boxes: [],
    tag: 'Back-of-house route',
  },
  'retail-carpark': {
    label: 'Customer car park',
    boxes: [],
    tag: 'Vehicle tracks',
  },

  // ---------------------------------------------------------- construction
  'site-entrance': {
    label: 'Site entrance and turnstile',
    boxes: [],
    tag: 'Entry / exit zone',
  },
  'site-laydown': {
    label: 'Material laydown area',
    boxes: [],
    tag: 'Lifting zone',
  },
  'site-scaffold': {
    label: 'Scaffold zone',
    boxes: [],
    tag: 'Work at height',
  },
  'site-excavation': {
    label: 'Excavation edge',
    boxes: [],
    tag: 'Edge protection',
  },
  'site-crane': {
    label: 'Crane radius',
    boxes: [],
    tag: 'Exclusion zone',
  },
  'site-road': {
    label: 'Site access road',
    boxes: [],
    tag: 'Plant / pedestrian split',
  },
  'site-welfare': {
    label: 'Welfare cabin area',
    boxes: [],
    tag: 'Muster point',
  },

  // ------------------------------------------------------------ industrial
  'goods-dock': {
    label: 'Goods-in dock',
    boxes: [],
    tag: 'Vehicle tracks',
  },
  'racking-aisle': {
    label: 'Racking aisle',
    boxes: [],
    tag: 'Plant / pedestrian split',
  },
  'pick-face': {
    label: 'Pick face',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'machine-cell': {
    label: 'Guarded machine cell',
    boxes: [],
    tag: 'Exclusion zone',
  },
  'packing-line': {
    label: 'Packing line',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'plant-yard': {
    label: 'Trailer yard',
    boxes: [],
    tag: 'Vehicle tracks',
  },
  'charging-bay': {
    label: 'Battery charging area',
    boxes: [],
    tag: 'Restricted zone',
  },

  // ------------------------------------------------------------- transport
  'transit-concourse': {
    label: 'Station concourse',
    boxes: [],
    tag: 'Crowd review zone',
  },
  'transit-platform': {
    label: 'Platform edge',
    boxes: [],
    tag: 'Edge protection',
  },
  'gate-hold': {
    label: 'Gate hold room',
    boxes: [],
    tag: 'Crowd review zone',
  },
  'security-queue': {
    label: 'Security screening queue',
    boxes: [],
    tag: 'Queue review zone',
  },
  'escalator-landing': {
    label: 'Escalator landing',
    boxes: [],
    tag: 'Anonymous tracks',
  },
  'taxi-rank': {
    label: 'Taxi rank',
    boxes: [],
    tag: 'Vehicle tracks',
  },
  'restricted-door': {
    label: 'Restricted-side access door',
    boxes: [],
    tag: 'Restricted zone',
  },
  'transit-fence': {
    label: 'Perimeter fence line',
    boxes: [],
    tag: 'Secure boundary',
  },

  // ------------------------------------------------------------ commercial
  'office-lobby': {
    label: 'Ground lobby',
    boxes: [],
    tag: 'Entry / exit zone',
  },
  'turnstile-line': {
    label: 'Turnstile line',
    boxes: [],
    tag: 'Access control',
    clip: 'office-lobby',
  },
  'lift-lobby': {
    label: 'Lift lobby',
    boxes: [],
    tag: 'Anonymous tracks',
    clip: 'office-lobby',
  },
  'office-carpark': {
    label: 'Basement car park',
    boxes: [],
    tag: 'Vehicle tracks',
    clip: 'office-lobby',
  },
  'office-dock': {
    label: 'Service loading dock',
    boxes: [],
    tag: 'Vehicle tracks',
    clip: 'office-lobby',
  },
  'plant-corridor': {
    label: 'Plant room corridor',
    boxes: [],
    tag: 'Restricted zone',
    clip: 'office-lobby',
  },
  'roof-access': {
    label: 'Roof access route',
    boxes: [],
    tag: 'Work at height',
    clip: 'office-lobby',
  },
  'office-perimeter': {
    label: 'Site perimeter',
    boxes: [],
    tag: 'Secure boundary',
    clip: 'office-lobby',
  },
};

/**
 * Zone-to-scene map, per industry. Zone names repeat between industries
 * ("Main entrance" is both a hospital and a care home), so the industry has to
 * be part of the key: without it a care-home lobby would show a hospital.
 */
const zoneScenes: Record<string, Record<string, string>> = {
  education: {
    'Main gate': 'gate',
    Canteen: 'canteen',
    'Block A corridor': 'corridor',
    'East perimeter': 'perimeter',
    Courtyard: 'courtyard',
    'Assembly hall': 'hall',
    'Hostel common lobby': 'hostel',
    'Safety training corridor': 'training',
  },
  healthcare: {
    'Main entrance': 'hosp-entrance',
    'Emergency department waiting': 'ed-waiting',
    'Ward corridor': 'ward-corridor',
    'Pharmacy store entrance': 'pharmacy-door',
    'Ambulance bay': 'ambulance-bay',
    'Records store corridor': 'records-corridor',
    'Staff car park': 'hosp-carpark',
  },
  'aged-care': {
    'Main entrance': 'care-entrance',
    Lounge: 'care-lounge',
    'Dining room': 'care-dining',
    'Resident corridor': 'care-corridor',
    'Garden and courtyard': 'care-garden',
    'Laundry corridor': 'care-laundry',
    'Visitor car park': 'care-carpark',
  },
  retail: {
    'Shopfront entrance': 'shop-entrance',
    'Checkout area': 'retail-checkout',
    'Main aisle': 'retail-aisle',
    'Stockroom door': 'stockroom-door',
    'Loading bay': 'retail-dock',
    'Back corridor': 'retail-back',
    'Customer car park': 'retail-carpark',
  },
  construction: {
    'Site entrance': 'site-entrance',
    'Material laydown': 'site-laydown',
    'Scaffold zone': 'site-scaffold',
    'Excavation edge': 'site-excavation',
    'Crane radius': 'site-crane',
    'Site access road': 'site-road',
    'Welfare cabin area': 'site-welfare',
  },
  industrial: {
    'Goods-in dock': 'goods-dock',
    'Racking aisle': 'racking-aisle',
    'Pick face': 'pick-face',
    'Machine cell': 'machine-cell',
    'Packing line': 'packing-line',
    Yard: 'plant-yard',
    'Battery charging area': 'charging-bay',
  },
  transport: {
    Concourse: 'transit-concourse',
    Platform: 'transit-platform',
    'Gate hold room': 'gate-hold',
    'Security queue': 'security-queue',
    'Escalator landing': 'escalator-landing',
    'Taxi rank': 'taxi-rank',
    'Restricted-side access door': 'restricted-door',
    'Perimeter fence': 'transit-fence',
  },
  commercial: {
    'Ground lobby': 'office-lobby',
    'Turnstile line': 'turnstile-line',
    'Lift lobby': 'lift-lobby',
    'Car park': 'office-carpark',
    'Loading dock': 'office-dock',
    'Plant room corridor': 'plant-corridor',
    'Roof access': 'roof-access',
    'Site perimeter': 'office-perimeter',
  },
};

/**
 * Scenes an industry uses that are not tied to one monitored zone — a training
 * exercise or a preventive inspection rather than a fixed camera position.
 * They belong to the industry all the same, so they appear in its scenario
 * library and may illustrate its capabilities.
 */
const extraScenes: Record<string, string[]> = {
  education: ['inspection'],
};

/** The view an operator sees first when a zone has no scene of its own. */
const industryFallback: Record<string, string> = {
  education: 'corridor',
  healthcare: 'ed-waiting',
  'aged-care': 'care-lounge',
  retail: 'retail-checkout',
  construction: 'site-scaffold',
  industrial: 'racking-aisle',
  transport: 'transit-concourse',
  commercial: 'office-lobby',
};

/**
 * Every scene belonging to an industry, paired with the zone it covers, in
 * zone order. The scenario library uses this so it offers the estate you are
 * actually running rather than the whole generated catalogue.
 */
export function scenesFor(industryId: string): { scene: string; zone: string }[] {
  const map = zoneScenes[industryId] ?? zoneScenes.education;
  const zoned = Object.entries(map).map(([zone, scene]) => ({ scene, zone }));
  const extra = (extraScenes[industryId] ?? []).map((scene) => ({
    scene,
    zone: mediaSources[scene].label,
  }));
  return [...zoned, ...extra];
}

/**
 * Resolve a zone to its camera view. Falls back to the industry's own first
 * scene rather than to nothing: an operator console that renders "no scene"
 * in half its tiles reads as a broken deployment, not as a demonstration.
 */
export function mediaFor(
  zone: string,
  category = '',
  industryId = 'education',
) {
  if (industryId === 'education') {
    if (category === 'Visible blade concern') return 'training';
  }
  const map = zoneScenes[industryId] ?? zoneScenes.education;
  return map[zone] ?? industryFallback[industryId] ?? 'corridor';
}

/**
 * Media lives beside the built app. Using the Vite base rather than a
 * root-absolute path lets the same bundle serve from a subpath (a preview
 * URL, a project page) as well as from a domain root.
 */
const mediaBase =
  (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ??
  '/';
const asset = (file: string) => `${mediaBase}media/${file}`;
const sceneFile = (scene: string) =>
  `${scene}.${mediaSources[scene]?.ext ?? 'jpg'}`;
const clipFile = (scene: string) =>
  `${mediaSources[scene]?.clip ?? scene}.mp4`;

export function CameraStill({
  scene,
  overlay = true,
}: {
  scene: string;
  overlay?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const data = mediaSources[scene];
  if (!data || failed === scene)
    return (
      <div className="feed-blank">
        <Video size={28} />
        <span>No sample scene available</span>
      </div>
    );
  return (
    <div className="camera-still">
      <img
        src={asset(sceneFile(scene))}
        alt={`Synthetic scene: ${data.label}. Adults in a staged demonstration.`}
        loading="lazy"
        onError={() => setFailed(scene)}
      />
      {overlay &&
        data.boxes.map(([x, y, w, h], i) => (
          <span
            className="track-box"
            key={i}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
            }}
          >
            {i === 0 && <small>{data.tag}</small>}
          </span>
        ))}
      <span className="synthetic-stamp">SYNTHETIC SCENE</span>
    </div>
  );
}
export function DemoVideo({
  scene,
  autoPlay = false,
}: {
  scene: string;
  autoPlay?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!scene || !mediaSources[scene])
    return (
      <div className="evidence-placeholder large">
        <Video size={30} />
        <strong>No example clip for this location</strong>
        <span>This demo contains no real footage.</span>
      </div>
    );
  return (
    <div className="demo-video">
      <video
        key={scene}
        src={asset(clipFile(scene))}
        poster={asset(sceneFile(scene))}
        controls={!autoPlay}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(scene)}
        aria-label={`Synthetic demonstration: ${mediaSources[scene]?.label}`}
      />
      {failed === scene && (
        <p className="media-error">
          The demo clip could not load. Try another scene or reload the page.
        </p>
      )}
      <div className="video-disclosure">
        <ShieldCheck size={13} />
        <span>
          Synthetic animated still · Illustrative overlays · Not real detection
        </span>
      </div>
    </div>
  );
}
