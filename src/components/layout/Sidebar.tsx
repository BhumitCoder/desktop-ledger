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
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, key: "1" },
  { path: "/parties", label: "Parties", icon: Users, key: "2" },
  { path: "/items", label: "Items", icon: Package, key: "3" },
  { path: "/sales", label: "Sales", icon: ShoppingCart, key: "4" },
  { path: "/purchase", label: "Purchase", icon: Truck, key: "5" },
  { path: "/expenses", label: "Expenses", icon: Receipt, key: "6" },
  { path: "/payments", label: "Payments", icon: Wallet, key: "" },
  { path: "/inventory", label: "Inventory", icon: Package, key: "" },
  { path: "/bank", label: "Bank Accounts", icon: Landmark, key: "" },
  { path: "/cash", label: "Cash", icon: Banknote, key: "" },
  { path: "/reports", label: "Reports", icon: BarChart3, key: "7" },
  { path: "/gst", label: "GST", icon: FileText, key: "" },
  { path: "/settings", label: "Settings", icon: Settings, key: "8" },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-52 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="h-11 px-3 flex items-center border-b font-semibold tracking-tight">
        <span className="text-primary">▸</span>
        <span className="ml-2">BizDesk</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-1 text-[13px]">
        {items.map((it) => {
          const active = pathname === it.path || (it.path !== "/" && pathname.startsWith(it.path));
          const Icon = it.icon;
          return (
            <Link
              key={it.path}
              to={it.path}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 border-l-2 border-transparent hover:bg-sidebar-accent",
                active && "bg-sidebar-accent border-primary font-medium",
              )}
            >
              <Icon className="h-4 w-4 opacity-70" />
              <span className="flex-1">{it.label}</span>
              {it.key && (
                <kbd className="text-[10px] opacity-60 font-mono">Alt+{it.key}</kbd>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2 text-[11px] text-muted-foreground">
        Ctrl+F Search · Ctrl+N Sale
      </div>
    </aside>
  );
}
