"use client";

import { CheckCircle2, Clock, Printer, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Skeleton } from "@/components/ui/Card";
import { isPending, StatusBadge } from "@/components/ui/StatusBadge";
import { useApi, useInterval } from "@/hooks/useApi";
import { ApiError, errorMessage } from "@/lib/api";
import { purchases } from "@/lib/endpoints";
import { dateTime, naira, NETWORK_NAMES } from "@/lib/format";
import type { PurchaseStatus } from "@/lib/types";

const CHECK_EVERY_MS = 10_000;
const MAX_CHECKS = 18; // about 3 minutes; purchases keep settling in the background after that

const HEADLINES: Record<PurchaseStatus, { Icon: typeof Clock; tone: string; title: string }> = {
  successful: { Icon: CheckCircle2, tone: "text-emerald-600", title: "Delivered" },
  pending: { Icon: Clock, tone: "text-amber-600", title: "Processing" },
  initiated: { Icon: Clock, tone: "text-amber-600", title: "Processing" },
  failed: { Icon: XCircle, tone: "text-red-700", title: "Purchase failed" },
  reversed: { Icon: RotateCcw, tone: "text-sky-700", title: "Reversed by the network" },
};

export function ReceiptView({ reference }: { reference: string }) {
  const [checks, setChecks] = useState(0);
  // The first load reads the receipt; later ones ask VTpass for news first (the server limits how often).
  const receipt = useApi(`receipt:${reference}:${checks}`, async () => {
    if (checks > 0) await purchases.recheck(reference).catch(() => undefined);
    return purchases.receipt(reference);
  });
  const data = receipt.data;
  const pending = data ? isPending(data.status) : false;
  useInterval(() => setChecks((n) => n + 1), CHECK_EVERY_MS, pending && checks < MAX_CHECKS && !receipt.loading);

  if (receipt.error instanceof ApiError && receipt.error.status === 404) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-bold">Purchase not found</h1>
        <ButtonLink href="/dashboard/history" className="mt-4">
          Back to history
        </ButtonLink>
      </Card>
    );
  }
  if (!data) {
    return receipt.error ? (
      <Alert tone="error">
        {errorMessage(receipt.error)}{" "}
        <button type="button" onClick={receipt.reload} className="font-semibold underline">
          Try again
        </button>
      </Alert>
    ) : (
      <Card className="mx-auto max-w-md space-y-3">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="h-40" />
      </Card>
    );
  }

  const { Icon, tone, title } = HEADLINES[data.status];
  return (
    <Card className="mx-auto max-w-md">
      <div aria-live="polite" className="flex flex-col items-center gap-2 text-center">
        <Icon className={`h-12 w-12 ${tone}`} aria-hidden="true" />
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-3xl font-bold">{naira(data.amount)}</p>
        <StatusBadge status={data.status} />
        <p className="text-sm text-brand-ink/70">
          {data.status === "successful" && `${data.item} was sent to ${data.phone}.`}
          {pending &&
            (checks < MAX_CHECKS
              ? "We're waiting for the network to confirm. This page updates by itself."
              : "The network is taking longer than usual. Your money is held, not spent: you'll get the airtime or data, or a full refund.")}
          {data.status === "failed" && `${naira(data.amount)} has been returned to your wallet.`}
          {data.status === "reversed" && `The network reversed this purchase, so ${naira(data.amount)} has been returned to your wallet.`}
        </p>
      </div>

      <dl className="mt-6 divide-y divide-black/5 border-y border-black/5 text-sm">
        {[
          ["Item", data.item],
          ["Phone number", data.phone],
          ["Network", NETWORK_NAMES[data.network]],
          ["Date", dateTime(data.date)],
          ["Reference", data.reference],
          ...(data.vtpass_transaction_id ? [["VTpass transaction", data.vtpass_transaction_id]] : []),
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-brand-ink/70">{label}</dt>
            <dd className="break-all text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="no-print mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href={data.item.startsWith("Data") ? "/dashboard/data" : "/dashboard/airtime"}>Buy again</ButtonLink>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" /> Print
        </Button>
        {pending && checks >= MAX_CHECKS && (
          <Button variant="ghost" onClick={() => setChecks((n) => n + 1)}>
            Check again
          </Button>
        )}
      </div>
    </Card>
  );
}
