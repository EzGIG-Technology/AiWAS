# AiWAS

School safety platform prototype with separate school and superadmin workspaces.

## Included

- Priority-grouped incident alerts and a ten-second analysis demonstration
- Synthetic camera images and animated sample video clips
- Incident acknowledgement, reassignment, validation and history
- School-scoped team management and attendance/presence reconciliation
- Superadmin school directory, camera coverage and operational overview
- Analytics, detection-rule controls, notification-routing previews and CSV exports

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server.

```sh
npm run build
```

The application uses React, TypeScript, vinext/Vite and the included UI components. The current hosted build targets Cloudflare Workers through Sites; `.openai/hosting.json` identifies the existing Sites project and contains no credentials.

## Demonstration boundaries

All school, incident and student records are demonstration data. Media is synthetic; the MP4 files are animated stills with illustrative overlays. The ten-second timer does not run a real detection model.

The workspace switch previews roles and is not production authentication. Changes are held in session memory and reset on refresh. No actual invitations, emergency notifications, parent messages or camera connections are created. Facial recognition is not implemented.

Presence records represent recorded observations, not guaranteed physical locations. Missing departure records require human reconciliation. Production use requires an implemented backend, account authorization, approved data handling, validated detection, reliable notification delivery and school-specific operating procedures.

## Hosted demo

The existing private demo is managed separately through Sites:

https://aiwas-safety-workspace.blossomjason61.chatgpt.site

Pushing to this GitHub repository does not automatically update that deployment.

## Vercel deployment

Connect this repository with the project root set to the repository root.
`vercel.json` selects Vite, runs `npm run build:vercel`, and publishes
`dist/vercel`. That folder includes the application HTML, JavaScript, styles,
self-hosted fonts and mock media. Navigation uses URL fragments.

The default `npm run build` is the original Sites/Cloudflare Workers build;
its server bundle is not a Vercel deployment artifact. Vercel uses the separate
static entry in `vercel-entry/main.tsx`, which renders the same application.
No backend or authentication service is provided by this static build.

## School response workflows

The Response workspace adds manual concern reports, incident follow-ups, maintenance tasks and a campus zone register. Superadmins can add demo schools from the School directory. All new records remain in memory for the current page session; authentication, shared storage, live CCTV and notifications are not implemented.

See [system audit and user journeys](docs/system-audit-and-user-journeys.md) for detailed flows, fixes, release blockers and verification limits. Run `node --test tests/workflow.test.mjs` to check the incident lifecycle and reporting helpers.

## Malaysian school safety research

The [Malaysian school safety study](docs/research/malaysian-school-safety-study.md) reviews reported issues from 2022 through 11 September 2026, drawing on 36 public sources. It distinguishes national statistics, reported cases and product recommendations. The accompanying [33-area feature-gap register](docs/research/malaysia-feature-gap-register.csv) maps current demo coverage to recommended safety and operational workflows.

Priority recommendations include confidential safeguarding, emergency escalation, hostel supervision, verified pupil handovers, facilities inspections and weather/disaster readiness. These are research recommendations, not claims that those live services are implemented.

## Full school UI concept

The [full UI guide](docs/full-ui-concept-guide.md) maps all 33 study areas to interactive demonstration workflows across safeguarding, emergency response, hostel operations, movement and visitors, facilities and health, activities and continuity, and platform readiness. Nine synthetic scene pairs illustrate the experience. These remain fictional frontend workflows, not connected live services.

Run `npm test`, `npm run test:render`, and `npm run build:vercel` for workflow, rendering and static-build checks.

## Design system

The interface runs on a token layer with a red brand, and ships **light, dark and follow-the-system** themes from a control in the header. See the [design system and CSS audit](docs/design-system.md).

The audit found 1,031 hardcoded colours (777 distinct), 235 selectors defined more than once with 119 genuine top-level conflicts, 20 arbitrary corner radii and no dark-mode support at all. Now: 1,013 colour literals resolve through 36 semantic tokens, 138 dead declarations are gone, radii sit on a five-step scale, and a panel is one border, one radius and one shadow — with a card inside a card dropping its frame so it reads as a single object.

Fixed on the way: light-mode muted text at 2.7:1 contrast (low-contrast samples fell from 20 to 2), console colours leaking into light surfaces, mobile header overflow at 375 px, a detection overlay label clipping outside its box, a duplicated subtitle, a stat card rendering `00` for a count of zero, and a caption hardcoded to "1 camera needs attention".

