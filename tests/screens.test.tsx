/**
 * Screen render tests — run in a real browser (see tests/run-screens.cjs).
 *
 * audit.test.ts proves the MATH. This proves the SCREENS: that every page
 * actually renders seeded data, and that the numbers which reach the DOM are
 * the ones the ledger says they should be.
 *
 * It exists because the v50 refactor moved every repo-derived `useMemo` in
 * these pages onto `useRepoMemo`, and nothing but tsc was exercising them —
 * a blank page, or a stale zero, would have shipped unseen.
 *
 * Why a browser and not renderToString: most list screens load their rows in
 * a `useEffect`, which server rendering never runs, so they would all render
 * empty and the test would prove nothing. Mounting for real with createRoot
 * runs effects, which is exactly the code path being verified.
 *
 * Safety: `@/lib/firebase` is aliased to tests/stubs/firebase (isBrowser =
 * false), so the repositories are pure in-memory caches here and there is no
 * code path to the live database.
 */
import { createRoot, type Root } from "react-dom/client";
import { act, type ReactNode } from "react";
import { createRouter, createMemoryHistory, RouterProvider, Outlet } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import { fmtMoney, ymd } from "@/lib/format";
import {
  PartyRepo,
  ItemRepo,
  SalesRepo,
  PurchaseRepo,
  SaleReturnRepo,
  ExpenseRepo,
  PayeeRepo,
  BankRepo,
  BankTxnRepo,
  PaymentRepo,
  CompanyRepo,
} from "@/repositories";

export interface Results {
  passed: number;
  failed: number;
  fails: string[];
}

const R: Results = { passed: 0, failed: 0, fails: [] };
function assert(cond: boolean, msg: string) {
  if (cond) R.passed++;
  else {
    R.failed++;
    R.fails.push(msg);
  }
}
/** Assert a rendered page contains a value, naming what was missing. */
function has(text: string, needle: string, label: string) {
  assert(text.includes(needle), `${label} — expected to find ${JSON.stringify(needle)}`);
}

// Dates inside the CURRENT month, so the screens' default "this month"
// filters include them however long from now this test is run.
const now = new Date();
const inMonth = (day: number) =>
  ymd(new Date(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate())));
const D2 = inMonth(2),
  D3 = inMonth(3),
  D4 = inMonth(4),
  D5 = inMonth(5);

