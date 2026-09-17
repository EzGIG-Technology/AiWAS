# AiWAS product design and feature audit

The application has been reorganised from 28 top-level entries in the latest remote version (22 in the earlier local checkout) into nine purpose-led sections. Duplicate rule configuration and presentation-style coverage tabs have been removed. The detection matrix now drives one operational configuration journey, while a separate evaluation workspace records pilot results. Campus insights includes a detailed interactive 2D campus plan with anonymous clusters, coverage and incident links. A crimson-led visual system applies across the platform and teacher experience.

This is a functional front-end demonstration. It does not contain a live detection engine, camera ingestion, authenticated access, push delivery or persistent backend. No claimed model accuracy is treated as validated. Browser QA began after the Mac was unlocked. Focused results and remaining coverage are recorded below.

## Documents reviewed

- **AiWAS.pdf**, 23 pages: a visual reference covering the NeueTrace edge configuration interface, superadmin/client dashboards, device and location views, activity alerts, live counting, footfall, heatmaps, person/identity views, reports, groups, restricted areas and user management. Pages 22–23 reproduce the detection matrix. Pages were rendered and the functional screenshots inspected. Text extraction alone was not useful because almost all content is embedded screenshots.
- **AiWAS Detection Matrix (For Dev Team).docx**: all 22 requirement rows, governance notes and development notes were extracted and reviewed. Ten existing rows contain a reported 80% starting figure; twelve proposed rows start at 0%. The document's >90% target is not evidence of delivered performance.

The documents are reference material, not operational instructions. Where they conflict, this implementation follows the stated no-biometrics/public-area governance and uses human review for ambiguous behavioural interpretation.

## Page-by-page disposition

| Previous page | Current location | Decision and functional journey |
|---|---|---|
| Overview | Monitor → Overview | Retained: inspect priorities, acknowledge an alert, open incident review or camera context. The large repeated module launchpad was removed. |
| Campus insights | Monitor → Campus insights → Campus map & movement | Reworked: select sample time, replay, zoom, toggle map layers, inspect clusters/cameras/incidents, change zone thresholds, create operational actions and export observations. |
| Analytics | Campus insights → Incident analytics | Consolidated: filter period, inspect verified/unverified category outcomes and export reports. |
| Live cameras | Monitor → Cameras → Camera wall | Retained: search and filter feeds, open camera detail, inspect sample video, jump to incidents in that zone. |
| System health | Cameras → Device health | Consolidated: review camera connectivity, inspect a feed and refresh sample health status. |
| Validation queue | Respond → Incidents → Review inbox | Consolidated: pending/reviewed tabs, open evidence, acknowledge, verify and record a reason. |
| Incidents | Incidents → All incidents | Retained: search/category/zone/priority/status filters, incident detail, assignment, history, status transitions and export. |
| Response workspace | Incidents → Tasks & reports | Consolidated: create school concerns, assign operational work and record completion. |
| Safeguarding | School operations → Safeguarding | Retained: confidential concern records, ownership, staged checks, outcome and pupil/family reporting preview. |
| Emergency centre | School operations → Emergencies | Retained: response/evacuation records, acknowledgement, checks and verified headcount closure. |
| Hostel operations | School operations → Hostel | Retained: warden-owned supervision workflows and common-area context. |
| Movement & visitors | School operations → Visitors & access | Retained: visitor/access records with responsible staff and verified sign-out. |
| Activities & continuity | School operations → Activities | Retained: activity/continuity records, checks and recorded outcomes. |
| Attendance & presence | Respond → Attendance | Retained: staff reconciliation, arrival/departure records, exception review and exports. Counts do not establish individual attendance. |
| Teacher app | Respond → Teacher app | Retained and recoloured: priority inbox, acknowledgement, evidence checks, ownership, response updates, handover, support, closure, reopening and reports. Switching to the teacher experience no longer unmounts the school dashboard's working state. |
| Detection rules | Detection centre → Detection rules | Old independent calibration page and its future-feature teaser were deleted. Existing `#detection-rules` links resolve to the new matrix journey. |
| Detection studio | Detection centre → Test & evaluate | Reworked: duplicate configuration/catalogue UI removed; record per-detection trials, conditions, false alarms and missed events, calculate precision/recall/p95 and export/remove trials. |
| Users & roles | Administration → Team & access | Retained: create/edit/activate school-scoped members and roles in the demo. |
| Schools | Administration → Schools | Superadmin: register a school, view details and enter its operational workspace. |
| Notification routing | Administration → Escalation routing | Superadmin: review severity/category recipients, edit and save routing previews. No messages are sent. |
| Pilot governance | Administration → Privacy & approvals | Retained as an approval register, not a top-level presentation page. Create records, assign responsibility and complete approval evidence. |
| Platform readiness | Administration → Commissioning | Superadmin: commissioning and integration work records with owners, checks and completion conditions. |
| New detection matrix | Detection centre → Detection rules | One catalogue of 20 event types and two context tags, with per-school/per-zone rules and a linked incident journey. |
| Operations room | Cameras → Operations room | Preserved from the latest GitHub work: configurable video wall, camera selection, event filtering, snapshot review and acknowledgement. |
| Edge appliances | Administration → Edge monitoring | Preserved: select an appliance and inspect its sample service/resource health. |
| Site map | Campus insights → Campus map & movement | Retired the separate 3D view; old `#site-map` links open the new interactive 2D atlas. |
| Architecture | Administration → Commissioning | Removed the explanatory architecture page from navigation; its old link resolves to commissioning for superadmin. |
| Detection tuning | Detection centre → Advanced tuning | Restored after QA found that consolidation had omitted crowd proximity, temporal persistence, tracking and counting-line controls. Device calibration stays distinct from operational zone rules. |
| New device configuration | Administration → Device configuration | Superadmin: edit frame rate, image size, reconnect delay, logging and incident retention/buffers; validate, save, discard and export the configuration preview. |

