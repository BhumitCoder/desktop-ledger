import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ExpenseRepo, c as PaymentRepo, l as PurchaseRepo, n as BankTxnRepo, p as SalesRepo, r as CashAdjustmentRepo, t as BankRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { $ as ArrowUpFromLine, g as Plus, nt as ArrowDownToLine } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { t as DataTable } from "./DataTable-Cjn1VgVa.mjs";
import { i as netFlow, t as bankFlows } from "./ledger-DslW1yu4.mjs";
import { n as fmtMoney, r as today } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bank-Dy90OezJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BankPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [txnOpen, setTxnOpen] = (0, import_react.useState)(false);
	const refresh = () => setRows(BankRepo.all());
	(0, import_react.useEffect)(refresh, []);
	const columns = [
		{
			key: "name",
			label: "Account Name",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: r.name
			})
		},
		{
			key: "acc",
			label: "Account No.",
			width: "180px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs",
				children: r.accountNumber ?? "—"
			})
		},
		{
			key: "ifsc",
			label: "IFSC",
			width: "120px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs",
				children: r.ifsc ?? "—"
			})
		},
		{
			key: "opening",
			label: "Opening",
			align: "right",
			width: "120px",
			render: (r) => fmtMoney(r.openingBalance)
		},
		{
			key: "balance",
			label: "Balance",
			align: "right",
			width: "140px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold",
				children: fmtMoney(r.balance)
			})
		}
	];
	const accountsTotal = rows.reduce((s, r) => s + r.balance, 0);
	const bankActivity = netFlow(bankFlows(SalesRepo.all(), PurchaseRepo.all(), ExpenseRepo.all(), PaymentRepo.all()));
	const totalBalance = accountsTotal + bankActivity;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Bank Accounts",
				subtitle: `${rows.length} accounts · Opening: ${fmtMoney(accountsTotal)} · Bank transactions: ${bankActivity >= 0 ? "+" : "−"}${fmtMoney(Math.abs(bankActivity))} · Total: ${fmtMoney(totalBalance)}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setTxnOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "h-3.5 w-3.5" }), " Deposit / Withdraw"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => {
							setEdit(null);
							setOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New Account"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex-1 min-h-0 flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					columns,
					rows,
					rowKey: (r) => r.id,
					onRowActivate: (r) => {
						setEdit(r);
						setOpen(true);
					},
					onDelete: (r) => {
						if (confirm(`Delete ${r.name}?`)) {
							BankRepo.remove(r.id);
							refresh();
						}
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankDialog, {
				open,
				onOpenChange: setOpen,
				bank: edit,
				onSaved: refresh
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankTxnDialog, {
				open: txnOpen,
				onOpenChange: setTxnOpen,
				accounts: rows,
				onSaved: refresh
			})
		]
	});
}
function BankTxnDialog({ open, onOpenChange, accounts, onSaved }) {
	const [bankId, setBankId] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("deposit");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(today());
	const [notes, setNotes] = (0, import_react.useState)("");
	const [linkCash, setLinkCash] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setBankId(accounts[0]?.id ?? "");
			setType("deposit");
			setAmount("");
			setDate(today());
			setNotes("");
			setLinkCash(true);
			setSaving(false);
		}
	}, [open, accounts]);
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		const n = parseFloat(amount) || 0;
		const bank = accounts.find((b) => b.id === bankId);
		if (!bank) {
			toast.error("Select a bank account");
			return;
		}
		if (n <= 0) {
			toast.error("Enter amount");
			return;
		}
		setSaving(true);
		BankTxnRepo.add({
			bankId: bank.id,
			date,
			type,
			amount: n,
			notes: notes.trim() || void 0
		});
		BankRepo.update(bank.id, { balance: Math.round((bank.balance + (type === "deposit" ? n : -n)) * 100) / 100 });
		if (linkCash) CashAdjustmentRepo.add({
			date,
			type: type === "deposit" ? "reduce" : "add",
			amount: n,
			reason: `Bank ${type} — ${bank.name}`
		});
		toast.success(`${type === "deposit" ? "Deposited" : "Withdrawn"} ${fmtMoney(n)} ${type === "deposit" ? "to" : "from"} ${bank.name}`);
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Bank Deposit / Withdraw" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-[12px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground font-medium",
							children: "Bank Account *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: bankId,
							onChange: (e) => setBankId(e.target.value),
							className: "h-9 px-2 border rounded-md bg-background focus:border-primary outline-none",
							children: accounts.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: b.id,
								children: [
									b.name,
									" — ",
									fmtMoney(b.balance)
								]
							}, b.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setType("deposit"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition inline-flex items-center justify-center gap-1.5 ${type === "deposit" ? "bg-success-soft text-success border-success" : "bg-background text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "h-3.5 w-3.5" }), " Deposit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setType("withdraw"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition inline-flex items-center justify-center gap-1.5 ${type === "withdraw" ? "bg-destructive/10 text-destructive border-destructive" : "bg-background text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpFromLine, { className: "h-3.5 w-3.5" }), " Withdraw"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Amount (₹) *",
							type: "number",
							value: amount,
							onChange: (e) => setAmount(e.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date",
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						value: notes,
						onChange: (e) => setNotes(e.target.value),
						placeholder: "Reference, slip no…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-[13px] cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: linkCash,
							onChange: (e) => setLinkCash(e.target.checked),
							className: "accent-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: type === "deposit" ? "Deposited from cash in hand (reduce counter cash)" : "Withdrawn to cash in hand (add counter cash)" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							disabled: saving,
							onClick: () => onOpenChange(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: saving,
							children: saving ? "Saving…" : "Save Transaction"
						})]
					})
				]
			})]
		})
	});
}
function BankDialog({ open, onOpenChange, bank, onSaved }) {
	const firstRef = (0, import_react.useRef)(null);
	const [f, setF] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setF(bank ?? {
				openingBalance: 0,
				balance: 0
			});
			setSaving(false);
			setTimeout(() => firstRef.current?.focus(), 50);
		}
	}, [open, bank]);
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (!f.name?.trim()) {
			toast.error("Name required");
			return;
		}
		setSaving(true);
		if (bank) BankRepo.update(bank.id, f);
		else BankRepo.add({
			...f,
			name: f.name,
			openingBalance: f.openingBalance ?? 0,
			balance: f.openingBalance ?? 0
		});
		toast.success("Saved");
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [bank ? "Edit" : "New", " Bank Account"] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "grid grid-cols-2 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						ref: firstRef,
						label: "Bank Name *",
						value: f.name ?? "",
						onChange: (e) => setF({
							...f,
							name: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Account Number",
					value: f.accountNumber ?? "",
					onChange: (e) => setF({
						...f,
						accountNumber: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "IFSC",
					value: f.ifsc ?? "",
					onChange: (e) => setF({
						...f,
						ifsc: e.target.value.toUpperCase()
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Opening Balance",
					type: "number",
					value: f.openingBalance ?? 0,
					onChange: (e) => setF({
						...f,
						openingBalance: parseFloat(e.target.value) || 0
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 flex justify-end gap-2 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: saving,
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving,
						children: saving ? "Saving…" : "Save"
					})]
				})
			]
		})] })
	});
}
//#endregion
export { BankPage as component };
