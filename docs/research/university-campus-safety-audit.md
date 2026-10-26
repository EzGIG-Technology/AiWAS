# University Campus Safety and Surveillance: Global Desk Research Audit

**For:** EzVision for Campus Safety (EzGIG Technology, Malaysia). This audit supports the rework of the Malaysian primary and secondary school demo for universities.
**Date:** 26 October 2026
**Method:** I ran about 70 web searches covering vendors, deployments, regulation, controversies and Malaysian sources. In this environment the egress proxy blocked direct page fetches (WebFetch and curl), so **every claim comes from search-result snippets and summaries of the pages listed in Sources**. I did not read the full pages. Vendor-published case studies are promotional, and the report labels them that way. Statements marked *(general knowledge)* come from background knowledge rather than a source fetched in this session, and statements marked *(unverified)* should be checked before external use.

---

## 1. Executive summary: key takeaways for product design

1. **University safety runs on two layers, and the demo must show both.**
   - The first layer is an operator-facing physical-security platform: video management (VMS), access control, license plate recognition (LPR), intercoms and alarms, run from a 24/7 Security Operations Centre (SOC) or control room. Examples are Genetec, Milestone, Avigilon/Motorola and Verkada.
   - The second layer is a community-facing safety app for students and staff: SOS, virtual escort, safety timer, anonymous tips, mass notification and lone-worker check-in. Examples are Rave Guardian, AppArmor, LiveSafe, SafeZone and GatorSafe.
   - Leading universities connect the two layers. An app SOS shows up on the SOC map, and the SOC sends responders and targeted messages ([S2], [S49]–[S57], [S41]).
   - The school demo was probably centred on cameras and teachers. A university product has to centre on the **SOC console plus a campus-wide safety app**.

2. **The "unified campus" pitch is the norm.** Binghamton runs about 1,635 cameras and about 4,800 access readers in one Genetec interface, with LPR, intercom and visitor modules ([S2]). Ohio State has about 4,000 to 5,000 cameras run as one system by Public Safety, and it piloted LPR ([S124]). UF had about 1,700 cameras in 2023 and targets 3,000 ([S43]).
   - Typical scale is therefore **thousands of cameras plus thousands of door readers**. Operators cannot watch every feed, which is the core argument for AI analytics and exception-based alarm queues ([S24], [S124]).

3. **Mobile safety apps are close to universal and look much alike.** The table-stakes features are:
   - SOS or emergency call with location
   - Friend Walk or virtual escort
   - Safety timer
   - Anonymous tip with photo or video, plus two-way chat
   - Mass notifications
   - Campus map, emergency plans and safety resources
   - Work Alone / lone-worker check-in
   - Shuttle tracker
   - Evacuation check-in (for example, for people with PEEPs at refuges)

   Sources: [S34]–[S47], [S51]–[S57], [S126]. **SafeZone (CriticalArc)** is the reference product for the UK and Australia. It was reported at over 25% of UK universities by 2019 and is used at UNSW, UQ, Griffith, York, Greenwich and others ([S50]–[S57]).

4. **Location privacy by design is a selling point.** SafeZone, Monash bSafe and LiveSafe all say that **location is shared only when the user raises an alert, checks in, or submits a tip** ([S53], [S110], [S45]). EzVision should copy this pattern explicitly.

5. **Facial recognition (FR) is the biggest reputational risk in higher education.**
   - In 2020 UCLA dropped its campus FR plan after Fight for the Future's campaign. In that campaign's test, Amazon's FR tool falsely matched 58 of about 400 UCLA athlete and faculty photos to mugshots ([S74]). Dozens of US universities publicly committed not to use FR ([S73], [S75]).
   - China's Ministry of Education moved to "curb and regulate" campus FR after China Pharmaceutical University's classroom attention monitoring ([S76]).
   - JNU students dismantled FR devices in their library ([S84]).
   - The University of Kentucky's 2026 voluntary FR door-entry pilot drew privacy criticism ([S83]).

   **Recommendation:** ship with FR **off by default**. Offer only opt-in face-*authentication* at doors, never face *identification* across the camera network, and never emotion or attention analytics.

6. **Do not build anything that looks like protest surveillance.** UK universities paid a consultancy to monitor pro-Palestine student activists ([S79]). Melbourne used CCTV and Wi-Fi records to discipline sit-in protesters ([S80]). Yale's protest surveillance drew criticism ([S81]), and in 2025 more than 30 rights groups wrote to 60 US colleges asking them to dismantle surveillance ([S82]).
   - Analytics such as "unplanned gathering detection" (marketed at Binghamton [S2]) are dual-use. Keep crowd analytics framed as **crowd safety and density at events and evacuations** only.

7. **AI weapon detection is controversial and less relevant to Malaysia.**
   - Evolv settled with the US FTC in 2024 over unsupported detection claims ([S28]).
   - An Omnilert system flagged a bag of Doritos as a gun, and police handcuffed a student ([S33]).
   - Gun detection is an American use case. For Malaysia, "dangerous object" detection (machete or parang, knife) should be optional, human-verified and never auto-escalated to police.

8. **The Malaysian context favours a SOC plus residential-college story.**
   - Public universities run **Bahagian Keselamatan** units, and many have **Polis Bantuan (auxiliary police)** with police powers inside the campus cordon. Examples are UM (since 2015), IIUM (189 personnel), UiTM and UMS ([S90]–[S94]).
   - After student deaths in 2025, KPT/MOHE ordered all higher education institutions (IPT) to carry out comprehensive, regular safety inspections. These cover access control, CCTV and safe, well-lit walkways in **campuses and student residences**, and include visitor procedures for hostels ([S99], [S100], [S102]). KPT figures show 37 student deaths on public campuses between 2021 and 2025 ([S101]).
   - In June 2026, bomb threats hit Monash Malaysia and Taylor's within 48 hours ([S106], [S107]). That supports mass notification, evacuation and muster features.
   - Under the PDPA 2024 amendments, **biometric data is sensitive personal data**, mandatory **DPO** appointment and **breach notification** apply from 1 June 2025, and biometric processing generally needs explicit consent ([S111], [S112]).

9. **The demo has two points of view.** §9 covers the university (Universiti Malaya) and §10 covers the Ministry (KPT). Since August to October 2026 the government has announced that AUKU will be repealed and has halted university disciplinary proceedings over free speech and peaceful assembly ([S169], [S170]). Any ministry-facing view must therefore be aggregate-only and explicitly free of protest monitoring.

10. **Compliance reporting sells.** In the US this means the Clery daily crime log (updated within two business days), timely warnings and the Annual Security Report ([S115], [S116]); Omnigo claims about 500 colleges use it for Clery reporting ([S61]). The Malaysian equivalents are the KPT safety-inspection evidence pack, the PDPA DPO audit and breach log, and incident statistics for university management. A **"Compliance and Reports" module** is a strong differentiator.

---

## 2. Vendor landscape

