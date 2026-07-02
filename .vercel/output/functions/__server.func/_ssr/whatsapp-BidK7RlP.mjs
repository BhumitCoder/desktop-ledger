import { n as fmtMoney, t as fmtDate } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-BidK7RlP.js
/** Build a wa.me link; Indian 10-digit numbers get the 91 prefix. Returns null if no usable number. */
function waLink(phone, text) {
	const digits = (phone ?? "").replace(/\D/g, "");
	if (digits.length < 10) return null;
	return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}?text=${encodeURIComponent(text)}`;
}
function billMessage(inv, company) {
	const lines = inv.lineItems.map((l) => `• ${l.name} — ${l.qty} ${l.unit} × ${fmtMoney(l.price)} = ${fmtMoney(l.amount)}`).join("\n");
	const balance = Math.max(0, Math.round((inv.total - inv.paid) * 100) / 100);
	return [
		`*${company.name}*`,
		`Bill: *${inv.number}* · ${fmtDate(inv.date)}`,
		``,
		lines,
		``,
		`Total: *${fmtMoney(inv.total)}*`,
		`Paid: ${fmtMoney(inv.paid)}`,
		balance > 0 ? `Balance Due: *${fmtMoney(balance)}*` : `✅ Fully Paid`,
		``,
		`Thank you for your business! 🙏`
	].join("\n");
}
function reminderMessage(partyName, balance, company) {
	return [
		`Namaste ${partyName} 🙏`,
		``,
		`This is a gentle reminder from *${company.name}*.`,
		`Your pending balance is *${fmtMoney(balance)}*.`,
		``,
		`Kindly arrange the payment at your earliest convenience. Thank you!`
	].join("\n");
}
//#endregion
export { reminderMessage as n, waLink as r, billMessage as t };
