import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { contracts, reimbursements, requirements } from "@/lib/demo";
import { money } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
export default async function Contract({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = contracts.find((c) => c.id === id);
  if (!c) notFound();
  return (
    <>
      <Link href="/contracts" className="text-link back-link">
        <ArrowLeft size={15} />
        All contracts
      </Link>
      <div className="page-heading">
        <div>
          <h1>{c.name}</h1>
          <p>{c.agency}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="demo-notice">
        <span className="demo-label">Fictional demo</span>
        <p>
          Read-only contract preview. Editing and secure evidence workflows
          follow authentication.
        </p>
      </div>
      <section className="panel contract-summary">
        <h2>Contract details</h2>
        <dl>
          <div>
            <dt>Contract value</dt>
            <dd>{money(c.amount)}</dd>
          </div>
          <div>
            <dt>Assigned owner</dt>
            <dd>{c.owner}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{c.program}</dd>
          </div>
          <div>
            <dt>Contract end</dt>
            <dd>{c.ends}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Related reimbursement</h2>
        </div>
        {reimbursements
          .filter((r) => r.contractId === c.id)
          .map((r) => (
            <div className="requirement-row" key={r.id}>
              <div>
                <h3>
                  {r.id} · {r.period}
                </h3>
                <p>
                  {money(r.amount)} requested · Due {r.due}, 2026 · {r.evidence}{" "}
                  evidence files
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
      </section>
      {id === "family-support" && (
        <section className="panel about-panel">
          <CircleAlert size={24} />
          <h2>Two documents are still needed</h2>
          <p>
            The signed payroll certification and vendor invoice register are
            missing from this fictional request. A staff member must review them
            before submission.
          </p>
          <Link href="/requirements" className="text-link">
            Review requirements
          </Link>
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Related requirements</h2>
        </div>
        {requirements
          .filter((r) => r.contract === c.name)
          .map((r) => (
            <div className="requirement-row" key={r.title}>
              <div>
                <h3>{r.title}</h3>
                <p>
                  Due {r.due}, 2026 · {r.owner}
                </p>
              </div>
              <StatusBadge status={r.state} />
            </div>
          ))}
        {!requirements.some((r) => r.contract === c.name) && (
          <p className="panel-padding">
            No upcoming requirements in this demo.
          </p>
        )}
      </section>
    </>
  );
}
