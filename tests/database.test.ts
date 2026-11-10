import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const db = new PGlite();
const orgA = "11111111-1111-4111-8111-111111111111";
const orgB = "11111111-1111-4111-8111-111111111112";
const manager = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const viewer = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const outsider = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
async function asUser<T>(id: string, run: () => Promise<T>) {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${id}';`);
  try {
    return await run();
  } finally {
    await db.exec("reset role;");
  }
}
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;
 grant usage on schema storage to authenticated; grant select,insert on storage.objects to authenticated;`);
  // PGlite uses PostgreSQL's built-in gen_random_uuid; pgcrypto installation is
  // the only platform-specific statement omitted from this local harness.
  const migration = readFileSync(
    "supabase/migrations/202611100001_core.sql",
    "utf8",
  ).replace("create extension if not exists pgcrypto;", "");
  await db.exec(migration);
  await db.exec(readFileSync("supabase/seed.sql", "utf8"));
  await db.exec(readFileSync("supabase/seed.sql", "utf8")); // seed repeatability
  await db.exec(`insert into auth.users values('${manager}'),('${viewer}'),('${outsider}');
 insert into public.users(id,display_name) values('${manager}','Fictional Manager'),('${viewer}','Fictional Viewer'),('${outsider}','Other Tenant');
 insert into public.organizations(id,name) values('${orgB}','Other fictional organization');
 insert into public.memberships(organization_id,user_id,role) values('${orgA}','${manager}','manager'),('${orgA}','${viewer}','viewer'),('${orgB}','${outsider}','admin');
 insert into public.contracts(organization_id,name,agency,program,amount,starts_on,ends_on) values('${orgB}','Other tenant contract','Fictional agency','Housing',100,'2026-01-01','2026-12-31');`);
}, 30000);
afterAll(async () => {
  await db.close();
});
describe("PostgreSQL tenant and role policies", () => {
  it("isolates contract reads by organization", async () => {
    const a = await asUser(manager, () =>
      db.query("select * from public.contracts"),
    );
    expect(a.rows).toHaveLength(4);
    const b = await asUser(outsider, () =>
      db.query("select * from public.contracts"),
    );
    expect(b.rows).toHaveLength(1);
  });
  it("blocks viewer writes", async () => {
    await expect(
      asUser(viewer, () => db.exec("update public.contracts set amount = 1")),
    ).resolves.toBeDefined();
    const result = await db.query<{ amount: string }>(
      "select amount from public.contracts where id = $1",
      ["22222222-2222-4222-8222-222222222221"],
    );
    expect(Number(result.rows[0].amount)).toBe(840000);
  });
  it("blocks tenant-forged inserts", async () => {
    await expect(
      asUser(manager, () =>
        db.exec(
          `insert into public.contracts(organization_id,name,agency,program,amount,starts_on,ends_on) values('${orgB}','Forged','A','P',10,'2026-01-01','2026-02-01')`,
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("rejects cross-tenant references even for a member of both organizations", async () => {
    await db.exec(
      `insert into public.memberships values('${orgB}','${manager}','manager',now())`,
    );
    await expect(
      asUser(manager, () =>
        db.exec(
          `insert into public.reimbursements(organization_id,contract_id,reference,period_start,period_end,amount) values('${orgB}','22222222-2222-4222-8222-222222222221','FORGED','2026-01-01','2026-01-31',1)`,
        ),
      ),
    ).rejects.toThrow(/foreign key/);
    await expect(
      asUser(manager, () =>
        db.exec(
          `update public.contracts set organization_id = '${orgB}' where id = '22222222-2222-4222-8222-222222222221'`,
        ),
      ),
    ).rejects.toThrow(/Organization cannot be changed/);
    await db.exec(
      `delete from public.memberships where organization_id = '${orgB}' and user_id = '${manager}'`,
    );
  });
  it("audits valid manager updates and blocks audit forgery", async () => {
    await asUser(manager, () =>
      db.exec(
        "update public.contracts set amount = 840001 where id = '22222222-2222-4222-8222-222222222221'",
      ),
    );
    const log = await db.query(
      "select * from public.audit_events where actor_id = $1 and action = $2",
      [manager, "update"],
    );
    expect(log.rows).toHaveLength(1);
    await expect(
      asUser(manager, () =>
        db.exec(
          `insert into public.audit_events(organization_id,action,entity_type,entity_id) values('${orgA}','fake','contracts','fake')`,
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });
  it("prevents self-promotion and unreviewed AI writes", async () => {
    await expect(
      asUser(viewer, () =>
        db.exec("update public.memberships set role = 'admin'"),
      ),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(manager, () =>
        db.exec(
          `insert into public.extraction_suggestions(organization_id,title,evidence_quote,model,prompt_version,source_version_id) values('${orgA}','Invented','Invented','fake','1',gen_random_uuid())`,
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });
  it("denies unregistered private object access", async () => {
    const result = await asUser(manager, () =>
      db.query("select * from storage.objects"),
    );
    expect(result.rows).toHaveLength(0);
    await expect(
      asUser(manager, () =>
        db.exec(
          "insert into storage.objects(bucket_id,name) values('contract-evidence','unregistered.pdf')",
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});
