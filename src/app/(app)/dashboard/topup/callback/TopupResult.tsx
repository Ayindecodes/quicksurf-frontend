"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useApi, useInterval } from "@/hooks/useApi";
import { errorMessage } from "@/lib/api";
import { topups, wallet } from "@/lib/endpoints";
import { naira } from "@/lib/format";

import { TOPUP_REFERENCE_KEY } from "../Topup";

const CHECK_EVERY_MS = 3000;
const noSubscription = () => () => {};
const MAX_CHECKS = 10;

export function TopupResult() {
  const params = useSearchParams();
  // Paystack adds ?reference=...&trxref=...; fall back to the one saved before leaving for checkout.
  const saved = useSyncExternalStore(
    noSubscription,
    () => sessionStorage.getItem(TOPUP_REFERENCE_KEY) ?? "",
    () => "",
  );
  const reference = params.get("reference") || params.get("trxref") || saved;
  const [checks, setChecks] = useState(1);
  const [limit, setLimit] = useState(MAX_CHECKS);
  const checkAgain = () => {
    setLimit(checks + MAX_CHECKS);
    setChecks(checks + 1);
  };
  const verify = useApi(reference ? `verify:${reference}:${checks}` : null, () => topups.verify(reference));
  const status = verify.data?.status;
  const waiting = !status || status === "pending" || status === "initialized";
  const polling = waiting && !verify.error && checks < limit;
  const balance = useApi(status === "success" ? "balance" : null, wallet.balance);

  useInterval(() => setChecks((n) => n + 1), CHECK_EVERY_MS, polling && !verify.loading);

  if (!reference) {
    return (
      <Result Icon={XCircle} tone="text-red-700" title="No payment to check">
        <p>We couldn&apos;t find a payment reference.</p>
        <ButtonLink href="/dashboard/topup">Start a top-up</ButtonLink>
      </Result>
    );
  }

  if (verify.error && !verify.data) {
    return (
      <Result Icon={Clock} tone="text-amber-600" title="We couldn't check your payment">
        <Alert tone="error">{errorMessage(verify.error)}</Alert>
        <Button onClick={checkAgain}>Check again</Button>
        <Reference value={reference} />
      </Result>
    );
  }

  switch (status) {
    case "success":
      return (
        <Result Icon={CheckCircle2} tone="text-emerald-600" title="Payment received">
          <p>Your wallet has been funded.</p>
          {balance.data && <p className="text-lg font-semibold">New balance: {naira(balance.data.balance)}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/dashboard/airtime">Buy airtime</ButtonLink>
            <ButtonLink href="/dashboard/data" variant="secondary">
              Buy data
            </ButtonLink>
          </div>
        </Result>
      );
    case "review":
      return (
        <Result Icon={Clock} tone="text-amber-600" title="We're checking this payment">
          <p>
            The amount paid didn&apos;t match the amount requested, so it hasn&apos;t been added to your wallet yet.
            Our team will review it and contact you. Nothing else is needed from you.
          </p>
          <Reference value={reference} />
        </Result>
      );
    case "failed":
    case "abandoned":
      return (
        <Result Icon={XCircle} tone="text-red-700" title="Payment not completed">
          <p>No money was taken for this top-up.</p>
          <ButtonLink href="/dashboard/topup">Try again</ButtonLink>
        </Result>
      );
    default:
      return polling ? (
        <Result Icon={null} tone="" title="Confirming your payment…">
          <Spinner className="h-8 w-8 text-brand-harbor" label="Checking with Paystack" />
          <p>This usually takes a few seconds. Please don&apos;t close this page.</p>
        </Result>
      ) : (
        <Result Icon={Clock} tone="text-amber-600" title="Still waiting for Paystack">
          <p>
            If you completed the payment, your wallet will be credited automatically as soon as Paystack confirms
            it. You can leave this page.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={checkAgain}>Check again</Button>
            <ButtonLink href="/dashboard" variant="secondary">
              Go to dashboard
            </ButtonLink>
          </div>
          <Reference value={reference} />
        </Result>
      );
  }
}

function Result({
  Icon,
  tone,
  title,
  children,
}: {
  Icon: typeof Clock | null;
  tone: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="mx-auto max-w-md text-center">
      <div aria-live="polite" className="flex flex-col items-center gap-4">
        {Icon && <Icon className={`h-12 w-12 ${tone}`} aria-hidden="true" />}
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex flex-col items-center gap-4 text-sm text-brand-ink/75">{children}</div>
      </div>
    </Card>
  );
}

function Reference({ value }: { value: string }) {
  return (
    <p className="text-xs text-brand-ink/60">
      Payment reference: <span className="font-mono">{value}</span>
    </p>
  );
}
