// Server-renders every screen for every role. This catches crashes, NaN and
// leaked objects, and checks what each role must never see. It is not a
// browser interaction test.
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
  Pdf,
  personas,
  um,
  alerts,
  govern,
} from '../dist/test-ssr/entry.js';

const h = React.createElement;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const render = (el) => renderToString(h(DemoProvider, null, el));
const clean = (html, where) => {
  assert.ok(!html.includes('NaN'), `NaN in ${where}`);
  assert.ok(!html.includes('[object Object]'), `object rendered in ${where}`);
  assert.ok(!html.includes('undefined'), `undefined rendered in ${where}`);
};

test('sign-in renders the three entry points and the UM logo', () => {
  const html = renderToString(h(Home));
  for (const s of [
    'Universiti Malaya',
    'KPT',
    'Warden app',
    'Security director',
    'One AI layer over the cameras a campus already has',
    'logos/um-lockup.png',
    'No credentials are collected',
  ])
    assert.ok(html.includes(s), `sign-in missing ${s}`);
  clean(html, 'sign-in');
});

for (const p of personas.personas.filter((x) => x.workspace === 'um')) {
  test(`UM workspace renders every screen for the ${p.title}`, () => {
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

test('the console sorts the escalated hostel alert to the top of the queue', () => {
  const html = render(
    h(UmWorkspace, {
      persona: personas.personaById('operator'),
      view: 'console',
    }),
  );
  const queue = html.slice(html.indexOf('Live alert queue'));
  const first = alerts.alertByKey('track');
  assert.ok(queue.indexOf(esc(first.title)) > 0, 'escalated alert missing');
  assert.ok(queue.includes('Escalated: no warden accepted in 5 min'));
  for (const other of alerts.seedAlerts.filter(
    (a) => a.status !== 'Closed' && a.id !== first.id,
  ))
    if (queue.includes(esc(other.title)))
      assert.ok(
        queue.indexOf(esc(first.title)) <= queue.indexOf(esc(other.title)),
        `${other.id} above the escalated alert`,
      );
});

test('HEP sees only cases referred to it', () => {
  const html = render(
    h(UmWorkspace, { persona: personas.personaById('hep'), view: 'cases' }),
  );
  for (const c of alerts.seedCases)
    assert.equal(
      html.includes(c.id),
      c.status === 'With HEP',
      `${c.id} (${c.status})`,
    );
});

test('the Pengetua sees KK12 only', () => {
  const html = render(
    h(UmWorkspace, {
      persona: personas.personaById('pengetua'),
      view: 'hostel',
    }),
  );
  assert.ok(html.includes('KK12 Blok A'));
  assert.ok(!html.includes('KK9 Blok B'), 'Pengetua sees another college');
});

test('KPT renders every screen with aggregates only', () => {
  const p = personas.personaById('kpt');
  for (const view of Object.keys(kptTitles)) {
    const html = render(h(KptWorkspace, { persona: p, view }));
    assert.ok(html.includes(esc(kptTitles[view])), `${view} title`);
    assert.ok(
      !html.includes('/media/') && !html.includes('<video'),
      `${view} shows media`,
    );
    assert.ok(!/UM-C\d{3}/.test(html), `${view} shows a camera id`);
    assert.ok(!/Blok [AB]/.test(html), `${view} names a hostel block`);
    const body = html.replace(/Pn\. Rozita Abdullah/g, '');
    for (const n of govern.users.map((u) => u.name))
      assert.ok(!body.includes(n), `${view} shows ${n}`);
    clean(html, `kpt/${view}`);
  }
});

test('the warden app shows KK12 hostel alerts only', () => {
  const html = render(h(AppsWorkspace));
  assert.ok(html.includes('EzVision Warden'));
  assert.ok(
    html.includes(esc(alerts.alertByKey('track').title)),
    'lounge-line alert missing',
  );
  assert.ok(
    !html.includes(esc(alerts.alertByKey('visitor').title)),
    'KK9 alert leaked to KK12',
  );
  assert.ok(html.includes('On duty'));
  clean(html, 'warden app');
});

test('the PDF writer produces a well-formed file', async () => {
  const pdf = new Pdf();
  pdf.watermark('UM · CS-26-039 · test');
  pdf.text('EzVision Campus · Evidence export – “quotes” ≥ 0.8', {
    bold: true,
  });
  for (let i = 0; i < 80; i++)
    pdf.para(`Line ${i} (with brackets) and a backslash \\`);
  const buf = Buffer.from(await pdf.build().arrayBuffer());
  const text = buf.toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
  const pages = (text.match(/\/Type \/Page\b/g) ?? []).length;
  assert.ok(pages >= 2, 'long text should flow onto a second page');
  const xref = Number(text.match(/startxref\n(\d+)/)[1]);
  assert.ok(text.slice(xref).startsWith('xref'));
  const offsets = [...text.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map(
    (m) => Number(m[1]),
  );
  offsets.forEach((o, i) =>
    assert.ok(
      text.slice(o).startsWith(`${i + 1} 0 obj`),
      `object ${i + 1} offset`,
    ),
  );
});
