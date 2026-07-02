import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as ExpenseRepo, c as PaymentRepo, f as SaleReturnRepo, l as PurchaseRepo, o as ItemRepo, p as SalesRepo, r as CashAdjustmentRepo, s as PartyRepo, t as BankRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { E as LayoutList, G as ChevronDown, Q as ArrowUpRight, U as ChevronRight, X as BookOpen, g as Plus, k as FileText, o as TrendingUp, r as Users, rt as ArrowDownLeft, y as Package } from "../_libs/lucide-react.mjs";
import { i as netFlow, n as cashFlows, o as partyBalances, r as computeCogs, t as bankFlows } from "./ledger-DslW1yu4.mjs";
import { i as ymd } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CCl-FecP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getPeriodRange(period) {
	const now = /* @__PURE__ */ new Date();
	if (period === "this_month") return {
		start: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
		end: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
		label: "This Month"
	};
	if (period === "last_month") return {
		start: ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
		end: ymd(new Date(now.getFullYear(), now.getMonth(), 0)),
		label: "Last Month"
	};
	return {
		start: ymd(new Date(now.getFullYear(), 0, 1)),
		end: ymd(new Date(now.getFullYear(), 11, 31)),
		label: "This Year"
	};
}
function inRange(dateStr, start, end) {
	return dateStr >= start && dateStr <= end;
}
function buildChartData(sales, start, end) {
	const days = [];
	const [y, m, d] = start.split("-").map(Number);
	const cur = new Date(y, m - 1, d);
	while (ymd(cur) <= end) {
		const key = ymd(cur);
		const amt = sales.filter((s) => s.date === key).reduce((acc, s) => acc + (s.total || 0), 0);
		days.push({
			date: key,
			amount: amt
		});
		cur.setDate(cur.getDate() + 1);
	}
	return days;
}
function fmt(n) {
	return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}
