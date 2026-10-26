import type { Metadata } from "next";

import { BuyAirtime } from "./BuyAirtime";

export const metadata: Metadata = { title: "Buy airtime" };

export default function AirtimePage() {
  return <BuyAirtime />;
}
