"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { onlyDigits, TextField } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useInterval } from "@/hooks/useApi";
import { ApiError, errorMessage } from "@/lib/api";
import { auth } from "@/lib/endpoints";

const RESEND_SECONDS = 60;

export function VerifyEmail() {
  const router = useRouter();
  const { user, reload } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS); // a code was just sent at sign-up

  useInterval(() => setWait((s) => Math.max(0, s - 1)), 1000, wait > 0);

  useEffect(() => {
    if (user?.email_verified) router.replace("/dashboard");
  }, [user?.email_verified, router]);

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await auth.confirmEmail(code);
      await reload();
      toast.success("Email confirmed");
    } catch (err) {
      setError(err instanceof ApiError ? (err.field("code") ?? err.message) : errorMessage(err));
      setBusy(false);
    }
  }

  async function resend() {
    setSending(true);
    setError(null);
    try {
      const { detail } = await auth.sendEmailCode();
      toast.success(detail);
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader title="Confirm your email" description={`Enter the 6-digit code we sent to ${user?.email ?? "you"}.`} />
      <Card className="max-w-md">
        <form onSubmit={confirm} className="space-y-4" noValidate>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value, 6))}
            hint="Codes expire after 15 minutes. Check your spam folder if you can't find it."
          />
          <Button type="submit" loading={busy} disabled={code.length !== 6} className="w-full">
            Confirm email
          </Button>
          <Button variant="ghost" className="w-full" onClick={resend} loading={sending} disabled={wait > 0}>
            {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
          </Button>
        </form>
      </Card>
    </>
  );
}
