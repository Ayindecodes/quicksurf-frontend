// src/content/business.ts
// Business details used by the legal and support pages. Values only the business can supply are marked
// with todo(); `npm run launch-check` fails while any are left, so a placeholder can't go live unnoticed.

const todo = (what: string) => `[${what}: to be added]`;

export const isPlaceholder = (value: string) => value.endsWith(": to be added]");

export const BUSINESS = {
  tradingName: "QuickSurf",
  legalName: todo("registered company name"),
  registration: todo("CAC RC or BN number"),
  address: todo("registered office address"),
  supportEmail: todo("support email address"),
  whatsapp: todo("support WhatsApp number, e.g. +234 800 000 0000"),
  supportHours: todo("support hours, e.g. Monday to Saturday, 8am to 8pm"),
  firstResponse: todo("first reply time, e.g. within 4 working hours"),
  disputeResolution: todo("time to resolve a complaint, e.g. within 7 working days"),
  walletRefund: todo(
    "how unused wallet money is paid back, e.g. to your bank account within 7 working days of asking support",
  ),
  privacyEmail: todo("data protection contact email"),
  recordsKeptFor: todo("how long financial records are kept by law, e.g. at least 6 years"),
  policiesUpdated: "24 October 2026",
  // The Terms, Privacy Policy and Refund Policy are drafts written to match how QuickSurf works. Set this
  // to true once a lawyer has reviewed them; launch-check requires it.
  legalReviewed: false,
} as const;
