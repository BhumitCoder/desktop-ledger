import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Field-DE5r17lz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Field = (0, import_react.forwardRef)(function Field({ label, hint, error, className, id, ...rest }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1 text-[12px]",
		htmlFor: id,
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref,
				id,
				className: cn("h-8 px-2 border rounded bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary", error && "border-destructive", className),
				onWheel: (e) => {
					if (rest.type === "number") e.currentTarget.blur();
				},
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.target.form) return;
					if (e.key === "Enter") {
						e.preventDefault();
						const form = e.target.form;
						if (!form) return;
						const focusables = Array.from(form.querySelectorAll("input, select, textarea, button")).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
						const idx = focusables.indexOf(e.target);
						(e.shiftKey ? focusables[idx - 1] : focusables[idx + 1])?.focus();
					}
					rest.onKeyDown?.(e);
				},
				...rest
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-destructive",
				children: error
			}) : hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: hint
			})
		]
	});
});
//#endregion
export { Field as t };
