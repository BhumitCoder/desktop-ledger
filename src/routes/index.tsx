import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesRepo, PurchaseRepo, PartyRepo, ItemRepo, ExpenseRepo } from "@/repositories";
import { fmtMoney } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Package, Users, Receipt } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const [data, setData] = useState({ sales: [] as any[], purchases: [] as any[], parties: [] as any[], items: [] as any[], expenses: [] as any[] });
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
  const lowStock = data.items.filter((i) => i.minStock && i.stock <= i.minStock);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" subtitle="Business overview" />
      <div className="p-4 grid grid-cols-4 gap-3">
        <Stat label="Total Sales" value={fmtMoney(totalSales)} icon={ArrowUpRight} tone="success" />
        <Stat label="Total Purchase" value={fmtMoney(totalPurchase)} icon={ArrowDownRight} />
        <Stat label="Receivable" value={fmtMoney(receivable)} icon={Users} tone="warning" />
        <Stat label="Payable" value={fmtMoney(payable)} icon={Users} tone="warning" />
        <Stat label="Expenses" value={fmtMoney(totalExpense)} icon={Receipt} />
        <Stat label="Parties" value={String(data.parties.length)} icon={Users} />
        <Stat label="Items" value={String(data.items.length)} icon={Package} />
        <Stat label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} tone={lowStock.length ? "warning" : undefined} />
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 gap-3 flex-1 min-h-0">
        <Panel title="Recent Sales">
          <List items={data.sales.slice(0, 8)} render={(s) => (
            <div className="flex justify-between py-1.5 px-2 border-b last:border-0">
              <span className="font-medium">{s.number}</span>
              <span className="text-muted-foreground flex-1 px-3 truncate">{s.partyName}</span>
              <span>{fmtMoney(s.total)}</span>
            </div>
          )} empty="No sales yet. Press Ctrl+N to create one." />
        </Panel>
        <Panel title="Low Stock Alerts">
          <List items={lowStock.slice(0, 8)} render={(i) => (
            <div className="flex justify-between py-1.5 px-2 border-b last:border-0">
              <span className="font-medium truncate flex-1">{i.name}</span>
              <span className="text-warning font-medium">Stock: {i.stock} / Min: {i.minStock}</span>
            </div>
          )} empty="All items are well stocked." />
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone?: "success" | "warning" }) {
  return (
    <div className="border rounded-md bg-card p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase tracking-wide font-medium">{label}</span>
        <Icon className={`h-4 w-4 ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : ""}`} />
      </div>
      <div className="text-xl font-semibold mt-1.5">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md bg-card flex flex-col min-h-0">
      <div className="px-3 py-2 border-b font-semibold text-sm">{title}</div>
      <div className="flex-1 overflow-auto text-[13px]">{children}</div>
    </div>
  );
}

function List<T>({ items, render, empty }: { items: T[]; render: (x: T) => React.ReactNode; empty: string }) {
  if (!items.length) return <div className="p-4 text-muted-foreground text-center">{empty}</div>;
  return <>{items.map((x, i) => <div key={i}>{render(x)}</div>)}</>;
}
