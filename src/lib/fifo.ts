import type { Invoice, Item, Return, StockAdjustment } from "@/types";

/**
 * What the stock cost — First In, First Out.
 *
 * The method Vyapar uses, and one of the two cost formulas AS 2 permits
 * (FIFO or weighted average). It replaces the rule this app had from its
 * first version: "the item's cost is the rate on its LAST purchase bill",
 * applied to every unit already on the shelf.
 *
 * That rule is what took a live shop's dashboard from sense to nonsense in
 * one save. A lump sum booked as 1 × ₹1,50,500 of "MIX HISAB" made all 120
 * units on the shelf — bought at ₹400–570 — worth ₹1,50,500 each: ₹1.8 crore
 * of stock that did not exist, and a ₹2.35 lakh "loss" on the next two
 * sales. Under FIFO that bill is ONE unit at ₹1,50,500 and nothing else.
 *
 * Nothing here is stored. Every figure is replayed from the documents
 * themselves, so an edited or deleted bill re-costs everything after it
 * automatically, and switching method touched no record in the database.
 *
 * The replay, per item, in date order:
 *
 *  · Opening stock is the first lot, before everything else.
 *  · A purchase adds a lot at its own net rate.
 *  · A sale takes units from the OLDEST lots first; what they cost is the
 *    line's cost of goods sold.
 *  · A sale return comes back at what that sale's units cost.
 *  · A purchase return goes back out of the lot it came in on, where that
 *    lot is still on the shelf.
 *  · Stock adjustments carry no rate in this app, so a unit found is valued
 *    at the average of what is on hand, and a unit written off leaves from
 *    the oldest lot, as a sale would.
 *
 * Selling what is not on the shelf — stock below zero, which this app allows
 * and which back-dated entry makes common — is costed provisionally at the
 * last known rate. When the stock that covers it arrives, that sale's cost is
 * CORRECTED to what those units really cost. Without the correction the
 * arriving rate would simply vanish: neither in a sale's cost nor on the
 * shelf. So every rupee that comes in ends up in exactly one place — sold,
 * written off, sent back, or still on the shelf — and the tests hold the
 * replay to that.
 */

/** Identifies one line of one document. Index, not line id: computed fresh
 *  each time, so it only has to be stable within one replay. */
export const lineKey = (docId: string, index: number) => `${docId}#${index}`;

export interface ItemValuation {
  /** Units the replay ends with. Matches item.stock when the books agree. */
  qty: number;
  /** What the units on hand cost, lot by lot. Below zero, the shortfall is
   *  negative at what those units were costed at. */
  value: number;
  /** The rate used when there is nothing on hand to take from. */
  lastCost: number;
}

export interface FifoResult {
  byItem: Map<string, ItemValuation>;
  /** Total cost of each sale line (all its units), by lineKey. */
  saleLineCost: Map<string, number>;
  /** Total cost of each sale-return line, by lineKey. */
  saleReturnLineCost: Map<string, number>;
  /** Cost that left by write-off or return to supplier — not cost of sales,
   *  but part of where the money went, so the books can be proved to add up. */
  otherOutCost: number;
  /** Everything that came in at cost: opening stock, purchases, stock found
   *  and sale returns. Always equals sales + otherOutCost + stock on hand. */
  inCost: number;
  /** What each stock adjustment moved, by its id: the cost of what was
   *  written off, or the value given to what was found. */
  adjustmentCost: Map<string, number>;
}

export interface FifoOptions {
  /**
   * Replay only up to a date — for "what was the stock worth then". The
   * opening of a period is everything strictly BEFORE its first day; its
   * closing is everything up to AND including its last.
   */
  cutoff?: { date: string; inclusive: boolean };
}

export interface FifoInput {
  items: Item[];
  purchases: Invoice[];
  sales: Invoice[];
  saleReturns: Return[];
  purchaseReturns: Return[];
  adjustments: StockAdjustment[];
}

