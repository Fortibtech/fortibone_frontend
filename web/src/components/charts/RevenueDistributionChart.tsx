'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';

export interface RevenueData {
    period: string;
    revenue: number;
    expenses?: number;
}

export interface RevenueDistributionChartProps {
    data: RevenueData[];
    loading?: boolean;
    currencySymbol?: string;
}

export default function RevenueDistributionChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
}: RevenueDistributionChartProps) {
    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    };

    const formatTooltip = (value: number) => {
        return `${new Intl.NumberFormat('fr-FR').format(value)} ${currencySymbol}`;
    };

    // Format period for display
    const formatPeriod = (period: string) => {
        if (period.match(/^\d{4}-\d{2}$/)) {
            const [, month] = period.split('-');
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            return months[parseInt(month, 10) - 1] || period;
        }
        return period;
    };

    const chartData = data.map(item => ({
        ...item,
        displayPeriod: formatPeriod(item.period),
    }));

    if (loading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📈</span>
                        Évolution des revenus
                    </h3>
                </div>
                <div className={styles.loadingChart}>
                    <div className={styles.spinner} />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📈</span>
                        Évolution des revenus
                    </h3>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>📊</span>
                    <p className={styles.emptyText}>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    <span className={styles.chartIcon}>📈</span>
                    Évolution des revenus
                </h3>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                            dataKey="displayPeriod"
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAmount}
                        />
                        <Tooltip
                            formatter={(value: number | undefined, name: string | undefined) => [
                                formatTooltip(value || 0),
                                name === 'revenue' ? 'Revenus' : 'Dépenses',
                            ]}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                        />
                        {data.some(d => d.expenses !== undefined) && (
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="url(#colorExpenses)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} />
                    <span>Revenus</span>
                </div>
                {data.some(d => d.expenses !== undefined) && (
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ backgroundColor: '#ef4444' }} />
                        <span>Dépenses</span>
                    </div>
                )}
            </div>
        </div>
    );
}
