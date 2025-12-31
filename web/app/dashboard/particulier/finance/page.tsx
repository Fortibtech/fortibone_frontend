'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { getWallet, getWalletTransactions, type Wallet, type WalletTransaction } from '@/lib/api';
import styles from './finance.module.css';

export default function FinancePage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [walletData, txData] = await Promise.all([
                    getWallet(),
                    getWalletTransactions({ page: 1, limit: 100 }) // Get more for stats
                ]);
                setWallet(walletData);
                const allTransactions = txData.data || [];
                setTransactions(allTransactions.slice(0, 5)); // Show only 5 recent

                // Calculate monthly stats
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const revenue = allTransactions
                    .filter(tx => {
                        const txDate = new Date(tx.createdAt);
                        const amount = parseFloat(String(tx.amount));
                        return txDate >= firstDayOfMonth &&
                            (amount > 0 || tx.provider?.toUpperCase() === 'DEPOSIT');
                    })
                    .reduce((sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))), 0);

                const expenses = allTransactions
                    .filter(tx => {
                        const txDate = new Date(tx.createdAt);
                        const amount = parseFloat(String(tx.amount));
                        return txDate >= firstDayOfMonth &&
                            amount < 0 &&
                            tx.provider?.toUpperCase() !== 'DEPOSIT';
                    })
                    .reduce((sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))), 0);

                setMonthlyRevenue(revenue);
                setMonthlyExpenses(expenses);
            } catch (error) {
                console.error('Erreur chargement wallet:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const balance = parseFloat(wallet?.balance || '0');
    const currencySymbol = wallet?.currency?.symbol || 'XAF';

    const formatAmount = (amount: number) => amount.toLocaleString('fr-FR');

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Finances</h1>
                </div>

                {/* Balance Card */}
                <div className={styles.balanceCard}>
                    <div className={styles.balanceInfo}>
                        <span className={styles.balanceLabel}>Solde disponible</span>
                        {loading ? (
                            <div className={styles.skeleton} style={{ width: 180, height: 40 }} />
                        ) : (
                            <span className={styles.balanceAmount}>
                                {formatAmount(balance)} {currencySymbol}
                            </span>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Link href="/dashboard/particulier/finance/wallet/deposit" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                            </svg>
                            <span>Dépôt</span>
                        </Link>
                        <Link href="/dashboard/particulier/finance/wallet/withdraw" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                            </svg>
                            <span>Retrait</span>
                        </Link>
                        <Link href="/dashboard/particulier/finance/wallet/transfer" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                            <span>Transfert</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="2">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                        </svg>
                        <div>
                            <span className={styles.statLabel}>Revenus du mois</span>
                            <span className={styles.statValue}>
                                {loading ? '...' : `${formatAmount(monthlyRevenue)} ${currencySymbol}`}
                            </span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                        </svg>
                        <div>
                            <span className={styles.statLabel}>Dépenses du mois</span>
                            <span className={styles.statValue}>
                                {loading ? '...' : `${formatAmount(monthlyExpenses)} ${currencySymbol}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Transactions récentes</h2>
                        <Link href="/dashboard/particulier/finance/transactions" className={styles.seeAll}>
                            Voir tout
                        </Link>
                    </div>

                    {loading ? (
                        <div className={styles.txList}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={styles.txItem}>
                                    <div className={styles.skeleton} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className={styles.skeleton} style={{ width: '60%', height: 14, marginBottom: 6 }} />
                                        <div className={styles.skeleton} style={{ width: '40%', height: 12 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <p>Aucune transaction récente</p>
                        </div>
                    ) : (
                        <div className={styles.txList}>
                            {transactions.map((tx) => {
                                const isIncome = parseFloat(String(tx.amount)) > 0 || tx.provider?.toUpperCase() === 'DEPOSIT';
                                return (
                                    <div key={tx.id} className={styles.txItem}>
                                        <div className={`${styles.txIcon} ${isIncome ? styles.income : styles.expense}`}>
                                            {isIncome ? '↑' : '↓'}
                                        </div>
                                        <div className={styles.txInfo}>
                                            <span className={styles.txTitle}>
                                                {tx.provider === 'DEPOSIT' ? 'Dépôt' :
                                                    tx.provider === 'WITHDRAWAL' ? 'Retrait' :
                                                        tx.provider === 'TRANSFER' ? 'Transfert' : tx.provider}
                                            </span>
                                            <span className={styles.txDate}>
                                                {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <span className={`${styles.txAmount} ${isIncome ? styles.positive : styles.negative}`}>
                                            {isIncome ? '+' : '-'} {formatAmount(Math.abs(parseFloat(String(tx.amount))))} {currencySymbol}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