interface Lot {
  qty: number;
  rate: number;
  /** The purchase it came in on, so a purchase return can find it. */
  from?: string;
}

/** Units that went out without being on the shelf, waiting to be covered. */
interface Shortfall {
  qty: number;
  /** The rate they were provisionally costed at. */
  rate: number;
  /** The sale line to correct when they are covered; absent for a write-off
   *  or a return to supplier. */
  saleKey?: string;
}

interface Ledger {
  lots: Lot[];
  short: Shortfall[];
  lastCost: number;
}

/** Last tie-break only, for entries with the same date AND the same entry
 *  time. Within a day the order is the order things were entered: a return
 *  made the same day as its sale must come after that sale to come back at
 *  its cost, and a sale typed before the purchase that stocked it is already
 *  set right by the shortfall correction. */
const Step = {
  Purchase: 0,
  SaleReturn: 1,
  Found: 2,
  Sale: 3,
  PurchaseReturn: 4,
  WrittenOff: 5,
} as const;

interface Event {
  date: string;
  createdAt: string;
  step: number;
  run: () => void;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
/** What one unit on a line actually cost, after its own discount. */
const netRate = (l: { price: number; discountPct?: number }) =>
  num(l.price) * (1 - Math.min(100, Math.max(0, num(l.discountPct))) / 100);

export function fifoCosts(input: FifoInput, opts: FifoOptions = {}): FifoResult {
  const { items, purchases, sales, saleReturns, purchaseReturns, adjustments } = input;
  const books = new Map<string, Ledger>();
  const saleLineCost = new Map<string, number>();
  const saleReturnLineCost = new Map<string, number>();
  let otherOutCost = 0;
  let inCost = 0;
  const adjustmentCost = new Map<string, number>();

  /* The rate opening stock was set up at. Opening stock is typed with no
     rate of its own, so it is the item's price as it stood before the first
     purchase rewrote it — which is exactly what that purchase's line
     snapshotted as `costPrice`. An item never purchased still has the price
     the shop gave it. */
  const firstPurchase = new Map<string, { at: string; cost: number; rate: number }>();
  for (const p of purchases) {
    for (const l of p.lineItems ?? []) {
      const seen = firstPurchase.get(l.itemId);
      const at = p.createdAt ?? "";
      if (!seen || at < seen.at) {
        firstPurchase.set(l.itemId, { at, cost: num(l.costPrice), rate: netRate(l) });
      }
    }
  }
  const openingRate = (it: Item) => {
    const fp = firstPurchase.get(it.id);
    if (!fp) return num(it.purchasePrice);
    return fp.cost > 0 ? fp.cost : fp.rate;
  };

  const ledgerOf = (itemId: string, fallbackRate = 0): Ledger => {
    let b = books.get(itemId);
    if (!b) {
      b = { lots: [], short: [], lastCost: fallbackRate };
      books.set(itemId, b);
    }
    return b;
  };

  const onHand = (b: Ledger) => b.lots.reduce((s, l) => s + l.qty, 0);
  const averageOnHand = (b: Ledger) => {
    const q = onHand(b);
    return q > 0 ? b.lots.reduce((s, l) => s + l.qty * l.rate, 0) / q : b.lastCost;
  };

  /**
   * Units in at `rate`. Any shortfall is covered first, oldest first — those
   * units were already sold, so what they really cost replaces the
   * provisional figure on the sale that sold them.
   */
  const receive = (b: Ledger, qty: number, rate: number, from?: string) => {
    inCost += qty * rate;
    let q = qty;
    while (q > 0 && b.short.length) {
      const s = b.short[0];
      const fill = Math.min(s.qty, q);
      const correction = fill * (rate - s.rate);
      if (s.saleKey) {
        saleLineCost.set(s.saleKey, r2((saleLineCost.get(s.saleKey) ?? 0) + correction));
      } else {
        otherOutCost += correction;
      }
      s.qty = r2(s.qty - fill);
      q = r2(q - fill);
      if (s.qty <= 0) b.short.shift();
    }
    if (q > 0) b.lots.push({ qty: q, rate, from });
  };

  /** Units out, oldest first. Returns what they cost. */
  const issue = (
    b: Ledger,
    qty: number,
    fallbackRate: number,
    opts: { preferFrom?: string; saleKey?: string } = {},
  ): number => {
    let need = qty;
    let cost = 0;
    const take = (lot: Lot) => {
      const t = Math.min(lot.qty, need);
      cost += t * lot.rate;
      lot.qty = r2(lot.qty - t);
      need = r2(need - t);
    };
    if (opts.preferFrom) {
      for (const lot of b.lots) {
        if (need <= 0) break;
        if (lot.from === opts.preferFrom) take(lot);
      }
    }
    for (const lot of b.lots) {
      if (need <= 0) break;
      take(lot);
    }
    b.lots = b.lots.filter((l) => l.qty > 0);
    if (need > 0) {
      const rate = b.lastCost > 0 ? b.lastCost : fallbackRate;
      cost += need * rate;
      b.short.push({ qty: need, rate, saleKey: opts.saleKey });
    }
    return cost;
  };

  const known = new Map(items.map((i) => [i.id, i] as const));
  for (const it of items) {
    const rate = openingRate(it);
    const b = ledgerOf(it.id, rate);
    const opening = num(it.openingStock);
    if (opening > 0) receive(b, opening, rate);
    // An opening below zero is a shortfall from the start.
    else if (opening < 0) {
      b.short.push({ qty: -opening, rate });
      otherOutCost += -opening * rate;
    }
  }
  /** Ledger for a line's item; an item since deleted starts from the line. */
  const bookFor = (itemId: string, lineCost: unknown) =>
    known.has(itemId) ? ledgerOf(itemId) : ledgerOf(itemId, num(lineCost));

  const events: Event[] = [];
  const at = (d: { date?: string; createdAt?: string }) => ({
    date: d.date ?? "",
    createdAt: d.createdAt ?? "",
  });

  for (const p of purchases) {
    (p.lineItems ?? []).forEach((l) => {
      const qty = num(l.qty);
      if (qty <= 0) return;
      events.push({
        ...at(p),
        step: Step.Purchase,
        run: () => {
          const b = bookFor(l.itemId, l.costPrice);
          const rate = netRate(l);
          b.lastCost = rate;
          receive(b, qty, rate, p.id);
        },
      });
    });
  }

  /* Which line of which bill sold an item, so a return can come back at what
     that sale's units cost — read at return time, after any correction the
     sale has had since. */
  const saleLineFor = new Map<string, { key: string; qty: number }>();
  for (const s of sales) {
    (s.lineItems ?? []).forEach((l, i) => {
      const qty = num(l.qty);
      if (qty <= 0) return;
      const key = lineKey(s.id, i);
      const ref = `${(s.number ?? "").trim()}|${l.itemId}`;
      if (!saleLineFor.has(ref)) saleLineFor.set(ref, { key, qty });
      events.push({
        ...at(s),
        step: Step.Sale,
        run: () => {
          const b = bookFor(l.itemId, l.costPrice);
          saleLineCost.set(key, r2(issue(b, qty, num(l.costPrice), { saleKey: key })));
        },
      });
    });
  }

  for (const r of saleReturns) {
    (r.lineItems ?? []).forEach((l, i) => {
      const qty = num(l.qty);
      if (qty <= 0) return;
      events.push({
        ...at(r),
        step: Step.SaleReturn,
        run: () => {
          const b = bookFor(l.itemId, l.costPrice);
          const sold = saleLineFor.get(`${(r.originalRef ?? "").trim()}|${l.itemId}`);
          const soldCost = sold ? saleLineCost.get(sold.key) : undefined;
          const rate =
            sold && soldCost !== undefined
              ? soldCost / sold.qty
              : onHand(b) > 0
                ? averageOnHand(b)
                : b.lastCost;
          saleReturnLineCost.set(lineKey(r.id, i), r2(qty * rate));
          receive(b, qty, rate);
        },
      });
    });
  }

  const purchaseIdByNumber = new Map(
    purchases.map((p) => [(p.number ?? "").trim(), p.id] as const),
  );
  for (const r of purchaseReturns) {
    (r.lineItems ?? []).forEach((l) => {
      const qty = num(l.qty);
      if (qty <= 0) return;
      events.push({
        ...at(r),
        step: Step.PurchaseReturn,
        run: () => {
          const b = bookFor(l.itemId, l.costPrice);
          otherOutCost += issue(b, qty, netRate(l), {
            preferFrom: purchaseIdByNumber.get((r.originalRef ?? "").trim()),
          });
        },
      });
    });
  }

  for (const a of adjustments) {
    const qty = num(a.qty);
    if (qty <= 0) continue;
    const found = a.type === "add";
    events.push({
      ...at(a),
      step: found ? Step.Found : Step.WrittenOff,
      run: () => {
        const b = bookFor(a.itemId, 0);
        if (found) {
          const rate = averageOnHand(b);
          adjustmentCost.set(a.id, r2(qty * rate));
          receive(b, qty, rate);
        } else {
          const cost = issue(b, qty, 0);
          adjustmentCost.set(a.id, r2(cost));
          otherOutCost += cost;
        }
      },
    });
  }

  events.sort(
    (x, y) =>
      x.date.localeCompare(y.date) || x.createdAt.localeCompare(y.createdAt) || x.step - y.step,
  );
  const cut = opts.cutoff;
  for (const e of events) {
    if (cut && (cut.inclusive ? e.date > cut.date : e.date >= cut.date)) break;
    e.run();
  }

  const byItem = new Map<string, ItemValuation>();
  for (const [id, b] of books) {
    const lotsValue = b.lots.reduce((s, l) => s + l.qty * l.rate, 0);
    const shortQty = b.short.reduce((s, x) => s + x.qty, 0);
    const shortValue = b.short.reduce((s, x) => s + x.qty * x.rate, 0);
    byItem.set(id, {
      qty: r2(onHand(b) - shortQty),
      value: r2(lotsValue - shortValue),
      lastCost: b.lastCost,
    });
  }
  return {
    byItem,
    saleLineCost,
    saleReturnLineCost,
    otherOutCost: r2(otherOutCost),
    inCost: r2(inCost),
    adjustmentCost,
  };
}

/** What all the stock was worth at a cutoff — the opening or closing stock of
 *  a period. Lot by lot, from the replay: so one period's closing is, to the
 *  paisa, the next one's opening. */
export function stockValueAt(input: FifoInput, cutoff?: FifoOptions["cutoff"]): number {
  const { byItem } = fifoCosts(input, { cutoff });
  let total = 0;
  for (const v of byItem.values()) total += v.value;
  return r2(total);
}

/**
 * What an item's stock is worth, for every screen that shows it.
 *
 * The replay's own figure when its count agrees with the item's stored
 * stock — which it does for every item in a healthy book. Where they
 * disagree, the stored count is what the shop sees on screen, so it is
 * valued at the replay's average rather than shown a value for a different
 * number of units.
 */
export function stockValueOf(item: Item, fifo: FifoResult | null | undefined): number {
  const stock = num(item.stock);
  const v = fifo?.byItem.get(item.id);
  if (!v) return r2(stock * num(item.purchasePrice));
  if (Math.abs(v.qty - stock) < 0.005) return v.value;
  const rate = v.qty > 0 ? v.value / v.qty : v.lastCost;
  return r2(stock * rate);
}

/** Average cost of one unit on hand — the figure to show beside a stock value. */
export function unitCostOf(item: Item, fifo: FifoResult | null | undefined): number {
  const stock = num(item.stock);
  const v = fifo?.byItem.get(item.id);
  if (!v) return num(item.purchasePrice);
  if (stock > 0) return r2(stockValueOf(item, fifo) / stock);
  return v.lastCost;
}
