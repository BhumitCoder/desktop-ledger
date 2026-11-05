/**
 * How a payment's amount and the bills it settles move together while it is
 * being entered or corrected.
 *
 * The standard shape (Vyapar's Payment-In/Out, Tally's bill-wise payment): a
 * payment has ONE amount. Some or all of it is linked to bills; whatever is
 * not linked is an advance on the party's account. Correcting a payment means
 * correcting that amount, and the links follow — not re-typing every bill.
 *
 * Kept here, apart from the dialog, so each rule can be proved on its own.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface BillLink {
  /** What the bill still owes before this payment touches it. */
  due: number;
  /** Cash from this payment applied to the bill. */
  apply: number;
  /** Written off on the bill by this payment. */
  discount: number;
}

/**
 * A discount typed on a bill, with the cash on it making room.
 *
 * Ticking a bill fills its whole due as cash, so a discount typed after that
 * had no room left and was capped to ₹0 — a 100% write-off on a ticked bill
 * silently did nothing. A discount is a decision about the bill; the cash
 * amount gives way to it, never the other way round.
 */
export function withDiscount(link: BillLink, discount: number): BillLink {
  const due = Math.max(0, r2(link.due));
  const d = Math.min(due, Math.max(0, r2(discount)));
  return { due: link.due, discount: d, apply: Math.min(r2(link.apply), r2(due - d)) };
}

/**
 * Link `extra` more of the payment to its bills, oldest first, filling what
 * each still owes after the cash and write-off already on it. Returns the new
 * cash per bill; anything that will not fit stays an advance.
 *
 * The rows must be oldest first, which is how the dialog lists them.
 */
export function linkOldestFirst(links: BillLink[], extra: number): number[] {
  let left = Math.max(0, r2(extra));
  return links.map((l) => {
    const room = Math.max(0, r2(l.due - l.apply - l.discount));
    const add = Math.min(room, left);
    left = r2(left - add);
    return r2(l.apply + add);
  });
}

/**
 * Take `excess` back off the bills, newest first, until the cash linked fits
 * the payment's amount. Write-offs are left alone: they were their own
 * decision, and the amount being corrected is the cash.
 */
export function trimNewestFirst(links: BillLink[], excess: number): number[] {
  let left = Math.max(0, r2(excess));
  const out = links.map((l) => r2(l.apply));
  for (let i = out.length - 1; i >= 0 && left > 0; i--) {
    const take = Math.min(out[i], left);
    out[i] = r2(out[i] - take);
    left = r2(left - take);
  }
  return out;
}
