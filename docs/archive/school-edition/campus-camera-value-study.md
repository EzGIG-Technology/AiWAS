# Everyday value from school CCTV

## Product direction

The camera network should help a school run a calmer, better organised day as well as respond to safety incidents. Useful questions are concrete: where is the canteen queue building, when should a gate steward be present, which corridor is busiest at class change, and whether a booked shared space is being used. The revised UI makes these questions visible in Campus insights and removes the Facilities & health workspace.

The strongest opportunity is an observation-to-action cycle: measure a clearly defined public area, identify a recurring pattern, assign a school-owned action, and compare equivalent periods after the change. Raw camera count, a colourful map or an unexplained “AI score” is not itself a benefit. The product should show the operational decision each statistic can support.

This assessment uses current public documentation from Axis, Verkada and Milestone/BriefCam, checked on 12 September 2026. It is a focused school-operations study rather than an exhaustive market audit. Vendor examples describe intended uses, not independently verified savings or proof that a feature works with AiWAS's cameras.

## What comparable platforms demonstrate

Verkada's occupancy dashboard documentation specifically discusses K–12 movement patterns, bottlenecks, staffing and resource allocation. It distinguishes crossing events from aggregate occupancy, and describes combining multiple entrance views into a space-level dashboard. That supports a school-zone dashboard with comparable time windows, while also making clear that a single camera's count is not automatically the number of distinct people in a building. [Verkada, Occupancy Trends dashboard](https://www.verkada.com/blog/new-occupancy-trends-dashboard/), 24 September 2024.

Axis describes school people-counting and occupancy applications as useful for understanding traffic and the use of shared areas. Its People Counter manual explains that a multi-entrance occupancy estimate requires coverage at each entrance. AiWAS should consequently display coverage completeness beside the statistic, not show a missing view as zero people. The specific camera model, mounting and counting method still require local validation. [Axis, Smart technologies for safe learning](https://newsroom.axis.com/en-us/blog/technologies-safe-learning); [AXIS People Counter manual](https://help.axis.com/en-US/axis-people-counter).

Milestone's BriefCam campus material describes analysing occupancy, dwell and movement to understand space usage and plan resources. Its examples concern higher education, so they are a design reference rather than direct evidence for Malaysian primary or secondary schools. For AiWAS, entrance and public-space observations are a better initial scope than classroom behaviour monitoring. [Milestone, How video analytics supports higher education campuses](https://www.milestonesys.com/articles/briefcam-video-analytics-higher-education/).

## Statistics worth showing now

| Statistic | School decision | Implemented UI | Important boundary |
| --- | --- | --- | --- |
| Estimated people by zone | Identify crowded public areas | Clickable colour-coded campus map | Visible-area estimates, not a named pupil count |
| Entry and exit volume | Understand movement demand | Directional crossing totals and movement heatmap | The same person can cross repeatedly |
| Average zone dwell | Find areas where people stay longer | Dwell heatmap and selected-zone detail | Dwell is not automatically queue waiting time |
| Queue length | Review serving lanes and break arrangements | Synthetic canteen queue estimate | Needs a defined queue region and validated counting |
| Peak sampled occupancy | Plan supervision for busy periods | Six-window trend chart | Peak among samples, not an all-day maximum |
| Samples above a threshold | Identify repeated pressure | Per-zone threshold and sample count | An operational review setting, not certified safe capacity |
| Observed space use | Check recurring demand for shared areas | Samples with at least five people | Not a daily utilisation percentage |
| Vehicle arrivals and dwell | Plan collection and gate coverage | Arrival/dismissal panel | No number plates, driver identities or calibrated speed claims |
| Coverage availability | Identify blind spots before interpreting counts | Unknown/offline map regions and table | Production needs timestamps, calibration and coverage geometry |
| Matched-period comparison | Explore a before/after review | Fictional comparison in zone detail | No causal benefit or cost savings established |
| Action follow-through | Make the information operational | School action list with owner and reviewed state | Session-only planning; no staff messages sent |
| Crowd concern | Connect operations to response | Create an incident from a selected zone | Unverified staff-requested demonstration record |

The initial map is a schematic of six existing sample camera zones, not an uploaded floor plan. It has three metrics and six separate 15-minute observation windows spanning arrival, lessons, break, lunch, dismissal and after school. Replay advances between those samples. It does not interpolate a continuous day or manufacture a campus population from overlapping views.

## What is still missing and worth adding

### 1. Timetable and shared-space booking integration

This is the highest-value next operational integration. A school needs to know whether a space is unexpectedly busy or appropriately busy for a scheduled event. Connect lesson transitions, assembly periods, shared-space bookings, examinations and school holidays, then compare observations with the relevant schedule.

Useful outputs include repeatedly unused bookings, unexpectedly crowded transition windows and alternatives for a shared-space allocation. Do not infer that a lesson was skipped or a teacher failed to teach from an empty doorway count. Initial measurements can be placed at public entrances without introducing classroom surveillance.

**Needed beyond the current UI:** a schedule import or API, room/zone mapping, booking ownership, exception handling and calendar-aware comparisons. The current planning panel explains this opportunity but does not import a timetable.

### 2. Queue-specific service measurement

The canteen is a tangible school-interest use case because long queues reduce time available to eat and socialise. Add validated queue length, waiting-time distributions and service throughput, then compare one versus two serving lanes or staggered break groups.

Queue-specific tracking must distinguish waiting from people who walk past or remain in a seating area. The current average zone dwell must not be relabelled as waiting time. Meal-demand forecasting would also need transaction or meal-order data; people visible in the canteen do not equal meals purchased.

**Needed:** queue polygons, a validated start/end definition, anonymised track handling and optional point-of-sale or meal-order integration. The current UI provides sample queue length and planning actions, not a real service-time model.

### 3. Duty roster and task delivery

A heatmap becomes more valuable when the duty lead can assign an adult to an observed bottleneck. Connect the staff roster and approved responsibilities, propose an available team, request acknowledgement and record arrival or completion. Staff should retain control of assignments.

Avoid inferring work performance from how long a teacher appears on camera. The objective is adequate coverage, not covert attendance or productivity scoring. A future lightweight staff application could show an assigned action and acknowledgement controls, consistent with the earlier decision to defer the mobile UI.

**Needed:** authenticated staff accounts, roster availability, delivery receipts, escalation rules and durable action records. The new action list demonstrates ownership and review, but no notification is delivered.

### 4. Comparable-period intervention review

School leaders should be able to test whether staggered dismissal or an extra serving lane helped. Compare equivalent weekdays, enrolment, event types, weather and observation coverage. Display sample size, excluded periods and missing data. A before/after chart should be a decision aid, not a claim of causality.

Useful indicators include peak queue length, p95 waiting time where validated, repeated threshold exceedances and time to staff acknowledgement. The synthetic comparison in the UI demonstrates the layout only. It does not measure a real improvement.

**Needed:** a calendar, continuous timestamped observations, coverage-quality flags and an intervention log. No financial return should be computed without independently supplied cost and outcome data.

### 5. Camera coverage and investment planning

A school may gain more from moving one camera than installing several more. Map actual camera fields of view against public paths, entrances and known blind spots. Show overlapping regions, unavailable periods and whether the chosen installation supports the desired analytic.

A true density statistic also needs an agreed measured area and suitable perspective calibration. The current heatmap colours occupancy by section, not people per square metre. That distinction matters when comparing a small corridor with a large courtyard.

**Needed:** an authorised school plan, public-area boundaries, calibration records, detector compatibility and capture-time telemetry. The existing schematic and unknown-state behaviour are the UI foundation.

### 6. A weekly leadership brief

Provide a short report covering recurring congestion, observed space use, missing coverage, agreed actions and results from comparable periods. Let the school select recipients and review it before sharing. Cross-school comparisons need consistent denominators and context; ranking schools by raw incident or crowd counts would be misleading.

**Needed:** durable analytics, period aggregation, role-controlled exports and approved delivery. The current CSV export contains the selected synthetic observation window only. It is not a scheduled reporting service.

## Features to avoid

Do not add named pupil movement trails, face-based attendance, emotion detection, classroom engagement scores or behavioural “risk” rankings to create more statistics. These would change the scope and cannot be justified by an anonymous public-area heatmap. Preserve the difference between welfare support and visual inference.

Do not display a whole-school occupancy number by summing overlapping camera views. Do not interpret an offline camera as an empty room, a crowd estimate as an evacuation headcount, or high footfall as proof of a service problem. A busy canteen during break can be entirely normal; the practical questions are whether movement is safe and whether the service works for pupils.

## Current delivery and limits

Campus insights now contains the heatmap, selectable metrics and time windows, sample replay, camera-context imagery, coverage-aware zone detail, editable operational thresholds, trend charts, movement and vehicle panels, planning actions and CSV export. It is accessible from the sidebar and a prominent overview link.

Facilities & health has been removed from navigation, the launchpad and the available concept modules. Six entries in the earlier study coverage register are explicitly marked as removed from the current scope. Relevant core safety capabilities, such as an emergency medical response or a smoke warning, remain in their existing response or detection areas; removing the facilities workspace does not remove urgent school safety response.

All new observations are synthetic. The page does not analyse the media, connect cameras, persist records after refresh or send staff notifications. The next implementation milestone should connect a small, well-defined camera region and validate the resulting counts before broadening the analytics.
