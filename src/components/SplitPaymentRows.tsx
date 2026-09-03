import { useMemo } from "react";
import { Plus, X } from "lucide-react";
import type { BankAccount, PaymentMode, PaymentSplit } from "@/types";
import { MODE_LABELS } from "@/lib/paymentMode";
import { NEEDS_ACCOUNT, splitProblems } from "@/lib/paymentSplit";
import { fmtMoney } from "@/lib/format";
import { NumInput } from "@/components/NumInput";

/** Credit is the absence of payment, so it is not a way of paying part of
 *  something. The rest are, and each says where the money ended up. */
const SPLITTABLE: PaymentMode[] = ["cash", "bank", "upi", "cheque"];

/**
 * "₹4,000 cash and ₹6,000 into HDFC" — the rows that say so.
 *
 * Deliberately NOT a dialog, and deliberately not always on screen. Most
 * bills are settled one way, and that path keeps its single row of pills with
 * nothing added to it; splitting is one click away and opens in place. A
 * modal would put a context switch in the middle of the fastest screen in the
 * app, and staff work around anything that does that.
 *
 * Shared rather than written per form, because a bill, a receipt and an
 * expense have to mean the same thing by the same rules — the moment one of
 * them counts a row differently, the books stop agreeing with each other.
 */
export function SplitPaymentRows({
  rows,
  onChange,
  total,
  banks,
  label = "Amount received",
}: {
  rows: PaymentSplit[];
  onChange: (rows: PaymentSplit[]) => void;
  /** What the rows must add up to. */
  total: number;
  banks: BankAccount[];
  label?: string;
}) {
  const problems = useMemo(() => splitProblems(rows, total), [rows, total]);
  const assigned = rows.reduce((n, r) => n + (r.amount || 0), 0);
  const left = Math.round((total - assigned) * 100) / 100;

  const set = (i: number, patch: Partial<PaymentSplit>) =>
    onChange(rows.map((r, n) => (n === i ? { ...r, ...patch } : r)));

  const add = () =>
    onChange([
      ...rows,
      // Opens holding what is still unaccounted for, because that is almost
      // always the amount being typed next.
      { mode: "cash", amount: Math.max(0, left) },
    ]);

  return (
    <div className="rounded-md border bg-muted/30 p-2.5 space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-1.5">
          <select
            value={r.mode}
            onChange={(e) => {
              const mode = e.target.value as PaymentMode;
              // Dropping to a mode that names no account must not leave the
              // old account attached, or the money lands somewhere it never
              // went.
              set(i, { mode, bankId: NEEDS_ACCOUNT.includes(mode) ? r.bankId : undefined });
            }}
            aria-label={`How part ${i + 1} was paid`}
            className="h-8 px-2 border rounded-md bg-background text-[12px] outline-none focus:border-primary"
          >
            {SPLITTABLE.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>

          {NEEDS_ACCOUNT.includes(r.mode) && (
            <select
              value={r.bankId ?? ""}
              onChange={(e) => set(i, { bankId: e.target.value || undefined })}
              aria-label={`Which account part ${i + 1} went to`}
              className="h-8 px-2 border rounded-md bg-background text-[12px] outline-none focus:border-primary min-w-[7rem]"
            >
              <option value="">Choose account…</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <NumInput
            value={r.amount}
            onValue={(n) => set(i, { amount: n })}
            aria-label={`Amount for part ${i + 1}`}
            className="h-8 w-28 px-2 text-right border rounded-md bg-background text-[12px] tabular-nums outline-none focus:border-primary"
          />

          <button
            type="button"
            onClick={() => onChange(rows.filter((_, n) => n !== i))}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            title="Remove this part"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add another
        </button>
        {/* What is still unaccounted for, in the direction it is wrong. The
            save refuses on the same figure, but nobody should have to press
            Save to find out they are ₹500 short. */}
        {Math.abs(left) > 0.005 && (
          <span className="text-[11px] font-semibold text-destructive tabular-nums">
            {left > 0 ? `${fmtMoney(left)} not accounted for` : `${fmtMoney(-left)} over`}
          </span>
        )}
      </div>

      {problems.length > 0 && (
        <ul className="text-[11px] text-destructive space-y-0.5 pt-0.5">
          {problems.map((p) => (
            <li key={p.message}>{p.message}</li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-muted-foreground">
        {label} is {fmtMoney(total)} — the parts must add up to it.
      </p>
    </div>
  );
}
