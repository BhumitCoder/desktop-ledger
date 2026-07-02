import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as ExpenseRepo, c as PaymentRepo, f as SaleReturnRepo, l as PurchaseRepo, p as SalesRepo, r as CashAdjustmentRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { U as ChevronRight, W as ChevronLeft, X as BookOpen, h as Printer } from "../_libs/lucide-react.mjs";
import { i as ymd, n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { t as printWithName } from "./print-DvWXB8RH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/daybook-Dr8RNJdc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DaybookPage() {
	const [date, setDate] = (0, import_react.useState)(today());
	const rows = (0, import_react.useMemo)(() => {
		const list = [];
		for (const s of SalesRepo.all().filter((x) => x.date === date)) list.push({
			created: s.createdAt,
			type: "Sale",
			ref: s.number,
			party: s.partyName,
			mode: s.paymentMode,
			amount: s.total
		});
		for (const p of PurchaseRepo.all().filter((x) => x.date === date)) list.push({
			created: p.createdAt,
			type: "Purchase",
			ref: p.number,
			party: p.partyName,
			mode: p.paymentMode,
			amount: -p.total
		});
		for (const r of SaleReturnRepo.all().filter((x) => x.date === date)) list.push({
			created: r.createdAt,
			type: "Sale Return",
			ref: r.number,
			party: r.partyName,
			mode: "—",
			amount: -r.total
		});
		for (const r of PurchaseReturnRepo.all().filter((x) => x.date === date)) list.push({
			created: r.createdAt,
			type: "Purchase Return",
			ref: r.number,
			party: r.partyName,
			mode: "—",
			amount: r.total
		});
		for (const p of PaymentRepo.all().filter((x) => x.date === date)) list.push({
			created: p.createdAt,
			type: p.type === "in" ? "Payment In" : "Payment Out",
			ref: p.allocations?.map((a) => a.number).join(", ") || p.ref || "—",
			party: p.partyName,
			mode: p.mode,
			amount: p.type === "in" ? p.amount : -p.amount
		});
		for (const e of ExpenseRepo.all().filter((x) => x.date === date)) list.push({
			created: e.createdAt,
			type: "Expense",
			ref: e.category,
			party: "—",
			mode: e.paymentMode,
			amount: -e.amount
		});
		for (const a of CashAdjustmentRepo.all().filter((x) => x.date === date)) list.push({
			created: a.createdAt,
			type: a.type === "add" ? "Cash Added" : "Cash Reduced",
			ref: a.reason || "Adjustment",
			party: "—",
			mode: "cash",
			amount: a.type === "add" ? a.amount : -a.amount
		});
		list.sort((a, b) => (a.created ?? "").localeCompare(b.created ?? ""));
		return list;
	}, [date]);
	const sum = (type) => rows.filter((r) => r.type === type).reduce((s, r) => s + Math.abs(r.amount), 0);
	const totalSale = sum("Sale");
	const totalPurchase = sum("Purchase");
	const payIn = sum("Payment In");
	const payOut = sum("Payment Out");
	const expense = sum("Expense");
	const net = rows.reduce((s, r) => s + r.amount, 0);
	const shiftDay = (delta) => {
		const [y, m, dd] = date.split("-").map(Number);
		setDate(ymd(new Date(y, m - 1, dd + delta)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-[#f5f6fa]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print bg-white border-b px-5 py-3 flex items-center justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[17px] font-bold text-gray-800",
						children: "Daybook"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[12px] text-gray-400",
						children: [
							rows.length,
							" transactions on ",
							fmtDate(date)
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => shiftDay(-1),
							className: "h-8 w-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500",
							title: "Previous day",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value),
							className: "border border-gray-200 rounded-md text-sm px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => shiftDay(1),
							className: "h-8 w-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500",
							title: "Next day",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setDate(today()),
							className: "px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-600",
							children: "Today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => printWithName(`Daybook-${date}`),
							className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50",
							title: "Print, or choose 'Save as PDF' in the print dialog",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print / PDF"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print grid grid-cols-3 lg:grid-cols-6 bg-white border-b",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sales",
						value: totalSale,
						color: "text-emerald-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Payment In",
						value: payIn,
						color: "text-emerald-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Purchase",
						value: totalPurchase,
						color: "text-rose-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Payment Out",
						value: payOut,
						color: "text-rose-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Expenses",
						value: expense,
						color: "text-rose-600"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net",
						value: net,
						color: net >= 0 ? "text-emerald-600" : "text-rose-600",
						signed: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "print-visible bg-white border rounded-lg shadow-sm overflow-hidden max-w-5xl mx-auto print:p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-5 py-3 border-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-bold text-gray-800",
							children: ["Daybook — ", fmtDate(date)]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[12.5px] border-collapse",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "bg-gray-50",
								children: [
									"#",
									"Type",
									"Ref / Category",
									"Party",
									"Mode",
									"Amount"
								].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: `px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 whitespace-nowrap ${i === 5 ? "text-right" : "text-left"}`,
									children: h
								}, h))
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 6,
								className: "text-center py-14 text-gray-400",
								children: "No transactions on this day"
							}) }) : rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-gray-100 hover:bg-gray-50/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-gray-400 text-[11px]",
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.amount >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`,
											children: r.type
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-mono text-xs text-blue-600",
										children: r.ref
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-medium text-gray-800",
										children: r.party
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-gray-500 capitalize text-xs",
										children: r.mode
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: `px-4 py-2.5 text-right font-bold tabular-nums ${r.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`,
										children: [r.amount >= 0 ? "+" : "−", fmtMoney(Math.abs(r.amount))]
									})
								]
							}, i)) }),
							rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-gray-50 border-t-2 border-gray-200 font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "px-4 py-3 text-xs uppercase text-gray-500",
									children: "Net for the day"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: `px-4 py-3 text-right tabular-nums ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`,
									children: [net >= 0 ? "+" : "−", fmtMoney(Math.abs(net))]
								})]
							}) })
						]
					})]
				})
			})
		]
	});
}
function Stat({ label, value, color, signed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-3 border-r border-gray-100 last:border-r-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: `text-[16px] font-bold tabular-nums ${color}`,
			children: [signed && value < 0 ? "−" : "", fmtMoney(Math.abs(value))]
		})]
	});
}
//#endregion
export { DaybookPage as component };
