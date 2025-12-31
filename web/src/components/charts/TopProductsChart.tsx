'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './Charts.module.css';

export interface TopProduct {
    variantId: string;
    sku?: string;
    productName: string;
    variantImageUrl?: string;
    totalQuantitySold: number;
    totalRevenue: number;
    revenuePercentage?: number;
}

export interface TopProductsChartProps {
    data: TopProduct[];
    loading?: boolean;
    currencySymbol?: string;
    title?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#eab308'];

export default function TopProductsChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
    title = 'Top produits',
}: TopProductsChartProps) {
    const formatValue = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    // Calculate total and percentages
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const chartData = data.slice(0, 5).map((item) => ({
        name: item.productName,
        value: item.totalRevenue,
        quantity: item.totalQuantitySold,
        percentage: totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0,
    }));

    if (loading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>🏆</span>
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
                        <span className={styles.chartIcon}>🏆</span>
                        {title}
                    </h3>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>📦</span>
                    <p className={styles.emptyText}>Aucun produit vendu</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    <span className={styles.chartIcon}>🏆</span>
                    {title}
                </h3>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* Donut chart */}
                <div style={{ width: '140px', height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => [`${formatValue(value || 0)} ${currencySymbol}`, 'Revenu']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Product list */}
                <div className={styles.topProductsList} style={{ flex: 1 }}>
                    {chartData.map((item, index) => (
                        <div key={item.name} className={styles.topProductItem}>
                            <span
                                className={styles.topProductRank}
                                style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}
                            >
                                {index + 1}
                            </span>
                            <div className={styles.topProductInfo}>
                                <span className={styles.topProductName}>{item.name}</span>
                                <span className={styles.topProductMeta}>
                                    {item.quantity} vendus • {item.percentage.toFixed(1)}%
                                </span>
                            </div>
                            <span className={styles.topProductValue}>
                                {formatValue(item.value)} {currencySymbol}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
