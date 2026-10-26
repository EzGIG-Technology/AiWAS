# AiWAS platform audit and impact roadmap

Audit date: 12 September 2026. Auditor: automated code, build and browser review plus public-source research.

This pass differs from the earlier audits in three ways. It **executed the checks** rather than reasoning about the source. It completed the **browser interaction QA that every previous audit recorded as blocked**. And it evaluates the product against **the external evidence base and the Malaysian policy position as they stand in September 2026**, not only against its own internal specification.

Scope: repository source, data model, build output, running application in a real browser, and public research. Out of scope: penetration testing, live camera evaluation, accessibility certification, and any assessment of the hosted demo, which this audit did not access.

---

## 1. Executive assessment

AiWAS is a well-built, unusually honest demonstration of a school safety operations product. The workflow modelling is genuinely strong — the incident lifecycle, evidence review guards, follow-up register and pilot-governance records are more carefully designed than most shipped products in this category. Verification is clean: TypeScript compiles, 27/27 tests pass, the static build succeeds, and the application runs in a browser across all 21 screens with **zero console or page errors** and **no horizontal overflow at 375 px**.

Two findings change the priority order that previous audits set.

**First, the product contradicts its own safety position in the running UI.** The repository's capability audit states that video cannot establish bullying and that contextual categories must be represented as reports or review candidates, never as detector outputs. The running application does the opposite: opening incident AIW-1044 shows the heading **"Bullying"** above **"Detection confidence — 78% — Sample score"** and the sentence **"The bullying detector flagged activity in Courtyard."** The superadmin Detection rules screen still offers Bullying, Violent behaviour, Fighting, Vandalism, Littering and Smoking/vaping as configurable camera-detector categories with confidence thresholds. This is not a cosmetic inconsistency. It is precisely the claim that drew federal enforcement against a comparable vendor, and it is the first thing a regulator, a journalist or a sceptical principal will screenshot.

**Second, the highest-impact features for schools are not detection features at all.** The strongest evidence in the field points to confidential reporting channels, structured threat-assessment casework, and whole-school programme fidelity — none of which need a camera. AiWAS already contains the seeds of all three, but they sit behind the detection narrative rather than in front of it. Meanwhile the Malaysian policy window is open right now: MOE has funded phased CCTV nationwide, the Zara Qairina case has produced the first charges under the new anti-bullying provisions, and an Education (Amendment) Bill is in play. A product positioned as *the case-management and duty-of-care record* for that reform lands better than one positioned as an AI camera dashboard.

The release blockers identified in earlier audits are unchanged and remain correct: no backend, no authentication, no durable storage, no notification delivery, no camera ingestion. Nothing in this pass reduces them.

---

## 2. Verification executed

All checks were run on 12 September 2026 against the current branch.

| Check | Command | Result |
|---|---|---|
| TypeScript | `tsc --noEmit --incremental false` | **PASS**, no diagnostics |
| Workflow tests | `node --test tests/*.test.mjs` | **PASS**, 27/27 |
| Application lint | `oxlint app` | **PASS**, clean |
| Repository lint | `oxlint` | **8 findings** (see below) |
| Server-render smoke | `npm run test:render` | **PASS**, 3 assertions |
| Static build | `npm run build:vercel` | **PASS** |
| Local preview server | `vite preview --port 4318` | **PASS**, HTTP 200 |
| Browser walk, 21 screens | Chromium 1194, 1440×900 | **PASS**, 0 console/page errors |
| Mobile layout, 7 screens | Chromium, 375×812 | **PASS**, no overflow |
| Role gating | school vs superadmin nav | **PASS**, 5 items correctly hidden |

Two figures in the existing documentation are now stale and should be corrected:

- `docs/audit-test-results.md` reports **19** repository lint findings. The current count is **8** — in `hooks/use-mobile.ts`, `spinner`, `label`, `field`, `item` and three template-expression findings in `chart.tsx`.
- The same document reports a bundle of **172.79 KB gzip**. The current build emits **646.84 KB raw / 199.54 KB gzip** JavaScript plus 252.12 KB / 40.81 KB CSS. The bundle has grown 15% since that measurement and the chunk-size advisory still fires.

