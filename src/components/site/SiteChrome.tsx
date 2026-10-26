import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { BUSINESS, isPlaceholder } from "@/content/business";

export function SiteHeader() {
  return (
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
  );
}

const LINKS = [
  ["/support", "Help & support"],
  ["/terms", "Terms of Service"],
  ["/privacy", "Privacy Policy"],
  ["/refunds", "Refund Policy"],
] as const;

export function SiteFooter() {
  const company = isPlaceholder(BUSINESS.legalName) ? BUSINESS.tradingName : BUSINESS.legalName;
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-brand-ink/70 sm:px-6">
        <nav aria-label="Legal and support" className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="font-medium text-brand-ink/80 hover:text-brand-ink hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap justify-between gap-2">
          <p>
            © {new Date().getFullYear()} {company}
            {!isPlaceholder(BUSINESS.registration) && ` · ${BUSINESS.registration}`}
          </p>
          <p>Payments by Paystack · Delivery by VTpass</p>
        </div>
      </div>
    </footer>
  );
}

/** Long-form text (policies): readable line length and spacing without a typography plugin. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={
        "max-w-3xl text-[15px] leading-relaxed text-brand-ink/85 " +
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-ink [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-brand-ink " +
        "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 " +
        "[&_a]:font-medium [&_a]:text-brand-harbor [&_a]:underline [&_strong]:text-brand-ink"
      }
    >
      {children}
    </div>
  );
}

export function PolicyPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-brand-ink/60">Last updated {BUSINESS.policiesUpdated}</p>
      <Prose>
        <p className="text-base">{intro}</p>
        {children}
      </Prose>
    </main>
  );
}

/** A contact detail as a link, or plain text while it's still a placeholder. */
export function Contact({ kind }: { kind: "email" | "whatsapp" | "privacy" }) {
  const value =
    kind === "whatsapp" ? BUSINESS.whatsapp : kind === "privacy" ? BUSINESS.privacyEmail : BUSINESS.supportEmail;
  if (isPlaceholder(value)) return <span>{value}</span>;
  const href = kind === "whatsapp" ? `https://wa.me/${value.replace(/\D/g, "")}` : `mailto:${value}`;
  return <a href={href}>{value}</a>;
}
