'use client';

import Link from 'next/link';
import styles from '../../dashboard/dashboard.module.css';

const profileData = {
    name: 'Commerçants',
    icon: '🏪',
    role: 'Vendeurs au détail, moteur de l\'offre locale, créateurs de valeur',
    description: 'Les commerçants sont le cœur battant de l\'économie locale. Ils vendent aux particuliers et acheminent les produits jusqu\'au consommateur final.',
    kpis: [
        { label: 'Total inscrits', value: '1 240', trend: 15.2 },
        { label: 'Actifs (30j)', value: '890', trend: 9.8 },
        { label: 'CA mensuel', value: '4.8M KMF', trend: 28.5 },
        { label: 'Commandes/j', value: '156', trend: 12.3 },
    ],
    journey: [
        'Inscription',
        'Création boutique',
        'Ajout produits',
        'Réception commandes',
        'Préparation',
        'Livraison/Retrait',
        'Encaissement',
    ],
    value: {
        ecosystem: 'Génèrent 45% du volume de ventes B2C',
        user: 'Vitrine digitale et accès aux clients diaspora',
        economic: 'Création d\'emplois locaux et structuration du commerce',
    },
    dependencies: [
        { name: 'Wallet', status: 'active' as const },
        { name: 'Livraison', status: 'active' as const },
        { name: 'Fournisseurs', status: 'active' as const },
        { name: 'Analytics', status: 'active' as const },
    ],
};

export default function CommercantsPage() {
    return (
        <div className={styles.dashboard}>
            {/* Header */}
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

            {/* KPIs */}
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

            {/* Description */}
            <div className={styles.chartCard} style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--color-gray-600)', fontSize: '16px', lineHeight: '1.7' }}>
                    {profileData.description}
                </p>
            </div>

            {/* Two columns layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Journey */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>
                            <span>🛤️</span> Parcours vendeur
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {profileData.journey.map((step, index) => (
                            <div key={step} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                backgroundColor: 'var(--color-gray-50)',
                                borderRadius: '8px',
                            }}>
                                <span style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}>
                                    {index + 1}
                                </span>
                                <span style={{ color: 'var(--color-gray-900)', fontSize: '14px' }}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dependencies */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>
                            <span>🔗</span> Dépendances
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {profileData.dependencies.map((dep) => (
                            <div key={dep.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                backgroundColor: 'var(--color-gray-50)',
                                borderRadius: '8px',
                            }}>
                                <span style={{ color: 'var(--color-gray-900)', fontSize: '14px' }}>
                                    {dep.name}
                                </span>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    backgroundColor: dep.status === 'active'
                                        ? 'var(--color-primary-50)'
                                        : dep.status === 'partial'
                                            ? 'rgba(245, 158, 11, 0.15)'
                                            : 'rgba(239, 68, 68, 0.15)',
                                    color: dep.status === 'active'
                                        ? 'var(--color-primary)'
                                        : dep.status === 'partial'
                                            ? 'var(--color-warning)'
                                            : 'var(--color-error)',
                                }}>
                                    {dep.status === 'active' ? '✓ Actif' : dep.status === 'partial' ? '◐ Partiel' : '✗ Inactif'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Value */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span>💎</span> Valeur apportée
                    </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--color-gray-50)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--color-primary)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                            🌐 Pour l'écosystème
                        </div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.ecosystem}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--color-gray-50)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--color-secondary)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                            👤 Pour l'utilisateur
                        </div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.user}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--color-gray-50)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--color-success)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)', marginBottom: '8px' }}>
                            💰 Impact économique
                        </div>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.economic}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