## Detection & response matrix, tuning and edge appliances

Built from the supplied 94-page AiWAS programme document. See the [document audit](docs/research/aiwas-document-audit.md).

**Detection & response matrix** — all 22 detection categories with what each detects, an example incident, severity, the automatic system action, who is notified and the confidence target. Three columns are added that the source lacks: status (10 existing, 6 requested, 6 suggested), a readiness gate, and a caution where the stated behaviour conflicts with the platform's limits. Only the ten live categories carry the 80% baseline; the rest read "Not measured", enforced by test, as is the rule that anything escalating outside the school sits behind a governance decision.

**Detection tuning** — the device Detection tab with its real defaults: nine activities with confidence, severity and cooldown, plus crowd, altercation, tracker and entrance/exit counting-line parameters. Warns on thresholds below 0.50 and on zero cooldowns, while treating a low fire threshold as the deliberate life-safety trade it is.

**Edge appliances** — devices as first-class entities with location, coordinates, timezone, uptime, CPU, memory, disk, GPU, VRAM, temperature and service status. An appliance that is not reporting says plainly that the site is not being analysed.

The document's facial-recognition suite — Face Events, Known Persons, blacklist and watchlist groups, gender and age estimation, face-based attendance — is **not implemented**, and needs a decision rather than a default. The document contradicts itself here: its own Person Type row cites a "no-biometrics rule" while other screens ship face enrollment and civil-ID search. The audit sets out three options and a recommendation.

## Security operations room and architecture

The [command centre notes](docs/command-centre.md) cover the operator console and the platform architecture view, built from the AiWAS / MicroPay presentation set.

**Operations room** — camera estate with online/offline/recording counts and search, a video wall with 2×2, 3×3 and 4×4 layouts, and a live event queue with severity filters, confidence, snapshot preview and acknowledgement. An offline feed renders as an explicit signal-lost tile reading "do not read this area as clear", never a dark rectangle that looks like a quiet room; confidence appears only for video candidates.

**Architecture** — the six-stage pipeline from capture through on-premise analysis, encrypted event transfer, cloud dashboard and operations room to recorded action, plus the capabilities deliberately excluded from it. The presentation artwork showed face recognition and a people count split by sex; both are excluded and are drawn struck-through with the reason, because a diagram that quietly dropped them would let them return.

**Branding** — `app/brand.tsx` carries SVG reconstructions of the AiWAS and MicroPay marks. Swap in the official vector files when available; the component API will not change.

## Competitive audit

The [competitive audit](docs/research/competitive-audit-school-ai-video.md) reviews the vendors a school or JPN would be shown alongside AiWAS — Verkada, ZeroEyes, Raptor, Navigate360, CENTEGIX, Ambient.ai, Spot AI, STOPit and Securly Pass — with a [28-row feature matrix](docs/research/competitor-feature-matrix.csv).

The headline finding is that schools are not buying detectors, they are buying the whole incident lifecycle from one vendor, and the highest-value additions for AiWAS are workflow rather than vision models: a human verification desk before any critical alert leaves the building, emergency accountability and reunification, drill management with after-action reporting, responder handoff from the 3D map, and a digital hall pass as the consented source for student movement.

It also records where AiWAS is already ahead of every vendor reviewed — per-capability stated limitations, written exclusion lists, coverage gaps that never render as zero, confidence shown only for video candidates — and which well-funded competitor capabilities the platform should keep refusing in writing, including facial recognition of pupils, appearance-based cross-camera re-identification and student device monitoring.

## 3D site map

Every industry has a schematic 3D plan of the selected site with three layers: **anonymous occupancy** (estimated people per area — how many, never who), **camera coverage** (where the dark areas are; an uncovered area reports "No coverage", never zero), and, for education, **last recorded observations** (each pupil placed at the area of their last gate-reader or staff-confirmed sighting, with the age and source of that record).

The observation layer is deliberately not live per-pupil tracking. Continuous identification of named children is excluded by the platform's non-biometric design, by MOE's position and by the PDPA's treatment of biometric data. What the map shows instead is what a school actually needs during a missing-pupil search or a roll call: where someone was last recorded, when, and how reliable that record is. See [3D site map](docs/site-map-3d.md).

