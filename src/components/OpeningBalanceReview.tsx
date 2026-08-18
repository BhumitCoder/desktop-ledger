import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Check } from "lucide-react";
import { PartyRepo, CompanyRepo } from "@/repositories";
import { newBatch, commitBatch } from "@/repositories/base";
import { useRepoMemo } from "@/hooks/useRepoData";
import { fmtMoney } from "@/lib/format";
import type { Company } from "@/types";

/**
 * One-off review of existing parties' opening balances.
 *
 * An opening balance carries its direction in its SIGN: positive means the
 * party owes you (Receivable), negative means you owe them (Payable). The
 * party form used to express that as a single signed number, so a supplier's
 * opening typed without the minus quietly landed in Receivable — the amount
 * was right, the side was wrong, and nothing on screen said so. The form now
 * asks the direction explicitly, but records entered before that are still
 * sitting on whichever side they were saved to.
 *
 * This lists every party holding an opening balance and shows which side it
 * currently counts on, so the owner can flip any that are wrong. It changes
 * ONLY the sign of `openingBalance` — no bill, payment or ledger entry is
 * touched, and everything else re-derives from the documents as usual.
 *
 * Owner-only, and dismissible: once the books are checked, "Hide this tool"
 * sets a flag on the company record and it stops appearing.
 */
export function OpeningBalanceReview({ onHidden }: { onHidden: () => void }) {
  const parties = useRepoMemo(() => PartyRepo.all());
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      parties
        .filter((p) => (p.openingBalance ?? 0) !== 0)
        .sort((a, b) => Math.abs(b.openingBalance ?? 0) - Math.abs(a.openingBalance ?? 0)),
    [parties],
  );

  /** Side this party's opening will count on once pending flips are applied. */
  const sideOf = (id: string, raw: number) => {
    const value = flipped.has(id) ? -raw : raw;
    return value > 0 ? "receivable" : "payable";
  };

  const toggle = (id: string) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const apply = async () => {
    if (!flipped.size) {
      toast.info("Nothing marked to change");
      return;
    }
    setSaving(true);
    try {
      const batch = newBatch();
      for (const p of rows) {
        if (!flipped.has(p.id)) continue;
        PartyRepo.updateBatched(batch, p.id, { openingBalance: -(p.openingBalance ?? 0) });
      }
      await commitBatch(batch, "opening balance corrections");
      toast.success(`Corrected ${flipped.size} opening balance${flipped.size === 1 ? "" : "s"}`);
      setFlipped(new Set());
    } finally {
      setSaving(false);
    }
  };

  const hide = () => {
    if (
      !confirm(
        "Hide this tool? You can bring it back by clearing 'openingReviewDone' in a backup restore — it is only meant to be used once.",
      )
    )
      return;
    const c: Company = { ...CompanyRepo.get(), openingReviewDone: true };
    CompanyRepo.save(c);
    toast.success("Opening balance review hidden");
    onHidden();
  };

  return (
    <div className="p-5">
      <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 mb-4">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <p className="text-amber-900">
          An opening balance sits on one side or the other:{" "}
          <span className="font-semibold">Receivable</span> (they owe you) or{" "}
          <span className="font-semibold">Payable</span> (you owe them). Older records were entered
          as a single signed number, so some may have been saved to the wrong side — the amount
          right, the side wrong. Check the list and flip any that are the wrong way round. This
          changes nothing except that side.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No party has an opening balance — nothing to review.
        </p>
      ) : (
        <div className="border border-gray-100 rounded-md overflow-hidden">
          {rows.map((p) => {
            const raw = p.openingBalance ?? 0;
            const side = sideOf(p.id, raw);
            const changed = flipped.has(p.id);
            return (
              <div
                key={p.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 border-b border-gray-100 last:border-b-0 ${changed ? "bg-primary-soft" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.phone || "No phone"}</p>
                </div>
                <p className="tabular-nums text-sm font-semibold shrink-0">
                  {fmtMoney(Math.abs(raw))}
                </p>
                <div className="inline-flex rounded-md border border-gray-200 overflow-hidden shrink-0">
                  <span
                    className={`h-8 px-3 flex items-center text-xs font-semibold ${
                      side === "receivable" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    }`}
                  >
                    {side === "receivable" ? "They owe me" : "I owe them"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="h-8 px-3 text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 transition"
                  >
                    Flip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <Button type="button" onClick={apply} disabled={saving || !flipped.size}>
          <Check className="h-3.5 w-3.5" />
          {saving
            ? "Applying…"
            : `Apply ${flipped.size || ""} change${flipped.size === 1 ? "" : "s"}`}
        </Button>
        <Button type="button" variant="outline" onClick={hide} disabled={saving}>
          Hide this tool
        </Button>
      </div>
    </div>
  );
}
