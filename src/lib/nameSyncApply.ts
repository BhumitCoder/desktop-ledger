import {
  ExpenseRepo,
  ItemRepo,
  PartyRepo,
  PayeeRepo,
  PaymentRepo,
  PurchaseRepo,
  PurchaseReturnRepo,
  SaleReturnRepo,
  SalesRepo,
  StockAdjustmentRepo,
} from "@/repositories";
import { commitBatch, newBatch } from "@/repositories/base";
import { planNameSync, type NameFix, type NameSyncData, type NameSyncScope } from "@/lib/nameSync";

/** The books as they stand, for planNameSync. */
export function nameSyncData(): NameSyncData {
  return {
    parties: PartyRepo.all(),
    items: ItemRepo.all(),
    payees: PayeeRepo.all(),
    sales: SalesRepo.all(),
    purchases: PurchaseRepo.all(),
    saleReturns: SaleReturnRepo.all(),
    purchaseReturns: PurchaseReturnRepo.all(),
    payments: PaymentRepo.all(),
    expenses: ExpenseRepo.all(),
    stockAdjustments: StockAdjustmentRepo.all(),
  };
}

const repoOf = {
  sales: SalesRepo,
  purchases: PurchaseRepo,
  saleReturns: SaleReturnRepo,
  purchaseReturns: PurchaseReturnRepo,
  payments: PaymentRepo,
  expenses: ExpenseRepo,
  stockAdjustments: StockAdjustmentRepo,
} as const;

/** Firestore takes at most 500 writes in one batch; stay well under. */
const CHUNK = 400;

/** Write the fixes. Resolves to whether every batch reached the cloud. */
export async function applyNameFixes(fixes: NameFix[]): Promise<boolean> {
  for (let i = 0; i < fixes.length; i += CHUNK) {
    const batch = newBatch();
    for (const f of fixes.slice(i, i + CHUNK)) {
      const repo = repoOf[f.collection] as unknown as {
        updateBatched: (b: typeof batch, id: string, p: Record<string, unknown>) => unknown;
      };
      repo.updateBatched(batch, f.id, f.patch);
    }
    if (!(await commitBatch(batch, "keep names in step"))) return false;
  }
  return true;
}

/**
 * After a party, item or payee is renamed: carry the new name onto every
 * record that copies it. Planned against the cache, which already holds the
 * new name. Returns how many records changed, or null if a write failed —
 * Settings › Fix Calculations finds anything left behind.
 */
export async function syncNamesAfterRename(scope: NameSyncScope): Promise<number | null> {
  const fixes = planNameSync(nameSyncData(), scope);
  if (!fixes.length) return 0;
  return (await applyNameFixes(fixes)) ? fixes.length : null;
}
