"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

const CONTROL =
  "block w-full min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-base text-brand-ink placeholder:text-brand-ink/40 " +
  "outline-none transition focus:border-brand-harbor focus:ring-4 focus:ring-brand-mint/25 disabled:bg-black/[.03]";

type Common = { label: ReactNode; hint?: ReactNode; error?: string; className?: string };

function Wrapper({ id, label, hint, error, className, children }: Common & { id: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-brand-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-brand-ink/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: ReactNode, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({ label, hint, error, className, id: given, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId();
  const id = given ?? generated;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <input
        id={id}
        className={cn(CONTROL, error ? "border-red-600" : "border-black/10")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  children,
  id: given,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const generated = useId();
  const id = given ?? generated;
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} className={className}>
      <select
        id={id}
        className={cn(CONTROL, error ? "border-red-600" : "border-black/10")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...select}
      >
        {children}
      </select>
    </Wrapper>
  );
}

/** The 4-digit transaction PIN: a numeric password field. Keep its value to digits with `onlyDigits`. */
export function PinField(props: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <TextField type="password" inputMode="numeric" autoComplete="off" maxLength={4} {...props} />;
}

export const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);
