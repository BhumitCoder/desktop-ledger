import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-BbvIlm2J.js
var $$splitComponentImporter = () => import("./reports-U8Rw9mgL.mjs");
/** Download rows as Excel-friendly CSV — money cells become plain numbers */
var Route = createFileRoute("/reports")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ r: typeof search.r === "string" ? search.r : void 0 })
});
//#endregion
export { Route as t };
