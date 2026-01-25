'use client';

import Link from 'next/link';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

export default function LandingPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: 'white',
            fontFamily: '"Inter", sans-serif'
        }}>
            <PublicHeader variant="transparent" />

            {/* Hero Content */}
            <main className="hero-container" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'rgba(0, 201, 167, 0.15)',
                    color: '#00c9a7',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '24px',
                    border: '1px solid rgba(0, 201, 167, 0.3)'
                }}>
                    ✨ KomoraLink Recrute
                </div>

                <h1 className="hero-title" style={{
                    fontWeight: '800',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    maxWidth: '900px'
                }}>
                    Construisons ensemble le commerce de demain
                </h1>

                <p className="hero-desc" style={{
                    color: '#94a3b8',
                    maxWidth: '600px',
                    lineHeight: 1.6,
                    marginBottom: '48px'
                }}>
                    Nous cherchons des talents passionnés pour transformer l'économie numérique aux Comores.
                    Développeurs, Commerciaux, Marketers... votre place est ici.
                </p>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/careers" style={{
                        background: 'linear-gradient(135deg, #00c9a7, #00a389)',
                        color: 'white',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '18px',
                        boxShadow: '0 8px 30px rgba(0, 201, 167, 0.3)'
                    }}>
                        Voir les offres disponibles
                    </Link>
                </div>
            </main>

            <PublicFooter />

            <style jsx>{`
                .hero-container {
                    padding: 120px 20px 60px;
                }
                .hero-title {
                    fontSize: 64px;
                }
                .hero-desc {
                    fontSize: 20px;
                }

                @media (max-width: 768px) {
                    .hero-container {
                        padding: 100px 20px 40px;
                    }
                    .hero-title {
                        fontSize: 36px !important;
                    }
                    .hero-desc {
                        fontSize: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