### Browser QA, previously blocked

Every prior audit recorded browser verification as blocked by an `EPERM` on port binding. That restriction does not apply in this environment, so the gap is now closed for the paths tested.

- All 21 navigation destinations render with a correct heading and non-trivial content.
- Role scoping is genuinely enforced in the UI: Schools, Platform readiness, Detection rules, Notification routing and Users & roles are absent from the school workspace and reachable after switching to Superadmin. This remains UI-level scoping only, not authorization.
- The incident sheet opens, renders synthetic media context, and exposes acknowledgement, review and audit-trail controls.
- Media failure handling works correctly. The headless Chromium build lacks proprietary H.264 support, so clips did not decode, and the UI displayed *"The demo clip could not load. Try another scene or reload the page."* — the intended graceful degradation. This is a browser limitation rather than a product defect, but it does surface a small real-world risk: the media is H.264-only, and a WebM/VP9 alternate `<source>` would remove a class of playback failure on Linux and privacy-hardened browsers.

Still not verified: keyboard-only and screen-reader journeys, concurrent multi-user behaviour, and every service that does not exist yet.

---

## 3. What the platform is today

Roughly 18,000 lines across a React 19 / Vite single-page application. There is **no backend of any kind** — a repository-wide search for `fetch`, `localStorage`, `sessionStorage`, `IndexedDB`, `WebSocket` and `EventSource` returns nothing in application code. All state is in-memory React state and resets on refresh.

Twenty-one screens across two workspaces:

- **Operations** — Overview, Attendance & presence, Live cameras, Incidents, Validation queue, Response workspace, Analytics, System health.
- **Concept workspaces** — Safeguarding, Emergency centre, Hostel operations, Movement & visitors, Facilities & health, Activities & continuity, Pilot governance, Platform readiness.
- **Detection** — Detection studio (24-capability register, rule builder, scenario preview, synthetic PoC evaluation with precision/recall/p95).
- **Administration** — Schools, Detection rules, Notification routing, Users & roles.

The engineering is competent. `trialMetrics` computes precision, recall and a nearest-rank p95 correctly and returns `null` rather than a flattering zero on an empty sample. `transitionError` blocks closure before evidence resolution and demands a reason of at least ten characters. `csvCell` neutralises spreadsheet formula injection. Records are school-scoped throughout the concept workspaces.

### Structural risks

- **`app/page.tsx` is 2,907 lines and 107 KB with 40 `useState` hooks in one component.** This is the single biggest maintainability risk in the repository and will resist the backend integration that must come next.
- **Display names are used as relational keys.** `schools` is a `string[]`; incidents, cameras and users reference schools by name. The repository's own backend contract says not to do this. Every school rename or duplicate name is a data-integrity incident waiting to happen, and this must be fixed *before* records become durable, not after.
- **No code splitting.** All 21 screens load eagerly in one 647 KB chunk.
- **English only.** `layout.tsx` sets `lang="en"` and there is no localisation layer, though dates are correctly formatted for `Asia/Kuala_Lumpur`.

---

## 4. Audit findings from this pass

Ranked by consequence. Findings already recorded in earlier audits are not repeated.

### F1 — The UI asserts AI bullying detection with a confidence score. *Critical, product integrity.*

Verified in the browser. Incident AIW-1044 renders "Bullying" with "Detection confidence 78%" and the description "The bullying detector flagged activity in Courtyard." The seed data in `app/data.ts` assigns confidence values of 76–93% to Bullying, Fighting, Violent behaviour, Vandalism and Smoking/vaping. `app/page.tsx` exempts only IDs prefixed `STAFF-` or `SIM-` from the confidence display, so every seeded record shows a score.

This directly contradicts `surveillance-capability-audit.md`, which states that video "cannot establish bullying, intent, blame or repeated abuse" and that such categories belong in reports and review candidates. A demonstration is a claim. Fix the seed data and the display rule so contextual categories never carry a detector name or a confidence percentage.

