import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export function Card({ className, children, ...props }: { className?: string; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("rounded-2xl border border-black/5 bg-white p-5 shadow-card sm:p-6", className)} {...props}>
      {children}
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-brand-ink/70">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-black/[.06]", className)} aria-hidden="true" />;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="font-semibold text-brand-ink">{title}</p>
      {children && <p className="max-w-sm text-sm text-brand-ink/70">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
