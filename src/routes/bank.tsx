import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { BankRepo } from "@/repositories";
import type { BankAccount } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/Field";
import { fmtMoney } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bank")({ component: BankPage });

function BankPage() {
  const [rows, setRows] = useState<BankAccount[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<BankAccount | null>(null);
  const refresh = () => setRows(BankRepo.all());
  useEffect(refresh, []);

  const columns: Column<BankAccount>[] = [
    { key: "name", label: "Account Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "acc", label: "Account No.", width: "180px", render: (r) => <span className="font-mono text-xs">{r.accountNumber ?? "—"}</span> },
    { key: "ifsc", label: "IFSC", width: "120px", render: (r) => <span className="font-mono text-xs">{r.ifsc ?? "—"}</span> },
    { key: "opening", label: "Opening", align: "right", width: "120px", render: (r) => fmtMoney(r.openingBalance) },
    { key: "balance", label: "Balance", align: "right", width: "140px", render: (r) => <span className="font-semibold">{fmtMoney(r.balance)}</span> },
  ];

  const totalBalance = rows.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Bank Accounts" subtitle={`${rows.length} accounts · Total: ${fmtMoney(totalBalance)}`} actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}><Plus className="h-3.5 w-3.5" /> New Account</Button>
      } />
      <div className="p-3 flex-1 min-h-0 flex">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
          onRowActivate={(r) => { setEdit(r); setOpen(true); }}
          onDelete={(r) => { if (confirm(`Delete ${r.name}?`)) { BankRepo.remove(r.id); refresh(); } }} />
      </div>
      <BankDialog open={open} onOpenChange={setOpen} bank={edit} onSaved={refresh} />
    </div>
  );
}

function BankDialog({ open, onOpenChange, bank, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; bank: BankAccount | null; onSaved: () => void }) {
  const firstRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<Partial<BankAccount>>({});
  useEffect(() => {
    if (open) { setF(bank ?? { openingBalance: 0, balance: 0 }); setTimeout(() => firstRef.current?.focus(), 50); }
  }, [open, bank]);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name?.trim()) { toast.error("Name required"); return; }
    if (bank) BankRepo.update(bank.id, f as BankAccount);
    else BankRepo.add({ ...f, name: f.name!, openingBalance: f.openingBalance ?? 0, balance: f.openingBalance ?? 0 } as any);
    toast.success("Saved"); onSaved(); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{bank ? "Edit" : "New"} Bank Account</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field ref={firstRef} label="Bank Name *" value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <Field label="Account Number" value={f.accountNumber ?? ""} onChange={(e) => setF({ ...f, accountNumber: e.target.value })} />
          <Field label="IFSC" value={f.ifsc ?? ""} onChange={(e) => setF({ ...f, ifsc: e.target.value.toUpperCase() })} />
          <Field label="Opening Balance" type="number" value={f.openingBalance ?? 0} onChange={(e) => setF({ ...f, openingBalance: parseFloat(e.target.value) || 0 })} />
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
