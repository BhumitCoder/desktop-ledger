import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SaleReturnRepo } from "@/repositories";
import type { Return } from "@/types";
import { fmtMoney, fmtDate } from "@/lib/format";
import { Plus, CornerDownLeft, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sale-return/")({ component: SaleReturnPage });

function SaleReturnPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Return[]>([]);
  const refresh = () => setRows(SaleReturnRepo.all().sort((a, b) => b.date.localeCompare(a.date)));
  useEffect(refresh, []);

  const totalCredit = rows.reduce((s, r) => s + r.total, 0);

  const handleDelete = (r: Return) => {
    if (!confirm(`Delete return ${r.number}?`)) return;
    SaleReturnRepo.remove(r.id);
    refresh();
    toast.success("Sale return deleted");
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f6fa]">
      <div className="bg-white border-b px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-warning-soft text-warning flex items-center justify-center">
            <CornerDownLeft className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-gray-800">Sale Returns</h1>
            <p className="text-[12px] text-gray-400">{rows.length} credit notes · Total: {fmtMoney(totalCredit)}</p>
          </div>
        </div>
        <button onClick={() => navigate({ to: "/sale-return/new" })}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-warning text-white rounded-md text-sm font-semibold hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> New Sale Return
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 bg-white border-b z-10">
            <tr>
              {["Credit Note #", "Date", "Original Inv #", "Party", "Items", "GST", "Total", "Action"].map((h, i) => (
                <th key={h} className={`px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap bg-white ${i >= 4 ? "text-right" : "text-left"} ${h === "Action" ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-20 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No sale returns yet</p>
                <p className="text-xs mt-1">Click "New Sale Return" to create a credit note</p>
              </td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-warning/5 transition-colors group">
                <td className="px-4 py-3 font-mono font-semibold text-warning text-xs">{r.number}</td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(r.date)}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.originalRef || "—"}</td>
                <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{r.partyName}</td>
                <td className="px-4 py-3 text-right text-gray-500">{r.lineItems.length}</td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{r.gstEnabled ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right font-semibold text-warning tabular-nums">{fmtMoney(r.total)}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(r)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Total ({rows.length} returns)
                </td>
                <td className="px-4 py-3 text-right font-bold text-warning tabular-nums text-sm">{fmtMoney(totalCredit)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
