import type {
  BankAccount,
  BankTxn,
  CashAdjustment,
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
  | "stockAdjustments"
  | "bankTxns"
  | "cashAdjustments";

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
  /** For transfer descriptions, which name the accounts they moved between. */
  banks?: BankAccount[];
  bankTxns?: BankTxn[];
  cashAdjustments?: CashAdjustment[];
}

/** Restrict the plan to what a rename touched. Absent = everything. */
export interface NameSyncScope {
  partyIds?: string[];
  itemIds?: string[];
  payeeIds?: string[];
  bankIds?: string[];
}

const trimmed = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export function planNameSync(data: NameSyncData, scope: NameSyncScope = {}): NameFix[] {
  const inScope = (ids: string[] | undefined, id: string) => !ids || ids.includes(id);
  const partyScoped = !!scope.partyIds;
  const itemScoped = !!scope.itemIds;
  const payeeScoped = !!scope.payeeIds;
  const bankScoped = !!scope.bankIds;
  const everything = !partyScoped && !itemScoped && !payeeScoped && !bankScoped;
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
  if (everything || bankScoped) fixes.push(...planTransferNotes(data, scope.bankIds));
  return fixes;
}

const CASH = "Cash in Hand";
/** "Transfer A → B", the note the transfer dialog writes ahead of the user's own. */
const TRANSFER_PREFIX = /^Transfer .+ → .+$/;

/**
 * Transfer descriptions, rebuilt from the transfer itself.
 *
 * The transfer dialog writes "Transfer {from} → {to}" (plus the person's own
 * note) onto both legs, and a Deposit / Withdraw with counter cash writes
 * "Bank deposit — {account}" on its cash side. Those are text: rename the
 * account and they kept saying "CHINA" for an account now called "K CH".
 * They are rebuilt from the legs — the account money left and the one it
 * reached — never by searching the text for the old name, and the person's
 * own note is kept. A note that is itself just an old "Transfer A → B" (left
 * by an edit that put the old description back in the note box) is dropped.
 *
 * Only transfers that carry a shared id: older ones have nothing reliable to
 * rebuild from, and are left as they are.
 */
function planTransferNotes(data: NameSyncData, bankIds?: string[]): NameFix[] {
  const banks = new Map((data.banks ?? []).map((b) => [b.id, b] as const));
  const groups = new Map<string, { bank: BankTxn[]; cash: CashAdjustment[] }>();
  const group = (id: string) => {
    let g = groups.get(id);
    if (!g) groups.set(id, (g = { bank: [], cash: [] }));
    return g;
  };
  for (const t of data.bankTxns ?? []) if (t.transferId) group(t.transferId).bank.push(t);
  for (const a of data.cashAdjustments ?? []) if (a.transferId) group(a.transferId).cash.push(a);

  const fixes: NameFix[] = [];
  for (const g of groups.values()) {
    if (bankIds && !g.bank.some((t) => bankIds.includes(t.bankId))) continue;
    // Every account named must still exist, or there is nothing to name it by.
    if (g.bank.some((t) => !banks.get(t.bankId))) continue;
    const nameOf = (t: BankTxn) => banks.get(t.bankId)!.name;

    // A Deposit / Withdraw with counter cash: only its cash side names the bank.
    const depositCash = g.cash.find((a) => /^bank (deposit|withdraw) — /i.test(a.reason ?? ""));
    if (depositCash && g.bank.length === 1) {
      const want = `Bank ${g.bank[0].type} — ${nameOf(g.bank[0])}`;
      if ((depositCash.reason ?? "") !== want)
        fixes.push({
          collection: "cashAdjustments",
          id: depositCash.id,
          label: depositCash.date,
          patch: { reason: want },
          changes: [`${depositCash.reason} → ${want}`],
        });
      continue;
    }

    const out = g.bank.find((t) => t.type === "withdraw");
    const into = g.bank.find((t) => t.type === "deposit");
    const cashOut = g.cash.find((a) => a.type === "reduce");
    const cashIn = g.cash.find((a) => a.type === "add");
    const from = out ? nameOf(out) : cashOut ? CASH : null;
    const to = into ? nameOf(into) : cashIn ? CASH : null;
    if (!from || !to) continue;
    const prefix = `Transfer ${from} → ${to}`;

    const legs: {
      collection: "bankTxns" | "cashAdjustments";
      id: string;
      date: string;
      text: string;
      field: "notes" | "reason";
    }[] = [
      ...g.bank.map((t) => ({
        collection: "bankTxns" as const,
        id: t.id,
        date: t.date,
        text: t.notes ?? "",
        field: "notes" as const,
      })),
      ...g.cash.map((a) => ({
        collection: "cashAdjustments" as const,
        id: a.id,
        date: a.date,
        text: a.reason ?? "",
        field: "reason" as const,
      })),
    ];
    // Only the dialog's own format is rebuilt; anything else was typed by hand.
    if (!legs.every((l) => /^transfer\s/i.test(l.text.trim()))) continue;
    for (const l of legs) {
      const text = l.text.trim();
      const cut = text.indexOf(" — ");
      let note = cut >= 0 ? text.slice(cut + 3).trim() : "";
      if (TRANSFER_PREFIX.test(note)) note = "";
      const want = note ? `${prefix} — ${note}` : prefix;
      if (text !== want)
        fixes.push({
          collection: l.collection,
          id: l.id,
          label: l.date,
          patch: { [l.field]: want },
          changes: [`${text} → ${want}`],
        });
    }
  }
  return fixes;
}
