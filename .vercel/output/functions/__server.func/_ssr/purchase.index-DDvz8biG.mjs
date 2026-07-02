import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as PaymentRepo, l as PurchaseRepo, o as ItemRepo, s as PartyRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { G as ChevronDown, d as Search, g as Plus, l as ShoppingCart, s as Trash2, t as X, v as Pencil } from "../_libs/lucide-react.mjs";
import { n as usePagination, t as PaginationBar } from "./Pagination-BTUerXgm.mjs";
import { i as ymd, n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/purchase.index-DDvz8biG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var THIS_MONTH_START = ymd(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
var TODAY = today();
function PurchasePage() {
	const navigate = useNavigate();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [parties, setParties] = (0, import_react.useState)([]);
	const [dateFrom, setDateFrom] = (0, import_react.useState)(THIS_MONTH_START);
	const [dateTo, setDateTo] = (0, import_react.useState)(TODAY);
	const [partyId, setPartyId] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [showPartyDrop, setShowPartyDrop] = (0, import_react.useState)(false);
	const refresh = () => {
		setRows(PurchaseRepo.all());
		setParties(PartyRepo.all().map((p) => ({
			id: p.id,
			name: p.name
		})));
	};
	(0, import_react.useEffect)(refresh, []);
	const filtered = (0, import_react.useMemo)(() => {
		return rows.filter((r) => {
			if (dateFrom && r.date < dateFrom) return false;
			if (dateTo && r.date > dateTo) return false;
			if (partyId !== "all" && r.partyId !== partyId) return false;
			if (status !== "all") {
				const bal = Math.round((r.total - r.paid) * 100) / 100;
				if (status === "paid" && bal > 0) return false;
				if (status === "unpaid" && r.paid > 0) return false;
				if (status === "partial" && (r.paid === 0 || bal <= 0)) return false;
			}
			if (search) {
				const q = search.toLowerCase();
				if (!r.number.toLowerCase().includes(q) && !r.partyName.toLowerCase().includes(q)) return false;
			}
			return true;
		});
	}, [
		rows,
		dateFrom,
		dateTo,
		partyId,
		status,
		search
	]);
	const pg = usePagination(filtered);
	const totalAmount = filtered.reduce((a, r) => a + r.total, 0);
	const totalPaid = filtered.reduce((a, r) => a + r.paid, 0);
	const totalPayable = filtered.reduce((a, r) => a + Math.max(0, r.total - r.paid), 0);
	filtered.filter((r) => r.total - r.paid <= 0).length;
	filtered.filter((r) => r.paid === 0 && r.total > 0).length;
	filtered.filter((r) => r.paid > 0 && r.total - r.paid > 0).length;
	const selectedParty = parties.find((p) => p.id === partyId);
	const clearFilters = () => {
		setDateFrom(THIS_MONTH_START);
		setDateTo(TODAY);
		setPartyId("all");
		setStatus("all");
		setSearch("");
	};
	const handleDelete = (r) => {
		if (!confirm(`Delete bill ${r.number}? Purchased quantities will be removed from stock, and any payments applied to it will become advance payments.`)) return;
		for (const l of r.lineItems) {
			const it = ItemRepo.get(l.itemId);
			if (it) ItemRepo.adjustField(it.id, "stock", -l.qty);
		}
		for (const p of PaymentRepo.all()) if (p.allocations?.some((a) => a.invoiceId === r.id)) {
			const remaining = p.allocations.filter((a) => a.invoiceId !== r.id);
			PaymentRepo.update(p.id, { allocations: remaining.length ? remaining : void 0 });
		}
		PurchaseRepo.remove(r.id);
		refresh();
		toast.success("Bill deleted — stock adjusted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-[#f5f6fa]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border-b px-5 py-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[17px] font-bold text-gray-800",
					children: "Purchase"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[12px] text-gray-400",
					children: [
						filtered.length,
						" of ",
						rows.length,
						" bills"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => navigate({ to: "/purchase/new" }),
					className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
						" Add Purchase",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded",
							children: "Ctrl+P"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border-b px-5 py-3 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								className: "border border-gray-200 rounded-md text-xs px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium text-gray-500",
								children: "To"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: dateTo,
								onChange: (e) => setDateTo(e.target.value),
								className: "border border-gray-200 rounded-md text-xs px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setShowPartyDrop((v) => !v),
							className: "flex items-center gap-2 border border-gray-200 rounded-md text-xs px-3 py-1.5 text-gray-700 bg-white hover:bg-gray-50 transition min-w-[150px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left truncate",
								children: selectedParty ? selectedParty.name : "All Suppliers"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400 flex-shrink-0" })]
						}), showPartyDrop && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 w-56 max-h-64 overflow-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 border-b",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										autoFocus: true,
										placeholder: "Search supplier...",
										className: "w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none",
										onChange: (e) => {
											const q = e.target.value.toLowerCase();
											setParties(PartyRepo.all().filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({
												id: p.id,
												name: p.name
											})));
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setPartyId("all");
										setShowPartyDrop(false);
										setParties(PartyRepo.all().map((p) => ({
											id: p.id,
											name: p.name
										})));
									},
									className: `w-full text-left px-3 py-2 text-xs hover:bg-blue-50 ${partyId === "all" ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`,
									children: "All Suppliers"
								}),
								parties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										setPartyId(p.id);
										setShowPartyDrop(false);
										setParties(PartyRepo.all().map((x) => ({
											id: x.id,
											name: x.name
										})));
									},
									className: `w-full text-left px-3 py-2 text-xs hover:bg-blue-50 truncate ${partyId === p.id ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`,
									children: p.name
								}, p.id)),
								parties.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-gray-400 text-center py-3",
									children: "No suppliers found"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1.5 bg-white flex-1 min-w-[180px] max-w-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 text-gray-400 flex-shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "Search bill, supplier...",
								className: "text-xs flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
							}),
							search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSearch(""),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 text-gray-400 hover:text-gray-600" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: clearFilters,
						className: "text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" }), " Clear"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-0 bg-white border-b",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Total Purchase",
						value: totalAmount,
						color: "text-gray-800",
						border: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Total Paid",
						value: totalPaid,
						color: "text-emerald-600",
						border: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Total Payable",
						value: totalPayable,
						color: "text-rose-600"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-[13px] border-collapse",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "sticky top-0 bg-white border-b z-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Bill #" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Supplier" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									align: "right",
									children: "Items"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									align: "right",
									children: "Total Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									align: "right",
									children: "Paid"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									align: "right",
									children: "Balance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Mode" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									align: "center",
									children: "Action"
								})
							] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 10,
							className: "text-center py-16 text-gray-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-10 w-10 mx-auto mb-3 text-gray-200" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "No bills found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs mt-1",
									children: "Try adjusting filters or add a new purchase"
								})
							]
						}) }) : pg.paged.map((r) => {
							const balance = Math.round((r.total - r.paid) * 100) / 100;
							const isPaid = balance <= 0;
							const isUnpaid = r.paid === 0 && r.total > 0;
							const isPartial = r.paid > 0 && balance > 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								onClick: () => navigate({
									to: "/purchase/$id",
									params: { id: r.id }
								}),
								className: "border-b border-gray-100 hover:bg-primary/5 transition-colors cursor-pointer group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-mono font-semibold text-blue-600 text-xs",
										children: r.number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-gray-600",
										children: fmtDate(r.date)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate",
										children: r.partyName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right text-gray-500",
										children: r.lineItems.length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right font-semibold text-gray-800 tabular-nums",
										children: fmtMoney(r.total)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right text-emerald-600 font-medium tabular-nums",
										children: fmtMoney(r.paid)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right tabular-nums",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: balance > 0 ? "text-rose-600 font-semibold" : "text-gray-400",
											children: fmtMoney(Math.max(0, balance))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											paid: isPaid,
											partial: isPartial,
											unpaid: isUnpaid
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-gray-500 capitalize text-xs",
										children: r.paymentMode
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 text-center whitespace-nowrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: (e) => {
												e.stopPropagation();
												navigate({
													to: "/purchase/edit/$id",
													params: { id: r.id }
												});
											},
											className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition",
											title: "Edit bill",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: (e) => {
												e.stopPropagation();
												handleDelete(r);
											},
											className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition",
											title: "Delete bill",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})]
									})
								]
							}, r.id);
						}) }),
						filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
							className: "sticky bottom-0 bg-gray-50 border-t-2 border-gray-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 4,
									className: "px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide",
									children: [
										"Total (",
										filtered.length,
										" bills)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-bold text-gray-800 tabular-nums text-sm",
									children: fmtMoney(totalAmount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-bold text-emerald-600 tabular-nums text-sm",
									children: fmtMoney(totalPaid)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-bold text-rose-600 tabular-nums text-sm",
									children: fmtMoney(totalPayable)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 3 })
							] })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationBar, {
				page: pg.page,
				totalPages: pg.totalPages,
				pageSize: pg.pageSize,
				total: pg.total,
				onPage: pg.setPage,
				onPageSize: pg.setPageSize
			})
		]
	});
}
function SummaryCard({ label, value, color, border }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `px-5 py-3.5 ${border ? "border-r border-gray-100" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-[20px] font-bold tabular-nums ${color}`,
			children: fmtMoney(value)
		})]
	});
}
function StatusBadge({ paid, partial, unpaid }) {
	if (paid) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200",
		children: "Paid"
	});
	if (partial) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200",
		children: "Partial"
	});
	if (unpaid) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200",
		children: "Unpaid"
	});
	return null;
}
function Th({ children, align }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: "px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap bg-white",
		style: { textAlign: align ?? "left" },
		children
	});
}
//#endregion
export { PurchasePage as component };
