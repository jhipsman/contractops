import "server-only";
import { contracts, reimbursements, requirements } from "@/lib/demo";
// Explicit fixture boundary. Replace with authenticated, organization-scoped queries
// in the authentication increment; never silently fall back to fixtures in live mode.
export async function getDemoDashboard() {
  return {
    contracts,
    reimbursements,
    requirements,
    outstanding: reimbursements
      .filter((r) => r.status !== "Paid")
      .reduce((total, r) => total + r.amount, 0),
    missingEvidence: 4,
    blocked: reimbursements.filter((r) => r.status === "Blocked").length,
  };
}
