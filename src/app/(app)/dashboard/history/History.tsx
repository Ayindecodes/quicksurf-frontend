"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { HistoryList } from "@/components/HistoryList";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/Field";
import { useApi } from "@/hooks/useApi";
import { errorMessage } from "@/lib/api";
import { wallet, type HistoryFilters } from "@/lib/endpoints";
import { lagosToday } from "@/lib/format";
import type { HistoryLine } from "@/lib/types";

const KINDS = [
  ["", "Everything"],
  ["topup", "Top-ups"],
  ["purchase", "Purchases"],
  ["refund", "Refunds"],
  ["reward", "Rewards"],
  ["adjustment", "Corrections"],
] as const;

type More = { key: string; lines: HistoryLine[]; page: number; done: boolean };

export function History() {
  const [filters, setFilters] = useState<HistoryFilters>({ kind: "", date_from: "", date_to: "" });
  const key = JSON.stringify(filters);
  const first = useApi(`history:${key}`, () => wallet.history(filters, 1));
  const [more, setMore] = useState<More>({ key, lines: [], page: 1, done: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const extra = more.key === key ? more : { key, lines: [], page: 1, done: false };
  const lines = [...(first.data?.results ?? []), ...extra.lines];
  const hasMore = first.data ? (extra.page === 1 ? Boolean(first.data.next) : !extra.done) : false;
  const filtered = Boolean(filters.kind || filters.date_from || filters.date_to);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = extra.page + 1;
      const next = await wallet.history(filters, page);
      setMore({ key, lines: [...extra.lines, ...next.results], page, done: !next.next });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  async function downloadStatement() {
    setDownloading(true);
    try {
      const to = filters.date_to || lagosToday();
      const from = filters.date_from || lagosToday(-30);
      const blob = await wallet.statement(from, to);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quicksurf-statement-${from}-to-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="History"
        description="Every top-up, purchase, refund and reward in your wallet."
        actions={
          <Button variant="secondary" onClick={downloadStatement} loading={downloading}>
            <Download className="h-4 w-4" aria-hidden="true" /> Statement
          </Button>
        }
      />
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Show"
            value={filters.kind}
            onChange={(e) => setFilters({ ...filters, kind: e.target.value as HistoryFilters["kind"] })}
          >
            {KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="From"
            type="date"
            max={filters.date_to || lagosToday()}
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          />
          <TextField
            label="To"
            type="date"
            min={filters.date_from}
            max={lagosToday()}
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          />
        </div>
        <p className="mt-2 text-xs text-brand-ink/60">
          The statement covers the dates you pick (the last 30 days if you don&apos;t), up to a year.
        </p>

        <div className="mt-4" aria-live="polite" aria-busy={first.loading}>
          {first.error ? (
            <Alert tone="error">
              {errorMessage(first.error)}{" "}
              <button type="button" onClick={first.reload} className="font-semibold underline">
                Try again
              </button>
            </Alert>
          ) : first.loading && !first.data ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : lines.length === 0 ? (
            filtered ? (
              <EmptyState title="Nothing matches these filters">Try another type or date range.</EmptyState>
            ) : (
              <EmptyState title="No activity yet" action={<ButtonLink href="/dashboard/topup">Fund your wallet</ButtonLink>}>
                Your top-ups and purchases will appear here.
              </EmptyState>
            )
          ) : (
            <>
              <HistoryList lines={lines} />
              {hasMore && (
                <Button variant="secondary" onClick={loadMore} loading={loadingMore} className="mt-4 w-full">
                  Show more
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    </>
  );
}
