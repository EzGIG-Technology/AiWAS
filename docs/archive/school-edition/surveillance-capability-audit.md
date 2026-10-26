# AiWAS school surveillance capability audit

Current scope update (12 September 2026): Facilities & health has since been removed at the product owner’s request. Campus insights now covers camera-derived operational analytics. Historical descriptions below reflect the earlier delivery; see research/campus-camera-value-study.md for the current direction.

## Executive assessment

AiWAS should treat video analytics as a way to direct adult attention to observable events, then combine that observation with school records, reliable communications and documented human decisions. The strongest near-term expansion is operational: boundary entry, movement flow, congestion, prolonged presence, possible falls, obstructions and camera availability. Sensitive conclusions such as bullying, truancy, theft, cheating or mental-health risk require contextual investigation. They should not become automatic labels attached to children.

The JPN NS AIWAS presentation contains a broader programme than a detection dashboard. Its proposed pilot includes institutional approvals, voluntary participation, written consent in one version of the conditions slide, infrastructure integration, training, evidence governance and evaluation. The updated frontend now represents these through a Pilot governance workspace and a Detection studio, alongside the existing school operations and administration views. These are interactive demonstration workflows; no camera inference, biometric processing, remote notification or durable evidence service has been commissioned.[^1]

This review covers eight representative commercial product families and two research papers. It is a public-document capability assessment, not an exhaustive inventory of every surveillance product worldwide or a hands-on procurement benchmark. Sources were checked on 12 September 2026. A vendor describing a feature establishes that it is marketed or documented; it does not establish independent accuracy, Malaysian availability, suitability for children, compatibility with the school's cameras or successful integration into AiWAS.

## Presentation requirements and unresolved issues

The source has 34 PDF pages. Several printed slide numbers differ from the physical PDF page numbers, and some slides are repeated. The following references use physical PDF pages. Company background, partner logos and general marketing claims are not product acceptance criteria. The deck is treated as supplied project material, not as a verified government directive.[^1]

**Detection and review.** Pages 15–18 describe anonymous movement, spatial analysis, congestion, continuous observation and alerts. Page 25 groups littering and cheating as low severity, truancy and smoking as medium, and theft, vandalism, bullying, fighting, violence and system interruption as high. Page 26 leaves disciplinary decisions with administrators. The UI therefore exposes each category, but represents categories that require contextual judgment as reports or review candidates rather than autonomous findings. A high default priority is a routing preference, not an assertion that a crime occurred.

**Institutional participation.** Pages 12 and 13 both state no cost to schools or parents and voluntary participation. Page 12 also requires written parental consent; the repeated page 13 omits that condition. Omission should not silently become permission to bypass consent. Pilot governance includes participation states of pending, recorded, declined and withdrawn, with a field for the non-participation arrangement. This screen records the process; it does not solve how a real camera deployment respects a pupil's non-participation.

**Approval scope.** The photographed letters on page 11 are excerpts. The visible June letter refers to schools in Kuala Lumpur, while the presentation proposes Negeri Sembilan expansion. The December excerpt refers to conditions in an appendix not reproduced in full. These images cannot establish that all approvals for the proposed Negeri Sembilan deployment are complete. The interface now provides JPN, PPD, principal and PIBG reference fields and a pending selection status, without asserting endorsement or completed approval.

**Privacy and identity.** Page 22 excludes biometrics and limits surveillance to public spaces. It also describes immediate conversion to anonymous metadata. Page 26 separately says only confirmed-incident recordings are retained and ordinary material is disposed of. Those statements require an explicit design for temporary candidate evidence, confirmation, retention and deletion. An anonymous track number does not itself remove identifying information from raw video. The UI preserves the biometric exclusion and restricts the studio's camera-zone selector to public areas, but backend privacy enforcement remains unimplemented.

**Architecture and commercial scope.** Page 23 presents existing CCTV, third-party upgrades and Micropay upgrades that may carry cost. Pages 29–30 describe a fully funded pilot. A written scope must distinguish included pilot equipment from optional upgrades. Cloud/on-premise language also needs reconciliation with the earlier central-processing PRD before implementation. The new commissioning and funding records capture these decisions instead of choosing an architecture by implication.

**Budget arithmetic.** Page 29's seven priced rows sum to RM41,900 per school and RM125,700 for three schools. Page 30's four rows instead sum to RM119,260: RM54,630 + RM36,420 + RM18,210 + RM10,000. This is RM6,440 below its displayed RM125,700 total. Its 45/30/15/10 percentage labels are not consistent with those amounts and the displayed total. This is a document reconciliation issue, not a software feature, and remains in this report rather than the operational UI.

