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
import { BulkUpdateItemsDialog } from "@/components/BulkUpdateItemsDialog";
import { PrintablePartyStatement } from "@/components/PrintablePartyStatement";
import { CashBankTransferDialog } from "@/components/CashBankTransferDialog";
import { PrintableInvoice } from "@/components/PrintableInvoice";
import { PrintableReturn } from "@/components/PrintableReturn";
import { fmtMoney, ymd } from "@/lib/format";
import { planStockRepair } from "@/lib/dataRepair";
import { buildPartyStatement, cashFlows } from "@/lib/ledger";
import { commitBatch } from "@/repositories/base";
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
  StockAdjustmentRepo,
  PurchaseReturnRepo,
  CashAdjustmentRepo,
} from "@/repositories";

export interface Results {
  passed: number;
  failed: number;
  fails: string[];
}

const R: Results = { passed: 0, failed: 0, fails: [] };
const r2 = (n: number) => Math.round(n * 100) / 100;
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

/** Type into a controlled React input the way a person does — React listens
 * for the native `input` event, and setting `.value` alone never fires it. */
function setInput(el: HTMLInputElement | null | undefined, value: string) {
  // A missing control used to surface as "Illegal invocation" from deep in
  // the value setter, which says nothing about which control was missing.
  if (!el) throw new Error(`setInput: the control to type "${value}" into is not on screen`);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** The bulk-update grid row whose first cell holds this item name, as its
 * list of inputs: [name, ...the current tab's fields]. Returns null when the
 * row is not mounted — which the windowed list makes a normal state. */
function gridRow(name: string): HTMLInputElement[] | null {
  for (const table of Array.from(document.querySelectorAll("table"))) {
    for (const tr of Array.from(table.querySelectorAll("tbody tr"))) {
      const inputs = Array.from(tr.querySelectorAll("input")) as HTMLInputElement[];
      if (inputs.length && inputs[0].value === name) return inputs;
    }
  }
  return null;
}

function findButton(re: RegExp): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll("button")).find((b) =>
    re.test((b.textContent ?? "").trim()),
  ) as HTMLButtonElement | undefined;
}

/** Let React's effects, timers and rAF-coalesced scroll handlers settle. */
async function settleMs(ms: number) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
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
    name: "AIM ENTERPRISE",
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
async function renderRoute(path: string | string[]): Promise<string> {
  // An ARRAY is the route you arrived through — the last entry is the page
  // being tested and the ones before it are real history, which is the only
  // way to exercise a back button for what it is.
  const entries = Array.isArray(path) ? path : [path];
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: entries }),
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

/**
 * Keep whatever passed when a step throws.
 *
 * A missing control aborts the rest of the run, and the harness used to
 * replace the entire result with the exception — so a single broken selector
 * reported "0 passed" and hid both the assertions that had already run AND
 * the ones that explain why. The count is now honest and the error is just
 * one more failure line.
 */
export async function run(): Promise<Results> {
  try {
    return await runAll();
  } catch (e) {
    R.failed++;
    R.fails.push(`aborted: ${(e as Error)?.stack ?? String(e)}`);
    return R;
  }
}

