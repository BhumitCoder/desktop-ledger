import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as PaymentRepo, g as genId, l as PurchaseRepo, p as SalesRepo, s as PartyRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as CircleAlert, I as Circle, L as CircleCheck, R as CircleArrowUp, T as LoaderCircle, U as ChevronRight, d as Search, n as Wallet, s as Trash2, t as X, v as Pencil, z as CircleArrowDown } from "../_libs/lucide-react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { n as usePagination, t as PaginationBar } from "./Pagination-DIDjCLDA.mjs";
import { n as fmtMoney, r as today, t as fmtDate } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-C8GFcNgg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2 = (n) => Math.round(n * 100) / 100;
function PaymentsPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [formType, setFormType] = (0, import_react.useState)("in");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const refresh = () => setRows(PaymentRepo.all().sort((a, b) => b.date.localeCompare(a.date)));
	(0, import_react.useEffect)(refresh, []);
	const filtered = rows.filter((r) => {
		if (tab !== "all" && r.type !== tab) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!r.partyName.toLowerCase().includes(q) && !(r.ref ?? "").toLowerCase().includes(q)) return false;
		}
		return true;
	});
	const totalIn = rows.filter((r) => r.type === "in").reduce((s, r) => s + r.amount, 0);
	const totalOut = rows.filter((r) => r.type === "out").reduce((s, r) => s + r.amount, 0);
	const net = totalIn - totalOut;
	const pg = usePagination(filtered);
	const openForm = (type) => {
		setFormType(type);
		setEditing(null);
		setOpen(true);
	};
	const openEdit = (r) => {
		setFormType(r.type);
		setEditing(r);
		setOpen(true);
	};
	const handleDelete = (r) => {
		if (!confirm("Delete this payment record? Amounts applied to invoices/bills will be reversed.")) return;
		const repo = r.type === "in" ? SalesRepo : PurchaseRepo;
		if (r.allocations?.length) {
			for (const a of r.allocations) if (repo.get(a.invoiceId)) repo.adjustField(a.invoiceId, "paid", -a.amount);
		} else if (r.ref) {
			const tokens = r.ref.split(",").map((t) => t.trim()).filter(Boolean);
			const all = repo.all();
			let remaining = r.amount;
			for (const t of tokens) {
				if (remaining <= 0) break;
				const inv = all.find((i) => i.number === t);
				if (!inv) continue;
				const take = Math.min(remaining, inv.paid);
				if (take > 0) {
					repo.update(inv.id, { paid: r2(inv.paid - take) });
					remaining = r2(remaining - take);
				}
			}
		}
		PaymentRepo.remove(r.id);
		refresh();
		toast.success("Payment deleted");
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
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[17px] font-bold text-gray-800",
						children: "Payments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[12px] text-gray-400",
						children: [rows.length, " records"]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openForm("in"),
						className: "inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "h-4 w-4" }), " Receive Payment"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => openForm("out"),
						className: "inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-md text-sm font-semibold hover:bg-rose-700 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "h-4 w-4" }), " Make Payment"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-0 bg-white border-b",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5 border-r border-gray-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: "Total Received"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[20px] font-bold tabular-nums text-emerald-600",
							children: fmtMoney(totalIn)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5 border-r border-gray-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: "Total Paid Out"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[20px] font-bold tabular-nums text-rose-600",
							children: fmtMoney(totalOut)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: "Net Cash Flow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-[20px] font-bold tabular-nums ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`,
							children: fmtMoney(net)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-white border-b px-5 py-2 flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: [
						"all",
						"in",
						"out"
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTab(t),
						className: `px-3 py-1.5 text-xs font-semibold rounded-md transition ${tab === t ? t === "in" ? "bg-emerald-50 text-emerald-700" : t === "out" ? "bg-rose-50 text-rose-700" : "bg-gray-100 text-gray-700" : "text-gray-500 hover:bg-gray-50"}`,
						children: t === "all" ? "All" : t === "in" ? "Received (In)" : "Paid Out"
					}, t))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 border border-gray-200 rounded-md px-2.5 py-1.5 bg-white flex-1 max-w-xs ml-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 text-gray-400" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search party, reference…",
							className: "text-xs flex-1 outline-none placeholder-gray-400 bg-transparent"
						}),
						search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearch(""),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 text-gray-400 hover:text-gray-600" })
						})
					]
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
								"Date",
								"Type",
								"Party",
								"Linked Invoice / Bill",
								"Mode",
								"Reference",
								"Amount",
								""
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: `px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap bg-white ${h === "Amount" ? "text-right" : "text-left"}`,
								children: h
							}, h)) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 8,
							className: "text-center py-20 text-gray-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-10 w-10 mx-auto mb-3 text-gray-200" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "No payments recorded"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs mt-1",
									children: "Use the buttons above to record a payment"
								})
							]
						}) }) : pg.paged.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-gray-100 hover:bg-gray-50/60 transition-colors group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-gray-600 whitespace-nowrap",
									children: fmtDate(r.date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: r.type === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "h-3 w-3" }), " Received"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "h-3 w-3" }), " Paid Out"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-medium text-gray-800 max-w-[150px] truncate",
									children: r.partyName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono text-xs text-blue-600",
									children: r.allocations?.length ? r.allocations.map((a) => a.number).join(", ") : r.ref && r.ref.match(/^(INV|PUR)-/) ? r.ref : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-400",
										children: "—"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-gray-500 capitalize text-xs",
									children: r.mode
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono text-xs text-gray-400",
									children: r.ref && (r.allocations?.length || !r.ref.match(/^(INV|PUR)-/)) ? r.ref : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: `px-4 py-3 text-right font-bold tabular-nums text-sm ${r.type === "in" ? "text-emerald-600" : "text-rose-600"}`,
									children: [r.type === "out" ? "−" : "+", fmtMoney(r.amount)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 whitespace-nowrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => openEdit(r),
										className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition",
										title: "Edit payment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => handleDelete(r),
										className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition",
										title: "Delete payment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})
							]
						}, r.id)) }),
						filtered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
							className: "sticky bottom-0 bg-gray-50 border-t-2 border-gray-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 6,
									className: "px-4 py-3 text-xs font-bold text-gray-500 uppercase",
									children: [
										filtered.length,
										" record",
										filtered.length !== 1 ? "s" : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right font-bold tabular-nums text-sm text-gray-800",
									children: fmtMoney(filtered.reduce((s, r) => s + (r.type === "in" ? r.amount : -r.amount), 0))
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceivePaymentDialog, {
				open,
				onOpenChange: (v) => {
					setOpen(v);
					if (!v) setEditing(null);
				},
				type: formType,
				editing,
				onSaved: refresh
			})
		]
	});
}
function ReceivePaymentDialog({ open, onOpenChange, type, editing, onSaved }) {
	const isIn = type === "in";
	const partyRef = (0, import_react.useRef)(null);
	const allParties = (0, import_react.useMemo)(() => PartyRepo.all(), []);
	const [partyQ, setPartyQ] = (0, import_react.useState)("");
	const [partyOpen, setPartyOpen] = (0, import_react.useState)(false);
	const [partyIdx, setPartyIdx] = (0, import_react.useState)(0);
	const [selectedParty, setSelectedParty] = (0, import_react.useState)(null);
	const [date, setDate] = (0, import_react.useState)(today());
	const [mode, setMode] = (0, import_react.useState)("cash");
	const [ref, setRef] = (0, import_react.useState)("");
	const [applyRows, setApplyRows] = (0, import_react.useState)([]);
	const [manualAmount, setManualAmount] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const savingRef = (0, import_react.useRef)(false);
	const suggests = partyQ.trim() ? allParties.filter((p) => p.name.toLowerCase().includes(partyQ.toLowerCase())).slice(0, 6) : [];
	(0, import_react.useEffect)(() => {
		if (open) {
			if (editing) {
				setPartyQ(editing.partyName);
				setSelectedParty({
					id: editing.partyId,
					name: editing.partyName
				});
				setDate(editing.date);
				setMode(editing.mode);
				setRef(editing.ref ?? "");
				setManualAmount(editing.allocations?.length ? "" : String(editing.amount));
			} else {
				setPartyQ("");
				setSelectedParty(null);
				setDate(today());
				setMode("cash");
				setRef("");
				setManualAmount("");
				setTimeout(() => partyRef.current?.focus(), 60);
			}
			setApplyRows([]);
			setSaving(false);
			savingRef.current = false;
		}
	}, [open, editing]);
	(0, import_react.useEffect)(() => {
		if (!selectedParty) {
			setApplyRows([]);
			return;
		}
		const repo = isIn ? SalesRepo : PurchaseRepo;
		const allocOf = new Map((editing?.allocations ?? []).map((a) => [a.invoiceId, a.amount]));
		const invoices = repo.all().filter((inv) => inv.partyId === selectedParty.id && (r2(inv.total - inv.paid) > .01 || allocOf.has(inv.id))).sort((a, b) => a.date.localeCompare(b.date));
		setApplyRows(invoices.map((inv) => {
			const back = allocOf.get(inv.id) ?? 0;
			return {
				invoice: inv,
				due: r2(inv.total - inv.paid + back),
				apply: back,
				checked: back > 0
			};
		}));
	}, [
		selectedParty,
		isIn,
		editing
	]);
	const selectParty = (p) => {
		setSelectedParty(p);
		setPartyQ(p.name);
		setPartyOpen(false);
	};
	const totalOutstanding = applyRows.reduce((s, r) => s + r.due, 0);
	const totalApplied = r2(applyRows.reduce((s, r) => s + r.apply, 0));
	const effectiveAmount = applyRows.length > 0 ? totalApplied : parseFloat(manualAmount) || 0;
	const toggleRow = (idx) => {
		setApplyRows((rows) => rows.map((r, i) => {
			if (i !== idx) return r;
			const checked = !r.checked;
			return {
				...r,
				checked,
				apply: checked ? r.due : 0
			};
		}));
	};
	const setApply = (idx, val) => {
		const num = parseFloat(val) || 0;
		setApplyRows((rows) => rows.map((r, i) => i === idx ? {
			...r,
			apply: Math.min(r.due, Math.max(0, num)),
			checked: num > 0
		} : r));
	};
	const applyAll = () => {
		setApplyRows((rows) => rows.map((r) => ({
			...r,
			checked: true,
			apply: r.due
		})));
	};
	const clearAll = () => {
		setApplyRows((rows) => rows.map((r) => ({
			...r,
			checked: false,
			apply: 0
		})));
	};
	const save = () => {
		if (savingRef.current) return;
		if (!selectedParty && !partyQ.trim()) {
			toast.error("Select or enter a party");
			return;
		}
		const amount = effectiveAmount;
		if (!amount || amount <= 0) {
			toast.error("Enter or select an amount to pay");
			return;
		}
		savingRef.current = true;
		setSaving(true);
		let partyId = selectedParty?.id ?? "";
		const partyName = selectedParty?.name ?? partyQ.trim();
		if (!partyId) {
			const match = allParties.find((p) => p.name.toLowerCase() === partyName.toLowerCase());
			partyId = match?.id ?? genId();
			if (!match) PartyRepo.add({
				id: partyId,
				name: partyName,
				type: "both",
				openingBalance: 0
			});
		}
		const repo = isIn ? SalesRepo : PurchaseRepo;
		if (editing?.allocations?.length) {
			for (const a of editing.allocations) if (repo.get(a.invoiceId)) repo.adjustField(a.invoiceId, "paid", -a.amount);
		}
		const allocations = [];
		for (const row of applyRows) if (row.apply > 0) {
			const cur = repo.get(row.invoice.id);
			if (!cur) continue;
			repo.adjustField(cur.id, "paid", r2(row.apply));
			allocations.push({
				invoiceId: cur.id,
				number: cur.number,
				amount: r2(row.apply)
			});
		}
		if (editing) PaymentRepo.update(editing.id, {
			date,
			partyId,
			partyName,
			type,
			amount: r2(amount),
			mode,
			ref: ref.trim() || void 0,
			allocations: allocations.length ? allocations : void 0
		});
		else {
			const payment = {
				id: genId(),
				date,
				partyId,
				partyName,
				type,
				amount: r2(amount),
				mode,
				ref: ref.trim() || void 0,
				allocations: allocations.length ? allocations : void 0,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			PaymentRepo.add(payment);
		}
		const invWord = isIn ? "invoice" : "bill";
		if (editing) toast.success(`Payment updated — ${fmtMoney(amount)}`);
		else if (allocations.length) toast.success(`${fmtMoney(amount)} applied to ${allocations.length} ${invWord}${allocations.length > 1 ? "s" : ""}`);
		else toast.success(`Payment ${isIn ? "received" : "sent"} recorded`);
		onSaved();
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "flex items-center gap-2 text-base",
				children: isIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "h-5 w-5 text-emerald-600" }),
					" ",
					editing ? "Edit Payment (Received)" : "Receive Payment from Customer"
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "h-5 w-5 text-rose-600" }),
					" ",
					editing ? "Edit Payment (Paid Out)" : "Make Payment to Supplier"
				] })
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 mt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-[12px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-gray-600",
								children: [isIn ? "Customer (Received From)" : "Supplier (Paid To)", " *"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: partyRef,
								value: partyQ,
								onChange: (e) => {
									setPartyQ(e.target.value);
									setPartyOpen(true);
									setPartyIdx(0);
									setSelectedParty(null);
									setApplyRows([]);
								},
								onFocus: () => partyQ && setPartyOpen(true),
								onBlur: () => setTimeout(() => setPartyOpen(false), 150),
								onKeyDown: (e) => {
									if (e.key === "ArrowDown") {
										e.preventDefault();
										setPartyIdx((i) => Math.min(suggests.length - 1, i + 1));
									} else if (e.key === "ArrowUp") {
										e.preventDefault();
										setPartyIdx((i) => Math.max(0, i - 1));
									} else if (e.key === "Enter") {
										e.preventDefault();
										if (suggests[partyIdx]) selectParty(suggests[partyIdx]);
									}
								},
								className: "h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none text-sm",
								placeholder: "Type to search party…"
							})]
						}), partyOpen && suggests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute z-30 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-lg max-h-40 overflow-auto",
							children: suggests.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onMouseDown: (e) => {
									e.preventDefault();
									selectParty(p);
								},
								className: `px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })]
							}, p.id))
						})]
					}),
					selectedParty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border-2 p-4 ${isIn ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
									children: [
										isIn ? "Outstanding Receivable from" : "Outstanding Payable to",
										" ",
										selectedParty.name
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-[22px] font-bold tabular-nums mt-0.5 ${isIn ? "text-emerald-700" : "text-rose-700"}`,
									children: fmtMoney(totalOutstanding)
								})] }), applyRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: applyAll,
										className: "text-xs px-2 py-1 rounded bg-white border font-medium text-gray-700 hover:bg-gray-50",
										children: "Apply All"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: clearAll,
										className: "text-xs px-2 py-1 rounded bg-white border font-medium text-gray-700 hover:bg-gray-50",
										children: "Clear"
									})]
								})]
							}),
							applyRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-gray-500 bg-white/60 rounded-md px-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-gray-400" }),
									"No outstanding ",
									isIn ? "invoices" : "bills",
									" — this will be recorded as an advance payment"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] font-semibold text-gray-500 uppercase tracking-wide",
									children: [
										applyRows.length,
										" Open ",
										isIn ? "Invoice" : "Bill",
										applyRows.length > 1 ? "s" : "",
										" — select to settle:"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "bg-white rounded-md border border-gray-200 overflow-hidden max-h-48 overflow-y-auto",
									children: applyRows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 transition ${row.checked ? isIn ? "bg-emerald-50/50" : "bg-rose-50/50" : ""}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => toggleRow(idx),
												className: "shrink-0 mt-0.5",
												children: row.checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `h-5 w-5 ${isIn ? "text-emerald-600" : "text-rose-500"}` }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-5 w-5 text-gray-300" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono font-semibold text-xs text-blue-600",
															children: row.invoice.number
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs text-gray-400",
															children: fmtDate(row.invoice.date)
														}),
														row.invoice.paid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full",
															children: "Partial"
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-gray-500 mt-0.5",
													children: [
														"Total ",
														fmtMoney(row.invoice.total),
														" · Already paid",
														" ",
														fmtMoney(row.invoice.paid)
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "shrink-0 text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-gray-400 mb-1",
													children: "Due"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: `text-sm font-bold tabular-nums ${isIn ? "text-emerald-700" : "text-rose-700"}`,
													children: fmtMoney(row.due)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "shrink-0 w-24",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-gray-400 mb-1 text-right",
													children: "Apply (₹)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													value: row.apply || "",
													min: 0,
													max: row.due,
													step: "0.01",
													onWheel: (e) => e.currentTarget.blur(),
													onChange: (e) => setApply(idx, e.target.value),
													placeholder: "0.00",
													className: `w-full h-7 px-2 text-right text-xs border rounded outline-none focus:ring-1 ${row.checked ? isIn ? "border-emerald-400 focus:ring-emerald-300 bg-white" : "border-rose-400 focus:ring-rose-300 bg-white" : "border-gray-200 bg-gray-50"} tabular-nums`
												})]
											})
										]
									}, row.invoice.id))
								})]
							}),
							applyRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-[12px] font-semibold text-gray-600 block mb-1",
									children: "Amount (₹) *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: manualAmount,
									min: 0,
									step: "0.01",
									onWheel: (e) => e.currentTarget.blur(),
									onChange: (e) => setManualAmount(e.target.value),
									className: `w-full h-9 px-3 border-2 rounded-md text-right font-bold text-lg outline-none focus:border-primary ${isIn ? "text-emerald-700" : "text-rose-700"}`,
									placeholder: "0.00"
								})]
							})
						]
					}),
					!selectedParty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border bg-gray-50 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[12px] font-semibold text-gray-600 block mb-1",
							children: "Amount (₹) *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: manualAmount,
							min: 0,
							step: "0.01",
							onWheel: (e) => e.currentTarget.blur(),
							onChange: (e) => setManualAmount(e.target.value),
							className: `w-full h-9 px-3 border-2 rounded-md text-right font-bold text-lg outline-none focus:border-primary ${isIn ? "text-emerald-700" : "text-rose-700"}`,
							placeholder: "0.00"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1 text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "font-semibold text-gray-600",
									children: "Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: date,
									onChange: (e) => setDate(e.target.value),
									className: "h-8 px-2 border rounded bg-white focus:border-primary outline-none text-sm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1 text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "font-semibold text-gray-600",
									children: "Payment Mode"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: mode,
									onChange: (e) => setMode(e.target.value),
									className: "h-8 px-2 border rounded bg-white focus:border-primary outline-none text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "cash",
											children: "Cash"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "upi",
											children: "UPI"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "bank",
											children: "Bank Transfer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "cheque",
											children: "Cheque"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1 text-[12px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "font-semibold text-gray-600",
									children: "Reference / Note"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: ref,
									onChange: (e) => setRef(e.target.value),
									placeholder: "UPI ref, cheque #…",
									className: "h-8 px-2 border rounded bg-white focus:border-primary outline-none text-sm"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border-2 p-4 flex items-center justify-between ${isIn ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-gray-500 font-medium",
							children: applyRows.some((r) => r.checked) ? `Applied to ${applyRows.filter((r) => r.checked).length} ${isIn ? "invoice" : "bill"}${applyRows.filter((r) => r.checked).length > 1 ? "s" : ""}` : "General payment (advance)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-[22px] font-extrabold tabular-nums ${isIn ? "text-emerald-700" : "text-rose-700"}`,
							children: fmtMoney(effectiveAmount)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								disabled: saving,
								onClick: () => onOpenChange(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: save,
								disabled: saving,
								className: isIn ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white",
								children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-1.5 animate-spin" }), " Saving…"] }) : isIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "h-4 w-4 mr-1.5" }), " Confirm Receipt"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "h-4 w-4 mr-1.5" }), " Confirm Payment"] })
							})]
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { PaymentsPage as component };
