'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getWallet, getWalletTransactions, type Wallet, type WalletTransaction } from '@/lib/api';
import styles from './stats.module.css';

type MonthData = {
    month: string;
    revenue: number;
    expense: number;
};

export default function StatsPage() {
    const router = useRouter();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<MonthData[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const [walletData, txResponse] = await Promise.all([
                getWallet(),
                getWalletTransactions({ page: 1, limit: 100 })
            ]);
            setWallet(walletData);

            const transactions = txResponse.data || [];

            // Calculate monthly data for last 6 months
            const monthsData: Record<string, { revenue: number; expense: number }> = {};
            let totalIncome = 0;
            let totalOutgoing = 0;

            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthsData[key] = { revenue: 0, expense: 0 };
            }

            transactions.forEach((tx: WalletTransaction) => {
                const amount = parseFloat(String(tx.amount)) || 0;
                const provider = (tx.provider || '').toUpperCase();
                const type = ((tx as any).type || '').toUpperCase();  // API returns type field
                const status = (tx.status || '').toUpperCase();

                if (status !== 'COMPLETED') return;

                const date = new Date(tx.createdAt);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                // Income: DEPOSIT, PAYMENT, REFUND types/providers
                const incomeTypes = ['DEPOSIT', 'PAYMENT', 'REFUND'];
                const isIncome = incomeTypes.includes(type) || incomeTypes.includes(provider) || amount > 0;

                // Expense: WITHDRAWAL, TRANSFER types/providers or negative amount
                const expenseTypes = ['WITHDRAWAL', 'TRANSFER'];
                const isExpense = expenseTypes.includes(type) || expenseTypes.includes(provider) || amount < 0;

                if (isIncome && !isExpense) {
                    totalIncome += Math.abs(amount);
                    if (monthsData[key]) monthsData[key].revenue += Math.abs(amount);
                } else if (isExpense) {
                    totalOutgoing += Math.abs(amount);
                    if (monthsData[key]) monthsData[key].expense += Math.abs(amount);
                }
            });

            setTotalRevenue(totalIncome);
            setTotalExpense(totalOutgoing);

            // Convert to chart format
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            const chartFormatted = Object.entries(monthsData).map(([key, data]) => {
                const month = parseInt(key.split('-')[1]) - 1;
                return {
                    month: monthNames[month],
                    revenue: Math.round(data.revenue / 1000),
                    expense: Math.round(data.expense / 1000)
                };
            });

            setChartData(chartFormatted);
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const balance = parseFloat(wallet?.balance || '0');
    const currencySymbol = wallet?.currency?.symbol || 'KMF';
    const formatAmount = (amount: number) => amount.toLocaleString('fr-FR');

    const maxValue = Math.max(...chartData.flatMap(d => [d.revenue, d.expense]), 10);

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className={styles.title}>Statistiques</h1>
                    <button className={styles.refreshBtn} onClick={fetchStats}>🔄</button>
                </div>

                {/* Summary Cards */}
                <div className={styles.cardsRow}>
                    <div className={styles.cardGreen}>
                        <div className={styles.cardIcon}>💰</div>
                        <span className={styles.cardLabel}>Solde disponible</span>
                        <span className={styles.cardValue}>
                            {loading ? '...' : `${formatAmount(balance)} ${currencySymbol}`}
                        </span>
                    </div>
                    <div className={styles.cardYellow}>
                        <div className={styles.cardIcon}>📊</div>
                        <span className={styles.cardLabel}>Total Dépenses</span>
                        <span className={styles.cardValue}>
                            {loading ? '...' : `${formatAmount(totalExpense)} ${currencySymbol}`}
                        </span>
                    </div>
                </div>

                {/* Cash Flow Chart */}
                <div className={styles.chartSection}>
                    <h2 className={styles.sectionTitle}>Flux de trésorerie • 6 mois</h2>

                    {loading ? (
                        <div className={styles.loadingChart}>Chargement...</div>
                    ) : (
                        <>
                            <div className={styles.chart}>
                                <div className={styles.yAxis}>
                                    <span>{Math.round(maxValue * 0.8)}K</span>
                                    <span>{Math.round(maxValue * 0.6)}K</span>
                                    <span>{Math.round(maxValue * 0.4)}K</span>
                                    <span>{Math.round(maxValue * 0.2)}K</span>
                                    <span>0</span>
                                </div>
                                <div className={styles.barsArea}>
                                    {chartData.map((item, i) => (
                                        <div key={i} className={styles.barGroup}>
                                            <div className={styles.bars}>
                                                <div
                                                    className={`${styles.bar} ${styles.revenueBar}`}
                                                    style={{ height: `${(item.revenue / maxValue) * 200}px` }}
                                                    title={`Revenus: ${item.revenue}K`}
                                                />
                                                <div
                                                    className={`${styles.bar} ${styles.expenseBar}`}
                                                    style={{ height: `${(item.expense / maxValue) * 200}px` }}
                                                    title={`Dépenses: ${item.expense}K`}
                                                />
                                            </div>
                                            <span className={styles.monthLabel}>{item.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.legend}>
                                <div className={styles.legendItem}>
                                    <div className={`${styles.dot} ${styles.green}`} />
                                    <span>Revenus</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <div className={`${styles.dot} ${styles.red}`} />
                                    <span>Dépenses</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Summary Stats */}
                <div className={styles.summarySection}>
                    <h2 className={styles.sectionTitle}>Résumé</h2>
                    <div className={styles.summaryRow}>
                        <span>Total Entrées</span>
                        <span className={styles.positive}>+ {formatAmount(totalRevenue)} {currencySymbol}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Total Sorties</span>
                        <span className={styles.negative}>- {formatAmount(totalExpense)} {currencySymbol}</span>
                    </div>
                    <div className={styles.summaryRow} style={{ borderTop: '1px solid #eee', paddingTop: 12 }}>
                        <span style={{ fontWeight: 600 }}>Bilan</span>
                        <span style={{ fontWeight: 700, color: totalRevenue - totalExpense >= 0 ? '#00af66' : '#ef4444' }}>
                            {totalRevenue - totalExpense >= 0 ? '+' : ''} {formatAmount(totalRevenue - totalExpense)} {currencySymbol}
                        </span>
                    </div>
                </div>

                {/* Link to transactions */}
                <Link href="/dashboard/particulier/finance/wallet/transactions" className={styles.viewAllLink}>
                    Voir toutes les transactions →
                </Link>
            </div>
        </DashboardLayout>
    );
}
