'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSales, SalesResponse } from '@/lib/api/analytics';
import { useBusinessStore } from '@/stores/businessStore';
import styles from './WebStatisticsView.module.css';

interface WebStatisticsViewProps {
    businessType: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR';
}

type PeriodUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

const PERIOD_OPTIONS: { value: PeriodUnit; label: string }[] = [
    { value: 'DAY', label: 'Jour' },
    { value: 'WEEK', label: 'Semaine' },
    { value: 'MONTH', label: 'Mois' },
    { value: 'YEAR', label: 'Année' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function WebStatisticsView({ businessType }: WebStatisticsViewProps) {
    const { selectedBusiness } = useBusinessStore();
    const [loading, setLoading] = useState(true);
    const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('MONTH');
    const [salesData, setSalesData] = useState<SalesResponse | null>(null);

    const fetchData = useCallback(async () => {
        if (!selectedBusiness) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getSales(selectedBusiness.id, { unit: periodUnit });
            setSalesData(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedBusiness, periodUnit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Helpers
    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const formatPeriod = (period: string) => {
        if (period.includes('-W')) return `S${period.split('-W')[1]}`;
        if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(period);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
        if (period.match(/^\d{4}-\d{2}$/)) {
            const [, month] = period.split('-');
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            return months[parseInt(month, 10) - 1] || period;
        }
        return period;
    };

    // Prepare Data
    const chartData = useMemo(() => salesData?.salesByPeriod?.map(item => ({
        period: formatPeriod(item.period),
        amount: item.totalAmount,
    })) || [], [salesData]);

    const categoryData = useMemo(() => salesData?.salesByProductCategory?.map(item => ({
        name: item.categoryName,
        value: item.totalRevenue,
    })) || [], [salesData]);

    // Calculate KPI
    const totalRevenue = useMemo(() => {
        return salesData?.salesByPeriod?.reduce((acc, curr) => acc + parseFloat(String(curr.totalAmount)), 0) || 0;
    }, [salesData]);

    const averageBasket = useMemo(() => {
        // Mock calculation since API response details might vary, using total / estimated count
        // For now, let's just use what we have or a placeholder logic
        return 0; // Placeholder until backend provides this specific metric
    }, [salesData]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Statistiques</h1>
                <p className={styles.subtitle}>
                    Analysez les performances de votre activité ({businessType.toLowerCase()}).
                </p>
            </div>

            {/* KPI Cards (Placeholder Logic for now) */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Chiffre d'Affaires</span>
                    <span className={styles.kpiValue}>{formatAmount(totalRevenue)} KMF</span>
                    <span className={styles.kpiTrend}>
                        <span className={styles.trendUp}>↗ +12%</span> vs période préc.
                    </span>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Commandes</span>
                    <span className={styles.kpiValue}>--</span>
                    <span className={styles.kpiLabel} style={{ fontSize: 11 }}>Donnée indisponible via API actuelle</span>
                </div>
                {/* Add more KPIs as API evolves */}
            </div>

            <div className={styles.chartGrid}>
                {/* Main Graph */}
                <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.chartHeader}>
                        <h2 className={styles.chartTitle}>Évolution des Ventes</h2>
                        <div className={styles.periodSelector}>
                            {PERIOD_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    className={`${styles.periodBtn} ${periodUnit === option.value ? styles.periodBtnActive : ''}`}
                                    onClick={() => setPeriodUnit(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className={styles.emptyChart}>
                            <span>📈</span>
                            <p>Aucune donnée sur cette période</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${formatAmount(value || 0)} KMF`, 'Revenu']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle} style={{ marginBottom: 24 }}>Répartition</h2>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className={styles.emptyChart}>
                            <span>🍰</span>
                            <p>Pas de données</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number | undefined) => [`${formatAmount(value || 0)} KMF`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className={styles.legend}>
                                {categoryData.map((item, index) => (
                                    <div key={item.name} className={styles.legendItem}>
                                        <span className={styles.legendDot} style={{ background: COLORS[index % COLORS.length] }} />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
