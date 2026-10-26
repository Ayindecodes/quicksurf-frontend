// src/lib/tokens.ts
// JWTs live in localStorage ("keep me signed in") or sessionStorage (this tab only).
// The refresh token rotates on every use, so whoever refreshes must store the new one.

const ACCESS = "qs_access";
const REFRESH = "qs_refresh";
const LEGACY = ["access", "refresh"]; // written by the old frontend

export const REFRESH_KEY = REFRESH;

export type Tokens = { access: string; refresh: string };

const inBrowser = () => typeof window !== "undefined";

export function readTokens(): Tokens | null {
  if (!inBrowser()) return null;
  for (const store of [localStorage, sessionStorage]) {
    const access = store.getItem(ACCESS);
    const refresh = store.getItem(REFRESH);
    if (access && refresh) return { access, refresh };
  }
  return null;
}

/** Store new tokens. `remember` picks localStorage; by default they stay where they already are. */
export function saveTokens(tokens: Tokens, remember?: boolean): void {
  if (!inBrowser()) return;
  const persistent = remember ?? sessionStorage.getItem(REFRESH) === null;
  const [target, other] = persistent ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
  for (const key of [ACCESS, REFRESH, ...LEGACY]) other.removeItem(key);
  for (const key of LEGACY) target.removeItem(key);
  // Overwrite rather than remove-then-set: other tabs treat a removed refresh token as "signed out".
  target.setItem(ACCESS, tokens.access);
  target.setItem(REFRESH, tokens.refresh);
}

export function clearTokens(): void {
  if (!inBrowser()) return;
  for (const store of [localStorage, sessionStorage]) {
    for (const key of [ACCESS, REFRESH, ...LEGACY]) store.removeItem(key);
  }
}
