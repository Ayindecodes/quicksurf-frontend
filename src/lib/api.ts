// src/lib/api.ts
// Safe, minimal types; default export provided; no reserved-word keys.

// ===== Config =====
export const API_ROOT =
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
    "http://localhost:8000") as string;

const ACCESS_KEY = "qs_access";
const REFRESH_KEY = "qs_refresh";

// Prefer the store that currently holds the refresh token
function refreshStoredInLocal(): boolean {
  try {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem(REFRESH_KEY);
  } catch {
    return true;
  }
}

function readTokens() {
  if (typeof window === "undefined")
    return { access: null as string | null, refresh: null as string | null };
  const access =
    localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
  const refresh =
    localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
  return { access, refresh };
}

export function saveTokens(access: string, refresh?: string, remember = true) {
  if (typeof window === "undefined") return;
  const store = remember ? localStorage : sessionStorage;
  store.setItem(ACCESS_KEY, access);
  if (refresh) store.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {}
}

// Refresh access token once on 401
async function refreshAccess(): Promise<string> {
  const { refresh } = readTokens();
  if (!refresh) throw new Error("No refresh token");
  const res = await fetch(`${API_ROOT}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  const access = data?.access as string | undefined;
  if (!access) throw new Error("No access in refresh response");

  const remember = refreshStoredInLocal();
  saveTokens(access, undefined, remember);
  return access;
}

// Prefix relative paths with API_ROOT
type FetchInput = string | URL;
function toUrl(input: FetchInput): FetchInput {
  if (typeof input === "string" && input.startsWith("/")) {
    return `${API_ROOT}${input}`;
  }
  return input;
}

/**
 * Fetch with Authorization header and single 401 retry via refresh.
 * Client-side only usage recommended.
 */
export async function authFetch(
  input: FetchInput,
  init: RequestInit = {}
): Promise<Response> {
  const attempt = async (overrideAccess?: string) => {
    const { access } = readTokens();
    const token = overrideAccess ?? access ?? undefined;
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    // do NOT send cookies
    return fetch(toUrl(input) as RequestInfo, { ...init, headers });
  };

  let res = await attempt();
  if (res.status !== 401) return res;

  try {
    const newAccess = await refreshAccess();
    res = await attempt(newAccess);
    return res;
  } catch {
    clearTokens();
    return res; // still 401; caller can redirect to /login
  }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { access } = readTokens();
  const h = new Headers();
  if (access) h.set("Authorization", `Bearer ${access}`);
  return h;
}

// JSON helpers (non-breaking, optional to use)
async function jsonFetch<T = unknown>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  const res = await authFetch(url, { ...init, headers });
  if (!res.ok) {
    let errBody: any = null;
    try {
      errBody = await res.json();
    } catch {}
    const e = new Error(
      `HTTP ${res.status} ${res.statusText}${
        errBody ? ` – ${JSON.stringify(errBody)}` : ""
      }`
    );
    // @ts-ignore attach extra context
    (e as any).status = res.status;
    // @ts-ignore attach body
    (e as any).body = errBody;
    throw e;
  }
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}

function get<T = unknown>(url: string, init?: RequestInit) {
  return jsonFetch<T>(url, { ...init, method: "GET" });
}
function post<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
  return jsonFetch<T>(url, {
    ...init,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
function put<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
  return jsonFetch<T>(url, {
    ...init,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
function del<T = unknown>(url: string, init?: RequestInit) {
  return jsonFetch<T>(url, { ...init, method: "DELETE" });
}

// Default export: safe name "del" (not reserved) on the object
const api = {
  API_ROOT,
  authFetch,
  getAuthHeaders,
  saveTokens,
  clearTokens,
  get,
  post,
  put,
  del,
};

export default api;
