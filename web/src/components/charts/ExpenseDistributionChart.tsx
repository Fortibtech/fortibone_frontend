'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Charts.module.css';

export interface ExpenseCategory {
    category: string;
    amount: number;
    percentage?: number;
}

export interface ExpenseDistributionChartProps {
    data: ExpenseCategory[];
    loading?: boolean;
    currencySymbol?: string;
    title?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308'];

const categoryLabels: Record<string, string> = {
    'PURCHASES': 'Achats',
    'SALARIES': 'Salaires',
    'RENT': 'Loyer',
    'UTILITIES': 'Charges',
    'MARKETING': 'Marketing',
    'SUPPLIES': 'Fournitures',
    'OTHER': 'Autres',
};

export default function ExpenseDistributionChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
    title = 'Répartition des dépenses',
}: ExpenseDistributionChartProps) {
    const formatValue = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const chartData = data.map((item) => ({
        name: categoryLabels[item.category] || item.category,
        value: item.amount,
        percentage: item.percentage,
    }));

    const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);

    if (loading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>💰</span>
                        {title}
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
                        <span className={styles.chartIcon}>💰</span>
                        {title}
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
                    <span className={styles.chartIcon}>💰</span>
                    {title}
                </h3>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => [`${formatValue(value || 0)} ${currencySymbol}`, 'Montant']}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '-40px', marginBottom: '16px' }}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#374151', margin: 0 }}>
                    {formatValue(totalExpenses)} {currencySymbol}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total</p>
            </div>
            <div className={styles.chartLegend}>
                {chartData.map((item, index) => (
                    <div key={item.name} className={styles.legendItem}>
                        <span
                            className={styles.legendDot}
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
