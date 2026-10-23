"use client";

import { Gift } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { onlyDigits, TextField } from "@/components/ui/Field";
import { useApi } from "@/hooks/useApi";
import { errorMessage } from "@/lib/api";
import { rewards } from "@/lib/endpoints";
import { date, naira } from "@/lib/format";

export function RewardsView() {
  const info = useApi("rewards", rewards.get);
  const [points, setPoints] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const data = info.data;

  async function redeem(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await rewards.redeem(Number(points));
      toast.success(`${naira(result.credited)} added to your wallet`);
      setPoints("");
      info.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Rewards" />
        {info.error ? (
          <Alert tone="error">
            {errorMessage(info.error)}{" "}
            <button type="button" onClick={info.reload} className="font-semibold underline">
              Try again
            </button>
          </Alert>
        ) : (
          <Skeleton className="h-48" />
        )}
      </>
    );
  }

  const enough = data.points >= data.min_redemption;
  const wanted = Number(points || 0);
  const invalid = points !== "" && (wanted < data.min_redemption || wanted > data.points);
  const progress = Math.min(100, Math.max(0, (data.points / data.min_redemption) * 100));

  return (
    <>
      <PageHeader title="Rewards" description="Earn points on every successful purchase and turn them into wallet money." />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Gift className="h-6 w-6 text-brand-accent" aria-hidden="true" />
          <p className="mt-3 text-4xl font-bold">{data.points.toLocaleString("en-NG")}</p>
          <p className="text-sm text-brand-ink/70">
            points, worth {naira(data.naira_value)} (1 point = {naira(data.point_value)})
          </p>
          {!enough && (
            <div className="mt-5">
              <div className="h-2 overflow-hidden rounded-full bg-black/5" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to your first redemption">
                <div className="h-full rounded-full bg-brand-mint" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-brand-ink/60">
                You can redeem from {data.min_redemption.toLocaleString("en-NG")} points.
              </p>
            </div>
          )}
          <p className="mt-5 text-xs text-brand-ink/60">
            If the network reverses a purchase, the points it earned are taken back.
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold">Redeem points</h2>
          <form onSubmit={redeem} className="mt-4 space-y-4" noValidate>
            {error && <Alert tone="error">{error}</Alert>}
            <TextField
              label="Points to redeem"
              inputMode="numeric"
              disabled={!enough}
              value={points}
              onChange={(e) => setPoints(onlyDigits(e.target.value, 9))}
              error={invalid ? `Enter between ${data.min_redemption} and ${data.points} points.` : undefined}
              hint={enough ? `You'll get ${naira(wanted * Number(data.point_value))}.` : `Redeeming starts at ${data.min_redemption} points.`}
            />
            <div className="flex gap-2">
              <Button variant="secondary" disabled={!enough} onClick={() => setPoints(String(data.points))}>
                Use all
              </Button>
              <Button type="submit" loading={busy} disabled={!enough || !wanted || invalid} className="flex-1">
                Redeem to wallet
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">Recent points</h2>
        {data.recent.length === 0 ? (
          <EmptyState title="No points yet">Buy airtime or data to start earning.</EmptyState>
        ) : (
          <ul className="mt-2 divide-y divide-black/5">
            {data.recent.map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-medium">{entry.reason}</span>
                  <span className="text-xs text-brand-ink/60">{date(entry.date)}</span>
                </span>
                <span className={cn("font-semibold", entry.points > 0 ? "text-emerald-700" : "text-brand-ink")}>
                  {entry.points > 0 ? "+" : "−"}
                  {Math.abs(entry.points).toLocaleString("en-NG")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
