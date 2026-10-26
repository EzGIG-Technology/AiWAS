# Two points of view: Universiti Malaya and KPT

EzVision Campus Safety is shown from two sides: a university running its own safety operation, with Universiti Malaya as the example, and the Ministry of Higher Education (KPT) overseeing every university.

This page maps what each person needs, based on the research in [university-campus-safety-audit.md](research/university-campus-safety-audit.md) §9–§10 and [stakeholder-information-needs.csv](research/stakeholder-information-needs.csv), to the screen in the demo that answers it.

The core rule is the same on both sides: the further from the incident a person sits, the less detail they see. The SOC operator sees live video. The Deputy VC sees counts by college. KPT sees counts by university, with small numbers suppressed.

## Universiti Malaya

| Who | What they need to know | Where in the demo |
|---|---|---|
| **Chief Security Officer / Komandan Polis Bantuan** | Alarms by zone; P50/P90 response against target; patrol coverage and missed checkpoints; camera uptime; flood and weather; convocation readiness | Command overview, Patrol & dispatch, Devices & health, Events, Reports |
| **SOC operator** | One queue for AI video, door alarms, app SOS, help points and patrol reports; nearest camera; nearest officer; SOP checklist | Alarm queue (incident sheet), Video wall, Campus map, SOS & safe walks |
| **Pengetua (KK12)** | Tonight's alarms in my college (door held, rooftop, wildlife); visitors and overstays; occupancy; repairs; residents' reports by category; notice to residents | My college · KK12, Visitors & vehicles, Emergency & alerts |
| **TNC HEPA (Deputy VC, Student Affairs)** | Student cases by category and college; SOS and safe-walk use; time to welfare contact; KPT inspection status. **No video** | Student welfare, Reports & KPT inspection |
| **Data protection officer** | Who viewed or exported which footage and why; pending requests; retention; DPIAs; breaches | Privacy centre, AI analytics & exclusions, Users & roles |
| **Student or staff member** | Help now (SOS); a walk home someone is watching; a safety timer; confidential reporting; alerts; "I'm safe" check-in | EzSafe app |
| **Patrol officer** | Where to go, what is there, what the camera shows; guard tour; reporting with a photo | EzPatrol app |

UM facts used in the demo (verify before showing it externally):

- About 350 ha in Lembah Pantai.
- About 27,000 students.
- KK1–KK13 plus International House. KK9 and International House are in Zone 5, Petaling Jaya.
- Dewan Tunku Canselor, Perpustakaan Utama, Canselori, Rimba Ilmu and Tasik Varsiti.
- UMMC on campus.
- Main gate on Jalan Universiti, and an entrance off Jalan Pantai Baru.
- UM Central shuttle hub, and the Universiti LRT station.
- Security office (Bahagian Keselamatan) since 1967; Polis Bantuan since 2015.

The scenario draws on real reported risks: the October 2024 flash flood that hit the Faculty of Law, the September 2025 storm that blocked entrances with fallen trees, and macaques entering residential colleges. Every incident, person and number in the demo is fictional.

## KPT (Kementerian Pendidikan Tinggi)

| Who | What they need to know | Where in the demo |
|---|---|---|
| **Ministry leadership** | National trends by category and state; which universities need attention | National overview, Incident trends |
| **Jabatan Pendidikan Tinggi (UA and IPTS governance)** | Each university's status against the 2025 safety-inspection directive (access control, CCTV, lighting, hostel visitor procedure, rapid response); policy adoption | Universities, Inspection & compliance |
| **Student affairs / welfare** | Counselling referrals per 1,000 students; residential capacity against the 70%-by-2035 target | Residential & welfare |
| **Disaster readiness** | Flood-exposed campuses before the monsoon; last drill; BCP in force; high-risk events | Disaster & events |
| **Data protection / legal** | DPO appointed, DPIA, retention, signage, facial recognition disabled, AIGE self-assessment | Inspection & compliance, Privacy & AI governance |
| **All oversight users** | Escalations that need the ministry, each with an owner and the time of the next update | Escalations |

What KPT never sees:

- Footage, names, student IDs or camera identifiers.
- Any count from 1 to 4 at institution or college level. These show as "<5".
- Anything about protests, assemblies or speech. The banner on every KPT screen says so. Free-speech disciplinary cases at public universities were halted on 9 October 2026, and AUKU is being repealed.

UM's row in the KPT view is computed from UM's own workspace: camera count, P90 response, open high-severity incidents and privacy controls. The two points of view therefore agree, and a test enforces it. Rows for every other institution are generated demonstration figures.