Rendered with CSS 3D transforms rather than WebGL — drag to orbit, or use the rotate, plan-view, reset and zoom controls.

## Multi-industry support

AiWAS now ships eight industry profiles: education, healthcare, aged & residential care, retail, construction, manufacturing & warehousing, transport hubs and commercial property. An industry selector in the sidebar switches the whole workspace — sites, cameras, records, accounts, vocabulary, monitored zones, rule defaults and the detection register all change together, and nothing carries across.

Each industry has its own capability register (153 capabilities across the eight) stating the observable signal, what it cannot establish, the intended response and a source, plus a written list of detections the industry refuses (39 in total) with the reason for each. Rule placement is enforced rather than advised: a rule cannot be saved against another industry's zone or against any never-monitored area, so aged care rejects a rule in a resident bedroom and retail rejects one in a fitting room. Only video candidates carry a model confidence — sensor events and staff reports show none.

The new **Industry profile** screen shows sector scope, regulator, principal risks, capability mix, monitored versus never-monitored areas, the searchable register and the exclusions. See the [multi-industry expansion report](docs/research/multi-industry-expansion.md) for how the registers were built, the sectors deferred or declined and why, and full verification results.

Casework workspaces (Safeguarding, Hostel operations and the rest) contain school-authored records and therefore appear only for education. Other industries see the industry-neutral surface plus Pilot governance and Platform readiness; sector casework content is the next build step rather than relabelled school records.

## 2026 platform audit and impact roadmap

The [platform audit and impact roadmap](docs/research/2026-platform-audit-and-impact-roadmap.md) re-runs every automated check, completes the browser interaction QA that earlier passes recorded as blocked, and ranks improvements against the external evidence base and the Malaysian policy position as at September 2026. The accompanying [feature impact ranking](docs/research/feature-impact-ranking.csv) scores 19 recommendations plus 6 explicit exclusions by school impact, effort and whether cameras are required.

Headline findings: verification is clean (TypeScript, 27/27 tests, static build, 21 screens in a browser with no console errors, no overflow at 375 px), but the running UI still presents bullying as an AI detection with a confidence score, two contradictory detection taxonomies ship at once, and the highest-impact improvements — confidential reporting, structured threat-assessment casework, MOE system integration and Bahasa Melayu — need no cameras at all.

## Detection studio and pilot governance

The Detection studio adds 24 video-candidate, sensor-integration and staff-report concepts, configurable demonstration rules, ten-second scenarios and a synthetic evaluation ledger. Pilot governance adds nine approval, participation, commissioning, training and evidence-policy workflows. See the [surveillance capability audit](docs/research/surveillance-capability-audit.md), [document traceability](docs/research/jpn-ui-traceability.csv) and [capability register](docs/research/detection-capability-register.csv). Presentation references are intentionally kept outside the platform UI.

## Campus insights

Campus insights adds a six-zone school heatmap, occupancy/movement/dwell modes, sampled-day replay, trends, gate statistics and staff-owned planning actions. Facilities & health has been removed from the current UI. The earlier 33-area study remains historical; six facility-workspace entries are now explicitly outside the selected product scope. See [everyday camera value research](docs/research/campus-camera-value-study.md).

## Dedicated Security workspace

Choose **Security workspace** from the existing header's **Demo workspace** selector, or open **Security** beneath Platform overview in Superadmin. It adds eight sections inside the existing dashboard: overview, monitoring, incidents, sites, guard dispatch, investigations, detection rules and reports.

The workspace includes the complete 90-feature security specification, site-specific demo rule saving, a guarded incident lifecycle and CSV reports. Commercial security records are separate from school data, and the existing light/dark themes are retained. See [Security integration and completeness audit](docs/security-workspace-audit.md) for tested journeys, scope and remaining production work. This is an interactive frontend demonstration; it does not implement 90 live AI detectors or connect real cameras.

### Dedicated Security dashboard

Choose **Security workspace** in the dashboard selector. Security has a separate shell and nine sections, including **Capability library**. The library maps all 91 capabilities in the supplied CCTV research into 14 categories with per-site setup drafts, related specifications and integration requirements. Export drafts before changing workspace or refreshing. These are UI workflows and implementation scope; no live AI, biometric, camera or external action service is connected.
