# EzVision Campus · powered by AiWAS

One AI layer over the cameras a university already has. Edge boxes analyse video on campus, one engine detects, the platform core applies the university's rules, and six modules route each alert to the office that acts on it. **Hostel Integrity** leads; Safe Campus, Mobility (ParqOS, Vera), Welfare (AIWAS), HSE and Space & Admin reuse the same engine and console.

The build follows the [EzVision Campus System Spec & Smart Campus Audit](docs/spec/EzVision-Campus-System-Spec.pdf). [`docs/spec/README.md`](docs/spec/README.md) maps every part of the spec to a screen and a file.

It is shown from two points of view:

- **Universiti Malaya**: the spec's ten roles, from the command centre to the warden on duty.
- **KPT (Kementerian Pendidikan Tinggi)**: the 38-university smart-campus audit, global benchmarks and hostel pilot aggregates.

> Demonstration only. Every person, alert, plate and figure is fictional, and camera footage is synthetic. No credentials are collected, and no message, camera or integration is contacted. The KPT audit rows are the spec's public-evidence findings, with their source links.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev            # vinext dev server
npm run build:vercel   # static build in dist/vercel
npm test               # SSR bundle + 51 node:test checks
npm run lint           # oxlint (type-aware)
```

## What's in it

**Sign-in** (`#/`)

Pick a point of view (Universiti Malaya, KPT or the warden app), then a role. You can switch roles from the account menu at any time.

**Universiti Malaya** (`#/um/...`)

| Area | Screens |
|---|---|
| Command centre | Console (map, live queue sorted by escalation and severity, video wall) · Alerts (the five-step lifecycle) · Video wall (60 cameras) · Search & investigation (time, camera, clothing colour, object or plate; cross-camera timeline) · Cases (notes, outcome, watermarked PDF export) |
| Modules | All modules · Hostel Integrity (breaches by block, door and hour; semester trend; visiting hours and curfew) · Safe Campus · Mobility · Welfare · HSE · Space & Admin |
| Platform | Rules studio (draw lines, schedules, thresholds, preview against yesterday, versioned saves) · Camera health (offline, blocked, blurred, moved) · Reports (weekly and monthly PDFs) · Admin & privacy (users, roles, audit log, data requests, retention, privacy defaults) · Pilot & rollout |
| Apps | Warden app |

Each role sees only its own screens and alerts:

- **Warden:** one college.
- **Counsellor:** wellbeing alerts only.
- **HEP:** confirmed cases only.
- **No video at all:** the Pengetua, HEP, the counsellor and the DPO.

**Try this**

1. Sign in as the **command centre operator**. The top of the queue is a lounge-line alert at KK12 Blok A that nobody accepted, so it escalated. Open it, then accept, verify and record the outcome.
2. Press **Raise a demo alert**, then open **Warden app**. Accept the alert, then close it in two taps: a verdict, then an outcome.
3. Raise another alert and press **Skip 5 minutes** to watch it escalate.
4. In **Search & investigation**, press **Example**. Follow the person in the red top back across five cameras.
5. As the **security director**, open case **CS-26-039** and export the evidence PDF. Then check the **Audit log**.

**KPT** (`#/kpt/...`)

Overview (maturity by type and state) · Universities (38 audit rows with evidence links) · Capability gap · Global benchmarks · Hostel integrity pilots · Privacy & PDPA · Reports (PDF brief, CSV).

The ministry never sees footage, plates, camera IDs, hostel block names or people's names. Counts from 1 to 4 are suppressed.

## Privacy defaults

- **Face recognition:** off. There is no face search.
- **Gender estimation:** only on the lounge-line camera of single-gender blocks. It names no one.
- **Classroom attention scoring:** not offered.
- **Toilets and changing rooms:** radar only, never cameras.
- **Exports:** faces are blurred unless the security director unblurs for a case.
- **Retention:** alert clips are kept 30 days by default.
- **Audit log:** every view, search, export and rule change is logged and kept for 7 years.
- **Decisions:** a person verifies every alert, and the AI never issues a penalty.
- **Welfare:** wellbeing alerts go to counselling, never to discipline.

These defaults are listed in `app/_data/govern.ts` and enforced by the views and the tests.

## Design system

The UI is built on the **shadcn/ui** components in `components/ui`, in the `base-nova` style on Base UI, with one token layer in `app/globals.css`:

- Light and dark themes.
- The AiWAS plum `#A11D62` as the primary colour.
- Status tokens for critical, warning, success and info.

The official wordmark is redrawn as a vector in `public/brand/aiwas-logo.svg`.

## Media

All 60 synthetic scenes in `public/media` are mounted on UM cameras, one scene per camera:

- **The two pilot hostel blocks:** 12 scenes, covering the entrance, lounge line, corridors, parcel room, fire exit or stairwell door, drying area, rooftop door and the path to the bus stop.
- **Elsewhere on campus:** the main gate, faculties, UMMC, the contractor site, stores and workshops, the campus mart and the shuttle hub.

A test fails if any media file is unused.

## University logos

Universiti Malaya's crest and lockup were supplied by EzGIG. `public/logos/manifest.json` lists KPT and all 38 audited universities. The other logos could not be downloaded from this build environment, so `UniversityLogo` shows an acronym crest until a file is added to `public/logos/` and registered in `app/_data/logos.ts`.

## Code map

```
app/page.tsx              hash router: sign-in, /um, /kpt, /app
app/_data/um.ts           campus, blocks, six modules, detectors, cameras, counts
app/_data/alerts.ts       rules (+ rule language), alerts (+ lifecycle), cases, hostel stats, KPIs
app/_data/search.ts       sightings, clothing/plate search, cross-camera timeline
app/_data/govern.ts       privacy defaults, retention, roles, rollout, integrations
app/_data/kpt.ts          38-university audit, benchmarks, gaps, pilot aggregates
app/_lib/                 router, demo store, lifecycle actions, role scope, PDF writer
app/_views/um|kpt|apps/   screens
tests/                    node:test suites run against an SSR bundle
```

## Documents

- [The spec and where it lives](docs/spec/README.md)
- [Two points of view](docs/points-of-view.md)
- [Code audit and change history](docs/audit/2026-10-code-audit.md)
- [Earlier campus-safety research](docs/research/university-campus-safety-audit.md): background only. The current build follows the spec.

## Deployment

- **Vercel:** `vercel.json` runs `npm run build:vercel` and publishes `dist/vercel`.
- **Sites / Cloudflare Workers:** `npm run build` builds with vinext.
