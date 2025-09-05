"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  // nav / layout
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  // sidebar items
  WalletIcon,
  BoltIcon,
  ArrowUpRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  // form + UI
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  SparklesIcon,
  EnvelopeIcon,
  MapPinIcon,
  ScaleIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { API_ROOT, authFetch, getAccessToken } from "@/lib/auth";

/* ----------------------------- Types & helpers ---------------------------- */

type TxStatus = "success" | "pending" | "failed";
type Wallet = { balance: number; last_updated: string };

const NETWORKS = [
  { id: "mtn", label: "MTN", color: "from-yellow-500 to-orange-600" },
  { id: "airtel", label: "Airtel", color: "from-red-500 to-pink-600" },
  { id: "glo", label: "Glo", color: "from-green-500 to-emerald-600" },
  { id: "9mobile", label: "9mobile", color: "from-blue-500 to-indigo-600" },
] as const;
type Network = typeof NETWORKS[number]["id"];

function asNumber(x: any): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") return parseFloat(x);
  return 0;
}

function statusPill(s: TxStatus) {
  const map: Record<TxStatus, { text: string; cls: string; Icon: ElementType }> = {
    success: { 
      text: "Success", 
      cls: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200/60 shadow-sm", 
      Icon: CheckCircleIcon 
    },
    pending: { 
      text: "Pending", 
      cls: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200/60 shadow-sm", 
      Icon: ExclamationTriangleIcon 
    },
    failed: { 
      text: "Failed", 
      cls: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200/60 shadow-sm", 
      Icon: XCircleIcon 
    },
  };
  return map[s];
}

// Persist simple UI preference
const SIDEBAR_KEY = "qs_sidebar_collapsed";

/* --------------------------------- Layout -------------------------------- */

type NavItem = { href: string; label: string; icon: ElementType };
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: WalletIcon },
  { href: "/dashboard/airtime", label: "Airtime", icon: BoltIcon },
  { href: "/dashboard/data", label: "Data", icon: ArrowUpRightIcon },
  { href: "/dashboard/transactions", label: "Transactions", icon: DocumentTextIcon },
  { href: "/dashboard/settings", label: "Settings", icon: ShieldCheckIcon },
];

