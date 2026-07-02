import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { p as SalesRepo } from "./repositories-DM2yCNqC.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { B as CircleAlert } from "../_libs/lucide-react.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as InvoiceForm } from "./InvoiceForm-Dt9Qd2o1.mjs";
import { t as Route } from "./sales.edit._id-CUC9WDGk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales.edit._id-CEpAuMZP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EditSalePage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [inv, setInv] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		setInv(SalesRepo.get(id) ?? null);
	}, [id]);
	if (inv === void 0) return null;
	if (inv === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceForm, {
		mode: "sale",
		existing: inv
	});
}
//#endregion
export { EditSalePage as component };
