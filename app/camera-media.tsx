'use client';
// Static media must work on both Vercel and Sites without a Next image service.
/* oxlint-disable next/no-img-element */
import { useState } from 'react';
import { Video, ShieldCheck } from 'lucide-react';
export const mediaSources: Record<
  string,
  { label: string; boxes: number[][]; tag: string }
> = {
  hostel: {
    label: 'Hostel common-area duty check',
    boxes: [],
    tag: 'Common-area supervision',
  },
  inspection: {
    label: 'Sports equipment safety inspection',
    boxes: [],
    tag: 'Preventive inspection',
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
};
export function mediaFor(zone: string, category = '') {
  if (
    category === 'Visible blade concern' ||
    zone === 'Safety training corridor'
  )
    return 'training';
  return (
    (
      {
        Courtyard: 'courtyard',
        'Assembly hall': 'hall',
        'Block A corridor': 'corridor',
        Canteen: 'canteen',
        'East perimeter': 'perimeter',
        'Main gate': 'gate',
      } as Record<string, string>
    )[zone] || ''
  );
}
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
        src={`/media/${scene}.${['hostel', 'inspection'].includes(scene) ? 'png' : 'jpg'}`}
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
  if (!scene)
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
        src={`/media/${scene}.mp4`}
        poster={`/media/${scene}.${['hostel', 'inspection'].includes(scene) ? 'png' : 'jpg'}`}
        controls={!autoPlay}
        autoPlay={autoPlay}
        muted
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
