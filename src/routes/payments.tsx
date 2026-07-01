import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { SalesRepo, PurchaseRepo } from "@/repositories";
import type { Invoice } from "@/types";
import { fmtMoney, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

interface PayRow { id: string; date: string; number: string; party: string; type: "in" | "out"; total: number; paid: number; balance: number; mode: string }

function PaymentsPage() {
  const [rows, setRows] = useState<PayRow[]>([]);
  useEffect(() => {
    const list: PayRow[] = [];
    SalesRepo.all().forEach((s: Invoice) => list.push({
      id: s.id, date: s.date, number: s.number, party: s.partyName, type: "in", total: s.total, paid: s.paid, balance: s.total - s.paid, mode: s.paymentMode
    }));
    PurchaseRepo.all().forEach((s: Invoice) => list.push({
      id: s.id, date: s.date, number: s.number, party: s.partyName, type: "out", total: s.total, paid: s.paid, balance: s.total - s.paid, mode: s.paymentMode
    }));
    list.sort((a, b) => b.date.localeCompare(a.date));
    setRows(list);
  }, []);

  const columns: Column<PayRow>[] = [
    { key: "date", label: "Date", width: "120px", render: (r) => fmtDate(r.date) },
    { key: "type", label: "Type", width: "80px", render: (r) => <span className={`text-xs font-medium ${r.type === "in" ? "text-success" : "text-warning"}`}>{r.type === "in" ? "IN" : "OUT"}</span> },
    { key: "number", label: "Ref #", width: "120px", render: (r) => <span className="font-mono">{r.number}</span> },
    { key: "party", label: "Party", render: (r) => r.party },
    { key: "mode", label: "Mode", width: "90px", render: (r) => <span className="capitalize text-xs">{r.mode}</span> },
    { key: "total", label: "Total", align: "right", width: "110px", render: (r) => fmtMoney(r.total) },
    { key: "paid", label: "Paid", align: "right", width: "110px", render: (r) => fmtMoney(r.paid) },
    { key: "balance", label: "Balance", align: "right", width: "110px", render: (r) => fmtMoney(r.balance) },
  ];

  const totalIn = rows.filter((r) => r.type === "in").reduce((s, r) => s + r.paid, 0);
  const totalOut = rows.filter((r) => r.type === "out").reduce((s, r) => s + r.paid, 0);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Payments" subtitle={`In: ${fmtMoney(totalIn)} · Out: ${fmtMoney(totalOut)} · Net: ${fmtMoney(totalIn - totalOut)}`} />
      <div className="p-3 flex-1 min-h-0 flex"><DataTable columns={columns} rows={rows} rowKey={(r) => r.type + r.id} /></div>
    </div>
  );
}
