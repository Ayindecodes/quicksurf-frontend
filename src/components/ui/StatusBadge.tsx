import type { PurchaseStatus, TopupStatus } from "@/lib/types";

import { cn } from "./cn";

const LOOK: Record<PurchaseStatus | TopupStatus, { label: string; className: string }> = {
  initiated: { label: "Processing", className: "bg-amber-100 text-amber-900" },
  pending: { label: "Processing", className: "bg-amber-100 text-amber-900" },
  initialized: { label: "Waiting for payment", className: "bg-amber-100 text-amber-900" },
  successful: { label: "Successful", className: "bg-emerald-100 text-emerald-900" },
  success: { label: "Successful", className: "bg-emerald-100 text-emerald-900" },
  failed: { label: "Failed", className: "bg-red-100 text-red-900" },
  abandoned: { label: "Not paid", className: "bg-black/5 text-brand-ink/80" },
  reversed: { label: "Refunded", className: "bg-sky-100 text-sky-900" },
  review: { label: "Under review", className: "bg-amber-100 text-amber-900" },
};

export function StatusBadge({ status, className }: { status: PurchaseStatus | TopupStatus; className?: string }) {
  const look = LOOK[status] ?? { label: status, className: "bg-black/5 text-brand-ink" };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", look.className, className)}>
      {look.label}
    </span>
  );
}

export const isPending = (status: PurchaseStatus) => status === "pending" || status === "initiated";
