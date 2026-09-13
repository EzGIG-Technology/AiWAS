# 3D site map

Added 13 September 2026.

A schematic 3D plan of the selected site with three layers. It exists to answer "where is everyone, and where can we not see?" without inventing a capability the platform refuses to build.

## Why it is not a live student tracker

The request was a 3D map showing where all the students are. A literal live per-pupil position layer would need continuous identification of named children — which is the one thing this platform's design, every industry exclusion list in it, MOE's non-biometric position and the PDPA's treatment of biometric data as sensitive personal data all rule out. It would also be untrue: no camera in this system identifies anyone.

So the map shows the three things that are real and that a school actually needs during an incident:

**1. Anonymous occupancy.** Estimated people per area from a single camera view. The layer knows how many, never who. Enforced by test: the occupancy record carries only zone, count, capacity, coverage and pressure — no per-person field can be added without failing.

**2. Camera coverage.** Where cameras are, which are online, and which areas are dark. An area without coverage reports **"No coverage"** and never zero, because an unwatched area is not an empty one. This is the same principle the capability registers carry as the `tamper` and `stale` capabilities, made visible on the plan.

**3. Last recorded observations.** For education, where a presence register exists, each pupil is placed at the area of their **last recorded observation** — a gate reader event or a staff confirmation — with the age of that record and its source attached. A record older than 45 minutes is marked stale, and one needing verification is marked unverified, precisely so the map cannot be misread as current. The panel states in the interface that this is not live tracking.

That third layer is the honest version of the request, and it is the version that helps in the situation that matters: a missing pupil, or a roll call after an evacuation, where what you need is "last seen at the canteen at 10:14, teacher confirmation" rather than a false dot on a floorplan.

## Implementation

`app/site-layout.ts` holds plan geometry for all eight industries on an abstract 100 x 72 plot, plus the deterministic occupancy and observation placement functions. `app/site-map.tsx` renders it.

Rendering is CSS 3D transforms, not WebGL. The scene is a few dozen extruded plates; a 3D renderer would have added hundreds of kilobytes to a bundle already flagged oversized for no gain at this fidelity. Each area is a box of five faces; markers counter-rotate against the stage so they always face the viewer. Drag to orbit, with rotate, plan-view, reset and zoom controls for anyone not using a pointer.

Presence state was lifted out of `PresencePanel` into `app/presence-data.ts` so the register and the map read one source rather than two copies that drift.

## Limits

The geometry is schematic, not surveyed. It must not be used to measure a distance, plan an evacuation route, or claim someone is standing at a point. Occupancy figures are generated, not measured. The observation layer is a demonstration over twelve fictional records. Nothing here changes the platform's release blockers.

## Verification

TypeScript clean, 48/48 tests (9 new), application lint clean, static build and render smoke passing. Browser-verified across five industries: real 3D transforms applied (`matrix3d`, `preserve-3d`), orbit and plan-view controls change the projection, coverage gaps render as "No coverage" with no zero anywhere, the observation layer appears only for education and states that it is not live tracking, area selection populates the inspector, and no horizontal overflow at 375 px. One defect was found and fixed during that pass: wall faces were intercepting clicks intended for the area's top face.
