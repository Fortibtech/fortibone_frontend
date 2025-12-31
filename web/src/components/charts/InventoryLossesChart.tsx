'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from './Charts.module.css';

export interface LossByMovementType {
    movementType: string;
    totalQuantity: number;
    totalValue: number;
}

export interface InventoryLossesChartProps {
    data: LossByMovementType[];
    loading?: boolean;
    currencySymbol?: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];

const movementTypeLabels: Record<string, string> = {
    'EXPIRED': 'Périmés',
    'DAMAGED': 'Endommagés',
    'LOST': 'Perdus',
    'THEFT': 'Vols',
    'ADJUSTMENT': 'Ajustements',
    'OTHER': 'Autres',
};

export default function InventoryLossesChart({
    data,
    loading = false,
    currencySymbol = 'KMF',
}: InventoryLossesChartProps) {
    const formatValue = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value);
    };

    const chartData = data.map((item) => ({
        name: movementTypeLabels[item.movementType] || item.movementType,
        value: item.totalValue,
        quantity: item.totalQuantity,
    }));

    const totalLoss = data.reduce((sum, item) => sum + item.totalValue, 0);

    if (loading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>
                        <span className={styles.chartIcon}>📉</span>
                        Pertes d&apos;inventaire
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
                        <span className={styles.chartIcon}>📉</span>
                        Pertes d&apos;inventaire
                    </h3>
                </div>
                <div className={styles.emptyChart}>
                    <span className={styles.emptyIcon}>✅</span>
                    <p className={styles.emptyText}>Aucune perte enregistrée</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    <span className={styles.chartIcon}>📉</span>
                    Pertes d&apos;inventaire
                </h3>
            </div>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => [`${formatValue(value || 0)} ${currencySymbol}`, 'Valeur']}
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
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                    {formatValue(totalLoss)} {currencySymbol}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total des pertes</p>
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
