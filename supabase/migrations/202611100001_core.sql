-- Foundation only: validate against a disposable Supabase project before live use.
create extension if not exists pgcrypto;
create type public.member_role as enum ('admin','manager','contributor','viewer');
create type public.reimbursement_status as enum ('draft','preparing','ready','submitted','paid','blocked');
create type public.requirement_status as enum ('open','in_progress','complete','blocked');
create type public.review_status as enum ('pending','approved','rejected');

create table public.users (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (length(display_name) between 1 and 200),
 created_at timestamptz not null default now()
);
create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 1 and 200),
 timezone text not null default 'America/New_York', created_at timestamptz not null default now()
);
create table public.memberships (
 organization_id uuid not null references public.organizations(id),
 user_id uuid not null references public.users(id), role public.member_role not null default 'viewer',
 created_at timestamptz not null default now(), primary key (organization_id,user_id)
);
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create function private.has_role(org uuid, allowed public.member_role[] default array['admin','manager','contributor','viewer']::public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.memberships m where m.organization_id = org and m.user_id = (select auth.uid()) and m.role = any(allowed));
$$;
revoke all on function private.has_role(uuid,public.member_role[]) from public;
grant execute on function private.has_role(uuid,public.member_role[]) to authenticated;

create table public.contracts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 name text not null check(length(name) between 1 and 200), agency text not null, program text not null,
 amount numeric(14,2) not null check(amount >= 0), starts_on date not null, ends_on date not null check(ends_on >= starts_on),
 owner_id uuid, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), foreign key(organization_id,owner_id) references public.memberships(organization_id,user_id)
);
create table public.reimbursements (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), contract_id uuid not null,
 reference text not null, period_start date not null, period_end date not null check(period_end >= period_start),
 amount numeric(14,2) not null check(amount > 0), status public.reimbursement_status not null default 'draft',
 due_on date, submitted_at timestamptz, paid_at timestamptz, blocker text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id), unique(organization_id,reference),
 foreign key(organization_id,contract_id) references public.contracts(organization_id,id)
);
create table public.documents (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), contract_id uuid not null,
 title text not null, created_by uuid not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,contract_id) references public.contracts(organization_id,id),
 foreign key(organization_id,created_by) references public.memberships(organization_id,user_id)
);
create table public.document_versions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), document_id uuid not null,
 version_number integer not null check(version_number > 0), storage_path text not null unique,
 original_filename text not null, content_type text not null check(content_type in ('application/pdf','image/png','image/jpeg','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
 size_bytes bigint not null check(size_bytes > 0 and size_bytes <= 20971520), sha256 text check(sha256 ~ '^[0-9a-f]{64}$'),
 uploaded_by uuid not null, created_at timestamptz not null default now(), unique(organization_id,id), unique(document_id,version_number),
 foreign key(organization_id,document_id) references public.documents(organization_id,id),
 foreign key(organization_id,uploaded_by) references public.memberships(organization_id,user_id),
 check(storage_path like organization_id::text || '/' || document_id::text || '/' || id::text || '/%')
);
create table public.requirements (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), contract_id uuid not null,
 title text not null, description text, due_on date, recurrence text check(recurrence in ('monthly','quarterly','annually')),
 assignee_id uuid, status public.requirement_status not null default 'open',
 source_version_id uuid, source_page integer check(source_page > 0), source_section text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,contract_id) references public.contracts(organization_id,id),
 foreign key(organization_id,assignee_id) references public.memberships(organization_id,user_id),
 foreign key(organization_id,source_version_id) references public.document_versions(organization_id,id)
);
create table public.document_links (
 organization_id uuid not null references public.organizations(id), document_id uuid not null, requirement_id uuid, reimbursement_id uuid,
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 check(num_nonnulls(requirement_id,reimbursement_id) = 1),
 foreign key(organization_id,document_id) references public.documents(organization_id,id),
 foreign key(organization_id,requirement_id) references public.requirements(organization_id,id),
 foreign key(organization_id,reimbursement_id) references public.reimbursements(organization_id,id)
);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), contract_id uuid,
 reimbursement_id uuid, requirement_id uuid, title text not null, due_on date, assignee_id uuid,
 status public.requirement_status not null default 'open', blocker text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,contract_id) references public.contracts(organization_id,id),
 foreign key(organization_id,reimbursement_id) references public.reimbursements(organization_id,id),
 foreign key(organization_id,requirement_id) references public.requirements(organization_id,id),
 foreign key(organization_id,assignee_id) references public.memberships(organization_id,user_id)
);
create table public.extraction_suggestions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), source_version_id uuid not null,
 title text not null, evidence_quote text not null, source_page integer check(source_page > 0), source_section text,
 suggested_due_on date, model text not null, prompt_version text not null, status public.review_status not null default 'pending',
 reviewer_edits jsonb, reviewed_by uuid, reviewed_at timestamptz,
 created_at timestamptz not null default now(), unique(organization_id,id),
 foreign key(organization_id,source_version_id) references public.document_versions(organization_id,id),
 foreign key(organization_id,reviewed_by) references public.memberships(organization_id,user_id),
 check(status = 'pending' or (reviewed_by is not null and reviewed_at is not null))
);
create table public.approvals (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 document_version_id uuid, suggestion_id uuid, reviewer_id uuid not null, decision public.review_status not null check(decision <> 'pending'),
 notes text, created_at timestamptz not null default now(),
 check(num_nonnulls(document_version_id,suggestion_id) = 1),
 foreign key(organization_id,document_version_id) references public.document_versions(organization_id,id),
 foreign key(organization_id,suggestion_id) references public.extraction_suggestions(organization_id,id),
 foreign key(organization_id,reviewer_id) references public.memberships(organization_id,user_id)
);
create table public.audit_events (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 actor_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id text not null,
 created_at timestamptz not null default now()
);
-- Operational clients cannot change their tenant association, even if members of both tenants.
create function private.touch_row() returns trigger language plpgsql set search_path = '' as $$
 begin
 if new.organization_id is distinct from old.organization_id then raise exception 'Organization cannot be changed'; end if;
 new.updated_at = now(); return new;
 end;
