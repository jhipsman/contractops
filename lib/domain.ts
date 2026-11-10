import { z } from "zod";
export const roles = ["admin", "manager", "contributor", "viewer"] as const;
export type Role = (typeof roles)[number];
export const contractSchema = z
  .object({
    organizationId: z.string().uuid(),
    name: z.string().trim().min(1).max(200),
    agency: z.string().trim().min(1).max(200),
    program: z.string().trim().min(1).max(200),
    amount: z.number().nonnegative().finite(),
    startsOn: z.string().date(),
    endsOn: z.string().date(),
    ownerId: z.string().uuid().nullable(),
  })
  .refine((v) => v.endsOn >= v.startsOn, {
    message: "End date must follow start date",
    path: ["endsOn"],
  });
export const reimbursementSchema = z
  .object({
    organizationId: z.string().uuid(),
    contractId: z.string().uuid(),
    amount: z.number().positive().finite(),
    periodStart: z.string().date(),
    periodEnd: z.string().date(),
    status: z.enum([
      "draft",
      "preparing",
      "ready",
      "submitted",
      "paid",
      "blocked",
    ]),
  })
  .refine((v) => v.periodEnd >= v.periodStart, {
    message: "Invalid reimbursement period",
    path: ["periodEnd"],
  });
export function canWrite(role: Role) {
  return role !== "viewer";
}
export function canManage(role: Role) {
  return role === "admin" || role === "manager";
}
