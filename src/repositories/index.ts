import { Repository } from "./base";
import type {
  Party,
  Item,
  Invoice,
  Expense,
  BankAccount,
  BankTxn,
  Payment,
  Return,
  Company,
} from "@/types";

export const PartyRepo = new Repository<Party>("bz.parties");
export const ItemRepo = new Repository<Item>("bz.items");
export const SalesRepo = new Repository<Invoice>("bz.sales");
export const PurchaseRepo = new Repository<Invoice>("bz.purchases");
export const SaleReturnRepo = new Repository<Return>("bz.sale-returns");
export const PurchaseReturnRepo = new Repository<Return>("bz.purchase-returns");
export const ExpenseRepo = new Repository<Expense>("bz.expenses");
export const BankRepo = new Repository<BankAccount>("bz.banks");
export const BankTxnRepo = new Repository<BankTxn>("bz.bankTxns");
export const PaymentRepo = new Repository<Payment>("bz.payments");

const COMPANY_KEY = "bz.company";
const defaultCompany: Company = {
  name: "My Company",
  currency: "INR",
  invoicePrefix: "INV-",
  purchasePrefix: "PUR-",
  enableGst: true,
};

export const CompanyRepo = {
  get(): Company {
    if (typeof window === "undefined") return defaultCompany;
    try {
      const raw = localStorage.getItem(COMPANY_KEY);
      return raw ? { ...defaultCompany, ...JSON.parse(raw) } : defaultCompany;
    } catch {
      return defaultCompany;
    }
  },
  save(c: Company) {
    if (typeof window === "undefined") return;
    localStorage.setItem(COMPANY_KEY, JSON.stringify(c));
  },
};

export function nextInvoiceNumber(prefix: string, existing: { number: string }[]): string {
  const nums = existing
    .map((i) => parseInt(i.number.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
