# AiWAS full UI concept guide

Current scope update (12 September 2026): Facilities & health has since been removed at the product owner’s request. Campus insights now covers camera-derived operational analytics. Historical descriptions below reflect the earlier delivery; see research/campus-camera-value-study.md for the current direction.

Updated 12 September 2026. All 33 areas in the Malaysian school study now have a UI representation. This is an interactive, fictional demonstration; it does not establish that the corresponding live services exist.

## Demonstrating the experience

1. Choose a school and use Overview to inspect priority-grouped alerts and open the new work areas.
2. Open a work area's Scenario & media tab. Play the sample clip and run the ten-second simulation. It creates a fictional alert in the incident list and a record in the work area. The timer illustrates a target experience, not measured AI latency.
3. Open the created record, assign an owner and due date, update its structured fields, record actions and complete its verification checklist. Advance through the stages with an outcome note. Closure guards require the relevant acknowledgements, headcounts or sign-out records.
4. In Safeguarding, try the pupil/family reporting preview. It creates a fictional concern and returns a reference. Review protection actions and independent referrals in the case workspace.
5. In Emergency centre, record responder acknowledgement, verify the three example muster groups and log contact attempts. Manual emergency records can be created immediately without the simulation timer.
6. In Hostel operations, reconcile sample residents, approved leave, welfare rounds and shift handover.
7. In Movement & visitors, review authority and record arrival, handover and departure. The sample pass is not a functioning access credential.
8. In Facilities & health, record restrictions, inspections and verification. Activities & continuity provides sample weather conditions, decisions and contingency details.
9. Switch to the superadmin preview for Platform readiness. Explore fictional service tests, retention/access settings, invitation fields and aggregate reporting. Appearance classification remains disabled and is represented as a policy review.

Registers support search, filtering, creation, record editing, notes, history and CSV export. Records are scoped to the selected school. Seven new work areas complement the existing camera, incident, response, presence, analytics and administration views.

## Study coverage

The table records where each research need is represented in the UI. It is not a production capability certification.

| Study need | Workspace | Workflow |
| --- | --- | --- |
| Visible fighting or assault | Incidents | Evidence review and response |
| Repeated bullying, intimidation and extortion | Safeguarding | Bullying & intimidation |
| Verbal, discriminatory or social exclusion bullying | Safeguarding | Verbal or discriminatory bullying |
| Cyberbullying and threats | Safeguarding | Cyberbullying or threats |
| Sexual harassment, grooming or abuse | Safeguarding | Sexual safeguarding concern |
| Adult misconduct or abuse of authority | Safeguarding | Adult conduct concern |
| Visible weapon or credible threat | Emergency centre | Visible weapon or credible threat |
| Emotional distress or self-harm concern | Safeguarding | Emotional wellbeing |
| Medical collapse or injury | Emergency centre | Medical assistance |
| Smoking/vaping/substance concern | Safeguarding | Substance support |
| Missing pupil / unexplained absence | Emergency centre | Missing pupil search |
| Visitor or contractor access | Movement & visitors | Visitor access |
| Boarding-school supervision | Hostel operations | Duty roster & shift handover |
| Retaliation after a complaint | Safeguarding | Retaliation after reporting |
| Emergency family contact/reunification | Emergency centre | Family reunification |
| Fire and smoke | Emergency centre | Evacuation / fire alarm |
| Electrical hazards | Facilities & health | Electrical / fire-equipment inspection |
| Structural defects, drains and unsafe equipment | Facilities & health | Structural or sports-equipment defect |
| Flood and severe-weather disruption | Activities & continuity | Flood closure & reopening |
| Heat and outdoor activities | Activities & continuity | Heat / outdoor activity review |
| Food safety / canteen hygiene | Facilities & health | Canteen food safety |
| Infectious-disease clusters | Facilities & health | Illness cluster review |
| Toilets, water and cleaning | Facilities & health | Toilets / water / cleaning |
| Gate congestion and pedestrian conflict | Movement & visitors | Gate congestion & near miss |
| School transport and collection | Movement & visitors | School transport boarding / alighting |
| Excursions, sports and water activities | Activities & continuity | Sports / excursion approval |
| Accessibility / PPKI support | Activities & continuity | PPKI / individual assistance |
| Camera obstruction, stale video and network failure | Platform readiness | Camera obstruction / stale feed |
| Power outage and communications failure | Activities & continuity | Power / communication outage |
| Attendance administration | Movement & visitors | Attendance reconciliation |
| Reporting burden and case accountability | Platform readiness | Attendance import / report export |
| Theft, vandalism and lost property | Facilities & health | Asset theft / lost property |
| Uniform/person-type classification | Platform readiness | Uniform / person-type policy |

## Media

Nine local scene pairs provide images and MP4 previews: courtyard, hall, corridor, canteen, perimeter, gate, training, hostel and inspection. The two new scenes depict adult hostel wardens and adult maintenance staff inspecting a goalpost. All scenes are synthetic; clips are animated stills, not recordings of moving people. See [media notes](concept-media-notes.md).

## Practical limits

All records and actions are fictional and held in page memory; refresh resets changes. Role selection previews navigation and is not authentication or enforceable authorization. There is no live CCTV ingestion, AI model, facial recognition, shared database, notification delivery or external integration. The teacher mobile app remains outside this UI scope.

Scenario simulations create both a work-area record and an incident. Their subsequent statuses are independent. Ordinary work-area forms and the reporting preview create work-area records; they do not automatically create dashboard incidents. Aggregate previews derive from fictional work-area records.

The interface illustrates intended staff decisions and review steps. Its simulated outcomes must not be interpreted as evidence that a real pupil is safe, a message was delivered or a facility was cleared.

## Verification and deployment

Verification includes workflow unit tests, server-rendering smoke checks across all seven areas, TypeScript, application lint and the Vercel static build. A browser preview could not start because the environment denied binding a localhost port; visual and full browser interaction QA remain outstanding. The build emits a JavaScript chunk-size advisory.

The earlier hosted demo does not automatically reflect these local changes. GitHub/Vercel publication requires a successful push and deployment.