### F2 — Two contradictory detection taxonomies ship simultaneously. *High.*

`app/data.ts` defines 13 legacy categories including Bullying, Violent behaviour and Littering, exposed through Live cameras, Incidents and Detection rules. `app/surveillance-data.ts` defines the governed 24-capability register that separates Video candidate, Sensor integration and Staff report, each with an explicit limitation and source. Both are live. Detection rules and Detection studio are two unsynchronised configuration screens for the same conceptual thing — the repository documentation acknowledges this but treats it as cosmetic. For a buyer it is not cosmetic: it is two different answers to "what does your AI actually claim to detect?"

Converge on the 24-capability register and retire the legacy taxonomy and the legacy rules screen.

### F3 — No Bahasa Melayu. *High, adoption.*

The responders this product depends on are wardens, guards, canteen supervisors, discipline teachers and parents. A single-language English interface is an adoption ceiling in Malaysian government schools regardless of feature quality, and it undermines the consent and reporting flows specifically, because those are the screens a parent or a 13-year-old actually reads. This is comparatively cheap to fix and gates the value of everything above it.

### F4 — The confidential reporting channel is a tab inside the staff workspace. *High, impact.*

`ReportingPreview` is the component with the strongest external evidence behind it, and it is reachable only by a signed-in staff member navigating to Safeguarding. It also asks the reporter to nominate a named "safe contact" rather than offering genuine anonymity. The evidence base rewards a channel that is separately addressable, usable without a login, anonymous by default and available outside school hours.

### F5 — Bundle and documentation drift. *Medium.*

Bundle up 15% to 199.54 KB gzip with no code splitting; lint findings down from 19 to 8. Both documented figures are wrong in opposite directions. Regenerate these numbers as part of the release checklist rather than by hand.

### F6 — H.264-only demonstration media. *Low.*

Add a WebM/VP9 `<source>` alongside each MP4. The fallback path already works correctly; this removes the need to use it.

---

## 5. Where the technology actually is, September 2026

**Geometric video analytics is mature; social inference is not.** The commercial state of the art — Axis Object Analytics, Avigilon Unity, BriefCam, Hanwha WiseAI, i-PRO scene change — is reliable for line crossing, area entry, dwell, counting, crowd estimation, scene change and slip-and-fall candidates. These are observable geometric events with testable definitions. No credible vendor sells a validated bullying detector, because bullying is defined by repetition, intent and power imbalance, none of which are visible in a frame.

**Vision-language models have changed what is architecturally possible, not what is epistemically knowable.** VLMs now reason over long video, and the deployment pattern that has settled out is a cascade: a cheap always-on edge detector proposes candidates, and a heavier VLM reviews only those candidates, on-site or on-demand. Research systems such as Cerberus apply exactly this cascade to real-time video anomaly detection, and sub-second capture-to-event latency is achievable for perimeter use. The market is growing accordingly, from USD 6.95 bn in 2024 toward a projected USD 38.5 bn by 2034. For AiWAS this matters in one specific way: a VLM can write a *description* of a candidate clip for a human reviewer far better than it can assign a *label*. Use it to brief the adult, not to classify the child.

**Weapon detection is the field's cautionary tale, and it is directly relevant.** In November 2024 the FTC acted against Evolv Technologies over deceptive claims that its AI screening detected all weapons and outperformed metal detectors; the settlement barred unsupported claims and let school districts exit contracts. A New York City subway trial produced 118 false positives across 2,749 scans, recovering twelve knives and no guns. In October 2025 police in Baltimore County approached students with weapons drawn after an Omnilert alert that turned out to be a bag of crisps. AiWAS's own register already marks the blade capability as experimental and Critical. Two consequences follow and should be written into the product, not just the report: an AI alert must never trigger an automated external escalation, and every weapon-class alert must pass through a named human reviewer before any response beyond "an adult goes and looks."

