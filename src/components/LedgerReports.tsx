/**
 * The two screens that make the posting ledger worth having.
 *
 * **Trial Balance** — every account, its debits and its credits, as at a date.
 * The report an accountant asks for first, and the one this shop has never
 * been able to produce.
 *
 * **Reconciliation** — the ledger's answer next to the answer the app already
 * gives, for every figure the shop reads. This is the screen that says whether
 * to believe the other one. docs/ERP-PLAN.md §1 stage 2: nothing switches to
 * reading the ledger until this is clean, and it stays on the menu afterwards
 * because real data drifts (lib/bankRepair.ts exists for exactly that reason).
 */

import { Fragment, useMemo } from "react";
import {
  BankRepo,
  BankTxnRepo,
  CashAdjustmentRepo,
  ExpenseRepo,
  ItemRepo,
  PartyRepo,
  PaymentRepo,
  PurchaseRepo,
  PurchaseReturnRepo,
  SaleReturnRepo,
  SalesRepo,
  StockAdjustmentRepo,
} from "@/repositories";
import { useRepoMemo } from "@/hooks/useRepoData";
import { fmtMoney, fmtDate } from "@/lib/format";
import { GROUP_LABEL, accountsFor } from "@/lib/accounts";
import type { Book } from "@/lib/posting";
import { buildJournal } from "@/lib/posting";
import { groupTotals, reconcile, trialBalance } from "@/lib/trialBalance";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

/**
 * The whole book, unfiltered.
 *
 * Deliberately not date-ranged. A trial balance is a POSITION — what the shop
 * holds and owes on a day — so it needs everything up to that day, opening
 * balances included. Filtering from a start date would drop the openings and
 * the balance would not balance, which is worse than useless: it would look
 * like a posting bug.
 */
function useBook(): Book {
  return useRepoMemo(() => ({
    parties: PartyRepo.all(),
    items: ItemRepo.all(),
    banks: BankRepo.all(),
    sales: SalesRepo.all(),
    purchases: PurchaseRepo.all(),
    saleReturns: SaleReturnRepo.all(),
    purchaseReturns: PurchaseReturnRepo.all(),
    payments: PaymentRepo.all(),
    expenses: ExpenseRepo.all(),
    cashAdjustments: CashAdjustmentRepo.all(),
    bankTxns: BankTxnRepo.all(),
    stockAdjustments: StockAdjustmentRepo.all(),
  }));
}

const money = (n: number) => (n ? fmtMoney(n) : "—");

/* ── Trial Balance ────────────────────────────────────────────────────── */

