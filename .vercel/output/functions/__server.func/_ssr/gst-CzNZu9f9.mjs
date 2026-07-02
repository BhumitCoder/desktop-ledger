import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { l as PurchaseRepo, p as SalesRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { n as fmtMoney } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gst-CzNZu9f9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GstPage() {
	const [gstr1, setGstr1] = (0, import_react.useState)([]);
	const [gstr2, setGstr2] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const agg = (all) => {
			const invoices = all.filter((inv) => inv.gstEnabled !== false);
			const map = /* @__PURE__ */ new Map();
			invoices.forEach((inv) => inv.lineItems.forEach((l) => {
				const taxable = l.qty * l.price * (1 - l.discountPct / 100);
				const tax = taxable * (l.gstRate / 100);
				const cur = map.get(l.gstRate) ?? {
					taxable: 0,
					tax: 0
				};
				map.set(l.gstRate, {
					taxable: cur.taxable + taxable,
					tax: cur.tax + tax
				});
			}));
			return Array.from(map, ([rate, v]) => ({
				rate,
				...v
			})).sort((a, b) => a.rate - b.rate);
		};
		setGstr1(agg(SalesRepo.all()));
		setGstr2(agg(PurchaseRepo.all()));
	}, []);
	const outTotal = gstr1.reduce((s, r) => s + r.tax, 0);
	const inTotal = gstr2.reduce((s, r) => s + r.tax, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "GST",
			subtitle: `Output: ${fmtMoney(outTotal)} · Input: ${fmtMoney(inTotal)} · Payable: ${fmtMoney(outTotal - inTotal)}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 grid grid-cols-2 gap-4 overflow-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "GSTR-1 (Sales / Outward)",
				rows: gstr1
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "GSTR-2 (Purchase / Inward)",
				rows: gstr2
			})]
		})]
	});
}
function Section({ title, rows }) {
	const total = rows.reduce((s, r) => s + r.tax, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border rounded-md bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 py-2 border-b font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "data-table",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "GST Rate" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { textAlign: "right" },
							children: "Taxable Value"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: { textAlign: "right" },
							children: "Tax Amount"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 3,
						className: "text-center py-6 text-muted-foreground",
						children: "No entries"
					}) }) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [r.rate, "%"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-right",
							children: fmtMoney(r.taxable)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-right",
							children: fmtMoney(r.tax)
						})
					] }, r.rate)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t p-2 flex justify-between font-semibold text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Tax" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmtMoney(total) })]
			})
		]
	});
}
//#endregion
export { GstPage as component };
