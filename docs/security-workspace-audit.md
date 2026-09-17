# Security workspace integration and completeness audit

17 September 2026. Scope: the dedicated Security frontend integrated into the existing AiWAS dashboard, based on the 90-feature developer specification.

## Result

The eight-view frontend integration is complete for an interactive, session-only demonstration. It is **not a complete implementation of all 90 production capabilities**. All 90 specifications are available in the searchable library; those entries describe planned capability scope, not deployed detection models.

## Where to open it

Choose **Security workspace** in the existing header's **Demo workspace** selector. This selects the Platform operator preview and opens Security overview. In Superadmin, **Security** appears immediately below **Platform overview** in the existing sidebar. The eight sections use `#security-*` fragments and the existing Back/Forward handling.

The default school and teacher previews cannot render the security company portfolio. The workspace selector is a demo role switch, not authentication. A fresh page load defaults to the school preview; select the Security workspace again to enter it. Selecting a school role resets the security demo state. Navigating between platform and security views within a privileged session preserves the security state.

## Delivered UI scope

| View | Implemented interaction | Production dependency |
|---|---|---|
| Overview | Dynamic incident and availability counts, portfolio diagram, priority queue and event drill-down | Authoritative incident/site/health APIs |
| Monitoring | 24 fictional camera positions, site filter, explicit missing-source/offline states, related events | VMS/stream integration and device health |
| Incidents | Search and combined filters; validated manual creation; review notes; verification/dismissal; guard assignment; arrival; closure; history | Durable records, server transition validation, evidence |
| Sites | Three fictional portfolios, coverage and staffing summaries, site procedures and incident navigation | Customer/site registry and policies |
| Guard dispatch | Same-site available guards, verified-event assignment, busy-guard exclusion and response state | Authenticated guard client, delivery/acknowledgement |
| Investigations | Event search, add/remove records in one demo case, case summary CSV export | Real case management, evidence originals and access controls |
| Detection rules | All 90 feature records, 450 journey steps, search/release filters and scope details; explicit draft/save configurations keyed by site and feature | Feature-specific forms, model/rule APIs, zone editor, evaluation |
| Reports | Search/site/status filters shared by counts, rows and CSV; site distribution and honest coverage exception states | Historical data, service-level metrics and approved report generation |

## Integration decisions

- Reuses the existing AiWAS sidebar, role selector, light/dark theme tokens, toast system and UI primitives. No new runtime dependencies or lockfile changes.
- Security CSS is scoped to `.aiwas-security`, including its dialog/sheet roots. It does not replace global theme tokens or the school dashboard stylesheet.
- Security company seeds/state are separate from school incidents, cameras, attendance and pupil records. No school records are relabelled as commercial security events.
- Existing Sites hosting metadata and Vercel configuration remain unchanged. Both existing build paths were checked. This task pushes source to GitHub; it does not independently publish the older Sites deployment.
- The 90-entry specification is retained in `app/security/features.json`; UI is in `app/security/workspace.tsx`, and lifecycle/configuration validation is in `app/security/workflow.ts`.

## Audit fixes made

1. Replaced global, immediately applied rule toggles with explicit saved configurations keyed by feature and site. Switching sites loads that site's saved values; unsaved drafts do not overwrite another site.
2. Rule grace values reject blanks, non-numbers, fractions and values outside 0–600 seconds.
3. Verification and closure require review notes of at least ten characters. The lifecycle rejects invalid or repeated state transitions and preserves prior history.
4. Dispatch requires a verified incident, an existing same-site guard and no active assignment for that guard. Closing an incident makes the guard available again.
5. Manual reports validate title length, site and priority, use UUID-based identifiers, and start unverified. Creation resets filters to show the new event.
6. Reports expose all search/site/status filters affecting their metrics and export. Site-specific health summaries do not show another site's fault.
7. CSV export reuses the existing formula-safe encoder, including whitespace-prefixed formula cells.
8. Expanded the camera preview to all 24 fictional positions, matching the estate totals. Missing video is explicitly labelled and never displayed as an actual live feed.
9. Closing or leaving the Security workspace hides its open overlays. Switching to a school role removes the security component and its company state.
10. Matched the existing brand and both themes; retained responsive layout and existing school views.

