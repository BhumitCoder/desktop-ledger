import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SalesRepo, PurchaseRepo, ExpenseRepo } from "@/repositories";
import { fmtMoney, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/cash")({ component: CashPage });

function CashPage() {
  const [entries, setEntries] = useState<{ date: string; type: string; ref: string; in: number; out: number }[]>([]);

  useEffect(() => {
    const list: any[] = [];
    SalesRepo.all().forEach((s) => s.paymentMode === "cash" && list.push({ date: s.date, type: "Sale", ref: `${s.number} — ${s.partyName}`, in: s.paid, out: 0 }));
    PurchaseRepo.all().forEach((s) => s.paymentMode === "cash" && list.push({ date: s.date, type: "Purchase", ref: `${s.number} — ${s.partyName}`, in: 0, out: s.paid }));
    ExpenseRepo.all().forEach((e) => e.paymentMode === "cash" && list.push({ date: e.date, type: "Expense", ref: e.category, in: 0, out: e.amount }));
    list.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(list);
  }, []);

  const totalIn = entries.reduce((s, e) => s + e.in, 0);
  const totalOut = entries.reduce((s, e) => s + e.out, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cash in Hand" subtitle={`In: ${fmtMoney(totalIn)} · Out: ${fmtMoney(totalOut)} · Balance: ${fmtMoney(balance)}`} />
      <div className="p-3 flex-1 min-h-0 flex flex-col">
        <div className="border rounded-md bg-card flex-1 overflow-auto data-table">
          <table className="w-full text-[13px]">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Reference</th><th style={{ textAlign: "right" }}>Cash In</th><th style={{ textAlign: "right" }}>Cash Out</th></tr>
            </thead>
            <tbody>
              {entries.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No cash transactions yet.</td></tr>
                : entries.map((e, i) => (
                <tr key={i}>
                  <td>{fmtDate(e.date)}</td>
                  <td><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{e.type}</span></td>
                  <td>{e.ref}</td>
                  <td className="text-right text-success">{e.in ? fmtMoney(e.in) : "—"}</td>
                  <td className="text-right text-warning">{e.out ? fmtMoney(e.out) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
