"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { onlyDigits, PinField } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";

import { purchaseErrorMessage } from "./purchaseErrors";

type Props = {
  open: boolean;
  onClose: () => void;
  rows: [string, string][];
  total: string;
  /** Places the order. Throws (ApiError) if it's refused; the dialog shows why. */
  onConfirm: (pin: string) => Promise<void>;
};

export function ConfirmPurchase({ open, onClose, ...form }: Props) {
  return (
    <Dialog open={open} onClose={onClose} title="Confirm purchase">
      <ConfirmForm {...form} />
    </Dialog>
  );
}

function ConfirmForm({ rows, total, onConfirm }: Omit<Props, "open" | "onClose">) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<ReactNode>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onConfirm(pin);
    } catch (err) {
      setError(purchaseErrorMessage(err));
      if (err instanceof ApiError && err.code.startsWith("pin")) setPin("");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <dl className="divide-y divide-black/5 rounded-xl border border-black/5 bg-brand-porcelain px-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-brand-ink/70">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-2.5 text-base">
          <dt className="font-semibold">You pay</dt>
          <dd className="font-bold">{total}</dd>
        </div>
      </dl>
      {error && <Alert tone="error">{error}</Alert>}
      <PinField
        label="Transaction PIN"
        autoFocus
        required
        value={pin}
        onChange={(e) => setPin(onlyDigits(e.target.value, 4))}
      />
      <Button type="submit" loading={busy} disabled={pin.length !== 4} className="w-full">
        Pay {total}
      </Button>
    </form>
  );
}
