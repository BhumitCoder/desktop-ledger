/**
 * One item, two units: the box it is bought in and the piece it is sold in.
 *
 * A shop buys cables by the box of ten and sells them one at a time. Today it
 * has to do that arithmetic in its head at the counter, every time, and a bill
 * for "2" is ambiguous the moment anyone reads it back.
 *
 * The rule the whole phase rests on, and the reason it is safe to add to a
 * live app: **stock, valuation and every report read `baseQty` and nothing
 * else.** The unit a line was typed in is presentation. Only two places need
 * to know about units at all — the form that writes a line, and the screen
 * that shows one.
 *
 * Every function here treats a line with neither field as a line in base
 * units, which is precisely what ten thousand existing bills are. Nothing
 * needs rewriting, and nothing existing changes value.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

/** What an item is counted in, and what else it may be traded in. */
export interface UnitScheme {
  /** What stock is counted in. Always present — this is `Item.unit`. */
  base: string;
  /** A larger unit the shop also buys or sells in. */
  alt?: string;
  /** How many base units one `alt` contains. Only meaningful with `alt`. */
  perBase?: number;
}

/** The parts of an item this module needs. */
export interface UnitBearing {
  unit: string;
  altUnit?: string;
  altPerBase?: number;
}

/** The parts of a line this module needs. */
export interface QuantityBearing {
  qty: number;
  unitUsed?: string;
  baseQty?: number;
}

/**
 * An item's units.
 *
 * An alt unit with no conversion — or a conversion of zero, or one, or a
 * negative — is not a second unit, it is a half-finished edit. Dropped here
 * rather than defended against at every call site, because a `perBase` of 0
 * would multiply a bill's stock movement to nothing and a negative one would
 * move it the wrong way.
 */
export function unitsOf(item: UnitBearing): UnitScheme {
  const base = item.unit || "pcs";
  const alt = item.altUnit?.trim();
  const per = Number(item.altPerBase);
  if (!alt || !Number.isFinite(per) || per <= 1) return { base };
  // A "box" that means the same as a "piece" is noise on the picker, hence > 1.
  if (alt.toLowerCase() === base.toLowerCase()) return { base };
  return { base, alt, perBase: per };
}

/** Whether this item can be traded in more than one unit. */
export const hasAltUnit = (item: UnitBearing): boolean => !!unitsOf(item).alt;

/** The units a line may be entered in, base first. */
export function unitOptions(scheme: UnitScheme): string[] {
  return scheme.alt ? [scheme.base, scheme.alt] : [scheme.base];
}

/**
 * How many base units one of `unitUsed` is.
 *
 * Anything unrecognised is one. A line naming a unit the item no longer has —
 * because someone renamed or removed it months later — must not silently
 * become a different quantity of stock; it stays the number that is written
 * on it.
 */
export function unitFactor(unitUsed: string | undefined, scheme: UnitScheme): number {
  if (!unitUsed) return 1;
  if (scheme.alt && scheme.perBase && unitUsed.toLowerCase() === scheme.alt.toLowerCase()) {
    return scheme.perBase;
  }
  return 1;
}

/** Convert a quantity typed in `unitUsed` into base units. */
export function toBase(qty: number, unitUsed: string | undefined, scheme: UnitScheme): number {
  return r2((Number(qty) || 0) * unitFactor(unitUsed, scheme));
}

/**
 * What a line actually moved, in base units — the only quantity stock,
 * valuation and reports are allowed to use.
 *
 * The STORED figure wins, and that is the important half. `altPerBase` is an
 * item field a shop can edit: change "1 box = 10" to "1 box = 12" next year
 * and every historical bill would silently restate the stock it moved, the
 * COGS it carried and the profit it earned. A line records what it did at the
 * time, the same way `costPrice` does.
 *
 * Absent, it is a line in base units — every bill written before this existed.
 */
export function qtyInBase(line: QuantityBearing): number {
  const stored = Number(line.baseQty);
  if (Number.isFinite(stored) && stored !== 0) return stored;
  return Number(line.qty) || 0;
}

/**
 * Convert a price quoted per `unitUsed` into a price per base unit.
 *
 * Prices are stored per base unit on the item and quoted per typed unit on the
 * line, so `qty × price` stays the line's amount however it was entered — the
 * arithmetic on the bill is the arithmetic the customer can check.
 */
export const priceToBase = (price: number, unitUsed: string | undefined, scheme: UnitScheme) =>
  r2((Number(price) || 0) / unitFactor(unitUsed, scheme));

/** And back: what one `unitUsed` costs, given the per-base price. */
export const priceFromBase = (
  basePrice: number,
  unitUsed: string | undefined,
  scheme: UnitScheme,
) => r2((Number(basePrice) || 0) * unitFactor(unitUsed, scheme));

/**
 * A quantity in words, for anyone reading the document back.
 *
 * "2 box" alone is the ambiguity this phase exists to remove, so where a line
 * was entered in something other than the base unit it says both.
 */
export function describeQty(line: QuantityBearing, scheme: UnitScheme): string {
  const qty = Number(line.qty) || 0;
  const used = line.unitUsed || scheme.base;
  if (unitFactor(line.unitUsed, scheme) === 1) return `${qty} ${used}`;
  return `${qty} ${used} (${qtyInBase(line)} ${scheme.base})`;
}
