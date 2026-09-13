# AiWAS multi-industry expansion

Date: 13 September 2026. Scope: identifying the industries this platform can serve, building an industry-specific detection register for each, and implementing an industry switch across the interface.

The platform was built for schools. Its underlying shape — anonymous camera candidates, human review, staged casework, governance records — is not school-specific. What *is* school-specific is the vocabulary, the monitored areas, and above all the detection register. This expansion keeps the shape and replaces those three things per industry.

---

## 1. Industries identified

Twenty candidate sectors were considered against four tests: does camera-observable event detection help; is there a duty-of-care record worth keeping; is there a regulator who will ask for it; and can the platform's non-biometric stance survive contact with the sector's commercial pressure.

### Implemented (8)

| Industry | Sector | Capabilities | Excluded | Distinguishing risk |
|---|---|---|---|---|
| Education | Schools, boarding schools, campuses | 24 | 5 | Hostel supervision where cameras are prohibited |
| Healthcare | Hospitals, emergency departments, clinics | 22 | 5 | Assault on staff; falls in public clinical areas |
| Aged & residential care | Care homes, assisted living | 15 | 4 | Unwitnessed falls and long lie times |
| Retail | Stores, supermarkets, shopping centres | 20 | 5 | Violence against colleagues; slip liability |
| Construction | Building sites, civil works | 17 | 5 | Struck-by plant; falls from height |
| Manufacturing & warehousing | Factories, distribution centres, yards | 18 | 5 | Forklift–pedestrian collisions |
| Transport hubs | Airports, rail, transit interchanges | 18 | 5 | Crowd crush; platform edge |
| Commercial property | Office towers, corporate campuses | 19 | 5 | Tailgating; plant and roof access |

153 capabilities and 39 explicit exclusions in total.

### Identified but deferred (with reasons)

- **Stadiums and event venues** — the crowd-density work is nearly identical to transport hubs, so the marginal register is thin. Worth adding as a transport variant rather than a separate industry.
- **Hotels and hospitality** — largely reproduces commercial property plus retail. Defer until a customer needs it.
- **Utilities and critical infrastructure** — perimeter and restricted-area work generalises, but the sector's real requirement is regulated physical security accreditation this platform does not hold.
- **Ports and maritime** — heavy plant conflict is close to the industrial register; the differentiator is cargo and customs systems the platform does not integrate with.
- **Mining** — high value and high risk, but the controls are vehicle telematics, gas monitoring and collision-avoidance hardware more than estate CCTV.
- **Banking branches** — small estates, and the dominant use case drifts quickly toward facial recognition of customers, which this platform refuses.
- **Data centres** — a narrow subset of commercial property; access control already does most of the work.
- **Agriculture** — the observable events are livestock and machinery rather than people; a different product.

### Identified and declined outright

- **Correctional facilities** — the platform's central design commitment is that a candidate event directs adult attention and never becomes an automated finding about a person. In a custodial setting the pressure to invert that is structural, and the population cannot decline monitoring. Declining is the honest answer.
- **Schools in jurisdictions requiring biometric pupil identification** — incompatible with the non-biometric commitment.

---

## 2. How the detection registers were built

Every capability records five things: the **observable signal**, **what it cannot establish**, the **intended response**, a **priority**, and a **source**. A capability is classified as one of three kinds, and the classification carries real consequences in the UI:

- **Video candidate** — a geometric or motion event a camera can propose. Only this kind carries a model confidence.
- **Sensor integration** — a door contact, gas sensor, fire device or air-quality unit. No model score.
- **Staff report** — a human-reported concern. No model score, and never described as a detector finding.

Registers were built from vendor documentation and sector research, then trimmed against the platform's own rule that video cannot establish intent, culpability or a clinical conclusion. Where a marketed capability failed that test it was either reframed (aggression became "a candidate needing security support", not "violence detected") or excluded.

Accuracy claims are recorded with their conditions. PPE detection is documented at roughly 90–97% for helmet and hi-vis in good light, degrading sharply with dust, glare, distance and worker clustering; harness detection is marked experimental because body-worn equipment is materially harder and anchorage cannot be verified visually at all. Unattended-baggage vendor figures are attributed to the vendor's own conditions rather than restated as fact.

