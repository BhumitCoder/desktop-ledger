import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as SaleReturnRepo, o as ItemRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { P as CornerDownLeft, g as Plus, k as FileText, s as Trash2 } from "../_libs/lucide-react.mjs";
import { n as usePagination, t as PaginationBar } from "./Pagination-DIDjCLDA.mjs";
import { n as fmtMoney, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sale-return.index-CNtbvH5X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SaleReturnPage() {
	const navigate = useNavigate();
	const [rows, setRows] = (0, import_react.useState)([]);
	const refresh = () => setRows(SaleReturnRepo.all().sort((a, b) => b.date.localeCompare(a.date)));
	(0, import_react.useEffect)(refresh, []);
	const totalCredit = rows.reduce((s, r) => s + r.total, 0);
	const pg = usePagination(rows);
	const handleDelete = (e, r) => {
		e.stopPropagation();
		if (!confirm(`Delete return ${r.number}? Returned quantities will be removed from stock again.`)) return;
		for (const l of r.lineItems) {
			const it = ItemRepo.get(l.itemId);
			if (it) ItemRepo.adjustField(it.id, "stock", -l.qty);
		}
		SaleReturnRepo.remove(r.id);
		refresh();
		toast.success("Sale return deleted — stock adjusted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-[#f5f6fa]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border-b px-5 py-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[17px] font-bold text-gray-800",
						children: "Sale Returns"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[12px] text-gray-400",
						children: [
							rows.length,
							" credit notes · Total: ",
							fmtMoney(totalCredit)
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => navigate({ to: "/sale-return/new" }),
					className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Sale Return"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-[13px] border-collapse",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "sticky top-0 bg-white border-b z-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
								"Credit Note #",
								"Date",
								"Original Inv #",
								"Party",
								"Items",
								"GST",
								"Total",
								"Action"
							].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: `px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap bg-white ${i >= 4 ? "text-right" : "text-left"} ${h === "Action" ? "text-center" : ""}`,
								children: h
							}, h)) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 8,
							className: "text-center py-20 text-gray-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-10 w-10 mx-auto mb-3 text-gray-200" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "No sale returns yet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs mt-1",
									children: "Click \"New Sale Return\" to create a credit note"
								})
							]
						}) }) : pg.paged.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							onClick: () => navigate({
								to: "/sale-return/$id",
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
									className: "px-4 py-3 font-mono text-xs text-gray-500",
									children: r.originalRef || "—"
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
									className: "px-4 py-3 text-right text-gray-500 text-xs",
									children: r.gstEnabled ? "Yes" : "No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-semibold text-gray-800 tabular-nums",
									children: fmtMoney(r.total)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: (e) => handleDelete(e, r),
										className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								})
							]
						}, r.id)) }),
						rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
							className: "sticky bottom-0 bg-gray-50 border-t-2 border-gray-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 6,
									className: "px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide",
									children: [
										"Total (",
										rows.length,
										" returns)"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-bold text-gray-800 tabular-nums text-sm",
									children: fmtMoney(totalCredit)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {})
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
//#endregion
export { SaleReturnPage as component };
