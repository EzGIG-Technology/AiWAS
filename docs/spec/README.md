# EzVision Campus: the spec and where it lives in the demo

[`EzVision-Campus-System-Spec.pdf`](EzVision-Campus-System-Spec.pdf) is the build spec: *EzVision Campus — System Spec & Smart Campus Audit*, 26 Oct 2026, 23 pages. The demo follows it. The tables below map each part of the spec to the screen and file that implement it, and list where the demo departs from it and why.

## Product

One AI layer over a university's existing cameras:

1. Edge boxes analyse video on campus.
2. One engine detects.
3. The platform core applies the rules.
4. Six modules route each alert to the right office.

| Spec | In the demo | Code |
|---|---|---|
| Six modules: Hostel Integrity (flagship), Safe Campus, Mobility (ParqOS, Vera), Welfare (AIWAS), HSE, Space & Admin | **Modules** overview, plus one page per module | `app/_data/um.ts` (`modules`, `detectors`), `app/_views/um/modules.tsx` |
| Detectors, with status Live / PoC / Build / New model / Partner and priority P1–P3 (from the 61-use-case map) | Each module page lists its detectors with what they do and what they cannot do | `detectors` in `app/_data/um.ts` |
| Platform core: camera onboarding, edge inference, rules studio, alert router, case management, camera health, reports | Rules studio, Camera health (with *Add a camera*), Cases, Reports | `app/_views/um/studio.tsx`, `govern.tsx`, `investigate.tsx` |

## The ten screens

| # | Spec screen | Route | What it does |
|---|---|---|---|
| 1 | Command centre console: campus map, live alert queue sorted by severity, video wall | `#/um/console` | Escalated alerts first, then severity. *Raise a demo alert* and *Skip 5 minutes* show escalation live. |
| 2 | Alert detail: 10-second clip, snapshot, the rule that fired, the camera on the map, actions | Sheet on any alert | Five-step lifecycle bar; the rule in the studio's language; *cannot do* text for the detector; radar alerts show no image. |
| 3 | Warden app: alert inbox, on-duty toggle, accept and verify, outcome in two taps, block breach history | `#/app/warden` and `#/um/warden` | KK12 only. Accept stops the escalation timer. Tap 1 is the verdict, tap 2 the outcome. |
| 4 | Search and investigation by time, camera, clothing colour, object or plate; cross-camera timeline | `#/um/search` | A purpose is required and audited. The *Example* button follows the 18:31 lounge-line alert back across five cameras. |
| 5 | Case file: linked alerts, notes, outcome, evidence export with watermark and audit entry | `#/um/cases/<id>` | Exports a real PDF with the snapshot embedded. Faces are blurred unless the security director unblurs. HEP sees only cases referred to it. |
| 6 | Hostel dashboard: breaches by block, door and hour; trend over the semester | `#/um/hostel` | Also: visiting hours and curfew per block (Pengetua), and the weekly breach report (PDF). |
| 7 | Rules studio: draw zones and lines, set schedules and thresholds, preview against yesterday's footage | `#/um/rules/<id>` | Click twice on the camera view to redraw a line. Preview compares the saved version with the draft. Saving creates a new version and an audit entry. |
| 8 | Camera health: offline, blocked, blurred or moved | `#/um/health` | Daily 06:00 check, 14-day uptime, edge boxes, model versions, camera register. |
| 9 | Reports: weekly and monthly PDFs for management | `#/um/reports` | Each office gets its own report; all are generated as real PDFs in the browser. |
| 10 | Admin and privacy: users, roles, retention, audit log, data requests | `#/um/admin` | Includes the privacy defaults, the bias-test status and what ships with every deployment. |

## Roles

These are the spec's ten roles; the KPT officer is the ministry's own point of view (see `docs/points-of-view.md`). Each role sees only its own screens, as defined in `umAccess` (`app/_views/um/workspace.tsx`) and `alertsFor` (`app/_lib/scope.ts`).

| Role | Demo persona | Sees | Can do |
|---|---|---|---|
| Command centre operator | Aina Sofea | All live alerts, all cameras | Acknowledge, verify, dispatch, open cases |
| Security director | Supt. (PB) Zulkifli Hassan | Everything, plus reports | Approve evidence exports, unblur, change rules |
| Warden or felo on duty | Dr. Farah Aziz (KK12) | KK12 hostel alerts only, on the phone | Accept, verify on site, close with an outcome |
| Pengetua | Prof. Madya Dr. Rosli Ismail (KK12) | KK12 breach reports; no live video | Set visiting hours and curfew per block |
| HEP discipline officer | Kamarul Ariffin | Confirmed cases referred to HEP; no video | Open disciplinary action |
| Counsellor | Pn. Melissa Tan | Wellbeing and at-height alerts only; no video | Follow up; cannot refer to HEP |
| Facilities and OSH officer | Ir. Salmah Yusof | HSE and Space alerts and dashboards | Dispatch maintenance |
| Traffic and parking officer | Insp. (PB) Ravi Chandran | Mobility alerts, plate lists | Issue notices, manage permits |
| University DPO | Gerald Wong | Audit log, retention, data requests; no video | Approve or refuse requests, set retention |
| System admin | Lee Wei Jie | Configuration, camera health | Add cameras and users |

