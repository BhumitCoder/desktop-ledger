/**
 * Individual physical units of an item, tracked by their serial number.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * ONE ITEM, MANY SERIALS
 * ───────────────────────────────────────────────────────────────────────────
 * The shop buys adapters by the box and sells them one at a time, and every
 * unit carries a serial the customer's warranty is written against. The
 * tempting shape — one catalogue item per adapter — is the wrong one, and the
 * reason is worth keeping next to the code rather than only in the plan:
 * every item's stock would be 1 or 0, so a reorder level would mean nothing,
 * and the shop could never again be told it is running low.
 *
 * So: one item, and a Serial record per physical unit under it.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * THE RULE THIS FILE EXISTS TO ENFORCE
 * ───────────────────────────────────────────────────────────────────────────
 * For a serialised item, stock is NOT the stored `item.stock` number. It is
 * the count of serials on hand:
 *
 *     stock = COUNT(serials WHERE itemId = X AND status = "in_stock")
 *
 * `item.stock` is one of only two stored running totals in this application,
 * and lib/dataRepair.ts exists because it drifts. For serialised items that
 * whole class of bug disappears, because there is only one source and nothing
 * for it to disagree with.
 *
 * Ten files read `item.stock`. They all go through `stockOf()` rather than
 * each remembering the rule — the same lesson Repository.all() taught when
 * voiding arrived: filtering at the source made 216 call sites correct at
 * once, and "remember to check" is not a mechanism.
 */

import type { Item, Serial } from "@/types";
import { SerialRepo } from "@/repositories";

/** Whether this item's stock is counted in serials rather than stored. */
export const isSerialised = (item: { trackSerials?: boolean } | undefined | null): boolean =>
  !!item?.trackSerials;

/**
 * itemId → how many of its serials are on the shelf.
 *
 * Built once and passed down by any screen that renders a list. Without it a
 * list of 2,000 items would scan every serial 2,000 times; with it the whole
 * page costs one pass.
 */
export function inStockCounts(serials: Serial[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of serials) {
    if (s.status !== "in_stock") continue;
    counts.set(s.itemId, (counts.get(s.itemId) ?? 0) + 1);
  }
  return counts;
}

/**
 * What this item's stock actually is.
 *
 * Pass `counts` when rendering a list (see `inStockCounts`); leave it off for
 * a single item and it reads the repository directly.
 *
 * A serialised item with no serials is 0 — not `item.stock`. Falling back to
 * the stored number would be the worst of both: a figure nothing maintains,
 * shown as though something did.
 */
export function stockOf(item: Item, counts?: Map<string, number>): number {
  if (!isSerialised(item)) return Number(item.stock) || 0;
  if (counts) return counts.get(item.id) ?? 0;
  return SerialRepo.all().filter((s) => s.itemId === item.id && s.status === "in_stock").length;
}

/** Every serial of one item, newest first. */
export function serialsOf(itemId: string, serials?: Serial[]): Serial[] {
  const all = serials ?? SerialRepo.all();
  return all
    .filter((s) => s.itemId === itemId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/**
 * Find a serial by the string printed on the unit.
 *
 * Scoped to the item, because uniqueness is per item and not global: two
 * manufacturers can legitimately stamp the same string, and a global rule
 * would refuse a genuine unit with no way to explain why. Matching ignores
 * case and surrounding space — a scanner sometimes adds one, and "f2lx9k3"
 * and "F2LX9K3 " are the same adapter to everyone except a string compare.
 */
export const normaliseSerial = (s: string) => (s ?? "").trim().toUpperCase();

export function findSerial(itemId: string, serial: string, serials?: Serial[]): Serial | undefined {
  const want = normaliseSerial(serial);
  if (!want) return undefined;
  return (serials ?? SerialRepo.all()).find(
    (s) => s.itemId === itemId && normaliseSerial(s.serial) === want,
  );
}

export const SERIAL_STATUS_LABEL: Record<Serial["status"], string> = {
  in_stock: "In stock",
  sold: "Sold",
  returned_to_vendor: "Returned to vendor",
  damaged: "Damaged",
};

/**
 * When a warranty given on `soldOn` runs out.
 *
 * Months are copied onto the serial at the moment of sale rather than read
 * from the item later: changing an item's warranty policy must not silently
 * rewrite a promise already made to a customer who is holding a bill.
 */
export function warrantyEnd(soldOn: string, months: number | undefined): string | undefined {
  if (!soldOn || !months || months <= 0) return undefined;
  const [y, m, d] = soldOn.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  // Day-of-month clamped by construction: 31 Jan + 1 month is 28/29 Feb, not
  // 2 or 3 March, which is what a naive setMonth would give and what a
  // customer would rightly argue about.
  const target = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, lastDay));
  const p2 = (n: number) => String(n).padStart(2, "0");
  return `${target.getFullYear()}-${p2(target.getMonth() + 1)}-${p2(target.getDate())}`;
}

/** Days left on a warranty; negative once it has run out. */
export function warrantyDaysLeft(end: string | undefined, today: string): number | undefined {
  if (!end) return undefined;
  const a = new Date(end).getTime();
  const b = new Date(today).getTime();
  if (isNaN(a) || isNaN(b)) return undefined;
  return Math.round((a - b) / 86400000);
}