function Dashboard() {
	const navigate = useNavigate();
	const [period, setPeriod] = (0, import_react.useState)("this_month");
	const [showPeriodMenu, setShowPeriodMenu] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)({
		sales: [],
		purchases: [],
		parties: [],
		items: [],
		expenses: [],
		banks: [],
		payments: [],
		saleReturns: [],
		purchaseReturns: [],
		cashAdjustments: []
	});
	(0, import_react.useEffect)(() => {
		setData({
			sales: SalesRepo.all(),
			purchases: PurchaseRepo.all(),
			parties: PartyRepo.all(),
			items: ItemRepo.all(),
			expenses: ExpenseRepo.all(),
			banks: BankRepo.all(),
			payments: PaymentRepo.all(),
			saleReturns: SaleReturnRepo.all(),
			purchaseReturns: PurchaseReturnRepo.all(),
			cashAdjustments: CashAdjustmentRepo.all()
		});
	}, []);
	const { start, end } = getPeriodRange(period);
	const periodLabel = getPeriodRange(period).label;
	const periodSales = data.sales.filter((s) => inRange(s.date, start, end));
	const periodPurchases = data.purchases.filter((s) => inRange(s.date, start, end));
	const periodExpenses = data.expenses.filter((s) => inRange(s.date, start, end));
	const totalSale = periodSales.reduce((a, s) => a + (s.total || 0), 0);
	const totalPurchase = periodPurchases.reduce((a, s) => a + (s.total || 0), 0);
	const totalExpense = periodExpenses.reduce((a, s) => a + (s.amount || 0), 0);
	const periodSaleReturns = data.saleReturns.filter((r) => inRange(r.date, start, end));
	const totalSaleReturn = periodSaleReturns.reduce((a, r) => a + (r.total || 0), 0);
	const customerBalances = partyBalances(data.sales, data.saleReturns, data.payments.filter((p) => p.type === "in"));
	const supplierBalances = partyBalances(data.purchases, data.purchaseReturns, data.payments.filter((p) => p.type === "out"));
	const receivable = customerBalances.reduce((a, b) => a + Math.max(0, b.balance), 0);
	const payable = supplierBalances.reduce((a, b) => a + Math.max(0, b.balance), 0);
	const receivableParties = customerBalances.filter((b) => b.balance > .01).length;
	const payableParties = supplierBalances.filter((b) => b.balance > .01).length;
	const stockValue = data.items.reduce((a, i) => a + (i.stock || 0) * (i.purchasePrice || 0), 0);
	const cashInHand = netFlow(cashFlows(data.sales, data.purchases, data.expenses, data.payments, data.cashAdjustments));
	const bankBalance = data.banks.reduce((a, b) => a + (b.balance || b.openingBalance || 0), 0) + netFlow(bankFlows(data.sales, data.purchases, data.expenses, data.payments));
	const periodCogs = computeCogs(periodSales, periodSaleReturns, data.items);
	const netProfit = totalSale - totalSaleReturn - periodCogs - totalExpense;
	const lowStock = data.items.filter((i) => i.minStock && i.stock <= i.minStock);
	const chartData = (0, import_react.useMemo)(() => buildChartData(data.sales, start, end), [
		data.sales,
		start,
		end
	]);
	const chartXLabels = (0, import_react.useMemo)(() => {
		const total = chartData.length;
		const step = Math.max(1, Math.floor(total / 8));
		return chartData.map((d, i) => {
			if (i % step !== 0 && i !== total - 1) return "";
			const dt = new Date(d.date);
			return `${dt.getDate()} ${dt.toLocaleString("en", { month: "short" })}`;
		});
	}, [chartData]);
	const PERIODS = [
		{
			value: "this_month",
			label: "This Month"
		},
		{
			value: "last_month",
			label: "Last Month"
		},
		{
			value: "this_year",
			label: "This Year"
		}
	];
	const reports = [
		{
			label: "Sale Report",
			icon: FileText,
			go: () => navigate({
				to: "/reports",
				search: { r: "sales" }
			})
		},
		{
			label: "Daybook",
			icon: BookOpen,
			go: () => navigate({ to: "/daybook" })
		},
		{
			label: "Profit & Loss",
			icon: LayoutList,
			go: () => navigate({
				to: "/reports",
				search: { r: "pl" }
			})
		},
		{
			label: "Party Statement",
			icon: Users,
			go: () => navigate({ to: "/parties" })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full overflow-hidden bg-[#f5f6fa]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 overflow-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-0 border-b border-gray-200 bg-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 p-5 border-r border-gray-200",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-gray-500 font-medium uppercase tracking-wide mb-1",
									children: "Total Receivable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[28px] font-bold text-gray-800 leading-tight",
									children: ["₹ ", fmt(receivable)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-gray-400 mt-1",
									children: [
										"From ",
										receivableParties,
										" ",
										receivableParties === 1 ? "Party" : "Parties"
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-5 w-5 text-emerald-500" })
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 p-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-gray-500 font-medium uppercase tracking-wide mb-1",
									children: "Total Payable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[28px] font-bold text-gray-800 leading-tight",
									children: ["₹ ", fmt(payable)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-gray-400 mt-1",
									children: [
										"From ",
										payableParties,
										" ",
										payableParties === 1 ? "Party" : "Parties"
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-5 w-5 text-rose-500" })
							})]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white border-b border-gray-200 px-5 pt-4 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-gray-500 font-medium uppercase tracking-wide",
							children: "Total Sale"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[22px] font-bold text-gray-800 leading-tight",
							children: [
								"₹ ",
								fmt(totalSale),
								totalSale === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-3 text-xs font-normal text-gray-400",
									children: "No sales yet"
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setShowPeriodMenu((v) => !v),
								className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition",
								children: [periodLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" })]
							}), showPeriodMenu && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[140px]",
								children: PERIODS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setPeriod(p.value);
										setShowPeriodMenu(false);
									},
									className: `w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition ${period === p.value ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`,
									children: p.label
								}, p.value))
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[180px] mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: chartData,
								margin: {
									top: 4,
									right: 8,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "saleGrad",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "5%",
											stopColor: "#3b82f6",
											stopOpacity: .15
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "95%",
											stopColor: "#3b82f6",
											stopOpacity: .01
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "#f0f0f0",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "date",
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 10,
											fill: "#9ca3af"
										},
										tickFormatter: (_, i) => chartXLabels[i] ?? "",
										interval: 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tickLine: false,
										axisLine: false,
										tick: {
											fontSize: 10,
											fill: "#9ca3af"
										},
										tickFormatter: (v) => v === 0 ? "0" : `${(v / 1e3).toFixed(0)}k`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											fontSize: 12,
											border: "1px solid #e5e7eb",
											borderRadius: 6,
											padding: "6px 10px"
										},
										labelFormatter: (label) => {
											const d = new Date(label);
											return `${d.getDate()} ${d.toLocaleString("en", {
												month: "short",
												year: "numeric"
											})}`;
										},
										formatter: (v) => [`₹ ${fmt(v)}`, "Sale"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "amount",
										stroke: "#3b82f6",
										strokeWidth: 2,
										fill: "url(#saleGrad)",
										dot: false,
										activeDot: {
											r: 4,
											fill: "#3b82f6"
										}
									})
								]
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold text-gray-700",
								children: "Most Used Reports"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => navigate({ to: "/reports" }),
								className: "text-xs text-blue-600 hover:underline font-medium",
								children: "View All"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
							children: reports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: r.go,
								className: "flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50/40 transition group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "h-3.5 w-3.5 text-blue-600" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium text-gray-700",
										children: r.label
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition" })]
							}, r.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => navigate({ to: "/sales/new" }),
									className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Sale"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => navigate({ to: "/purchase/new" }),
									className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Purchase"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => navigate({ to: "/parties" }),
									className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }), " Add Party"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => navigate({ to: "/items" }),
									className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }), " Add Item"]
								})
							]
						}),
						lowStock.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 text-amber-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-semibold text-amber-700",
									children: [
										"Low Stock Alerts (",
										lowStock.length,
										")"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: lowStock.slice(0, 4).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs text-amber-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate flex-1",
										children: i.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold ml-2",
										children: [
											"Stock: ",
											i.stock,
											" / Min: ",
											i.minStock
										]
									})]
								}, i.id))
							})]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-[240px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Purchases",
					badge: periodLabel,
					value: `₹ ${fmt(totalPurchase)}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Expenses",
					badge: periodLabel,
					value: `₹ ${fmt(totalExpense)}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Stock Value",
					badge: "As of Now",
					value: `₹ ${fmt(stockValue)}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Cash In Hand",
					badge: "As of Now",
					value: `₹ ${fmt(Math.max(0, cashInHand))}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Total Bank Balance",
					badge: "As of Now",
					value: `₹ ${fmt(bankBalance)}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					label: "Net Profit",
					badge: periodLabel,
					value: `₹ ${fmt(netProfit)}`,
					valueClass: netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-gray-200 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-blue-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-gray-700",
							children: "Business Summary"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-gray-400 leading-relaxed",
						children: "Track your receivables, payables and profit at a glance. Add transactions to see live insights."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-gray-200 p-4 mt-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ to: "/sales" }),
						className: "w-full flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add Widget of Your Choice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })]
					})
				})
			]
		})]
	});
}
function StatRow({ label, badge, value, valueClass = "text-gray-800" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 py-3.5 border-b border-gray-100",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium text-gray-600",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5",
				children: badge
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-[16px] font-bold mt-0.5 ${valueClass}`,
			children: value
		})]
	});
}
//#endregion
export { Dashboard as component };
