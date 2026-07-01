import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PaymentRepo, PartyRepo } from "@/repositories";
import type { Payment, PaymentMode } from "@/types";
import { fmtMoney, fmtDate, today } from "@/lib/format";
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { genId } from "@/repositories/base";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/payments")({ component: PaymentsPage });

type Tab = "all" | "in" | "out";

function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState<"in" | "out">("in");

  const refresh = () => setRows(PaymentRepo.all().sort((a, b) => b.date.localeCompare(a.date)));
  useEffect(refresh, []);

  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.type !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.partyName.toLowerCase().includes(q) && !(r.ref ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalIn = rows.filter((r) => r.type === "in").reduce((s, r) => s + r.amount, 0);
  const totalOut = rows.filter((r) => r.type === "out").reduce((s, r) => s + r.amount, 0);
  const net = totalIn - totalOut;

  const openForm = (type: "in" | "out") => { setFormType(type); setOpen(true); };

  const handleDelete = (r: Payment) => {
    if (!confirm(`Delete this payment record?`)) return;
    PaymentRepo.remove(r.id);
    refresh();
    toast.success("Payment deleted");
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f6fa]">
      {/* Header */}
      <div className="bg-white border-b px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-gray-800">Payments</h1>
            <p className="text-[12px] text-gray-400">{rows.length} records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openForm("in")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-success text-white rounded-md text-sm font-semibold hover:opacity-90 transition">
            <ArrowDownCircle className="h-4 w-4" /> Payment In
          </button>
          <button onClick={() => openForm("out")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-destructive text-white rounded-md text-sm font-semibold hover:opacity-90 transition">
            <ArrowUpCircle className="h-4 w-4" /> Payment Out
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-0 bg-white border-b">
        <div className="px-5 py-3.5 border-r border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Received (In)</p>
          <p className="text-[20px] font-bold tabular-nums text-emerald-600">{fmtMoney(totalIn)}</p>
        </div>
        <div className="px-5 py-3.5 border-r border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Paid (Out)</p>
          <p className="text-[20px] font-bold tabular-nums text-rose-600">{fmtMoney(totalOut)}</p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Net Cash Flow</p>
          <p className={`text-[20px] font-bold tabular-nums ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmtMoney(net)}</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white border-b px-5 py-2 flex items-center gap-4">
        <div className="flex items-center gap-1">
          {(["all", "in", "out"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${tab === t ? (t === "in" ? "bg-emerald-50 text-emerald-700" : t === "out" ? "bg-rose-50 text-rose-700" : "bg-gray-100 text-gray-700") : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
              {t === "all" ? "All" : t === "in" ? "Payment In" : "Payment Out"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1.5 bg-white flex-1 max-w-xs ml-auto">
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party, reference…"
            className="text-xs flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
          {search && <button onClick={() => setSearch("")}><X className="h-3 w-3 text-gray-400 hover:text-gray-600" /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              {["Date", "Type", "Party", "Mode", "Reference", "Amount", "Action"].map((h) => (
                <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap bg-white ${h === "Amount" ? "text-right" : h === "Action" ? "text-center" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-20 text-gray-400">
                <Wallet className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No payments recorded</p>
                <p className="text-xs mt-1">Use the buttons above to record a Payment In or Payment Out</p>
              </td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group">
                <td className="px-4 py-3 text-gray-600">{fmtDate(r.date)}</td>
                <td className="px-4 py-3">
                  {r.type === "in"
                    ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><ArrowDownCircle className="h-3 w-3" /> IN</span>
                    : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"><ArrowUpCircle className="h-3 w-3" /> OUT</span>}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{r.partyName}</td>
                <td className="px-4 py-3 text-gray-500 capitalize text-xs">{r.mode}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.ref || "—"}</td>
                <td className={`px-4 py-3 text-right font-bold tabular-nums text-sm ${r.type === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                  {r.type === "out" ? "−" : "+"}{fmtMoney(r.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(r)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">
                  {filtered.length} record{filtered.length > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sm text-gray-800">
                  {fmtMoney(filtered.reduce((s, r) => s + (r.type === "in" ? r.amount : -r.amount), 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <PaymentFormDialog open={open} onOpenChange={setOpen} type={formType} onSaved={refresh} />
    </div>
  );
}

function PaymentFormDialog({
  open, onOpenChange, type, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; type: "in" | "out"; onSaved: () => void }) {
  const firstRef = useRef<HTMLInputElement>(null);
  const allParties = PartyRepo.all();
  const [form, setForm] = useState({ date: today(), partyId: "", partyName: "", amount: "", mode: "cash" as PaymentMode, ref: "" });
  const [partyQ, setPartyQ] = useState("");
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyIdx, setPartyIdx] = useState(0);

  const suggests = partyQ.trim()
    ? allParties.filter((p) => p.name.toLowerCase().includes(partyQ.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => { if (open) { setForm({ date: today(), partyId: "", partyName: "", amount: "", mode: "cash", ref: "" }); setPartyQ(""); setTimeout(() => firstRef.current?.focus(), 50); } }, [open]);

  const selectParty = (p: { id: string; name: string }) => {
    setForm((f) => ({ ...f, partyId: p.id, partyName: p.name }));
    setPartyQ(p.name); setPartyOpen(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const partyName = form.partyName || partyQ.trim();
    if (!partyName) { toast.error("Party name is required"); return; }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }

    let partyId = form.partyId;
    if (!partyId) {
      const match = allParties.find((p) => p.name.toLowerCase() === partyName.toLowerCase());
      partyId = match?.id ?? genId();
      if (!match) PartyRepo.add({ id: partyId, name: partyName, type: "both", openingBalance: 0, createdAt: new Date().toISOString() });
    }

    const payment: Payment = {
      id: genId(), date: form.date, partyId, partyName,
      type, amount: Math.round(amount * 100) / 100,
      mode: form.mode, ref: form.ref.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    PaymentRepo.add(payment);
    toast.success(`Payment ${type === "in" ? "received" : "sent"} recorded`);
    onSaved();
    onOpenChange(false);
  };

  const isIn = type === "in";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIn
              ? <><ArrowDownCircle className="h-4 w-4 text-emerald-600" /> Payment In (Received)</>
              : <><ArrowUpCircle className="h-4 w-4 text-rose-600" /> Payment Out (Paid)</>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3 mt-1">
          {/* Party */}
          <div className="relative">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">{isIn ? "Received From" : "Paid To"} *</span>
              <input ref={firstRef} value={partyQ}
                onChange={(e) => { setPartyQ(e.target.value); setPartyOpen(true); setPartyIdx(0); if (form.partyId) setForm((f) => ({ ...f, partyId: "", partyName: e.target.value })); }}
                onFocus={() => setPartyOpen(true)}
                onBlur={() => setTimeout(() => setPartyOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setPartyIdx((i) => Math.min(suggests.length - 1, i + 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setPartyIdx((i) => Math.max(0, i - 1)); }
                  else if (e.key === "Enter") { e.preventDefault(); if (suggests[partyIdx]) selectParty(suggests[partyIdx]); }
                }}
                className="h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none"
                placeholder="Type party name…" />
            </label>
            {partyOpen && suggests.length > 0 && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-lg max-h-40 overflow-auto">
                {suggests.map((p, i) => (
                  <div key={p.id} onMouseDown={(e) => { e.preventDefault(); selectParty(p); }}
                    className={`px-3 py-2 text-sm cursor-pointer ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`}>
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <div className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Amount (₹) *</span>
              <input type="number" value={form.amount} min={0} step="0.01"
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={`h-8 px-2 border rounded bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold text-right ${isIn ? "text-emerald-700" : "text-rose-700"}`}
                placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Payment Mode</span>
              <select value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as PaymentMode }))}
                className="h-8 px-2 border rounded bg-background focus:border-primary outline-none">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </label>
            <Field label="Reference / Note" value={form.ref} onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))} placeholder="Cheque #, UPI ref…" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className={isIn ? "bg-success text-white hover:opacity-90" : "bg-destructive text-white hover:opacity-90"}>
              {isIn ? <><ArrowDownCircle className="h-3.5 w-3.5 mr-1" /> Record Receipt</> : <><ArrowUpCircle className="h-3.5 w-3.5 mr-1" /> Record Payment</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