### Cross-industry invariants

Two capabilities are present in every register and enforced by test: **camera obstruction** and **stale feed**. A dark camera must never read as a quiet area, in any sector.

Every register also carries an exclusion list, and every exclusion carries a written reason. A test asserts that each industry refuses biometric identification in writing and that no reason is a throwaway phrase.

---

## 3. What was implemented

**`app/industries.ts`** — the registry. Per industry: lexicon, regulator, monitored zones, never-monitored zones, incident categories, the capability register, the exclusion list, principal risks, demonstration sites and applicable workspace modules.

**`app/industry-seed.ts`** — generates sites, cameras, records and accounts from the selected industry's own register. Two invariants are enforced at the source: only a video candidate receives a confidence value, and a contextual category is never described as a detector finding.

**`app/industry-profile.tsx`** — a new screen showing sector scope, regulator, principal risks, the capability mix, monitored versus never-monitored areas, the searchable capability register, and the excluded detections with their reasons.

**Industry switch** — a selector in the sidebar. Changing industry reloads that industry's sites, cameras, records, accounts, categories, zones, rule defaults and capability register, and clears filters, drafts and audit state. Nothing carries across: a rule written for a warehouse aisle has no meaning in a ward corridor.

**Vocabulary** — headings, subtitles, navigation labels, role labels and scope chips follow the industry lexicon, so a hospital workspace reads "Hospital team" and "hospital-scoped access" rather than school wording.

**Rule placement is enforced, not advised** — `industryZoneError` rejects a rule saved against another industry's zone and against any zone on the industry's never-monitored list. Aged care will not accept a rule in a resident bedroom; retail will not accept one in a fitting room.

**Staged scenarios** — the ten-second demonstration now offers the selected industry's own video candidates. Healthcare opens on "Aggression toward staff", construction on "Helmet not detected".

**Workspace gating** — the eight casework workspaces (Safeguarding, Hostel operations and the rest) contain school-authored records, so they appear only for education. Every other industry sees the industry-neutral surface plus Pilot governance and Platform readiness. Authoring sector-specific casework content is the next build step, recorded below rather than faked with relabelled school records.

### Two defects from the previous audit closed on the way

The September audit found that the UI presented bullying as an AI detection with a 78% confidence score, contradicting the platform's own capability audit, and that two detection taxonomies shipped at once. Generating every industry's records from its capability register resolved both for the incident surface: the legacy 13-category taxonomy is no longer the source of records or filter options, and confidence is now structurally impossible to show on a sensor event or a staff report.

While fixing it, a **second confidence render site** was found in the incident sheet that the first fix had missed — it displayed the internal sentinel as "-1%". Both call sites now read from a single `confidenceDisplay` helper so they cannot drift apart again. This was caught by browser testing, not by tests or typecheck.

---

## 4. Verification

| Check | Result |
|---|---|
| TypeScript | **PASS**, no diagnostics |
| Tests | **PASS**, 39/39 (27 existing + 12 new industry tests) |
| Application lint | **PASS**, clean |
| Static build | **PASS** — 708.72 KB raw / 216.30 KB gzip JS |
| Server-render smoke | **PASS**, 3 assertions |
| Browser: all 8 industries | **PASS** — profile renders, register populated, 0 console errors |
| Browser: register isolation | **PASS** — no school zone leaks into any other industry's studio |
| Browser: excluded zones | **PASS** — resident bedrooms not offered as a rule zone |
| Browser: confidence rule | **PASS** — sensor event shows "Not applicable", video candidate shows a score |
| Browser: staged scenarios | **PASS** — healthcare run produced a healthcare candidate, no school leakage |
| Browser: nav gating | **PASS** — casework workspaces hidden outside education |
| Mobile 375 px | **PASS** — no horizontal overflow |

The new tests assert structural properties rather than restating the data: that registers differ substantively between industries rather than being relabelled, that monitored and excluded areas never overlap, that only video candidates carry a score, that seeded records stay inside their own industry, and that every exclusion has a real reason.

