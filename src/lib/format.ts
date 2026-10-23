// src/lib/format.ts
import type { Network } from "./types";

const nairaFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
});

/** "₦1,500.00". Money comes from the API as a string; it is only formatted, never calculated with. */
export function naira(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? nairaFormat.format(amount) : "—";
}

/** "+₦1,500.00" / "−₦300.00" for signed ledger amounts. */
export function signedNaira(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount < 0 ? "−" : "+"}${nairaFormat.format(Math.abs(amount))}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});
const dateFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" });

export const dateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
export const date = (iso: string) => dateFormat.format(new Date(iso));

/** Today's date in Lagos as YYYY-MM-DD (for date inputs and API filters). */
export function lagosToday(offsetDays = 0): string {
  const day = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(day);
}

/** A Nigerian number in local form ("08031234567"), or "" if it isn't one. Mirrors the backend. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  if (digits.startsWith("234")) {
    if (digits.length === 13) return `0${digits.slice(3)}`;
    if (digits.length === 14 && digits.startsWith("2340")) return digits.slice(3);
    return "";
  }
  return digits.length === 11 && digits.startsWith("0") ? digits : "";
}

export const NETWORK_NAMES: Record<Network, string> = {
  mtn: "MTN",
  glo: "Glo",
  airtel: "Airtel",
  "9mobile": "9mobile",
};

/** A safe in-app path to return to after sign-in (never another site). */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