| # | Vendor / product | Category | Key university features | Example university customers (as reported) | Notes / controversy |
|---|---|---|---|---|---|
| 1 | **Genetec Security Center** (Omnicast VMS, Synergis ACS, AutoVu LPR, Sipelia intercom, Clearance evidence sharing, Mission Control, Operations Center) | Unified VMS + ACS + LPR + PSIM | Single pane for video, access, intrusion and intercom. Campus partitioning, so each team sees only its own cameras ([S3]). Video analytics for "unplanned gatherings" ([S2]). Mobile credentials in residence halls ([S2]). SOP-driven incident workflows in Mission Control ([S8]). Officer tracking, inventory and incident documentation at BYU ([S5]). LPR virtual parking permits ([S6], [S7]). | Binghamton (SUNY), U. Georgia, Griffith (Australia, SaaS), Mount Royal (Canada), BYU, Texas A&M (AutoVu), UBC (AutoVu), ASU police RTAC (VMS) ([S1]–[S7], [S48]) | Market leader in higher-ed "unified" deployments. The "gathering" analytics are dual-use (see §6). |
| 2 | **Milestone XProtect** (+ Smart Wall) | Open-platform VMS | Large camera counts, video wall, central management by a small IT team, third-party analytics (BriefCam) ([S10], [S12]). | Sheffield Hallam (UK), Western Kentucky (~300 cams), SUNY Buffalo (~800 devices) ([S9]–[S11]) | Often run by university IT as "video as a service" for departments. |
| 3 | **Avigilon (Motorola Solutions): Unity (on-premises) and Alta (cloud, formerly Openpath + Ava)** | VMS + ACS + analytics | Appearance Search (find a person by description), mobile app response, video intercom visitor verification ([S14]–[S16]). Alta adds a cloud single dashboard, flexible lockdown, smart sensors and visitor QR ([S17]). | U. Tennessee (230 buildings incl. Neyland Stadium), Marian University, Tampere Vocational College Tredu ([S14]–[S16]) | Part of the Motorola ecosystem alongside Rave, AppArmor and CommandCentral. |
| 4 | **Verkada** (Command: cameras, access, guest, sensors) | Cloud VMS + ACS + visitor | Lockdown by phone, AI search by text description or photo, face blur, mobile/NFC credentials, Atrium ID integration for dorms, Guest check-in for residence halls ([S18], [S19]). | Greenfield CC (testimonial), Chung-Ang University (Korea), Volunteer State CC ([S18], [S19]) | The 2021 breach exposed about 150,000 cameras across 95 customers, including schools ([S20]). FR features drew criticism in K-12 settings. |
| 5 | **Axis Communications** | Cameras, audio, intercom, analytics | Network speakers for automated voice-downs, elevator cameras, emergency video intercoms, object analytics to verify access alarms, lightning-warning messages ([S21], [S22]). | High Point University, Binghamton ([S21], [S22]) | Edge/device layer that feeds Milestone or Genetec. |
| 6 | **Hanwha Vision (Wisenet)** | Cameras/NVR | Campus CCTV, plus lab and simulation observation (teaching use cases) ([S23]). | Beykent University (Turkey, ~450 cams), U. Auckland optometry lab ([S23]) | Korean vendor. Commonly chosen as an NDAA-compliant alternative *(general knowledge)*. |
| 7 | **BriefCam** (Review / Respond / Research) | Video analytics / synopsis | Video Synopsis condenses hours of footage into minutes. Rule-based alerts (restricted areas, crowding). Dashboards on traffic and occupancy ([S12]). | Unnamed 2,000-acre, ~3,000-camera university (vendor case study). IPVM lists university security departments as primary users ([S12], [S13]). | Investigation-centric. Synopsis is a strong demo feature. |
| 8 | **Ambient.ai** | AI agentic video monitoring | Detects pre-incident behaviour (tailgating, loitering, brandished weapons) on existing cameras. Alarm triage. Marketed as working **without facial recognition** ([S24], [S25]). | University of Northwestern–St. Paul (135 cameras, response time under 3 minutes) ([S24]) | Its "no FR" positioning is a useful precedent for EzVision. |
| 9 | **Evolv Express** | Walk-through weapons screening | Screening at stadium and arena entrances. Portable ([S26], [S27]). | Boston College (16 units, Alumni Stadium and Conte Forum), Belmont University ([S26], [S27]) | **2024 FTC settlement** over deceptive detection claims ([S28]). |
| 10 | **ZeroEyes** | AI gun detection on existing CCTV + human verification centre | Detects visible guns. A human analyst verifies before alerts go to campus police within seconds ([S29]). | Temple, U. New Haven, Eastern Michigan, Florida SouthWestern State ([S29]–[S31]) | US-centric. Effectiveness claims come from the vendor. |
| 11 | **Omnilert** | Mass notification + AI gun detection | Emergency notification since 2017 at Sonoran University. Gun detection that triggers door locks, alarms and dispatch ([S32]). | Sonoran University (Arizona) ([S32]) | **A Doritos bag was flagged as a gun** and a student was handcuffed (Baltimore County HS, 2025) ([S33]). |
| 12 | **Rave Mobile Safety** (Motorola since Dec 2022): Rave Alert, Rave Guardian, Eyewitness | Mass notification + safety app + tips | Safety timer with Guardians, a panic/911 button with GPS, anonymous text tips with photos, a safety profile shared only during emergencies ([S34]–[S36]). | Claimed at about half of US college students for Rave Alert (2019). 5 of 8 Ivies, Brown, UMSL, SLU, UNC ([S34]–[S36]) | Acquired by Motorola Solutions in 2022 for about $553m ([S37]). |
| 13 | **AppArmor** (Rave/Motorola since Feb 2022) | Custom-branded safety app platform | University-branded apps with mass notification, dispatch chat, friend walk / virtual escort, crime map, offline emergency plans, Work Alone, BlueLight ([S38]–[S40]). | UF "GatorSafe", UBC Okanagan "UBC SAFE", UIC SAFE, Chicago State, EWU EagleSafe ([S40]–[S44]) | Rave said the combined company would cover about 75% of North American higher-ed organisations ([S38]). The app count of "400+ universities" in the brief is **unverified**: an older profile gave 60 institutions ([S40]). |
| 14 | **LiveSafe** | Safety app + tip platform | Anonymous tips with GPS-tagged media, chat with police, SafeWalk (up to 3 friends, standby mode) ([S45], [S46]). | Arizona State (since 2014), Yale, U. Delaware, Winthrop, St. John's, ECU ([S45]–[S47]) | ECU reported 169 tips and 1,000+ SafeWalks in a year ([S46]). Ownership is now part of Vector Solutions *(general knowledge, unverified)*. |
| 15 | **CriticalArc SafeZone / OmniGuard** | Safety app + "distributed command and control" | SOS and first aid with location, check-in for lone or out-of-hours work, mass and targeted notifications (for example, to wardens), two-way messaging, responder location, heat-maps for patrol optimisation, campus-boundary geofence ([S49]–[S57], [S54]). | UK: York, Northumbria, Greenwich, UEA, Manchester, UCLan, Swansea, Aberdeen, Stirling. Australia: UNSW, UQ, UniSA, Griffith. Ireland: DCU. Switzerland: Zurich. US: Texas A&M Kingsville ([S49]–[S57]) | **Most important reference for the student/staff app and responder console.** Reported at over 25% of UK universities in 2019 ([S50]). |
| 16 | **Everbridge** (Mass Notification, Safety Connection) | Critical event management | Multi-channel alerts. Safety Connection offers SOS, "Safe Corridor" check-in, two-way chat, and location fusion from access control ([S58], [S59]). | UCLA, Tulane, Harvard, Caltech, UT Austin, Michigan State and others ([S58], [S59]) | Enterprise CEM. Award-winning in 2018. |
| 17 | **Navigate360** (P3 Campus, Behavioral Threat Assessment, Care360) | Tips + threat assessment + case management | Anonymous tip reporting, behavioural threat assessment case management, student well-being platform ([S62]). | NEOMED (webinar) ([S62]) | Mostly K-12. Higher-ed detail is thin. |
| 18 | **Motorola CommandCentral Aware** | Real-time crime centre (RTCC) | Fuses video, responder locations and incident data into one operating picture. "Missions" with AI Assist and replay timeline (April 2026) ([S63]). | Municipal deployments. No university-specific source found ([S63]). | Relevant for campus police departments with an RTCC. |
| 19 | **Omnigo** (Report Exec, Dispatch, Clery) | Incident/RMS + dispatch + Clery reporting | Incident reports, CAD dispatch, Clery Annual Security Report, public crime log publishing with redaction, hotspot analytics ([S60], [S61]). | Claims about 500 colleges and universities ([S61]) | Shows that **incident-to-compliance reporting** is a product category of its own. |
| 20 | **Hikvision (HikCentral)** | Cameras/VMS/smart campus | Smart-campus bundles (VMS, access, vehicle control), digital twin with 6,000 cameras at Qassim University ([S65]). | Qassim University (Saudi), Uka Tarsadia (India), ITS Surabaya (Indonesia) ([S65]) | **US NDAA §889 ban** on federal funds and grant recipients, and an FCC ban on new authorisations ([S64]). A procurement and reputational risk for internationally ranked universities. |
| 21 | **Dahua (DSS)** | Cameras/VMS/smart campus | Face-recognition access, attendance at gates, ANPR, temperature screening ([S66]). | Ashton International College (South Africa) ([S66]) | Same NDAA/FCC issues as Hikvision ([S64]). |
| 22 | **Certis (Mozart platform)** | Integrated security services + command centre | Security Command Centre, CCTV video analytics upgrades, 24/7 monitoring and response ([S87]). | NTU Singapore (contract from March 2024) ([S87]) | Managed-service model: a provider that combines guards and technology. |
| 23 | **HALO Smart Sensor** (IPVideo) | Non-camera environmental sensor | Detects vape, THC, aggression or loud noise, and air quality, with **no camera or audio recording**. Built for toilets and private areas ([S67]). | Mostly K-12. No university case found ([S67]). | A privacy-preserving option for hostel corridors and toilets. |
| 24 | **SoundThinking ShotSpotter for Campus** | Acoustic gunshot detection | Detects, classifies and locates gunshots within 60 seconds ([S68]). | Vendor claims 140+ institutions. Pilots at UConn and Johns Hopkins ([S68]) | Low relevance in Malaysia. |
| 25 | **Blue-light / help-point vendors** (Code Blue, Aiphone, 2N) | Emergency call stations | Pole-mounted emergency phones with overhead camera, now moving to video intercoms tied into the VMS ([S69], [S70]). | U. Toronto, U. Winnipeg, UBC, Chaffey College ([S70]) | The "Help Point" icon should appear on the SOC map. |
| 26 | **StarRez (Visitor Tracking) / Maxient** | Housing visitor management / conduct and CARE case management | Guest pre-registration and e-pass (check-in about 10 s) ([S71]). BIT/CARE referrals with risk levels and restricted case files ([S72]). | UMass Lowell, VCU (StarRez). Loyola Chicago, Tarrant County (Maxient) ([S71], [S72]) | The welfare referral lane is separate from security. |
| 27 | **TimeTec Patrol** (FingerTec, Malaysia) | Guard tour | NFC/Bluetooth checkpoints, panic button with photo and GPS ([S129]). | General guard-tour product ([S129]) | A **Malaysian** vendor that is a likely local competitor or partner for patrols. |

---

## 3. University deployments by region

### 3.1 United States
- **Binghamton University (SUNY).** 930 acres, about 120 buildings. 1,635 cameras and about 4,800 readers in Genetec, with LPR, intercom and evidence sharing. Plans to replace about 3,000 residence-hall locks with Wi-Fi readers and mobile credentials ([S2]). Axis elevator cameras and emergency video intercoms ([S22]).
- **Ohio State.** About 4,000 cameras in Columbus (about 5,000 across all campuses), one unified system run by Public Safety, plus mobile camera trailers. 30 to 60 LPR cameras piloted in the University District. Officials note it is "impossible to be viewing all at the same time" ([S124]).
- **University of Florida.** 1,700 cameras (2023) with a goal of 3,000 ([S43]). GatorSafe app (AppArmor-based): Mobile BlueLight, anonymous tips with media, live chat, crime map, Operation ID property registration, and Work/Study Alone that calls a contact if a 5-minute check-in is missed. 71,000+ subscribers ([S41], [S42]).
- **Arizona State.** LiveSafe since 2014 with tips, virtual escort and Safety Escort rides ([S47]). Police Real Time Analysis Center with a video wall on Genetec ([S48]).
- **NYU.** More than 3,000 cameras (2019 reporting). Nine cameras and extra lighting added after assaults near Washington Square in 2022 ([S125]).
- **UC system.** UCLA abandoned FR in 2020 ([S74]). UC campuses publish ALPR use and privacy policies (UCSD PPM 460-7, UC Merced, UCLA, UC Irvine). The UCSC Academic Senate pushed back on parking ALPR over chilling effects on undocumented and minority students ([S122], [S123]).
- **University of Tennessee.** Avigilon Unity across 230 buildings, including the stadium. Used by campus security and local police ([S14]).
- **AI layers on existing CCTV.** ZeroEyes at Temple, New Haven and EMU ([S29]–[S31]). Ambient.ai at Northwestern–St. Paul ([S24]). Evolv screening at Boston College and Belmont stadiums ([S26], [S27]).
- **University of Kentucky (2026).** A voluntary Alcatraz AI facial-authentication door-entry pilot in a residence hall drew privacy criticism over undisclosed retention and deletion rules ([S83]).

### 3.2 United Kingdom and Ireland
- **SafeZone** at York (the first Russell Group university), Northumbria (first in Europe, 2015), Greenwich, UEA, Manchester, UCLan, South Wales, Swansea, Aberdeen and Stirling. Ireland's DCU joined in 2017 ([S49]–[S51], [S55], [S56]).
- York's lone-working check-in and Greenwich's evacuation check-in for people with a PEEP are good feature precedents ([S51], [S55]).
- **Leicester.** Head of Security, Operations Managers, Team Managers, Control Room Operators and Security Patrollers. 900+ cameras monitored 24/7. "GDPR and Data Protection are at the heart of our role" ([S120]).
- **CCTV governance.** Codes of practice name a system owner (for example, an Associate Director of Security), restrict who may review recorded footage (control room operators, team leaders), route subject-access requests through an information governance or DPO function, and cite UK GDPR Art. 6(1)(f) legitimate interests ([S119], [S121]).
- **Milestone** at Sheffield Hallam ([S9]). Strathclyde runs a "Strathclyde SOS" app pilot ([S131]).
- **Controversy:** monitoring of students' social media and protests (the Horus investigation, 2026) ([S79]).

### 3.3 Australia and New Zealand
- **SafeZone** at UNSW (emergency, first aid, check-in timer, shuttle tracker, links to the Security Operations Centre) and UQ (location shared only on alarm; routes directly to emergency services at sites without 24/7 security). Also UniSA (34,000 users) and Griffith ([S52], [S53], [S57]).
- **Griffith.** Genetec Security Center SaaS with 400+ streams and campus partitioning, plus AutoVu ANPR for parking ([S3]). The Campus Support team handles security, first aid and escorts ([S57]).
- **Monash (Australia and Malaysia).** The Monash bSafe app: urgent help, 24/7 security escort, anonymous reporting, and no location tracking by the university ([S110]).
- **Controversy:** the University of Melbourne used CCTV and Wi-Fi logs to identify Gaza sit-in protesters, and the Victorian Information Commissioner examined it ([S80]).
- **Auckland.** Hanwha cameras in the optometry teaching lab ([S23]).

