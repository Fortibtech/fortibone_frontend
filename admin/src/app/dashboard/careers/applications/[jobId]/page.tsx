'use client';

import { startTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobApplications } from '@/lib/api/adminApi';
import styles from '@/app/page.module.css'; // Global dashboard styles

export default function JobApplicationsPage({ params }: { params: { jobId: string } }) {
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            const data = await getJobApplications(params.jobId);
            setApplications(data);
            setIsLoading(false);
        };
        fetchApplications();
    }, [params.jobId]);

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
                </div>
            </div>

            <div className={styles.chartsGrid} style={{ display: 'block' }}>
                {applications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3>Aucune candidature pour le moment</h3>
                        <p style={{ color: '#64748b' }}>Les candidatures apparaîtront ici dès qu'un visiteur postulera.</p>
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
                                            href={(app.cvLink.startsWith('/') ? (process.env.NEXT_PUBLIC_CAREERS_API_URL || 'https://api.komoralink.fr/careers') : '') + app.cvLink}
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
