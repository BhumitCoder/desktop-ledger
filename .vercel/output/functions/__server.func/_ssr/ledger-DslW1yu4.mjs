//#region node_modules/.nitro/vite/services/ssr/assets/ledger-DslW1yu4.js
var r2 = (n) => Math.round(n * 100) / 100;
/** Sum of a payment's per-invoice allocations. Legacy payments (saved before
* allocations existed) stored the linked invoice numbers in `ref` — if every
* comma-separated token matches a known invoice number, the whole amount
* was applied to invoices. */
function allocatedAmount(p, invoiceNumbers) {
	if (p.allocations && p.allocations.length) return r2(p.allocations.reduce((s, a) => s + a.amount, 0));
	if (p.ref && invoiceNumbers) {
		const tokens = p.ref.split(",").map((t) => t.trim()).filter(Boolean);
		if (tokens.length && tokens.every((t) => invoiceNumbers.has(t))) return p.amount;
	}
	return 0;
}
/** Portion of a payment NOT applied to any invoice (an advance). */
function advanceAmount(p, invoiceNumbers) {
	return Math.max(0, r2(p.amount - allocatedAmount(p, invoiceNumbers)));
}
/** invoiceId → total amount settled through Payment records. */
function paidViaPayments(payments) {
	const map = /* @__PURE__ */ new Map();
	for (const p of payments) for (const a of p.allocations ?? []) map.set(a.invoiceId, r2((map.get(a.invoiceId) ?? 0) + a.amount));
	return map;
}
/** Per-party outstanding balances. Pass sales + sale returns + type "in"
* payments for customers, or purchases + purchase returns + type "out"
* payments for suppliers. Applied payments are already inside invoice.paid,
* so only the advance portion of each payment is subtracted separately —
* this is what keeps the dashboard and ledger reports in agreement. */
function partyBalances(invoices, returns, payments) {
	const numbers = new Set(invoices.map((i) => i.number));
	const map = /* @__PURE__ */ new Map();
	const entry = (id, name) => {
		let e = map.get(id);
		if (!e) {
			e = {
				partyId: id,
				name,
				invoiced: 0,
				returned: 0,
				settled: 0,
				advances: 0,
				balance: 0
			};
			map.set(id, e);
		}
		return e;
	};
	for (const inv of invoices) {
		const e = entry(inv.partyId, inv.partyName);
		e.invoiced = r2(e.invoiced + (inv.total || 0));
		e.settled = r2(e.settled + (inv.paid || 0));
	}
	for (const ret of returns) {
		const e = entry(ret.partyId, ret.partyName);
		e.returned = r2(e.returned + (ret.total || 0));
	}
	for (const p of payments) {
		const e = entry(p.partyId, p.partyName);
		e.advances = r2(e.advances + advanceAmount(p, numbers));
	}
	for (const e of map.values()) e.balance = r2(e.invoiced - e.returned - e.settled - e.advances);
	return Array.from(map.values());
}
/** Money movement for one payment mode (cash, bank, …). Amounts settled
* later via Payment records count under the payment's own mode, not the
* invoice's, so nothing is counted twice. */
function modeFlows(mode, sales, purchases, expenses, payments) {
	const applied = paidViaPayments(payments);
	const list = [];
	for (const s of sales) {
		if (s.paymentMode !== mode) continue;
		const direct = Math.max(0, r2((s.paid || 0) - (applied.get(s.id) ?? 0)));
		if (direct > 0) list.push({
			date: s.date,
			type: "Sale",
			ref: `${s.number} — ${s.partyName}`,
			in: direct,
			out: 0
		});
	}
	for (const s of purchases) {
		if (s.paymentMode !== mode) continue;
		const direct = Math.max(0, r2((s.paid || 0) - (applied.get(s.id) ?? 0)));
		if (direct > 0) list.push({
			date: s.date,
			type: "Purchase",
			ref: `${s.number} — ${s.partyName}`,
			in: 0,
			out: direct
		});
	}
	for (const e of expenses) if (e.paymentMode === mode) list.push({
		date: e.date,
		type: "Expense",
		ref: e.category,
		in: 0,
		out: e.amount
	});
	for (const p of payments) {
		if (p.mode !== mode) continue;
		list.push({
			date: p.date,
			type: p.type === "in" ? "Payment In" : "Payment Out",
			ref: p.partyName,
			in: p.type === "in" ? p.amount : 0,
			out: p.type === "out" ? p.amount : 0
		});
	}
	list.sort((a, b) => b.date.localeCompare(a.date));
	return list;
}
var netFlow = (entries) => r2(entries.reduce((s, e) => s + e.in - e.out, 0));
/** Cash-mode flows plus manual cash adjustments (counter corrections, drawings). */
function cashFlows(sales, purchases, expenses, payments, adjustments) {
	const list = modeFlows("cash", sales, purchases, expenses, payments);
	for (const a of adjustments) list.push({
		date: a.date,
		type: a.type === "add" ? "Cash Added" : "Cash Reduced",
		ref: a.reason || "Manual adjustment",
		in: a.type === "add" ? a.amount : 0,
		out: a.type === "reduce" ? a.amount : 0
	});
	list.sort((a, b) => b.date.localeCompare(a.date));
	return list;
}
/** UPI and cheques settle into the bank — group them with bank-mode flows. */
function bankFlows(sales, purchases, expenses, payments) {
	const list = [
		"bank",
		"upi",
		"cheque"
	].flatMap((m) => modeFlows(m, sales, purchases, expenses, payments));
	list.sort((a, b) => b.date.localeCompare(a.date));
	return list;
}
/** Cost of goods sold from per-line cost snapshots, falling back to the
* item's current purchase price for lines saved before costPrice existed. */
function computeCogs(sales, saleReturns, items) {
	const cost = new Map(items.map((i) => [i.id, i.purchasePrice]));
	const lineCost = (l) => (l.costPrice ?? cost.get(l.itemId) ?? 0) * l.qty;
	return r2(sales.reduce((s, inv) => s + inv.lineItems.reduce((a, l) => a + lineCost(l), 0), 0) - saleReturns.reduce((s, ret) => s + ret.lineItems.reduce((a, l) => a + lineCost(l), 0), 0));
}
//#endregion
export { paidViaPayments as a, netFlow as i, cashFlows as n, partyBalances as o, computeCogs as r, bankFlows as t };
