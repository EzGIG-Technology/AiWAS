# AiWAS system audit and user journeys

Audit date: 11 September 2026. Scope: existing source, UI workflows, data model, deployment configuration and automated workflow checks. This is an implementation audit, not a new research study, penetration test, field detection evaluation or browser accessibility certification.

## Executive assessment

AiWAS is an interactive school safety demonstration. It is not yet an operational CCTV safety service. The application now has coherent journeys for reporting, reviewing, assigning, documenting and closing concerns, coordinating follow-up, recording camera maintenance, inspecting campus zones and onboarding a school. The existing camera demonstrations, school presence register, directory, configuration, reporting and user management remain available.

The largest release blockers are server-enforced authentication and school isolation, durable shared records, actual camera ingestion and model evaluation, evidence storage, and reliable notification delivery. A client-side role picker cannot grant or enforce production access. Changes made in this release are held in page memory and disappear on refresh. Real student records must not be entered into the demonstration.

A release decision was requested: real staff sign-in and shared storage, or a fictional interactive demonstration. No provider/configuration decision had been received at the time of this audit. The current Vercel build is static; production services require additional backend work. A successful static build does not establish production readiness.

## Audit findings and disposition

| Priority | Finding | Disposition |
|---|---|---|
| Blocker | No authenticated identity or server-side school isolation | Open; requires a backend and identity provider. Role picker remains explicitly a preview. |
| Blocker | Incident, user, rule, presence and task changes disappear on refresh | Open; shared database, migration, backup and concurrency strategy required. |
| Blocker | CCTV and AI are synthetic demonstrations | Open; actual stream ingestion, evaluation, evidence and operational monitoring required. |
| Blocker | No external notification delivery or acknowledgement escalation | Open; UI routing is not delivery infrastructure. |
| High | Insufficient evidence disappears from the review queue | Fixed in school and fleet counts, reviewed lists and analytics. |
| High | Pending incidents can be closed without a decision or explanation | Fixed: unresolved evidence blocks closure; closing/reopening needs a meaningful reason. |
| High | Review decisions need no explanation | Fixed: minimum 10-character review note required. False-alarm review no longer silently closes a record. |
| High | Staff cannot report an event missed by cameras | Added manual reports with location, priority, concern type, owner and details. |
| High | No explicit follow-up ownership, deadline or update trail | Added incident-linked action register with owner, due date and logged progress. |
| High | Access history mixes school contexts | Filtered access activity by school; this is UI isolation, not a substitute for server authorization. |
| Medium | Acknowledgements can repeat history entries | Added guard for already acknowledged or closed records and school scope. |
| Medium | Seven-day and thirty-day analytics return the same unfiltered data | Fixed date-window boundaries; reports anchor to the latest available school record. |
| Medium | Inconclusive reviews inflate confirmed/reviewed metrics | Fixed final-review predicates. |
| Medium | Category charts omit added concern types and have a fixed denominator | Categories now derive from selected records; bars use actual category totals. |
| Medium | Report export ignores active incident filters | Export now intersects current incident filters and date range, with a 30-day maximum. |
| Medium | Spreadsheet text can be interpreted as formulas | Added CSV quoting and formula-prefix neutralization to incident exports. |
| Medium | User email duplicate check ignores surrounding whitespace | Email comparison now trims input. |
| Medium | Routing Save has no distinct saved state | Added saved snapshot and Discard edits within this session. No external routes are provisioned. |
| Medium | Schools cannot be onboarded from the directory | Added three-step setup with unique name/email validation, review, inactive account and offline first zone. |
| Medium | Offline cameras have no maintenance workflow | Added camera-linked tasks and update history. Completing a task does not claim a feed is repaired. |
| Medium | Campus zones cannot be explored as a response surface | Added selectable zone register with incident links and sample feed state. |
| Medium | Root Vercel output is incompatible with the original Worker build | Dedicated Vite output exists and builds successfully; remote deployment of local commits remains unverified. |
| Medium | Repository-wide lint has existing violations | Still open in legacy app/shared UI files; new workflow modules pass targeted lint. |

## Roles and access model

Use individual staff accounts, not one shared school password. The useful distinction is permission scope, not a separate login implementation for every role.

| Role | Intended scope | Essential journeys |
|---|---|---|
| Superadmin | Platform provisioning and governance | School setup, account administration, integration configuration, fleet health, retention policy and auditable support access. |
| School administrator | One or explicitly assigned schools | Triage, assignment, resolution, staff management, attendance reconciliation, maintenance and school reports. |
| Designated safeguarding / discipline staff | Assigned cases and authorized categories | Review, notes, safeguarding referral and follow-up. Restricted case information requires finer permissions than category filtering. |
| Technical operator | Camera/service operations | Health, maintenance and integration troubleshooting; no automatic entitlement to identifiable pupil evidence. |
| Government / authority analyst | Approved aggregate statistics only | Deferred. Minimum group sizes, suppression and aggregation rules need agreement before data sharing. |

