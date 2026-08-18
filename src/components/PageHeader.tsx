import { type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/**
 * Standard page header — same bar every list/detail page in the app uses,
 * so switching pages never feels like switching apps. `icon` renders plain
 * (no colored badge box) — `iconClassName` only sets its color, e.g.
 * "text-success" for Sale pages, "text-warning" for Purchase.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  iconClassName = "text-primary",
  mobileAction,
  showBack = false,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  /** Show a back chevron on PHONES only.
   *
   * The bottom tab bar only carries Home / Items / Parties / Purchase, so
   * every other page — Daybook, GST, Cash, Bank, Payees, Reports, Settings —
   * is reached through the nav drawer and, until now, had no way back on a
   * phone: a dead end unless you reopened the drawer. Desktop is unaffected,
   * because the sidebar is always docked there. */
  showBack?: boolean;
  /** Rendered at the far right of the title row, mobile only (hidden at
   * sm: and up, where `actions` already sits inline next to the title with
   * no spare room). Fills what would otherwise be dead space next to a
   * short title — e.g. a compact "Filters" button for a page whose full
   * filter row doesn't fit on a phone and needs to move into a sheet. */
  mobileAction?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="no-print bg-white border-b px-3 py-2.5 sm:px-5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Go back"
              className="md:hidden shrink-0 h-8 w-8 -ml-1 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100 transition"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}
          {icon && (
            <div className={`shrink-0 flex items-center justify-center ${iconClassName}`}>
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-[15px] sm:text-[17px] font-bold tracking-tight leading-tight text-gray-800 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-[12px] text-gray-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {mobileAction && <div className="sm:hidden shrink-0">{mobileAction}</div>}
      </div>
      {actions && <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