function DesktopSidebar({
  collapsed,
  setCollapsed,
}: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <aside
      className={`hidden lg:flex sticky top-14 h-[calc(100vh-56px)] flex-col border-r border-white/20 bg-gradient-to-b from-white/95 via-white/90 to-white/80 backdrop-blur-xl shadow-lg transition-all duration-300 ${
        collapsed ? "w-[80px]" : "w-72"
      }`}
      aria-label="Sidebar"
    >
      <div className={`h-16 px-6 flex items-center font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${collapsed ? "justify-center px-0" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-indigo-600" />
            Quicksurf
          </div>
        ) : (
          <SparklesIcon className="w-8 h-8 text-indigo-600" />
        )}
      </div>

      <nav className="px-3 py-6 space-y-2" aria-label="Primary">
        {NAV_ITEMS.map((it) => {
          const I = it.icon;
          const isActive = it.href === "/dashboard/airtime";
          return (
            <Link
              key={it.href}
              href={it.href}
              title={collapsed ? it.label : undefined}
              className={`group flex items-center rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm text-indigo-700" 
                  : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-sm hover:scale-[1.02]"
              } ${collapsed ? "justify-center p-3" : "gap-4 px-4 py-3"}`}
            >
              <I className={`w-5 h-5 transition-colors duration-200 ${
                isActive ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"
              }`} aria-hidden="true" />
              {!collapsed && <span className={isActive ? "text-indigo-700" : "group-hover:text-slate-800"}>{it.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm py-3 text-sm font-medium hover:from-white/90 hover:to-white/80 hover:shadow-lg transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        {!collapsed && (
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/30 p-4 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
              <div>
                <div className="text-emerald-800 font-medium">Provider Status</div>
                <div className="text-emerald-600">All systems operational</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-40 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        className={`lg:hidden fixed left-0 top-14 bottom-0 w-80 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl shadow-2xl border-r border-white/20 transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile sidebar"
      >
        <nav className="px-4 py-6 space-y-2">
          {NAV_ITEMS.map((it) => {
            const I = it.icon;
            const isActive = it.href === "/dashboard/airtime";
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700" 
                    : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                }`}
                onClick={onClose}
              >
                <I className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-600"}`} aria-hidden="true" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

function QuickPayMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function away(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm px-4 py-2.5 text-sm font-medium hover:from-white/90 hover:to-white/80 hover:shadow-lg transition-all duration-200"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="quickpay-menu"
      >
        <CreditCardIcon className="w-4 h-4 text-indigo-600" aria-hidden="true" />
        Quick Pay
      </button>
      <div
        id="quickpay-menu"
        role="menu"
        className={`absolute right-0 mt-2 w-52 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200 ${open ? "block opacity-100 scale-100" : "hidden opacity-0 scale-95"}`}
      >
        <Link role="menuitem" href="/dashboard/airtime" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">Buy Airtime</Link>
        <Link role="menuitem" href="/dashboard/data" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">Buy Data</Link>
        <Link role="menuitem" href="/dashboard/fund" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">Fund Wallet</Link>
      </div>
    </div>
  );
}

function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-white/30 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-xl shadow-sm flex items-center justify-between px-6">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-3 py-2 rounded-xl shadow-lg">
        Skip to content
      </a>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="lg:hidden flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <SparklesIcon className="w-6 h-6 text-indigo-600" />
          Quicksurf
        </div>
      </div>

      <form
        role="search"
        className="hidden md:flex items-center gap-3 rounded-2xl border border-white/30 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm px-4 py-2.5 min-w-[360px] shadow-sm hover:shadow-md transition-all duration-200"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-500" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search phone, reference, network…"
          className="w-full bg-transparent outline-none text-sm py-1 placeholder:text-slate-400"
          aria-label="Search"
        />
      </form>

      <div className="flex items-center gap-3">
        <QuickPayMenu />
        <Link href="/support" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200">
          Support
        </Link>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-white/40 flex items-center justify-center text-sm font-bold text-indigo-700 shadow-sm" aria-hidden="true">
          QS
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/20 bg-gradient-to-br from-slate-50/50 to-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-bold text-slate-800 mb-4 text-base">Help</h4>
          <ul className="space-y-3">
            <li><Link href="/help" className="text-slate-600 hover:text-indigo-600 hover:underline inline-flex items-center gap-2 transition-colors duration-200"><LifebuoyIcon className="w-4 h-4" /> Help Center</Link></li>
            <li><Link href="/faq" className="text-slate-600 hover:text-indigo-600 hover:underline inline-flex items-center gap-2 transition-colors duration-200"><QuestionMarkCircleIcon className="w-4 h-4" /> FAQs</Link></li>
            <li><Link href="/blog" className="text-slate-600 hover:text-indigo-600 hover:underline inline-flex items-center gap-2 transition-colors duration-200"><NewspaperIcon className="w-4 h-4" /> Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4 text-base">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="/terms" className="text-slate-600 hover:text-indigo-600 hover:underline inline-flex items-center gap-2 transition-colors duration-200"><ScaleIcon className="w-4 h-4" /> Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="text-slate-600 hover:text-indigo-600 hover:underline inline-flex items-center gap-2 transition-colors duration-200"><ShieldCheckIcon className="w-4 h-4" /> Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4 text-base">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200">About us</Link></li>
            <li><Link href="/contact" className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200">Contact us</Link></li>
            <li><Link href="/about#careers" className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4 text-base">Contact</h4>
          <ul className="space-y-3">
            <li className="text-slate-600 inline-flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-indigo-600" /> 0700-000-0000</li>
            <li className="text-slate-600 inline-flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 text-indigo-600" /> support@quicksurf.ng</li>
            <li className="text-slate-600 inline-flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-indigo-600" /> Lagos, Nigeria</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-slate-600">© {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quicksurf</span>. All rights reserved.</div>
          <nav className="flex items-center gap-6">
            <Link className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200" href="/terms">Terms</Link>
            <Link className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200" href="/privacy">Privacy</Link>
            <Link className="text-slate-600 hover:text-indigo-600 hover:underline transition-colors duration-200" href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- Data functions ---------------------------- */

function pickFirstWalletShape(data: any): any | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (typeof data === "object" && Array.isArray((data as any).results)) return (data as any).results[0] ?? null;
  return data;
}

