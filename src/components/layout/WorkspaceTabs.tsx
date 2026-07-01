import { useWorkspace } from "@/store/workspace";
import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function WorkspaceTabs() {
  const { tabs, closeTab, openTab } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routeTitle = titleFromPath(pathname);

  useEffect(() => {
    if (!routeTitle) return;
    openTab({ id: pathname, title: routeTitle, path: pathname });
  }, [pathname, routeTitle, openTab]);

  if (!tabs.length) return null;

  return (
    <div className="h-9 border-b bg-muted/40 flex items-end px-1 gap-0.5 overflow-x-auto shrink-0">
      {tabs.map((tab) => {
        const active = tab.path === pathname;
        return (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center gap-1.5 h-8 pl-3 pr-1.5 border border-b-0 rounded-t-md text-xs cursor-pointer",
              active ? "bg-background border-border" : "bg-transparent border-transparent hover:bg-background/60",
            )}
          >
            <Link to={tab.path} className="max-w-[160px] truncate">
              {tab.title}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                closeTab(tab.id);
              }}
              className="opacity-40 hover:opacity-100 hover:bg-accent rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function titleFromPath(path: string): string | null {
  if (path === "/") return "Dashboard";
  const map: Record<string, string> = {
    "/parties": "Parties",
    "/items": "Items",
    "/sales": "Sales",
    "/sales/new": "New Sale",
    "/purchase": "Purchase",
    "/purchase/new": "New Purchase",
    "/expenses": "Expenses",
    "/payments": "Payments",
    "/inventory": "Inventory",
    "/bank": "Bank",
    "/cash": "Cash",
    "/reports": "Reports",
    "/gst": "GST",
    "/settings": "Settings",
  };
  return map[path] ?? null;
}
