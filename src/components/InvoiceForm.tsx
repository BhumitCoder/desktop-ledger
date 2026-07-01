import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import { PartyRepo, ItemRepo, SalesRepo, PurchaseRepo, CompanyRepo, nextInvoiceNumber } from "@/repositories";
import type { Invoice, LineItem, Party, Item, PaymentMode } from "@/types";
import { fmtMoney, today } from "@/lib/format";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { genId } from "@/repositories/base";

interface Props {
  mode: "sale" | "purchase";
  existing?: Invoice | null;
}

export function InvoiceForm({ mode, existing }: Props) {
  const navigate = useNavigate();
  const company = CompanyRepo.get();
  const isSale = mode === "sale";
  const repo = isSale ? SalesRepo : PurchaseRepo;
  const partyFilter = (p: Party) => isSale ? p.type !== "supplier" : p.type !== "customer";

  const [inv, setInv] = useState<Invoice>(() => existing ?? {
    id: "",
    number: nextInvoiceNumber(isSale ? company.invoicePrefix : company.purchasePrefix, repo.all()),
    date: today(),
    partyId: "",
    partyName: "",
    lineItems: [],
    subtotal: 0,
    discount: 0,
    taxAmount: 0,
    total: 0,
    paid: 0,
    paymentMode: "cash",
    createdAt: "",
    notes: "",
  });

  const parties = useMemo(() => PartyRepo.all().filter(partyFilter), []);
  const items = useMemo(() => ItemRepo.all(), []);
  const partyRef = useRef<HTMLInputElement>(null);
  const [partyQ, setPartyQ] = useState(existing?.partyName ?? "");
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyIdx, setPartyIdx] = useState(0);
  const partySuggests = parties.filter((p) => p.name.toLowerCase().includes(partyQ.toLowerCase())).slice(0, 8);

  useEffect(() => { partyRef.current?.focus(); }, []);

  const recalc = (lines: LineItem[], discount = inv.discount) => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const afterLineDisc = lines.reduce((s, l) => s + l.qty * l.price * (1 - l.discountPct / 100), 0);
    const taxAmount = lines.reduce((s, l) => s + (l.qty * l.price * (1 - l.discountPct / 100)) * (l.gstRate / 100), 0);
    const total = Math.max(0, afterLineDisc + taxAmount - discount);
    return { subtotal, taxAmount, total };
  };

  const selectParty = (p: Party) => {
    setInv({ ...inv, partyId: p.id, partyName: p.name });
    setPartyQ(p.name);
    setPartyOpen(false);
    setTimeout(() => document.getElementById("inv-date")?.focus(), 30);
  };

  const addLineItem = (it: Item) => {
    const line: LineItem = {
      id: genId(),
      itemId: it.id,
      name: it.name,
      qty: 1,
      unit: it.unit,
      price: isSale ? it.salePrice : it.purchasePrice,
      discountPct: 0,
      gstRate: it.gstRate,
      amount: 0,
    };
    line.amount = line.qty * line.price * (1 - line.discountPct / 100) * (1 + line.gstRate / 100);
    const lines = [...inv.lineItems, line];
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    const lines = inv.lineItems.map((l) => {
      if (l.id !== id) return l;
      const nl = { ...l, ...patch };
      nl.amount = nl.qty * nl.price * (1 - nl.discountPct / 100) * (1 + nl.gstRate / 100);
      return nl;
    });
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const removeLine = (id: string) => {
    const lines = inv.lineItems.filter((l) => l.id !== id);
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const setDiscount = (d: number) => setInv({ ...inv, discount: d, ...recalc(inv.lineItems, d) });

  const save = () => {
    if (!inv.partyId) { toast.error("Select a party"); partyRef.current?.focus(); return; }
    if (!inv.lineItems.length) { toast.error("Add at least one item"); return; }

    const stockDelta = isSale ? -1 : 1;
    for (const l of inv.lineItems) {
      const it = ItemRepo.get(l.itemId);
      if (it) ItemRepo.update(it.id, { stock: it.stock + stockDelta * l.qty } as any);
    }

    if (existing?.id) {
      repo.update(existing.id, inv);
      toast.success(`${isSale ? "Sale" : "Purchase"} updated`);
    } else {
      repo.add(inv as any);
      toast.success(`${isSale ? "Sale" : "Purchase"} saved`);
    }
    navigate({ to: isSale ? "/sales" : "/purchase" });
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); }
      if (e.key === "Escape") navigate({ to: isSale ? "/sales" : "/purchase" });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b bg-card flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">{isSale ? "New Sale" : "New Purchase"} — {inv.number}</h1>
          <p className="text-xs text-muted-foreground">Tab / Enter to move · Ctrl+S to save · Esc to cancel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: isSale ? "/sales" : "/purchase" })}>Cancel</Button>
          <Button size="sm" onClick={save}>Save <kbd className="ml-1 text-[10px]">Ctrl+S</kbd></Button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-auto flex-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-3">
          <div className="relative">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">{isSale ? "Customer *" : "Supplier *"}</span>
              <input
                ref={partyRef}
                value={partyQ}
                onChange={(e) => { setPartyQ(e.target.value); setPartyOpen(true); setPartyIdx(0); }}
                onFocus={() => setPartyOpen(true)}
                onBlur={() => setTimeout(() => setPartyOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setPartyIdx((i) => Math.min(partySuggests.length - 1, i + 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setPartyIdx((i) => Math.max(0, i - 1)); }
                  else if (e.key === "Enter") { e.preventDefault(); if (partySuggests[partyIdx]) selectParty(partySuggests[partyIdx]); }
                  else if (e.key === "Tab" && partySuggests[partyIdx] && !inv.partyId) { selectParty(partySuggests[partyIdx]); }
                }}
                className="h-8 px-2 border rounded bg-background focus:border-primary outline-none"
                placeholder="Type name…"
              />
            </label>
            {partyOpen && partySuggests.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 border rounded bg-popover shadow-md max-h-56 overflow-auto">
                {partySuggests.map((p, i) => (
                  <div key={p.id}
                    onMouseDown={(e) => { e.preventDefault(); selectParty(p); }}
                    className={`px-2 py-1.5 text-sm cursor-pointer ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`}>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.phone} {p.gstin}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field id="inv-date" label="Date" type="date" value={inv.date} onChange={(e) => setInv({ ...inv, date: e.target.value })} />
          <Field label={isSale ? "Invoice #" : "Bill #"} value={inv.number} onChange={(e) => setInv({ ...inv, number: e.target.value })} />
          <label className="flex flex-col gap-1 text-[12px]">
            <span className="text-muted-foreground font-medium">Payment Mode</span>
            <select value={inv.paymentMode} onChange={(e) => setInv({ ...inv, paymentMode: e.target.value as PaymentMode })} className="h-8 px-2 border rounded bg-background focus:border-primary outline-none">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="credit">Credit</option>
              <option value="cheque">Cheque</option>
            </select>
          </label>
        </div>

        {/* Line items */}
        <div className="border rounded-md bg-card">
          <div className="px-3 py-2 border-b bg-muted/50 font-semibold text-sm">Items</div>
          <table className="w-full text-[13px]">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr>
                <th className="text-left px-2 py-1.5">Item</th>
                <th className="text-right w-16 py-1.5">Qty</th>
                <th className="text-left w-16 py-1.5">Unit</th>
                <th className="text-right w-24 py-1.5">Price</th>
                <th className="text-right w-16 py-1.5">Disc%</th>
                <th className="text-right w-16 py-1.5">GST%</th>
                <th className="text-right w-28 py-1.5">Amount</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-2 py-1"><div className="font-medium">{l.name}</div></td>
                  <td className="py-1"><input type="number" value={l.qty} onChange={(e) => updateLine(l.id, { qty: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                  <td className="py-1"><input value={l.unit} onChange={(e) => updateLine(l.id, { unit: e.target.value })} className="w-full h-7 px-1.5 border rounded bg-background focus:border-primary outline-none" /></td>
                  <td className="py-1"><input type="number" value={l.price} onChange={(e) => updateLine(l.id, { price: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                  <td className="py-1"><input type="number" value={l.discountPct} onChange={(e) => updateLine(l.id, { discountPct: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                  <td className="py-1"><input type="number" value={l.gstRate} onChange={(e) => updateLine(l.id, { gstRate: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                  <td className="text-right px-2 py-1 font-medium">{fmtMoney(l.amount)}</td>
                  <td className="py-1"><button type="button" onClick={() => removeLine(l.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
              <ItemPickerRow items={items} onAdd={addLineItem} />
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Notes</span>
              <textarea value={inv.notes ?? ""} onChange={(e) => setInv({ ...inv, notes: e.target.value })}
                className="min-h-[80px] px-2 py-1.5 border rounded bg-background focus:border-primary outline-none" />
            </label>
          </div>
          <div className="border rounded-md bg-card p-3 space-y-1.5 text-sm">
            <Row label="Subtotal" value={fmtMoney(inv.subtotal)} />
            <Row label="Tax" value={fmtMoney(inv.taxAmount)} />
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">Extra Discount</span>
              <input type="number" value={inv.discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 h-7 px-2 text-right border rounded bg-background focus:border-primary outline-none" />
            </div>
            <div className="flex justify-between items-center gap-2 pt-1.5 border-t font-bold text-base">
              <span>Total</span><span>{fmtMoney(inv.total)}</span>
            </div>
            <div className="flex justify-between items-center gap-2 pt-1">
              <span className="text-muted-foreground">Paid</span>
              <input type="number" value={inv.paid} onChange={(e) => setInv({ ...inv, paid: parseFloat(e.target.value) || 0 })}
                className="w-24 h-7 px-2 text-right border rounded bg-background focus:border-primary outline-none" />
            </div>
            <Row label="Balance" value={fmtMoney(inv.total - inv.paid)} bold />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}

function ItemPickerRow({ items, onAdd }: { items: Item[]; onAdd: (i: Item) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggests = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()) || i.sku?.toLowerCase().includes(q.toLowerCase()) || i.barcode?.includes(q)).slice(0, 8);

  const pick = (it: Item) => {
    onAdd(it);
    setQ("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  return (
    <tr className="border-t bg-muted/30">
      <td colSpan={8} className="p-2 relative">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setIdx(0); }}
          onFocus={() => q && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(suggests.length - 1, i + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); if (suggests[idx]) pick(suggests[idx]); }
          }}
          placeholder="Search item to add… (Enter to select)"
          className="w-full h-8 px-2 border rounded bg-background focus:border-primary outline-none text-sm"
        />
        {open && suggests.length > 0 && (
          <div className="absolute z-20 top-full left-2 right-2 mt-1 border rounded bg-popover shadow-md max-h-56 overflow-auto">
            {suggests.map((it, i) => (
              <div key={it.id}
                onMouseDown={(e) => { e.preventDefault(); pick(it); }}
                className={`px-2 py-1.5 text-sm cursor-pointer flex justify-between ${i === idx ? "bg-accent" : "hover:bg-accent"}`}>
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.sku} · Stock: {it.stock} {it.unit}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{fmtMoney(it.salePrice)}</div>
                  <div className="text-xs text-muted-foreground">GST {it.gstRate}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}
