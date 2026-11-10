import { cn } from "@/lib/utils";
export function StatusBadge({ status }: { status: string }) {
  const tone = /Blocked|Missing/.test(status)
    ? "danger"
    : /Ready|Active|Complete/.test(status)
      ? "success"
      : /Submitted/.test(status)
        ? "info"
        : "neutral";
  return (
    <span className={cn("status-badge", `status-${tone}`)}>
      <span />
      {status}
    </span>
  );
}
