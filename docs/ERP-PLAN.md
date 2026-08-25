# Taking BizDesk to ERP level — plan and impact analysis

**Branch discipline:** `main` is the shop's live app and deploys to production on
every push. `iballmobileshopfull` is the workshop for everything below; nothing
here reaches the counter until it is merged deliberately. Vercel's production
branch is `main` — verified: pushing this branch created no deployment and both
live hosts stayed on v73.

---

## 1. The decision everything else rests on

An ERP has **one ledger**. Every document posts balanced debits and credits
against a chart of accounts, and the trial balance, balance sheet and P&L are
read off that single source — so they cannot disagree with each other.

BizDesk derives each figure from the documents with its own calculation:
receivable one way, cash another, P&L another. That is why the dashboard
double-count was possible at all — two screens answered "what does this party
owe" two different ways and one was wrong. A ledger makes that class of bug
impossible, because there is only one answer to read.

**So the foundation is a posting ledger.** Everything in the missing list either
derives from it (balance sheet, trial balance, year close) or is independent of
it (serials, units, workflow, locations).

### How to add it to a live app without breaking it

Additively, in three stages:

1. **Post alongside.** Every existing write path keeps doing exactly what it does
   today AND writes ledger lines on the same batch. Nothing reads the ledger yet,
   so nothing can break.
2. **Reconcile.** A report (and an audit test) compares the ledger's answer with
   the document-derived answer for every party, account and total. Any gap is a
   posting bug, found before anyone depends on it. This is the same technique as
   `planDataRepair` — dry-run first, trust later.
3. **Switch, one report at a time.** When the ledger and the old calculation agree
   for a figure, that screen starts reading the ledger. The old path stays until
   the last reader is gone.

Stage 2 is the part that makes this safe on a trading shop, and it is not
optional.

---

## 2. Chart of accounts

Minimum real set. Each row is an account; `system` accounts are created on
first run and cannot be deleted.

| Group | Accounts |
|---|---|
| Asset | Cash in Hand · one per Bank Account · Accounts Receivable · Inventory · Input GST |
| Liability | Accounts Payable · Output GST · Round-off |
| Equity | Owner's Capital · Owner's Drawings · Retained Earnings · Opening Balance Equity |
| Income | Sales · Discount Received · Other Income |
| Expense | Cost of Goods Sold · Discount Allowed · Cash Short/Over · Stock Written Off · one per expense category |

`Opening Balance Equity` is what makes the ₹29,000 "CASH ADD TILL TODAY FROM
VYAPAR" postable: an opening figure has to land somewhere, and equity is where.

### New collections

```
accounts        { id, code, name, group, system, archived }
ledgerEntries   { id, date, voucherType, voucherNo, docId, docKind,
                  narration, lines: [{ accountId, debit, credit, partyId? }],
                  createdAt, createdBy, reversalOf?, periodKey }
```

One `ledgerEntry` per document, with balanced lines. `docId`/`docKind` point back
at the sale/purchase/payment that caused it, so any figure drills through to its
source.

---

## 3. Posting rules

The whole design in one table. Every existing write point gets exactly one of
these.

| Document | Debit | Credit |
|---|---|---|
| Sale (GST) | Accounts Receivable (total) | Sales (taxable) + Output GST |
| — cash taken at billing | Cash / Bank | Accounts Receivable |
| — cost of the goods | Cost of Goods Sold | Inventory |
| Purchase | Inventory + Input GST | Accounts Payable |
| — paid at billing | Accounts Payable | Cash / Bank |
| Payment in | Cash / Bank | Accounts Receivable |
| — settlement discount | Discount Allowed | Accounts Receivable |
| Payment out | Accounts Payable | Cash / Bank |
| — settlement discount | Accounts Payable | Discount Received |
| Expense | Expense (category) | Cash / Bank |
| Transfer | destination account | source account |
| Cash adjustment | Cash *or* the reason account | the reason account *or* Cash |
| Sale return | Sales + Output GST | Accounts Receivable (and Inventory ← COGS) |
| Purchase return | Accounts Payable | Inventory + Input GST |
| Stock adjustment | Inventory *or* Stock Written Off | the other |

