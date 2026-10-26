import { ArrowDownLeft, ArrowUpRight, Gift, RotateCcw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { cn } from "@/components/ui/cn";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { dateTime, signedNaira } from "@/lib/format";
import type { HistoryKind, HistoryLine } from "@/lib/types";

const ICONS: Record<HistoryKind, typeof Gift> = {
  topup: ArrowDownLeft,
  purchase: ArrowUpRight,
  refund: RotateCcw,
  reward: Gift,
  adjustment: SlidersHorizontal,
  opening: ArrowDownLeft,
};

function Row({ line }: { line: HistoryLine }) {
  const Icon = ICONS[line.kind];
  const credit = !line.amount.startsWith("-");
  const body = (
    <>
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full",
          credit ? "bg-emerald-50 text-emerald-700" : "bg-brand-harbor/10 text-brand-harbor",
        )}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{line.description}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-brand-ink/60">
          {dateTime(line.date)}
          {line.kind === "purchase" && line.status && <StatusBadge status={line.status} />}
        </span>
      </span>
      <span className={cn("text-sm font-semibold", credit ? "text-emerald-700" : "text-brand-ink")}>
        {signedNaira(line.amount)}
      </span>
    </>
  );
  const linksToPurchase = line.phone !== undefined && (line.kind === "purchase" || line.kind === "refund");
  return (
    <li>
      {linksToPurchase ? (
        <Link
          href={`/dashboard/purchases/${encodeURIComponent(line.reference)}`}
          className="flex items-center gap-3 px-1 py-3 hover:bg-black/[.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-1 py-3">{body}</div>
      )}
    </li>
  );
}

export function HistoryList({ lines }: { lines: HistoryLine[] }) {
  return (
    <ul className="divide-y divide-black/5">
      {lines.map((line) => (
        <Row key={line.id} line={line} />
      ))}
    </ul>
  );
}