export function TrialBalanceReport({ asAt }: { asAt: string }) {
  const book = useBook();

  const { rows, totalDebit, totalCredit, drift, orphans, groups } = useMemo(() => {
    const upto = (d: string) => !asAt || d <= asAt;
    // Filtered on the ENTRY, after posting, rather than on the documents
    // before it: a transfer's two legs can carry different dates, and
    // dropping one of them at the boundary would leave the money half moved.
    const entries = buildJournal(book).filter((e) => upto(e.date));
    const tb = trialBalance(entries, accountsFor(book.banks, book.expenses));
    return { ...tb, groups: groupTotals(tb.rows) };
  }, [book, asAt]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold text-gray-800">Trial Balance</h2>
        <p className="text-[12px] text-gray-500">as at {fmtDate(asAt)}</p>
      </div>
      <p className="text-[12px] text-gray-500 mb-4">
        Every account and what has moved through it. A position, not a period — so this uses
        everything up to the To date, including opening balances, and ignores the From date.
      </p>

      {drift !== 0 && (
        <Banner
          tone="bad"
          title={`The books are out by ${fmtMoney(Math.abs(drift))}`}
          body="Debits and credits must be equal. A difference here is a posting rule that does not add up — not a data-entry mistake — so it is a bug to fix in the software, not something to correct in the shop's records."
        />
      )}
      {orphans.length > 0 && (
        <Banner
          tone="bad"
          title="Postings pointing at accounts that do not exist"
          body={orphans.join(", ")}
        />
      )}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b text-[11px] uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold px-4 py-2 w-16">Code</th>
              <th className="text-left font-semibold px-4 py-2">Account</th>
              <th className="text-right font-semibold px-4 py-2 w-32">Debit</th>
              <th className="text-right font-semibold px-4 py-2 w-32">Credit</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nothing posted up to this date.
                </td>
              </tr>
            )}
            {rows.map((r, i) => {
              const newGroup = i === 0 || rows[i - 1].group !== r.group;
              return (
                <Fragment key={r.accountId}>
                  {newGroup && (
                    <tr className="bg-gray-50/70 border-y">
                      <td
                        colSpan={4}
                        className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {GROUP_LABEL[r.group]}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-gray-400 tabular-nums">{r.code}</td>
                    <td className="px-4 py-2 text-gray-800">
                      {r.name}
                      {r.note && (
                        <span
                          className="ml-1.5 inline-flex align-middle text-amber-500"
                          title={r.note}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{money(r.debit)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{money(r.credit)}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2 border-primary font-bold">
              <td className="px-4 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(totalDebit)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {groups.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {groups.map((g) => (
            <div key={g.group} className="border rounded-lg bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {GROUP_LABEL[g.group]}
              </p>
              <p className="text-[15px] font-bold tabular-nums text-gray-800">
                {fmtMoney(g.balance)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Reconciliation ───────────────────────────────────────────────────── */

export function ReconciliationReport() {
  const book = useBook();
  const recon = useMemo(() => reconcile(book), [book]);

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Ledger Reconciliation</h2>
      <p className="text-[12px] text-gray-500 mb-4">
        The posting ledger against the figures the app already prints. Each row is two separate
        calculations of the same thing — they should agree to the paisa, and a difference names
        which figure to stop trusting. Whole book, every date.
      </p>

      {recon.ok ? (
        <Banner
          tone="good"
          title="The ledger agrees with every screen"
          body="Receivables, payables, cash, each bank account and the profit figure all match, and every entry balances."
        />
      ) : (
        <Banner
          tone="bad"
          title="Something does not agree"
          body="Until every row below matches, the ledger is not the figure to act on. The rows that differ say which calculation to look at."
        />
      )}

      {recon.unbalanced.length > 0 && (
        <Banner
          tone="bad"
          title={`${recon.unbalanced.length} entr${recon.unbalanced.length === 1 ? "y does" : "ies do"} not balance`}
          body={recon.unbalanced
            .slice(0, 5)
            .map((e) => `${e.voucherType} ${e.voucherNo ?? ""} — ${e.narration}`)
            .join("; ")}
        />
      )}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b text-[11px] uppercase tracking-wide text-gray-500">
              <th className="text-left font-semibold px-4 py-2">Figure</th>
              <th className="text-right font-semibold px-4 py-2 w-32">Ledger</th>
              <th className="text-right font-semibold px-4 py-2 w-32">App today</th>
              <th className="text-right font-semibold px-4 py-2 w-28">Difference</th>
            </tr>
          </thead>
          <tbody>
            {recon.rows.map((r) => (
              <tr key={r.key} className="border-b border-gray-100 last:border-0 align-top">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-gray-800">
                    {r.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    )}
                    {r.label}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">{r.why}</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtMoney(r.ledger)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmtMoney(r.app)}</td>
                <td
                  className={`px-4 py-2.5 text-right tabular-nums font-semibold ${
                    r.ok ? "text-gray-300" : "text-rose-600"
                  }`}
                >
                  {r.diff ? fmtMoney(r.diff) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recon.partyGaps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-[13px] font-semibold text-gray-700 mb-1">
            Parties where the two disagree
          </h3>
          <p className="text-[11px] text-gray-500 mb-2">
            Checked one party at a time, because two parties wrong in opposite directions cancel out
            in a total — which is how the original double-count stayed hidden.
          </p>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-[13px]">
              <tbody>
                {recon.partyGaps.slice(0, 25).map((g) => (
                  <tr key={g.partyId} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-gray-800">{g.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtMoney(g.ledger)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmtMoney(g.app)}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold text-rose-600">
                      {fmtMoney(g.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Banner({ tone, title, body }: { tone: "good" | "bad"; title: string; body: string }) {
  const good = tone === "good";
  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 flex gap-2.5 ${
        good ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
      }`}
    >
      {good ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
      )}
      <div>
        <p className={`text-[13px] font-semibold ${good ? "text-emerald-900" : "text-rose-900"}`}>
          {title}
        </p>
        <p className={`text-[12px] mt-0.5 ${good ? "text-emerald-800" : "text-rose-800"}`}>
          {body}
        </p>
      </div>
    </div>
  );
}
