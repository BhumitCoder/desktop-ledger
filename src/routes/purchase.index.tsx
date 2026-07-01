import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { PurchaseRepo } from "@/repositories";
import type { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { fmtMoney, fmtDate } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/purchase/")({ component: PurchasePage });

function PurchasePage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const navigate = useNavigate();
  const refresh = () => setRows(PurchaseRepo.all());
  useEffect(refresh, []);

  const columns: Column<Invoice>[] = [
    { key: "number", label: "Bill #", width: "120px", render: (r) => <span className="font-mono font-medium">{r.number}</span>, sortValue: (r) => r.number },
    { key: "date", label: "Date", width: "120px", render: (r) => fmtDate(r.date), sortValue: (r) => r.date },
    { key: "party", label: "Supplier", render: (r) => r.partyName },
    { key: "items", label: "Items", width: "80px", align: "right", render: (r) => r.lineItems.length },
    { key: "total", label: "Total", align: "right", width: "120px", render: (r) => fmtMoney(r.total), sortValue: (r) => r.total },
    { key: "paid", label: "Paid", align: "right", width: "120px", render: (r) => fmtMoney(r.paid) },
    { key: "balance", label: "Balance", align: "right", width: "120px", render: (r) => fmtMoney(r.total - r.paid) },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Purchase" subtitle={`${rows.length} bills`} actions={
        <Button size="sm" onClick={() => navigate({ to: "/purchase/new" })}>
          <Plus className="h-3.5 w-3.5" /> New Purchase <kbd className="text-[10px] ml-1">Ctrl+P</kbd>
        </Button>
      } />
      <div className="p-3 flex-1 min-h-0 flex">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
          onDelete={(r) => { if (confirm(`Delete ${r.number}?`)) { PurchaseRepo.remove(r.id); refresh(); toast.success("Deleted"); } }} />
      </div>
    </div>
  );
}
