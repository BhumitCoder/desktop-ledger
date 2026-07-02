import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PartyRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Search, g as Plus, k as FileText, v as Pencil } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { t as DataTable } from "./DataTable-DmEJ8EtF.mjs";
import { n as fmtMoney } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parties-AtDLE89z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PartiesPage() {
	const navigate = useNavigate();
	const [rows, setRows] = (0, import_react.useState)([]);
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const refresh = () => setRows(PartyRepo.all());
	(0, import_react.useEffect)(refresh, []);
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if (e.key === "n" && !e.ctrlKey && !e.metaKey && !isTyping(e)) {
				e.preventDefault();
				setEdit(null);
				setOpen(true);
			}
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, []);
	const filtered = rows.filter((r) => {
		const s = q.toLowerCase();
		return !s || r.name.toLowerCase().includes(s) || r.phone?.includes(s);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Parties",
				subtitle: `${rows.length} customers / suppliers`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => {
						setEdit(null);
						setOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }),
						" New Party ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "text-[10px] ml-1",
							children: "N"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex gap-2 border-b bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-2 top-2.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						placeholder: "Search parties...",
						value: q,
						onChange: (e) => setQ(e.target.value),
						className: "h-8 pl-7 pr-2 border rounded w-full bg-background focus:border-primary outline-none"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 flex-1 min-h-0 flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					columns: [
						{
							key: "name",
							label: "Name",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: r.name
							}),
							sortValue: (r) => r.name
						},
						{
							key: "phone",
							label: "Phone",
							width: "160px",
							render: (r) => r.phone ?? "—"
						},
						{
							key: "balance",
							label: "Opening Balance",
							align: "right",
							width: "150px",
							render: (r) => fmtMoney(r.openingBalance),
							sortValue: (r) => r.openingBalance
						},
						{
							key: "credit",
							label: "Credit Limit",
							align: "right",
							width: "130px",
							render: (r) => r.creditLimit ? fmtMoney(r.creditLimit) : "—"
						},
						{
							key: "actions",
							label: "",
							width: "90px",
							align: "center",
							render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										navigate({
											to: "/parties/$id",
											params: { id: r.id }
										});
									},
									className: "p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition",
									title: "View statement",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										setEdit(r);
										setOpen(true);
									},
									className: "p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition",
									title: "Edit party",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
								})]
							})
						}
					],
					rows: filtered,
					rowKey: (r) => r.id,
					onRowActivate: (r) => navigate({
						to: "/parties/$id",
						params: { id: r.id }
					}),
					onDelete: (r) => {
						if (confirm(`Delete ${r.name}?`)) {
							PartyRepo.remove(r.id);
							refresh();
							toast.success("Party deleted");
						}
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyDialog, {
				open,
				onOpenChange: setOpen,
				party: edit,
				onSaved: () => {
					refresh();
				}
			})
		]
	});
}
function PartyDialog({ open, onOpenChange, party, onSaved }) {
	const firstRef = (0, import_react.useRef)(null);
	const [form, setForm] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setForm(party ?? {
				type: "both",
				openingBalance: 0
			});
			setSaving(false);
			setTimeout(() => firstRef.current?.focus(), 50);
		}
	}, [open, party]);
	const save = (e) => {
		e.preventDefault();
		if (saving) return;
		if (!form.name?.trim()) {
			toast.error("Name is required");
			return;
		}
		setSaving(true);
		if (party) {
			PartyRepo.update(party.id, form);
			toast.success("Party updated");
		} else {
			PartyRepo.add({
				...form,
				name: form.name,
				type: "both",
				openingBalance: form.openingBalance ?? 0
			});
			toast.success("Party created");
		}
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			onKeyDown: (e) => {
				if (e.key === "Escape") onOpenChange(false);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: party ? "Edit Party" : "New Party" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						ref: firstRef,
						label: "Name *",
						value: form.name ?? "",
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						value: form.phone ?? "",
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Opening Balance",
						type: "number",
						value: form.openingBalance ?? 0,
						onChange: (e) => setForm({
							...form,
							openingBalance: parseFloat(e.target.value) || 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Credit Limit",
						type: "number",
						value: form.creditLimit ?? "",
						onChange: (e) => setForm({
							...form,
							creditLimit: parseFloat(e.target.value) || void 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-2 flex justify-end gap-2 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							disabled: saving,
							onClick: () => onOpenChange(false),
							children: ["Cancel ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-1 text-[10px]",
								children: "Esc"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: saving,
							children: saving ? "Saving…" : "Save"
						})]
					})
				]
			})]
		})
	});
}
function isTyping(e) {
	const el = e.target;
	return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}
//#endregion
export { PartyDialog, PartiesPage as component };
