# Campus insights verification

Verified 12 September 2026.

- 32 unit/workflow tests passed, including unknown versus zero coverage, coherent crossing fixtures, comparison denominators, threshold validation and removal of the facilities workspace.
- TypeScript and application lint passed.
- Rendering checks covered the initial screen, active concept workspaces, Detection studio, reporting preview and the new heatmap. The removed workspace is absent.
- Browser: overview entry opened Campus insights; six map zones rendered, with the offline assembly hall shown as unknown.
- Browser: changing to dismissal and movement volume updated the heatmap (for example, 455 main-gate crossing events in the fictional window).
- Browser: saved a canteen threshold of 200; the selected-zone setting remained after changing zones.
- Browser: the offline assembly hall disabled crowd-review creation.
- Browser: created a planning action, marked it reviewed and verified the reopen control.
- Browser: a heatmap crowd concern opened as an unverified staff report in the existing incident panel, with the selected count and saved threshold.
- Narrow-screen inspection found no document overflow; heatmap high-intensity text was made white and tabs were arranged in two columns for touch access.

All measurements used synthetic data. These checks do not validate a live counting model, real camera calibration, authenticated isolation or notification delivery. The build retains the existing JavaScript bundle-size advisory.
