'use client';

import { useUserStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { hydrateTokenAndProfile } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        hydrateTokenAndProfile()
            .then(() => {
                setLoading(false);
            })
            .catch((e) => {
                console.error("ClientLayout: Hydration failed", e);
                setLoading(false);
            });
    }, [hydrateTokenAndProfile]);

    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#059669',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ marginTop: 20, color: '#6b7280' }}>Chargement...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div id="root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {children}
        </div>
    );
}
