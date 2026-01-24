(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/corporate/lib/api/careersApi.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "careersApi",
    ()=>careersApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/corporate/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const CAREERS_API_URL = __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_CAREERS_API_URL || 'http://localhost:3002/api';
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/corporate/components/auth/CandidateAuthModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CandidateAuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/lib/api/careersApi.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function CandidateAuthModal({ isOpen, onClose, onSuccess }) {
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('login');
    const { loginCandidate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Form State
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [firstName, setFirstName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [lastName, setLastName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            let response;
            if (mode === 'register') {
                response = await __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["careersApi"].register({
                    email,
                    password,
                    firstName,
                    lastName
                });
            } else {
                response = await __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["careersApi"].login({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPortal"])(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        marginBottom: '32px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    },
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        mode === 'register' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#6B7280'
                    },
                    children: [
                        mode === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
_s(CandidateAuthModal, "0WK68S2NDJjBg9xjWQu3C0Etyqw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = CandidateAuthModal;
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
var _c;
__turbopack_context__.k.register(_c, "CandidateAuthModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/corporate/components/layout/PublicHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PublicHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/corporate/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/components/auth/CandidateAuthModal.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function PublicHeader({ variant = 'solid' }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showCandidateLogin, setShowCandidateLogin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { komoraUser, candidateUser, logoutKomora, logoutCandidate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])(); // Access auth state
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        style: {
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative',
                                width: '240px',
                                height: '60px'
                            },
                            className: "jsx-e71965e3acf3a06b",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        style: {
                            gap: '30px',
                            alignItems: 'center'
                        },
                        className: "jsx-e71965e3acf3a06b" + " " + "desktop-nav",
                        children: [
                            navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '12px',
                                    marginLeft: '12px'
                                },
                                className: "jsx-e71965e3acf3a06b",
                                children: [
                                    (pathname.startsWith('/careers') || candidateUser) && (candidateUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
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
                                    }, this) : pathname.startsWith('/careers') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                    komoraUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        children: isMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 28
                        }, void 0, false, {
                            fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                            lineNumber: 139,
                            columnNumber: 35
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
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
            isMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    navLinks.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        },
                        className: "jsx-e71965e3acf3a06b",
                        children: [
                            !candidateUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showCandidateLogin,
                onClose: ()=>setShowCandidateLogin(false)
            }, void 0, false, {
                fileName: "[project]/corporate/components/layout/PublicHeader.tsx",
                lineNumber: 200,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_s(PublicHeader, "PFbvMfe3Di3qeXyOMPIw6RUM+nQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = PublicHeader;
var _c;
__turbopack_context__.k.register(_c, "PublicHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/corporate/app/careers/careers.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "accent": "careers-module__6jVekW__accent",
  "active": "careers-module__6jVekW__active",
  "applyBtn": "careers-module__6jVekW__applyBtn",
  "closeBtn": "careers-module__6jVekW__closeBtn",
  "departmentBadge": "careers-module__6jVekW__departmentBadge",
  "emailCta": "careers-module__6jVekW__emailCta",
  "emailLink": "careers-module__6jVekW__emailLink",
  "emptyLink": "careers-module__6jVekW__emptyLink",
  "emptyState": "careers-module__6jVekW__emptyState",
  "fadeIn": "careers-module__6jVekW__fadeIn",
  "filterBtn": "careers-module__6jVekW__filterBtn",
  "filtersContainer": "careers-module__6jVekW__filtersContainer",
  "hero": "careers-module__6jVekW__hero",
  "heroContent": "careers-module__6jVekW__heroContent",
  "heroDescription": "careers-module__6jVekW__heroDescription",
  "heroTitle": "careers-module__6jVekW__heroTitle",
  "jobCard": "careers-module__6jVekW__jobCard",
  "jobDescription": "careers-module__6jVekW__jobDescription",
  "jobMeta": "careers-module__6jVekW__jobMeta",
  "jobTitle": "careers-module__6jVekW__jobTitle",
  "jobsGrid": "careers-module__6jVekW__jobsGrid",
  "modalContent": "careers-module__6jVekW__modalContent",
  "modalOverlay": "careers-module__6jVekW__modalOverlay",
  "modalSubtitle": "careers-module__6jVekW__modalSubtitle",
  "modalTitle": "careers-module__6jVekW__modalTitle",
  "slideUp": "careers-module__6jVekW__slideUp",
  "tag": "careers-module__6jVekW__tag",
  "tags": "careers-module__6jVekW__tags",
});
}),
"[project]/corporate/app/careers/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CareersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/components/layout/PublicHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/corporate/app/careers/careers.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/components/auth/CandidateAuthModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/corporate/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const jobPositions = [
    // Commercial
    {
        id: 'com-1',
        title: 'Responsable Commercial Comores',
        department: 'commercial',
        type: 'CDI',
        location: 'Moroni, Comores',
        description: 'Développer notre réseau de partenaires commerciaux.',
        requirements: [
            'Vente B2B',
            'Réseau local',
            'Autonomie'
        ],
        isRemote: false
    },
    {
        id: 'com-2',
        title: 'Business Developer Diaspora',
        department: 'commercial',
        type: 'CDI',
        location: 'Paris, France',
        description: 'Cibler et convertir la diaspora comorienne.',
        requirements: [
            'Chasseur',
            'Evénementiel',
            'Bilingue'
        ],
        isRemote: true
    },
    // Marketing
    {
        id: 'mkt-1',
        title: 'Community Manager',
        department: 'marketing',
        type: 'CDD',
        location: 'Remote',
        description: 'Animer nos communautés sur les réseaux sociaux.',
        requirements: [
            'Social Media',
            'Copywriting',
            'Créatif'
        ],
        isRemote: true
    },
    // Tech
    {
        id: 'tech-1',
        title: 'Développeur React Native',
        department: 'tech',
        type: 'CDI',
        location: 'Remote',
        description: 'Développement mobile cross-platform.',
        requirements: [
            'React Native',
            'TypeScript',
            'Expo'
        ],
        isRemote: true
    },
    {
        id: 'tech-2',
        title: 'Développeur Backend NestJS',
        department: 'tech',
        type: 'CDI',
        location: 'Remote',
        description: 'Architecture et API.',
        requirements: [
            'NestJS',
            'PostgreSQL',
            'Prisma'
        ],
        isRemote: true
    }
];
;
;
function CareersPage() {
    _s();
    const [selectedJob, setSelectedJob] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [showApplyModal, setShowApplyModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showAuthModal, setShowAuthModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // Local auth modal state
    const { candidateUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const filteredJobs = filter === 'all' ? jobPositions : jobPositions.filter((job)=>job.department === filter);
    const handleApplyClick = (job)=>{
        setSelectedJob(job);
        if (candidateUser) {
            setShowApplyModal(true);
            setFormData({
                name: candidateUser.firstName + ' ' + candidateUser.lastName,
                email: candidateUser.email,
                phone: '',
                message: ''
            });
        } else {
            setShowAuthModal(true);
        }
    };
    const handleAuthSuccess = ()=>{
        // Called when user successfully logs in via the modal
        setShowApplyModal(true);
    // Pre-fill data if available (though context update might be async, usually fast enough for React state)
    // We'll trust the user fills it or we can fetch context again if needed inside the modal
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!selectedJob) return;
        // Construct the email body with form data
        const subject = encodeURIComponent(`Candidature: ${selectedJob.title} - ${formData.name}`);
        const bodyContent = `
Candidature pour le poste : ${selectedJob.title}

--- INFORMATIONS CANDIDAT ---
Nom : ${formData.name}
Email : ${formData.email}
Téléphone : ${formData.phone}

--- MOTIVATION ---
${formData.message}

------------------------------------------------
⚠️ IMPORTANT : Veuillez joindre votre CV à cet email avant d'envoyer.
------------------------------------------------
        `.trim();
        const body = encodeURIComponent(bodyContent);
        // Open default mail client
        window.location.href = `mailto:jobs@komoralink.com?subject=${subject}&body=${body}`;
        // Close modal after a delay to let the action happen
        setTimeout(()=>setShowApplyModal(false), 1000);
    };
    const handleMailto = ()=>{
        if (!selectedJob) return;
        const subject = encodeURIComponent(`Candidature: ${selectedJob.title}`);
        const body = encodeURIComponent(`Bonjour,\n\nJe souhaite postuler au poste de ${selectedJob.title}.\n\nVeuillez trouver ci-joint mon CV.\n\nCordialement,`);
        window.location.href = `mailto:jobs@komoralink.com?subject=${subject}&body=${body}`;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: 'var(--color-gray-50)',
            minHeight: '100vh',
            paddingTop: '70px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$layout$2f$PublicHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 153,
                columnNumber: 13
            }, this),
            showApplyModal && selectedJob && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)',
                    padding: '24px'
                },
                onClick: ()=>setShowApplyModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: 'white',
                        padding: '32px',
                        borderRadius: '24px',
                        maxWidth: '550px',
                        width: '100%',
                        position: 'relative',
                        boxShadow: 'var(--shadow-xl)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '4px'
                                    },
                                    children: "Postuler"
                                }, void 0, false, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: '#6B7280'
                                    },
                                    children: [
                                        "Poste : ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--color-primary)'
                                            },
                                            children: selectedJob.title
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 185,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/app/careers/page.tsx",
                            lineNumber: 180,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                textTransform: 'uppercase',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#6B7280',
                                                marginBottom: '6px'
                                            },
                                            children: [
                                                "Nom complet ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#EF4444'
                                                    },
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 191,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            required: true,
                                            type: "text",
                                            placeholder: "Votre Nom et Prénom",
                                            value: formData.name,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    name: e.target.value
                                                }),
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                outline: 'none',
                                                transition: 'border-color 0.2s'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 190,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        textTransform: 'uppercase',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        color: '#6B7280',
                                                        marginBottom: '6px'
                                                    },
                                                    children: [
                                                        "Email ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#EF4444'
                                                            },
                                                            children: "*"
                                                        }, void 0, false, {
                                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                                            lineNumber: 216,
                                                            columnNumber: 47
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    required: true,
                                                    type: "email",
                                                    placeholder: "email@exemple.com",
                                                    value: formData.email,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            email: e.target.value
                                                        }),
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        background: '#F9FAFB',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '12px',
                                                        fontSize: '15px',
                                                        outline: 'none'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 214,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        textTransform: 'uppercase',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        color: '#6B7280',
                                                        marginBottom: '6px'
                                                    },
                                                    children: [
                                                        "Téléphone ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#EF4444'
                                                            },
                                                            children: "*"
                                                        }, void 0, false, {
                                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                                            lineNumber: 237,
                                                            columnNumber: 51
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    required: true,
                                                    type: "tel",
                                                    placeholder: "+269 ...",
                                                    value: formData.phone,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            phone: e.target.value
                                                        }),
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        background: '#F9FAFB',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '12px',
                                                        fontSize: '15px',
                                                        outline: 'none'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 235,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 213,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                textTransform: 'uppercase',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#6B7280',
                                                marginBottom: '6px'
                                            },
                                            children: [
                                                "Message / Motivation ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#EF4444'
                                                    },
                                                    children: "*"
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 58
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 259,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            required: true,
                                            rows: 4,
                                            placeholder: "Présentez-vous en quelques lignes...",
                                            value: formData.message,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    message: e.target.value
                                                }),
                                            style: {
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                minHeight: '100px',
                                                fontFamily: 'inherit'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 262,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 258,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#F3F4F6',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        color: '#4B5563',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        lineHeight: '1.5'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '18px'
                                            },
                                            children: "ℹ️"
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 294,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                "Votre client mail s'ouvrira avec ces infos.",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "N'oubliez pas de joindre votre CV"
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 37
                                                }, this),
                                                " avant d'envoyer à ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: 'var(--color-primary)',
                                                        fontWeight: '600'
                                                    },
                                                    children: "jobs@komoralink.com"
                                                }, void 0, false, {
                                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 106
                                                }, this),
                                                "."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 295,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 283,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    style: {
                                        width: '100%',
                                        padding: '16px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(27, 184, 116, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    },
                                    children: [
                                        "Continuer ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                opacity: 0.8
                                            },
                                            children: "→"
                                        }, void 0, false, {
                                            fileName: "[project]/corporate/app/careers/page.tsx",
                                            lineNumber: 319,
                                            columnNumber: 43
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 302,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/app/careers/page.tsx",
                            lineNumber: 189,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setShowApplyModal(false),
                            style: {
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: '#F3F4F6',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                color: '#6B7280',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/corporate/app/careers/page.tsx",
                            lineNumber: 323,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/corporate/app/careers/page.tsx",
                    lineNumber: 168,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 157,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hero,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroContent,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTitle,
                            children: [
                                "Rejoignez ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].accent,
                                    children: "l'aventure"
                                }, void 0, false, {
                                    fileName: "[project]/corporate/app/careers/page.tsx",
                                    lineNumber: 346,
                                    columnNumber: 35
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/corporate/app/careers/page.tsx",
                            lineNumber: 345,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroDescription,
                            children: "Construisons ensemble le futur du commerce aux Comores. Talents passionnés bienvenus."
                        }, void 0, false, {
                            fileName: "[project]/corporate/app/careers/page.tsx",
                            lineNumber: 348,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/corporate/app/careers/page.tsx",
                    lineNumber: 344,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 343,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filtersContainer,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFilter('all'),
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterBtn} ${filter === 'all' ? __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                        children: "Tous"
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 357,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFilter('commercial'),
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterBtn} ${filter === 'commercial' ? __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                        children: "Commercial"
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 363,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFilter('marketing'),
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterBtn} ${filter === 'marketing' ? __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                        children: "Marketing"
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 369,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFilter('tech'),
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterBtn} ${filter === 'tech' ? __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                        children: "Tech"
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 375,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 356,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].jobsGrid,
                children: filteredJobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].jobCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].departmentBadge,
                                children: [
                                    job.department,
                                    " • ",
                                    job.type
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 387,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].jobTitle,
                                children: job.title
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 391,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].jobMeta,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "📍 ",
                                            job.location
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/corporate/app/careers/page.tsx",
                                        lineNumber: 394,
                                        columnNumber: 29
                                    }, this),
                                    job.isRemote && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'var(--color-primary)'
                                        },
                                        children: "• Remote"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/careers/page.tsx",
                                        lineNumber: 395,
                                        columnNumber: 46
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 393,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].jobDescription,
                                children: job.description
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 398,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tags,
                                children: job.requirements.map((req, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tag,
                                        children: req
                                    }, idx, false, {
                                        fileName: "[project]/corporate/app/careers/page.tsx",
                                        lineNumber: 402,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 400,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleApplyClick(job),
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].applyBtn,
                                style: {
                                    background: 'var(--color-gray-900)'
                                },
                                children: [
                                    "Postuler maintenant ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/corporate/app/careers/page.tsx",
                                        lineNumber: 411,
                                        columnNumber: 49
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/corporate/app/careers/page.tsx",
                                lineNumber: 406,
                                columnNumber: 25
                            }, this)
                        ]
                    }, job.id, true, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 386,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 384,
                columnNumber: 13
            }, this),
            filteredJobs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyState,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Aucun poste disponible dans cette catégorie."
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 419,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setFilter('all'),
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$app$2f$careers$2f$careers$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emptyLink,
                        children: "Voir toutes les offres"
                    }, void 0, false, {
                        fileName: "[project]/corporate/app/careers/page.tsx",
                        lineNumber: 420,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 418,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$components$2f$auth$2f$CandidateAuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showAuthModal,
                onClose: ()=>setShowAuthModal(false),
                onSuccess: handleAuthSuccess
            }, void 0, false, {
                fileName: "[project]/corporate/app/careers/page.tsx",
                lineNumber: 426,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/corporate/app/careers/page.tsx",
        lineNumber: 152,
        columnNumber: 9
    }, this);
}
_s(CareersPage, "BMB4oa7VtYoNLZd5rNLK+vRE45E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$corporate$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = CareersPage;
var _c;
__turbopack_context__.k.register(_c, "CareersPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=corporate_e12a3b92._.js.map