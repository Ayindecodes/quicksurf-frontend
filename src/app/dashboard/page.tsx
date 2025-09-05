"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  // nav icons
  WalletIcon,
  BoltIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  PlusCircleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CodeBracketSquareIcon,
  AcademicCapIcon,
  HandRaisedIcon,
  CircleStackIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
  NewspaperIcon,
  PhoneIcon,
  ScaleIcon,
  MapPinIcon,
  EnvelopeIcon,
  // layout & navbar icons
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { API_ROOT, authFetch, getAccessToken } from "@/lib/auth";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
type TxStatus = "success" | "pending" | "failed";
type Tx = {
  id: string;
  created_at: string;
  kind: "airtime" | "data";
  network: "mtn" | "glo" | "airtel" | "9mobile";
  phone: string;
  amount: number;
  status: TxStatus;
  provider_ref?: string;
};
type Wallet = { balance: number; last_updated: string };

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function Naira({ value }: { value: number }) {
  return <>₦{value.toLocaleString()}</>;
}

function StatusPill({ s }: { s: TxStatus }) {
  const map: Record<TxStatus, { text: string; cls: string; icon: any }> = {
    success: { 
      text: "Success", 
      cls: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200/60 shadow-sm", 
      icon: CheckCircleIcon 
    },
    pending: { 
      text: "Pending", 
      cls: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200/60 shadow-sm", 
      icon: ExclamationTriangleIcon 
    },
    failed: { 
      text: "Failed", 
      cls: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200/60 shadow-sm", 
      icon: XCircleIcon 
    },
  };
  const I = map[s].icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border backdrop-blur-sm ${map[s].cls}`}>
      <I className="w-3.5 h-3.5" aria-hidden="true" />
      {map[s].text}
    </span>
  );
}

/* -------------------------------------------------------
   Sidebar (collapsible + mobile)
------------------------------------------------------- */
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
          return (
            <Link
              key={it.href}
              href={it.href}
              title={collapsed ? it.label : undefined}
              className={`group flex items-center rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-sm hover:scale-[1.02] ${
                collapsed ? "justify-center p-3" : "gap-4 px-4 py-3"
              }`}
            >
              <I className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors duration-200" aria-hidden="true" />
              {!collapsed && <span className="group-hover:text-slate-800">{it.label}</span>}
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
            return (
              <Link
                key={it.href}
                href={it.href}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                onClick={onClose}
              >
                <I className="w-5 h-5 text-slate-600" aria-hidden="true" />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* -------------------------------------------------------
   Topbar (sticky) with Quick Pay + Search
------------------------------------------------------- */
function useClickAway<T extends HTMLElement>(onAway: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onAway();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onAway]);
  return ref;
}

function QuickPayMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));
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
        <Link role="menuitem" href="/dashboard/airtime" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
          Buy Airtime
        </Link>
        <Link role="menuitem" href="/dashboard/data" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
          Buy Data
        </Link>
        <Link role="menuitem" href="/dashboard/fund" className="block px-4 py-3 text-sm font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
          Fund Wallet
        </Link>
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

      {/* Global search (non-blocking) */}
      <form
        role="search"
        className="hidden md:flex items-center gap-3 rounded-2xl border border-white/30 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm px-4 py-2.5 min-w-[360px] shadow-sm hover:shadow-md transition-all duration-200"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Search transactions or references"
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

/* -------------------------------------------------------
   Widgets
------------------------------------------------------- */
function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl" role="region" aria-labelledby="wallet-heading">
      <div className="rounded-[22px] bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <WalletIcon className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id="wallet-heading" className="text-lg font-bold text-slate-800">Wallet Balance</h3>
              <p className="text-sm text-slate-500">Available funds</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
            Updated {wallet.last_updated ? new Date(wallet.last_updated).toLocaleTimeString() : "—"}
          </span>
        </div>
        
        <div className="mb-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <Naira value={wallet.balance ?? 0} />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Link href="/dashboard/fund" className="flex-1 min-w-[140px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
            <PlusCircleIcon className="w-5 h-5" aria-hidden="true" /> 
            Fund wallet
          </Link>
          <Link href="/dashboard/fund" className="flex-1 min-w-[140px] bg-gradient-to-r from-slate-50 to-white border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            <BanknotesIcon className="w-5 h-5" aria-hidden="true" /> 
            Bank transfer
          </Link>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50 rounded-2xl p-4">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-indigo-500" />
            Pre-check enabled: Balance, idempotency, and provider status verified before each transaction.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const items = [
    { label: "Buy Airtime", href: "/dashboard/airtime", icon: ArrowUpRightIcon, color: "from-emerald-500 to-green-600" },
    { label: "Buy Data", href: "/dashboard/data", icon: ArrowDownLeftIcon, color: "from-blue-500 to-indigo-600" },
    { label: "Requery", href: "/dashboard/transactions?filter=pending", icon: ArrowPathIcon, color: "from-amber-500 to-orange-600" },
  ];
  return (
    <div className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-6 shadow-xl" role="region" aria-labelledby="qa-heading">
      <h3 id="qa-heading" className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BoltIcon className="w-6 h-6 text-indigo-600" />
        Quick Actions
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map((a) => {
          const I = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group relative overflow-hidden rounded-2xl bg-white border border-white/40 p-5 text-sm font-medium flex flex-col items-center justify-center gap-3 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <I className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-slate-700 group-hover:text-slate-900">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentTransactions({ rows }: { rows: Tx[] }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-6 shadow-xl overflow-hidden" role="region" aria-labelledby="recent-heading">
      <div className="flex items-center justify-between mb-6">
        <h3 id="recent-heading" className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
          Recent Transactions
        </h3>
        <Link href="/dashboard/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30" role="table" aria-label="Recent transactions">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 bg-slate-50/50">
              <th className="py-4 px-4 font-semibold">Time</th>
              <th className="py-4 px-4 font-semibold">Type</th>
              <th className="py-4 px-4 font-semibold">Network</th>
              <th className="py-4 px-4 font-semibold">Phone</th>
              <th className="py-4 px-4 font-semibold">Amount</th>
              <th className="py-4 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/30 transition-colors duration-200">
                <td className="py-4 px-4 text-slate-600">{new Date(r.created_at).toLocaleTimeString()}</td>
                <td className="py-4 px-4 capitalize font-medium text-slate-700">{r.kind}</td>
                <td className="py-4 px-4 uppercase text-xs font-bold text-slate-600">{r.network}</td>
                <td className="py-4 px-4 font-mono text-slate-600">{r.phone}</td>
                <td className="py-4 px-4 font-semibold text-slate-700"><Naira value={r.amount} /></td>
                <td className="py-4 px-4"><StatusPill s={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="mt-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <DocumentTextIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No transactions yet. Try a quick top-up to get started!</p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   Sections
------------------------------------------------------- */
function SectionHeader({ title, subtitle, id }: { title: string; subtitle?: string; id: string }) {
  return (
    <header className="mb-6">
      <h2 id={id} className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{title}</h2>
      {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
    </header>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: ElementType; title: string; desc: string }) {
  const I = Icon as ElementType;
  return (
    <div className="group rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
          <I className="w-7 h-7 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function ExploreEarn() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-8 shadow-xl" aria-labelledby="explore-earn">
      <SectionHeader
        id="explore-earn"
        title="Explore & Earn"
        subtitle="Grow with Quicksurf—earn commissions, move funds instantly, and scale operations."
      />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FeatureCard icon={BanknotesIcon} title="Earn Huge Commissions" desc="Get rewarded for every successful customer transaction you process." />
        <FeatureCard icon={ArrowTrendingUpIcon} title="Instant Withdrawal" desc="Withdraw earnings instantly to your wallet or bank account." />
        <FeatureCard icon={ChartBarIcon} title="Business Growth" desc="Access resources and insights tailored to help your business grow." />
        <FeatureCard icon={BoltIcon} title="Auto-Wallet Funding" desc="Enjoy fast, secure wallet crediting to keep transactions moving." />
      </div>
      <div className="flex flex-wrap gap-4">
        <Link href="/partner/agent" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          Start earning
        </Link>
        <Link href="/developers" className="bg-gradient-to-r from-white/80 to-white/60 border border-white/40 text-slate-700 font-bold py-4 px-8 rounded-2xl hover:shadow-xl transition-all duration-200">
          Integrate our API
        </Link>
      </div>
    </section>
  );
}

function ProgramsResources() {
  const items = [
    { label: "Become an Agent", href: "/partner/agent", icon: UserGroupIcon, color: "from-emerald-500 to-green-600" },
    { label: "Start earning", href: "/partner/opportunities", icon: ArrowTrendingUpIcon, color: "from-blue-500 to-indigo-600" },
    { label: "Integrate our API", href: "/developers", icon: CodeBracketSquareIcon, color: "from-purple-500 to-pink-600" },
    { label: "Agent Academy", href: "/academy", icon: AcademicCapIcon, color: "from-amber-500 to-orange-600" },
    { label: "Partner with Us", href: "/partner", icon: HandRaisedIcon, color: "from-rose-500 to-red-600" },
    { label: "Developers", href: "/developers/docs", icon: CircleStackIcon, color: "from-cyan-500 to-blue-600" },
  ];
  return (
    <section className="rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/30 p-8 shadow-xl" aria-labelledby="programs">
      <SectionHeader id="programs" title="Programs & Resources" subtitle="Opportunities and tools to help you build, learn, and partner." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => {
          const I = it.icon as ElementType;
          return (
            <Link key={it.href} href={it.href} className="group rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-indigo-200">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${it.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <I className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">{it.label}</h3>
                  <p className="text-sm text-slate-600 mt-1">Learn more →</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl"
      aria-labelledby="cta"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <h2 id="cta" className="text-2xl md:text-3xl font-bold mb-3">Ready to grow with Quicksurf?</h2>
          <p className="text-white/90 text-lg">Join our network of agents and developers, or start earning immediately from your dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/partner/agent" className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl">
            Become an Agent
          </Link>
          <Link href="/developers" className="bg-white/10 border-2 border-white/30 backdrop-blur-sm font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200">
            Developers
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   Footer (moved Help/Legal/Company/Contact here)
------------------------------------------------------- */
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

/* -------------------------------------------------------
   Data loading (unchanged)
------------------------------------------------------- */
function mapStatus(s: string): TxStatus {
  const t = (s || "").toLowerCase();
  if (t === "successful" || t === "success") return "success";
  if (t === "pending" || t === "initiated") return "pending";
  return "failed";
}
function asNumber(x: any) { if (typeof x === "number") return x; if (typeof x === "string") return parseFloat(x); return 0; }
function pickFirstWalletShape(data: any): any | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  if (typeof data === "object" && Array.isArray((data as any).results)) return (data as any).results[0] ?? null;
  return data;
}
async function fetchWalletOrFallback(): Promise<Wallet> {
  const tryUrls = [`${API_ROOT}/wallet/`, `${API_ROOT}/wallets/me/`, `${API_ROOT}/wallets/`, `${API_ROOT}/users/dashboard/`];
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
type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };
type AirtimeRow = { id: string | number; network: "mtn" | "glo" | "airtel" | "9mobile"; phone: string; amount: string | number; status: string; client_reference: string; timestamp: string; };
type DataRow = AirtimeRow & { plan: string };
async function fetchAirtime(): Promise<Tx[]> {
  const res = await authFetch(`${API_ROOT}/services/airtime/?page_size=10`);
  if (res.status === 401) throw new Error("401");
  if (!res.ok) return [];
  const data: Paginated<AirtimeRow> = await res.json();
  return (data.results || []).map((r) => ({ id: String(r.id), created_at: r.timestamp, kind: "airtime", network: r.network, phone: r.phone, amount: asNumber(r.amount), status: mapStatus(r.status), provider_ref: r.client_reference }));
}
async function fetchDataTx(): Promise<Tx[]> {
  const res = await authFetch(`${API_ROOT}/services/data/?page_size=10`);
  if (res.status === 401) throw new Error("401");
  if (!res.ok) return [];
  const data: Paginated<DataRow> = await res.json();
  return (data.results || []).map((r) => ({ id: String(r.id), created_at: r.timestamp, kind: "data", network: r.network, phone: r.phone, amount: asNumber(r.amount), status: mapStatus(r.status), provider_ref: r.client_reference }));
}

/* -------------------------------------------------------
   Page
------------------------------------------------------- */
export default function DashboardPage() {
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, last_updated: "" });
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  // Persist sidebar state + hotkey (Ctrl+B) to toggle
  useEffect(() => {
    const saved = localStorage.getItem("qs_sidebar_collapsed");
    if (saved) setSidebarCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("qs_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
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

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login?next=/dashboard");
        if (alive) setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [w, a, d] = await Promise.all([fetchWalletOrFallback(), fetchAirtime(), fetchDataTx()]);
        if (!alive) return;
        setWallet(w);
        const merged = [...a, ...d].sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime());
        setTxs(merged.slice(0, 10));
      } catch (e: any) {
        if (e?.message === "401") {
          router.replace("/login");
          return;
        }
        setErr("Failed to load dashboard data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [router]);

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

        {/* Main content column so footer can sit at bottom */}
        <main id="content" className="flex-1 p-6 md:p-8 lg:p-10 space-y-8 flex flex-col relative">
          {/* Heading & service status */}
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-slate-600 mt-2">Track wallet, run quick purchases, and monitor delivery statuses.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 backdrop-blur-sm px-4 py-3 text-sm flex items-center gap-3 shadow-sm" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                <span className="font-medium text-emerald-800">VTpass: Live</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1"><WalletCard wallet={wallet} /></div>
            <div className="lg:col-span-2 grid gap-8">
              <QuickActions />
              <RecentTransactions rows={txs} />
            </div>
          </div>

          <ExploreEarn />
          <ProgramsResources />
          <FooterCTA />

          {/* push footer down if content short */}
          <div className="mt-auto" />

          {/* Enhanced Toasts */}
          {err && (
            <div className="fixed inset-x-0 bottom-6 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200/60 backdrop-blur-xl px-6 py-4 text-sm text-rose-700 shadow-2xl animate-in slide-in-from-bottom-4" role="alert">
              <div className="flex items-center gap-3">
                <XCircleIcon className="w-5 h-5 text-rose-600" />
                <span className="font-medium">{err}</span>
              </div>
            </div>
          )}
          {loading && (
            <div className="fixed inset-x-0 bottom-6 mx-auto max-w-md rounded-2xl bg-white/90 border border-white/40 backdrop-blur-xl px-6 py-4 text-sm shadow-2xl animate-in slide-in-from-bottom-4" role="status" aria-live="polite">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="font-medium text-slate-700">Loading latest balances and transactions…</span>
              </div>
            </div>
          )}

          <SiteFooter />
        </main>
      </div>
    </div>
  );
}