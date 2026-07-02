import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { f as SaleReturnRepo, i as CompanyRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as CircleAlert, h as Printer, tt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as fmtMoney, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./sale-return._id-C_edYmd4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sale-return._id-LMq1v5NY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2 = (n) => Math.round(n * 100) / 100;
function SaleReturnDetailPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [ret, setRet] = (0, import_react.useState)(null);
	const [co, setCo] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setRet(SaleReturnRepo.get(id) ?? null);
		setCo(CompanyRepo.get());
	}, [id]);
	if (!ret) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full items-center justify-center gap-3 text-gray-400",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-12 w-12 text-gray-200" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Credit note not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => navigate({ to: "/sale-return" }),
				className: "text-sm text-primary hover:underline",
				children: "← Back to Sale Returns"
			})
		]
	});
	const gstBreakdown = /* @__PURE__ */ new Map();
	if (ret.gstEnabled) ret.lineItems.forEach((l) => {
		const taxable = r2(l.qty * l.price * (1 - l.discountPct / 100));
		const half = r2(r2(taxable * l.gstRate / 100) / 2);
		const cur = gstBreakdown.get(l.gstRate) ?? {
			taxable: 0,
			cgst: 0,
			sgst: 0
		};
		gstBreakdown.set(l.gstRate, {
			taxable: r2(cur.taxable + taxable),
			cgst: r2(cur.cgst + half),
			sgst: r2(cur.sgst + half)
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-gray-100",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print bg-white border-b px-5 py-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({ to: "/sale-return" }),
				className: "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Sale Returns"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Credit Note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold font-mono",
							children: ret.number
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Customer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: ret.partyName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold text-gray-800",
							children: fmtMoney(ret.total)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => window.print(),
						className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:opacity-90 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print / PDF"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-auto py-6 px-4 flex justify-center bg-gray-100",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white w-full max-w-[794px] shadow-lg print:shadow-none print:m-0",
				style: {
					minHeight: "1123px",
					padding: "40px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-start mb-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-[28px] font-bold text-gray-800 tracking-tight",
								children: co?.name || "Company"
							}),
							co?.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-gray-500 mt-0.5",
								children: ["GSTIN: ", co.gstin]
							}),
							co?.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-gray-500",
								children: ["Phone: ", co.phone]
							}),
							co?.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gray-500 max-w-[260px]",
								children: co.address
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-block bg-amber-50 border-2 border-amber-300 rounded-lg px-5 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1",
									children: "Credit Note"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[22px] font-extrabold text-gray-800 font-mono",
									children: ret.number
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-right text-xs text-gray-500 space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Date: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-gray-700",
									children: fmtDate(ret.date)
								})] }), ret.originalRef && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									"Against:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-gray-700 font-mono",
										children: ret.originalRef
									})
								] })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t-2 border-b border-gray-200 py-4 mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1",
								children: "Return From (Customer)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[16px] font-bold text-gray-800",
								children: ret.partyName
							}),
							ret.partyPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-gray-500",
								children: ["📞 ", ret.partyPhone]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-gray-50 border-y border-gray-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "#"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Item"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Price"
								}),
								ret.lineItems.some((l) => l.discountPct > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Disc%"
								}),
								ret.gstEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "GST%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: "Amount"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ret.lineItems.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-gray-100",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-gray-400 text-xs",
									children: i + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 font-medium text-gray-800",
									children: l.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right text-gray-700",
									children: l.qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-gray-500 text-xs",
									children: l.unit
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right tabular-nums",
									children: fmtMoney(l.price)
								}),
								ret.lineItems.some((x) => x.discountPct > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right text-gray-500",
									children: l.discountPct > 0 ? `${l.discountPct}%` : "—"
								}),
								ret.gstEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2.5 text-right text-gray-500",
									children: [l.gstRate, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-semibold tabular-nums",
									children: fmtMoney(l.amount)
								})
							]
						}, l.id)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end mb-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-72 space-y-1.5 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-500",
										children: "Subtotal"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: fmtMoney(ret.subtotal)
									})]
								}),
								ret.gstEnabled && gstBreakdown.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Array.from(gstBreakdown.entries()).map(([rate, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-gray-400 space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"CGST (",
											rate / 2,
											"%)"
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums",
											children: fmtMoney(v.cgst)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"SGST (",
											rate / 2,
											"%)"
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums",
											children: fmtMoney(v.sgst)
										})]
									})]
								}, rate)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-500",
										children: "Total GST"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: fmtMoney(ret.taxAmount)
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center pt-2 mt-1 border-t-2 border-gray-800 font-bold text-[18px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Credit Note Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-amber-600",
										children: fmtMoney(ret.total)
									})]
								})
							]
						})
					}),
					ret.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-gray-200 pt-4 mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1",
							children: "Notes / Reason"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-gray-600",
							children: ret.notes
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "This is a computer-generated credit note." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: co?.name })]
					})
				]
			})
		})]
	});
}
//#endregion
export { SaleReturnDetailPage as component };
