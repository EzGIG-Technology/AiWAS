import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import Home, {ConceptWorkspace,ReportingPreview,DetectionStudio,CampusInsights,TeacherApp} from '../dist/audit-ssr/render-entry.js';
import {conceptModules} from '../app/concept-data.ts';
import {initialUsers,schools,cameras,initialIncidents} from '../app/data.ts';
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
console.log('PASS: all concept workspaces, platform scope guard and pupil/family portal render.');

const studio=renderToString(React.createElement(DetectionStudio,{school:schools[0],onAlert:()=>{},onOpen:()=>{}}));
for(const label of ['Capability lab','PoC evaluation','Platform coverage','Save demonstration rule','Restricted-area entry'])assert.ok(studio.includes(label));
console.log('PASS: Detection studio renders capability, configuration and research coverage controls.');

for(const forbidden of ['JPN proposal','JPN document','JPN NS AIWAS.pdf','PDF page','80% baseline'])assert.ok(!studio.includes(forbidden));

const campus=renderToString(React.createElement(CampusInsights,{school:schools[0],cameras,onAlert:()=>{},onOpen:()=>{}}));
for(const label of ['Campus heatmap','Trends &amp; movement','School planning','Assembly hall: coverage unavailable','Canteen: 118 estimated people'])assert.ok(campus.includes(label),label);
assert.ok(!html.includes('Facilities &amp; health'));
console.log('PASS: campus heatmap renders known and unavailable zones; removed module is absent.');

const teacherScreen=renderToString(React.createElement(TeacherApp,{school:schools[0],incidents:initialIncidents,users:initialUsers,teacher:'Nur Aisyah',onExit:()=>{},onAction:()=>'',onReport:()=>{}}));
for(const label of ['Hello,','Report a concern','My follow-ups','Needs attention','Teacher app navigation'])assert.ok(teacherScreen.includes(label));
assert.ok(!teacherScreen.includes('SK Seremban Jaya'));
console.log('PASS: teacher home renders scoped school alerts and mobile navigation.');
