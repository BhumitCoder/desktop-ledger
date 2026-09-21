/**
 * The papers a shop writes before it writes a bill.
 *
 * A customer asks what a phone would cost — that is a quotation. They say yes
 * but want it next week — a sales order. The goods go out on Tuesday and the
 * bill follows on Friday — a delivery challan. The same thing runs backwards
 * with the distributor: a purchase order, then a goods receipt note.
 *
 * Phase 7 of docs/ERP-PLAN.md. All five are the same shape and the same state
 * machine, decided here rather than five times over in five screens, because
 * the two rules that matter are rules about stock and getting either wrong
 * costs the shop real goods.
 *
 * **Stock moves once.** On the challan or the GRN if there is one, and on the
 * invoice otherwise — never on both, and never on a quotation or an order. A
 * quotation is a price on a piece of paper; nothing has moved.
 *
 * **A reservation is not a stock movement.** An order promises goods that are
 * still on the shelf. Subtracting it from stock would make the shelf lie about
 * what is physically there, which is the number a stock-take is checked
 * against. It is a separate figure, and only `available` subtracts it.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Which paper this is. */
export type DocStage = "quotation" | "salesOrder" | "deliveryChallan" | "purchaseOrder" | "grn";

/**
 * Where a document has got to.
 *
 * `partly` exists because half a delivery is the normal case, not an edge: a
 * distributor sends six of the ten cartons and the rest follow. A document
 * that could only be open or done would force the shop to lie in one
 * direction or the other.
 */
export type DocStatus = "open" | "partly" | "converted" | "cancelled" | "expired";

/** What a stage does to stock, and to the promises made about it. */
export interface StageSpec {
  label: string;
  /** Plural, for a screen's title. */
  plural: string;
  /** Which way goods physically move when this document is issued. */
  stock: "none" | "out" | "in";
  /** What it promises without moving anything. */
  reserves: "none" | "out" | "in";
  /** What this becomes next, or null where the chain ends in a bill. */
  next: DocStage | null;
  /** The bill this chain ends at, once there is nothing left to convert. */
  ends: "sale" | "purchase";
  /** Prefix for the document number. */
  prefix: string;
}

const SPECS: Record<DocStage, StageSpec> = {
  /* Nothing has been agreed, so nothing is promised and nothing has moved.
     A quotation that reserved stock would let one browsing customer empty the
     shelf for everyone else. */
  quotation: {
    label: "Quotation",
    plural: "Quotations",
    stock: "none",
    reserves: "none",
    next: "salesOrder",
    ends: "sale",
    prefix: "QT-",
  },
  /* Agreed but not collected. The goods are still on the shelf — they are
     simply spoken for. */
  salesOrder: {
    label: "Sales Order",
    plural: "Sales Orders",
    stock: "none",
    reserves: "out",
    next: "deliveryChallan",
    ends: "sale",
    prefix: "SO-",
  },
  /* The goods leave the shop here, bill or no bill. This is the point stock
     moves, and the invoice that follows must not move it again. */
  deliveryChallan: {
    label: "Delivery Challan",
    plural: "Delivery Challans",
    stock: "out",
    reserves: "none",
    next: null,
    ends: "sale",
    prefix: "DC-",
  },
  /* Ordered from the distributor. Nothing has arrived, so nothing is on the
     shelf — but the shop has committed to it, which is worth showing. */
  purchaseOrder: {
    label: "Purchase Order",
    plural: "Purchase Orders",
    stock: "none",
    reserves: "in",
    next: "grn",
    ends: "purchase",
    prefix: "PO-",
  },
  /* The goods are physically here and countable, whatever the invoice is
     doing. */
  grn: {
    label: "Goods Receipt",
    plural: "Goods Receipts",
    stock: "in",
    reserves: "none",
    next: null,
    ends: "purchase",
    prefix: "GRN-",
  },
};

export const stageSpec = (stage: DocStage): StageSpec => SPECS[stage];
export const ALL_STAGES = Object.keys(SPECS) as DocStage[];

/** The minimum a document has to be for these rules to apply. */
export interface WorkDocLike {
  id: string;
  stage: DocStage;
  status: DocStatus;
  /** Set once it has become the next thing, so nothing converts twice. */
  convertedToId?: string;
  /** Expiry, for a quotation whose price is no longer good. */
  validUntil?: string;
  /* `lineItems`, not `lines`: every other document in this app calls them
     that, and a module that invented a second name for the same thing would
     be one adapter away from a screen that forgot to write it. Optional
     because a stored record can arrive without it, and a blank bill form is
     worse than a document that reports moving nothing. */
  lineItems?: { itemId: string; baseQty?: number; qty: number }[];
}

/**
 * Whether this document may still become the next one.
 *
 * Cancelled and already-converted are obvious. `partly` is the one worth
 * naming: a half-delivered order still has goods owing, so it stays
 * convertible, and a screen that treated it as finished would strand them.
 */
export function canConvert(doc: Pick<WorkDocLike, "stage" | "status">): boolean {
  if (doc.status === "cancelled" || doc.status === "converted") return false;
  // Expired is not a refusal: the shop may still honour an old quotation. It
  // is a warning, and the screen says so — the decision belongs to a person.
  return true;
}