Removed within pages: **Platform coverage**, **Workflow coverage**, **What the numbers mean** as standalone tabs; the old detection configuration **Designed for what comes next** block; the overview module launchpad. Useful evidence boundaries remain near the relevant decision rather than in a separate coverage presentation. Facilities & health remains removed. Safety-related fall/collapse detection is represented as an incident, not a new health module.

## Detection matrix coverage

All 22 rows are represented in the detection centre. The accompanying CSV gives each row's group, priority, signal, configurable trigger, review route and evidence boundary.

- **Behaviour:** littering, exam concern, smoking/vaping, truancy, theft concern, vandalism, bullying concern, fighting and violent behaviour.
- **Security:** camera tampering, after-hours/restricted entry, unattended objects and fence climbing.
- **Movement:** crowd counts, entry/exit mismatch, prolonged dwell and drop-off/pick-up vehicles.
- **Emergency:** weapon-shaped object, fall/collapse and smoke/fire.
- **Context only:** uniform and person-role context, attached to an existing school incident with a staff note. They cannot create independent alerts.

Every event type supports a public zone, priority, trigger threshold with units, model score threshold, duplicate cooldown, schedule, review team, enable/disable state and placement confirmation. Rules are saved separately by school, detection and zone. A ten-second scripted preview creates a pending incident using the saved rule and links into the existing acknowledgement, verification, assignment and resolution journey. Cancellation creates no incident. The timer represents the UI concept, not a measured inference time or acceptable delay for a real emergency.

Weapon and smoke/fire configurations cannot be downgraded below Critical. Critical is the UI equivalent of the matrix's High (Critical). External escalation is represented as an approved response route, not an actual authority notification. The model score threshold is not an accuracy metric.

The matrix's proposed appearance-based male/female labels and automatic aggressor/victim identification are not implemented. Person-role context remains unknown until staff confirm it; gender is not inferred. Uniform context allows unknown and approved exceptions. No emotion, intent, guilt or diagnosis is inferred from images. Camera placement inside toilets, changing rooms or other private areas is not offered.

## Reference system adaptations

The useful patterns from the PDF were incorporated: device status and configuration, school/location scope, activity alert filters and evidence details, anonymous counts and footfall, heatmap drill-down, restricted public-zone rules, incident exports, user access and audit histories.

