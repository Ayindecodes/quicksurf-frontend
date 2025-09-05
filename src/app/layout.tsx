// src/app/layout.tsx
export const metadata = {
  title: "Quicksurf — Fast Airtime & Data",
  description: "Instant airtime and data purchases with a clean wallet experience.",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

