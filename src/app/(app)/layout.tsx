import type { ReactNode } from "react";

import { AppProviders } from "./providers";

/** Sign-in pages and the dashboard share the session; the public landing page doesn't load it. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
