import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Receipt,
  Wallet,
  Landmark,
  Banknote,
  BarChart3,
  FileText,
  Settings,
  Boxes,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { path: string; label: string; icon: any; key?: string };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard, key: "1" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { path: "/parties", label: "Parties", icon: Users, key: "2" },
      { path: "/items", label: "Items", icon: Package, key: "3" },
      { path: "/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    title: "Transactions",
    items: [
      { path: "/sales", label: "Sales", icon: ShoppingCart, key: "4" },
      { path: "/purchase", label: "Purchase", icon: Truck, key: "5" },
      { path: "/expenses", label: "Expenses", icon: Receipt, key: "6" },
      { path: "/payments", label: "Payments", icon: Wallet },
    ],
  },
  {
    title: "Cash & Bank",
    items: [
      { path: "/bank", label: "Bank Accounts", icon: Landmark },
      { path: "/cash", label: "Cash in Hand", icon: Banknote },
    ],
  },
  {
    title: "Reports",
    items: [
      { path: "/reports", label: "Reports", icon: BarChart3, key: "7" },
      { path: "/gst", label: "GST Returns", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { path: "/settings", label: "Settings", icon: Settings, key: "8" },
    ],
  },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Brand block */}
      <div className="h-14 px-4 flex items-center gap-2.5 bg-gradient-brand text-brand-foreground shrink-0">
        <div className="h-8 w-8 rounded-md bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold tracking-tight text-[15px]">BizDesk</span>
          <span className="text-[10px] uppercase tracking-widest opacity-80">Billing · Inventory</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 text-[13px]">
        {groups.map((g) => (
          <div key={g.title} className="mb-2">
            <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              {g.title}
            </div>
            {g.items.map((it) => {
              const active = pathname === it.path || (it.path !== "/" && pathname.startsWith(it.path));
              const Icon = it.icon;
              return (
                <Link
                  key={it.path}
                  to={it.path}
                  className={cn(
                    "group flex items-center gap-2.5 px-4 py-2 border-l-[3px] border-transparent transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground border-primary font-semibold",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-60 group-hover:opacity-90")} />
                  <span className="flex-1 truncate">{it.label}</span>
                  {it.key && (
                    <kbd className="text-[9px] opacity-60 font-mono">Alt+{it.key}</kbd>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-[11px] text-sidebar-muted bg-muted/30">
        <div className="flex items-center gap-1.5">
          <kbd>Ctrl+F</kbd> <span>Search</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <kbd>Ctrl+N</kbd> <span>New Sale</span>
        </div>
      </div>
    </aside>
  );
}
