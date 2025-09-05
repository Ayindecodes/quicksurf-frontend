import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-mist">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="text-sm text-slate-600">Welcome back 👋</div>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search…"
            className="hidden md:block rounded-[10px] border border-mist px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint/60 focus:border-brand"
          />
          <button className="relative rounded-full p-2 hover:bg-porcelain">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-accent rounded-full" />
          </button>
          <div className="h-8 w-8 rounded-full bg-brand/20" />
        </div>
      </div>
    </header>
  );
}