/* ── A small but complete book ────────────────────────────────────────── */
function seed() {
  CompanyRepo.save({
    name: "OM IMPEX",
    currency: "INR",
    invoicePrefix: "INV-",
    purchasePrefix: "PUR-",
    enableGst: true,
    allowNegativeStock: true,
    expenseCategories: ["Rent"],
  } as never);

  PartyRepo.add({
    id: "P1",
    createdAt: "2026-01-01T00:00:00Z",
    name: "Ramesh Traders",
    type: "both",
    phone: "9876500001",
    openingBalance: 0,
  } as never);
  PartyRepo.add({
    id: "P2",
    createdAt: "2026-01-02T00:00:00Z",
    name: "Sunrise Supply",
    type: "both",
    phone: "9876500002",
    openingBalance: 0,
  } as never);

  ItemRepo.add({
    id: "I1",
    createdAt: "2026-01-01T00:00:00Z",
    name: "USB Cable",
    unit: "pcs",
    gstRate: 18,
    purchasePrice: 60,
    salePrice: 100,
    stock: 40,
    openingStock: 50,
    minStock: 5,
  } as never);
  ItemRepo.add({
    id: "I2",
    createdAt: "2026-01-01T00:00:00Z",
    name: "Phone Case",
    unit: "pcs",
    gstRate: 18,
    purchasePrice: 90,
    salePrice: 150,
    stock: 2,
    openingStock: 10,
    minStock: 5,
  } as never);

  BankRepo.add({
    id: "B1",
    createdAt: "2026-01-01T00:00:00Z",
    name: "HDFC Current",
    accountNumber: "1234",
    openingBalance: 10000,
    balance: 11400,
  } as never);

  // A 1000 sale with 400 of it settled at billing through bank B1.
  SalesRepo.add({
    id: "S1",
    createdAt: `${D2}T09:00:00Z`,
    number: "INV-0001",
    date: D2,
    partyId: "P1",
    partyName: "Ramesh Traders",
    partyPhone: "9876500001",
    gstEnabled: false,
    lineItems: [
      {
        id: "L1",
        itemId: "I1",
        name: "USB Cable",
        unit: "pcs",
        qty: 10,
        price: 100,
        discountPct: 0,
        gstRate: 0,
        costPrice: 60,
        amount: 1000,
      },
    ],
    subtotal: 1000,
    discount: 0,
    shippingCharge: 0,
    taxAmount: 0,
    total: 1000,
    paid: 400,
    paymentMode: "bank",
    bankId: "B1",
    bankPaidAmount: 400,
    notes: "",
  } as never);

  PurchaseRepo.add({
    id: "PU1",
    createdAt: `${D3}T09:00:00Z`,
    number: "PUR-0001",
    date: D3,
    partyId: "P2",
    partyName: "Sunrise Supply",
    gstEnabled: false,
    lineItems: [
      {
        id: "L2",
        itemId: "I2",
        name: "Phone Case",
        unit: "pcs",
        qty: 5,
        price: 90,
        discountPct: 0,
        gstRate: 0,
        amount: 450,
      },
    ],
    subtotal: 450,
    discount: 0,
    taxAmount: 0,
    total: 450,
    paid: 0,
    paymentMode: "credit",
    notes: "",
  } as never);

  SaleReturnRepo.add({
    id: "SR1",
    createdAt: `${D4}T09:00:00Z`,
    number: "CR-0001",
    date: D4,
    originalRef: "INV-0001",
    partyId: "P1",
    partyName: "Ramesh Traders",
    gstEnabled: false,
    lineItems: [
      {
        id: "L3",
        itemId: "I1",
        name: "USB Cable",
        unit: "pcs",
        qty: 1,
        price: 100,
        discountPct: 0,
        gstRate: 0,
        costPrice: 60,
        amount: 100,
      },
    ],
    subtotal: 100,
    taxAmount: 0,
    total: 100,
    notes: "",
  } as never);

  PaymentRepo.add({
    id: "PY1",
    createdAt: `${D5}T09:00:00Z`,
    date: D5,
    partyId: "P1",
    partyName: "Ramesh Traders",
    type: "in",
    amount: 300,
    mode: "cash",
  } as never);
  PayeeRepo.add({ id: "PE1", createdAt: "2026-01-01T00:00:00Z", name: "Landlord" } as never);
  ExpenseRepo.add({
    id: "E1",
    createdAt: `${D3}T09:00:00Z`,
    date: D3,
    category: "Rent",
    amount: 5000,
    paymentMode: "cash",
    payeeId: "PE1",
    payeeName: "Landlord",
  } as never);
  BankTxnRepo.add({
    id: "BT1",
    createdAt: `${D4}T09:00:00Z`,
    bankId: "B1",
    date: D4,
    type: "deposit",
    amount: 1000,
    notes: "Counter cash",
  } as never);
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;

/** Mount one URL for real (effects included) and return its visible text. */
async function renderRoute(path: string): Promise<string> {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();

  if (root) root.unmount();
  if (host) host.remove();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);

  await act(async () => {
    root!.render(<RouterProvider router={router} />);
  });
  // Let post-render effects (the list screens' data load) settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
  return host.textContent ?? "";
}

/** Re-read the currently mounted page after letting React settle. */
async function readMounted(): Promise<string> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
  return host?.textContent ?? "";
}