### 3.4 Singapore
- **NTU.** Certis became the campus security provider on 1 March 2024. It is installing and upgrading CCTV with video analytics across halls, staff housing and academic buildings, and building a new Security Command Centre on the Mozart platform. Commissioning was planned for the end of 2024, and **completion is unverified** ([S87]).
- **NUS.** AI and deep-learning on CCTV for early warnings. FR "at high-risk zones" for investigations. Drone patrols and trials of autonomous patrol robots at University Town and Bukit Timah ([S86]). The page is undated.
- **Voyeurism in campus toilets and showers.** After cases, universities explored motion sensors and other non-camera tech, plus restroom inspections ([S88]). This supports privacy-preserving sensors in sensitive areas.

### 3.5 China
- **China Pharmaceutical University (2019).** FR at gates, dorms and libraries, plus a Megvii classroom system scoring attention (phone use, napping). The Ministry of Education said it would "curb and regulate" FR in schools ([S76]).
- **Peking University.** FR gate trials (2018) and about 20 FR devices in libraries, dorms and gyms ([S77]). Pandemic-era procurement of FR, contact-tracing and temperature systems by dozens of universities ([S78]). Visitor reservation systems at PKU and Tsinghua remain contested.
- **Lesson:** classroom behaviour analytics and blanket FR create backlash even in China, so **exclude both**.

### 3.6 India
- **JNU.** Students dismantled FR devices in the library over consent ([S84]).
- **West Bengal (Aug 2025).** The Governor and vice chancellors agreed on AI surveillance, including FR, at universities to fight ragging ([S85]). This shows strong state appetite for ragging and bullying prevention, but it is contested.

### 3.7 Middle East
- **Qassim University (Saudi Arabia).** A digital twin of 30 buildings with 6,000+ Hikvision cameras on HikCentral ([S65]).
- **KAUST.** Publishes a CCTV *and drone* privacy notice ([S89]).
- **Khalifa University.** Fire and life-safety alarms flow to a campus command and control centre for verification before Civil Defence responds (search snippet only).

### 3.8 Malaysia
See §7.

---

## 4. Roles and logins typical in higher-education safety

Sources: org structures at Chapman ([S117]), Syracuse ([S118]) and Leicester ([S120]); CCTV codes of practice ([S119], [S121]); app pages ([S41], [S51], [S53]); Clery ([S115], [S116]); Maxient ([S72]); visitor tracking ([S71]); Malaysian units ([S90]–[S93]).

| Role (international → Malaysian equivalent) | Logs into | Primary tasks |
|---|---|---|
| **SOC / control room operator, dispatcher** → *Operator Bilik Kawalan / Pusat Kawalan Keselamatan* | Desktop **SOC console**: video wall, alarm queue, map, CAD/dispatch, intercom | Monitor and triage alarms. Answer app SOS, Help Point and intercom calls. Dispatch patrols. Run SOPs. Issue targeted alerts. Log incidents. |
| **Shift supervisor, team leader** → *Ketua Syif / Penyelia* | SOC console (supervisor view) + mobile | Approve escalations, assign resources, close incidents, review footage (restricted), shift handover. |
| **Head of security, chief of police** → *Ketua Pegawai Keselamatan / Pengarah Bahagian Keselamatan; Komandan Polis Bantuan* | **Command dashboard** (web) | KPIs, hotspots, staffing, compliance (Clery / KPT inspection), policy, liaison with PDRM. |
| **Patrol officer, auxiliary police, guard** → *Polis Bantuan / Pengawal Keselamatan (incl. contract guards)* | **Officer mobile app** (+ radio) | Accept dispatch, navigate, guard-tour checkpoints (NFC/QR), photo and incident reports, officer SOS, escort requests, lost and found intake, citations (parking). |
| **Community service officer, parking enforcement** → *Unit Trafik / Penguatkuasa Parkir* | Officer app + LPR console | Parking permits, LPR enforcement, event traffic ([S6], [S117]). |
| **Residential life / hall warden / college principal** → *Pengetua / Felo Kolej Kediaman; Residential Community Safety Officers* | **Residential college portal** (web/mobile) | Hostel access exceptions, visitor log, incidents in their college, welfare referrals, receiving targeted notifications ([S51], [S118]). No raw video by default. |
| **Student** → *Pelajar (incl. JPKK college committees)* | **Student safety app** | SOS, friend walk / virtual escort, safety timer, anonymous tip, alerts, visitor pre-registration, lost and found, shuttle, evacuation check-in. |
| **Staff, faculty, researcher** → *Staf akademik / pentadbiran / penyelidik* | **Staff app** (same app, staff profile) | SOS, Work Alone / lab after-hours check-in, report a hazard or incident, guest pre-registration, act as Campus Security Authority reporter. |
| **Visitor, contractor, parent** → *Pelawat / Kontraktor* | Web pre-registration link / kiosk / QR | Register a visit, receive a QR pass, site safety induction, receive emergency alerts while on campus (geofenced, opt-in). |
| **Facilities / estates** → *Jabatan Pembangunan & Harta Benda* | Facilities portal (or tickets from the SOC) | Fix lighting, doors and cameras. Device health. Lab and hazardous-area access schedules. |
| **IT / system admin** → *Pusat Teknologi Maklumat* | Admin console | Users and roles (RBAC/SSO), devices, integrations, retention settings, cybersecurity. |
| **DPO / privacy officer, information governance** → *Pegawai Perlindungan Data (PDPA s.12A)* | **Privacy and audit console** | Approve footage review and exports, subject-access and erasure requests, audit trail, retention, DPIA register, breach notification (PDPA from June 2025) ([S111], [S119], [S121]). |
| **Title IX / student welfare / counselling / BIT** → *HEP – Unit Kaunseling, Unit Integriti / anti-gangguan seksual* | **Welfare case portal** (restricted) | Receive welfare referrals from security (with no video by default), manage CARE / behavioural intervention cases, harassment reports ([S72], [S114]). |
| **Emergency manager / BCM** → *Unit Pengurusan Risiko / Kecemasan* | SOC console (emergency mode) | Mass notification templates, evacuation, muster, drills, after-action reports. |
| **Event commander** | Event mode of the SOC console + mobile | Graduation (*Majlis Konvokesyen*), sports or concert crowd monitoring, command post, staff deployment ([S128]). |
| **University leadership** → *NC / TNC HEP / Pendaftar* | Executive dashboard (read-only) | Trends, compliance status, major incidents, KPT reporting. |
| **External agencies** (police, fire/rescue, ambulance) → *PDRM / Bomba / ambulans* | Time-limited shared incident link (Clearance-style) | Receive evidence and live views for a specific incident only ([S2]). |

---

## 5. Feature catalogue

Labels:
- **COMMON**: table stakes in higher ed.
- **DIFF**: a differentiator worth showing in the demo.
- **AVOID**: exclude, or keep disabled by default with heavy governance.

### 5.1 SOC / operator console
| Feature | Label | Evidence |
|---|---|---|
| Live video wall, camera tree by campus, building and floor | COMMON | [S10], [S48] |
| Unified alarm queue (video analytics, door forced or held, intercom, Help Point, app SOS, sensors) with priority and SOP | COMMON | [S2], [S8] |
| Campus GIS map with cameras, doors, Help Points, patrol GPS and app-user SOS pins | COMMON | [S5], [S54] |
| SOP-guided incident workflow with audit trail and after-action replay | DIFF | [S8], [S63] |
| Partitioning by campus or department (multi-campus universities) | COMMON (multi-campus) | [S3] |
| AI search / appearance search by attributes (clothing colour, vehicle), no FR | DIFF | [S14], [S18] |
| Video synopsis for investigations | DIFF | [S12] |
| Evidence export with watermarking, redaction (face blur) and chain of custody; shareable to police | COMMON → DIFF | [S2], [S18] |
| Remote lockdown of building, zone or campus | COMMON (US) | [S17], [S18] |
| Two-way audio / voice-down via network speakers | DIFF | [S21] |
| Real-time crime-centre style "missions" | DIFF (large campuses) | [S63] |
| Camera and device health monitoring | COMMON | general |

### 5.2 Video analytics (EzVision's AI core)
| Analytic | Label | Notes |
|---|---|---|
| Intrusion / after-hours presence in closed buildings, labs or rooftops | COMMON | High Point after-hours voice-down ([S21]) |
| Loitering near hostels, car parks or ATMs; tailgating at access doors | COMMON | Ambient ([S24]) |
| Fall / person down (stairwells, hostel corridors, roofs) | DIFF | Relevant to Malaysian hostel fall deaths ([S104]) |
| Fight / aggression (video + audio) | DIFF | Bullying and ragging context ([S85], [S108]); HALO audio ([S67]) |
| Crowd density / occupancy at events and evacuation points | COMMON (frame as safety) | BriefCam ([S12]) |
| "Unplanned gathering" detection | **AVOID** in default config | Dual-use for protest monitoring ([S2], [S79]–[S82]) |
| Vehicle analytics: LPR, wrong-way, speeding near bus stops | COMMON | UUM bus crash ([S105]); Texas A&M ([S6]) |
| Smoke / fire early warning; vape sensors (non-camera) for hostels | DIFF | [S67] |
| Abandoned object (bomb-threat context) | DIFF | Monash/Taylor's 2026 ([S106]) |
| Weapon detection (gun) | AVOID or optional | FTC/Evolv, Omnilert Doritos ([S28], [S33]); low firearm prevalence in Malaysia *(general knowledge)* |
| Blade / dangerous object, human-verified, never auto-calls police | Optional DIFF | Lessons from [S33] |
| Live facial recognition (identification / watchlists) | **AVOID** | [S73]–[S77], [S83], [S84] |
| Classroom attention, emotion or behaviour scoring | **AVOID** | China CPU ([S76]) |
| FR attendance | **AVOID** | Privacy backlash ([S76], [S84]); biometric data is sensitive under PDPA ([S112]) |
| Opt-in face *authentication* at a hostel door (1:1, on-device template) | Optional, governance-heavy | UKentucky pilot criticism ([S83]) |

### 5.3 Access control and residences
| Feature | Label | Evidence |
|---|---|---|
| Card / mobile credential access, schedules by department | COMMON | [S1], [S2] |
| Residence-hall access, door-held and forced alarms, lockdown | COMMON | [S2], [S18] |
| Visitor / guest pre-registration with QR pass and host approval (hostel visitor SOP) | COMMON | [S71]; KPT hostel visitor procedures ([S100]) |
| Lab / hazardous-area access with induction status | DIFF | [S127] |
| Elevator cameras and emergency intercoms | DIFF | [S22] |

