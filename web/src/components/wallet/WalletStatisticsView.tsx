'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getWalletTransactions, type WalletTransaction } from '@/lib/api';
import styles from './WalletStatisticsView.module.css';

interface WalletStatisticsViewProps {
    symbol?: string;
    period?: '1w' | '1m' | '3m' | '6m' | '1y';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const REVENUE_COLOR = '#10B981'; // Emerald 500
const EXPENSE_COLOR = '#EF4444'; // Red 500

export default function WalletStatisticsView({ symbol = 'KMF', period: initialPeriod = '6m' }: WalletStatisticsViewProps) {
    const [period, setPeriod] = useState(initialPeriod);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllTransactions = async () => {
            setLoading(true);
            try {
                // Fetch stats based on reasonable history (e.g. up to 1 year back)
                // Since we aggregate client-side, we fetch a large batch or date-filtered
                // For MVP, we fetch last 500 transactions which should cover recent history
                const response = await getWalletTransactions({ limit: 500, page: 1 });
                setTransactions(response.data || []);
            } catch (error) {
                console.error('Error fetching wallet stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTransactions();
    }, []);

    // Filter transactions by period
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();

        switch (period) {
            case '1w': cutoff.setDate(now.getDate() - 7); break;
            case '1m': cutoff.setMonth(now.getMonth() - 1); break;
            case '3m': cutoff.setMonth(now.getMonth() - 3); break;
            case '6m': cutoff.setMonth(now.getMonth() - 6); break;
            case '1y': cutoff.setFullYear(now.getFullYear() - 1); break;
        }

        return transactions.filter(tx => new Date(tx.createdAt) >= cutoff && tx.status === 'COMPLETED');
    }, [transactions, period]);

    // Aggregate Data for CashFlow Chart (Bar Chart: Income vs Expense per Month/Week)
    const cashFlowData = useMemo(() => {
        // Group by Month (YYYY-MM)
        const groups: Record<string, { name: string, income: number, expense: number, sortKey: string }> = {};

        filteredTransactions.forEach(tx => {
            const date = new Date(tx.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

            if (!groups[key]) {
                groups[key] = { name: label, income: 0, expense: 0, sortKey: key };
            }

            const amount = Math.abs(parseFloat(String(tx.amount)));
            const isIncome = parseFloat(String(tx.amount)) > 0 || tx.provider?.toUpperCase() === 'DEPOSIT' || tx.type === 'DEPOSIT';

            if (isIncome) {
                groups[key].income += amount;
            } else {
                groups[key].expense += amount;
            }
        });

        return Object.values(groups).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filteredTransactions]);

    // Aggregate Data for Expense Breakdown (Pie Chart by Provider/Type)
    const expenseBreakdownData = useMemo(() => {
        const groups: Record<string, number> = {};

        filteredTransactions.forEach(tx => {
            const amount = parseFloat(String(tx.amount));
            const isExpense = amount < 0 || tx.provider?.toUpperCase() === 'WITHDRAWAL' || tx.type === 'WITHDRAWAL' || tx.provider === 'TRANSFER';

            if (isExpense) {
                // Use provider or type for categorization
                const category = tx.provider === 'TRANSFER' ? 'Transfert' :
                    tx.provider === 'WITHDRAWAL' ? 'Retrait' :
                        tx.provider === 'PAYMENT' ? 'Paiement' :
                            tx.description || tx.type || 'Autre';

                const absAmount = Math.abs(amount);
                groups[category] = (groups[category] || 0) + absAmount;
            }
        });

        return Object.entries(groups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    // Type-safe formatter for Recharts Tooltip
    // We explicitly cast the formatter function to any in the JSX to satisfy Recharts strict typing issues
    // or we can just define it properly.
    const formatTooltip = (value: number | string | Array<number | string>) => {
        if (typeof value === 'number') {
            return [`${value.toLocaleString()} ${symbol}`, ''];
        }
        return [value, ''];
    };

    if (loading) {
        return <div className={styles.loading}>Chargement des statistiques...</div>;
    }

    return (
        <div className={styles.container}>
            {/* Period Selector */}
            <div className={styles.periodSelector}>
                {(['1w', '1m', '3m', '6m', '1y'] as const).map(p => (
                    <button
                        key={p}
                        className={`${styles.periodBtn} ${period === p ? styles.active : ''}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Cash Flow Chart */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Flux de Trésorerie</h3>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                            <Tooltip
                                formatter={(value: any) => [`${Number(value).toLocaleString()} ${symbol}`, '']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Revenus" fill={REVENUE_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="expense" name="Dépenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expense Breakdown Chart */}
            <div className={styles.gridRow}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Répartition des Dépenses</h3>
                    <div className={styles.chartContainer}>
                        {expenseBreakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} ${symbol}`, '']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyChart}>Aucune donnée de dépense pour cette période</div>
                        )}
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className={styles.metricsCard}>
                    <h3 className={styles.chartTitle}>Résumé</h3>
                    <div className={styles.metricsList}>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Total Revenus</span>
                            <span className={`${styles.metricValue} ${styles.income}`}>
                                +{cashFlowData.reduce((acc, curr) => acc + curr.income, 0).toLocaleString()} {symbol}
                            </span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Total Dépenses</span>
                            <span className={`${styles.metricValue} ${styles.expense}`}>
                                -{cashFlowData.reduce((acc, curr) => acc + curr.expense, 0).toLocaleString()} {symbol}
                            </span>
                        </div>
                        <div className={styles.metricDivider} />
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Balance Période</span>
                            <span className={styles.metricValue}>
                                {(cashFlowData.reduce((acc, curr) => acc + curr.income, 0) - cashFlowData.reduce((acc, curr) => acc + curr.expense, 0)).toLocaleString()} {symbol}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
