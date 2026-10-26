// src/lib/api.ts
// One client for the QuickSurf API (/api/v1). Errors are thrown as ApiError, built from the
// backend's error envelope: {"error": {"code", "message", "fields"?, ...extra}, "request_id"}.

import { API_ROOT } from "./config";
import { clearTokens, readTokens, saveTokens } from "./tokens";

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: FieldErrors;
  readonly extra: Record<string, unknown>;
  readonly requestId: string | null;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    fields?: FieldErrors;
    extra?: Record<string, unknown>;
    requestId?: string | null;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.fields = init.fields ?? {};
    this.extra = init.extra ?? {};
    this.requestId = init.requestId ?? null;
  }

  /** The first message the server gave for a form field. */
  field(name: string): string | undefined {
    return this.fields[name]?.[0];
  }
}

export const SESSION_EXPIRED_EVENT = "qs:session-expired";
const NETWORK_MESSAGE = "We couldn't reach QuickSurf. Check your connection and try again.";

type Envelope = {
  error: { code?: string; message?: string; fields?: Record<string, unknown>; [key: string]: unknown };
  request_id?: string;
};

function isEnvelope(body: unknown): body is Envelope {
  if (typeof body !== "object" || body === null) return false;
  const error = (body as { error?: unknown }).error;
  return typeof error === "object" && error !== null;
}

function messages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(messages);
  if (value && typeof value === "object") return Object.values(value).flatMap(messages);
  return value == null ? [] : [String(value)];
}

function fallbackMessage(status: number): string {
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "That didn't work. Please try again.";
}

export function toApiError(status: number, body: unknown): ApiError {
  if (!isEnvelope(body)) {
    return new ApiError({ status, code: status >= 500 ? "server_error" : "error", message: fallbackMessage(status) });
  }
  const { code, message, fields, ...extra } = body.error;
  const normalized: FieldErrors = {};
  for (const [name, value] of Object.entries(fields ?? {})) normalized[name] = messages(value);
  return new ApiError({
    status,
    code: code ?? "error",
    message: message || fallbackMessage(status),
    fields: normalized,
    extra,
    requestId: body.request_id ?? null,
  });
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";
export type RequestOptions = {
  method?: Method;
  body?: unknown;
  /** Send the access token (default). Sign-in, sign-up and password reset don't. */
  auth?: boolean;
  signal?: AbortSignal;
};

async function send(path: string, options: RequestOptions, access?: string): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (access) headers.Authorization = `Bearer ${access}`;
  try {
    return await fetch(`${API_ROOT}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "omit",
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError({ status: 0, code: "network_error", message: NETWORK_MESSAGE });
  }
}

// ---------- Token refresh ----------
// Refresh tokens rotate and a used one is rejected, so only one refresh may run at a time: one per
// tab (the shared promise) and one per browser (a Web Lock), or two tabs would sign each other out.
let refreshing: Promise<string | null> | null = null;

async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("qs-token-refresh", fn);
  }
  return fn();
}

async function rotate(staleRefresh: string): Promise<string | null> {
  const current = readTokens();
  if (!current) return null;
  if (current.refresh !== staleRefresh) return current.access; // another tab already refreshed
  const res = await send("/token/refresh/", { method: "POST", body: { refresh: current.refresh } });
  if (res.status === 400 || res.status === 401) return null; // the session is over
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, body);
  const tokens = body as { access: string; refresh?: string };
  saveTokens({ access: tokens.access, refresh: tokens.refresh ?? current.refresh });
  return tokens.access;
}

/** A fresh access token, or null if the user has to sign in again. */
export function refreshAccess(staleRefresh: string): Promise<string | null> {
  refreshing ??= withRefreshLock(() => rotate(staleRefresh)).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

function sessionExpired(): ApiError {
  clearTokens();
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  return new ApiError({ status: 401, code: "not_authenticated", message: "Please sign in again." });
}

/** The raw response, after one refresh-and-retry on 401. For JSON, use `request`. */
export async function fetchResponse(path: string, options: RequestOptions = {}): Promise<Response> {
  if (options.auth === false) return send(path, options);
  const tokens = readTokens();
  if (!tokens) throw sessionExpired();
  const res = await send(path, options, tokens.access);
  if (res.status !== 401) return res;
  const access = await refreshAccess(tokens.refresh);
  if (!access) throw sessionExpired();
  return send(path, options, access);
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetchResponse(path, options);
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, body);
  return body as T;
}

/** A message to show for any error thrown by the API client (or anything else). */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
