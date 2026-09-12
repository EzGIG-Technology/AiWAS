import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import Home, {ConceptWorkspace,ReportingPreview} from '../dist/audit-ssr/render-entry.js';
import {conceptModules} from '../app/concept-data.ts';
import {initialUsers,schools} from '../app/data.ts';
const html = renderToString(React.createElement(Home));
for (const label of [
  'School command centre',
  'Response workspace',
  'Critical',
  'High',
  'Report concern',
]) {
  assert.ok(html.includes(label), `Missing initial screen content: ${label}`);
}
assert.ok(!html.includes('NaN'), 'Invalid numeric output');
assert.ok(!html.includes('[object Object]'), 'Object rendered as text');
console.log(
  'PASS: initial school screen renders with navigation, priorities and reporting controls. This is not a browser interaction test.',
);

for (const m of conceptModules) {
 const screen=renderToString(React.createElement(ConceptWorkspace,{view:m.title,school:schools[0],schools,users:initialUsers,privileged:true,onAlert:()=>{}}));
 assert.ok(screen.includes(m.action),`Missing action in ${m.title}`);
 assert.ok(screen.includes(m.samples[0].title),`Missing sample in ${m.title}`);
 assert.ok(!screen.includes('NaN'),`Invalid value in ${m.title}`);
}
const restricted=renderToString(React.createElement(ConceptWorkspace,{view:'Platform readiness',school:schools[0],schools,users:initialUsers,privileged:false,onAlert:()=>{}}));
assert.equal(restricted,'','Platform preview must be hidden from school workspace');
const portal=renderToString(React.createElement(ReportingPreview,{school:schools[0],onReport:()=> 'DEMO'}));
assert.ok(portal.includes('What would you like help with?'));
console.log('PASS: all seven concept workspaces, platform scope guard and pupil/family portal render.');
