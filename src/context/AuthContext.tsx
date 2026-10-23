"use client";
// src/context/AuthContext.tsx
// Who is signed in. The profile is loaded from /users/me/ whenever tokens are present.

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ApiError, SESSION_EXPIRED_EVENT } from "@/lib/api";
import { account, auth } from "@/lib/endpoints";
import { clearTokens, readTokens, REFRESH_KEY, saveTokens } from "@/lib/tokens";
import type { Profile } from "@/lib/types";

// "left": the user signed out or closed the account here, and is already being sent somewhere.
type Status = "loading" | "signed-in" | "signed-out" | "left";

type AuthContextValue = {
  status: Status;
  user: Profile | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: (options?: { everywhere?: boolean }) => Promise<void>;
  /** Forget the session locally (the server already ended it, e.g. the account was closed). */
  forget: () => void;
  /** Reload the profile (after verifying the email, setting a PIN, editing details...). */
  reload: () => Promise<void>;
  setUser: (user: Profile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUserState] = useState<Profile | null>(null);

  const setUser = useCallback((profile: Profile) => {
    setUserState(profile);
    setStatus("signed-in");
  }, []);

  const signedOut = useCallback((left = false) => {
    setUserState(null);
    setStatus(left ? "left" : "signed-out");
  }, []);

  const reload = useCallback(async () => {
    if (!readTokens()) return signedOut();
    try {
      setUser(await account.me());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) signedOut();
      else throw error;
    }
  }, [setUser, signedOut]);

  // Tokens live in browser storage, so the session is only known after mounting. The load is queued
  // as a microtask rather than run inside the effect, so the first render isn't immediately redone.
  useEffect(() => {
    Promise.resolve()
      .then(reload)
      .catch(() => {
        // Network trouble on load: keep the tokens and let each page show its own error.
        if (readTokens()) setStatus("signed-in");
      });
  }, [reload]);

  // Signed out in another tab, or the session ran out: go to sign-in.
  useEffect(() => {
    const expired = () => {
      signedOut(true);
      if (pathname.startsWith("/dashboard")) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    };
    const onStorage = (event: StorageEvent) => {
      if ((event.key === REFRESH_KEY || event.key === null) && !readTokens()) expired();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname, router, signedOut]);

  const signIn = useCallback(
    async (email: string, password: string, remember: boolean) => {
      saveTokens(await auth.login(email, password), remember);
      await reload();
    },
    [reload],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { access, refresh } = await auth.register(email, password);
      saveTokens({ access, refresh }, true);
      await reload();
    },
    [reload],
  );

  const signOut = useCallback(
    async ({ everywhere = false } = {}) => {
      const tokens = readTokens();
      try {
        if (tokens) await auth.logout(tokens.refresh, everywhere);
      } catch {
        // Signing out locally still works if the server can't be reached.
      }
      clearTokens();
      signedOut(true);
      router.replace("/login");
    },
    [router, signedOut],
  );

  const forget = useCallback(() => {
    clearTokens();
    signedOut(true);
  }, [signedOut]);

  const value = useMemo(
    () => ({ status, user, signIn, register, signOut, forget, reload, setUser }),
    [status, user, signIn, register, signOut, forget, reload, setUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
