"use client";

import { Gift, House, LogOut, ReceiptText, Smartphone, UserRound, Wifi } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { cn } from "@/components/ui/cn";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/dashboard", label: "Home", Icon: House, mobile: true },
  { href: "/dashboard/airtime", label: "Airtime", Icon: Smartphone, mobile: true },
  { href: "/dashboard/data", label: "Data", Icon: Wifi, mobile: true },
  { href: "/dashboard/history", label: "History", Icon: ReceiptText, mobile: true },
  { href: "/dashboard/rewards", label: "Rewards", Icon: Gift, mobile: false },
  { href: "/dashboard/account", label: "Account", Icon: UserRound, mobile: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  if (href === "/dashboard/history" && pathname.startsWith("/dashboard/purchases")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { status, user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-out") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, pathname, router]);

  if (status !== "signed-in") {
    return (
      <div className="grid min-h-dvh place-items-center text-brand-harbor">
        <Spinner className="h-8 w-8" label="Loading your account" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-black/5 bg-white px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo href="/dashboard" />
        </div>
        <nav aria-label="Main" className="mt-8 flex-1 space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40",
                  active ? "bg-brand-harbor/10 text-brand-harbor" : "text-brand-ink/75 hover:bg-black/[.03] hover:text-brand-ink",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-black/5 px-2 pt-4">
          <p className="truncate text-sm font-medium" title={user?.email}>
            {user?.email}
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-2 flex items-center gap-2 rounded-lg text-sm text-brand-ink/70 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo href="/dashboard" />
        <Link
          href="/dashboard/rewards"
          className="rounded-lg p-2 text-brand-ink/70 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40"
        >
          <Gift className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Rewards</span>
        </Link>
      </header>

      <main id="content" className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-10">
        <SetupBanner />
        {children}
      </main>

      {/* Mobile tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV.filter((item) => item.mobile).map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-brand-harbor" : "text-brand-ink/60",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SetupBanner() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;
  if (!user.email_verified && pathname !== "/dashboard/verify-email") {
    return (
      <Link
        href="/dashboard/verify-email"
        className="mb-6 block rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 hover:bg-amber-100"
      >
        <strong>Confirm your email</strong> to fund your wallet. We sent a code to {user.email}. →
      </Link>
    );
  }
  if (user.email_verified && !user.has_pin && pathname !== "/dashboard/account") {
    return (
      <Link
        href="/dashboard/account#pin"
        className="mb-6 block rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-900 hover:bg-sky-100"
      >
        <strong>Set your transaction PIN</strong>. You&apos;ll need it to buy airtime and data. →
      </Link>
    );
  }
  return null;
}
