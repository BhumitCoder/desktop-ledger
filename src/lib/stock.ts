import { ItemRepo } from "@/repositories";
import type { LineItem } from "@/types";

/**
 * Aggregates quantity needed per item across `lines` and checks it against
 * current stock. `reverseLines` (an existing sale/bill's original line
 * items, when editing) are added back first, since that qty is about to be
 * un-deducted in the same save. Returns one readable message per item that
 * would go negative — empty when nothing would.
 */
export function stockShortfalls(lines: LineItem[], reverseLines: LineItem[] = []): string[] {
  const needed = new Map<string, number>();
  for (const l of lines) needed.set(l.itemId, (needed.get(l.itemId) ?? 0) + l.qty);
  const reversed = new Map<string, number>();
  for (const l of reverseLines) reversed.set(l.itemId, (reversed.get(l.itemId) ?? 0) + l.qty);

  const out: string[] = [];
  for (const [itemId, qty] of needed) {
    const it = ItemRepo.get(itemId);
    if (!it) continue;
    const available = it.stock + (reversed.get(itemId) ?? 0);
    if (available - qty < 0) {
      out.push(`${it.name} (have ${available} ${it.unit}, need ${qty})`);
    }
  }
  return out;
}

/**
 * An item's opening stock after correcting it by `delta`, or null where that
 * would take it below zero.
 *
 * Below zero is the line between a setup mistake and a real difference: an
 * opening can only be corrected down to nothing. Needing to go further means
 * the item has been bought or sold since it was set up, so the shelf truly
 * differs from the books — a physical count, which belongs in profit & loss.
 */
export function correctedOpening(opening: number, delta: number): number | null {
  const next = Math.round(((Number(opening) || 0) + (Number(delta) || 0)) * 100) / 100;
  return next < 0 ? null : next;
}
