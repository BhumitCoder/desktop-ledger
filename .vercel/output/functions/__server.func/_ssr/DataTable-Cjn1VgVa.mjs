import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as usePagination, t as PaginationBar } from "./Pagination-BTUerXgm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DataTable-Cjn1VgVa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DataTable({ columns, rows, rowKey, onRowActivate, onDelete, emptyMessage }) {
	const [sortKey, setSortKey] = (0, import_react.useState)(null);
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [selectedIdx, setSelectedIdx] = (0, import_react.useState)(0);
	const tableRef = (0, import_react.useRef)(null);
	const sorted = [...rows];
	if (sortKey) {
		const col = columns.find((c) => c.key === sortKey);
		if (col?.sortValue) sorted.sort((a, b) => {
			const av = col.sortValue(a);
			const bv = col.sortValue(b);
			if (av < bv) return sortDir === "asc" ? -1 : 1;
			if (av > bv) return sortDir === "asc" ? 1 : -1;
			return 0;
		});
	}
	const pg = usePagination(sorted);
	const paged = pg.paged;
	(0, import_react.useEffect)(() => {
		if (selectedIdx >= paged.length) setSelectedIdx(Math.max(0, paged.length - 1));
	}, [paged.length, selectedIdx]);
	const onKey = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIdx((i) => Math.min(paged.length - 1, i + 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIdx((i) => Math.max(0, i - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const row = paged[selectedIdx];
			if (row) onRowActivate?.(row);
		} else if (e.key === "Delete" && e.ctrlKey) {
			e.preventDefault();
			const row = paged[selectedIdx];
			if (row) onDelete?.(row);
		}
	};
	const toggleSort = (key) => {
		if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
		else {
			setSortKey(key);
			setSortDir("asc");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex-1 min-h-0 flex flex-col border rounded-md bg-card overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: tableRef,
			tabIndex: 0,
			onKeyDown: onKey,
			className: "data-table flex-1 overflow-auto outline-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-[13px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
					style: {
						width: c.width,
						textAlign: c.align ?? "left"
					},
					onClick: () => c.sortValue && toggleSort(c.key),
					className: cn(c.sortValue && "cursor-pointer select-none"),
					children: [c.label, sortKey === c.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1",
						children: sortDir === "asc" ? "↑" : "↓"
					})]
				}, c.key)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: paged.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: columns.length,
					className: "text-center py-8 text-muted-foreground",
					children: emptyMessage ?? "No data. Press N to add."
				}) }) : paged.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					"data-selected": i === selectedIdx,
					onClick: () => setSelectedIdx(i),
					onDoubleClick: () => onRowActivate?.(row),
					className: "cursor-pointer",
					children: columns.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						style: { textAlign: c.align ?? "left" },
						children: c.render(row)
					}, c.key))
				}, rowKey(row))) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationBar, {
			page: pg.page,
			totalPages: pg.totalPages,
			pageSize: pg.pageSize,
			total: pg.total,
			onPage: pg.setPage,
			onPageSize: pg.setPageSize
		})]
	});
}
//#endregion
export { DataTable as t };
