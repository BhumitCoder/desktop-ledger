import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/purchase._id-B8AT89Qn.js
var $$splitComponentImporter = () => import("./purchase._id-D7AC7uD8.mjs");
var Route = createFileRoute("/purchase/$id")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => ({ print: search.print ? 1 : void 0 })
});
//#endregion
export { Route as t };