## Verification performed

| Check | Result | Limit |
|---|---|---|
| `npm test` | PASS: 78/78 | Includes 9 new security tests and the existing regression suite |
| TypeScript, non-incremental | PASS | Static type validation |
| Lint: changed application files | PASS | `app/security`, `app/navigation.ts`, `app/page.tsx`; no claim that unrelated shared-component lint findings are resolved |
| Server render smoke | PASS | 62 role/route renders plus 8 direct and 8 integrated Security view checks; school-role company-data exclusion |
| Vercel build | PASS | Existing large-chunk advisory remains; frontend bundle approximately 970 KB raw / 291 KB gzip |
| Sites/Workers build | PASS | Build only; no Sites deployment performed in this integration task |
| Desktop browser navigation | PASS | All 8 Security views reached through UI with correct fragment and heading; no captured console errors |
| Browser incident review | PASS, sampled | Blank-note disabled controls, verification, same-site guard picker and dispatch state were clicked through; arrival/closure and double booking are covered by unit tests rather than a completed browser click-through |
| Browser saved rule settings | PASS | Saved F001 at Northpoint with 25-second grace and enabled; Meridian retained defaults; returning to Northpoint restored saved values |
| Theme/responsive visual check | PASS, sampled | Desktop dark Security overview and 375×812 light overview inspected; no horizontal document overflow in the mobile sample |
| Package installation audit | Existing findings | npm reports 11 dependency vulnerabilities (1 low, 2 moderate, 8 high); dependencies were not changed. A dependency-upgrade/security review is still required before production |

## Remaining work / completeness boundary

The current repo and this integration use in-memory fictional records. Before operational deployment, implement and test real authentication and server-side tenant/site permissions, durable storage and concurrency control, camera ingestion/playback, model evaluation and feature-specific detection configuration, guard notification and acknowledgement, evidence retention/redaction/export controls, audit integrity, failure recovery and operational monitoring.

The rules configuration tab demonstrates a generic review-routing setting. It is not a zone editor or the full specialised configuration UI for every one of the 90 capabilities. The investigation view has one session-only case; its CSV is a summary, not an evidentiary export. Monitoring tiles contain no playable security recordings. Reports combine the seed examples with current-session actions; they do not claim historical SLA performance.

This audit verifies the delivered frontend's defined scope and records its gaps. It does not certify detection accuracy, legal compliance, backend security, every accessibility requirement or every edge case in a browser.

## Dedicated dashboard and supplied research cross-check — 17 September 2026

The workspace selector now switches to an independent Security shell with its own sidebar, operator identity, navigation, mobile menu and navy/teal design. The school shell is hidden while Security is active. Security styles are scoped, including portal overlays; school theme preferences remain unchanged.

The supplied `CV_for_CCTV_Security_Research.docx` section 2 contains **91** features in **14** categories. All were extracted verbatim as titles and descriptions into `app/security/research.json`. The Capability library supports search, category filtering, per-site configuration drafts, validation, reset and JSON export. Each capability includes its source category, requirements, commissioning journey, acceptance/failure checks and links to related existing detailed specifications when applicable. Related specifications are partial overlaps, not assertions of exact implementation parity.

The source report's market estimates, vendor claims and legal assertions were not adopted as verified product facts. Governance forms do not establish legal compliance. The taxonomy is product scope, not an instruction to enable biometric processing or external actions.

### Limits

All 91 capabilities are represented in the UI; this is not 91 commissioned AI services. No camera ingestion, face recognition, plate OCR, model training, production authorisation, actual retention enforcement, cryptographic evidence signing, emergency dispatch, lock control or VMS connector was implemented by this UI change. Existing incident, dispatch, search and report workflows continue to use fictional session data. Configuration drafts are held in component memory and are cleared by refresh or leaving the privileged workspace; export before switching dashboards. Draft saving does not change production systems.

### Verification

80 unit tests, TypeScript, focused lint and render checks across 9 Security views passed. Browser checks cover the separate shell, searchable research library, ANPR draft validation/save and per-site isolation, return to school and mobile navigation. Deployment is validated separately through the GitHub/Vercel status.