**Privacy-preserving analytics is now practical rather than aspirational.** Pose- and skeleton-only pipelines, recoverable anonymisation that permits authorised reversal, and token-pruned video anonymisation for action recognition are all working research with deployable implementations. AiWAS's non-biometric commitment is therefore technically deliverable and should be made an architectural guarantee — anonymise at the edge before the frame leaves the camera — rather than a policy promise enforced by good intentions downstream.

---

## 6. What the evidence says actually reduces harm

This is the section that should drive the roadmap, because it is where the product's stated purpose and the external evidence meet.

**Anti-bullying programmes work, and cameras are not among the working ingredients.** Meta-analyses put school anti-bullying programmes at roughly a 19–20% reduction in perpetration and 15–16% in victimisation. The components associated with larger effects are a whole-school approach, a written anti-bullying policy, classroom rules, information for parents, informal peer involvement, and structured work with victims. Whole-school interventions show around a 25% reduction in cyberbullying. Every one of those components is a *coordination, record-keeping and communication* problem — which is to say, a software problem, and precisely the software AiWAS is closest to being.

**Confidential reporting channels have the strongest direct evidence of any single intervention a platform can ship.** Students in schools with the Say Something anonymous reporting system reported approximately one fewer violence encounter nine months after launch. Research summarised by the National Institute of Justice finds tip lines break the code of silence and lower violence exposure, and — contrary to the usual objection — that misuse is rare when trust is established. Reporting patterns also carry triage signal: tips submitted while school is out of session are substantially more likely to be life-threatening.

**Structured behavioural threat assessment is the mature casework model.** CSTAG, developed by Dewey Cornell in 2001, has an evidence base spanning more than 23,000 cases. Its core is a five-step decision tree that resolves most transient threats within two steps and reserves full assessment for substantive ones. It is a workflow, a decision tree and a documentation standard — an almost exact fit for what AiWAS already builds well.

**The Malaysian evidence points the same way.** Zara Qairina Mahathir, 13, was found unconscious near a hostel drain at 4 am in July 2025. The signal that existed was a 51-page diary, not a camera frame. Cameras are prohibited in dormitories, bathrooms and changing rooms by MOE policy, and rightly so. The controls that would have mattered are verified warden rounds, roll-call exception escalation to a named duty officer, and a route for a child to tell someone.

---

## 7. Malaysian policy and legal position

**The procurement window is open now.** MOE has allocated RM8 million for phased CCTV installation nationwide, with a further RM3 million for boarding schools and RM5 million added in October 2025. By November 2025, 149 of 200 identified boarding schools had cameras installed. The Home Ministry is studying integration of school CCTV with the PDRM monitoring network for real-time police monitoring. Officials have publicly committed that cameras will not enter dormitory bedrooms, bathrooms or changing rooms, with warden patrols strengthened instead.

Two implications. The addressable problem is not "schools need cameras" — they are getting cameras. It is "schools now have cameras and no operating model, no case record, and no duty-of-care audit trail." That is the gap AiWAS should own. And the proposed PDRM linkage makes the no-automated-external-escalation rule from §5 an architectural requirement, not a preference: a pipeline from an unvalidated AI label to a police response is the single highest-consequence design error available here.

**The legal baseline has moved.** 687 bullying cases were reported between 2022 and June 2025. Penal Code and Criminal Procedure Code amendments effective July 2025 criminalise bullying including cyberbullying; s.507D was applied for the first time in the Zara Qairina case, with five teenagers charged. An Education (Amendment) Bill 2025 has been debated, and "Zara Law" proposals emphasise prevention, education and support systems over punishment.

**PDPA compliance is now a build requirement, not a launch formality.** The Personal Data Protection (Amendment) Act 2024 came into force across three phases in January, April and June 2025. Biometric data is now expressly **sensitive personal data**. Appointment of a Data Protection Officer is mandatory. Breach notification to the Commissioner is mandatory as soon as practicable, with notification to affected individuals where significant harm is likely. Cross-Border Personal Data Transfer Guidelines issued 29 April 2025 require the destination jurisdiction to have substantially similar law or adequate protection, and otherwise a documented Transfer Impact Assessment.