Implemented navigation exposes school and superadmin workspace previews. The existing data model also contains operator and teacher roles. Production permission enforcement must happen on every backend read/write/export and evidence access, with school membership derived from authenticated identity. Hiding a navigation item is insufficient.

## School journey 1: start of day and triage

1. Open the school overview and confirm the school scope.
2. Review the priority board grouped Critical, High, Medium and Low.
3. Inspect unacknowledged alerts before already acknowledged records. Check camera health so missing coverage is visible.
4. Open a concern to inspect its location, time, description, assigned responder and history.
5. Acknowledge once to record that review has started. Acknowledgement does not confirm the detection or close the concern.
6. Move to human validation and assign the appropriate responder.

Implemented in the existing overview and incident sheet. Production additions: real staff identity, delivery timestamps, acknowledgement target, escalation timer, duplicate-event grouping and missing-feed telemetry. The current acknowledgement actor is fictional.

## School journey 2: ten-second analysis demonstration

1. Select a synthetic scenario in the overview.
2. Watch the illustrative media and ten-second progress sequence.
3. A new unverified alert appears in the priority board and incident register.
4. Staff must review before a final decision.

This interval is a UI simulation, not a measured model latency or a safety guarantee. A live service needs timestamps for capture, receipt, processing start/end and delivery; timeout and retry states; and separately measured alert latency under realistic camera load. Scenario outputs are predefined and must not be presented as validated weapon, bullying or violence detection.

## School journey 3: manual concern reporting

1. Open Response workspace and select Report concern.
2. Enter a short summary, concern type, priority, observed zone, active responder and detailed observation.
3. Submit. The application validates the school zone and active owner and rejects insufficient detail.
4. A uniquely identified staff report opens in the incident sheet and enters the review queue.
5. Review and document the response through the same incident lifecycle.

Concern types include bullying, fighting, visible blade concern, medical concern, missing student concern, safeguarding concern, intrusion and other concerns. These are reporting categories, not added AI detectors. Staff reports show no AI confidence score. The displayed zone media remains illustrative; no actual evidence is attached.

Production additions: restricted safeguarding forms, attachments, reporter identity, confidential witnesses, duplicate matching, reliable submission retries and appropriate routing. A real urgent-response protocol must not depend on completion of this form.

## School journey 4: evidence review and resolution

1. Open Awaiting review. Both Pending and Insufficient evidence appear here.
2. Inspect available context; enter a decision explanation of at least ten characters.
3. Choose Confirmed, False alarm or Insufficient evidence.
4. Confirmed and False alarm leave the evidence queue but remain Under Review until response closure. Insufficient evidence remains reviewable.
5. Reassign the responder if needed and add further notes to the audit trail.
6. Enter a resolution note and select Closed. Unresolved evidence blocks closure.
7. If new information arrives, enter a reopening reason and change a closed incident to Open or Under Review.

The history retains each transition and note in this session. Completion of all related follow-ups is not currently enforced by incident closure; a production policy must decide whether some follow-ups remain active after incident resolution. Real evidence review, immutable audit logs, concurrent edit protection and restricted case visibility remain outstanding.

## School journey 5: coordinated follow-up

1. In Response workspace choose Add follow-up.
2. Link an incident in the selected school, name the action, choose an active owner and due date, and record the next step.
3. Find it in the Active register.
4. Open Update & history to record In progress, Blocked or Completed and a progress/completion explanation.
5. Use the incident shortcut for case context. Filter Completed or All to inspect past actions.
6. Reopen a completed action through the same logged status update when needed.

Tasks remain isolated by school in the session. Switching school clears open task details. Outstanding production requirements include reminders, reassignment, overdue escalation, external referrals and durable audit attribution.

## School journey 6: campus coverage and camera maintenance

1. Open Campus coverage in Response workspace.
2. Select a zone to inspect linked incidents and its sample availability.
3. For a fault, create a Maintenance task linked to the relevant school camera.
4. Assign an owner and due date, document the problem, and record diagnostic progress.
5. Complete only with a written outcome. Task completion does not change the underlying camera state.

The zone register is a coverage diagram, not a surveyed site map. The existing System health view remains synthetic. Production needs actual heartbeats, frame freshness, stream authentication, power/network diagnosis, issue deduplication, evidence of recovery and maintenance windows.

## School journey 7: presence reconciliation

Existing workflow: open Attendance & presence, filter pupil/class/status, inspect a record, select the observed status and verification source, give a reason and record the change. Departure review focuses attention on uncertain records. Export produces a fictional register. Unverifiable information must not be turned into a confirmed presence claim.

