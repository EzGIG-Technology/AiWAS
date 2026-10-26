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

test('sign-in renders both points of view', () => {
  const html = renderToString(h(Home));
  for (const s of [
    'Universiti Malaya',
    'KPT',
    'Mobile apps',
    'Chief Security Officer',
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
      }
    }
  });
}

test('KPT workspace renders every view with aggregates only', () => {
  const p = personas.personaById('kpt');
  const names = [
    ...um.officers.map((o) => o.name),
    ...um.users.map((u) => u.name),
  ];
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
    const body = html.replace(/Pn\. Rozita Abdullah/g, '');
    for (const n of names) assert.ok(!body.includes(n), `${view} shows ${n}`);
    clean(html, `kpt/${view}`);
  }
});

test('both apps render', () => {
  for (const app of ['student', 'patrol']) {
    const html = render(h(AppsWorkspace, { app }));
    assert.ok(html.includes(app === 'student' ? 'EzSafe' : 'EzPatrol'));
    clean(html, app);
  }
});

test('the alarm queue lists a confidential report without its location or summary', () => {
  const soc = personas.personaById('soc');
  const html = render(h(UmWorkspace, { persona: soc, view: 'incidents' }));
  assert.ok(html.includes('Confidential report: harassment'));
  assert.ok(html.includes('Location withheld'));
  assert.ok(!html.includes('Submitted through the EzSafe confidential lane'));
});
