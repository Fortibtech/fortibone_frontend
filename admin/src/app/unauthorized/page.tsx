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
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                fontSize: '48px'
            }}>
                🚫
            </div>

            <h1 style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#111',
                marginBottom: '16px'
            }}>
                Accès Non Autorisé
            </h1>

            <p style={{
                fontSize: '18px',
                color: '#666',
                maxWidth: '500px',
                lineHeight: '1.6',
                marginBottom: '32px'
            }}>
                Vous n'avez pas les permissions nécessaires pour accéder au dashboard administrateur.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                    href="/about"
                    style={{
                        background: 'linear-gradient(135deg, #00c9a7, #00a389)',
                        color: 'white',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '16px',
                    }}
                >
                    Découvrir KomoraLink
                </Link>
                <Link
                    href="/login"
                    style={{
                        background: 'white',
                        color: '#00c9a7',
                        padding: '14px 28px',
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