Presence records are not a real gate ledger and do not prove a student is still on site. New school onboarding does not provision a real pupil roster; the presence panel remains a fixed fictional demonstration. A live deployment needs SIS/attendance import, dated entry/exit events, authorized collection rules, staff reconciliation, duplicate handling and retention. Facial recognition has not been implemented. Choosing an identity approach for minors requires a separate evaluation and jurisdiction-specific review; it is not a default dependency of this UI release.

## School journey 8: reporting and analytics

1. Filter incidents by severity, status, category, location or search term.
2. Export a valid date range of at most thirty days. Empty results produce feedback.
3. Review analytics for Today, Last 7 days or Last 30 days, anchored to the latest available school record shown in the toolbar.
4. Final reviewed totals include only Confirmed and False alarm. Inconclusive evidence remains pending.

Export applies current incident filters; analytics has its own period selector. Incident CSV fields are escaped and formula prefixes neutralized. Production additions: saved reports, consistent event-time semantics, comparative periods, suppression of identifying small groups and controlled export access. No causal claim about safety improvement can be made from these synthetic counts.

## Superadmin journey 1: onboard a school

1. Switch to Superadmin workspace and open Schools.
2. Choose Add school; enter a unique school name.
3. Provide an administrator name/email and the first camera zone.
4. Review the details and explicit inactive/offline outcomes.
5. Create the demonstration workspace. It appears in the directory and school selector.
6. Manage its sample account from Users & roles and inspect its offline camera in the selected school context.

Duplicate school names and administrator emails are rejected. No account credentials, invitation, camera stream or real tenant are created. Remaining production stages: approved tenant creation, invitation acceptance, school profile, multiple camera registration, secure integration provisioning, end-to-end readiness testing and explicit activation.

## Superadmin journey 2: configuration and routing

Existing detection-rule workflow supports school, zone and category selection, draft threshold changes, save and discard in memory. Notification routing supports severity and recipient toggles, a saved session snapshot and discarding unsaved edits.

Production requires configuration versions, authorization, validation of incompatible thresholds, timed rollout, rollback, device acknowledgement, test delivery and failure handling. Government recipient labels do not establish permission to send student-level information. No messages are sent by this release.

## Superadmin journey 3: staff access management

Open Users & roles, create or edit a fictional account, choose an appropriate role and school, and set active state. School administrators are constrained to their school roles in the UI; superadmins see the broader scope. Whitespace-normalized email duplicate checks run before saving.

Real invitations, acceptance, sign-in, password recovery, MFA, session expiry/revocation, account offboarding, least-privilege grants and access review are outstanding. Account activation in this demo is not authenticated access.

## Essential backend contracts for the next release

Use stable IDs for schools, users, memberships, cameras, incidents, review decisions, evidence objects, tasks and presence events. Do not use display names as permanent relational keys. Each school-owned row must carry a school ID. Derive effective school access from the session, never a submitted role value.

Required operations include tenant provisioning; invitation lifecycle; camera registration and heartbeat; incident ingestion with idempotency; acknowledgement; append-only review/note history; controlled status transitions; task management; evidence authorization; notification delivery and retries; presence reconciliation; and scoped exports. Mutations need validation, authorization, conflict/version handling and audit attribution. Long-running ingestion/notification work needs queues and retry/dead-letter handling. Database schema, migrations, backups and recovery testing must precede live school data.

A static Vercel frontend may call a separately hosted backend, or a server-capable deployment can supply APIs. The provider, account access, deployment target and data-residency constraints must be decided before claiming this is a shared live system.

## Verification and release status

- TypeScript compilation passes after these changes.
- Six automated workflow tests pass: unresolved closure prevention, resolution/reopening reasons, completed-review classification, date boundaries and safe CSV fields.
- Targeted lint passes for operations-panel, school-onboarding and workflow modules.
- Vercel production build succeeds. The generated application is approximately 173 KB gzipped JavaScript; Vite reports a chunk-size advisory.
- Full repository lint still reports violations in existing app/shared UI code. This is not a clean-lint release.
- No browser interaction, visual regression, screen-reader, multi-user, penetration or live-camera tests were executed in this pass. These remain explicit verification gaps.
- Local changes are not evidence of a successful GitHub push or Vercel deployment. Prior remote writes were blocked by the execution environment; the public result has not been verified with this build.

Before a live pilot, test concurrent reviewers, cross-tenant access denial, invitation recovery, camera outages, delayed/duplicated events, failed notification delivery, incomplete evidence, export permissions, low bandwidth, mobile browser accessibility, backup restore and deletion/retention behavior. Teacher mobile and government dashboards remain outside the implemented UI scope as previously requested.

Local preview verification was attempted after the final build. The environment denied binding `127.0.0.1:3000` with `EPERM`; no preview server was started and no visual QA result is claimed.
