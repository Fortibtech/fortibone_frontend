'use client';

import Link from 'next/link';
import styles from '../../page.module.css';

const profileData = {
    name: 'Livreurs',
    icon: '🚴',
    role: 'Professionnels de livraison, lien final entre vendeur et client',
    description: 'Les livreurs assurent la connexion physique entre les vendeurs et les clients. Ils sont essentiels pour le fonctionnement de l\'écosystème.',
    kpis: [
        { label: 'Total inscrits', value: '89', trend: 32.1 },
        { label: 'Actifs (30j)', value: '72', trend: 25.4 },
        { label: 'Livraisons/j', value: '234', trend: 45.2 },
        { label: 'Note moyenne', value: '4.7/5', trend: 2.1 },
    ],
    journey: [
        'Inscription',
        'Configuration véhicule',
        'Définition zones',
        'Tarifs livraison',
        'Réception demandes',
        'Collecte',
        'Livraison',
        'Confirmation',
    ],
    value: {
        ecosystem: 'Permettent 100% des livraisons de la plateforme',
        user: 'Source de revenus flexible et autonome',
        economic: 'Création d\'emplois et professionnalisation de la livraison',
    },
    dependencies: [
        { name: 'Wallet', status: 'active' as const },
        { name: 'GPS/Tracking', status: 'active' as const },
        { name: 'Notifications', status: 'active' as const },
        { name: 'Rating', status: 'active' as const },
    ],
};

export default function LivreursPage() {
    return (
        <div className={styles.dashboard}>
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    ← Retour au dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '48px' }}>{profileData.icon}</div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                            {profileData.name}
                        </h1>
                        <p style={{ color: 'var(--color-gray-500)', fontSize: '16px' }}>
                            {profileData.role}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                {profileData.kpis.map((kpi) => (
                    <div key={kpi.label} className={styles.kpiCard}>
                        <div className={styles.kpiHeader}>
                            <span className={`${styles.kpiTrend} ${kpi.trend >= 0 ? styles.positive : styles.negative}`}>
                                {kpi.trend >= 0 ? '+' : ''}{kpi.trend}%
                            </span>
                        </div>
                        <div className={styles.kpiValue}>{kpi.value}</div>
                        <div className={styles.kpiLabel}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            <div className={styles.chartCard} style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '16px', lineHeight: '1.7' }}>
                    {profileData.description}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}><span>🛤️</span> Parcours livreur</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {profileData.journey.map((step, index) => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--color-gray-50)', borderRadius: '8px' }}>
                                <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>{index + 1}</span>
                                <span style={{ color: 'var(--color-gray-900)', fontSize: '14px' }}>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}><span>🔗</span> Dépendances</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {profileData.dependencies.map((dep) => (
                            <div key={dep.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-gray-50)', borderRadius: '8px' }}>
                                <span style={{ color: 'var(--color-gray-900)', fontSize: '14px' }}>{dep.name}</span>
                                <span style={{ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>✓ Actif</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}><span>💎</span> Valeur apportée</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '20px', backgroundColor: 'var(--color-gray-50)', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>🌐 Pour l'écosystème</div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>{profileData.value.ecosystem}</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: 'var(--color-gray-50)', borderRadius: '12px', borderLeft: '4px solid var(--color-secondary)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>👤 Pour l'utilisateur</div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>{profileData.value.user}</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: 'var(--color-gray-50)', borderRadius: '12px', borderLeft: '4px solid var(--color-success)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>💰 Impact économique</div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>{profileData.value.economic}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
