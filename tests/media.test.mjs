import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { media, um } from '../dist/test-ssr/entry.js';

const files = readdirSync(new URL('../public/media/', import.meta.url));
const keys = Object.keys(media.scenes);

test('every image and video in public/media is used by a scene', () => {
  const used = new Set(
    keys.flatMap((k) =>
      [media.scenes[k].still, media.scenes[k].clip].filter(Boolean),
    ),
  );
  const unused = files.filter((f) => !used.has(f));
  assert.deepEqual(unused, [], `unused media: ${unused.join(', ')}`);
});

test('every scene file exists on disk', () => {
  for (const k of keys) {
    const s = media.scenes[k];
    assert.ok(
      existsSync(new URL(`../public/media/${s.still}`, import.meta.url)),
      `missing still ${s.still}`,
    );
    if (s.clip)
      assert.ok(
        existsSync(new URL(`../public/media/${s.clip}`, import.meta.url)),
        `missing clip ${s.clip}`,
      );
  }
});

test('no scene plays another scene’s clip', () => {
  for (const k of keys) {
    const { clip } = media.scenes[k];
    if (clip) assert.equal(clip, `${k}.mp4`, `${k} borrows ${clip}`);
  }
});

test('every scene is mounted on exactly one UM camera', () => {
  for (const k of keys) {
    const n = um.cameras.filter((c) => c.scene === k).length;
    assert.equal(n, 1, `${k} is on ${n} cameras`);
  }
  assert.equal(um.cameras.length, keys.length);
});

test('overlay boxes stay inside the frame', () => {
  for (const k of keys) {
    for (const [x, y, w, h] of media.scenes[k].boxes) {
      assert.ok(
        x >= 0 && y >= 0 && x + w <= 100 && y + h <= 100,
        `${k} box out of frame`,
      );
    }
  }
});