For AiWAS this means: no facial recognition or biometric templates on minors, full stop; a named DPO and a breach register before any real record enters the system; Malaysian data residency as the default, with a TIA on file for any processing that leaves the country; and enforced retention with logged deletion rather than a retention field a user types into.

**Integrate with MOE systems rather than duplicating them.** MOEIS is the centralised platform, APDM handles attendance and student profile data, and SSDM has been deliberately restored to recording only misconduct and disciplinary action. Double data entry is the most reliable way to lose teachers. AiWAS should import attendance from APDM rather than maintain a parallel register, and export disciplinary outcomes into SSDM's restored scope. Where no API is available, ship exact-format CSV import/export against those schemas — this is achievable now and is worth more to a school than any additional detector.

---

## 8. Improvement roadmap, ranked by impact for schools

### Tier 1 — highest impact, mostly independent of cameras

**1. Promote confidential reporting to a first-class product surface.** A separate URL and QR code, no login, genuine anonymity as the default with an optional contact, Bahasa Melayu and English, mobile-first, available outside school hours. Add a reference code the reporter can use to follow up without deanonymising, a triage SLA with an acknowledgement timer, and routing to a duty roster rather than a single named person. This is the best-evidenced feature available, it works in every school regardless of camera coverage, and it addresses the failure mode in the Zara case directly.

**2. Add a CSTAG-shaped safeguarding and threat-assessment workflow.** A transient-versus-substantive decision tree, a multidisciplinary team record, documented protective actions, supportive rather than purely punitive outcomes, and mandatory review dates with reminders. AiWAS's staged-record engine already does most of the mechanical work; what is missing is the decision tree and the clinical discipline of the model. This converts the platform from an alert dashboard into the school's duty-of-care record — which is the thing the Education (Amendment) Bill environment will require schools to produce.

**3. Integrate with APDM, SSDM and MOEIS.** Attendance import rather than a parallel register; discipline export within SSDM's restored misconduct-only scope. Ship CSV in the exact schema now; add APIs when available. Eliminating double entry is the highest-leverage adoption work in the entire roadmap.

**4. Ship Bahasa Melayu.** Full interface localisation, with the pupil, parent and consent flows treated as the priority path and reviewed by a native speaker rather than machine-translated.

**5. Harden hostel night supervision to the real failure mode.** Time- and location-stamped warden round verification (QR or NFC checkpoints, since dormitory cameras are correctly prohibited), roll-call exceptions that escalate to a named duty officer on an acknowledgement timer, and a welfare-concern log a resident can write into privately. AiWAS has the hostel workspace; make the rounds and the escalation real rather than recorded.

### Tier 2 — makes the detection story credible

**6. Resolve F1 and F2.** Remove confidence scores and detector language from contextual categories; converge on the 24-capability register; merge Detection rules into Detection studio.

**7. Build acknowledgement and escalation as infrastructure.** Delivery receipts, acknowledgement timers, automatic escalation to the next role on timeout, and a full delivery audit trail. Whether an alert helps depends almost entirely on this layer, and it does not exist today.

**8. Make coverage availability a headline safety metric.** Unavailable-camera-minutes per zone per day, on the System health screen, with automatic fallback patrol tasking. A dark camera must never read as a quiet corridor.

**9. Enforce the evidence lifecycle in code.** Candidate → confirmed → retained, with unconfirmed material auto-deleted on a timer and every deletion logged. This is what the MOE-facing privacy commitment actually requires, and it is currently a text field.

**10. Commit to the cascade architecture explicitly.** Edge anonymisation before frames leave the camera, pose- or metadata-only transport where the capability allows, VLM review used to *describe* candidates for human reviewers rather than to label children, Malaysian residency by default, and a documented TIA for anything that crosses a border.

### Tier 3 — engineering debt that blocks any real pilot

