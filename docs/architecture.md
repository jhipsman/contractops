# Increment plan and architecture

## Initial increment

App Router workspace shell at `/dashboard`, `/contracts`, `/contracts/[id]`, `/reimbursements`, `/requirements`, `/documents`, `/tasks`, `/settings`, and `/about`. Dashboard fixtures pass through a server-only service; filtering remains local to the reimbursement table. The app intentionally does not query a live database or silently fall back from live records to demo data.

## Core schema and access control

Supabase Auth owns identities; public.users holds optional staff display names. Memberships assign admin, manager, contributor, or viewer roles per organization. Each operational row includes organization_id; composite foreign keys prevent cross-organization associations. RLS checks membership on reads and role on writes. Managers/admins manage contracts; contributors prepare evidence, requirements, and tasks; viewers read. Membership changes and organization setup require a separately implemented trusted invitation/onboarding service. Audit records are written by database triggers, never directly by authenticated clients.

Private documents use `organization UUID/document UUID/version UUID/filename` paths. Object policies match a registered version and organization membership. No public bucket or browser service-role key. Future download service must authenticate, authorize against the requested document, and issue short-lived signed URLs. Deletion and lifecycle operations need coordinated metadata/object handling.

AI proposals are separate from active requirements. Suggestions retain source document/version, page/section, quoted evidence, model metadata, reviewer edits, and decision. There is no automatic promotion in this increment. A future transactional review service must validate reviewer role, retain the source, record an approval and audit event, and create the requirement only on explicit approval. An accepted suggestion alone is not an active requirement.

## Following increments

1. Auth session refresh, invitations, organization selection and scoped services. Verify RLS against real Supabase sessions before live access.
2. Validated contract and reimbursement CRUD with concurrency and audit checks.
3. Requirements/tasks CRUD, signed uploads/downloads, file validation and version review.
4. Extraction provider adapter, source-grounded proposals, mandatory human review.
5. Integration tests for tenant isolation, role boundaries, sensitive audit events, and critical workflows.

Production gates: no claims of security/compliance validation yet. Deployments need rate limits, abuse protection, file scanning, retention policy, backup/restore testing, monitoring, auth recovery, and independently executed database authorization tests. No client/patient records or PHI in this MVP.
