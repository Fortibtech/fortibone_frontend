'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';

export interface SalesByPeriodData {
    period: string;
    totalAmount: number;
    totalItems: number;
}

export interface SalesByPeriodChartProps {
    data: SalesByPeriodData[];
    loading?: boolean;
    currencySymbol?: string;
    onUnitChange?: (unit: UnitType) => void;
}

type UnitType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

const UNITS: { key: UnitType; label: string }[] = [
    { key: 'DAY', label: 'Jour' },
    { key: 'WEEK', label: 'Semaine' },
    { key: 'MONTH', label: 'Mois' },
    { key: 'YEAR', label: 'Année' },
];

const unitLabelMap: Record<UnitType, string> = {
    DAY: 'par jour',
    WEEK: 'par semaine',
    MONTH: 'par mois',
    YEAR: 'par année',
};

export default function SalesByPeriodChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
    onUnitChange,
}: SalesByPeriodChartProps) {
    const [unit, setUnit] = useState<UnitType>('MONTH');

    const handleUnitChange = (newUnit: UnitType) => {
        setUnit(newUnit);
        if (onUnitChange) {
            onUnitChange(newUnit);
        }
    };

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
        if (unit === 'MONTH' && period.match(/^\d{4}-\d{2}$/)) {
            return period.slice(5); // 2025-09 → 09
        }
        if (unit === 'WEEK' && period.includes('-W')) {
            return `S${period.split('-W')[1]}`;
        }
        if (unit === 'YEAR') {
            return period;
        }
        return period.slice(5);
    };

    const chartData = data.map(item => ({
        ...item,
        displayPeriod: formatPeriod(item.period),
    }));

    if (loading) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#8B5CF6' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Évolution des ventes</h3>
                    <p className={styles.chartSubtitle}>Montant {unitLabelMap[unit]} ({currencySymbol})</p>
                </div>
                <div className={styles.loadingChart}>
                    <div className={styles.spinner} style={{ borderTopColor: '#8B5CF6' }} />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.chartContainer} style={{ borderColor: '#8B5CF6' }}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Évolution des ventes</h3>
                    <p className={styles.chartSubtitle}>Montant {unitLabelMap[unit]} ({currencySymbol})</p>
                    <div className={styles.unitFilters}>
                        {UNITS.map((u) => (
                            <button
                                key={u.key}
                                className={`${styles.unitBtn} ${unit === u.key ? styles.unitBtnActive : ''}`}
                                onClick={() => handleUnitChange(u.key)}
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>📈</span>
                    <p className={styles.emptyText}>Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer} style={{ borderColor: '#8B5CF6' }}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Évolution des ventes</h3>
                <p className={styles.chartSubtitle}>Montant {unitLabelMap[unit]} ({currencySymbol})</p>
                <div className={styles.unitFilters}>
                    {UNITS.map((u) => (
                        <button
                            key={u.key}
                            className={`${styles.unitBtn} ${unit === u.key ? styles.unitBtnActive : ''}`}
                            onClick={() => handleUnitChange(u.key)}
                        >
                            {u.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                            dataKey="displayPeriod"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAmount}
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
                        <Line
                            type="monotone"
                            dataKey="totalAmount"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            dot={{ r: 5, strokeWidth: 3, stroke: '#8B5CF6', fill: 'white' }}
                            activeDot={{ r: 7, strokeWidth: 3, stroke: '#8B5CF6', fill: 'white' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
