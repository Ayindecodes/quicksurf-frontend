"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  SignalIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";

/* =========================================================
   0) MINIMAL HEADER (no crowded nav — conversion focus)
   (added hover + ripple, no layout changes)
========================================================= */
function HeaderMinimal() {
  function pointerMove(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-black/5">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-brand-ink text-base tracking-tight hover:opacity-90 transition">
          Quicksurf
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="text-xs sm:text-sm text-brand-ink/80 hover:text-brand-ink transition">
            Log in
          </Link>
          <Link
            href="/register"
            onMouseMove={pointerMove}
            className="btn-primary text-xs sm:text-sm relative overflow-hidden hover:scale-[1.01] active:scale-[.99] transition-transform"
          >
            <span>Create account</span>
            <span
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition"
              style={{
                background:
                  "radial-gradient(160px 160px at var(--x,50%) var(--y,50%), rgba(255,255,255,.25), transparent 60%)",
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   1) POPULAR BUNDLES + QUICK FORM (with localStorage phone)
   (added hover, ripple; no layout changes)
========================================================= */
function QuickAirtimeForm() {
  const networks = [
    { label: "MTN", value: "mtn" },
    { label: "Airtel", value: "airtel" },
    { label: "Glo", value: "glo" },
    { label: "9mobile", value: "9mobile" },
  ];

  const popular = [
    { label: "₦500 MTN", amount: 500, network: "mtn" },
    { label: "₦1000 Glo", amount: 1000, network: "glo" },
    { label: "1.5GB Airtel", amount: 1000, network: "airtel" },
    { label: "2GB 9mobile", amount: 1200, network: "9mobile" },
  ];

  const [network, setNetwork] = useState(networks[0].value);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem("qs_last_phone");
    if (last) setPhone(last);
  }, []);
  useEffect(() => {
    if (phone) localStorage.setItem("qs_last_phone", phone);
  }, [phone]);

  function pickBundle(b: { amount: number; network: string }) {
    setAmount(String(b.amount));
    setNetwork(b.network);
  }

  function onBtnMove(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^0\d{10}$/.test(phone)) return toast.error("Enter valid 11-digit NG number (starts with 0).");
    const amt = Number(amount);
    if (!amt || amt < 100) return toast.error("Minimum amount is ₦100.");
    setLoading(true);
    try {
      const client_reference = `LP_${Date.now()}`;
      console.log("Submit:", { network, phone, amount: amt, client_reference, channel: "landing" });
      toast.error("Live purchase disabled on landing page. Create an account to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-4 md:p-5 space-y-4 rounded-2xl reveal">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-brand-ink/70">Network</label>
            <select
              className="input hover:shadow-sm transition-shadow"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              aria-label="Select network"
            >
              {networks.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-brand-ink/70">Amount (₦)</label>
            <input
              className="input hover:shadow-sm transition-shadow"
              placeholder="e.g. 500"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              aria-label="Amount in Naira"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-brand-ink/70">Phone number</label>
          <input
            className="input hover:shadow-sm transition-shadow"
            placeholder="0803 123 4567"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
            aria-label="Phone number"
          />
        </div>

        <button
          onMouseMove={onBtnMove}
          disabled={loading}
          className="btn-primary w-full hover:scale-[1.01] active:scale-[.99] transition-transform relative overflow-hidden"
        >
          {loading ? "Processing..." : <>Buy Now <ArrowRightIcon className="w-4 h-4 ml-2" /></>}
          <span
            className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition"
            style={{
              background:
                "radial-gradient(160px 160px at var(--x,50%) var(--y,50%), rgba(255,255,255,.2), transparent 60%)",
            }}
          />
        </button>
      </form>

      <div className="pt-1">
        <p className="text-xs text-brand-ink/60 mb-2">Popular quick picks</p>
        <div className="flex flex-wrap gap-2">
          {popular.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => pickBundle(p)}
              className="rounded-xl border border-black/5 bg-white px-3 py-2 text-xs hover:bg-brand-porcelain hover:-translate-y-0.5 transition-transform"
              aria-label={`Pick ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   2) “WHY QUICKSURF IS DIFFERENT” — MIND-BLOWING FEATURES
   (added hover/tilt; same content)
========================================================= */
function Differentiators() {
  const items = [
    {
      icon: CpuChipIcon,
      title: "Smart Network Optimizer",
      body:
        "We auto-pick the best route (success rate + cost) for your top-up in real time. No manual guesswork.",
      badge: "Live Routing",
    },
    {
      icon: ClockIcon,
      title: "Auto-Topup Rules",
      body:
        "Create rules like ‘Top up ₦500 MTN if balance < ₦200’ or schedule monthly data for your SIMs.",
      badge: "Set-and-Forget",
    },
    {
      icon: SignalIcon,
      title: "Status Timeline",
      body:
        "Crystal-clear delivery trail—queued → sent → provider confirmed → delivered. See where a delay is.",
      badge: "Full Transparency",
    },
    {
      icon: DocumentArrowDownIcon,
      title: "Shareable Receipts",
      body:
        "One-tap receipts you can share via link or download. Perfect for teams, accounting, and support.",
      badge: "Teams Ready",
    },
    {
      icon: ChartBarIcon,
      title: "Spending Insights",
      body:
        "Track spend by network, number, and time. Identify waste and set budgets per line.",
      badge: "Control",
    },
    {
      icon: BanknotesIcon,
      title: "Multi-Channel Funding",
      body:
        "Cards, bank transfer, and (soon) USSD. Instant wallet reflection with bank-level security.",
      badge: "Secure",
    },
  ];

  return (
    <section className="py-12 md:py-16" id="features">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-6 reveal">
          <h2 className="text-2xl md:text-3xl font-semibold">Why Quicksurf is different</h2>
          <p className="text-brand-ink/70 mt-2">
            Not just “buy airtime”. It’s routing, rules, receipts, and real insight—built like a fintech ops console.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {items.map((f) => (
            <div
              key={f.title}
              className="glass p-5 sm:p-6 rounded-2xl hover:shadow-[0_10px_30px_rgba(14,94,120,.12)] transition transform-gpu hover:-translate-y-0.5 hover:rotate-[0.2deg] reveal"
            >
              <div className="flex items-center gap-2 mb-3">
                <f.icon className="w-5 h-5 text-brand-harbor" />
                <span className="text-[11px] px-2 py-1 rounded-full bg-brand-harbor/10 text-brand-ink">
                  {f.badge}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-brand-ink/70">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   3) SAVINGS CALCULATOR (interactive — proves value)
   (unchanged logic; added reveal)
========================================================= */
function SavingsCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(10000);
  const [optimizePct, setOptimizePct] = useState(4);

  const yearly = monthlySpend * 12;
  const savingsYear = Math.round((yearly * optimizePct) / 100);

  return (
    <section className="py-12 md:py-16" id="pricing">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="glass p-6 md:p-8 rounded-2xl reveal">
          <h3 className="text-xl md:text-2xl font-semibold">See how much you could save</h3>
          <p className="text-sm text-brand-ink/70 mt-1">
            Our network optimizer + clean fees often save users 2–6% of their monthly top-up budget.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-xs text-brand-ink/70">Monthly spend (₦)</label>
              <input
                type="range"
                min={1000}
                max={200000}
                step={500}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-lg font-semibold">₦{monthlySpend.toLocaleString()}</div>
            </div>

            <div>
              <label className="text-xs text-brand-ink/70">Optimization impact (%)</label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={optimizePct}
                onChange={(e) => setOptimizePct(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-2 text-lg font-semibold">{optimizePct}%</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-2xl">
              <div className="text-xs text-brand-ink/60">Yearly spend</div>
              <div className="text-2xl font-semibold">₦{yearly.toLocaleString()}</div>
            </div>
            <div className="glass p-4 rounded-2xl">
              <div className="text-xs text-brand-ink/60">Estimated yearly savings</div>
              <div className="text-2xl font-semibold text-brand-harbor">₦{savingsYear.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary hover:scale-[1.01] active:scale-[.99] transition-transform">Create free account</Link>
            <Link href="/support" className="btn-ghost hover:shadow-sm transition-shadow">Talk to support</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   4) HERO — laser focused (one CTA, no noisy links)
   (added subtle parallax glow, reveal)
========================================================= */
function Hero() {
  function onMove(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }
  return (
    <section className="relative overflow-hidden" onMouseMove={onMove}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-80 md:h-96 w-80 md:w-96 rounded-full bg-brand-harbor/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[24rem] md:h-[28rem] w-[24rem] md:w-[28rem] rounded-full bg-brand-accent/10 blur-3xl" />
        {/* cursor-follow glow */}
        <div
          className="absolute size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{
            left: "var(--x,50%)",
            top: "var(--y,50%)",
            background:
              "radial-gradient(closest-side, rgba(14,94,120,.12), transparent 70%)",
            transition: "left .15s linear, top .15s linear",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <div className="space-y-5 md:space-y-6 flex flex-col justify-center reveal">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-[10px] sm:text-xs border border-black/5">
              Focused. Fast. Transparent.
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight">
              Buy data & airtime in <span className="text-brand-harbor">seconds</span> — with smart routing and receipts.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-brand-ink/75">
              Quicksurf removes friction: instant top-ups, rule-based auto-purchases, live status timeline,
              and shareable receipts. Built like a fintech ops console for everyday users.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link href="/register" className="btn-primary hover:scale-[1.01] active:scale-[.99] transition-transform relative overflow-hidden">
                <span>Create free account</span>
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition"
                  style={{
                    background:
                      "radial-gradient(160px 160px at var(--x,50%) var(--y,50%), rgba(255,255,255,.2), transparent 60%)",
                  }}
                />
              </Link>
            </div>

            <div className="glass p-3 flex flex-wrap items-center gap-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-brand-harbor" />
                <span className="text-sm text-brand-ink/80">Bank-level security</span>
              </div>
              <div className="h-4 w-px bg-black/10" />
              <div className="flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-brand-harbor" />
                <span className="text-sm text-brand-ink/80">Instant delivery</span>
              </div>
              <div className="h-4 w-px bg-black/10" />
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-brand-harbor" />
                <span className="text-sm text-brand-ink/80">Transparent logs</span>
              </div>
            </div>
          </div>

          <div className="relative reveal">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-white to-white/60 shadow-[0_10px_30px_rgba(14,94,120,.12)]" />
            <QuickAirtimeForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   5) CTA + FOOTER (simple, no clutter)
   (added hover micro-interactions)
========================================================= */
function CTA() {
  function onMove(e: React.MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="rounded-2xl bg-brand-harbor text-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 reveal">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">Ready to surf faster?</h2>
            <p className="text-white/80 mt-2 text-sm sm:text-base">Create your account and enjoy instant delivery and clean receipts.</p>
          </div>
          <Link
            href="/register"
            onMouseMove={onMove}
            className="bg-white text-brand-ink rounded-xl px-4 sm:px-5 py-3 font-medium hover:opacity-90 hover:scale-[1.01] transition-transform relative overflow-hidden"
          >
            <span>Get started</span>
            <span
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition"
              style={{
                background:
                  "radial-gradient(160px 160px at var(--x,50%) var(--y,50%), rgba(0,0,0,.06), transparent 60%)",
              }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 text-xs sm:text-sm text-brand-ink/70 flex flex-col md:flex-row gap-3 items-center justify-between">
        <span>© {new Date().getFullYear()} Quicksurf</span>
        <div className="flex gap-4">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/support" className="hover:underline">Support</a>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   PAGE (adds scroll-reveal + reduced-motion safety)
========================================================= */
export default function LandingPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (reduce) {
      els.forEach((el) => el.classList.add("reveal--show"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("reveal--show")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-brand-porcelain text-brand-ink">
      <HeaderMinimal />
      <Hero />
      <Differentiators />
      <SavingsCalculator />
      <CTA />
      <Footer />

      {/* global reveal styles */}
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(6px); transition: opacity .5s ease, transform .5s ease; }
        .reveal--show { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .reveal--show { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
    </main>
  );
}








