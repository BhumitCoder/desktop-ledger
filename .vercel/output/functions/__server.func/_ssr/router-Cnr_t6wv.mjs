import { o as __toESM } from "../_runtime.mjs";
import { a as signOut, i as signInWithEmailAndPassword, n as onAuthStateChanged, r as sendPasswordResetEmail } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { r as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { _ as hydrateRepos, h as auth, i as CompanyRepo, l as PurchaseRepo, o as ItemRepo, p as SalesRepo, s as PartyRepo, v as isBrowser, x as stopRepos, y as migrateFromLocalStorage } from "./repositories-DM2yCNqC.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { A as Eye, B as CircleAlert, C as LogOut, D as LayoutDashboard, F as CloudUpload, G as ChevronDown, H as ChevronsLeft, J as Building2, N as CornerUpLeft, O as Landmark, P as CornerDownLeft, S as Mail, T as LoaderCircle, U as ChevronRight, V as ChevronsRight, X as BookOpen, Y as Boxes, Z as Banknote, a as Truck, c as Sparkles, d as Search, g as Plus, j as EyeOff, k as FileText, l as ShoppingCart, m as Receipt, n as Wallet, q as ChartColumn, r as Users, t as X, u as Settings, w as Lock, x as Menu, y as Package } from "../_libs/lucide-react.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-B69u1cPq.mjs";
import { _ as useNavigate, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$20, r as Route$1$1 } from "./parties_._id-DiWGAsBZ.mjs";
import { t as Route$21 } from "./purchase-return._id-QhFLHCh1.mjs";
import { t as Route$22 } from "./purchase._id-B8AT89Qn.mjs";
import { t as Route$23 } from "./purchase.edit._id-CsLN2UlB.mjs";
import { t as Route$24 } from "./reports-BbvIlm2J.mjs";
import { t as Route$25 } from "./sales._id-hu5Ks_D-.mjs";
import { t as Route$26 } from "./sale-return._id-C_edYmd4.mjs";
import { t as Route$27 } from "./sales.edit._id-CUC9WDGk.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Cnr_t6wv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var styles_default = "/assets/styles-DFLF2IZd.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var SIDEBAR_KEY = "bz.sidebarCollapsed";
var initialCollapsed = (() => {
	if (typeof window === "undefined") return false;
	try {
		return localStorage.getItem(SIDEBAR_KEY) === "1";
	} catch {
		return false;
	}
})();
var useWorkspace = create((set, get) => ({
	tabs: [],
	activeId: null,
	globalSearchOpen: false,
	quickAddOpen: null,
	sidebarCollapsed: initialCollapsed,
	openTab: (tab) => {
		if (get().tabs.find((t) => t.id === tab.id)) set({ activeId: tab.id });
		else set({
			tabs: [...get().tabs, tab],
			activeId: tab.id
		});
	},
	closeTab: (id) => {
		const tabs = get().tabs.filter((t) => t.id !== id);
		set({
			tabs,
			activeId: get().activeId === id ? tabs[tabs.length - 1]?.id ?? null : get().activeId
		});
	},
	setActive: (id) => set({ activeId: id }),
	setGlobalSearch: (v) => set({ globalSearchOpen: v }),
	setQuickAdd: (v) => set({ quickAddOpen: v }),
	toggleSidebar: () => {
		const v = !get().sidebarCollapsed;
		set({ sidebarCollapsed: v });
		try {
			localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
		} catch {}
	},
	setSidebarCollapsed: (v) => {
		set({ sidebarCollapsed: v });
		try {
			localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
		} catch {}
	}
}));
var groups = [
	{
		title: "Overview",
		items: [{
			path: "/",
			label: "Dashboard",
			icon: LayoutDashboard,
			key: "1"
		}]
	},
	{
		title: "Master Data",
		items: [
			{
				path: "/parties",
				label: "Parties",
				icon: Users,
				key: "2"
			},
			{
				path: "/items",
				label: "Items",
				icon: Package,
				key: "3"
			},
			{
				path: "/inventory",
				label: "Inventory",
				icon: Boxes
			}
		]
	},
	{
		title: "Sales",
		collapsible: true,
		defaultOpen: false,
		items: [{
			path: "/sales",
			label: "Sales",
			icon: ShoppingCart,
			key: "4"
		}, {
			path: "/sale-return",
			label: "Sale Return",
			icon: CornerDownLeft
		}]
	},
	{
		title: "Purchase & Expenses",
		collapsible: true,
		defaultOpen: false,
		items: [
			{
				path: "/purchase",
				label: "Purchase",
				icon: Truck,
				key: "5"
			},
			{
				path: "/purchase-return",
				label: "Purchase Return",
				icon: CornerUpLeft
			},
			{
				path: "/expenses",
				label: "Expenses",
				icon: Receipt,
				key: "6"
			}
		]
	},
	{
		title: "Payments",
		collapsible: true,
		defaultOpen: false,
		items: [{
			path: "/payments",
			label: "Payments",
			icon: Wallet
		}]
	},
	{
		title: "Cash & Bank",
		items: [{
			path: "/bank",
			label: "Bank Accounts",
			icon: Landmark
		}, {
			path: "/cash",
			label: "Cash in Hand",
			icon: Banknote
		}]
	},
	{
		title: "Reports",
		items: [
			{
				path: "/reports",
				label: "Reports",
				icon: ChartColumn,
				key: "7"
			},
			{
				path: "/daybook",
				label: "Daybook",
				icon: BookOpen
			},
			{
				path: "/gst",
				label: "GST Returns",
				icon: FileText
			}
		]
	},
	{
		title: "System",
		items: [{
			path: "/settings",
			label: "Settings",
			icon: Settings,
			key: "8"
		}]
	}
];
function Sidebar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const collapsed = useWorkspace((s) => s.sidebarCollapsed);
	const toggle = useWorkspace((s) => s.toggleSidebar);
	const initOpen = {};
	groups.forEach((g) => {
		if (g.collapsible) initOpen[g.title] = g.defaultOpen ?? false;
	});
	const [openGroups, setOpenGroups] = (0, import_react.useState)(initOpen);
	const toggleGroup = (title) => setOpenGroups((prev) => ({
		...prev,
		[title]: !prev[title]
	}));
	const isGroupActive = (g) => g.items.some((it) => it.path === pathname || it.path !== "/" && pathname.startsWith(it.path));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-200", collapsed ? "w-14" : "w-60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "h-14 flex items-center gap-2.5 bg-gradient-brand text-brand-foreground shrink-0 px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-8 rounded-md bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
				}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col leading-tight overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold tracking-tight text-[15px]",
						children: "BizDesk"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-widest opacity-80",
						children: "Billing · Inventory"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto overflow-x-hidden py-2 text-[13px]",
				children: groups.map((g) => {
					const active = isGroupActive(g);
					const isOpen = g.collapsible ? openGroups[g.title] || active : true;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-1",
						children: [
							!collapsed && (g.collapsible ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => toggleGroup(g.title),
								className: cn("w-full flex items-center justify-between px-4 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors", active ? "text-primary" : "text-sidebar-muted hover:text-sidebar-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: g.title }), isOpen && !active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3 w-3 opacity-60" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3 opacity-60" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted",
								children: g.title
							})),
							collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-3 my-1.5 border-t border-sidebar-border" }),
							(collapsed || isOpen) && g.items.map((it) => {
								const itemActive = pathname === it.path || it.path !== "/" && pathname.startsWith(it.path);
								const Icon = it.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: it.path,
									title: collapsed ? it.label : void 0,
									className: cn("group flex items-center gap-2.5 py-2 border-l-[3px] border-transparent transition-colors", collapsed ? "px-3 justify-center" : "px-4", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", itemActive && "bg-sidebar-accent text-sidebar-accent-foreground border-primary font-semibold"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-4 w-4 shrink-0", itemActive ? "opacity-100" : "opacity-70 group-hover:opacity-100") }),
										!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 truncate",
											children: it.label
										}),
										!collapsed && it.key && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("kbd", {
											className: "text-[9px] opacity-60 font-mono",
											children: ["Alt+", it.key]
										})
									]
								}, it.path);
							})
						]
					}, g.title);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: toggle,
				className: "border-t border-sidebar-border h-10 flex items-center justify-center gap-2 text-[11px] text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
				title: collapsed ? "Expand sidebar" : "Collapse sidebar",
				children: collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Collapse" })] })
			})
		]
	});
}
function Topbar() {
	const { setGlobalSearch, toggleSidebar } = useWorkspace();
	const navigate = useNavigate();
	const [company, setCompany] = (0, import_react.useState)(() => CompanyRepo.get());
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setCompany(CompanyRepo.get()), 2e3);
		return () => clearInterval(t);
	}, []);
	const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
		weekday: "short",
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "h-14 bg-gradient-brand text-brand-foreground flex items-center px-3 md:px-4 gap-2 md:gap-3 shrink-0 shadow-elevated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: toggleSidebar,
				className: "md:hidden h-9 w-9 rounded-md hover:bg-white/15 flex items-center justify-center text-white/90",
				title: "Toggle menu",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setGlobalSearch(true),
				className: "flex-1 max-w-xl flex items-center gap-2 h-9 px-3.5 rounded-md bg-white/15 hover:bg-white/25 text-white/95 backdrop-blur-sm transition-colors ring-1 ring-white/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 text-left text-sm truncate",
						children: "Search customer, item, invoice…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "hidden sm:inline-flex text-[10px] font-mono bg-white/20 border-white/20 text-white",
						children: "Ctrl+F"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({ to: "/sales/new" }),
				className: "h-9 px-3 md:px-4 rounded-md bg-white text-primary hover:bg-white/95 font-semibold text-sm flex items-center gap-1.5 shadow-card transition",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Add "
					}),
					"Sale",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "hidden md:inline-flex text-[10px] font-mono ml-1 opacity-70 bg-primary/10 border-primary/20",
						children: "Ctrl+N"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({ to: "/purchase/new" }),
				className: "h-9 px-3 md:px-4 rounded-md bg-white/15 hover:bg-white/25 text-white font-semibold text-sm flex items-center gap-1.5 ring-1 ring-white/20 transition",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Add "
					}),
					"Purchase",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "hidden md:inline-flex text-[10px] font-mono ml-1 opacity-80 bg-white/20 border-white/20 text-white",
						children: "Ctrl+P"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden lg:block h-6 w-px bg-white/20 mx-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden lg:inline text-[11px] text-white/75 tabular-nums",
				children: today
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({ to: "/settings" }),
				className: "flex items-center gap-2 pl-2 pr-2 h-9 rounded-md bg-white/15 hover:bg-white/25 ring-1 ring-white/20 transition",
				title: "Company settings",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-6 w-6 rounded bg-white/20 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden md:flex flex-col items-start leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-wide opacity-75",
							children: "Company"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] font-semibold truncate max-w-[140px]",
							children: company.name
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 opacity-70" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: async () => {
					if (!confirm("Logout from BizDesk?")) return;
					try {
						stopRepos();
						await signOut(auth);
					} catch {
						toast.error("Logout failed — check your connection");
					}
				},
				className: "h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 ring-1 ring-white/20 flex items-center justify-center transition",
				title: `Logout${isBrowser && auth.currentUser?.email ? ` (${auth.currentUser.email})` : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
			})
		]
	});
}
function WorkspaceTabs() {
	const { tabs, closeTab, openTab } = useWorkspace();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const routeTitle = titleFromPath(pathname);
	(0, import_react.useEffect)(() => {
		if (!routeTitle) return;
		openTab({
			id: pathname,
			title: routeTitle,
			path: pathname
		});
	}, [
		pathname,
		routeTitle,
		openTab
	]);
	if (!tabs.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-10 border-b bg-muted/50 flex items-end px-2 gap-0.5 overflow-x-auto shrink-0",
		children: tabs.map((tab) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("group flex items-center gap-1.5 h-9 pl-3.5 pr-1.5 border border-b-0 rounded-t-md text-[12px] cursor-pointer transition-colors", tab.path === pathname ? "bg-background border-border font-semibold text-foreground shadow-[0_-2px_0_var(--color-primary)_inset]" : "bg-transparent border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: tab.path,
					className: "max-w-[160px] truncate",
					children: tab.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => {
						e.preventDefault();
						closeTab(tab.id);
					},
					className: "opacity-40 hover:opacity-100 hover:bg-accent rounded p-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
				})]
			}, tab.id);
		})
	});
}
function titleFromPath(path) {
	if (path === "/") return "Dashboard";
	return {
		"/parties": "Parties",
		"/items": "Items",
		"/sales": "Sales",
		"/sales/new": "New Sale",
		"/purchase": "Purchase",
		"/purchase/new": "New Purchase",
		"/expenses": "Expenses",
		"/payments": "Payments",
		"/inventory": "Inventory",
		"/bank": "Bank",
		"/cash": "Cash",
		"/reports": "Reports",
		"/gst": "GST",
		"/settings": "Settings"
	}[path] ?? null;
}
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
function GlobalSearch() {
	const { globalSearchOpen, setGlobalSearch } = useWorkspace();
	const navigate = useNavigate();
	const [data, setData] = (0, import_react.useState)({
		parties: [],
		items: [],
		sales: [],
		purchases: []
	});
	(0, import_react.useEffect)(() => {
		if (globalSearchOpen) setData({
			parties: PartyRepo.all(),
			items: ItemRepo.all(),
			sales: SalesRepo.all(),
			purchases: PurchaseRepo.all()
		});
	}, [globalSearchOpen]);
	const go = (path) => {
		setGlobalSearch(false);
		navigate({ to: path });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandDialog, {
		open: globalSearchOpen,
		onOpenChange: setGlobalSearch,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			placeholder: "Search parties, items, invoices...",
			autoFocus: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No results." }),
			data.parties.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Parties",
				children: data.parties.slice(0, 6).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/parties"),
					value: `party ${p.name} ${p.phone ?? ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
						p.name,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto text-xs text-muted-foreground",
							children: p.phone
						})
					]
				}, p.id))
			}),
			data.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Items",
				children: data.items.slice(0, 6).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/items"),
					value: `item ${i.name} ${i.sku ?? ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
						i.name,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-auto text-xs text-muted-foreground",
							children: ["Stock: ", i.stock]
						})
					]
				}, i.id))
			}),
			data.sales.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Sales Invoices",
				children: data.sales.slice(0, 6).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/sales"),
					value: `sale ${s.number} ${s.partyName}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3.5 w-3.5" }),
						s.number,
						" — ",
						s.partyName
					]
				}, s.id))
			}),
			data.purchases.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: "Purchase Bills",
				children: data.purchases.slice(0, 6).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/purchase"),
					value: `purchase ${s.number} ${s.partyName}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3.5 w-3.5" }),
						s.number,
						" — ",
						s.partyName
					]
				}, s.id))
			})
		] })] })
	});
}
var paths = [
	"/",
	"/parties",
	"/items",
	"/sales",
	"/purchase",
	"/expenses",
	"/reports",
	"/settings"
];
function useGlobalShortcuts() {
	const navigate = useNavigate();
	const { setGlobalSearch, setQuickAdd } = useWorkspace();
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			const ctrl = e.ctrlKey || e.metaKey;
			if (ctrl && e.key.toLowerCase() === "f") {
				e.preventDefault();
				setGlobalSearch(true);
				return;
			}
			if (ctrl && e.key.toLowerCase() === "n") {
				e.preventDefault();
				setQuickAdd("sale");
				navigate({ to: "/sales/new" });
				return;
			}
			if (ctrl && e.key.toLowerCase() === "p") {
				e.preventDefault();
				setQuickAdd("purchase");
				navigate({ to: "/purchase/new" });
				return;
			}
			if (e.altKey && /^[1-8]$/.test(e.key)) {
				e.preventDefault();
				navigate({ to: paths[parseInt(e.key, 10) - 1] });
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [
		navigate,
		setGlobalSearch,
		setQuickAdd
	]);
}
function AppShell({ children }) {
	useGlobalShortcuts();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen w-screen flex bg-background text-foreground overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceTabs, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "flex-1 overflow-auto",
						children
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalSearch, {})
		]
	});
}
var Route$19 = createFileRoute("/login")({ component: LoginPage });
function friendlyAuthError(code) {
	switch (code) {
		case "auth/invalid-credential":
		case "auth/wrong-password":
		case "auth/user-not-found": return "Incorrect email or password. Please try again.";
		case "auth/invalid-email": return "Please enter a valid email address.";
		case "auth/too-many-requests": return "Too many attempts. Please wait a few minutes and try again.";
		case "auth/network-request-failed": return "No internet connection. Check your network and try again.";
		case "auth/user-disabled": return "This account has been disabled. Contact your administrator.";
		default: return "Sign in failed. Please try again.";
	}
}
function LoginPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPass, setShowPass] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const emailRef = (0, import_react.useRef)(null);
	const submit = async (e) => {
		e.preventDefault();
		setError("");
		if (!email.trim()) {
			setError("Please enter your email address.");
			emailRef.current?.focus();
			return;
		}
		if (!password) {
			setError("Please enter your password.");
			return;
		}
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email.trim(), password);
		} catch (err) {
			setError(friendlyAuthError(err?.code ?? ""));
			setLoading(false);
		}
	};
	const forgotPassword = async () => {
		if (!email.trim()) {
			setError("Enter your email above first, then click Forgot password.");
			emailRef.current?.focus();
			return;
		}
		try {
			await sendPasswordResetEmail(auth, email.trim());
			toast.success(`Password reset link sent to ${email.trim()}`);
		} catch (err) {
			setError(friendlyAuthError(err?.code ?? ""));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full flex bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:flex w-[45%] bg-gradient-brand text-brand-foreground flex-col justify-between p-10 xl:p-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold tracking-tight text-[20px]",
							children: "BizDesk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] opacity-80",
							children: "Billing · Inventory"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-[32px] xl:text-[38px] font-extrabold leading-tight tracking-tight",
							children: "Run your whole business from one screen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-white/80 text-[15px] leading-relaxed",
							children: "GST billing, stock, payments, and profit reports — fast, keyboard-first, and now backed up safely in the cloud."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
									icon: Receipt,
									title: "GST invoices in seconds",
									desc: "Auto party & item creation right from the bill"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
									icon: Package,
									title: "Live stock tracking",
									desc: "Every sale, purchase and return updates inventory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
									icon: ChartColumn,
									title: "Profit you can trust",
									desc: "P&L, ledgers and GST reports always in sync"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
									icon: CloudUpload,
									title: "Cloud backup & sync",
									desc: "Your data is safe even if this computer fails"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 flex items-center justify-center p-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[400px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:hidden flex items-center gap-2.5 mb-8 justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 rounded-lg bg-gradient-brand text-brand-foreground flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-bold tracking-tight text-[18px]",
								children: "BizDesk"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
								children: "Billing · Inventory"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[24px] font-bold tracking-tight",
						children: "Welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1 mb-7",
						children: "Sign in to access your billing workspace"
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[13px] font-medium text-foreground",
									children: "Email address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1.5 relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: emailRef,
										type: "email",
										autoComplete: "email",
										autoFocus: true,
										value: email,
										onChange: (e) => setEmail(e.target.value),
										placeholder: "you@business.com",
										className: "w-full h-11 pl-10 pr-3 border rounded-lg bg-background text-[14px] focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13px] font-medium text-foreground",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: forgotPassword,
										className: "text-[12px] text-primary hover:underline font-medium",
										children: "Forgot password?"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1.5 relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: showPass ? "text" : "password",
											autoComplete: "current-password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											placeholder: "Enter your password",
											className: "w-full h-11 pl-10 pr-11 border rounded-lg bg-background text-[14px] focus:border-primary focus:ring-2 focus:ring-ring/20 outline-none transition"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowPass((v) => !v),
											className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition",
											title: showPass ? "Hide password" : "Show password",
											children: showPass ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: loading,
								className: "w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-[14px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2",
								children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Signing in…"] }) : "Sign In"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-center text-[12px] text-muted-foreground",
						children: "Access is by invitation only. Contact your administrator for an account."
					})
				]
			})
		})]
	});
}
function Feature({ icon: Icon, title, desc }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-9 w-9 rounded-lg bg-white/12 ring-1 ring-white/20 flex items-center justify-center shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold text-[14px]",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[12.5px] text-white/70",
			children: desc
		})] })]
	});
}
/** Remembers whether someone was signed in on this device, so the very first
* paint can go straight to the right screen (login vs splash) with no blink. */
var AUTH_HINT_KEY = "bz.authHint";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center h-full min-h-[60vh]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-bold",
				children: "404"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Page not found"
			})]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "root" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: error.message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						router.invalidate();
						reset();
					},
					className: "mt-4 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm",
					children: "Try again"
				})
			]
		})
	});
}
var Route$18 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "BizDesk — Billing & Inventory ERP" },
			{
				name: "description",
				content: "Keyboard-first desktop billing, inventory, and accounting software."
			},
			{
				property: "og:title",
				content: "BizDesk — Billing & Inventory ERP"
			},
			{
				property: "og:description",
				content: "Keyboard-first desktop billing, inventory, and accounting software."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon",
				sizes: "48x48"
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.svg"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$18.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "bottom-right",
			duration: 3e3,
			closeButton: true,
			richColors: true
		})]
	});
}
/**
* Auth + data gate:
*  - undefined user → checking session (splash)
*  - no user → only /login is allowed
*  - user → hydrate all cloud data (and one-time migrate old localStorage
*    data) BEFORE rendering the app, since screens read repos synchronously.
*/
function AuthGate() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [user, setUser] = (0, import_react.useState)(void 0);
	const [dataReady, setDataReady] = (0, import_react.useState)(false);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isBrowser) return;
		return onAuthStateChanged(auth, (u) => {
			setUser(u);
			try {
				if (u) localStorage.setItem(AUTH_HINT_KEY, "1");
				else localStorage.removeItem(AUTH_HINT_KEY);
			} catch {}
			if (!u) {
				stopRepos();
				setDataReady(false);
			}
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user || dataReady) return;
		let cancelled = false;
		(async () => {
			try {
				await hydrateRepos();
				const migrated = await migrateFromLocalStorage();
				if (migrated > 0) toast.success(`Moved ${migrated} records from this device to cloud`);
				if (!cancelled) setDataReady(true);
			} catch (err) {
				console.error("Data load failed", err);
				if (!cancelled) setLoadError("Could not load your data from the cloud. Check your internet connection and that Firestore security rules allow signed-in access, then reload.");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, dataReady]);
	(0, import_react.useEffect)(() => {
		if (user === void 0) return;
		if (!user && pathname !== "/login") navigate({ to: "/login" });
		if (user && pathname === "/login") navigate({ to: "/" });
	}, [
		user,
		pathname,
		navigate
	]);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, {});
	const wasSignedIn = (() => {
		try {
			return localStorage.getItem(AUTH_HINT_KEY) === "1";
		} catch {
			return false;
		}
	})();
	if (pathname === "/login") {
		if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	}
	if (user === null || user === void 0 && !wasSignedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, {});
	if (loadError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-10 w-10 text-destructive mx-auto mb-3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold",
					children: "Couldn't load your data"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: loadError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => location.reload(),
					className: "mt-4 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold",
					children: "Reload"
				})
			]
		})
	});
	if (user === void 0 || !dataReady) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
function SplashScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col items-center justify-center bg-background gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-14 w-14 rounded-2xl bg-gradient-brand text-brand-foreground flex items-center justify-center shadow-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-bold tracking-tight text-[18px]",
				children: "BizDesk"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[12px] text-muted-foreground flex items-center gap-1.5 justify-center mt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Loading your workspace…"]
			})]
		})]
	});
}
var $$splitComponentImporter$17 = () => import("./settings-owQPOYu4.mjs");
var Route$17 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./payments-COreX9im.mjs");
var Route$16 = createFileRoute("/payments")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./items-BZpRoHO_.mjs");
var Route$15 = createFileRoute("/items")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./inventory-Ckq1GweB.mjs");
var Route$14 = createFileRoute("/inventory")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./gst-CzNZu9f9.mjs");
var Route$13 = createFileRoute("/gst")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./expenses-Bsebr-Xq.mjs");
var Route$12 = createFileRoute("/expenses")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./daybook-Dr8RNJdc.mjs");
var Route$11 = createFileRoute("/daybook")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./cash-B-wGdyHr.mjs");
var Route$10 = createFileRoute("/cash")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./bank-Dy90OezJ.mjs");
var Route$9 = createFileRoute("/bank")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./routes-CCl-FecP.mjs");
var Route$8 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./sales.index-CurM5CUy.mjs");
var Route$7 = createFileRoute("/sales/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./sale-return.index-CqWdm7Jc.mjs");
var Route$6 = createFileRoute("/sale-return/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./purchase.index-DDvz8biG.mjs");
var Route$5 = createFileRoute("/purchase/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./purchase-return.index-BsxcNc2z.mjs");
var Route$4 = createFileRoute("/purchase-return/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./sales.new-ByeE6LKk.mjs");
var Route$3 = createFileRoute("/sales/new")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./sale-return.new-Bvv5vjz4.mjs");
var Route$2 = createFileRoute("/sale-return/new")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./purchase.new-CpKbRFa8.mjs");
var Route$1 = createFileRoute("/purchase/new")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./purchase-return.new-DLiA5XuB.mjs");
var Route = createFileRoute("/purchase-return/new")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var SettingsRoute = Route$17.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$18
});
var ReportsRoute = Route$24.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => Route$18
});
var PaymentsRoute = Route$16.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => Route$18
});
var PartiesRoute = Route$1$1.update({
	id: "/parties",
	path: "/parties",
	getParentRoute: () => Route$18
});
var LoginRoute = Route$19.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$18
});
var ItemsRoute = Route$15.update({
	id: "/items",
	path: "/items",
	getParentRoute: () => Route$18
});
var InventoryRoute = Route$14.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => Route$18
});
var GstRoute = Route$13.update({
	id: "/gst",
	path: "/gst",
	getParentRoute: () => Route$18
});
var ExpensesRoute = Route$12.update({
	id: "/expenses",
	path: "/expenses",
	getParentRoute: () => Route$18
});
var DaybookRoute = Route$11.update({
	id: "/daybook",
	path: "/daybook",
	getParentRoute: () => Route$18
});
var CashRoute = Route$10.update({
	id: "/cash",
	path: "/cash",
	getParentRoute: () => Route$18
});
var BankRoute = Route$9.update({
	id: "/bank",
	path: "/bank",
	getParentRoute: () => Route$18
});
var IndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var SalesIndexRoute = Route$7.update({
	id: "/sales/",
	path: "/sales/",
	getParentRoute: () => Route$18
});
var SaleReturnIndexRoute = Route$6.update({
	id: "/sale-return/",
	path: "/sale-return/",
	getParentRoute: () => Route$18
});
var PurchaseIndexRoute = Route$5.update({
	id: "/purchase/",
	path: "/purchase/",
	getParentRoute: () => Route$18
});
var PurchaseReturnIndexRoute = Route$4.update({
	id: "/purchase-return/",
	path: "/purchase-return/",
	getParentRoute: () => Route$18
});
var SalesNewRoute = Route$3.update({
	id: "/sales/new",
	path: "/sales/new",
	getParentRoute: () => Route$18
});
var SalesIdRoute = Route$25.update({
	id: "/sales/$id",
	path: "/sales/$id",
	getParentRoute: () => Route$18
});
var SaleReturnNewRoute = Route$2.update({
	id: "/sale-return/new",
	path: "/sale-return/new",
	getParentRoute: () => Route$18
});
var SaleReturnIdRoute = Route$26.update({
	id: "/sale-return/$id",
	path: "/sale-return/$id",
	getParentRoute: () => Route$18
});
var PurchaseNewRoute = Route$1.update({
	id: "/purchase/new",
	path: "/purchase/new",
	getParentRoute: () => Route$18
});
var PurchaseIdRoute = Route$22.update({
	id: "/purchase/$id",
	path: "/purchase/$id",
	getParentRoute: () => Route$18
});
var PurchaseReturnNewRoute = Route.update({
	id: "/purchase-return/new",
	path: "/purchase-return/new",
	getParentRoute: () => Route$18
});
var PurchaseReturnIdRoute = Route$21.update({
	id: "/purchase-return/$id",
	path: "/purchase-return/$id",
	getParentRoute: () => Route$18
});
var PartiesIdRoute = Route$20.update({
	id: "/parties_/$id",
	path: "/parties/$id",
	getParentRoute: () => Route$18
});
var SalesEditIdRoute = Route$27.update({
	id: "/sales/edit/$id",
	path: "/sales/edit/$id",
	getParentRoute: () => Route$18
});
var rootRouteChildren = {
	IndexRoute,
	BankRoute,
	CashRoute,
	DaybookRoute,
	ExpensesRoute,
	GstRoute,
	InventoryRoute,
	ItemsRoute,
	LoginRoute,
	PartiesRoute,
	PaymentsRoute,
	ReportsRoute,
	SettingsRoute,
	PartiesIdRoute,
	PurchaseReturnIdRoute,
	PurchaseReturnNewRoute,
	PurchaseIdRoute,
	PurchaseNewRoute,
	SaleReturnIdRoute,
	SaleReturnNewRoute,
	SalesIdRoute,
	SalesNewRoute,
	PurchaseReturnIndexRoute,
	PurchaseIndexRoute,
	SaleReturnIndexRoute,
	SalesIndexRoute,
	PurchaseEditIdRoute: Route$23.update({
		id: "/purchase/edit/$id",
		path: "/purchase/edit/$id",
		getParentRoute: () => Route$18
	}),
	SalesEditIdRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
