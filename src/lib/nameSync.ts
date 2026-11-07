import type {
  Expense,
  Invoice,
  Item,
  LineItem,
  Party,
  Payee,
  Payment,
  Return,
  StockAdjustment,
} from "@/types";

/**
 * Keeping the names written on records in step with the party, item or payee
 * they belong to.
 *
 * Bills, returns, payments, expenses and stock adjustments each carry a COPY
 * of a name — the record points at the party by id, but the list, the
 * statement, the PDF and the WhatsApp message all read the copy. Renaming a
 * party or an item changed only the master, so a shop that renamed
 * "SAMVED SANGHVI" to "SMVD" still saw the old name on 29 of their records,
 * and an item renamed in the catalogue kept its old name on 102 bill lines.
 *
 * The standard (Tally, Vyapar): the master is the truth, and a rename shows
 * everywhere. This plans exactly the writes that make it so — the same
 * function serves a rename as it happens and the repair of records left
 * behind by renames made before this existed.
 *
 * Phone: a bill's phone follows the party's only when the party HAS one. A
 * bill typed with a number for a party saved without one keeps its number —
 * blanking it would stop that bill being sent anywhere.
 */

export type NameSyncCollection =
  | "sales"
  | "purchases"
  | "saleReturns"
  | "purchaseReturns"
  | "payments"
  | "expenses"
  | "stockAdjustments";

export interface NameFix {
  collection: NameSyncCollection;
  id: string;
  /** How the record is known on screen — a bill number, a date. */
  label: string;
  patch: Record<string, unknown>;
  /** "SAMVED SANGHVI → SMVD", one per thing that changes. */
  changes: string[];
}

export interface NameSyncData {
  parties: Party[];
  items: Item[];
  payees: Payee[];
  sales: Invoice[];
  purchases: Invoice[];
  saleReturns: Return[];
  purchaseReturns: Return[];
  payments: Payment[];
  expenses: Expense[];
  stockAdjustments: StockAdjustment[];
}

/** Restrict the plan to what a rename touched. Absent = everything. */
export interface NameSyncScope {
  partyIds?: string[];
  itemIds?: string[];
  payeeIds?: string[];
}

const trimmed = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export function planNameSync(data: NameSyncData, scope: NameSyncScope = {}): NameFix[] {
  const inScope = (ids: string[] | undefined, id: string) => !ids || ids.includes(id);
  const partyScoped = !!scope.partyIds;
  const itemScoped = !!scope.itemIds;
  const payeeScoped = !!scope.payeeIds;
  const everything = !partyScoped && !itemScoped && !payeeScoped;
  const doParties = everything || partyScoped;
  const doItems = everything || itemScoped;
  const doPayees = everything || payeeScoped;

  const party = new Map(data.parties.map((p) => [p.id, p] as const));
  const item = new Map(data.items.map((i) => [i.id, i] as const));
  const payee = new Map(data.payees.map((p) => [p.id, p] as const));
  const fixes: NameFix[] = [];

  const partyPatch = (
    doc: { partyId?: string; partyName?: string; partyPhone?: string },
    withPhone: boolean,
  ) => {
    const patch: Record<string, unknown> = {};
    const changes: string[] = [];
    if (!doParties || !doc.partyId || !inScope(scope.partyIds, doc.partyId))
      return { patch, changes };
    const p = party.get(doc.partyId);
    if (!p || !trimmed(p.name)) return { patch, changes };
    if ((doc.partyName ?? "") !== p.name) {
      patch.partyName = p.name;
      changes.push(`${doc.partyName || "(no name)"} → ${p.name}`);
    }
    const phone = trimmed(p.phone);
    if (withPhone && phone && trimmed(doc.partyPhone) !== phone) {
      patch.partyPhone = phone;
      changes.push(`phone ${trimmed(doc.partyPhone) || "(none)"} → ${phone}`);
    }
    return { patch, changes };
  };

  const linePatch = (lines: LineItem[] | undefined) => {
    if (!doItems || !lines?.length)
      return { lines: null as LineItem[] | null, changes: [] as string[] };
    const changes: string[] = [];
    let changed = false;
    const next = lines.map((l) => {
      if (!inScope(scope.itemIds, l.itemId)) return l;
      const it = item.get(l.itemId);
      if (!it || !trimmed(it.name) || l.name === it.name) return l;
      changed = true;
      changes.push(`${l.name} → ${it.name}`);
      return { ...l, name: it.name };
    });
    return { lines: changed ? next : null, changes };
  };

  const docs: [NameSyncCollection, (Invoice | Return)[]][] = [
    ["sales", data.sales],
    ["purchases", data.purchases],
    ["saleReturns", data.saleReturns],
    ["purchaseReturns", data.purchaseReturns],
  ];
  for (const [collection, list] of docs) {
    for (const d of list) {
      const p = partyPatch(d, true);
      const l = linePatch(d.lineItems);
      const patch = { ...p.patch, ...(l.lines ? { lineItems: l.lines } : {}) };
      const changes = [...p.changes, ...l.changes];
      if (changes.length)
        fixes.push({ collection, id: d.id, label: d.number || d.id, patch, changes });
    }
  }
  for (const pay of data.payments) {
    const p = partyPatch(pay, false);
    if (p.changes.length)
      fixes.push({
        collection: "payments",
        id: pay.id,
        label: pay.date,
        patch: p.patch,
        changes: p.changes,
      });
  }
  if (doItems) {
    for (const a of data.stockAdjustments) {
      if (!inScope(scope.itemIds, a.itemId)) continue;
      const it = item.get(a.itemId);
      if (!it || !trimmed(it.name) || a.itemName === it.name) continue;
      fixes.push({
        collection: "stockAdjustments",
        id: a.id,
        label: a.date,
        patch: { itemName: it.name },
        changes: [`${a.itemName} → ${it.name}`],
      });
    }
  }
  if (doPayees) {
    for (const e of data.expenses) {
      if (!e.payeeId || !inScope(scope.payeeIds, e.payeeId)) continue;
      const p = payee.get(e.payeeId);
      if (!p || !trimmed(p.name) || e.payeeName === p.name) continue;
      fixes.push({
        collection: "expenses",
        id: e.id,
        label: e.date,
        patch: { payeeName: p.name },
        changes: [`${e.payeeName || "(no name)"} → ${p.name}`],
      });
    }
  }
  return fixes;
}
