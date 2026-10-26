# EzVision Campus Safety · powered by AiWAS

A campus safety demonstration for **universities**, shown from two points of view:

- **Universiti Malaya**: the university's own security operations centre, residential colleges, student affairs and privacy office.
- **KPT (Kementerian Pendidikan Tinggi)**: national oversight across 20 public and 8 private universities, with aggregates only.

The demo also includes two phone apps that share live state with the UM console: **EzSafe** for students and staff, and **EzPatrol** for Polis Bantuan officers.

> Demonstration only. Every person, incident and figure is fictional. Camera footage is synthetic. No credentials are collected, and no notification, call or camera connection is made.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev            # vinext dev server
npm run build:vercel   # static build in dist/vercel
npm test               # SSR bundle + 31 node:test checks
npm run lint           # oxlint (type-aware)
```

## What's in it

**Sign-in** (`#/`)

Choose a point of view (Universiti Malaya, KPT or Mobile apps), then a role. Each role opens its own workspace. You can switch roles at any time from the account menu in the sidebar.

**Universiti Malaya** (`#/um/...`): 17 screens

| Area | Screens |
|---|---|
| Operate | Command overview · Alarm queue & incident sheet (SOP, dispatch, HEP referral, KPT escalation) · Video wall (all 60 cameras, 2×2/3×3/4×4) · Campus map · SOS & safe walks · Patrol & dispatch |
| Campus | Residential colleges (KK1–KK13 and International House), plus a Pengetua portal for KK12 · Visitors & vehicles (passes, plate reads) · Events (convocation event mode) · Emergency & mass notification with muster board |
| Insight | Student welfare (HEPA, aggregated, no video) · Reports & KPT safety-inspection checklist |
| Govern | AI analytics, with what each one cannot establish, plus written exclusions · Privacy centre (footage requests, audit log, retention, DPIA) · Devices & health · Users & roles |

The five UM roles are Chief Security Officer, SOC operator, Pengetua, Deputy VC (HEPA) and DPO. Each sees only its own screens, and HEPA and the DPO never see video.

**KPT** (`#/kpt/...`): 8 screens

National overview with a state tile map · Universities directory and profiles · Incident trends · Inspection & compliance matrix · Escalations · Residential & welfare (the 70%-by-2035 housing target) · Disaster & event readiness · Reports.

Every KPT screen carries the aggregates-only banner. Counts from 1 to 4 are suppressed.

**Apps** (`#/app/student`, `#/app/patrol`)

- **EzSafe**: SOS, Friend Walk, safety timer, escort, shuttle, confidential report, alerts and "I'm safe" check-in.
- **EzPatrol**: dispatch jobs, NFC guard tour, photo report and shift log.

An SOS raised in EzSafe appears in the UM alarm queue. When the SOC dispatches PB-01, the job arrives in EzPatrol.

## Design system

The UI is built on the **shadcn/ui** components in `components/ui` (the `base-nova` style on Base UI), styled by one token layer in `app/globals.css`:

- Light and dark themes.
- The primary colour is the AiWAS plum `#A11D62`, taken from the official wordmark.
- Four status tokens: critical, warning, success and info.

The wordmark is redrawn as a vector in `public/brand/aiwas-logo.svg` and `app/_components/brand.tsx`.

The shadcn registry (`ui.shadcn.com`) was blocked by the build environment's network policy, so no new components were pulled. The demo uses the components already vendored in the repository.

## Media

All 60 synthetic scenes in `public/media` (60 stills and 53 clips) are mounted on UM cameras. Each sits in a place a research university with a teaching hospital really has: gates, faculties, colleges, UMMC, a contractor site, central stores and workshops, a campus mart and the shuttle hub.

The 7 scenes without a clip show their own still with a slow pan, rather than borrowing another scene's video. A test fails if any media file is unused.

## University logos

`public/logos/manifest.json` lists KPT and the 28 universities. The official logo files could not be downloaded, because Wikimedia, the KPT site and the university sites were blocked by the network policy. Until they are added, `UniversityLogo` shows a neutral acronym crest.

To add a logo:

1. Put the file in `public/logos/` (for example `um.svg`).
2. Register it in `app/_data/logos.ts`.

Logos are trademarks of their institutions; see `docs/research/logo-sources.md`.

## Code map

```
app/page.tsx                 hash router: sign-in, /um, /kpt, /app
app/_data/                   media registry, UM data, KPT data, personas, logos
app/_lib/                    router, shared demo store, toasts
app/_components/             shell, brand, camera feed, campus map, state map
app/_views/um|kpt|apps/      screens
tests/                       node:test suites run against an SSR bundle
```

## Documents

- [Code audit of the previous school demo](docs/audit/2026-10-code-audit.md)
- [University campus-safety research](docs/research/university-campus-safety-audit.md): 30 vendors, deployments by region, roles, features, privacy exclusions and the Malaysian context, with 179 cited sources. A [vendor matrix](docs/research/university-vendor-matrix.csv) accompanies it.
- [Two points of view](docs/points-of-view.md): what UM and KPT need, mapped to screens
- [Stakeholder information needs](docs/research/stakeholder-information-needs.csv)
- The earlier K-12 school edition is archived in `docs/archive/school-edition/`.

## Deployment

- **Vercel**: `vercel.json` runs `npm run build:vercel` and publishes `dist/vercel`.
- **Sites / Cloudflare Workers**: `npm run build` builds with vinext. `.openai/hosting.json` identifies that project and contains no credentials.

## Boundaries

The demo does not implement:

- Facial recognition or identification.
- Protest or assembly monitoring.
- Emotion or attention scoring.
- Appearance-based re-identification.
- Location tracking of students.

The AI analytics screen and `app/_data/um.ts` list these refusals in writing, with the reason for each.

Production use would need:

- A backend and university SSO.
- Validated analytics.
- Reliable notification delivery.
- A DPIA, and approval from each institution's data protection officer.
