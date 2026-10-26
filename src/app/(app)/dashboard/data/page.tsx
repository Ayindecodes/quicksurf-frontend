import type { Metadata } from "next";

import { BuyData } from "./BuyData";

export const metadata: Metadata = { title: "Buy data" };

export default function DataPage() {
  return <BuyData />;
}
