// Server-renders every screen for every role. This catches crashes, NaN and
// leaked objects; it is not a browser interaction test.
import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  Home,
  DemoProvider,
  UmWorkspace,
  umAccess,
  umTitles,
  KptWorkspace,
  kptTitles,
  AppsWorkspace,
  personas,
  um,
} from '../dist/test-ssr/entry.js';

const h = React.createElement;
const esc = (s) => s.replace(/&/g, '&amp;');
const render = (el) => renderToString(h(DemoProvider, null, el));
const clean = (html, where) => {
  assert.ok(!html.includes('NaN'), `NaN in ${where}`);
  assert.ok(!html.includes('[object Object]'), `object rendered in ${where}`);
  assert.ok(!html.includes('undefined'), `undefined rendered in ${where}`);
};

test('sign-in renders both points of view and the UM logo', () => {
  const html = renderToString(h(Home));
  for (const s of [
    'Universiti Malaya',
    'KPT',
    'Mobile app',
    'Director, Security Technology',
    'Camera intelligence for universities',
    'logos/um-lockup.png',
    'No credentials are collected',
  ]) {
    assert.ok(html.includes(s), `sign-in missing ${s}`);
  }
  clean(html, 'sign-in');
});

for (const p of personas.personas.filter((x) => x.workspace === 'um')) {
  test(`UM workspace renders every view for ${p.title}`, () => {
    for (const view of umAccess[p.id]) {
      const html = render(h(UmWorkspace, { persona: p, view }));
      assert.ok(html.includes(esc(umTitles[view])), `${p.id}/${view} title`);
      clean(html, `${p.id}/${view}`);
      if (!p.video) {
        assert.ok(!html.includes('<video'), `${p.id}/${view} shows video`);
        assert.ok(
          !html.includes('/media/'),
          `${p.id}/${view} shows camera media`,
        );
        for (const r of um.plateReads)
          assert.ok(
            !html.includes(r.plate),
            `${p.id}/${view} shows plate ${r.plate}`,
          );
      }
    }
  });
}

test('KPT workspace renders every view with aggregates only', () => {
  const p = personas.personaById('kpt');
  for (const view of Object.keys(kptTitles)) {
    const html = render(h(KptWorkspace, { persona: p, view }));
    assert.ok(
      html.includes('Aggregates only'),
      `${view} lacks the exclusion banner`,
    );
    assert.ok(
      !html.includes('/media/') && !html.includes('<video'),
      `${view} shows media`,
    );
    assert.ok(!/UM-C\d{3}/.test(html), `${view} shows a camera id`);
    const body = html.replace(/Pn\. Rozita Abdullah/g, '');
    for (const n of um.users.map((u) => u.name))
      assert.ok(!body.includes(n), `${view} shows ${n}`);
    clean(html, `kpt/${view}`);
  }
});

test('EzVision Mobile renders its alerts', () => {
  const html = render(h(AppsWorkspace));
  assert.ok(html.includes('EzVision Mobile'));
  const open = um.cameraEvents.find((e) => e.status === 'New');
  assert.ok(
    html.includes(esc(open.title)),
    'open detection missing from alerts',
  );
  clean(html, 'mobile');
});
