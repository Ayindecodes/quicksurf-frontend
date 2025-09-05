// src/lib/auth.ts

// --- Config ----------------------------------------------------
/**
 * Set NEXT_PUBLIC_API_BASE to your API root, e.g.:
 *   https://quicksurf.onrender.com/api
 * Defaults to http://localhost:8000/api in dev.
 */
export const API_ROOT: string = (
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:8000/api"
) as string;

const isBrowser = typeof window !== "undefined";

// --- Minimal storage shim (safe on server) ---------------------
type StorageLike = {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
};

const mem = new Map<string, string>();
const memoryStore: StorageLike = {
  getItem: (k) => (mem.has(k) ? (mem.get(k) as string) : null),
  setItem: (k, v) => void mem.set(k, v),
  removeItem: (k) => void mem.delete(k),
};

function preferredStore(): StorageLike {
  if (!isBrowser) return memoryStore;
  try {
    const pref = localStorage.getItem("qs_pref_storage") || "local";
    return pref === "session" ? sessionStorage : localStorage;
  } catch {
    return memoryStore;
  }
}

// --- Tokens ----------------------------------------------------
export function getAccessToken(): string | null {
  try {
    if (!isBrowser) return memoryStore.getItem("qs_access");
    return (
      preferredStore().getItem("qs_access") ||
      localStorage.getItem("qs_access") ||
      sessionStorage.getItem("qs_access")
    );
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    if (!isBrowser) return memoryStore.getItem("qs_refresh");
    return (
      preferredStore().getItem("qs_refresh") ||
      localStorage.getItem("qs_refresh") ||
      sessionStorage.getItem("qs_refresh")
    );
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string, remember = true) {
  try {
    const store = isBrowser ? (remember ? localStorage : sessionStorage) : memoryStore;
    store.setItem("qs_access", access);
    store.setItem("qs_refresh", refresh);
    if (isBrowser) localStorage.setItem("qs_pref_storage", remember ? "local" : "session");
  } catch {
    // ignore
  }
}

export function clearTokens() {
  try {
    if (isBrowser) {
      localStorage.removeItem("qs_access");
      localStorage.removeItem("qs_refresh");
      sessionStorage.removeItem("qs_access");
      sessionStorage.removeItem("qs_refresh");
    } else {
      memoryStore.removeItem("qs_access");
      memoryStore.removeItem("qs_refresh");
    }
  } catch {
    // ignore
  }
}

// --- URL helpers -----------------------------------------------
function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}
function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
/** Prefix relative paths with API_ROOT; leave absolute URLs intact. */
function toUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string") {
    return isAbsoluteUrl(input) ? input : joinUrl(API_ROOT, input);
  }
  return input;
}

// --- Refresh flow ----------------------------------------------
async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    // Important: endpoint path should be relative to API_ROOT
    const res = await fetch(joinUrl(API_ROOT, "/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      // Do NOT send cookies/credentials; we use pure token flow
      credentials: "omit",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const j = (await res.json()) as { access?: string };
    if (j?.access) {
      const remember =
        (isBrowser ? localStorage.getItem("qs_pref_storage") : "local") === "local";
      setTokens(j.access, refresh, remember);
      return j.access;
    }
    return null;
  } catch {
    return null;
  }
}

// --- Fetch wrappers --------------------------------------------
function shouldSetJsonContentType(init?: RequestInit) {
  const hasBody = !!init?.body;
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  return hasBody && !isFormData;
}

/**
 * authFetch: attaches Bearer token if present and retries once after 401 via refresh.
 * Returns the raw Response (so you can handle streams, blobs, etc.).
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (shouldSetJsonContentType(init) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  let res = await fetch(toUrl(input), {
    ...init,
    headers,
    credentials: "omit",
    cache: init.cache ?? "no-store",
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(toUrl(input), {
        ...init,
        headers,
        credentials: "omit",
        cache: init.cache ?? "no-store",
      });
    }
  }
  return res;
}

/**
 * authFetchJSON: convenience wrapper that returns parsed JSON (or undefined for 204).
 * Throws on non-OK responses with the response text included for easier debugging.
 */
export async function authFetchJSON<T = any>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T | undefined> {
  const res = await authFetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
  if (res.status === 204) return undefined;
  return (await res.json()) as T;
}


