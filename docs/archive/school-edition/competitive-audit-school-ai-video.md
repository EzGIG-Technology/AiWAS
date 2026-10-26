# Competitive audit: school AI video and safety platforms

Date: 13 September 2026. Scope: the vendors a Malaysian school or JPN would realistically be shown alongside AiWAS, what they actually ship, which of their patterns are worth adopting, and where AiWAS is currently weakest.

Method: public product pages, product-update notes, buyer guides, press coverage and litigation/regulatory records, consulted 13 September 2026. A vendor describing a feature establishes that it is marketed, not that it is independently validated, available in Malaysia, or suitable for children. Two vendor domains were unreachable from this environment; those entries rely on secondary coverage and are marked.

---

## 1. The market is not a camera market

The single most important finding is structural. Schools are not buying detectors. They are buying **a bundle that covers the whole incident lifecycle**, and the vendors winning are the ones consolidating it.

Navigate360 sells visitor management, emergency management, panic buttons and wearables, digital hall passes and site mapping as one platform, priced at roughly **USD 8,000 against USD 15,245 for the equivalent standalone tools**. Raptor spans visitor and volunteer screening, emergency preparation, panic alerting, movement, accountability, reunification, wellbeing, threat assessment and training compliance. The pitch is not "better AI". It is "one vendor, one login, one invoice, and your compliance paperwork comes out the other end."

AiWAS today is a detection-and-review product with governance records attached. Against that bundle it reads as one component, not a platform. That is the gap that matters commercially, and — as the September audit already found from the evidence side — most of the missing pieces are not AI features at all.

The category has six distinct segments. AiWAS competes, partially, in one.

| Segment | Representative vendors | AiWAS position |
|---|---|---|
| AI-native VMS / video intelligence | Verkada, Rhombus, Ambient.ai, Spot AI, Eagle Eye, Coram, Scylla | Partial — register and review flow exist, no ingestion |
| Weapons detection as a service | ZeroEyes, Omnilert, Evolv | Absent — blade capability is experimental and unmonitored |
| K-12 safety suite | Raptor, Navigate360, CrisisGo | Absent — no drills, accountability or reunification |
| Emergency alerting and incident mapping | CENTEGIX, GeoComm | Partial — new 3D map, no alerting or responder handoff |
| Confidential reporting | STOPit, Sandy Hook Say Something | Partial — preview only, not a standalone channel |
| Digital / device monitoring | Gaggle, GoGuardian Beacon, Lightspeed Alert | Deliberately absent — see §5 |

---

## 2. What the leaders actually ship

### Verkada — the feature pace-setter
Its February–April 2026 releases are the clearest statement of where the category is going. **Activity Detection Alerts** distinguish routine motion from fence climbing and slip-and-fall. **Fighting detection** shipped to all organisations on 20 February 2026. **Loud noise alerts** use onboard camera microphones. **LPR zones** compute site occupancy, which vehicles are present and dwell times across car parks. **Compound Alerts** combine multiple conditions so an event fires only when motion *and* attribute criteria are met together — the marketed example is loitering near heavy machinery without PPE. **AI Unified Timeline** reconstructs a person's or vehicle's whole journey across a property, and now blends facial analytics with appearance signals where face detection is enabled. **Verkada Guest** screens visitors against sex-offender and criminal databases. Notably, **people analytics is off by default** and must be enabled per device by an authorised user. *(Vendor domain unreachable from this environment; sourced from product-update coverage.)*

### ZeroEyes — human verification as the product
The AI never talks to the school. A candidate image goes to the **ZeroEyes Operations Center**, staffed 24/7/365 by military and law-enforcement veterans, who confirm a real firearm before anything is dispatched. Verified alerts reach responders in **three to five seconds** carrying a visual description, gun type and last known location. The company also released an **off-network** deployment in April 2026. The product being sold is not the model; it is the guarantee that a human looked before anyone was alarmed.

### Raptor — the incident lifecycle, fully covered
**Visitor management** screens visitors, contractors, guardians and volunteers against sex-offender registries in all 50 states plus custom district lists for custody orders and banned visitors. The **Emergency Management Suite** has four parts: **Drill Manager** (schedule, run and document drills with live dashboards, compliance tracking and after-action reporting), **emergency alerting**, **Accountability** (teachers account for students, staff and visitors in real time during an emergency, with status and location immediately visible and adjustable), and **Reunification** (verified student release and family communication). Plus behavioural threat assessment casework and training compliance.

