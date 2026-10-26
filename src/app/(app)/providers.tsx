"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "@/context/AuthContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 4000, className: "text-sm" }} />
    </AuthProvider>
  );
}