$$;
create function private.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
 declare row_data jsonb; org uuid;
 begin
 row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
 org := (row_data->>'organization_id')::uuid;
 insert into public.audit_events(organization_id,actor_id,action,entity_type,entity_id)
 values(org,auth.uid(),lower(tg_op),tg_table_name,coalesce(row_data->>'id',row_data->>'user_id'));
 if tg_op = 'DELETE' then return old; end if; return new;
 end;
$$;
revoke all on function private.touch_row() from public;
revoke all on function private.audit_change() from public;
alter table public.organizations enable row level security;
revoke all on public.organizations from anon;
alter table public.users enable row level security;
revoke all on public.users from anon;
alter table public.memberships enable row level security;
revoke all on public.memberships from anon;
alter table public.contracts enable row level security;
revoke all on public.contracts from anon;
alter table public.reimbursements enable row level security;
revoke all on public.reimbursements from anon;
alter table public.documents enable row level security;
revoke all on public.documents from anon;
alter table public.document_versions enable row level security;
revoke all on public.document_versions from anon;
alter table public.requirements enable row level security;
revoke all on public.requirements from anon;
alter table public.document_links enable row level security;
revoke all on public.document_links from anon;
alter table public.tasks enable row level security;
revoke all on public.tasks from anon;
alter table public.extraction_suggestions enable row level security;
revoke all on public.extraction_suggestions from anon;
alter table public.approvals enable row level security;
revoke all on public.approvals from anon;
alter table public.audit_events enable row level security;
revoke all on public.audit_events from anon;
create policy org_read on public.organizations for select to authenticated using(private.has_role(id));
create policy org_update on public.organizations for update to authenticated using(private.has_role(id,array['admin']::public.member_role[])) with check(private.has_role(id,array['admin']::public.member_role[]));
create policy member_read on public.memberships for select to authenticated using(private.has_role(organization_id));
create policy profile_read on public.users for select to authenticated using(id = auth.uid() or exists(select 1 from public.memberships m where m.user_id = users.id and private.has_role(m.organization_id)));
create policy profile_update on public.users for update to authenticated using(id = auth.uid()) with check(id = auth.uid());
create index contracts_org_idx on public.contracts(organization_id);
create policy tenant_read on public.contracts for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.contracts for insert to authenticated with check(private.has_role(organization_id,array['admin','manager']::public.member_role[]));
create policy tenant_update on public.contracts for update to authenticated using(private.has_role(organization_id,array['admin','manager']::public.member_role[])) with check(private.has_role(organization_id,array['admin','manager']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.contracts for each row execute function private.audit_change();
create index reimbursements_org_idx on public.reimbursements(organization_id);
create policy tenant_read on public.reimbursements for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.reimbursements for insert to authenticated with check(private.has_role(organization_id,array['admin','manager']::public.member_role[]));
create policy tenant_update on public.reimbursements for update to authenticated using(private.has_role(organization_id,array['admin','manager']::public.member_role[])) with check(private.has_role(organization_id,array['admin','manager']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.reimbursements for each row execute function private.audit_change();
create index documents_org_idx on public.documents(organization_id);
create policy tenant_read on public.documents for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.documents for insert to authenticated with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create policy tenant_update on public.documents for update to authenticated using(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[])) with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.documents for each row execute function private.audit_change();
create index document_versions_org_idx on public.document_versions(organization_id);
create policy tenant_read on public.document_versions for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.document_versions for insert to authenticated with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.document_versions for each row execute function private.audit_change();
create index requirements_org_idx on public.requirements(organization_id);
create policy tenant_read on public.requirements for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.requirements for insert to authenticated with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create policy tenant_update on public.requirements for update to authenticated using(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[])) with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.requirements for each row execute function private.audit_change();
create index document_links_org_idx on public.document_links(organization_id);
create policy tenant_read on public.document_links for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.document_links for insert to authenticated with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.document_links for each row execute function private.audit_change();
create index tasks_org_idx on public.tasks(organization_id);
create policy tenant_read on public.tasks for select to authenticated using(private.has_role(organization_id));
create policy tenant_insert on public.tasks for insert to authenticated with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create policy tenant_update on public.tasks for update to authenticated using(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[])) with check(private.has_role(organization_id,array['admin','manager','contributor']::public.member_role[]));
create trigger audit_changes after insert or update or delete on public.tasks for each row execute function private.audit_change();
create index extraction_suggestions_org_idx on public.extraction_suggestions(organization_id);
create policy tenant_read on public.extraction_suggestions for select to authenticated using(private.has_role(organization_id));
create trigger audit_changes after insert or update or delete on public.extraction_suggestions for each row execute function private.audit_change();
create index approvals_org_idx on public.approvals(organization_id);
create policy tenant_read on public.approvals for select to authenticated using(private.has_role(organization_id));
create trigger audit_changes after insert or update or delete on public.approvals for each row execute function private.audit_change();
create index audit_events_org_idx on public.audit_events(organization_id);
create policy tenant_read on public.audit_events for select to authenticated using(private.has_role(organization_id));
create trigger touch_row before update on public.contracts for each row execute function private.touch_row();
create trigger touch_row before update on public.reimbursements for each row execute function private.touch_row();
create trigger touch_row before update on public.documents for each row execute function private.touch_row();
create trigger touch_row before update on public.requirements for each row execute function private.touch_row();
create trigger touch_row before update on public.tasks for each row execute function private.touch_row();
create trigger audit_memberships after insert or update or delete on public.memberships for each row execute function private.audit_change();
-- Suggestions and approvals are intentionally read-only to clients until a
-- transactional, reviewer-authorized service is implemented and tested.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('contract-evidence','contract-evidence',false,20971520,array['application/pdf','image/png','image/jpeg','text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
create policy evidence_read on storage.objects for select to authenticated using(
 bucket_id = 'contract-evidence' and exists(select 1 from public.document_versions v where v.storage_path = name and private.has_role(v.organization_id))
);
create policy evidence_insert on storage.objects for insert to authenticated with check(
 bucket_id = 'contract-evidence' and exists(select 1 from public.document_versions v where v.storage_path = name and v.uploaded_by = auth.uid() and private.has_role(v.organization_id,array['admin','manager','contributor']::public.member_role[]))
);
-- No overwrite/delete policy. New versions require unique new object paths.
-- Explicit grants complement RLS; deny privileged review/audit writes.
revoke all on public.audit_events,public.approvals,public.extraction_suggestions,public.memberships from authenticated;
grant select on all tables in schema public to authenticated;
grant update(display_name) on public.users to authenticated;
grant update(name,timezone) on public.organizations to authenticated;
grant insert,update on public.contracts,public.reimbursements,public.requirements,public.tasks,public.documents to authenticated;
grant insert on public.document_versions,public.document_links to authenticated;