**11.** Backend with server-enforced authentication, authorization and tenant isolation. **12.** Durable storage with UUID keys — fix the display-name-as-key problem before records become permanent. **13.** Append-only audit log and concurrency control. **14.** Split `app/page.tsx` and introduce route-level code splitting. **15.** A mobile responder surface with push notifications, because teachers and wardens are not at desks. **16.** PDPA operational artefacts: named DPO, per-capability DPIA, breach register and notification runbook, enforced retention schedule, TIA. **17.** Clear the remaining 8 lint findings and run genuine keyboard and screen-reader QA.

---

## 9. What not to build

Stated plainly, because the pressure to add these will come from the market rather than from the evidence.

- **Facial recognition, identity watchlists or appearance search on minors.** Biometric data is sensitive personal data under the amended PDPA, and MOE's stated position excludes biometrics. This is a legal and reputational dead end.
- **Emotion, mental-health, distress or violence-prediction inference from video.** No validated basis exists. Wellbeing belongs in the confidential support pathway, where AiWAS already correctly places it.
- **Automated escalation from an AI alert to police.** Especially given the proposed PDRM linkage. Baltimore County shows the failure mode, and the failure lands on a child.
- **Gaze or posture-based cheating classifiers.** Exam integrity is an invigilation process with an appeal route.
- **Cameras in dormitories, bathrooms or changing rooms.** Prohibited by MOE policy and correctly so; verified human rounds are the answer.
- **Aggregate accuracy claims such as "80% now, 90% target."** They have no dataset, denominator, confusion matrix or operating conditions behind them. Publishing them is the specific behaviour the FTC sanctioned.

---

## 10. Measurement commitments before any live pilot

Per capability, agreed in writing *before* results are reviewed: the observable event definition, explicit exclusions, camera and lighting requirements, ground-truth method, escalation owner, and an acceptance threshold. Then measure precision, recall, false alerts per camera-hour, unavailable-coverage minutes, end-to-end latency from capture to acknowledgement, delivery failure rate, duplicate-event rate, and the proportion of alerts with usable evidence. Report "Not measured" wherever there is no denominator — the Detection studio already does this correctly and that behaviour should be preserved as the house standard.

Start in supervised observation mode, compare against trained staff, then approve capabilities individually per camera and zone, with a pre-agreed rollback trigger for excessive false alarms, missed critical events or unacceptable privacy impact.

---

## Sources

Consulted 12 September 2026. Vendor documentation establishes that a capability is marketed, not that it is independently validated or available in Malaysia.