async function fetchWalletOrFallback(): Promise<Wallet> {
  const tryUrls = [
    `${API_ROOT}/wallet/`,
    `${API_ROOT}/wallets/me/`,
    `${API_ROOT}/wallets/`,
    `${API_ROOT}/users/dashboard/`,
  ];
  for (const url of tryUrls) {
    const res = await authFetch(url);
    if (res.status === 401) throw new Error("401");
    if (!res.ok) continue;
    const raw = await res.json();
    const d = pickFirstWalletShape(raw);
    if (d && typeof d === "object") {
      const balance = asNumber(d.balance ?? d.wallet?.balance ?? 0);
      const last = d.updated || d.updated_at || d.last_updated || new Date().toISOString();
      return { balance, last_updated: last };
    }
  }
  return { balance: 0, last_updated: new Date().toISOString() };
}

/** Smart POST: tries common paths, or an explicit NEXT_PUBLIC_AIRTIME_PATH override. */
const AIRTIME_PATHS: string[] = (() => {
  const override = (process.env.NEXT_PUBLIC_AIRTIME_PATH || "").trim();
  if (override) return [override]; // e.g. "/api/services/airtime/"
  return [
    "/services/airtime/",
    "/api/services/airtime/",
    "/api/airtime/",
    "/airtime/",
    "/v1/services/airtime/",
  ];
})();

async function postAirtimeSmart(payload: {
  network: string;
  phone: string;
  amount: number;
  client_reference: string;
}) {
  const base = API_ROOT.replace(/\/+$/, "");
  let lastErr: string | null = null;

  for (const path of AIRTIME_PATHS) {
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await authFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let j: any = null;
    try {
      j = await res.json();
    } catch {
      j = null;
    }

    if (res.status === 404) {
      // try next candidate
      continue;
    }

    if (!res.ok) {
      lastErr = j?.detail || j?.error || `HTTP ${res.status}`;
      // stop trying — endpoint exists but failed for another reason
      throw new Error(lastErr);
    }

    // success
    return { json: j, url };
  }

  throw new Error("Airtime endpoint not found (tried multiple paths). Set NEXT_PUBLIC_AIRTIME_PATH if needed.");
}

/* --------------------------------- Page ---------------------------------- */

