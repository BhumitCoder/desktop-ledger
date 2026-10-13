import {
  ItemRepo,
  PurchaseRepo,
  SalesRepo,
  SaleReturnRepo,
  PurchaseReturnRepo,
  StockAdjustmentRepo,
} from "@/repositories";
import { repoStoreVersion } from "@/repositories/base";
import { fifoCosts, stockValueAt, type FifoInput, type FifoResult } from "@/lib/fifo";
import { useRepoMemo } from "@/hooks/useRepoData";

/* One replay per change to the books, shared by every screen that asks.
   The dashboard, the stock report and an item page open side by side in the
   workspace tabs would otherwise each replay the whole history. */
let cached: { version: number; result: FifoResult } | null = null;

const books = (): FifoInput => ({
  items: ItemRepo.all(),
  purchases: PurchaseRepo.all(),
  sales: SalesRepo.all(),
  saleReturns: SaleReturnRepo.all(),
  purchaseReturns: PurchaseReturnRepo.all(),
  adjustments: StockAdjustmentRepo.all(),
});

/** The FIFO costing of the books as they stand right now. */
export function currentFifo(): FifoResult {
  const version = repoStoreVersion();
  if (cached && cached.version === version) return cached.result;
  const result = fifoCosts(books());
  cached = { version, result };
  return result;
}

/* Opening and closing stock for the periods on screen, one replay each per
   change to the books. */
let atCache: { version: number; values: Map<string, number> } | null = null;

/**
 * What the stock was worth before a period opened (`inclusive: false`, its
 * first day) or when it closed (`inclusive: true`, its last day). No date
 * means "with nothing cut off" on the closing side and "before anything
 * happened" on the opening side.
 */
export function stockValueOn(date: string, inclusive: boolean): number {
  const version = repoStoreVersion();
  if (!atCache || atCache.version !== version) atCache = { version, values: new Map() };
  const key = `${date}|${inclusive}`;
  const hit = atCache.values.get(key);
  if (hit !== undefined) return hit;
  const value =
    !date && inclusive ? stockValueAt(books()) : stockValueAt(books(), { date, inclusive });
  atCache.values.set(key, value);
  return value;
}

/** currentFifo(), re-read whenever the books change. */
export function useFifo(): FifoResult {
  return useRepoMemo(() => currentFifo());
}
