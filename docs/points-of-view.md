# Two points of view: Universiti Malaya and KPT

EzVision is a **camera-intelligence** product. It adds AI analytics to a university's existing CCTV and turns the result into information people can use: detections an operator verifies, anonymous counts, vehicle and crowd figures, and searchable footage. It is not a safety-desk system. There is no SOS, dispatch, mass notification or welfare casework; those belong to the systems a university already runs, and EzVision hands a verified clip to them.

The demo shows the product from two sides: Universiti Malaya running its own cameras, and the Ministry of Higher Education (KPT) looking across every university.

The core rule is the same on both sides: the further a person sits from the camera, the less detail they see.

- **Operator:** sees live video.
- **Facilities planner:** sees counts.
- **KPT:** sees aggregates by university, with small numbers suppressed.

## Universiti Malaya

| Who | What they need from the cameras | Where in the demo |
|---|---|---|
| **Director, Security Technology** | Camera uptime and gaps in coverage; which analytics run where and how often they are right; time to verify; the CCTV evidence for KPT's inspection directive | Overview, Cameras & edge health, AI analytics, Reports |
| **Video analytics operator** | One queue of AI detections, each with its camera, clip and model confidence; verify or reject each one; share verified clips; find recorded moments fast | AI detections (with the event sheet), Video wall, Camera map, Footage search |
| **Facilities & space planning** (no footage) | How full each space is now and across the week; footfall by hour; car-park occupancy and gate traffic; crowd density at events | Occupancy & footfall, Vehicles & parking, Crowd analytics, Reports |
| **Data protection officer** (no footage) | Who viewed, searched or exported which footage and why; footage requests to approve; retention; DPIAs | Privacy centre, AI analytics & exclusions, Users & roles |
| **Mobile responder** | Camera alerts on the phone; live view; verify, reject or keep a clip; which cameras are down | EzVision Mobile |

UM facts used in the demo (verify before showing it externally):

- About 350 ha in Lembah Pantai.
- KK1–KK13 plus International House. KK9 and International House are in Zone 5, Petaling Jaya.
- Dewan Tunku Canselor, Perpustakaan Utama, Canselori, Rimba Ilmu and Tasik Varsiti.
- UMMC on campus.
- Main gate on Jalan Universiti, and an entrance off Jalan Pantai Baru.
- UM Central shuttle hub, and the Universiti LRT station.

Several detections reflect real campus conditions:

- The basement car-park water-level detection reflects the October 2024 flash flood.
- The macaque detection reflects macaques entering residential colleges.

Every detection, count, plate and person in the demo is fictional.

## KPT (Kementerian Pendidikan Tinggi)

| Who | What they need | Where in the demo |
|---|---|---|
| **Ministry leadership** | How much of the national camera estate has analytics, how well it works, and where to act | National overview (state map, maturity ranking) |
| **Jabatan Pendidikan Tinggi** | Each university's status on the CCTV items of the 2025 safety-inspection directive: entrances and corridors covered, uptime of at least 95%, repairs within 72 hours, coverage map, retention, signage and rooftops | Universities, CCTV coverage & uptime |
| **Analysts** | National detection volumes by category; detections per camera; precision and time to verify per university | Detection trends |
| **Data protection / legal** | DPO, DPIA for CCTV and analytics, retention, signage, facial recognition switched off, audited search, AIGE self-assessment | Privacy & AI governance |

What KPT never sees:

- Footage, images, plate numbers, camera identifiers or names.
- Any count from 1 to 4 at institution level. These show as "<5".
- Anything about protests, assemblies or speech. The banner on every KPT screen says so.

Universities not on EzVision file a manual return. For them, uptime, detections and precision show as "—" rather than a guess.

UM's row in the KPT view is computed from UM's own workspace, so the two points of view agree, and a test enforces it. The row covers:

- Camera count.
- Uptime.
- Precision.
- Time to verify.
- CCTV checklist.
- Privacy controls.

Rows for every other institution are generated demonstration figures.
