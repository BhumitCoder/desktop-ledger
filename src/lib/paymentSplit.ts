/**
 * Where a document's money actually went.
 *
 * A bill can be settled ₹4,000 in cash and ₹6,000 into HDFC. Until splits
 * existed there was no way to say that: a document carried one `paymentMode`,
 * so the counter had to either name the wrong mode or invent a second
 * document that never happened.
 *
 * This module is the seam and nothing more. Every place that decides "was
 * this cash or bank" reads through `splitsOf`, and for a document with no
 * splits it returns the single row that document's existing fields already
 * imply — so introducing it changes no figure anywhere. The UI that can
 * create a second row comes later, and deliberately: `modeFlows` in
 * lib/ledger.ts drops any bill touching a bank from cash on hand, so a split
 * created before that is fixed would book the bank half correctly and lose
 * the cash half. See docs/SPLIT-PAYMENT-PLAN.md.
 */

import type { Expense, Invoice, Payment, PaymentMode, PaymentSplit } from "@/types";

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A mode whose money lands in a named account rather than the drawer. */
export const NEEDS_ACCOUNT: PaymentMode[] = ["bank", "upi", "cheque"];

/**
 * The rows a document was settled with.
 *
 * `amount` is what the DOCUMENT ITSELF attributed at the time it was saved.
 * It is deliberately not net of later Payment allocations: `paid` can grow
 * after billing when a receipt is allocated to this invoice, and that money
 * belongs to the Payment record which carries its own mode. Callers that care
 * about the difference already subtract it (see `paidViaPayments`), and doing
 * it here would subtract it twice.
 *
 * Legacy documents return exactly one row, chosen to match what the readers
 * do today rather than what would be tidiest:
 *
 *  - a bank-attributed invoice reports `bankPaidAmount`, because that is the
 *    figure the bank ledger and bankRepair have always used, and it can be
 *    less than `paid`
 *  - anything else reports the whole amount under its own mode
 */
export function splitsOf(
  doc:
    | (Pick<Invoice, "paid" | "paymentMode"> &
        Partial<Pick<Invoice, "bankId" | "bankPaidAmount" | "paidSplits">>)
    | (Pick<Payment, "amount" | "mode"> & Partial<Pick<Payment, "bankId" | "splits">>)
    | (Pick<Expense, "amount" | "paymentMode"> & Partial<Pick<Expense, "bankId" | "splits">>),
): PaymentSplit[] {
  const d = doc as Record<string, unknown>;

  const stored = (d.paidSplits ?? d.splits) as PaymentSplit[] | undefined;
  if (stored?.length) return stored;

  const mode = (d.paymentMode ?? d.mode) as PaymentMode | undefined;
  if (!mode) return [];
  // Nothing was settled, so there is nothing to attribute. A credit bill is
  // the ordinary case; a zero-paid cash bill is the same thing.
  const total = r2(Number(d.paid ?? d.amount) || 0);
  if (mode === "credit" || total <= 0) return [];

  const bankId = d.bankId as string | undefined;
  if (bankId) {
    const attributed = r2(Number(d.bankPaidAmount ?? total) || 0);
    if (attributed <= 0) return [];
    return [{ mode, amount: attributed, bankId }];
  }
  return [{ mode, amount: total }];
}

/** The part that went into the drawer. */
export function cashPart(doc: Parameters<typeof splitsOf>[0]): number {
  return r2(
    splitsOf(doc)
      .filter((s) => s.mode === "cash")
      .reduce((n, s) => n + (s.amount || 0), 0),
  );
}

/** What each named account received, keyed by bank id. Rows with a mode that
 *  needs an account but carry none are excluded — they are the legacy
 *  "unassigned" money the daybook already buckets, and pretending they landed
 *  somewhere would put a figure on a real account that never arrived. */
export function bankParts(doc: Parameters<typeof splitsOf>[0]): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of splitsOf(doc)) {
    if (!s.bankId) continue;
    out.set(s.bankId, r2((out.get(s.bankId) ?? 0) + (s.amount || 0)));
  }
  return out;
}

/** Money settled under a mode that names no account — the pre-existing
 *  "unassigned" bucket, kept visible rather than quietly dropped. */
export function unassignedPart(doc: Parameters<typeof splitsOf>[0]): number {
  return r2(
    splitsOf(doc)
      .filter((s) => !s.bankId && NEEDS_ACCOUNT.includes(s.mode))
      .reduce((n, s) => n + (s.amount || 0), 0),
  );
}

export interface SplitProblem {
  message: string;
}

/**
 * Why a set of rows cannot be saved.
 *
 * The rows must add up to the amount, and the document will not save
 * otherwise — the same rule serials use, for the same reason: the moment a
 * document can disagree with itself, every figure derived from it is a guess
 * and the shop keeps trading on it.
 */
export function splitProblems(rows: PaymentSplit[], total: number): SplitProblem[] {
  const out: SplitProblem[] = [];
  if (!rows.length) return out;

  rows.forEach((s, i) => {
    if (!(s.amount > 0)) out.push({ message: `Row ${i + 1}: enter an amount` });
    if (NEEDS_ACCOUNT.includes(s.mode) && !s.bankId)
      out.push({ message: `Row ${i + 1}: choose which account the ${s.mode} money went to` });
    if (s.mode === "credit")
      out.push({ message: `Row ${i + 1}: credit is what is left unpaid, not a way of paying` });
  });

  const sum = r2(rows.reduce((n, s) => n + (s.amount || 0), 0));
  // Half a paisa of float dust is not a disagreement.
  if (Math.abs(sum - r2(total)) > 0.005)
    out.push({
      message: `The rows add up to ${sum.toFixed(2)} but the amount received is ${r2(total).toFixed(2)}`,
    });

  return out;
}
