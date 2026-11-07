import type { BankTxn, CashAdjustment } from "@/types";

/**
 * The bank side(s) of a cash entry that is really one leg of a transfer.
 *
 * A transfer writes two records — one on each account — and they must be
 * edited and deleted as one thing. Newer ones carry a shared `transferId`, so
 * that is simply a lookup.
 *
 * Older ones do not, and they are the dangerous case: without recognising
 * them, the Cash page treats the cash side as an ordinary manual entry and
 * offers to EDIT it. Changing the amount there would move the cash and leave
 * the bank account saying something else — the books silently disagreeing
 * with themselves, which is worse than refusing the edit.
 *
 * They can still be recognised, because the transfer dialog wrote the SAME
 * note on both sides, on the same date, for the same amount — and the two
 * legs always point opposite ways: cash out pairs with money into a bank,
 * cash in with money out of one. All four have to agree before a record is
 * treated as a partner, and a partner has to actually be found: a manual
 * entry that merely happens to have "Transfer" in its note stays editable,
 * because there is nothing it could be out of step with.
 */
export function transferLegsFor(
  adj: CashAdjustment,
  bankTxns: BankTxn[],
  banks: { id: string; name: string }[] = [],
): BankTxn[] {
  if (adj.transferId) return bankTxns.filter((t) => t.transferId === adj.transferId);

  /* "Bank deposit — K CH": the cash side of a Deposit / Withdraw made with
     "take the cash from the counter" ticked. That dialog wrote the two records
     WITHOUT linking them, so deleting either one left the other — cash or the
     bank kept money that had gone back. Its bank side is the deposit (or
     withdrawal) on that account, same date and amount, never part of another
     transfer; by name where the account still has it, else the only match. */
  const dep = /^bank (deposit|withdraw) — (.+)$/i.exec((adj.reason ?? "").trim());
  if (dep) {
    const kind = dep[1].toLowerCase() as "deposit" | "withdraw";
    if ((kind === "deposit") !== (adj.type === "reduce")) return [];
    const candidates = bankTxns.filter(
      (t) =>
        !t.transferId &&
        t.type === kind &&
        t.date === adj.date &&
        Math.abs(t.amount - adj.amount) < 0.005,
    );
    const named = banks.find((b) => b.name.trim() === dep[2].trim());
    const byName = named ? candidates.filter((t) => t.bankId === named.id) : [];
    if (byName.length) return [byName[0]];
    return candidates.length === 1 ? candidates : [];
  }

  const note = (adj.reason ?? "").trim();
  if (!/^transfer\b/i.test(note)) return [];
  const wantBankSide = adj.type === "reduce" ? "deposit" : "withdraw";
  return bankTxns.filter(
    (t) =>
      (t.notes ?? "").trim() === note &&
      t.date === adj.date &&
      Math.abs(t.amount - adj.amount) < 0.005 &&
      t.type === wantBankSide,
  );
}

/**
 * The person's own note on a transfer, without the "Transfer A → B" the save
 * writes in front of it. A note that was nothing BUT that description used to
 * survive the strip and be saved again as the note — "Transfer A → K CH —
 * Transfer A → CHINA" — so every edit stacked another copy of old wording.
 */
export function userNoteOf(text: string): string {
  let t = text.trim();
  for (let i = 0; i < 5 && /^transfer\s/i.test(t); i++) {
    const cut = t.indexOf("—");
    t = cut >= 0 ? t.slice(cut + 1).trim() : "";
  }
  return t;
}