**Dates and effectiveness.** The deck combines an approval window, a three-month sequence and calendar milestones that should be reconciled in a signed plan. Its 80% current and 90% target figures on page 25 have no accompanying dataset, denominator, confusion matrix or operating conditions. They must not be published as measured AiWAS performance. The global impact percentages on page 20 also lack a precise study citation in the deck. Neither those figures nor the page 9 news and legal assertions are used as verified evidence in this assessment.

## Representative market comparison

| Product family | Relevant documented capability | Implication for AiWAS | Evidence boundary |
| --- | --- | --- | --- |
| Axis Object Analytics | Area entry, line crossing, dwell, counts and tailgating | Configurable event rules and explicit zone assumptions | Installation, visibility and lighting affect results; camera compatibility matters.[^2] |
| Avigilon Unity | Crowd analytics, audio events and visible-firearm detection | Separate event types and human verification | The referenced Unity page identifies firearm detection as US-only; no Malaysian availability is inferred.[^3] |
| BriefCam | Crowd estimation, movement analytics and investigation support | Occupancy and queue review can support daily operations | Aggregate observations do not establish individual attendance; the site notes the transition to Milestone.[^4] |
| Hanwha Vision WiseAI | Slip-and-fall detection, with installation and limitation guidance | Add a possible-fall welfare route | Product-specific geometry, duration and visibility must be tested locally.[^5] |
| i-PRO scene change | Persistent changes, including doors and objects left behind | Obstruction, held-open door and object-change workflows | A change is not proof of theft, danger or intentional damage.[^6] |
| Omnilert | Visual detection of exposed firearms and response coordination | Treat weapons as urgent candidates with separate evaluation | Firearm detection does not establish knife detection or concealed-weapon coverage.[^7] |
| HALO Smart Sensor | Environmental and vaping-related alerts in camera-free areas | Model vape events as sensor integrations | Sensor events do not identify a pupil; installation and nuisance sources need review.[^8] |
| Verkada | People analytics and investigation filters | Search and event review are relevant workflow patterns | The reviewed identity/appearance features are not adopted under AiWAS's non-biometric scope.[^9] |

Bosch AVIOTEC is an additional specialist fire-detection reference, rather than a general human-surveillance platform. It supports the decision to represent fire alerts as a specialist integration instead of implying that an ordinary school camera is an approved fire alarm.[^10]

The comparison does not recommend copying every vendor feature. Facial search, apparent-sex filters and identity watchlists are unnecessary for the current anonymous-event concept. Similarly, a broad natural-language alert interface would still need a tested event definition, acceptable operating conditions and error analysis. Making a prompt easy to write does not make its output reliable.

Research reinforces the distinction between a candidate event and a validated service. The 2022 DangerDet school paper reports results on its own dataset and discusses confusing postures and limited datasets; this is evidence of research feasibility, not a production accuracy guarantee for AiWAS.[^11] CCTV-Gun specifically studies handgun detection under surveillance conditions, illustrating why object size, image conditions and generalisation need separate evaluation. It provides no validation of a blade detector in Malaysian schools.[^12]

## Recommended detection scope

### Observable activity in public areas

Boundary entry is useful where there is a real restricted boundary, an active schedule and an adult able to respond. The rule should identify a crossing event, not declare the person an intruder. The same principle applies to prolonged presence: the relevant question is whether the location needs a welfare or access check, not whether someone's behaviour is intrinsically suspicious.

Flow monitoring can support assembly release, canteen queues and dismissal. Counts should be displayed as estimates from a known view. Entry-minus-exit totals can drift when access points are unobserved or crossings are missed. They must not be treated as a pupil register or an evacuation headcount. Anonymous analytics and named attendance reconciliation therefore remain separate workflows.

Close-following through an entrance is only useful when the school can distinguish authorised group entry from a controlled-access exception. One-way movement alerts likewise depend on an active one-way operating plan. During a festival, evacuation or authorised event, the ordinary schedule may be inappropriate. The studio includes schedule and persistence fields to demonstrate these dependencies, but its saved rules do not execute an actual schedule engine.

### Welfare and possible violence

A possible fall or person-down signal should direct a first-aid or welfare check. Sitting on the ground, sport, stretching and partially obscured bodies are important negative examples. A single image cannot reliably distinguish an injury from normal activity. Video duration, pose visibility and the availability of staff matter as much as the detector name.

