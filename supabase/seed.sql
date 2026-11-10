-- Fictional data only. Run against a disposable development Supabase project.
-- No staff identities or memberships are fabricated. Seed membership separately
-- for an actual test Auth user, using the SQL editor as a trusted administrator.
begin;
insert into public.organizations(id,name) values('11111111-1111-4111-8111-111111111111','Harbor Community Services (fictional)') on conflict do nothing;
insert into public.contracts(id,organization_id,name,agency,program,amount,starts_on,ends_on) values
('22222222-2222-4222-8222-222222222221','11111111-1111-4111-8111-111111111111','Family Support Services','County Department of Human Services','Family & community',840000,'2026-07-01','2027-06-30'),
('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Housing Stability Program','City Office of Housing','Housing',625000,'2026-01-01','2026-12-31'),
('22222222-2222-4222-8222-222222222223','11111111-1111-4111-8111-111111111111','Youth Pathways Initiative','State Department of Youth Services','Youth development',420000,'2026-07-01','2027-06-30'),
('22222222-2222-4222-8222-222222222224','11111111-1111-4111-8111-111111111111','Community Nutrition Access','County Department of Human Services','Food access',285000,'2026-04-01','2027-03-31') on conflict do nothing;
insert into public.reimbursements(organization_id,contract_id,reference,period_start,period_end,amount,status,due_on,blocker) values
('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221','RE-2026-042','2026-10-01','2026-10-31',68400,'blocked','2026-11-15','Missing payroll certification and vendor invoice register'),
('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','RE-2026-041','2026-10-01','2026-10-31',48200,'preparing','2026-11-18',null),
('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222223','RE-2026-040','2026-10-01','2026-10-31',32750,'ready','2026-11-20',null),
('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222224','RE-2026-038','2026-09-01','2026-09-30',22100,'submitted','2026-11-12',null) on conflict do nothing;
insert into public.requirements(id,organization_id,contract_id,title,due_on,status) values
('33333333-3333-4333-8333-333333333331','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222221','Signed payroll certification','2026-11-12','blocked'),
('33333333-3333-4333-8333-333333333332','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','October expense reconciliation','2026-11-14','in_progress'),
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222223','Quarterly program narrative','2026-11-20','in_progress') on conflict do nothing;
commit;