### 5.4 Mobile safety app (students, staff, visitors)
| Feature | Label | Evidence |
|---|---|---|
| SOS / emergency call to campus security with location; first-aid request | COMMON | [S35], [S52], [S53] |
| Friend Walk (peer) and Virtual Escort (dispatcher-monitored) | COMMON | [S43]–[S46] |
| Safety timer with Guardians | COMMON | [S35], [S36] |
| Request a physical security escort or campus shuttle | COMMON | [S47], [S52], [S109], [S110] |
| Anonymous tip with photo, video or audio; two-way chat | COMMON | [S35], [S41], [S45] |
| Mass and targeted notifications (geofenced, role-based, e.g. wardens) | COMMON | [S34], [S54] |
| Work Alone / lone-worker check-in (labs, late study) | COMMON → DIFF | [S42], [S51], [S126] |
| Evacuation check-in ("I'm safe" / "I need help" / PEEP at refuge) | DIFF | [S55], [S132] |
| Mobile BlueLight; nearest Help Point on the map | COMMON | [S41] |
| Crime map, safety resources, offline emergency plans | COMMON | [S39], [S44] |
| Property registration (Operation ID) and lost and found | DIFF | [S41] |
| Wellbeing / counselling quick links and confidential welfare report | DIFF | [S54], [S72] |
| Location shared **only** during SOS, check-in or tip | COMMON (privacy) | [S45], [S53], [S110] |

### 5.5 Patrol and field operations
| Feature | Label | Evidence |
|---|---|---|
| Guard tour (NFC/QR checkpoints), missed-checkpoint alerts | COMMON | [S129] |
| Officer app: dispatch, navigation, incident report with photos, officer SOS | COMMON | [S5], [S14] |
| Patrol heat-maps / hotspot-based patrol planning | DIFF | [S54], [S60] |
| Body-worn camera integration | DIFF (US) | (search snippet: UA body cams) |

### 5.6 Emergency management and events
| Feature | Label | Evidence |
|---|---|---|
| Mass notification (SMS, push, email, PA, digital signage) | COMMON | [S34], [S58] |
| Muster / accountability dashboard | DIFF | [S55], [S132] |
| Bomb-threat / evacuation SOP templates | DIFF (Malaysia 2026) | [S106], [S107] |
| Event mode: command post, crowd density, entry screening, staff map | DIFF | [S26], [S128] |
| Weather / lightning-triggered announcements | DIFF | [S21] |

### 5.7 Records, compliance and analytics
| Feature | Label | Evidence |
|---|---|---|
| Incident records management (RMS) and case files | COMMON | [S60] |
| Clery daily crime log, timely warnings, ASR (US only) | COMMON (US) | [S61], [S115], [S116] |
| Malaysia: KPT safety-inspection checklist and evidence pack (access, CCTV coverage, lighting, hostel visitors) | **DIFF (local)** | [S99], [S100] |
| PDPA: footage access audit, retention policy, DSAR workflow, breach log, DPIA, signage register | **DIFF (local)** | [S111]–[S113] |
| Lighting and dark-spot audit from patrol and app reports | DIFF | [S99], [S100] (*laluan selamat dan terang*) |
| Welfare / CARE referral lane separate from security | DIFF | [S72] |

---

## 6. Privacy, ethics and what to exclude

1. **Facial recognition for identification.** UCLA's reversal and the campus FR scorecard (about 45–50 institutions pledged not to use FR) ([S73]–[S75]). China MoE curbs ([S76]). JNU ([S84]). UKentucky criticism ([S83]). In Malaysia, biometric data is *sensitive personal data* from 1 April 2025 and normally needs explicit consent ([S111], [S112]).
   → **Exclude** live FR, watchlists and FR attendance. If face authentication is ever offered, make it opt-in, 1:1 and on-device, with published retention.

2. **Protest, assembly and speech monitoring.** Horus in the UK ([S79]), Melbourne ([S80]), Yale ([S81]) and the 2025 coalition letter ([S82]).
   → **Exclude** social media monitoring, "gathering" alerts tied to identity, and any Wi-Fi or device tracking used for discipline. Add a **purpose-limitation lock**: analytics may not be used for student discipline over lawful assembly. In Malaysia, student political expression is governed by the Universities and University Colleges Act 1971 (AUKU) *(general knowledge)*, so this stays a sensitive area.

3. **Behavioural or emotion scoring** (classroom attention, "suspicious person" scoring). → **Exclude** ([S76]).

4. **Cameras in private spaces** (toilets, showers, bedrooms, counselling rooms). → **Exclude**. Use non-camera sensors (vape, noise, occupancy) instead ([S67], [S88]).

5. **Weapons AI over-claiming.** → Present any object detection as **"assistive, human-verified"**. Show false-positive handling, and never auto-dispatch police ([S28], [S33]).

6. **Cloud security of camera platforms.** The Verkada breach exposed about 150,000 cameras ([S20]). → Ship MFA, least privilege, per-campus partitioning ([S3]), immutable audit logs and data residency in Malaysia.

7. **ALPR governance.** UC policies ban the sale of data, require audits and training, and UCSC raised chilling-effect concerns ([S122], [S123]). → Retain plates briefly and restrict use to parking and safety.

8. **Vendor origin.** NDAA §889 and the FCC actions on Hikvision and Dahua ([S64]). → Keep EzVision **camera-agnostic (ONVIF)** and document supply-chain options. Universities with US research grants may be bound by these rules.

9. **Governance UI elements to include.** CCTV policy and signage register, role-gated footage review (as in UK codes of practice [S119], [S121]), DPO approval for exports, retention timers, a privacy dashboard ("what is collected, why, how long"), and a public transparency page.

---

## 7. Malaysian context

**Institutions and governance**
- **KPT/MOHE** oversees public universities (IPTA/UA) and private institutions (IPTS).
- In June 2025, after a student murder in Cyberjaya, KPT reminded all IPTA and IPTS to follow their safety SOPs ([S99], [S102]).
- The Deputy Minister told Parliament that all IPTs were ordered to run **comprehensive and periodic safety inspections** of campuses and student residences. These cover security systems, **access control, CCTV installation, and safe, well-lit routes**. KPT also coordinates with PDRM on community policing and patrols around IPTs, and new measures include **hostel visitor entry and exit procedures and rapid incident response** ([S100]).
- An MP called for secure dorm access, working CCTV, emergency reporting systems and police coordination ([S103]).

**Security organisation**
- Public universities have a *Bahagian/Jabatan Keselamatan*. Many also have **Polis Bantuan** (auxiliary police) units approved by PDRM:
  - UM: Security Division since 1967, auxiliary police since 2015, with police powers in the campus cordon. It runs a 24-hour monitoring counter and CCTV ([S90], [S91]).
  - IIUM: auxiliary police since 2014, 189 personnel ([S92]).
  - UiTM Selangor: 1 officer, 2 assistant officers, 53 rank and file ([S93]).
  - UMS: formed 2014 ([S94]).
- Private universities run security control rooms and escort services, for example Taylor's Block B control room with escorts between buildings, car parks and hostels ([S109]). Taylor's also employs auxiliary police constables (job posting seen in search).
- Monash Malaysia uses the Monash bSafe app ([S110]).

**Residential colleges (*kolej kediaman*)**
- Residential colleges are central to Malaysian student life, run by a *Pengetua / Felo* with student committees *(general knowledge)*.
- Incidents cluster around residences. Examples are the UM hostel fall death in October 2025 ([S104]) and the UPNM hostel bullying death in 2017, where the Court of Appeal reinstated the death penalty in July 2024 ([S108]).
- A UiTM Puncak Alam rumour of intruders in a women's college was checked by auxiliary police using CCTV (search snippet).

**Recent incidents relevant to features**

| Year | Incident | Feature implications |
|---|---|---|
| 2025 | Cyberjaya student murder at a shared off-campus residence ([S102], [S103]) | Off-campus check-in / safety timer, hostel visitor control |
| 2025 | UUM on-campus bus collision, student killed ([S105]) | Traffic analytics, bus-stop monitoring |
| 2025 | UMK crash; improvements named were lighting and signage (search snippet) | Lighting and dark-spot audit |
| 2025 | UM residential college fall ([S104]) | Fall / roof-access alerts |
| 2026 | Bomb threats at Monash Malaysia and Taylor's within 48 hours ([S106], [S107]) | Mass notification, evacuation and muster |
| 2021–2025 | 37 student deaths on public campuses: 18 accidents, 19 sudden deaths ([S101]) | Welfare and medical response, first-aid SOS |

**Existing Malaysian tech signals**
- UTHM draft CCTV policy, covering procurement, secure records and designated staff, and drones ([S95]).
- UKM student projects: a GPS patrol detection and incident reporting system ([S96]) and a "Panic Button UKM" app ([S97]).
- UMPSA is considering more CCTV ([S98]).
- An older UMS RM5m ICT grant included CCTV at strategic locations (search snippet).
- Sunway City's township-wide network of 5,000 FR-capable CCTVs (township, not university) (search snippet).
- TimeTec Patrol is a local guard-tour product ([S129]).
- Sexual harassment reporting gaps in universities (Anti-Sexual Harassment Act 2022) support a **confidential reporting** lane ([S114]).

**PDPA 2010 and the 2024 amendments**
- CCTV recordings are personal data under the PDPA (Deputy Minister, 2019) ([S113]).
- The amendment received royal assent in October 2024. From 1 April 2025: biometric data became sensitive data, processors gained security duties, and penalties rose. From **1 June 2025**: mandatory DPO appointment (s.12A), data breach notification to the Commissioner (and to individuals where significant harm is likely), and data portability ([S111], [S112]).
- Note: public universities that are federal or state government bodies may be partly outside the PDPA, which does not apply to Federal and State Governments *(general knowledge, unverified for statutory universities)*. Private universities are clearly in scope. Design for PDPA compliance either way.

---

## 8. Recommendations for the EzVision Campus Safety demo

### 8.1 Logins / personas (demo role switcher)

| # | Login | Surface | Persona name idea |
|---|---|---|---|
| 1 | **SOC Operator** | Desktop console | Operator, Pusat Kawalan Keselamatan |
| 2 | **Security Supervisor / Chief Security Officer** | Command dashboard | Ketua Pegawai Keselamatan / Komandan Polis Bantuan |
| 3 | **Patrol Officer / Polis Bantuan** | Officer mobile app | Konstabel PB |
| 4 | **Residential College Principal / Fellow** | College portal (web + mobile) | Pengetua Kolej Kediaman |
| 5 | **Student** | EzSafe Campus app | Undergraduate living in a kolej |
| 6 | **Staff / Researcher** | Same app, staff profile with Work Alone | Lab researcher |
| 7 | **Visitor / Contractor** | Web pre-registration + QR pass | Parent / contractor |
| 8 | **Student Affairs (HEP) Welfare Officer** | Welfare case portal, no video | Unit Kaunseling / TNC HEP office |
| 9 | **Data Protection Officer** | Privacy and audit console | DPO |
| 10 | **Facilities / IT Admin** | Admin console (devices, users, integrations, health) | PTM / Jabatan Harta |
| 11 | **University Leadership** | Executive dashboard (read-only) | NC / TNC |
| 12 | **Event Commander** | Event mode of the console | Konvokesyen ops lead |
| 13 | **External Agency** (optional) | Time-limited incident share link | PDRM / Bomba |

### 8.2 Dashboards and modules to build

1. **SOC Console (centrepiece)**
   - Campus map (multi-campus, partitioned).
   - Video wall.
   - **Unified alarm queue**: AI events, door alarms, app SOS, Help Point calls, sensors.
   - SOP checklists.
   - Dispatch to the nearest officer.
   - Voice-down / PA.
   - Lockdown by zone.
   - Incident timeline with replay.
   - Evidence export with face blur and watermark.
