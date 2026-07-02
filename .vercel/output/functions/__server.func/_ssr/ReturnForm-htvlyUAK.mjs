import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as nextInvoiceNumber, f as SaleReturnRepo, g as genId, i as CompanyRepo, l as PurchaseRepo, o as ItemRepo, p as SalesRepo, s as PartyRepo, u as PurchaseReturnRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { N as CornerUpLeft, P as CornerDownLeft, T as LoaderCircle, f as Save, i as UserPlus, s as Trash2, t as X } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { n as fmtMoney, r as today } from "./format-uyyFg6A-.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReturnForm-htvlyUAK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var r2 = (n) => Math.round(n * 100) / 100;
function ReturnForm({ mode }) {
	const navigate = useNavigate();
	const company = CompanyRepo.get();
	const isSaleReturn = mode === "sale-return";
	const repo = isSaleReturn ? SaleReturnRepo : PurchaseReturnRepo;
	const prefix = isSaleReturn ? company.invoicePrefix.replace("INV-", "CR-") || "CR-" : company.purchasePrefix.replace("PUR-", "DR-") || "DR-";
	const backPath = isSaleReturn ? "/sale-return" : "/purchase-return";
	const [ret, setRet] = (0, import_react.useState)(() => ({
		id: "",
		number: nextInvoiceNumber(prefix, repo.all()),
		date: today(),
		originalRef: "",
		partyId: "",
		partyName: "",
		partyPhone: "",
		gstEnabled: company.enableGst !== false,
		lineItems: [],
		subtotal: 0,
		taxAmount: 0,
		total: 0,
		notes: "",
		createdAt: ""
	}));
	const gstOn = ret.gstEnabled !== false;
	const [allParties] = (0, import_react.useState)(() => PartyRepo.all());
	const items = (0, import_react.useMemo)(() => ItemRepo.all(), []);
	const partyRef = (0, import_react.useRef)(null);
	const [partyQ, setPartyQ] = (0, import_react.useState)("");
	const [partyOpen, setPartyOpen] = (0, import_react.useState)(false);
	const [partyIdx, setPartyIdx] = (0, import_react.useState)(0);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const savingRef = (0, import_react.useRef)(false);
	const [invQ, setInvQ] = (0, import_react.useState)("");
	const [invOpen, setInvOpen] = (0, import_react.useState)(false);
	const [invIdx, setInvIdx] = (0, import_react.useState)(0);
	const invoiceRepo = isSaleReturn ? SalesRepo : PurchaseRepo;
	const invSuggests = (0, import_react.useMemo)(() => {
		const q = invQ.trim().toLowerCase();
		if (!q) return [];
		return invoiceRepo.all().filter((i) => i.number.toLowerCase().includes(q) || i.partyName.toLowerCase().includes(q)).slice(0, 8);
	}, [invQ, invoiceRepo]);
	const loadFromInvoice = (inv) => {
		const lines = inv.lineItems.map((l) => ({
			...l,
			id: genId()
		}));
		const gst = inv.gstEnabled !== false;
		setRet({
			...ret,
			originalRef: inv.number,
			partyId: inv.partyId,
			partyName: inv.partyName,
			partyPhone: inv.partyPhone,
			gstEnabled: inv.gstEnabled,
			lineItems: lines,
			...recalc(lines, gst)
		});
		setPartyQ(inv.partyName);
		setInvQ(inv.number);
		setInvOpen(false);
		toast.success(`Loaded ${lines.length} item${lines.length > 1 ? "s" : ""} from ${inv.number} — remove items or adjust qty to what actually came back`);
	};
	const partySuggests = (0, import_react.useMemo)(() => {
		const q = partyQ.trim().toLowerCase();
		if (!q) return [];
		return allParties.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
	}, [partyQ, allParties]);
	(0, import_react.useEffect)(() => {
		partyRef.current?.focus();
	}, []);
	const recalc = (lines, gst = gstOn) => {
		const subtotal = r2(lines.reduce((s, l) => s + l.qty * l.price, 0));
		const afterDisc = r2(lines.reduce((s, l) => s + r2(l.qty * l.price * (1 - l.discountPct / 100)), 0));
		const taxAmount = gst ? r2(lines.reduce((s, l) => s + r2(r2(l.qty * l.price * (1 - l.discountPct / 100)) * (l.gstRate / 100)), 0)) : 0;
		return {
			subtotal,
			taxAmount,
			total: r2(afterDisc + taxAmount)
		};
	};
	const selectParty = (p) => {
		setRet({
			...ret,
			partyId: p.id,
			partyName: p.name,
			partyPhone: p.phone ?? ""
		});
		setPartyQ(p.name);
		setPartyOpen(false);
	};
	const addLineItem = (it) => {
		const line = {
			id: genId(),
			itemId: it.id,
			name: it.name,
			qty: 1,
			unit: it.unit,
			price: isSaleReturn ? it.salePrice : it.purchasePrice,
			discountPct: 0,
			gstRate: it.gstRate,
			amount: 0,
			costPrice: it.purchasePrice
		};
		const gstMult = gstOn ? 1 + line.gstRate / 100 : 1;
		line.amount = r2(r2(line.qty * line.price) * gstMult);
		const lines = [...ret.lineItems, line];
		setRet({
			...ret,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const updateLine = (id, patch) => {
		const lines = ret.lineItems.map((l) => {
			if (l.id !== id) return l;
			const nl = {
				...l,
				...patch
			};
			const gstMult = gstOn ? 1 + nl.gstRate / 100 : 1;
			nl.amount = r2(r2(nl.qty * nl.price * (1 - nl.discountPct / 100)) * gstMult);
			return nl;
		});
		setRet({
			...ret,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const removeLine = (id) => {
		const lines = ret.lineItems.filter((l) => l.id !== id);
		setRet({
			...ret,
			lineItems: lines,
			...recalc(lines)
		});
	};
	const toggleGst = () => {
		const newGst = !gstOn;
		const lines = ret.lineItems.map((l) => {
			const gstMult = newGst ? 1 + l.gstRate / 100 : 1;
			return {
				...l,
				amount: r2(r2(l.qty * l.price * (1 - l.discountPct / 100)) * gstMult)
			};
		});
		setRet({
			...ret,
			gstEnabled: newGst,
			lineItems: lines,
			...recalc(lines, newGst)
		});
	};
	const save = () => {
		if (savingRef.current) return;
		let partyId = ret.partyId;
		let partyName = ret.partyName || partyQ.trim();
		if (!partyId && !partyName) {
			toast.error("Enter party name");
			partyRef.current?.focus();
			return;
		}
		if (!ret.lineItems.length) {
			toast.error("Add at least one item");
			return;
		}
		const badLine = ret.lineItems.find((l) => !(l.qty > 0) || l.price < 0);
		if (badLine) {
			toast.error(`Check quantity/price for "${badLine.name}" — qty must be more than 0`);
			return;
		}
		savingRef.current = true;
		setSaving(true);
		if (!partyId) {
			const match = allParties.find((p) => p.name.toLowerCase() === partyName.toLowerCase());
			if (match) {
				partyId = match.id;
				partyName = match.name;
			} else {
				const np = {
					id: genId(),
					name: partyName,
					type: "both",
					openingBalance: 0,
					createdAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				PartyRepo.add(np);
				partyId = np.id;
				toast.success(`New party added: ${partyName}`);
			}
		}
		const finalRet = {
			...ret,
			partyId,
			partyName,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		const stockDelta = isSaleReturn ? 1 : -1;
		for (const l of finalRet.lineItems) {
			const it = ItemRepo.get(l.itemId);
			if (it) ItemRepo.adjustField(it.id, "stock", stockDelta * l.qty);
		}
		repo.add(finalRet);
		toast.success(`${isSaleReturn ? "Sale Return" : "Purchase Return"} saved`);
		navigate({ to: backPath });
	};
	(0, import_react.useEffect)(() => {
		const h = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				save();
			}
			if (e.key === "Escape") navigate({ to: backPath });
		};
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 py-3 border-b bg-card flex items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-md flex items-center justify-center bg-primary-soft text-primary",
					children: isSaleReturn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerUpLeft, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-[17px] font-bold tracking-tight",
					children: ["New ", isSaleReturn ? "Sale Return" : "Purchase Return"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono font-semibold text-foreground",
						children: ret.number
					}), " · Ctrl+S save · Esc cancel"]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 h-9 px-3 rounded-md border bg-background cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: gstOn,
							onChange: toggleGst,
							className: "accent-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] font-semibold",
							children: "GST"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => navigate({ to: backPath }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" }), " Cancel"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: save,
						disabled: saving,
						children: [
							saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }),
							saving ? "Saving…" : "Save",
							!saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-1 text-[10px] opacity-80",
								children: "Ctrl+S"
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 space-y-4 overflow-auto flex-1 bg-muted/30",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-card border rounded-lg shadow-sm p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: isSaleReturn ? "Customer Details" : "Supplier Details"
							}),
							ret.partyId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-success font-medium bg-success-soft px-2 py-0.5 rounded",
								children: "✓ Existing party"
							}),
							!ret.partyId && partyQ && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-primary font-medium bg-primary-soft px-2 py-0.5 rounded flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3 w-3" }), " Will auto-create on save"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative lg:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1 text-[12px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground font-medium",
										children: [isSaleReturn ? "Customer" : "Supplier", " Name *"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: partyRef,
										value: partyQ,
										onChange: (e) => {
											setPartyQ(e.target.value);
											setPartyOpen(true);
											setPartyIdx(0);
											if (ret.partyId) setRet({
												...ret,
												partyId: "",
												partyName: e.target.value
											});
										},
										onFocus: () => setPartyOpen(true),
										onBlur: () => setTimeout(() => setPartyOpen(false), 150),
										onKeyDown: (e) => {
											if (e.key === "ArrowDown") {
												e.preventDefault();
												setPartyIdx((i) => Math.min(partySuggests.length - 1, i + 1));
											} else if (e.key === "ArrowUp") {
												e.preventDefault();
												setPartyIdx((i) => Math.max(0, i - 1));
											} else if (e.key === "Enter") {
												e.preventDefault();
												if (partySuggests[partyIdx]) selectParty(partySuggests[partyIdx]);
											}
										},
										className: "h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none",
										placeholder: "Type name or search…"
									})]
								}), partyOpen && partySuggests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute z-20 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-auto",
									children: partySuggests.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onMouseDown: (e) => {
											e.preventDefault();
											selectParty(p);
										},
										className: `px-3 py-2 text-sm cursor-pointer ${i === partyIdx ? "bg-accent" : "hover:bg-accent"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold",
											children: p.name
										}), p.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: ["📞 ", p.phone]
										})]
									}, p.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Return Date",
								type: "date",
								value: ret.date,
								onChange: (e) => setRet({
									...ret,
									date: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1 text-[12px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground font-medium",
										children: [
											"Original ",
											isSaleReturn ? "Invoice" : "Bill",
											" #"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: invQ,
										onChange: (e) => {
											setInvQ(e.target.value);
											setRet({
												...ret,
												originalRef: e.target.value
											});
											setInvOpen(true);
											setInvIdx(0);
										},
										onFocus: () => invQ && setInvOpen(true),
										onBlur: () => setTimeout(() => setInvOpen(false), 150),
										onKeyDown: (e) => {
											if (e.key === "ArrowDown") {
												e.preventDefault();
												setInvIdx((i) => Math.min(invSuggests.length - 1, i + 1));
											} else if (e.key === "ArrowUp") {
												e.preventDefault();
												setInvIdx((i) => Math.max(0, i - 1));
											} else if (e.key === "Enter") {
												e.preventDefault();
												if (invSuggests[invIdx]) loadFromInvoice(invSuggests[invIdx]);
											}
										},
										className: "h-9 px-3 border rounded-md bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none",
										placeholder: `Search ${isSaleReturn ? "INV-…" : "PUR-…"} to auto-load items`
									})]
								}), invOpen && invSuggests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute z-30 top-full left-0 right-0 mt-1 border rounded-md bg-popover shadow-lg max-h-56 overflow-auto",
									children: invSuggests.map((i, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onMouseDown: (e) => {
											e.preventDefault();
											loadFromInvoice(i);
										},
										className: `px-3 py-2 text-sm cursor-pointer ${idx === invIdx ? "bg-accent" : "hover:bg-accent"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-semibold text-xs text-primary",
												children: i.number
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold tabular-nums",
												children: fmtMoney(i.total)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground",
											children: [
												i.partyName,
												" · ",
												i.lineItems.length,
												" items · ",
												i.date
											]
										})]
									}, i.id))
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border rounded-lg bg-card shadow-sm overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[13px] font-semibold",
							children: [
								"Returned Items (",
								ret.lineItems.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: "Type to search & add items"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[13px] min-w-[640px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-[11px] text-muted-foreground uppercase tracking-wider",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-muted/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-3 py-2 w-8",
											children: "#"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-3 py-2",
											children: "Item"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right w-20 py-2",
											children: "Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left w-16 py-2",
											children: "Unit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right w-24 py-2",
											children: "Price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right w-20 py-2",
											children: "Disc%"
										}),
										gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right w-20 py-2",
											children: "GST%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right w-28 py-2 pr-3",
											children: "Amount"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8" })
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [ret.lineItems.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t hover:bg-accent/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 text-muted-foreground text-[11px]",
										children: idx + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-1.5 font-medium",
										children: l.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: l.qty,
											min: 0,
											onWheel: (e) => e.currentTarget.blur(),
											onChange: (e) => updateLine(l.id, { qty: parseFloat(e.target.value) || 0 }),
											className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: l.unit,
											onChange: (e) => updateLine(l.id, { unit: e.target.value }),
											className: "w-full h-7 px-1.5 border rounded bg-background focus:border-primary outline-none"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: l.price,
											min: 0,
											onWheel: (e) => e.currentTarget.blur(),
											onChange: (e) => updateLine(l.id, { price: parseFloat(e.target.value) || 0 }),
											className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: l.discountPct,
											min: 0,
											max: 100,
											onWheel: (e) => e.currentTarget.blur(),
											onChange: (e) => updateLine(l.id, { discountPct: parseFloat(e.target.value) || 0 }),
											className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
										})
									}),
									gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: l.gstRate,
											min: 0,
											onWheel: (e) => e.currentTarget.blur(),
											onChange: (e) => updateLine(l.id, { gstRate: parseFloat(e.target.value) || 0 }),
											className: "w-full h-7 px-1.5 text-right border rounded bg-background focus:border-primary outline-none"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "text-right px-3 py-1.5 font-semibold tabular-nums",
										children: fmtMoney(l.amount)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeLine(l.id),
											className: "text-destructive p-1 hover:bg-destructive/10 rounded",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									})
								]
							}, l.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReturnItemPickerRow, {
								items,
								onAdd: addLineItem,
								gstOn
							})] })]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-2 bg-card border rounded-lg shadow-sm p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-[12px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-medium uppercase text-[11px] tracking-wider",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: ret.notes ?? "",
								onChange: (e) => setRet({
									...ret,
									notes: e.target.value
								}),
								placeholder: "Reason for return, condition of goods…",
								className: "min-h-[80px] px-3 py-2 border rounded-md bg-background focus:border-primary outline-none"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border rounded-lg bg-card shadow-sm p-4 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Subtotal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: fmtMoney(ret.subtotal)
								})]
							}),
							gstOn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Tax (GST)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: fmtMoney(ret.taxAmount)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center pt-2 mt-1 border-t font-bold text-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [isSaleReturn ? "Credit Note" : "Debit Note", " Total"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-warning",
									children: fmtMoney(ret.total)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground pt-1",
								children: [
									"Stock will be ",
									isSaleReturn ? "increased" : "decreased",
									" on save"
								]
							})
						]
					})]
				})
			]
		})]
	});
}
function ReturnItemPickerRow({ items, onAdd, gstOn }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [idx, setIdx] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	const suggests = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()) || i.sku?.toLowerCase().includes(q.toLowerCase()) || i.barcode?.includes(q)).slice(0, 8);
	const pick = (it) => {
		onAdd(it);
		setQ("");
		setOpen(false);
		setTimeout(() => inputRef.current?.focus(), 30);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		className: "border-t bg-primary-soft/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
			colSpan: gstOn ? 9 : 8,
			className: "p-2 relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				value: q,
				onChange: (e) => {
					setQ(e.target.value);
					setOpen(true);
					setIdx(0);
				},
				onFocus: () => q && setOpen(true),
				onBlur: () => setTimeout(() => setOpen(false), 150),
				onKeyDown: (e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setIdx((i) => Math.min(suggests.length - 1, i + 1));
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setIdx((i) => Math.max(0, i - 1));
					} else if (e.key === "Enter") {
						e.preventDefault();
						if (suggests[idx]) pick(suggests[idx]);
					}
				},
				placeholder: "🔍  Search item to add for return…",
				className: "w-full h-8 px-3 bg-transparent outline-none text-[13px] placeholder:text-muted-foreground"
			}), open && suggests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute z-30 top-full left-2 right-2 mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-auto",
				children: suggests.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onMouseDown: (e) => {
						e.preventDefault();
						pick(it);
					},
					className: `px-3 py-2 cursor-pointer flex justify-between items-center ${i === idx ? "bg-accent" : "hover:bg-accent"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: it.name
					}), it.sku && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-muted-foreground ml-2",
						children: it.sku
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] text-muted-foreground",
						children: [
							"Stock: ",
							it.stock,
							" ",
							it.unit
						]
					})]
				}, it.id))
			})]
		})
	});
}
//#endregion
export { ReturnForm as t };