Identity enrolment, face galleries, face-event association, watchlists and demographic charts were not copied. They conflict with the new matrix's no-biometrics requirement or would imply unsupported personal classification. Employee face-derived attendance was adapted to the existing staff-reconciled school attendance register. Network secrets, Redis and server filesystem fields were not copied into a school-facing UI; device settings expose relevant operating controls without pretending a browser form can configure real infrastructure.

## Map and visual design

The new top-down plan includes classroom subdivisions, a corridor, library, canteen seating, courtyard, hall, office, gate, sports field, boundary, paths, road and private-space marking. Eleven architectural areas are clickable. Six are linked to existing camera zones; unmonitored/offline areas stay hatched and unknown. No full-school population total is invented by adding overlapping camera counts.

Cluster values reconcile exactly to each synthetic zone count. People dots are illustrative coordinates and do not represent identified pupils or trajectories. The map supports density, people, camera and incident layers; zoom/reset; horizontal/vertical exploration; keyboard-operable zone and cluster controls; camera-sample inspection; and opening linked active incidents. Replay steps through six separate illustrative observation windows, not continuous real tracking.

The incoming light/dark/system theme control and base-aware media-path fixes were preserved. New working surfaces use the same theme tokens. The platform uses crimson primary actions, a charcoal navigation rail, white working surfaces, warm grey backgrounds, consistent card spacing, compact secondary navigation and functional accent colours. Red priority labels remain distinct from neutral labels and are accompanied by text. The teacher app shares the crimson theme. Reduced-motion preferences are respected.

## Verification and practical limits

Completed: 69 automated workflow/data tests, 44 school/superadmin route render checks, component rendering, TypeScript checks, app lint and the Vercel build. Tests cover all 22 matrix rows, public-zone constraints, Critical priority guards, invalid thresholds, cluster reconciliation/coordinates, navigation grouping, device configuration, existing closure/reopening, school scope and review rules.

Not completed: browser visual inspection and real pointer/keyboard/touch journeys because the Mac was locked. Server rendering is not a substitute for that review. The final morning check should cover map layers and zoom, all zone/cluster clicks, saving two rules for different zones, cancelling and completing the timer, tagging an incident, verification/closure/reopening, teacher navigation, device export and narrow-screen layouts.

All state remains in the page session. Actual authentication, delivery, storage policy enforcement, camera calibration, live counts and detection evaluation require backend integration. The plan is illustrative because no surveyed school floor plan or calibrated camera geometry was supplied. Existing media is staged context, including an inert blade prop; it does not validate any detector and does not depict every listed event.


## Integration with the latest GitHub version

Newer commits were present on GitHub when publishing began. They were merged without overwriting the remote branch. The active school UI retains the operations console, edge monitoring, base-relative media fix, lifted presence records, theme selector and updated school-wide user scope. Multi-industry data and historical research remain in source, but the removed industry chooser, identity/architecture presentation and 3D map are not restored to school navigation. The new document-driven configuration and 2D map remain the active workflows.

## Browser QA correction — 14 September 2026

Comparison against pre-merge commit `2ff85b0` found a functional omission: the previous tuning screen exposed tracker, crowd proximity, altercation persistence and entrance/exit-line parameters that the replacement matrix did not. That screen is restored under Detection centre → Advanced tuning, including its original direct URL. It remains a session-only calibration preview; it does not modify the matrix's saved zone rules or a real detector.

Visual checks found missing base layout on primary/secondary action buttons and incorrect semantic surface tokens that made inactive dark-theme tabs unreadable. Corrected shared button dimensions/alignment and card, popover, secondary, muted and input tokens. Navigation now resets document scroll when the active page changes, preventing a new page from opening midway through its content.

Observed in Chrome: navigation between Overview, Campus insights and Detection centre; restored Advanced tuning controls; editing minimum crowd size and receiving Save settings confirmation; Campus insights in light and system-dark themes. The narrow in-app browser (332 px viewport) shows the repaired action buttons with no document horizontal overflow. The cursor seen in screenshots follows browser clicks and is not embedded in the checked corridor poster.

This is focused regression verification, not completion of every journey listed above. Full incident, teacher, map interaction and device-export browser coverage remains outstanding.