export default function AirtimePage() {
  const router = useRouter();

  // layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // data state
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, last_updated: "" });

  // form state
  const [network, setNetwork] = useState<Network | "">("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: TxStatus; msg: string; ref?: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // recent numbers (local preference)
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);

  // auth + wallet bootstrap
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved) setSidebarCollapsed(saved === "1");

    const token = getAccessToken();
    if (!token) {
      router.replace("/login?next=/dashboard/airtime");
      return;
    }

    (async () => {
      try {
        const w = await fetchWalletOrFallback();
        setWallet(w);
      } catch {
        // ignore; UI still usable
      }
    })();

    try {
      const r = JSON.parse(localStorage.getItem("qs_recent_numbers") || "[]");
      if (Array.isArray(r)) setRecentNumbers(r.slice(0, 6));
    } catch {}
  }, [router]);

  // persist sidebar state + hotkey
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // derived state
  const amt = asNumber(amount);
  const phoneOk = /^\d{10,14}$/.test(phone.replace(/\D/g, ""));
  const networkOk = !!network;
  const amountOk = amt > 0;
  const canSubmit = networkOk && phoneOk && amountOk && !loading;

  function addRecentNumber(num: string) {
    const next = [num, ...recentNumbers.filter((n) => n !== num)].slice(0, 6);
    setRecentNumbers(next);
    localStorage.setItem("qs_recent_numbers", JSON.stringify(next));
  }

  function idempotencyRef() {
    return `qs_airtime_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // simple client checks
    if (wallet.balance && amt > wallet.balance) {
      setErr("Insufficient balance. Please fund your wallet.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const payload = {
        network,
        phone: phone.replace(/\D/g, ""),
        amount: amt,
        client_reference: idempotencyRef(),
      };

      // 🔁 Smart POST (handles /api prefixes or custom paths)
      const { json } = await postAirtimeSmart(payload);

      addRecentNumber(payload.phone);
      setToast({
        kind: "success",
        msg: "Airtime queued successfully",
        ref: String(json?.id || json?.client_reference || ""),
      });

      // optimistic wallet display
      if (wallet.balance) {
        setWallet((w) => ({ ...w, balance: Math.max(0, w.balance - amt) }));
      }
    } catch (e: any) {
      setToast({ kind: "failed", msg: e?.message || "Airtime purchase failed" });
    } finally {
      setLoading(false);
    }
  }

  const summaryNewBal = Math.max(0, (wallet.balance || 0) - (amt || 0));

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-800 flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <Topbar onOpenMobile={() => setMobileOpen(true)} />
      <div className="flex flex-1 relative">
        <DesktopSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main id="content" className="flex-1 p-6 md:p-8 lg:p-10 space-y-8 flex flex-col relative">
          {/* Header */}
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BoltIcon className="w-6 h-6 text-white" />
                </div>
                Buy Airtime
              </h1>
              <p className="text-slate-600 mt-2">Fast, secure top-ups with clear pricing and instant feedback.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 backdrop-blur-sm px-4 py-3 text-sm flex items-center gap-3 shadow-sm">
              <WalletIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800">
                Wallet: <b className="font-bold">₦{(wallet.balance || 0).toLocaleString()}</b>
              </span>
            </div>
          </div>

          {/* Grid: form + summary */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <section className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-8 shadow-xl" aria-labelledby="airtime-form">
              <h2 id="airtime-form" className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-white" />
                </div>
                Top-up Details
              </h2>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Network */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Network</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {NETWORKS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setNetwork(n.id)}
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-sm font-medium transition-all duration-200 ${
                          network === n.id
                            ? "border-indigo-300 ring-2 ring-indigo-200 bg-white shadow-lg scale-[1.02]"
                            : "border-white/40 bg-white/80 hover:bg-white hover:shadow-md hover:scale-[1.01]"
                        }`}
                        aria-pressed={network === n.id}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${n.color} opacity-10 group-hover:opacity-20 transition-opacity duration-200`} />
                        <span className="relative font-bold text-slate-800">{n.label}</span>
                      </button>
                    ))}
                  </div>
                  {!networkOk && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                      <XCircleIcon className="w-4 h-4" />
                      Please select a network provider.
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <div className="relative rounded-2xl bg-white/90 border border-white/40 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all duration-200 shadow-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <input
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="e.g. 08012345678"
                      className="w-full bg-transparent outline-none pl-12 pr-4 py-4 rounded-2xl font-medium"
                      aria-describedby="phone-help"
                    />
                  </div>
                  <p id="phone-help" className="mt-2 text-sm text-slate-500">
                    Enter 10–14 digits. We'll validate before processing.
                  </p>
                  {!phoneOk && phone.length > 0 && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                      <XCircleIcon className="w-4 h-4" />
                      Please enter a valid phone number.
                    </p>
                  )}

                  {/* Recent numbers */}
                  {recentNumbers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-600 mb-2">Recent Numbers</p>
                      <div className="flex flex-wrap gap-2">
                        {recentNumbers.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPhone(n)}
                            className="rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:from-indigo-100 hover:to-purple-100 hover:shadow-sm transition-all duration-200"
                            title="Use recent number"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
                  <div className="relative rounded-2xl bg-white/90 border border-white/40 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all duration-200 shadow-sm">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₦
                    </div>
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                      placeholder="e.g. 1000"
                      className="w-full bg-transparent outline-none pl-12 pr-4 py-4 rounded-2xl font-medium text-lg"
                    />
                  </div>
                  {!amountOk && amount.length > 0 && (
                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-2">
                      <XCircleIcon className="w-4 h-4" />
                      Please enter a valid amount.
                    </p>
                  )}

                  {/* Quick amount chips */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-600 mb-2">Quick Select</p>
                    <div className="flex flex-wrap gap-2">
                      {[100, 200, 500, 1000, 2000, 5000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAmount(String(v))}
                          className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            amount === String(v)
                              ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                              : "border-white/60 bg-white/70 text-slate-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          ₦{v.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {err && (
                  <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/60 p-4 flex items-center gap-3">
                    <XCircleIcon className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-rose-700">{err}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-white font-bold shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-2xl hover:scale-[1.01]"
                >
                  {loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <div className={`flex items-center justify-center gap-3 ${loading ? "invisible" : ""}`}>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Buy Airtime
                  </div>
                </button>
              </form>
            </section>

            {/* Summary */}
            <aside className="rounded-3xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 p-6 shadow-xl h-max">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-indigo-600" />
                Order Summary
              </h3>
              
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <dt className="text-slate-600">Network</dt>
                  <dd className="font-semibold text-slate-800">{network ? NETWORKS.find((n) => n.id === network)?.label : "—"}</dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <dt className="text-slate-600">Phone</dt>
                  <dd className="font-semibold text-slate-800 font-mono">{phone || "—"}</dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <dt className="text-slate-600">Amount</dt>
                  <dd className="font-bold text-lg text-slate-800">₦{(amt || 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <dt className="text-slate-500">Service Fee</dt>
                  <dd className="text-slate-500">₦0</dd>
                </div>
                <div className="flex items-center justify-between py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl px-4 border border-indigo-200/30">
                  <dt className="font-bold text-slate-800">Total</dt>
                  <dd className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₦{(amt || 0).toLocaleString()}</dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Wallet Balance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Current</span>
                    <span className="font-semibold text-slate-800">₦{(wallet.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">After purchase</span>
                    <span className="font-semibold text-slate-800">₦{summaryNewBal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/30 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Secure Transaction</p>
                    <p className="text-xs text-indigo-600 mt-1">Pre-validation, instant receipt, and fraud protection included.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* CTA banner to Data/Transactions */}
          <section className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
            </div>
            
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Need data instead?</h2>
                <p className="text-white/90 text-lg">Switch to data bundles or review your transaction history.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/data" className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Buy Data
                </Link>
                <Link href="/dashboard/transactions" className="bg-white/10 border-2 border-white/30 backdrop-blur-sm font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200">
                  View Transactions
                </Link>
              </div>
            </div>
          </section>

          {/* push footer to bottom if content short */}
          <div className="mt-auto" />

          {/* Enhanced Toasts */}
          {toast && (
            <div
              className={`fixed inset-x-0 bottom-6 mx-auto max-w-md rounded-2xl border backdrop-blur-xl px-6 py-4 text-sm shadow-2xl animate-in slide-in-from-bottom-4 ${
                statusPill(toast.kind).cls
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const { Icon } = statusPill(toast.kind);
                  return <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
                })()}
                <div className="flex-1">
                  <div className="font-semibold">{toast.msg}</div>
                  {toast.ref && (
                    <div className="text-xs opacity-80 mt-1">
                      Ref: {toast.ref} •{" "}
                      <Link href="/dashboard/transactions" className="underline hover:no-underline">
                        View transactions
                      </Link>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setToast(null)} 
                  className="text-current/70 hover:text-current transition-colors duration-200 p-1 rounded-lg hover:bg-black/5"
                  aria-label="Close notification"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <SiteFooter />
        </main>
      </div>
    </div>
  );
}