2. **AI Analytics Pack (no FR by default)**
   - After-hours intrusion in labs, rooftops and closed blocks.
   - Hostel loitering and tailgating.
   - Fall / person down.
   - Fight / aggression.
   - Crowd density at events and assembly points.
   - Abandoned object.
   - Vehicle LPR, speeding and wrong-way near bus stops.
   - Smoke / fire.
   - Camera tamper.
   - Optional human-verified "dangerous object".
3. **Residential College module**
   - Access events and door-held alarms per kolej.
   - Visitor pre-registration and logbook (KPT hostel visitor SOP).
   - College incident list.
   - Targeted notices to residents and wardens.
   - Non-camera vape and noise sensor alerts for corridors and toilets.
4. **EzSafe Campus mobile app (students, staff, visitors)**
   - SOS and first aid with location shared only when triggered.
   - Friend Walk and Virtual Escort.
   - Safety timer.
   - Request escort or shuttle.
   - Anonymous tip with media and chat.
   - Work Alone (labs).
   - Evacuation "I'm safe / need help" check-in.
   - Alerts inbox.
   - Help Point map.
   - Lost and found plus property registration.
   - Wellbeing links and a confidential report option.
   - Languages: BM, EN and 中文.
5. **Officer app**
   - Dispatch accept and navigation.
   - Guard tour (NFC/QR).
   - Incident report with photos.
   - Officer SOS.
   - Shift log.
   - Lost and found intake.
   - Parking citation (LPR hit).
6. **Patrol and Guard Tour management**: routes, missed checkpoints, heat-map based patrol planning.
7. **Visitor and Contractor management**: QR passes, host approval, contractor induction, watch for overstays (no FR).
8. **Parking and Traffic (LPR)**: permits, enforcement, event traffic, retention limits.
9. **Emergency and Mass Notification**
   - Templates for bomb threat, fire, flood, haze and lockdown.
   - Geofenced and role-targeted sends.
   - **Muster dashboard** from app check-ins.
   - Drill mode.
10. **Event Mode**: convocation, sports and concerts, with a temporary command post, entrance density, staff map and lost child / missing person workflow.
11. **Incident and Case Management (RMS)**: incident types, case files, evidence, police referral, and a **welfare referral to HEP** that carries no video.
12. **Compliance and Reports**
    - KPT safety-inspection checklist and evidence (CCTV coverage map, access control status, lighting / dark spots, hostel visitor logs).
    - Monthly management report.
    - Clery-style public crime log as an optional export template for international branch campuses.
13. **Privacy Centre (DPO)**
    - Footage access requests and approvals.
    - Audit log of every view and export.
    - Retention timers.
    - DSAR / erasure workflow.
    - PDPA breach notification log.
    - DPIA register.
    - CCTV signage register.
    - Analytics purpose locks (no FR, no protest monitoring).
14. **Admin / Device Health**
    - Camera-agnostic onboarding (ONVIF).
    - Device uptime.
    - SSO and RBAC.
    - Per-campus partitioning.
    - Integrations: access control, Help Points, PA, mass notification, student information system or housing system.

### 8.3 What to drop or reframe from the K-12 demo
- **Drop:** parent-as-guardian surveillance of adult students, attendance tracking of students, classroom behaviour analytics, and any FR attendance. Teachers become staff and researchers. Parents become optional emergency contacts that the student chooses.
- **Reframe:** "student tracking" becomes **student-initiated sharing** (Friend Walk, safety timer). "Bullying detection" becomes **aggression and fight detection in common areas** plus **confidential reporting**.

### 8.4 Demo storylines (suggested)
1. **Night walk from the library to the kolej.** The student starts a Friend Walk and escalates to SOS near a dark car park. The SOC sees the pin and the nearest camera auto-pops. The nearest Polis Bantuan officer is dispatched. The incident closes with a lighting fault ticket sent to Facilities.
2. **Lab after-hours.** A researcher's Work Alone check-in is missed. The SOC gets an alert, sees the lab camera and dispatches an officer. Separately, an after-hours intrusion alert fires on a hazardous lab.
3. **Hostel fall.** A person-down alert in a kolej stairwell triggers first aid and ambulance. The college principal is notified, a welfare referral goes to HEP, and the DPO logs the footage review.
4. **Bomb threat.** Templated mass notification goes out by geofence, students check in at assembly points, and the muster dashboard shows the result. The all-clear follows, and the after-action report is generated.
5. **Convocation day.** Event mode shows crowd density at the gates, LPR traffic flow and a lost child workflow.
6. **DPO audit.** The DPO shows who viewed which footage and why, how retention auto-purges, and that FR is disabled by policy.

---

## 9. Point of view 1: the university (Universiti Malaya, Kuala Lumpur)

### 9.1 UM key facts for demo seed data
These facts come from search snippets of UM documents and news. Each one carries a confidence note.

| Item | Value | Confidence / source |
|---|---|---|
| Campus area | **~350 ha (812 acres)** per UM inbound fact sheets. A company profile gives 373 ha (922 acres). | Medium ([S133]) |
| Location | Lembah Pantai / Pantai Dalam, south-west Kuala Lumpur, bordering Petaling Jaya. Main gate on **Jalan Universiti** (PJ side). Second access via **Jalan Pantai Baru** (the Law Faculty is "nearest the Jalan Pantai entrance"). | Medium ([S142], [S146], [S147]) |
| Students | **~27,000** (2022/23 fact sheet, including ~3,000 international). A 2025/26 fact-sheet snippet says **~30,000**. | Medium ([S133]) |
| Staff | **~2,000 academic** (~250 international) and **~3,500 non-academic** | Medium ([S133]) |
| Academic units | **~20 faculties, academies and centres**. 96 UG and 179 PG programmes. | Medium ([S133]) |
| Faculties confirmed in search | Arts & Social Sciences, Business & Economics, Built Environment, Science (largest: ~3,225 UG, ~1,470 PG), Pharmacy, Creative Arts, Medicine, Dentistry, Law, Engineering, Computer Science & IT. Academy of Islamic Studies, Academy of Malay Studies and Faculty of Education are *(general knowledge, verify)*. | Mixed ([S133], [S139], [S146]) |
| Teaching hospital | **UMMC / PPUM (Pusat Perubatan Universiti Malaya)**, adjacent to and physically connected with the Faculty of Medicine. Bed count: Wikipedia 1,617, government page ">1,000". The 99-bed **UM Specialist Centre (UMSC)** is also on campus. New operating theatres were announced in January 2026. | Medium ([S143]) |
| Heritage / landmark buildings | **Dewan Tunku Canselor (DTC)**: convocation hall, Brutalist, on the national heritage list. **Rimba Ilmu** botanic garden (~80 ha, with a Rare Plants and Orchid Conservatory). **Tasik Varsiti** (Varsity Lake). **Canselori** (Chancellery; UM Art Gallery on Level 5). **Perpustakaan Utama** (Main Library, near Law and FBE). **Dewan Budaya**. **Pusat Asasi Sains** bus station. | Medium ([S140]–[S142], [S146]) |
| Names from the brief **not verified** in search | "UM Sentral" (shuttle schedules say **"UM Central (UMC)"**), Kompleks Perdanasiswa, Kompleks Sukan / stadium, "KL Gate". Treat as plausible but unconfirmed. | Low |
| Transit | **Universiti LRT** station (Kelana Jaya Line) outside the northern entrance. RapidKL **T789** runs from KL Gateway–Universiti LRT to Pusat Asasi Sains, and **T632** runs from the library to Bukit Angkasa. | Medium ([S142], [S146]) |
| UM shuttle | Routes **A, B, B1, C** (in-campus). Routes **D, E** (off-campus: UM Central, International House, KK9). 2024 timetable: **AB, BA, C, E** from UMC and Pantai Permai. Stops include Pantai Dalam / Kerinchi / Vista, Section 17, International House, Jalan Universiti and KK9. **No service on weekends or public holidays**, with a midday break. Run by UM's estates/transport office (jhb/jpphb.um.edu.my, tel. 03-7967 7022). | Medium ([S144], [S145]) |
| Security organisation | **Security Office / Bahagian Keselamatan** (under the Registrar), established **1967**. **UM Auxiliary Police (Polis Bantuan)** formed **2015**, with police powers in the campus cordon. Functions include CCTV management and maintenance, a **24-hour monitoring counter**, a hotline, and investigating criminal complaints on campus. 24h hotline **03-7967 7070**, general line 03-7967 3470, keselamatan@um.edu.my (page updated May 2025). Older documents list 03-7967 7777. | Medium ([S90], [S91], [S154]) |
| Smart campus | UM was profiled for a "smart campus" digital transformation, and its JTM/PTM reports cover a "Smart Sustainable Campus" (*Kampus Lestari Pintar*) under the ICT Strategic Plan 2020–2030. **No public UM safety app or AI-CCTV project was found.** | Low–medium ([S153]) |

### 9.2 UM residential colleges (Kolej Kediaman, KK)
The UM residential college handbook (HEP) numbers the colleges as follows ([S134]):

| No. | Name | Notes |
|---|---|---|
| KK1 | **Kolej Tuanku Abdul Rahman (KTAR)** (formerly First Residential College, built **1959**) | Oldest ([S138]) |
| KK2 | **Tuanku Bahiyah** | [S134] |
| KK3 | **Tuanku Kurshiah** | [S134] |
| KK4 | **Bestari** | [S134] |
| KK5 | **Dayasari** | [S134] |
| KK6 | **Ibnu Sina** | Clinical students of medicine, dentistry and pharmacy ([S134]) |
| KK7 | **Za'ba** | [S134] |
| KK8 | **Kinabalu** | Mapped near the Faculty of Computer Science & IT ([S139], low confidence) |
| KK9 | **Tun Syed Zahiruddin** | **Off main campus, in Petaling Jaya**, "Zone 5" with **International House** and **Apartment Jepun** ([S134], [S136]) |
| KK10 | **Tun Ahmad Zaidi** | [S134] |
| KK11 | **Ungku Aziz** | Occupied 1998, opened 2004. Houses Foundation (PASUM / Islamic Studies foundation) students ([S135]) |
| KK12 | **Raja Dr Nazrin Shah** | Described as **UM's largest residential college** ([S137]) |
| KK13 | **Kolej Kediaman 13** (blocks include **Blok Zainab**) | Partly opened after student-council (KMUM) pressure. Site of an October 2025 fatal fall ([S149]) |

Counts in different sources range from 12 to 14 on-campus accommodations, depending on whether International House is counted. KPT stated in July 2026 that a new GLIC partnership will provide UM housing for **~10,000 students** ([S159]).

