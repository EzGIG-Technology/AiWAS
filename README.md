# EzVision Camera Intelligence · powered by AiWAS

A **camera-intelligence** demonstration for universities: AI analytics on a campus's existing CCTV, turned into information people can use. It is not a safety-desk system. There is no SOS, dispatch, mass notification or welfare casework; verified clips are handed to the teams and systems a university already has.

It is shown from two points of view:

- **Universiti Malaya**: the university's own camera estate, analytics and privacy office.
- **KPT (Kementerian Pendidikan Tinggi)**: national oversight of camera intelligence across 20 public and 8 private universities, with aggregates only.

A phone app, **EzVision Mobile**, shares live state with the UM console.

> Demonstration only. Every person, detection, plate and figure is fictional. Camera footage is synthetic. No credentials are collected, and no notification or camera connection is made.

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

Choose a point of view (Universiti Malaya, KPT or Mobile app), then a role. You can switch roles at any time from the account menu in the sidebar.

**Universiti Malaya** (`#/um/...`): 14 screens

| Area | Screens |
|---|---|
| Monitor | Overview · AI detections, with an event sheet (clip, confidence, what the analytic cannot establish, verify / false alarm / share / keep clip) · Video wall (all 60 cameras) · Camera map · Footage search (by object class, place and time; never by face or appearance; purpose required and audited) |
| Insight | Occupancy & footfall (live counts, hourly footfall, weekday utilisation) · Vehicles & parking (car-park occupancy, gate traffic, plate reads) · Crowd analytics (convocation density) · Reports (uptime, time to verify, precision, KPT CCTV checklist) |
| Configure | AI analytics & written exclusions · Cameras & edge health · Privacy centre · Users & roles |
| Apps | EzVision Mobile |

The four UM roles each see only their own screens:

- **Director, Security Technology:** every screen.
- **Video analytics operator:** monitoring screens, crowd, vehicles, devices and the app.
- **Facilities & space planning:** counts only, with no footage and no plates.
- **Data protection officer:** privacy and governance screens, with no footage.

**KPT** (`#/kpt/...`): 6 screens

National overview (with a state map by camera-intelligence maturity) · Universities and profiles · Detection trends · CCTV coverage & uptime (the CCTV items of the 2025 inspection directive) · Privacy & AI governance · Reports.

Every KPT screen carries the aggregates-only banner. It shows no footage, images, plates, camera IDs or names, and counts from 1 to 4 are suppressed.

**EzVision Mobile** (`#/app/mobile`)

The app has three tabs: camera alerts, favourite cameras and camera health. Use "Run a demo detection" in the console and the detection arrives on the phone. Verify it there and the console updates.

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

`public/logos/manifest.json` lists KPT and the 28 universities. **Universiti Malaya's logo is in place**: `um.png` is the crest, used in the sidebar, tables and EzVision Mobile, and `um-lockup.png` is the full lockup, used on the sign-in page. Both were supplied by EzGIG. The other logos could not be downloaded, because Wikimedia, the KPT site and the university sites were blocked by the network policy. Until they are added, `UniversityLogo` shows a neutral acronym crest.

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
- [University campus-safety research](docs/research/university-campus-safety-audit.md): 30 vendors, deployments by region, roles, features, privacy exclusions and the Malaysian context, with 179 cited sources. A [vendor matrix](docs/research/university-vendor-matrix.csv) accompanies it. The research covers campus safety broadly; the product now takes only its camera-intelligence parts (§5.2 video analytics, §6 exclusions, the KPT CCTV directive).
- [Two points of view](docs/points-of-view.md): what UM and KPT need from camera intelligence, mapped to screens
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