**Where each is added** (the existing posting points, from a grep of the tree):

| File | Posts |
|---|---|
| `src/components/InvoiceForm.tsx` | Sale, Purchase (+ the cash/bank leg, + COGS) |
| `src/components/ReturnForm.tsx` | Sale return, Purchase return |
| `src/routes/payments.tsx` | Payment in / out, incl. discount lines |
| `src/routes/expenses.tsx` | Expense |
| `src/components/CashBankTransferDialog.tsx` | Transfer (both legs) |
| `src/routes/bank.tsx` | Deposit / withdraw |
| `src/routes/cash.tsx` | Cash adjustment |
| `src/routes/items.tsx`, `BulkUpdateItemsDialog.tsx` | Stock adjustment |
| `src/routes/sales.index.tsx`, `purchase.index.tsx`, `sale-return.index.tsx`, `purchase-return.index.tsx` | Deletions — post a **reversal**, never delete the original entry |

---

## 4. Feature-by-feature: what is added, and what it touches

### 4.1 Audit trail — *independent, cheap, do first*
- **Add** `createdBy`, `createdAt`, `updatedBy`, `updatedAt` on every record;
  stamped centrally in `Repository.add/update/adjustField` so no call site can
  forget. Current user from `auth.currentUser.email`.
- **Touches** `src/repositories/base.ts` only, plus a "History" line on detail
  screens.
- **Risk** none — additive fields, empty on existing records.

### 4.2 Period lock — *independent, cheap*
- **Add** `Company.booksLockedUpto: string`. Every write path checks the
  document date against it.
- **Touches** the same posting points listed above; one shared guard
  `assertPostable(date)` so the rule exists once.
- **Risk** low. Must exempt the repair tools, or Fix Calculations stops working
  on a locked period.

### 4.3 Voucher numbers
- **Add** a per-type counter (`CN`, `JV`, `CT`, `RV`) on cash/bank/journal
  entries, which today have no reference at all.
- **Touches** cash, bank, transfer, adjustment write paths; the tables that list
  them.
- **Risk** low. Numbering must be gap-free per financial year — allocate inside
  the same batch as the document, not before it.

### 4.4 Reason categories on cash adjustments
- **Add** `CashAdjustment.accountId` (Owner Capital, Owner Drawing, Cash
  Short/Over, Opening Balance Equity, …) via the existing `ComboInput`.
- **Touches** `src/routes/cash.tsx`; the P&L and balance sheet then stop
  absorbing unexplained cash.
- **Risk** low. Existing entries have no account — they post to Opening Balance
  Equity and are flagged for review rather than guessed at.

### 4.5 Append-only corrections
- **Add** "Reverse this entry" on anything outside today; edit stays for same-day.
  A reversal is a new document with the opposite signs and `reversalOf` set.
- **Touches** every delete/edit path — the four `*.index.tsx` deletes, payments,
  cash, expenses.
- **Risk** MEDIUM, and it is a **behaviour change the shop will notice**: a
  correction leaves two visible rows. Tell them before shipping it.
- **Payoff** this is what retires the drift class permanently. Nothing mutates,
  so nothing can disagree with itself.

### 4.6 Posting ledger + Trial Balance
- **Add** the two collections above; `src/lib/posting.ts` builds the lines for a
  document; `src/lib/trialBalance.ts` sums the ledger.
- **Touches** every posting point (table in §3) — the largest single change.
- **Risk** HIGH if it drives anything. Mitigated by §1: post alongside,
  reconcile, switch last.
- **Done when** an audit test asserts, over the randomised scenario generator
  already in `tests/audit.test.ts`, that for every scenario: every entry balances,
  and the ledger's receivable/payable/cash/bank equals what `netPartyPositions`,
  `cashFlows` and `bankFlows` say.

### 4.7 Balance Sheet + P&L from the ledger, and year close
- **Add** `/reports?r=balance-sheet`, `?r=trial-balance`; a Year Close action
  posting closing entries into Retained Earnings and carrying balances forward.
