import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ExpenseRepo, c as PaymentRepo, l as PurchaseRepo, p as SalesRepo, r as CashAdjustmentRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { Z as Banknote } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { n as usePagination, t as PaginationBar } from "./Pagination-DIDjCLDA.mjs";
import { n as cashFlows } from "./ledger-DslW1yu4.mjs";
import { n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cash-BgGvC8Wz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CashPage() {
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [adjustOpen, setAdjustOpen] = (0, import_react.useState)(false);
	const refresh = () => setEntries(cashFlows(SalesRepo.all(), PurchaseRepo.all(), ExpenseRepo.all(), PaymentRepo.all(), CashAdjustmentRepo.all()));
	(0, import_react.useEffect)(refresh, []);
	const totalIn = entries.reduce((s, e) => s + e.in, 0);
	const totalOut = entries.reduce((s, e) => s + e.out, 0);
	const balance = totalIn - totalOut;
	const pg = usePagination(entries);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Cash in Hand",
				subtitle: `In: ${fmtMoney(totalIn)} · Out: ${fmtMoney(totalOut)} · Balance: ${fmtMoney(balance)}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setAdjustOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-3.5 w-3.5" }), " Adjust Cash"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex-1 min-h-0 flex flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border rounded-md bg-card flex-1 min-h-0 flex flex-col overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-auto data-table",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Reference" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { textAlign: "right" },
									children: "Cash In"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { textAlign: "right" },
									children: "Cash Out"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 5,
								className: "text-center py-8 text-muted-foreground",
								children: "No cash transactions yet."
							}) }) : pg.paged.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: fmtDate(e.date) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs px-1.5 py-0.5 rounded bg-muted",
									children: e.type
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.ref }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "text-right text-success",
									children: e.in ? fmtMoney(e.in) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "text-right text-warning",
									children: e.out ? fmtMoney(e.out) : "—"
								})
							] }, i)) })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationBar, {
						page: pg.page,
						totalPages: pg.totalPages,
						pageSize: pg.pageSize,
						total: pg.total,
						onPage: pg.setPage,
						onPageSize: pg.setPageSize
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashAdjustDialog, {
				open: adjustOpen,
				onOpenChange: setAdjustOpen,
				onSaved: refresh,
				currentBalance: balance
			})
		]
	});
}
function CashAdjustDialog({ open, onOpenChange, onSaved, currentBalance }) {
	const [type, setType] = (0, import_react.useState)("add");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(today());
	const [reason, setReason] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setType("add");
			setAmount("");
			setDate(today());
			setReason("");
			setSaving(false);
		}
	}, [open]);
	const n = parseFloat(amount) || 0;
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (n <= 0) {
			toast.error("Enter amount to adjust");
			return;
		}
		setSaving(true);
		CashAdjustmentRepo.add({
			date,
			type,
			amount: n,
			reason: reason.trim() || void 0
		});
		toast.success(`Cash ${type === "add" ? "added" : "reduced"}: ${fmtMoney(n)}`);
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Adjust Cash in Hand" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Current balance:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-foreground",
								children: fmtMoney(currentBalance)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setType("add"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition ${type === "add" ? "bg-success-soft text-success border-success" : "bg-background text-muted-foreground"}`,
							children: "+ Add Cash"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setType("reduce"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition ${type === "reduce" ? "bg-destructive/10 text-destructive border-destructive" : "bg-background text-muted-foreground"}`,
							children: "− Reduce Cash"
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
						label: "Reason",
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "Opening cash, owner drawing, counting correction…"
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
							children: saving ? "Saving…" : "Adjust Cash"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { CashPage as component };
