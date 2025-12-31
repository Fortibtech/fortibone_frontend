'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout';
import { useBusinessStore } from '@/stores/businessStore';
import { getSales, SalesResponse } from '@/lib/api/analytics';
import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './statistics.module.css';

type PeriodUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

const PERIOD_OPTIONS: { value: PeriodUnit; label: string }[] = [
    { value: 'DAY', label: 'Jour' },
    { value: 'WEEK', label: 'Semaine' },
    { value: 'MONTH', label: 'Mois' },
    { value: 'YEAR', label: 'Année' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function StatisticsPage() {
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

    const formatPeriod = (period: string) => {
        if (period.includes('-W')) {
            return `S${period.split('-W')[1]}`;
        }
        if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const date = new Date(period);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
        if (period.match(/^\d{4}-\d{2}$/)) {
            const [, month] = period.split('-');
            const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            return months[parseInt(month, 10) - 1] || period;
        }
        return period;
    };

    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const chartData = salesData?.salesByPeriod?.map(item => ({
        period: formatPeriod(item.period),
        amount: item.totalAmount,
    })) || [];

    const categoryData = salesData?.salesByProductCategory?.map(item => ({
        name: item.categoryName,
        value: item.totalRevenue,
    })) || [];

    return (
        <ProtectedRoute requiredProfileType="PRO">
            <DashboardLayout businessType="COMMERCANT" title="Statistiques">
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>Statistiques</h1>

                    {/* Evolution des ventes */}
                    <section className={styles.chartSection}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h2 className={styles.chartTitle}>Évolution des ventes</h2>
                                <p className={styles.chartSubtitle}>Montant par {periodUnit === 'DAY' ? 'jour' : periodUnit === 'WEEK' ? 'semaine' : periodUnit === 'MONTH' ? 'mois' : 'année'} (KMF)</p>
                            </div>
                        </div>

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

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className={styles.emptyChart}>
                                <span className={styles.emptyIcon}>📈</span>
                                <p>Aucune donnée disponible</p>
                            </div>
                        ) : (
                            <div className={styles.chartWrapper}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#6b7280' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${formatAmount(v)} KMF`}
                                            width={90}
                                        />
                                        <Tooltip
                                            formatter={(value: number | undefined) => [`${formatAmount(value || 0)} KMF`, 'Montant']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>

                    {/* Répartition par catégorie */}
                    <section className={styles.chartSection}>
                        <h2 className={styles.chartTitle}>Répartition par catégorie</h2>

                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner} />
                            </div>
                        ) : categoryData.length === 0 ? (
                            <div className={styles.emptyChart}>
                                <span className={styles.emptyIcon}>📊</span>
                                <p>Aucune donnée disponible</p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.pieWrapper}>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {categoryData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number | undefined) => [`${formatAmount(value || 0)} KMF`, 'Revenu']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className={styles.legend}>
                                    {categoryData.map((item, index) => (
                                        <div key={item.name} className={styles.legendItem}>
                                            <span
                                                className={styles.legendDot}
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