export async function run(): Promise<Results> {
  const rootOptions = (routeTree as unknown as { options: Record<string, unknown> }).options;
  // Swap the root component for a bare Outlet: the real one is the auth gate,
  // which needs a live Firebase session this test deliberately cannot have.
  rootOptions.component = () => <Outlet />;
  // And drop the document shell — it renders <html><body>, which cannot be
  // mounted inside a container div.
  rootOptions.shellComponent = ({ children }: { children: ReactNode }) => <>{children}</>;
  // React refuses to run act() unless the environment opts in.
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.__TEST_IS_OWNER__ = true;

  /* ── THE cold-open regression ─────────────────────────────────────────
     This is the bug the v50 refactor was about, and the only test here that
     reproduces it: the app now renders BEFORE the collections have loaded,
     so a screen must fill in when data arrives later — not stay frozen on
     whatever the cache held at mount. Deleting the repo-version dependency
     (which the lint rule actively suggests) makes exactly this fail, while
     every seeded-first assertion below would still pass.                  */
  // (a) a list screen, which fills in through `useEffect(refresh, [_repoV])`
  const emptyList = await renderRoute("/sales");
  assert(
    !emptyList.includes("INV-0001"),
    "cold open: the sales list must start empty before any data has arrived",
  );

  // (b) a derived screen, which fills in through `useRepoMemo` — this is the
  //     mechanism the refactor replaced, so it is the one that has to be
  //     pinned. Mount it empty FIRST, then let data arrive underneath it.
  const emptyPl = await renderRoute("/reports?r=pl");
  assert(
    !emptyPl.includes(fmtMoney(1000)),
    "cold open: P&L must start at zero before any data has arrived",
  );

  // Data lands afterwards, exactly as a Firestore snapshot would deliver it.
  await act(async () => {
    seed();
  });

  const plAfterArrival = await readMounted();
  has(plAfterArrival, fmtMoney(1000), "cold open: P&L fills in once data arrives (no remount)");
  has(plAfterArrival, fmtMoney(360), "cold open: derived gross profit fills in too");

  const listAfterArrival = await renderRoute("/sales");
  has(listAfterArrival, "INV-0001", "cold open: the list screen shows the arrived data");

  /* ── Expected values, derived by hand from the seed above ───────────── */
  // Sale 1000 − return 100 = 900 net revenue (neither bill carries GST).
  // COGS = 10x60 − 1x60 = 540. Gross profit 360. Expenses 5000 → net −4640.
  const pl = await renderRoute("/reports?r=pl");
  has(pl, "Sales Revenue (excl. GST)", "P&L: GST-exclusive revenue label");
  has(pl, fmtMoney(1000), "P&L: sales revenue 1000");
  has(pl, fmtMoney(540), "P&L: COGS 540");
  has(pl, fmtMoney(360), "P&L: gross profit 360");
  has(pl, fmtMoney(-4640), "P&L: net profit -4640");

  // Statement: 1000 invoiced − 100 returned − 400 settled − 300 advance = 200.
  const statement = await renderRoute("/parties/P1");
  has(statement, "Ramesh Traders", "statement: party name");
  has(statement, "INV-0001", "statement: the invoice row");
  has(statement, "CR-0001", "statement: the credit note row");
  has(statement, fmtMoney(200), "statement: closing balance 200");

  // Passbook: opening 10000 + 400 sale receipt + 1000 deposit = 11400, which
  // must equal the account's stored balance.
  const passbook = await renderRoute("/bank/B1");
  has(passbook, "HDFC Current", "passbook: account name");
  has(passbook, fmtMoney(11400), "passbook: derived balance 11400 matches stored");
  has(passbook, fmtMoney(400), "passbook: the sale receipt");
  has(passbook, fmtMoney(1000), "passbook: the deposit");

  // Item page: 10 sold, 1 returned, profit = 9 x (100 − 60) = 360.
  const item = await renderRoute("/items/I1");
  has(item, "USB Cable", "item page: name");
  has(item, "INV-0001", "item page: sale in history");
  has(item, fmtMoney(360), "item page: profit earned 360");

  const payee = await renderRoute("/payees/PE1");
  has(payee, "Landlord", "payee page: name");
  has(payee, fmtMoney(5000), "payee page: the rent expense");

  /* ── Dashboard: every figure on the home page, derived by hand ───────
     The client reports the home page totals as wrong, so each card is
     pinned to an independently-computed value rather than to whatever the
     code happens to produce. `fmt` mirrors the dashboard's own formatter
     (en-IN, no decimals). */
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  const home = await renderRoute("/");
  // P1: 1000 invoiced − 100 returned − 400 settled − 300 advance = 200
  has(home, `₹ ${fmt(200)}`, "dashboard: Total Receivable = 200");
  // P2: 450 purchased, nothing paid = 450
  has(home, `₹ ${fmt(450)}`, "dashboard: Total Payable = 450");
  // cash-mode only: +300 payment in, −5000 expense (the sale settled by bank)
  has(home, `₹ ${fmt(-4700)}`, "dashboard: Cash On Hand = −4700");
  // stored 11400; the sale is tied to account B1 so it is NOT added again
  has(home, `₹ ${fmt(11400)}`, "dashboard: Total Bank Balance = 11400");
  // 40×60 + 2×90
  has(home, `₹ ${fmt(2580)}`, "dashboard: Stock Value = 2580");
  has(home, `₹ ${fmt(450)}`, "dashboard: Purchases this period = 450");
  has(home, `₹ ${fmt(5000)}`, "dashboard: Expenses this period = 5000");
  // 1000 − 100 − 540 COGS − 5000 expenses (GST-exclusive, so unchanged here)
  has(home, `₹ ${fmt(-4640)}`, "dashboard: Net Profit = −4640");

  // Expenses: edit and delete must be visible controls, not just a row
  // click and a Ctrl+Delete nobody can discover.
  const expensesPage = await renderRoute("/expenses");
  has(expensesPage, "Action", "expenses: row actions column is present");

  // Items page: the old "apply one operation to everything" bulk edit was
  // replaced by the Bulk Update Items screen, reachable without selecting.
  const itemsPage = await renderRoute("/items");
  has(itemsPage, "Bulk Update", "items: the new bulk update entry point");
  assert(!itemsPage.includes("Bulk Edit"), "items: the replaced Bulk Edit button must be gone");

  const daybook = await renderRoute(`/daybook?date=${D3}`);
  has(daybook, "PUR-0001", "daybook: the purchase");
  has(daybook, fmtMoney(5000), "daybook: the expense");

  // Owner-only sections of Settings must be invisible to a non-owner and
  // present for an owner — both sides of the gate, on the same page.
  globalThis.__TEST_IS_OWNER__ = false;
  const staffSettings = await renderRoute("/settings");
  has(staffSettings, "Company Details", "settings (staff): ordinary section");
  assert(
    !staffSettings.includes("Bank Reconciliation"),
    "settings (staff): owner-only Bank Reconciliation must be hidden",
  );
  assert(!staffSettings.includes("Team"), "settings (staff): owner-only Team must be hidden");

  globalThis.__TEST_IS_OWNER__ = true;
  const ownerSettings = await renderRoute("/settings");
  has(ownerSettings, "Bank Reconciliation", "settings (owner): reconciliation section");
  has(ownerSettings, "Check Bank Balances", "settings (owner): the reconciliation action");
  has(ownerSettings, "Team", "settings (owner): team section");

  /* ── Every remaining screen must render real content, not blow up ───── */
  const pages: [string, string][] = [
    ["/", "Total Receivable"],
    ["/parties", "Ramesh Traders"],
    ["/items", "USB Cable"],
    ["/inventory", "USB Cable"],
    ["/sales", "INV-0001"],
    ["/purchase", "PUR-0001"],
    ["/sale-return", "CR-0001"],
    ["/purchase-return", "Purchase Return"],
    ["/expenses", "Rent"],
    ["/payees", "Landlord"],
    ["/bank", "HDFC Current"],
    ["/cash", "Cash"],
    ["/payments", "Ramesh Traders"],
    ["/gst", "GST"],
    ["/reports?r=gst", "GST"],
    ["/reports?r=party-ledger", "Ramesh Traders"],
    ["/reports?r=stock", "USB Cable"],
    ["/settings", "Company Details"],
    ["/sales/S1", "INV-0001"],
    ["/purchase/PU1", "PUR-0001"],
    ["/sale-return/SR1", "CR-0001"],
  ];
  for (const [url, needle] of pages) {
    let text = "";
    try {
      text = await renderRoute(url);
    } catch (err) {
      assert(false, `${url} threw while rendering: ${(err as Error).message}`);
      continue;
    }
    assert(text.length > 100, `${url} rendered a suspiciously short page`);
    assert(!/NaN/.test(text), `${url} rendered NaN`);
    has(text, needle, `${url} content`);
  }

  /* ── Archived party holding money: do the two screens agree? ─────────
     Run LAST, because it mutates the seeded book. Archiving only hides a
     party from pickers — it does not forgive what they owe — so the money
     must not silently disappear from one screen while showing on another. */
  PartyRepo.update("P1", { archived: true });

  const homeAfterArchive = await renderRoute("/");
  has(
    homeAfterArchive,
    `₹ ${fmt(200)}`,
    "archived party: dashboard still counts money they owe (archiving is not forgiveness)",
  );

  const partiesAfterArchive = await renderRoute("/parties");
  assert(
    partiesAfterArchive.includes(fmtMoney(200)),
    "archived party: the Parties page hides ₹200 of receivable that the dashboard counts — " +
      "the two screens disagree",
  );

  if (root) root.unmount();
  if (host) host.remove();
  return R;
}
