// src/lib/types.ts
// Shapes returned by the QuickSurf API (see docs/API.md in the backend repo). Money is a string like "1500.00".

export type Money = string;

export type TokenPair = { access: string; refresh: string };

export type VerificationLevel = "basic" | "verified";

/** Today's limits for the account (0 means no limit). Usage counts Lagos days. */
export type Limits = {
  level: VerificationLevel;
  daily_purchase_limit: Money;
  daily_topup_limit: Money;
  spent_today: Money;
  topped_up_today: Money;
};

export type Profile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string; // only set by confirming a texted code
  email_verified: boolean;
  phone_verified: boolean;
  has_pin: boolean;
  limits: Limits;
  date_joined: string;
};

export type PinStatus = { has_pin: boolean; locked_until: string | null };

export type Wallet = { balance: Money; locked: Money };

export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export const NETWORKS = ["mtn", "glo", "airtel", "9mobile"] as const;
export type Network = (typeof NETWORKS)[number];

export type HistoryKind = "topup" | "purchase" | "refund" | "reward" | "adjustment" | "opening";

export type PurchaseStatus = "initiated" | "pending" | "successful" | "failed" | "reversed";

export type HistoryLine = {
  id: number;
  date: string;
  kind: HistoryKind;
  description: string;
  amount: Money; // signed
  balance_after: Money | null;
  reference: string;
  status?: PurchaseStatus;
  network?: Network;
  phone?: string;
  plan?: string | null;
};

export type Purchase = {
  id: number;
  network: Network;
  phone: string;
  amount: Money;
  status: PurchaseStatus;
  client_reference: string;
  provider_status: string;
  timestamp: string;
  updated: string;
  plan?: string;
  plan_name?: string;
};

export type Receipt = {
  reference: string;
  date: string;
  item: string;
  network: Network;
  phone: string;
  amount: Money;
  status: PurchaseStatus;
  vtpass_request_id: string | null;
  vtpass_transaction_id: string | null;
};

export type Plan = { code: string; name: string; price: Money };

export type Beneficiary = { id: number; name: string; phone: string; network: Network; created_at: string };

export type Rewards = {
  points: number;
  naira_value: Money;
  point_value: Money;
  min_redemption: number;
  recent: { date: string; points: number; reason: string }[];
};

export type TopupStatus = "initialized" | "pending" | "success" | "failed" | "abandoned" | "review";

export type TopupInit = { reference: string; authorization_url: string; status: TopupStatus };

export type TopupVerify = { reference: string; status: TopupStatus; credited?: boolean };
