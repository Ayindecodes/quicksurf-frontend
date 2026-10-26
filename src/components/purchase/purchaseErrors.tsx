import Link from "next/link";
import type { ReactNode } from "react";

import { ApiError, errorMessage } from "@/lib/api";
import { dateTime } from "@/lib/format";

/** What to tell the user when a purchase is refused. */
export function purchaseErrorMessage(error: unknown): ReactNode {
  if (!(error instanceof ApiError)) return errorMessage(error);
  switch (error.code) {
    case "pin_invalid": {
      const left = Number(error.extra.attempts_left);
      return Number.isFinite(left)
        ? `Wrong PIN. ${left} ${left === 1 ? "try" : "tries"} left before purchases are paused for 30 minutes.`
        : "Wrong PIN.";
    }
    case "pin_locked":
      return typeof error.extra.locked_until === "string"
        ? `Too many wrong PINs. You can try again after ${dateTime(error.extra.locked_until)}.`
        : error.message;
    case "pin_not_set":
      return (
        <>
          You need a transaction PIN to buy.{" "}
          <Link href="/dashboard/account#pin" className="font-semibold underline">
            Set your PIN
          </Link>
        </>
      );
    case "daily_limit":
      return error.extra.level === "basic" ? (
        <>
          {error.message}{" "}
          <Link href="/dashboard/account#phone" className="font-semibold underline">
            Verify your phone number
          </Link>{" "}
          to raise your daily limit.
        </>
      ) : (
        error.message
      );
    case "insufficient_funds":
      return (
        <>
          Your balance is too low for this purchase.{" "}
          <Link href="/dashboard/topup" className="font-semibold underline">
            Top up your wallet
          </Link>
        </>
      );
    default: {
      const firstField = Object.values(error.fields)[0]?.[0];
      return firstField ?? error.message;
    }
  }
}

/** A new idempotency key for a purchase. Retrying with the same key never charges twice. */
export function newClientReference(): string {
  return `web-${crypto.randomUUID()}`;
}
