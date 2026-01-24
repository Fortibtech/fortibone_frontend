'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Charts.module.css';

export interface Sales30DaysData {
    period: string;
    totalAmount: number;
    totalItems: number;
}

export interface Sales30DaysChartProps {
    data: Sales30DaysData[];
    loading?: boolean;
    currencySymbol?: string;
}

export default function Sales30DaysChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
}: Sales30DaysChartProps) {
    const formatAmount = (value: number) => {
        if (value >= 1000) {
            return `${Math.round(value / 1000)}k`;
        }
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    };

    const formatTooltip = (value: number) => {
        return `${new Intl.NumberFormat('fr-FR').format(value)} ${currencySymbol}`;
    };

    // Get last 7 days for display (like mobile)
    const last7 = data.slice(-7);

    // Format day number for display
    const chartData = last7.map((item, index) => {
        const day = new Date(item.period).getDate();
        const isToday = index === last7.length - 1;
        return {
            ...item,
            day: day.toString(),
            isToday,
        };
    });

    if (loading) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#10B981' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📊</span>
                        CA des 30 derniers jours
                    </h3>
                </div>
                <div className={styles.loadingChart}>
                    <div className={styles.spinner} style={{ borderTopColor: '#10B981' }} />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#10B981' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📊</span>
                        CA des 30 derniers jours
                    </h3>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>📈</span>
                    <p className={styles.emptyText}>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    const maxAmount = Math.max(...data.map(d => d.totalAmount));

    return (
        <div className={styles.chartContainer} style={{ borderColor: '#10B981' }}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    <span className={styles.chartIcon}>📊</span>
                    CA des 30 derniers jours
                </h3>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAmount}
                            domain={[0, maxAmount * 1.1]}
                        />
                        <Tooltip
                            formatter={(value: number | undefined) => [formatTooltip(value || 0), 'Montant']}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />
                        <Bar
                            dataKey="totalAmount"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isToday ? '#10B981' : '#EC4899'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
