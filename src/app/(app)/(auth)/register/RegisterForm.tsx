"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";
import { ApiError, errorMessage } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | string | null>(null);
  const [busy, setBusy] = useState(false);
  const fieldError = (name: string) => (error instanceof ApiError ? error.field(name) : undefined);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(email.trim(), password);
      router.replace("/dashboard/verify-email");
    } catch (err) {
      setError(err instanceof ApiError && Object.keys(err.fields).length ? err : errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-brand-ink/70">Buy airtime and data for any Nigerian number.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {typeof error === "string" && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError("email")}
          hint="We'll send a code to confirm it."
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldError("password")}
          hint="At least 8 characters. Avoid common passwords and anything like your email."
        />
        <p className="text-xs text-brand-ink/60">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="font-medium text-brand-harbor underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-brand-harbor underline">
            Privacy Policy
          </Link>
          .
        </p>
        <Button type="submit" loading={busy} disabled={!email || !password} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-harbor hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
