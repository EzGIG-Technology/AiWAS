# Surveillance UI verification

Verified 12 September 2026.

- 27 workflow and data-validation tests passed.
- TypeScript check and application-scoped lint passed.
- Rendering smoke checks passed for the main screen, all eight concept workspaces, platform scope guard, reporting preview and Detection studio.
- Vercel static build passed. Existing bundle-size advisory remains (approximately 647 KB JavaScript before gzip).
- Browser: saved a rule; ran a ten-second candidate scenario; opened the resulting unverified incident in the existing review panel.
- Browser: recorded one synthetic true positive and one missed event; recall changed to 50%, precision remained 100%, and the sample count showed two.
- Browser: unavailable-feed scenario displayed a coverage-unavailable response and did not create another incident.
- Browser: checked the platform coverage screen; presentation title, slide references and proposal commentary were absent. JPN remained only as an institutional participant.
- Browser: opened the pilot consent record and verified pending, recorded, declined and withdrawn options plus the review checkpoint.
- Narrow browser viewport: fixed the Detection studio tab-list overflow; measured document width 317 px within a 332 px viewport after the fix.

This is targeted UI verification, not exhaustive end-to-end testing of every possible interaction or field validation in a live service. No real video model, school data, message, access control or sensor was exercised. The nine existing synthetic scene pairs were reused; no new media was generated for this update.
