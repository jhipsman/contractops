import { describe, expect, it } from "vitest";
import {
  canManage,
  canWrite,
  contractSchema,
  reimbursementSchema,
} from "../lib/domain";
const base = {
  organizationId: "11111111-1111-4111-8111-111111111111",
  name: "Fictional contract",
  agency: "Fictional agency",
  program: "Housing",
  amount: 100,
  startsOn: "2026-01-01",
  endsOn: "2026-12-31",
  ownerId: null,
};
describe("contract validation", () => {
  it("accepts a valid contract", () =>
    expect(contractSchema.safeParse(base).success).toBe(true));
  it("rejects an inverted contract period", () =>
    expect(
      contractSchema.safeParse({ ...base, endsOn: "2025-12-31" }).success,
    ).toBe(false));
  it.each([-1, Infinity, NaN])("rejects invalid amounts: %s", (amount) =>
    expect(contractSchema.safeParse({ ...base, amount }).success).toBe(false),
  );
  it("requires organization identity", () =>
    expect(
      contractSchema.safeParse({ ...base, organizationId: "" }).success,
    ).toBe(false));
});
describe("role capabilities", () => {
  it("keeps viewers read-only", () => expect(canWrite("viewer")).toBe(false));
  it("does not give contributors management permission", () =>
    expect(canManage("contributor")).toBe(false));
  it.each(["admin", "manager"] as const)("allows %s to manage", (role) =>
    expect(canManage(role)).toBe(true),
  );
});
describe("reimbursement validation", () => {
  const request = {
    organizationId: base.organizationId,
    contractId: base.organizationId,
    amount: 100,
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    status: "draft",
  };
  it("rejects invalid workflow statuses", () =>
    expect(
      reimbursementSchema.safeParse({ ...request, status: "approved-by-ai" })
        .success,
    ).toBe(false));
  it("rejects inverted cycles", () =>
    expect(
      reimbursementSchema.safeParse({ ...request, periodEnd: "2025-01-01" })
        .success,
    ).toBe(false));
});
