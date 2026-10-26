import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-harbor text-sm text-white" aria-hidden="true">
        Q
      </span>
      QuickSurf
    </Link>
  );
}