All names are fictional.

## Data model, rules and lifecycle

| Spec | Code |
|---|---|
| Entities: university, campus, block, zone, camera, edge box, rule, detection, alert, case, vehicle permit and visitor pass, user and role, audit log | `um.ts` (blocks, cameras, edge boxes, permits), `alerts.ts` (rules, alerts, cases), `search.ts` (detections as sightings), `govern.ts` (users, roles, retention), `store.tsx` (audit log) |
| A rule is zone + object + condition + schedule + severity + route + escalation, written as `WHEN … CROSSES … DURING … THEN … ESCALATE …` | `ruleDsl()` in `alerts.ts`; a test checks it against the spec's example |
| Six hostel rules per block: other gender past the lounge line, visitor past the lounge line, visitor still inside at closing, any entry after curfew, exit-only door or fire exit, more people than card taps | `hostelRules()` in `alerts.ts`, plus a seventh at Blok A for delivery riders |
| Hours follow the UTeM rule book: visiting 5–10 pm on weekdays, midnight curfew | `blocks[].hours`; editable per block |
| Lifecycle: New → Acknowledged → Verified (true, false alarm, unsure) → Actioned → Closed; escalate after 5 minutes; false alarms feed tuning | `lifecycle`, `isEscalated()`, `useAlertActions()` in `app/_lib/actions.ts` |

## Privacy and PDPA defaults

All of these are in `privacyControls` and `exclusions` (`app/_data/govern.ts`), and are enforced in the views:

- **Face recognition:** off. There is no face search.
- **Gender estimation:** runs only on the lounge-line camera of each single-gender block. A test enforces this.
- **Classroom attention scoring:** not offered.
- **Toilets and changing rooms:** radar only. The radar alert in the demo has no camera and no image.
- **Exports:** faces are blurred unless the security director unblurs for a case.
- **Retention:** alert clips are kept 30 days by default.
- **Audit log:** kept for 7 years. Views, searches, exports, rule changes, hour changes and request decisions are all written to it.
- **Video access:** roles without video (Pengetua, HEP, counsellor, DPO, KPT) never see footage. Tests and the browser checks enforce this.
- **Welfare is not discipline:** wellbeing and at-height alerts can only go to counselling.
- **Penalties:** the AI never issues one. A person verifies every alert.
- **Bias test** (hijab, hoodies, long hair, night infrared): shown as scheduled, with no accuracy figure. The spec lists accuracy at night and with hijab as an open question.

## Smart-campus audit (KPT view)

The 38-university audit (20 public, 18 private) is reproduced in `app/_data/kpt.ts`, with the evidence links from the spec. The headline figures are derived from the rows, and a test checks them against the spec:

- 4 universities have a confirmed AI or vision system: UM, UMPSA, Sunway and APU.
- None shows AI at hostels; 1 claim (Taylor's).
- 3 CCTV policies ask for video analytics: USM, UTHM and UMPSA.
- 2 universities run face recognition: UM and Sunway.

The global leaders, the governance lessons, the capability gap and the PDPA points are on the KPT *Global benchmarks*, *Capability gap* and *Privacy & PDPA* screens.

The spec's **target list** (UMPSA, USM, UM, UiTM, UTHM, Nottingham, Taylor's, then UTM, UPNM and UNIMAS) is EzGIG's sales plan. It is deliberately not shown in the ministry's view.

## Where the demo departs from the spec

| Spec | Demo | Why |
|---|---|---|
| Pilot: 2 hostel blocks + main gate, about 20 cameras | 13 pilot cameras (6 at KK12 Blok A, 6 at KK9 Blok B, 1 at the gate) | Each camera needs a distinct synthetic scene, and only 12 of the 60 scenes look like a hostel. The *Pilot & rollout* screen says so. |
| During the pilot, only Hostel Integrity and the gate are live | All six modules run | So every screen can be shown. The rollout screen states the real pilot scope. |
| The example rule names "Kolej Tun Fatimah" | KK12 Raja Dr Nazrin Shah and KK9 Tun Syed Zahiruddin, which are UM colleges | The UM dashboard is the requested point of view. Block names and genders are illustrative. |
| WhatsApp, SIS, card readers, BMS and fire panel | Shown as integration states; nothing is called | It is a demo with no backend. |
| Radar status "to confirm" | One radar alert, labelled *To confirm* | It shows how a camera-free space is handled. |
