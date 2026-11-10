# Cloud environment setup

The current machine was installed and validated, but the onboarding configuration service did not confirm draft persistence. These instructions preserve the tested procedure for review.

Use the existing `/workspace/contractops` checkout. Each cloud task is isolated; do not create a worktree unless explicitly requested.

## Installation

```bash
set -euo pipefail
cd /workspace/contractops
npm ci --cache /tmp/contractops-npm-cache --no-audit --no-fund
npm test
npm run build
```

Node 22+ is required (this environment uses Node 24). Dependencies and fonts are retained files; server processes must be started again after restoration. Credentials are not needed for this fictional read-only demo.

## Startup

Run `npm run dev` from `/workspace/contractops` in a persistent terminal. Inspect startup logs. A local HTTP request to `/dashboard` should return 200 and contain `A clearer view` and `Fictional demo`. Do not create a user-facing loopback preview link during onboarding.

For browser tests, stop only the development server you started, build, then run `npm run test:browser`; Playwright starts the production server itself. `/usr/bin/chromium` is available in this machine. Other machines can use `npx playwright install chromium`.

## Verification limits

Database tests execute the schema against PGlite with simulated Supabase Auth/Storage schemas. Real Supabase deployment, Auth, and Storage API behavior remain unverified. The UI does not use live data. Review and save the installation/startup instructions in environment settings if draft persistence remains unavailable, then publish using the product's controls. Publication and fresh-task restoration have not been tested.
