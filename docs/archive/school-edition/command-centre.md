# Command centre, architecture and branding

Added 13 September 2026, from the supplied AiWAS / MicroPay presentation set.

## Security operations room

`app/security-operations-room.tsx`. The operator console the platform was missing: camera estate on the left, video wall in the middle, live event queue on the right, operator status bar underneath.

**Cameras.** Total, online, offline and recording counts; search; an online-only filter; per-camera zone, block, stream address, frame rate and latency; add and remove from the wall. Offline cameras are listed in a distinct state rather than hidden.

**Video wall.** 2×2, 3×3 and 4×4 layouts with an active-slot count, Clear All and Arrange. Each tile carries its camera name, a live indicator with frame rate, expand and close controls. Reducing the grid trims the wall rather than leaving orphaned streams.

**Events.** Total, active, critical and high counts; search; All / Active / Critical / High filters; each row shows severity, category, zone, camera, time, and either a confidence figure or an explicit statement that the capability carries no model score. A snapshot panel previews the selected event and offers Open record and Acknowledge.

Two platform rules are enforced in code here rather than left to the operator:

- **An offline feed renders as an explicit signal-lost tile** — hatched, captioned "Coverage unavailable. Do not read this area as clear — request a patrol." A dark rectangle that looks like a quiet room is the failure mode this prevents.
- **Confidence appears only for a video candidate.** A sensor event or a staff report states its kind and says it has no model score.

Text Alert is deliberately honest: it records that no message was sent, because external delivery is not implemented.

## Platform architecture

`app/platform-architecture.tsx`. The six-stage pipeline from the presentation: capture on site → on-premise AI analysis → events and data → cloud dashboard → operations room → action and outcome, with the privacy property that carries the whole design ("video stays on site; only events and snapshots are sent") stated as its own panel.

The screen also carries a **deliberately not in this pipeline** section, and that is the reason it exists rather than being a static slide.

## Two capabilities from the supplied artwork that are not implemented

The presentation's on-premise analysis stage lists **face recognition**, and its cloud dashboard shows a **people count split by sex** (Male 612 / Female 644). Both are excluded, and both are drawn on the architecture screen as struck-through entries with the reason attached:

- **Face recognition.** Biometric data is sensitive personal data under the Personal Data Protection (Amendment) Act 2024, and MOE excludes biometrics from the school programme. It also contradicts the platform's own exclusion lists, which refuse it in all eight industries.
- **Sex or demographic classification in counts.** Classifying children as male or female from appearance is profiling of minors, adds nothing to a safety decision, and cannot be corrected when wrong. Counts are totals only.

Alongside them: cross-camera re-identification, automated external escalation, and disciplinary automation.

Recording them visibly, with reasons, is the point. A diagram that quietly dropped them would let them return in the next revision of the deck.

## Use-case coverage

The presentation's six headline use cases map to the education register as: fight and violence → `fight` (a review candidate, not a finding); crowd and congestion → `crowd`; restricted area → `intrusion`; smoking and vaping → `vape` (sensor integration, plus a staff-report route); fire and smoke → `smoke` (approved device, not ordinary CCTV); occupancy and footfall → newly added.

Two capabilities were genuinely missing and are now in the register:

- **People detection and tracking (anonymous)** — tracks do not persist between cameras and no appearance signature is stored.
- **Entry / exit counting and occupancy** — with the drift limitation stated, and marked as an operational estimate rather than a pupil register or evacuation headcount.

The education register is now 26 capabilities.

## Branding

`app/brand.tsx` provides `AiwasLogo`, `MicropayLogo` and a co-branded `BrandLockup`. These are SVG reconstructions drawn to match the supplied artwork so the product is co-branded without depending on binary assets — **replace them with the official vector files when available**; the component API will not change. The AiWAS mark and a "by MicroPay" line now sit in the sidebar, and the lockup heads the architecture screen.

## Limits

No camera ingestion, inference, streaming, transfer or notification is implemented. Every tile is synthetic media, every event is demonstration data, and the console's stream addresses, frame rates and latencies are generated. This is the operator experience, not the operating service.

## Verification

TypeScript clean, 57/57 tests, application lint clean, static build and all five render smoke checks passing. Browser-verified: both brand marks render; the console shows 7 cameras, a 4-tile wall and 14 events with a working status bar; grid switching moves between 4, 9 and 16 slots while preserving filled tiles; adding the offline camera produces the signal-lost tile with its warning; 13 events show a percentage and 1 states it has no model score, with no sentinel leak; the critical filter narrows to 2; Text Alert states nothing was sent; the architecture screen renders 6 stages and 5 disabled entries including face recognition and sex classification; the console works in healthcare as well as education; and there is no horizontal overflow at 375 px. One cosmetic defect was found and fixed in that pass: the synthetic-scene stamp clipped to "THETIC SCENE" in small tiles.
