import type { Metadata } from "next";

import { ReceiptView } from "./ReceiptView";

export const metadata: Metadata = { title: "Purchase receipt" };

export default async function PurchasePage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <ReceiptView reference={decodeURIComponent(reference)} />;
}