**Malaysian policy and law**
- [Home Ministry studying plan to link school CCTV with police network](https://api.nst.com.my/news/nation/2025/10/1305197/home-ministry-studying-plan-link-school-cctv-police-network) — New Straits Times
- [Education Ministry spends RM8 mln on phased CCTV installation in schools nationwide](https://dayakdaily.com/education-ministry-spends-rm8-mln-on-phased-cctv-installation-in-schools-nationwide/) — DayakDaily
- [MOE adds RM5m for school CCTVs, rolls out safety and discipline reforms](https://www.malaymail.com/news/malaysia/2025/10/22/moe-adds-rm5m-for-school-cctvs-rolls-out-safety-and-discipline-reforms/195497) — Malay Mail
- [149 of 200 schools fitted with CCTV as govt ramps up fight against bullying](https://www.malaymail.com/news/malaysia/2025/11/12/education-deputy-minister-149-of-200-schools-fitted-with-cctv-as-govt-ramps-up-fight-against-bullying/198110) — Malay Mail
- [CCTV in schools will not compromise student privacy, Deputy Minister says](https://www.thevibes.com/articles/news/115427/cctv-in-schools-will-not-compromising-student-privacy-deputy-minister-says) — The Vibes
- [Charges in Zara Qairina's case are the first under Malaysia's new anti-bullying law](https://www.malaymail.com/news/malaysia/2025/08/21/saifuddin-nasution-charges-in-zara-qairinas-case-are-the-first-under-malaysias-new-anti-bullying-law/188373) — Malay Mail
- [MPs raise concerns over school safety after Zara Qairina's death](https://www.bernama.com/en/general/news.php?id=2451237) — Bernama
- [MoE restores Student Discipline System, eases teacher workload](https://www.nst.com.my/news/nation/2025/11/1306476/moe-restores-student-discipline-system-eases-teacher-workload) — New Straits Times

**Data protection**
- [Implementation of the Personal Data Protection (Amendment) Act 2024](https://www.dfdl.com/insights/legal-and-tax-updates/malaysia-implementation-of-the-personal-data-protection-amendment-act-2024/) — DFDL
- [Guidelines issued on data breach notification and DPO appointment](https://privacymatters.dlapiper.com/2025/03/malaysia-guidelines-issued-on-data-breach-notification-and-data-protection-officer-appointment/) — DLA Piper
- [Personal Data Protection Guidelines on Cross-Border Transfer of Personal Data](https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-guidelines-on-cross-border-transfer-of-personal-data-cbpdt/) — Jabatan Perlindungan Data Peribadi
- [Malaysia's cross border data transfer guidelines explained](https://www.hoganlovells.com/en/publications/malaysias-groundbreaking-cross-border-data-transfer-guidelines-explained) — Hogan Lovells

**Effectiveness evidence**
- [Effectiveness of school-based programs to reduce bullying perpetration and victimization: updated systematic review and meta-analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8356322/) — Campbell/PMC
- [What works in anti-bullying programs? Analysis of effective intervention components](https://pubmed.ncbi.nlm.nih.gov/33715780/) — Journal of School Psychology
- [Systematic review and meta-analysis of whole-school interventions](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11807013/) — PMC
- [Tip lines can lower violence exposure in schools](https://nij.ojp.gov/topics/articles/tip-lines-can-lower-violence-exposure-schools) — National Institute of Justice
- [Implementing a school tip line? New research provides a blueprint](https://nij.ojp.gov/topics/articles/implementing-school-tip-line-new-research-provides-blueprint) — National Institute of Justice
- [Bullying, suicide, substance use and mass harm: patterns in a statewide anonymous reporting system](https://pmc.ncbi.nlm.nih.gov/articles/PMC13198468/) — PMC
- [Comprehensive School Threat Assessment Guidelines](https://education.virginia.edu/research-initiatives/research-centers-labs/research-labs/youth-violence-project/school-threat-assessment/comprehensive-school-threat-assessment-guidelines) — University of Virginia

**Technology and market**
- [FTC takes action against Evolv Technologies for deceiving users about its AI-powered security screening](https://www.ftc.gov/news-events/news/press-releases/2024/11/ftc-takes-action-against-evolv-technologies-deceiving-users-about-its-ai-powered-security-screening) — Federal Trade Commission
- [As more schools turn to AI weapons detection, questions persist](https://undark.org/2026/02/13/as-more-schools-turn-to-ai-weapons-detection-questions-persist/) — Undark
- [Can AI keep schools safe? False alarms and blind spots raise doubts](https://www.azfamily.com/2026/08/27/can-ai-keep-schools-safe-false-alarms-blind-spots-raise-doubts/) — AZFamily
- [Cerberus: real-time video anomaly detection via cascaded vision-language models](https://arxiv.org/pdf/2510.16290) — arXiv
- [Vision-language models for edge networks: a comprehensive survey](https://arxiv.org/pdf/2502.07855) — arXiv
- [Privacy-aware video deanonymization: a configurable pipeline for selective reversal](https://www.sciencedirect.com/science/article/pii/S221421262500403X) — ScienceDirect
- [Recoverable anonymization for pose estimation](https://arxiv.org/abs/2409.02715) — arXiv
- [Vision-language models for video surveillance](https://visionplatform.ai/vision-language-models-for-video-surveillance/) — VisionPlatform

Earlier internal reports remain valid and are not superseded: [system audit and user journeys](../system-audit-and-user-journeys.md), [surveillance capability audit](surveillance-capability-audit.md), [Malaysian school safety study](malaysian-school-safety-study.md), [audit test results](../audit-test-results.md).