- **Touches** reports only — it reads the ledger, writes nothing except the
  closing entry.
- **Depends on** 4.6 being reconciled.

### 4.8 Unit conversion (box ↔ piece)
- **Add** `Item.baseUnit`, `altUnit`, `altPerBase`; `LineItem.unitUsed` and
  `baseQty`. **Stock, valuation and every report use `baseQty` only** — the
  chosen unit is presentation.
- **Touches** all 10 stock write points (grep above), `planStockRepair`,
  Inventory, the item picker, the printed bill.
- **Risk** MEDIUM. The rule that keeps it safe: nothing except the line's own
  display reads `unitUsed`.

### 4.9 Serial / IMEI tracking
- **Add** `Item.trackSerials`; `serialUnits { id, itemId, serial, status,
  purchaseDocId, saleDocId }`; `LineItem.serials: string[]`.
- **Touches** the bill and purchase forms (pick/scan serials), returns (restore
  them), stock reconciliation (serial count must equal `baseQty` for tracked
  items — a new invariant for the audit suite), item detail (per-serial history).
- **Risk** MEDIUM. Highest real value for a phone shop: warranty by serial.

### 4.10 Document workflow
- **Add** `quotations`, `salesOrders`, `deliveryChallans`, `purchaseOrders`,
  `grns`, each with `status` and a convert-to-next action carrying the lines
  forward and linking back.
- **Rule** stock moves on the **challan/GRN or the invoice, once** — never on a
  quotation or an order. An order may *reserve*, which is a separate figure from
  stock and must never be subtracted from it.
- **Touches** new screens and routes; the item picker's available-stock display;
  the tab strip's title map.
- **Risk** MEDIUM — mostly new surface rather than changes to existing paths.

### 4.11 Multi-location
- **Add** `locations`; move stock to `itemStock { itemId, locationId, qty }`;
  every document gets a `locationId`; inter-location transfer document.
- **Touches** EVERYTHING that reads `item.stock` — 23 references across 12
  files, plus `planStockRepair`, Inventory, the dashboard's stock value, the
  low-stock badge, the bill form's negative-stock warning.
- **Risk** HIGHEST. Deliberately last. `item.stock` becomes a derived total
  across locations so old readers keep working during the migration.

### 4.12 Cost centres, budgets, TDS/TCS
- **Add** `costCentreId` on documents and ledger lines; a budget per account per
  period; TDS/TCS rate on party and line.
- **Touches** reports; the ledger line shape.
- **Risk** low, additive.

### 4.13 e-Invoicing / e-way bill
- **Blocked on the client, not on code.** Needs a GSP account (Masters India,
  ClearTax, …), API credentials, and the GSTIN registered for e-invoicing.
  Cannot be built or tested without them. Ask before scheduling.

---

## 5. Order of work

Dependency-driven, cheapest-safest first:

| # | Phase | Depends on |
|---|---|---|
| 0 | Audit trail · Period lock · Voucher numbers | — |
| 1 | Reason categories on cash | 0 |
| 2 | Posting ledger + reconciliation report + Trial Balance | 0 |
| 3 | Balance Sheet · P&L from ledger · Year close | 2 reconciled |
| 4 | Append-only corrections | 2 |
| 5 | Unit conversion | — |
| 6 | Serial / IMEI | 5 |
| 7 | Document workflow | — |
| 8 | Multi-location | 5, 7 |
| 9 | Cost centres · budgets · TDS/TCS | 2 |
| 10 | e-Invoicing | client credentials |

## 6. Standing rules for this programme

1. **Additive first.** No phase may require rewriting existing records. Old data
   must render correctly with the new field absent.
2. **Post alongside, reconcile, then switch.** No new figure drives a screen
   until a test proves it agrees with the figure it replaces.
3. **Every phase ends with mutation-proven tests.** Break the mechanism, watch
   the test fail with the real numbers, restore.
4. **Nothing merges to `main` until the phase is complete and reconciled.**
   Partial phases stay on this branch.
5. **Behaviour changes get flagged to the shop before merge** — append-only
   corrections above all.
