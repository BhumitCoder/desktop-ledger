//#region node_modules/.nitro/vite/services/ssr/assets/format-uyyFg6A-.js
var fmtMoney = (n, currency = "INR") => {
	try {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency,
			maximumFractionDigits: 2
		}).format(n || 0);
	} catch {
		return `₹${(n || 0).toFixed(2)}`;
	}
};
var fmtDate = (iso) => {
	try {
		return new Date(iso).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	} catch {
		return iso;
	}
};
/** Local-timezone YYYY-MM-DD (toISOString is UTC and gives yesterday's date
* before 5:30 AM in India — never use it for business dates). */
var ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
var today = () => ymd(/* @__PURE__ */ new Date());
//#endregion
export { ymd as i, fmtMoney as n, today as r, fmtDate as t };
