import { o as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import { t as getAuth } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as setDoc, c as collection, d as initializeFirestore, i as persistentMultipleTabManager, l as doc, n as onSnapshot, o as updateDoc, r as persistentLocalCache, s as writeBatch, t as deleteDoc, u as increment } from "../_libs/@firebase/firestore+[...].mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/repositories-DM2yCNqC.js
var firebaseConfig = {
	apiKey: "AIzaSyDInBeT_ytLjhkRv_J3rtagRXUdY4WfEds",
	authDomain: "ibellmobiles-123.firebaseapp.com",
	projectId: "ibellmobiles-123",
	storageBucket: "ibellmobiles-123.firebasestorage.app",
	messagingSenderId: "191077483403",
	appId: "1:191077483403:web:1c934544f5b7e3cbc0658e",
	measurementId: "G-3WSQ6FXD71"
};
/** Named Firestore database (not the "(default)" one) */
var DATABASE_ID = "kinteshmobileacce";
var isBrowser = typeof window !== "undefined";
var app;
var authInstance;
var dbInstance;
if (isBrowser) {
	app = initializeApp(firebaseConfig);
	authInstance = getAuth(app);
	dbInstance = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }, DATABASE_ID);
}
var auth = authInstance;
var db = dbInstance;
var genId = () => nanoid(10);
/** Firestore rejects `undefined` field values — strip them deeply before writing. */
function stripUndefined(v) {
	if (Array.isArray(v)) return v.map(stripUndefined);
	if (v && typeof v === "object") {
		const out = {};
		for (const [k, val] of Object.entries(v)) if (val !== void 0) out[k] = stripUndefined(val);
		return out;
	}
	return v;
}
var writeError = (action) => (err) => {
	console.error(`Firestore ${action} failed`, err);
	toast.error(`Could not save to cloud (${action}). Check internet & try again.`);
};
/**
* Firestore-backed repository with the SAME synchronous API the whole app
* already uses. A live snapshot listener keeps an in-memory cache up to date;
* reads are served from the cache, writes update the cache immediately and
* sync to Firestore in the background (offline persistence queues them).
*/
var Repository = class {
	name;
	cache = [];
	unsub;
	constructor(name) {
		this.name = name;
	}
	/** Subscribe to the collection; resolves after the first snapshot arrives. */
	hydrate() {
		if (!isBrowser) return Promise.resolve();
		if (this.unsub) return Promise.resolve();
		return new Promise((resolve, reject) => {
			let first = true;
			this.unsub = onSnapshot(collection(db, this.name), (snap) => {
				this.cache = snap.docs.map((d) => d.data());
				this.cache.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
				if (first) {
					first = false;
					resolve();
				}
			}, (err) => {
				console.error(`Failed to load "${this.name}"`, err);
				if (first) {
					first = false;
					reject(err);
				} else toast.error("Cloud sync interrupted — check internet, then reload");
			});
		});
	}
	/** Stop listening and clear the cache (used on logout). */
	stop() {
		this.unsub?.();
		this.unsub = void 0;
		this.cache = [];
	}
	all() {
		return [...this.cache];
	}
	get(id) {
		return this.cache.find((i) => i.id === id);
	}
	add(item) {
		const record = {
			...item,
			id: item.id || genId(),
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		this.cache.unshift(record);
		if (isBrowser) setDoc(doc(db, this.name, record.id), stripUndefined(record)).catch(writeError("add"));
		return record;
	}
	update(id, patch) {
		const idx = this.cache.findIndex((i) => i.id === id);
		if (idx < 0) return void 0;
		const merged = {
			...this.cache[idx],
			...patch
		};
		this.cache[idx] = merged;
		if (isBrowser) setDoc(doc(db, this.name, id), stripUndefined(merged)).catch(writeError("update"));
		return merged;
	}
	/**
	* Concurrency-safe numeric change (stock, paid…). Uses Firestore's atomic
	* increment so two devices changing the same number at the same moment
	* BOTH count — an absolute write would silently lose one of them.
	*/
	adjustField(id, field, delta, extra) {
		const idx = this.cache.findIndex((i) => i.id === id);
		if (idx < 0) return void 0;
		const cur = this.cache[idx][field] ?? 0;
		const merged = {
			...this.cache[idx],
			...extra ?? {},
			[field]: Math.round((cur + delta) * 100) / 100
		};
		this.cache[idx] = merged;
		if (isBrowser) updateDoc(doc(db, this.name, id), {
			[field]: increment(Math.round(delta * 100) / 100),
			...stripUndefined(extra ?? {})
		}).catch(writeError("update"));
		return merged;
	}
	remove(id) {
		this.cache = this.cache.filter((i) => i.id !== id);
		if (isBrowser) deleteDoc(doc(db, this.name, id)).catch(writeError("delete"));
	}
	bulkRemove(ids) {
		const set = new Set(ids);
		this.cache = this.cache.filter((i) => !set.has(i.id));
		if (!isBrowser) return;
		this.batchedDelete([...set]);
	}
	/** Import records (backup restore / migration) in Firestore-safe chunks. */
	async importAll(records) {
		if (!isBrowser || !records.length) return;
		for (let i = 0; i < records.length; i += 400) {
			const chunk = records.slice(i, i + 400);
			const batch = writeBatch(db);
			for (const r of chunk) {
				if (!r?.id) continue;
				batch.set(doc(db, this.name, r.id), stripUndefined(r));
			}
			await batch.commit();
		}
	}
	/** Delete every document in the collection (Settings → Clear All Data). */
	async clearAll() {
		const ids = this.cache.map((r) => r.id);
		this.cache = [];
		await this.batchedDelete(ids);
	}
	async batchedDelete(ids) {
		if (!isBrowser || !ids.length) return;
		try {
			for (let i = 0; i < ids.length; i += 400) {
				const chunk = ids.slice(i, i + 400);
				const batch = writeBatch(db);
				for (const id of chunk) batch.delete(doc(db, this.name, id));
				await batch.commit();
			}
		} catch (err) {
			writeError("bulk delete")(err);
		}
	}
};
var PartyRepo = new Repository("parties");
var ItemRepo = new Repository("items");
var SalesRepo = new Repository("sales");
var PurchaseRepo = new Repository("purchases");
var SaleReturnRepo = new Repository("sale-returns");
var PurchaseReturnRepo = new Repository("purchase-returns");
var ExpenseRepo = new Repository("expenses");
var BankRepo = new Repository("banks");
var BankTxnRepo = new Repository("bankTxns");
var PaymentRepo = new Repository("payments");
var StockAdjustmentRepo = new Repository("stock-adjustments");
var CashAdjustmentRepo = new Repository("cash-adjustments");
var defaultCompany = {
	name: "My Company",
	currency: "INR",
	invoicePrefix: "INV-",
	purchasePrefix: "PUR-",
	enableGst: true
};
/** Company settings live in a single Firestore doc: settings/company */
var companyCache = defaultCompany;
var companyUnsub;
var companyExists = false;
function hydrateCompany() {
	if (!isBrowser || companyUnsub) return Promise.resolve();
	return new Promise((resolve, reject) => {
		let first = true;
		companyUnsub = onSnapshot(doc(db, "settings", "company"), (snap) => {
			companyExists = snap.exists();
			companyCache = snap.exists() ? {
				...defaultCompany,
				...snap.data()
			} : defaultCompany;
			if (first) {
				first = false;
				resolve();
			}
		}, (err) => {
			console.error("Failed to load company settings", err);
			if (first) {
				first = false;
				reject(err);
			}
		});
	});
}
var CompanyRepo = {
	get() {
		return companyCache;
	},
	save(c) {
		companyCache = c;
		companyExists = true;
		if (isBrowser) setDoc(doc(db, "settings", "company"), c).catch((err) => {
			console.error("Failed to save company settings", err);
			toast.error("Could not save settings to cloud. Check internet & try again.");
		});
	}
};
/** Map of legacy localStorage keys → repositories (backup files & migration). */
var REPO_BY_KEY = {
	"bz.parties": PartyRepo,
	"bz.items": ItemRepo,
	"bz.sales": SalesRepo,
	"bz.purchases": PurchaseRepo,
	"bz.sale-returns": SaleReturnRepo,
	"bz.purchase-returns": PurchaseReturnRepo,
	"bz.expenses": ExpenseRepo,
	"bz.banks": BankRepo,
	"bz.bankTxns": BankTxnRepo,
	"bz.payments": PaymentRepo,
	"bz.stock-adjustments": StockAdjustmentRepo,
	"bz.cash-adjustments": CashAdjustmentRepo
};
var ALL_REPOS = Object.values(REPO_BY_KEY);
/** Load everything after login; resolves when every collection has its first snapshot. */
async function hydrateRepos() {
	await Promise.all([...ALL_REPOS.map((r) => r.hydrate()), hydrateCompany()]);
}
/** Stop all listeners and clear caches (on logout). */
function stopRepos() {
	ALL_REPOS.forEach((r) => r.stop());
	companyUnsub?.();
	companyUnsub = void 0;
	companyCache = defaultCompany;
	companyExists = false;
}
/**
* One-time migration: if the cloud is completely empty but this browser still
* has old localStorage data, upload it. localStorage is left untouched as a
* safety copy. Returns the number of migrated records.
*/
async function migrateFromLocalStorage() {
	if (!isBrowser) return 0;
	if (ALL_REPOS.some((r) => r.all().length > 0) || companyExists) return 0;
	let migrated = 0;
	for (const [key, repo] of Object.entries(REPO_BY_KEY)) try {
		const raw = localStorage.getItem(key);
		if (!raw) continue;
		const records = JSON.parse(raw);
		if (Array.isArray(records) && records.length) {
			await repo.importAll(records);
			migrated += records.length;
		}
	} catch (err) {
		console.error(`Migration of ${key} failed`, err);
	}
	try {
		const rawCompany = localStorage.getItem("bz.company");
		if (rawCompany) CompanyRepo.save({
			...defaultCompany,
			...JSON.parse(rawCompany)
		});
	} catch (err) {
		console.error("Migration of company settings failed", err);
	}
	return migrated;
}
function nextInvoiceNumber(prefix, existing) {
	const nums = existing.map((i) => parseInt(i.number.replace(prefix, ""), 10)).filter((n) => !isNaN(n));
	const next = nums.length ? Math.max(...nums) + 1 : 1;
	return `${prefix}${String(next).padStart(4, "0")}`;
}
//#endregion
export { hydrateRepos as _, ExpenseRepo as a, nextInvoiceNumber as b, PaymentRepo as c, REPO_BY_KEY as d, SaleReturnRepo as f, genId as g, auth as h, CompanyRepo as i, PurchaseRepo as l, StockAdjustmentRepo as m, BankTxnRepo as n, ItemRepo as o, SalesRepo as p, CashAdjustmentRepo as r, PartyRepo as s, BankRepo as t, PurchaseReturnRepo as u, isBrowser as v, stopRepos as x, migrateFromLocalStorage as y };
