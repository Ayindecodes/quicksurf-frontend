"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

import { startMonitoring } from "@/lib/monitoring";

// Vercel Analytics and Speed Insights: cookieless, and only on Vercel (the scripts are served there).
// Query strings (payment references, phone lookups) are never sent.
const ON_VERCEL = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);
const withoutQuery = <T extends { url: string }>(event: T): T => ({ ...event, url: event.url.split("?")[0] });

export function Telemetry() {
  useEffect(() => startMonitoring(), []);
  if (!ON_VERCEL) return null;
  return (
    <>
      <Analytics beforeSend={withoutQuery} />
      <SpeedInsights beforeSend={withoutQuery} />
    </>
  );
}
