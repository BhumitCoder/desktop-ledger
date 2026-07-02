import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as ExpenseRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as Plus } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { t as DataTable } from "./DataTable-Cjn1VgVa.mjs";
import { n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/expenses-Bsebr-Xq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExpensesPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const refresh = () => setRows(ExpenseRepo.all());
	(0, import_react.useEffect)(refresh, []);
	const total = rows.reduce((s, r) => s + r.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Expenses",
				subtitle: `${rows.length} entries · ${fmtMoney(total)} total`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => {
						setEdit(null);
						setOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New Expense"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex-1 min-h-0 flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					columns: [
						{
							key: "date",
							label: "Date",
							width: "120px",
							render: (r) => fmtDate(r.date),
							sortValue: (r) => r.date
						},
						{
							key: "category",
							label: "Category",
							width: "180px",
							render: (r) => r.category
						},
						{
							key: "notes",
							label: "Notes",
							render: (r) => r.notes ?? "—"
						},
						{
							key: "mode",
							label: "Mode",
							width: "80px",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "capitalize text-xs",
								children: r.paymentMode
							})
						},
						{
							key: "amount",
							label: "Amount",
							align: "right",
							width: "120px",
							render: (r) => fmtMoney(r.amount),
							sortValue: (r) => r.amount
						}
					],
					rows,
					rowKey: (r) => r.id,
					onRowActivate: (r) => {
						setEdit(r);
						setOpen(true);
					},
					onDelete: (r) => {
						if (confirm("Delete expense?")) {
							ExpenseRepo.remove(r.id);
							refresh();
							toast.success("Deleted");
						}
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpenseDialog, {
				open,
				onOpenChange: setOpen,
				expense: edit,
				onSaved: refresh
			})
		]
	});
}
function ExpenseDialog({ open, onOpenChange, expense, onSaved }) {
	const firstRef = (0, import_react.useRef)(null);
	const [f, setF] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setF(expense ?? {
				date: today(),
				paymentMode: "cash",
				amount: 0,
				category: ""
			});
			setSaving(false);
			setTimeout(() => firstRef.current?.focus(), 50);
		}
	}, [open, expense]);
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (!f.category?.trim()) {
			toast.error("Category required");
			return;
		}
		if (!f.amount || f.amount <= 0) {
			toast.error("Amount must be positive");
			return;
		}
		setSaving(true);
		if (expense) {
			ExpenseRepo.update(expense.id, f);
			toast.success("Updated");
		} else {
			ExpenseRepo.add(f);
			toast.success("Saved");
		}
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: expense ? "Edit Expense" : "New Expense" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "grid grid-cols-2 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					ref: firstRef,
					label: "Category *",
					value: f.category ?? "",
					onChange: (e) => setF({
						...f,
						category: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					type: "date",
					value: f.date ?? today(),
					onChange: (e) => setF({
						...f,
						date: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Amount *",
					type: "number",
					value: f.amount ?? 0,
					onChange: (e) => setF({
						...f,
						amount: parseFloat(e.target.value) || 0
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground font-medium",
						children: "Payment Mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: f.paymentMode ?? "cash",
						onChange: (e) => setF({
							...f,
							paymentMode: e.target.value
						}),
						className: "h-8 px-2 border rounded bg-background focus:border-primary outline-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "cash",
								children: "Cash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "bank",
								children: "Bank"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "upi",
								children: "UPI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "cheque",
								children: "Cheque"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						value: f.notes ?? "",
						onChange: (e) => setF({
							...f,
							notes: e.target.value
						})
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
export { ExpensesPage as component };