/** What a quotation past its date should read as, without rewriting it. */
export function effectiveStatus(
  doc: Pick<WorkDocLike, "status" | "validUntil">,
  today: string,
): DocStatus {
  if (doc.status !== "open") return doc.status;
  if (doc.validUntil && doc.validUntil < today) return "expired";
  return "open";
}

/** A line's quantity in base units — the same rule the rest of the app uses. */
const baseOf = (l: { baseQty?: number; qty: number }) => {
  const stored = Number(l.baseQty);
  if (Number.isFinite(stored) && stored !== 0) return stored;
  return Number(l.qty) || 0;
};

/**
 * What this document does to the number on the shelf.
 *
 * Positive is in, negative is out, and an empty map means it does not touch
 * stock at all — which is the answer for three of the five stages and the
 * reason a quotation cannot quietly cost the shop goods.
 *
 * A cancelled document does nothing, and a converted one still counts: a
 * challan whose invoice has been written already moved those goods, and the
 * invoice must not move them a second time.
 */
export function stockEffect(doc: WorkDocLike): Map<string, number> {
  const out = new Map<string, number>();
  const spec = SPECS[doc.stage];
  if (spec.stock === "none" || doc.status === "cancelled") return out;
  const sign = spec.stock === "in" ? 1 : -1;
  for (const l of doc.lineItems ?? []) {
    out.set(l.itemId, r2((out.get(l.itemId) ?? 0) + sign * baseOf(l)));
  }
  return out;
}

/**
 * Goods promised but not yet moved, per item.
 *
 * Outgoing only — an unfilled sales order is what makes a shelf figure
 * misleading, because the goods are there and already sold. An incoming
 * purchase order is counted separately by `onOrder`: adding it here would
 * make "available" include goods that are still at the distributor, which is
 * the one number a cashier must never be shown as sellable.
 */
export function reservedOut(docs: WorkDocLike[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const doc of docs) {
    const spec = SPECS[doc.stage];
    if (spec.reserves !== "out") continue;
    if (doc.status === "cancelled" || doc.status === "converted") continue;
    for (const l of doc.lineItems ?? [])
      out.set(l.itemId, r2((out.get(l.itemId) ?? 0) + baseOf(l)));
  }
  return out;
}

/** Goods ordered from a supplier and not yet received. Shown, never sellable. */
export function onOrder(docs: WorkDocLike[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const doc of docs) {
    const spec = SPECS[doc.stage];
    if (spec.reserves !== "in") continue;
    if (doc.status === "cancelled" || doc.status === "converted") continue;
    for (const l of doc.lineItems ?? [])
      out.set(l.itemId, r2((out.get(l.itemId) ?? 0) + baseOf(l)));
  }
  return out;
}

/**
 * What the counter can actually sell today.
 *
 * Stock less what is already spoken for. Never less than what is physically
 * there in the other direction: over-reserving is a paperwork problem, and
 * showing a negative here would have a cashier refuse a sale for goods that
 * are in their hand.
 */
export function availableQty(stock: number, reserved: number): number {
  return r2(Math.max(0, (Number(stock) || 0) - Math.max(0, Number(reserved) || 0)));
}

/**
 * The lines to carry forward when a document becomes the next one.
 *
 * Quantities already converted are subtracted, so converting the remainder of
 * a half-delivered order offers what is still owing rather than the whole
 * order again — which would double the delivery, and on a GRN would double
 * the stock.
 */
export function remainingLines<T extends { itemId: string; baseQty?: number; qty: number }>(
  lines: T[],
  alreadyDone: Map<string, number>,
): T[] {
  const left = new Map(alreadyDone);
  const out: T[] = [];
  for (const l of lines) {
    const done = left.get(l.itemId) ?? 0;
    const base = baseOf(l);
    if (done <= 0) {
      out.push(l);
      continue;
    }
    if (done >= base) {
      left.set(l.itemId, r2(done - base));
      continue;
    }
    /* Part of this line has gone. What is offered is the remainder, and the
       ratio is applied to the typed quantity too so the unit it was written
       in survives the conversion. */
    const share = (base - done) / base;
    out.push({ ...l, qty: r2((Number(l.qty) || 0) * share), baseQty: r2(base - done) });
    left.set(l.itemId, 0);
  }
  return out;
}

/**
 * What a document's status becomes once `done` of it has been converted.
 *
 * Kept here so five screens cannot each invent their own idea of "finished".
 */
export function statusAfterConversion(doc: WorkDocLike, done: Map<string, number>): DocStatus {
  if (doc.status === "cancelled") return "cancelled";
  const owed = new Map<string, number>();
  for (const l of doc.lineItems ?? [])
    owed.set(l.itemId, r2((owed.get(l.itemId) ?? 0) + baseOf(l)));
  let anyLeft = false;
  let anyDone = false;
  for (const [itemId, qty] of owed) {
    const d = done.get(itemId) ?? 0;
    if (d > 0) anyDone = true;
    if (d < qty) anyLeft = true;
  }
  if (!anyDone) return doc.status === "partly" ? "partly" : "open";
  return anyLeft ? "partly" : "converted";
}
