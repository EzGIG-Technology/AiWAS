# Code audit — AiWAS school demo (before the university rework)

Date: 26 October 2026 · Commit audited: `acf501c` · Scope: everything under `app/`, `components/`, `tests/`, build configuration and `README.md`.

This audit was the starting point for rebuilding the demo as **EzVision Campus Safety** for universities, with a Universiti Malaya campus view and a Kementerian Pendidikan Tinggi (KPT) national oversight view.

## Baseline health

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass (0 errors) |
| `npm test` (node:test) | 74 / 74 pass |
| `oxlint` | 3 errors, all `restrict-template-expressions` in `components/ui/chart.tsx` |
| `npm run build:vercel` | Pass, with one JS chunk over 500 kB (no code splitting) |
| Source size | 24,109 lines across `app/` and `tests/`; `app/` is 840 KB |
| Media | 60 synthetic camera scenes (60 stills + 53 MP4 clips, 33 MB) |

The build was green. The problems are about structure, product fit and maintainability, not compile errors.

## Findings

### 1. Product fit: the domain model is K-12 plus eight unrelated industries

- Data, copy and tests are built around Malaysian primary and secondary schools: *pupils*, *teacher app*, *discipline teacher*, *SMK/SK* school names, *JPN* (state education department).
- `app/industries.ts` (2,108 lines) and `app/industry-seed.ts` add healthcare, aged care, retail, construction, manufacturing, transport and commercial property. Of the 60 camera scenes, 51 belonged to those industries and appeared only when a non-school industry was selected.
- None of it models university concepts: residential colleges, faculties, a teaching hospital, auxiliary police, shuttle buses, convocation, research labs or ministry reporting.

**Decision:** replace the domain model rather than relabel it. All 60 scenes were kept and remapped onto real university locations. A university campus really does contain a teaching hospital, construction sites, central stores and workshops, a campus mall, a transit hub and a chancellery, so every scene has a credible place.

### 2. Architecture: one 2,818-line component

- `app/page.tsx` is a single `Home` component with 36 `useState` hooks, 26 views selected by string comparison, and inline handlers for every workflow.
- View names exist in three places that have to agree by hand: `nav`, `headings` and `navigation.ts`.
- There is no routing. A refresh always lands on Overview, and views cannot be linked to.

**Decision:** a small hash router, one file per view, typed view registries per workspace, and data split into `app/data/*` modules.

### 3. Design system: shadcn is installed but mostly bypassed

- 55 shadcn (`base-nova`) components are vendored in `components/ui`, but **38 of them are never imported**, including `card`, `badge`, `avatar`, `alert`, `chart`, `scroll-area` and `empty`. The app re-implements cards, badges, empty states and pills in custom CSS.
- `app/globals.css` is 4,604 lines, with 22 `!important` declarations and 209 hex literals.
- `--primary` is defined **three times** with three different values (teal, info-ink, brand). The last definition wins only by source order (lines 321, 2189, 4549).
- The brand mark in `app/brand.tsx` is a reconstruction: a spark icon beside text. It is not the official wordmark.

**Decision:** one shadcn token layer in `globals.css` (light and dark), with the official AiWAS plum as `--primary`. Screens are composed from the vendored shadcn components. The official wordmark is redrawn as a vector at `public/brand/aiwas-logo.svg`.

### 4. Identity and access: no login

- The "Demo workspace" select switches roles client-side. There is no sign-in screen and no separation between an institution's view and a regulator's view.
- Roles (`Internal Ops`, `School Admin`, `Discipline Teacher`, `System Admin`) do not match university security organisations.

**Decision:** a sign-in portal with clearly labelled demo personas that route to separate workspaces:

- Universiti Malaya: security operations, the security director, a college principal and the Deputy Vice-Chancellor for Student Affairs (HEP).
- KPT: a ministry officer.
- Two mobile apps: one for patrol officers and one for students.

No credentials are collected or checked.

### 5. Data governance boundaries were implicit

- The school demo kept its privacy rules (no facial recognition, confidence shown only for video candidates) mostly in prose and tests.
- A ministry view raises a new risk: a regulator dashboard must never expose footage or identities, only aggregates. Nothing existed to enforce that.

**Decision:** the KPT data module holds only aggregate counts. A test asserts that KPT views render no media and no personal names.

### 6. Repository hygiene

- `README.md` documents a "Dedicated Security workspace" and links `docs/security-workspace-audit.md`. Both were removed in `acf501c`, so the link is broken.
- `tsconfig.tsbuildinfo` (355 KB) is committed and changes on every type-check.
- `app/layout.tsx` loads Geist through `next/font/google`, which needs network access at build time, while the Vercel entry self-hosts the same fonts.
- `Date.now()` drives the ten-second analysis timers. That is fine at runtime, but timers like these must not run during render, or SSR output becomes non-deterministic.
- Lint fails on `components/ui/chart.tsx` (an upstream shadcn file).

**Decision:** stop tracking `tsbuildinfo`, rewrite the README for the new product, use the self-hosted fonts in every entry, keep all seed data deterministic, and fix the chart lint errors.

### 7. Things worth keeping

- The non-biometric stance: no facial recognition, no identification of individuals, and coverage gaps that never render as "zero". Universities have been through the same debate (see `docs/research/university-campus-safety-audit.md`), so it carries over.
- Confidence shown only on video-analytics candidates, with human verification before escalation.
- An offline camera is shown as an explicit "signal lost — do not read as clear" tile.
- Light, dark and system themes.
- The static Vercel build and the vinext/Sites build.

## Environment limits hit during the rework

- `ui.shadcn.com` (the shadcn registry) is blocked by this environment's network policy, so `shadcn add` could not fetch new components. The rework uses the shadcn components already vendored in the repository.
- Wikimedia, the KPT website and the university websites are blocked, so official university logos could not be downloaded. `public/logos/manifest.json` lists all 30 institutions. `UniversityLogo` renders an official file automatically once one is placed in `public/logos/`, and an acronym crest until then.

## Scope change: camera intelligence only (26 October 2026)

After the first rebuild, the product was narrowed from a campus safety system to **camera intelligence**: everything the cameras and their analytics produce, and nothing that belongs to a safety desk.

**Removed**

- SOS and safe walks.
- Patrol dispatch and guard tours.
- Mass notification and muster.
- Student welfare.
- Visitor passes.
- The residential-college portal.
- Safety escalations, residential capacity and disaster readiness in the KPT view.
- The EzSafe student app and the EzPatrol officer app.

**Added or reframed**

- **AI detections:** one record per analytic hit, always with a camera and a confidence. Each is verified or rejected by an operator, then shared or closed.
- **Footage search:** by object class, place and time. There is no face or appearance search; a purpose is required and every search is audited.
- **New views:**
  - Occupancy & footfall.
  - Vehicles & parking.
  - Crowd analytics.
  - Camera-health reporting.
- **EzVision Mobile:** a single camera-alert app.
- **KPT view:** reframed around:
  - The camera estate and analytics adoption.
  - Detection trends.
  - The CCTV items of the inspection directive.
  - Privacy and AI governance.
