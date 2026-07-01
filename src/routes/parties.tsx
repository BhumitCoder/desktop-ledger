import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { PartyRepo } from "@/repositories";
import type { Party } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/Field";
import { fmtMoney } from "@/lib/format";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parties")({ component: PartiesPage });

function PartiesPage() {
  const [rows, setRows] = useState<Party[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Party | null>(null);

  const refresh = () => setRows(PartyRepo.all());
  useEffect(refresh, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !isTyping(e)) { e.preventDefault(); setEdit(null); setOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.phone?.includes(s) || r.gstin?.toLowerCase().includes(s);
  });

  const columns: Column<Party>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "type", label: "Type", width: "90px", render: (r) => <span className="capitalize text-xs px-1.5 py-0.5 rounded bg-muted">{r.type}</span> },
    { key: "phone", label: "Phone", width: "140px", render: (r) => r.phone ?? "—" },
    { key: "gstin", label: "GSTIN", width: "160px", render: (r) => <span className="font-mono text-xs">{r.gstin ?? "—"}</span> },
    { key: "balance", label: "Opening Balance", align: "right", width: "140px", render: (r) => fmtMoney(r.openingBalance), sortValue: (r) => r.openingBalance },
    { key: "credit", label: "Credit Limit", align: "right", width: "120px", render: (r) => r.creditLimit ? fmtMoney(r.creditLimit) : "—" },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Parties" subtitle={`${rows.length} customers / suppliers`} actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> New Party <kbd className="text-[10px] ml-1">N</kbd>
        </Button>
      } />
      <div className="p-3 flex gap-2 border-b bg-card">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-2 top-2.5 text-muted-foreground" />
          <input autoFocus placeholder="Search parties..." value={q} onChange={(e) => setQ(e.target.value)}
            className="h-8 pl-7 pr-2 border rounded w-full bg-background focus:border-primary outline-none" />
        </div>
      </div>
      <div className="p-3 flex-1 min-h-0 flex">
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id}
          onRowActivate={(r) => { setEdit(r); setOpen(true); }}
          onDelete={(r) => { if (confirm(`Delete ${r.name}?`)) { PartyRepo.remove(r.id); refresh(); toast.success("Party deleted"); } }} />
      </div>
      <PartyDialog open={open} onOpenChange={setOpen} party={edit} onSaved={() => { refresh(); }} />
    </div>
  );
}

function PartyDialog({ open, onOpenChange, party, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; party: Party | null; onSaved: () => void }) {
  const firstRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<Party>>({});

  useEffect(() => {
    if (open) {
      setForm(party ?? { type: "customer", openingBalance: 0 });
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [open, party]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) { toast.error("Name is required"); return; }
    if (party) {
      PartyRepo.update(party.id, form as Party);
      toast.success("Party updated");
    } else {
      PartyRepo.add({ ...form, name: form.name!, type: form.type ?? "customer", openingBalance: form.openingBalance ?? 0 } as any);
      toast.success("Party created");
    }
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onKeyDown={(e) => { if (e.key === "Escape") onOpenChange(false); }}>
        <DialogHeader><DialogTitle>{party ? "Edit Party" : "New Party"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          <Field ref={firstRef} label="Name *" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="flex flex-col gap-1 text-[12px]">
            <span className="text-muted-foreground font-medium">Type</span>
            <select value={form.type ?? "customer"} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="h-8 px-2 border rounded bg-background focus:border-primary outline-none">
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
              <option value="both">Both</option>
            </select>
          </label>
          <Field label="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="GSTIN" value={form.gstin ?? ""} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} />
          <Field label="Opening Balance" type="number" value={form.openingBalance ?? 0} onChange={(e) => setForm({ ...form, openingBalance: parseFloat(e.target.value) || 0 })} />
          <Field label="Credit Limit" type="number" value={form.creditLimit ?? ""} onChange={(e) => setForm({ ...form, creditLimit: parseFloat(e.target.value) || undefined })} />
          <div className="col-span-2">
            <Field label="Address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Field label="Shipping Address" value={form.shippingAddress ?? ""} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel <kbd className="ml-1 text-[10px]">Esc</kbd></Button>
            <Button type="submit">Save <kbd className="ml-1 text-[10px]">Ctrl+S</kbd></Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}