### 9.3 Reported UM incidents relevant to the demo (2016–2026)
| Date | Incident | Demo implication |
|---|---|---|
| 15 Oct 2024 | **Flash flood** on the main campus, water up to ~3 ft. Gates submerged from 10 am. **Law Faculty** hit hardest. Classes moved online. No injuries ([S147]). | Flood sensors, camera-based water-level alerts, gate closure, mass notification, class-continuity notice. |
| 22 Sep 2025 | Freak storm. **Fallen trees blocked the KL and Damansara-side entrances**, with flash flooding in low-lying areas ([S148]). | Road-blockage alerts, re-routing of shuttles, facilities work orders. |
| May 2016 | Flash floods left cars almost submerged in campus car parks ([S155]). | Car-park flood monitoring (historical hotspot). |
| Oct 2025 | Student **fell from KK13 (Blok Zainab)** and died. Police investigated ([S104], [S149], [S150]). | Rooftop/ledge access alarms, fall detection, welfare referral, Pengetua notification, sensitive comms. |
| Dec 2024 | Sexual harassment accusation against a UM lecturer. MOHE said UM had specific guidelines and left the probe to UM's (auxiliary) police ([S152]). | Confidential reporting lane, restricted case access, auxiliary police case file. |
| Ongoing | **Macaque intrusions** into residential colleges and faculties, mainly food-seeking (UM study, 2020) ([S151]). | "Wildlife intrusion" analytic, bin and food-waste hotspot map (a fun, low-privacy AI demo). |
| 2022–2025 | Student-housing shortage disputes with the KMUM student council ([S149]). | Occupancy dashboard per college. |
| Undated (old) | Armed heist at a campus ATM (RM2m) (search snippet, Malaysiakini). | ATM / cash-point monitoring. |

### 9.4 What UM stakeholders would want on their dashboards
| Stakeholder | Dashboard / view | Key widgets |
|---|---|---|
| **Director of Security / Komandan Polis Bantuan UM** | Command dashboard + SOC console | Live alarm queue by zone (main campus, KK9/PJ zone, UMMC perimeter). Response time (P50/P90) against target. Patrol coverage and missed checkpoints. Camera uptime. Top hotspots (car parks, KK entrances, Jalan Universiti and Jalan Pantai Baru gates, LRT walkway). Open cases. Weather/flood overlay. Event readiness (DTC convocation). PDRM liaison log. |
| **TNC HEPA (Deputy VC, Student Affairs & Alumni)** | Student-welfare and safety overview (aggregated) | Incidents involving students by category (accident, medical, harassment, bullying, theft, mental-health referral). Per-college trends. SOS / escort / safety-timer usage. Time-to-welfare-contact. Hostel visitor compliance. KPT inspection checklist status. **No raw video.** Drill-down only through case owners. |
| **Pengetua / Felo of each Kolej Kediaman** | College portal | Today's alerts in my college (door held or forced, rooftop access, fall, smoke/vape, wildlife). Visitor log and overstays. Occupancy by block. Maintenance issues (lighting, locks). Residents' anonymous reports (category only). Broadcast to residents. Duty fellow roster. |
| **Facilities (JPPHB) / estates** | Facilities ops | Device health (cameras, readers, Help Points). Lighting / dark-spot tickets from patrols and app. Flood and drainage hotspots (Law Faculty, car parks). Fallen-tree reports. Shuttle status and route disruptions. |
| **UMMC security liaison** | Shared perimeter view | Hospital-boundary incidents, ambulance access routes kept clear, campus-to-hospital handover. |
| **DPO (UM)** | Privacy centre | Footage access requests, exports, retention, DSARs, breach log, signage register, analytics-purpose locks. |

---

## 10. Point of view 2: the Ministry (KPT / Ministry of Higher Education)

### 10.1 The 20 public universities (Universiti Awam, UA)
The list is from the MOHE scholarship list of public HEIs and JDN 2026 lists ([S156], [S157]). The **state / main campus column is general knowledge** and should be checked against each university.

| # | Acronym | Full name | State (main campus) |
|---|---|---|---|
| 1 | **UM** | Universiti Malaya | WP Kuala Lumpur |
| 2 | **USM** | Universiti Sains Malaysia | Pulau Pinang |
| 3 | **UKM** | Universiti Kebangsaan Malaysia | Selangor (Bangi) |
| 4 | **UPM** | Universiti Putra Malaysia | Selangor (Serdang) |
| 5 | **UTM** | Universiti Teknologi Malaysia | Johor (Skudai) |
| 6 | **UIAM / IIUM** | Universiti Islam Antarabangsa Malaysia | Selangor (Gombak) |
| 7 | **UUM** | Universiti Utara Malaysia | Kedah (Sintok) |
| 8 | **UNIMAS** | Universiti Malaysia Sarawak | Sarawak (Kota Samarahan) |
| 9 | **UMS** | Universiti Malaysia Sabah | Sabah (Kota Kinabalu) |
| 10 | **UPSI** | Universiti Pendidikan Sultan Idris | Perak (Tanjong Malim) |
| 11 | **USIM** | Universiti Sains Islam Malaysia | Negeri Sembilan (Nilai) |
| 12 | **UMT** | Universiti Malaysia Terengganu | Terengganu |
| 13 | **UTHM** | Universiti Tun Hussein Onn Malaysia | Johor (Batu Pahat) |
| 14 | **UTeM** | Universiti Teknikal Malaysia Melaka | Melaka |
| 15 | **UMPSA** (formerly UMP) | Universiti Malaysia Pahang Al-Sultan Abdullah | Pahang |
| 16 | **UniMAP** | Universiti Malaysia Perlis | Perlis |
| 17 | **UniSZA** | Universiti Sultan Zainal Abidin | Terengganu |
| 18 | **UMK** | Universiti Malaysia Kelantan | Kelantan |
| 19 | **UPNM** | Universiti Pertahanan Nasional Malaysia | WP Kuala Lumpur (Sungai Besi) |
| 20 | **UiTM** | Universiti Teknologi MARA | Selangor (Shah Alam), with branch campuses nationwide |

**Private institutions (IPTS)** under KPT oversight:
- Legal basis: the **Private Higher Educational Institutions Act 1996 (Act 555)**, administered by the JPT governance unit ([S172]).
- Scale: 497 IPTS were registered in 2017 ([S174]). KPT audited 355 institutions and issued 82 compounds between 2019 and 2024 ([S173]).
- Example universities seen in this research: **Taylor's, Sunway, Monash University Malaysia, University of Nottingham Malaysia, UCSI, Multimedia University (MMU), UNITEN, Universiti Teknologi PETRONAS (UTP), Xiamen University Malaysia, APU, University of Cyberjaya** ([S106], [S107], [S175], [S102]).
- Enrolment (31 Dec 2025, MyMOHES): **1,264,541 total HE enrolments**, with **634,706 at public universities** ([S160]).

### 10.2 KPT's role, policies and signals relevant to campus safety
- **Inspection directive (2025).** All IPTs must run comprehensive and periodic safety inspections of campuses and residences, covering access control, CCTV, and safe, well-lit routes. KPT is working with PDRM on community policing, and new measures include hostel visitor entry/exit procedures and rapid incident response ([S99], [S100]). In February 2026 KPT said it was reviewing CCTV coverage and lighting, and that none of the 37 student deaths (2021–2025) involved criminal acts ([S165]).
- **Off-campus and private premises.** The *Off-Campus Student Management Guidelines (2021)* and *IPTS Premises Standards and Guidelines (2023)* must be fully implemented. Under Act 555, IPTS chief executives are accountable for student welfare ([S166]).
- **Residential colleges.** KSU Circular No. 3/2024, *Dasar Kemudahan Kolej Kediaman di IPTA*, builds on the 2012 IPTA hostel management guideline ([S158]). The target is **≥70% of full-time undergraduates housed by 2035**. There are 36 PPP college projects (15 complete, ~45,000 beds), and RM225m is allocated for hostel upgrades ([S159]).
- **Bullying.** **31 cases across 8 public universities, 2014–2025.** The measures cited are a reporting mechanism, **wider CCTV**, and awareness programmes. **Student Disciplinary Rules were standardised in 2024** ([S162]). The minister ordered VCs to monitor bullying after the UPNM cases ([S163]). In September 2026 the Health and Education ministries teamed up on bullying and self-harm, but that effort is school-focused ([S179]).
- **Crime statistics.** Police recorded **55 violent crimes** involving students on campuses in 2020–2021, and **154 thefts (2020) and 87 (2021)**. Selangor had the most student arrests ([S164]).
- **Mental health.** **402** public-university students were referred for counselling in 2024 (**0.067%**). A nine-month national study of UA students' mental health is under way, and the AIMI AI-companion prototype has been shown ([S167], [S168]).
- **Sexual harassment.** The ministry defers to each university's guidelines and police ([S152]). There are documented reporting gaps ([S114]).
- **Flood readiness.** In October 2024 the minister urged IPTs to prepare for the monsoon, with relief centres left to each university's management ([S171]). UMT activated a disaster operations room in 2023 (search snippet), and UMK prepared pumps in 2025 (search snippet).
- **AUKU (Universities and University Colleges Act 1971).** The PM announced in August 2026 that **AUKU will be fully repealed**. On 9 October 2026 (Budget 2027), **disciplinary proceedings at public universities relating to free speech, criticism and peaceful assembly were halted**, and KPT is preparing a replacement framework on autonomy, academic freedom and student rights ([S169], [S170]).
  - **Product implication:** a ministry-facing product must visibly exclude protest, assembly and speech monitoring.
- **PDPA.** See §7. **Biometrics** became sensitive data in April 2025, and DPO appointment and breach notification apply from June 2025 ([S111]).
- **AI ethics.** MOSTI's **National Guidelines on AI Governance & Ethics (AIGE, Sept 2024)** set seven voluntary principles, including fairness, privacy and security, and transparency ([S178]).
- **Digital / smart campus.** The *Digital Transformation of Higher Education Strategic Plan (2021)* sits under the Higher Education Blueprint 2015–2025, alongside MyDIGITAL. KPT expects universities to become smart campuses; UMS's Smart Eco-UMS 4.0 includes "smart security" ([S176], [S177]).

### 10.3 What a ministry oversight dashboard needs (aggregated, de-identified)
**Design principle:** KPT sees **aggregates and compliance status only**. It sees **no raw footage, no names, and no student IDs**. Small counts (for example, fewer than 5) are suppressed at university or college level to prevent re-identification. Drill-down stops at university-level category counts. Case detail stays with the university and is shared only through a formal escalation.

| Panel | Metrics | Rationale / source |
|---|---|---|
| **National overview map** | 20 UA + selected IPTS by state. Open high-severity incidents. Safety index. | Cross-university comparison |
| **Incident trends** | Monthly counts by category: accident (road, fall), sudden death / medical, violent crime, theft, bullying, harassment (reported), fire, flood, bomb threat, wildlife. Split by state, institution type (UA / IPTS / polytechnic) and location (campus / residence / off-campus). | Parliamentary statistics ([S101], [S162], [S164]) |
| **KPT inspection compliance** | % of residences with working access control. CCTV coverage of entrances and corridors. Lighting audit status of walkways. Hostel visitor SOP adoption. Last inspection date. | KPT 2025 directive ([S100]) |
| **Policy adoption tracker** | Anti-bullying reporting mechanism. Sexual harassment guideline. Off-campus guideline (2021). IPTS premises standards (2023). Student Disciplinary Rules (2024). Flood/BCP plan. Mental-health referral pathway. | [S162], [S166] |
| **Privacy & AI governance compliance** | DPO appointed. DPIA done for CCTV/AI. Retention policy. Signage. FR disabled or justified. Breach notifications filed. AIGE self-assessment. | PDPA 2024 ([S111]); AIGE ([S178]) |
| **Response benchmarks** | Median and P90 SOS-to-acknowledge and SOS-to-on-scene times. Escort turnaround. Camera/device uptime %. | Benchmarking across institutions |
| **Residential capacity & safety** | Beds vs enrolment (70% target). Incidents per 1,000 residents. Visitor overstays. | [S159] |
| **Student welfare (aggregate)** | Counselling referrals per 1,000 students. Time-to-first-contact. App welfare reports. | [S167], [S168] |
| **High-risk events calendar** | Convocations, orientation week (*Minggu Haluan Siswa*), inter-varsity sports (SUKIPT), monsoon season, exam weeks. Readiness status per event. | Graduation planning ([S128]) |
| **Escalations requiring ministry attention** | Deaths, serious injuries, bomb threats, mass-casualty events, sexual-violence allegations against staff, data breaches. Shown with status, owner and next update due. | MOHE probe practice ([S103], [S105]) |
| **Disaster readiness** | Flood-prone campuses, relief centre readiness, pump/sensor status, last drill date. | [S171] |
| **Explicit exclusions banner** | "This dashboard does not track individuals, protests, assemblies or speech." | AUKU repeal and free-speech halt ([S169], [S170]) |