async function runAll(): Promise<Results> {
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

  // Back belongs on DETAIL pages — the ones you drill into and have to get
  // out of. Main pages are reached from the sidebar/tab bar, so there is
  // nothing to go back to and a lone chevron beside the title just looks
  // broken. Both halves are asserted so neither drifts.
  const backCount = () => document.querySelectorAll('[aria-label="Go back"]').length;
  for (const url of ["/parties/P1", "/items/I1", "/bank/B1", "/payees/PE1"]) {
    await renderRoute(url);
    assert(backCount() > 0, url + ": detail page must offer a back control");
  }
  for (const url of ["/parties", "/items", "/expenses", "/reports", "/daybook", "/settings"]) {
    await renderRoute(url);
    assert(backCount() === 0, url + ": main page must NOT show a back arrow");
  }

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
    !staffSettings.includes("Fix Calculations"),
    "settings (staff): the owner-only recalculation tool must be hidden",
  );
  assert(!staffSettings.includes("Team"), "settings (staff): owner-only Team must be hidden");

  globalThis.__TEST_IS_OWNER__ = true;
  const ownerSettings = await renderRoute("/settings");
  has(ownerSettings, "Fix Calculations", "settings (owner): the recalculation tool");
  has(ownerSettings, "Check Calculations", "settings (owner): the recalculation action");
  has(ownerSettings, "Check Calculations", "settings (owner): the recalculation action");
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

  /* ── A party must never appear in BOTH Receivable and Payable ─────────
     The production case: a payable opening plus a later sale. The party's
     statement netted it correctly while the dashboard counted the party on
     both tiles. */
  {
    PartyRepo.update("P2", { openingBalance: -9850 });
    SalesRepo.add({
      id: "NETS1",
      createdAt: `${D5}T10:00:00Z`,
      number: "INV-9002",
      date: D5,
      partyId: "P2",
      partyName: "Sunrise Supply",
      gstEnabled: false,
      lineItems: [],
      subtotal: 11000,
      discount: 0,
      taxAmount: 0,
      total: 11000,
      paid: 0,
      paymentMode: "credit",
      notes: "",
    } as never);

    // opening −9850 + 11000 sale − 450 purchase = 700 receivable, and the
    // party must be gone from Payable entirely.
    const netHome = await renderRoute("/");
    has(netHome, "₹ 900", "netting: receivable is P1's 200 + P2's netted 700");
    has(netHome, "From 2 Parties", "netting: both parties counted once");
    assert(
      !netHome.includes("₹ 9,850") && !netHome.includes("₹ 10,300"),
      "netting: the payable opening must NOT also stand on its own",
    );

    const netParties = await renderRoute("/parties");
    has(netParties, fmtMoney(700), "netting: Parties row shows the netted figure");

    SalesRepo.remove("NETS1");
    PartyRepo.update("P2", { openingBalance: 0 });
  }

  /* ── Changing a party's OPENING BALANCE must reach every screen ───────
     Reported: "they change client opening — receivable, payable, ledger,
     statement, nothing updates". Opening balance is a stored field that
     every derived view folds in, so a change has to surface everywhere. */
  {
    // P2 is the supplier side of the seed and starts at 0.
    PartyRepo.update("P2", { openingBalance: 7000 });

    // Sign convention (as labelled in the party form): POSITIVE means they
    // owe you. P2 also has a 450 purchase bill, and the two NET against each
    // other now — 7000 − 450 = 6550 receivable, plus P1's 200 = 6750. The
    // party no longer stands in Payable at the same time.
    const home = await renderRoute("/");
    has(
      home,
      "₹ 6,750",
      "opening balance: dashboard receivable nets the purchase (7000 − 450 + 200)",
    );

    const list = await renderRoute("/parties");
    has(list, fmtMoney(6550), "opening balance: Parties list row shows the netted figure");

    const stmt = await renderRoute("/parties/P2");
    has(stmt, fmtMoney(7000), "opening balance: statement shows the opening row");

    // A NEGATIVE opening is the "we owe them" side — it must land in payable.
    PartyRepo.update("P2", { openingBalance: -1000 });
    const home2 = await renderRoute("/");
    has(home2, "₹ 1,450", "opening balance: negative opening moves to payable (1000 + 450)");
    assert(
      !home2.includes("₹ 7,200"),
      "opening balance: the old value must be gone after editing it",
    );

    PartyRepo.update("P2", { openingBalance: 0 }); // restore for later assertions
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

  /* ── The item dropdown must actually SCROLL ──────────────────────────
     It caps at MAX_SUGGESTIONS rows and is height-limited, so the list has
     to be scrollable — otherwise only the first handful are reachable and
     the rest may as well not exist, which is exactly what the shop saw. */
  {
    // Enough items to overflow the dropdown. Zero stock and zero price so
    // no money assertion above is disturbed.
    for (let i = 0; i < 40; i++) {
      ItemRepo.add({
        id: `DD${i}`,
        createdAt: "2026-01-01T00:00:00Z",
        name: `Dropdown Probe Item ${i}`,
        unit: "pcs",
        gstRate: 0,
        purchasePrice: 0,
        salePrice: 0,
        stock: 0,
        openingStock: 0,
      } as never);
    }

    await renderRoute("/sales/new");
    const input = Array.from(document.querySelectorAll("input")).find((el) =>
      (el.getAttribute("placeholder") ?? "").startsWith("Type item name"),
    );
    assert(!!input, "item dropdown: found the item search input");
    if (input) {
      await act(async () => {
        input.focus();
        input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 80));
      });

      // The popup is portalled to <body>; find the scrolling list inside it.
      const rows = Array.from(document.querySelectorAll("div")).filter((d) =>
        (d.textContent ?? "").startsWith("Dropdown Probe Item 0"),
      );
      assert(rows.length > 0, "item dropdown: opened and rendered options");

      const scroller = rows[0]?.closest("div.overflow-auto") as HTMLElement | null;
      assert(!!scroller, "item dropdown: options sit inside a scrollable container");
      const popup = scroller?.parentElement as HTMLElement | null;

      // Real layout, measured against the compiled stylesheet.
      if (scroller && popup) {
        assert(
          popup.getBoundingClientRect().height <= 320,
          `item dropdown: popup must stay height-capped — measured ${Math.round(popup.getBoundingClientRect().height)}px`,
        );
        assert(
          scroller.scrollHeight > scroller.clientHeight + 4,
          `item dropdown: list must be scrollable — content ${scroller.scrollHeight}px in ${scroller.clientHeight}px`,
        );

        // Scrolling has to WORK, not merely be possible.
        scroller.scrollTop = 400;
        const immediate = scroller.scrollTop; // before React sees anything
        await act(async () => {
          scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
        });
        const afterScrollEvent = scroller.scrollTop;
        assert(
          immediate > 0,
          `item dropdown: setting scrollTop should stick immediately — got ${immediate}`,
        );
        assert(
          afterScrollEvent > 0,
          `item dropdown: a scroll event must not reset the list — was ${immediate}, became ${afterScrollEvent}`,
        );
        // Let every pending effect and timer settle: the position must
        // SURVIVE them. A re-render used to snap the list back to the top.
        await act(async () => {
          await new Promise((r) => setTimeout(r, 120));
        });
        assert(
          scroller.scrollTop > 0,
          `item dropdown: the scrolled position must survive re-renders — scrollTop fell to ${scroller.scrollTop}`,
        );

        // THE REPORTED BUG: reaching for the scrollbar blurs the input, and
        // the blur handler closes the popup 150ms later — so a long list is
        // unreachable by the one gesture people use to browse it. A mousedown
        // anywhere in the popup (its padding, its scrollbar gutter) must not
        // dismiss it.
        await act(async () => {
          popup.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        });
        await act(async () => {
          await new Promise((r) => setTimeout(r, 300));
        });
        assert(
          document.body.contains(scroller),
          "item dropdown: must stay open when the scrollbar/popup is pressed",
        );
      }
    }
  }

  /* ── Printed documents: every row must match the header ──────────────
     The line table has optional columns (Disc%, GST%, GST Amt). When the
     filler rows or the Item Total row hard-code their cell counts, the
     table grows a phantom empty column hanging off the right edge — which
     is exactly what a real bill looked like. Checked across all four
     combinations so no single flag can break the grid again. */
  {
    const line = (over: Record<string, unknown> = {}) => ({
      id: "PL1",
      itemId: "I1",
      name: "CARRING",
      unit: "pcs",
      qty: 1,
      price: 55000,
      discountPct: 0,
      gstRate: 0,
      amount: 55000,
      ...over,
    });
    const baseInv = (over: Record<string, unknown> = {}) =>
      ({
        id: "PI1",
        number: "0009",
        date: D2,
        partyId: "P1",
        partyName: "LOTUS",
        gstEnabled: false,
        lineItems: [line()],
        subtotal: 55000,
        discount: 0,
        taxAmount: 0,
        total: 55000,
        paid: 0,
        paymentMode: "credit",
        createdAt: `${D2}T09:00:00Z`,
        ...over,
      }) as never;

    const gridHost = document.createElement("div");
    document.body.appendChild(gridHost);
    const gridRoot = createRoot(gridHost);

    /** Widest row wins as the expected width; every row must equal it. */
    const checkGrid = (label: string) => {
      // These documents contain several tables (the Invoice #/Date block is
      // one). Pick the LINE table — the one whose header row has "Qty".
      const table = Array.from(gridHost.querySelectorAll("table")).find((t) =>
        (t.rows[0]?.textContent ?? "").includes("Qty"),
      );
      assert(!!table, `${label}: found the printed line table`);
      if (!table) return;
      const widthOf = (tr: HTMLTableRowElement) =>
        Array.from(tr.cells).reduce((n, c) => n + (c.colSpan || 1), 0);
      const widths = Array.from(table.rows).map(widthOf);
      const expected = Math.max(...widths);
      const bad = widths.filter((w) => w !== expected).length;
      assert(
        bad === 0,
        `${label}: ${bad} row(s) don't span ${expected} columns — got ${widths.join(",")}`,
      );
    };

    const cases: [string, Record<string, unknown>][] = [
      ["invoice no-GST no-discount", {}],
      ["invoice no-GST with line discount", { lineItems: [line({ discountPct: 10 })] }],
      [
        "invoice with GST",
        { gstEnabled: true, taxAmount: 9900, lineItems: [line({ gstRate: 18 })] },
      ],
      [
        "invoice GST + discount",
        { gstEnabled: true, taxAmount: 9900, lineItems: [line({ gstRate: 18, discountPct: 5 })] },
      ],
    ];
    for (const [label, over] of cases) {
      await act(async () => {
        gridRoot.render(
          <PrintableInvoice inv={baseInv(over)} company={CompanyRepo.get()} mode="sale" />,
        );
      });
      checkGrid(label);
    }

    // Return notes share the same layout and had the same fault.
    const baseRet = (over: Record<string, unknown> = {}) =>
      ({
        id: "PR1",
        number: "CR-0009",
        date: D4,
        partyId: "P1",
        partyName: "LOTUS",
        gstEnabled: false,
        lineItems: [line()],
        subtotal: 55000,
        taxAmount: 0,
        total: 55000,
        createdAt: `${D4}T09:00:00Z`,
        ...over,
      }) as never;
    for (const [label, over] of [
      ["return no-GST", {}],
      [
        "return with GST",
        { gstEnabled: true, taxAmount: 9900, lineItems: [line({ gstRate: 18 })] },
      ],
    ] as [string, Record<string, unknown>][]) {
      await act(async () => {
        gridRoot.render(
          <PrintableReturn ret={baseRet(over)} company={CompanyRepo.get()} mode="sale-return" />,
        );
      });
      checkGrid(label);
    }
    gridRoot.unmount();
    gridHost.remove();
  }

  /* ── Quick entry: one amount, settled oldest bill first ───────────────
     The counter takes a round figure off a customer's whole account. This
     drives the real dialog — pick the party, type the amount, type the
     write-off — and checks that the money lands on the right bills in the
     right order and that the bills actually close. spreadFifo's arithmetic is
     pinned in the audit suite; what is pinned HERE is the wiring, which is
     what silently breaks. */
  {
    PartyRepo.add({
      id: "QP",
      createdAt: "2026-01-01T00:00:00Z",
      name: "Quick Entry Customer",
      type: "customer",
      openingBalance: 0,
    } as never);
    // Two open bills, deliberately seeded newest-first so a save that just
    // walks the list in repo order would settle the WRONG one.
    for (const [id, number, date, total] of [
      ["QB2", "INV-QB2", "2026-03-02", 10500],
      ["QB1", "INV-QB1", "2026-03-01", 10000],
    ] as const) {
      SalesRepo.add({
        id,
        createdAt: "2026-01-01T00:00:00Z",
        number,
        date,
        partyId: "QP",
        partyName: "Quick Entry Customer",
        lineItems: [],
        subtotal: total,
        discount: 0,
        shippingCharge: 0,
        taxAmount: 0,
        total,
        paid: 0,
        paymentMode: "credit",
        gstEnabled: false,
      } as never);
    }

    await renderRoute("/payments");
    const receive = findButton(/Receive Payment/);
    assert(
      !!receive,
      `quick entry: found the Receive Payment button — buttons: ${JSON.stringify(
        Array.from(document.querySelectorAll("button"))
          .map((b) => (b.textContent ?? "").trim())
          .filter(Boolean)
          .slice(0, 12),
      )}`,
    );
    if (!receive) throw new Error("quick entry: no Receive button, cannot continue");
    await act(async () => {
      receive.click();
    });
    await settleMs(120);

    const partyBox = document.querySelector(
      'input[placeholder="Type to search party…"]',
    ) as HTMLInputElement | null;
    assert(
      !!partyBox,
      `quick entry: found the party box — inputs on screen: ${JSON.stringify(
        Array.from(document.querySelectorAll("input")).map((i) => i.placeholder || i.type),
      )}`,
    );
    if (!partyBox) throw new Error("quick entry: no party box, cannot continue");
    await act(async () => {
      setInput(partyBox, "Quick Entry");
    });
    await settleMs(80);
    // The DEEPEST div with this text, not the first: when a search narrows to
    // one result, the dropdown container's textContent equals the option's
    // too, and it comes first in document order. Clicking the container does
    // nothing, because React events bubble up, not down.
    const option = Array.from(document.querySelectorAll("div"))
      .filter((d) => d.textContent === "Quick Entry Customer")
      .pop();
    assert(!!option, "quick entry: the party is suggested");
    if (!option) throw new Error("quick entry: party not suggested, cannot continue");
    await act(async () => {
      option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    await settleMs(120);

    const panel = document.body.textContent ?? "";
    assert(
      panel.includes(fmtMoney(20500)),
      "quick entry: the whole outstanding is shown, not a bill at a time",
    );
    assert(
      panel.includes("Settles oldest invoice first"),
      "quick entry: the allocation preview is on screen",
    );

    // 20,000 taken and 500 written off must close BOTH bills exactly.
    const amountBox = document.querySelector(
      'input[aria-label="Amount received"]',
    ) as HTMLInputElement | null;
    assert(!!amountBox, "quick entry: found the amount box");
    await act(async () => {
      setInput(amountBox, "20000");
    });
    await settleMs(80);
    const discountBox = document.querySelector(
      'input[aria-label="Discount or write-off"]',
    ) as HTMLInputElement | null;
    assert(!!discountBox, "quick entry: found the discount box");
    await act(async () => {
      setInput(discountBox, "500");
    });
    await settleMs(80);

    const preview = document.body.textContent ?? "";
    assert(
      preview.includes("closed") && !preview.includes("untouched"),
      "quick entry: 20,000 + 500 off closes both bills in the preview",
    );

    const confirm = findButton(/Confirm Receipt/);
    assert(!!confirm, "quick entry: found Confirm Receipt");
    await act(async () => {
      confirm!.click();
    });
    await settleMs(250);

    assert(
      SalesRepo.get("QB1")?.paid === 10000,
      `quick entry: the OLDEST bill is settled first — QB1 paid ${SalesRepo.get("QB1")?.paid} (want 10000)`,
    );
    assert(
      SalesRepo.get("QB2")?.paid === 10500,
      `quick entry: the newer bill takes the rest plus the write-off — QB2 paid ${SalesRepo.get("QB2")?.paid} (want 10500)`,
    );
    const rec = PaymentRepo.all().find((p) => p.partyId === "QP");
    assert(
      rec?.amount === 20000,
      `quick entry: the payment records the CASH taken, not the settled total — got ${rec?.amount}`,
    );
    assert(
      r2((rec?.allocations ?? []).reduce((s, a) => s + (a.discount ?? 0), 0)) === 500,
      `quick entry: the write-off is recorded as a discount — got ${JSON.stringify(rec?.allocations)}`,
    );
  }

  /* ── A rejected commit must be reported as one ───────────────────────
     Every write updates the in-memory cache the moment it is staged, so the
     screens show the new numbers before the cloud has agreed to them. When the
     commit is then rejected, Firestore rolls its own mutation back and the next
     snapshot restores the truth — but a dialog that already said "Updated 266
     items" and closed has told the shopkeeper something false, and what they
     see next looks like the app losing their work. commitBatch used to swallow
     the error, leaving callers no way to tell. */
  {
    const ok = { commit: () => Promise.resolve() } as unknown as Parameters<typeof commitBatch>[0];
    const rejected = {
      commit: () => Promise.reject(new Error("permission-denied")),
    } as unknown as Parameters<typeof commitBatch>[0];

    assert((await commitBatch(ok, "t19")) === true, "T19: a clean commit reports success");
    // The rejection is the point of the test, and commitBatch logs it — this
    // muffles the expected noise so the harness's "no console errors" rule
    // still means something for everything else.
    const realError = console.error;
    console.error = () => {};
    const rejectedResult = await commitBatch(rejected, "t19");
    console.error = realError;
    assert(rejectedResult === false, "T19: a rejected commit reports failure");
    assert((await commitBatch(null, "t19")) === true, "T19: the SSR no-op is not a failure");
  }

  /* ── Bulk Update actually writes what was typed ───────────────────────
     The client reported a bulk stock change disagreeing with the item's own
     page and the items list afterwards. This drives the real dialog the way
     a shopkeeper does — search, type, search again, type, save — and then
     checks the number on BOTH screens plus the audit trail, because those
     are the three places a stock correction has to reach.

     It also covers the flow that only a real catalogue produces: the edited
     rows are scrolled out of the window by the time Update is pressed, so a
     save that only looked at mounted rows would silently drop them. */
  {
    // Enough filler for the list to actually scroll — the window only drops a
    // row when there is something below it to scroll to, and without that the
    // "edits survive being unmounted" half of this test proves nothing.
    for (let i = 0; i < 120; i++) {
      ItemRepo.add({
        id: `FILL${i}`,
        createdAt: "2026-01-01T00:00:00Z",
        name: `Filler Item ${i}`,
        unit: "pcs",
        gstRate: 18,
        purchasePrice: 100,
        salePrice: 150,
        stock: 5,
        openingStock: 5,
      } as never);
    }
    // Added last, so these two sit at the top of the list: on page one of the
    // Items screen, and in the grid's first window until it is scrolled.
    for (const [id, stock] of [
      ["BU1", 17],
      ["BU2", 39],
    ] as const) {
      ItemRepo.add({
        id,
        createdAt: "2026-01-01T00:00:00Z",
        name: `Bulk Save ${id}`,
        unit: "pcs",
        gstRate: 18,
        purchasePrice: 100,
        salePrice: 150,
        stock,
        openingStock: stock,
      } as never);
    }

    const h = document.createElement("div");
    document.body.appendChild(h);
    const r = createRoot(h);
    await act(async () => {
      r.render(<BulkUpdateItemsDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    });
    await settleMs(80);

    const stockTab = Array.from(document.querySelectorAll('[role="radio"]')).find((b) =>
      (b.textContent ?? "").trim().startsWith("Stock"),
    ) as HTMLButtonElement | undefined;
    assert(!!stockTab, "bulk save: found the Stock tab");
    await act(async () => {
      stockTab!.click();
    });
    await settleMs(60);

    const search = document.querySelector(
      'input[placeholder="Search items…"]',
    ) as HTMLInputElement | null;
    assert(!!search, "bulk save: found the search box");

    for (const [name, want] of [
      ["Bulk Save BU1", 111],
      ["Bulk Save BU2", 222],
    ] as const) {
      await act(async () => {
        setInput(search!, name);
      });
      await settleMs(60);
      const cells = gridRow(name);
      assert(!!cells, `bulk save: ${name} is findable by search`);
      if (cells) {
        await act(async () => {
          setInput(cells[1], String(want));
        });
        await settleMs(40);
      }
    }

    // Clear the search and scroll away, so NEITHER edited row is mounted when
    // Update is pressed. A save that walked the rendered rows instead of the
    // catalogue would drop both edits here and report success anyway.
    await act(async () => {
      setInput(search!, "");
    });
    await settleMs(60);
    // The grid's scroll container is the table's own parent — found that way
    // rather than by class, so a Tailwind rename cannot quietly turn this
    // into a no-op that still passes.
    const scroller = document.querySelector('[role="dialog"] table')
      ?.parentElement as HTMLDivElement | null;
    assert(!!scroller, "bulk save: found the grid scroller");
    await act(async () => {
      scroller!.scrollTop = scroller!.scrollHeight;
      scroller!.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await settleMs(120);
    assert(
      !gridRow("Bulk Save BU1") && !gridRow("Bulk Save BU2"),
      "bulk save: the edited rows really are unmounted before saving",
    );

    const update = findButton(/^Update/);
    assert(
      (update?.textContent ?? "").includes("(2)"),
      `bulk save: both edits are counted — button says ${JSON.stringify(update?.textContent)}`,
    );
    await act(async () => {
      update!.click();
    });
    await settleMs(250);

    assert(
      ItemRepo.get("BU1")?.stock === 111 && ItemRepo.get("BU2")?.stock === 222,
      `bulk save: typed values land — BU1=${ItemRepo.get("BU1")?.stock} (want 111), BU2=${ItemRepo.get("BU2")?.stock} (want 222)`,
    );
    // Stock moves only through an audited adjustment, never an absolute write.
    const adjusted = StockAdjustmentRepo.all().filter(
      (a) => a.itemId === "BU1" || a.itemId === "BU2",
    );
    assert(
      adjusted.length === 2 &&
        adjusted.every((a) => a.type === "add" && a.reason === "Bulk update"),
      `bulk save: each stock change writes its audit row — got ${JSON.stringify(adjusted.map((a) => `${a.itemId}:${a.type}:${a.qty}`))}`,
    );
    // And the result must be self-consistent, or Fix Calculations would
    // "repair" a correction the shopkeeper just made on purpose.
    const drift = planStockRepair({
      items: ItemRepo.all(),
      sales: SalesRepo.all(),
      purchases: PurchaseRepo.all(),
      saleReturns: SaleReturnRepo.all(),
      purchaseReturns: [],
      stockAdjustments: StockAdjustmentRepo.all(),
    }).filter((d) => d.id === "BU1" || d.id === "BU2");
    assert(
      drift.length === 0,
      `bulk save: the corrected items must not read as drift — ${JSON.stringify(drift)}`,
    );

    r.unmount();
    h.remove();

    // The two screens the client compared.
    const itemsList = await renderRoute("/items");
    assert(itemsList.includes("111 pcs"), "bulk save: the items list shows the new stock");
    const itemPage = await renderRoute("/items/BU1");
    assert(itemPage.includes("111 pcs"), "bulk save: the item's own page shows the new stock");
    assert(
      itemPage.includes("Bulk update"),
      "bulk save: the item's history shows where the change came from",
    );
  }

  /* ── Bulk rename cannot manufacture two identical items ───────────────
     Renaming in bulk shipped with no guard, while the single-item form has
     always blocked duplicates. Two items sharing a name is precisely how the
     list and an item's own page start disagreeing about which one is which. */
  {
    const h = document.createElement("div");
    document.body.appendChild(h);
    const r = createRoot(h);
    await act(async () => {
      r.render(<BulkUpdateItemsDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    });
    await settleMs(80);

    const infoTab = Array.from(document.querySelectorAll('[role="radio"]')).find((b) =>
      (b.textContent ?? "").trim().startsWith("Item Information"),
    ) as HTMLButtonElement | undefined;
    await act(async () => {
      infoTab!.click();
    });
    await settleMs(60);

    const search = document.querySelector('input[placeholder="Search items…"]') as HTMLInputElement;
    await act(async () => {
      setInput(search, "Bulk Save BU2");
    });
    await settleMs(60);
    const row = gridRow("Bulk Save BU2");
    assert(!!row, "bulk rename: found the row to rename");
    // Rename it to the OTHER item's name. (Every step below re-finds the row
    // by its CURRENT name: if the guard under test is missing, the rename
    // goes through and the old handle would be stale — this must report the
    // broken guard, not crash the harness on it.)
    await act(async () => {
      setInput(row![0], "Bulk Save BU1");
    });
    await settleMs(60);
    await act(async () => {
      findButton(/^Update/)!.click();
    });
    await settleMs(200);
    assert(
      ItemRepo.get("BU2")?.name === "Bulk Save BU2",
      `bulk rename: a duplicate name is refused — BU2 is now ${JSON.stringify(ItemRepo.get("BU2")?.name)}`,
    );

    // A blank name is refused too.
    const stillThere = gridRow("Bulk Save BU1") ?? row;
    await act(async () => {
      setInput(stillThere![0], "   ");
    });
    await settleMs(60);
    await act(async () => {
      findButton(/^Update/)!.click();
    });
    await settleMs(200);
    assert(
      ItemRepo.get("BU2")?.name === "Bulk Save BU2",
      `bulk rename: a blank name is refused — BU2 is now ${JSON.stringify(ItemRepo.get("BU2")?.name)}`,
    );

    /* A legal rename made in the SAME save as a stock change: the audit row
       has to be filed under the new name. It used to copy the stored one, so
       the item's history showed a movement labelled with a name that item no
       longer had. */
    const toRename = gridRow("   ") ?? gridRow("Bulk Save BU1") ?? row;
    await act(async () => {
      setInput(toRename![0], "Bulk Save Renamed");
    });
    await settleMs(60);
    const stockTab2 = Array.from(document.querySelectorAll('[role="radio"]')).find((b) =>
      (b.textContent ?? "").trim().startsWith("Stock"),
    ) as HTMLButtonElement;
    await act(async () => {
      stockTab2.click();
    });
    await settleMs(60);
    const renamedRow = gridRow("Bulk Save Renamed");
    assert(!!renamedRow, "bulk rename: the renamed row keeps its edit across tabs");
    if (renamedRow) {
      await act(async () => {
        setInput(renamedRow[1], "500");
      });
      await settleMs(60);
    }
    await act(async () => {
      findButton(/^Update/)!.click();
    });
    await settleMs(250);
    assert(
      ItemRepo.get("BU2")?.name === "Bulk Save Renamed" && ItemRepo.get("BU2")?.stock === 500,
      `bulk rename: a legal rename saves alongside the stock change — ${JSON.stringify(ItemRepo.get("BU2")?.name)} / ${ItemRepo.get("BU2")?.stock}`,
    );
    const renameAdj = StockAdjustmentRepo.all().filter((a) => a.itemId === "BU2");
    assert(
      renameAdj.some((a) => a.itemName === "Bulk Save Renamed"),
      `bulk rename: the audit row carries the NEW name — got ${JSON.stringify(renameAdj.map((a) => a.itemName))}`,
    );

    r.unmount();
    h.remove();
  }

  /* ── A search survives opening a result and coming back ───────────────
     "I searched, opened one, pressed back, and it had forgotten everything."
     The list's search was component state, so it died with the unmount. */
  {
    const list = await renderRoute("/items");
    const box = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null;
    assert(!!box, `sticky search: found the items search box — page has ${list.length} chars`);
    if (box) {
      await act(async () => {
        setInput(box, "Bulk Save BU1");
      });
      await settleMs(80);
      // Leave and come back the way the client does: open a result, return.
      await renderRoute("/items/BU1");
      const backAgain = await renderRoute("/items");
      const box2 = document.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement | null;
      assert(
        box2?.value === "Bulk Save BU1",
        `sticky search: the search is still there on return — got ${JSON.stringify(box2?.value)}`,
      );
      assert(
        backAgain.includes("Bulk Save BU1"),
        "sticky search: and the list is still filtered by it",
      );
      // Clearing it must actually clear it — remembered state, not stuck state.
      await act(async () => {
        setInput(box2, "");
      });
      await settleMs(60);
      await renderRoute("/items/BU1");
      await renderRoute("/items");
      const box3 = document.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement | null;
      assert(box3?.value === "", "sticky search: clearing it sticks too");
    }
  }

  /* ── Back is ONE step, by key as well as by button ────────────────────
     The detail pages used to navigate FORWARD to their list, which pushes a
     new history entry — so the browser's own Back button then returned to
     the detail page and the user was stuck in a loop. */
  {
    // Arrive at the item from the PARTIES page, so "back" has somewhere real
    // to go and we can prove it goes THERE — not to the items list, which is
    // what the old forward-navigation did regardless of where you came from.
    const detail = await renderRoute(["/parties", "/items/BU1"]);
    assert(detail.includes("Bulk Save BU1"), "back: the item detail page rendered");

    const backBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.getAttribute("aria-label") === "Go back",
    );
    assert(!!backBtn, "back: the detail page has a back button");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    const afterEsc = await readMounted();
    assert(!afterEsc.includes("Bulk Save BU1"), "back: Escape leaves the detail page");
    assert(
      afterEsc.includes("customers / suppliers"),
      `back: Escape returns to where we CAME FROM (parties), not the items list — landed on ${JSON.stringify(afterEsc.slice(0, 120))}`,
    );

    // Backspace is the other habit, and must behave identically.
    const detail2 = await renderRoute(["/parties", "/items/BU1"]);
    assert(detail2.includes("Bulk Save BU1"), "back: mounted the detail page again");
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
    });
    const afterBksp = await readMounted();
    assert(!afterBksp.includes("Bulk Save BU1"), "back: Backspace goes back too");

    // Typing must be untouchable: Backspace in a text box deletes a
    // character, it does not leave the page.
    const detail3 = await renderRoute(["/parties", "/items/BU1"]);
    const anyInput = document.querySelector("input") as HTMLInputElement | null;
    if (anyInput) {
      await act(async () => {
        anyInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }));
      });
      const afterTyping = await readMounted();
      assert(
        afterTyping.includes("Bulk Save BU1"),
        "back: Backspace while typing does NOT navigate",
      );
    } else {
      assert(detail3.length > 0, "back: (no input on the detail page to test typing with)");
    }

    // A key the shortcut must not claim.
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });
    const afterOrdinary = await readMounted();
    assert(afterOrdinary.includes("Bulk Save BU1"), "back: an ordinary key does nothing");
  }

  /* ── Category suggests what already exists, and still takes a new one ──
     Three spellings of one shelf ("Charger", "charger", "Chargers") is what a
     free-text box produces, and it makes the category filter meaningless. */
  {
    ItemRepo.add({
      id: "CAT1",
      createdAt: "2026-01-01T00:00:00Z",
      name: "Category Probe Item",
      unit: "pcs",
      gstRate: 18,
      purchasePrice: 10,
      salePrice: 20,
      stock: 1,
      openingStock: 1,
      category: "Chargers",
    } as never);

    const h = document.createElement("div");
    document.body.appendChild(h);
    const r = createRoot(h);
    await act(async () => {
      r.render(<BulkUpdateItemsDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    });
    await settleMs(80);
    const infoTab = Array.from(document.querySelectorAll('[role="radio"]')).find((b) =>
      (b.textContent ?? "").trim().startsWith("Item Information"),
    ) as HTMLButtonElement;
    await act(async () => {
      infoTab.click();
    });
    await settleMs(60);
    const search = document.querySelector('input[placeholder="Search items…"]') as HTMLInputElement;
    await act(async () => {
      setInput(search, "Category Probe Item");
    });
    await settleMs(80);

    const catCell = document.querySelector(
      'input[aria-label="category for Category Probe Item"]',
    ) as HTMLInputElement | null;
    assert(!!catCell, "category: the grid cell is a picker");
    if (catCell) {
      await act(async () => {
        catCell.focus();
      });
      await settleMs(60);
      const listbox = document.querySelector('[role="listbox"]');
      assert(!!listbox, "category: focusing opens the list of existing categories");
      assert(
        (listbox?.textContent ?? "").includes("Chargers"),
        `category: an existing category is offered — saw ${JSON.stringify(listbox?.textContent)}`,
      );

      // A value nobody has used yet is offered as an explicit "add", so a new
      // shelf is possible without the box quietly inviting duplicates.
      await act(async () => {
        setInput(catCell, "Screen Guard");
      });
      await settleMs(60);
      const addRow = document.querySelector('[role="listbox"]')?.textContent ?? "";
      assert(
        addRow.includes("Add") && addRow.includes("Screen Guard"),
        `category: a brand new value can be added — saw ${JSON.stringify(addRow)}`,
      );

      // Typing something that ALREADY exists must not offer to add it again.
      await act(async () => {
        setInput(catCell, "Chargers");
      });
      await settleMs(60);
      assert(
        !(document.querySelector('[role="listbox"]')?.textContent ?? "").includes("Add"),
        "category: an existing value is not offered as a new one",
      );
    }
    r.unmount();
    h.remove();
  }

  /* ── The bulk ledger download is the SAME document as the party page's ──
     Selecting parties and downloading produced a cut-down six-column PDF with
     no item breakdown, while opening one party and downloading gave the full
     nine-column statement. Same words on the button, visibly different file.
     This pins the printable statement against the columns the party page
     actually shows, so the two cannot drift apart again. */
  {
    const statementParty = PartyRepo.get("P1")!;
    const built = buildPartyStatement(statementParty, {
      sales: SalesRepo.all(),
      purchases: PurchaseRepo.all(),
      saleReturns: SaleReturnRepo.all(),
      purchaseReturns: PurchaseReturnRepo.all(),
      payments: PaymentRepo.all(),
    });

    const h = document.createElement("div");
    document.body.appendChild(h);
    const r = createRoot(h);
    await act(async () => {
      r.render(
        <PrintablePartyStatement
          party={statementParty}
          rows={built.rows}
          company={CompanyRepo.get()}
          periodLabel="All transactions"
          format="full"
        />,
      );
    });
    await settleMs(60);
    const text = h.textContent ?? "";

    // Every column the statement page shows, by name.
    for (const col of [
      "Date",
      "Txn Type",
      "Ref No.",
      "Payment Status",
      "Total",
      "Received/Paid",
      "Txn Balance",
      "Receivable Balance",
      "Payable Balance",
    ]) {
      assert(text.includes(col), `bulk ledger: the full PDF has the "${col}" column`);
    }
    // And the per-transaction item breakdown, which was missing entirely.
    assert(
      text.includes("Item name") && text.includes("Price/Unit") && text.includes("Sub Total"),
      "bulk ledger: the full PDF breaks each bill down by item",
    );
    assert(
      text.includes("USB Cable"),
      `bulk ledger: a real line item reaches the page — ${JSON.stringify(text.slice(0, 200))}`,
    );
    // The numbers are the statement's own, not recomputed.
    const closing = built.rows.length ? built.rows[built.rows.length - 1].balance : 0;
    assert(
      text.includes(fmtMoney(Math.abs(closing))),
      `bulk ledger: it closes on the statement's balance ${fmtMoney(Math.abs(closing))}`,
    );

    // The simple format stays the plain six-column ledger.
    await act(async () => {
      r.render(
        <PrintablePartyStatement
          party={statementParty}
          rows={built.rows}
          company={CompanyRepo.get()}
          periodLabel="All transactions"
          format="simple"
        />,
      );
    });
    await settleMs(60);
    const simple = h.textContent ?? "";
    assert(
      simple.includes("Particulars") && simple.includes("Credit") && simple.includes("Debit"),
      "bulk ledger: the simple format is the plain Credit/Debit ledger",
    );
    assert(
      !simple.includes("Payment Status"),
      "bulk ledger: and does NOT carry the full statement's columns",
    );
    r.unmount();
    h.remove();
  }

  /* ── Cash ↔ Bank transfer moves both sides, atomically ────────────────
     Money leaving the drawer without arriving in the bank is the one outcome
     that would quietly cost the shop money, so both records go on one batch. */
  {
    BankRepo.add({
      id: "TB1",
      createdAt: "2026-01-01T00:00:00Z",
      name: "Transfer Test Bank",
      openingBalance: 0,
      balance: 5000,
    } as never);

    const cashBefore = cashFlows(
      SalesRepo.all(),
      PurchaseRepo.all(),
      ExpenseRepo.all(),
      PaymentRepo.all(),
      CashAdjustmentRepo.all(),
    ).reduce((s, e) => s + e.in - e.out, 0);

    const h = document.createElement("div");
    document.body.appendChild(h);
    const r = createRoot(h);
    await act(async () => {
      r.render(<CashBankTransferDialog open onOpenChange={() => {}} onSaved={() => {}} />);
    });
    await settleMs(80);

    assert(
      (document.body.textContent ?? "").includes("Transfer between Cash and Bank"),
      "transfer: the dialog rendered",
    );
    // Cash in hand is shown, so the shopkeeper can see what is being moved.
    assert(
      (document.body.textContent ?? "").includes(fmtMoney(cashBefore)),
      `transfer: it shows cash in hand ${fmtMoney(cashBefore)}`,
    );

    // Scope to THIS dialog: earlier routes stay mounted, and an unrelated
    // control left behind by one of them is what this used to grab.
    const dlg = document.querySelector('[role="dialog"]')!;
    const bankBtn = dlg.querySelector('[role="combobox"]') as HTMLButtonElement | null;
    assert(!!bankBtn, "transfer: found the account picker");
    if (bankBtn) {
      // Where the next field sits before the list opens. A dropdown that
      // takes up space instead of floating would shove it down the dialog —
      // which is what a static popup does, and looks broken.
      const amountBefore = (
        dlg.querySelector('input[aria-label="Transfer amount"]') as HTMLElement | null
      )?.getBoundingClientRect().top;
      await act(async () => {
        bankBtn.click();
      });
      await settleMs(60);
      const list = dlg.querySelector('[role="listbox"]');
      assert(!!list, "transfer: the account list opens as the app's own popup, not the OS one");
      // Each row carries the balance next to the name — the reason for having
      // a real popup rather than a native <option>, which cannot lay that out.
      assert(
        (list?.textContent ?? "").includes("Transfer Test Bank") &&
          (list?.textContent ?? "").includes(fmtMoney(5000)),
        `transfer: the list shows each account with its balance — ${JSON.stringify(
          list?.textContent?.slice(0, 120),
        )}`,
      );
      // It has to LOOK like part of this dialog, which is the whole point of
      // replacing the native control: attached to the button, the same width,
      // and painted opaque so the fields underneath do not show through.
      if (list) {
        const b = bankBtn.getBoundingClientRect();
        const l = list.getBoundingClientRect();
        assert(
          Math.abs(l.top - b.bottom) < 12,
          `transfer: the popup hangs off the button — button bottom ${Math.round(
            b.bottom,
          )}, list top ${Math.round(l.top)}`,
        );
        assert(
          Math.abs(l.width - b.width) < 2,
          `transfer: the popup matches the field's width — ${Math.round(l.width)} vs ${Math.round(
            b.width,
          )}`,
        );
        const amountAfter = (
          dlg.querySelector('input[aria-label="Transfer amount"]') as HTMLElement | null
        )?.getBoundingClientRect().top;
        assert(
          amountBefore != null && amountAfter != null && Math.abs(amountAfter - amountBefore) < 1,
          `transfer: the popup FLOATS over the form instead of pushing it down — Amount moved from ${Math.round(
            amountBefore ?? -1,
          )} to ${Math.round(amountAfter ?? -1)}`,
        );
        assert(
          amountAfter != null && l.bottom > amountAfter,
          "transfer: and actually covers the field beneath it",
        );
        const bg = getComputedStyle(list).backgroundColor;
        assert(
          bg !== "" && bg !== "transparent" && !bg.includes("rgba(0, 0, 0, 0)"),
          `transfer: the popup is painted, not see-through — background ${bg}`,
        );
      }
      const option = Array.from(dlg.querySelectorAll('[role="option"]')).find((o) =>
        (o.textContent ?? "").includes("Transfer Test Bank"),
      );
      assert(!!option, "transfer: the seeded account is listed");
      await act(async () => {
        option!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      });
      await settleMs(60);
      assert(
        !dlg.querySelector('[role="listbox"]'),
        "transfer: picking an account closes the list",
      );
      assert(
        (bankBtn.textContent ?? "").includes("Transfer Test Bank"),
        `transfer: and the button shows the choice — ${JSON.stringify(bankBtn.textContent)}`,
      );
    }

    const amountBox = dlg.querySelector(
      'input[aria-label="Transfer amount"]',
    ) as HTMLInputElement | null;
    assert(!!amountBox, "transfer: found the amount box");
    await act(async () => {
      setInput(amountBox, "1500");
    });
    await settleMs(60);

    const confirmBtn = Array.from(dlg.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Transfer",
    );
    assert(!!confirmBtn, "transfer: found the Transfer button");
    await act(async () => {
      confirmBtn!.click();
    });
    await settleMs(200);

    assert(
      BankRepo.get("TB1")?.balance === 6500,
      `transfer: the bank went UP by the amount — ${BankRepo.get("TB1")?.balance} (want 6500)`,
    );
    const cashAfter = cashFlows(
      SalesRepo.all(),
      PurchaseRepo.all(),
      ExpenseRepo.all(),
      PaymentRepo.all(),
      CashAdjustmentRepo.all(),
    ).reduce((s, e) => s + e.in - e.out, 0);
    assert(
      Math.abs(cashAfter - (cashBefore - 1500)) < 0.01,
      `transfer: and cash went DOWN by the same — ${cashAfter} (want ${cashBefore - 1500})`,
    );
    // One record on each side, both describing the same movement.
    const txn = BankTxnRepo.all().filter((t) => t.bankId === "TB1");
    assert(
      txn.length === 1 && txn[0].type === "deposit" && txn[0].amount === 1500,
      `transfer: one bank record — ${JSON.stringify(txn.map((t) => `${t.type}:${t.amount}`))}`,
    );
    const adj = CashAdjustmentRepo.all().filter((a) => (a.reason ?? "").includes("Transfer"));
    assert(
      adj.length === 1 && adj[0].type === "reduce" && adj[0].amount === 1500,
      `transfer: one cash record — ${JSON.stringify(adj.map((a) => `${a.type}:${a.amount}`))}`,
    );
    assert(
      (adj[0]?.reason ?? "").includes("Transfer Test Bank"),
      `transfer: the cash side names the account — ${JSON.stringify(adj[0]?.reason)}`,
    );
    r.unmount();
    h.remove();
  }

  /* ── Bulk Update with a real-sized catalogue ──────────────────────────
     The client's shop has ~1,400 items and the screen froze on open,
     because every row mounted at once and each carries several live
     inputs. It pages now — this proves only a page reaches the DOM, and
     that mounting stays fast enough to be usable. */
  for (let i = 0; i < 1400; i++) {
    ItemRepo.add({
      id: `BULK${i}`,
      createdAt: "2026-01-01T00:00:00Z",
      name: `Bulk Test Item ${i}`,
      unit: "pcs",
      gstRate: 18,
      purchasePrice: 100,
      salePrice: 150,
      stock: 5,
      openingStock: 5,
    } as never);
  }

  const bulkHost = document.createElement("div");
  document.body.appendChild(bulkHost);
  const bulkRoot = createRoot(bulkHost);
  const startedAt = performance.now();
  await act(async () => {
    bulkRoot.render(<BulkUpdateItemsDialog open onOpenChange={() => {}} onSaved={() => {}} />);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 120));
  });
  const mountMs = performance.now() - startedAt;

  // The dialog portals into document.body, so count across the document.
  // The list is no longer paged — the whole catalogue scrolls — but only the
  // rows on screen are mounted (see useWindowedRows). Both the desktop table
  // and the phone card list exist at once (switched by CSS), so a window of
  // ~30 rows each with a name + several fields lands well under this ceiling.
  // Mounting all 1400 would be ~11,000 controls, which is what froze it.
  const inputCount = document.querySelectorAll("input").length;
  assert(
    inputCount > 0 && inputCount < 600,
    `bulk update: only a page of rows may mount — found ${inputCount} inputs for 1400+ items`,
  );
  assert(
    mountMs < 4000,
    `bulk update: opening with 1400 items must not hang — took ${Math.round(mountMs)}ms`,
  );
  // The dialog renders through a portal, so it is NOT inside bulkHost.
  assert(
    (document.body.textContent ?? "").includes("Bulk Update Items"),
    "bulk update: dialog actually rendered",
  );

  // The dialog's close button is absolutely positioned in the corner, so the
  // header content must not run underneath it — the tab group did, leaving
  // the X sitting on top of "Item Information".
  {
    const closeBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent ?? "").trim() === "Close",
    );
    // Target THIS dialog's tab group by its label — other radiogroups
    // (payment ModePills) can still be in the document from earlier mounts.
    const tabs = document.querySelector('[role="radiogroup"][aria-label="What to update"]');
    assert(!!closeBtn, "bulk update: found the close button");
    assert(!!tabs, "bulk update: found the mode tabs");
    if (closeBtn && tabs) {
      const c = closeBtn.getBoundingClientRect();
      const t = tabs.getBoundingClientRect();
      const overlaps = t.right > c.left && t.left < c.right && t.bottom > c.top && t.top < c.bottom;
      assert(
        !overlaps,
        `bulk update: tabs must not sit under the close button — tabs ${Math.round(t.left)}..${Math.round(t.right)} x ${Math.round(t.top)}..${Math.round(t.bottom)}; X ${Math.round(c.left)}..${Math.round(c.right)} x ${Math.round(c.top)}..${Math.round(c.bottom)}; vw=${window.innerWidth}`,
      );
    }
  }
  bulkRoot.unmount();
  bulkHost.remove();

  if (root) root.unmount();
  if (host) host.remove();
  return R;
}
