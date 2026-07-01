import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { SalesRepo } from "@/repositories";
import type { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtDate } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sales/")({ component: SalesPage });

function SalesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const navigate = useNavigate();
  const refresh = () => setRows(SalesRepo.all());
  useEffect(refresh, []);

  const columns: Column<Invoice>[] = [
    { key: "number", label: "Invoice #", width: "120px", render: (r) => <span className="font-mono font-medium">{r.number}</span>, sortValue: (r) => r.number },
    { key: "date", label: "Date", width: "120px", render: (r) => fmtDate(r.date), sortValue: (r) => r.date },
    { key: "party", label: "Customer", render: (r) => r.partyName, sortValue: (r) => r.partyName },
    { key: "items", label: "Items", width: "80px", align: "right", render: (r) => r.lineItems.length },
    { key: "total", label: "Total", align: "right", width: "120px", render: (r) => fmtMoney(r.total), sortValue: (r) => r.total },
    { key: "paid", label: "Paid", align: "right", width: "120px", render: (r) => fmtMoney(r.paid) },
    { key: "balance", label: "Balance", align: "right", width: "120px", render: (r) => {
      const b = r.total - r.paid;
      return <span className={b > 0 ? "text-warning font-medium" : "text-success"}>{fmtMoney(b)}</span>;
    } },
    { key: "mode", label: "Mode", width: "80px", render: (r) => <span className="capitalize text-xs">{r.paymentMode}</span> },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Sales" subtitle={`${rows.length} invoices`} actions={
        <Button size="sm" onClick={() => navigate({ to: "/sales/new" })}>
          <Plus className="h-3.5 w-3.5" /> New Sale <kbd className="text-[10px] ml-1">Ctrl+N</kbd>
        </Button>
      } />
      <div className="p-3 flex-1 min-h-0 flex">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
          onDelete={(r) => { if (confirm(`Delete ${r.number}?`)) { SalesRepo.remove(r.id); refresh(); toast.success("Deleted"); } }} />
      </div>
    </div>
  );
}
