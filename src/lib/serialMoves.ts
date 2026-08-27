/**
 * What saving a bill does to the individual units on it.
 *
 * Worked out as a plan first and applied second, for the same reason
 * planStockRepair and planYearClose are: these writes are not reversible by
 * looking at them afterwards, and a function that decides and writes in one
 * pass can only be tested by writing.
 *
 * The state machine, in full — only a document moves a serial, and nothing
 * edits `status` directly:
 *
 *     (new) ──purchase──► in_stock ──sale──► sold
 *                            ▲  │              │
 *          purchase return   │  │ damage       │ sale return
 *                            │  ▼              │
 *               returned_to_vendor  damaged    │
 *                            ▲                 │
 *                            └─────────────────┘
 */

import type { Invoice, Item, Serial } from "@/types";
import { warrantyEnd, isDraftSerial, draftSerialText } from "@/lib/serials";

/** A serial to bring into existence, because a purchase received it. */
export interface SerialCreate {
  /** The draft id it had on the form, so the saved line can be rewritten to
   *  point at the real record. */
  draftId: string;
  serial: string;
  itemId: string;
}

/** A change to a serial that already exists. */
export interface SerialUpdate {
  id: string;
  patch: Partial<Serial>;
}

export interface SerialPlan {
  create: SerialCreate[];
  update: SerialUpdate[];
  /** Units that were on the bill before this save and are not on it now. */
  release: SerialUpdate[];
}

const emptyPlan = (): SerialPlan => ({ create: [], update: [], release: [] });

/**
 * Everything a purchase does to its units.
 *
 * Receiving stamps where the unit came from — vendor, date, and what THIS one
 * cost. That last field is why profit becomes exact rather than averaged, and
 * it is also the shop's evidence when claiming a faulty unit back.
 */
export function planPurchaseSerials(
  inv: Invoice,
  previous: Invoice | null | undefined,
  itemOf: (id: string) => Item | undefined,
): SerialPlan {
  const plan = emptyPlan();
  const nowOn = new Set<string>();

  for (const l of inv.lineItems) {
    const item = itemOf(l.itemId);
    if (!item?.trackSerials) continue;
    const costEach = l.qty > 0 ? Math.round((l.price || 0) * 100) / 100 : 0;

    for (const id of l.serialIds ?? []) {
      nowOn.add(id);
      const stamp: Partial<Serial> = {
        status: "in_stock",
        purchaseId: inv.id,
        purchaseDate: inv.date,
        vendorId: inv.partyId,
        vendorName: inv.partyName,
        cost: costEach,
        vendorWarrantyEnd: warrantyEnd(inv.date, item.vendorWarrantyMonths),
      };
      if (isDraftSerial(id)) {
        plan.create.push({ draftId: id, serial: draftSerialText(id), itemId: l.itemId });
      } else {
        // An existing record still on the bill: restamp it, because the date,
        // the vendor or the price may all have been corrected on this edit.
        plan.update.push({ id, patch: stamp });
      }
    }
  }

  /* Units that were received on this bill and have been taken off it. They
     never arrived, so they stop existing as stock — but only if nobody has
     sold them in the meantime. The caller refuses the save in that case; this
     just reports what would move. */
  for (const l of previous?.lineItems ?? []) {
    for (const id of l.serialIds ?? []) {
      if (nowOn.has(id) || isDraftSerial(id)) continue;
      plan.release.push({ id, patch: { voidedAt: new Date().toISOString() } as Partial<Serial> });
    }
  }
  return plan;
}

/**
 * Everything a sale does to its units.
 *
 * The warranty months are copied onto the serial HERE, at the moment of sale,
 * and never read from the item again. Changing an item's policy tomorrow must
 * not rewrite a promise already made to a customer holding a bill.
 */
export function planSaleSerials(
  inv: Invoice,
  previous: Invoice | null | undefined,
  itemOf: (id: string) => Item | undefined,
): SerialPlan {
  const plan = emptyPlan();
  const nowOn = new Set<string>();

  for (const l of inv.lineItems) {
    const item = itemOf(l.itemId);
    if (!item?.trackSerials) continue;
    for (const id of l.serialIds ?? []) {
      nowOn.add(id);
      plan.update.push({
        id,
        patch: {
          status: "sold",
          saleId: inv.id,
          saleDate: inv.date,
          customerId: inv.partyId,
          customerName: inv.partyName,
          warrantyMonths: item.warrantyMonths,
          warrantyEnd: warrantyEnd(inv.date, item.warrantyMonths),
        },
      });
    }
  }

  // Taken off the bill on an edit: back on the shelf, and the customer's
  // details cleared — they never had it.
  for (const l of previous?.lineItems ?? []) {
    for (const id of l.serialIds ?? []) {
      if (nowOn.has(id)) continue;
      plan.release.push({ id, patch: releaseToStock() });
    }
  }
  return plan;
}

/**
 * Put a unit back on the shelf, forgetting who had it.
 *
 * Written once and shared by the edit path, the void path and sale returns,
 * because "back in stock" has to mean the same thing in all three. Leaving a
 * customer's name on a unit that is back on the shelf is how a warranty
 * lookup ends up naming the wrong person.
 */
export function releaseToStock(): Partial<Serial> {
  return {
    status: "in_stock",
    saleId: undefined,
    saleDate: undefined,
    customerId: undefined,
    customerName: undefined,
    warrantyMonths: undefined,
    warrantyEnd: undefined,
  };
}

/**
 * What removing a document does to the units on it.
 *
 * Deleting and voiding need exactly the same serial movements — the document
 * stops counting either way — so they share one answer. Two copies would
 * drift, and the drift would be silent until a shelf count went wrong.
 */
export function undoSerialsOf(
  inv: { lineItems: { itemId: string; serialIds?: string[] }[] },
  kind: "sale" | "purchase" | "sale-return" | "purchase-return",
  itemOf: (id: string) => Item | undefined,
): SerialUpdate[] {
  const out: SerialUpdate[] = [];
  for (const l of inv.lineItems) {
    if (!itemOf(l.itemId)?.trackSerials) continue;
    for (const id of l.serialIds ?? []) {
      switch (kind) {
        case "sale":
          // The customer never had it: back on the shelf, and forgotten.
          out.push({ id, patch: releaseToStock() });
          break;
        case "purchase":
          // It never arrived. Marked rather than deleted, like every other
          // cancellation here — and refused outright by the caller if it has
          // since been sold.
          out.push({ id, patch: { voidedAt: new Date().toISOString() } as Partial<Serial> });
          break;
        case "sale-return":
          // The unit did NOT come back after all, so it is with the customer
          // again. Who that is gets restored from the original sale by the
          // caller, which is the only place that knows it.
          out.push({ id, patch: { status: "sold" } });
          break;
        case "purchase-return":
          // It was not sent back to the vendor after all.
          out.push({ id, patch: { status: "in_stock" } });
          break;
      }
    }
  }
  return out;
}

/**
 * Units received on a purchase that have since been sold.
 *
 * A purchase cannot be removed or edited out from under them: the unit is in
 * a customer's hands, and the shop's record of where it came from is the only
 * thing that lets them claim it back from the vendor.
 */
export function soldSerialsOf(inv: Invoice, serials: Serial[], onlyIds?: Set<string>): Serial[] {
  const ids = new Set(inv.lineItems.flatMap((l) => l.serialIds ?? []));
  return serials.filter(
    (s) => ids.has(s.id) && s.status === "sold" && (!onlyIds || onlyIds.has(s.id)),
  );
}
