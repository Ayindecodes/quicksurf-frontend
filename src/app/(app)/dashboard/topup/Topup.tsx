"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { onlyDigits, TextField } from "@/components/ui/Field";
import { ApiError, errorMessage } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { account, topups } from "@/lib/endpoints";
import { naira } from "@/lib/format";

const PRESETS = [1000, 2000, 5000, 10000];
const MINIMUM = 100;
export const TOPUP_REFERENCE_KEY = "qs_topup_reference";

export function Topup() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<ApiError | string | null>(null);
  const [busy, setBusy] = useState(false);
  const value = Number(amount || 0);
  const tooSmall = amount !== "" && value < MINIMUM;
  const me = useApi("topup-limits", account.me);
  const limits = me.data?.limits;
  const remainingToday =
    limits && Number(limits.daily_topup_limit) > 0
      ? Math.max(Number(limits.daily_topup_limit) - Number(limits.topped_up_today), 0)
      : null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { reference, authorization_url } = await topups.start(String(value));
      sessionStorage.setItem(TOPUP_REFERENCE_KEY, reference);
      window.location.assign(authorization_url); // Paystack checkout; it sends the user back to /dashboard/topup/callback
    } catch (err) {
      setError(err instanceof ApiError ? err : errorMessage(err));
      setBusy(false);
    }
  }

  const apiError = error instanceof ApiError ? error : null;
  return (
    <>
      <PageHeader title="Top up your wallet" description="Pay with Paystack. Your balance updates as soon as the payment is confirmed." />
      <Card className="max-w-md">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {apiError?.code === "email_unverified" ? (
            <Alert tone="warning" title="Confirm your email first">
              <Link href="/dashboard/verify-email" className="font-semibold underline">
                Enter the code we emailed you
              </Link>{" "}
              and then come back to fund your wallet.
            </Alert>
          ) : apiError?.code === "phone_unverified" ? (
            <Alert tone="warning" title="Verify your phone number first">
              <Link href="/dashboard/account#phone" className="font-semibold underline">
                Confirm your number with a texted code
              </Link>{" "}
              and then come back to fund your wallet.
            </Alert>
          ) : apiError?.code === "daily_topup_limit" ? (
            <Alert tone="warning" title="Daily top-up limit reached">
              {apiError.message}{" "}
              {apiError.extra.level === "basic" && (
                <Link href="/dashboard/account#phone" className="font-semibold underline">
                  Verify your phone number to raise it.
                </Link>
              )}
            </Alert>
          ) : (
            error && <Alert tone="error">{apiError ? (apiError.field("amount") ?? apiError.message) : String(error)}</Alert>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                aria-pressed={value === preset}
                className={cn(
                  "min-h-11 rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40",
                  value === preset ? "border-brand-harbor bg-brand-harbor/5 text-brand-harbor" : "border-black/10 bg-white hover:bg-brand-porcelain",
                )}
              >
                {naira(preset).replace(".00", "")}
              </button>
            ))}
          </div>
          <TextField
            label="Amount (₦)"
            inputMode="numeric"
            placeholder="e.g. 3000"
            value={amount}
            onChange={(e) => setAmount(onlyDigits(e.target.value, 7))}
            error={tooSmall ? `The minimum top-up is ${naira(MINIMUM)}.` : undefined}
            hint={remainingToday !== null ? `You can top up ${naira(remainingToday)} more today.` : undefined}
          />
          <Button type="submit" loading={busy} disabled={!value || tooSmall} className="w-full">
            {value >= MINIMUM ? `Pay ${naira(value)}` : "Continue to payment"}
          </Button>
          <p className="text-center text-xs text-brand-ink/60">You&apos;ll be taken to Paystack&apos;s secure checkout.</p>
        </form>
      </Card>
    </>
  );
}
