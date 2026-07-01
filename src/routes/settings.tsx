import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { CompanyRepo } from "@/repositories";
import { Field } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { Company } from "@/types";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const [c, setC] = useState<Company>(() => CompanyRepo.get());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    CompanyRepo.save(c);
    toast.success("Settings saved");
  };

  const exportData = () => {
    const keys = ["bz.parties", "bz.items", "bz.sales", "bz.purchases", "bz.expenses", "bz.banks", "bz.company"];
    const dump: any = {};
    keys.forEach((k) => { dump[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bizdesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const clearAll = () => {
    if (!confirm("Delete all data? This cannot be undone.")) return;
    ["bz.parties", "bz.items", "bz.sales", "bz.purchases", "bz.expenses", "bz.banks", "bz.bankTxns", "bz.payments"].forEach((k) => localStorage.removeItem(k));
    toast.success("All data cleared");
    setTimeout(() => location.reload(), 500);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" subtitle="Company & preferences" />
      <div className="p-4 space-y-6 overflow-auto max-w-3xl">
        <form onSubmit={save} className="border rounded-md bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">Company Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Company Name *" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></div>
            <Field label="GSTIN" value={c.gstin ?? ""} onChange={(e) => setC({ ...c, gstin: e.target.value.toUpperCase() })} />
            <Field label="Phone" value={c.phone ?? ""} onChange={(e) => setC({ ...c, phone: e.target.value })} />
            <Field label="Email" value={c.email ?? ""} onChange={(e) => setC({ ...c, email: e.target.value })} />
            <Field label="Currency" value={c.currency} onChange={(e) => setC({ ...c, currency: e.target.value.toUpperCase() })} />
            <Field label="Invoice Prefix" value={c.invoicePrefix} onChange={(e) => setC({ ...c, invoicePrefix: e.target.value })} />
            <Field label="Purchase Prefix" value={c.purchasePrefix} onChange={(e) => setC({ ...c, purchasePrefix: e.target.value })} />
            <div className="col-span-2"><Field label="Address" value={c.address ?? ""} onChange={(e) => setC({ ...c, address: e.target.value })} /></div>
          </div>
          <div className="mt-3 flex justify-end"><Button type="submit">Save <kbd className="ml-1 text-[10px]">Ctrl+S</kbd></Button></div>
        </form>

        <div className="border rounded-md bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">Data</h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={exportData}>Export Backup (JSON)</Button>
            <Button type="button" variant="destructive" onClick={clearAll}>Clear All Data</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">All data is stored in browser localStorage. Backend APIs can replace repositories later without UI changes.</p>
        </div>

        <div className="border rounded-md bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {[
              ["Ctrl+F", "Global search"], ["Ctrl+N", "New sale"], ["Ctrl+P", "New purchase"],
              ["Ctrl+S", "Save form"], ["Alt+1..8", "Jump to module"], ["N", "New record (in list)"],
              ["Tab / Enter", "Next field"], ["Shift+Tab", "Previous field"], ["Esc", "Close dialog / cancel"],
              ["↑ ↓", "Navigate rows / suggestions"], ["Enter", "Open / select"], ["Ctrl+Delete", "Delete row"],
            ].map(([k, l]) => (
              <div key={k} className="flex justify-between border-b py-1"><kbd>{k}</kbd><span className="text-muted-foreground">{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
