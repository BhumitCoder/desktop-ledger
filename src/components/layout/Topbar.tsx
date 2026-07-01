import { Search, Plus, Bell, Building2, User } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
  return (
    <header className="h-11 border-b bg-card flex items-center px-2 gap-2 shrink-0">
      <button
        onClick={() => setGlobalSearch(true)}
        className="flex-1 max-w-md flex items-center gap-2 h-8 px-3 rounded-md border bg-background text-sm text-muted-foreground hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search customers, items, invoices…</span>
        <kbd className="text-[10px] font-mono border rounded px-1">Ctrl+F</kbd>
      </button>
      <div className="flex-1" />
      <Button size="sm" variant="secondary" onClick={() => navigate({ to: "/sales/new" })}>
        <Plus className="h-3.5 w-3.5" /> Sale
        <kbd className="text-[10px] font-mono opacity-60 ml-1">Ctrl+N</kbd>
      </Button>
      <Button size="sm" variant="secondary" onClick={() => navigate({ to: "/purchase/new" })}>
        <Plus className="h-3.5 w-3.5" /> Purchase
        <kbd className="text-[10px] font-mono opacity-60 ml-1">Ctrl+P</kbd>
      </Button>
      <button className="p-1.5 rounded hover:bg-accent" title="Notifications">
        <Bell className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-1.5 px-2 h-8 rounded border bg-background text-sm">
        <Building2 className="h-3.5 w-3.5 opacity-60" />
        <span className="font-medium truncate max-w-[140px]">{company.name}</span>
      </div>
      <button className="p-1.5 rounded hover:bg-accent" title="Profile">
        <User className="h-4 w-4" />
      </button>
    </header>
  );
}
