"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { ConfirmPurchase } from "@/components/purchase/ConfirmPurchase";
import { newClientReference } from "@/components/purchase/purchaseErrors";
import { RecipientFields, saveNumber, type Recipient } from "@/components/purchase/RecipientFields";
import { SaveNumberOption, type SaveChoice } from "@/components/purchase/SaveNumberOption";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { onlyDigits, TextField } from "@/components/ui/Field";
import { purchases } from "@/lib/endpoints";
import { NETWORK_NAMES, naira, normalizePhone } from "@/lib/format";

const PRESETS = [100, 200, 500, 1000, 2000];
const MIN = 50;
const MAX = 50000;

export function BuyAirtime() {
  const router = useRouter();
  const [recipient, setRecipient] = useState<Recipient>({ phone: "", network: "" });
  const [amount, setAmount] = useState("");
  const [save, setSave] = useState<SaveChoice>({ save: false, name: "" });
  const [confirming, setConfirming] = useState(false);
  const attempt = useRef<{ order: string; reference: string } | null>(null);

  const phone = normalizePhone(recipient.phone);
  const value = Number(amount || 0);
  const amountError = amount && (value < MIN || value > MAX) ? `Enter an amount from ${naira(MIN)} to ${naira(MAX)}.` : undefined;
  const ready = Boolean(phone && recipient.network && value && !amountError);

  /** The same order keeps the same reference, so a retry after a dropped connection can't charge twice. */
  function referenceFor(order: string) {
    if (attempt.current?.order !== order) attempt.current = { order, reference: newClientReference() };
    return attempt.current.reference;
  }

  async function buy(pin: string) {
    if (!recipient.network) return;
    const order = `${recipient.network}:${phone}:${value}`;
    const purchase = await purchases.buyAirtime({
      network: recipient.network,
      phone,
      amount: String(value),
      pin,
      client_reference: referenceFor(order),
    });
    attempt.current = null;
    if (save.save) await saveNumber(save.name, phone, recipient.network);
    router.push(`/dashboard/purchases/${encodeURIComponent(purchase.client_reference)}`);
  }

  function review(event: FormEvent) {
    event.preventDefault();
    if (ready) setConfirming(true);
  }

  return (
    <>
      <PageHeader title="Buy airtime" description="For any MTN, Glo, Airtel or 9mobile number." />
      <Card className="max-w-xl">
        <form onSubmit={review} className="space-y-5" noValidate>
          <RecipientFields value={recipient} onChange={setRecipient} />
          <div>
            <TextField
              label="Amount (₦)"
              inputMode="numeric"
              placeholder={`${MIN} to ${MAX.toLocaleString("en-NG")}`}
              value={amount}
              onChange={(e) => setAmount(onlyDigits(e.target.value, 5))}
              error={amountError}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={value === preset}
                  onClick={() => setAmount(String(preset))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40",
                    value === preset ? "border-brand-harbor bg-brand-harbor/5 text-brand-harbor" : "border-black/10 bg-white hover:bg-brand-porcelain",
                  )}
                >
                  ₦{preset.toLocaleString("en-NG")}
                </button>
              ))}
            </div>
          </div>
          <SaveNumberOption phone={phone} value={save} onChange={setSave} />
          <Button type="submit" disabled={!ready} className="w-full">
            Continue
          </Button>
        </form>
      </Card>
      {recipient.network && (
        <ConfirmPurchase
          open={confirming}
          onClose={() => setConfirming(false)}
          rows={[
            ["Airtime for", phone],
            ["Network", NETWORK_NAMES[recipient.network]],
          ]}
          total={naira(value)}
          onConfirm={buy}
        />
      )}
    </>
  );
}