### CENTEGIX — the panic layer, and the map
**CrisisAlert** is a wearable staff badge on a private managed network that works without Wi-Fi or cellular, deliberately designed for use when fine motor skills fail. A staff alert summons local responders; a campus-wide alert triggers strobes, intercom announcements and computer screen takeovers. Critically, it **sends a digital map to first responders with the exact floor and room, and every safety asset near the alert**. GeoComm sells the same idea as indoor mapping for police, fire and SWAT.

### Ambient.ai and Spot AI — the VLM layer
Ambient.ai positions as an agentic physical-security platform with edge-optimised vision-language models, 200+ ONVIF camera support, a cloud SOC, **semantic search** (natural-language video querying), PACS visual previews and operational analytics. Spot AI is camera-agnostic via a hybrid recorder that brings legacy analogue DVRs into an AI layer, adding searchable video and automatic incident clip generation. Both confirm the cascade architecture the September audit recommended.

### Securly Pass — the honest answer to "where are the students"
A digital hall pass across **12,000 schools and 8.6 million students**. Students request a pass; an adult or the system approves it; the live dashboard shows **who is out of class, where they are headed and how long they have been gone**, and the pass stays open until an authorised adult confirms arrival rather than expiring on a timer. It manages tardies and can **prevent specified students from being in hallways at the same time** — a safeguarding control for keeping a victim and an alleged bully apart. Philadelphia rolled it district-wide in August 2026.

### Transport — a segment AiWAS ignores entirely
Illegal stop-arm passings reached **43.5 million** a year in the US, and 26 states now allow camera enforcement. BusPatrol's AVA engine claims 30% better stop-arm detection than the human eye; Safe Fleet's predictive system scans 1,000 feet across three lanes and gives a spoken warning 3–4 seconds before danger. Coram markets **facial recognition to verify which student boarded and alighted at each stop** — a capability AiWAS refuses, and should say so out loud, because Malaysian school transport is a real and under-served risk.

---

## 3. What to take — ranked by impact on a Malaysian school

**1. A verification desk. (Adopt the ZeroEyes model, not its detector.)**
Every critical-class candidate should pass a named human reviewer before anything leaves the building, with the review time recorded. This is the strongest idea in the category, it is the exact opposite of the Evolv failure mode, and it turns AiWAS's weakest claim — unvalidated detection — into its safest one. It also fits Malaysia's PDRM-linkage proposal: a monitored desk is the control that makes police notification defensible.

**2. Emergency accountability and reunification. (Raptor.)**
Teachers marking students accounted-for from a phone during an evacuation, roll-up by class and zone, exceptions escalating to a named officer, then a verified-release reunification flow. This is the *real* "where is everyone" workflow, it needs no camera, and the 3D map already built is the natural display surface for it. Highest-value single addition.

**3. Drill Manager. (Raptor.)**
Schedule, run, time and document drills with after-action reports and compliance tracking. Malaysian schools already run fire and flood drills; nothing currently records them. This is cheap to build, generates recurring institutional value, and produces exactly the evidence an Education (Amendment) Bill environment will demand.

**4. Responder handoff from the 3D map. (CENTEGIX / GeoComm.)**
The map exists. Add: share-to-responder view, zone-precise location on an alert, safety assets (hydrants, AED, isolation points, muster points) as a layer, and a printable plan. Without this the map is an internal dashboard; with it, it is the artefact that reaches the people arriving at the gate.

**5. Digital hall pass. (Securly.)**
Consented, purposeful, student-initiated movement records — the legitimate source for the map's observation layer, replacing generated placement with real data. The "keep these two students apart" rule is a genuine safeguarding control that no camera can provide.

**6. Confidential reporting with two-way anonymous messaging and evidence attachment. (STOPit.)**
The September audit already ranked this first on evidence. STOPit shows the shape: mobile, no account, image/video attachment, anonymous two-way messenger so staff can ask a follow-up question without deanonymising, and a route to crisis support. AiWAS has a preview; it needs the product.

**7. Compound alerts. (Verkada.)**
Rule composition in the Detection studio: fire only when conditions co-occur. It cuts false alerts more effectively than raising a single threshold, and it is a small change to an existing screen.

