import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as PartyRepo } from "./repositories-DM2yCNqC.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Field } from "./Field-DE5r17lz.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parties_._id-DiWGAsBZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter$1 = () => import("./parties-zjl2IZ26.mjs");
var Route$1 = createFileRoute("/parties")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
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
var $$splitComponentImporter = () => import("./parties_._id-1DOoM_IU.mjs");
var Route = createFileRoute("/parties_/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
//#endregion
export { Route as n, Route$1 as r, PartyDialog as t };
