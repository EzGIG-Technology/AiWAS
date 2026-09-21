import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { industries } from '../app/industries.ts';

// camera-media.tsx is a .tsx module, which node's type stripping will not load,
// so the registry is read as source. That is deliberate: the point of these
// tests is that the table and the files on disk agree, and reading the table as
// text is enough to check that.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../app/camera-media.tsx', import.meta.url), 'utf8');

/** Scene keys, in declaration order, from the mediaSources table. */
const registry = src
  .slice(src.indexOf('export const mediaSources'), src.indexOf('const zoneScenes'))
  .match(/^  '?([a-z-]+)'?: \{/gm)
  .map((line) => line.replace(/[^a-z-]/g, ''));

/** zone -> scene, per industry, from the zoneScenes table. */
function zoneMap() {
  const block = src.slice(src.indexOf('const zoneScenes'), src.indexOf('const extraScenes'));
  const out = {};
  let current = null;
  for (const line of block.split('\n')) {
    const industry = line.match(/^  '?([a-z-]+)'?: \{$/);
    if (industry) {
      current = industry[1];
      out[current] = {};
      continue;
    }
    const pair = line.match(/^    '?([^':]+)'?: '([a-z-]+)',$/);
    if (pair && current) out[current][pair[1].replace(/'/g, '')] = pair[2];
  }
  return out;
}

const files = readdirSync(new URL('../public/media', import.meta.url));
const stills = new Set(
  files.filter((f) => /\.(jpg|png)$/.test(f)).map((f) => f.replace(/\.(jpg|png)$/, '')),
);
const clips = new Set(files.filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4)));

/** The clip a scene plays: its own, or the one it redirects to. */
function clipFor(scene) {
  const entry = src.match(
    new RegExp(`^  '?${scene}'?: \\{[\\s\\S]*?\\n  \\},`, 'm'),
  );
  const redirect = entry && entry[0].match(/clip: '([a-z-]+)'/);
  return redirect ? redirect[1] : scene;
}

test('every scene in the registry has a still on disk', () => {
  for (const scene of registry)
    assert.ok(stills.has(scene), `${scene} has no still image`);
});

test('every scene plays a clip that exists', () => {
  for (const scene of registry) {
    const clip = clipFor(scene);
    assert.ok(clips.has(clip), `${scene} plays ${clip}.mp4, which is missing`);
  }
});

test('every monitored zone in every industry resolves to a scene', () => {
  const map = zoneMap();
  for (const industry of industries) {
    const zones = map[industry.id];
    assert.ok(zones, `${industry.id} has no zone-to-scene map`);
    for (const zone of industry.zones)
      assert.ok(
        zones[zone] && registry.includes(zones[zone]),
        `${industry.id}: "${zone}" has no camera view`,
      );
  }
});

test('an industry never borrows another industry’s scenes', () => {
  const map = zoneMap();
  const owner = new Map();
  for (const [industry, zones] of Object.entries(map))
    for (const scene of Object.values(zones)) {
      assert.ok(
        !owner.has(scene) || owner.get(scene) === industry,
        `${scene} is used by both ${owner.get(scene)} and ${industry}`,
      );
      owner.set(scene, industry);
    }
});

/** Scenes an industry uses that are not tied to a monitored zone. */
function extraMap() {
  const block = src.slice(src.indexOf('const extraScenes'), src.indexOf('const industryFallback'));
  const out = {};
  for (const m of block.matchAll(/^  '?([a-z-]+)'?: \[([^\]]*)\],$/gm))
    out[m[1]] = m[2].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  return out;
}

test('every capability points at a scene from its own industry', () => {
  const map = zoneMap();
  const extra = extraMap();
  for (const industry of industries) {
    const own = new Set([
      ...Object.values(map[industry.id]),
      ...(extra[industry.id] ?? []),
    ]);
    for (const cap of industry.capabilities)
      assert.ok(
        own.has(cap.scene),
        `${industry.id}/${cap.id} illustrates itself with "${cap.scene}", which belongs to another estate`,
      );
  }
});

/** zone -> scene for the security portfolio, read from the source table. */
function securityMap() {
  const block = src.slice(
    src.indexOf('const securityScenes'),
    src.indexOf('export function securityScene'),
  );
  const out = {};
  for (const m of block.matchAll(/^  '?([^':]+)'?: '([a-z-]+)',$/gm))
    out[m[1].replace(/'/g, '')] = m[2];
  return out;
}

test('every security camera position resolves to a scene that exists', async () => {
  const { sites } = await import('../app/security/data.ts');
  const workspace = readFileSync(
    new URL('../app/security/workspace.tsx', import.meta.url),
    'utf8',
  );
  const zones = workspace
    .slice(workspace.indexOf('const cameraZones'))
    .match(/\[([^\]]*)\]/)[1]
    .split(',')
    .map((z) => z.trim().replace(/'/g, ''))
    .filter(Boolean);
  assert.ok(zones.length >= 8, 'expected the demo estate camera positions');
  assert.ok(sites.length >= 3, 'expected the demo estate sites');

  const map = securityMap();
  for (const zone of zones) {
    const scene = map[zone];
    assert.ok(scene, `security position "${zone}" has no camera view`);
    assert.ok(registry.includes(scene), `${zone} points at unknown scene ${scene}`);
    assert.ok(stills.has(scene), `${zone} scene ${scene} has no still`);
    assert.ok(clips.has(clipFor(scene)), `${zone} scene ${scene} has no clip`);
  }
});

test('incident zones carrying a camera reference still resolve', () => {
  const map = securityMap();
  // Incident records read "North fence · N-02"; the position is the part
  // before the separator, which is what securityScene() strips off.
  for (const zone of ['North fence \u00b7 N-02', 'Loading bay \u00b7 L-03', 'Car park \u00b7 P-04'])
    assert.ok(
      map[zone.split('\u00b7')[0].trim()],
      `"${zone}" does not resolve to a camera view`,
    );
});
