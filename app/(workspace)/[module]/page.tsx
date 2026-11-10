import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { contracts, requirements } from "@/lib/demo";
import { money } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { ReimbursementTable } from "@/components/reimbursement-table";
const modules: Record<string, { title: string; description: string }> = {
  contracts: {
    title: "Contracts",
    description: "The agreements behind your programs, together in one place.",
  },
  reimbursements: {
    title: "Reimbursements",
    description: "Keep every request moving, from evidence to payment.",
  },
  requirements: {
    title: "Requirements",
    description: "Know what’s needed, who owns it, and when it’s due.",
  },
  documents: {
    title: "Documents",
    description: "Supporting evidence, connected to the work.",
  },
  tasks: { title: "Tasks", description: "A shared place for the next steps." },
  settings: {
    title: "Organization settings",
    description: "Your team, permissions, and workspace.",
  },
  about: {
    title: "A foundation for more coordinated work.",
    description: "ContractOps · First implementation increment",
  },
};
export default async function Module({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const info = modules[module];
  if (!info) notFound();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{info.title}</h1>
          <p>{info.description}</p>
        </div>
        <span className="demo-chip">Fictional demo</span>
      </div>
      {module === "contracts" ? (
        <section className="panel">
          <div className="panel-heading">
            <h2>
              Contract portfolio{" "}
              <span className="subtle">{contracts.length} active</span>
            </h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Contract / agency</th>
                  <th>Contract value</th>
                  <th>Owner</th>
                  <th>Ends</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link className="table-title" href={`/contracts/${c.id}`}>
                        {c.name}
                      </Link>
                      <small>{c.agency}</small>
                    </td>
                    <td className="amount">{money(c.amount)}</td>
                    <td>{c.owner}</td>
                    <td>{c.ends}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : module === "reimbursements" ? (
        <ReimbursementTable />
      ) : module === "requirements" ? (
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming requirements</h2>
          </div>
          {requirements.map((r) => (
            <div className="requirement-row" key={r.title}>
              <div>
                <h3>{r.title}</h3>
                <p>
                  {r.contract} · {r.owner}
                </p>
              </div>
              <span>{r.due}, 2026</span>
              <StatusBadge status={r.state} />
            </div>
          ))}
        </section>
      ) : module === "about" ? (
        <section className="panel about-panel">
          <ShieldCheck size={28} />
          <h2>Built around the work behind the mission.</h2>
          <p>
            This preview includes navigation, a dashboard, contract summaries,
            reimbursement filters, and the foundational tenant-scoped database
            schema. All people, organizations, amounts, and events shown are
            fictional.
          </p>
          <h3>Next implementation increments</h3>
          <ol>
            <li>
              Authentication, staff invitations, and verified organization
              isolation.
            </li>
            <li>Contract and reimbursement editing with audit logging.</li>
            <li>Requirements, tasks, and private document uploads.</li>
            <li>
              AI extraction with source references and required human approval.
            </li>
          </ol>
          <p>
            This is a demo interface. It does not accept uploads, process
            payments, or make compliance determinations. Do not enter client,
            patient, or protected health information.
          </p>
          <Link className="text-link" href="/dashboard">
            Return to overview <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <section className="panel empty-state">
          <FolderOpen size={34} />
          <h2>
            {module === "settings"
              ? "Your team’s workspace, coming next."
              : `A home for your ${module}.`}
          </h2>
          <p>
            {module === "documents"
              ? "Private uploads, version history, and evidence links will be added after authentication and access controls are verified."
              : module === "tasks"
                ? "Assignments, deadlines, and blockers will connect directly to contracts and requests in a later increment."
                : "Invitations and role management will be available after authentication is implemented."}
          </p>
          <span className="implementation-label">
            Planned module · No changes can be saved yet
          </span>
          <Link href="/dashboard" className="text-link">
            Back to overview <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </>
  );
}