---

## 11. Sources

All URLs below appeared in search results during this session. Direct fetching was blocked, so claims rest on search summaries. In-text citations **[Sn]** refer to item *n* below.

**Vendors and deployments**
1. https://genetec.com/binaries/content/assets/genetec/case-studies/en-university-of-georgia-case-study.pdf
2. https://www.securitysystemsnews.com/article/binghamton-university-unifies-campus-safety-tools-with-genetec
3. https://www.genetec.com/customer-stories/griffith-university
4. https://www.genetec.com/customer-stories/mount-royal-university
5. https://www.genetec.com/press-center/press-releases/2025/03/brigham-young-university-strengthens-campus-security-with-genetec-operations-center
6. https://www.parking-mobility.org/news/texas-am-modernizes-campus-parking-with-genetec/
7. https://resources.genetec.com/automatic-license-plate-recognition/ubc-license-plate-enable-parking
8. https://static.esmartcity.es/media/2021/09/genetec-mission-control.pdf
9. https://www.milestonesys.com/customer-stories/sheffield-hallem-university/
10. https://www.milestonesys.com/customer-stories/western-kentucky-university/
11. https://customvideosecurity.com/blog/case-study-suny-buffalo-expanding-campus-wide-security-buffalo-usa/
12. https://www.milestonesys.com/articles/briefcam-video-analytics-higher-education/
13. https://ipvm.com/reports/briefcam-examined
14. https://www.avigilon.com/case-studies/university-of-tennessee
15. https://avigilon.com/case-studies/marian-university
16. https://www.avigilon.com/case-studies/tampere-vocational-college
17. https://mayflex.com/images_mx_web/documentation/brochures/avigilon-alta/Avigilon_Alta_for_Higher_Education_Brochure.pdf
18. https://docs.verkada.com/docs/higher-education-solutions-intl.pdf
19. https://www.verkada.com/customers/chung-ang-university/
20. https://news.bloomberglaw.com/tech-and-telecom-law/verkada-says-hackers-accessed-cameras-of-95-customers
21. https://www.axis.com/customer-story/high-point-body-audio-intercom-analytics
22. https://www.axis.com/en-au/customer-story/binghamton-audio-intercom-analytics
23. https://www.hanwhavision.com/en/solutions/case-study/education/
24. https://www.ambient.ai/blog/university-northwestern-campus-safety-ambient-ai
25. https://techcrunch.com/2022/01/19/ambient-ai-security-without-facial-recognition/
26. https://ir.evolvtechnology.com/news-events/press-releases/detail/164/boston-college-using-evolv-for-weapons-detection-screening
27. https://securityjournalamericas.com/evolv-partners-with-belmont-university/
28. https://www.scrippsnews.com/politics/guns/ftc-settles-with-weapon-detector-maker-used-at-schools-stadiums-over-false-claims
29. https://now.temple.edu/news/2024-11-18/temple-becomes-first-university-region-deploy-zeroeyes-gun-detection
30. https://campussecuritytoday.com/articles/2024/10/30/university-of-new-haven-deploys-zeroeyes-proactive-security-technology.aspx
31. https://www.securityinfowatch.com/video-surveillance/video-analytics/press-release/53072947/zeroeyes-eastern-michigan-university-adopts-zeroeyes-ai-gun-detection-solution
32. https://www.omnilert.com/blog/ai-visual-gun-detection-protects-higher-education-from-gun-violence
33. https://abc7.com/post/student-handcuffed-doritos-bag-mistaken-gun-schools-ai-security-system-baltimore-county-maryland/18073796/
34. https://www.ravemobilesafety.com/about/newsroom/press-release/more-than-half-all-college-students-protected-rave-mobile-safetys-rave-alert-platform/
35. https://publicsafety.brown.edu/programsservices/rave-guardian-app
36. https://safety.umsl.edu/police/safety/rave.html
37. https://motorolasolutions.com/newsroom/press-releases/motorola-solutions-acquires-rave-mobile-safety.html
38. https://campustechnology.com/articles/2022/02/08/rave-mobile-safety-acquires-apparmor.aspx
39. https://www.motorolasolutions.com/en_us/blog/what-is-apparmor-custom-branded-safety-apps
40. https://www.ecampusnews.com/2016/01/06/campus-safety-apps-782/
41. https://police.ufl.edu/gatorsafe/
42. https://businessaffairs.ufl.edu/news/do-you-study-or-work-alone-often-then-this-new-safety-feature-is-for-you/
43. https://news.ufl.edu/2023/01/campus-safety-enhancements/
44. https://live.today.uic.edu/uic-launches-new-campus-safety-app
45. https://www.winthrop.edu/police/livesafe/
46. https://www.stjohns.edu/life-st-johns/public-safety/livesafe
47. https://campustechnology.com/articles/2014/08/26/arizona-state-adds-safety-mobile-app-allows-for-virtual-escort.aspx
48. https://edtechmagazine.com/higher/article/2026/05/real-time-security-centers-keep-watchful-eye-campus-activity
49. https://www.northumbria.ac.uk/about-us/news-events/news/2015/01/northumbria-university-is-first-in-europe-to-roll-out-free-safety-app
50. https://www.securityworldmarket.com/uk/Newsarchive/uk-universities-adopt-safezone-solution
51. https://york.ac.uk/safezone
52. https://www.inside.unsw.edu.au/campus-life/download-our-new-safezone-app
53. https://www.safetysolutions.net.au/content/personal-protection-equipment/case-study/safety-app-proves-popular-security-choice-at-uq-1072890718
54. https://www.securityinfowatch.com/school-security/press-release/53073085/criticalarc-is-a-global-technology-innovator-and-the-creator-of-the-distributed-command-and-control-solution-safezone-texas-am-university-kingsville-rolls-out-multi-function-safezone-platform
55. https://www.gre.ac.uk/articles/public-relations/safezone
56. https://www.dcu.ie/news/2017/nov/s1117m.shtml
57. https://student.griffith.edu.au/uni-life/campuses-and-facilities/on-campus-security
58. https://www.campussafetymagazine.com/university/tulane-everbridge-campus-safety
59. https://www.campussafetymagazine.com/press-releases/ucla-to-adopt-new-everbridge-emergency-notification-system/40209/
60. https://www.omnigo.com/industry/education
61. https://www.omnigo.com/productsheet/omnigo-clery-reporting
62. https://www.neomed.edu/wp-content/uploads/Ohio-Campus-Safety-Webinar.pdf
63. https://www.motorolasolutions.com/newsroom/press-releases/motorola-solutions-centers-workflows-around-measurable-missions.html
64. https://ipvm.com/reports/hikua-bans
65. https://www.hikvision.com/sa/newsroom/success-stories/education/crafting-a-digital-oasis-a-saudi-university-s-journey-to-smart-education
66. https://www.dahuasecurity.com/solutions/enterprise-solutions/education/campus
67. https://halodetect.com/
68. https://platform.softwareone.com/product/shotspotter-for-campus/PCP-9825-8937
69. https://www.aiphone.com/blogs/blue-light-emergency-phones/
70. https://community.iaclea.org/communities/canada/forum/topic/emergency-blue-phones
71. https://www.starrez.com/customers/leveraging-visitor-tracking
72. https://services.luc.edu/TDClient/33/Portal/Requests/Service/286/Maxient

**Privacy, ethics and controversy**

73. https://www.fightforthefuture.org/news/2020-01-27-new-scorecard-shows-which-colleges-are-using/
74. https://fightfortheftr.medium.com/backlash-forces-ucla-to-abandon-plans-for-facial-recognition-surveillance-on-campus-ebe005e3f715
75. https://gizmodo.com/campaign-to-ban-face-recognition-at-u-s-colleges-gathe-1841302162/amp
76. https://thechinaproject.com/2019/09/06/china-to-curb-facial-recognition-technology-in-schools/
77. https://cr80news.com/news-item/chinese-university-uses-facial-recognition-campus-entry/
78. https://www.wionews.com/world/facial-recognition-and-bathtime-bookings-how-chinas-universities-are-reopening-324219
79. https://www.aljazeera.com/news/2026/4/20/uk-universities-pay-to-spy-on-students-social-media-accounts
80. https://www.privacyinternational.org/examples/5399/university-melbourne-violates-privacy-laws-disciplining-student-protesters
81. https://www.thenation.com/article/activism/yale-university-surveils-pro-palestine-student-protests/tnamp/
82. https://www.miningjournal.net/news/2025/08/rights-groups-urge-college-to-end-surveillance-of-protesters/
83. https://www.gadgetreview.com/?p=416012
84. https://www.tribuneindia.com/news/delhi/citing-privacy-concerns-jnu-students-dismantle-face-recognition-system/amp
85. https://news.careers360.com/campus-monitoring-cyber-safety-key-focus-discussed-at-vice-chancellor-meet-west-bengal-governor

**Asia / Middle East deployments**

86. https://nus.edu.sg/inside-nus/stories/steadfastly-committed-to-campus-security
87. https://www.ntu.edu.sg/news/detail/ntu-to-ramp-up-tech-use-for-safety-and-security-needs-appoints-certis-as-campus-security-provider
88. https://www.sutd.edu.sg/news-listing/spore-universities-polys-explore-motion-sensors-and-other-tech-devices-to-deter-voyeurs/
89. https://www.kaust.edu.sa/privacy-notice/cctv-and-drones

**Malaysia**

