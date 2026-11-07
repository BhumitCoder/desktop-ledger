import type { BankTxn, CashAdjustment } from "@/types";
import { transferLegsFor } from "@/lib/transferLegs";

/**
 * Everything that has to go when one cash or bank entry is deleted.
 *
 * A transfer is one movement written as two records, one on each account.
 * Deleting it must take both, and put both accounts back where they were;
 * deleting one side only leaves the money "moved" on the other. The passbook
 * offered no delete at all — a bank-to-bank transfer could not be deleted
 * anywhere, which is how a live shop came to "delete" one by editing it down
 * to ₹1 — and a plain deposit or withdrawal could not be removed either.
 *
 * Found by the shared transfer id where the transfer has one; transfers made
 * before that id existed are found the way the transfer dialog wrote them —
 * the same note, date and amount on both sides, pointing opposite ways.
 */
export interface EntryRemoval {
  bankTxns: BankTxn[];
  cashAdjustments: CashAdjustment[];
}

const isTransferNote = (s?: string) => /^transfer\b/i.test((s ?? "").trim());
const sameAmount = (a: number, b: number) => Math.abs(a - b) < 0.005;

export function removalForBankTxn(
  txn: BankTxn,
  data: { bankTxns: BankTxn[]; cashAdjustments: CashAdjustment[] },
): EntryRemoval {
  if (txn.transferId) {
    return {
      bankTxns: data.bankTxns.filter((t) => t.transferId === txn.transferId),
      cashAdjustments: data.cashAdjustments.filter((a) => a.transferId === txn.transferId),
    };
  }
  if (!isTransferNote(txn.notes)) return { bankTxns: [txn], cashAdjustments: [] };
  const note = (txn.notes ?? "").trim();
  const other = txn.type === "deposit" ? "withdraw" : "deposit";
  const bankPartner = data.bankTxns.find(
    (t) =>
      t.id !== txn.id &&
      !t.transferId &&
      t.bankId !== txn.bankId &&
      t.type === other &&
      t.date === txn.date &&
      sameAmount(t.amount, txn.amount) &&
      (t.notes ?? "").trim() === note,
  );
  // Money INTO the bank came out of cash, and the other way round.
  const cashSide = txn.type === "deposit" ? "reduce" : "add";
  const cashPartner = data.cashAdjustments.find(
    (a) =>
      !a.transferId &&
      a.type === cashSide &&
      a.date === txn.date &&
      sameAmount(a.amount, txn.amount) &&
      (a.reason ?? "").trim() === note,
  );
  return {
    bankTxns: bankPartner ? [txn, bankPartner] : [txn],
    cashAdjustments: cashPartner ? [cashPartner] : [],
  };
}

export function removalForCashAdjustment(
  adj: CashAdjustment,
  data: { bankTxns: BankTxn[]; cashAdjustments: CashAdjustment[] },
): EntryRemoval {
  return {
    bankTxns: transferLegsFor(adj, data.bankTxns),
    cashAdjustments: adj.transferId
      ? data.cashAdjustments.filter((a) => a.transferId === adj.transferId)
      : [adj],
  };
}

/** What deleting a bank record does to that account's stored balance. */
export const balanceReversal = (t: BankTxn) => (t.type === "deposit" ? -t.amount : t.amount);
