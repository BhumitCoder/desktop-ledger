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
  ChevronsLeft,
  ChevronsRight,
  CornerDownLeft,
  CornerUpLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/workspace";

type NavItem = { path: string; label: string; icon: any; key?: string };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  { title: "Overview", items: [{ path: "/", label: "Dashboard", icon: LayoutDashboard, key: "1" }] },
  {
    title: "Master Data",
    items: [
      { path: "/parties", label: "Parties", icon: Users, key: "2" },
      { path: "/items", label: "Items", icon: Package, key: "3" },
      { path: "/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    title: "Sales",
    items: [
      { path: "/sales", label: "Sales", icon: ShoppingCart, key: "4" },
      { path: "/sale-return", label: "Sale Return", icon: CornerDownLeft },
    ],
  },
  {
    title: "Purchase & Expenses",
    items: [
      { path: "/purchase", label: "Purchase", icon: Truck, key: "5" },
      { path: "/purchase-return", label: "Purchase Return", icon: CornerUpLeft },
      { path: "/expenses", label: "Expenses", icon: Receipt, key: "6" },
    ],
  },
  {
    title: "Payments",
    items: [
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
  { title: "System", items: [{ path: "/settings", label: "Settings", icon: Settings, key: "8" }] },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = useWorkspace((s) => s.sidebarCollapsed);
  const toggle = useWorkspace((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-200",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 bg-gradient-brand text-brand-foreground shrink-0 px-3 relative">
        <div className="h-8 w-8 rounded-md bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20 shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="font-bold tracking-tight text-[15px]">BizDesk</span>
            <span className="text-[10px] uppercase tracking-widest opacity-80">Billing · Inventory</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 text-[13px]">
        {groups.map((g) => (
          <div key={g.title} className="mb-2">
            {!collapsed && (
              <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {g.title}
              </div>
            )}
            {collapsed && <div className="mx-3 my-2 border-t border-sidebar-border" />}
            {g.items.map((it) => {
              const active = pathname === it.path || (it.path !== "/" && pathname.startsWith(it.path));
              const Icon = it.icon;
              return (
                <Link
                  key={it.path}
                  to={it.path}
                  title={collapsed ? it.label : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 py-2 border-l-[3px] border-transparent transition-colors",
                    collapsed ? "px-3 justify-center" : "px-4",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground border-primary font-semibold",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
                  {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                  {!collapsed && it.key && (
                    <kbd className="text-[9px] opacity-60 font-mono">Alt+{it.key}</kbd>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={toggle}
        className="border-t border-sidebar-border h-10 flex items-center justify-center gap-2 text-[11px] text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : (<><ChevronsLeft className="h-4 w-4" /><span>Collapse</span></>)}
      </button>
    </aside>
  );
}
