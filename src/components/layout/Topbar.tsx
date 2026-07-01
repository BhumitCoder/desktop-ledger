import { Search, Plus, Bell, Building2, User, ChevronDown, HelpCircle } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { useNavigate } from "@tanstack/react-router";
import { CompanyRepo } from "@/repositories";
import { useEffect, useState } from "react";

export function Topbar() {
  const { setGlobalSearch } = useWorkspace();
  const navigate = useNavigate();
  const [company, setCompany] = useState(() => CompanyRepo.get());
  useEffect(() => {
    const t = setInterval(() => setCompany(CompanyRepo.get()), 2000);
    return () => clearInterval(t);
  }, []);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <header className="h-14 bg-gradient-brand text-brand-foreground flex items-center px-4 gap-3 shrink-0 shadow-elevated">
      {/* Search */}
      <button
        onClick={() => setGlobalSearch(true)}
        className="flex-1 max-w-lg flex items-center gap-2 h-9 px-3.5 rounded-md bg-white/15 hover:bg-white/25 text-white/95 backdrop-blur-sm transition-colors ring-1 ring-white/10"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left text-sm">Search customer, item, invoice…</span>
        <kbd className="text-[10px] font-mono bg-white/20 border-white/20 text-white">Ctrl+F</kbd>
      </button>

      <div className="flex-1" />

      {/* Primary actions */}
      <button
        onClick={() => navigate({ to: "/sales/new" })}
        className="h-9 px-3.5 rounded-md bg-white text-primary hover:bg-white/95 font-semibold text-sm flex items-center gap-1.5 shadow-card transition"
      >
        <Plus className="h-4 w-4" /> Add Sale
        <kbd className="text-[10px] font-mono ml-1 opacity-70 bg-primary/10 border-primary/20">Ctrl+N</kbd>
      </button>
      <button
        onClick={() => navigate({ to: "/purchase/new" })}
        className="h-9 px-3.5 rounded-md bg-white/15 hover:bg-white/25 text-white font-semibold text-sm flex items-center gap-1.5 ring-1 ring-white/20 transition"
      >
        <Plus className="h-4 w-4" /> Add Purchase
        <kbd className="text-[10px] font-mono ml-1 opacity-80 bg-white/20 border-white/20 text-white">Ctrl+P</kbd>
      </button>

      <div className="h-6 w-px bg-white/20 mx-1" />

      <span className="hidden lg:inline text-[11px] text-white/75 tabular-nums">{today}</span>

      <button className="p-2 rounded-md hover:bg-white/15 text-white/90" title="Help">
        <HelpCircle className="h-4 w-4" />
      </button>
      <button className="p-2 rounded-md hover:bg-white/15 text-white/90 relative" title="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
      </button>

      <button className="flex items-center gap-2 pl-2 pr-2 h-9 rounded-md bg-white/15 hover:bg-white/25 ring-1 ring-white/20 transition">
        <div className="h-6 w-6 rounded bg-white/20 flex items-center justify-center">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wide opacity-75">Company</span>
          <span className="text-[12px] font-semibold truncate max-w-[140px]">{company.name}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>

      <button className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 ring-1 ring-white/20 flex items-center justify-center transition" title="Profile">
        <User className="h-4 w-4" />
      </button>
    </header>
  );
}
