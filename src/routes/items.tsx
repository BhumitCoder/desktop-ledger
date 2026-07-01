import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { ItemRepo } from "@/repositories";
import type { Item } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/Field";
import { fmtMoney } from "@/lib/format";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/items")({ component: ItemsPage });

function ItemsPage() {
  const [rows, setRows] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Item | null>(null);
  const refresh = () => setRows(ItemRepo.all());
  useEffect(refresh, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
      if (!typing && e.key === "n") { e.preventDefault(); setEdit(null); setOpen(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || r.name.toLowerCase().includes(s) || r.sku?.toLowerCase().includes(s) || r.barcode?.includes(s);
  });

  const columns: Column<Item>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { key: "sku", label: "SKU", width: "120px", render: (r) => <span className="font-mono text-xs">{r.sku ?? "—"}</span> },
    { key: "category", label: "Category", width: "120px", render: (r) => r.category ?? "—" },
    { key: "hsn", label: "HSN", width: "80px", render: (r) => r.hsn ?? "—" },
    { key: "gst", label: "GST%", width: "70px", align: "right", render: (r) => `${r.gstRate}%` },
    { key: "purchase", label: "Purchase", width: "100px", align: "right", render: (r) => fmtMoney(r.purchasePrice) },
    { key: "sale", label: "Sale", width: "100px", align: "right", render: (r) => fmtMoney(r.salePrice), sortValue: (r) => r.salePrice },
    { key: "stock", label: "Stock", width: "80px", align: "right", render: (r) => {
      const low = r.minStock && r.stock <= r.minStock;
      return <span className={low ? "text-warning font-medium" : ""}>{r.stock} {r.unit}</span>;
    }, sortValue: (r) => r.stock },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Items" subtitle={`${rows.length} items`} actions={
        <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> New Item <kbd className="text-[10px] ml-1">N</kbd>
        </Button>
      } />
      <div className="p-3 border-b bg-card">
        <div className="relative max-w-md">
          <Search className="h-3.5 w-3.5 absolute left-2 top-2.5 text-muted-foreground" />
          <input autoFocus placeholder="Search by name, SKU, barcode..." value={q} onChange={(e) => setQ(e.target.value)}
            className="h-8 pl-7 pr-2 border rounded w-full bg-background focus:border-primary outline-none" />
        </div>
      </div>
      <div className="p-3 flex-1 min-h-0 flex">
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id}
          onRowActivate={(r) => { setEdit(r); setOpen(true); }}
          onDelete={(r) => { if (confirm(`Delete ${r.name}?`)) { ItemRepo.remove(r.id); refresh(); toast.success("Item deleted"); } }} />
      </div>
      <ItemDialog open={open} onOpenChange={setOpen} item={edit} onSaved={refresh} />
    </div>
  );
}

function ItemDialog({ open, onOpenChange, item, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; item: Item | null; onSaved: () => void }) {
  const firstRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<Partial<Item>>({});

  useEffect(() => {
    if (open) {
      setF(item ?? { unit: "pcs", gstRate: 18, purchasePrice: 0, salePrice: 0, stock: 0, openingStock: 0 });
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [open, item]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name?.trim()) { toast.error("Name required"); return; }
    if (item) {
      ItemRepo.update(item.id, f as Item);
      toast.success("Item updated");
    } else {
      ItemRepo.add({
        ...f,
        name: f.name!,
        unit: f.unit ?? "pcs",
        gstRate: f.gstRate ?? 0,
        purchasePrice: f.purchasePrice ?? 0,
        salePrice: f.salePrice ?? 0,
        stock: f.openingStock ?? 0,
        openingStock: f.openingStock ?? 0,
      } as any);
      toast.success("Item created");
    }
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{item ? "Edit Item" : "New Item"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Field ref={firstRef} label="Name *" value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <Field label="Unit" value={f.unit ?? "pcs"} onChange={(e) => setF({ ...f, unit: e.target.value })} />
          <Field label="SKU" value={f.sku ?? ""} onChange={(e) => setF({ ...f, sku: e.target.value })} />
          <Field label="Barcode" value={f.barcode ?? ""} onChange={(e) => setF({ ...f, barcode: e.target.value })} />
          <Field label="Category" value={f.category ?? ""} onChange={(e) => setF({ ...f, category: e.target.value })} />
          <Field label="HSN" value={f.hsn ?? ""} onChange={(e) => setF({ ...f, hsn: e.target.value })} />
          <Field label="GST %" type="number" value={f.gstRate ?? 0} onChange={(e) => setF({ ...f, gstRate: parseFloat(e.target.value) || 0 })} />
          <Field label="Min Stock" type="number" value={f.minStock ?? ""} onChange={(e) => setF({ ...f, minStock: parseFloat(e.target.value) || undefined })} />
          <Field label="Purchase Price" type="number" value={f.purchasePrice ?? 0} onChange={(e) => setF({ ...f, purchasePrice: parseFloat(e.target.value) || 0 })} />
          <Field label="Sale Price *" type="number" value={f.salePrice ?? 0} onChange={(e) => setF({ ...f, salePrice: parseFloat(e.target.value) || 0 })} />
          <Field label="Wholesale Price" type="number" value={f.wholesalePrice ?? ""} onChange={(e) => setF({ ...f, wholesalePrice: parseFloat(e.target.value) || undefined })} />
          <Field label="Opening Stock" type="number" value={f.openingStock ?? 0} onChange={(e) => setF({ ...f, openingStock: parseFloat(e.target.value) || 0 })} />
          <div className="col-span-3 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
