import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as PaymentRepo, f as SaleReturnRepo, i as CompanyRepo, l as PurchaseRepo, p as SalesRepo, s as PartyRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as CircleAlert, _ as Phone, b as MessageCircle, h as Printer, tt as ArrowLeft, v as Pencil } from "../_libs/lucide-react.mjs";
import { a as paidViaPayments } from "./ledger-DslW1yu4.mjs";
import { n as fmtMoney, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { t as printWithName } from "./print-DvWXB8RH.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route, t as PartyDialog } from "./parties_._id-DiWGAsBZ.mjs";
import { n as reminderMessage, r as waLink } from "./whatsapp-BidK7RlP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parties_._id-1DOoM_IU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2 = (n) => Math.round(n * 100) / 100;
function PartyStatementPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [party, setParty] = (0, import_react.useState)(void 0);
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setParty(PartyRepo.get(id) ?? null);
	}, [id, refreshKey]);
	const rows = (0, import_react.useMemo)(() => {
		if (!party) return [];
		const entries = [];
		const allPayments = PaymentRepo.all();
		const applied = paidViaPayments(allPayments);
		for (const s of SalesRepo.all().filter((x) => x.partyId === party.id)) {
			entries.push({
				date: s.date,
				created: s.createdAt,
				type: "Sale",
				ref: s.number,
				debit: s.total,
				credit: 0
			});
			const atBilling = r2((s.paid || 0) - (applied.get(s.id) ?? 0));
			if (atBilling > 0) entries.push({
				date: s.date,
				created: s.createdAt,
				type: "Received with bill",
				ref: s.number,
				debit: 0,
				credit: atBilling
			});
		}
		for (const ret of SaleReturnRepo.all().filter((x) => x.partyId === party.id)) entries.push({
			date: ret.date,
			created: ret.createdAt,
			type: "Sale Return",
			ref: ret.number,
			debit: 0,
			credit: ret.total
		});
		for (const p of PurchaseRepo.all().filter((x) => x.partyId === party.id)) {
			entries.push({
				date: p.date,
				created: p.createdAt,
				type: "Purchase",
				ref: p.number,
				debit: 0,
				credit: p.total
			});
			const atBilling = r2((p.paid || 0) - (applied.get(p.id) ?? 0));
			if (atBilling > 0) entries.push({
				date: p.date,
				created: p.createdAt,
				type: "Paid with bill",
				ref: p.number,
				debit: atBilling,
				credit: 0
			});
		}
		for (const ret of PurchaseReturnRepo.all().filter((x) => x.partyId === party.id)) entries.push({
			date: ret.date,
			created: ret.createdAt,
			type: "Purchase Return",
			ref: ret.number,
			debit: ret.total,
			credit: 0
		});
		for (const pay of allPayments.filter((x) => x.partyId === party.id)) {
			const linked = pay.allocations?.map((a) => a.number).join(", ") ?? pay.ref ?? "";
			if (pay.type === "in") entries.push({
				date: pay.date,
				created: pay.createdAt,
				type: "Payment Received",
				ref: linked || "—",
				debit: 0,
				credit: pay.amount
			});
			else entries.push({
				date: pay.date,
				created: pay.createdAt,
				type: "Payment Made",
				ref: linked || "—",
				debit: pay.amount,
				credit: 0
			});
		}
		entries.sort((a, b) => a.date.localeCompare(b.date) || (a.created ?? "").localeCompare(b.created ?? ""));
		let running = party.openingBalance || 0;
		const out = [];
		if (party.openingBalance) out.push({
			date: "",
			created: "",
			type: "Opening Balance",
			ref: "—",
			debit: party.openingBalance > 0 ? party.openingBalance : 0,
			credit: party.openingBalance < 0 ? -party.openingBalance : 0,
			balance: running
		});
		for (const e of entries) {
			running = r2(running + e.debit - e.credit);
			out.push({
				...e,
				balance: running
			});
		}
		return out;
	}, [party, refreshKey]);
	if (party === void 0) return null;
	if (party === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full items-center justify-center gap-3 text-gray-400",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-12 w-12 text-gray-200" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Party not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => navigate({ to: "/parties" }),
				className: "text-sm text-primary hover:underline",
				children: "← Back to Parties"
			})
		]
	});
	const balance = rows.length ? rows[rows.length - 1].balance : party.openingBalance || 0;
	const totalDebit = rows.reduce((s, e) => s + e.debit, 0);
	const totalCredit = rows.reduce((s, e) => s + e.credit, 0);
	const sendReminder = () => {
		if (balance <= 0) {
			toast.info("No pending balance — nothing to remind");
			return;
		}
		const link = waLink(party.phone, reminderMessage(party.name, balance, CompanyRepo.get()));
		if (!link) {
			toast.error("No phone number saved for this party");
			return;
		}
		window.open(link, "_blank");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full bg-[#f5f6fa]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print bg-white border-b px-5 py-3 flex items-center justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({ to: "/parties" }),
						className: "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Parties"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-[17px] font-bold text-gray-800 truncate",
							children: party.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[12px] text-gray-400 flex items-center gap-1",
							children: party.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
								" ",
								party.phone
							] }) : "No phone saved"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setEditOpen(true),
							className: "inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), " Edit"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: sendReminder,
							className: "inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition",
							title: balance > 0 ? `Send payment reminder for ${fmtMoney(balance)}` : "No pending balance",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " Remind on WhatsApp"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => printWithName(`Statement-${party.name.replace(/\s+/g, "-")}`),
							className: "inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:opacity-90 transition",
							title: "Print, or choose 'Save as PDF' in the print dialog",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print / PDF"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print grid grid-cols-3 bg-white border-b",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5 border-r border-gray-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: "Total Debit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[20px] font-bold tabular-nums text-gray-800",
							children: fmtMoney(totalDebit)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5 border-r border-gray-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: "Total Credit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[20px] font-bold tabular-nums text-gray-800",
							children: fmtMoney(totalCredit)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1",
							children: balance > 0 ? "They Owe You" : balance < 0 ? "You Owe Them" : "Settled"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-[20px] font-bold tabular-nums ${balance > 0 ? "text-rose-600" : balance < 0 ? "text-amber-600" : "text-emerald-600"}`,
							children: fmtMoney(Math.abs(balance))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-auto p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "print-visible bg-white border rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto print:p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 py-3 border-b",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-bold text-gray-800",
							children: ["Party Statement — ", party.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-gray-400",
							children: [
								CompanyRepo.get().name,
								" · Generated ",
								fmtDate((/* @__PURE__ */ new Date()).toISOString()),
								" · Balance:",
								" ",
								fmtMoney(Math.abs(balance)),
								" ",
								balance > 0 ? "receivable" : balance < 0 ? "payable" : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[12.5px] border-collapse",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "bg-gray-50",
								children: [
									"Date",
									"Type",
									"Ref #",
									"Debit (+)",
									"Credit (−)",
									"Balance"
								].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: `px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 whitespace-nowrap ${i >= 3 ? "text-right" : "text-left"}`,
									children: h
								}, h))
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 6,
								className: "text-center py-14 text-gray-400",
								children: "No transactions with this party yet"
							}) }) : rows.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-gray-100 hover:bg-gray-50/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-gray-600 whitespace-nowrap",
										children: e.date ? fmtDate(e.date) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-medium text-gray-800",
										children: e.type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-mono text-xs text-blue-600",
										children: e.ref
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right tabular-nums text-rose-600",
										children: e.debit ? fmtMoney(e.debit) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right tabular-nums text-emerald-600",
										children: e.credit ? fmtMoney(e.credit) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: `px-4 py-2.5 text-right tabular-nums font-semibold ${e.balance > 0 ? "text-rose-600" : e.balance < 0 ? "text-amber-600" : "text-gray-500"}`,
										children: [fmtMoney(Math.abs(e.balance)), e.balance !== 0 && (e.balance > 0 ? " Dr" : " Cr")]
									})
								]
							}, i)) }),
							rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "bg-gray-50 border-t-2 border-gray-200 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										colSpan: 3,
										className: "px-4 py-3 text-xs uppercase text-gray-500",
										children: "Closing Balance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right tabular-nums text-rose-600",
										children: fmtMoney(totalDebit)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-right tabular-nums text-emerald-600",
										children: fmtMoney(totalCredit)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: `px-4 py-3 text-right tabular-nums ${balance > 0 ? "text-rose-600" : balance < 0 ? "text-amber-600" : "text-gray-600"}`,
										children: [fmtMoney(Math.abs(balance)), balance !== 0 && (balance > 0 ? " Dr" : " Cr")]
									})
								]
							}) })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyDialog, {
				open: editOpen,
				onOpenChange: setEditOpen,
				party,
				onSaved: () => setRefreshKey((k) => k + 1)
			})
		]
	});
}
//#endregion
export { PartyStatementPage as component };