Physical altercation detection should use neutral language. Rapid close interaction may warrant attention but does not establish a bully, victim, motive or repeated pattern. The safeguarding record can combine reviewed footage with reports and follow-up. Automated discipline, blame assignment and permanent person-risk scores remain excluded.

Visible blades deserve attention because of the original school-safety concern, but are an experimental candidate requiring an independent test set. School tools, sports equipment, phones and inert props can create ambiguity. Concealed weapons are outside the visual task. Firearm detection must also be assessed separately; neither a marketed firearm model nor a handgun benchmark validates knives. The studio therefore creates an unverified high-priority scenario and makes no inference from the sample clip.

### Environment and operational safety

Scene-change review can help staff find blocked routes, unattended items, removed equipment or doors left open. These are prompts for inspection. A removed object might have been moved by a cleaner; a bag may belong to someone nearby; an obstruction may be temporary and supervised. Operational context must be recorded before a disciplinary category is confirmed.

Camera obstruction, view shift and stale capture timestamps deserve their own service-health events. A failed feed should never be shown as a quiet, safe location. The studio's unavailable outcome deliberately produces a coverage warning instead of a normal result. Production implementation would need a timestamp-based freshness service, a fallback patrol plan and measured restoration times.

Fire, air quality and vaping need a suitable source. Environmental alerts should preserve the distinction between a sensor reading, a reviewed safety concern and evidence of an individual's conduct. Private-space cameras are not introduced to compensate for a missing sensor. A real sensor procurement would require a separate privacy and technical assessment, even when the device is marketed as camera-free.

### Concerns that require reports and records

Cheating remains an invigilator concern with an evidence and appeal process. No gaze or posture classifier is enabled. Unexplained absence remains a reconciliation task using the attendance register, approved leave and verified collection information. Anonymous crowd totals cannot answer whether a named pupil left school.

Mental-health and wellbeing concerns enter the confidential support pathway. The UI does not infer depression, distress, intent or future violence from faces or movement. Substance support is similarly a welfare and safeguarding workflow, not a visual diagnosis. This preserves the useful human response without pretending that every issue in the presentation is visually detectable.

## Pilot acceptance and evaluation design

Before enabling a real detector, define its observable event, exclusions, camera requirements, ground truth, escalation owner and acceptable operating envelope. Different classes require different evidence. A crowd threshold, an obstructed exit and a possible weapon cannot share one unexplained confidence score or a single aggregate acceptance percentage.

A labelled evaluation should include legitimate activities as well as target events. Tests should be stratified by school, camera, lighting, weather, crowding, occlusion and activity context. Use safely staged scenarios with appropriate adult participation where practical. Do not stage dangerous events around pupils merely to test a model. Production reports should distinguish training data, calibration data and held-out evaluation data.

Record true positives, false positives, false negatives and true negatives. Precision answers what fraction of raised alerts were correct; recall answers what fraction of actual events were detected. The new UI calculates both from explicitly entered synthetic trials, and shows “Not measured” where there is no denominator. It also shows the sample count, preventing an empty dataset from appearing perfect. These demonstrations do not constitute an independently labelled benchmark.

Measure latency from image capture, through ingestion and candidate creation, to staff notification and acknowledgement. The current ten-second preview illustrates capture-to-alert experience only. Persistence time is a separate event rule; communications and staff response add further time. The evaluation UI calculates a nearest-rank p95 from entered true-positive alert latencies, while missed events remain in recall rather than disappearing from the assessment.

A real pilot should also report false alerts per camera-hour, unavailable coverage minutes, delivery failures, acknowledgement time, duplicate-event rate and the proportion of events with usable evidence. These exposure-based metrics need reliable camera and messaging telemetry and are not fabricated in the frontend. They remain backend acceptance work.

Start in supervised observation mode, compare results with trained staff, then approve specific capabilities per camera and zone. There should be a rollback decision for excessive false alarms, missed critical scenarios or unacceptable privacy impact. An evaluation target must be agreed before results are reviewed; choosing a target retrospectively undermines the assessment.

## Implemented UI journeys

**Detection studio** exposes 24 capabilities with a type, priority, observable signal, limitation, response plan and source. Search and type filters narrow the catalogue. A rule can be saved with a public zone, priority, illustrative threshold, persistence, schedule and responsible team. Invalid rules are rejected. The preview can create a candidate, show no candidate or mark coverage unavailable; the candidate opens in the existing incident review flow.

**PoC evaluation** accepts synthetic ground truth, alert outcome, latency and environmental condition for the selected school and capability. Results recalculate from the entered records. A trial can be removed and the current cohort exported as CSV. No trial is presented as an observation from a real model, and one school's records are not included in another school's metrics.

