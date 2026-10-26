"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

import { cn } from "./cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string; hint?: string };

export function PasswordField({ label, error, hint, className, ...input }: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={cn(
            "block min-h-11 w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-12 text-base outline-none transition",
            "focus:border-brand-harbor focus:ring-4 focus:ring-brand-mint/25",
            error ? "border-red-600" : "border-black/10",
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-brand-ink/60 hover:text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-mint/40"
        >
          {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
        </button>
      </div>
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