Bundle growth is 646.84 KB → 708.72 KB raw (199.54 KB → 216.30 KB gzip), all of it registry data in one eager chunk. Route-level code splitting remains the outstanding recommendation from the previous audit and matters more now.

---

## 5. Still outstanding

Everything the September audit listed as a release blocker is unchanged: no backend, no authentication, no server-enforced tenant isolation, no durable storage, no notification delivery, no camera ingestion. Adding industries widens the demonstration; it does not move the platform closer to production.

Industry-specific work now queued:

1. **Sector casework modules.** Seven industries currently show only the industry-neutral surface. Healthcare needs patient-safety incident and workplace-violence casework; construction needs permit-to-work and near-miss investigation; aged care needs welfare rounds and safeguarding referral.
2. **Presence and muster per industry.** The presence register is education-only. Muster and roll call generalise well and are genuinely useful in construction, industrial and commercial settings.
3. **Sector media.** All industries reuse the nine synthetic school scenes. A hospital corridor illustrated by a school corridor is honest only because every scene is labelled synthetic; it is still weak.
4. **Regulator-specific reporting.** DOSH incident notification, MOH patient-safety reporting and MOE SSDM export are all different shapes.
5. **Per-industry acceptance thresholds.** The measurement commitments from the previous audit apply per capability per industry; a PPE detector and a crowd threshold cannot share an acceptance target.

---

## Sources

Consulted 12–13 September 2026. Vendor documentation establishes that a capability is marketed, not that it is independently validated, available in Malaysia, or suitable for the population being monitored.

**Healthcare and aged care**
- [AI video analytics transform healthcare safety and patient monitoring](https://securitytoday.com/articles/2026/08/26/ai-video-analytics-transform-healthcare-safety-and-patient-monitoring.aspx) — Security Today
- [The state of workplace violence in health care 2025–2026](https://www.nationalnursesunited.org/the-state-of-workplace-violence-in-health-care-in-2025-2026) — National Nurses United
- [Privacy-preserving bathroom monitoring for elderly emergencies using PIR and LiDAR sensors](https://arxiv.org/pdf/2505.18242) — arXiv
- [Designing for dignity: ethics of AI surveillance in older adult care](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12411420/) — PMC

**Retail**
- [Facial recognition in retail: twelve essential principles](https://ecrloss.com/facial-recognition-in-retail-guidelines/) — ECR Retail Loss
- [Retail facial recognition bans: state guide](https://stateofsurveillance.org/guides/basic/retail-facial-recognition-bans-state-guide/) — State of Surveillance

**Construction and industrial**
- [Computer vision PPE compliance detection guide 2026](https://www.smartqhse.com/safety-blog/computer-vision-ppe-compliance-detection) — SmartQHSE
- [Passive construction site safety monitoring via VLM verification](https://arxiv.org/pdf/2605.19869) — arXiv
- [Forklift and pedestrian safety with video AI](https://www.spot.ai/blog/forklift-pedestrian-safety-video-ai) — Spot AI

**Transport**
- [Unattended baggage detection: 2026 airport guide](https://videoraiq.com/blog/unattended-baggage-detection-2026-airport-guide/) — VideoraIQ
- [AI video analytics for train stations](https://visionplatform.ai/ai-video-analytics-for-train-stations/) — VisionPlatform

**Cross-sector, carried from the platform audit**
- [AXIS Object Analytics user manual](https://help.axis.com/en-us/axis-object-analytics) · [Hanwha slip-and-fall white paper](https://www.hanwhavision.com/wp-content/uploads/2026/01/White-Paper_Slip-and-fall-detection.pdf) · [i-PRO scene change detection](https://i-pro.com/products_and_solutions/en/surveillance/newsroom/i-pro-introduces-industrys-first-ai-scene-change-detection-capability) · [Bosch video-based fire detection](https://catalog.boschbuildingtechnologies.com/lifesafetysystems/en/Video-based-Fire-Detection/c/22570758923) · [HALO Smart Sensor](https://halodetect.com/)

See also the [platform audit and impact roadmap](2026-platform-audit-and-impact-roadmap.md) and the [feature impact ranking](feature-impact-ranking.csv).
