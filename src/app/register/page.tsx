"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

type Checks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

const API_ROOT =
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
    "http://localhost:8000") as string;

function calcStrength(pw: string): { score: number; checks: Checks } {
  const checks: Checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  const score =
    (checks.length ? 1 : 0) +
    (checks.upper ? 1 : 0) +
    (checks.lower ? 1 : 0) +
    (checks.number ? 1 : 0) +
    (checks.symbol ? 1 : 0);
  return { score, checks };
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const { score, checks } = useMemo(() => calcStrength(pw), [pw]);
  const match = confirm.length > 0 && confirm === pw;
  const allGood = !!fullName.trim() && emailOk && score >= 4 && match;

  function saveTokens(access: string, refresh: string) {
    localStorage.setItem("qs_access", access);
    localStorage.setItem("qs_refresh", refresh);
  }

  function splitName(name: string) {
    const parts = name.trim().split(/\s+/);
    const first_name = parts.shift() || "";
    const last_name = parts.join(" ");
    return { first_name, last_name };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allGood || loading) return;
    setLoading(true);
    setErr(null);

    try {
      const { first_name, last_name } = splitName(fullName);

      // Be compatible with different backends:
      // send password + password1/password2; many serializers accept any subset.
      const body = {
        email: email.trim(),
        password: pw,
        password1: pw,
        password2: confirm,
        first_name,
        last_name,
      };

      const res = await fetch(`${API_ROOT}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const json = await safeJson(res);
      if (!res.ok) {
        // Surface server-side validation nicely
        const msg =
          json?.detail ||
          json?.error ||
          // flatten DRF errors (first key)
          (typeof json === "object" && json
            ? Object.entries(json)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
                .join("\n")
            : "Registration failed");
        throw new Error(msg);
      }

      // Expect { access, refresh } from your RegisterView
      if (!json?.access || !json?.refresh) {
        throw new Error("Unexpected response from server.");
      }

      saveTokens(json.access, json.refresh);
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  function Row({
    label,
    icon,
    children,
    error,
  }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    error?: string | null;
  }) {
    return (
      <div>
        <label className="block text-sm text-brand-ink/80 mb-1">{label}</label>
        <div
          className="
            grid grid-cols-[40px_1fr] items-center rounded-xl
            bg-white/80 border border-black/5
            focus-within:ring-[var(--ring)] focus-within:border-[var(--brand)]
            transition
          "
        >
          <div className="flex items-center justify-center text-brand-ink/40">
            {icon}
          </div>
          {children}
        </div>
        {error ? <p className="mt-1 text-xs text-red-600 whitespace-pre-line">{error}</p> : null}
      </div>
    );
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-brand-porcelain relative overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-harbor/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[26rem] w-[26rem] rounded-full bg-brand-accent/20 blur-3xl" />

      {/* Brand side (md+) */}
      <aside className="hidden md:flex relative items-center justify-center bg-gradient-to-br from-brand-harbor to-[#6c6ad6] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_60rem_at_20%_30%,rgba(255,255,255,.08),transparent)]" />
        <div className="relative z-10 max-w-md px-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs border border-white/20">
            <ShieldCheckIcon className="w-4 h-4" />
            Bank-level security
          </div>
          <h1 className="text-3xl font-semibold leading-tight">Join Quicksurf</h1>
          <p className="text-white/85">
            Instant airtime & data top-ups. Smart routing, transparent logs, and clean receipts.
          </p>
        </div>
      </aside>

      {/* Form side */}
      <section className="flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,.06),0_18px_46px_rgba(14,94,120,.18)] rounded-[22px] p-6 sm:p-8">
          <div className="text-center">
            <div className="text-sm text-brand-ink/60">Create your account</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-brand-ink mt-1">Register</h2>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* Full name */}
            <Row label="Full name" icon={<UserIcon className="w-5 h-5" />}>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full bg-transparent outline-none px-3 py-3 rounded-r-xl"
                placeholder="e.g. Ada Lovelace"
              />
            </Row>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-sm text-brand-ink/80 mb-1">Password</label>
              <div
                className="
                  grid grid-cols-[40px_1fr_40px] items-center rounded-xl
                  bg-white/80 border border-black/5
                  focus-within:ring-[var(--ring)] focus-within:border-[var(--brand)]
                  transition
                "
              >
                <div className="flex items-center justify-center text-brand-ink/40">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full bg-transparent outline-none px-3 py-3"
                  placeholder="Minimum 8 characters"
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

              {/* Strength meter */}
              <div className="mt-2 h-1.5 w-full rounded bg-black/10 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(score / 5) * 100}%`,
                    background:
                      score >= 4
                        ? "linear-gradient(90deg,#0E5E78,#6c6ad6)"
                        : score >= 3
                        ? "linear-gradient(90deg,#f59e0b,#0E5E78)"
                        : "linear-gradient(90deg,#ef4444,#f59e0b)",
                  }}
                />
              </div>

              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-brand-ink/70">
                <li className={checks.length ? "text-green-600" : ""}>8+ characters</li>
                <li className={checks.upper ? "text-green-600" : ""}>Uppercase</li>
                <li className={checks.lower ? "text-green-600" : ""}>Lowercase</li>
                <li className={checks.number ? "text-green-600" : ""}>Number</li>
                <li className={checks.symbol ? "text-green-600" : ""}>Symbol</li>
              </ul>
            </div>

            {/* Confirm */}
            <Row
              label="Confirm password"
              icon={<LockClosedIcon className="w-5 h-5" />}
              error={confirm.length > 0 && !match ? "Passwords do not match." : null}
            >
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                required
                autoComplete="new-password"
                className="w-full bg-transparent outline-none px-3 py-3 rounded-r-xl"
                placeholder="Re-enter your password"
              />
            </Row>

            {/* Error */}
            {err && (
              <div className="rounded-md bg-rose-50 border border-rose-200 p-2 text-sm text-rose-700 whitespace-pre-line">
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!allGood || loading}
              className="
                mt-2 w-full rounded-xl px-4 py-3 font-medium text-white
                transition-transform hover:scale-[1.01] active:scale-[.99]
                disabled:opacity-50 disabled:hover:scale-100
                bg-[linear-gradient(135deg,#0E5E78_0%,#6c6ad6_100%)]
                shadow-[0_12px_30px_rgba(14,94,120,.22)]
              "
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {/* Legal + links */}
            <p className="text-center text-xs text-brand-ink/60">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="underline">
                Privacy
              </Link>
              .
            </p>
            <p className="text-center text-sm text-brand-ink/80">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-harbor hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}








