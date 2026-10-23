import type { Metadata } from "next";

import { VerifyEmail } from "./VerifyEmail";

export const metadata: Metadata = { title: "Confirm your email" };

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
