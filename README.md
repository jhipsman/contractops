# ContractOps

A government-contract operations workspace for human-services nonprofits. This first increment provides a responsive application shell, dashboard, read-only contract details, searchable reimbursement pipeline, and foundational Supabase schema. **All on-screen records are fictional.** No authentication, editing, uploads, invitations, or AI processing are enabled yet.

## Run locally

Requires Node.js 22+ and npm. No Supabase account is needed for the demo.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the `/dashboard` route on the development server (default port 3000). The demo always uses explicit fixtures; adding Supabase variables does not switch it to live data.

```sh
npm test              # 12 validation/role tests + 7 PostgreSQL policy tests
npm run typecheck
npm run build
npm run start        # run the production build
npm run test:browser  # desktop/mobile workflow tests against production build
```

Browser tests use `/usr/bin/chromium` when installed. Else run `npx playwright install chromium` first. Screenshots are written to `.impeccable/review/`. PostgreSQL tests use PGlite, mocking Supabase's Auth/Storage schemas and authenticated roles; they execute the migration and seed, not text-only assertions. They do not replace integration tests against a real Supabase deployment.

## Supabase foundation

1. Create a **disposable development** Supabase project.
2. Apply `supabase/migrations/202611100001_core.sql` through the SQL editor or your existing Supabase migration workflow.
3. Run `supabase/seed.sql`. It is repeatable and inserts only fictional operational records; no passwords or fake Auth users are seeded.
4. Create actual test users with Supabase Auth. A trusted administrator must provision matching `public.users` rows and `public.memberships` rows for the fictional organization (`11111111-1111-4111-8111-111111111111`). Never let clients grant their own membership.
5. Put the project URL and publishable key in `.env.local`. Service-role keys are privileged: use only in explicitly server-only trusted jobs, never in browser code or a `NEXT_PUBLIC_` variable. The demo does not need one.
6. Verify tenant/role behavior and Storage policies against real test sessions before implementing live data access.

The migration includes organizations, staff profiles, memberships, contracts, reimbursements, requirements, tasks, documents/versions, evidence links, reviewed extraction suggestions, approvals, and audit events. Composite foreign keys enforce tenant consistency; RLS scopes reads and writes by membership and role. A private `contract-evidence` bucket accepts registered version paths only. Document uploads are capped at 20 MiB. No overwrite/delete policy is provided. File scanning and verified MIME checks remain future work.

Suggestion/approval writes are deliberately unavailable to authenticated clients until a reviewed transactional service exists. No suggestion automatically creates a requirement. Reference and quoted-source fields support future human review; AI must never infer absent obligations or make legal/compliance determinations.

## Structure

- `app/(workspace)` — shell and routes; `/[module]` serves fixed allowlisted modules.
- `components` — navigation, pipeline, status badges, shadcn-style Button primitive.
- `lib/services` — server-only data boundary; demo fixtures remain separate from live clients.
- `lib/domain.ts` — reusable validation schemas and role capability helpers.
- `lib/supabase/server.ts` — server-only Supabase SSR client foundation; session-refresh middleware follows in the auth increment.
- `supabase` — migration and fictional seed.
- `tests` — validation, SQL authorization, and browser workflows.
- `docs/architecture.md` — access-control decisions and staged implementation plan.

## Deployment and limits

Vercel-compatible Next.js App Router; use the standard Next.js build preset. Fonts are self-hosted Open Sans with license in `public/fonts/LICENSE.txt`. Deploying this increment exposes a fictional demo only. Authentication, live CRUD, organization onboarding, secure upload/download services, AI review UI, and submission-package generation are not implemented. No production security or regulatory compliance verification is claimed. Do not enter client/patient records or PHI.

## Publish the fictional demo on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import `jhipsman/contractops`. If it is missing, grant Vercel access to that repository through its GitHub integration.
3. Keep the Next.js preset and repository root directory. Select Node.js 24.x.
4. Leave environment variables empty for this demo, then select **Deploy**.
5. Open the deployment's generated domain. The root redirects to `/dashboard`.

The `vercel.json` file supplies the build/install commands. The public demo contains only fictional fixtures and does not connect to Supabase. Sharing its URL does not expose real contract records or enable editing. Authentication and live data require a later implementation increment.
