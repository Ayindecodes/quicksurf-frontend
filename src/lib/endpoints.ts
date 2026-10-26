// src/lib/endpoints.ts
// Every API call the app makes, typed. Paths are relative to /api/v1.

import { fetchResponse, request, toApiError } from "./api";
import type {
  Beneficiary,
  HistoryKind,
  HistoryLine,
  Money,
  Network,
  Page,
  PinStatus,
  Plan,
  Profile,
  Purchase,
  Receipt,
  Rewards,
  TokenPair,
  TopupInit,
  TopupVerify,
  Wallet,
} from "./types";

type Detail = { detail: string };

const query = (params: Record<string, string | number | undefined | null>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
};
const ref = (value: string) => encodeURIComponent(value);

// ---------- Accounts ----------
export const auth = {
  register: (email: string, password: string) =>
    request<TokenPair & { email_verification_sent: boolean }>("/users/register/", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  login: (email: string, password: string) =>
    request<TokenPair>("/users/login/", { method: "POST", body: { email, password }, auth: false }),
  logout: (refresh: string, everywhere = false) =>
    request<Detail>("/users/logout/", { method: "POST", body: everywhere ? { everywhere } : { refresh } }),
  requestPasswordReset: (email: string) =>
    request<Detail>("/users/password-reset/request/", { method: "POST", body: { email }, auth: false }),
  confirmPasswordReset: (email: string, code: string, new_password: string) =>
    request<Detail>("/users/password-reset/confirm/", {
      method: "POST",
      body: { email, code, new_password },
      auth: false,
    }),
  sendEmailCode: () => request<Detail>("/users/verify-email/request/", { method: "POST" }),
  confirmEmail: (code: string) =>
    request<Detail & { email_verified: boolean }>("/users/verify-email/confirm/", { method: "POST", body: { code } }),
};

export const account = {
  me: () => request<Profile>("/users/me/"),
  update: (changes: Partial<Pick<Profile, "first_name" | "last_name">>) =>
    request<Profile>("/users/me/", { method: "PATCH", body: changes }),
  /** Text a 6-digit code to the number. */
  sendPhoneCode: (phone: string) =>
    request<Detail & { phone: string }>("/users/phone/request/", { method: "POST", body: { phone } }),
  confirmPhone: (code: string) => request<Profile>("/users/phone/confirm/", { method: "POST", body: { code } }),
  changePassword: (current_password: string, new_password: string) =>
    request<TokenPair & Detail>("/users/me/password/", { method: "POST", body: { current_password, new_password } }),
  close: (password: string) => request<void>("/users/me/", { method: "DELETE", body: { password } }),
  pin: () => request<PinStatus>("/users/pin/"),
  setPin: (pin: string, password: string) =>
    request<Detail & { has_pin: boolean }>("/users/pin/", { method: "POST", body: { pin, password } }),
};

// ---------- Wallet ----------
export type HistoryFilters = { kind?: HistoryKind | ""; date_from?: string; date_to?: string };

export const wallet = {
  balance: () => request<Wallet>("/wallet/"),
  history: (filters: HistoryFilters = {}, page = 1, page_size = 20) =>
    request<Page<HistoryLine>>(`/wallet/history/${query({ ...filters, page, page_size })}`),
  /** The CSV statement as a file (it needs the access token, so it can't be a plain link). */
  statement: async (date_from?: string, date_to?: string): Promise<Blob> => {
    const res = await fetchResponse(`/wallet/statement/${query({ date_from, date_to })}`);
    if (!res.ok) throw toApiError(res.status, await res.json().catch(() => null));
    return res.blob();
  },
};

export const topups = {
  start: (amount: Money) => request<TopupInit>("/payments/init/", { method: "POST", body: { amount } }),
  verify: (reference: string) => request<TopupVerify>(`/payments/verify/${ref(reference)}/`),
};

// ---------- Purchases ----------
export type AirtimeOrder = { network: Network; phone: string; amount: Money; pin: string; client_reference: string };
export type DataOrder = AirtimeOrder & { plan: string };

export const purchases = {
  plans: (network: Network) => request<{ network: Network; plans: Plan[] }>(`/services/plans/${network}/`),
  detectNetwork: (phone: string) =>
    request<{ phone: string; network: Network | null }>(`/services/detect-network/${query({ phone })}`),
  buyAirtime: (order: AirtimeOrder) => request<Purchase>("/services/airtime/", { method: "POST", body: order }),
  buyData: (order: DataOrder) => request<Purchase>("/services/data/", { method: "POST", body: order }),
  receipt: (reference: string) => request<Receipt>(`/services/receipts/${ref(reference)}/`),
  /** Ask VTpass for the latest status of a pending purchase (the server limits how often). */
  recheck: (reference: string) => request<Purchase>(`/services/status/${ref(reference)}/`),
};

export const savedNumbers = {
  list: () => request<Beneficiary[]>("/services/beneficiaries/"),
  add: (entry: { name: string; phone: string; network: Network }) =>
    request<Beneficiary>("/services/beneficiaries/", { method: "POST", body: entry }),
  remove: (id: number) => request<void>(`/services/beneficiaries/${id}/`, { method: "DELETE" }),
};

// ---------- Rewards ----------
export const rewards = {
  get: () => request<Rewards>("/rewards/"),
  redeem: (points: number) =>
    request<{ credited: Money; points: number; balance: Money }>("/rewards/redeem/", {
      method: "POST",
      body: { points },
    }),
};
