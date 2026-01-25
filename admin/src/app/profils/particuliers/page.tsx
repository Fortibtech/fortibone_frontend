'use client';

import Link from 'next/link';
import styles from '../../page.module.css';

// Shared profile page component
interface ProfileData {
    name: string;
    icon: string;
    role: string;
    description: string;
    kpis: { label: string; value: string; trend: number }[];
    journey: string[];
    value: { ecosystem: string; user: string; economic: string };
    dependencies: { name: string; status: 'active' | 'partial' | 'inactive' }[];
}

const profileData: ProfileData = {
    name: 'Particuliers',
    icon: '👤',
    role: 'Consommateurs finaux, moteur de la demande, utilisateurs du wallet',
    description: 'Les particuliers sont au cœur de l\'écosystème KomoraLink. Ils génèrent la demande, utilisent le wallet pour leurs paiements et permettent aux professionnels de prospérer.',
    kpis: [
        { label: 'Total inscrits', value: '8 240', trend: 12.4 },
        { label: 'Actifs (30j)', value: '6 120', trend: 8.2 },
        { label: 'CA généré', value: '1.2M KMF', trend: 23.1 },
        { label: 'Taux rétention', value: '78%', trend: 5.3 },
    ],
    journey: [
        'Inscription',
        'Exploration des commerces',
        'Commande',
        'Paiement wallet',
        'Suivi livraison',
        'Évaluation',
    ],
    value: {
        ecosystem: 'Génèrent 65% du volume transactionnel global',
        user: 'Accès simplifié au commerce local et aux transferts',
        economic: 'Première source de revenus pour les commerçants',
    },
    dependencies: [
        { name: 'Wallet', status: 'active' },
        { name: 'Livraison', status: 'active' },
        { name: 'Restaurants', status: 'active' },
        { name: 'Analytics', status: 'partial' },
    ],
};

export default function ParticuliersPage() {
    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{ color: 'var(--admin-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    ← Retour au dashboard
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '48px' }}>{profileData.icon}</div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--admin-text-primary)', marginBottom: '4px' }}>
                            {profileData.name}
                        </h1>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '16px' }}>
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

            {/* Two columns layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Journey */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>
                            <span>🛤️</span> Parcours utilisateur
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {profileData.journey.map((step, index) => (
                            <div key={step} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                backgroundColor: 'var(--admin-bg-tertiary)',
                                borderRadius: '8px',
                            }}>
                                <span style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--admin-accent)',
                                    color: 'var(--admin-bg-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}>
                                    {index + 1}
                                </span>
                                <span style={{ color: 'var(--admin-text-primary)', fontSize: '14px' }}>
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
                                backgroundColor: 'var(--admin-bg-tertiary)',
                                borderRadius: '8px',
                            }}>
                                <span style={{ color: 'var(--admin-text-primary)', fontSize: '14px' }}>
                                    {dep.name}
                                </span>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    backgroundColor: dep.status === 'active'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : dep.status === 'partial'
                                            ? 'rgba(245, 158, 11, 0.15)'
                                            : 'rgba(239, 68, 68, 0.15)',
                                    color: dep.status === 'active'
                                        ? 'var(--admin-success)'
                                        : dep.status === 'partial'
                                            ? 'var(--admin-warning)'
                                            : 'var(--admin-danger)',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--admin-bg-tertiary)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--admin-accent)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--admin-text-primary)', marginBottom: '8px' }}>
                            🌐 Pour l'écosystème
                        </div>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.ecosystem}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--admin-bg-tertiary)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--admin-info)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--admin-text-primary)', marginBottom: '8px' }}>
                            👤 Pour l'utilisateur
                        </div>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.user}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'var(--admin-bg-tertiary)',
                        borderRadius: '12px',
                        borderLeft: '4px solid var(--admin-success)',
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--admin-text-primary)', marginBottom: '8px' }}>
                            💰 Impact économique
                        </div>
                        <p style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                            {profileData.value.economic}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
