'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--color-primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px'
            }}>
                🔒
            </div>
            <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-gray-900)',
                marginBottom: '12px'
            }}>Accès Refusé</h1>
            <p style={{
                color: 'var(--color-gray-600)',
                marginBottom: '32px',
                lineHeight: '1.5'
            }}>
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.<br />
                Veuillez vous connecter avec un compte administrateur.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link
                    href="/"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(27, 184, 116, 0.2)'
                    }}
                >
                    Retour à l'accueil
                </Link>
                <Link
                    href="/login"
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                        border: '2px solid #00c9a7'
                    }}
                >
                    Se connecter
                </Link>
            </div>

            <p style={{ marginTop: '60px', color: '#999', fontSize: '14px' }}>
                © 2026 KomoraLink - FORTIBTECH
            </p>
        </div>
    );
}
