import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as ExpenseRepo, c as PaymentRepo, f as SaleReturnRepo, l as PurchaseRepo, o as ItemRepo, p as SalesRepo, s as PartyRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { M as Download, h as Printer, k as FileText, n as Wallet, p as RefreshCcw, q as ChartColumn, r as Users, y as Package } from "../_libs/lucide-react.mjs";
import { o as partyBalances, r as computeCogs } from "./ledger-DslW1yu4.mjs";
import { i as ymd, n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { t as printWithName } from "./print-DvWXB8RH.mjs";
import { t as Route } from "./reports-BbvIlm2J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-U8Rw9mgL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Download rows as Excel-friendly CSV — money cells become plain numbers */
function downloadCsv(name, cols, rows) {
	const clean = (s) => {
		const t = String(s).replace(/[\u00A0\u202F]/g, " ").trim();
		const m = t.match(/^([+\-−]?)\s*₹\s?([\d,]+(?:\.\d+)?)$/);
		const v = m ? `${m[1] === "−" || m[1] === "-" ? "-" : ""}${m[2].replace(/,/g, "")}` : t;
		return /[",\n]/.test(v) ? `"${v.replace(/"/g, "\"\"")}"` : v;
	};
	const csv = "﻿" + [cols, ...rows].map((r) => r.map(clean).join(",")).join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${name.toLowerCase().replace(/\s+/g, "-")}-${today()}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}
var THIS_MONTH_START = ymd(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
var REPORTS = [
	{
		key: "pl",
		label: "Profit & Loss",
		icon: ChartColumn,
		desc: "Revenue, costs, net profit"
	},
	{
		key: "sales",
		label: "Sales Report",
		icon: FileText,
		desc: "Invoice-wise sales"
	},
	{
		key: "purchase",
		label: "Purchase Report",
		icon: FileText,
		desc: "Bill-wise purchases"
	},
	{
		key: "sale-return",
		label: "Sale Returns",
		icon: RefreshCcw,
		desc: "Credit notes issued"
	},
	{
		key: "purchase-return",
		label: "Purchase Returns",
		icon: RefreshCcw,
		desc: "Debit notes issued"
	},
	{
		key: "payments",
		label: "Payments Ledger",
		icon: Wallet,
		desc: "All payment in/out"
	},
	{
		key: "gst",
		label: "GST Summary",
		icon: ChartColumn,
		desc: "Output vs input tax"
	},
	{
		key: "customer-ledger",
		label: "Customer Ledger",
		icon: Users,
		desc: "Receivable per customer"
	},
	{
		key: "supplier-ledger",
		label: "Supplier Ledger",
		icon: Users,
		desc: "Payable per supplier"
	},
	{
		key: "stock",
		label: "Stock Report",
		icon: Package,
		desc: "Item-wise stock & value"
	},
	{
		key: "daily",
		label: "Today's Summary",
		icon: ChartColumn,
		desc: "Today's activity"
	}
];
function ReportsPage() {
	const { r } = Route.useSearch();
	const [active, setActive] = (0, import_react.useState)(REPORTS.some((x) => x.key === r) ? r : "pl");
	const [dateFrom, setDateFrom] = (0, import_react.useState)(THIS_MONTH_START);
	const [dateTo, setDateTo] = (0, import_react.useState)(today());
	const current = REPORTS.find((r) => r.key === active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-[#f5f6fa]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white border-b px-5 py-3 flex items-center justify-between gap-3 no-print",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[17px] font-bold text-gray-800",
				children: "Reports"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[12px] text-gray-400",
				children: current?.desc
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-gray-500",
						children: "From"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: dateFrom,
						onChange: (e) => setDateFrom(e.target.value),
						className: "border border-gray-200 rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium text-gray-500",
						children: "To"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: dateTo,
						onChange: (e) => setDateTo(e.target.value),
						className: "border border-gray-200 rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => printWithName(`${(current?.label ?? "Report").replace(/\s+/g, "-")}-${dateFrom}-to-${dateTo}`),
						className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition",
						title: "Print, or choose 'Save as PDF' in the print dialog",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print / PDF"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex min-h-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "w-52 border-r bg-white overflow-y-auto shrink-0 no-print",
				children: REPORTS.map((r) => {
					const Icon = r.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActive(r.key),
						className: `w-full text-left px-3 py-2.5 border-b border-gray-100 flex items-center gap-2.5 transition ${active === r.key ? "bg-primary/5 border-l-2 border-l-primary font-semibold text-primary" : "hover:bg-gray-50 text-gray-700"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-3.5 w-3.5 shrink-0 ${active === r.key ? "text-primary" : "text-gray-400"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] truncate",
								children: r.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-gray-400 truncate hidden",
								children: r.desc
							})]
						})]
					}, r.key);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto p-5 print-visible print:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportView, {
					which: active,
					dateFrom,
					dateTo
				})
			})]
		})]
	});
}
function inRange(date, from, to) {
	return (!from || date >= from) && (!to || date <= to);
}
function ReportView({ which, dateFrom, dateTo }) {
	const label = REPORTS.find((r) => r.key === which)?.label ?? which;
	const sales = (0, import_react.useMemo)(() => SalesRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	const purchases = (0, import_react.useMemo)(() => PurchaseRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	const expenses = (0, import_react.useMemo)(() => ExpenseRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	const saleReturns = (0, import_react.useMemo)(() => SaleReturnRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	const purchaseReturns = (0, import_react.useMemo)(() => PurchaseReturnRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	const payments = (0, import_react.useMemo)(() => PaymentRepo.all().filter((s) => inRange(s.date, dateFrom, dateTo)), [dateFrom, dateTo]);
	(0, import_react.useMemo)(() => PartyRepo.all(), []);
	const items = (0, import_react.useMemo)(() => ItemRepo.all(), []);
	if (which === "pl") {
		const revenue = sales.reduce((a, s) => a + s.total, 0);
		const saleReturnTotal = saleReturns.reduce((a, r) => a + r.total, 0);
		const netRevenue = revenue - saleReturnTotal;
		const cogs = computeCogs(sales, saleReturns, items);
		const netPurchases = purchases.reduce((a, s) => a + s.total, 0) - purchaseReturns.reduce((a, r) => a + r.total, 0);
		const grossProfit = netRevenue - cogs;
		const exp = expenses.reduce((a, s) => a + s.amount, 0);
		const netProfit = grossProfit - exp;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-gray-800 mb-4",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border rounded-lg shadow-sm overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-3 bg-gray-50 border-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
							children: "Revenue"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Sales Revenue",
						value: revenue
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Sale Returns (−)",
						value: -saleReturnTotal,
						indent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Net Revenue",
						value: netRevenue,
						bold: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-3 bg-gray-50 border-b border-t",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
							children: "Cost of Goods Sold"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Cost of Goods Sold (item cost of sold qty)",
						value: -cogs,
						bold: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-2 flex justify-between items-center border-b border-gray-100 text-[11px] text-gray-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pl-4",
							children: "Purchases during period (net of returns) — for reference, not in profit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: fmtMoney(netPurchases)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-3 bg-gray-50 border-b border-t",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
							children: "Gross Profit"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Gross Profit",
						value: grossProfit,
						bold: true,
						large: true,
						className: grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-3 bg-gray-50 border-b border-t",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
							children: "Expenses"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
						label: "Operating Expenses",
						value: -exp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-4 bg-primary/5 border-t-2 border-primary flex justify-between items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base font-bold text-gray-800",
							children: "Net Profit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-[20px] font-extrabold tabular-nums ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`,
							children: fmtMoney(netProfit)
						})]
					})
				]
			})]
		});
	}
	if (which === "sales") {
		const total = sales.reduce((a, s) => a + s.total, 0);
		const paid = sales.reduce((a, s) => a + s.paid, 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label,
			totalRows: [
				["Total", fmtMoney(total)],
				["Collected", fmtMoney(paid)],
				["Outstanding", fmtMoney(total - paid)]
			],
			cols: [
				"Invoice #",
				"Date",
				"Customer",
				"Mode",
				"Total",
				"Paid",
				"Balance",
				"Status"
			],
			rows: sales.sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
				const bal = Math.max(0, s.total - s.paid);
				const status = bal <= 0 ? "Paid" : s.paid > 0 ? "Partial" : "Unpaid";
				return [
					s.number,
					fmtDate(s.date),
					s.partyName,
					s.paymentMode,
					fmtMoney(s.total),
					fmtMoney(s.paid),
					fmtMoney(bal),
					status
				];
			})
		});
	}
	if (which === "purchase") {
		const total = purchases.reduce((a, s) => a + s.total, 0);
		const paid = purchases.reduce((a, s) => a + s.paid, 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label,
			totalRows: [
				["Total", fmtMoney(total)],
				["Paid", fmtMoney(paid)],
				["Payable", fmtMoney(total - paid)]
			],
			cols: [
				"Bill #",
				"Date",
				"Supplier",
				"Mode",
				"Total",
				"Paid",
				"Balance",
				"Status"
			],
			rows: purchases.sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
				const bal = Math.max(0, s.total - s.paid);
				const status = bal <= 0 ? "Paid" : s.paid > 0 ? "Partial" : "Unpaid";
				return [
					s.number,
					fmtDate(s.date),
					s.partyName,
					s.paymentMode,
					fmtMoney(s.total),
					fmtMoney(s.paid),
					fmtMoney(bal),
					status
				];
			})
		});
	}
	if (which === "sale-return") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
		label,
		totalRows: [["Total Credit", fmtMoney(saleReturns.reduce((a, r) => a + r.total, 0))]],
		cols: [
			"Credit Note #",
			"Date",
			"Original Ref",
			"Customer",
			"Items",
			"Total"
		],
		rows: saleReturns.sort((a, b) => b.date.localeCompare(a.date)).map((r) => [
			r.number,
			fmtDate(r.date),
			r.originalRef || "—",
			r.partyName,
			String(r.lineItems.length),
			fmtMoney(r.total)
		])
	});
	if (which === "purchase-return") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
		label,
		totalRows: [["Total Debit", fmtMoney(purchaseReturns.reduce((a, r) => a + r.total, 0))]],
		cols: [
			"Debit Note #",
			"Date",
			"Original Ref",
			"Supplier",
			"Items",
			"Total"
		],
		rows: purchaseReturns.sort((a, b) => b.date.localeCompare(a.date)).map((r) => [
			r.number,
			fmtDate(r.date),
			r.originalRef || "—",
			r.partyName,
			String(r.lineItems.length),
			fmtMoney(r.total)
		])
	});
	if (which === "payments") {
		const totalIn = payments.filter((p) => p.type === "in").reduce((a, p) => a + p.amount, 0);
		const totalOut = payments.filter((p) => p.type === "out").reduce((a, p) => a + p.amount, 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label,
			totalRows: [
				["Received (In)", fmtMoney(totalIn)],
				["Paid (Out)", fmtMoney(totalOut)],
				["Net", fmtMoney(totalIn - totalOut)]
			],
			cols: [
				"Date",
				"Type",
				"Party",
				"Mode",
				"Reference",
				"Amount"
			],
			rows: payments.sort((a, b) => b.date.localeCompare(a.date)).map((p) => [
				fmtDate(p.date),
				p.type === "in" ? "In" : "Out",
				p.partyName,
				p.mode,
				p.ref || "—",
				`${p.type === "in" ? "+" : "−"}${fmtMoney(p.amount)}`
			])
		});
	}
	if (which === "gst") {
		const agg = (all) => {
			const invoices = all.filter((inv) => inv.gstEnabled !== false);
			const map = /* @__PURE__ */ new Map();
			invoices.forEach((inv) => inv.lineItems.forEach((l) => {
				const taxable = l.qty * l.price * (1 - l.discountPct / 100);
				const tax = taxable * (l.gstRate / 100);
				const cur = map.get(l.gstRate) ?? {
					taxable: 0,
					cgst: 0,
					sgst: 0
				};
				map.set(l.gstRate, {
					taxable: cur.taxable + taxable,
					cgst: cur.cgst + tax / 2,
					sgst: cur.sgst + tax / 2
				});
			}));
			return Array.from(map, ([rate, v]) => ({
				rate,
				...v
			})).sort((a, b) => a.rate - b.rate);
		};
		const outRows = agg(sales);
		const inRows = agg(purchases);
		const outTax = outRows.reduce((a, r) => a + r.cgst + r.sgst, 0);
		const inTax = inRows.reduce((a, r) => a + r.cgst + r.sgst, 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-bold text-gray-800 mb-3",
				children: "GSTR-1 — Output Tax (Sales)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
				label: "",
				totalRows: [["Total Output Tax", fmtMoney(outTax)]],
				cols: [
					"GST Rate",
					"Taxable Value",
					"CGST",
					"SGST",
					"Total Tax"
				],
				rows: outRows.map((r) => [
					`${r.rate}%`,
					fmtMoney(r.taxable),
					fmtMoney(r.cgst),
					fmtMoney(r.sgst),
					fmtMoney(r.cgst + r.sgst)
				])
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-bold text-gray-800 mb-3",
				children: "GSTR-2 — Input Tax (Purchase)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
				label: "",
				totalRows: [["Total Input Tax", fmtMoney(inTax)], ["Net GST Payable", fmtMoney(outTax - inTax)]],
				cols: [
					"GST Rate",
					"Taxable Value",
					"CGST",
					"SGST",
					"Total Tax"
				],
				rows: inRows.map((r) => [
					`${r.rate}%`,
					fmtMoney(r.taxable),
					fmtMoney(r.cgst),
					fmtMoney(r.sgst),
					fmtMoney(r.cgst + r.sgst)
				])
			})] })]
		});
	}
	if (which === "customer-ledger") {
		const rows = partyBalances(SalesRepo.all(), SaleReturnRepo.all(), PaymentRepo.all().filter((p) => p.type === "in")).filter((r) => Math.abs(r.balance) > .01).sort((a, b) => b.balance - a.balance);
		const totalReceivable = rows.reduce((a, r) => a + Math.max(0, r.balance), 0);
		const totalAdvances = rows.reduce((a, r) => a + Math.max(0, -r.balance), 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label: `Customer Ledger`,
			totalRows: [["Total Receivable", fmtMoney(totalReceivable)], ["Customer Advances", fmtMoney(totalAdvances)]],
			cols: [
				"Customer",
				"Total Sales",
				"Returns",
				"Collected",
				"Balance"
			],
			rows: rows.map((r) => [
				r.name,
				fmtMoney(r.invoiced),
				fmtMoney(r.returned),
				fmtMoney(r.settled + r.advances),
				fmtMoney(r.balance)
			])
		});
	}
	if (which === "supplier-ledger") {
		const rows = partyBalances(PurchaseRepo.all(), PurchaseReturnRepo.all(), PaymentRepo.all().filter((p) => p.type === "out")).filter((r) => Math.abs(r.balance) > .01).sort((a, b) => b.balance - a.balance);
		const totalPayable = rows.reduce((a, r) => a + Math.max(0, r.balance), 0);
		const totalAdvances = rows.reduce((a, r) => a + Math.max(0, -r.balance), 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label: `Supplier Ledger`,
			totalRows: [["Total Payable", fmtMoney(totalPayable)], ["Advances to Suppliers", fmtMoney(totalAdvances)]],
			cols: [
				"Supplier",
				"Total Purchase",
				"Returns",
				"Paid",
				"Balance"
			],
			rows: rows.map((r) => [
				r.name,
				fmtMoney(r.invoiced),
				fmtMoney(r.returned),
				fmtMoney(r.settled + r.advances),
				fmtMoney(r.balance)
			])
		});
	}
	if (which === "stock") {
		const totalValue = items.reduce((a, i) => a + i.stock * i.purchasePrice, 0);
		const lowStock = items.filter((i) => i.minStock && i.stock <= i.minStock).length;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableReport, {
			label,
			totalRows: [["Total Stock Value", fmtMoney(totalValue)], ["Low Stock Items", String(lowStock)]],
			cols: [
				"Item",
				"SKU",
				"Category",
				"Stock",
				"Unit",
				"Min Stock",
				"Purchase Price",
				"Sale Price",
				"Stock Value"
			],
			rows: items.sort((a, b) => a.name.localeCompare(b.name)).map((i) => [
				i.name,
				i.sku || "—",
				i.category || "—",
				String(i.stock),
				i.unit,
				i.minStock ? String(i.minStock) : "—",
				fmtMoney(i.purchasePrice),
				fmtMoney(i.salePrice),
				fmtMoney(i.stock * i.purchasePrice)
			])
		});
	}
	if (which === "daily") {
		const t = today();
		const todaySales = SalesRepo.all().filter((x) => x.date === t);
		const todayPurchases = PurchaseRepo.all().filter((x) => x.date === t);
		const todayExpenses = ExpenseRepo.all().filter((x) => x.date === t);
		const todayPayIn = PaymentRepo.all().filter((x) => x.date === t && x.type === "in");
		const todayPayOut = PaymentRepo.all().filter((x) => x.date === t && x.type === "out");
		const s = todaySales.reduce((a, b) => a + b.total, 0);
		const p = todayPurchases.reduce((a, b) => a + b.total, 0);
		const e = todayExpenses.reduce((a, b) => a + b.amount, 0);
		const pi = todayPayIn.reduce((a, b) => a + b.amount, 0);
		const po = todayPayOut.reduce((a, b) => a + b.amount, 0);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-bold text-gray-800 mb-4",
					children: ["Today's Summary — ", fmtDate(t)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border rounded-lg shadow-sm overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
							label: "Sales",
							value: s,
							positive: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
							label: "Payment In",
							value: pi,
							positive: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
							label: "Purchase",
							value: -p
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
							label: "Expenses",
							value: -e
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PLRow, {
							label: "Payment Out",
							value: -po
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 bg-primary/5 border-t-2 border-primary flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-bold",
								children: "Net Cash Flow"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[20px] font-extrabold tabular-nums ${s + pi - p - e - po >= 0 ? "text-emerald-600" : "text-rose-600"}`,
								children: fmtMoney(s + pi - p - e - po)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Invoices",
							value: todaySales.length,
							sub: "created",
							color: "text-blue-600"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Bills",
							value: todayPurchases.length,
							sub: "created",
							color: "text-gray-600"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Expenses",
							value: todayExpenses.length,
							sub: "recorded",
							color: "text-rose-600"
						})
					]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-muted-foreground text-sm p-4",
		children: "Select a report from the left panel."
	});
}
function PLRow({ label, value, bold, large, indent, positive, className = "" }) {
	const isPos = positive ? value >= 0 : value >= 0;
	const display = fmtMoney(Math.abs(value));
	const prefix = value < 0 ? "−" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `px-5 py-3 flex justify-between items-center border-b border-gray-100 ${bold ? "bg-gray-50" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-sm ${indent ? "pl-4 text-gray-500" : "text-gray-700"} ${bold ? "font-bold" : ""} ${large ? "text-base" : ""}`,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: `tabular-nums text-sm ${bold ? "font-bold" : "font-medium"} ${large ? "text-base" : ""} ${className || (isPos && !positive && value === 0 ? "text-gray-400" : value < 0 ? "text-rose-600" : value > 0 && positive ? "text-emerald-600" : "text-gray-800")}`,
			children: [prefix, display]
		})]
	});
}
function StatCard({ label, value, sub, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border rounded-lg p-3 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-2xl font-bold ${color}`,
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-gray-500 mt-0.5",
			children: [
				label,
				" ",
				sub
			]
		})]
	});
}
function TableReport({ label, cols, rows, totalRows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-base font-bold text-gray-800 mb-3",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border rounded-lg p-8 text-center text-gray-400",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-8 w-8 mx-auto mb-2 text-gray-200" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No data for selected date range" })]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-base font-bold text-gray-800",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => downloadCsv(label, cols, rows),
			className: "no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50 transition",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export CSV"]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white border rounded-lg shadow-sm overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-auto max-h-[calc(100vh-300px)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-[12px] border-collapse min-w-max",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "sticky top-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "bg-gray-50",
						children: cols.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: `px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 whitespace-nowrap ${i > 0 ? "text-right" : "text-left"}`,
							children: c
						}, c))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row, ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "border-b border-gray-100 hover:bg-gray-50/70",
					children: row.map((cell, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: `px-4 py-2.5 ${ci === 0 ? "font-medium text-gray-800 text-left" : "text-right text-gray-700 tabular-nums"}`,
						children: cell
					}, ci))
				}, ri)) })]
			})
		}), totalRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t-2 border-gray-200 bg-gray-50 px-5 py-3 flex flex-wrap gap-x-8 gap-y-1",
			children: totalRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-semibold text-gray-500",
					children: [k, ":"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-bold text-gray-800 tabular-nums",
					children: v
				})]
			}, k))
		})]
	})] });
}
//#endregion
export { ReportsPage as component };
