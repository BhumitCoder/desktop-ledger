import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import {
  PartyRepo, ItemRepo, SalesRepo, PurchaseRepo, CompanyRepo, nextInvoiceNumber,
} from "@/repositories";
import type { Invoice, LineItem, Party, Item, PaymentMode } from "@/types";
import { fmtMoney, today } from "@/lib/format";
import { toast } from "sonner";
import { Trash2, UserPlus, Save, X, Printer, FileText, Receipt, Pencil, Check } from "lucide-react";
import { PrintableInvoice } from "@/components/PrintableInvoice";
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
  const partyFilter = (p: Party) => (isSale ? p.type !== "supplier" : p.type !== "customer");

  const [inv, setInv] = useState<Invoice>(() => existing ?? {
    id: "",
    number: nextInvoiceNumber(isSale ? company.invoicePrefix : company.purchasePrefix, repo.all()),
    date: today(),
    partyId: "",
    partyName: "",
    partyPhone: "",
    gstEnabled: company.enableGst !== false,
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

  const gstOn = inv.gstEnabled !== false;

  const [allParties, setAllParties] = useState(() => PartyRepo.all());
  const parties = useMemo(() => allParties.filter(partyFilter), [allParties]);
  const items = useMemo(() => ItemRepo.all(), []);
  const partyRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [partyQ, setPartyQ] = useState(existing?.partyName ?? "");
  const [phoneQ, setPhoneQ] = useState(existing?.partyPhone ?? "");
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyIdx, setPartyIdx] = useState(0);
  const [numberEditing, setNumberEditing] = useState(false);
  const numberRef = useRef<HTMLInputElement>(null);

  const partySuggests = useMemo(() => {
    const q = partyQ.trim().toLowerCase();
    const pq = phoneQ.trim();
    if (!q && !pq) return [];
    return parties
      .filter((p) =>
        (q && p.name.toLowerCase().includes(q)) ||
        (pq && (p.phone ?? "").includes(pq))
      )
      .slice(0, 8);
  }, [partyQ, phoneQ, parties]);

  useEffect(() => { partyRef.current?.focus(); }, []);

  const recalc = (lines: LineItem[], discount = inv.discount, gst = gstOn) => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const afterLineDisc = lines.reduce((s, l) => s + l.qty * l.price * (1 - l.discountPct / 100), 0);
    const taxAmount = gst
      ? lines.reduce((s, l) => s + (l.qty * l.price * (1 - l.discountPct / 100)) * (l.gstRate / 100), 0)
      : 0;
    const total = Math.max(0, afterLineDisc + taxAmount - discount);
    return { subtotal, taxAmount, total };
  };

  const selectParty = (p: Party) => {
    setInv({ ...inv, partyId: p.id, partyName: p.name, partyPhone: p.phone ?? "" });
    setPartyQ(p.name);
    setPhoneQ(p.phone ?? "");
    setPartyOpen(false);
    setTimeout(() => document.getElementById("inv-date")?.focus(), 30);
  };

  const clearParty = () => {
    setInv({ ...inv, partyId: "", partyName: "", partyPhone: "" });
    setPartyQ("");
    setPhoneQ("");
    setTimeout(() => partyRef.current?.focus(), 30);
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
    const gstMult = gstOn ? (1 + line.gstRate / 100) : 1;
    line.amount = line.qty * line.price * (1 - line.discountPct / 100) * gstMult;
    const lines = [...inv.lineItems, line];
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    const lines = inv.lineItems.map((l) => {
      if (l.id !== id) return l;
      const nl = { ...l, ...patch };
      const gstMult = gstOn ? (1 + nl.gstRate / 100) : 1;
      nl.amount = nl.qty * nl.price * (1 - nl.discountPct / 100) * gstMult;
      return nl;
    });
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const removeLine = (id: string) => {
    const lines = inv.lineItems.filter((l) => l.id !== id);
    setInv({ ...inv, lineItems: lines, ...recalc(lines) });
  };

  const setDiscount = (d: number) => setInv({ ...inv, discount: d, ...recalc(inv.lineItems, d) });

  const toggleGst = () => {
    const newGst = !gstOn;
    const lines = inv.lineItems.map((l) => {
      const gstMult = newGst ? (1 + l.gstRate / 100) : 1;
      return { ...l, amount: l.qty * l.price * (1 - l.discountPct / 100) * gstMult };
    });
    setInv({ ...inv, gstEnabled: newGst, lineItems: lines, ...recalc(lines, inv.discount, newGst) });
  };

  const save = () => {
    // Resolve or auto-create party
    let partyId = inv.partyId;
    let partyName = inv.partyName || partyQ.trim();
    const phone = phoneQ.trim();

    if (!partyId) {
      if (!partyName && !phone) {
        toast.error("Enter customer name or phone");
        partyRef.current?.focus();
        return;
      }
      // Try match by phone first (unique), then by name
      const byPhone = phone ? allParties.find((p) => (p.phone ?? "").trim() === phone) : null;
      const byName = partyName ? allParties.find((p) => p.name.toLowerCase() === partyName.toLowerCase()) : null;
      const existingParty = byPhone ?? byName;

      if (existingParty) {
        partyId = existingParty.id;
        partyName = existingParty.name;
      } else {
        // Auto-create
        const newParty: Party = {
          id: genId(),
          name: partyName || `Party ${phone}`,
          type: isSale ? "customer" : "supplier",
          phone,
          openingBalance: 0,
          createdAt: new Date().toISOString(),
        };
        PartyRepo.add(newParty);
        setAllParties(PartyRepo.all());
        partyId = newParty.id;
        partyName = newParty.name;
        toast.success(`New ${isSale ? "customer" : "supplier"} added: ${partyName}`);
      }
    }

    if (!inv.lineItems.length) { toast.error("Add at least one item"); return; }

    const finalInv: Invoice = { ...inv, partyId, partyName, partyPhone: phone };

    const stockDelta = isSale ? -1 : 1;
    for (const l of finalInv.lineItems) {
      const it = ItemRepo.get(l.itemId);
      if (it) ItemRepo.update(it.id, { stock: it.stock + stockDelta * l.qty } as any);
    }

    if (existing?.id) {
      repo.update(existing.id, finalInv);
      toast.success(`${isSale ? "Sale" : "Purchase"} updated`);
    } else {
      repo.add(finalInv as any);
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
      {/* Header */}
      <div className="px-4 md:px-5 py-3 border-b bg-card flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-10 w-10 rounded-md flex items-center justify-center ${isSale ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
            {isSale ? <Receipt className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight leading-tight">
              {existing ? "Edit" : "New"} {isSale ? "Sale Invoice" : "Purchase Bill"}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">{inv.number}</span> · Tab/Enter to move · Ctrl+S save · Esc cancel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* GST toggle */}
          <label className="flex items-center gap-2 h-9 px-3 rounded-md border bg-background cursor-pointer select-none">
            <input type="checkbox" checked={gstOn} onChange={toggleGst} className="accent-primary" />
            <span className="text-[12px] font-semibold">GST Bill</span>
          </label>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: isSale ? "/sales" : "/purchase" })}>
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={save} className="bg-primary text-primary-foreground">
            <Save className="h-3.5 w-3.5" /> Save
            <kbd className="ml-1 text-[10px] opacity-80">Ctrl+S</kbd>
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-4 overflow-auto flex-1 bg-muted/30">
        {/* Party + meta */}
        <div className="bg-card border rounded-lg shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isSale ? "Customer Details" : "Supplier Details"}
            </span>
            {inv.partyId ? (
              <span className="text-[11px] inline-flex items-center gap-1 text-success font-medium bg-success-soft px-2 py-0.5 rounded">
                ✓ Existing {isSale ? "customer" : "supplier"}
              </span>
            ) : (partyQ || phoneQ) ? (
              <span className="text-[11px] inline-flex items-center gap-1 text-primary font-medium bg-primary-soft px-2 py-0.5 rounded">
                <UserPlus className="h-3 w-3" /> Will auto-create on save
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <label className="flex flex-col gap-1 text-[12px]">
                <span className="text-muted-foreground font-medium">
                  {isSale ? "Customer Name" : "Supplier Name"} *
                </span>
                <div className="flex gap-1">
                  <input
                    ref={partyRef}
                    value={partyQ}
                    onChange={(e) => {
                      setPartyQ(e.target.value);
                      setPartyOpen(true);
                      setPartyIdx(0);
                      if (inv.partyId) setInv({ ...inv, partyId: "", partyName: e.target.value });
                    }}
                    onFocus={() => setPartyOpen(true)}
                    onBlur={() => setTimeout(() => setPartyOpen(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setPartyIdx((i) => Math.min(partySuggests.length - 1, i + 1)); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setPartyIdx((i) => Math.max(0, i - 1)); }
                      else if (e.key === "Enter") {
                        e.preventDefault();
                        if (partySuggests[partyIdx]) selectParty(partySuggests[partyIdx]);
                        else phoneRef.current?.focus();
                      }
                    }}
                    className="h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none flex-1"
                    placeholder="Type name or search…"
                  />
                  {inv.partyId && (
                    <button type="button" onClick={clearParty}
                      className="h-9 w-9 rounded-md border bg-background hover:bg-accent text-muted-foreground flex items-center justify-center"
                      title="Clear">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </label>
              {partyOpen && partySuggests.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-elevated max-h-64 overflow-auto">
                  {partySuggests.map((p, i) => (
                    <div key={p.id}
                      onMouseDown={(e) => { e.preventDefault(); selectParty(p); }}
                      className={`px-3 py-2 text-sm cursor-pointer ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`}>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.phone && <>📞 {p.phone}</>}{p.phone && p.gstin && " · "}{p.gstin && <>GSTIN: {p.gstin}</>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Phone Number</span>
              <input
                ref={phoneRef}
                value={phoneQ}
                onChange={(e) => {
                  const v = e.target.value;
                  setPhoneQ(v);
                  if (inv.partyId) setInv({ ...inv, partyId: "", partyPhone: v });
                  // Auto-match by phone (10 digits)
                  if (v.length >= 10) {
                    const match = allParties.find((p) => (p.phone ?? "").trim() === v.trim());
                    if (match) selectParty(match);
                  }
                }}
                className="h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none"
                placeholder="10-digit phone (auto-match)"
                inputMode="numeric"
              />
            </label>

            <Field id="inv-date" label="Bill Date" type="date"
              value={inv.date}
              onChange={(e) => setInv({ ...inv, date: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">{isSale ? "Invoice #" : "Bill #"}</span>
              <div className="flex items-center gap-1">
                {numberEditing ? (
                  <>
                    <input
                      ref={numberRef}
                      value={inv.number}
                      onChange={(e) => setInv({ ...inv, number: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setNumberEditing(false); }}
                      className="h-9 px-3 border-2 border-primary rounded-md bg-background focus:outline-none font-mono font-semibold text-primary flex-1"
                    />
                    <button type="button" onClick={() => setNumberEditing(false)}
                      className="h-9 w-9 flex items-center justify-center rounded-md border bg-success-soft text-success hover:opacity-80 transition flex-shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="h-9 px-3 border rounded-md bg-muted flex items-center font-mono font-semibold text-muted-foreground flex-1">
                      {inv.number}
                    </div>
                    <button type="button"
                      onClick={() => { setNumberEditing(true); setTimeout(() => numberRef.current?.focus(), 30); }}
                      className="h-9 w-9 flex items-center justify-center rounded-md border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition flex-shrink-0"
                      title="Edit invoice number">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">Auto-generated · click ✎ to edit</span>
            </div>

            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Payment Mode</span>
              <select value={inv.paymentMode}
                onChange={(e) => setInv({ ...inv, paymentMode: e.target.value as PaymentMode })}
                className="h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </label>

            <Field label="Paid Amount" type="number" value={inv.paid || ""}
              onChange={(e) => setInv({ ...inv, paid: parseFloat(e.target.value) || 0 })}
              placeholder="0" />
          </div>
        </div>

        {/* Line items */}
        <div className="border rounded-lg bg-card shadow-card overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
            <span className="text-[13px] font-semibold">Items ({inv.lineItems.length})</span>
            <span className="text-[11px] text-muted-foreground">Type in search row to add items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[720px]">
              <thead className="text-[11px] text-muted-foreground uppercase tracking-wider">
                <tr className="bg-muted/40">
                  <th className="text-left px-3 py-2 w-8">#</th>
                  <th className="text-left px-3 py-2">Item</th>
                  <th className="text-right w-20 py-2">Qty</th>
                  <th className="text-left w-20 py-2">Unit</th>
                  <th className="text-right w-24 py-2">Price</th>
                  <th className="text-right w-20 py-2">Disc%</th>
                  {gstOn && <th className="text-right w-20 py-2">GST%</th>}
                  <th className="text-right w-28 py-2 pr-3">Amount</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {inv.lineItems.map((l, idx) => (
                  <tr key={l.id} className="border-t hover:bg-accent/30">
                    <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{idx + 1}</td>
                    <td className="px-3 py-1.5"><div className="font-medium">{l.name}</div></td>
                    <td className="py-1.5"><input type="number" value={l.qty} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => updateLine(l.id, { qty: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                    <td className="py-1.5"><input value={l.unit} onChange={(e) => updateLine(l.id, { unit: e.target.value })} className="w-full h-7 px-1.5 border rounded bg-background focus:border-primary outline-none" /></td>
                    <td className="py-1.5"><input type="number" value={l.price} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => updateLine(l.id, { price: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                    <td className="py-1.5"><input type="number" value={l.discountPct} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => updateLine(l.id, { discountPct: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>
                    {gstOn && <td className="py-1.5"><input type="number" value={l.gstRate} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => updateLine(l.id, { gstRate: parseFloat(e.target.value) || 0 })} className="w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none" /></td>}
                    <td className="text-right px-3 py-1.5 font-semibold tabular-nums">{fmtMoney(l.amount)}</td>
                    <td className="py-1.5"><button type="button" onClick={() => removeLine(l.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
                <ItemPickerRow items={items} onAdd={addLineItem} gstOn={gstOn} />
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals + notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border rounded-lg shadow-card p-4">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium uppercase text-[11px] tracking-wider">Notes / Terms</span>
              <textarea value={inv.notes ?? ""} onChange={(e) => setInv({ ...inv, notes: e.target.value })}
                placeholder="Add any note or terms & conditions…"
                className="min-h-[100px] px-3 py-2 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none" />
            </label>
          </div>
          <div className="border rounded-lg bg-card shadow-card p-4 space-y-2 text-sm">
            <Row label="Subtotal" value={fmtMoney(inv.subtotal)} />
            {gstOn && <Row label="Tax (GST)" value={fmtMoney(inv.taxAmount)} />}
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">Extra Discount</span>
              <input type="number" value={inv.discount || ""} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-28 h-8 px-2 text-right border rounded-md bg-background focus:border-primary outline-none tabular-nums" />
            </div>
            <div className="flex justify-between items-center gap-2 pt-2 mt-1 border-t font-bold text-lg">
              <span>Total</span>
              <span className="tabular-nums text-primary">{fmtMoney(inv.total)}</span>
            </div>
            <Row label="Paid" value={fmtMoney(inv.paid)} />
            <div className="flex justify-between items-center gap-2 pt-1 font-semibold">
              <span>Balance Due</span>
              <span className={`tabular-nums ${inv.total - inv.paid > 0 ? "text-destructive" : "text-success"}`}>
                {fmtMoney(Math.max(0, inv.total - inv.paid))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <PrintableInvoice inv={inv} company={company} mode={mode} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function ItemPickerRow({ items, onAdd, gstOn }: { items: Item[]; onAdd: (i: Item) => void; gstOn: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggests = items.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase()) ||
    i.sku?.toLowerCase().includes(q.toLowerCase()) ||
    i.barcode?.includes(q)
  ).slice(0, 8);

  const pick = (it: Item) => {
    onAdd(it);
    setQ("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const colSpan = gstOn ? 9 : 8;

  return (
    <tr className="border-t bg-primary-soft/40">
      <td colSpan={colSpan} className="p-2 relative">
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
          placeholder="🔍  Search item by name, SKU, or barcode… (Enter to add)"
          className="w-full h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none text-sm"
        />
        {open && suggests.length > 0 && (
          <div className="absolute z-20 top-full left-2 right-2 mt-1 border rounded-md bg-popover shadow-elevated max-h-64 overflow-auto">
            {suggests.map((it, i) => (
              <div key={it.id}
                onMouseDown={(e) => { e.preventDefault(); pick(it); }}
                className={`px-3 py-2 text-sm cursor-pointer flex justify-between ${i === idx ? "bg-accent" : "hover:bg-accent"}`}>
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">{it.sku ?? "—"} · Stock: {it.stock} {it.unit}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{fmtMoney(it.salePrice)}</div>
                  {gstOn && <div className="text-[11px] text-muted-foreground">GST {it.gstRate}%</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}
