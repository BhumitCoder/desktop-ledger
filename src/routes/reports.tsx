import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesRepo, PurchaseRepo, ExpenseRepo, PartyRepo, ItemRepo } from "@/repositories";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const REPORTS = [
  { key: "sales", label: "Sales Report", desc: "Invoice-wise sales" },
  { key: "purchase", label: "Purchase Report", desc: "Bill-wise purchase" },
  { key: "profit", label: "Profit & Loss", desc: "Revenue minus costs" },
  { key: "gst", label: "GST Summary", desc: "Tax collected & paid" },
  { key: "customerLedger", label: "Customer Ledger", desc: "Outstanding per customer" },
  { key: "supplierLedger", label: "Supplier Ledger", desc: "Payable per supplier" },
  { key: "stock", label: "Stock Report", desc: "Item-wise stock and value" },
  { key: "daily", label: "Daily Summary", desc: "Today's cash flow" },
];

function ReportsPage() {
  const [active, setActive] = useState("sales");
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Reports" subtitle="Business intelligence" />
      <div className="flex-1 flex min-h-0">
        <aside className="w-56 border-r bg-card overflow-y-auto">
          {REPORTS.map((r) => (
            <button key={r.key} onClick={() => setActive(r.key)}
              className={`w-full text-left px-3 py-2 border-b hover:bg-accent ${active === r.key ? "bg-accent border-l-2 border-l-primary" : ""}`}>
              <div className="font-medium text-sm">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </button>
          ))}
        </aside>
        <div className="flex-1 overflow-auto p-4">
          <ReportView key={active} which={active} />
        </div>
      </div>
    </div>
  );
}

function ReportView({ which }: { which: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const sales = SalesRepo.all();
    const purchases = PurchaseRepo.all();
    const expenses = ExpenseRepo.all();
    const parties = PartyRepo.all();
    const items = ItemRepo.all();

    switch (which) {
      case "sales":
        setData({ rows: sales.map((s) => ({ ref: s.number, party: s.partyName, date: s.date, total: s.total })), totals: [["Total Sales", sales.reduce((a, b) => a + b.total, 0)]] });
        break;
      case "purchase":
        setData({ rows: purchases.map((s) => ({ ref: s.number, party: s.partyName, date: s.date, total: s.total })), totals: [["Total Purchase", purchases.reduce((a, b) => a + b.total, 0)]] });
        break;
      case "profit": {
        const rev = sales.reduce((a, b) => a + b.total, 0);
        const cog = purchases.reduce((a, b) => a + b.total, 0);
        const exp = expenses.reduce((a, b) => a + b.amount, 0);
        setData({ rows: [
          { name: "Revenue (Sales)", amount: rev },
          { name: "Cost of Goods (Purchase)", amount: -cog },
          { name: "Expenses", amount: -exp },
        ], totals: [["Net Profit", rev - cog - exp]] });
        break;
      }
      case "gst": {
        const outputTax = sales.reduce((a, b) => a + b.taxAmount, 0);
        const inputTax = purchases.reduce((a, b) => a + b.taxAmount, 0);
        setData({ rows: [
          { name: "Output Tax (Sales GST)", amount: outputTax },
          { name: "Input Tax (Purchase GST)", amount: inputTax },
        ], totals: [["Net GST Payable", outputTax - inputTax]] });
        break;
      }
      case "customerLedger": {
        const map = new Map<string, number>();
        sales.forEach((s) => map.set(s.partyName, (map.get(s.partyName) ?? 0) + (s.total - s.paid)));
        setData({ rows: Array.from(map, ([name, balance]) => ({ name, balance })).filter((r) => r.balance > 0.01), totals: [] });
        break;
      }
      case "supplierLedger": {
        const map = new Map<string, number>();
        purchases.forEach((s) => map.set(s.partyName, (map.get(s.partyName) ?? 0) + (s.total - s.paid)));
        setData({ rows: Array.from(map, ([name, balance]) => ({ name, balance })).filter((r) => r.balance > 0.01), totals: [] });
        break;
      }
      case "stock":
        setData({ rows: items.map((i) => ({ name: i.name, sku: i.sku, stock: `${i.stock} ${i.unit}`, value: i.stock * i.purchasePrice })), totals: [["Total Stock Value", items.reduce((a, b) => a + b.stock * b.purchasePrice, 0)]] });
        break;
      case "daily": {
        const t = new Date().toISOString().slice(0, 10);
        const s = sales.filter((x) => x.date === t).reduce((a, b) => a + b.total, 0);
        const p = purchases.filter((x) => x.date === t).reduce((a, b) => a + b.total, 0);
        const e = expenses.filter((x) => x.date === t).reduce((a, b) => a + b.amount, 0);
        setData({ rows: [
          { name: "Today Sales", amount: s },
          { name: "Today Purchase", amount: p },
          { name: "Today Expenses", amount: e },
        ], totals: [["Net Today", s - p - e]] });
        break;
      }
      default: setData({ rows: [], totals: [] });
    }
  }, [which]);

  if (!data) return null;
  const cols = Object.keys(data.rows[0] ?? {});
  return (
    <div className="border rounded-md bg-card">
      <div className="data-table max-h-[calc(100vh-220px)] overflow-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr>{cols.map((c) => <th key={c} style={{ textAlign: typeof data.rows[0][c] === "number" ? "right" : "left" }} className="capitalize">{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? <tr><td colSpan={cols.length || 1} className="text-center py-8 text-muted-foreground">No data</td></tr>
              : data.rows.map((r: any, i: number) => (
              <tr key={i}>{cols.map((c) => <td key={c} style={{ textAlign: typeof r[c] === "number" ? "right" : "left" }}>{typeof r[c] === "number" ? fmtMoney(r[c]) : r[c] ?? "—"}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.totals?.length > 0 && (
        <div className="border-t p-3 space-y-1">
          {data.totals.map(([l, v]: [string, number]) => (
            <div key={l} className="flex justify-between font-semibold"><span>{l}</span><span>{fmtMoney(v)}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
