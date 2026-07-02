import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales._id-hu5Ks_D-.js
var $$splitComponentImporter = () => import("./sales._id-BNM_GRLx.mjs");
var Route = createFileRoute("/sales/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ print: search.print ? 1 : void 0 })
});
//#endregion
export { Route as t };
