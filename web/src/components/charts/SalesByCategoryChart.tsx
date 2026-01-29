'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Charts.module.css';

export interface SalesByProductCategory {
    categoryName: string;
    totalRevenue: number;
    totalItemsSold: number;
}

export interface SalesByCategoryChartProps {
    data: SalesByProductCategory[];
    loading?: boolean;
    currencySymbol?: string;
}

export default function SalesByCategoryChart({
    data = [],
    loading = false,
    currencySymbol = 'KMF',
}: SalesByCategoryChartProps) {
    const [filter, setFilter] = useState<'Jan' | 'Mensuel'>('Jan');

    const processedData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        const filtered = filter === 'Jan' ? data.slice(0, 3) : data;

        return filtered.map((item) => {
            const name = item.categoryName?.trim();
            const label = name && name.length > 12 ? name.substring(0, 10) + '...' : name || 'Inconnu';

            let value = 0;
            if (filter === 'Jan') {
                value = Number(item.totalItemsSold) || 0;
            } else {
                value = Math.round((Number(item.totalRevenue) || 0) / 1000); // en milliers
            }

            return {
                name: label,
                fullName: name,
                value: value,
                originalValue: filter === 'Jan' ? item.totalItemsSold : item.totalRevenue
            };
        });
    }, [data, filter]);

    const formatYAxis = (value: number) => {
        if (filter === 'Jan') return value.toString();
        return `${value}k`;
    };

    const formatTooltip = (value: number) => {
        if (filter === 'Jan') return `${value} articles`;
        return `${value}k ${currencySymbol}`; // Mobile says XAF but we use variable
    };

    if (loading) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#00D09C' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>{filter === 'Jan' ? 'Top 3 catégories (Jan)' : 'Revenus par catégorie'}</h3>
                </div>
                <div className={styles.loadingChart}>
                    <div className={styles.spinner} style={{ borderTopColor: '#00D09C' }} />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#00D09C' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Revenus par catégorie</h3>
                </div>
                <div className={styles.emptyChart}>
                    <p className={styles.emptyText}>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer} style={{ borderColor: '#00D09C' }}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    {filter === 'Jan' ? 'Top 3 catégories (Jan)' : 'Revenus par catégorie'}
                </h3>
                <div className={styles.filterButtons}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'Jan' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('Jan')}
                    >
                        Jan
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'Mensuel' ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter('Mensuel')}
                    >
                        Mensuel
                    </button>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={formatYAxis}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{ backgroundColor: '#fff', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                            <p style={{ fontWeight: 'bold' }}>{payload[0].payload.fullName}</p>
                                            <p style={{ color: '#00D09C' }}>{formatTooltip(payload[0].value as number)}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {processedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="rgba(0, 208, 156, 1)" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.chartLegend} style={{ justifyContent: 'center', marginTop: '10px' }}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#00D09C' }} />
                    <span>{filter === 'Jan' ? 'Articles vendus' : `Revenus (milliers ${currencySymbol})`}</span>
                </div>
            </div>
        </div>
    );
}
