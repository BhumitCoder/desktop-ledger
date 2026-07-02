import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { H as ChevronsLeft, U as ChevronRight, V as ChevronsRight, W as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Pagination-DIDjCLDA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZES = [
	25,
	50,
	100
];
/** Client-side pagination over an already-filtered row array. */
function usePagination(rows, initialSize = 50) {
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(initialSize);
	const total = rows.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const safePage = Math.min(page, totalPages);
	(0, import_react.useEffect)(() => {
		setPage(1);
	}, [total]);
	return {
		paged: (0, import_react.useMemo)(() => rows.slice((safePage - 1) * pageSize, safePage * pageSize), [
			rows,
			safePage,
			pageSize
		]),
		page: safePage,
		setPage,
		pageSize,
		setPageSize,
		totalPages,
		total
	};
}
function pageList(page, totalPages) {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
	const nums = [.../* @__PURE__ */ new Set([
		1,
		totalPages,
		page - 1,
		page,
		page + 1
	])].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
	const out = [];
	let prev = 0;
	for (const n of nums) {
		if (n - prev > 1) out.push("…");
		out.push(n);
		prev = n;
	}
	return out;
}
function PaginationBar({ page, totalPages, pageSize, total, onPage, onPageSize }) {
	if (total <= PAGE_SIZES[0]) return null;
	const from = (page - 1) * pageSize + 1;
	const to = Math.min(total, page * pageSize);
	const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
	const btn = "h-7 min-w-7 px-1.5 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white text-[12px] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t bg-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[12px] text-gray-500 tabular-nums",
				children: [
					"Showing",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold text-gray-700",
						children: [
							fmt(from),
							"–",
							fmt(to)
						]
					}),
					" ",
					"of ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-gray-700",
						children: fmt(total)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-1.5 text-[12px] text-gray-500",
				children: ["Per page", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					value: pageSize,
					onChange: (e) => onPageSize(parseInt(e.target.value, 10)),
					className: "h-7 px-1.5 border border-gray-200 rounded-md bg-white text-[12px] text-gray-700 outline-none focus:border-primary",
					children: PAGE_SIZES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s,
						children: s
					}, s))
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: btn,
					disabled: page <= 1,
					onClick: () => onPage(1),
					title: "First page",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "h-3.5 w-3.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: btn,
					disabled: page <= 1,
					onClick: () => onPage(page - 1),
					title: "Previous page",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" })
				}),
				pageList(page, totalPages).map((p, i) => p === "…" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "px-1 text-[12px] text-gray-400",
					children: "…"
				}, `e${i}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => onPage(p),
					className: `${btn} tabular-nums ${p === page ? "!bg-primary !text-primary-foreground !border-primary font-semibold" : ""}`,
					children: p
				}, p)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: btn,
					disabled: page >= totalPages,
					onClick: () => onPage(page + 1),
					title: "Next page",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: btn,
					disabled: page >= totalPages,
					onClick: () => onPage(totalPages),
					title: "Last page",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "h-3.5 w-3.5" })
				})
			]
		})]
	});
}
//#endregion
export { usePagination as n, PaginationBar as t };
