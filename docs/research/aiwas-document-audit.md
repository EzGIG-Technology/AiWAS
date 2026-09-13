# Audit of the supplied AiWAS document

Date: 13 September 2026. Source: a 94-page PDF containing screen captures of two running products plus a detection matrix. Text was not extractable (the pages are images), so 40 embedded screenshots were extracted and read individually.

## What the document actually contains

Three distinct things, not one product:

**1. NeueTrace Device Dashboard v4.0.3.0** — the on-premise appliance UI. Navigation: Settings, Device Cameras, Heatmap, Device Settings under DEVICE; System Health, Security Mode, How to Use, About under SYSTEM; with a dark-mode toggle and an Arabic (عربي) language switch.

**2. AiWAS by Micropay** — the cloud dashboard. Navigation: Dashboard; Locations, Devices, Face Events, Activity Alerts; Live Counting, Footfall, Person Analytics, Heatmaps; Employee Report; Known Persons, Groups, Restricted Areas, Users; Audit Log, Settings; How to Use, Support Ticket. Demonstration sites are Indonesian schools.

**3. AiWAS Detection & Response Matrix** — a 22-row table of detection categories with system action, notification list and confidence targets.

## What was built from it

**Detection & response matrix** (`app/response-matrix.ts`, `app/detection-matrix.tsx`). All 22 rows transcribed with their stated action, recipients, severity and confidence figures. Three columns are added that the source does not carry:

- **Status** — Existing (10), Requested (6), Suggested (6).
- **Gate** — what must be true before enabling: Ready to evaluate, Needs measurement, or Needs governance decision.
- **Caution** — where the stated behaviour conflicts with the platform's own limits, shown against the row rather than in a separate document.

Only the ten existing categories carry the 80% baseline; the other twelve report "Not measured" rather than a number, and a test enforces that. Every row whose notify list reaches Authorities or the Fire department, or whose action says automatic escalation, is forced to the governance gate by test.

**Detection tuning** (`app/detection-tuning.tsx`). The device Detection tab reproduced with its real defaults: the nine activities with confidence, severity and cooldown (violence 0.7, guns 0.8, knife 0.85, blood 0.7, weapon 0.8, fire 0.4, smoke 0.5, vape 0.75, cigarette 0.5); crowd detection (min size 3, stationarity 5s, proximity 150px, movement 20px, cooldown 60s); altercation detection (window 5, min hits 3, min confidence 0.65, min persons 2, proximity 200px); tracker (IOU 0.5, cooldown 30s, crowd max misses 2); and entrance/exit counting lines with type, direction and position.

Two guards were added that the source screen leaves to the operator: a threshold below 0.50 raises a false-alert warning, and a zero cooldown warns that an activity can re-fire continuously. Fire and smoke are treated separately — a low threshold there is a deliberate life-safety trade, not an error.

**Edge appliances** (`app/device-fleet.tsx`). Devices as first-class entities with location, coordinates, timezone, online state, uptime, CPU/memory/disk, GPU utilisation, VRAM, temperature and service status (AI Engine, AI API, Device UI, Redis). An appliance that is not reporting states plainly that the site is not being analysed at all.

**Branding.** The AiWAS mark is corrected to the amber wordmark supplied separately, replacing the pink reconstruction.

## The identity suite: a decision you need to make

A large part of the cloud product is facial recognition, and it is not incidental — it is the spine. This is the one thing in the document I have not implemented, and it needs your explicit decision rather than my judgement.

What the document shows:

- **Face Events** — a live feed of named individuals at gates, searchable by name, customer ID and civil ID, with Staff/Student status. Faces of unknown people can be associated to a person profile.
- **Known Persons** — enrolled profiles with NIS/NIP identity numbers, group membership and last-seen timestamps.
- **Groups** — including **Blacklist** and **Watchlist**.
- **Person Analytics** — a gender-distribution donut (M 52% / F 48%) and known-versus-visitor ratio.
- **Face Event Detail** — estimated **age** and **sex** per detected face.
- **Employee Report** — attendance and movement per identified person, with first seen, last seen, total hours, cameras and sighting count.
- **Device Settings → Identity** — enrollment threshold, match threshold, face quality gates, visitor galleries of up to 50 images per person.
- **Camera type → Enrollment** and a per-camera **Show Face Info** toggle.

