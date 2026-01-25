'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

const mockChartData = {
    users: [
        { month: 'Jan', value: 120 },
        { month: 'Fév', value: 150 },
        { month: 'Mar', value: 180 },
        { month: 'Avr', value: 220 },
        { month: 'Mai', value: 280 },
        { month: 'Juin', value: 350 },
    ],
    transactions: [
        { month: 'Jan', value: 45000 },
        { month: 'Fév', value: 52000 },
        { month: 'Mar', value: 68000 },
        { month: 'Avr', value: 85000 },
        { month: 'Mai', value: 120000 },
        { month: 'Juin', value: 156000 },
    ],
    businessTypes: [
        { name: 'Commerçants', value: 45, color: 'var(--color-primary)' },
        { name: 'Fournisseurs', value: 25, color: 'var(--color-secondary)' },
        { name: 'Restaurateurs', value: 20, color: 'var(--color-warning)' },
        { name: 'Livreurs', value: 10, color: 'var(--color-error)' },
    ]
};

const kpis = [
    { label: 'Croissance utilisateurs', value: '+42%', icon: '📈', trend: 'positive' },
    { label: 'Volume mensuel', value: '156K KMF', icon: '💰', trend: 'positive' },
    { label: 'Taux de conversion', value: '12.5%', icon: '🎯', trend: 'positive' },
    { label: 'Rétention 30j', value: '78%', icon: '🔄', trend: 'neutral' },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    const maxValue = Math.max(...mockChartData.users.map(d => d.value));

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Link href="/" style={{ color: 'var(--color-gray-500)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    ← Retour au dashboard
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-gray-900)' }}>
                            📊 Analytics
                        </h1>
                        <p style={{ color: 'var(--color-gray-500)', marginTop: '4px' }}>
                            Vue d'ensemble des performances de la plateforme
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['week', 'month', 'year'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: period === p ? 'var(--color-primary)' : 'white',
                                    color: period === p ? 'white' : 'var(--color-gray-600)',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                            >
                                {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className={styles.kpiGrid}>
                {kpis.map(kpi => (
                    <div key={kpi.label} className={styles.kpiCard}>
                        <div className={styles.kpiHeader}>
                            <div style={{ fontSize: '24px' }}>{kpi.icon}</div>
                            <span className={`${styles.kpiTrend} ${styles.positive}`}>↑</span>
                        </div>
                        <div className={styles.kpiValue}>{kpi.value}</div>
                        <div className={styles.kpiLabel}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* User Growth Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>📈 Croissance utilisateurs</h3>
                    </div>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 0' }}>
                        {mockChartData.users.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(d.value / maxValue) * 150}px`,
                                    background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease'
                                }} />
                                <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{d.month}</span>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-gray-700)' }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Distribution */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>🥧 Répartition des entreprises</h3>
                    </div>
                    <div style={{ padding: '20px 0' }}>
                        {mockChartData.businessTypes.map((d, i) => (
                            <div key={i} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--color-gray-700)' }}>{d.name}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-gray-900)' }}>{d.value}%</span>
                                </div>
                                <div style={{ height: '8px', backgroundColor: 'var(--color-gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${d.value}%`,
                                        height: '100%',
                                        backgroundColor: d.color,
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Chart */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>💰 Volume transactionnel mensuel</h3>
                </div>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '24px', padding: '20px' }}>
                    {mockChartData.transactions.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '60px',
                                height: `${(d.value / 160000) * 150}px`,
                                background: 'linear-gradient(180deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%)',
                                borderRadius: '4px 4px 0 0'
                            }} />
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>{d.month}</span>
                            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-gray-700)' }}>{(d.value / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
