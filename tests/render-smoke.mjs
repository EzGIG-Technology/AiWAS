import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import Home from '../dist/audit-ssr/page.js';
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