90. https://registrar.um.edu.my/security-office
91. https://hep.um.edu.my/SPECIAL%20ACTIVITIES/UM-WOW/UMWOW2023/UG2023/Security%20Section.pdf
92. https://office.iium.edu.my/osem/?p=94
93. https://selangor.uitm.edu.my/index.php/en/auxillary-police-department
94. https://arkib.ums.edu.my/12753/1/UMS_Formed_Auxiliary_Police.pdf
95. https://keselamatan.uthm.edu.my/images/peraturan-keselamatan/POLISI_CCTV_UTHM.pdf
96. https://ftsm.ukm.my/v6/public/assets/file/technicalreport/A193888_TReport.pdf
97. https://ftsm.ukm.my/v6/public/assets/file/technicalreport/A193135_TReport.pdf
98. https://news.umpsa.edu.my/general/umpsa-enhances-campus-safety-and-well-being
99. https://www.mohe.gov.my/muat-turun/kenyataan-media/2025/1698-kenyataan-media-insiden-kematian-penuntut-universiti-kpt-komited-pastikan-persekitaran-selamat-kondusif-untuk-kesejahteraan-warga-pdf/file
100. https://www.sinarharian.com.my/article/769443/berita/nasional/37-insiden-ragut-nyawa-mahasiswa-direkod-dalam-tempoh-5-tahun
101. https://www.utusan.com.my/nasional/2026/02/37-insiden-kematian-direkod-di-kampus-sejak-2021/
102. https://www.thevibes.com/articles/news/109819/university-student-murdered-in-cyberjaya-mohe-orders-strict-compliance-with-campus-safety-sops
103. https://www.malaymail.com/news/malaysia/2025/06/26/this-grief-must-not-be-in-vain-bandar-kuching-mp-urges-campus-security-overhaul-after-students-death-in-cyberjaya/181807
104. https://www.nst.com.my/amp/news/nation/2025/10/1296783/um-student-dies-after-fall-campus-hostel
105. https://www.thevibes.com/articles/news/107275/higher-education-ministry-orders-full-probe-into-uum-students-death-on-campus
106. https://www.nst.com.my/amp/news/nation/2026/06/1456169/two-bomb-threats-48-hours-taylors-campus-declared-safe
107. https://www.monash.edu.my/pages/latest/articles/2026/urgent-security-notice
108. https://www.thestar.com.my/news/nation/2024/07/23/appeals-court-reinstates-death-penalty-for-six-ex-upnm-students-in-fatal-bullying-case
109. https://university.taylors.edu.my/en/student-life/support-and-services/safety-and-security.html
110. https://www.monash.edu/students/safety-security/bsafe-app
111. https://insightplus.bakermckenzie.com/bm/data-technology/malaysia-personal-data-protection-amendment-act-2024-to-come-into-force
112. https://www.rajahtannasia.com/?p=154128
113. https://www.malaymail.com/amp/news/malaysia/2019/07/23/cctv-recordings-protected-under-personal-data-protection-act-says-deputy-mi/1774090
114. https://thesun.my/malaysia-news/universities-urged-to-tackle-sexual-harassment-culture-EB13309490

**Roles, compliance, operations**

115. https://ucop.edu/ethics-compliance-audit-services/compliance/clery-act/clery-act-details.html
116. https://uncw.edu/seahawk-life/support-success/titleix-clery-compliance/clery-compliance/requirements
117. https://chapman.edu/campus-services/public-safety/about-us.aspx
118. https://dps.syr.edu/about/who-we-are
119. https://www.nottingham.ac.uk/estates/documents/security/cctv.cop.final.april2026.pdf
120. https://le.ac.uk/about/who-we-are/corporate-services/estates/security/about
121. https://www.worc.ac.uk/documents/policies/CCTV-policy-2024-v2.4.pdf
122. https://senate.ucsc.edu/archives/2023-24-senate-reviews/as_cpevc_policyautomatedlicenseplatereaders_011024.pdf
123. https://adminrecords.ucsd.edu/PPM/docs/460-7.html
124. https://www.dps.osu.edu/news/2022/03/01/cameras-lprs-being-added-near-ohio-union-garages
125. https://nyunews.com/tag/security-cameras/
126. https://academica.ca/top-ten/unb-introduces-workalone-module-to-unbsafe-app/
127. https://technicalservices.mech.ubc.ca/safety/procedures/working-alone/
128. https://www.campussafetymagazine.com/?p=167907
129. https://www.fingertec.com/images/brochure/TimeTec-Patrol-E.pdf
130. https://sunwayuniversity.edu.my/news/2023/sunway-universitys-crime-prevention-drive-foster-safer-community
131. https://www.strath.ac.uk/whystrathclyde/safe360/strathclydesos/
132. https://resources.vectorsolutions.com/hubfs/NPM%20Video%20Guide%20EDU.pdf?hsLang=en

**Universiti Malaya point of view**

133. https://www.otaru-uc.ac.jp/wp-content/uploads/2022/11/Universiti-Malaya-Fact-Sheet-for-Inbound-Mobility-Student.pdf
134. https://hep.um.edu.my/SPECIAL%20ACTIVITIES/UM-WOW/UMWOW2022/Buku%20Panduan%20KK%20UM%20V6.pdf
135. https://hep.um.edu.my/URUSAN%20PENEMPATAN%20PELAJAR/Kolej%20Kediaman%20UM/KK11.pdf
136. https://osa.nus.edu.sg/?p=22892
137. https://www.gcs.gov.mo/news/detail/en/N25GXx7Mdc
138. https://umalumni.um.edu.my/doc/File/eTitian/jun2013/files/basic-html/page26.html
139. https://ebook.um.edu.my/ips/UM20162017/files/basic-html/page67.html
140. https://creativearts.um.edu.my/dewan-tunku-canselor
141. https://www.nst.com.my/amp/news/nation/2025/11/1325895/um-unveils-exclusive-model-block-dewan-tunku-canselor
142. https://www.penang-traveltips.com/malaysia/kuala-lumpur/university-of-malaya.htm
143. https://en.wikipedia.org/wiki/University_of_Malaya_Medical_Centre
144. https://jhb.um.edu.my/img/Pengangkutan/Oct.24/JADUAL%20SHUTTLE%202024.pdf
145. https://um.edu.my/transportation-amp-travel
146. https://fbe.um.edu.my/getting-here
147. https://www.malaymail.com/news/malaysia/2024/10/15/um-forced-to-cancel-classes-as-campus-hit-by-floods-but-says-situation-improving-video/153704
148. https://www.malaymail.com/news/malaysia/2025/09/22/freak-afternoon-storm-batters-klang-valley-uproots-trees-and-wrecks-vehicles-video/192017
149. https://www.bharian.com.my/amp/berita/nasional/2025/10/1460282/bhplus
150. https://www.malaymail.com/news/malaysia/2025/10/17/um-confirms-student-hurt-after-fall-at-campus/194977
151. https://adab.um.edu.my/index.php/MJS/article/download/15727/12257/59718
152. https://www.malaymail.com/news/malaysia/2024/12/21/higher-ed-ministry-give-space-to-um-police-to-probe-sexual-harassment-accusation-against-lecturer/160638
153. https://technologymagazine.com/company/how-university-malaya-creating-smart-campus-its-trailblazing-digital-transformation
154. https://registrar.um.edu.my/news/security-info
155. https://www.malaymail.com/news/malaysia/2016/05/14/students-cars-submerged-in-flash-floods/1119585

**KPT / ministry point of view**

156. https://biasiswa.mohe.gov.my/sukan/doc/SENARAI%20INSTITUSI%20PENGAJIAN%20TINGGI%20AWAM(UA).pdf
157. https://www.jdn.gov.my/wp-content/uploads/2026/04/5.-Lampiran-B-Senarai-IPT-DN-HLP-Tahun-2026.pdf
158. https://mohe.gov.my/warga/muat-turun/pekeliling/arahan-pentadbiran/1651-surat-pekeliling-ketua-setiausaha-kementerian-pendidikan-tinggi-bilangan-3-tahun-2024-dasar-kemudahan-kolej-kediaman-di-institusi-pendidikan-tinggi-awam-pdf/file
159. https://www.malaymail.com/news/malaysia/2026/07/13/beds-not-enough-higher-ed-minister-vows-70pc-hostel-coverage-by-2035-prioritising-b40-needs/227389
160. https://berita.rtm.gov.my/nasional/senarai-berita-nasional/senarai-artikel/pelajar-antarabangsa-hanya-12-6-peratus-daripada-keseluruhan-enrolmen-ipt/
161. https://mohe.gov.my/en/download/statistics/2024-4/1702-bab-1-makro-2024-update-pdf/file
162. https://www.malaymail.com/news/malaysia/2025/08/12/public-universities-logged-31-bullying-cases-from-2014-to-2025-zambry-tells-dewan-rakyat/187323
163. https://www.malaymail.com/news/malaysia/2024/11/12/zambry-calls-for-firm-action-and-education-reforms-pledges-collaboration-with-defence-ministry-over-upnm-bullying-cases/156637
164. https://www.themalaysianinsight.com/s/347861
165. https://www.thevibes.com/articles/news/119968/thirty-seven-student-deaths-recorded-over-five-years-parliament-told
166. https://thesun.my/malaysia-news/govt-tightens-campus-safety-rules-after-cyberjaya-murder-GH14575388
167. https://www.malaymail.com/news/malaysia/2025/08/20/are-students-unaware-or-just-coping-well-mohe-says-counselling-numbers-low-as-nationwide-mental-health-study-nears-completion/188342
168. https://thesun.my/malaysia-news/news-malaysia-news-402-public-university-students-referred-for-counselling-in-2024-ga14724992/
169. https://www.theborneopost.com/2026/08/16/anwar-auku-to-be-fully-repealed-no-new-law-to-restrict-student-activities/
170. https://malaymail.com/news/malaysia/2026/10/09/budget-2027-government-halts-public-university-disciplinary-proceedings-relating-to-free-speech/238455
171. https://thestar.com.my/news/nation/2024/10/05/universities-told-to-prepare-for-floods
172. https://lawplayer.com/my/act/act-555
173. https://master.nst.com.my/amp/news/nation/2024/11/1132849/82-private-higher-education-institutions-fined-2019
174. https://www.malaymail.com/news/malaysia/2017/07/26/e-ipts-provide-clear-student-data/1429043
175. https://www.easyuni.my/advice/qs-world-university-rankings-2027-malaysia-3475/
176. https://utmcdex.utm.my/wp-content/uploads/2022/12/Final-Report-WP-for-print.pdf
177. https://arkib.ums.edu.my/4629/1/UMS%20embarking%20on%20digital%20transformation.pdf
178. https://rahmatlim.com/publication/articles/29430/issues-national-guidelines-on-artificial-intelligence-governance-and-ethics-key-principles
179. https://www.thestar.com.my/news/nation/2026/09/28/health-education-ministries-join-forces-to-curb-student-bullying-self-harm

**Uncertainty notes**
- AppArmor's "400+ universities" figure from the brief could not be verified. Sources give 60 institutions (older) and Rave's claim of about 75% of North American higher ed after the merger ([S38], [S40]).
- The completion of NTU's command centre (planned for end-2024) is unverified.
- LiveSafe's current ownership is unverified.
- No Malaysian public university AI-CCTV or FR deployment was found in this search. UTM, UKM and UiTM-specific smart-campus security projects are unverified.
- Whether the PDPA applies to statutory public universities needs legal confirmation.
- UM: the names "UM Sentral", Kompleks Perdanasiswa, Kompleks Sukan and "KL Gate" were not confirmed in search. Shuttle documents use "UM Central (UMC)". The campus area is given as 350 ha or 373 ha depending on the source. The student total is ~27k (2022/23) or ~30k (2025/26 snippet). The UMMC bed count is 1,617 (Wikipedia) or ">1,000" (government page).
- KPT: the name and functions of the ministry's student-affairs division were not confirmed. The state column of the 20-UA table is general knowledge.
