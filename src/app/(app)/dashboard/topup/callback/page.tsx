import type { Metadata } from "next";
import { Suspense } from "react";

import { TopupResult } from "./TopupResult";

export const metadata: Metadata = { title: "Top-up status" };

export default function TopupCallbackPage() {
  return (
    <Suspense>
      <TopupResult />
    </Suspense>
  );
}