**Pilot governance** contains nine record types: institutional approvals; participation and parental consent; CCTV compatibility; public-area privacy assessment; funding reconciliation; staff training; pilot milestones; evidence retention and disposal; and authority-routing agreements. Each uses the shared staged record workflow, owner, due date, notes, structured fields, checklist and audit history. Completion records a demonstration outcome, not external authorisation.

**Platform coverage** locates the relevant product workflows without showing presentation titles, PDF references, slide numbers, document discrepancies or unverified baseline figures. JPN remains only as a relevant institutional participant. The full source comparison is retained in this report.

Existing local synthetic media is reused as context. A canteen scene illustrates crowd review, a perimeter scene illustrates boundary coverage, an inspection scene supports facilities work and the training clip shows an inert blade prop. These are animated stills, not functioning demonstrations of all 24 detectors. There is no firearm footage, live feed or generated claim of actual detection.

## Production work still required

The frontend does not provide durable storage, authenticated school isolation, actual CCTV ingestion, validated inference, notification delivery, evidence encryption or retention enforcement. Rule changes and trial records reset on refresh. The existing role picker is a navigation preview, not a security boundary. These limits also apply to the newly added governance screens.

The studio's scenario incident is a standalone record in the existing queue. Its saved rule is not synchronised with the earlier Detection rules screen, which remains a separate demonstration. Pilot-governance approvals do not technically activate or disable detectors, and their completion is not a substitute for commissioning gates. Staff-entered evidence references are text, not uploaded or verified documents.

The practical next implementation sequence is to resolve the source scope, define a backend event contract, implement tenant access and retention, connect one camera and one notification route, then evaluate a small set of observable events. Expand after the evidence supports it. A polished UI can explain the intended service, but cannot replace field validation or operational responsibility.

## Sources

[^1]: Micropay Berhad, *JPN NS AIWAS.pdf*, proposal dated 17 July 2026, supplied locally, 34 PDF pages. Relevant pages: 10–13, 15–26 and 28–34. Reviewed as supplied; authenticity, full appendices and approval scope not independently verified.
[^2]: Axis Communications, [AXIS Object Analytics — User manual](https://help.axis.com/en-us/axis-object-analytics), current online manual, accessed 12 September 2026.
[^3]: Motorola Solutions / Avigilon, [Avigilon Unity on-premise managed video security](https://www.avigilon.com/vms/on-premise), current product page, accessed 12 September 2026.
[^4]: BriefCam / Milestone, [Crowd management solutions](https://www.briefcam.com/solutions/crowd-management/), accessed 12 September 2026; site includes a notice about its Milestone transition.
[^5]: Hanwha Vision, [Slip and fall detection: White paper and installation guide](https://www.hanwhavision.com/wp-content/uploads/2026/01/White-Paper_Slip-and-fall-detection.pdf), January 2026, 11 pages. Retrieved from the vendor PDF; accessed 12 September 2026.
[^6]: i-PRO, [i-PRO introduces AI scene change detection capability](https://i-pro.com/products_and_solutions/en/surveillance/newsroom/i-pro-introduces-industrys-first-ai-scene-change-detection-capability), product announcement, accessed 12 September 2026. Older announcement; current device support requires confirmation.
[^7]: Omnilert, [What is visual gun detection? Technology, training, and impact](https://www.omnilert.com/blog/what-is-visual-gun-detection-technology-training-and-impact), vendor explanation, accessed 12 September 2026.
[^8]: HALO Smart Sensor, [Vape detector and safety sensor](https://halodetect.com/), current product site, accessed 12 September 2026.
[^9]: Verkada, [People Analytics](https://help.verkada.com/verkada-cameras/analytics/people-analytics), current help documentation, accessed 12 September 2026.
[^10]: Bosch Building Technologies, [Video-based fire detection / AVIOTEC](https://catalog.boschbuildingtechnologies.com/lifesafetysystems/en/Video-based-Fire-Detection/c/22570758923), current product catalogue, accessed 12 September 2026.
[^11]: Huayi Zhou, Fei Jiang and Hongtao Lu, [Student Dangerous Behavior Detection in School](https://arxiv.org/abs/2202.09550), 2022, version 2 revised 4 June 2022. Research dataset results, not an AiWAS benchmark.
[^12]: Srikar Yellapragada et al., [CCTV-Gun: Benchmarking Handgun Detection in CCTV Images](https://arxiv.org/abs/2303.10703), 2023, version 3 revised 11 July 2023.
