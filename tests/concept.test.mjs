import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {conceptModules,makeConceptSeeds,conceptAdvanceError,conceptFormError,fieldsForTopic,studyCoverage} from '../app/concept-data.ts';
test('study features map to active workflows or explicitly removed scope',()=>{
 assert.equal(studyCoverage.length,33);
 assert.equal(new Set(studyCoverage.map(x=>x.need)).size,33);
 for(const row of studyCoverage){if(row.workspace==='Incidents'||row.workspace==='Removed from current scope')continue;const m=conceptModules.find(m=>m.title===row.workspace);assert.ok(m,row.workspace);assert.ok(m.topics.includes(row.workflow),row.workflow);}
 const report=readFileSync('docs/research/malaysia-feature-gap-register.csv','utf8');
 for(const row of studyCoverage)assert.ok(report.includes(row.need),`Study need missing: ${row.need}`);
});
test('sample records are independently scoped to each school with unique IDs',()=>{
 const records=makeConceptSeeds(['School A','School B']);
 assert.equal(new Set(records.map(r=>r.id)).size,records.length);
 assert.equal(records.filter(r=>r.school==='School A').length,records.filter(r=>r.school==='School B').length);
 assert.ok(records.every(r=>r.history.length&&r.stage>=0));
});
test('all workflow types have unique structured field names and staged review',()=>{
 for(const m of conceptModules){assert.ok(m.stages.length>=4);assert.ok(m.checks.length>=4);for(const topic of m.topics){const fields=fieldsForTopic(m,topic);assert.equal(new Set(fields.map(f=>f.key)).size,fields.length);}}
});
test('records cannot complete without notes and the verification checklist',()=>{
 for(const m of conceptModules){const r={...makeConceptSeeds(['School A']).find(r=>r.module===m.id),stage:m.stages.length-2};assert.match(conceptAdvanceError(r,m,'short'),/10 characters/);assert.match(conceptAdvanceError(r,m,'A meaningful outcome is recorded'),/checklist/);}
});
test('evacuation closure requires responder acknowledgement and verified headcounts',()=>{
 const m=conceptModules.find(m=>m.id==='emergency-centre');let r={...makeConceptSeeds(['A']).find(r=>r.module===m.id),stage:3,checked:[...m.checks]};
 assert.match(conceptAdvanceError(r,m,'Exercise outcome recorded'),/acknowledgement/);
 r={...r,values:{...r.values,delivery:'Simulated'}};assert.match(conceptAdvanceError(r,m,'Exercise outcome recorded'),/headcounts/);
 r={...r,values:{...r.values,muster0:'Confirmed',muster1:'Confirmed',muster2:'Confirmed'}};assert.equal(conceptAdvanceError(r,m,'Exercise outcome recorded'),'');
});
test('movement cannot close before staff record the final sign-out',()=>{
 const m=conceptModules.find(m=>m.id==='movement-visitors');const r={...makeConceptSeeds(['A']).find(r=>r.module===m.id),stage:3,checked:[...m.checks]};assert.match(conceptAdvanceError(r,m,'Final outcome recorded'),/sign-out/);
});
test('new records require an active school owner and valid dates',()=>{
 const m=conceptModules[0];const values={title:'Example concern',details:'A fictional concern for review',location:'Corridor',topic:m.topics[0],priority:'High',owner:'Nadia',due:'2026-09-14'};
 for(const f of fieldsForTopic(m,values.topic))values[f.key]=f.options?.[0]||'Example';
 assert.equal(conceptFormError(m,values,['Nadia']),'');
 assert.match(conceptFormError(m,{...values,owner:'Another school'},['Nadia']),/active owner/);
 assert.match(conceptFormError(m,{...values,due:'2026-02-30'},['Nadia']),/date/);
 assert.match(conceptFormError(m,{...values,topic:'Unknown'},['Nadia']),/workflow type/);
});
test('every workspace has a local image and playable concept clip',()=>{
 for(const m of conceptModules){const ext=['hostel','inspection'].includes(m.scene)?'png':'jpg';assert.ok(existsSync(`public/media/${m.scene}.${ext}`),m.scene);assert.ok(existsSync(`public/media/${m.scene}.mp4`),m.scene);}
});
