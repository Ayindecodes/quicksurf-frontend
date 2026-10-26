"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { reportError } from "@/lib/monitoring";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error), [error]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-brand-ink/70">
        This page hit a problem. Your wallet and purchases are not affected. Please try again.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="secondary">
          Go to dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
