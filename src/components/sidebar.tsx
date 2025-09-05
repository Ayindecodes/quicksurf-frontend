"use client";
import Link from "next/link";
import { LayoutDashboard, Wallet, Phone, Network, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/airtime", label: "Airtime", icon: Phone },
  { href: "/dashboard/data", label: "Data", icon: Network },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 flex-col gap-2 p-4 bg-white border-r border-mist">
      <div className="px-2 py-3 text-brand font-semibold">Quicksurf</div>
      {items.map(({ href, label, icon: Icon }) => {
        const active = path === href || (href !== "/dashboard" && path?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition
              ${active ? "bg-brand/10 text-brand" : "hover:bg-porcelain"} `}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
