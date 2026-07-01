import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesRepo, PurchaseRepo, PartyRepo, ItemRepo, ExpenseRepo } from "@/repositories";
import { fmtMoney } from "@/lib/format";
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Package,
  Users,
  Receipt,
  ShoppingCart,
  Truck,
  Wallet,
  FileText,
  TrendingUp,
  IndianRupee,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    sales: [] as any[],
    purchases: [] as any[],
    parties: [] as any[],
    items: [] as any[],
    expenses: [] as any[],
  });
  useEffect(() => {
    setData({
      sales: SalesRepo.all(),
      purchases: PurchaseRepo.all(),
      parties: PartyRepo.all(),
      items: ItemRepo.all(),
      expenses: ExpenseRepo.all(),
    });
  }, []);

  const totalSales = data.sales.reduce((s, x) => s + (x.total || 0), 0);
  const totalPurchase = data.purchases.reduce((s, x) => s + (x.total || 0), 0);
  const totalExpense = data.expenses.reduce((s, x) => s + (x.amount || 0), 0);
  const receivable = data.sales.reduce((s, x) => s + Math.max(0, (x.total || 0) - (x.paid || 0)), 0);
  const payable = data.purchases.reduce((s, x) => s + Math.max(0, (x.total || 0) - (x.paid || 0)), 0);
  const cashIn = data.sales.reduce((s, x) => s + (x.paid || 0), 0);
  const cashOut = data.purchases.reduce((s, x) => s + (x.paid || 0), 0) + totalExpense;
  const lowStock = data.items.filter((i) => i.minStock && i.stock <= i.minStock);
  const profit = totalSales - totalPurchase - totalExpense;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        subtitle="Live business overview — today at a glance"
      />

      <div className="p-5 space-y-5 overflow-auto flex-1">
        {/* Hero money cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <HeroCard
            label="Money In (Sales)"
            value={fmtMoney(totalSales)}
            gradient="bg-gradient-success"
            icon={ArrowUpRight}
            hint={`${data.sales.length} invoices`}
          />
          <HeroCard
            label="Money Out (Purchase)"
            value={fmtMoney(totalPurchase + totalExpense)}
            gradient="bg-gradient-warning"
            icon={ArrowDownRight}
            hint={`${data.purchases.length} bills · ${data.expenses.length} expenses`}
          />
          <HeroCard
            label="You Will Receive"
            value={fmtMoney(receivable)}
            gradient="bg-gradient-info"
            icon={Wallet}
            hint="Outstanding from customers"
          />
          <HeroCard
            label="You Will Pay"
            value={fmtMoney(payable)}
            gradient="bg-gradient-primary"
            icon={IndianRupee}
            hint="Outstanding to suppliers"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-card border rounded-lg shadow-card">
          <div className="px-4 py-2.5 border-b flex items-center justify-between">
            <span className="text-[13px] font-semibold">Quick Actions</span>
            <span className="text-[11px] text-muted-foreground">Keyboard shortcuts enabled</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3">
            <QuickAction icon={ShoppingCart} label="New Sale" hint="Ctrl+N" onClick={() => navigate({ to: "/sales/new" })} />
            <QuickAction icon={Truck} label="New Purchase" hint="Ctrl+P" onClick={() => navigate({ to: "/purchase/new" })} />
            <QuickAction icon={Users} label="Add Party" onClick={() => navigate({ to: "/parties" })} />
            <QuickAction icon={Package} label="Add Item" onClick={() => navigate({ to: "/items" })} />
            <QuickAction icon={Receipt} label="Add Expense" onClick={() => navigate({ to: "/expenses" })} />
            <QuickAction icon={FileText} label="GST Report" onClick={() => navigate({ to: "/gst" })} />
          </div>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Net Profit" value={fmtMoney(profit)} icon={TrendingUp} tone={profit >= 0 ? "success" : "danger"} />
          <Stat label="Cash In" value={fmtMoney(cashIn)} icon={ArrowUpRight} tone="success" />
          <Stat label="Cash Out" value={fmtMoney(cashOut)} icon={ArrowDownRight} tone="warning" />
          <Stat label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} tone={lowStock.length ? "warning" : "muted"} />
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel
            title="Recent Sales"
            action={
              <button
                onClick={() => navigate({ to: "/sales/new" })}
                className="text-[11px] text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> New
              </button>
            }
          >
            <List
              items={data.sales.slice(0, 8)}
              render={(s) => (
                <div className="flex justify-between py-2 px-3 border-b last:border-0 hover:bg-accent/50">
                  <span className="font-semibold text-primary">{s.number}</span>
                  <span className="text-muted-foreground flex-1 px-3 truncate">{s.partyName}</span>
                  <span className="font-medium tabular-nums">{fmtMoney(s.total)}</span>
                </div>
              )}
              empty="No sales yet. Press Ctrl+N to create your first invoice."
            />
          </Panel>

          <Panel title="Low Stock Alerts">
            <List
              items={lowStock.slice(0, 8)}
              render={(i) => (
                <div className="flex justify-between py-2 px-3 border-b last:border-0 hover:bg-accent/50">
                  <span className="font-medium truncate flex-1">{i.name}</span>
                  <span className="text-warning font-semibold text-[12px] px-2 py-0.5 rounded bg-warning-soft">
                    Stock: {i.stock} / Min: {i.minStock}
                  </span>
                </div>
              )}
              empty="✓ All items are well stocked."
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  label,
  value,
  gradient,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: any;
  hint?: string;
}) {
  return (
    <div className={`${gradient} text-white rounded-lg p-4 shadow-elevated relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">{label}</span>
          <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center ring-1 ring-white/20">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold mt-2 tracking-tight tabular-nums">{value}</div>
        {hint && <div className="text-[11px] text-white/80 mt-1">{hint}</div>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, hint, onClick }: { icon: any; label: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 p-3 rounded-md border bg-background hover:bg-primary-soft hover:border-primary/30 transition text-left"
    >
      <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-semibold truncate">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground font-mono">{hint}</span>}
      </div>
    </button>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: any;
  tone?: "success" | "warning" | "danger" | "muted";
}) {
  const toneStyles: Record<string, string> = {
    success: "text-success bg-success-soft",
    warning: "text-warning bg-warning-soft",
    danger: "text-destructive bg-primary-soft",
    muted: "text-muted-foreground bg-muted",
  };
  return (
    <div className="border rounded-lg bg-card p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${toneStyles[tone ?? "muted"]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-lg font-bold mt-1.5 tabular-nums">{value}</div>
    </div>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border rounded-lg bg-card flex flex-col min-h-0 shadow-card">
      <div className="px-4 py-2.5 border-b flex items-center justify-between">
        <span className="text-[13px] font-semibold">{title}</span>
        {action}
      </div>
      <div className="flex-1 overflow-auto text-[13px]">{children}</div>
    </div>
  );
}

function List<T>({ items, render, empty }: { items: T[]; render: (x: T) => React.ReactNode; empty: string }) {
  if (!items.length) return <div className="p-6 text-muted-foreground text-center text-[12px]">{empty}</div>;
  return <>{items.map((x, i) => <div key={i}>{render(x)}</div>)}</>;
}
