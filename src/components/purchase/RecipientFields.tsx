"use client";

import { useRef } from "react";

import { cn } from "@/components/ui/cn";
import { TextField } from "@/components/ui/Field";
import { NetworkPicker } from "@/components/ui/NetworkPicker";
import { useApi } from "@/hooks/useApi";
import { purchases, savedNumbers } from "@/lib/endpoints";
import { NETWORK_NAMES, normalizePhone } from "@/lib/format";
import type { Network } from "@/lib/types";

export type Recipient = { phone: string; network: Network | "" };

/** Phone number and network, with the user's saved numbers and a network guess from the prefix. */
export function RecipientFields({
  value,
  onChange,
  errors = {},
}: {
  value: Recipient;
  onChange: (next: Recipient) => void;
  errors?: { phone?: string; network?: string };
}) {
  const saved = useApi("saved-numbers", savedNumbers.list);
  const networkChosen = useRef(false); // once the user picks a network, stop guessing
  const latestPhone = useRef(value.phone);

  function changePhone(phone: string) {
    latestPhone.current = phone;
    if (!phone) networkChosen.current = false;
    onChange({ ...value, phone });
    const normalized = normalizePhone(phone);
    if (!normalized || networkChosen.current) return;
    purchases
      .detectNetwork(normalized)
      .then(({ network }) => {
        const stillTheSameNumber = normalizePhone(latestPhone.current) === normalized;
        if (network && stillTheSameNumber && !networkChosen.current) onChange({ phone: latestPhone.current, network });
      })
      .catch(() => {}); // only a convenience: the user can still pick the network
  }

  const phoneError =
    errors.phone ?? (value.phone.replace(/\D/g, "").length >= 11 && !normalizePhone(value.phone) ? "Enter a Nigerian number like 0803 123 4567." : undefined);

  return (
    <div className="space-y-5">
      {saved.data && saved.data.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Saved numbers</p>
          <div className="flex flex-wrap gap-2">
            {saved.data.map((entry) => {
              const selected = normalizePhone(value.phone) === entry.phone;
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    networkChosen.current = true;
                    latestPhone.current = entry.phone;
                    onChange({ phone: entry.phone, network: entry.network });
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40",
                    selected ? "border-brand-harbor bg-brand-harbor/5 text-brand-harbor" : "border-black/10 bg-white hover:bg-brand-porcelain",
                  )}
                >
                  <span className="font-medium">{entry.name}</span>{" "}
                  <span className="text-brand-ink/60">
                    {entry.phone} · {NETWORK_NAMES[entry.network]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <TextField
        label="Phone number"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="0803 123 4567"
        value={value.phone}
        onChange={(e) => changePhone(e.target.value)}
        error={phoneError}
      />
      <NetworkPicker
        value={value.network}
        onChange={(network) => {
          networkChosen.current = true;
          onChange({ ...value, network });
        }}
        error={errors.network}
        hint="We guess the network from the number. Change it if the number was moved to another network."
      />
    </div>
  );
}

/** Remember a number after a purchase, if the user asked to. Failures are ignored (e.g. already saved). */
export async function saveNumber(name: string, phone: string, network: Network) {
  try {
    await savedNumbers.add({ name: name.trim() || phone, phone, network });
  } catch {
    // not worth interrupting a successful purchase for
  }
}
