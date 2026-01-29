module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/admin/src/app/layout.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "layout-module__z6tj3q__active",
  "badge": "layout-module__z6tj3q__badge",
  "brandName": "layout-module__z6tj3q__brandName",
  "collapseBtn": "layout-module__z6tj3q__collapseBtn",
  "collapsed": "layout-module__z6tj3q__collapsed",
  "content": "layout-module__z6tj3q__content",
  "header": "layout-module__z6tj3q__header",
  "headerIcon": "layout-module__z6tj3q__headerIcon",
  "headerLeft": "layout-module__z6tj3q__headerLeft",
  "headerRight": "layout-module__z6tj3q__headerRight",
  "layout": "layout-module__z6tj3q__layout",
  "logo": "layout-module__z6tj3q__logo",
  "main": "layout-module__z6tj3q__main",
  "menuButton": "layout-module__z6tj3q__menuButton",
  "navIcon": "layout-module__z6tj3q__navIcon",
  "navLabel": "layout-module__z6tj3q__navLabel",
  "navLink": "layout-module__z6tj3q__navLink",
  "navSection": "layout-module__z6tj3q__navSection",
  "navSectionTitle": "layout-module__z6tj3q__navSectionTitle",
  "open": "layout-module__z6tj3q__open",
  "overlay": "layout-module__z6tj3q__overlay",
  "pageTitle": "layout-module__z6tj3q__pageTitle",
  "sidebar": "layout-module__z6tj3q__sidebar",
  "sidebarFooter": "layout-module__z6tj3q__sidebarFooter",
  "sidebarHeader": "layout-module__z6tj3q__sidebarHeader",
  "sidebarNav": "layout-module__z6tj3q__sidebarNav",
  "userAvatar": "layout-module__z6tj3q__userAvatar",
  "visible": "layout-module__z6tj3q__visible",
});
}),
"[project]/admin/src/lib/adminConfig.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Configuration Admin Temporaire
// TODO: Remplacer par un système de rôles backend après le lancement
/**
 * Liste des emails autorisés à accéder au dashboard admin
 * Cette solution est TEMPORAIRE pour le lancement
 */ __turbopack_context__.s([
    "ADMIN_EMAILS",
    ()=>ADMIN_EMAILS,
    "PUBLIC_ROUTES",
    ()=>PUBLIC_ROUTES,
    "isAdminEmail",
    ()=>isAdminEmail,
    "isPublicRoute",
    ()=>isPublicRoute
]);
const ADMIN_EMAILS = [
    'gammefouad2016@gmail.com',
    'admin@komoralink.com'
];
const isAdminEmail = (email)=>{
    // In local/dev mode, allow any logged in user
    if (!email) return false;
    return true;
// return ADMIN_EMAILS.includes(email.toLowerCase());
};
const PUBLIC_ROUTES = [
    '/docs',
    '/about',
    '/careers',
    '/login'
];
const isPublicRoute = (pathname)=>{
    return PUBLIC_ROUTES.some((route)=>pathname.startsWith(route));
};
}),
"[project]/admin/src/app/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/admin/src/app/layout.module.css [app-ssr] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$adminConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/src/lib/adminConfig.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
// Navigation items for admin sidebar
const navItems = [
    {
        section: 'Supervision',
        items: [
            {
                href: '/dashboard',
                label: 'Vue d\'ensemble',
                icon: '📊'
            },
            {
                href: '/analytics',
                label: 'Analytics',
                icon: '📈'
            },
            {
                href: '/alertes',
                label: 'Alertes',
                icon: '🔔'
            }
        ]
    },
    {
        section: 'Profils Métiers',
        items: [
            {
                href: '/profils/particuliers',
                label: 'Particuliers',
                icon: '👤'
            },
            {
                href: '/profils/commercants',
                label: 'Commerçants',
                icon: '🏪'
            },
            {
                href: '/profils/fournisseurs',
                label: 'Fournisseurs',
                icon: '📦'
            },
            {
                href: '/profils/restaurateurs',
                label: 'Restaurateurs',
                icon: '🍽️'
            },
            {
                href: '/profils/livreurs',
                label: 'Livreurs',
                icon: '🚴'
            }
        ]
    },
    {
        section: 'Public',
        items: [
            {
                href: '/docs',
                label: 'Documentation',
                icon: '📚'
            },
            {
                href: '/about',
                label: 'À Propos',
                icon: '🏛️'
            },
            {
                href: '/careers',
                label: 'Recrutement',
                icon: '💼'
            }
        ]
    },
    {
        section: 'Compte',
        items: [
            {
                href: '/profile',
                label: 'Mon Profil',
                icon: '⚙️'
            }
        ]
    }
];
function AdminLayoutContent({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [sidebarOpen, setSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showUserMenu, setShowUserMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isAuthorized, setIsAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserName(`${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`);
            // Check if user is admin (for non-public pages)
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$adminConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPublicRoute"])(pathname) && pathname !== '/unauthorized' && pathname !== '/') {
                const userEmail = userData.email;
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$adminConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAdminEmail"])(userEmail)) {
                    router.push('/unauthorized');
                    setIsAuthorized(false);
                    return;
                }
            }
            setIsAuthorized(true);
        } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$adminConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPublicRoute"])(pathname) && pathname !== '/unauthorized' && pathname !== '/') {
            // No user logged in and trying to access admin page
            // Redirect to / (public landing page) or /login
            router.push('/login');
            setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    }, [
        pathname,
        router
    ]);
    const handleLogout = ()=>{
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };
    const isActive = (href)=>{
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };
    // Check if current page is public
    const isPublicPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$adminConfig$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isPublicRoute"])(pathname) || pathname === '/unauthorized' || pathname === '/';
    // For public pages, render without admin layout
    if (isPublicPage) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    // Show loading while checking authorization
    if (isAuthorized === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-primary)'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '32px',
                            marginBottom: '16px'
                        },
                        children: "🔒"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Vérification des autorisations..."
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 116,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/admin/src/app/layout.tsx",
            lineNumber: 109,
            columnNumber: 7
        }, this);
    }
    // If not authorized, don't render (redirect is happening)
    if (!isAuthorized) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].layout,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebar} ${collapsed ? __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].collapsed : ''} ${sidebarOpen ? __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].open : ''}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarHeader,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].logo,
                                children: "K"
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/layout.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].brandName,
                                children: [
                                    "KomoraLink",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].badge,
                                        children: "Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/layout.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarNav,
                        children: navItems.map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navSection,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navSectionTitle,
                                        children: section.section
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 144,
                                        columnNumber: 15
                                    }, this),
                                    section.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            href: item.href,
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLink} ${isActive(item.href) ? __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ''}`,
                                            onClick: ()=>setSidebarOpen(false),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navIcon,
                                                    children: item.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/src/app/layout.tsx",
                                                    lineNumber: 152,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLabel,
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/src/app/layout.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, item.href, true, {
                                            fileName: "[project]/admin/src/app/layout.tsx",
                                            lineNumber: 146,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, section.section, true, {
                                fileName: "[project]/admin/src/app/layout.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sidebarFooter,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].collapseBtn,
                            onClick: ()=>setCollapsed(!collapsed),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navIcon,
                                    children: collapsed ? '→' : '←'
                                }, void 0, false, {
                                    fileName: "[project]/admin/src/app/layout.tsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navLabel,
                                    children: "Réduire"
                                }, void 0, false, {
                                    fileName: "[project]/admin/src/app/layout.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/admin/src/app/layout.tsx",
                            lineNumber: 161,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].overlay} ${sidebarOpen ? __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].visible : ''}`,
                onClick: ()=>setSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].main} ${collapsed ? __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].collapsed : ''}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].header,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerLeft,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].menuButton,
                                        onClick: ()=>setSidebarOpen(!sidebarOpen),
                                        children: "☰"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].pageTitle,
                                        children: "Dashboard de Supervision"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/layout.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerRight,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/alertes",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerIcon,
                                        children: "🔔"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/profile",
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].headerIcon,
                                        children: "⚙️"
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 191,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'relative'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setShowUserMenu(!showUserMenu),
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].userAvatar,
                                                style: {
                                                    cursor: 'pointer',
                                                    border: 'none'
                                                },
                                                children: userName || 'AD'
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/layout.tsx",
                                                lineNumber: 193,
                                                columnNumber: 15
                                            }, this),
                                            showUserMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'absolute',
                                                    top: '100%',
                                                    right: 0,
                                                    marginTop: '8px',
                                                    background: 'white',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                    minWidth: '180px',
                                                    zIndex: 100,
                                                    overflow: 'hidden'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/profile",
                                                        onClick: ()=>setShowUserMenu(false),
                                                        style: {
                                                            display: 'block',
                                                            padding: '12px 16px',
                                                            color: 'var(--color-gray-700)',
                                                            textDecoration: 'none',
                                                            fontSize: '14px',
                                                            borderBottom: '1px solid var(--color-gray-100)'
                                                        },
                                                        children: "👤 Mon Profil"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/layout.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleLogout,
                                                        style: {
                                                            width: '100%',
                                                            padding: '12px 16px',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-error)',
                                                            fontSize: '14px',
                                                            textAlign: 'left',
                                                            cursor: 'pointer'
                                                        },
                                                        children: "🚪 Déconnexion"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/layout.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/layout.tsx",
                                                lineNumber: 201,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/layout.tsx",
                                        lineNumber: 192,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/layout.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$app$2f$layout$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].content,
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 248,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/layout.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "fr",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.googleapis.com"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.gstatic.com",
                        crossOrigin: ""
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
                        rel: "stylesheet"
                    }, void 0, false, {
                        fileName: "[project]/admin/src/app/layout.tsx",
                        lineNumber: 262,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AdminLayoutContent, {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/admin/src/app/layout.tsx",
                    lineNumber: 265,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/admin/src/app/layout.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/src/app/layout.tsx",
        lineNumber: 258,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7f564400._.js.map