**8. Bounded semantic search. (Ambient.ai.)**
Natural-language search over *event metadata and case records* — not over raw video of children. "Show every crowding candidate at the canteen gate between 10:00 and 10:30 last week" is useful and safe. Free-text search over footage of pupils is not.

**9. Visitor and contractor management, non-biometric.**
Pre-registration, QR passes, host notification, banned-person and custody-order lists held by the school, contractor permit checks. Raptor's registry screening does not transfer to Malaysia, but custody orders and banned-visitor lists absolutely do.

**10. Off-network / on-premise deployment. (ZeroEyes.)**
Malaysian school connectivity is uneven and PDPA cross-border rules favour local processing. An on-premise mode is both a technical and a compliance advantage.

**11. School transport.**
Stop-arm and danger-zone alerting at the school gate, boarding and alighting reconciliation against the approved collection list — done through the pass/handover record, never facial recognition.

---

## 4. Design and UX patterns worth adopting

- **Role-based views as the primary navigation axis.** Leaders see risk and trend; analysts see detail; teachers see only their class and the one action they must take. AiWAS has role gating but every role still lands on the same dense dashboard.
- **Map-first situational awareness during an incident.** When an alert is live, the map is the screen, not a tab.
- **Mobile responder as a first-class surface, not a responsive fallback.** Every competitor assumes the responder is walking. AiWAS assumes a desk.
- **Off by default, enabled per device, by a named person.** Verkada applies this to people analytics. AiWAS should apply it to every capability — it turns the exclusion lists into a runtime control.
- **A triage queue as the operator's home screen**, ordered by what needs a decision, not by recency.
- **Alert cards that carry the response, not just the finding** — description, location, last known position, and the specific next action. ZeroEyes ships the response plan inside the alert.
- **After-action reporting as an output format**, not a table the user has to interpret.
- **Live status that says "unknown" loudly.** Most dashboards render an unmonitored area identically to a quiet one. AiWAS already refuses this; it should be a visible selling point.

---

## 5. What the competitors do that AiWAS should keep refusing

- **Facial recognition to identify pupils** — on buses (Coram), in unified timelines (Verkada with face detection enabled), or at gates. Biometric data is sensitive personal data under the amended PDPA and MOE excludes biometrics.
- **Device and content monitoring of students** (Gaggle, GoGuardian Beacon, Lightspeed Alert). There is no independent empirical evidence that these platforms reduce suicide, violence or long-term harm; documented false alerts include students flagged as actively planning suicide who were not; and the Knight First Amendment Institute is litigating over student privacy. This is a large, well-funded segment AiWAS should decline in writing.
- **Aggregate accuracy claims without a dataset.** The FTC's action against Evolv is the template for what happens next.
- **Automated police dispatch from a model output.** Even ZeroEyes, whose whole product is dispatch speed, puts a trained human in front of it.
- **Appearance-based cross-camera re-identification** marketed as anonymous. Tracking "the person in the red shirt" across a campus is identification by another name when the campus is a school.

---

## 6. Honest self-assessment

Where AiWAS is genuinely ahead: **stated limitations per capability**, **written exclusion lists with reasons**, **"no coverage" never rendering as zero**, **confidence shown only for video candidates**, and **precision/recall reported with "Not measured" where there is no denominator**. No competitor reviewed publishes limitations at capability level. In a market that just watched the FTC sanction a vendor for overclaiming, that is a defensible position rather than a hair shirt — and it should be on the front of the product, not buried in the docs.

Where it is behind, in order: no verification desk; no accountability or reunification; no drills; no alerting or responder handoff; no mobile responder; no visitor management; no hall pass; no transport; no real reporting channel; and, underneath all of it, still no backend, authentication, storage, ingestion or delivery.

Nothing in this audit changes the September release blockers. It changes what should be built once they are cleared, and it says plainly that most of the highest-value additions are workflow, not vision models.

---

## Sources

Consulted 13 September 2026.

