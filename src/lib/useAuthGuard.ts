// src/lib/useAuthGuard.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";

export default function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    const token = getAccessToken();
    if (!token) router.replace("/login?next=/dashboard");
  }, [router]);
}

