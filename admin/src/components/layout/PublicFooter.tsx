'use client';

import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '60px 20px 40px',
            textAlign: 'center',
            background: '#0f172a',
            color: 'white',
            marginTop: 'auto'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px', textAlign: 'left' }}>

                {/* Brand */}
                <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#00c9a7', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>K</div>
                        KomoraLink
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                        La première plateforme digitale tout-en-un pour le commerce aux Comores.
                        Connectez-vous, échangez, grandissez.
                    </p>
                </div>

                {/* Liens Rapides */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'white' }}>Plateforme</h4>
                    <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>À Propos</Link>
                    <Link href="/docs" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Documentation</Link>
                    <Link href="/careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Recrutement</Link>
                    <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Connexion Admin</Link>
                </div>

                {/* Légal & Support */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'white' }}>Support</h4>
                    <Link href="/docs/faq" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>FAQ</Link>
                    <a href="mailto:support@komoralink.com" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Contact support</a>
                    <a href="https://fortibtech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Site Corporate</a>
                </div>

            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                    © 2026 KomoraLink - Une création <a href="https://fortibtech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00c9a7', textDecoration: 'none', fontWeight: 600 }}>FORTIBTECH ↗</a>
                </p>
            </div>
        </footer>
    );
}
