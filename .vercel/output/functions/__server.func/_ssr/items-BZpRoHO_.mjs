import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { m as StockAdjustmentRepo, o as ItemRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Search, et as ArrowUpDown, g as Plus } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { t as DataTable } from "./DataTable-Cjn1VgVa.mjs";
import { n as fmtMoney, r as today } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/items-BZpRoHO_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ItemsPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [adjustItem, setAdjustItem] = (0, import_react.useState)(null);
	const refresh = () => setRows(ItemRepo.all());
	(0, import_react.useEffect)(refresh, []);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			const el = e.target;
			if (!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) && e.key === "n") {
				e.preventDefault();
				setEdit(null);
				setOpen(true);
			}
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, []);
	const filtered = rows.filter((r) => {
		const s = q.toLowerCase();
		return !s || r.name.toLowerCase().includes(s) || r.sku?.toLowerCase().includes(s) || r.barcode?.includes(s);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Items",
				subtitle: `${rows.length} items`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => {
						setEdit(null);
						setOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }),
						" New Item ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "text-[10px] ml-1",
							children: "N"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 border-b bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-2 top-2.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						placeholder: "Search items by name...",
						value: q,
						onChange: (e) => setQ(e.target.value),
						className: "h-8 pl-7 pr-2 border rounded w-full bg-background focus:border-primary outline-none"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex-1 min-h-0 flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					columns: [
						{
							key: "name",
							label: "Name",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: r.name
							}),
							sortValue: (r) => r.name
						},
						{
							key: "category",
							label: "Category",
							width: "140px",
							render: (r) => r.category ?? "—"
						},
						{
							key: "purchase",
							label: "Purchase Price",
							width: "130px",
							align: "right",
							render: (r) => fmtMoney(r.purchasePrice)
						},
						{
							key: "sale",
							label: "Sale Price",
							width: "130px",
							align: "right",
							render: (r) => fmtMoney(r.salePrice),
							sortValue: (r) => r.salePrice
						},
						{
							key: "stock",
							label: "Stock",
							width: "100px",
							align: "right",
							render: (r) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: r.minStock && r.stock <= r.minStock ? "text-warning font-medium" : "",
									children: [
										r.stock,
										" ",
										r.unit
									]
								});
							},
							sortValue: (r) => r.stock
						},
						{
							key: "adjust",
							label: "",
							width: "60px",
							align: "center",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: (e) => {
									e.stopPropagation();
									setAdjustItem(r);
								},
								className: "p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition",
								title: "Adjust stock (damage, counting correction…)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3.5 w-3.5" })
							})
						}
					],
					rows: filtered,
					rowKey: (r) => r.id,
					onRowActivate: (r) => {
						setEdit(r);
						setOpen(true);
					},
					onDelete: (r) => {
						if (confirm(`Delete ${r.name}?`)) {
							ItemRepo.remove(r.id);
							refresh();
							toast.success("Item deleted");
						}
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDialog, {
				open,
				onOpenChange: setOpen,
				item: edit,
				onSaved: refresh
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockAdjustDialog, {
				item: adjustItem,
				onOpenChange: (v) => {
					if (!v) setAdjustItem(null);
				},
				onSaved: refresh
			})
		]
	});
}
function StockAdjustDialog({ item, onOpenChange, onSaved }) {
	const [type, setType] = (0, import_react.useState)("add");
	const [qty, setQty] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(today());
	const [reason, setReason] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (item) {
			setType("add");
			setQty("");
			setDate(today());
			setReason("");
			setSaving(false);
		}
	}, [item]);
	if (!item) return null;
	const n = parseFloat(qty) || 0;
	const newStock = Math.round((item.stock + (type === "add" ? n : -n)) * 100) / 100;
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (n <= 0) {
			toast.error("Enter quantity to adjust");
			return;
		}
		setSaving(true);
		ItemRepo.adjustField(item.id, "stock", type === "add" ? n : -n);
		StockAdjustmentRepo.add({
			itemId: item.id,
			itemName: item.name,
			date,
			type,
			qty: n,
			reason: reason.trim() || void 0
		});
		toast.success(`${item.name}: stock ${type === "add" ? "increased" : "reduced"} by ${n} → now ${newStock} ${item.unit}`);
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!item,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Adjust Stock — ", item.name] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Current stock:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-bold text-foreground",
								children: [
									item.stock,
									" ",
									item.unit
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setType("add"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition ${type === "add" ? "bg-success-soft text-success border-success" : "bg-background text-muted-foreground"}`,
							children: "+ Add Stock"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setType("reduce"),
							className: `flex-1 h-9 rounded-md border text-sm font-semibold transition ${type === "reduce" ? "bg-destructive/10 text-destructive border-destructive" : "bg-background text-muted-foreground"}`,
							children: "− Reduce Stock"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Quantity (${item.unit}) *`,
							type: "number",
							value: qty,
							onChange: (e) => setQty(e.target.value)
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
						placeholder: "Damaged, counting correction, sample…"
					}),
					n > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"New stock will be:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `font-bold ${newStock < 0 ? "text-destructive" : "text-success"}`,
								children: [
									newStock,
									" ",
									item.unit
								]
							})
						]
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
							children: saving ? "Saving…" : "Adjust Stock"
						})]
					})
				]
			})]
		})
	});
}
function ItemDialog({ open, onOpenChange, item, onSaved }) {
	const firstRef = (0, import_react.useRef)(null);
	const [f, setF] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setF(item ?? {
				unit: "pcs",
				gstRate: 0,
				purchasePrice: 0,
				salePrice: 0,
				stock: 0,
				openingStock: 0
			});
			setSaving(false);
			setTimeout(() => firstRef.current?.focus(), 50);
		}
	}, [open, item]);
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (!f.name?.trim()) {
			toast.error("Name required");
			return;
		}
		const dup = ItemRepo.all().find((x) => x.name.trim().toLowerCase() === f.name.trim().toLowerCase() && x.id !== item?.id);
		if (dup) {
			toast.error(`Item "${dup.name}" already exists — repeat items cannot be added`);
			return;
		}
		setSaving(true);
		if (item) {
			const openingDelta = (f.openingStock ?? 0) - (item.openingStock ?? 0);
			const patch = { ...f };
			delete patch.stock;
			ItemRepo.update(item.id, patch);
			if (openingDelta !== 0) ItemRepo.adjustField(item.id, "stock", openingDelta);
			toast.success(openingDelta !== 0 ? `Item updated — stock adjusted by ${openingDelta > 0 ? "+" : ""}${openingDelta}` : "Item updated");
		} else {
			ItemRepo.add({
				...f,
				name: f.name,
				unit: f.unit ?? "pcs",
				gstRate: f.gstRate ?? 0,
				purchasePrice: f.purchasePrice ?? 0,
				salePrice: f.salePrice ?? 0,
				stock: f.openingStock ?? 0,
				openingStock: f.openingStock ?? 0
			});
			toast.success("Item created");
		}
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: item ? "Edit Item" : "New Item" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							ref: firstRef,
							label: "Name *",
							value: f.name ?? "",
							onChange: (e) => setF({
								...f,
								name: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Category",
						value: f.category ?? "",
						onChange: (e) => setF({
							...f,
							category: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Purchase Price",
						type: "number",
						value: f.purchasePrice ?? 0,
						onChange: (e) => setF({
							...f,
							purchasePrice: parseFloat(e.target.value) || 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sale Price *",
						type: "number",
						value: f.salePrice ?? 0,
						onChange: (e) => setF({
							...f,
							salePrice: parseFloat(e.target.value) || 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Wholesale Price",
						type: "number",
						value: f.wholesalePrice ?? "",
						onChange: (e) => setF({
							...f,
							wholesalePrice: parseFloat(e.target.value) || void 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Opening Stock",
						type: "number",
						value: f.openingStock ?? 0,
						onChange: (e) => setF({
							...f,
							openingStock: parseFloat(e.target.value) || 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Min Stock (low-stock alert)",
						type: "number",
						value: f.minStock ?? "",
						onChange: (e) => setF({
							...f,
							minStock: parseFloat(e.target.value) || void 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-3 flex justify-end gap-2 mt-2",
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
			})]
		})
	});
}
//#endregion
export { ItemsPage as component };
