import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

import { cn } from "./cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-harbor text-white hover:bg-brand-harbor/90 shadow-sm",
  secondary: "bg-white text-brand-ink border border-black/10 hover:bg-brand-porcelain",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost: "text-brand-harbor hover:bg-brand-harbor/5",
};

export function buttonClass(variant: Variant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition [&_svg]:shrink-0",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean };

export function Button({ variant = "primary", loading = false, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
