// src/app/dashboard/DashboardClient.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthGuard from "@/lib/useAuthGuard";
import { authFetchJSON, clearTokens } from "@/lib/auth";

type Me = { id: number; email: string; full_name?: string };
type Wallet = { balance: number };

export default function DashboardClient() {
  useAuthGuard();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Change these to your real endpoints if different:
        const me = await authFetchJSON<Me>("/users/me/");
        const wallet = await authFetchJSON<Wallet>("/wallets/me/");
        setMe(me || null);
        setWallet(wallet || null);
      } catch (e: any) {
        // If refresh failed, you’ll get a 401 and we clear tokens + bounce to login
        if (String(e).includes("HTTP 401")) {
          clearTokens();
          document.cookie = "qs_logged_in=; Max-Age=0; path=/";
          router.replace("/login");
        } else {
          setErr(e.message ?? "Failed to load dashboard");
        }
      }
    })();
  }, [router]);

  if (err) return <p className="text-red-600">{err}</p>;
  if (!me || !wallet) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Welcome, {me.full_name || me.email}</h1>
      <div className="p-4 rounded-xl border">
        <p className="text-sm text-gray-600">Wallet Balance</p>
        <p className="text-2xl font-bold">₦{wallet.balance?.toLocaleString()}</p>
      </div>
    </div>
  );
}

