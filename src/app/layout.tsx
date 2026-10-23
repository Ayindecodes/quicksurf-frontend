import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";
import type { ReactNode } from "react";

import "./globals.css";
import { Telemetry } from "./telemetry";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "QuickSurf: airtime and data in seconds", template: "%s · QuickSurf" },
  description: "Fund your QuickSurf wallet with Paystack and buy MTN, Glo, Airtel and 9mobile airtime and data in seconds.",
  applicationName: "QuickSurf",
};

export const viewport: Viewport = { themeColor: "#0e5e78" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Render per request: the Content-Security-Policy nonce (src/proxy.ts) must reach Next's scripts.
  await connection();
  return (
    <html lang="en-NG" className={inter.variable}>
      <body className="min-h-dvh bg-brand-porcelain font-sans text-brand-ink antialiased">
        {children}
        <Telemetry />
      </body>
    </html>
  );
}
