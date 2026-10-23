import { ArrowRight, BadgeCheck, Gift, Lock, Wallet, Zap } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

const FEATURES = [
  {
    Icon: Zap,
    title: "Delivered in seconds",
    body: "Airtime and data go straight to the number you choose. We follow every purchase until the network confirms it.",
  },
  {
    Icon: Wallet,
    title: "Refunds are automatic",
    body: "If a purchase fails or the network reverses it, the money goes back into your wallet, with every naira on record.",
  },
  {
    Icon: Lock,
    title: "Protected by your PIN",
    body: "Every purchase needs your 4-digit transaction PIN, so nobody else can spend your balance.",
  },
  {
    Icon: Gift,
    title: "Points on every purchase",
    body: "Earn points on successful purchases and turn them into wallet money whenever you like.",
  },
];

const STEPS = [
  { title: "Create your account", body: "Sign up with your email and confirm it with the code we send." },
  { title: "Fund your wallet", body: "Pay securely through Paystack. Your balance updates as soon as the payment is confirmed." },
  { title: "Buy airtime or data", body: "Pick a number and an amount or plan, confirm with your PIN, done." },
];

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Account" className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-brand-ink/80 hover:text-brand-ink">
              Log in
            </Link>
            <ButtonLink href="/register" className="min-h-10 px-3.5 py-2">
              Create account
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-harbor/10 px-3 py-1 text-xs font-semibold text-brand-harbor">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> MTN · Glo · Airtel · 9mobile
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Airtime and data in seconds.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-brand-ink/75">
              Fund your QuickSurf wallet once, then top up any line in Nigeria (yours or your family&apos;s) in a
              few taps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" className="px-5">
                Create free account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" className="px-5">
                Log in
              </ButtonLink>
            </div>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-y-6 -inset-x-2 -z-10 rounded-[2rem] bg-brand-harbor/10 blur-2xl sm:-inset-6" />
            <div className="rounded-3xl bg-brand-harbor p-6 text-white shadow-xl">
              <p className="text-sm text-white/75">Wallet balance</p>
              <p className="mt-1 text-3xl font-bold">₦12,450.00</p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                <span className="rounded-xl bg-white/15 py-2">Top up</span>
                <span className="rounded-xl bg-white/15 py-2">Airtime</span>
                <span className="rounded-xl bg-white/15 py-2">Data</span>
              </div>
            </div>
            <div className="-mt-4 ml-6 rounded-2xl border border-black/5 bg-white p-4 shadow-card">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Data 2GB for 0803•••4567</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                  Successful
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-ink/60">MTN · just now</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="why" className="border-y border-black/5 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 id="why" className="text-2xl font-bold tracking-tight">
              Built so your money is always accounted for
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-black/5 bg-brand-porcelain p-5">
                  <Icon className="h-6 w-6 text-brand-harbor" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-brand-ink/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="how" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="how" className="text-2xl font-bold tracking-tight">
            How it works
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-harbor text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-brand-ink/70">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-ink p-6 text-white sm:flex-row sm:items-center md:p-8">
            <div>
              <p className="text-xl font-bold">Ready when you are</p>
              <p className="text-sm text-white/75">It takes about a minute to set up.</p>
            </div>
            <ButtonLink href="/register" variant="secondary" className="border-0">
              Create free account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-brand-ink/70 sm:px-6">
          <p>© {new Date().getFullYear()} QuickSurf</p>
          <p>Payments by Paystack · Delivery by VTpass</p>
        </div>
      </footer>
    </>
  );
}
