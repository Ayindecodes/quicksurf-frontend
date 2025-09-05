"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

/** Base URL for your Django backend */
const API_ROOT =
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
    "http://localhost:8000") as string;

type Json = Record<string, any> | null;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  // form state
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [use2FA, setUse2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const otpOk = !use2FA || /^\d{6}$/.test(otp);
  const allGood = emailOk && pw.length >= 1 && otpOk;

  function saveTokens(access: string, refresh: string) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("qs_access", access);
    store.setItem("qs_refresh", refresh);
    // record where we saved them (helps other code choose the same store)
    localStorage.setItem("qs_pref_storage", remember ? "local" : "session");
  }

  function setLoginCookie() {
    try {
      const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; secure" : "";
      // 4 hours (14400s) to match your preferred access token window
      document.cookie = `qs_logged_in=1; path=/; max-age=14400; samesite=lax${secure}`;
    } catch {}
  }

  async function safeJson(res: Response): Promise<Json> {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  async function loginViaCustom(): Promise<Json | null> {
    // Your custom users/login endpoint (returns {access, refresh})
    const res = await fetch(`${API_ROOT}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim(),
        password: pw,
        // otp, // uncomment if your backend supports it
      }),
    });

    if (res.ok) return res.json();

    // If it exists but failed, surface the message
    if (res.status !== 404 && res.status !== 405) {
      const j = await safeJson(res);
      throw new Error(j?.detail || j?.error || "Invalid credentials");
    }

    // If endpoint doesn't exist, fall through to SimpleJWT
    return null;
  }

  async function loginViaSimpleJWT(): Promise<Json> {
    // Django SimpleJWT default: POST /api/token/ with {username, password}
    // (even if USERNAME_FIELD is email)
    const res = await fetch(`${API_ROOT}/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: email.trim(),
        password: pw,
      }),
    });

    const j = await safeJson(res);
    if (!res.ok) {
      throw new Error(j?.detail || j?.error || "Invalid credentials");
    }
    return j;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allGood || loading) return;

    setLoading(true);
    setErr(null);

    try {
      const tokens = (await loginViaCustom()) || (await loginViaSimpleJWT());

      if (!tokens?.access || !tokens?.refresh) {
        throw new Error("Token response malformed");
      }

      saveTokens(tokens.access, tokens.refresh);
      setLoginCookie();

      const next = params.get("next");
      const dest = next && next.startsWith("/") ? next : "/dashboard";
      router.replace(dest);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Reusable row
  function Row({
    label,
    icon,
    right,
    children,
    error,
  }: {
    label: string;
    icon: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    error?: string | null;
  }) {
    return (
      <div>
        <label className="block text-sm text-brand-ink/80 mb-1">{label}</label>
        <div className="grid grid-cols-[40px_1fr] items-center rounded-xl bg-white/80 border border-black/5 focus-within:ring-[var(--ring)] focus-within:border-[var(--brand)] transition">
          <div className="flex items-center justify-center text-brand-ink/40">
            {icon}
          </div>
          <div className="flex items-center">
            {children}
            {right ? <div className="ml-2">{right}</div> : null}
          </div>
        </div>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-brand-porcelain relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-harbor/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[26rem] w-[26rem] rounded-full bg-brand-accent/20 blur-3xl" />

      {/* Brand side */}
      <aside className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-brand-harbor to-[#6c6ad6] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_60rem_at_20%_30%,rgba(255,255,255,.08),transparent)]" />
        <div className="relative z-10 max-w-md px-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs border border-white/20">
            <ShieldCheckIcon className="w-4 h-4" />
            Bank-level security
          </div>
          <h1 className="text-3xl font-semibold leading-tight">Welcome back</h1>
          <p className="text-white/85">
            Sign in to manage wallet, buy airtime/data instantly, and view
            transparent provider logs.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <section className="flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,.06),0_18px_46px_rgba(14,94,120,.18)] rounded-[22px] p-6 sm:p-8">
          <div className="text-center">
            <div className="text-sm text-brand-ink/60">Sign in to your account</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-brand-ink mt-1">
              Login
            </h2>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Row
              label="Email"
              icon={<EnvelopeIcon className="w-5 h-5" />}
              error={email.length > 0 && !emailOk ? "Enter a valid email address." : null}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent outline-none px-3 py-3 rounded-r-xl"
                placeholder="you@domain.com"
              />
            </Row>

            <div>
              <label className="block text-sm text-brand-ink/80 mb-1">
                Password
              </label>
              <div className="grid grid-cols-[40px_1fr_40px] items-center rounded-xl bg-white/80 border border-black/5 focus-within:ring-[var(--ring)] focus-within:border-[var(--brand)] transition">
                <div className="flex items-center justify-center text-brand-ink/40">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-transparent outline-none px-3 py-3"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="flex items-center justify-center text-brand-ink/50 hover:text-brand-ink transition"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Optional 2FA UI (no-op unless backend supports it) */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={use2FA}
                  onChange={(e) => setUse2FA(e.target.checked)}
                  className="accent-[--brand]"
                />
                Use 2FA code
              </label>
              <Link href="/forgot-password" className="text-brand-harbor hover:underline">
                Forgot password?
              </Link>
            </div>

            {use2FA && (
              <Row
                label="2FA code"
                icon={<KeyIcon className="w-5 h-5" />}
                error={otp.length > 0 && !otpOk ? "Enter the 6-digit code." : null}
              >
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full bg-transparent outline-none px-3 py-3 rounded-r-xl tracking-widest"
                  placeholder="••••••"
                />
              </Row>
            )}

            {/* Remember me */}
            <label className="inline-flex items-center gap-2 text-sm text-brand-ink/80">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-[--brand]"
              />
              Remember me on this device
            </label>

            {/* Error */}
            {err && (
              <div className="rounded-md bg-rose-50 border border-rose-200 p-2 text-sm text-rose-700">
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!allGood || loading}
              className="mt-2 w-full rounded-xl px-4 py-3 font-medium text-white transition-transform hover:scale-[1.01] active:scale-[.99] disabled:opacity-50 disabled:hover:scale-100 bg-[linear-gradient(135deg,#0E5E78_0%,#6c6ad6_100%)] shadow-[0_12px_30px_rgba(14,94,120,.22)]"
            >
              {loading ? "Signing in…" : "Login"}
            </button>

            <p className="text-center text-sm text-brand-ink/80">
              Don’t have an account?{" "}
              <Link href="/register" className="text-brand-harbor hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}


