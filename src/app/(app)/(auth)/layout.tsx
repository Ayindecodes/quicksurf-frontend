import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 justify-center px-4 pb-10 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="flex flex-wrap justify-center gap-x-5 gap-y-1 px-4 pb-8 text-xs text-brand-ink/60">
        <Link href="/support" className="hover:underline">
          Help &amp; support
        </Link>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
