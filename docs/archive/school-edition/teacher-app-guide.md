# AiWAS teacher app

Open **Teacher app** in the school navigation, or visit `/#teacher-app`. The app uses the selected school's active teacher profile, falling back to another active school team member for the demonstration. This is a responsive web app UI, not native software or authenticated access.

## Journeys

- **Today:** school greeting, duty availability preview, outstanding verification count, high-priority active cases, personal assignment count, priority cards and concern reporting.
- **Alerts:** all school incidents (not just behaviour categories), ordered Critical → High → Medium → Low; search location, category or incident ID; filter needs-review, assigned, all or closed cases and priority.
- **Evidence:** inspect local staged footage and incident context, acknowledge receipt, complete three context/welfare checks, record a meaningful note and choose Confirmed, False alarm or Insufficient evidence. Sample clips are explicitly not evidence of the fictional incident.
- **Respond:** take ownership, record on-my-way or at-location status, add follow-up notes, request school support, or hand over to an active colleague at the same school. Support is recorded locally and does not send a message or call. Handover does not imply acceptance.
- **Resolve:** only confirmed or false-alarm cases can close with a meaningful resolution. Reopening requires a reason and clears verification and acknowledgement for fresh review.
- **My work:** active assigned cases, with direct links back to their review workflow.
- **Activity / Timeline:** teacher actions across cases and each incident's full action history. Activity groups entries by incident; it is not a globally chronological feed.
- **Report a concern:** create a fictional school report with location, category, priority and details; it immediately enters the shared school incident data.
- **Profile:** school access context, duty availability and routine notification preferences as preview controls. They do not route alerts or control real push notifications.

Return to the school dashboard to see the same updated incident data. Page refresh resets demonstration state. All sample visuals use the existing synthetic campus media. Facilities & health and presentation references remain excluded.

## Verification

36 automated tests passed, including new teacher workflow guards for scope, acknowledgement, verification checks, closure/reopening, priority ordering and response history. Server rendering verified the teacher home, navigation and school scope. TypeScript, app lint and the Vercel production build passed. Existing bundle-size advisory remains.

Interactive visual/browser review could not be completed in this turn because the Mac was locked and automatic unlock failed. The responsive layout includes a five-item bottom navigation, phone-sized desktop preview and full-height narrow-screen layout, but visual and touch journeys still require browser verification.

Production integration still needs authenticated teacher identity and permissions, a persistent incident API, delivery/acknowledgement services for notifications, real camera evidence, conflict handling, and accepted handover/roster integration. This UI does not claim those services are connected.
