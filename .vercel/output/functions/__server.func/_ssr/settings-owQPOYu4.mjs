import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as REPO_BY_KEY, h as auth, i as CompanyRepo, v as isBrowser } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { t as PageHeader } from "./PageHeader-B1sgTJFu.mjs";
import { r as today } from "./format-uyyFg6A-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-owQPOYu4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const [c, setC] = (0, import_react.useState)(() => CompanyRepo.get());
	const [busy, setBusy] = (0, import_react.useState)(false);
	const importRef = (0, import_react.useRef)(null);
	const userEmail = isBrowser ? auth.currentUser?.email ?? "" : "";
	const save = (e) => {
		e.preventDefault();
		CompanyRepo.save(c);
		toast.success("Settings saved");
	};
	const exportData = () => {
		const dump = {};
		for (const [key, repo] of Object.entries(REPO_BY_KEY)) dump[key] = JSON.stringify(repo.all());
		dump["bz.company"] = JSON.stringify(CompanyRepo.get());
		const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `bizdesk-backup-${today()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("Backup downloaded");
	};
	const importData = async (file) => {
		try {
			const dump = JSON.parse(await file.text());
			if (typeof dump !== "object" || dump === null) throw new Error("Invalid file");
			const known = Object.keys(REPO_BY_KEY).filter((k) => dump[k] != null);
			const hasCompany = dump["bz.company"] != null;
			if (!known.length && !hasCompany) {
				toast.error("No BizDesk data found in this file");
				return;
			}
			if (!confirm(`Restore ${known.length + (hasCompany ? 1 : 0)} data sections from backup into the cloud? Records with the same ID will be overwritten.`)) return;
			setBusy(true);
			for (const k of known) {
				const v = dump[k];
				const records = typeof v === "string" ? JSON.parse(v) : v;
				if (Array.isArray(records) && records.length) await REPO_BY_KEY[k].importAll(records);
			}
			if (hasCompany) {
				const v = dump["bz.company"];
				CompanyRepo.save(typeof v === "string" ? JSON.parse(v) : v);
			}
			toast.success("Backup restored to cloud — reloading…");
			setTimeout(() => location.reload(), 800);
		} catch {
			setBusy(false);
			toast.error("Could not read backup file — is it a valid BizDesk backup?");
		}
	};
	const clearAll = async () => {
		if (!confirm("Delete ALL business data from the cloud? This cannot be undone.")) return;
		if (!confirm("Are you really sure? Every invoice, party, item and payment will be permanently deleted.")) return;
		setBusy(true);
		try {
			for (const repo of Object.values(REPO_BY_KEY)) await repo.clearAll();
			toast.success("All data cleared");
			setTimeout(() => location.reload(), 600);
		} catch {
			setBusy(false);
			toast.error("Could not clear all data — check your connection");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			subtitle: "Company & preferences"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 space-y-6 overflow-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: save,
					className: "border rounded-md bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm mb-3",
							children: "Company Details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Company Name *",
										value: c.name,
										onChange: (e) => setC({
											...c,
											name: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "GSTIN",
									value: c.gstin ?? "",
									onChange: (e) => setC({
										...c,
										gstin: e.target.value.toUpperCase()
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone",
									value: c.phone ?? "",
									onChange: (e) => setC({
										...c,
										phone: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									value: c.email ?? "",
									onChange: (e) => setC({
										...c,
										email: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Currency",
									value: c.currency,
									onChange: (e) => setC({
										...c,
										currency: e.target.value.toUpperCase()
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Invoice Prefix",
									value: c.invoicePrefix,
									onChange: (e) => setC({
										...c,
										invoicePrefix: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Purchase Prefix",
									value: c.purchasePrefix,
									onChange: (e) => setC({
										...c,
										purchasePrefix: e.target.value
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Address",
										value: c.address ?? "",
										onChange: (e) => setC({
											...c,
											address: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "col-span-2 flex items-center gap-2 text-[13px] cursor-pointer select-none mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: c.enableRoundOff !== false,
											onChange: (e) => setC({
												...c,
												enableRoundOff: e.target.checked
											}),
											className: "accent-primary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: "Round off invoice totals to nearest rupee"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "(e.g. ₹487.37 → ₹487)"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								children: ["Save ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "ml-1 text-[10px]",
									children: "Ctrl+S"
								})]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border rounded-md bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm mb-3",
							children: "Account & Data"
						}),
						userEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mb-3",
							children: [
								"Signed in as ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: userEmail
								}),
								" · Data is stored securely in the cloud (Firebase) and works offline too."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									disabled: busy,
									onClick: exportData,
									children: "Export Backup (JSON)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									disabled: busy,
									onClick: () => importRef.current?.click(),
									children: "Import Backup"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: importRef,
									type: "file",
									accept: ".json,application/json",
									className: "hidden",
									onChange: (e) => {
										const file = e.target.files?.[0];
										if (file) importData(file);
										e.target.value = "";
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "destructive",
									disabled: busy,
									onClick: clearAll,
									children: "Clear All Data"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-2",
							children: "Backups download as JSON files. Old backups from the localStorage version restore fine too."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border rounded-md bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-sm mb-3",
						children: "Keyboard Shortcuts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-x-6 gap-y-1 text-xs",
						children: [
							["Ctrl+F", "Global search"],
							["Ctrl+N", "New sale"],
							["Ctrl+P", "New purchase"],
							["Ctrl+S", "Save form"],
							["Alt+1..8", "Jump to module"],
							["N", "New record (in list)"],
							["Tab / Enter", "Next field"],
							["Shift+Tab", "Previous field"],
							["Esc", "Close dialog / cancel"],
							["↑ ↓", "Navigate rows / suggestions"],
							["Enter", "Open / select"],
							["Ctrl+Delete", "Delete row"]
						].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between border-b py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: l
							})]
						}, k))
					})]
				})
			]
		})]
	});
}
//#endregion
export { SettingsPage as component };