This conflicts directly with four things already established in this repository and in the programme's own material:

1. The platform's exclusion lists refuse facial recognition of minors in all eight industries.
2. Biometric data is **sensitive personal data** under the Personal Data Protection (Amendment) Act 2024, in force since 2025.
3. MOE's stated position for the school programme excludes biometrics.
4. **The document contradicts itself.** The detection matrix's own "Person Type" row says classification uses clothing and posture cues, "not facial recognition (in line with the no-biometrics rule)". So a no-biometrics rule is acknowledged in the same document that ships face enrollment, watchlists and civil-ID search.

The distinction that matters is who is being recognised. Face-based **staff** time and attendance, with informed consent and an employment basis, is an ordinary HR product. Face enrollment of **children**, with blacklists and watchlists, is a different thing entirely, and it is the single claim most likely to end a JPN pilot.

There is also a narrower problem regardless of that decision: **age and sex estimation**. Sex classification of children adds nothing a responder acts on, is wrong for gender-nonconforming pupils and for cultural dress, and cannot be corrected. Adult-versus-child is the distinction that actually helps someone responding to an incident.

**Three options, and my recommendation.** Ship the school product non-biometric and keep the identity suite for adult-workforce deployments under a separate consent basis; or gate identity behind a per-site licence with a DPIA, a named DPO, written consent and a documented retention and deletion policy; or build it as shown and accept the regulatory exposure. I recommend the first, and if you choose the second I would build the governance gate before the feature.

Tell me which, and I will build to it.

## Other conflicts recorded in the matrix

- **Bullying** is specified as detecting emotion and "identifies aggressor & victim". Bullying is defined by repetition, intent and power imbalance; emotion inference has no validated basis; naming an aggressor from video is a safeguarding determination a camera cannot make.
- **Violent behaviour**, **weapon detection** and **fighting** specify automatic escalation to Authorities. An unvalidated model output dispatching a response to a child is the failure mode that drew federal enforcement against a comparable vendor.
- **Smoking/vaping** gives toilets as the example location. The platform never monitors toilets; detect at the building line or use a camera-free air-quality sensor.
- **Entry/exit counting** gives a toilet doorway as the example. Counting at the door from outside is fine; a camera inside is not.
- **Uniform compliance** is unreliable for religious dress, PE kit, medical exemptions and weather layers, and the failures land on the same pupils repeatedly.
- **Cheating** carries an academic penalty and an appeal process, so it must remain an invigilator report.
- **Theft** cannot be established by CCTV, and its notify list reaches Authorities.

All seven are visible in the running matrix screen against the row they apply to.

## Not yet built, mapped for the next pass

From the cloud dashboard: Locations as a managed register with coordinates and timezone; Audit Log; Support Ticket and How to Use; Footfall analytics with the weekly day-by-hour heatmap; Restricted Areas modelled as camera plus allowed groups plus hours plus violation severity; person Groups.

From the device dashboard: the remaining Device Settings tabs (API & Bus, Ingest, Inference, Storage & Reports, Logging); Security Mode; per-camera type (Entrance, Exit, Normal) with the 8-FPS-for-counting guidance; snapshot retention and draw-boxes settings; Arabic and Bahasa Melayu language switching.

Two camera types in the source are excluded rather than deferred: **Enrollment**, which exists only to register faces, and **Drowsiness**, which infers a physiological state from video with no validated basis for children.

## Verification

TypeScript clean, 64/64 tests (7 new), application lint clean, static build and all five render smoke checks passing. Browser-verified: the matrix renders all 22 rows with 12 cautions, filters to 10 governance-gated rows, and shows "Not measured" for unbuilt detections; tuning renders 9 activities with all four parameter panels and both counting lines, and the low-confidence warning appears and clears; the appliance view renders the estate table, six health rings and four services, and an offline appliance states the site is not being analysed; the amber logo gradient is applied; no console errors; no horizontal overflow at 375 px.