**Suites and buyer guides**
- [Raptor's school safety products](https://raptortech.com/protect-your-school/) and [Emergency Management Suite](https://raptortech.com/protect-your-school/emergency-management-suite/) — Raptor Technologies
- [Raptor vs Navigate360 vs Coram](https://www.coram.ai/post/raptor-vs-navigate360) and [Navigate360 competitors](https://www.coram.ai/post/navigate360-competitors) — Coram (vendor-authored comparison; pricing figures are theirs)
- [5 school security technology trends to watch in 2026](https://www.campussafetymagazine.com/insights/5-school-security-technology-trends-to-watch-in-2026/175807) — Campus Safety Magazine

**Video intelligence**
- [Verkada February 2026 product updates](https://www.verkada.com/updates/february-2026-product-updates/) and [AI-powered deterrence launch](https://www.verkada.com/blog/product-updates-february-2026/) — Verkada (domain unreachable from this environment; corroborated by [Blue Cap IT's summary](https://bluecapit.com/blog/verkada-february-2026-product-update.html))
- [Verkada unveils AI-powered tools for school safety and incident response](https://www.prnewswire.com/news-releases/verkada-unveils-ai-powered-tools-for-next-generation-school-safety-and-incident-response-302579207.html) — PR Newswire
- [Ambient.ai platform](https://www.ambient.ai/) and [AI-native VMS comparison](https://www.forasoft.com/learn/video-surveillance/articles-vms/ai-native-vms-ambient-spot-eagle-eye) — Ambient.ai, Fora Soft
- [How AI video analytics transforms campus safety, efficiency and compliance](https://www.campussafetymagazine.com/insights/how-ai-video-analytics-transforms-campus-safety-efficiency-and-compliance-in-schools-and-universities/173775/) — Campus Safety Magazine

**Weapons detection**
- [Gun detection for schools](https://zeroeyes.com/education-security) and [off-network release](https://campussecuritytoday.com/articles/2026/04/08/zeroeyes-releases-off-network-ai-gun-detection-solution.aspx) — ZeroEyes, Campus Security Today
- [Schools are buying AI software to detect guns. Some experts say it's a mistake](https://statescoop.com/zeroeyes-school-safety-ai-firearm-detection-2024/) — StateScoop
- [FTC action against Evolv Technologies](https://www.ftc.gov/news-events/news/press-releases/2024/11/ftc-takes-action-against-evolv-technologies-deceiving-users-about-its-ai-powered-security-screening) — Federal Trade Commission

**Alerting and mapping**
- [CrisisAlert wearable panic button](https://www.centegix.com/crisisalert-wearable-panic-button/) and [panic buttons with critical incident mapping](https://www.centegix.com/blog/wearable-panic-buttons-critical-incident-mapping-work-to-protect-staff/) — CENTEGIX
- [School safety indoor mapping](https://www.geocomm.com/school-safety/) — GeoComm

**Reporting and movement**
- [Anonymous reporting system](https://www.stopitsolutions.com/solutions/anonymous-reporting-system) — STOPit Solutions
- [Securly Pass](https://www.securly.com/pass) — Securly
- [Digital hall pass and student tracking system to be available at all Philadelphia schools](https://www.chalkbeat.org/philadelphia/2026/08/20/virtual-hall-pass-tracks-students/) — Chalkbeat

**Transport**
- [BusPatrol technology](https://buspatrol.com/technology/) · [Safe Fleet danger zone](https://www.safefleet.net/blog/enhancing-student-safety-ai-driven-solutions-for-school-bus-danger-zone/) · [School bus safety and security 2026](https://www.coram.ai/post/school-bus-safety-security)

**Digital monitoring and its critics**
- [GoGuardian Beacon](https://www.goguardian.com/beacon) · [Lightspeed Alert launch](https://www.globenewswire.com/news-release/2021/04/15/2211013/0/en/Lightspeed-Systems-Launches-Lightspeed-Alert-Solution-for-Threat-Detection-of-Suicide-Bullying-and-School-Violence.html)
- [School surveillance systems threaten student privacy, new lawsuit alleges](https://knightcolumbia.org/blog/school-surveillance-systems-threaten-student-privacy-new-knight-institute-lawsuit-alleges) — Knight First Amendment Institute
- [Computer programs monitor students' every word in the name of safety](https://oregoncapitalchronicle.com/2024/10/26/computer-programs-monitor-students-every-word-in-the-name-of-safety/) — Oregon Capital Chronicle
- [GoGuardian: a red flag machine by design](https://redflagmachine.com/research/) — Electronic Frontier Foundation research

See also the [platform audit and impact roadmap](2026-platform-audit-and-impact-roadmap.md), the [multi-industry expansion report](multi-industry-expansion.md) and the [3D site map notes](../site-map-3d.md).
