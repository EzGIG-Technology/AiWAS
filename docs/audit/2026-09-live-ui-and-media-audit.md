# Live UI audit — camera media and navigation reachability

September 2026. Audited against a local build of `main`, driven in Chromium at
1520×960, 1440×900, 1280×800, 1366×768 and 375×780, in both themes, as School
administrator and as Superadmin.

`ai-was.vercel.app` itself is not reachable from the build sandbox — the egress
proxy rejects the connection — so everything below was measured against a
locally served build of the same commit rather than the deployed site. The two
are the same bundle; the deployment step is the only thing not verified here.

## What the audit found

### 1. Six of eight estates had no footage at all

`mediaFor` mapped a zone name against a table of school zones. Every other
estate fell through to the empty string, and `CameraStill` renders "No sample
scene available" for an unknown scene. Counted per industry:

| Screen | Blank tiles |
| --- | --- |
| Overview | 4 |
| Operations room | 5 |
| Live cameras | 6 |
| Validation queue | 11 |

Twenty-six blank tiles per estate, across seven estates. An operator console
that renders "no scene" in half its tiles does not read as a demonstration; it
reads as a broken deployment.

The detection registers compounded it. Every capability carries a `scene` used
to illustrate it, and all 115 non-education capabilities pointed at one of the
nine school scenes — a forklift/pedestrian rule in a distribution centre was
illustrated with a school corridor.

**Closed.** 51 monitored zones now each have their own synthetic CCTV still,
and 53 scenes have a matching six-second loop animated from that same still, so
the poster and the clip are the same place. The registry, the zone-to-scene map
(keyed by industry, because "Main entrance" is both a hospital and a care home),
and the capability scenes are all industry-specific. Five tests hold the table
and the files on disk together.

### 2. Two navigation sections were below an invisible fold

The rail holds nine sections for a school administrator and ten for a
superadmin. Header, list and footer came to roughly 1,060px, so at 960px the
last two — **Detection centre** and **Administration** — sat below the scroll
fold of a container with no visible scrollbar. Ten screens behind them:
detection rules, advanced tuning, test & evaluate, team & access, schools,
escalation routing, privacy & approvals, commissioning, device configuration
and edge monitoring.

They were reachable — the container scrolled 99px — but nothing said so. The
list appeared to end at "Teacher app".

**Closed.** The rail is tightened so every section fits, with a denser variant
below 880px of viewport height; and where it still overflows it now keeps a
visible scrollbar and fades its last line instead of slicing it. Verified: zero
items below the fold at 1520×960, 1440×900, 1280×800 and 1366×768, for both the
school and the superadmin rail.

### 3. A clip that cannot decode left a dead player

`DemoVideo` rendered an error line *underneath* a video element that was still
showing its poster and its controls. A viewer saw a player that looked ready
and a message saying it had failed.

**Closed.** On a decode error the component now falls back to the scene still
with "Still frame · This browser cannot play the demonstration clip". Same
camera, same moment, no dead controls.

## Verified

- Typecheck clean; 85 tests pass; lint clean across `app/` and `tests/`.
- Seven server-render smoke checks pass.
- Every one of the eighteen sub-views reachable from the eight school sections
  renders with no missing scene, no broken image, no horizontal overflow and no
  console error, in light and dark.
- Superadmin exposes all seven Administration sub-views and the Security
  section, so the role gating narrows the school view rather than stranding
  screens.
- 375px wide: zero horizontal overflow in both themes.

## Known limits

- **Clip playback is not verified in this sandbox.** The bundled Chromium is an
  open-source build without H.264, so no `.mp4` in the repository plays here —
  including the nine that predate this work. The files are served (HTTP 200,
  1920×1080, 25fps) and will play in Chrome, Safari or Edge. The new still
  fallback is what this sandbox exercises.
- **Seven commercial-property zones share the ground-lobby clip.** Their own
  clips were not generated because the media credit ran out mid-batch. Their
  stills are their own, and the redirect is declared in the table rather than
  implied.
- **Nothing selects an industry any more.** `main` removed the industry switch
  and pinned the interface to education. The registry, the seeds and the
  components still take an `industryId`, so the seven other estates remain
  built and tested — but no control in the current navigation reaches them.
  Restoring the switch is a product decision, not a code change of any size.

## Not real footage

Every scene is generated. The people in them are not real people, no child
appears in any frame, and the tracking rectangles are hand-placed illustrations,
not detector output. The `SYNTHETIC SCENE` stamp and the disclosure line under
each clip say so in the interface.
