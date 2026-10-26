"use client";

import { NETWORK_NAMES } from "@/lib/format";
import { NETWORKS, type Network } from "@/lib/types";

import { cn } from "./cn";

const DOT: Record<Network, string> = {
  mtn: "bg-yellow-400",
  glo: "bg-green-600",
  airtel: "bg-red-600",
  "9mobile": "bg-emerald-800",
};

export function NetworkPicker({
  value,
  onChange,
  hint,
  error,
}: {
  value: Network | "";
  onChange: (network: Network) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 block text-sm font-medium text-brand-ink">Network</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {NETWORKS.map((network) => (
          <label
            key={network}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
              "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-mint/40",
              value === network ? "border-brand-harbor bg-brand-harbor/5" : "border-black/10 bg-white hover:bg-brand-porcelain",
            )}
          >
            <input
              type="radio"
              name="network"
              value={network}
              checked={value === network}
              onChange={() => onChange(network)}
              className="sr-only"
            />
            <span className={cn("h-3 w-3 rounded-full", DOT[network])} aria-hidden="true" />
            {NETWORK_NAMES[network]}
          </label>
        ))}
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-700">{error}</p>
      ) : (
        hint && <p className="text-xs text-brand-ink/60">{hint}</p>
      )}
    </fieldset>
  );
}
