'use client';

import { startTransition, useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobApplications } from '@/lib/api/adminApi';
import styles from '@/app/page.module.css'; // Global dashboard styles

export default function JobApplicationsPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = use(params); // Unwrap the params Promise
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [debugError, setDebugError] = useState<string | null>(null); // New debug state
    const router = useRouter();

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            setDebugError(null);
            try {
                // We access the API directly here to catch the specific error
                // adminApi catches errors and returns [], masking the real issue
                // So we'll try-catch the service call or modify how we call it.
                // For now, let's assume the service returns [] on error, which is hard to debug.
                // Let's rely on the service but if it's empty, we might not know why.
                // Better: Let's call the proxy directly for debugging purposes if needed, 
                // but let's first see what the service returns.
                const data = await getJobApplications(jobId);
                setApplications(data);
                if (data.length === 0) {
                    // Check if it was actually an error masked as empty array?
                    // hard to tell without modifying getJobApplications. 
                    // Let's rely on adding a visual indicator for "0 items found".
                }
            } catch (err: any) {
                setDebugError(err.message || 'Unknown error');
            }
            setIsLoading(false);
        };
        fetchApplications();
    }, [jobId]);

    // ... (formatDate function)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Chargement des candidatures...
        </div>;
    }

    return (
        <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
            <div className={styles.chartHeader}>
                <div>
                    <Link href="/dashboard/careers" style={{ textDecoration: 'none', color: '#64748b', fontSize: '14px' }}>
                        ← Retour aux offres
                    </Link>
                    <h1 className={styles.chartTitle} style={{ marginTop: '10px', fontSize: '24px' }}>Candidatures reçues</h1>
                    <p className={styles.kpiLabel}>
                        {applications.length} candidat(s) ont postulé à cette offre
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                        Job ID: {jobId}
                    </p>
                    {debugError && (
                        <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginTop: '10px' }}>
                            <strong>Erreur Debug:</strong> {debugError}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.chartsGrid} style={{ display: 'block' }}>
                {applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3>Aucune candidature pour le moment</h3>
                        <p style={{ color: '#64748b' }}>Les candidatures apparaîtront ici dès qu'un visiteur postulera.</p>
                        <div style={{ marginTop: '20px', padding: '15px', background: '#f1f5f9', borderRadius: '8px', fontSize: '12px', textAlign: 'left', color: '#475569' }}>
                            <strong>Debug Info:</strong><br />
                            - URL appelée: /api/careers/jobs/{jobId}/applications<br />
                            - Vérifiez que le Job ID correspond bien à l'offre postulée.<br />
                            - Vérifiez la console (F12) pour voir les erreurs réseau (404, 500, etc.).
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {applications.map((app) => (
                            <div key={app.id} style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                borderLeft: '4px solid #0f172a'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px' }}>{app.name}</h3>
                                        <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px' }}>
                                            {formatDate(app.createdAt)}
                                        </span>
                                    </div>
                                    <div style={{ color: '#475569', marginBottom: '16px', display: 'flex', gap: '24px' }}>
                                        <span>📧 {app.email}</span>
                                        <span>📞 {app.phone}</span>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155' }}>
                                            {app.message}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {app.cvLink && (
                                        <a
                                            href={(app.cvLink.startsWith('/') ? '/api/careers' : '') + app.cvLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: '#0f172a',
                                                color: 'white',
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            📄 Voir le CV
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
