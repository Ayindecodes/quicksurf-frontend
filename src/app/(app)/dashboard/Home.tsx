"use client";

import { CheckCircle2, Circle, Gift, Plus, Smartphone, Wifi } from "lucide-react";
import Link from "next/link";

import { HistoryList } from "@/components/HistoryList";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, Skeleton } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { errorMessage } from "@/lib/api";
import { rewards, wallet } from "@/lib/endpoints";
import { naira } from "@/lib/format";

export function Home() {
  const { user } = useAuth();
  const balance = useApi("wallet", wallet.balance);
  const recent = useApi("recent", () => wallet.history({}, 1, 5));
  const points = useApi("rewards", rewards.get);
  const name = user?.first_name || user?.email.split("@")[0];
  const setupDone = user?.email_verified && user?.has_pin;

  return (
    <div className="space-y-6">
      <h1 className="truncate text-2xl font-bold tracking-tight">Hi {name}</h1>

      <section aria-label="Wallet" className="rounded-3xl bg-brand-harbor p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm text-white/80">Wallet balance</p>
        {balance.data ? (
          <p className="mt-1 text-4xl font-bold tracking-tight">{naira(balance.data.balance)}</p>
        ) : balance.error ? (
          <p className="mt-2 text-sm">
            {errorMessage(balance.error)}{" "}
            <button type="button" onClick={balance.reload} className="font-semibold underline">
              Retry
            </button>
          </p>
        ) : (
          <Skeleton className="mt-2 h-10 w-48 bg-white/20" />
        )}
        {balance.data && Number(balance.data.locked) > 0 && (
          <p className="mt-1 text-sm text-white/80">
            {naira(balance.data.locked)} on hold for purchases being processed
          </p>
        )}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
          <ButtonLink href="/dashboard/topup" variant="secondary" className="whitespace-nowrap border-0 px-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> Top up
          </ButtonLink>
          <ButtonLink href="/dashboard/airtime" className="whitespace-nowrap bg-white/15 px-2 hover:bg-white/25">
            <Smartphone className="h-4 w-4" aria-hidden="true" /> Airtime
          </ButtonLink>
          <ButtonLink href="/dashboard/data" className="whitespace-nowrap bg-white/15 px-2 hover:bg-white/25">
            <Wifi className="h-4 w-4" aria-hidden="true" /> Data
          </ButtonLink>
        </div>
      </section>

      {user && !setupDone && (
        <Card aria-labelledby="setup">
          <h2 id="setup" className="font-semibold">
            Finish setting up
          </h2>
          <ol className="mt-3 space-y-2 text-sm">
            <SetupStep done href="/register">
              Create your account
            </SetupStep>
            <SetupStep done={user.email_verified} href="/dashboard/verify-email">
              Confirm your email
            </SetupStep>
            <SetupStep done={user.has_pin} href="/dashboard/account#pin">
              Set your transaction PIN
            </SetupStep>
            <SetupStep done={false} href="/dashboard/topup">
              Fund your wallet
            </SetupStep>
          </ol>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2" aria-labelledby="recent">
          <div className="flex items-center justify-between">
            <h2 id="recent" className="font-semibold">
              Recent activity
            </h2>
            <Link href="/dashboard/history" className="text-sm font-medium text-brand-harbor hover:underline">
              See all
            </Link>
          </div>
          {recent.error ? (
            <Alert tone="error" className="mt-4">
              {errorMessage(recent.error)}{" "}
              <Button variant="ghost" onClick={recent.reload} className="min-h-0 p-0 underline">
                Retry
              </Button>
            </Alert>
          ) : !recent.data ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recent.data.results.length === 0 ? (
            <EmptyState
              title="No activity yet"
              action={<ButtonLink href="/dashboard/topup">Fund your wallet</ButtonLink>}
            >
              Top-ups and purchases will show up here.
            </EmptyState>
          ) : (
            <div className="mt-2">
              <HistoryList lines={recent.data.results} />
            </div>
          )}
        </Card>

        <Card aria-labelledby="points">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-brand-accent" aria-hidden="true" />
            <h2 id="points" className="font-semibold">
              Rewards
            </h2>
          </div>
          {points.data ? (
            <>
              <p className="mt-3 text-3xl font-bold">{points.data.points.toLocaleString("en-NG")}</p>
              <p className="text-sm text-brand-ink/70">points, worth {naira(points.data.naira_value)}</p>
            </>
          ) : (
            <Skeleton className="mt-3 h-12 w-32" />
          )}
          <ButtonLink href="/dashboard/rewards" variant="secondary" className="mt-4 w-full">
            View rewards
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}

function SetupStep({ done, href, children }: { done: boolean; href: string; children: string }) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex items-center gap-2">
      <Icon className={cn("h-5 w-5", done ? "text-emerald-600" : "text-brand-ink/30")} aria-hidden="true" />
      {done ? (
        <span className="text-brand-ink/60 line-through">
          {children}
          <span className="sr-only"> (done)</span>
        </span>
      ) : (
        <Link href={href} className="font-medium text-brand-harbor hover:underline">
          {children}
        </Link>
      )}
    </li>
  );
}
