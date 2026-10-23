import type { Metadata } from "next";

import { Topup } from "./Topup";

export const metadata: Metadata = { title: "Top up" };

export default function TopupPage() {
  return <Topup />;
}
