"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { onlyDigits, TextField } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { ApiError, errorMessage } from "@/lib/api";
import { auth } from "@/lib/endpoints";

type Step = "request" | "confirm" | "done";

export function ResetPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fieldError = (name: string) => (error instanceof ApiError ? error.field(name) : undefined);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { detail } = await auth.requestPasswordReset(email.trim());
      setNotice(detail);
      setStep("confirm");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.confirmPasswordReset(email.trim(), code, password);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError && Object.keys(err.fields).length ? err : errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">Password changed</h1>
        <p className="mt-2 text-sm text-brand-ink/70">
          For your safety you&apos;ve been signed out on every device. Log in with your new password.
        </p>
        <ButtonLink href="/login" className="mt-6 w-full">
          Log in
        </ButtonLink>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
      {step === "request" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4" noValidate>
          <p className="text-sm text-brand-ink/70">Enter your email and we&apos;ll send you a 6-digit code.</p>
          {typeof error === "string" && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={busy} disabled={!email} className="w-full">
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={confirm} className="mt-6 space-y-4" noValidate>
          {notice && <Alert tone="info">{notice} The code expires in 15 minutes.</Alert>}
          {typeof error === "string" && <Alert tone="error">{error}</Alert>}
          <TextField
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value, 6))}
            error={fieldError("code")}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError("new_password")}
          />
          <Button type="submit" loading={busy} disabled={code.length !== 6 || !password} className="w-full">
            Change password
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => sendCode()} disabled={busy}>
            Send a new code
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-brand-ink/70">
        <Link href="/login" className="font-semibold text-brand-harbor hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
