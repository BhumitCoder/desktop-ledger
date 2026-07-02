import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as CompanyRepo, p as SalesRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as CircleAlert, K as Check, b as MessageCircle, h as Printer, tt as ArrowLeft, v as Pencil } from "../_libs/lucide-react.mjs";
import { n as fmtMoney, t as fmtDate } from "./format-uyyFg6A-.mjs";
import { t as printWithName } from "./print-DvWXB8RH.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as waLink, t as billMessage } from "./whatsapp-BidK7RlP.mjs";
import { t as Route } from "./sales._id-hu5Ks_D-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales._id-BNM_GRLx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2$1 = (n) => Math.round(n * 100) / 100;
/**
* Thermal receipt for 80mm / 58mm roll printers (mobile & kirana shops).
* Rendered with the `print-area` class so the global print CSS shows only
* this element; the injected @page style switches the paper size.
*/
function ThermalReceipt({ inv, company, width }) {
	const gstOn = inv.gstEnabled !== false;
	const paperMm = width === 80 ? 72 : 48;
	const balance = r2$1(inv.total - inv.paid);
	const base = {
		fontFamily: "'Courier New', monospace",
		color: "#000",
		fontSize: width === 80 ? 12 : 10.5,
		lineHeight: 1.35,
		width: `${paperMm}mm`
	};
	const dashed = {
		borderTop: "1px dashed #000",
		margin: "6px 0"
	};
	const row = (label, value, bold = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			justifyContent: "space-between",
			fontWeight: bold ? 700 : 400
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: value })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "print-visible",
		style: base,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@media print { @page { size: ${width}mm auto; margin: 3mm; } }` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { textAlign: "center" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: width === 80 ? 16 : 13,
							fontWeight: 800
						},
						children: company.name
					}),
					company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: company.address }),
					company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Ph: ", company.phone] }),
					gstOn && company.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { fontWeight: 700 },
						children: ["GSTIN: ", company.gstin]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: dashed }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					textAlign: "center",
					fontWeight: 700
				},
				children: gstOn ? "TAX INVOICE" : "BILL / RECEIPT"
			}),
			row("Bill No:", inv.number),
			row("Date:", fmtDate(inv.date)),
			inv.partyName && row("Customer:", inv.partyName),
			inv.partyPhone && row("Phone:", inv.partyPhone),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: dashed }),
			inv.lineItems.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { marginBottom: 3 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { fontWeight: 700 },
					children: [
						i + 1,
						". ",
						l.name
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						l.qty,
						" ",
						l.unit,
						" × ",
						fmtMoney(l.price),
						l.discountPct > 0 && ` −${l.discountPct}%`,
						gstOn && l.gstRate > 0 && ` +GST${l.gstRate}%`
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: fmtMoney(l.amount)
					})]
				})]
			}, l.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: dashed }),
			row("Subtotal", fmtMoney(r2$1(inv.lineItems.reduce((s, l) => s + l.qty * l.price * (1 - l.discountPct / 100), 0)))),
			inv.discount > 0 && row("Discount", `-${fmtMoney(inv.discount)}`),
			gstOn && inv.taxAmount > 0 && row("GST", fmtMoney(inv.taxAmount)),
			!!inv.roundOff && Math.abs(inv.roundOff) > .001 && row("Round Off", `${inv.roundOff > 0 ? "+" : "−"}${fmtMoney(Math.abs(inv.roundOff))}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...dashed } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					fontWeight: 800,
					fontSize: width === 80 ? 15 : 12.5
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TOTAL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmtMoney(inv.total) })]
			}),
			row("Paid", fmtMoney(inv.paid)),
			balance > .009 && row("Balance Due", fmtMoney(balance), true),
			row("Mode", inv.paymentMode.toUpperCase()),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: dashed }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: { textAlign: "center" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { fontWeight: 700 },
					children: "Thank you! Visit again 🙏"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { fontSize: width === 80 ? 10 : 9 },
					children: "Goods once sold will not be taken back"
				})]
			})
		]
	});
}
var r2 = (n) => Math.round(n * 100) / 100;
var FORMATS = [
	{
		value: "a4",
		label: "A4"
	},
	{
		value: "thermal80",
		label: "80mm"
	},
	{
		value: "thermal58",
		label: "58mm"
	}
];
function InvoiceDetailPage() {
	const { id } = Route.useParams();
	const { print } = Route.useSearch();
	const navigate = useNavigate();
	const [inv, setInv] = (0, import_react.useState)(null);
	const [co, setCo] = (0, import_react.useState)(null);
	const [fmt, setFmt] = (0, import_react.useState)("a4");
	(0, import_react.useEffect)(() => {
		setInv(SalesRepo.get(id) ?? null);
		const c = CompanyRepo.get();
		setCo(c);
		setFmt(c.printFormat ?? "a4");
	}, [id]);
	(0, import_react.useEffect)(() => {
		if (print && inv) {
			const t = setTimeout(() => printWithName(inv.number), 500);
			return () => clearTimeout(t);
		}
	}, [print, inv]);
	const changeFormat = (f) => {
		setFmt(f);
		if (co) CompanyRepo.save({
			...co,
			printFormat: f
		});
	};
	const shareWhatsApp = () => {
		if (!inv || !co) return;
		const link = waLink(inv.partyPhone, billMessage(inv, co));
		if (!link) {
			toast.error("No phone number saved for this customer");
			return;
		}
		window.open(link, "_blank");
	};
	if (!inv) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full items-center justify-center gap-3 text-gray-400",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-12 w-12 text-gray-200" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Invoice not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => navigate({ to: "/sales" }),
				className: "text-sm text-primary hover:underline",
				children: "← Back to Sales"
			})
		]
	});
	const balance = r2(inv.total - inv.paid);
	const isPaid = balance <= 0;
	const hasDiscount = inv.lineItems.some((l) => l.discountPct > 0);
	const gstBreakdown = /* @__PURE__ */ new Map();
	if (inv.gstEnabled) inv.lineItems.forEach((l) => {
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
				onClick: () => navigate({ to: "/sales" }),
				className: "flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Sales"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Invoice"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold font-mono",
							children: inv.number
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Customer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: inv.partyName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-gray-400",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold text-gray-800",
							children: fmtMoney(inv.total)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center rounded-md border border-gray-200 overflow-hidden",
						children: FORMATS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => changeFormat(f.value),
							className: `px-2.5 py-2 text-xs font-semibold transition ${fmt === f.value ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`,
							children: f.label
						}, f.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => navigate({
							to: "/sales/edit/$id",
							params: { id: inv.id }
						}),
						className: "inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), " Edit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: shareWhatsApp,
						className: "inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition",
						title: inv.partyPhone ? `Send bill to ${inv.partyPhone}` : "No phone number saved for this customer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " WhatsApp"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => printWithName(inv.number),
						className: "inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:opacity-90 transition",
						title: "Print, or choose 'Save as PDF' in the print dialog",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print / PDF"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-auto py-6 px-4 flex justify-center bg-gray-100",
			children: fmt !== "a4" && co ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-white shadow-lg p-5 h-fit rounded-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThermalReceipt, {
					inv,
					company: co,
					width: fmt === "thermal80" ? 80 : 58
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "print-invoice",
				className: "print-visible bg-white w-full max-w-[794px] shadow-lg print:shadow-none print:m-0 print:p-8",
				style: {
					minHeight: "1123px",
					padding: "40px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between mb-8 pb-5 border-b-2 border-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-[26px] font-extrabold tracking-tight",
								style: { color: "oklch(0.55 0.22 27)" },
								children: co?.name || "My Company"
							}),
							co?.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gray-500 mt-0.5",
								children: co.email
							}),
							co?.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-gray-500",
								children: ["📞 ", co.phone]
							}),
							co?.gstin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-mono font-semibold text-gray-600 mt-1",
								children: ["GSTIN: ", co.gstin]
							}),
							co?.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed",
								children: co.address
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2",
									children: "Tax Invoice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[22px] font-bold font-mono text-gray-800",
									children: inv.number
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 text-xs text-gray-500 space-y-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-400",
										children: "Date: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: fmtDate(inv.date)
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-400",
										children: "Payment: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize font-medium",
										children: inv.paymentMode
									})] })]
								}),
								isPaid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), " PAID"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 inline-block text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full",
									children: "BALANCE DUE"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-7 bg-gray-50 rounded-lg p-4 border border-gray-100",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1.5",
								children: "Bill To"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[15px] font-bold text-gray-800",
								children: inv.partyName
							}),
							inv.partyPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-gray-500 mt-0.5",
								children: ["📞 ", inv.partyPhone]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[12px] mb-7",
						style: { borderCollapse: "collapse" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: { backgroundColor: "oklch(0.96 0.01 27)" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "32px",
									children: "#"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									left: true,
									children: "Item / Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "52px",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "44px",
									left: true,
									children: "Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "90px",
									children: "Rate"
								}),
								hasDiscount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "56px",
									children: "Disc%"
								}),
								inv.gstEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "52px",
									children: "GST%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
									w: "100px",
									children: "Amount"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: inv.lineItems.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							style: { borderBottom: "1px solid #f3f4f6" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
									center: true,
									children: idx + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
									left: true,
									children: l.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: l.qty }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
									left: true,
									children: l.unit
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(l.price) }),
								hasDiscount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: l.discountPct ? `${l.discountPct}%` : "—" }),
								inv.gstEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [l.gstRate, "%"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
									bold: true,
									children: fmtMoney(l.amount)
								})
							]
						}, l.id)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end mb-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "w-[280px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
									label: "Subtotal",
									value: fmtMoney(r2(inv.lineItems.reduce((s, l) => s + l.qty * l.price * (1 - l.discountPct / 100), 0)))
								}),
								inv.discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
									label: "Discount",
									value: `−${fmtMoney(inv.discount)}`,
									cls: "text-rose-600"
								}),
								inv.gstEnabled && Array.from(gstBreakdown).map(([rate, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
									label: `CGST @ ${rate / 2}%`,
									value: fmtMoney(v.cgst)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
									label: `SGST @ ${rate / 2}%`,
									value: fmtMoney(v.sgst)
								})] }, rate)),
								!!inv.roundOff && Math.abs(inv.roundOff) > .001 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
									label: "Round Off",
									value: `${inv.roundOff > 0 ? "+" : "−"}${fmtMoney(Math.abs(inv.roundOff))}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between pt-2 mt-1 border-t-2 border-gray-800 text-[15px] font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Grand Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: fmtMoney(inv.total)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 pt-2 border-t border-gray-200 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
										label: "Paid",
										value: fmtMoney(inv.paid),
										cls: "text-emerald-600 font-semibold"
									}), balance > .01 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TRow, {
										label: "Balance Due",
										value: fmtMoney(balance),
										cls: "text-rose-600 font-bold text-[13px]"
									})]
								})
							]
						})
					}),
					inv.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t pt-4 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-gray-600 leading-relaxed",
							children: inv.notes
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-12 pt-4 border-t border-dashed border-gray-200 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] text-gray-300 tracking-wide",
							children: ["Computer-generated invoice — no signature required · ", co?.name]
						})
					})
				]
			})
		})]
	});
}
function Th({ children, w, left, center }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		style: {
			width: w,
			textAlign: center ? "center" : left ? "left" : "right",
			padding: "8px 10px",
			fontSize: "10px",
			fontWeight: 700,
			letterSpacing: "0.08em",
			textTransform: "uppercase",
			color: "#6b7280",
			borderBottom: "2px solid #e5e7eb"
		},
		children
	});
}
function Td({ children, left, center, bold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		style: {
			textAlign: center ? "center" : left ? "left" : "right",
			padding: "7px 10px",
			fontWeight: bold ? 600 : 400,
			fontVariantNumeric: "tabular-nums"
		},
		children
	});
}
function TRow({ label, value, cls = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between text-[12px] text-gray-700 py-0.5 ${cls}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { InvoiceDetailPage as component };
