import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import { NumInput } from "@/components/NumInput";
import { ArrowRight, Banknote, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  BankRepo,
  BankTxnRepo,
  CashAdjustmentRepo,
  SalesRepo,
  PurchaseRepo,
  ExpenseRepo,
  PaymentRepo,
} from "@/repositories";
import { newBatch, commitBatch } from "@/repositories/base";
import { useRepoMemo } from "@/hooks/useRepoData";
import { cashFlows } from "@/lib/ledger";
import { fmtMoney, today } from "@/lib/format";

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Move money between the cash drawer and a bank account.
 *
 * The two halves of this already existed — a bank Deposit/Withdraw could tick
 * "from cash on hand" and write the matching cash adjustment — but only from
 * inside one bank account's screen, and only as a checkbox on an action named
 * something else. Nothing on the Cash page offered it at all, so "I put the
 * day's takings into the bank" had no obvious home.
 *
 * It writes the SAME two records that checkbox always did, in one batch:
 * a BankTxn (which moves the account's stored balance) and a CashAdjustment
 * (which moves derived cash-in-hand). Deliberately not a new kind of record —
 * every existing report, the day book and the bank ledger already understand
 * these two, and inventing a third would mean teaching all of them a new
 * shape for money that is already fully described.
 *
 * Both records are staged on one batch, so a transfer can never half-happen:
 * cash leaving the drawer without arriving in the bank is the one outcome
 * that would quietly cost the shop money.
 */
/** One side of the transfer — the drawer, or the account. Declared out here
 *  on purpose: inside the component it would be a new component type on every
 *  render, so React would tear the tile down and rebuild it on each keystroke
 *  rather than updating the number in place. */
function Side({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="flex-1 min-w-0 rounded-lg border bg-gray-50/70 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-[15px] font-bold tabular-nums mt-0.5">{fmtMoney(value)}</div>
    </div>
  );
}

export function CashBankTransferDialog({
  open,
  onOpenChange,
  onSaved,
  initialBankId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  /** Preselect an account — set when opened from that account's own page. */
  initialBankId?: string;
}) {
  const banks = useRepoMemo(() => BankRepo.all());
  const [direction, setDirection] = useState<"toBank" | "toCash">("toBank");
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const cashInHand = useRepoMemo(() =>
    cashFlows(
      SalesRepo.all(),
      PurchaseRepo.all(),
      ExpenseRepo.all(),
      PaymentRepo.all(),
      CashAdjustmentRepo.all(),
    ).reduce((s, e) => s + e.in - e.out, 0),
  );

  useEffect(() => {
    if (!open) return;
    setDirection("toBank");
    setBankId(initialBankId ?? banks[0]?.id ?? "");
    setAmount(0);
    setDate(today());
    setNotes("");
    setSaving(false);
    // `banks` is intentionally not a dependency: reopening the dialog should
    // reset the form, a background sync should not wipe what is half-typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialBankId]);

  const bank = useMemo(() => banks.find((b) => b.id === bankId), [banks, bankId]);
  const toBank = direction === "toBank";
  const bankBalance = bank?.balance ?? 0;

  const cashAfter = r2(cashInHand + (toBank ? -amount : amount));
  const bankAfter = r2(bankBalance + (toBank ? amount : -amount));

  const save = () => {
    if (saving) return;
    if (!bank) {
      toast.error("Select a bank account");
      return;
    }
    const n = r2(amount);
    if (!n || n <= 0) {
      toast.error("Enter an amount to transfer");
      return;
    }
    if (!date) {
      toast.error("Enter a date");
      return;
    }
    // A warning, not a block: a shop counts its drawer at the end of the day,
    // and refusing the entry would only push the correction somewhere the
    // books cannot see it. Same rule the app already follows for stock.
    if (toBank && n > cashInHand + 0.005) {
      toast.warning(
        `This is more than the ${fmtMoney(cashInHand)} the books show in cash — recorded anyway`,
      );
    }
    if (!toBank && n > bankBalance + 0.005) {
      toast.warning(
        `This is more than ${bank.name}'s ${fmtMoney(bankBalance)} balance — recorded anyway`,
      );
    }

    setSaving(true);
    const label = toBank ? `Transfer to ${bank.name}` : `Transfer from ${bank.name}`;
    const note = notes.trim() ? `${label} — ${notes.trim()}` : label;
    const batch = newBatch();
    BankTxnRepo.addBatched(batch, {
      bankId: bank.id,
      date,
      type: toBank ? "deposit" : "withdraw",
      amount: n,
      notes: note,
    });
    BankRepo.adjustFieldBatched(batch, bank.id, "balance", toBank ? n : -n);
    CashAdjustmentRepo.addBatched(batch, {
      date,
      type: toBank ? "reduce" : "add",
      amount: n,
      reason: note,
    });
    commitBatch(batch, "cash/bank transfer").then((ok) => {
      setSaving(false);
      if (!ok) {
        toast.error("The transfer did not reach the cloud — reload and check before repeating it");
        return;
      }
      toast.success(
        toBank
          ? `${fmtMoney(n)} moved from cash to ${bank.name}`
          : `${fmtMoney(n)} moved from ${bank.name} to cash`,
      );
      onSaved();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Transfer between Cash and Bank</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          {/* Direction reads as the sentence it describes, so there is no
              guessing which way "deposit" points. */}
          <div
            role="radiogroup"
            aria-label="Transfer direction"
            className="grid grid-cols-2 rounded-md border border-input overflow-hidden"
          >
            {(
              [
                ["toBank", "Cash → Bank"],
                ["toCash", "Bank → Cash"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={direction === key}
                onClick={() => setDirection(key)}
                className={`h-9 text-[13px] font-semibold transition ${
                  direction === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Side
              label="Cash in hand"
              value={cashInHand}
              icon={<Banknote className="h-3.5 w-3.5" />}
            />
            <ArrowRight
              className={`h-4 w-4 shrink-0 text-gray-400 ${toBank ? "" : "rotate-180"}`}
            />
            <Side
              label={bank?.name ?? "Bank"}
              value={bankBalance}
              icon={<Landmark className="h-3.5 w-3.5" />}
            />
          </div>

          <label className="flex flex-col gap-1 text-[12px]">
            <span className="text-muted-foreground font-medium">Bank Account *</span>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="h-8 px-2 border rounded bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            >
              {banks.length === 0 && <option value="">No bank accounts yet</option>}
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {`${b.name}${b.accountNumber ? ` — ${b.accountNumber}` : ""} (${fmtMoney(
                    b.balance,
                  )})`}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-muted-foreground font-medium">Amount (₹) *</span>
              <NumInput
                value={amount}
                onValue={setAmount}
                aria-label="Transfer amount"
                className="h-8 px-2 border rounded bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary text-right tabular-nums"
              />
            </label>
            <Field
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Field
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Slip no, reference…"
          />

          {amount > 0 && bank && (
            <p className="text-[12px] text-gray-600 bg-gray-50 border rounded-md px-3 py-2">
              After this: cash{" "}
              <span className="font-semibold tabular-nums">{fmtMoney(cashAfter)}</span>, {bank.name}{" "}
              <span className="font-semibold tabular-nums">{fmtMoney(bankAfter)}</span>
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving || !banks.length}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
