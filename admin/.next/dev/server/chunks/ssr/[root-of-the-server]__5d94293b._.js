module.exports = [
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/admin/src/lib/api/careersApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyToJob",
    ()=>applyToJob,
    "careersApi",
    ()=>careersApi,
    "createJob",
    ()=>createJob,
    "deleteJob",
    ()=>deleteJob,
    "getJobs",
    ()=>getJobs,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register,
    "updateJob",
    ()=>updateJob
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
const CAREERS_API_URL = process.env.NEXT_PUBLIC_CAREERS_API_URL || 'http://localhost:8081/api';
const careersApi = __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: CAREERS_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
// Add interceptor to include token
careersApi.interceptors.request.use((config)=>{
    const token = localStorage.getItem('candidate_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
const login = async (email, pass)=>{
    const res = await careersApi.post('/auth/login', {
        email,
        password: pass
    });
    if (res.data.access_token) {
        localStorage.setItem('candidate_token', res.data.access_token);
    }
    return res.data;
};
const register = async (email, pass)=>{
    const res = await careersApi.post('/auth/register', {
        email,
        password: pass
    });
    return res.data;
};
const logout = ()=>{
    localStorage.removeItem('candidate_token');
};
const getJobs = async ()=>{
    try {
        const response = await careersApi.get('/jobs');
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
};
const applyToJob = async (jobId, candidate)=>{
    return await careersApi.post(`/jobs/${jobId}/apply`, candidate);
};
const createJob = async (data)=>{
    return await careersApi.post('/jobs', data);
};
const updateJob = async (id, data)=>{
    return await careersApi.patch(`/jobs/${id}`, data);
};
const deleteJob = async (id)=>{
    return await careersApi.delete(`/jobs/${id}`);
};
}),
"[project]/admin/src/app/dashboard/careers/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CareersManagementPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/src/lib/api/careersApi.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function CareersManagementPage() {
    const [jobs, setJobs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingJob, setEditingJob] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        title: '',
        department: 'commercial',
        location: '',
        type: 'CDI',
        description: '',
        requirements: '',
        isActive: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchJobs();
    }, []);
    const fetchJobs = async ()=>{
        setIsLoading(true);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getJobs"])();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally{
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            if (editingJob) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateJob"])(editingJob.id, formData);
            } else {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJob"])(formData);
            }
            setIsModalOpen(false);
            setEditingJob(null);
            resetForm();
            fetchJobs();
        } catch (error) {
            alert('Erreur lors de l\'enregistrement');
            console.error(error);
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$src$2f$lib$2f$api$2f$careersApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteJob"])(id);
            fetchJobs();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };
    const openEdit = (job)=>{
        setEditingJob(job);
        setFormData({
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description,
            // Handle requirements: if it comes as array (legacy?) join it, if string keep it
            requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
            isActive: job.isActive
        });
        setIsModalOpen(true);
    };
    const openCreate = ()=>{
        setEditingJob(null);
        resetForm();
        setIsModalOpen(true);
    };
    const resetForm = ()=>{
        setFormData({
            title: '',
            department: 'commercial',
            location: '',
            type: 'CDI',
            description: '',
            requirements: '',
            isActive: true
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '40px',
            background: '#f8fafc',
            minHeight: '100vh'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: '1200px',
                margin: '0 auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                fontSize: '28px',
                                fontWeight: '800',
                                color: '#0f172a'
                            },
                            children: "Gestion des Offres"
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                            lineNumber: 103,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: openCreate,
                            style: {
                                background: '#00c9a7',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            children: "+ Nouvelle Offre"
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                            lineNumber: 104,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                    lineNumber: 102,
                    columnNumber: 17
                }, this),
                isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: 'center',
                        padding: '40px'
                    },
                    children: "Chargement..."
                }, void 0, false, {
                    fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                    lineNumber: 124,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'grid',
                        gap: '20px'
                    },
                    children: [
                        jobs.map((job)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    marginBottom: '8px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            margin: 0
                                                        },
                                                        children: job.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 139,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '12px',
                                                            padding: '2px 8px',
                                                            background: job.isActive ? '#dcfce7' : '#f1f5f9',
                                                            color: job.isActive ? '#166534' : '#64748b',
                                                            borderRadius: '20px',
                                                            fontWeight: '600'
                                                        },
                                                        children: job.isActive ? 'Actif' : 'Inactif'
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 140,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 138,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: '#64748b',
                                                    fontSize: '14px',
                                                    margin: 0
                                                },
                                                children: [
                                                    job.department,
                                                    " • ",
                                                    job.type,
                                                    " • ",
                                                    job.location
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 151,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 137,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>openEdit(job),
                                                style: {
                                                    padding: '8px 16px',
                                                    border: '1px solid #cbd5e1',
                                                    background: 'white',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                },
                                                children: "Modifier"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 156,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDelete(job.id),
                                                style: {
                                                    padding: '8px 16px',
                                                    border: '1px solid #fee2e2',
                                                    background: '#fef2f2',
                                                    color: '#dc2626',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                },
                                                children: "Supprimer"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 169,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 155,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, job.id, true, {
                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                lineNumber: 128,
                                columnNumber: 29
                            }, this)),
                        jobs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: '40px',
                                color: '#94a3b8'
                            },
                            children: "Aucune offre pour le moment."
                        }, void 0, false, {
                            fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                            lineNumber: 187,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                    lineNumber: 126,
                    columnNumber: 21
                }, this),
                isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: 'white',
                            borderRadius: '16px',
                            width: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '30px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    marginBottom: '24px',
                                    fontSize: '24px',
                                    fontWeight: '700'
                                },
                                children: editingJob ? 'Modifier l\'offre' : 'Nouvelle offre'
                            }, void 0, false, {
                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                lineNumber: 199,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleSubmit,
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                },
                                                children: "Titre du poste"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 204,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                required: true,
                                                value: formData.title,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        title: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        },
                                                        children: "Département"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 214,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: formData.department,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                department: e.target.value
                                                            }),
                                                        style: {
                                                            width: '100%',
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #cbd5e1'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "commercial",
                                                                children: "Commercial"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "marketing",
                                                                children: "Marketing"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 221,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "tech",
                                                                children: "Tech & Produit"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 222,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "operations",
                                                                children: "Opérations"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 223,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 213,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            marginBottom: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        },
                                                        children: "Contrat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: formData.type,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                type: e.target.value
                                                            }),
                                                        style: {
                                                            width: '100%',
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #cbd5e1'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "CDI",
                                                                children: "CDI"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 233,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "CDD",
                                                                children: "CDD"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 234,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "Freelance",
                                                                children: "Freelance"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 235,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "Stage",
                                                                children: "Stage"
                                                            }, void 0, false, {
                                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                                lineNumber: 236,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 226,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                },
                                                children: "Localisation"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 241,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                required: true,
                                                value: formData.location,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        location: e.target.value
                                                    }),
                                                placeholder: "ex: Moroni ou Remote",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 242,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                },
                                                children: "Description"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 251,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                required: true,
                                                rows: 4,
                                                value: formData.description,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        description: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 252,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '8px',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                },
                                                children: "Pré-requis (1 par ligne)"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 261,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                required: true,
                                                rows: 4,
                                                value: formData.requirements,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        requirements: e.target.value
                                                    }),
                                                placeholder: "Expérience B2B Anglais courant...",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 262,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 260,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: formData.isActive,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            isActive: e.target.checked
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                    lineNumber: 273,
                                                    columnNumber: 41
                                                }, this),
                                                "Offre active (visible sur le site)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                            lineNumber: 272,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '10px',
                                            marginTop: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setIsModalOpen(false),
                                                style: {
                                                    padding: '12px 24px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: '#f1f5f9',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                },
                                                children: "Annuler"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 282,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                style: {
                                                    padding: '12px 24px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    background: '#0f172a',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                },
                                                children: "Enregistrer"
                                            }, void 0, false, {
                                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                        lineNumber: 281,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                                lineNumber: 202,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                        lineNumber: 198,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
                    lineNumber: 194,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
            lineNumber: 101,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/admin/src/app/dashboard/careers/page.tsx",
        lineNumber: 100,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5d94293b._.js.map