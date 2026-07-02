import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { f as SaleReturnRepo, l as PurchaseRepo, m as StockAdjustmentRepo, o as ItemRepo, p as SalesRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { t as DataTable } from "./DataTable-Cjn1VgVa.mjs";
import { n as fmtMoney } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-Ckq1GweB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventoryPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setRows(ItemRepo.all()), []);
	const salesQty = /* @__PURE__ */ new Map();
	SalesRepo.all().forEach((s) => s.lineItems.forEach((l) => salesQty.set(l.itemId, (salesQty.get(l.itemId) ?? 0) + l.qty)));
	PurchaseReturnRepo.all().forEach((r) => r.lineItems.forEach((l) => salesQty.set(l.itemId, (salesQty.get(l.itemId) ?? 0) + l.qty)));
	const purchaseQty = /* @__PURE__ */ new Map();
	PurchaseRepo.all().forEach((s) => s.lineItems.forEach((l) => purchaseQty.set(l.itemId, (purchaseQty.get(l.itemId) ?? 0) + l.qty)));
	SaleReturnRepo.all().forEach((r) => r.lineItems.forEach((l) => purchaseQty.set(l.itemId, (purchaseQty.get(l.itemId) ?? 0) + l.qty)));
	StockAdjustmentRepo.all().forEach((a) => {
		const map = a.type === "add" ? purchaseQty : salesQty;
		map.set(a.itemId, (map.get(a.itemId) ?? 0) + a.qty);
	});
	const columns = [
		{
			key: "name",
			label: "Item",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: r.name
			}),
			sortValue: (r) => r.name
		},
		{
			key: "sku",
			label: "SKU",
			width: "120px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs",
				children: r.sku ?? "—"
			})
		},
		{
			key: "opening",
			label: "Opening",
			align: "right",
			width: "90px",
			render: (r) => r.openingStock
		},
		{
			key: "in",
			label: "Stock In",
			align: "right",
			width: "90px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-success",
				children: ["+", purchaseQty.get(r.id) ?? 0]
			})
		},
		{
			key: "out",
			label: "Stock Out",
			align: "right",
			width: "90px",
			render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-warning",
				children: ["-", salesQty.get(r.id) ?? 0]
			})
		},
		{
			key: "stock",
			label: "Current",
			align: "right",
			width: "100px",
			render: (r) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: `font-medium ${r.minStock && r.stock <= r.minStock ? "text-warning" : ""}`,
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
			key: "min",
			label: "Min",
			align: "right",
			width: "70px",
			render: (r) => r.minStock ?? "—"
		},
		{
			key: "value",
			label: "Stock Value",
			align: "right",
			width: "120px",
			render: (r) => fmtMoney(r.stock * r.purchasePrice),
			sortValue: (r) => r.stock * r.purchasePrice
		}
	];
	const totalValue = rows.reduce((s, r) => s + r.stock * r.purchasePrice, 0);
	const lowCount = rows.filter((r) => r.minStock && r.stock <= r.minStock).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Inventory",
			subtitle: `${rows.length} items · Stock value: ${fmtMoney(totalValue)} · Low: ${lowCount}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-3 flex-1 min-h-0 flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns,
				rows,
				rowKey: (r) => r.id
			})
		})]
	});
}
//#endregion
export { InventoryPage as component };
