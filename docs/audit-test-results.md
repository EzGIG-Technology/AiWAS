# AiWAS follow-up audit and test results

11 September 2026. This pass audits the locally updated application. No claim is made that the GitHub or Vercel deployment contains these changes.

## Changes made

- Reopening a closed incident resets validation to Pending and clears acknowledgement. New evidence must be reviewed again.
- Unknown or missing validation outcomes are treated as unresolved and cannot be closed or counted as completed reviews.
- School onboarding validates trimmed names, normalized duplicate school names, administrator email and camera-zone text before creation.
- Manual reports and tasks reject whitespace-only summaries. Tasks validate real calendar dates, not just a date-shaped string; status updates accept only supported states.
- Browser navigation now creates history entries and listens for Back/Forward and hash changes. Unauthorized preview routes fall back to the overview. These behaviours were source-reviewed, not browser-tested.
- Detection configuration derives an existing zone for the selected school. Draft values reset when the school/zone/category key changes, preventing a nonexistent previous-school zone from being saved.
- The ten-second demonstration subscribes to the current creation callback, avoiding a stale callback in its interval. Demo IDs now use UUIDs.
- Media errors are associated with the failed scene, so choosing another scene can recover. Error copy no longer promises that a poster loaded successfully.
- Newly created schools do not automatically inherit fictional pupil records.
- Removed unused application code and corrected form wrappers around custom selects. All files under `app` now pass the configured lint checks.
- Added repeatable `npm test` and `npm run test:render` commands.

## Executed checks

| Check | Result | Evidence / limit |
|---|---|---|
| Workflow tests | PASS, 13 tests | Closure and reopening, evidence classification, date boundaries, CSV escaping, school setup and task validation. |
| Server rendering smoke test | PASS | Renders Home and asserts dashboard, navigation, priority and reporting content; rejects NaN and accidental object text. Does not hydrate or click controls. |
| TypeScript | PASS | `npm exec tsc -- --noEmit --incremental false`. |
| Application lint | PASS | `npm exec oxlint -- app`. |
| Full repository lint | FAIL, 19 findings | Remaining findings in shared UI components and `hooks/use-mobile.ts`, listed below. |
| Vercel build | PASS | `dist/vercel/index.html` and production assets generated. JavaScript 556.05 KB raw / 172.79 KB gzip. Chunk-size advisory remains. |
| Mock video metadata | PASS, 7 files | ffprobe reads valid nonzero duration and video dimensions. This is not frame-by-frame playback verification. |
| Local browser preview | BLOCKED | Binding `127.0.0.1:3000` was denied with EPERM by the session environment. No alternate-port or permission bypass was attempted. |
| Browser interaction / responsive visual QA | NOT EXECUTED | Preview unavailable. No browser screenshots or click-through success claimed. |
| Live CCTV, AI, notification and shared-data tests | NOT APPLICABLE TO CURRENT BUILD | Those services are not implemented. |

## Remaining lint findings

There are nineteen findings across the following shared files:

- `button-group`, `breadcrumb`, `input-otp`, `spinner`, `field`, `item`: semantic element versus ARIA-role rules.
- `pagination`, `label`: accessible content/label association rules.
- `input-group`: semantic grouping and pointer-only interaction.
- `carousel`: initial effect state and grouping/region semantics.
- `chart`: three unconstrained template-expression findings.
- `hooks/use-mobile.ts`: state update inside the subscription setup effect.

Some findings relate to generic component wrappers whose consumers supply accessible labels; they need contextual review. They were not globally suppressed to manufacture a clean repository result. The camera-media file has one narrowly documented Next-image lint exception: this static app serves the same media on Vercel and Sites without a Next image service.

## Browser test matrix still required

1. School report creation: submit a valid report, verify its selected school, owner, timestamp and Pending status; reject blank/invalid fields; cancel without creating a record.
2. Evidence lifecycle: acknowledge, mark insufficient, confirm, add a note, close with a resolution, reopen and verify both queues reset. Check history ordering and repeated clicks.
3. Follow-up/maintenance: create, update, block, complete and reopen; switch school while a dialog is open; confirm records and dialogs remain in the correct school context.
4. Onboarding: duplicate and malformed input, cancel at each step, create a school, inspect the inactive account and offline camera; verify its presence register is empty.
5. Navigation: deep links, Back/Forward, workspace switching, forbidden preview routes and changes to the selected school.
6. Configuration: edit and discard drafts, save, switch schools and zones, return to verify the saved configuration; confirm routing save/discard semantics.
7. Analytics/export: inconclusive cases, reopened cases, date boundaries, empty filters and new concern categories.
8. Media: all scenes, blocked assets, a failed scene followed by a valid one, keyboard-accessible playback and the ten-second simulation.
9. Layout/accessibility: keyboard-only dialogs/selects, focus restoration, accessible errors, 375px/768px/1440px widths, contrast and overflow.

## Production status

The system remains a fictional, in-memory demonstration. Authentication, server-side school isolation, durable records, signed evidence access, actual camera processing and notification delivery remain release blockers. A role selector and successful frontend tests do not establish security or operational safety. No live student data, end-to-end detection accuracy or latency guarantee was tested.

See `system-audit-and-user-journeys.md` for the broader journey matrix and backend requirements. This report supersedes its earlier six-test count and absence of a server-rendering smoke test; browser testing remains unexecuted.
