module.exports = [
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
"[project]/corporate/lib/api/careersApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "careersApi",
    ()=>careersApi
]);
const CAREERS_API_URL = process.env.NEXT_PUBLIC_CAREERS_API_URL || 'http://localhost:3002/api';
const careersApi = {
    // Auth
    async register (payload) {
        const res = await fetch(`${CAREERS_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
        }
        return res.json();
    },
    async login (payload) {
        const res = await fetch(`${CAREERS_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }
        return res.json();
    },
    // Jobs
    async getJobs () {
        const res = await fetch(`${CAREERS_API_URL}/jobs`);
        if (!res.ok) throw new Error('Failed to fetch jobs');
        return res.json();
    },
    async getJob (id) {
        const res = await fetch(`${CAREERS_API_URL}/jobs/${id}`);
        if (!res.ok) throw new Error('Job not found');
        return res.json();
    },
    // Applications
    async submitApplication (payload, token) {
        const res = await fetch(`${CAREERS_API_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Application submission failed');
        }
        return res.json();
    }
};
}),
"[project]/corporate/components/auth/CandidateAuthModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CandidateAuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/lib/api/careersApi.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function CandidateAuthModal({ isOpen, onClose, onSuccess }) {
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('login');
    const { loginCandidate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Form State
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [firstName, setFirstName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [lastName, setLastName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            let response;
            if (mode === 'register') {
                response = await __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["careersApi"].register({
                    email,
                    password,
                    firstName,
                    lastName
                });
            } else {
                response = await __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["careersApi"].login({
                    email,
                    password
                });
            }
            loginCandidate(response.access_token, response.user);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: 'white',
                width: '100%',
                maxWidth: '420px',
                borderRadius: '24px',
                padding: '32px',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            },
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    style: {
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                        size: 24
                    }, void 0, false, {
                        fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                        lineNumber: 74,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                    lineNumber: 70,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        marginBottom: '32px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: '64px',
                                height: '64px',
                                background: 'var(--color-primary-50)',
                                borderRadius: '50%',
                                margin: '0 auto 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-primary)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                size: 32
                            }, void 0, false, {
                                fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                lineNumber: 84,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 79,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            style: {
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: '8px'
                            },
                            children: mode === 'login' ? 'Espace Candidat' : 'Créer un compte'
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 86,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: '#6B7280',
                                fontSize: '15px'
                            },
                            children: mode === 'login' ? 'Connectez-vous pour suivre vos candidatures' : 'Rejoignez le vivier de talents KomoraLink'
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 89,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                    lineNumber: 78,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    },
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '12px 16px',
                                background: '#FEE2E2',
                                borderRadius: '8px',
                                color: '#DC2626',
                                fontSize: '14px'
                            },
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 101,
                            columnNumber: 25
                        }, this),
                        mode === 'register' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Prénom",
                                    required: true,
                                    value: firstName,
                                    onChange: (e)=>setFirstName(e.target.value),
                                    style: inputStyle
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 114,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Nom",
                                    required: true,
                                    value: lastName,
                                    onChange: (e)=>setLastName(e.target.value),
                                    style: inputStyle
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 119,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 113,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                    size: 18,
                                    color: "#9CA3AF",
                                    style: {
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 128,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "email",
                                    placeholder: "Adresse email",
                                    required: true,
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    style: {
                                        ...inputStyle,
                                        paddingLeft: '44px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 129,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 127,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    size: 18,
                                    color: "#9CA3AF",
                                    style: {
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 137,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "password",
                                    placeholder: "Mot de passe",
                                    required: true,
                                    value: password,
                                    onChange: (e)=>setPassword(e.target.value),
                                    style: {
                                        ...inputStyle,
                                        paddingLeft: '44px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 138,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 136,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: isLoading,
                            style: {
                                marginTop: '8px',
                                padding: '14px',
                                borderRadius: '12px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: isLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: isLoading ? 0.7 : 1
                            },
                            children: [
                                isLoading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'S\'inscrire',
                                !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    size: 18
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                                    lineNumber: 153,
                                    columnNumber: 40
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 145,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                    lineNumber: 97,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#6B7280'
                    },
                    children: [
                        mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setMode(mode === 'login' ? 'register' : 'login'),
                            style: {
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-primary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                padding: 0
                            },
                            children: mode === 'login' ? "Créer un compte" : "Se connecter"
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                            lineNumber: 160,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
                    lineNumber: 158,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
            lineNumber: 63,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/corporate/components/auth/CandidateAuthModal.tsx",
        lineNumber: 58,
        columnNumber: 9
    }, this), document.body);
}
const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
};
}),
"[project]/corporate/components/layout/PublicHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PublicHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-ssr] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/components/auth/CandidateAuthModal.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
function PublicHeader({ variant = 'solid' }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCandidateLogin, setShowCandidateLogin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const { komoraUser, candidateUser, logoutKomora, logoutCandidate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])(); // Access auth state
    const isTransparent = variant === 'transparent' && !isMenuOpen;
    const navLinks = [
        {
            href: '/about',
            label: 'À propos'
        },
        {
            href: '/docs',
            label: 'Documentation'
        },
        {
            href: '/careers',
            label: 'Recrutement'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        style: {
            padding: '0 24px',
            height: 'var(--header-height)',
            background: isTransparent ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            borderBottom: isTransparent ? 'none' : '1px solid var(--color-gray-200)',
            transition: 'all 0.3s ease',
            boxShadow: isTransparent ? 'none' : 'var(--shadow-sm)'
        },
        className: "jsx-e71965e3acf3a06b",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 'var(--content-max-width)',
                    margin: '0 auto'
                },
                className: "jsx-e71965e3acf3a06b",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        style: {
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative',
                                width: '240px',
                                height: '60px'
                            },
                            className: "jsx-e71965e3acf3a06b",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                src: isTransparent ? "/logo-white.png" : "/logo-green.png",
                                alt: "KomoraLink Logo",
                                fill: true,
                                style: {
                                    objectFit: 'contain',
                                    objectPosition: 'left center'
                                },
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                lineNumber: 57,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                            lineNumber: 55,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                        lineNumber: 54,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        style: {
                            gap: '30px',
                            alignItems: 'center'
                        },
                        className: "jsx-e71965e3acf3a06b" + " " + "desktop-nav",
                        children: [
                            navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: link.href,
                                    style: {
                                        color: isTransparent ? 'white' : 'var(--color-gray-900)',
                                        textDecoration: 'none',
                                        opacity: pathname.startsWith(link.href) ? 1 : 0.8,
                                        fontWeight: pathname.startsWith(link.href) ? 600 : 400,
                                        fontSize: '15px',
                                        transition: 'opacity 0.2s'
                                    },
                                    children: link.label
                                }, link.href, false, {
                                    fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                    lineNumber: 70,
                                    columnNumber: 25
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '12px',
                                    marginLeft: '12px'
                                },
                                className: "jsx-e71965e3acf3a06b",
                                children: [
                                    (pathname.startsWith('/careers') || candidateUser) && (candidateUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: logoutCandidate,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 12px',
                                            background: 'var(--color-gray-100)',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--color-gray-900)',
                                            border: '1px solid transparent',
                                            cursor: 'pointer'
                                        },
                                        title: "Cliquez pour déconnecter",
                                        className: "jsx-e71965e3acf3a06b",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                                lineNumber: 95,
                                                columnNumber: 37
                                            }, this),
                                            candidateUser.firstName
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                        lineNumber: 85,
                                        columnNumber: 33
                                    }, this) : pathname.startsWith('/careers') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowCandidateLogin(true),
                                        style: {
                                            background: 'none',
                                            border: '1px solid currentColor',
                                            color: isTransparent ? 'white' : 'var(--color-primary)',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        },
                                        className: "jsx-e71965e3acf3a06b",
                                        children: "Espace Candidat"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                        lineNumber: 99,
                                        columnNumber: 33
                                    }, this)),
                                    komoraUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "https://admin.komoralink.com",
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 12px',
                                            background: 'var(--color-primary-50)',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: 'var(--color-primary)',
                                            textDecoration: 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                                lineNumber: 119,
                                                columnNumber: 33
                                            }, this),
                                            "Mon Espace"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                        lineNumber: 114,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                lineNumber: 81,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                        lineNumber: 68,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsMenuOpen(!isMenuOpen),
                        style: {
                            background: 'none',
                            border: 'none',
                            color: isTransparent ? 'white' : 'var(--color-gray-900)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'none'
                        },
                        className: "jsx-e71965e3acf3a06b" + " " + "mobile-menu-btn",
                        children: isMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 28
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                            lineNumber: 139,
                            columnNumber: 35
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                            size: 28
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                            lineNumber: 139,
                            columnNumber: 53
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                        lineNumber: 127,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                lineNumber: 46,
                columnNumber: 13
            }, this),
            isMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    top: '72px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--color-white)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    borderTop: '1px solid var(--color-gray-200)',
                    zIndex: 99
                },
                className: "jsx-e71965e3acf3a06b",
                children: [
                    navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: link.href,
                            onClick: ()=>setIsMenuOpen(false),
                            style: {
                                color: 'var(--color-gray-900)',
                                textDecoration: 'none',
                                fontSize: '18px',
                                fontWeight: '600',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'var(--color-gray-50)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            children: [
                                link.label,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    size: 20,
                                    color: "var(--color-gray-400)"
                                }, void 0, false, {
                                    fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                    lineNumber: 178,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, link.href, true, {
                            fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                            lineNumber: 160,
                            columnNumber: 25
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        },
                        className: "jsx-e71965e3acf3a06b",
                        children: [
                            !candidateUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setIsMenuOpen(false);
                                    setShowCandidateLogin(true);
                                },
                                style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'var(--color-gray-100)',
                                    border: 'none',
                                    fontWeight: 'bold'
                                },
                                className: "jsx-e71965e3acf3a06b",
                                children: "Espace Candidat"
                            }, void 0, false, {
                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                lineNumber: 184,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: logoutCandidate,
                                style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: '#FEE2E2',
                                    color: '#EF4444',
                                    border: 'none',
                                    fontWeight: 'bold'
                                },
                                className: "jsx-e71965e3acf3a06b",
                                children: "Déconnexion Candidat"
                            }, void 0, false, {
                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                lineNumber: 191,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "https://admin.komoralink.com/login",
                                style: {
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                },
                                className: "jsx-e71965e3acf3a06b",
                                children: "Connexion KomoraLink"
                            }, void 0, false, {
                                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                                lineNumber: 193,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                        lineNumber: 182,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                lineNumber: 145,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showCandidateLogin,
                onClose: ()=>setShowCandidateLogin(false)
            }, void 0, false, {
                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                lineNumber: 200,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "e71965e3acf3a06b",
                children: "@media (width<=768px){.desktop-nav.jsx-e71965e3acf3a06b{display:none!important}.mobile-menu-btn.jsx-e71965e3acf3a06b{display:block!important}}@media (width>=769px){.desktop-nav.jsx-e71965e3acf3a06b{display:flex!important}.mobile-menu-btn.jsx-e71965e3acf3a06b{display:none!important}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, this);
}
}),
"[project]/corporate/lib/api/komoraApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getKomoraProfile",
    ()=>getKomoraProfile,
    "loginKomoraLink",
    ()=>loginKomoraLink
]);
// KomoraLink API client for Corporate site
// Uses the main KomoraLink backend for user authentication
const KOMORALINK_API_URL = process.env.NEXT_PUBLIC_KOMORALINK_API_URL || 'https://dash.fortibtech.com';
async function loginKomoraLink(email, password) {
    const response = await fetch(`${KOMORALINK_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(()=>({}));
        if (response.status === 401) {
            if (errorData?.message === "Veuillez d'abord vérifier votre e-mail.") {
                throw new Error("Veuillez d'abord vérifier votre e-mail.");
            }
            throw new Error('Identifiants invalides');
        }
        throw new Error(errorData?.message || 'Erreur de connexion');
    }
    return response.json();
}
async function getKomoraProfile(token) {
    const response = await fetch(`${KOMORALINK_API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Impossible de récupérer le profil');
    }
    return response.json();
}
}),
"[project]/corporate/app/docs/docs.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "docs-module__wSMEuW__active",
  "brand": "docs-module__wSMEuW__brand",
  "brandDocs": "docs-module__wSMEuW__brandDocs",
  "brandName": "docs-module__wSMEuW__brandName",
  "callout": "docs-module__wSMEuW__callout",
  "calloutContent": "docs-module__wSMEuW__calloutContent",
  "calloutTitle": "docs-module__wSMEuW__calloutTitle",
  "cardDescription": "docs-module__wSMEuW__cardDescription",
  "cardIcon": "docs-module__wSMEuW__cardIcon",
  "cardTitle": "docs-module__wSMEuW__cardTitle",
  "cardsGrid": "docs-module__wSMEuW__cardsGrid",
  "docCard": "docs-module__wSMEuW__docCard",
  "docDescription": "docs-module__wSMEuW__docDescription",
  "docSection": "docs-module__wSMEuW__docSection",
  "docTitle": "docs-module__wSMEuW__docTitle",
  "docsContent": "docs-module__wSMEuW__docsContent",
  "docsFooter": "docs-module__wSMEuW__docsFooter",
  "docsHeader": "docs-module__wSMEuW__docsHeader",
  "docsLayout": "docs-module__wSMEuW__docsLayout",
  "docsMain": "docs-module__wSMEuW__docsMain",
  "docsSidebar": "docs-module__wSMEuW__docsSidebar",
  "footerContent": "docs-module__wSMEuW__footerContent",
  "footerLink": "docs-module__wSMEuW__footerLink",
  "footerLinks": "docs-module__wSMEuW__footerLinks",
  "footerText": "docs-module__wSMEuW__footerText",
  "headerContent": "docs-module__wSMEuW__headerContent",
  "headerNav": "docs-module__wSMEuW__headerNav",
  "logo": "docs-module__wSMEuW__logo",
  "navLink": "docs-module__wSMEuW__navLink",
  "searchBox": "docs-module__wSMEuW__searchBox",
  "searchIcon": "docs-module__wSMEuW__searchIcon",
  "searchInput": "docs-module__wSMEuW__searchInput",
  "sectionContent": "docs-module__wSMEuW__sectionContent",
  "sectionTitle": "docs-module__wSMEuW__sectionTitle",
  "sidebarLink": "docs-module__wSMEuW__sidebarLink",
  "sidebarSection": "docs-module__wSMEuW__sidebarSection",
  "sidebarTitle": "docs-module__wSMEuW__sidebarTitle",
  "storeButton": "docs-module__wSMEuW__storeButton",
  "storeButtons": "docs-module__wSMEuW__storeButtons",
  "storeName": "docs-module__wSMEuW__storeName",
  "storeSubtext": "docs-module__wSMEuW__storeSubtext",
  "storeText": "docs-module__wSMEuW__storeText",
  "table": "docs-module__wSMEuW__table",
  "toc": "docs-module__wSMEuW__toc",
  "tocLink": "docs-module__wSMEuW__tocLink",
  "tocTitle": "docs-module__wSMEuW__tocTitle",
});
}),
"[project]/corporate/app/docs/full/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FullDocsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/components/layout/PublicHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$komoraApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/lib/api/komoraApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/corporate/app/docs/docs.module.css [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
function FullDocsPage() {
    const { komoraUser, isKomoraLoading, loginKomora } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isLogging, setIsLogging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleLogin = async (e)=>{
        e.preventDefault();
        setError('');
        setIsLogging(true);
        try {
            // Call KomoraLink API
            const { access_token } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$komoraApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loginKomoraLink"])(email, password);
            // Get user profile
            const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$komoraApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getKomoraProfile"])(access_token);
            // Store in context
            loginKomora(access_token, {
                id: profile.id,
                email: profile.email,
                firstName: profile.firstName,
                profileType: profile.profileType
            });
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally{
            setIsLogging(false);
        }
    };
    // Show loading state while checking auth
    if (isKomoraLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                paddingTop: '80px',
                minHeight: '100vh',
                background: '#F9FAFB'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                    lineNumber: 47,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docsMain,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            padding: '60px 20px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Chargement..."
                        }, void 0, false, {
                            fileName: "[project]/corporate/app/docs/full/page.tsx",
                            lineNumber: 50,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 49,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                    lineNumber: 48,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/corporate/app/docs/full/page.tsx",
            lineNumber: 46,
            columnNumber: 13
        }, this);
    }
    // Show login form if not authenticated
    if (!komoraUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                paddingTop: '80px',
                minHeight: '100vh',
                background: '#F9FAFB'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                    lineNumber: 61,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docsMain,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            maxWidth: '420px',
                            margin: '40px auto',
                            padding: '40px',
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: 'center',
                                    marginBottom: '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '48px',
                                            marginBottom: '16px'
                                        },
                                        children: "🔐"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 72,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        style: {
                                            fontSize: '1.5rem',
                                            marginBottom: '8px',
                                            color: 'var(--color-gray-900)'
                                        },
                                        children: "Documentation Complète"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 73,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: 'var(--color-gray-600)',
                                            fontSize: '14px',
                                            lineHeight: 1.5
                                        },
                                        children: "Connectez-vous avec votre compte KomoraLink pour accéder à la documentation complète."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 76,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 71,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleLogin,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: 'var(--color-gray-700)'
                                                },
                                                children: "Email"
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "email",
                                                value: email,
                                                onChange: (e)=>setEmail(e.target.value),
                                                required: true,
                                                placeholder: "votre@email.com",
                                                style: {
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--color-gray-300)',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    boxSizing: 'border-box'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 86,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 82,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: 'var(--color-gray-700)'
                                                },
                                                children: "Mot de passe"
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 106,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "password",
                                                value: password,
                                                onChange: (e)=>setPassword(e.target.value),
                                                required: true,
                                                placeholder: "••••••••",
                                                style: {
                                                    width: '100%',
                                                    padding: '12px 14px',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--color-gray-300)',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    boxSizing: 'border-box'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 109,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 105,
                                        columnNumber: 29
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '12px',
                                            marginBottom: '16px',
                                            background: '#FEE2E2',
                                            borderRadius: '8px',
                                            color: '#DC2626',
                                            fontSize: '14px',
                                            textAlign: 'center'
                                        },
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 129,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: isLogging,
                                        style: {
                                            width: '100%',
                                            padding: '14px',
                                            background: isLogging ? 'var(--color-gray-400)' : 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: isLogging ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.2s'
                                        },
                                        children: isLogging ? 'Connexion...' : 'Se connecter'
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 142,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 81,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '24px',
                                    textAlign: 'center'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/docs",
                                    style: {
                                        color: 'var(--color-gray-600)',
                                        fontSize: '14px',
                                        textDecoration: 'none'
                                    },
                                    children: "← Retour à la documentation publique"
                                }, void 0, false, {
                                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                                    lineNumber: 163,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 162,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '24px',
                                    paddingTop: '24px',
                                    borderTop: '1px solid var(--color-gray-200)',
                                    textAlign: 'center'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        color: 'var(--color-gray-500)'
                                    },
                                    children: [
                                        "Pas encore de compte ?",
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "https://web.komoralink.com",
                                            style: {
                                                color: 'var(--color-primary)',
                                                fontWeight: 600,
                                                textDecoration: 'none'
                                            },
                                            children: "Inscrivez-vous sur KomoraLink"
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/docs/full/page.tsx",
                                            lineNumber: 183,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 175,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 63,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                    lineNumber: 62,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/corporate/app/docs/full/page.tsx",
            lineNumber: 60,
            columnNumber: 13
        }, this);
    }
    // Full documentation for authenticated users
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            paddingTop: '80px',
            minHeight: '100vh',
            background: '#F9FAFB'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/corporate/app/docs/full/page.tsx",
                lineNumber: 197,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docsMain,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docTitle,
                                        style: {
                                            marginBottom: '8px'
                                        },
                                        children: "Documentation Officielle"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docDescription,
                                        style: {
                                            margin: 0
                                        },
                                        children: "Centre de ressources pour tous les utilisateurs de l'écosystème KomoraLink."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 201,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '8px 16px',
                                    background: 'var(--color-primary-50)',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    color: 'var(--color-primary)',
                                    fontWeight: 500
                                },
                                children: [
                                    "👋 ",
                                    komoraUser.firstName
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 207,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 200,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].callout,
                        style: {
                            marginBottom: '32px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutTitle,
                                children: "✅ Accès complet activé"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 220,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutContent,
                                children: "Vous avez accès à l'ensemble de la documentation KomoraLink."
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 221,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 219,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            marginBottom: '40px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#particulier",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "👤 Particulier"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 228,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#commercant",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "🏪 Commerçant"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 229,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#restaurateur",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "🍽️ Restaurateur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 230,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#livreur",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "🚴 Livreur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 231,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#fournisseur",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "📦 Fournisseur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 232,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "#wallet",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].tocLink,
                                children: "💰 Wallet"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 233,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 227,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "particulier",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "👤 Profil Particulier"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 238,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Le profil standard pour explorer, acheter et consommer sur la plateforme."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "5.1 Accueil - Exploration"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 242,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].table,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Action"
                                                        }, void 0, false, {
                                                            fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                            lineNumber: 245,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Comment faire"
                                                        }, void 0, false, {
                                                            fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                            lineNumber: 245,
                                                            columnNumber: 52
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Résultat"
                                                        }, void 0, false, {
                                                            fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                            lineNumber: 245,
                                                            columnNumber: 74
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 244,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Rechercher"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 248,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Tapez dans la barre de recherche"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 248,
                                                                columnNumber: 56
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Suggestions en temps réel"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 248,
                                                                columnNumber: 97
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Voir la carte"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 249,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Icône carte"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 249,
                                                                columnNumber: 59
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Commerces autour de vous"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 249,
                                                                columnNumber: 79
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Ajouter au panier"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Bouton dans les détails"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 63
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: "Produit ajouté"
                                                            }, void 0, false, {
                                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 95
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 247,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "5.2 Suivi des commandes"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 254,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: 'Suivez l\'état de vos achats en temps réel depuis le menu "Mes Commandes".'
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 239,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 237,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "commercant",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "🏪 Profil Commerçant"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 261,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Pour les boutiques physiques et vendeurs en ligne."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "6.1 Gestion du Catalogue"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 264,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Ajoutez vos produits avec photos, descriptions et variantes (taille, couleur). Gérez vos stocks en temps réel pour éviter les ruptures."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 265,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "6.2 Ventes & Commandes"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 266,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Recevez une notification instantanée à chaque commande. Validez-la pour déclencher la recherche d'un livreur."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 267,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 262,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 260,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "restaurateur",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "🍽️ Profil Restaurateur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 273,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Spécialement conçu pour les restaurants, snacks et traiteurs."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "7.1 Gestion des Menus"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Création de plats :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Ajoutez des photos appétissantes, descriptions et prix."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 279,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Options :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Gérez les suppléments (sauces, boissons) et variations."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 280,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Disponibilité :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 281,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Activez/Désactivez un plat selon les stocks du jour."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 278,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "7.2 Flux de Cuisine"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 284,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Le dashboard présente les commandes en 3 étapes :"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 285,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "À confirmer :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Nouvelle commande entrante."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 287,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "En préparation :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 288,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Envoi en cuisine. Le livreur est notifié."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 288,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Prête à enlever :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 289,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Le livreur peut récupérer la commande."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 286,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 274,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 272,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "livreur",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "🚴 Profil Livreur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 296,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Pour les professionnels de la logistique urbaine."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 298,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "8.1 Réception des courses"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 300,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "Activez votre statut ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: '"En ligne"'
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 301,
                                                columnNumber: 49
                                            }, this),
                                            " pour recevoir des propositions de livraison autour de vous."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 301,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].callout,
                                        style: {
                                            background: '#f0f9ff',
                                            borderColor: '#0ea5e9'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutTitle,
                                                children: "💡 Astuce"
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 303,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutContent,
                                                children: "Acceptez rapidement les courses pour augmenter votre score de fiabilité."
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 304,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 302,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "8.2 Processus de Livraison"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 307,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Pickup :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 309,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Rendez-vous chez le commerçant/restaurateur. Scannez le code ou validez le retrait."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 309,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Trajet :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 310,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Utilisez la navigation intégrée pour rejoindre le client."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 310,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Drop-off :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 311,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Validez la livraison avec le client (Code sécurisé ou signature)."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 311,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 308,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "8.3 Gains"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 314,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Vos gains sont crédités instantanément sur votre Wallet après chaque course terminée."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 297,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 295,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "fournisseur",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "📦 Profil Fournisseur"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 321,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Pour les grossistes et producteurs vendant aux professionnels (B2B)."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 323,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "9.1 Catalogue B2B"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 325,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Vos produits ne sont visibles que par les Commerçants et Restaurateurs vérifiés. Vous pouvez définir des minimums de commande (Colisage)."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 326,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "9.2 Facturation"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 328,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Générez automatiquement vos factures et bons de livraison depuis la plateforme."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 329,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 322,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 320,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].docSection,
                        id: "wallet",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                children: "💰 Module Wallet"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 335,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Le portefeuille partagé pour toutes vos activités."
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 337,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].callout,
                                        style: {
                                            borderLeftColor: 'var(--color-error)',
                                            background: 'rgba(239, 68, 68, 0.1)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutTitle,
                                                children: "🚨 Unicité du Compte"
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 340,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutContent,
                                                children: "Un seul Wallet pour tous vos profils. Si vous êtes à la fois Livreur et Particulier, c'est la même cagnotte."
                                            }, void 0, false, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 341,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 339,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: "Dépôt & Retrait"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 346,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "KARTAPAY :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Intégration native Mobile Money (Orange, Telma)."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 348,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: "Stripe :"
                                                    }, void 0, false, {
                                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 33
                                                    }, this),
                                                    " Pour les cartes bancaires internationales."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                                lineNumber: 349,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                                        lineNumber: 347,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 336,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 334,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].callout,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutTitle,
                                children: "📚 Documentation officielle KomoraLink"
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 355,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$docs$2f$docs$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].calloutContent,
                                children: "Besoin d'aide supplémentaire ? Contactez le support via l'application."
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/docs/full/page.tsx",
                                lineNumber: 356,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/corporate/app/docs/full/page.tsx",
                        lineNumber: 354,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/corporate/app/docs/full/page.tsx",
                lineNumber: 199,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/corporate/app/docs/full/page.tsx",
        lineNumber: 196,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e698ffaa._.js.map