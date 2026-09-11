# AiWAS

School safety platform prototype with separate school and superadmin workspaces.

## Included

- Priority-grouped incident alerts and a ten-second analysis demonstration
- Synthetic camera images and animated sample video clips
- Incident acknowledgement, reassignment, validation and history
- School-scoped team management and attendance/presence reconciliation
- Superadmin school directory, camera coverage and operational overview
- Analytics, detection-rule controls, notification-routing previews and CSV exports

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server.

```sh
npm run build
```

The application uses React, TypeScript, vinext/Vite and the included UI components. The current hosted build targets Cloudflare Workers through Sites; `.openai/hosting.json` identifies the existing Sites project and contains no credentials.

## Demonstration boundaries

All school, incident and student records are demonstration data. Media is synthetic; the MP4 files are animated stills with illustrative overlays. The ten-second timer does not run a real detection model.

The workspace switch previews roles and is not production authentication. Changes are held in session memory and reset on refresh. No actual invitations, emergency notifications, parent messages or camera connections are created. Facial recognition is not implemented.

Presence records represent recorded observations, not guaranteed physical locations. Missing departure records require human reconciliation. Production use requires an implemented backend, account authorization, approved data handling, validated detection, reliable notification delivery and school-specific operating procedures.

## Hosted demo

The existing private demo is managed separately through Sites:

https://aiwas-safety-workspace.blossomjason61.chatgpt.site

Pushing to this GitHub repository does not automatically update that deployment.

## Vercel deployment

Connect this repository with the project root set to the repository root.
`vercel.json` selects Vite, runs `npm run build:vercel`, and publishes
`dist/vercel`. That folder includes the application HTML, JavaScript, styles,
self-hosted fonts and mock media. Navigation uses URL fragments.

The default `npm run build` is the original Sites/Cloudflare Workers build;
its server bundle is not a Vercel deployment artifact. Vercel uses the separate
static entry in `vercel-entry/main.tsx`, which renders the same application.
No backend or authentication service is provided by this static build.
