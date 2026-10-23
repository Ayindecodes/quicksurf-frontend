"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { ConfirmPurchase } from "@/components/purchase/ConfirmPurchase";
import { newClientReference } from "@/components/purchase/purchaseErrors";
import { RecipientFields, saveNumber, type Recipient } from "@/components/purchase/RecipientFields";
import { SaveNumberOption, type SaveChoice } from "@/components/purchase/SaveNumberOption";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader, Skeleton } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { useApi } from "@/hooks/useApi";
import { ApiError, errorMessage } from "@/lib/api";
import { purchases } from "@/lib/endpoints";
import { NETWORK_NAMES, naira, normalizePhone } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function BuyData() {
  const router = useRouter();
  const [recipient, setRecipient] = useState<Recipient>({ phone: "", network: "" });
  const [planCode, setPlanCode] = useState("");
  const [search, setSearch] = useState("");
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const [save, setSave] = useState<SaveChoice>({ save: false, name: "" });
  const [confirming, setConfirming] = useState(false);
  const attempt = useRef<{ order: string; reference: string } | null>(null);

  const network = recipient.network;
  const plans = useApi(network ? `plans:${network}` : null, () => purchases.plans(network as Exclude<typeof network, "">));
  const list = plans.data?.network === network ? plans.data.plans : [];
  const priced = (plan: Plan): Plan => ({ ...plan, price: newPrices[plan.code] ?? plan.price });
  const selected = list.find((plan) => plan.code === planCode);
  const plan = selected && priced(selected);
  const phone = normalizePhone(recipient.phone);
  const visible = list.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const ready = Boolean(phone && network && plan);

  function changeRecipient(next: Recipient) {
    if (next.network !== recipient.network) setPlanCode("");
    setRecipient(next);
  }

  async function buy(pin: string) {
    if (!network || !plan) return;
    const order = `${network}:${phone}:${plan.code}:${plan.price}`;
    if (attempt.current?.order !== order) attempt.current = { order, reference: newClientReference() };
    try {
      const purchase = await purchases.buyData({
        network,
        phone,
        plan: plan.code,
        amount: plan.price,
        pin,
        client_reference: attempt.current.reference,
      });
      attempt.current = null;
      if (save.save) await saveNumber(save.name, phone, network);
      router.push(`/dashboard/purchases/${encodeURIComponent(purchase.client_reference)}`);
    } catch (err) {
      if (err instanceof ApiError && typeof err.extra.price === "string") {
        const price = err.extra.price;
        setNewPrices((prices) => ({ ...prices, [plan.code]: price }));
        throw new ApiError({
          status: err.status,
          code: "price_changed",
          message: `This plan's price has just changed to ${naira(price)}. Check the new total, then confirm again.`,
        });
      }
      throw err;
    }
  }

  function review(event: FormEvent) {
    event.preventDefault();
    if (ready) setConfirming(true);
  }

  return (
    <>
      <PageHeader title="Buy data" description="Data plans for MTN, Glo, Airtel and 9mobile, at today's prices." />
      <Card className="max-w-xl">
        <form onSubmit={review} className="space-y-5" noValidate>
          <RecipientFields value={recipient} onChange={changeRecipient} />

          {network && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">{NETWORK_NAMES[network]} data plans</legend>
              {plans.error ? (
                <Alert tone="error">
                  {errorMessage(plans.error)}{" "}
                  <button type="button" onClick={plans.reload} className="font-semibold underline">
                    Try again
                  </button>
                </Alert>
              ) : plans.loading || !plans.data ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : (
                <>
                  {list.length > 6 && (
                    <div className="relative mb-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" aria-hidden="true" />
                      <input
                        type="search"
                        aria-label="Search plans"
                        placeholder="Search plans, e.g. 1GB or 30 days"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block min-h-11 w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-base outline-none focus:border-brand-harbor focus:ring-4 focus:ring-brand-mint/25"
                      />
                    </div>
                  )}
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {visible.length === 0 && <p className="py-4 text-center text-sm text-brand-ink/60">No plans match.</p>}
                    {visible.map((option) => {
                      const shown = priced(option);
                      return (
                        <label
                          key={option.code}
                          className={cn(
                            "flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition",
                            "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-mint/40",
                            planCode === option.code ? "border-brand-harbor bg-brand-harbor/5" : "border-black/10 bg-white hover:bg-brand-porcelain",
                          )}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={option.code}
                            checked={planCode === option.code}
                            onChange={() => setPlanCode(option.code)}
                            className="sr-only"
                          />
                          <span className="font-medium">{option.name}</span>
                          <span className="shrink-0 font-semibold">{naira(shown.price)}</span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </fieldset>
          )}

          <SaveNumberOption phone={phone} value={save} onChange={setSave} />
          <Button type="submit" disabled={!ready} className="w-full">
            {plan ? `Continue · ${naira(plan.price)}` : "Continue"}
          </Button>
        </form>
      </Card>
      {network && plan && (
        <ConfirmPurchase
          open={confirming}
          onClose={() => setConfirming(false)}
          rows={[
            ["Data for", phone],
            ["Network", NETWORK_NAMES[network]],
            ["Plan", plan.name],
          ]}
          total={naira(plan.price)}
          onConfirm={buy}
        />
      )}
    </>
  );
}
