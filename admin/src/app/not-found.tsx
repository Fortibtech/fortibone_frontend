'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                fontSize: '120px',
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                lineHeight: 1,
                marginBottom: '20px',
                opacity: 0.2
            }}>
                404
            </div>

            <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'var(--text-main)'
            }}>
                Page introuvable
            </h2>

            <p style={{
                color: 'var(--text-muted)',
                maxWidth: '500px',
                marginBottom: '40px',
                fontSize: '16px',
                lineHeight: '1.6'
            }}>
                La page que vous recherchez semble avoir été déplacée, supprimée ou n'existe pas.
                Si vous pensez qu'il s'agit d'une erreur, contactez le support.
            </p>

            <div style={{ display: 'flex', gap: '16px' }}>
                <Link
                    href="/"
                    style={{
                        padding: '12px 24px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: 'transform 0.2s'
                    }}
                >
                    Retour à l'accueil
                </Link>

                <button
                    onClick={() => window.history.back()}
                    style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid var(--color-gray-300)',
                        color: 'var(--text-main)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Page précédente
                </button>
            </div>
        </div>
    );
}
